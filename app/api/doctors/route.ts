import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { DoctorProfile } from "@/models/DoctorProfile";
import { requireAuth, requireRole } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { PAGINATION_LIMIT } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || PAGINATION_LIMIT;
    const specialization = searchParams.get("specialization");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const profileFilter: Record<string, unknown> = { isAvailable: true };
    if (specialization) profileFilter.specialization = specialization;

    // Build user filter for search
    const userFilter: Record<string, unknown> = { role: "doctor", isActive: true };
    if (search) {
      userFilter.name = { $regex: search, $options: "i" };
    }

    const doctors = await User.aggregate([
      { $match: userFilter },
      {
        $lookup: {
          from: "doctorprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "doctorProfile",
        },
      },
      {
        $unwind: {
          path: "$doctorProfile",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: specialization ? { "doctorProfile.specialization": specialization } : {} },
      { $project: { password: 0 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await User.countDocuments(userFilter);

    return successResponse(
      { doctors, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      "Doctors fetched successfully"
    );
  } catch (error) {
    return errorResponse("Failed to fetch doctors", 500, error);
  }
}
