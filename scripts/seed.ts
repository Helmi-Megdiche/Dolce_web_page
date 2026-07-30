import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dolce_db";

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const AdminSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: { type: String, default: "admin" },
  });
  const MenuSchema = new mongoose.Schema(
    {
      name: String,
      description: String,
      price: Number,
      category: String,
      imageUrl: String,
      isAvailable: { type: Boolean, default: true },
      displayOrder: Number,
    },
    { timestamps: true }
  );
  const OpeningHourSchema = new mongoose.Schema({
    day: String,
    openTime: String,
    closeTime: String,
    isClosed: Boolean,
  });
  const SiteSettingSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    value: String,
  });

  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
  const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
  const OpeningHour =
    mongoose.models.OpeningHour ||
    mongoose.model("OpeningHour", OpeningHourSchema);
  const SiteSetting =
    mongoose.models.SiteSetting ||
    mongoose.model("SiteSetting", SiteSettingSchema);

  const email = (process.env.ADMIN_EMAIL || "admin@dolce.tn").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hashed = await bcrypt.hash(password, 10);

  await Admin.findOneAndUpdate(
    { email },
    { email, password: hashed, role: "admin" },
    { upsert: true }
  );
  console.log(`Admin ready: ${email} / ${password}`);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  for (const day of days) {
    await OpeningHour.findOneAndUpdate(
      { day },
      {
        day,
        openTime: "10:00",
        closeTime: "22:00",
        isClosed: false,
      },
      { upsert: true }
    );
  }

  const settings: Record<string, string> = {
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
  for (const [key, value] of Object.entries(settings)) {
    await SiteSetting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true }
    );
  }

  const menuCount = await Menu.countDocuments();
  if (menuCount === 0) {
    await Menu.insertMany([
      {
        name: "Crêpe Nutella Banane",
        description: "Crêpe fine garnie de Nutella et banane fraîche",
        price: 12,
        category: "Crêpe",
        imageUrl:
          "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800",
        isAvailable: true,
        displayOrder: 1,
      },
      {
        name: "Crêpe Caramel Beurre Salé",
        description: "Crêpe gourmande au caramel au beurre salé",
        price: 11,
        category: "Crêpe",
        imageUrl:
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
        isAvailable: true,
        displayOrder: 2,
      },
      {
        name: "Pancakes Stack",
        description: "Empilement de pancakes moelleux au sirop d'érable",
        price: 14,
        category: "Pancakes",
        imageUrl:
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
        isAvailable: true,
        displayOrder: 3,
      },
      {
        name: "Bubble Waffle Classic",
        description: "Gaufre bulle avec fruits et crème chantilly",
        price: 15,
        category: "Bubble",
        imageUrl:
          "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800",
        isAvailable: true,
        displayOrder: 4,
      },
      {
        name: "Box Dolce Mix",
        description: "Assortiment de douceurs Dolce à partager",
        price: 28,
        category: "Boxes",
        imageUrl:
          "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
        isAvailable: true,
        displayOrder: 5,
      },
      {
        name: "Milkshake Vanille",
        description: "Milkshake onctueux à la vanille",
        price: 9,
        category: "Drinks",
        imageUrl:
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800",
        isAvailable: true,
        displayOrder: 6,
      },
      {
        name: "Café Latte",
        description: "Espresso onctueux au lait chaud",
        price: 7,
        category: "Drinks",
        imageUrl:
          "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800",
        isAvailable: true,
        displayOrder: 7,
      },
    ]);
    console.log("Sample menu items created");
  }

  console.log("Seed completed");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
