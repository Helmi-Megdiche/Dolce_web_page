import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/dolce_db";
  await mongoose.connect(uri);
  const Admin =
    mongoose.models.Admin ||
    mongoose.model(
      "Admin",
      new mongoose.Schema({
        email: String,
        password: String,
        role: String,
      })
    );
  const admins = await Admin.find().select("email role");
  console.log("Admins in DB:", JSON.stringify(admins, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
