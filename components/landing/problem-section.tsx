"use client";

import React, { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";

interface ProblemSectionProps {
  isActive?: boolean;
}

export function ProblemSection({ isActive = true }: ProblemSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineWordsRef = useRef<HTMLSpanElement>(null);
  const chipBgRef = useRef<HTMLSpanElement>(null);
  const chipTextRef = useRef<HTMLSpanElement>(null);
  const subStatementRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const headlineWords = headlineWordsRef.current;
      const subStatement = subStatementRef.current;
      const chipBg = chipBgRef.current;
      const chipText = chipTextRef.current;

      if (!isActive || !headlineWords || !subStatement) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isReduced: "(prefers-reduced-motion: reduce)",
          all: "all",
        },
        (ctx) => {
          const { isReduced } = ctx.conditions as { isReduced: boolean };

          if (isReduced) {
            gsap.set([headlineWords, subStatement, chipBg, chipText], {
              opacity: 1,
              scaleX: 1,
              y: 0,
            });
            return;
          }

          // SplitText on Headline text (Preset A: masked chars rise)
          const splitHeadline = SplitText.create(headlineWords, {
            type: "chars, words",
            mask: "chars",
          });

          // SplitText on Sub-statement (Preset B: masked words)
          const splitSub = SplitText.create(subStatement, {
            type: "words",
            mask: "words",
          });

          // Set initial chip state
          if (chipBg) {
            gsap.set(chipBg, { scaleX: 0, transformOrigin: "left" });
          }
          if (chipText) {
            gsap.set(chipText, { opacity: 0, y: 15 });
          }

          // Initial entrance timeline on active
          const introTl = gsap.timeline({ delay: 0.1 });

          // 1. Headline chars rise (Preset A: yPercent 110, rotation 6, 1.1s power4.out, stagger 0.035)
          introTl.from(splitHeadline.chars, {
            yPercent: 110,
            rotation: 6,
            duration: 1.0,
            stagger: 0.035,
            ease: "power4.out",
          });

          // "manually?" word rises and its amber CHIP wipes in with scaleX 0 -> 1, 0.5s power3.out
          if (chipText && chipBg) {
            introTl.to(
              chipText,
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
              },
              "<0.3"
            );
            introTl.to(
              chipBg,
              {
                scaleX: 1,
                duration: 0.55,
                ease: "power3.out",
              },
              "<0.1"
            );
          }

          // 2. Sub-statement enters: "One event. The same facts. Multiple documents." (Preset B: words rise from yPercent 100, 0.9s power3.out)
          introTl.from(
            splitSub.words,
            {
              yPercent: 100,
              duration: 0.85,
              stagger: 0.08,
              ease: "power3.out",
            },
            ">0.05"
          );
        }
      );
    },
    { scope: containerRef, dependencies: [isActive] }
  );

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto flex flex-col justify-center select-none"
    >
      {/* Eyebrow Label (Preset D) */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[13px] font-mono uppercase tracking-widest text-[#E2A83B] font-medium">
          01 / The Problem
        </span>
      </div>

      {/* Headline in DISPLAY size (Preset A) */}
      <h1 className="font-serif text-[#F5F2E8] tracking-tight leading-[0.98] text-[clamp(3.2rem,7.5vw,8.5rem)]">
        <span ref={headlineWordsRef}>Bored of creating documents</span>{" "}
        <span className="relative inline-block align-baseline whitespace-nowrap">
          <span
            ref={chipBgRef}
            className="absolute -inset-x-3 -inset-y-1 bg-[#E2A83B] rounded-full -rotate-1 origin-left"
            style={{ zIndex: 0 }}
          />
          <span
            ref={chipTextRef}
            className="relative z-10 text-[#050505] font-serif"
          >
            manually?
          </span>
        </span>
      </h1>

      {/* Sub-statement (Preset B) */}
      <p
        ref={subStatementRef}
        className="mt-6 font-serif text-[#A8AAA3] text-[clamp(1.8rem,4vw,3.2rem)] leading-tight max-w-3xl"
      >
        One event. The same facts. Multiple documents.
      </p>
    </div>
  );
}
