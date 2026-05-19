import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { Notification } from "@/models/Notification";
import { DoctorProfile } from "@/models/DoctorProfile";
import { requireAuth } from "@/middleware/auth";
import { createAppointmentSchema } from "@/validations";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { PAGINATION_LIMIT } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || PAGINATION_LIMIT;
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    // Build filter based on role
    const filter: Record<string, unknown> = {};
    if (user!.role === "patient") filter.patientId = user!.userId;
    if (user!.role === "doctor") filter.doctorId = user!.userId;
    if (status) filter.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("patientId", "name email avatar phone")
        .populate("doctorId", "name email avatar")
        .populate("doctorProfileId", "specialization consultationFee")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(filter),
    ]);

    return successResponse(
      {
        appointments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Appointments fetched successfully"
    );
  } catch (error) {
    return errorResponse("Failed to fetch appointments", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request);
    if (error) return error;

    if (user!.role !== "patient") {
      return errorResponse("Only patients can book appointments", 403);
    }

    await connectDB();

    const body = await request.json();
    const parsed = createAppointmentSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400);

    const { doctorId, doctorProfileId, date, timeSlot, reason, fee } = parsed.data;

    // Check for conflict
    const existing = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existing) {
      return errorResponse("This time slot is already booked", 409);
    }

    const appointment = await Appointment.create({
      patientId: user!.userId,
      doctorId,
      doctorProfileId,
      date: new Date(date),
      timeSlot,
      reason,
      fee,
    });

    // Create notifications
    await Promise.all([
      Notification.create({
        userId: user!.userId,
        type: "appointment_booked",
        title: "Appointment Booked",
        message: `Your appointment has been booked successfully for ${date} at ${timeSlot}.`,
        data: { appointmentId: appointment._id },
      }),
      Notification.create({
        userId: doctorId,
        type: "appointment_booked",
        title: "New Appointment Request",
        message: `You have a new appointment request for ${date} at ${timeSlot}.`,
        data: { appointmentId: appointment._id },
      }),
    ]);

    return successResponse(appointment, "Appointment booked successfully", 201);
  } catch (error) {
    return errorResponse("Failed to book appointment", 500, error);
  }
}
