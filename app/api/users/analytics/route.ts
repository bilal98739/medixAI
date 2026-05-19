import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Appointment } from "@/models/Appointment";
import { requireRole } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole(request, "admin");
    if (error) return error;
    await connectDB();

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      revenueResult,
      monthlyData,
    ] = await Promise.all([
      User.countDocuments({ role: "patient", isActive: true }),
      User.countDocuments({ role: "doctor", isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$fee" } } },
      ]),
      Appointment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
            revenue: { $sum: "$fee" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
    ]);

    return successResponse(
      {
        stats: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          pendingAppointments,
          completedAppointments,
          revenue: revenueResult[0]?.total ?? 0,
        },
        monthlyData,
      },
      "Analytics fetched"
    );
  } catch (error) {
    return errorResponse("Failed to fetch analytics", 500, error);
  }
}
