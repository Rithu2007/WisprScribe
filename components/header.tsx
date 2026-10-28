"use client";

import React from "react";
import { RotateCcw } from "lucide-react";

interface HeaderProps {
  onResetToDefault?: () => void;
  activeViewMode?: "input" | "facts" | "documents";
  onSelectViewMode?: (mode: "input" | "facts" | "documents") => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetToDefault,
  activeViewMode = "input",
  onSelectViewMode,
  onNavigateHome,
}) => {
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else if (onSelectViewMode) {
      onSelectViewMode("input");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#080808]/85 backdrop-blur-md transition-all no-print">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand identity (Home Link) */}
        <a
          href="/"
          onClick={handleHomeClick}
          className="flex items-center gap-2.5 group cursor-pointer"
          title="EventScribe Home"
        >
          {/* Custom Sound-Scribe Logo Icon with Mic */}
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xs group-hover:bg-neutral-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-black lucide lucide-mic preview-icon"
              aria-hidden="true"
            >
              <path d="M12 19v3" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <rect x="9" y="2" width="6" height="13" rx="3" />
            </svg>
          </div>
          <span className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
            EventScribe
          </span>
        </a>

        {/* Clean Segmented Navigation */}
        {onSelectViewMode && (
          <nav
            aria-label="Workflow views"
            className="hidden md:flex items-center p-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium"
          >
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onSelectViewMode("input");
              }}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeViewMode === "input"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Dictation
            </a>
            <a
              href="/?step=facts"
              onClick={(e) => {
                e.preventDefault();
                onSelectViewMode("facts");
              }}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeViewMode === "facts"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Fact Review
            </a>
            <a
              href="/?step=documents"
              onClick={(e) => {
                e.preventDefault();
                onSelectViewMode("documents");
              }}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeViewMode === "documents"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Paperwork
            </a>
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {onResetToDefault && (
            <button
              type="button"
              onClick={onResetToDefault}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors font-medium"
              title="Reset to default sample"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onSelectViewMode) onSelectViewMode("input");
              const inputEl = document.getElementById("event-recap-textarea");
              if (inputEl) {
                inputEl.focus();
                inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs border border-white/20 hover:bg-neutral-200 transition-all shadow-xs active:translate-y-px cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-black lucide lucide-mic preview-icon"
              aria-hidden="true"
            >
              <path d="M12 19v3" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <rect x="9" y="2" width="6" height="13" rx="3" />
            </svg>
            <span>Dictate Recap</span>
          </button>
        </div>
      </div>
    </header>
  );
};
