const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

function start(state) {
  return new Promise((resolve) => {
    const server = createApp(state).listen(0, () => resolve(server));
  });
}

test('liveness, readiness, info, items, metrics', async () => {
  const state = { ready: true };
  const server = await start(state);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.strictEqual((await fetch(`${base}/api/health/live`)).status, 200);
    assert.strictEqual((await fetch(`${base}/api/health/ready`)).status, 200);

    const info = await (await fetch(`${base}/api/info`)).json();
    assert.strictEqual(info.app, 'lab-api');

    const created = await fetch(`${base}/api/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'test' }),
    });
    assert.strictEqual(created.status, 201);
    assert.strictEqual((await fetch(`${base}/api/items`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).status, 400);

    assert.strictEqual((await fetch(`${base}/no/such/path`)).status, 404);

    const metrics = await (await fetch(`${base}/metrics`)).text();
    assert.match(metrics, /http_requests_total/);
    assert.match(metrics, /route="unmatched"/);
    assert.doesNotMatch(metrics, /no\/such\/path/);

    state.ready = false;
    assert.strictEqual((await fetch(`${base}/api/health/ready`)).status, 503);
  } finally {
    server.close();
  }
});
