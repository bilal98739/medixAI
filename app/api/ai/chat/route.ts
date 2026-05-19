import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { getChatbotResponse } from "@/services/ai/chatbot";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { message, history = [], patientContext } = body;

    if (!message?.trim()) {
      return errorResponse("Message is required", 400);
    }

    const result = await getChatbotResponse({ message, history, patientContext });
    return successResponse(result, "Response generated");
  } catch (err) {
    console.error("[AI Chatbot]", err);
    return errorResponse("AI service unavailable", 503, err);
  }
}
