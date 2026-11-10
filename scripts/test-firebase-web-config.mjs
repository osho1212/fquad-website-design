/**
 * Tests for lib/firebase-web-config.ts (finding the public web API key through
 * the service account). No network: fetch is replaced by a stub.
 *
 *   node --experimental-strip-types scripts/test-firebase-web-config.mjs
 */
import { fetchWebConfig } from '../lib/firebase-web-config.ts';

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`PASS  ${name}`); } else { fail++; console.log(`FAIL  ${name} ${detail}`); }
};

/** A stub fetch answering from a table of url-suffix -> {status, body | throws}. */
const stub = (routes) => {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, auth: init?.headers?.Authorization });
    const hit = routes.find((r) => url.endsWith(r.suffix));
    if (!hit) return { ok: false, status: 404, json: async () => ({}) };
    if (hit.throws) throw new Error(hit.throws);
    return { ok: hit.status === undefined || hit.status < 400, status: hit.status ?? 200, json: async () => { if (hit.badJson) throw new Error('bad json'); return hit.body; } };
  };
  fn.calls = calls;
  return fn;
};
const run = (routes, over = {}) => {
  const fetchImpl = stub(routes);
  return fetchWebConfig({ accessToken: 'tok-123', projectId: 'fquad-prod', fetchImpl, ...over }).then((r) => ({ r, fetchImpl }));
};

const apps = (...ids) => ({ suffix: '/webApps', body: { apps: ids.map((appId) => ({ appId })) } });
const cfg = (id, body) => ({ suffix: `/webApps/${encodeURIComponent(id)}/config`, body });

{
  const { r, fetchImpl } = await run([apps('1:1:web:a'), cfg('1:1:web:a', { apiKey: 'AIzaKEY', authDomain: 'fquad-prod.firebaseapp.com', projectId: 'fquad-prod' })]);
  ok('finds the key and the settings that came with it', r?.apiKey === 'AIzaKEY' && r?.authDomain === 'fquad-prod.firebaseapp.com' && r?.projectId === 'fquad-prod');
  ok('asks the Firebase management API for this project', fetchImpl.calls[0].url === 'https://firebase.googleapis.com/v1beta1/projects/fquad-prod/webApps');
  ok('sends the service account token as a bearer token', fetchImpl.calls.every((c) => c.auth === 'Bearer tok-123'));
}
{
  const { r } = await run([apps('a', 'b'), cfg('a', { projectId: 'p' }), cfg('b', { apiKey: 'SECOND' })]);
  ok('skips an app whose config has no key and uses the next', r?.apiKey === 'SECOND');
}
{
  const { r } = await run([{ suffix: '/webApps', body: { apps: [] } }]);
  ok('no web app registered gives null', r === null);
}
{
  const { r } = await run([{ suffix: '/webApps', body: {} }]);
  ok('an answer with no app list gives null', r === null);
}
{
  const { r } = await run([{ suffix: '/webApps', status: 403, body: { error: 'denied' } }]);
  ok('a permission error gives null, not a crash', r === null);
}
{
  const { r } = await run([apps('a'), { suffix: '/webApps/a/config', status: 500, body: {} }]);
  ok('a failing config call gives null', r === null);
}
{
  const { r } = await run([{ suffix: '/webApps', throws: 'network down' }]);
  ok('a network failure gives null', r === null);
}
{
  const { r } = await run([{ suffix: '/webApps', badJson: true }]);
  ok('an unreadable answer gives null', r === null);
}
{
  const { r } = await run([apps('a'), cfg('a', { apiKey: '' })]);
  ok('an empty key is not accepted', r === null);
}
{
  const { fetchImpl } = await run([apps('1:1:web:a/b'), cfg('1:1:web:a/b', { apiKey: 'K' })], { projectId: 'weird id/../x' });
  ok('the project id and app id are escaped in the address', fetchImpl.calls[0].url.includes('projects/weird%20id%2F..%2Fx/') && fetchImpl.calls[1].url.includes('webApps/1%3A1%3Aweb%3Aa%2Fb/config'));
}

console.log(`\npassed ${pass}, failed ${fail}`);
process.exit(fail ? 1 : 0);
