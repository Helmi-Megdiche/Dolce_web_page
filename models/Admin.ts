import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: string;
  passwordResetToken?: string | null;
  passwordResetTokenExpiry?: Date | null;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  passwordResetToken: { type: String, default: null },
  passwordResetTokenExpiry: { type: Date, default: null },
});

// Ensure schema updates (e.g. reset-token fields) apply after hot reload
if (mongoose.models.Admin) {
  delete mongoose.models.Admin;
}

const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
