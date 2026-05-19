import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { requireAuth } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request);
    if (error) return error;
    await connectDB();

    const notifications = await Notification.find({ userId: user!.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: user!.userId,
      isRead: false,
    });

    return successResponse({ notifications, unreadCount }, "Notifications fetched");
  } catch (error) {
    return errorResponse("Failed to fetch notifications", 500, error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request);
    if (error) return error;
    await connectDB();

    await Notification.updateMany(
      { userId: user!.userId, isRead: false },
      { $set: { isRead: true } }
    );

    return successResponse(null, "All notifications marked as read");
  } catch (error) {
    return errorResponse("Failed to update notifications", 500, error);
  }
}
