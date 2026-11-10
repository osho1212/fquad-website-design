/**
 * Tests for lib/google-token.ts, the check on the Google sign-in token. Needs
 * no Firebase, emulator or network: it signs its own tokens.
 *
 *   node --experimental-strip-types scripts/test-google-token.mjs
 */
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { verifyFirebaseIdToken, IdTokenError } from '../lib/google-token.ts';

const PROJECT = 'fquad-prod';
const ISS = `https://securetoken.google.com/${PROJECT}`;
const NOW = new Date('2026-11-11T12:00:00Z');
const now = Math.floor(NOW.getTime() / 1000);

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`PASS  ${name}`); } else { fail++; console.log(`FAIL  ${name} ${detail}`); }
};
const rejects = async (name, fn) => {
  try { await fn(); ok(name, false, '(accepted)'); } catch (e) { ok(name, e instanceof IdTokenError, `(${e?.constructor?.name}: ${e?.message})`); }
};

const { privateKey, publicKey } = await generateKeyPair('RS256');
const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
const keys = createLocalJWKSet({ keys: [jwk] });
const other = await generateKeyPair('RS256');

const claims = (over = {}) => ({
  email: 'admin@potentiaa.com',
  email_verified: true,
  name: 'Studio Admin',
  auth_time: now - 30,
  firebase: { sign_in_provider: 'google.com', identities: {} },
  ...over,
});
const sign = (payload, { key = privateKey, iss = ISS, aud = PROJECT, sub = 'uid-123', exp = now + 3600, kid = 'k1' } = {}) => {
  let jwt = new SignJWT(payload).setProtectedHeader({ alg: 'RS256', kid }).setIssuedAt(now - 60).setExpirationTime(exp);
  if (iss) jwt = jwt.setIssuer(iss);
  if (aud) jwt = jwt.setAudience(aud);
  if (sub) jwt = jwt.setSubject(sub);
  return jwt.sign(key);
};
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const unsigned = (payload) => `${b64({ alg: 'none', typ: 'JWT' })}.${b64(payload)}.`;
const verify = (t, extra = {}) => verifyFirebaseIdToken(t, { projectId: PROJECT, keys, now: NOW, ...extra });

console.log('--- signed tokens (production path)');
const id = await verify(await sign(claims()));
ok('a good token is accepted', id.email === 'admin@potentiaa.com' && id.uid === 'uid-123');
ok('...reports a verified Google sign-in', id.emailVerified === true && id.provider === 'google.com');
ok('...reports the name and the sign-in time', id.name === 'Studio Admin' && id.authTime === now - 30);
ok('an unverified email is reported as unverified', (await verify(await sign(claims({ email_verified: false })))).emailVerified === false);
ok('a password sign-in is reported as such', (await verify(await sign(claims({ firebase: { sign_in_provider: 'password' } })))).provider === 'password');
await rejects('a token for another project is refused', async () => verify(await sign(claims(), { aud: 'someone-elses-project', iss: 'https://securetoken.google.com/someone-elses-project' })));
await rejects('the wrong audience is refused', async () => verify(await sign(claims(), { aud: 'other' })));
await rejects('the wrong issuer is refused', async () => verify(await sign(claims(), { iss: 'https://accounts.google.com' })));
await rejects('an expired token is refused', async () => verify(await sign(claims(), { exp: now - 10 })));
await rejects('a token signed with another key is refused', async () => verify(await sign(claims(), { key: other.privateKey })));
await rejects('an unknown key id is refused', async () => verify(await sign(claims(), { kid: 'nope' })));
await rejects('an unsigned token is refused outside the emulator', async () => verify(unsigned({ ...claims(), iss: ISS, aud: PROJECT, sub: 'u', exp: now + 3600 })));
await rejects('a token signed with HS256 is refused (algorithm confusion)', async () => {
  const hs = await new SignJWT(claims()).setProtectedHeader({ alg: 'HS256', kid: 'k1' }).setIssuer(ISS).setAudience(PROJECT).setSubject('u').setExpirationTime(now + 3600).sign(new TextEncoder().encode('x'.repeat(32)));
  return verify(hs);
});
await rejects('a token without a subject is refused', async () => verify(await sign(claims(), { sub: '' })));
await rejects('a token without a sign-in time is refused', async () => verify(await sign(claims({ auth_time: undefined }))));
await rejects('a sign-in time in the future is refused', async () => verify(await sign(claims({ auth_time: now + 3600 }))));
await rejects('garbage is refused', async () => verify('x'.repeat(200)));
await rejects('an empty string is refused', async () => verify(''));

console.log('--- unsigned tokens (Auth emulator only)');
const emu = (over = {}) => unsigned({ ...claims(), iss: ISS, aud: PROJECT, sub: 'emu-1', exp: now + 3600, ...over });
const e = await verify(emu(), { emulator: true, keys: undefined });
ok('the emulator path accepts a well-formed unsigned token', e.email === 'admin@potentiaa.com' && e.provider === 'google.com');
await rejects('...but not for another project', async () => verify(emu({ aud: 'other', iss: 'https://securetoken.google.com/other' }), { emulator: true }));
await rejects('...nor the wrong issuer', async () => verify(emu({ iss: 'https://accounts.google.com' }), { emulator: true }));
await rejects('...nor an expired one', async () => verify(emu({ exp: now - 1 }), { emulator: true }));
await rejects('...nor one with no expiry', async () => verify(emu({ exp: undefined }), { emulator: true }));
await rejects('...nor garbage', async () => verify('not.a.token', { emulator: true }));

console.log(`\npassed ${pass}, failed ${fail}`);
process.exit(fail ? 1 : 0);
