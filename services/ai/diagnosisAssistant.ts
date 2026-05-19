/**
 * AI Diagnosis Assistant Service
 * Doctor-facing tool that provides clinical decision support,
 * differential diagnosis suggestions, and treatment considerations.
 * This is a tool FOR doctors, not a replacement for clinical judgment.
 */

import { callAnthropic, parseJSON } from "./client";

export interface DiagnosisInput {
  symptoms: string[];
  patientAge: number;
  patientGender: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
  labResults?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  chiefComplaint: string;
  clinicalNotes?: string;
}

export interface DifferentialDiagnosis {
  condition: string;
  icdCode?: string;
  likelihood: "low" | "moderate" | "high";
  supportingEvidence: string[];
  againstEvidence: string[];
  suggestedTests: string[];
}

export interface TreatmentConsideration {
  approach: string;
  rationale: string;
  contraindications?: string[];
  monitoring?: string[];
}

export interface DiagnosisAssistantResult {
  clinicalSummary: string;
  differentialDiagnoses: DifferentialDiagnosis[];
  recommendedWorkup: string[];
  treatmentConsiderations: TreatmentConsideration[];
  redFlags: string[];
  referralSuggested: boolean;
  referralSpecialty?: string;
  referralReason?: string;
  disclaimer: string;
}

const SYSTEM_PROMPT = `You are an AI clinical decision support assistant integrated into the MedixAI hospital management system.
You assist licensed physicians by providing differential diagnosis suggestions and clinical decision support.

IMPORTANT CONTEXT:
- This tool is used BY doctors, not patients
- Your output supports — never replaces — physician clinical judgment
- Use evidence-based medicine and clinical guidelines (e.g. UpToDate, WHO, NICE)
- Be precise and use correct medical terminology
- Flag drug interactions, contraindications, and red flags prominently

Return ONLY valid JSON with no markdown, no preamble:
{
  "clinicalSummary": "string (concise clinical picture summary)",
  "differentialDiagnoses": [
    {
      "condition": "string (full condition name)",
      "icdCode": "string (ICD-10 code if known, else null)",
      "likelihood": "low" | "moderate" | "high",
      "supportingEvidence": ["string array from the provided clinical data"],
      "againstEvidence": ["string array of findings that argue against this diagnosis"],
      "suggestedTests": ["string array of confirmatory tests/investigations"]
    }
  ],
  "recommendedWorkup": ["string array of investigations to order"],
  "treatmentConsiderations": [
    {
      "approach": "string (treatment option)",
      "rationale": "string (clinical reasoning)",
      "contraindications": ["string array or empty"],
      "monitoring": ["string array of what to monitor"]
    }
  ],
  "redFlags": ["string array of warning signs requiring immediate attention"],
  "referralSuggested": boolean,
  "referralSpecialty": "string or null",
  "referralReason": "string or null",
  "disclaimer": "This AI-generated clinical decision support is for informational purposes only. Final clinical decisions rest solely with the treating physician."
}`;

export async function generateDiagnosisSuggestion(
  input: DiagnosisInput
): Promise<DiagnosisAssistantResult> {
  const vitalsStr = input.vitals
    ? Object.entries(input.vitals)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n")
    : "Not provided";

  const userMessage = `
PATIENT PRESENTATION:

Chief Complaint: ${input.chiefComplaint}
Age: ${input.patientAge} | Gender: ${input.patientGender}

Symptoms: ${input.symptoms.join(", ")}

Vitals:
${vitalsStr}

Medical History: ${input.medicalHistory?.join(", ") || "None reported"}
Current Medications: ${input.currentMedications?.join(", ") || "None"}
Allergies: ${input.allergies?.join(", ") || "NKDA"}

Lab/Imaging Results:
${input.labResults || "Pending"}

Clinical Notes:
${input.clinicalNotes || "None"}

Please provide differential diagnosis and clinical decision support.
`.trim();

  const { text } = await callAnthropic({
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    maxTokens: 2000,
  });

  return parseJSON<DiagnosisAssistantResult>(text);
}
