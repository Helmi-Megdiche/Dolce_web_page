import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Menu from "@/models/Menu";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const isAdmin = !!getAdminFromRequest(req);
    const filter = isAdmin ? {} : { isAvailable: true };

    const items = await Menu.find(filter).sort({ displayOrder: 1, name: 1 });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
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
    const body = await req.json();

    if (!body.name || body.price === undefined || !body.category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const item = await Menu.create({
      name: body.name,
      description: body.description || "",
      price: Number(body.price),
      category: body.category,
      imageUrl: body.imageUrl || "",
      isAvailable: body.isAvailable !== false,
      displayOrder: Number(body.displayOrder) || 0,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/menu error:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
