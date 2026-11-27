const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
// The published fallback label, read from the page so the tests check the real value.
const fallback = html.match(/<span data-tmc-desktop-version>([^<]+)<\/span>/)[1];
const stable = {
  tag_name: 'v1.2.0', draft: false, prerelease: false,
  assets: [{ name: 'TMC-desktop-Setup.exe', state: 'uploaded' }],
};

async function render(payload = stable, status = 200, storageDenied = false) {
  const android = [{ textContent: '5.6.1' }];
  const desktop = [{ textContent: fallback }];
  const calls = [];
  const cache = new Map();
  vm.runInNewContext(script, {
    document: { querySelectorAll: (selector) => selector === '[data-tmc-version]' ? android : desktop },
    sessionStorage: {
      getItem: (key) => { if (storageDenied) throw new Error('denied'); return cache.get(key); },
      setItem: (key, value) => { if (storageDenied) throw new Error('denied'); cache.set(key, value); },
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (url.includes('/TwitchMiniChatDesktop/')) {
        if (payload instanceof Error) throw payload;
        return { ok: status === 200, status, json: async () => payload };
      }
      return { ok: true, json: async () => ({ tag_name: 'v5.7.0' }) };
    },
  });
  await new Promise(setImmediate);
  return { android: android[0].textContent, desktop: desktop[0].textContent, calls };
}

test('platform labels update independently and desktop metadata uses no credentials', async () => {
  const result = await render();
  assert.equal(result.android, '5.7.0');
  assert.equal(result.desktop, '1.2.0');
  assert.equal(result.calls.length, 2);
  assert.equal(result.calls.find((call) => call.url.includes('/TwitchMiniChatDesktop/')).options.credentials, 'omit');
});

test('invalid/non-stable/incomplete metadata keeps the published fallback', async () => {
  for (const payload of [
    { ...stable, draft: true }, { ...stable, prerelease: true },
    { ...stable, tag_name: 'v1.3.0-rc.1' }, { ...stable, tag_name: '<img onerror=alert(1)>' },
    { ...stable, assets: [] }, { ...stable, assets: [{ name: 'TMC-desktop-Setup.exe', state: 'new' }] },
    { ...stable, assets: null }, null,
  ]) {
    const result = await render(payload);
    assert.equal(result.desktop, fallback);
    assert.equal(result.android, '5.7.0');
  }
});

test('offline/rate-limited desktop request and denied storage do not break download fallbacks', async () => {
  assert.equal((await render(new Error('offline'))).desktop, fallback);
  assert.equal((await render(stable, 403)).desktop, fallback);
  const result = await render(stable, 200, true);
  assert.equal(result.desktop, '1.2.0');
  assert.equal(result.android, '5.7.0');
});

test('no-JavaScript HTML includes latest stable installer, notes, checksums and unsigned disclosure', () => {
  const desktop = html.match(/<article class="download-card desktop-card">([\s\S]*?)<\/article>/)[1];
  for (const route of ['releases/latest/download/TMC-desktop-Setup.exe', 'releases/latest/download/SHA256SUMS.txt', 'releases/latest']) {
    assert.ok(desktop.includes(`href="https://github.com/unouidol/TwitchMiniChatDesktop/${route}"`));
  }
  assert.match(desktop, /aria-describedby="desktop-signing-notice"/);
  assert.match(desktop, /id="desktop-signing-notice"/);
  assert.match(desktop, /Unsigned Windows package/);
  assert.match(desktop, /checksums do not replace a signature/);
  assert.doesNotMatch(desktop, /Coming soon|still a work in progress/);
  assert.ok(html.includes('/TwitchMiniChat/releases/latest/download/TwitchMiniChat-Android-arm64-v8a.apk'));
});
