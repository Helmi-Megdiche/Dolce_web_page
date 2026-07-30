import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import SiteSetting from "@/models/SiteSetting";

const DEFAULT_SETTINGS: Record<string, string> = {
  hero_title: "Dolce",
  hero_subtitle: "Exploring the sweet side of life with Dolce",
  phone: "42 386 082",
  address: "V5HH+4FX, Ariana, Tunisia",
  instagram_url: "https://www.instagram.com/dolce.tn/",
  tiktok_url: "https://www.tiktok.com/@dolce.tn",
  facebook_url: "https://www.facebook.com/dolce.tn",
  glovo_url: "https://glovoapp.com/",
  rating: "4.6",
  price_range: "10-20 DT",
};

async function ensureDefaultSettings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await SiteSetting.findOneAndUpdate(
      { key },
      { $setOnInsert: { key, value } },
      { upsert: true }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDefaultSettings();

    const settings = await SiteSetting.find();
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    return NextResponse.json(map);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid settings payload" },
        { status: 400 }
      );
    }

    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") continue;
      await SiteSetting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
      updates[key] = value;
    }

    return NextResponse.json(updates);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
