import mongoose, { Document, Schema } from "mongoose";

export interface IDoctorProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  qualifications: string[];
  experience: number;
  bio: string;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  availableDays: string[];
  workingHours: { start: string; end: string };
  isAvailable: boolean;
}

const doctorProfileSchema = new Schema<IDoctorProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    specialization: { type: String, required: true, index: true },
    qualifications: [{ type: String }],
    experience: { type: Number, default: 0, min: 0 },
    bio: { type: String, maxlength: 1000 },
    consultationFee: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    availableDays: [
      {
        type: String,
        enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      },
    ],
    workingHours: {
      start: { type: String, default: "09:00 AM" },
      end: { type: String, default: "05:00 PM" },
    },
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const DoctorProfile =
  mongoose.models.DoctorProfile ||
  mongoose.model<IDoctorProfileDocument>("DoctorProfile", doctorProfileSchema);
