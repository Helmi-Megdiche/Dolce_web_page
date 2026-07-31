import mongoose, { Schema, Document, Model } from "mongoose";

export type ReclamationStatus = "pending" | "resolved" | "dismissed";

export interface IReclamation extends Document {
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  status: ReclamationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReclamationSchema = new Schema<IReclamation>(
  {
    name: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Reclamation: Model<IReclamation> =
  mongoose.models.Reclamation ||
  mongoose.model<IReclamation>("Reclamation", ReclamationSchema);

export default Reclamation;
