/**
 * AI Symptom Checker Service
 * Analyzes patient-reported symptoms and suggests possible conditions,
 * urgency level, and recommended specialty — powered by Claude.
 */

import { callAnthropic, parseJSON } from "./client";

export interface SymptomCheckerInput {
  symptoms: string[];
  age: number;
  gender: string;
  duration?: string;          // e.g. "3 days", "2 weeks"
  severity?: "mild" | "moderate" | "severe";
  medicalHistory?: string[];
  currentMedications?: string[];
}

export interface PossibleCondition {
  name: string;
  probability: "low" | "moderate" | "high";
  severity: "low" | "medium" | "high";
  description: string;
  recommendation: string;
}

export interface SymptomCheckerResult {
  possibleConditions: PossibleCondition[];
  urgency: "routine" | "urgent" | "emergency";
  urgencyReason: string;
  suggestedSpecialty: string;
  generalAdvice: string;
  disclaimer: string;
  redFlags: string[];
}

const SYSTEM_PROMPT = `You are a medical AI assistant helping patients understand their symptoms. 
Analyze the provided symptoms and return a structured JSON response.

CRITICAL RULES:
- You CANNOT diagnose. You can only suggest possibilities for the patient to discuss with a doctor.
- Always include the disclaimer that this is not a medical diagnosis.
- Flag true emergencies (chest pain, stroke signs, severe bleeding, etc.) as "emergency" urgency.
- Be conservative: when in doubt, escalate urgency.
- Base probability only on symptom patterns, not certainty.
- Return ONLY valid JSON, no markdown fences, no extra text.

Return this exact JSON structure:
{
  "possibleConditions": [
    {
      "name": "string",
      "probability": "low" | "moderate" | "high",
      "severity": "low" | "medium" | "high",
      "description": "string (1-2 sentences)",
      "recommendation": "string (what to do)"
    }
  ],
  "urgency": "routine" | "urgent" | "emergency",
  "urgencyReason": "string (why this urgency level)",
  "suggestedSpecialty": "string (e.g. General Physician, Cardiologist)",
  "generalAdvice": "string (2-3 actionable sentences)",
  "redFlags": ["string array of warning signs to watch for"],
  "disclaimer": "This analysis is for informational purposes only and does not constitute medical advice or diagnosis. Please consult a qualified healthcare professional."
}`;

export async function checkSymptoms(
  input: SymptomCheckerInput
): Promise<SymptomCheckerResult> {
  const userMessage = `
Patient Information:
- Age: ${input.age} years old
- Gender: ${input.gender}
- Symptoms: ${input.symptoms.join(", ")}
- Duration: ${input.duration ?? "not specified"}
- Severity: ${input.severity ?? "not specified"}
- Medical history: ${input.medicalHistory?.length ? input.medicalHistory.join(", ") : "none reported"}
- Current medications: ${input.currentMedications?.length ? input.currentMedications.join(", ") : "none reported"}

Please analyze these symptoms and return the JSON response.
`.trim();

  const { text } = await callAnthropic({
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    maxTokens: 1200,
  });

  return parseJSON<SymptomCheckerResult>(text);
}
