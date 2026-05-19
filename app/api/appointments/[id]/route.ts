import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { Notification } from "@/models/Notification";
import { requireAuth } from "@/middleware/auth";
import { updateAppointmentSchema } from "@/validations";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/apiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireAuth(request);
    if (error) return error;
    const { id } = await params;
    await connectDB();

    const appointment = await Appointment.findById(id)
      .populate("patientId", "name email avatar phone")
      .populate("doctorId", "name email avatar")
      .populate("doctorProfileId", "specialization consultationFee rating");

    if (!appointment) return notFoundResponse("Appointment not found");

    return successResponse(appointment, "Appointment fetched");
  } catch (error) {
    return errorResponse("Failed to fetch appointment", 500, error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireAuth(request);
    if (error) return error;
    const { id } = await params;

    await connectDB();

    const body = await request.json();
    const parsed = updateAppointmentSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400);

    const appointment = await Appointment.findById(id);
    if (!appointment) return notFoundResponse("Appointment not found");

    const { status, notes, prescription } = parsed.data;

    // Permission checks
    const isDoctor = user!.role === "doctor" && appointment.doctorId.toString() === user!.userId;
    const isPatient = user!.role === "patient" && appointment.patientId.toString() === user!.userId;
    const isAdmin = user!.role === "admin";

    if (!isDoctor && !isPatient && !isAdmin) {
      return errorResponse("You don't have permission to update this appointment", 403);
    }

    // Patients can only cancel
    if (isPatient && status !== "cancelled") {
      return errorResponse("Patients can only cancel appointments", 403);
    }

    Object.assign(appointment, { status, notes, prescription });
    await appointment.save();

    // Notification mapping
    const notifType = `appointment_${status}` as const;
    const notifMessages: Record<string, string> = {
      confirmed: "Your appointment has been confirmed.",
      cancelled: "An appointment has been cancelled.",
      completed: "Your appointment has been completed.",
      rejected: "Your appointment request was not accepted.",
    };

    await Notification.create({
      userId: appointment.patientId,
      type: notifType,
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: notifMessages[status],
      data: { appointmentId: appointment._id },
    });

    return successResponse(appointment, `Appointment ${status} successfully`);
  } catch (error) {
    return errorResponse("Failed to update appointment", 500, error);
  }
}
