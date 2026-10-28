"use client";

import React, { useState } from "react";
import {
  Mic,
  ShieldCheck,
  VolumeX,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  Radio,
} from "lucide-react";

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantPermission: () => Promise<void>;
  onUseTextInput: () => void;
  permissionError?: string | null;
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  isOpen,
  onClose,
  onGrantPermission,
  onUseTextInput,
  permissionError,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(permissionError || null);

  if (!isOpen) return null;

  const handleGrantClick = async () => {
    setIsRequesting(true);
    setErrorDetails(null);
    try {
      await onGrantPermission();
    } catch (err: any) {
      console.warn("Microphone permission was not granted:", err);
      const isDenied =
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError" ||
        String(err?.message || "").includes("denied");

      if (isDenied) {
        setErrorDetails(
          "Microphone access was denied. Please click the lock or camera icon in your browser's address bar to allow microphone access, then try again."
        );
      } else {
        setErrorDetails(
          err?.message || "Could not access microphone. Please check your audio device settings."
        );
      }
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mic-permission-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-[#FFFFEB] text-[#17201F] border border-[#D8D8C5] rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#034F46]/5 blur-2xl pointer-events-none" />

        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#034F46] flex items-center justify-center text-[#FFFFEB] shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#034F46] font-semibold bg-[#E8E8D7] px-2 py-0.5 rounded">
                Microphone Permission
              </span>
              <h2
                id="mic-permission-title"
                className="font-serif text-xl sm:text-2xl font-bold text-[#17201F] mt-0.5 tracking-tight"
              >
                Allow Microphone Access
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#85857C] hover:text-[#17201F] hover:bg-[#E8E8D7] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Proposition & Noise Cancellation explanation */}
        <p className="text-xs sm:text-sm text-[#5A6361] leading-relaxed">
          WisprScribe captures your spoken event recap and runs <strong>real-time voice cancellation</strong> to remove background disturbances, desk vibrations, and room noise.
        </p>

        {/* Feature Highlights Grid */}
        <div className="space-y-2.5 bg-[#FFFFFF] p-4 rounded-xl border border-[#D8D8C5]/80 shadow-2xs">
          <div className="flex items-start gap-2.5 text-xs text-[#17201F]">
            <VolumeX className="w-4 h-4 text-[#237A57] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#034F46]">Active Real-World Noise Cancellation: </span>
              <span className="text-[#5A6361]">
                Filters out air conditioners, fan hums (85Hz high-pass), electrical buzz (50/60Hz notch), and mechanical keyboard clicks (7.8kHz low-pass).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-[#17201F]">
            <Radio className="w-4 h-4 text-[#237A57] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#034F46]">Adaptive Noise Gate & Vocal Boost: </span>
              <span className="text-[#5A6361]">
                Attenuates room noise by up to 20dB during pauses while boosting speech consonants (2.4kHz) for high-accuracy collegiate paperwork.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-[#17201F]">
            <Lock className="w-4 h-4 text-[#237A57] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#034F46]">100% In-Browser Privacy: </span>
              <span className="text-[#5A6361]">
                Audio DSP runs entirely on your local device. We never record, upload, or sell your voice without your explicit command.
              </span>
            </div>
          </div>
        </div>

        {/* Error notification / troubleshooting instructions */}
        {errorDetails && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#17201F] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-800">Permission Action Required:</span>
              <p className="text-amber-900 leading-relaxed">{errorDetails}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleGrantClick}
            disabled={isRequesting}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {isRequesting ? (
              <>
                <span className="w-4 h-4 border-2 border-[#FFFFEB] border-t-transparent rounded-full animate-spin" />
                <span>Requesting permission…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Grant Microphone Access</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onUseTextInput}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-[#D8D8C5] bg-[#FFFFFF] hover:bg-[#E8E8D7] text-[#17201F] text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Type or paste instead</span>
          </button>
        </div>

        <p className="text-[11px] text-center text-[#85857C]">
          You can toggle noise cancellation settings or switch to keyboard input anytime.
        </p>
      </div>
    </div>
  );
};
