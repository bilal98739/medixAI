import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireAuth } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const { error, user: payload } = await requireAuth(request);
    if (error) return error;

    await connectDB();
    const user = await User.findById(payload!.userId);
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user, "User fetched successfully");
  } catch (error) {
    return errorResponse("Failed to fetch user", 500, error);
  }
}
