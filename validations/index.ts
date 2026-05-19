import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["patient", "doctor", "admin"]).default("patient"),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

// ─── Appointment ──────────────────────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  doctorProfileId: z.string().min(1, "Doctor profile is required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  reason: z
    .string()
    .min(10, "Please provide more details about your reason")
    .max(500),
  fee: z.number().min(0),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(["confirmed", "completed", "cancelled", "rejected"]),
  notes: z.string().max(1000).optional(),
  prescription: z.string().max(2000).optional(),
});

// ─── Doctor Profile ───────────────────────────────────────────────────────────

export const doctorProfileSchema = z.object({
  specialization: z.string().min(1, "Specialization is required"),
  qualifications: z.array(z.string()).min(1, "Add at least one qualification"),
  experience: z.number().min(0).max(60),
  bio: z.string().max(1000).optional(),
  consultationFee: z.number().min(0),
  availableDays: z.array(z.string()).min(1, "Select at least one day"),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

// ─── Patient Profile ──────────────────────────────────────────────────────────

export const patientProfileSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  address: z.string().max(500).optional(),
  medicalHistory: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z
    .object({ name: z.string(), phone: z.string(), relation: z.string() })
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
