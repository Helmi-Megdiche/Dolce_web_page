import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Reclamation from "@/models/Reclamation";

const ALLOWED_STATUSES = ["pending", "resolved", "dismissed"] as const;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!getAdminFromRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let body: { status?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (
      !body.status ||
      !ALLOWED_STATUSES.includes(
        body.status as (typeof ALLOWED_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Status must be pending, resolved, or dismissed" },
        { status: 400 }
      );
    }

    const item = await Reclamation.findByIdAndUpdate(
      params.id,
      { status: body.status },
      { new: true, runValidators: true }
    );

    if (!item) {
      return NextResponse.json(
        { error: "Reclamation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/admin/reclamations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update reclamation" },
      { status: 500 }
    );
  }
}
