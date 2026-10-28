"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LandingNavbarProps {
  activeStep?: number;
  onSelectStep?: (step: number) => void;
}

export function LandingNavbar({ activeStep = 0, onSelectStep }: LandingNavbarProps) {
  const navItems = [
    { label: "01 / Problem", step: 0 },
    { label: "02 / Reveal", step: 1 },
    { label: "03 / How It Works", step: 2 },
    { label: "04 / Get Started", step: 3 },
  ];

  const handleStepClick = (e: React.MouseEvent, step: number) => {
    e.preventDefault();
    if (onSelectStep) {
      onSelectStep(step);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-4 flex items-center justify-between backdrop-blur-md bg-[#050505]/85 border-b border-white/[0.06] select-none">
      {/* Brand Logo */}
      <Link
        href="/"
        onClick={(e) => {
          if (onSelectStep) {
            e.preventDefault();
            onSelectStep(0);
          }
        }}
        className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5] rounded cursor-pointer"
      >
        <span className="w-7 h-7 rounded-md bg-[#0A8F7A] flex items-center justify-center text-[#F5F2E8] font-serif font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
          W
        </span>
        <div className="flex flex-col">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F5F2E8] leading-none">
            WisprScribe<span className="text-[#39D7B5]">.</span>
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#A8AAA3] hidden sm:block pt-0.5">
            Voice-first paperwork
          </span>
        </div>
      </Link>

      {/* Center Nav Anchors (Interactive Step Switcher) */}
      <nav className="hidden md:flex items-center gap-2 sm:gap-4 text-xs font-mono uppercase tracking-wider">
        {navItems.map((item) => {
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.step}
              onClick={(e) => handleStepClick(e, item.step)}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-white/[0.08] text-[#F5F2E8] border border-white/20 shadow-xs"
                  : "text-[#A8AAA3] hover:text-[#F5F2E8] hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#39D7B5] animate-pulse" />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Direct Action */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg bg-[#0A8F7A] hover:bg-[#0BA68F] text-[#F5F2E8] font-mono text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5] shadow-xs cursor-pointer"
        >
          <span>Try WisprScribe</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
