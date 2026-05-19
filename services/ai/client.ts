/**
 * AI API client — shared across all AI services.
 * Powered by Google Gemini 2.0 Flash (free tier).
 *
 * All AI services call `callAnthropic()` (name kept for backward compat).
 * Internally routes through the Gemini REST API.
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AnthropicRequestOptions {
  system?: string;
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
}

export interface AnthropicResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Core function to call the Gemini API.
 * All AI services route through this.
 */
export async function callAnthropic(
  options: AnthropicRequestOptions,
  retries = 3,
  timeoutMs = 45000
): Promise<AnthropicResponse> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    throw new Error(
      "No AI API key found. Please set GROQ_API_KEY or GEMINI_API_KEY in .env.local"
    );
  }

  if (groqKey) {
    return callGroq(options, groqKey, retries, timeoutMs);
  } else {
    return callGemini(options, geminiKey!, retries, timeoutMs);
  }
}

async function callGroq(
  options: AnthropicRequestOptions,
  apiKey: string,
  retries: number,
  timeoutMs: number
): Promise<AnthropicResponse> {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const messages: any[] = [];
  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  
  for (const msg of options.messages) {
    // Groq accepts "user", "assistant", "system"
    messages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    });
  }

  const requestBody = {
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.7,
  };

  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage =
          error?.error?.message ?? response.statusText ?? "Unknown error";
        
        const err = new Error(`Groq API error ${response.status}: ${errorMessage}`);
        (err as any).status = response.status;
        throw err;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "";

      return {
        text,
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      const isAbortError = error.name === "AbortError";
      const isServerError = error.status && error.status >= 500;
      const isRateLimit = error.status === 429;

      if (!isAbortError && !isServerError && !isRateLimit && error.status) {
        break;
      }

      if (attempt < retries) {
        const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[AI Client] Groq attempt ${attempt} failed, retrying in ${Math.round(delayMs)}ms...`, error.message);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error("[AI Client] All Groq retries failed:", lastError);
  if ((lastError as Error).name === "AbortError") {
    throw new Error(`AI service timed out after ${timeoutMs}ms.`);
  }
  throw lastError;
}

async function callGemini(
  options: AnthropicRequestOptions,
  apiKey: string,
  retries: number,
  timeoutMs: number
): Promise<AnthropicResponse> {
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  for (const msg of options.messages) {
    const geminiRole = msg.role === "assistant" ? "model" : "user";
    contents.push({
      role: geminiRole,
      parts: [{ text: msg.content }],
    });
  }

  if (contents.length > 0 && contents[0].role === "model") {
    contents.unshift({
      role: "user",
      parts: [{ text: "Hello" }],
    });
  }

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
    },
  };

  if (options.system) {
    requestBody.systemInstruction = {
      parts: [{ text: options.system }],
    };
  }

  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage =
          error?.error?.message ?? response.statusText ?? "Unknown error";
        
        const err = new Error(`Gemini API error ${response.status}: ${errorMessage}`);
        (err as any).status = response.status;
        throw err;
      }

      const data = await response.json();

      const text =
        data.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("") ?? "";

      return {
        text,
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      const isAbortError = error.name === "AbortError";
      const isServerError = error.status && error.status >= 500;
      const isRateLimit = error.status === 429;

      if (!isAbortError && !isServerError && !isRateLimit && error.status) {
        break;
      }

      if (attempt < retries) {
        const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[AI Client] Gemini attempt ${attempt} failed, retrying in ${Math.round(delayMs)}ms...`, error.message);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error("[AI Client] All Gemini retries failed:", lastError);
  if ((lastError as Error).name === "AbortError") {
    throw new Error(`AI service timed out after ${timeoutMs}ms.`);
  }
  throw lastError;
}

/**
 * Parse a JSON response from the AI safely.
 * Strips accidental markdown fences, leading/trailing whitespace, etc.
 */
export function parseJSON<T>(raw: string): T {
  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = raw.trim();

  // Remove opening fence: ```json or ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
  // Remove closing fence
  cleaned = cleaned.replace(/\n?\s*```\s*$/i, "");
  cleaned = cleaned.trim();

  // Some models prefix with text before JSON — try to find the JSON object/array
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const jsonStart = cleaned.search(/[\[{]/);
    if (jsonStart !== -1) {
      cleaned = cleaned.slice(jsonStart);
    }
  }

  // Trim trailing text after the JSON closes
  if (cleaned.startsWith("{")) {
    let depth = 0;
    let end = 0;
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === "{") depth++;
      if (cleaned[i] === "}") depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
    if (end > 0) cleaned = cleaned.slice(0, end);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error("Failed to parse AI JSON response:", cleaned.slice(0, 500));
    throw e;
  }
}
