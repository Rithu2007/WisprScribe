import { NextRequest, NextResponse } from "next/server";
import {
  testWisprMcpConnection,
  initiateWisprDeviceAuth,
  pollWisprToken,
  formatRapidSpeechWithWispr,
  transcribeAudioWithWisprFlow,
  WISPR_MCP_ENDPOINT,
} from "@/lib/wispr-mcp-client";

export async function GET() {
  const result = await testWisprMcpConnection(process.env.WISPR_MCP_TOKEN);
  return NextResponse.json({
    endpoint: WISPR_MCP_ENDPOINT,
    active: true,
    protocol: "mcp/jsonrpc-2.0",
    connectionTest: result,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, deviceCode, token } = body;

    if (action === "start_auth") {
      const authInit = await initiateWisprDeviceAuth();
      if (!authInit.ok || !authInit.data) {
        return NextResponse.json(
          { ok: false, error: authInit.error || "Failed to start auth" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        verificationUrl: authInit.data.verification_uri_complete,
        userCode: authInit.data.user_code,
        deviceCode: authInit.data.device_code,
        expiresIn: authInit.data.expires_in,
      });
    }

    if (action === "check_auth") {
      if (!deviceCode) {
        return NextResponse.json(
          { ok: false, error: "deviceCode is required" },
          { status: 400 }
        );
      }
      const pollRes = await pollWisprToken(deviceCode);
      return NextResponse.json(pollRes);
    }

    if (action === "transcribe" || action === "transcribe_audio") {
      const audioBase64 = body.audio || "";
      if (!audioBase64) {
        return NextResponse.json(
          { ok: false, error: "Audio payload (base64) is required for transcription." },
          { status: 400 }
        );
      }
      const effectiveToken = token || process.env.WISPR_API_KEY || process.env.WISPR_MCP_TOKEN;
      const transcribeResult = await transcribeAudioWithWisprFlow(
        audioBase64,
        effectiveToken,
        body.dictionary || []
      );
      return NextResponse.json(transcribeResult);
    }

    if (action === "format" || action === "format_transcript") {
      const textToFormat = body.text || "";
      const effectiveToken = token || process.env.WISPR_MCP_TOKEN;
      const formattedResult = await formatRapidSpeechWithWispr(textToFormat, effectiveToken);
      return NextResponse.json({
        ok: true,
        ...formattedResult,
      });
    }

    if (action === "test_mcp") {
      const effectiveToken = token || process.env.WISPR_MCP_TOKEN;
      const testRes = await testWisprMcpConnection(effectiveToken);
      return NextResponse.json(testRes);
    }

    return NextResponse.json(
      { ok: false, error: "Unknown action. Supported: start_auth, check_auth, test_mcp" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
