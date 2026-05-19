// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "admin";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

// ─── Doctor ───────────────────────────────────────────────────────────────────

export interface IDoctorProfile {
  _id: string;
  userId: string | IUser;
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
  createdAt: string;
  updatedAt: string;
}

export interface IDoctor extends IUser {
  doctorProfile?: IDoctorProfile;
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export interface IPatientProfile {
  _id: string;
  userId: string | IUser;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  address?: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  medicalHistory?: string[];
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected";

export interface IAppointment {
  _id: string;
  patientId: string | IUser;
  doctorId: string | IUser;
  doctorProfileId: string | IDoctorProfile;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  prescription?: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "appointment_booked"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_completed"
  | "system_alert"
  | "reminder";

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  revenue: number;
  pendingAppointments: number;
  completedAppointments: number;
}

export interface DoctorStats {
  todayAppointments: number;
  totalPatients: number;
  completedAppointments: number;
  pendingAppointments: number;
  rating: number;
  revenue: number;
}

export interface PatientStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  favouriteDoctors: number;
}
