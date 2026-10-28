"use client";

import React, { useRef } from "react";
import {
  gsap,
  useGSAP,
  SplitText,
  DrawSVGPlugin,
  MorphSVGPlugin,
} from "@/lib/gsap";

const CIRCLE_PATH =
  "M 12 4 C 16.42 4 20 7.58 20 12 C 20 16.42 16.42 20 12 20 C 7.58 20 4 16.42 4 12 C 4 7.58 7.58 4 12 4 Z";
const BUBBLE_PATH =
  "M 4 4 C 4 4 20 4 20 4 C 21.1 4 22 4.9 22 6 L 22 15 C 22 16.1 21.1 17 20 17 L 14 17 L 10 21 L 10 17 L 4 17 C 2.9 17 2 16.1 2 15 L 2 6 C 2 4.9 2.9 4 4 4 Z";
const DOC_PATH =
  "M 4 3 L 14 3 L 20 9 L 20 21 C 20 21.6 19.6 22 19 22 L 4 22 C 3.4 22 3 21.6 3 21 L 3 4 C 3 3.4 3.4 3 4 3 Z";

const WAVE_PATH =
  "M 10 20 Q 25 4, 40 20 Q 55 36, 70 20 Q 85 4, 100 20 Q 115 36, 130 20 Q 145 4, 160 20 Q 175 36, 190 20";
const DOC_LINES_PATH =
  "M 15 10 L 185 10 C 188 10 188 20 185 20 L 15 20 C 12 20 12 30 15 30 L 145 30";

interface RevealSectionProps {
  isActive?: boolean;
}

export function RevealSection({ isActive = true }: RevealSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const periodPathRef = useRef<SVGPathElement>(null);
  const statementWordsRef = useRef<HTMLSpanElement>(null);
  const chipBgRef = useRef<HTMLSpanElement>(null);
  const chipTextRef = useRef<HTMLSpanElement>(null);
  const wavePathRef = useRef<SVGPathElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const headline = headlineRef.current;
      const periodPath = periodPathRef.current;
      const statementWords = statementWordsRef.current;
      const chipBg = chipBgRef.current;
      const chipText = chipTextRef.current;
      const wavePath = wavePathRef.current;
      const copy = copyRef.current;

      if (!isActive || !headline || !statementWords || !copy) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isReduced: "(prefers-reduced-motion: reduce)",
          all: "all",
        },
        (ctx) => {
          const { isReduced } = ctx.conditions as { isReduced: boolean };

          if (isReduced) {
            gsap.set([headline, statementWords, copy, chipBg, chipText], {
              opacity: 1,
              scaleX: 1,
              y: 0,
            });
            return;
          }

          // SplitText headline chars with mask (Preset A)
          const splitHeadline = SplitText.create(headline, {
            type: "chars, words",
            mask: "chars",
          });

          // SplitText statement words (Preset B)
          const splitStatement = SplitText.create(statementWords, {
            type: "words",
            mask: "words",
          });

          // Set initial chip state
          if (chipBg) {
            gsap.set(chipBg, { scaleX: 0, transformOrigin: "left" });
          }
          if (chipText) {
            gsap.set(chipText, { opacity: 0, y: 12 });
          }

          // Entrance timeline
          const tl = gsap.timeline({ delay: 0.08 });

          // 1. Letters rise with masks (Preset A)
          tl.from(splitHeadline.chars, {
            yPercent: 110,
            rotation: 6,
            duration: 0.85,
            stagger: 0.03,
            ease: "power4.out",
          });

          // Final period morphs (MorphSVG)
          if (periodPath) {
            tl.to(
              periodPath,
              {
                morphSVG: BUBBLE_PATH,
                duration: 0.35,
                ease: "power3.inOut",
              },
              "<0.2"
            )
              .to(periodPath, {
                morphSVG: DOC_PATH,
                duration: 0.35,
                ease: "power3.inOut",
              });
          }

          // Below: "Speak once." rises as Preset B
          tl.from(
            splitStatement.words,
            {
              yPercent: 100,
              duration: 0.7,
              stagger: 0.06,
              ease: "power3.out",
            },
            "<0.1"
          );

          // "Submit right." in a teal chip wipes in scaleX 0 -> 1
          if (chipBg && chipText) {
            tl.to(
              chipText,
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power3.out",
              },
              "<0.2"
            );
            tl.to(
              chipBg,
              {
                scaleX: 1,
                duration: 0.45,
                ease: "power3.out",
              },
              "<0.1"
            );
          }

          // Waveform path DRAWS (DrawSVG) left to right
          if (wavePath) {
            tl.fromTo(
              wavePath,
              { drawSVG: "0% 0%" },
              {
                drawSVG: "0% 100%",
                duration: 0.55,
                ease: "power3.out",
              },
              "<0.15"
            );

            tl.to(
              wavePath,
              {
                morphSVG: DOC_LINES_PATH,
                stroke: "#55D69A",
                duration: 0.45,
                ease: "power3.inOut",
              },
              ">0.1"
            );
          }

          // 3. Explanatory copy (Preset C)
          tl.from(
            copy,
            {
              y: 12,
              opacity: 0,
              duration: 0.55,
              ease: "power3.out",
            },
            "<0.1"
          );
        }
      );
    },
    { scope: containerRef, dependencies: [isActive] }
  );

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto text-center flex flex-col items-center justify-center select-none"
    >
      {/* Label (Preset D) */}
      <div className="mb-3">
        <span className="text-[13px] font-mono uppercase tracking-widest text-[#39D7B5] font-medium">
          02 / Product Reveal
        </span>
      </div>

      {/* Headline: "Presenting WisprScribe." in DISPLAY size */}
      <h2
        ref={headlineRef}
        className="font-serif text-[#F5F2E8] tracking-tight leading-[0.98] text-[clamp(3.2rem,7.5vw,7.5rem)] flex items-baseline justify-center"
      >
        <span>Presenting WisprScribe</span>
        {/* Final period is a teal SVG circle that morphs */}
        <span className="inline-block ml-1 align-baseline w-[0.24em] h-[0.24em]">
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full overflow-visible"
            fill="none"
          >
            <path
              ref={periodPathRef}
              d={CIRCLE_PATH}
              fill="#39D7B5"
              stroke="#39D7B5"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      </h2>

      {/* Sub-statement: "Speak once. Submit right." as Preset B */}
      <div className="mt-4 font-serif text-[#F5F2E8] text-[clamp(1.8rem,4vw,3.2rem)] leading-tight flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <span ref={statementWordsRef}>Speak once.</span>
        <span className="relative inline-block align-baseline whitespace-nowrap">
          <span
            ref={chipBgRef}
            className="absolute -inset-x-3 -inset-y-0.5 bg-[#39D7B5] rounded-full rotate-1 origin-left"
            style={{ zIndex: 0 }}
          />
          <span
            ref={chipTextRef}
            className="relative z-10 text-[#050505] font-serif"
          >
            Submit right.
          </span>
        </span>
      </div>

      {/* Waveform Drawing & Morphing into 3 Document lines */}
      <div className="my-5 w-full max-w-xs h-10 flex items-center justify-center">
        <svg
          viewBox="0 0 200 40"
          className="w-full h-full overflow-visible"
          fill="none"
        >
          <path
            ref={wavePathRef}
            d={WAVE_PATH}
            stroke="#39D7B5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Preset C copy */}
      <p
        ref={copyRef}
        className="max-w-2xl text-[17px] sm:text-xl font-sans text-[#A8AAA3] leading-relaxed"
      >
        Turn one spoken event recap into verified, college-ready paperwork.
      </p>
    </div>
  );
}
