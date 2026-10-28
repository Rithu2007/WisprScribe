import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { polishTranscript } from "@/lib/text-polisher";

const PolishRequestSchema = z.object({
  text: z.string().trim().min(1, "Please provide text to polish."),
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

    const parseResult = PolishRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues?.[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { text } = parseResult.data;
    const result = await polishTranscript(text);

    return NextResponse.json({
      ok: true,
      polishedText: result.polishedText,
      changesCount: result.changesCount,
      provider: result.provider,
    });
  } catch (err: any) {
    console.error("[WisprScribe] Polish endpoint error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to polish text. Please try again." },
      { status: 500 }
    );
  }
}
