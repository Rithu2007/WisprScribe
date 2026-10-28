"use client";

import React, { useState, useEffect } from "react";
import { FileText, CheckCircle2, RotateCcw } from "lucide-react";

export const SpeakingFigureAnimation: React.FC = () => {
  // Animation progress cycle: 0 -> 100% over 8 seconds
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const durationMs = 8000;
    const intervalMs = 25;
    const increment = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => (prev + increment >= 100 ? 0 : prev + increment));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Derived phase triggers (0% to 100%)
  // Phase 1 (0-20%): Figure Speaks & soundwaves emerge
  // Phase 2 (20-48%): Spoken words float upward and travel right
  // Phase 3 (48-68%): Words collapse into structured text block
  // Phase 4 (68-92%): Block morphs into official Document / PDF icon
  // Phase 5 (92-100%): Hold & reset
  const isSpeaking = progress >= 5 && progress < 45;
  const isFloating = progress >= 15 && progress < 55;
  const isBlockForming = progress >= 48 && progress < 68;
  const isDocumentFormed = progress >= 68;

  // Words that float out of speech
  const spokenWords = [
    { text: "Workshop", delay: 18, x: 210, y: 70 },
    { text: "Seminar Hall 2", delay: 24, x: 260, y: 115 },
    { text: "62 Attendees", delay: 30, x: 300, y: 65 },
    { text: "Prof. Mehta", delay: 36, x: 350, y: 110 },
  ];

  return (
    <section
      aria-label="How voice transforms to documents"
      className="w-full max-w-5xl mx-auto my-6 px-4 select-none"
    >
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#0D0D0D] via-[#090909] to-[#070707] p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-purple-900/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#10B981]/10 blur-3xl pointer-events-none" />

        {/* Header Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-ping" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-300">
              VOICE RECAP &rarr; PDF TRANSFORMATION
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setProgress(0)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Replay</span>
            </button>
            <span className="text-xs font-mono text-neutral-500">
              {((progress / 100) * 8).toFixed(1)}s / 8.0s
            </span>
          </div>
        </div>

        {/* Motion Stage Canvas */}
        <div className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-between overflow-hidden mt-4">
          {/* ================================================================= */}
          {/* 1. SPEAKING HUMAN FIGURE (Minimalist Line Drawing Vector)         */}
          {/* ================================================================= */}
          <div className="relative z-10 w-44 sm:w-56 shrink-0 flex flex-col items-center">
            <svg
              viewBox="0 0 200 240"
              className="w-40 sm:w-48 h-auto drop-shadow-[0_4px_20px_rgba(255,255,255,0.06)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Human Head & Profile Silhouette */}
              <path
                d="M80,60 C80,35 105,25 125,35 C145,45 150,70 148,90 C146,105 138,115 130,120 L130,140 L160,165 C175,180 185,205 185,235 L50,235 C50,205 60,180 75,165 L105,140 L105,120 C95,115 80,95 80,60 Z"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />

              {/* Eye & Brow */}
              <path
                d="M128,65 C132,65 136,66 138,68"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Nose & Jaw Contour */}
              <path
                d="M138,72 L144,82 L137,88"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Speaking Mouth (Opens subtly when speaking) */}
              <path
                d={
                  isSpeaking
                    ? "M136,98 Q142,102 136,106 Z"
                    : "M135,100 L140,100"
                }
                fill={isSpeaking ? "#A855F7" : "none"}
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-all duration-200"
              />

              {/* Collegiate Collar / Lanyard / Mic headset line */}
              <path
                d="M105,140 L118,170 L130,140"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M110,65 Q115,100 135,102"
                stroke="#A855F7"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="2 3"
              />
              <circle cx="135" cy="102" r="3" fill="#A855F7" />

              {/* Soundwaves Expanding from Mouth */}
              {isSpeaking && (
                <>
                  <path
                    d="M152,90 Q160,100 152,110"
                    stroke="#A855F7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  <path
                    d="M162,82 Q174,100 162,118"
                    stroke="#A855F7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <path
                    d="M172,74 Q188,100 172,126"
                    stroke="#A855F7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </>
              )}
            </svg>

            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mt-2 font-semibold">
              Speaker Recap
            </span>
          </div>

          {/* ================================================================= */}
          {/* 2. FLOATING SPOKEN WORDS & BEZIER TRANSIT PATH                    */}
          {/* ================================================================= */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Curved Path Guide Line */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M150,220 C320,80 500,80 680,220"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
            </svg>

            {/* Individual Floating Words */}
            {spokenWords.map((item, index) => {
              const active = progress >= item.delay && progress < 68;
              // Animate position towards the document center as progress approaches 55%
              const progressAlong = Math.min(
                1,
                Math.max(0, (progress - item.delay) / 32)
              );
              const tx =
                progressAlong < 0.6
                  ? progressAlong * 340
                  : 340 + (progressAlong - 0.6) * 180;
              const ty = Math.sin(progressAlong * Math.PI) * -80;
              const opacity =
                progress < item.delay
                  ? 0
                  : progress >= 64
                  ? Math.max(0, (68 - progress) / 4)
                  : 1;

              return (
                <div
                  key={index}
                  style={{
                    transform: `translate(${140 + tx}px, ${160 + ty}px) scale(${
                      active ? 1 : 0.8
                    })`,
                    opacity: opacity,
                  }}
                  className="absolute left-0 top-0 transition-transform duration-100 ease-out inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B]/90 backdrop-blur-md border border-white/25 shadow-lg text-xs font-mono font-bold text-white whitespace-nowrap"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* ================================================================= */}
          {/* 3. TRANSFORMATION HUB: STRUCTURED BLOCK -> OFFICIAL PDF DOCUMENT   */}
          {/* ================================================================= */}
          <div className="relative z-10 w-56 sm:w-72 shrink-0 flex flex-col items-center justify-center">
            {/* Intermediate Structured Block (Phases 3: progress 48% -> 68%) */}
            {isBlockForming && !isDocumentFormed && (
              <div className="w-48 h-60 rounded-xl bg-white/5 border-2 border-dashed border-[#A855F7] p-4 flex flex-col justify-between animate-pulse transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span className="text-[10px] font-mono text-[#A855F7] font-bold">
                    GATHERING FACTS
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
                </div>
                <div className="space-y-2 py-2">
                  <div className="h-2.5 bg-white/30 rounded-xs w-3/4" />
                  <div className="h-2.5 bg-white/20 rounded-xs w-full" />
                  <div className="h-2.5 bg-white/20 rounded-xs w-5/6" />
                  <div className="h-2.5 bg-white/10 rounded-xs w-2/3" />
                </div>
                <div className="text-[9px] font-mono text-center text-neutral-400 border-t border-white/10 pt-2">
                  4 VERIFIED ELEMENTS
                </div>
              </div>
            )}

            {/* Final Realized Document / PDF Icon (Phase 4 & 5: progress >= 68%) */}
            {isDocumentFormed && (
              <div className="w-48 sm:w-52 h-64 rounded-xl bg-white text-black p-4 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-neutral-300 relative transform hover:scale-105 transition-all duration-500 animate-in zoom-in-95">
                {/* Dog-Ear Folded Corner (Top Right) */}
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                  <div className="w-12 h-12 bg-[#090909] transform rotate-45 -translate-y-8 translate-x-3 shadow-md border-b border-l border-white/20" />
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 border-b border-l border-neutral-400 bg-neutral-200 pointer-events-none rounded-bl-sm" />

                {/* Document Header */}
                <div className="border-b-2 border-black pb-2 pr-6">
                  <div className="text-[8px] font-mono uppercase tracking-widest text-[#10B981] font-bold">
                    VERIFIED REPORT
                  </div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-black leading-tight mt-0.5">
                    Post-Event Summary
                  </h4>
                </div>

                {/* Structured Interpolated Content Lines */}
                <div className="space-y-1.5 my-auto text-[10px] font-sans">
                  <div className="flex justify-between border-b border-neutral-200 pb-1">
                    <span className="text-neutral-500 font-mono text-[9px]">EVENT:</span>
                    <span className="font-bold truncate max-w-[90px]">Web Workshop</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 pb-1">
                    <span className="text-neutral-500 font-mono text-[9px]">VENUE:</span>
                    <span className="font-semibold truncate max-w-[90px]">Hall 2</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 pb-1">
                    <span className="text-neutral-500 font-mono text-[9px]">ATTENDANCE:</span>
                    <span className="font-bold text-[#10B981]">62 Present</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 pb-1">
                    <span className="text-neutral-500 font-mono text-[9px]">SPEAKER:</span>
                    <span className="font-semibold truncate max-w-[90px]">Prof. Mehta</span>
                  </div>
                </div>

                {/* Document Footer with Unmistakable PDF Badge */}
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                  {/* Distinct Red PDF Stamp */}
                  <div className="flex items-center gap-1 bg-[#DC2626] text-white px-2 py-0.5 rounded-sm font-mono font-bold text-[9px] tracking-wider shadow-xs">
                    <FileText className="w-2.5 h-2.5" />
                    <span>PDF</span>
                  </div>

                  {/* Certified Seal Checkmark */}
                  <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#10B981]">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                    <span>READY</span>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder before transformation begins */}
            {!isBlockForming && !isDocumentFormed && (
              <div className="w-48 h-60 rounded-xl border border-dashed border-white/15 flex flex-col items-center justify-center p-4 text-center opacity-40">
                <FileText className="w-10 h-10 text-neutral-400 mb-2 stroke-1" />
                <span className="text-xs font-mono text-neutral-400">
                  Target Document
                </span>
                <span className="text-[10px] text-neutral-500 mt-1">
                  Awaiting spoken facts...
                </span>
              </div>
            )}

            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mt-3 font-semibold">
              Project Document
            </span>
          </div>
        </div>

        {/* Narrative Step Indicators */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-white/10 text-center">
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              progress < 45
                ? "bg-white/10 border-white/30 text-white font-semibold"
                : "bg-white/5 border-transparent text-neutral-400"
            }`}
          >
            <div className="text-[10px] font-mono text-neutral-400">STEP 1</div>
            <div className="text-xs sm:text-sm">Speak Event Recap</div>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition-all ${
              progress >= 45 && progress < 68
                ? "bg-purple-950/40 border-purple-500/40 text-purple-200 font-semibold"
                : "bg-white/5 border-transparent text-neutral-400"
            }`}
          >
            <div className="text-[10px] font-mono text-neutral-400">STEP 2</div>
            <div className="text-xs sm:text-sm">Words Gather into Facts</div>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition-all ${
              progress >= 68
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200 font-semibold"
                : "bg-white/5 border-transparent text-neutral-400"
            }`}
          >
            <div className="text-[10px] font-mono text-neutral-400">STEP 3</div>
            <div className="text-xs sm:text-sm">Instant Certified PDF</div>
          </div>
        </div>
      </div>
    </section>
  );
};
