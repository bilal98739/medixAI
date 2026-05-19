import mongoose, { Document, Schema } from "mongoose";

export interface IPatientProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  address?: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  medicalHistory?: string[];
  allergies?: string[];
}

const patientProfileSchema = new Schema<IPatientProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    address: { type: String, maxlength: 500 },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    medicalHistory: [{ type: String }],
    allergies: [{ type: String }],
  },
  { timestamps: true }
);

export const PatientProfile =
  mongoose.models.PatientProfile ||
  mongoose.model<IPatientProfileDocument>("PatientProfile", patientProfileSchema);
