import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenu extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Boxes", "Pancakes", "Bubble", "Crêpe", "Drinks"],
    },
    imageUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);

export default Menu;
