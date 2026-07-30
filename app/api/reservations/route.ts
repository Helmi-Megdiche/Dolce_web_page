import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Reservation from "@/models/Reservation";

export async function GET(req: NextRequest) {
  try {
    if (!getAdminFromRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const reservations = await Reservation.find().sort({
      reservationDate: -1,
      reservationTime: -1,
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { customerName, phone, reservationDate, reservationTime, numberOfPeople } =
      body;

    if (!customerName || !phone || !reservationDate || !reservationTime) {
      return NextResponse.json(
        { error: "Name, phone, date, and time are required" },
        { status: 400 }
      );
    }

    const guests = Number(numberOfPeople) || 1;
    if (guests < 1 || guests > 20) {
      return NextResponse.json(
        { error: "Number of people must be between 1 and 20" },
        { status: 400 }
      );
    }

    const reservation = await Reservation.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: body.email?.trim() || "",
      reservationDate,
      reservationTime,
      numberOfPeople: guests,
      specialRequests: body.specialRequests?.trim() || "",
      status: "pending",
    });

    return NextResponse.json(
      { success: true, reservation },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reservations error:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
