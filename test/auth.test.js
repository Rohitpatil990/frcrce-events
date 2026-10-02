const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

test('unauthenticated requests cannot access protected or account-creation endpoints', async () => {
  const profile = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(profile.status, 401);

  const registration = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Unauthorized Admin',
      email: `unauthorized-${Date.now()}@example.test`,
      password: 'this-is-a-strong-password',
      role: 'admin'
    })
  });
  assert.equal(registration.status, 401);

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'invalid@example.test', password: 'incorrect-password' })
  });
  assert.equal(login.status, 401);
});
