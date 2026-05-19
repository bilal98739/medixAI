/**
 * MedixAI — AI Service Layer
 *
 * All AI features powered by Anthropic Claude (claude-sonnet-4-20250514).
 *
 * Services:
 *   chatbot            — Patient-facing healthcare assistant (multi-turn)
 *   symptomChecker     — Patient symptom triage + specialty routing
 *   reportAnalyzer     — Medical report plain-language interpretation
 *   diagnosisAssistant — Doctor-facing clinical decision support
 *   ocr                — Medical document text extraction (vision)
 */

export { getChatbotResponse } from "./chatbot";
export type { ChatbotRequest, ChatbotResponse, ChatMessage } from "./chatbot";

export { checkSymptoms } from "./symptomChecker";
export type { SymptomCheckerInput, SymptomCheckerResult, PossibleCondition } from "./symptomChecker";

export { analyzeReport } from "./reportAnalyzer";
export type { ReportAnalysisInput, ReportAnalysisResult, ReportValue } from "./reportAnalyzer";

export { generateDiagnosisSuggestion } from "./diagnosisAssistant";
export type {
  DiagnosisInput,
  DiagnosisAssistantResult,
  DifferentialDiagnosis,
  TreatmentConsideration,
} from "./diagnosisAssistant";

export { extractTextFromImage, fileToBase64 } from "./ocr";
export type { OCRInput, OCRResult, OCRDocumentType } from "./ocr";
