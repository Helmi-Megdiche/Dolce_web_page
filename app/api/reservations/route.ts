import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Reservation from "@/models/Reservation";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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
