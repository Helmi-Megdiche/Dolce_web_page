import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Offer from "@/models/Offer";

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(req: NextRequest) {
  try {
    if (!getAdminFromRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const offers = await Offer.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(offers);
  } catch (error) {
    console.error("GET /api/admin/offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!getAdminFromRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const startDate = parseDate(body.startDate);
    const endDate = parseDate(body.endDate);

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Valid startDate and endDate are required" },
        { status: 400 }
      );
    }
    if (endDate < startDate) {
      return NextResponse.json(
        { error: "endDate must be after startDate" },
        { status: 400 }
      );
    }

    const offer = await Offer.create({
      title,
      description:
        typeof body.description === "string" ? body.description.trim() : "",
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
      discountLabel:
        typeof body.discountLabel === "string"
          ? body.discountLabel.trim()
          : "",
      startDate,
      endDate,
      isActive: body.isActive !== false,
      isHighlighted: body.isHighlighted === true,
      buttonText:
        typeof body.buttonText === "string" ? body.buttonText.trim() : "",
      buttonLink:
        typeof body.buttonLink === "string" ? body.buttonLink.trim() : "",
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/offers error:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
