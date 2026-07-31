import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOffer extends Document {
  title: string;
  description: string;
  imageUrl: string;
  discountLabel: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isHighlighted: boolean;
  buttonText: string;
  buttonLink: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    discountLabel: { type: String, default: "", trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isHighlighted: { type: Boolean, default: false },
    buttonText: { type: String, default: "", trim: true },
    buttonLink: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);

export default Offer;
