import mongoose from "mongoose";

async function main() {
  const newEmail = (process.argv[2] || "").toLowerCase().trim();
  if (!newEmail || !newEmail.includes("@")) {
    console.error("Usage: npx tsx scripts/set-admin-email.ts you@email.com");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/dolce_db";
  await mongoose.connect(uri);
  const Admin =
    mongoose.models.Admin ||
    mongoose.model(
      "Admin",
      new mongoose.Schema({
        email: { type: String, unique: true },
        password: String,
        role: String,
      })
    );

  const admin = await Admin.findOne().sort({ createdAt: 1 });
  if (!admin) {
    console.error("No admin found. Run npm run seed first.");
    process.exit(1);
  }

  const old = admin.email;
  admin.email = newEmail;
  await admin.save();
  console.log(`Updated admin email: ${old} → ${newEmail}`);
  console.log("Use this email for login + forgot password.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
