import { readFileSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").trim();
  const to = (process.argv[2] || "helmi.megdiche@esprit.tn").trim();

  console.log("From:", user);
  console.log("Pass length:", pass.length, "(should be 16 for Gmail app password)");
  console.log("To:", to);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.verify();
  console.log("SMTP login OK for", user);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Dolce <${user}>`,
    to,
    bcc: user,
    subject: "Dolce SMTP test from haythemdolce",
    text: "Test email from Dolce forgot-password mailer.",
    html: "<p>Test email from Dolce forgot-password mailer.</p><p>If you see this in <b>Sent</b> of the Gmail sender, SMTP works.</p>",
  });

  console.log("Gmail accepted message.");
  console.log("messageId:", info.messageId);
  console.log("response:", info.response);
  console.log("accepted:", info.accepted);
  console.log("rejected:", info.rejected);
  console.log("");
  console.log("NEXT CHECK:");
  console.log("1) Open", user, "→ Sent mail. Do you see this message?");
  console.log("2) Open", to, "→ Inbox + Spam/Junk.");
}

main().catch((e) => {
  console.error("FAILED:", e?.message || e);
  process.exit(1);
});
