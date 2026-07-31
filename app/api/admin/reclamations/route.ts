import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Reclamation from "@/models/Reclamation";

export async function GET(req: NextRequest) {
  try {
    if (!getAdminFromRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const items = await Reclamation.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/admin/reclamations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reclamations" },
      { status: 500 }
    );
  }
}
