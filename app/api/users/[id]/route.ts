import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireRole } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireRole(request, "admin");
    if (error) return error;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid user ID", 400);
    }

    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse({ deletedId: params.id }, "User deleted successfully");
  } catch (error) {
    return errorResponse("Failed to delete user", 500, error);
  }
}
