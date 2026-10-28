"use client";

import React, { useRef } from "react";
import { FileText, Send, Clock } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

export function ProblemMovie() {
  const root = useRef<HTMLElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const recapCardRef = useRef<HTMLDivElement>(null);
  const docReportRef = useRef<HTMLDivElement>(null);
  const docFollowupRef = useRef<HTMLDivElement>(null);
  const docWhatsappRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // DESKTOP: Scrubbed pinned product film
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "clamp(+=900px +=1200px)",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Set initial positions
        gsap.set([docReportRef.current, docFollowupRef.current, docWhatsappRef.current], {
          autoAlpha: 0,
          scale: 0.98,
        });

        // LABEL: recap
        tl.addLabel("recap")
          .to(".movie-statement-1", { autoAlpha: 1, y: 0, duration: 0.2 }, "recap")
          .to(recapCardRef.current, { scale: 1, duration: 0.2 }, "<")

          // LABEL: split
          .addLabel("split", "+=0.15")
          .to(".movie-statement-1", { autoAlpha: 0.2, duration: 0.15 }, "split")
          .to(".movie-statement-2", { autoAlpha: 1, y: 0, duration: 0.25 }, "split")
          .to(recapCardRef.current, { x: -28, duration: 0.35, ease: "power2.out" }, "split")
          .fromTo(
            docReportRef.current,
            { x: -32, y: 12, autoAlpha: 0, scale: 0.98 },
            { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" },
            "split+=0.06"
          )
          .fromTo(
            docFollowupRef.current,
            { x: 32, y: 18, autoAlpha: 0, scale: 0.98 },
            { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" },
            "split+=0.12"
          )
          .fromTo(
            docWhatsappRef.current,
            { y: 22, autoAlpha: 0, scale: 0.98 },
            { y: 0, autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" },
            "split+=0.18"
          )

          // LABEL: repeat
          .addLabel("repeat", "+=0.15")
          .to(".movie-statement-2", { autoAlpha: 0.2, duration: 0.15 }, "repeat")
          .to(".movie-statement-3", { autoAlpha: 1, y: 0, duration: 0.25 }, "repeat")
          .to(
            ".repeat-fact-badge",
            {
              backgroundColor: "rgba(57, 215, 181, 0.12)",
              borderColor: "rgba(57, 215, 181, 0.4)",
              color: "#39D7B5",
              duration: 0.3,
              stagger: 0.04,
            },
            "repeat"
          )

          // LABEL: friction
          .addLabel("friction", "+=0.15")
          .to(".movie-statement-3", { autoAlpha: 0.2, duration: 0.15 }, "friction")
          .to(".movie-statement-4", { autoAlpha: 1, y: 0, duration: 0.3 }, "friction")
          .to(docReportRef.current, { x: -8, y: -6, rotate: -1.5, duration: 0.25 }, "friction")
          .to(docFollowupRef.current, { y: 10, rotate: 1, duration: 0.25 }, "friction")
          .to(docWhatsappRef.current, { x: 8, y: -4, rotate: 2, duration: 0.25 }, "friction")

          // LABEL: resolve
          .addLabel("resolve", "+=0.2")
          .to(
            [docReportRef.current, docFollowupRef.current, docWhatsappRef.current],
            {
              autoAlpha: 0,
              scale: 0.92,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.4,
              ease: "power2.inOut",
            },
            "resolve"
          )
          .to(".movie-statement-4", { autoAlpha: 0, duration: 0.25 }, "resolve")
          .to(
            recapCardRef.current,
            {
              x: 0,
              scale: 1.04,
              borderColor: "#0A8F7A",
              boxShadow: "0 0 50px rgba(10, 143, 122, 0.2)",
              duration: 0.4,
            },
            "resolve+=0.1"
          )
          .to(
            root.current,
            {
              backgroundColor: "#050505",
              duration: 0.4,
            },
            "resolve"
          );
      });

      // MOBILE & TABLET: Simplified normal-flow reveals
      mm.add("(max-width: 1023px)", () => {
        gsap.from(".movie-statement-mobile", {
          y: 20,
          autoAlpha: 0,
          stagger: 0.12,
          scrollTrigger: {
            trigger: narrativeRef.current,
            start: "top 80%",
          },
        });

        gsap.from(
          [docReportRef.current, docFollowupRef.current, docWhatsappRef.current],
          {
            y: 30,
            autoAlpha: 0,
            stagger: 0.15,
            scrollTrigger: {
              trigger: docReportRef.current,
              start: "top 85%",
            },
          }
        );
      });

      // REDUCED MOTION
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".movie-statement-1",
            ".movie-statement-2",
            ".movie-statement-3",
            ".movie-statement-4",
            recapCardRef.current,
            docReportRef.current,
            docFollowupRef.current,
            docWhatsappRef.current,
            ".repeat-fact-badge",
          ],
          { autoAlpha: 1, scale: 1, y: 0, x: 0, rotate: 0 }
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      id="problem"
      ref={root}
      aria-label="The paperwork repetition movie"
      className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0D0D] text-[#F5F2E8] transition-colors duration-500 overflow-hidden flex flex-col justify-center"
    >
      <div className="max-w-6xl mx-auto w-full space-y-10 z-10">
        {/* Narrative Statements Track */}
        <div
          ref={narrativeRef}
          className="relative max-w-xl mx-auto text-center min-h-[5.5rem] flex items-center justify-center"
        >
          <div className="space-y-1">
            <h2 className="movie-statement-1 movie-statement-mobile font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F2E8]">
              One event.
            </h2>
            <h2 className="movie-statement-2 movie-statement-mobile font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#39D7B5] opacity-0 lg:opacity-0">
              The same facts.
            </h2>
            <h2 className="movie-statement-3 movie-statement-mobile font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F2E8] opacity-0 lg:opacity-0">
              Three documents.
            </h2>
            <h2 className="movie-statement-4 movie-statement-mobile font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#E2A83B] opacity-0 lg:opacity-0">
              Too much retyping.
            </h2>
          </div>
        </div>

        {/* Central Spoken Recap Card */}
        <div
          ref={recapCardRef}
          className="max-w-md mx-auto p-5 sm:p-6 rounded-2xl bg-[#050505] border border-white/[0.1] shadow-2xl text-left space-y-3 relative transition-all"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold text-[#A8AAA3]">
              Example event recap
            </span>
            <span className="text-[10px] font-mono text-[#39D7B5]">
              Spoken once
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono text-[#F5F2E8]">
            <div className="font-semibold text-sm text-[#F5F2E8]">
              Web Development Workshop
            </div>
            <div className="text-[#A8AAA3]">
              Saturday &bull; Seminar Hall 2
            </div>
            <div className="text-[#A8AAA3]">
              62 attendees &bull; Coding Club
            </div>
          </div>
        </div>

        {/* 3 Abstract Document Sheets Requiring Retyping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Document 1: Report */}
          <div
            ref={docReportRef}
            className="p-5 rounded-xl bg-[#050505] border border-white/[0.08] shadow-lg space-y-3 text-left relative overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-xs font-mono text-[#F5F2E8]">
              <FileText className="w-3.5 h-3.5 text-[#39D7B5]" />
              <span className="font-semibold">Report</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-[#A8AAA3]">
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Web Development Workshop
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Saturday
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Seminar Hall 2
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                62 attendees
              </div>
            </div>
          </div>

          {/* Document 2: Follow-up */}
          <div
            ref={docFollowupRef}
            className="p-5 rounded-xl bg-[#050505] border border-white/[0.08] shadow-lg space-y-3 text-left relative overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-xs font-mono text-[#F5F2E8]">
              <FileText className="w-3.5 h-3.5 text-[#39D7B5]" />
              <span className="font-semibold">Follow-up</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-[#A8AAA3]">
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Web Development Workshop
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Saturday
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Seminar Hall 2
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                62 attendees
              </div>
            </div>
          </div>

          {/* Document 3: WhatsApp */}
          <div
            ref={docWhatsappRef}
            className="p-5 rounded-xl bg-[#050505] border border-white/[0.08] shadow-lg space-y-3 text-left relative overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-xs font-mono text-[#F5F2E8]">
              <Send className="w-3.5 h-3.5 text-[#39D7B5]" />
              <span className="font-semibold">WhatsApp</span>
            </div>
            <div className="space-y-2 text-xs font-mono text-[#A8AAA3]">
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Web Development Workshop
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Saturday
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                Seminar Hall 2
              </div>
              <div className="repeat-fact-badge px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-[#F5F2E8]">
                62 attendees
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
