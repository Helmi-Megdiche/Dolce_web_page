import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import OpeningHour from "@/models/OpeningHour";

// Prevent Vercel from statically prerendering this route (GET-only cache → PUT 405)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

async function ensureDefaultHours() {
  const count = await OpeningHour.countDocuments();
  if (count === 0) {
    await OpeningHour.insertMany(
      DAYS.map((day) => ({
        day,
        openTime: "10:00",
        closeTime: "22:00",
        isClosed: false,
      }))
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDefaultHours();

    const hours = await OpeningHour.find();
    const ordered = DAYS.map(
      (day) =>
        hours.find((h) => h.day === day) || {
          day,
          openTime: "10:00",
          closeTime: "22:00",
          isClosed: false,
        }
    );

    return NextResponse.json(ordered);
  } catch (error) {
    console.error("GET /api/hours error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hours" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!getAdminFromRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const updates = Array.isArray(body) ? body : [body];

    const results = [];
    for (const item of updates) {
      if (!item.day) continue;
      const updated = await OpeningHour.findOneAndUpdate(
        { day: item.day },
        {
          openTime: item.openTime || "10:00",
          closeTime: item.closeTime || "22:00",
          isClosed: !!item.isClosed,
        },
        { upsert: true, new: true }
      );
      results.push(updated);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("PUT /api/hours error:", error);
    return NextResponse.json(
      { error: "Failed to update hours" },
      { status: 500 }
    );
  }
}
