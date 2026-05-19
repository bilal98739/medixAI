import mongoose, { Document, Schema } from "mongoose";

export interface IAppointmentDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  doctorProfileId: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  reason: string;
  notes?: string;
  prescription?: string;
  fee: number;
}

const appointmentSchema = new Schema<IAppointmentDocument>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorProfileId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    date: { type: Date, required: true, index: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
      default: "pending",
      index: true,
    },
    reason: { type: String, required: true, maxlength: 500 },
    notes: { type: String, maxlength: 1000 },
    prescription: { type: String, maxlength: 2000 },
    fee: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Compound index for conflict checking
appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 });

export const Appointment =
  mongoose.models.Appointment ||
  mongoose.model<IAppointmentDocument>("Appointment", appointmentSchema);
