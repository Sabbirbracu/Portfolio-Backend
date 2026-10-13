import test from 'node:test';
import assert from 'node:assert/strict';
import { contactNotificationEmail, passwordResetEmail } from '../src/services/emailTemplates.js';
import { notifyRecipients, sendMail, siteUrl } from '../src/services/mailer.js';

const realFetch = globalThis.fetch;
const reset = () => {
  globalThis.fetch = realFetch;
  for (const k of ['RESEND_API_KEY', 'MAIL_FROM', 'MAIL_REPLY_TO', 'MAIL_NOTIFY_TO', 'SITE_URL', 'CLIENT_URL']) delete process.env[k];
};

test('sendMail without a key skips quietly instead of throwing', async () => {
  reset();
  const result = await sendMail({ to: 'a@b.co', subject: 'x', html: '<p>x</p>' });
  assert.deepEqual(result, { sent: false, reason: 'not-configured' });
});

test('sendMail posts the right payload to Resend (from, to, reply-to, subject)', async () => {
  reset();
  process.env.RESEND_API_KEY = 're_test';
  process.env.MAIL_FROM = 'Sabbir Ahmad <noreply@bysabbir.com>';
  let captured;
  globalThis.fetch = async (url, init) => {
    captured = { url: String(url), headers: init.headers, body: JSON.parse(init.body) };
    return new Response(JSON.stringify({ id: 'email_123' }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const result = await sendMail({ to: 'me@x.io', subject: 'Hi\r\nBcc: evil@x.io', html: '<p>hi</p>', text: 'hi', replyTo: 'visitor@x.io' });

  assert.deepEqual(result, { sent: true, id: 'email_123' });
  assert.match(captured.url, /api\.resend\.com\/emails$/);
  assert.equal(captured.body.from, 'Sabbir Ahmad <noreply@bysabbir.com>');
  assert.deepEqual([].concat(captured.body.to), ['me@x.io']);
  assert.equal(captured.body.reply_to, 'visitor@x.io');
  assert.equal(captured.body.subject, 'Hi Bcc: evil@x.io'); // CR/LF stripped
  reset();
});

test('sendMail reports a Resend API error without throwing', async () => {
  reset();
  process.env.RESEND_API_KEY = 're_test';
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ name: 'validation_error', message: 'The bysabbir.com domain is not verified.', statusCode: 403 }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  const result = await sendMail({ to: 'me@x.io', subject: 's', html: 'h' });
  assert.equal(result.sent, false);
  reset();
});

test('siteUrl uses the first CLIENT_URL entry and trims slashes; SITE_URL wins', () => {
  reset();
  process.env.CLIENT_URL = 'https://bysabbir.com/, https://www.bysabbir.com';
  assert.equal(siteUrl(), 'https://bysabbir.com');
  process.env.SITE_URL = 'https://example.org';
  assert.equal(siteUrl(), 'https://example.org');
  reset();
});

test('notifyRecipients parses a comma list and ignores blanks', () => {
  reset();
  process.env.MAIL_NOTIFY_TO = ' a@x.io , ,b@x.io ';
  assert.deepEqual(notifyRecipients(), ['a@x.io', 'b@x.io']);
  reset();
});

test('contact notification escapes HTML in every visitor-controlled field', () => {
  const evil = '<script>alert(1)</script>"><img src=x onerror=alert(2)>';
  const { html, subject } = contactNotificationEmail({ name: evil, email: 'a@b.co', subject: evil, message: evil });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.match(subject, /^New message: /);
});

test('password reset email contains the link and the expiry', () => {
  const { html, text } = passwordResetEmail({ name: 'Sabbir', resetUrl: 'https://bysabbir.com/admin/reset-password?token=abc', expiresMinutes: 15 });
  assert.ok(html.includes('reset-password?token=abc'));
  assert.ok(text.includes('reset-password?token=abc'));
  assert.ok(html.includes('15 minutes'));
});
