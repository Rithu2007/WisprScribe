import { FactMap, FactSchema, ExtractApiResponse } from "./extraction-schema";

const GEMINI_SYSTEM_INSTRUCTION = `
You are the strict, zero-invention fact extractor for WisprScribe, an application that prepares college paperwork from spoken event recaps.

CRITICAL TRUST RULES:
1. Extract ONLY facts explicitly stated in the transcript.
2. If a fact is missing, return value: null, status: "needs_confirmation", sourceText: null, and a clear reason explaining it was not mentioned.
3. NEVER infer a calendar date from a weekday (e.g. if the user says "Saturday", value must be "Saturday", status: "needs_confirmation", and reason explaining that the absolute calendar date DD/MM/YYYY is unknown).
4. NEVER infer a speaker's designation or department from their name (e.g. "Professor Mehta" -> speaker: "Professor Mehta", speakerDesignation: null with status "needs_confirmation").
5. NEVER infer the host college department from the organizing club (e.g. "Coding Club" -> organizer: "Coding Club", department: null with status "needs_confirmation").
6. NEVER infer outcomes from the event title.
7. NEVER invent participant attendance numbers or room numbers.
8. Status must be "confirmed" ONLY if explicitly stated and unambiguous. Otherwise "needs_confirmation".
9. Return a JSON object matching this schema exactly:
{
  "collegeName": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "eventName": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "eventType": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "date": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "time": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "venue": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "organizer": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "coordinator": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "speaker": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "speakerDesignation": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "speakerOrganization": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "hod": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "director": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "keynotes": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "department": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "attendance": { "value": number | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "purpose": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "outcomes": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null },
  "followUp": { "value": string | null, "status": "confirmed" | "needs_confirmation", "sourceText": string | null, "reason": string | null }
}
`;

/**
 * Server-side optional Gemini extraction adapter.
 * Runs only on the server, reads GEMINI_API_KEY from environment.
 * If key is absent, returns null immediately to trigger deterministic fallback.
 */
export async function tryExtractWithGemini(
  transcript: string
): Promise<ExtractApiResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Extract structured facts from this event recap:\n\n"""\n${transcript}\n"""`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(
        `[WisprScribe] Gemini API responded with status ${response.status}. Falling back to deterministic extractor.`
      );
      return null;
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return null;
    }

    const parsedJson = JSON.parse(rawText);
    const validatedFacts = FactSchema.parse(parsedJson);

    const warnings: string[] = [];
    Object.entries(validatedFacts).forEach(([key, field]) => {
      if (field.status === "needs_confirmation" || field.value === null) {
        warnings.push(`Field '${key}' requires human confirmation.`);
      }
    });

    return {
      ok: true,
      facts: validatedFacts,
      warnings,
      extractorUsed: "gemini_live",
      notice: "Extracted via Google Gemini structured parser with zero-invention validation.",
    };
  } catch (error) {
    console.warn(
      "[WisprScribe] Error during Gemini extraction, falling back to deterministic extractor:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
}
