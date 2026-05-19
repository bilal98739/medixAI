import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { requireAuth } from "@/middleware/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse("Invalid file type. Only JPEG, PNG, and WebP are allowed", 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("File size must be less than 5MB", 400);
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const { url, publicId } = await uploadImage(base64, "medixai/profiles");

    return successResponse(
      { url, publicId, filename: file.name },
      "Image uploaded successfully"
    );
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Failed to upload image", 500, error);
  }
}
