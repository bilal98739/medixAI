/**
 * AI Chatbot Service
 * Patient-facing healthcare assistant powered by Claude.
 * Handles multi-turn conversations with full medical context awareness.
 */

import { callAnthropic, Message } from "./client";

const SYSTEM_PROMPT = `You are MedixAI Assistant, a compassionate and knowledgeable healthcare support chatbot for the MedixAI hospital management platform.

Your role:
- Help patients understand their health concerns and guide them to the right care
- Answer questions about appointments, medications, symptoms, and general health
- Provide clear, empathetic, accurate medical information in plain language
- Always recommend consulting a doctor for diagnosis and treatment decisions
- Help patients navigate the MedixAI platform (booking appointments, finding doctors, etc.)

Tone: Warm, professional, reassuring. Never alarming. Never dismissive.

Critical rules:
- NEVER diagnose a specific condition — suggest possibilities and always defer to a doctor
- NEVER recommend specific prescription medications or dosages
- For emergencies (chest pain, difficulty breathing, stroke symptoms, etc.), immediately tell the patient to call emergency services (911 / 115)
- Keep responses concise and clear — avoid overwhelming medical jargon
- If you don't know something, say so honestly and suggest the patient speak with their doctor

You have context about the MedixAI platform:
- Patients can book appointments at /doctors
- Appointment history is at /appointments
- Profile management is at /profile`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatbotRequest {
  message: string;
  history: ChatMessage[];
  patientContext?: {
    name?: string;
    age?: number;
    gender?: string;
    medicalHistory?: string[];
    allergies?: string[];
  };
}

export interface ChatbotResponse {
  reply: string;
  suggestedActions?: string[];
  isEmergency: boolean;
}

const EMERGENCY_KEYWORDS = [
  "chest pain", "can't breathe", "cannot breathe", "difficulty breathing",
  "stroke", "heart attack", "unconscious", "bleeding heavily", "overdose",
  "suicidal", "suicide", "severe allergic", "anaphylaxis",
];

function detectEmergency(message: string): boolean {
  const lower = message.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

function buildSystemWithContext(patientContext?: ChatbotRequest["patientContext"]): string {
  if (!patientContext?.name) return SYSTEM_PROMPT;
  const ctx = [
    `\n\nPatient context:`,
    patientContext.name ? `- Name: ${patientContext.name}` : null,
    patientContext.age ? `- Age: ${patientContext.age}` : null,
    patientContext.gender ? `- Gender: ${patientContext.gender}` : null,
    patientContext.medicalHistory?.length
      ? `- Medical history: ${patientContext.medicalHistory.join(", ")}`
      : null,
    patientContext.allergies?.length
      ? `- Known allergies: ${patientContext.allergies.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
  return SYSTEM_PROMPT + ctx;
}

export async function getChatbotResponse(
  request: ChatbotRequest
): Promise<ChatbotResponse> {
  const isEmergency = detectEmergency(request.message);

  if (isEmergency) {
    return {
      reply:
        "🚨 **This sounds like a medical emergency.** Please call emergency services immediately (911 in the US, or your local emergency number). Do not wait — go to the nearest emergency room or call an ambulance right away. Your safety is the top priority.",
      suggestedActions: ["Call 911", "Go to nearest ER"],
      isEmergency: true,
    };
  }

  // Build conversation history for Claude (last 10 messages for context window efficiency)
  const recentHistory = request.history.slice(-10);
  const messages: Message[] = [
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: request.message },
  ];

  const { text } = await callAnthropic({
    system: buildSystemWithContext(request.patientContext),
    messages,
    maxTokens: 600,
  });

  // Extract suggested actions if Claude included them
  const suggestedActions: string[] = [];
  if (text.toLowerCase().includes("book an appointment")) {
    suggestedActions.push("Book Appointment");
  }
  if (text.toLowerCase().includes("find a doctor") || text.toLowerCase().includes("specialist")) {
    suggestedActions.push("Find Doctors");
  }

  return { reply: text, suggestedActions, isEmergency: false };
}
