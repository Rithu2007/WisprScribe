"use client";

import React, { useRef } from "react";
import {
  gsap,
  useGSAP,
  SplitText,
  ScrollTrigger,
  DrawSVGPlugin,
} from "@/lib/gsap";
import {
  TealArrowIcon,
  CheckmarkIcon,
  DocumentIcon,
  SpeechBubbleIcon,
} from "./verba-icons";

export function WorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Panel 1 refs
  const panel1StatementRef = useRef<HTMLHeadingElement>(null);
  const waveSvgPathRef = useRef<SVGPathElement>(null);
  const transcriptRef = useRef<HTMLParagraphElement>(null);

  // Panel 2 refs
  const panel2StatementRef = useRef<HTMLHeadingElement>(null);
  const panel2RowsRef = useRef<HTMLDivElement>(null);
  const trustStatementRef = useRef<HTMLParagraphElement>(null);
  const trustChipBgRef = useRef<HTMLSpanElement>(null);
  const trustChipTextRef = useRef<HTMLSpanElement>(null);

  // Panel 3 refs
  const panel3StatementRef = useRef<HTMLHeadingElement>(null);
  const genLinesRef = useRef<SVGSVGElement>(null);
  const docLabelsRef = useRef<HTMLDivElement>(null);

  // Tick labels
  const tick1Ref = useRef<HTMLSpanElement>(null);
  const tick2Ref = useRef<HTMLSpanElement>(null);
  const tick3Ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      const track = trackRef.current;
      const progressBar = progressBarRef.current;

      if (!section || !heading || !track) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          isReduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, isReduced } = ctx.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            isReduced: boolean;
          };

          if (isReduced) {
            gsap.set(
              [
                heading,
                panel1StatementRef.current,
                transcriptRef.current,
                panel2StatementRef.current,
                panel2RowsRef.current,
                trustStatementRef.current,
                trustChipBgRef.current,
                panel3StatementRef.current,
                docLabelsRef.current,
              ],
              { opacity: 1, y: 0, scaleX: 1 }
            );
            return;
          }

          if (trustChipBgRef.current) {
            gsap.set(trustChipBgRef.current, { scaleX: 0, transformOrigin: "left" });
          }

          // Heading entrance when section scrolls into view
          const headingWords = heading.querySelectorAll(".step-word");
          gsap.from(headingWords, {
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
            yPercent: 100,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
          });

          if (isDesktop) {
            // DESKTOP: Pinned horizontal track scrub
            const scrubTl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                pin: true,
                scrub: 1,
                start: "top top",
                end: "+=220%",
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  const p = self.progress;
                  if (progressBar) {
                    gsap.set(progressBar, { scaleX: p });
                  }
                  if (tick1Ref.current && tick2Ref.current && tick3Ref.current) {
                    if (p < 0.35) {
                      tick1Ref.current.style.color = "#39D7B5";
                      tick2Ref.current.style.color = "#A8AAA3";
                      tick3Ref.current.style.color = "#A8AAA3";
                    } else if (p < 0.72) {
                      tick1Ref.current.style.color = "#A8AAA3";
                      tick2Ref.current.style.color = "#39D7B5";
                      tick3Ref.current.style.color = "#A8AAA3";
                    } else {
                      tick1Ref.current.style.color = "#A8AAA3";
                      tick2Ref.current.style.color = "#A8AAA3";
                      tick3Ref.current.style.color = "#39D7B5";
                    }
                  }
                },
              },
            });

            // Stage 1: Panel 1 reveals
            if (waveSvgPathRef.current) {
              scrubTl.fromTo(
                waveSvgPathRef.current,
                { drawSVG: "0% 0%" },
                { drawSVG: "0% 100%", duration: 0.6, ease: "power3.out" }
              );
            }

            if (transcriptRef.current) {
              const splitTrans = SplitText.create(transcriptRef.current, {
                type: "words",
              });
              scrubTl.from(
                splitTrans.words,
                {
                  opacity: 0,
                  y: 10,
                  duration: 0.6,
                  stagger: 0.025,
                  ease: "power3.out",
                },
                "<0.1"
              );
            }

            // Stage 2: Move track to Panel 2
            scrubTl.to(track, {
              xPercent: -33.333,
              duration: 1.0,
              ease: "none",
            });

            // Panel 2 reveals: 5 fact rows
            const rows = panel2RowsRef.current?.querySelectorAll(".fact-row") || [];
            const checks = panel2RowsRef.current?.querySelectorAll(".check-path") || [];
            const amberConfirm = panel2RowsRef.current?.querySelector(".amber-confirm");

            if (rows.length > 0) {
              scrubTl.from(
                rows,
                { opacity: 0, y: 12, duration: 0.5, stagger: 0.12, ease: "power3.out" },
                "<0.1"
              );
            }

            if (checks.length > 0) {
              scrubTl.fromTo(
                checks,
                { drawSVG: "0% 0%" },
                { drawSVG: "0% 100%", duration: 0.35, stagger: 0.08, ease: "power3.out" },
                "<0.15"
              );
            }

            if (amberConfirm) {
              scrubTl.from(
                amberConfirm,
                { scaleX: 0, duration: 0.4, transformOrigin: "left", ease: "power3.out" },
                "<0.2"
              );
            }

            // Trust rule statement below
            if (trustStatementRef.current) {
              const splitTrust = SplitText.create(trustStatementRef.current, {
                type: "words",
                mask: "words",
              });
              scrubTl.from(
                splitTrust.words,
                { yPercent: 100, duration: 0.5, stagger: 0.05, ease: "power3.out" },
                ">0.05"
              );

              if (trustChipBgRef.current && trustChipTextRef.current) {
                scrubTl.to(
                  trustChipBgRef.current,
                  { scaleX: 1, duration: 0.4, ease: "power3.out" },
                  "<0.2"
                );
                scrubTl.to(
                  trustChipTextRef.current,
                  { color: "#050505", duration: 0.3, ease: "power3.out" },
                  "<0.1"
                );
              }
            }

            // Stage 3: Move track to Panel 3
            scrubTl.to(track, {
              xPercent: -66.666,
              duration: 1.0,
              ease: "none",
            });

            // Panel 3 reveals
            if (panel3StatementRef.current) {
              const splitP3 = SplitText.create(panel3StatementRef.current, {
                type: "words",
                mask: "words",
              });
              scrubTl.from(
                splitP3.words,
                { yPercent: 100, duration: 0.5, stagger: 0.05, ease: "power3.out" },
                "<0.1"
              );
            }

            const genPaths = genLinesRef.current?.querySelectorAll("path") || [];
            if (genPaths.length > 0) {
              scrubTl.fromTo(
                genPaths,
                { drawSVG: "0% 0%" },
                { drawSVG: "0% 100%", duration: 0.5, stagger: 0.1, ease: "power3.out" },
                "<0.2"
              );
            }

            const docItems = docLabelsRef.current?.querySelectorAll(".doc-item") || [];
            if (docItems.length > 0) {
              scrubTl.from(
                docItems,
                { opacity: 0, y: 10, duration: 0.4, stagger: 0.1, ease: "power3.out" },
                "<0.2"
              );
            }
          } else {
            // MOBILE: Stacked vertically
            const panels = gsap.utils.toArray<HTMLElement>(".workflow-panel");
            panels.forEach((p) => {
              gsap.from(p, {
                scrollTrigger: {
                  trigger: p,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: "power3.out",
              });
            });
          }
        }
      );

      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="relative w-full min-h-screen pt-28 pb-16 scroll-mt-24 flex flex-col justify-between border-b border-white/[0.08] bg-[#050505] overflow-hidden"
    >
      {/* Top Header: Always visible anchor at top */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 w-full mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[13px] font-mono uppercase tracking-widest text-[#39D7B5] font-medium">
            03 / How It Works
          </span>
        </div>

        {/* Heading: Speak → Review → Generate (ONE line, sized with clamp so it never wraps) */}
        <h2
          ref={headingRef}
          className="font-serif text-[#F5F2E8] tracking-tight leading-none text-[clamp(1.75rem,4.2vw,4.2rem)] whitespace-nowrap overflow-hidden"
        >
          <span className="inline-block overflow-hidden align-top">
            <span className="step-word inline-block">Speak</span>
          </span>
          <span className="mx-2 sm:mx-4 inline-block align-middle">
            <TealArrowIcon />
          </span>
          <span className="inline-block overflow-hidden align-top">
            <span className="step-word inline-block">Review</span>
          </span>
          <span className="mx-2 sm:mx-4 inline-block align-middle">
            <TealArrowIcon />
          </span>
          <span className="inline-block overflow-hidden align-top text-[#39D7B5]">
            <span className="step-word inline-block">Generate</span>
          </span>
        </h2>
      </div>

      {/* Horizontal Scrub Track (Desktop: 300% width, Mobile: w-full stacked) */}
      <div className="w-full overflow-hidden flex-1 flex items-center">
        <div
          ref={trackRef}
          className="flex flex-col md:flex-row w-full md:w-[300%] transition-none"
        >
          {/* ================= PANEL 01: SPEAK ================= */}
          <div className="workflow-panel w-full md:w-[100vw] shrink-0 px-6 sm:px-10 lg:px-16 flex flex-col justify-center py-6">
            <div className="max-w-[1000px] w-full">
              {/* Huge step number (Preset D) */}
              <div className="font-serif text-[clamp(4rem,9vw,7.5rem)] text-white/15 leading-none mb-1 font-bold select-none">
                01
              </div>

              {/* Statement (Preset B) */}
              <h3
                ref={panel1StatementRef}
                className="font-serif text-[#F5F2E8] text-[clamp(2rem,4.5vw,4rem)] leading-tight mb-4"
              >
                Tell us what happened.
              </h3>

              {/* SVG Waveform draws (DrawSVG) */}
              <div className="w-full max-w-lg h-9 mb-5">
                <svg
                  viewBox="0 0 500 40"
                  className="w-full h-full overflow-visible"
                  fill="none"
                >
                  <path
                    ref={waveSvgPathRef}
                    d="M 0 20 Q 25 2, 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 T 450 20 T 500 20"
                    stroke="#39D7B5"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Transcript fills in word by word (Preset C) */}
              <p
                ref={transcriptRef}
                className="text-[18px] sm:text-xl font-sans text-[#A8AAA3] max-w-2xl leading-relaxed border-l-2 border-[#39D7B5]/50 pl-4"
              >
                &ldquo;We hosted the annual robotics symposium today at 10 AM in
                Hall B with 85 registered attendees, followed by the faculty debrief.&rdquo;
              </p>
            </div>
          </div>

          {/* ================= PANEL 02: REVIEW ================= */}
          <div className="workflow-panel w-full md:w-[100vw] shrink-0 px-6 sm:px-10 lg:px-16 flex flex-col justify-center py-6">
            <div className="max-w-[1000px] w-full">
              {/* Huge step number (Preset D) */}
              <div className="font-serif text-[clamp(4rem,9vw,7.5rem)] text-white/15 leading-none mb-1 font-bold select-none">
                02
              </div>

              {/* Five Fact Rows Only (Preset C/D): Thin 1px rules, no filled cards */}
              <div
                ref={panel2RowsRef}
                className="w-full max-w-xl border-t border-white/[0.15] mb-5"
              >
                {/* Row 1 */}
                <div className="fact-row py-2.5 border-b border-white/[0.15] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#55D69A]" fill="none">
                      <path
                        className="check-path"
                        d="M4 12l5 5L20 6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#A8AAA3]">
                      Event Name
                    </span>
                  </div>
                  <span className="text-[16px] text-[#F5F2E8] font-sans font-medium">
                    Annual Robotics Symposium
                  </span>
                </div>

                {/* Row 2 */}
                <div className="fact-row py-2.5 border-b border-white/[0.15] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#55D69A]" fill="none">
                      <path
                        className="check-path"
                        d="M4 12l5 5L20 6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#A8AAA3]">
                      Timestamp
                    </span>
                  </div>
                  <span className="text-[16px] text-[#F5F2E8] font-sans font-medium">
                    Today • 10:00 AM
                  </span>
                </div>

                {/* Row 3 */}
                <div className="fact-row py-2.5 border-b border-white/[0.15] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#55D69A]" fill="none">
                      <path
                        className="check-path"
                        d="M4 12l5 5L20 6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#A8AAA3]">
                      Venue
                    </span>
                  </div>
                  <span className="text-[16px] text-[#F5F2E8] font-sans font-medium">
                    Auditorium Hall B
                  </span>
                </div>

                {/* Row 4 */}
                <div className="fact-row py-2.5 border-b border-white/[0.15] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#55D69A]" fill="none">
                      <path
                        className="check-path"
                        d="M4 12l5 5L20 6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#A8AAA3]">
                      Turnout
                    </span>
                  </div>
                  <span className="text-[16px] text-[#F5F2E8] font-sans font-medium">
                    85 Registered Attendees
                  </span>
                </div>

                {/* Row 5: Missing row gets amber "Confirm this" chip */}
                <div className="fact-row py-2.5 border-b border-white/[0.15] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full border border-[#E2A83B] flex items-center justify-center text-[9px] text-[#E2A83B] font-mono">
                      ?
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#A8AAA3]">
                      Budget Sanction
                    </span>
                  </div>
                  <span className="amber-confirm inline-block bg-[#E2A83B] text-[#050505] font-mono text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    Confirm this
                  </span>
                </div>
              </div>

              {/* Large statement below: "If you did not say it, WisprScribe does not invent it." */}
              <p
                ref={trustStatementRef}
                className="font-serif text-[#F5F2E8] text-[clamp(1.75rem,3.5vw,3rem)] leading-tight max-w-2xl"
              >
                If you did not say it, WisprScribe does not{" "}
                <span className="relative inline-block align-baseline">
                  <span
                    ref={trustChipBgRef}
                    className="absolute -inset-x-2 -inset-y-0.5 bg-[#39D7B5] rounded-full -rotate-1 origin-left"
                    style={{ zIndex: 0 }}
                  />
                  <span
                    ref={trustChipTextRef}
                    className="relative z-10 text-[#F5F2E8]"
                  >
                    invent it.
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* ================= PANEL 03: GENERATE ================= */}
          <div className="workflow-panel w-full md:w-[100vw] shrink-0 px-6 sm:px-10 lg:px-16 flex flex-col justify-center py-6">
            <div className="max-w-[1000px] w-full">
              {/* Huge step number (Preset D) */}
              <div className="font-serif text-[clamp(4rem,9vw,7.5rem)] text-white/15 leading-none mb-1 font-bold select-none">
                03
              </div>

              {/* Statement (Preset B) */}
              <h3
                ref={panel3StatementRef}
                className="font-serif text-[#F5F2E8] text-[clamp(2rem,4.5vw,4rem)] leading-tight mb-6"
              >
                Three formal documents in one click.
              </h3>

              {/* Compact Facts Group with 3 lines drawn out to three labels */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 max-w-2xl">
                {/* Origin Facts Group */}
                <div className="px-4 py-3 border border-white/20 text-[#F5F2E8] font-mono text-xs uppercase tracking-wider rounded-lg shrink-0">
                  Reviewed Ledger (5 Facts)
                </div>

                {/* Drawn Connecting Lines */}
                <div className="w-20 h-20 hidden md:block shrink-0">
                  <svg
                    ref={genLinesRef}
                    viewBox="0 0 100 100"
                    className="w-full h-full overflow-visible"
                    fill="none"
                  >
                    <path d="M 0 50 C 40 50, 60 15, 100 15" stroke="#39D7B5" strokeWidth="1.5" />
                    <path d="M 0 50 L 100 50" stroke="#39D7B5" strokeWidth="1.5" />
                    <path d="M 0 50 C 40 50, 60 85, 100 85" stroke="#39D7B5" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* 3 Target Labels with Icons */}
                <div
                  ref={docLabelsRef}
                  className="flex flex-col gap-2.5 font-mono text-xs uppercase tracking-wider text-[#F5F2E8]"
                >
                  <div className="doc-item flex items-center gap-2.5">
                    <DocumentIcon className="inline-block h-[1.1em] align-middle text-[#39D7B5]" />
                    <span>Faculty Report (Formal PDF)</span>
                  </div>
                  <div className="doc-item flex items-center gap-2.5">
                    <DocumentIcon className="inline-block h-[1.1em] align-middle text-[#E2A83B]" />
                    <span>Dean Memo (Admin DOCX)</span>
                  </div>
                  <div className="doc-item flex items-center gap-2.5">
                    <SpeechBubbleIcon className="inline-block h-[1.1em] align-middle text-[#55D69A]" />
                    <span>WhatsApp Notice (Broadcast)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thin Bottom Progress Line with Three Tick Labels */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 w-full pt-3 border-t border-white/[0.15]">
        <div className="relative w-full h-[2px] bg-white/10 mb-2">
          <div
            ref={progressBarRef}
            className="absolute top-0 left-0 h-full w-full bg-[#39D7B5] origin-left scale-x-0"
          />
        </div>
        <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-[#A8AAA3]">
          <span ref={tick1Ref} className="transition-colors text-[#39D7B5]">
            01 / Speak
          </span>
          <span ref={tick2Ref} className="transition-colors">
            02 / Review
          </span>
          <span ref={tick3Ref} className="transition-colors">
            03 / Generate
          </span>
        </div>
      </div>
    </section>
  );
}
