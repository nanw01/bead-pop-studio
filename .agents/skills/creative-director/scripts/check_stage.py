#!/usr/bin/env python3
"""Validate artifact/evidence handoffs, not their truth or visual quality.

STATE.yaml uses the JSON subset of YAML to avoid optional dependencies.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ORDER = ['direction', 'experience', 'delivery']
ARTIFACTS = {'direction': ['brief', 'principles'], 'experience': ['experience'], 'delivery': []}
STATUSES = {'pass', 'fail', 'unknown', 'not_applicable'}


def validate(root, target):
    root = root.resolve()
    errors = []
    warnings = []

    def path_for(value):
        if not isinstance(value, str) or not value:
            raise ValueError('missing path')
        p = (root / value).resolve()
        if not p.is_relative_to(root):
            raise ValueError('path outside project')
        if not p.is_file() or not p.stat().st_size:
            raise ValueError('missing/empty evidence or artifact: ' + value)
        return p

    try:
        state = json.loads((root / 'creative/STATE.yaml').read_text())
        if state.get('schema_version') != 1 or not isinstance(state.get('revision'), str) or not state['revision']:
            raise ValueError('invalid schema_version/revision')
        for stage in ORDER[:ORDER.index(target) + 1]:
            item = state['stages'][stage]
            if item['status'] != 'pass':
                errors.append(stage + ': stage is not pass')
            for key in ARTIFACTS[stage]:
                artifact = state['artifacts'][key]
                content = path_for(artifact['path']).read_text()
                match = re.search(r'^Revision:\s*(\S+)', content, re.M)
                if not match or match[1] != artifact['revision']:
                    errors.append(key + ': artifact revision mismatch')
            checks = item['checks']
            if not isinstance(checks, list) or not checks:
                errors.append(stage + ': no checks')
                continue
            if not any(c.get('required') is True for c in checks):
                errors.append(stage + ': no required checks')
            ids = set()
            for check in checks:
                cid = check['id']
                if not isinstance(cid, str) or not cid or cid in ids:
                    raise ValueError('empty/duplicate check id in ' + stage)
                ids.add(cid)
                status = check['status']
                if status not in STATUSES or type(check['required']) is not bool:
                    raise ValueError('invalid check status/required')
                if check.get('revision') != state['revision']:
                    errors.append(cid + ': stale check revision')
                for field in ['evidence_method', 'coverage', 'environment']:
                    if not isinstance(check.get(field), str) or not check[field].strip():
                        errors.append(cid + ': missing ' + field)
                if not isinstance(check.get('unknowns'), list):
                    errors.append(cid + ': missing unknowns list')
                if status == 'not_applicable':
                    if not check.get('rationale'):
                        errors.append(cid + ': not_applicable needs rationale')
                elif status == 'pass':
                    evidence = check.get('evidence', [])
                    if not isinstance(evidence, list) or not evidence:
                        errors.append(cid + ': pass needs evidence files')
                    else:
                        for value in evidence:
                            path_for(value)
                if status in ['fail', 'unknown']:
                    (errors if check['required'] else warnings).append(cid + ': ' + status)
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
        errors.append('invalid state: ' + str(exc))
    return {'stage': target, 'status': 'fail' if errors else 'pass',
            'errors': errors, 'advisories': warnings,
            'limitation': 'Checks structure and evidence existence; does not verify claims or aesthetics.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', type=Path)
    parser.add_argument('--stage', choices=ORDER, required=True)
    args = parser.parse_args()
    result = validate(args.project, args.stage)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result['status'] == 'pass' else 1)
