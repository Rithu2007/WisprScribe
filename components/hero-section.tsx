"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onGetStartedClick?: () => void;
  onDictateClick?: () => void;
  onViewDocumentsClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStartedClick,
  onDictateClick,
}) => {
  const handlePrimaryClick = onGetStartedClick || onDictateClick;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate w-full min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden select-none"
    >
      {/* ========================================================================= */}
      {/* EXACT FRAMER BACKGROUND DESIGN: DIAGONAL BRUSHED LIGHT RAYS & FLARE       */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        {/* Base dark canvas */}
        <div className="absolute inset-0 bg-[#080808]" />

        {/* Top-Right Ambient Light Flare */}
        <div
          className="absolute -top-1/4 -right-1/4 w-[1000px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 75% 25%, rgba(255, 255, 255, 0.45) 0%, rgba(200, 210, 220, 0.2) 40%, transparent 75%)",
          }}
        />

        {/* Diagonal Brushed Streaks Canvas */}
        <svg
          className="absolute inset-0 w-full h-full opacity-70 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 800"
        >
          <defs>
            <linearGradient id="streakFade" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id="wideBlur">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>

          {/* Broad soft diagonal light washes */}
          <path
            d="M300,-100 L1400,600 L1200,900 L100,200 Z"
            fill="url(#streakFade)"
            opacity="0.25"
            filter="url(#wideBlur)"
          />
          <path
            d="M500,-150 L1500,500 L1350,750 L350,100 Z"
            fill="url(#streakFade)"
            opacity="0.3"
            filter="url(#wideBlur)"
          />

          {/* Precision silky streaks angled across */}
          {[
            { d: "M750,-100 L1450,450", w: 3, op: 0.35 },
            { d: "M790,-100 L1490,450", w: 1.5, op: 0.4 },
            { d: "M820,-100 L1520,450", w: 4, op: 0.5 },
            { d: "M840,-100 L1540,450", w: 1, op: 0.3 },
            { d: "M870,-100 L1570,450", w: 6, op: 0.45 },
            { d: "M910,-100 L1610,450", w: 2, op: 0.5 },
            { d: "M940,-100 L1640,450", w: 8, op: 0.6 },
            { d: "M970,-100 L1670,450", w: 3, op: 0.4 },
            { d: "M1000,-100 L1700,450", w: 12, op: 0.55 },
            { d: "M1030,-100 L1730,450", w: 4, op: 0.45 },
            { d: "M1060,-100 L1760,450", w: 16, op: 0.5 },
            { d: "M1100,-100 L1800,450", w: 5, op: 0.35 },
            { d: "M600,-100 L1300,500", w: 4, op: 0.3 },
            { d: "M640,-100 L1340,500", w: 2, op: 0.35 },
            { d: "M670,-100 L1370,500", w: 5, op: 0.4 },
            { d: "M450,-50 L1150,550", w: 3, op: 0.2 },
            { d: "M500,-50 L1200,550", w: 6, op: 0.25 },
            { d: "M350,0 L1050,600", w: 4, op: 0.18 },
            { d: "M250,50 L950,650", w: 5, op: 0.15 },
            { d: "M150,100 L850,700", w: 3, op: 0.12 },
          ].map((streak, i) => (
            <path
              key={i}
              d={streak.d}
              stroke="url(#streakFade)"
              strokeWidth={streak.w}
              strokeLinecap="round"
              opacity={streak.op}
              filter="url(#softGlow)"
            />
          ))}
        </svg>

        {/* Micro-texture repeating diagonal grain */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-35deg, transparent, transparent 4px, rgba(255,255,255,0.06) 5px, transparent 8px)",
          }}
        />

        {/* Smooth bottom fade into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, #080808)",
          }}
        />
      </div>

      {/* Hero Core Content: Perfectly Centered in the middle of the screen */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-6 px-4 my-auto">
        {/* Main Project Name: WisprScribe */}
        <h1
          id="hero-title"
          className="wisprscribe-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-center select-none font-bold tracking-tight"
        >
          <span className="text-white">Wispr</span>
          <span className="wisprscribe-teal">Scribe</span>
        </h1>

        {/* Single Replacement Line */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-sans font-normal text-center">
          Turn your spoken recap into verified college paperwork without inventing facts.
        </p>

        {/* Single Action Button: Get started */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handlePrimaryClick}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.25)] active:translate-y-px cursor-pointer group"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4 text-black opacity-75 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <button
        type="button"
        onClick={() => {
          const animationEl = document.getElementById("speech-flow-section");
          if (animationEl) {
            animationEl.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-neutral-500 hover:text-white transition-colors cursor-pointer group"
        aria-label="Scroll down to explore"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity">
          Scroll down
        </span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5 group-hover:border-white/50 transition-colors">
          <div className="w-1 h-2 rounded-full bg-white animate-bounce" />
        </div>
      </button>
    </section>
  );
};