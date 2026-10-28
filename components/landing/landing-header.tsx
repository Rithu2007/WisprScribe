"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#050505]/85 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-2xl"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5] rounded"
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

        {/* Minimal Anchor Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-[#A8AAA3]"
        >
          <a
            href="#problem"
            className="hover:text-[#F5F2E8] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5] rounded"
          >
            The Problem
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#F5F2E8] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5] rounded"
          >
            How it works
          </a>
        </nav>

        {/* Primary CTA Action */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-[#0A8F7A] hover:bg-[#0BA68F] text-[#F5F2E8] font-mono text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-[#0A8F7A]/20 transition-all inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#39D7B5] cursor-pointer"
          >
            <span>Try WisprScribe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded bg-[#0A8F7A] text-[#F5F2E8] font-mono text-[11px] font-semibold uppercase tracking-wider"
          >
            <span>Try WisprScribe</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded text-[#A8AAA3] hover:text-[#F5F2E8] hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0D0D] border-b border-white/[0.08] px-4 pt-3 pb-5 space-y-4 shadow-xl">
          <nav className="flex flex-col gap-2.5 text-xs font-mono uppercase tracking-wider text-[#A8AAA3]">
            <a
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 px-2 rounded hover:text-[#F5F2E8] hover:bg-white/5"
            >
              The Problem
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 px-2 rounded hover:text-[#F5F2E8] hover:bg-white/5"
            >
              How it works
            </a>
          </nav>
          <div className="pt-2 border-t border-white/[0.08]">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded bg-[#0A8F7A] text-[#F5F2E8] font-mono text-xs font-semibold uppercase tracking-wider block"
            >
              Try WisprScribe
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
