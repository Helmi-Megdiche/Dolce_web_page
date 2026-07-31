import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function env(name: string) {
  return (process.env[name] || "").trim();
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const user = env("EMAIL_USER");
  const pass = env("EMAIL_PASS");

  if (!user || !pass) {
    const resetHint = text || html;
    console.warn(
      "[email] EMAIL_USER / EMAIL_PASS not set — logging email instead of sending."
    );
    console.info(`[email] To: ${to}`);
    console.info(`[email] Subject: ${subject}`);
    console.info(`[email] Body: ${resetHint}`);
    return { queued: false, logged: true };
  }

  const transporter = nodemailer.createTransport({
    service: env("EMAIL_SERVICE") || "gmail",
    auth: { user, pass },
  });

  try {
    await transporter.verify();
  } catch (error) {
    console.error("[email] SMTP verify failed:", error);
    throw new Error(
      "SMTP login failed. For Gmail use an App Password (Google Account → Security → App passwords), not your normal password. Also remove spaces around = in .env.local."
    );
  }

  const from = env("EMAIL_FROM") || `Dolce <${user}>`;
  const plain = text || html.replace(/<[^>]+>/g, "");

  const info = await transporter.sendMail({
    from,
    to,
    // BCC sender in development so you can confirm send in Gmail "Sent"
    ...(process.env.NODE_ENV !== "production" ? { bcc: user } : {}),
    replyTo: user,
    subject,
    html,
    text: plain,
    // Prefer inbox placement where possible (Gmail may still filter)
    priority: "normal",
  });

  console.info(`[email] Sent reset mail to ${to}`);
  console.info(`[email] messageId=${info.messageId}`);
  console.info(`[email] response=${info.response}`);
  console.info(`[email] accepted=${JSON.stringify(info.accepted)}`);
  console.info(`[email] rejected=${JSON.stringify(info.rejected)}`);
  return { queued: true, logged: false, messageId: info.messageId };
}

export function getAppUrl() {
  if (env("APP_URL")) return env("APP_URL").replace(/\/$/, "");
  if (env("NEXT_PUBLIC_APP_URL"))
    return env("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
  if (env("VERCEL_URL")) return `https://${env("VERCEL_URL")}`;
  return "http://localhost:3000";
}
