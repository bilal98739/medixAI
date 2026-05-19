import { NextRequest } from "next/server";
import { requireRole } from "@/middleware/auth";
import { generateDiagnosisSuggestion } from "@/services/ai/diagnosisAssistant";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Role-based access control — doctors and admins only
    const { error } = await requireRole(request, "doctor", "admin");
    if (error) return error;

    // 📥 Parse request body
    const body = await request.json();

    // Support BOTH structured fields AND freeform caseDescription
    let symptoms: string[] = body.symptoms ?? [];
    let patientAge: number = body.patientAge ?? 0;
    let patientGender: string = body.patientGender ?? "";
    let chiefComplaint: string = body.chiefComplaint ?? "";

    // If a freeform caseDescription is provided, use it as the chief complaint
    // and extract what we can
    if (body.caseDescription && !chiefComplaint) {
      chiefComplaint = body.caseDescription;
    }

    // If symptoms are empty but we have a case description, create a synthetic symptom
    if (symptoms.length === 0 && chiefComplaint) {
      symptoms = [chiefComplaint.slice(0, 200)];
    }

    // Provide sensible defaults for missing demographics
    if (!patientAge) patientAge = 30;
    if (!patientGender) patientGender = "not specified";

    // Final validation
    if (!chiefComplaint.trim()) {
      return errorResponse(
        "A case description or chiefComplaint is required.",
        400
      );
    }

    console.log("[AI Diagnosis Request]:", {
      symptoms,
      patientAge,
      patientGender,
      chiefComplaint: chiefComplaint.slice(0, 100) + "...",
    });

    // AI Processing
    const result = await generateDiagnosisSuggestion({
      symptoms,
      patientAge,
      patientGender,
      chiefComplaint,
      vitals: body.vitals,
      labResults: body.labResults,
      medicalHistory: body.medicalHistory,
      currentMedications: body.currentMedications,
      allergies: body.allergies,
      clinicalNotes: body.clinicalNotes,
    });

    // ✅ Success response
    return successResponse(result, "Diagnosis suggestions generated successfully");
  } catch (err) {
    console.error("[AI Diagnosis Error]:", err);

    return errorResponse(
      "AI service unavailable. Please try again later.",
      503,
      err
    );
  }
}