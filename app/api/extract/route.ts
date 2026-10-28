import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tryExtractWithGemini } from "@/lib/gemini-extractor";
import { extractFactsDeterministically } from "@/lib/deterministic-fallback";
import { formatRapidSpeechWithWispr } from "@/lib/wispr-mcp-client";
import { ExtractApiResponseSchema } from "@/lib/extraction-schema";

const RequestBodySchema = z.object({
  transcript: z.string().trim().min(1, "Add a short event recap before extracting facts."),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const parseResult = RequestBodySchema.safeParse(rawBody);
    if (!parseResult.success) {
      const message =
        parseResult.error.issues?.[0]?.message ||
        "Add a short event recap before extracting facts.";
      return NextResponse.json(
        { ok: false, error: message },
        { status: 400 }
      );
    }

    const { transcript } = parseResult.data;

    if (transcript.length > 4000) {
      return NextResponse.json(
        {
          ok: false,
          error: "Event recap exceeds the maximum supported length (4,000 characters). Please provide a concise recap.",
        },
        { status: 400 }
      );
    }

    // Format and structure rapid speech via Wispr backend engine before extraction
    const wisprFormatted = await formatRapidSpeechWithWispr(transcript);
    const preparedTranscript = wisprFormatted.formattedText || transcript;

    // Try Gemini if configured; fallback deterministically if not configured or failed
    let extractionResult = await tryExtractWithGemini(preparedTranscript);

    if (!extractionResult) {
      extractionResult = extractFactsDeterministically(preparedTranscript);
    }

    // Runtime validate the outgoing payload
    const validatedOutput = ExtractApiResponseSchema.parse(extractionResult);

    return NextResponse.json(validatedOutput, { status: 200 });
  } catch (err) {
    console.error("[WisprScribe] Unhandled extraction endpoint error:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "The extraction service encountered an unexpected error. Please try again or use the sample preset.",
      },
      { status: 500 }
    );
  }
}
