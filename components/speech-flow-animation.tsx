"use client";

import React, { useState, useEffect } from "react";

export const SpeechFlowAnimation: React.FC = () => {
  // Continuous 0 -> 100 loop over 8.5 seconds
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const durationMs = 8500;
    const intervalMs = 25;
    const step = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => (prev + step >= 100 ? 0 : prev + step));
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  // Phase logic
  const isSpeaking = progress >= 0 && progress < 45;
  const isCircleActive = progress >= 20 && progress <= 78;
  const isBeamActive = progress >= 46 && progress <= 95;
  const isDocCompleted = progress >= 85;

  // Dynamic offsets for flowing text ribbons along the curves
  const textOffset1 = (progress * 1.4) % 100;
  const textOffset2 = ((progress * 1.1) + 40) % 100;
  const docOffset1 = (progress * 1.5) % 100;
  const docOffset2 = ((progress * 1.2) + 50) % 100;

  return (
    <div className="w-full max-w-7xl mx-auto relative select-none overflow-hidden py-4 sm:py-8">
      {/* Ambient background soft glow behind synthesis circle */}
      <div
        className="absolute left-[48%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none blur-[140px] opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(168,85,247,0.25) 50%, transparent 75%)",
        }}
      />

      <svg
        className="w-full h-auto"
        viewBox="0 0 1240 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Luminous filter for core glow */}
          <filter id="softGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* INVISIBLE Downward Flow Trajectories (STRICTLY NO STROKE LINES) */}
          {/* Path 1: Main Speech Flow from mouth to circle */}
          <path
            id="speechStream1"
            d="M 215 150 C 335 150, 425 210, 525 315"
            fill="none"
          />
          {/* Path 2: Secondary parallel text stream from speech */}
          <path
            id="speechStream2"
            d="M 215 178 C 345 185, 440 255, 535 345"
            fill="none"
          />

          {/* Path 3: Upper Structured Text Stream from circle to document */}
          <path
            id="docStream1"
            d="M 675 340 C 765 375, 850 440, 945 470"
            fill="none"
          />
          {/* Path 4: Lower Structured Text Stream from circle to document */}
          <path
            id="docStream2"
            d="M 670 370 C 765 410, 855 475, 945 510"
            fill="none"
          />
        </defs>

        {/* =================================================================== */}
        {/* 1. TOP-LEFT: ENLARGED HUMAN FIGURE (MOVED LEFT, COMMANDING SIZE)   */}
        {/* =================================================================== */}
        {/* Position: x=45..265, y=45..345 (Generous space to the left)        */}
        <g transform="translate(45, 45)">
          {/* Pulsing acoustic speech waves emerging from mouth */}
          {isSpeaking && (
            <g className="transition-opacity duration-300">
              <path
                d="M 165 100 A 20 20 0 0 1 165 130"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                strokeLinecap="round"
                className="animate-ping origin-[165px_115px] opacity-60"
              />
              <path
                d="M 180 90 A 34 34 0 0 1 180 140"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M 198 80 A 50 50 0 0 1 198 150"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.5"
              />
              <path
                d="M 218 70 A 68 68 0 0 1 218 160"
                stroke="#FFFFFF"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.25"
              />
            </g>
          )}

          {/* Head profile contour & jaw */}
          <path
            d="M 88 45 C 88 18, 126 18, 138 44 C 146 55, 152 70, 155 78 C 161 84, 170 87, 165 95 C 160 100, 154 102, 155 107 C 158 112, 153 118, 145 118 C 138 118, 135 132, 124 137 C 108 142, 96 135, 91 118"
            stroke="#FFFFFF"
            strokeWidth="3.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Eye & Brow */}
          <path
            d="M 136 72 L 146 75"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M 140 78 L 143 79"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Ear */}
          <path
            d="M 106 82 C 101 78, 96 84, 99 92 C 102 98, 106 98, 109 93"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Hairline contour */}
          <path
            d="M 88 45 C 96 37, 112 33, 130 41 C 136 45, 139 53, 134 60 C 127 62, 116 57, 109 60 C 103 64, 102 73, 96 78 C 91 82, 87 76, 89 62 Z"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dynamic Speaking Mouth */}
          <path
            d={
              isSpeaking
                ? "M 152 100 C 160 103, 157 110, 149 110 Z"
                : "M 152 103 L 147 103"
            }
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Neck */}
          <path
            d="M 98 127 L 98 168 M 128 137 L 133 168"
            stroke="#FFFFFF"
            strokeWidth="3.0"
            strokeLinecap="round"
          />

          {/* Collar & Tie */}
          <path
            d="M 98 168 L 115 180 L 133 168"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 115 180 L 110 235 L 120 235 Z"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Shoulders & Lapels (Substantial figure) */}
          <path
            d="M 98 168 C 75 178, 40 196, 30 255"
            stroke="#FFFFFF"
            strokeWidth="3.0"
            strokeLinecap="round"
          />
          <path
            d="M 133 168 C 156 178, 190 196, 200 255"
            stroke="#FFFFFF"
            strokeWidth="3.0"
            strokeLinecap="round"
          />
          <path
            d="M 64 255 L 94 190 L 113 208"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 170 255 L 140 190 L 119 208"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>

        {/* =================================================================== */}
        {/* 2. DOWNWARD WORDS & LETTERS STREAM (NO LINES! ONLY WORDS/LETTERS)    */}
        {/* =================================================================== */}
        {/* Stream 1: Spoken sentences flowing smoothly along the curve */}
        <text fill="#FFFFFF" fillOpacity="0.45" fontSize="13.5" letterSpacing="2px">
          <textPath
            href="#speechStream1"
            startOffset={`${textOffset1}%`}
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="500"
          >
            • Workshop on Saturday • Seminar Hall 2 • 62 Attendees • Prof. Mehta
            delivered keynote on AI Agents • Approved budget $450 •
          </textPath>
        </text>

        {/* Stream 2: Secondary parallel stream of spoken recap words */}
        <text fill="#FFFFFF" fillOpacity="0.25" fontSize="11.5" letterSpacing="1.8px">
          <textPath
            href="#speechStream2"
            startOffset={`${textOffset2}%`}
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="400"
          >
            • natural voice recap • recording verified facts • student coordinators
            • room booking confirmed • no hallucinations •
          </textPath>
        </text>

        {/* =================================================================== */}
        {/* 3. SOUNDWAVE AUDIO WAVEFORM (CLEAN FLOATING MIC BARS, NO BOX)       */}
        {/* =================================================================== */}
        {/* Spaced generously at x=365, y=230 in the gap between human & circle */}
        <g transform="translate(365, 230)">
          {/* Dynamic Audio Waveform Bars */}
          {[
            { x: -28, h: isSpeaking ? 10 + (progress % 6) : 6 },
            { x: -21, h: isSpeaking ? 16 + (progress % 8) : 8 },
            { x: -14, h: isSpeaking ? 22 - (progress % 6) : 10 },
            { x: -7, h: isSpeaking ? 14 + (progress % 10) : 12 },
            { x: 0, h: isSpeaking ? 24 - (progress % 8) : 16 },
            { x: 7, h: isSpeaking ? 18 + (progress % 6) : 12 },
            { x: 14, h: isSpeaking ? 20 - (progress % 10) : 10 },
            { x: 21, h: isSpeaking ? 14 + (progress % 8) : 8 },
            { x: 28, h: isSpeaking ? 8 + (progress % 6) : 6 },
          ].map((bar, i) => (
            <line
              key={i}
              x1={bar.x}
              y1={-bar.h / 2}
              x2={bar.x}
              y2={bar.h / 2}
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* =================================================================== */}
        {/* 4. MIDDLE PART: SYNTHESIS CIRCLE (GENEROUS GAP: CX=600, CY=340)     */}
        {/* =================================================================== */}
        {/* Generously spaced: ~325px from human, ~265px from document          */}
        <g transform="translate(600, 340)">
          {/* Luminous Core Glow Aura */}
          <circle
            cx="0"
            cy="0"
            r={isCircleActive ? "90" : "75"}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            opacity={isCircleActive ? "0.22" : "0.08"}
            className="transition-all duration-700"
          />

          {/* Layer 1: Outer Rotating Dashed Ring (Diameter 150px) */}
          <g className="animate-[spin_12s_linear_infinite]">
            <circle
              cx="0"
              cy="0"
              r="75"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeDasharray="8 12"
              opacity="0.85"
            />
          </g>

          {/* Layer 2: Counter-Rotating Gyroscopic Ellipses */}
          <g className="animate-[spin_7s_linear_infinite_reverse]">
            <ellipse
              cx="0"
              cy="0"
              rx="68"
              ry="34"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeDasharray="5 8"
              opacity="0.7"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="34"
              ry="68"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeDasharray="5 8"
              opacity="0.7"
            />
          </g>

          {/* Layer 3: Concentric Soundwave Pulse Wave */}
          <circle
            cx="0"
            cy="0"
            r={isCircleActive ? "56" : "44"}
            stroke="#FFFFFF"
            strokeWidth="2.0"
            opacity={isCircleActive ? "0.9" : "0.35"}
            className="transition-all duration-300 ease-out"
          />

          {/* Layer 4: AI Core Center Hub */}
          <circle
            cx="0"
            cy="0"
            r="26"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            fill="#070707"
            fillOpacity="0.95"
            filter="url(#softGlowFilter)"
          />

          {/* Inner Spinning Iris Cross */}
          <g className="animate-[spin_4s_linear_infinite]">
            <circle
              cx="0"
              cy="0"
              r="13"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeDasharray="3 3"
            />
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
          </g>

          {/* Orbiting Satellite Dots */}
          <g className="animate-[spin_5s_linear_infinite]">
            <circle cx="0" cy="-75" r="3.5" fill="#FFFFFF" />
            <circle cx="0" cy="75" r="2.5" fill="#FFFFFF" opacity="0.65" />
          </g>
        </g>

        {/* =================================================================== */}
        {/* 6. PROCESSED STRUCTURED WORDS/LETTERS STREAMING INTO DOCUMENT        */}
        {/* =================================================================== */}
        {/* STRICTLY NO SOLID OR DASHED STROKE LINES! ONLY WORDS & LETTERS!     */}
        {/* Upper Stream of Structured Extracted Data */}
        <text
          fill="#FFFFFF"
          fillOpacity={isBeamActive ? "0.85" : "0.3"}
          fontSize="13"
          letterSpacing="1.8px"
        >
          <textPath
            href="#docStream1"
            startOffset={`${docOffset1}%`}
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="600"
          >
            [VERIFIED] EVENT: "AI Workshop" • VENUE: "Seminar Hall 2" • ATTENDEES: 62
            • SPEAKER: "Prof. Mehta" • STATUS: "APPROVED" •
          </textPath>
        </text>

        {/* Lower Stream of Processing Logs / Fact Verification Tokens */}
        <text
          fill="#FFFFFF"
          fillOpacity={isBeamActive ? "0.6" : "0.2"}
          fontSize="11.5"
          letterSpacing="1.5px"
        >
          <textPath
            href="#docStream2"
            startOffset={`${docOffset2}%`}
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="500"
          >
            extracting facts... 100% precision... zero hallucinations... generating
            official report... validated with faculty...
          </textPath>
        </text>

        {/* =================================================================== */}
        {/* 6. BOTTOM-RIGHT: ENLARGED PDF DOCUMENT (MORE SPACE: X=930..1160)    */}
        {/* =================================================================== */}
        {/* Position: x=930..1160, y=310..610 (Generous 210px × 300px document) */}
        <g transform="translate(930, 310)">
          {/* Subtle Document Glow */}
          {(isBeamActive || isDocCompleted) && (
            <rect
              x="-6"
              y="-6"
              width="252"
              height="320"
              rx="16"
              fill="#FFFFFF"
              fillOpacity="0.04"
              filter="url(#softGlowFilter)"
              className="transition-all duration-500"
            />
          )}

          {/* Main Document Outline with Top-Right Fold (Width: 210px, x=20..230) */}
          <path
            d="M 20 20 L 180 20 L 230 70 L 230 295 L 20 295 Z"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Folded Corner Triangle */}
          <path
            d="M 180 20 L 180 70 L 230 70"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* "PDF" Pill Emblem Badge (Enlarged) */}
          <rect
            x="36"
            y="34"
            width="52"
            height="26"
            rx="5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            fill="#080808"
          />
          <text
            x="45"
            y="52"
            fill="#FFFFFF"
            fontSize="13"
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="bold"
            letterSpacing="0.8px"
          >
            PDF
          </text>

          {/* Document Status Indicator Dot */}
          <circle
            cx="205"
            cy="44"
            r="5"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            fill={isDocCompleted ? "#FFFFFF" : "none"}
          />

          {/* Real Structured Content Rows (Words & Text Lines) */}
          {/* Row 1: Document Header Title (Generously sized to fit inside box) */}
          <text
            x="36"
            y="88"
            fill="#FFFFFF"
            fontSize="11"
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="700"
            letterSpacing="0.4px"
            textLength="155"
            lengthAdjust="spacing"
            opacity={progress >= 52 ? "1" : "0"}
            className="transition-opacity duration-300"
          >
            EVENT SUMMARY REPORT
          </text>
          <line
            x1="36"
            y1="96"
            x2={progress >= 54 ? "195" : "36"}
            y2="96"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />

          {/* Row 2: Date & Venue */}
          <text
            x="36"
            y="118"
            fill="#FFFFFF"
            fillOpacity="0.8"
            fontSize="10"
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="500"
            opacity={progress >= 60 ? "1" : "0"}
            className="transition-opacity duration-300"
          >
            Saturday • Seminar Hall 2
          </text>
          <line
            x1="36"
            y1="126"
            x2={progress >= 62 ? "185" : "36"}
            y2="126"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            opacity="0.85"
          />

          {/* Row 3: Verified Attendance */}
          <text
            x="36"
            y="148"
            fill="#FFFFFF"
            fillOpacity="0.8"
            fontSize="10"
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="500"
            opacity={progress >= 68 ? "1" : "0"}
            className="transition-opacity duration-300"
          >
            Attendance: 62 Students
          </text>
          <line
            x1="36"
            y1="156"
            x2={progress >= 70 ? "170" : "36"}
            y2="156"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            opacity="0.85"
          />

          {/* Row 4: Keynote Speaker */}
          <text
            x="36"
            y="178"
            fill="#FFFFFF"
            fillOpacity="0.8"
            fontSize="10"
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="500"
            opacity={progress >= 76 ? "1" : "0"}
            className="transition-opacity duration-300"
          >
            Keynote: Prof. Mehta (AI)
          </text>
          <line
            x1="36"
            y1="186"
            x2={progress >= 78 ? "190" : "36"}
            y2="186"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            opacity="0.85"
          />

          {/* Row 5: Financial Approval */}
          <text
            x="36"
            y="208"
            fill="#FFFFFF"
            fillOpacity="0.65"
            fontSize="9.5"
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="400"
            opacity={progress >= 84 ? "1" : "0"}
            className="transition-opacity duration-300"
          >
            Budget: $450 Approved
          </text>
          <line
            x1="36"
            y1="216"
            x2={progress >= 85 ? "165" : "36"}
            y2="216"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            opacity="0.65"
          />

          {/* Row 6: Submission Ready status */}
          <text
            x="36"
            y="234"
            fill="#FFFFFF"
            fillOpacity="0.65"
            fontSize="9.5"
            fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
            fontWeight="400"
            opacity={progress >= 88 ? "1" : "0"}
            className="transition-opacity duration-300"
          >
            College Deanery Copy • OK
          </text>
          <line
            x1="36"
            y1="240"
            x2={progress >= 90 ? "150" : "36"}
            y2="240"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            opacity="0.65"
          />

          {/* Verified Stamp Emblem (Bottom-Right, Enlarged) */}
          {isDocCompleted && (
            <g className="transition-all duration-300">
              <circle
                cx="188"
                cy="258"
                r="19"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeDasharray="3 4"
              />
              <path
                d="M 180 258 L 185 264 L 197 251"
                stroke="#FFFFFF"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Official Signature Line */}
          <line
            x1="36"
            y1="268"
            x2="115"
            y2="268"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={progress >= 88 ? "0.6" : "0"}
            className="transition-opacity duration-300"
          />
        </g>
      </svg>
    </div>
  );
};

export default SpeechFlowAnimation;