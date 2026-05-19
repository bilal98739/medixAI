/**
 * AI Report Analyzer Service
 * Analyzes medical reports (blood tests, MRI, X-ray, prescriptions, etc.)
 * and provides plain-language summaries and key findings.
 */

import { callAnthropic, parseJSON } from "./client";

export interface ReportAnalysisInput {
  reportText: string;
  reportType: "blood_test" | "xray" | "mri" | "prescription" | "pathology" | "general";
  patientAge?: number;
  patientGender?: string;
}

export interface ReportValue {
  parameter: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: "normal" | "low" | "high" | "critical" | "unknown";
  interpretation: string;
}

export interface ReportAnalysisResult {
  summary: string;
  reportType: string;
  keyFindings: string[];
  values: ReportValue[];
  abnormalValues: ReportValue[];
  recommendations: string[];
  followUpRequired: boolean;
  followUpReason?: string;
  urgency: "routine" | "soon" | "urgent";
  disclaimer: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  blood_test: `You are a medical AI specializing in interpreting blood test results for patients.
Analyze the provided blood test report and explain findings in plain, understandable language.
Identify abnormal values, explain their significance, and suggest appropriate follow-up.`,

  xray: `You are a medical AI helping patients understand X-ray reports written by radiologists.
Translate technical radiology language into plain English.
Highlight key findings and explain what they might mean for the patient's health.`,

  mri: `You are a medical AI helping patients understand MRI reports.
Explain findings in clear, non-technical language.
Focus on what the findings mean clinically and what steps might follow.`,

  prescription: `You are a medical AI helping patients understand their prescriptions.
Explain each medication: what it's for, how to take it, common side effects, and important warnings.
Flag any potential interactions if multiple medications are listed.`,

  pathology: `You are a medical AI helping patients understand pathology/biopsy reports.
Explain technical findings in compassionate, clear language.
Be careful and sensitive — pathology results can be very concerning for patients.`,

  general: `You are a medical AI helping patients understand their medical reports.
Analyze the provided report, identify key findings, and explain them in plain language.`,
};

const JSON_FORMAT = `
Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "summary": "string (2-3 sentence plain English summary of the overall report)",
  "reportType": "string (describe what kind of report this is)",
  "keyFindings": ["string array of the most important findings"],
  "values": [
    {
      "parameter": "string",
      "value": "string",
      "unit": "string or null",
      "referenceRange": "string or null",
      "status": "normal" | "low" | "high" | "critical" | "unknown",
      "interpretation": "string (plain English explanation)"
    }
  ],
  "abnormalValues": [/* same structure, only abnormal ones */],
  "recommendations": ["string array of actionable recommendations"],
  "followUpRequired": boolean,
  "followUpReason": "string or null",
  "urgency": "routine" | "soon" | "urgent",
  "disclaimer": "This analysis is AI-generated for informational purposes only. Always consult your doctor to interpret your medical results."
}`;

export async function analyzeReport(
  input: ReportAnalysisInput
): Promise<ReportAnalysisResult> {
  const baseSystem = SYSTEM_PROMPTS[input.reportType] ?? SYSTEM_PROMPTS.general;
  const system = baseSystem + "\n\n" + JSON_FORMAT;

  const userMessage = `
${input.patientAge ? `Patient Age: ${input.patientAge}` : ""}
${input.patientGender ? `Patient Gender: ${input.patientGender}` : ""}

Medical Report:
---
${input.reportText}
---

Please analyze this report and return the JSON response.
`.trim();

  const { text } = await callAnthropic({
    system,
    messages: [{ role: "user", content: userMessage }],
    maxTokens: 1500,
  });

  return parseJSON<ReportAnalysisResult>(text);
}
