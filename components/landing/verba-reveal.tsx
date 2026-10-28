"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Send } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

export function VerbaReveal() {
  const root = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const outputsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // DESKTOP: Scrubbed reveal with exact labels
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=950",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Initial states
        gsap.set(lineRef.current, { scaleX: 0.05, autoAlpha: 0.4 });
        gsap.set(waveformRef.current, { autoAlpha: 0, scaleY: 0.3 });
        gsap.set(wordmarkRef.current, { autoAlpha: 0, y: 32, clipPath: "inset(0 0 100% 0)" });
        gsap.set(messageRef.current, { autoAlpha: 0, y: 20 });
        gsap.set(outputsRef.current, { autoAlpha: 0, y: 16 });
        gsap.set(ctaRef.current, { autoAlpha: 0, y: 16 });

        // Sequence with exact labels
        tl.addLabel("line")
          .to(lineRef.current, { scaleX: 1, autoAlpha: 1, duration: 0.35, ease: "power2.out" }, "line")

          .addLabel("waveform", "line+=0.25")
          .to(lineRef.current, { autoAlpha: 0, duration: 0.15 }, "waveform")
          .to(waveformRef.current, { autoAlpha: 1, scaleY: 1, duration: 0.35, ease: "power2.out" }, "waveform")

          .addLabel("wordmark", "waveform+=0.3")
          .to(
            wordmarkRef.current,
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.55,
              ease: "power3.out",
            },
            "wordmark"
          )

          .addLabel("message", "wordmark+=0.35")
          .to(
            messageRef.current,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
            },
            "message"
          )

          .addLabel("outputs", "message+=0.25")
          .to(
            outputsRef.current,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.35,
              ease: "power2.out",
            },
            "outputs"
          )

          .addLabel("cta", "outputs+=0.25")
          .to(
            ctaRef.current,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.35,
              ease: "power2.out",
            },
            "cta"
          );
      });

      // MOBILE & TABLET: Standard reveal on scroll
      mm.add("(max-width: 1023px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
          },
          defaults: { ease: "power2.out" },
        });

        tl.from(lineRef.current, { scaleX: 0.1, autoAlpha: 0, duration: 0.4 })
          .from(waveformRef.current, { autoAlpha: 0, duration: 0.4 }, "-=0.2")
          .from(wordmarkRef.current, { autoAlpha: 0, y: 24, duration: 0.5 }, "-=0.2")
          .from(messageRef.current, { autoAlpha: 0, y: 16, duration: 0.4 }, "-=0.25")
          .from(outputsRef.current, { autoAlpha: 0, y: 14, duration: 0.35 }, "-=0.2")
          .from(ctaRef.current, { autoAlpha: 0, y: 14, duration: 0.35 }, "-=0.15");
      });

      // REDUCED MOTION
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            lineRef.current,
            waveformRef.current,
            wordmarkRef.current,
            messageRef.current,
            outputsRef.current,
            ctaRef.current,
          ],
          { autoAlpha: 1, scaleX: 1, scaleY: 1, y: 0, clipPath: "inset(0 0 0% 0)" }
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-label="WisprScribe product reveal"
      className="relative min-h-[90vh] py-28 px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#F5F2E8] flex flex-col items-center justify-center text-center overflow-hidden"
    >
      {/* Background Subtle Radial Atmosphere */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-[#0A8F7A]/10 blur-[130px] pointer-events-none -top-24 left-1/2 -translate-x-1/2"
        style={{ transform: "translate3d(-50%, 0, 0)" }}
      />

      <div className="max-w-4xl mx-auto w-full space-y-8 z-10 my-auto">
        {/* Step 1: Thin Horizontal Line derived from previous sheet */}
        <div className="w-full max-w-xs mx-auto h-8 flex items-center justify-center relative">
          <div
            ref={lineRef}
            className="w-full h-px bg-gradient-to-r from-transparent via-[#39D7B5] to-transparent origin-center"
          />

          {/* Step 2: Waveform that emerges from the line */}
          <div
            ref={waveformRef}
            className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 origin-center"
          >
            <span className="w-1 h-2 rounded-full bg-[#39D7B5]/40" />
            <span className="w-1 h-5 rounded-full bg-[#39D7B5]/70" />
            <span className="w-1 h-8 rounded-full bg-[#39D7B5]" />
            <span className="w-1.5 h-6 rounded-full bg-[#F5F2E8]" />
            <span className="w-1 h-10 rounded-full bg-[#39D7B5]" />
            <span className="w-1.5 h-5 rounded-full bg-[#F5F2E8]" />
            <span className="w-1 h-7 rounded-full bg-[#39D7B5]" />
            <span className="w-1 h-3 rounded-full bg-[#39D7B5]/40" />
          </div>
        </div>

        {/* Step 3: WisprScribe Wordmark */}
        <div>
          <h2
            ref={wordmarkRef}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#F5F2E8] leading-none"
          >
            Presenting WisprScribe<span className="text-[#39D7B5]">.</span>
          </h2>
        </div>

        {/* Step 4: Supporting Text & Tagline */}
        <div ref={messageRef} className="space-y-2 max-w-xl mx-auto">
          <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-[#A8AAA3]">
            Voice-first paperwork for college events.
          </p>

          <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#F5F2E8] tracking-wide pt-1">
            Speak once. <span className="font-semibold text-[#39D7B5]">Submit right.</span>
          </p>
        </div>

        {/* Step 5: Three Output Labels (Report / Follow-up / WhatsApp) */}
        <div
          ref={outputsRef}
          className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-[#A8AAA3]"
        >
          <div className="px-3.5 py-1.5 rounded-lg bg-[#0B0D0D] border border-white/[0.08] inline-flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#39D7B5]" />
            <span>Report</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-[#0B0D0D] border border-white/[0.08] inline-flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#39D7B5]" />
            <span>Follow-up</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-[#0B0D0D] border border-white/[0.08] inline-flex items-center gap-2">
            <Send className="w-3.5 h-3.5 text-[#39D7B5]" />
            <span>WhatsApp</span>
          </div>
        </div>

        {/* Step 6: CTA */}
        <div ref={ctaRef} className="pt-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-[#0A8F7A] hover:bg-[#0BA68F] text-[#F5F2E8] font-mono text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-[#0A8F7A]/25 transition-all inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5]"
          >
            <span>Try WisprScribe</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F5F2E8]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
