"use client";

import React, { useState } from "react";
import {
  SAMPLE_EVENTS,
  DEFAULT_SAMPLE_EVENT,
  type SampleEvent,
} from "@/lib/sample-events";
import {
  FileText,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
  Copy,
  Trash2,
} from "lucide-react";

interface EventInputProps {
  onExtractClick?: (transcript: string, selectedPreset: SampleEvent | null) => void;
  isLoading?: boolean;
  onProceedToFacts?: () => void;
}

const MAX_CHAR_RECOMMENDED = 1500;
const MAX_CHAR_LIMIT = 3000;

export const EventInput: React.FC<EventInputProps> = ({
  onExtractClick,
  isLoading = false,
  onProceedToFacts,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    DEFAULT_SAMPLE_EVENT.id
  );
  const [transcript, setTranscript] = useState<string>(
    DEFAULT_SAMPLE_EVENT.transcript
  );
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [hasUserEdited, setHasUserEdited] = useState<boolean>(false);

  const currentPreset =
    SAMPLE_EVENTS.find((p) => p.id === selectedPresetId) || null;

  const charCount = transcript.length;
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const isEmpty = transcript.trim().length === 0;
  const isTooLong = charCount > MAX_CHAR_LIMIT;

  const handleSelectPreset = (preset: SampleEvent) => {
    setSelectedPresetId(preset.id);
    setTranscript(preset.transcript);
    setHasUserEdited(false);
    if (onExtractClick) {
      onExtractClick(preset.transcript, preset);
    }
  };

  const handleResetToDefault = () => {
    setSelectedPresetId(DEFAULT_SAMPLE_EVENT.id);
    setTranscript(DEFAULT_SAMPLE_EVENT.transcript);
    setHasUserEdited(false);
    if (onExtractClick) {
      onExtractClick(DEFAULT_SAMPLE_EVENT.transcript, DEFAULT_SAMPLE_EVENT);
    }
  };

  const handleClear = () => {
    setTranscript("");
    setSelectedPresetId("");
    setHasUserEdited(true);
  };

  const handleCopyTranscript = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
    setHasUserEdited(true);
    if (currentPreset && e.target.value !== currentPreset.transcript) {
      setSelectedPresetId("");
    }
  };

  const handleTriggerExtract = () => {
    if (isEmpty || isTooLong || isLoading) return;
    if (onExtractClick) {
      onExtractClick(transcript, currentPreset);
    }
    if (onProceedToFacts) {
      onProceedToFacts();
    }
  };

  return (
    <div className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-white">
      {/* Header Row: Title & Clean Preset Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            id="event-input-heading"
            className="font-sans text-2xl font-bold text-white flex items-center gap-2"
          >
            <FileText className="w-5 h-5 text-purple-400" aria-hidden="true" />
            <span>Spoken Event Recap</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Dictate with voice or choose an authentic collegiate sample.
          </p>
        </div>

        {/* Clean Sample Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {SAMPLE_EVENTS.map((preset) => {
            const isActive = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-black shadow-xs font-semibold"
                    : "bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/5"
                }`}
                aria-pressed={isActive}
              >
                <span>{preset.title.split(" ")[0]} {preset.title.split(" ")[1] || "Event"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Synthetic preset note */}
      {currentPreset?.isSynthetic && (
        <p className="text-[11px] text-amber-300 bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-500/30">
          Synthetic sample: {currentPreset.disclaimer}
        </p>
      )}

      {/* Text Area */}
      <div className="relative">
        <label htmlFor="event-recap-textarea" className="sr-only">
          Spoken Event Recap
        </label>
        <textarea
          id="event-recap-textarea"
          rows={7}
          value={transcript}
          onChange={handleTextChange}
          placeholder="Dictate what happened at the event, or type notes here..."
          className="w-full p-5 rounded-2xl bg-[#141414] border border-white/10 text-white text-base leading-relaxed placeholder:text-neutral-500 focus:bg-[#181818] focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:outline-hidden transition-all resize-y font-sans"
        />

        {hasUserEdited && !isEmpty && (
          <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-neutral-400">
            Edited
          </span>
        )}
      </div>

      {/* Alert if empty or too long */}
      {isEmpty && (
        <div className="text-xs text-amber-300 bg-amber-950/30 p-3 rounded-xl border border-amber-500/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
          <span>Event recap is empty. Dictate or select a sample preset above to review facts.</span>
        </div>
      )}

      {/* Footer Utility & Primary CTA Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
        {/* Helper info & Word counters */}
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-purple-400 lucide lucide-mic preview-icon"
              aria-hidden="true"
            >
              <path d="M12 19v3" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <rect x="9" y="2" width="6" height="13" rx="3" />
            </svg>
            <span>Voice dictation ready</span>
          </div>
          <span>&bull;</span>
          <span>{wordCount} words</span>
          {currentPreset && !hasUserEdited && (
            <>
              <span>&bull;</span>
              <span>{currentPreset.approxDuration}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyTranscript}
            disabled={isEmpty}
            className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40"
          >
            {copiedNotice ? "Copied!" : "Copy"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-2.5 py-1 text-xs text-purple-300 font-medium hover:bg-white/10 rounded-lg transition-colors"
          >
            Reset
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleTriggerExtract}
            disabled={isEmpty || isTooLong || isLoading}
            className="ml-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs tracking-wide transition-all shadow-xs active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer group"
          >
            {isLoading ? (
              <span>Extracting Facts...</span>
            ) : (
              <>
                <span>Review Verified Facts (14)</span>
                <ArrowRight className="w-3.5 h-3.5 text-black opacity-75 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
