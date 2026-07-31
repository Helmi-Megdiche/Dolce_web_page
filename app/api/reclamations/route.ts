import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminNotifyEmails, getAppUrl, sendEmail } from "@/lib/email";
import { digitsOnly, isValidEmail, isValidPhone } from "@/lib/validation";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import Reclamation from "@/models/Reclamation";

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

async function notifyAdmins(payload: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const appUrl = getAppUrl();
  const adminUrl = `${appUrl}/fr/admin/dashboard?tab=reclamations`;
  const adminEmails = getAdminNotifyEmails();
  const truncatedMessage = truncate(payload.message, 1000);

  const contactLines = [
    payload.name && `Nom: ${payload.name}`,
    payload.email && `Email: ${payload.email}`,
    payload.phone && `Tél: ${payload.phone}`,
  ].filter(Boolean);

  const contactBlock =
    contactLines.length > 0
      ? contactLines.join("\n")
      : "Contact: Anonyme";

  // Email — never fail the API if this errors
  if (adminEmails.length > 0) {
    try {
      await sendEmail({
        to: adminEmails,
        subject: "Nouvelle réclamation Dolce.tn",
        text: [
          "Nouvelle réclamation reçue sur Dolce.tn",
          "",
          contactBlock,
          "",
          "Message:",
          payload.message,
          "",
          `Admin: ${adminUrl}`,
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5;color:#2D1B12">
            <h2 style="margin:0 0 12px">Nouvelle réclamation Dolce.tn</h2>
            <p style="margin:0 0 8px;white-space:pre-line">${contactBlock
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</p>
            <p style="margin:16px 0 8px"><strong>Message:</strong></p>
            <p style="margin:0;padding:12px;background:#FFF8F2;border-radius:8px;white-space:pre-wrap">${payload.message
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</p>
            <p style="margin:20px 0 0">
              <a href="${adminUrl}" style="color:#8B5E3C">Ouvrir dans l'admin</a>
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("[reclamations] Email notify failed:", error);
    }
  } else {
    console.warn(
      "[reclamations] No ADMIN_EMAIL / EMAIL_USER — skipping email alert."
    );
  }

  // WhatsApp — never fail the API if this errors
  const whatsappBody = [
    "Dolce - Nouvelle réclamation ! 📝",
    "",
    contactBlock,
    "",
    `Message: ${truncatedMessage}`,
    "",
    `Admin: ${adminUrl}`,
  ].join("\n");

  await sendWhatsAppAlert(whatsappBody);
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    let body: {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length < 5) {
      return NextResponse.json(
        { error: "Message must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const phone = digitsOnly(phoneRaw);
    if (phoneRaw && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Phone must be exactly 8 digits" },
        { status: 400 }
      );
    }

    const item = await Reclamation.create({
      name,
      email: email.toLowerCase(),
      phone,
      message,
      status: "pending",
    });

    // Notifications must not block or fail the public submit response
    try {
      await notifyAdmins({
        name,
        email: email.toLowerCase(),
        phone,
        message,
      });
    } catch (error) {
      console.error("[reclamations] notifyAdmins unexpected error:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Reclamation submitted successfully",
        id: item._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reclamations error:", error);
    return NextResponse.json(
      { error: "Failed to submit reclamation" },
      { status: 500 }
    );
  }
}
