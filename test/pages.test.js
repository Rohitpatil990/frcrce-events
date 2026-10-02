const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const pages = [
  'login.html',
  'admin-dashboard.html',
  'admin-events.html',
  'admin-users.html',
  'faculty-dashboard.html',
  'create-event.html',
  'student-dashboard.html',
  'event-details.html',
  'attendance.html',
  'my-registrations.html',
  'my-certificates.html'
];

test('health check and all linked pages are available', async () => {
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).success, true);

  for (const page of pages) {
    const response = await fetch(`${baseUrl}/pages/${page}`);
    assert.equal(response.status, 200, `${page} should be served`);
  }

  const logo = await fetch(`${baseUrl}/assets/college-logo.jpg`);
  assert.equal(logo.status, 200);
  assert.match(logo.headers.get('content-type'), /image\/jpeg/);
});
