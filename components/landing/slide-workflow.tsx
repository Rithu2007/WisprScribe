"use client";

import React, { useRef } from "react";
import { gsap, useGSAP, DrawSVGPlugin } from "@/lib/gsap";
import {
  CheckmarkIcon,
  DocumentIcon,
  SpeechBubbleIcon,
  WaveformIcon,
  TealArrowIcon,
} from "./verba-icons";

interface SlideWorkflowProps {
  isActive?: boolean;
}

export function SlideWorkflow({ isActive = true }: SlideWorkflowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const col3Ref = useRef<HTMLDivElement>(null);
  const waveSvgRef = useRef<SVGPathElement>(null);
  const linesSvgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (!isActive || !containerRef.current) return;

      const tl = gsap.timeline({ delay: 0.1 });

      // Columns enter sequentially (Preset B & D)
      tl.from([col1Ref.current, col2Ref.current, col3Ref.current], {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      });

      // Waveform draws in Column 1
      if (waveSvgRef.current) {
        tl.fromTo(
          waveSvgRef.current,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 0.7, ease: "power3.out" },
          "<0.1"
        );
      }

      // Connecting lines draw in Column 3
      if (linesSvgRef.current) {
        const paths = linesSvgRef.current.querySelectorAll("path");
        tl.fromTo(
          paths,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 0.6, stagger: 0.1, ease: "power3.out" },
          "<0.2"
        );
      }
    },
    { scope: containerRef, dependencies: [isActive] }
  );

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto flex flex-col justify-center">
      {/* Eyebrow Label (Preset D) */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] font-mono uppercase tracking-widest text-[#39D7B5] font-medium">
          03 / How It Works
        </span>
      </div>

      {/* Statement Heading (Preset B) */}
      <h2 className="font-serif text-[#F5F2E8] tracking-tight leading-none text-[clamp(2.4rem,4.5vw,4.2rem)] mb-8 flex flex-wrap items-center gap-3">
        <span>Speak</span>
        <TealArrowIcon className="w-5 h-5 text-[#39D7B5]" />
        <span>Review</span>
        <TealArrowIcon className="w-5 h-5 text-[#39D7B5]" />
        <span className="text-[#39D7B5]">Generate</span>
      </h2>

      {/* 3 Compact Aligned Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Step 1: Speak */}
        <div
          ref={col1Ref}
          className="p-5 rounded-xl border border-white/[0.12] bg-white/[0.02] flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#39D7B5] font-semibold">
                01 / Speak
              </span>
              <span className="text-[11px] font-mono uppercase text-[#A8AAA3]">
                Audio Input
              </span>
            </div>
            <h3 className="font-serif text-[#F5F2E8] text-lg font-medium mb-2">
              Tell us what happened.
            </h3>
            <p className="font-serif italic text-sm text-[#A8AAA3] leading-relaxed">
              &ldquo;Annual robotics symposium today at 10 AM in Hall B with 85
              attendees, followed by the faculty debrief.&rdquo;
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <svg viewBox="0 0 160 20" className="w-32 h-4 overflow-visible" fill="none">
              <path
                ref={waveSvgRef}
                d="M 0 10 Q 10 2, 20 10 Q 30 18, 40 10 Q 50 2, 60 10 Q 70 18, 80 10 Q 90 2, 100 10 Q 110 18, 120 10 Q 130 2, 140 10 Q 150 18, 160 10"
                stroke="#39D7B5"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[10px] font-mono uppercase text-[#39D7B5] font-medium tracking-wider">
              Live Voice
            </span>
          </div>
        </div>

        {/* Step 2: Review */}
        <div
          ref={col2Ref}
          className="p-5 rounded-xl border border-white/[0.12] bg-white/[0.02] flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#55D69A] font-semibold">
                02 / Review
              </span>
              <span className="text-[11px] font-mono uppercase text-[#A8AAA3]">
                Verified Facts
              </span>
            </div>
            <h3 className="font-serif text-[#F5F2E8] text-lg font-medium mb-2">
              Verified fact ledger.
            </h3>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#F5F2E8]">
                <CheckmarkIcon />
                <span>Event: Robotics Symposium</span>
              </div>
              <div className="flex items-center gap-2 text-[#F5F2E8]">
                <CheckmarkIcon />
                <span>Time: Today • 10:00 AM</span>
              </div>
              <div className="flex items-center gap-2 text-[#F5F2E8]">
                <CheckmarkIcon />
                <span>Turnout: 85 Attendees</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#A8AAA3]">Budget Sanction:</span>
                <span className="px-2 py-0.5 text-[10px] uppercase rounded-full bg-[#E2A83B]/15 text-[#E2A83B] border border-[#E2A83B]/40 font-semibold">
                  Confirm this
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
            <p className="text-[11px] font-serif italic text-[#39D7B5]">
              &ldquo;If you did not say it, WisprScribe does not invent it.&rdquo;
            </p>
          </div>
        </div>

        {/* Step 3: Generate */}
        <div
          ref={col3Ref}
          className="p-5 rounded-xl border border-white/[0.12] bg-white/[0.02] flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#CFA7FF] font-semibold">
                03 / Generate
              </span>
              <span className="text-[11px] font-mono uppercase text-[#A8AAA3]">
                Multi-Format
              </span>
            </div>
            <h3 className="font-serif text-[#F5F2E8] text-lg font-medium mb-2">
              Three formal documents.
            </h3>

            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-mono">
                <span className="flex items-center gap-2 text-[#F5F2E8]">
                  <DocumentIcon />
                  Faculty Report
                </span>
                <span className="text-[10px] text-[#39D7B5] font-semibold">PDF</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-mono">
                <span className="flex items-center gap-2 text-[#F5F2E8]">
                  <DocumentIcon />
                  Dean Memo
                </span>
                <span className="text-[10px] text-[#39D7B5] font-semibold">DOCX</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-mono">
                <span className="flex items-center gap-2 text-[#F5F2E8]">
                  <SpeechBubbleIcon />
                  WhatsApp Notice
                </span>
                <span className="text-[10px] text-[#39D7B5] font-semibold">PING</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#A8AAA3]">
            <span>One Spoken Recap</span>
            <span className="text-[#39D7B5] font-semibold">Ready in 3s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
