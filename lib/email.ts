import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

function env(name: string) {
  return (process.env[name] || "").trim();
}

function splitAddresses(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join(",") : value || "";
  return [
    ...new Set(
      raw
        .split(/[;,]/)
        .map((part) => part.trim())
        .filter(Boolean)
    ),
  ];
}

/** Admin inboxes: ADMIN_EMAIL (+ EMAIL_USER fallback so alerts are never lost). */
export function getAdminNotifyEmails() {
  const configured = splitAddresses(env("ADMIN_EMAIL"));
  const sender = env("EMAIL_USER");
  const list = [...configured];
  if (sender && !list.some((e) => e.toLowerCase() === sender.toLowerCase())) {
    list.push(sender);
  }
  return list;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const user = env("EMAIL_USER");
  const pass = env("EMAIL_PASS");
  const recipients = splitAddresses(to);

  if (!user || !pass) {
    const resetHint = text || html;
    console.warn(
      "[email] EMAIL_USER / EMAIL_PASS not set — logging email instead of sending."
    );
    console.info(`[email] To: ${recipients.join(", ") || "(none)"}`);
    console.info(`[email] Subject: ${subject}`);
    console.info(`[email] Body: ${resetHint}`);
    return { queued: false, logged: true };
  }

  if (recipients.length === 0) {
    console.warn("[email] No recipients — skipping send.");
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
    to: recipients.join(", "),
    replyTo: user,
    subject,
    html,
    text: plain,
    priority: "normal",
  });

  console.info(
    `[email] Sent mail to ${recipients.join(", ")} | subject="${subject}"`
  );
  console.info(`[email] messageId=${info.messageId}`);
  console.info(`[email] response=${info.response}`);
  console.info(`[email] accepted=${JSON.stringify(info.accepted)}`);
  console.info(`[email] rejected=${JSON.stringify(info.rejected)}`);
  return {
    queued: true,
    logged: false,
    messageId: info.messageId,
    recipients,
  };
}

export function getAppUrl() {
  if (env("APP_URL")) return env("APP_URL").replace(/\/$/, "");
  if (env("NEXT_PUBLIC_APP_URL"))
    return env("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
  if (env("VERCEL_URL")) return `https://${env("VERCEL_URL")}`;
  return "http://localhost:3000";
}
