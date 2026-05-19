import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireRole } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(request, "admin");
    if (error) return error;

    const { id } = await params;
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user ID", 400);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse({ deletedId: id }, "User deleted successfully");
  } catch (error) {
    return errorResponse("Failed to delete user", 500, error);
  }
}
