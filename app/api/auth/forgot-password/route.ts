import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { sendEmail, getAppUrl } from "@/lib/email";
import { isWhatsAppConfigured, sendWhatsAppMessage } from "@/lib/whatsapp";

const isDev = process.env.NODE_ENV !== "production";

type ResetMethod = "email" | "whatsapp";

function buildResetEmail(resetUrl: string, toEmail: string) {
  const subject = "Your Dolce admin password reset";

  const text = [
    "Hello,",
    "",
    "We received a request to reset the password for your Dolce admin account",
    `(${toEmail}).`,
    "",
    "Open this link to choose a new password (valid for 1 hour):",
    resetUrl,
    "",
    "If you did not request this, you can ignore this message.",
    "Your password will stay unchanged.",
    "",
    "— Dolce",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#fff8f2;font-family:Arial,Helvetica,sans-serif;color:#2d1b12;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8f2;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;padding:28px 24px;border:1px solid #f5e6d3;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#8b5e3c;">Dolce</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hello,</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">
                  We received a request to reset the password for your Dolce admin account
                  (<strong>${toEmail}</strong>).
                </p>
                <p style="margin:0 0 20px;">
                  <a href="${resetUrl}"
                     style="display:inline-block;background:#8b5e3c;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:600;">
                    Reset password
                  </a>
                </p>
                <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#5a4638;">
                  This link expires in 1 hour. If the button does not work, copy and paste this URL into your browser:
                </p>
                <p style="margin:0 0 20px;font-size:12px;line-height:1.5;word-break:break-all;color:#8b5e3c;">
                  ${resetUrl}
                </p>
                <p style="margin:0;font-size:13px;line-height:1.5;color:#5a4638;">
                  If you did not request this, ignore this email. Your password will remain unchanged.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  return { subject, text, html };
}

function buildWhatsAppResetMessage(resetUrl: string, toEmail: string) {
  return [
    "Dolce — Réinitialisation du mot de passe 🔐",
    "",
    `Compte: ${toEmail}`,
    "",
    "Ouvrez ce lien pour choisir un nouveau mot de passe (valide 1 heure):",
    resetUrl,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.",
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
    const method: ResetMethod =
      body?.method === "whatsapp" ? "whatsapp" : "email";
    const locale =
      typeof body?.locale === "string" && body.locale === "en" ? "en" : "fr";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (method === "whatsapp" && !isWhatsAppConfigured()) {
      return NextResponse.json(
        {
          error:
            "WhatsApp reset is not configured. Please use email, or set UltraMsg env vars.",
        },
        { status: 503 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.warn(`[forgot-password] No admin found for: ${email}`);
      if (isDev) {
        return NextResponse.json(
          {
            error: `No admin account exists for "${email}".`,
          },
          { status: 404 }
        );
      }
      // Avoid account enumeration in production
      return NextResponse.json({
        success: true,
        method,
        message:
          method === "whatsapp"
            ? "If an account exists, a WhatsApp message was sent."
            : "If an account exists, a reset email was sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    admin.passwordResetToken = token;
    admin.passwordResetTokenExpiry = expiry;
    await admin.save();

    const appUrl = getAppUrl();
    const resetUrl = `${appUrl}/${locale}/admin/reset-password?token=${token}`;

    if (method === "whatsapp") {
      const sent = await sendWhatsAppMessage(
        buildWhatsAppResetMessage(resetUrl, admin.email)
      );
      if (!sent) {
        return NextResponse.json(
          {
            error: isDev
              ? "WhatsApp send failed. Check UltraMsg credentials and that the number is whitelisted."
              : "Unable to send WhatsApp message. Please try email instead.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        method: "whatsapp",
        message: "If an account exists, a WhatsApp message was sent.",
      });
    }

    const mail = buildResetEmail(resetUrl, admin.email);

    try {
      await sendEmail({
        to: admin.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    } catch (mailError) {
      console.error("[forgot-password] email send failed:", mailError);
      const detail =
        mailError instanceof Error ? mailError.message : "Email send failed";
      return NextResponse.json(
        {
          error: isDev
            ? detail
            : "Unable to send email. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      method: "email",
      message: "If an account exists, a reset email was sent.",
    });
  } catch (error) {
    console.error("forgot-password error:", error);
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 }
    );
  }
}
