"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";

interface CtaSectionProps {
  isActive?: boolean;
}

export function CtaSection({ isActive = true }: CtaSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const chipBgRef = useRef<HTMLSpanElement>(null);
  const chipTextRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    (context, contextSafe) => {
      const headline = headlineRef.current;
      const chipBg = chipBgRef.current;
      const chipText = chipTextRef.current;
      const copy = copyRef.current;
      const actions = actionsRef.current;
      const btn = buttonRef.current;

      if (!isActive || !headline || !copy) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isReduced: "(prefers-reduced-motion: reduce)",
          all: "all",
        },
        (ctx) => {
          const { isReduced } = ctx.conditions as { isReduced: boolean };

          if (isReduced) {
            gsap.set([headline, copy, chipBg, actions], {
              opacity: 1,
              scaleX: 1,
              y: 0,
            });
            return;
          }

          // SplitText headline words with mask (Preset B: Statement)
          const splitHeadline = SplitText.create(headline, {
            type: "words",
            mask: "words",
          });

          // SplitText copy lines (Preset C: Small)
          const splitCopy = SplitText.create(copy, {
            type: "lines",
          });

          if (chipBg) {
            gsap.set(chipBg, { scaleX: 0, transformOrigin: "left" });
          }

          const tl = gsap.timeline({ delay: 0.1 });

          // Headline words rise (Preset B)
          tl.from(splitHeadline.words, {
            yPercent: 100,
            duration: 0.85,
            stagger: 0.08,
            ease: "power3.out",
          });

          // "same event?" teal chip wipes in scaleX 0 -> 1, 0.5s power3.out, 0.2s after word lands
          if (chipBg && chipText) {
            tl.to(
              chipBg,
              {
                scaleX: 1,
                duration: 0.5,
                ease: "power3.out",
              },
              "<0.2"
            );
            tl.to(
              chipText,
              {
                color: "#050505",
                duration: 0.3,
                ease: "power3.out",
              },
              "<0.1"
            );
          }

          // Preset C copy lines fade up 14px
          tl.from(
            splitCopy.lines,
            {
              y: 14,
              opacity: 0,
              duration: 0.65,
              stagger: 0.1,
              ease: "power3.out",
            },
            "<0.2"
          );

          // Actions & Button fade up 10px (Preset D)
          if (actions) {
            tl.from(
              actions,
              {
                opacity: 0,
                y: 10,
                duration: 0.6,
                ease: "power3.out",
                clearProps: "all",
              },
              "<0.2"
            );
          }

          // Magnetic hover effect on primary button using quickTo
          if (btn && contextSafe) {
            const xTo = gsap.quickTo(btn, "x", {
              duration: 0.4,
              ease: "power3.out",
            });
            const yTo = gsap.quickTo(btn, "y", {
              duration: 0.4,
              ease: "power3.out",
            });

            const onMouseMove = contextSafe((e: MouseEvent) => {
              const rect = btn.getBoundingClientRect();
              const relX = e.clientX - (rect.left + rect.width / 2);
              const relY = e.clientY - (rect.top + rect.height / 2);
              xTo(relX * 0.25);
              yTo(relY * 0.25);
            });

            const onMouseLeave = contextSafe(() => {
              xTo(0);
              yTo(0);
            });

            btn.addEventListener("mousemove", onMouseMove);
            btn.addEventListener("mouseleave", onMouseLeave);
          }
        }
      );
    },
    { scope: containerRef, dependencies: [isActive] }
  );

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center select-none"
    >
      {/* Eyebrow Label (Preset D) */}
      <div className="mb-4">
        <span className="text-[13px] font-mono uppercase tracking-widest text-[#39D7B5] font-medium">
          04 / Get Started
        </span>
      </div>

      {/* Statement Headline (Preset B) */}
      <h2
        ref={headlineRef}
        className="font-serif text-[#F5F2E8] tracking-tight leading-[1.05] text-[clamp(2.4rem,5.5vw,5.5rem)]"
      >
        Ready to stop rewriting the{" "}
        <span className="relative inline-block align-baseline whitespace-nowrap">
          <span
            ref={chipBgRef}
            className="absolute -inset-x-3 -inset-y-1 bg-[#39D7B5] rounded-full rotate-1 origin-left"
            style={{ zIndex: 0 }}
          />
          <span
            ref={chipTextRef}
            className="relative z-10 text-[#F5F2E8] font-serif"
          >
            same event?
          </span>
        </span>
      </h2>

      {/* Preset C copy */}
      <p
        ref={copyRef}
        className="mt-6 max-w-2xl text-[17px] sm:text-xl font-sans text-[#A8AAA3] leading-relaxed"
      >
        Open the WisprScribe dashboard to review sample collegiate recaps or start your own.
      </p>

      {/* Direct Actions (Preset D) */}
      <div
        ref={actionsRef}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
      >
        {/* Magnetic Primary Button */}
        <Link
          ref={buttonRef}
          href="/dashboard"
          className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#39D7B5] text-[#050505] font-sans font-semibold text-base shadow-lg shadow-[#39D7B5]/20 hover:shadow-[#39D7B5]/40 hover:bg-[#4ff2cf] transition-all cursor-pointer"
        >
          <span>Try WisprScribe</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Secondary Text Action */}
        <Link
          href="/events/new"
          className="text-xs font-mono uppercase tracking-widest text-[#A8AAA3] hover:text-[#F5F2E8] transition-colors py-2 px-4 cursor-pointer"
        >
          Start an event recap →
        </Link>
      </div>
    </div>
  );
}
