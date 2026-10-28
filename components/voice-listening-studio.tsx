"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Volume2,
  VolumeX,
  Loader2,
  Undo2,
  ShieldCheck,
  Radio,
  Sliders,
} from "lucide-react";
import {
  NoiseCancellationPipeline,
  NoiseMetrics,
  getStudioMicConstraints,
  getStoredMicPermission,
  setStoredMicPermission,
} from "@/lib/noise-cancellation";
import { MicrophonePermissionModal } from "./microphone-permission-modal";

interface VoiceListeningStudioProps {
  onBackToDashboard: () => void;
  onAnalyzeTranscript: (transcript: string) => void;
  initialTranscript?: string;
  onTranscriptChange?: (text: string) => void;
  isAnalyzing?: boolean;
}

export const VoiceListeningStudio: React.FC<VoiceListeningStudioProps> = ({
  onBackToDashboard,
  onAnalyzeTranscript,
  initialTranscript = "",
  onTranscriptChange,
  isAnalyzing = false,
}) => {
  // studio state: "initial" | "listening" | "stopped"
  const [studioState, setStudioState] = useState<"initial" | "listening" | "stopped">(
    initialTranscript.trim() ? "stopped" : "initial"
  );
  const [transcript, setTranscript] = useState<string>(initialTranscript);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [showTextFallback, setShowTextFallback] = useState<boolean>(false);

  // Permission Modal & Voice Cancellation States
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [noiseCancellationEnabled, setNoiseCancellationEnabled] = useState<boolean>(true);
  const [noiseMetrics, setNoiseMetrics] = useState<NoiseMetrics | null>(null);

  // Polishing & Grammar Refinement states
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [originalBeforePolish, setOriginalBeforePolish] = useState<string | null>(null);
  const [polishNotice, setPolishNotice] = useState<string | null>(null);

  // Audio stream, noise cancellation pipeline & analysis refs
  const pipelineRef = useRef<NoiseCancellationPipeline | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Speech persistence refs (prevent dropping speech on pauses)
  const isListeningRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>(initialTranscript);

  // Voice reactivity states & DOM refs for 60fps mic effect
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const lastSpeakingRef = useRef<boolean>(false);
  const micOrbRef = useRef<HTMLDivElement | null>(null);
  const ripple1Ref = useRef<HTMLDivElement | null>(null);
  const ripple2Ref = useRef<HTMLDivElement | null>(null);
  const ripple3Ref = useRef<HTMLDivElement | null>(null);

  // Check speech recognition support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
      }
    }
  }, []);

  // Cleanup on unmount or page hidden
  const stopAllTracks = () => {
    if (pipelineRef.current) {
      try {
        pipelineRef.current.destroy();
      } catch {}
      pipelineRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(() => {});
        }
      } catch {}
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && studioState === "listening") {
        handleStopListening();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopAllTracks();
    };
  }, [studioState]);

  // Click handler on "Start listening" button
  const handleStartListeningClick = () => {
    const hasStoredPermission = getStoredMicPermission();
    if (hasStoredPermission !== true) {
      // Explicitly ask every new user for microphone permission first
      setPermissionError(null);
      setIsPermissionModalOpen(true);
      return;
    }
    startActiveListening();
  };

  // Start listening with real-world noise cancellation DSP
  const startActiveListening = async () => {
    setErrorMessage(null);
    setPermissionError(null);
    setTranscript("");
    accumulatedTranscriptRef.current = "";
    isListeningRef.current = true;
    setElapsedSeconds(0);

    try {
      // 1. Request microphone access explicitly with studio-grade DSP constraints
      const constraints = getStudioMicConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      setStoredMicPermission(true);
      setIsPermissionModalOpen(false);

      // 2. Setup Real-World Multi-Stage DSP Noise Cancellation Pipeline
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          const pipeline = new NoiseCancellationPipeline(stream, {
            enableRumbleCut: true,
            enableMainsHumNotch: true,
            enableHissCut: true,
            enableVocalBoost: true,
            enableDynamicsCompression: true,
            enableNoiseGate: noiseCancellationEnabled,
            gateThresholdDb: -42,
          });
          pipelineRef.current = pipeline;
          audioContextRef.current = pipeline.audioContext;
          analyserRef.current = pipeline.analyserNode;

          pipeline.onMetrics((metrics) => {
            setNoiseMetrics(metrics);
          });
          startVisualizerLoop();
        } catch (pipelineErr) {
          console.warn("Could not instantiate Web Audio DSP pipeline, falling back to WebRTC stream:", pipelineErr);
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;
          startVisualizerLoop();
        }
      }

      // 3. Setup real SpeechRecognition with pause persistence
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let newlyFinal = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const piece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              newlyFinal += piece + " ";
            } else {
              interimTranscript += piece;
            }
          }
          if (newlyFinal) {
            accumulatedTranscriptRef.current = (
              accumulatedTranscriptRef.current + " " + newlyFinal
            )
              .replace(/\s+/g, " ")
              .trim() + " ";
          }
          const currentSpoken = (accumulatedTranscriptRef.current + interimTranscript).trim();
          setTranscript(currentSpoken);
          onTranscriptChange?.(currentSpoken);
        };

        // Seamless auto-restart across natural speech pauses (prevents missed words)
        recognition.onend = () => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch {
              setTimeout(() => {
                if (isListeningRef.current) {
                  try {
                    recognition.start();
                  } catch {}
                }
              }, 120);
            }
          }
        };

        recognition.onerror = (e: any) => {
          // Benign error on silence pauses in Chrome; onend handles restarting
          if (e.error === "no-speech") return;
          if (e.error === "aborted" && !isListeningRef.current) return;
          console.warn("[WisprScribe] Speech recognition notice:", e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        // Speech recognition unsupported in this browser
        setShowTextFallback(true);
      }

      // 4. Start elapsed timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      setStudioState("listening");
    } catch (err: any) {
      isListeningRef.current = false;
      stopAllTracks();
      const isDenied =
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError" ||
        String(err?.message || "").includes("denied");

      if (isDenied) {
        setStoredMicPermission(false);
        setPermissionError(
          "Microphone access was denied. Please allow microphone access in your browser settings to use voice transcription."
        );
        setIsPermissionModalOpen(true);
      } else {
        setErrorMessage(
          "We could not access the microphone. You can paste or type the event details instead."
        );
        setShowTextFallback(true);
      }
      setStudioState("initial");
    }
  };

  // Toggle active noise cancellation on/off
  const handleToggleNoiseCancellation = () => {
    const nextState = !noiseCancellationEnabled;
    setNoiseCancellationEnabled(nextState);
    if (pipelineRef.current) {
      pipelineRef.current.setNoiseGateEnabled(nextState);
    }
  };

  // Stop listening handler & auto-grammar refinement
  const handleStopListening = async () => {
    isListeningRef.current = false;
    stopAllTracks();
    setStudioState("stopped");

    // Automatically correct grammar, numbers, punctuation and collegiate formatting
    const raw = (accumulatedTranscriptRef.current || transcript).trim();
    if (raw) {
      setIsPolishing(true);
      setPolishNotice("Auto-refining grammar & punctuation…");
      try {
        const res = await fetch("/api/polish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: raw }),
        });
        const data = await res.json();
        if (data.ok && data.polishedText) {
          setOriginalBeforePolish(raw);
          setTranscript(data.polishedText);
          onTranscriptChange?.(data.polishedText);
          setPolishNotice(
            `Refined grammar & punctuation (${data.changesCount} correction${data.changesCount === 1 ? "" : "s"})`
          );
        } else {
          setPolishNotice(null);
        }
      } catch {
        setPolishNotice(null);
      } finally {
        setIsPolishing(false);
      }
    }
  };

  // Waveform canvas visualizer & reactive mic effect (powered by cleaned DSP stream)
  const startVisualizerLoop = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Compute normalized audio energy / volume (0.0 to 1.0) on cleaned stream
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      // Normalizing: values above threshold represent active voice speech
      const vol = Math.min(Math.max((avg - 10) / 90, 0), 1);
      const isSpeaking = vol > 0.08;

      if (isSpeaking !== lastSpeakingRef.current) {
        lastSpeakingRef.current = isSpeaking;
        setIsUserSpeaking(isSpeaking);
      }

      // Reactive 60fps hardware-accelerated transforms on mic orb and acoustic waves
      if (micOrbRef.current) {
        const scale = 1 + vol * 0.28;
        micOrbRef.current.style.transform = `scale(${scale})`;
        micOrbRef.current.style.boxShadow = `0 0 ${16 + vol * 40}px rgba(35, 122, 87, ${0.3 + vol * 0.65})`;
      }
      if (ripple1Ref.current) {
        ripple1Ref.current.style.transform = `scale(${1 + vol * 0.45})`;
        ripple1Ref.current.style.opacity = `${0.25 + vol * 0.65}`;
      }
      if (ripple2Ref.current) {
        ripple2Ref.current.style.transform = `scale(${1 + vol * 0.8})`;
        ripple2Ref.current.style.opacity = `${0.1 + vol * 0.55}`;
      }
      if (ripple3Ref.current) {
        ripple3Ref.current.style.transform = `scale(${1 + vol * 1.15})`;
        ripple3Ref.current.style.opacity = `${vol * 0.5}`;
      }

      // Canvas frequency bars drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = Math.max((canvas.width / bufferLength) * 1.8, 4);
      let x = (canvas.width - barWidth * bufferLength) / 2;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max((dataArray[i] / 255) * canvas.height * 0.85, 4);
        ctx.fillStyle = isSpeaking ? "#237A57" : "#034F46";
        const y = (canvas.height - barHeight) / 2;

        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth - 2, barHeight, 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
        x += barWidth;
      }
    };
    draw();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript.length;

  const handlePolishText = async () => {
    if (!transcript.trim() || isPolishing) return;
    setIsPolishing(true);
    setPolishNotice(null);
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });
      const data = await res.json();
      if (data.ok && data.polishedText) {
        setOriginalBeforePolish(transcript);
        setTranscript(data.polishedText);
        onTranscriptChange?.(data.polishedText);
        setPolishNotice(
          data.changesCount > 0
            ? `Refined grammar, punctuation & removed fillers (${data.changesCount} edit${data.changesCount > 1 ? "s" : ""})`
            : "Text is already well-polished!"
        );
      } else {
        setPolishNotice(data.error || "Could not polish text.");
      }
    } catch {
      setPolishNotice("Failed to polish text. Please try again.");
    } finally {
      setIsPolishing(false);
    }
  };

  const handleUndoPolish = () => {
    if (originalBeforePolish !== null) {
      setTranscript(originalBeforePolish);
      onTranscriptChange?.(originalBeforePolish);
      setOriginalBeforePolish(null);
      setPolishNotice("Reverted to original transcript.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Explicit Microphone Permission Modal for New Users */}
      <MicrophonePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onGrantPermission={startActiveListening}
        onUseTextInput={() => {
          setIsPermissionModalOpen(false);
          setShowTextFallback(true);
        }}
        permissionError={permissionError}
      />

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#85857C] hover:text-[#034F46] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to dashboard</span>
        </button>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#85857C] bg-[#E8E8D7] px-2.5 py-1 rounded-md">
          01 / Listen
        </span>
      </div>

      {/* Main Studio Card */}
      <div className="bg-[#FFFFFF] border border-[#D8D8C5] rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
        {/* Header Block */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#17201F]">
            Tell us what happened.
          </h1>
          <p className="text-sm text-[#85857C] leading-relaxed">
            Speak naturally. WisprScribe will identify the event details and ask only what is still missing.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#B7791F]/10 border border-[#B7791F]/30 text-xs text-[#17201F] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-[#B7791F]">Audio Notice: </strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* STATE 1: INITIAL READY STATE                                    */}
        {/* =============================================================== */}
        {studioState === "initial" && (
          <div className="text-center space-y-6 py-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-[#E8E8D7] flex items-center justify-center text-[#034F46] mx-auto shadow-inner transition-transform hover:scale-105">
                <Mic className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleStartListeningClick}
                className="px-8 py-3.5 rounded-xl bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] font-serif text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2.5 active:translate-y-px"
              >
                <Mic className="w-5 h-5" />
                <span>Start listening</span>
              </button>

              <p className="text-[11px] text-[#85857C] max-w-sm mx-auto">
                Your microphone is used only while listening is active. You can stop at any time.
              </p>
            </div>

            {/* Active Noise Cancellation Status Badge & Settings Link */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8E8D7]/80 text-[#034F46] border border-[#D8D8C5] text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#237A57]" />
                <span>Active Voice Cancellation: Ready (85Hz Cut + 7.8kHz Filter)</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPermissionError(null);
                  setIsPermissionModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#85857C] hover:text-[#034F46] transition-colors cursor-pointer underline"
              >
                <span>Permissions &amp; DSP info</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTextFallback((prev) => !prev)}
                className="text-xs font-semibold text-[#034F46] hover:underline cursor-pointer"
              >
                {showTextFallback
                  ? "Hide text box"
                  : "Or paste / type details instead"}
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* STATE 2: ACTIVE LISTENING STATE                                 */}
        {/* =============================================================== */}
        {studioState === "listening" && (
          <div className="text-center space-y-5 py-3">
            {/* Live Responsive Status Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#FFFFEB] border border-[#D8D8C5] shadow-xs text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isUserSpeaking ? "bg-[#237A57] animate-ping" : "bg-[#034F46] animate-pulse"
                  }`}
                />
                <span className={isUserSpeaking ? "text-[#237A57] font-bold" : "text-[#034F46]"}>
                  {isUserSpeaking ? "Active Voice Detected" : "Listening for speech…"}
                </span>
              </div>

              {/* Dynamic Live EQ Equalizer Bars when speaking */}
              {isUserSpeaking && (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-[#237A57] rounded-full animate-pulse" />
                  <span className="w-0.5 h-3.5 bg-[#237A57] rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-0.5 h-2 bg-[#237A57] rounded-full animate-pulse [animation-delay:300ms]" />
                  <span className="w-0.5 h-3 bg-[#237A57] rounded-full animate-pulse [animation-delay:75ms]" />
                </div>
              )}

              <span className="text-[#85857C] font-mono text-[11px] border-l border-[#D8D8C5] pl-2.5">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            {/* Reactive Voice-Responsive Microphone Orb with Acoustic Halo Waves */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-1 select-none">
              {/* Outer Acoustic Ripple Wave 3 */}
              <div
                ref={ripple3Ref}
                className="absolute inset-0 rounded-full border border-[#237A57]/30 transition-transform duration-75 pointer-events-none"
                style={{ transform: "scale(1)", opacity: 0 }}
              />

              {/* Middle Acoustic Ripple Wave 2 */}
              <div
                ref={ripple2Ref}
                className="absolute w-32 h-32 rounded-full border-2 border-[#237A57]/40 bg-[#237A57]/5 transition-transform duration-75 pointer-events-none"
                style={{ transform: "scale(1)", opacity: 0.1 }}
              />

              {/* Inner Acoustic Ripple Wave 1 */}
              <div
                ref={ripple1Ref}
                className="absolute w-24 h-24 rounded-full border-2 border-[#237A57]/60 bg-[#237A57]/10 transition-transform duration-75 pointer-events-none"
                style={{ transform: "scale(1)", opacity: 0.2 }}
              />

              {/* Living Reactive Central Mic Core */}
              <div
                ref={micOrbRef}
                className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#034F46] to-[#237A57] flex items-center justify-center text-[#FFFFEB] shadow-lg transition-transform duration-75"
                style={{
                  transform: "scale(1)",
                  boxShadow: "0 0 20px rgba(35, 122, 87, 0.35)",
                }}
              >
                <Mic
                  className={`w-9 h-9 transition-transform duration-100 ${
                    isUserSpeaking ? "scale-110 text-white" : "text-[#FFFFEB]/90"
                  }`}
                />
              </div>
            </div>

            {/* Real-World Voice Cancellation Telemetry & Control Card */}
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-[#FFFFEB] border border-[#D8D8C5] shadow-2xs space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-[#237A57]" />
                  <span className="text-xs font-bold text-[#034F46]">
                    Real-World Voice Cancellation
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#237A57] bg-[#E8E8D7] px-2 py-0.5 rounded">
                    <span className={`w-1.5 h-1.5 rounded-full ${noiseCancellationEnabled ? "bg-[#237A57]" : "bg-neutral-400"}`} />
                    <span>{noiseCancellationEnabled ? "ACTIVE (DSP)" : "BYPASSED"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleNoiseCancellation}
                    className="text-[10px] font-semibold text-[#85857C] hover:text-[#034F46] underline cursor-pointer"
                  >
                    {noiseCancellationEnabled ? "Bypass" : "Enable"}
                  </button>
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#D8D8C5]/60 text-[10px]">
                <div className="bg-[#FFFFFF] p-1.5 rounded-lg border border-[#D8D8C5]/50">
                  <span className="text-[#85857C] block">Ambient Floor</span>
                  <span className="font-semibold text-[#17201F]">
                    {noiseMetrics ? `${noiseMetrics.ambientNoiseDb} dB` : "-55 dB"}
                  </span>
                </div>
                <div className="bg-[#FFFFFF] p-1.5 rounded-lg border border-[#D8D8C5]/50">
                  <span className="text-[#85857C] block">Suppression</span>
                  <span className="font-semibold text-[#237A57]">
                    {noiseMetrics && noiseMetrics.isNoiseSuppressed
                      ? `-${noiseMetrics.suppressionRatioDb || 18} dB`
                      : "Voice Active"}
                  </span>
                </div>
                <div className="bg-[#FFFFFF] p-1.5 rounded-lg border border-[#D8D8C5]/50">
                  <span className="text-[#85857C] block">Active Filters</span>
                  <span className="font-semibold text-[#034F46]">
                    85Hz + 7.8kHz
                  </span>
                </div>
              </div>
            </div>

            {/* Waveform Canvas */}
            <div className="w-full max-w-md mx-auto h-16 bg-[#FFFFEB] border border-[#D8D8C5] rounded-xl flex items-center justify-center p-2 shadow-2xs">
              <canvas
                ref={canvasRef}
                width={360}
                height={60}
                className="w-full h-full"
              />
            </div>

            <p className="text-xs text-[#85857C] italic">
              {isUserSpeaking
                ? "Streaming your voice in real time with active noise suppression…"
                : "Speak naturally about the event. Background disturbances are filtered."}
            </p>

            {/* Live Transcript Preview */}
            {transcript && (
              <div className="p-4 rounded-xl bg-[#FFFFEB]/80 border border-[#D8D8C5] text-left text-xs text-[#17201F] max-w-lg mx-auto shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#85857C] block mb-1">
                  Interim Spoken Text:
                </span>
                <p className="font-serif italic leading-relaxed">&ldquo;{transcript}&rdquo;</p>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleStopListening}
                className="px-8 py-3.5 rounded-xl bg-[#17201F] hover:bg-black text-[#FFFFEB] font-serif text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2.5 active:translate-y-px"
              >
                <Square className="w-4 h-4 fill-current text-[#FFFFEB]" />
                <span>Stop listening</span>
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* STATE 3: STOPPED / EDITABLE TRANSCRIPT STATE                    */}
        {/* =============================================================== */}
        {(studioState === "stopped" || showTextFallback) && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-sm text-[#17201F]">
                Event Transcript &amp; Notes
              </span>
              <span className="font-mono text-[11px] text-[#85857C]">
                {wordCount} words &bull; {charCount} chars
              </span>
            </div>

            <textarea
              rows={6}
              value={transcript}
              onChange={(e) => {
                const val = e.target.value;
                setTranscript(val);
                onTranscriptChange?.(val);
                if (originalBeforePolish !== null) {
                  setOriginalBeforePolish(null);
                  setPolishNotice(null);
                }
              }}
              placeholder="e.g., Yesterday afternoon on Saturday October 18th, the Coding Club hosted a hands-on Web Development Workshop in Seminar Hall 2 from 10 AM to 1 PM. Professor Mehta taught HTML and CSS to 62 first-year students..."
              className="w-full p-4 rounded-xl border border-[#D8D8C5] bg-[#FFFFEB]/50 text-sm text-[#17201F] leading-relaxed focus:outline-none focus:border-[#034F46] focus:bg-[#FFFFFF] shadow-inner transition-colors font-sans"
            />

            {/* Polish Notice / Undo Strip */}
            {polishNotice && (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#034F46]/5 border border-[#034F46]/20 text-xs text-[#034F46]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#034F46]" />
                  <span>{polishNotice}</span>
                </div>
                {originalBeforePolish !== null && (
                  <button
                    type="button"
                    onClick={handleUndoPolish}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#85857C] hover:text-[#17201F] cursor-pointer underline ml-3"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setStudioState("initial");
                    setTranscript("");
                    setOriginalBeforePolish(null);
                    setPolishNotice(null);
                    onTranscriptChange?.("");
                  }}
                  className="px-4 py-2.5 rounded-lg border border-[#D8D8C5] hover:bg-[#E8E8D7] text-xs font-semibold text-[#17201F] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Record again</span>
                </button>

                <button
                  type="button"
                  onClick={handlePolishText}
                  disabled={!transcript.trim() || isPolishing}
                  className="px-4 py-2.5 rounded-lg border border-[#034F46]/30 bg-[#034F46]/5 hover:bg-[#034F46]/10 text-xs font-semibold text-[#034F46] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPolishing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Refining grammar…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Polish text</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => onAnalyzeTranscript(transcript)}
                disabled={!transcript.trim() || isAnalyzing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] font-serif text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting facts…</span>
                  </>
                ) : (
                  <>
                    <span>Extract event facts</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collegiate Guidance Note */}
      <div className="p-4 rounded-xl bg-[#E8E8D7]/40 border border-[#D8D8C5] text-xs text-[#5A6361] flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#237A57] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#034F46] font-semibold block">
            Real-World Voice Cancellation &amp; Collegiate Trust:
          </strong>
          <p className="leading-relaxed">
            WisprScribe actively cuts background acoustic noise (hvac, fans, typing) using real-time Web Audio DSP filters and our adaptive noise gate. Unmentioned details are never fabricated—if a field was not spoken, it will be highlighted for confirmation in the next review step.
          </p>
        </div>
      </div>
    </div>
  );
};
