import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Appointment } from "@/models/Appointment";
import { requireRole } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { PAGINATION_LIMIT } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole(request, "admin");
    if (error) return error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || PAGINATION_LIMIT;
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: "i" };

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return successResponse(
      { users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      "Users fetched"
    );
  } catch (error) {
    return errorResponse("Failed to fetch users", 500, error);
  }
}
