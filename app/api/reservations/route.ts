import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { getAppUrl, sendEmail } from "@/lib/email";
import { sendWhatsAppAlert } from "@/lib/whatsapp";
import Reservation from "@/models/Reservation";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function escapeHtml(value: string) {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function notifyAdminsOfReservation(payload: {
  customerName: string;
  phone: string;
  email: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople: number;
  specialRequests: string;
}) {
  const appUrl = getAppUrl();
  const adminUrl = `${appUrl}/fr/admin/dashboard?tab=reservations`;
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim();

  const details = [
    `Nom: ${payload.customerName}`,
    `Tél: ${payload.phone}`,
    payload.email && `Email: ${payload.email}`,
    `Date: ${payload.reservationDate}`,
    `Heure: ${payload.reservationTime}`,
    `Personnes: ${payload.numberOfPeople}`,
    payload.specialRequests && `Demandes: ${payload.specialRequests}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (adminEmail) {
    try {
      await sendEmail({
        to: adminEmail,
        subject: "Nouvelle réservation Dolce.tn",
        text: [
          "Nouvelle réservation reçue sur Dolce.tn",
          "",
          details,
          "",
          `Admin: ${adminUrl}`,
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5;color:#2D1B12">
            <h2 style="margin:0 0 12px">Nouvelle réservation Dolce.tn</h2>
            <p style="margin:0;padding:12px;background:#FFF8F2;border-radius:8px;white-space:pre-line">${escapeHtml(
              details
            )}</p>
            <p style="margin:20px 0 0">
              <a href="${adminUrl}" style="color:#8B5E3C">Ouvrir dans l'admin</a>
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("[reservations] Email notify failed:", error);
    }
  } else {
    console.warn("[reservations] ADMIN_EMAIL not set — skipping email alert.");
  }

  const whatsappBody = [
    "Dolce - Nouvelle réservation ! 🍽️",
    "",
    details,
    "",
    `Admin: ${adminUrl}`,
  ].join("\n");

  await sendWhatsAppAlert(whatsappBody);
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
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
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

    const reservation = await Reservation.create({
      customerName,
      phone,
      email,
      reservationDate,
      reservationTime,
      numberOfPeople: guests,
      specialRequests,
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
