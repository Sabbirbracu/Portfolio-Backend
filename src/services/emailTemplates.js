// Transactional email templates. Each returns { subject, html, text }.
// Inline styles + table-free single column so it renders in Gmail/Outlook/Apple Mail.
// ALL interpolated values go through esc() — contact-form fields are attacker-controlled.

const BRAND = "#19694b";

export const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const layout = ({ preheader, heading, body, cta, footer }) => `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#17211c;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;margin-bottom:20px;">Sabbir Ahmad<span style="color:${BRAND};">.</span></div>
    <div style="background:#ffffff;border:1px solid #e3e8e5;border-radius:10px;padding:28px;">
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;">${esc(heading)}</h1>
      ${body}
      ${
        cta
          ? `<p style="margin:28px 0 8px;"><a href="${esc(cta.url)}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:6px;">${esc(cta.label)}</a></p>
      <p style="margin:12px 0 0;font-size:12px;color:#6b7771;word-break:break-all;">Or paste this link into your browser:<br>${esc(cta.url)}</p>`
          : ""
      }
    </div>
    <p style="margin:20px 4px 0;font-size:12px;line-height:1.5;color:#6b7771;">${footer}</p>
  </div>
</body>
</html>`;

const p = (html) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">${html}</p>`;

export const passwordResetEmail = ({ name, resetUrl, expiresMinutes = 15 }) => ({
  subject: "Reset your admin password",
  html: layout({
    preheader: `This link expires in ${expiresMinutes} minutes.`,
    heading: "Reset your password",
    body:
      p(`Hi ${esc(name || "there")},`) +
      p(`We received a request to reset the password for your portfolio admin account. This link is valid for <strong>${expiresMinutes} minutes</strong> and can be used once.`),
    cta: { label: "Choose a new password", url: resetUrl },
    footer: "If you didn't request this, you can safely ignore this email — your password won't change.",
  }),
  text: `Hi ${name || "there"},\n\nReset your portfolio admin password (valid for ${expiresMinutes} minutes, single use):\n${resetUrl}\n\nIf you didn't request this, ignore this email — your password won't change.`,
});

export const passwordChangedEmail = ({ name }) => ({
  subject: "Your admin password was changed",
  html: layout({
    preheader: "Your portfolio admin password was just changed.",
    heading: "Password changed",
    body:
      p(`Hi ${esc(name || "there")},`) +
      p("The password for your portfolio admin account was just changed. You can now sign in with the new password."),
    footer: "If this wasn't you, reset your password immediately from the admin login page and check your server access.",
  }),
  text: `Hi ${name || "there"},\n\nThe password for your portfolio admin account was just changed.\n\nIf this wasn't you, reset your password immediately from the admin login page.`,
});

export const contactNotificationEmail = ({ name, email, subject, message, dashboardUrl }) => ({
  subject: `New message: ${subject}`,
  html: layout({
    preheader: `${name} wrote to you via your portfolio.`,
    heading: "New contact message",
    body:
      `<table role="presentation" style="width:100%;font-size:14px;line-height:1.5;margin-bottom:16px;">
        <tr><td style="color:#6b7771;width:70px;vertical-align:top;">From</td><td>${esc(name)} &lt;<a href="mailto:${esc(email)}" style="color:${BRAND};">${esc(email)}</a>&gt;</td></tr>
        <tr><td style="color:#6b7771;vertical-align:top;">Subject</td><td>${esc(subject)}</td></tr>
      </table>
      <div style="white-space:pre-wrap;background:#f4f6f5;border-radius:6px;padding:14px 16px;font-size:15px;line-height:1.6;">${esc(message)}</div>
      <p style="margin:16px 0 0;font-size:13px;color:#6b7771;">Hit reply to answer ${esc(name)} directly.</p>`,
    cta: dashboardUrl ? { label: "Open in admin", url: dashboardUrl } : undefined,
    footer: "Sent automatically by your portfolio's contact form.",
  }),
  text: `New message from ${name} <${email}>\nSubject: ${subject}\n\n${message}\n\nReply to this email to answer them directly.`,
});
