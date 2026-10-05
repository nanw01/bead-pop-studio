---
name: creative-director
description: "Define product-led creative direction, page narrative and motion intent for new or redesigned websites; produce briefs and coordinate evidence-based visual iteration. Use for art direction and distinctive web experiences, not routine styling fixes."
---

# Creative Director

Turn product intent into a coherent web experience before choosing effects. Own WHAT and WHY; technical direction owns HOW and measured budgets. Six duties can run within one agent across three stages, with artifact handoffs rather than six permanent agents.

## Route the request

Read the actual project instructions, existing creative documents, package manifest and lockfile. Preserve explicit brand decisions and the current stack. For a local fix, apply existing principles without inventing three new directions. For a new direction, use the seven steps below. For a supplied direction, evaluate gaps and continue; do not reopen settled choices without evidence.

If an important input is missing, ask concisely while progressing on independent work. Mark assumptions. Recommend a direction yourself when the user has authorized design work; do not require approval at every stage. Publishing and other external actions retain their own authorization boundaries.

## Stage A · Direction and reference

1. Interpret the product: primary task, value, content priority, session length, tool versus showcase surfaces.
2. Define audience and intended emotions, including tensions such as playful yet precise.
3. For genuinely open art direction, propose three different Creative Territories: distinct metaphor, composition, materials and interaction, with cost and product fit.
4. Select one with reasons and tradeoffs. Preserve alternatives as rejected options, not a menu awaiting approval.
5. Define Creative DNA as observable rules for type, color, space, form, material and imagery. Define Anti-Aesthetic as project-specific failure patterns; do not universally ban fonts, gradients or spring motion.
6. Plan Page Narrative, Motion Language, 3D Strategy and a small set of Signature Moments. Give each motion a purpose and non-motion equivalent. Zero 3D is valid. Limit experimental moments to what the task needs.
7. Produce `creative/CREATIVE_BRIEF.md` and `DESIGN_PRINCIPLES.md`, adapting the [templates](assets/templates). Separate facts, observations, inferences and decisions.

Read [role protocols](references/protocols.md) when doing reference research or handing off tasks. References should contribute mechanisms, not cloned identity. Evidence records contain `evidence_method`, `coverage`, `unknowns`. No animation detected means this method did not detect it; it does not mean no animation exists.

## Stage B · Experience, motion and feasibility

Produce `creative/EXPERIENCE_MAP.md`: scenes, user actions, state changes, CTA, keyboard/touch behavior and fallback. Experience decides what the user understands; Motion defines timing, dependencies and reversible states; Technical chooses the simplest suitable implementation, owns budgets and specifies measurement.

Put short motion and technical plans inside the map. Create separate MOTION_PLAN.md / TECHNICAL_PLAN.md only when complexity warrants them. Do not duplicate budgets across documents. Inspect current APIs/types before adopting a recipe; a skill fixture is not a reason to upgrade dependencies.

Same object/property has one animation owner. Do not require all app loops to share one RAF. Specify initial, forward, reverse, resize, loading, reduced-motion and teardown behavior where relevant. A numeric budget must include environment, method and rationale; never invent measured performance.

## Stage C · Build and critique

Implement only within the user's scope, then review the actual running result against the brief. Use available browser tools for screenshots, actions and motion evidence; unavailable capabilities stay `unknown`. Review desktop and a relevant small viewport, core task, resource errors, keyboard/touch, reduced motion and lifecycle behavior.

Keep engineering gates separate from visual critique. Engineering results are pass/fail/unknown/not_applicable. Visual judgments give observation, impact and specific change; motion quality cannot be verified from a single still. Style detectors are advisory unless the project has deliberately made a rule binding. Record justified exceptions with scope and evidence; mark a waiver rather than pretending a failed finding passed.

Fix demonstrated problems and retest their affected behavior. Repeated nonconvergence triggers diagnosis (better evidence, simpler mechanism, revised direction), not mandatory rounds or automatic human approval. Read [review protocol](references/review.md) for scoring and stopping conditions.

## State and handoff checks

When using stage gates, maintain only `creative/STATE.yaml`. Use the JSON-compatible YAML template so the bundled checker works with Python's standard library. Run:

```sh
python3 <skill-directory>/scripts/check_stage.py <project-directory> --stage direction
python3 <skill-directory>/scripts/check_stage.py <project-directory> --stage experience
python3 <skill-directory>/scripts/check_stage.py <project-directory> --stage delivery
```

The checker checks stage status, versioned artifacts and evidence records. It does not prove taste, accuracy or real test execution. Read its output and the actual artifacts before handoff. State is not an executor. `unknown` on a required check blocks claiming completion, while independent work may continue. For small fixes that do not need this workflow, do not create empty documents just to satisfy a gate.
