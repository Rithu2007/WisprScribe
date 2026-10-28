"use client";

import React, { useRef, useState } from "react";
import {
  Mic,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Printer,
  Copy,
} from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const [copiedState, setCopiedState] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // DESKTOP & TABLET: ScrollTrigger reveals for each chapter
      mm.add("(min-width: 768px)", () => {
        // Intro Header
        gsap.from(".how-intro-anim", {
          y: 28,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".how-intro-block",
            start: "top 80%",
          },
        });

        // Step 1: Speak
        gsap.from(".speak-step-anim", {
          y: 35,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".speak-step-block",
            start: "top 75%",
          },
        });

        // Step 2: Review
        gsap.from(".review-step-anim", {
          y: 28,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".review-step-block",
            start: "top 75%",
          },
        });

        // Step 3: Generate
        gsap.from(".generate-step-anim", {
          y: 32,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".generate-step-block",
            start: "top 75%",
          },
        });
      });

      // MOBILE
      mm.add("(max-width: 767px)", () => {
        gsap.from(".how-mobile-anim", {
          y: 20,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 85%",
          },
        });
      });

      // REDUCED MOTION
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          ".how-intro-anim, .speak-step-anim, .review-step-anim, .generate-step-anim, .how-mobile-anim",
          { autoAlpha: 1, y: 0 }
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      id="how-it-works"
      ref={root}
      aria-label="How WisprScribe Works"
      className="py-28 px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#F5F2E8] space-y-32 relative overflow-hidden"
    >
      {/* Intro Header */}
      <div className="how-intro-block max-w-3xl mx-auto text-center space-y-4">
        <h2 className="how-intro-anim how-mobile-anim font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F2E8]">
          How it works
        </h2>

        <p className="how-intro-anim how-mobile-anim text-base sm:text-lg text-[#A8AAA3] max-w-lg mx-auto leading-relaxed">
          A spoken recap becomes reviewed paperwork in three clear steps.
        </p>
      </div>

      {/* Step 1: Speak */}
      <div className="speak-step-block max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Copy */}
        <div className="space-y-4 text-left">
          <span className="speak-step-anim how-mobile-anim text-xs font-mono uppercase tracking-widest text-[#39D7B5] font-semibold block">
            01 / SPEAK
          </span>

          <h3 className="speak-step-anim how-mobile-anim font-serif text-3xl sm:text-4xl font-bold text-[#F5F2E8] leading-tight">
            Tell us what happened.
          </h3>

          <p className="speak-step-anim how-mobile-anim text-sm sm:text-base text-[#A8AAA3] leading-relaxed">
            Speak naturally using Wispr Flow or the built-in microphone when supported.
          </p>
        </div>

        {/* Right: One Microphone, One Waveform, One Example Transcript */}
        <div className="speak-step-anim how-mobile-anim p-6 sm:p-7 rounded-2xl bg-[#0B0D0D] border border-white/[0.08] shadow-2xl space-y-5 relative">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0A8F7A]/20 flex items-center justify-center text-[#39D7B5]">
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A8AAA3] font-semibold">
                Example event recap
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#39D7B5]/80">
              Illustrative only
            </span>
          </div>

          {/* Thin Waveform */}
          <div className="flex items-center justify-center gap-1.5 h-7 px-4 bg-[#050505] rounded-lg border border-white/[0.04]">
            <span className="w-1 h-2 rounded-full bg-[#0A8F7A]" />
            <span className="w-1 h-4 rounded-full bg-[#39D7B5]" />
            <span className="w-1 h-6 rounded-full bg-[#39D7B5]" />
            <span className="w-1 h-3 rounded-full bg-[#0A8F7A]" />
            <span className="w-1 h-5 rounded-full bg-[#39D7B5]" />
            <span className="w-1 h-2 rounded-full bg-[#0A8F7A]" />
          </div>

          {/* Transcript Box */}
          <div className="p-4 rounded-xl bg-[#050505] border border-white/[0.06] text-xs font-mono text-[#F5F2E8] leading-relaxed">
            &ldquo;We conducted a web development workshop on Saturday in Seminar Hall 2.
            There were 62 attendees. The Coding Club organized it from 10 AM to 1 PM.&rdquo;
          </div>
        </div>
      </div>

      {/* Step 2: Review */}
      <div className="review-step-block max-w-5xl mx-auto space-y-8">
        <div className="max-w-xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#39D7B5] font-semibold block">
            02 / REVIEW
          </span>

          <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2E8] leading-tight">
            Only the facts you actually said.
          </h3>
        </div>

        {/* Exactly 5 Fact Rows */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0B0D0D] border border-white/[0.08] shadow-2xl space-y-3">
          {/* Row 1 */}
          <div className="review-step-anim how-mobile-anim p-3.5 rounded-lg bg-[#050505] border border-white/[0.04] flex items-center justify-between text-xs font-mono">
            <span className="text-[#F5F2E8] font-semibold">Event name</span>
            <span className="inline-flex items-center gap-1.5 text-[#55D69A] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmed</span>
            </span>
          </div>

          {/* Row 2 */}
          <div className="review-step-anim how-mobile-anim p-3.5 rounded-lg bg-[#050505] border border-white/[0.04] flex items-center justify-between text-xs font-mono">
            <span className="text-[#F5F2E8] font-semibold">Venue</span>
            <span className="inline-flex items-center gap-1.5 text-[#55D69A] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmed</span>
            </span>
          </div>

          {/* Row 3 */}
          <div className="review-step-anim how-mobile-anim p-3.5 rounded-lg bg-[#050505] border border-white/[0.04] flex items-center justify-between text-xs font-mono">
            <span className="text-[#F5F2E8] font-semibold">Attendance</span>
            <span className="inline-flex items-center gap-1.5 text-[#55D69A] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmed</span>
            </span>
          </div>

          {/* Row 4 */}
          <div className="review-step-anim how-mobile-anim p-3.5 rounded-lg bg-[#050505] border border-[#E2A83B]/20 flex items-center justify-between text-xs font-mono">
            <span className="text-[#A8AAA3]">Department</span>
            <span className="inline-flex items-center gap-1.5 text-[#E2A83B] font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Confirm this</span>
            </span>
          </div>

          {/* Row 5 */}
          <div className="review-step-anim how-mobile-anim p-3.5 rounded-lg bg-[#050505] border border-[#E2A83B]/20 flex items-center justify-between text-xs font-mono">
            <span className="text-[#A8AAA3]">Exact date</span>
            <span className="inline-flex items-center gap-1.5 text-[#E2A83B] font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Confirm this</span>
            </span>
          </div>

          {/* Trust Principle */}
          <div className="pt-4 border-t border-white/[0.06] text-center">
            <p className="font-serif text-base sm:text-lg text-[#F5F2E8] italic">
              &ldquo;If you did not say it, WisprScribe does not invent it.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Generate */}
      <div className="generate-step-block max-w-5xl mx-auto space-y-8">
        <div className="max-w-xl text-left space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#39D7B5] font-semibold block">
            03 / GENERATE
          </span>

          <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5F2E8] leading-tight">
            One reviewed fact set. Three useful outputs.
          </h3>
        </div>

        {/* Fact Group flowing into 3 Document Previews */}
        <div className="generate-step-anim how-mobile-anim p-6 sm:p-8 rounded-2xl bg-[#0B0D0D] border border-white/[0.08] shadow-2xl space-y-6">
          {/* Output Sheets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Report */}
            <div className="p-4 rounded-xl bg-[#050505] border border-white/[0.08] space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-mono">
                <span className="text-[#F5F2E8] font-semibold">Report</span>
                <span className="text-[#39D7B5]">Ready</span>
              </div>
              <p className="text-[11px] font-mono text-[#A8AAA3] leading-relaxed">
                Post-Event Summary Report formatted for departmental submission and audit records.
              </p>
            </div>

            {/* Follow-up */}
            <div className="p-4 rounded-xl bg-[#050505] border border-white/[0.08] space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-mono">
                <span className="text-[#F5F2E8] font-semibold">Follow-up</span>
                <span className="text-[#39D7B5]">Ready</span>
              </div>
              <p className="text-[11px] font-mono text-[#A8AAA3] leading-relaxed">
                Official transmission letter with student submitter details and signature blocks.
              </p>
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-xl bg-[#050505] border border-white/[0.08] space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-mono">
                <span className="text-[#F5F2E8] font-semibold">WhatsApp</span>
                <span className="text-[#39D7B5]">Ready</span>
              </div>
              <p className="text-[11px] font-mono text-[#A8AAA3] leading-relaxed">
                Copy-ready community announcement formatted for broadcast channels.
              </p>
            </div>
          </div>

          {/* Action Labels & Disclaimer */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/[0.06] text-xs font-mono text-[#A8AAA3]">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setCopiedState(true);
                  setTimeout(() => setCopiedState(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 hover:text-[#F5F2E8] transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#39D7B5]" />
                <span>{copiedState ? "Copied!" : "Copy announcement"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 hover:text-[#F5F2E8] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#39D7B5]" />
                <span>Print document</span>
              </button>
            </div>

            <div className="text-[11px] text-[#A8AAA3] italic">
              Sample format — not an official college template.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
