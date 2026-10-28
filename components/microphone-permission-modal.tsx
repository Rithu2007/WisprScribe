"use client";

import React, { useState } from "react";
import { Mic, ShieldCheck, AlertTriangle, X } from "lucide-react";

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
      <div className="bg-[#FFFFEB] text-[#17201F] border border-[#D8D8C5] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 relative">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#034F46] flex items-center justify-center text-[#FFFFEB] shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="mic-permission-title"
                className="font-serif text-xl font-bold text-[#17201F] tracking-tight"
              >
                Use Microphone
              </h2>
              <p className="text-xs text-[#85857C]">For spoken event recap</p>
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

        {/* Clear, natural explanation */}
        <p className="text-sm text-[#5A6361] leading-relaxed">
          WisprScribe transcribes your event recap in real time with background noise filtering. Your audio is processed directly in your browser.
        </p>

        {/* Error notification / troubleshooting instructions */}
        {errorDetails && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#17201F] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-800">Microphone blocked</span>
              <p className="text-amber-900 leading-relaxed">{errorDetails}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleGrantClick}
            disabled={isRequesting}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] font-medium text-sm transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {isRequesting ? (
              <>
                <span className="w-4 h-4 border-2 border-[#FFFFEB] border-t-transparent rounded-full animate-spin" />
                <span>Connecting…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Allow Microphone</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onUseTextInput}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-[#D8D8C5] bg-[#FFFFFF] hover:bg-[#E8E8D7] text-[#17201F] text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Type instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
