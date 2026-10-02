const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const accounts = [
  {
    role: 'admin',
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD,
    endpoints: ['/api/auth/me', '/api/admin/dashboard-stats', '/api/admin/users']
  },
  {
    role: 'faculty',
    email: process.env.TEST_FACULTY_EMAIL,
    password: process.env.TEST_FACULTY_PASSWORD,
    endpoints: ['/api/auth/me', '/api/events']
  },
  {
    role: 'student',
    email: process.env.TEST_STUDENT_EMAIL,
    password: process.env.TEST_STUDENT_PASSWORD,
    endpoints: ['/api/auth/me', '/api/events', '/api/registrations/my', '/api/certificates/my']
  }
];

test('configured account roles can sign in and read their role-specific data', async (t) => {
  for (const account of accounts) {
    await t.test(account.role, async (subtest) => {
      if (!account.email || !account.password) {
        subtest.skip('Set TEST_*_EMAIL and TEST_*_PASSWORD to verify this role.');
        return;
      }
      const login = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: account.email, password: account.password })
      });
      assert.equal(login.status, 200);
      const loginBody = await login.json();
      assert.equal(loginBody.success, true);
      assert.equal('token' in loginBody, false, 'the bearer token must not be exposed in JSON');
      const cookie = login.headers.get('set-cookie')?.split(';', 1)[0];
      assert.ok(cookie, 'login should set the HttpOnly session cookie');
      assert.match(login.headers.get('set-cookie'), /HttpOnly/i);
      assert.match(login.headers.get('set-cookie'), /SameSite=Lax/i);

      for (const endpoint of account.endpoints) {
        const response = await fetch(`${baseUrl}${endpoint}`, { headers: { cookie } });
        assert.equal(response.status, 200, `${account.role} should access ${endpoint}`);
      }
      if (account.role !== 'admin') {
        const forbidden = await fetch(`${baseUrl}/api/admin/users`, { headers: { cookie } });
        assert.equal(forbidden.status, 403, `${account.role} must not access administrator data`);
      }
    });
  }
});
