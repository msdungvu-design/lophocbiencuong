const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');

const root = resolve(__dirname, '..');
const source = readFileSync(resolve(root, 'join.js'), 'utf8');

// Small DOM boundary fake; requests use the real FormData and AbortController.
// Native browser validation and layout are checked separately in browser QA.
function setup(fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) })) {
  const element = value => ({ value, disabled: false, focus() { this.focused = true; } });
  const elements = [' Nguyễn An ', '+84 900 000 000', 'tester@example.invalid', 'Cao Bằng', '']
    .map(element);
  ['fullName', 'phone', 'email', 'location', '_gotcha'].forEach((name, i) => { elements[name] = elements[i]; });
  const consent = element('on'); consent.checked = true;
  elements.push(consent); elements.consent = consent;
  elements.format = { value: 'Linh hoạt' };
  const button = { textContent: 'Gửi thông tin · Submit', disabled: true };
  elements.push(button);
  const roles = [element('Giáo viên'), element('Tình nguyện viên')];
  elements.push(...roles);
  const status = { dataset: {}, hidden: true, focus() {} };
  const listeners = {};
  let resets = 0;
  const form = {
    elements, dataset: { formspreeId: 'qaonly123' },
    querySelector: selector => selector.includes('submit') ? button : roles[0],
    querySelectorAll: () => roles,
    reportValidity: () => consent.checked && elements.slice(0, 4).every(x => !!x.value),
    reset() { resets++; },
    setAttribute() {}, removeAttribute() {},
    addEventListener(name, callback) { listeners[name] = callback; }
  };
  const modal = { classList: { contains: () => false }, addEventListener() {} };
  const requests = [];
  let timer;
  const context = {
    window: {}, document: { getElementById: id => ({ joinForm: form, joinModal: modal, joinStatus: status })[id] },
    FormData, AbortController,
    setTimeout(callback) { timer = callback; return 1; }, clearTimeout() {},
    fetch(...args) { requests.push(args); return fetchImpl(...args); }
  };
  runInNewContext(source, context);
  const submit = () => context.window.submitJoin({ preventDefault() {} });
  return { form, elements, roles, button, status, requests, submit, listeners,
    resets: () => resets, expire: () => timer() };
}

test('POST contains every existing field and both selected roles; success clears only after acknowledgement', async () => {
  const x = setup();
  await x.submit();
  assert.equal(x.requests.length, 1);
  const [url, options] = x.requests[0];
  assert.equal(url, 'https://formspree.io/f/qaonly123');
  assert.equal(options.method, 'POST');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.redirect, 'error');
  assert.equal(options.referrerPolicy, 'strict-origin-when-cross-origin');
  assert.equal(options.headers.Accept, 'application/json');
  assert.deepEqual(Object.fromEntries(options.body), {
    fullName: 'Nguyễn An', phone: '+84 900 000 000', email: 'tester@example.invalid', location: 'Cao Bằng',
    role: 'Giáo viên, Tình nguyện viên', format: 'Linh hoạt', consent: 'Có / Yes', _gotcha: '',
    _subject: 'Đăng ký đồng hành cùng Lớp học biên cương'
  });
  assert.equal(x.status.dataset.state, 'success');
  assert.match(x.status.textContent, /registration has been received/);
  assert.equal(x.resets(), 1);
  assert.equal(x.button.disabled, false);
});

test('blank/invalid form, absent role or missing consent never sends', async () => {
  for (const invalidate of [x => { x.elements.fullName.value = '   '; },
    x => { x.form.querySelectorAll = () => []; }, x => { x.elements.consent.checked = false; }]) {
    const x = setup(); invalidate(x); await x.submit();
    assert.equal(x.requests.length, 0);
    assert.equal(x.resets(), 0);
  }
});

test('unconfigured and unsafe destinations cannot transmit personal data', async () => {
  for (const id of ['', 'YOUR_FORM_ID', 'https://untrusted.invalid/f/123', '../other', 'abc?email=private']) {
    const x = setup(); x.form.dataset.formspreeId = id; await x.submit();
    assert.equal(x.requests.length, 0);
    assert.equal(x.status.dataset.state, 'error');
    assert.equal(x.resets(), 0);
  }
});

test('honeypot does not produce a fake confirmation or send', async () => {
  const x = setup(); x.elements._gotcha.value = 'bot'; await x.submit();
  assert.equal(x.requests.length, 0);
  assert.equal(x.status.dataset.state, 'error');
});

test('double clicks create one in-flight request; fields stay disabled until response', async () => {
  let finish;
  const x = setup(() => new Promise(resolve => { finish = resolve; }));
  const first = x.submit();
  assert.equal(x.status.dataset.state, 'pending');
  assert.ok(x.elements.every(element => element.disabled));
  await x.submit();
  assert.equal(x.requests.length, 1);
  finish({ ok: true, status: 200, json: async () => ({ ok: true }) });
  await first;
  assert.ok(x.elements.every(element => !element.disabled));
});

for (const code of [400, 401, 403, 404, 422, 429, 500, 503]) {
  test(`HTTP ${code} retains fields, restores controls and never claims receipt`, async () => {
    const x = setup(async () => ({ ok: false, status: code,
      json: async () => ({ errors: [{ message: '<script>unsafe/private</script>' }] }) }));
    await x.submit();
    assert.equal(x.status.dataset.state, 'error');
    assert.equal(x.resets(), 0);
    assert.equal(x.elements.email.value, 'tester@example.invalid');
    assert.equal(x.button.disabled, false);
    assert.doesNotMatch(x.status.textContent, /unsafe\/private/);
  });
}

test('HTML, empty response, CAPTCHA or unacknowledged JSON are not success', async () => {
  for (const body of [null, {}, { ok: false }, { captcha: true }, { ok: true, errors: ['rejected'] }]) {
    const x = setup(async () => ({ ok: true, status: 200, json: async () => body }));
    await x.submit();
    assert.equal(x.status.dataset.state, 'error'); assert.equal(x.resets(), 0);
  }
  const x = setup(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('HTML'); } }));
  await x.submit(); assert.equal(x.status.dataset.state, 'error'); assert.equal(x.resets(), 0);
});

test('connection error preserves details, warns about uncertain receipt and never auto-retries', async () => {
  const x = setup(async () => { throw new TypeError('Network failed'); });
  await x.submit();
  assert.equal(x.requests.length, 1); assert.equal(x.resets(), 0);
  assert.match(x.status.textContent, /before submitting again/);
  assert.equal(x.button.disabled, false);
});

test('timeout aborts request and restores form for the user', async () => {
  const x = setup((_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('timeout')));
  }));
  const result = x.submit(); x.expire(); await result;
  assert.equal(x.requests.length, 1); assert.equal(x.resets(), 0);
  assert.equal(x.status.dataset.state, 'error'); assert.equal(x.button.disabled, false);
});

test('a manual retry can succeed after a failed attempt', async () => {
  let attempts = 0;
  const x = setup(async () => ({ ok: ++attempts > 1, status: attempts > 1 ? 200 : 500,
    json: async () => ({ ok: attempts > 1 }) }));
  await x.submit(); assert.equal(x.resets(), 0);
  await x.submit(); assert.equal(x.resets(), 1); assert.equal(x.requests.length, 2);
});

test('VI and EN contact email use the official address in live and fallback data', () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  const seed = JSON.parse(html.match(/<script id="seed" type="application\/json">\s*([\s\S]*?)<\/script>/)[1]);
  const content = JSON.parse(readFileSync(resolve(root, 'content.json'), 'utf8'));
  for (const data of [seed, content]) {
    const row = data.contact.find(x => x.k_en === 'Contact email');
    assert.equal(row.v_vi, 'lophocbiencuong@gmail.com');
    assert.equal(row.v_en, 'lophocbiencuong@gmail.com');
  }
  assert.doesNotMatch(html, /ms\.dungvu@gmail\.com/);
  assert.doesNotMatch(source, /window\.location|localStorage|sessionStorage|console\./);
});
