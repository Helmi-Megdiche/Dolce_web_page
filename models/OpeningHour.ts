import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOpeningHour extends Document {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const OpeningHourSchema = new Schema<IOpeningHour>({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  openTime: { type: String, default: "10:00" },
  closeTime: { type: String, default: "22:00" },
  isClosed: { type: Boolean, default: false },
});

const OpeningHour: Model<IOpeningHour> =
  mongoose.models.OpeningHour ||
  mongoose.model<IOpeningHour>("OpeningHour", OpeningHourSchema);

export default OpeningHour;
