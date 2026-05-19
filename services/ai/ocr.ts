/**
 * OCR Service — Medical Document Text Extraction
 * Uses Google Gemini's vision capability to extract text from medical document images
 * (lab reports, prescriptions, handwritten notes, medical forms).
 */

import { parseJSON } from "./client";

const GEMINI_VISION_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export type OCRDocumentType =
  | "prescription"
  | "lab_report"
  | "medical_form"
  | "discharge_summary"
  | "handwritten_notes"
  | "insurance_card"
  | "general";

export interface OCRInput {
  imageBase64: string;       // base64-encoded image data
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  documentType?: OCRDocumentType;
  enhanceStructure?: boolean; // if true, returns structured key-value pairs
}

export interface OCRResult {
  extractedText: string;
  structuredData?: Record<string, string>;
  confidence: "high" | "medium" | "low";
  documentTypeDetected: string;
  warnings: string[];
}

const SYSTEM_PROMPTS: Record<string, string> = {
  prescription: `You are a medical OCR specialist. Extract ALL text from this prescription image.
Identify: doctor name, patient name, medications (name, dosage, frequency, duration), date, and any other details.
Return ONLY valid JSON with no extra text: { "extractedText": "full text", "structuredData": { "doctorName": "", "patientName": "", "date": "", "medications": [] }, "confidence": "high|medium|low", "documentTypeDetected": "", "warnings": [] }`,

  lab_report: `You are a medical OCR specialist. Extract ALL text from this lab report image.
Identify: patient info, test names, values, units, reference ranges, lab name, date, ordering physician.
Return ONLY valid JSON with no extra text: { "extractedText": "full text", "structuredData": { "patientName": "", "date": "", "labName": "", "tests": [] }, "confidence": "high|medium|low", "documentTypeDetected": "", "warnings": [] }`,

  general: `You are a medical OCR specialist. Extract ALL visible text from this medical document image.
Preserve the structure and layout as much as possible. If the image is blurry or text is unclear, note it in warnings.
Return ONLY valid JSON with no extra text: { "extractedText": "complete extracted text with preserved structure", "structuredData": { "key fields you identified": "values" }, "confidence": "high|medium|low", "documentTypeDetected": "describe the document type", "warnings": ["any issues with extraction"] }`,
};

export async function extractTextFromImage(input: OCRInput): Promise<OCRResult> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    throw new Error(
      "No AI API key found. Please set GROQ_API_KEY or GEMINI_API_KEY in .env.local"
    );
  }

  const docType = input.documentType ?? "general";
  const systemPrompt = SYSTEM_PROMPTS[docType] ?? SYSTEM_PROMPTS.general;

  if (groqKey) {
    return extractTextGroq(input, systemPrompt, groqKey);
  } else {
    return extractTextGemini(input, systemPrompt, geminiKey!);
  }
}

async function extractTextGroq(input: OCRInput, systemPrompt: string, apiKey: string): Promise<OCRResult> {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: systemPrompt + "\n\nPlease extract all text from this medical document and return the JSON response as instructed."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${input.mediaType};base64,${input.imageBase64}`
              }
            }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Groq OCR error ${response.status}: ${error?.error?.message ?? response.statusText}`
    );
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  try {
    return parseJSON<OCRResult>(raw);
  } catch {
    return {
      extractedText: raw,
      confidence: "low",
      documentTypeDetected: "unknown",
      warnings: ["Could not parse structured response; returning raw extracted text."],
    };
  }
}

async function extractTextGemini(input: OCRInput, systemPrompt: string, apiKey: string): Promise<OCRResult> {
  const url = `${GEMINI_VISION_URL}?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: input.mediaType,
                data: input.imageBase64,
              },
            },
            {
              text: "Please extract all text from this medical document and return the JSON response as instructed.",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini OCR error ${response.status}: ${error?.error?.message ?? response.statusText}`
    );
  }

  const data = await response.json();
  const raw =
    data.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "{}";

  try {
    return parseJSON<OCRResult>(raw);
  } catch {
    // Fallback: return raw text if JSON parse fails
    return {
      extractedText: raw,
      confidence: "low",
      documentTypeDetected: "unknown",
      warnings: ["Could not parse structured response; returning raw extracted text."],
    };
  }
}

/**
 * Convert a File object to base64 for OCR input.
 * Use this in the browser before sending to the API.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix: "data:image/jpeg;base64,..."
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
