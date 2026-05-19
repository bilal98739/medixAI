import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { analyzeReport } from "@/services/ai/reportAnalyzer";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export const maxDuration = 60;
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const body = await request.json();
    const { reportText, reportType, patientAge, patientGender } = body;

    if (!reportText?.trim() || !reportType) {
      return errorResponse("reportText and reportType are required", 400);
    }

    const validTypes = ["blood_test", "xray", "mri", "prescription", "pathology", "general"];
    if (!validTypes.includes(reportType)) {
      return errorResponse(`reportType must be one of: ${validTypes.join(", ")}`, 400);
    }

    const result = await analyzeReport({ reportText, reportType, patientAge, patientGender });
    return successResponse(result, "Report analysis complete");
  } catch (err) {
    console.error("[AI Report]", err);
    return errorResponse("AI service unavailable", 503, err);
  }
}
