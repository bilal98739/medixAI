import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { checkSymptoms } from "@/services/ai/symptomChecker";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { symptoms, age, gender, duration, severity, medicalHistory, currentMedications } = body;

    if (!symptoms?.length || !age || !gender) {
      return errorResponse("symptoms, age, and gender are required", 400);
    }

    const result = await checkSymptoms({
      symptoms, age, gender, duration, severity, medicalHistory, currentMedications,
    });

    return successResponse(result, "Symptom analysis complete");
  } catch (err) {
    console.error("[AI Symptoms]", err);
    return errorResponse("AI service unavailable", 503, err);
  }
}
