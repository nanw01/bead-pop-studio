const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

// Exercise the app's real upload handler. The decoder deliberately rejects
// blob: sources, matching the production site's img-src policy.
function app() {
  const elements = {};
  let transparent=false;
  const sources = [];
  const context = {
    createLinearGradient: () => ({ addColorStop() {} }),
    fillRect() {}, beginPath() {}, arc() {}, fill() {}, stroke() {},
    drawImage() {}, strokeRect() {}, fillText() {},
    getImageData(x, y, w, h) {
      const data = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 120; data[i + 1] = 70; data[i + 2] = 180; data[i + 3] = transparent ? 0 : 255;
      }
      return { data };
    }
  };
  function element(id) {
    return elements[id] ??= {
      value: ({ width: '52', colors: '12', size: '2.6' })[id] || '', style: {},
      classList: { toggle() {}, add() {}, remove() {} },
      getContext: () => context, addEventListener() {}, setAttribute() {},
      append() {}, replaceChildren() {}
    };
  }
  class Reader {
    readAsDataURL(file) {
      (file.delay ? cb=>setTimeout(cb,file.delay) : queueMicrotask)(() => {
        if (file.failRead) return this.onerror();
        this.result = 'data:image/png;base64,' + (file.corrupt ? 'bad' : 'good');
        this.onload();
      });
    }
  }
  class Image {
    naturalWidth = 80;
    naturalHeight = 60;
    set src(value) {
      sources.push(value);
      queueMicrotask(() => value.startsWith('data:') && !value.endsWith('bad')
        ? this.onload() : this.onerror());
    }
  }
  const sandbox = {
    document: { getElementById: element, createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, append() {}, getContext: () => context }) },
    FileReader: Reader, Image, console, Blob, setTimeout,
    URL: { createObjectURL() { throw new Error('blob: is prohibited for image loading'); } }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/mard-221.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8'), sandbox);
  return { sandbox, element, sources, setTransparent: value=>{transparent=value}, load: file => sandbox.loadFile(file) };
}
const png = { name: 'photo.png', type: 'image/png', size: 300 };
test('PNG loads through data: with correct dimensions and bead count', async () => {
  const a = app(); await a.load(png);
  assert.equal(a.element('name').textContent, 'photo.png');
  assert.equal(a.element('dimensions').textContent, '52 × 52');
  assert.equal(a.element('total').textContent, '2,704');
  assert.match(a.sources[0], /^data:/);
  assert.equal(a.element('file').value, '');
});
test('missing MIME type uses supported extension', async () => {
  const a = app(); await a.load({ ...png, name: 'PHOTO.JPG', type: '' });
  assert.equal(a.element('name').textContent, 'PHOTO.JPG');
});
test('HEIC produces a conversion message', async () => {
  const a = app(); await a.load({ ...png, name: 'photo.heic', type: 'image/heic' });
  assert.match(a.element('message').textContent, /HEIC/); assert.equal(a.sources.length, 0);
});
test('oversize and invalid file types are rejected', async () => {
  const a = app(); await a.load({ ...png, size: 21 * 1024 * 1024 });
  assert.match(a.element('message').textContent, /20 MB/);
  await a.load({ ...png, type: 'text/plain' });
  assert.match(a.element('message').textContent, /仅支持/); assert.equal(a.sources.length, 0);
});
test('read and decode failures preserve the previous result and allow retry', async () => {
  const a = app(); await a.load(png);
  for (const failure of [{ failRead: true }, { corrupt: true }]) {
    await a.load({ ...png, name: 'broken.png', ...failure });
    assert.match(a.element('message').textContent, /无法读取/);
    assert.equal(a.element('name').textContent, 'photo.png');
    assert.equal(a.element('file').value, '');
  }
  await a.load({ ...png, name: 'retry.png' });
  assert.equal(a.element('name').textContent, 'retry.png');
});

test("all supported boards keep square dimensions and valid MARD codes",()=>{const a=app();for(const n of [52,78,104]){a.element("width").value=String(n);a.sandbox.generate();assert.equal(a.element("dimensions").textContent,`${n} × ${n}`);const codes=vm.runInContext("result.palette.map(p=>p.code)",a.sandbox);assert.ok(codes.every(c=>a.sandbox.MARD221.some(p=>p.code===c)));}assert.equal(a.element("physical").textContent,"27.0 × 27.0 cm");});

test('transparent input preserves source/result and later board adjustment',async()=>{
 const a=app();await a.load(png);const oldSource=vm.runInContext('source',a.sandbox);const oldResult=vm.runInContext('result',a.sandbox);
 a.setTransparent(true);await a.load({...png,name:'empty.png'});
 assert.match(a.element('message').textContent,/完全透明/);
 assert.equal(vm.runInContext('source',a.sandbox),oldSource);assert.equal(vm.runInContext('result',a.sandbox),oldResult);
 a.setTransparent(false);a.element('width').value='78';a.sandbox.generate();assert.equal(a.element('dimensions').textContent,'78 × 78');assert.equal(a.element('name').textContent,'photo.png');
});
test('late image read cannot replace a newer upload',async()=>{
 const a=app();const older=a.load({...png,name:'older.png',delay:30});await a.load({...png,name:'newer.png'});await older;assert.equal(a.element('name').textContent,'newer.png');
});
