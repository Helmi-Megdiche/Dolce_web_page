import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { getAdminNotifyEmails, getAppUrl, sendEmail } from "@/lib/email";
import { digitsOnly, isValidPhone } from "@/lib/validation";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import Offer from "@/models/Offer";
import Reservation from "@/models/Reservation";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 12px;color:#7a6558;font-size:13px;width:120px;vertical-align:top">${escapeHtml(
        label
      )}</td>
      <td style="padding:8px 12px;color:#2D1B12;font-size:14px;font-weight:600">${escapeHtml(
        value
      )}</td>
    </tr>
  `;
}

async function notifyAdminsOfReservation(payload: {
  customerName: string;
  phone: string;
  email: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople: number;
  specialRequests: string;
  offerTitle?: string;
  offerDiscountLabel?: string;
}) {
  const appUrl = getAppUrl();
  const adminUrl = `${appUrl}/fr/admin/dashboard?tab=reservations`;
  const adminEmails = getAdminNotifyEmails();
  const hasOffer = Boolean(payload.offerTitle?.trim());

  const offerTitle = payload.offerTitle?.trim() || "";
  const offerBadge = payload.offerDiscountLabel?.trim() || "";
  const offerDisplay = offerBadge
    ? `${offerTitle} · ${offerBadge}`
    : offerTitle;

  const textLines = [
    hasOffer
      ? "Nouvelle réservation avec offre — Dolce.tn"
      : "Nouvelle réservation — Dolce.tn",
    "",
    `Client: ${payload.customerName}`,
    `Tél: ${payload.phone}`,
    payload.email && `Email: ${payload.email}`,
    `Date: ${payload.reservationDate}`,
    `Heure: ${payload.reservationTime}`,
    `Personnes: ${payload.numberOfPeople}`,
    hasOffer && `Offre jointe: ${offerDisplay}`,
    payload.specialRequests && `Demandes: ${payload.specialRequests}`,
    "",
    `Admin: ${adminUrl}`,
  ].filter(Boolean) as string[];

  const offerHtml = hasOffer
    ? `
      <div style="margin:0 0 16px;padding:14px 16px;border-radius:12px;background:linear-gradient(135deg,#FFF1EB,#FFE4D6);border:1px solid #ffb39a">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c45f4c">
          Offre jointe à la réservation
        </p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#2D1B12">
          ${escapeHtml(offerTitle)}
        </p>
        ${
          offerBadge
            ? `<p style="margin:6px 0 0;display:inline-block;padding:4px 10px;border-radius:999px;background:#ff9e8d;color:#fff;font-size:12px;font-weight:700">${escapeHtml(
                offerBadge
              )}</p>`
            : ""
        }
      </div>
    `
    : "";

  const subject = hasOffer
    ? `Réservation + offre: ${offerTitle} — ${payload.customerName}`
    : `Nouvelle réservation — ${payload.customerName}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#2D1B12;max-width:560px;margin:0 auto">
      <div style="padding:20px 20px 8px">
        <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8B5E3C;font-weight:700">Dolce.tn</p>
        <h2 style="margin:0 0 16px;font-size:22px;color:#2D1B12">
          ${hasOffer ? "Réservation avec offre" : "Nouvelle réservation"}
        </h2>
        ${offerHtml}
        <table style="width:100%;border-collapse:collapse;background:#FFF8F2;border-radius:12px;overflow:hidden">
          ${detailRow("Client", payload.customerName)}
          ${detailRow("Téléphone", payload.phone)}
          ${
            payload.email
              ? detailRow("Email", payload.email)
              : ""
          }
          ${detailRow("Date", payload.reservationDate)}
          ${detailRow("Heure", payload.reservationTime)}
          ${detailRow("Personnes", String(payload.numberOfPeople))}
          ${
            payload.specialRequests
              ? detailRow("Demandes", payload.specialRequests)
              : ""
          }
        </table>
        <p style="margin:22px 0 0">
          <a href="${adminUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#8B5E3C;color:#fff;text-decoration:none;font-weight:700;font-size:14px">
            Ouvrir dans l'admin
          </a>
        </p>
      </div>
    </div>
  `;

  const notifyTasks: Promise<unknown>[] = [];

  if (adminEmails.length > 0) {
    notifyTasks.push(
      sendEmail({
        to: adminEmails,
        subject,
        text: textLines.join("\n"),
        html,
      }).catch((error) => {
        console.error("[reservations] Email notify failed:", error);
      })
    );
  } else {
    console.warn(
      "[reservations] No ADMIN_EMAIL / EMAIL_USER — skipping email alert."
    );
  }

  const whatsappBody = [
    hasOffer
      ? "Dolce - Réservation avec offre ! 🎁"
      : "Dolce - Nouvelle réservation ! 🍽️",
    "",
    hasOffer ? `⭐ Offre: ${offerDisplay}` : null,
    hasOffer ? "" : null,
    `Client: ${payload.customerName}`,
    `Tél: ${payload.phone}`,
    payload.email ? `Email: ${payload.email}` : null,
    `Date: ${payload.reservationDate} à ${payload.reservationTime}`,
    `Personnes: ${payload.numberOfPeople}`,
    payload.specialRequests
      ? `Demandes: ${payload.specialRequests}`
      : null,
    "",
    `Admin: ${adminUrl}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  notifyTasks.push(sendWhatsAppAlert(whatsappBody));

  await Promise.allSettled(notifyTasks);
}

async function resolveOfferFromBody(body: Record<string, unknown>) {
  const offerIdRaw =
    typeof body.offerId === "string" ? body.offerId.trim() : "";
  const clientTitle =
    typeof body.offerTitle === "string" ? body.offerTitle.trim() : "";
  const clientDiscount =
    typeof body.offerDiscountLabel === "string"
      ? body.offerDiscountLabel.trim()
      : "";

  if (!offerIdRaw || !mongoose.Types.ObjectId.isValid(offerIdRaw)) {
    return {
      offerId: "",
      offerTitle: clientTitle,
      offerDiscountLabel: clientDiscount,
    };
  }

  const offer = await Offer.findById(offerIdRaw)
    .select("title discountLabel")
    .lean();

  if (!offer) {
    return {
      offerId: offerIdRaw,
      offerTitle: clientTitle,
      offerDiscountLabel: clientDiscount,
    };
  }

  return {
    offerId: String(offer._id),
    offerTitle: offer.title || clientTitle,
    offerDiscountLabel: offer.discountLabel || clientDiscount,
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    if (!getAdminFromRequest(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    await connectToDatabase();
    const reservations = await Reservation.find().sort({
      reservationDate: -1,
      reservationTime: -1,
    });

    return NextResponse.json(reservations, { headers: corsHeaders() });
  } catch (error) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400, headers: corsHeaders() }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const customerName =
      typeof body.customerName === "string" ? body.customerName.trim() : "";
    const phone =
      typeof body.phone === "string" ? digitsOnly(body.phone) : "";
    const reservationDate =
      typeof body.reservationDate === "string" ? body.reservationDate : "";
    const reservationTime =
      typeof body.reservationTime === "string" ? body.reservationTime : "";
    const email =
      typeof body.email === "string" ? body.email.trim() : "";
    const specialRequests =
      typeof body.specialRequests === "string"
        ? body.specialRequests.trim()
        : "";

    if (!customerName) {
      return NextResponse.json(
        { error: "Name is missing" },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: "Phone is missing" },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Phone must be exactly 8 digits" },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (!reservationDate) {
      return NextResponse.json(
        { error: "Date is missing" },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (!reservationTime) {
      return NextResponse.json(
        { error: "Time is missing" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const guests = Number(body.numberOfPeople) || 1;
    if (guests < 1 || guests > 20) {
      return NextResponse.json(
        { error: "Number of people must be between 1 and 20" },
        { status: 400, headers: corsHeaders() }
      );
    }

    await connectToDatabase();

    const { offerId, offerTitle, offerDiscountLabel } =
      await resolveOfferFromBody(body);

    const reservation = await Reservation.create({
      customerName,
      phone,
      email,
      reservationDate,
      reservationTime,
      numberOfPeople: guests,
      specialRequests,
      offerId,
      offerTitle,
      offerDiscountLabel,
      status: "pending",
    });

    try {
      await notifyAdminsOfReservation({
        customerName,
        phone,
        email,
        reservationDate,
        reservationTime,
        numberOfPeople: guests,
        specialRequests,
        offerTitle,
        offerDiscountLabel,
      });
    } catch (error) {
      console.error("[reservations] notifyAdmins unexpected error:", error);
    }

    return NextResponse.json(
      { success: true, reservation },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("POST /api/reservations error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create reservation";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
