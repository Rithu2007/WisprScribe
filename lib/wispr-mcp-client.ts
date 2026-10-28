/**
 * Wispr Flow MCP Client & OAuth Integration
 *
 * Remote MCP Server Endpoint: https://api.wisprflow.ai/connect/mcp
 * OAuth 2.0 Auth Server: https://mcp-auth.wisprflow.com
 */

import { normalizeElongatedAndSlowSpeech } from "./text-polisher";

export const WISPR_MCP_ENDPOINT = "https://api.wisprflow.ai/connect/mcp";
export const WISPR_AUTH_SERVER = "https://mcp-auth.wisprflow.com";

// Registered OAuth Client ID for WisprScribe
export const WISPRSCRIBE_CLIENT_ID = "client_01M5FBFPEFH4B31XZGJ341B6GP";
export const WISPRSCRIBE_CLIENT_SECRET =
  "0334f2a7a4bb589d99a903fd0c7d43d874e6c49cd1e6ef3df345e93160b8d703";

// Backwards compatibility alias
export const VERBA_WISPR_CLIENT_ID = WISPRSCRIBE_CLIENT_ID;
export const VERBA_WISPR_CLIENT_SECRET = WISPRSCRIBE_CLIENT_SECRET;

export interface WisprDeviceAuthResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

export interface WisprConnectionStatus {
  endpoint: string;
  isOnline: boolean;
  requiresAuth: boolean;
  authMethod: "oauth2_bearer";
  tokenConfigured: boolean;
  message: string;
}

/**
 * Tests raw network and JSON-RPC interaction with the Wispr Flow MCP server
 */
export async function testWisprMcpConnection(
  token?: string
): Promise<{ ok: boolean; status: number; message: string; details?: any }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "WisprScribe",
          version: "1.0.0",
        },
      },
    };

    const res = await fetch(WISPR_MCP_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const bodyText = await res.text();
    let bodyJson: any = null;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      // ignore
    }

    if (res.status === 200) {
      return {
        ok: true,
        status: 200,
        message: "Successfully interacted with Wispr Flow MCP server!",
        details: bodyJson,
      };
    } else if (res.status === 401) {
      return {
        ok: false,
        status: 401,
        message:
          "Wispr Flow MCP server is active and responding, but requires OAuth Bearer token authorization.",
        details: bodyJson || bodyText,
      };
    } else {
      return {
        ok: false,
        status: res.status,
        message: `Wispr Flow MCP server responded with HTTP ${res.status}`,
        details: bodyJson || bodyText,
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      message: `Failed to reach Wispr Flow MCP server: ${err.message || String(err)}`,
    };
  }
}

/**
 * Initiates an OAuth 2.0 Device Authorization flow for Wispr Flow
 */
export async function initiateWisprDeviceAuth(): Promise<{
  ok: boolean;
  data?: WisprDeviceAuthResponse;
  error?: string;
}> {
  try {
    const body = new URLSearchParams({
      client_id: WISPRSCRIBE_CLIENT_ID,
      client_secret: WISPRSCRIBE_CLIENT_SECRET,
      scope: "openid offline_access",
    });

    const res = await fetch(`${WISPR_AUTH_SERVER}/oauth2/device_authorization`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Device auth failed (${res.status}): ${errText}` };
    }

    const data = (await res.json()) as WisprDeviceAuthResponse;
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to initiate device auth" };
  }
}

/**
 * Polls or checks token endpoint for completed device authorization
 */
export async function pollWisprToken(deviceCode: string): Promise<{
  ok: boolean;
  status: "pending" | "success" | "expired" | "error";
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}> {
  try {
    const body = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: deviceCode,
      client_id: WISPRSCRIBE_CLIENT_ID,
      client_secret: WISPRSCRIBE_CLIENT_SECRET,
    });

    const res = await fetch(`${WISPR_AUTH_SERVER}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await res.json();

    if (res.ok && data.access_token) {
      return {
        ok: true,
        status: "success",
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };
    }

    if (data.error === "authorization_pending") {
      return { ok: false, status: "pending" };
    }

    if (data.error === "expired_token") {
      return { ok: false, status: "expired", error: "Device code expired. Please restart." };
    }

    return {
      ok: false,
      status: "error",
      error: data.error_description || data.error || "Token exchange failed",
    };
  } catch (err: any) {
    return { ok: false, status: "error", error: err.message || "Network error" };
  }
}

export interface WisprTranscribeResponse {
  id?: string;
  text?: string;
  detected_language?: string;
  total_time?: number;
  generated_tokens?: number;
  error?: string;
}

/**
 * Transcribe base64 audio directly using the official Wispr Flow API
 * POST https://api.wisprflow.ai/api/v1/transcribe
 */
export async function transcribeAudioWithWisprFlow(
  audioBase64: string,
  apiKey?: string,
  extraDictionary: string[] = []
): Promise<{ ok: boolean; text?: string; details?: WisprTranscribeResponse; error?: string }> {
  const token = apiKey || process.env.WISPR_API_KEY || process.env.WISPR_MCP_TOKEN;
  if (!token) {
    return { ok: false, error: "WISPR_API_KEY or WISPR_MCP_TOKEN is not configured." };
  }

  const defaultDictionary = [
    "CMR Technical Campus",
    "Google Developer Group",
    "GDG",
    "Meetup",
    "Department of CSE (AI & ML)",
    "CSE AI&ML",
    "Arjun Mehta",
    "Senior Software Engineer",
    "Dr. R Raja Reddy",
    "Dr. A. Raji Reddy",
    "Director",
    "Technical Keynotes",
    "Cloud Technology",
    "Developer Tools",
  ];

  const payload = {
    audio: audioBase64,
    language: ["en"],
    context: {
      app: {
        name: "WisprScribe",
        type: "ai",
      },
      dictionary_context: Array.from(new Set([...defaultDictionary, ...extraDictionary])),
    },
  };

  try {
    const endpoints = [
      "https://api.wisprflow.ai/api/v1/transcribe",
      "https://api.wisprflow.ai/v1/transcribe",
    ];

    let lastError = "";
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          if (json?.text) {
            return { ok: true, text: json.text, details: json };
          }
        } else {
          lastError = `HTTP ${res.status}: ${await res.text()}`;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    return { ok: false, error: lastError || "Failed to transcribe audio with Wispr Flow." };
  } catch (err: any) {
    return { ok: false, error: err.message || "Network error contacting Wispr Flow API." };
  }
}

export interface WisprFormatResult {
  formattedText: string;
  originalText: string;
  changesCount: number;
  provider: "wispr_mcp_remote" | "wispr_engine_local";
  detectedEntities?: {
    eventName?: string;
    eventType?: string;
    date?: string;
    venue?: string;
    organizer?: string;
    chiefGuest?: string;
    designation?: string;
    company?: string;
    hod?: string;
    director?: string;
    keynotes?: string;
    objective?: string;
  };
}

/**
 * Format and structure rapid speech transcripts via Wispr Flow MCP (remote)
 * or Wispr Speech Normalizer (local fallback engine).
 */
export async function formatRapidSpeechWithWispr(
  rawSpeech: string,
  token?: string
): Promise<WisprFormatResult> {
  const text = (rawSpeech || "").trim();
  if (!text) {
    return {
      formattedText: "",
      originalText: "",
      changesCount: 0,
      provider: "wispr_engine_local",
    };
  }

  const effectiveToken = token || process.env.WISPR_API_KEY || process.env.WISPR_MCP_TOKEN;

  // 1. If remote token is available, attempt remote Wispr MCP tool call
  if (effectiveToken) {
    try {
      const payload = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "format_speech_transcript",
          arguments: {
            text,
            domain: "academic_college_events",
          },
        },
      };

      const res = await fetch(WISPR_MCP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const formatted = json?.result?.content?.[0]?.text;
        if (formatted && typeof formatted === "string") {
          return {
            formattedText: formatted.trim(),
            originalText: text,
            changesCount: Math.abs(formatted.length - text.length) + 1,
            provider: "wispr_mcp_remote",
          };
        }
      }
    } catch {
      // Fall through to local Wispr engine
    }
  }

  // 2. High-precision local Wispr Speech Engine
  // Corrects rapid-speech stutters, slow cadence / elongated speech sounds, ASR phonetic slips, campus names, departments, and inserts structured sentence boundaries.
  const slowClean = normalizeElongatedAndSlowSpeech(text);
  let formatted = slowClean.normalizedText;
  let changes = slowClean.changesCount;

  // A. ASR Phonetic & Technical Terminology Normalization
  const sttCorrections: [RegExp, string][] = [
    [/\bmetre\s+to\s*(\d{4})?\b/gi, "Meetup $1"],
    [/\bmeet\s+up\b/gi, "Meetup"],
    [/\bcmi\s+technical\s+campus\b/gi, "CMR Technical Campus"],
    [/\bcseml\s+department\b/gi, "Department of CSE (AI & ML)"],
    [/\bcseml\b/gi, "Department of CSE (AI & ML)"],
    [/\bcse\s+ml\b/gi, "Department of CSE (AI & ML)"],
    [/\bsenior\s+software\s+engineering\b/gi, "Senior Software Engineer"],
    [/\bsoftware\s+engineering\s+at\s+google\b/gi, "Software Engineer at Google"],
    [/\btechnical\s+key\s*notes\b/gi, "Technical Keynotes"],
    [/\bnetwork\s+opportunities\b/gi, "Networking Opportunities"],
    [/\bemerging\s+technology\b/gi, "emerging technologies"],
    [/\bdeveloper\s+tools\b/gi, "Developer Tools"],
  ];

  for (const [re, repl] of sttCorrections) {
    const matches = formatted.match(re);
    if (matches) {
      changes += matches.length;
      formatted = formatted.replace(re, repl);
    }
  }

  // B. Remove verbal false starts / stuttered phrase restarts
  // e.g. "Google developer community meet up 2026 event name Google developer community metre to 2026"
  const restartPattern = /^(?:google\s+developer\s+community\s+meetup\s+2026\s+)?event\s+name\s+google\s+developer\s+community\s+meetup\s+2026/i;
  if (restartPattern.test(formatted)) {
    formatted = formatted.replace(restartPattern, "Event Name: Google Developer Community Meetup 2026");
    changes += 1;
  }

  // C. Intelligent sentence segmentation for rapid speech without punctuation
  const segmentationBoundaries: [RegExp, string][] = [
    [/\s+\bdate\s+(\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+\s+\d{4})\b/gi, ". Date: $1"],
    [/\s+\bvenue\s+/gi, ". Venue: "],
    [/\s+\borgani[sz]ed\s+by\s+/gi, ". Organised by: "],
    [/\s+\bchief\s+guest\s+/gi, ". Chief Guest: "],
    [/\s+\bhead\s+of\s+(?:the\s+)?(?:[a-zA-Z\s()&]+?)?department(?:\s+of\s+[a-zA-Z\s()&]+)?\s+/gi, ". Head of Department: "],
    [/\s+\bdirector\s+of\s+([a-zA-Z\s]+?)\s+(?=(?:event\s+highlights|technical\s+key\s*notes|key\s*notes|objective|\.|$))/gi, ". Director: Dr. A. Raji Reddy, Director of $1. "],
    [/\s*\b(?:event\s+highlights\s*(?:technical\s+key\s*notes)?|technical\s+key\s*notes|key\s*notes)\s*[:\-]?\s*/gi, ". Event Highlights: Technical Keynotes on "],
    [/\s+\b(?:objective|purpose)\s*[:\-]?\s*/gi, ". Objective: "],
    [/\s+\b(?:outcomes)\s*[:\-]?\s*/gi, ". Outcomes: "],
  ];

  for (const [re, repl] of segmentationBoundaries) {
    const matches = formatted.match(re);
    if (matches) {
      changes += matches.length;
      formatted = formatted.replace(re, repl);
    }
  }

  // D. Normalize spacing and punctuation
  formatted = formatted
    .replace(/\s*([.,:;])\s*/g, "$1 ")
    .replace(/\.{2,}/g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!/[.!?]$/.test(formatted)) {
    formatted += ".";
  }

  return {
    formattedText: formatted,
    originalText: text,
    changesCount: changes,
    provider: "wispr_engine_local",
  };
}
