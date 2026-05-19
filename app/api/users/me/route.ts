import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { DoctorProfile } from "@/models/DoctorProfile";
import { requireAuth } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function PATCH(request: NextRequest) {
  try {
    const { error, user: payload } = await requireAuth(request);
    if (error) return error;

    await connectDB();
    const body = await request.json();

    // Only allow updating safe fields
    const allowed = ["name", "phone", "avatar"];
    const update: Record<string, string> = {};
    allowed.forEach((key) => {
      if (body[key] !== undefined) update[key] = body[key];
    });

    const user = await User.findByIdAndUpdate(
      payload!.userId,
      { $set: update },
      { new: true, runValidators: true }
    );

    let doctorProfile = null;
    if (payload!.role === "doctor" && body.doctorProfile) {
      const profileAllowed = [
        "specialization", "consultationFee", "availableDays",
        "workingHours", "bio", "experience", "qualifications", "isAvailable"
      ];
      const profileUpdate: Record<string, any> = {};
      profileAllowed.forEach((key) => {
        if (body.doctorProfile[key] !== undefined) {
          profileUpdate[key] = body.doctorProfile[key];
        }
      });

      doctorProfile = await DoctorProfile.findOneAndUpdate(
        { userId: payload!.userId },
        { $set: profileUpdate },
        { new: true, upsert: true, runValidators: true }
      );
    }

    return successResponse(
      { ...user?.toJSON(), doctorProfile },
      "Profile updated successfully"
    );
  } catch (error) {
    return errorResponse("Failed to update profile", 500, error);
  }
}
