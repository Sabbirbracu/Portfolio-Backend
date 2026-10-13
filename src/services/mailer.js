import { Resend } from "resend";

// Thin wrapper around Resend. sendMail() NEVER throws: a mail failure must not break the request
// that triggered it (e.g. saving a contact message), so callers get { sent, reason } and it is logged.
//
// Env:
//   RESEND_API_KEY   required to actually send
//   MAIL_FROM        e.g. "Sabbir Ahmad <noreply@bysabbir.com>" (domain must be verified in Resend)
//   MAIL_NOTIFY_TO   where owner notifications (new contact message) go; comma-separated for several
//   MAIL_REPLY_TO    optional Reply-To on system mail (e.g. hello@bysabbir.com)
//   SITE_URL         public frontend URL used in email links (defaults to the first CLIENT_URL entry)

const DEFAULT_FROM = "Sabbir Ahmad <noreply@bysabbir.com>";

let client;
const getClient = () => {
  if (!process.env.RESEND_API_KEY) return null;
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
};

export const isMailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export const siteUrl = () =>
  (process.env.SITE_URL || process.env.CLIENT_URL?.split(",")[0] || "http://localhost:8080").trim().replace(/\/+$/, "");

export const notifyRecipients = () =>
  (process.env.MAIL_NOTIFY_TO || "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

// Strip CR/LF so user-supplied text can never break out of a header-like field.
const oneLine = (value) => String(value ?? "").replace(/[\r\n]+/g, " ").trim();

export const sendMail = async ({ to, subject, html, text, replyTo }) => {
  const resend = getClient();
  if (!resend) {
    console.warn(`[mail] RESEND_API_KEY not set — skipped "${oneLine(subject)}" to ${[].concat(to).join(", ")}`);
    return { sent: false, reason: "not-configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || DEFAULT_FROM,
      to,
      subject: oneLine(subject),
      html,
      text,
      replyTo: replyTo || process.env.MAIL_REPLY_TO || undefined,
    });

    if (error) {
      console.error(`[mail] Resend rejected "${oneLine(subject)}": ${error.name} — ${error.message}`);
      return { sent: false, reason: error.name || "resend-error" };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error(`[mail] Failed to send "${oneLine(subject)}":`, err.message);
    return { sent: false, reason: "exception" };
  }
};
