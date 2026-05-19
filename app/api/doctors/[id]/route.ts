import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { DoctorProfile } from "@/models/DoctorProfile";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/apiResponse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const user = await User.findOne({ _id: id, role: "doctor", isActive: true });
    if (!user) return notFoundResponse("Doctor not found");

    const profile = await DoctorProfile.findOne({ userId: id });

    return successResponse({ ...user.toJSON(), doctorProfile: profile }, "Doctor fetched");
  } catch (error) {
    return errorResponse("Failed to fetch doctor", 500, error);
  }
}
