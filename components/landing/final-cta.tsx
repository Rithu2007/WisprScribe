"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

export function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // DESKTOP & TABLET
      mm.add("(min-width: 768px)", () => {
        gsap.from(".final-cta-anim", {
          y: 28,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
          },
        });
      });

      // MOBILE
      mm.add("(max-width: 767px)", () => {
        gsap.from(".final-cta-mobile", {
          y: 20,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
          },
        });
      });

      // REDUCED MOTION
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".final-cta-anim, .final-cta-mobile", { autoAlpha: 1, y: 0 });
      });
    },
    { scope: root }
  );

  return (
    <footer
      ref={root}
      aria-label="Try WisprScribe Call to Action"
      className="relative py-32 px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#F5F2E8] text-center overflow-hidden border-t border-white/[0.06]"
    >
      <div className="max-w-3xl mx-auto w-full space-y-8 z-10 relative">
        {/* Main Heading */}
        <h2 className="final-cta-anim final-cta-mobile font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#F5F2E8] leading-tight">
          Ready to stop rewriting the same event?
        </h2>

        {/* Supporting Text */}
        <p className="final-cta-anim final-cta-mobile text-base sm:text-xl text-[#A8AAA3] max-w-lg mx-auto leading-relaxed font-sans">
          Try WisprScribe with the sample workspace. No login required.
        </p>

        {/* Action Button */}
        <div className="final-cta-anim final-cta-mobile pt-2">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl bg-[#0A8F7A] hover:bg-[#0BA68F] text-[#F5F2E8] font-mono text-xs font-semibold uppercase tracking-wider shadow-xl hover:shadow-[#0A8F7A]/25 transition-all inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5]"
          >
            <span>Try WisprScribe</span>
            <ArrowRight className="w-4 h-4 text-[#F5F2E8]" />
          </Link>
        </div>

        {/* Verified Pilot Result Caption */}
        <div className="final-cta-anim final-cta-mobile pt-6 flex items-center justify-center gap-2 text-xs font-mono text-[#A8AAA3]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#39D7B5]" />
          <span>
            Pilot result: 3 real collegiate events tested. No incorrect extractions were observed during review.
          </span>
        </div>

        {/* Minimal Footer Line */}
        <div className="pt-20 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#A8AAA3]/60 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-bold text-[#F5F2E8]">WisprScribe</span>
            <span>&bull;</span>
            <span>Voice-first paperwork for college events</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#problem" className="hover:text-[#F5F2E8] transition-colors">
              The Problem
            </a>
            <a href="#how-it-works" className="hover:text-[#F5F2E8] transition-colors">
              How it works
            </a>
            <Link href="/dashboard" className="hover:text-[#F5F2E8] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
