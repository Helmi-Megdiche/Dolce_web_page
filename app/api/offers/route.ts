import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Offer from "@/models/Offer";

export async function GET() {
  try {
    await connectToDatabase();
    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ isHighlighted: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(offers);
  } catch (error) {
    console.error("GET /api/offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
