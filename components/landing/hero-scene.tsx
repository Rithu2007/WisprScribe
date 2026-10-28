"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

export function HeroScene() {
  const root = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // DESKTOP & TABLET
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hero-eyebrow", { y: 14, autoAlpha: 0, duration: 0.45 })
          .from(".hero-line-1", { y: 48, autoAlpha: 0, duration: 0.75 }, "-=0.25")
          .from(".hero-line-2", { y: 48, autoAlpha: 0, duration: 0.75 }, "-=0.6")
          .from(".hero-copy", { y: 18, autoAlpha: 0, duration: 0.45 }, "-=0.4")
          .from(".hero-btn", { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.4 }, "-=0.25")
          .from(sheetRef.current, { y: 24, scale: 0.96, autoAlpha: 0, duration: 0.7 }, "-=0.4");

        // Subtle scroll exit
        gsap.to(".hero-content-col", {
          y: -40,
          autoAlpha: 0.35,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "center top",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // MOBILE
      mm.add("(max-width: 767px)", () => {
        gsap.from(".hero-mobile-item", {
          y: 20,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
        });
      });

      // REDUCED MOTION
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-eyebrow, .hero-line-1, .hero-line-2, .hero-copy, .hero-btn, .hero-sheet", {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-label="Introduction and problem statement"
      className="relative min-h-[94vh] flex flex-col justify-between pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#F5F2E8] overflow-hidden"
    >
      {/* Restrained Ambient Teal Glow in the Background */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#0A8F7A]/10 rounded-full blur-[140px] pointer-events-none"
        style={{ transform: "translate3d(-50%, 0, 0)" }}
      />

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 z-10 my-auto">
        {/* Left Column: Editorial Headline & Copy */}
        <div className="hero-content-col w-full lg:w-3/5 space-y-6 text-left">
          {/* Eyebrow */}
          <div className="hero-eyebrow hero-mobile-item inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0D0D] border border-white/[0.08] text-[10px] font-mono uppercase tracking-widest text-[#39D7B5] font-semibold">
            <span>WISPRSCRIBE / VOICE-FIRST PAPERWORK</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F2E8] leading-[1.08]">
            <span className="hero-line-1 hero-mobile-item block">
              Bored of making
            </span>
            <span className="hero-line-2 hero-mobile-item block text-[#39D7B5]">
              documents manually?
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="hero-copy hero-mobile-item text-base sm:text-lg lg:text-xl text-[#A8AAA3] max-w-lg leading-relaxed font-sans font-normal">
            One spoken event recap. The paperwork, ready for review.
          </p>

          {/* Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href="#problem"
              className="hero-btn hero-mobile-item px-6 py-3.5 rounded-xl bg-[#0A8F7A] hover:bg-[#0BA68F] text-[#F5F2E8] font-mono text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-[#0A8F7A]/25 transition-all inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5]"
            >
              <span>See how it works</span>
              <ArrowRight className="w-4 h-4 text-[#F5F2E8]" />
            </a>

            <Link
              href="/dashboard"
              className="hero-btn hero-mobile-item px-6 py-3.5 rounded-xl border border-white/[0.12] bg-[#0B0D0D]/60 hover:bg-[#0B0D0D] text-[#F5F2E8] font-mono text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5]"
            >
              <span>Try WisprScribe</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Exactly ONE Visual Object — Single Example Event Recap Sheet */}
        <div className="w-full lg:w-2/5 flex items-center justify-center relative select-none">
          <div
            ref={sheetRef}
            className="hero-sheet hero-mobile-item w-full max-w-sm rounded-2xl bg-[#0B0D0D] border border-white/[0.1] p-6 sm:p-7 shadow-2xl relative transition-all"
            style={{
              boxShadow: "0 0 40px rgba(10, 143, 122, 0.08)",
            }}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest font-semibold text-[#A8AAA3]">
                Example event recap
              </span>
              <span className="w-2 h-2 rounded-full bg-[#39D7B5] animate-pulse" />
            </div>

            {/* Exactly the four required facts */}
            <div className="space-y-4 text-left">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#A8AAA3] block">
                  Event
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F5F2E8]">
                  Web Development Workshop
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#A8AAA3]">
                <span className="text-[#39D7B5]">Saturday</span>
                <span>&bull;</span>
                <span>Seminar Hall 2</span>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-[#F5F2E8] font-semibold">62 attendees</span>
                <span className="text-[#A8AAA3]">Coding Club</span>
              </div>
            </div>

            {/* Subtle bottom edge glow accent */}
            <div className="absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-[#39D7B5]/40 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Subtle Scroll Down Prompt */}
      <div className="w-full flex justify-center items-center text-xs text-[#A8AAA3] pt-6 z-10">
        <a
          href="#problem"
          aria-label="Scroll down to the paperwork movie"
          className="inline-flex flex-col items-center gap-1 hover:text-[#39D7B5] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5] rounded p-1"
        >
          <span className="font-mono text-[9px] tracking-widest uppercase">Scroll to explore</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
