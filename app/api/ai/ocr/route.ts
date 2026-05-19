import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { extractTextFromImage } from "@/services/ai/ocr";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const maxDuration = 60;
export const runtime = "edge";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_SIZE_MB = 5;

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { imageBase64, mediaType, documentType, enhanceStructure } = body;

    if (!imageBase64 || !mediaType) {
      return errorResponse("imageBase64 and mediaType are required", 400);
    }

    if (!ALLOWED_TYPES.includes(mediaType)) {
      return errorResponse(`mediaType must be one of: ${ALLOWED_TYPES.join(", ")}`, 400);
    }

    // Rough size check (base64 is ~33% larger than binary)
    const estimatedSizeMB = (imageBase64.length * 0.75) / (1024 * 1024);
    if (estimatedSizeMB > MAX_SIZE_MB) {
      return errorResponse(`Image too large. Maximum size is ${MAX_SIZE_MB}MB`, 413);
    }

    const result = await extractTextFromImage({
      imageBase64,
      mediaType,
      documentType,
      enhanceStructure,
    });

    return successResponse(result, "Text extracted successfully");
  } catch (err) {
    console.error("[AI OCR]", err);
    return errorResponse("OCR service unavailable", 503, err);
  }
}
