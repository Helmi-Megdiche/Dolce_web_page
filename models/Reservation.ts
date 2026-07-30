import mongoose, { Schema, Document, Model } from "mongoose";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface IReservation extends Document {
  customerName: string;
  phone: string;
  email: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople: number;
  specialRequests: string;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    reservationDate: { type: String, required: true },
    reservationTime: { type: String, required: true },
    numberOfPeople: { type: Number, required: true, min: 1, max: 20 },
    specialRequests: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Reservation: Model<IReservation> =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", ReservationSchema);

export default Reservation;
