import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Offer from "@/models/Offer";

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const update: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      update.title = title;
    }
    if (typeof body.description === "string") {
      update.description = body.description.trim();
    }
    if (typeof body.imageUrl === "string") {
      update.imageUrl = body.imageUrl.trim();
    }
    if (typeof body.discountLabel === "string") {
      update.discountLabel = body.discountLabel.trim();
    }
    if (typeof body.buttonText === "string") {
      update.buttonText = body.buttonText.trim();
    }
    if (typeof body.buttonLink === "string") {
      update.buttonLink = body.buttonLink.trim();
    }
    if (typeof body.isActive === "boolean") {
      update.isActive = body.isActive;
    }
    if (typeof body.isHighlighted === "boolean") {
      update.isHighlighted = body.isHighlighted;
    }
    if (body.startDate !== undefined) {
      const startDate = parseDate(body.startDate);
      if (!startDate) {
        return NextResponse.json(
          { error: "Invalid startDate" },
          { status: 400 }
        );
      }
      update.startDate = startDate;
    }
    if (body.endDate !== undefined) {
      const endDate = parseDate(body.endDate);
      if (!endDate) {
        return NextResponse.json(
          { error: "Invalid endDate" },
          { status: 400 }
        );
      }
      update.endDate = endDate;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const existing = await Offer.findById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const nextStart =
      (update.startDate as Date | undefined) ?? existing.startDate;
    const nextEnd = (update.endDate as Date | undefined) ?? existing.endDate;
    if (nextEnd < nextStart) {
      return NextResponse.json(
        { error: "endDate must be after startDate" },
        { status: 400 }
      );
    }

    const offer = await Offer.findByIdAndUpdate(params.id, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error("PUT /api/admin/offers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!getAdminFromRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const offer = await Offer.findByIdAndDelete(params.id);

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/offers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}
