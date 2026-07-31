import { connectToDatabase } from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";
import Menu from "@/models/Menu";
import OpeningHour from "@/models/OpeningHour";

const DEFAULT_SETTINGS: Record<string, string> = {
  hero_title: "Dolce",
  hero_subtitle: "Exploring the sweet side of life with Dolce",
  phone: "42 386 082",
  address: "V5HH+4FX, Ariana, Tunisia",
  instagram_url: "https://www.instagram.com/dolce.tn/",
  tiktok_url: "https://www.tiktok.com/@dolce.tn",
  facebook_url: "https://www.facebook.com/dolce.tn",
  whatsapp_url: "https://wa.me/21642386082",
  glovo_url: "https://glovoapp.com/",
  rating: "4.6",
  price_range: "10-20 DT",
};

export async function getSettings(): Promise<Record<string, string>> {
  try {
    await connectToDatabase();
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await SiteSetting.findOneAndUpdate(
        { key },
        { $setOnInsert: { key, value } },
        { upsert: true }
      );
    }
    const settings = await SiteSetting.find().lean();
    const map: Record<string, string> = { ...DEFAULT_SETTINGS };
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return map;
  } catch (error) {
    console.error("getSettings error:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function getMenuItems() {
  try {
    await connectToDatabase();
    const items = await Menu.find({ isAvailable: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return items
      .filter(
        (item) =>
          !`${item.name || ""} ${item.description || ""}`
            .toLowerCase()
            .includes("cake")
      )
      .map((item) => ({
        ...item,
        _id: item._id.toString(),
      }));
  } catch (error) {
    console.error("getMenuItems error:", error);
    return [];
  }
}

export async function getHours() {
  try {
    await connectToDatabase();
    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
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
    const hours = await OpeningHour.find().lean();
    return DAYS.map((day) => {
      const found = hours.find((h) => h.day === day);
      return found
        ? { ...found, _id: found._id.toString() }
        : { day, openTime: "10:00", closeTime: "22:00", isClosed: false };
    });
  } catch (error) {
    console.error("getHours error:", error);
    return [];
  }
}
