"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Printer,
  Send,
  X,
  ArrowRight,
  Maximize2,
  CheckCircle2,
} from "lucide-react";

interface GalleryCard {
  id: string;
  tag: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  stepTarget: "input" | "facts" | "documents";
  accentColor: string;
  bgGradient: string;
  renderVisual: () => React.ReactNode;
}

interface TiltedFeatureGalleryProps {
  onSelectStep?: (step: "input" | "facts" | "documents") => void;
}

export const TiltedFeatureGallery: React.FC<TiltedFeatureGalleryProps> = ({
  onSelectStep,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [inspectedCard, setInspectedCard] = useState<GalleryCard | null>(null);

  // Exact User Microphone SVG
  const renderMicSvg = (sizeClasses = "w-10 h-10 text-[#F0D7FF]") => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${sizeClasses} lucide lucide-mic preview-icon`}
      aria-hidden="true"
    >
      <path d="M12 19v3" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <rect x="9" y="2" width="6" height="13" rx="3" />
    </svg>
  );

  const CARDS: GalleryCard[] = [
    {
      id: "voice-dictation",
      tag: "GR26-01",
      category: "INPUT METHOD",
      title: "Voice Dictation Studio",
      subtitle: "Speak naturally, don't type",
      description:
        "Speak your post-event recap in conversational sentences. Eliminates manual typing and captures spontaneous details effortlessly.",
      stepTarget: "input",
      accentColor: "#F0D7FF",
      bgGradient: "from-[#03342E] via-[#034F46] to-[#0A2621]",
      renderVisual: () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[#03342E]">
          {/* Glowing Voice Aura */}
          <div className="absolute w-36 h-36 rounded-full bg-[#237A57]/30 blur-2xl animate-pulse pointer-events-none" />
          
          {/* Mic Emblem */}
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg mb-4">
            {renderMicSvg("w-10 h-10 text-[#F0D7FF]")}
          </div>

          {/* Soundwave Bars */}
          <div className="flex items-center gap-1.5 h-6 mb-2">
            {[40, 70, 100, 60, 90, 45, 80, 55, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-[#F0D7FF]/80 rounded-full transition-all duration-300"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <p className="font-mono text-[11px] text-[#FFFFEB]/80 tracking-wide">
            HOLD SHORTCUT &bull; DICTATE
          </p>
        </div>
      ),
    },
    {
      id: "fact-matrix",
      tag: "GR26-02",
      category: "TRUST ARCHITECTURE",
      title: "Zero-Invention Fact Matrix",
      subtitle: "Never hallucinates details",
      description:
        "14 verified factual slots extracted strictly from your speech. If a field was not spoken, it remains blank with an amber confirm-this warning instead of inventing names or dates.",
      stepTarget: "facts",
      accentColor: "#237A57",
      bgGradient: "from-[#17201F] via-[#243331] to-[#121918]",
      renderVisual: () => (
        <div className="w-full h-full p-5 flex flex-col justify-between bg-[#17201F] text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-[10px] text-[#237A57] uppercase font-bold tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Strict Extraction
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              14 Fields
            </span>
          </div>

          {/* Miniature Fact Chips */}
          <div className="space-y-2 my-auto">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="text-[10px] text-gray-400 font-mono">SPEAKER</div>
              <div className="text-white font-medium truncate">Prof. Anita Sharma</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="text-[10px] text-gray-400 font-mono">VENUE &bull; ATTENDEES</div>
              <div className="text-white font-medium truncate">Seminar Hall 2 &bull; 62 Present</div>
            </div>
            <div className="p-1.5 rounded-xl bg-[#FFFBEB]/10 border border-[#B7791F]/30 text-[10px] text-amber-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Missing fields remain empty</span>
            </div>
          </div>

          <div className="font-mono text-[10px] text-gray-400 border-t border-white/10 pt-2 flex justify-between">
            <span>AUDIT SCORE</span>
            <span className="text-emerald-400 font-bold">100% UNINVENTED</span>
          </div>
        </div>
      ),
    },
    {
      id: "post-event-report",
      tag: "GR26-03",
      category: "DOCUMENT 01",
      title: "Post-Event Summary Report",
      subtitle: "Polished institutional documentation",
      description:
        "Generates a complete editorial summary document containing executive overview, objective breakdown, key metrics, speaker highlights, and signature approval lines.",
      stepTarget: "documents",
      accentColor: "#034F46",
      bgGradient: "from-[#F7F7E8] to-[#FFFFEB]",
      renderVisual: () => (
        <div className="w-full h-full p-5 flex flex-col justify-between bg-[#FFFFEB] text-left border border-[#D8D8C5]">
          <div className="border-b-2 border-[#17201F] pb-2">
            <div className="text-[9px] font-mono uppercase text-[#034F46] font-bold tracking-widest">
              COLLEGE ADMINISTRATION
            </div>
            <div className="font-serif text-sm font-bold text-[#17201F] leading-tight mt-0.5">
              Post-Event Summary Report
            </div>
          </div>

          <div className="space-y-1.5 my-auto text-[11px] text-[#52524E]">
            <div className="h-2 w-3/4 bg-[#17201F]/20 rounded-xs" />
            <div className="h-2 w-full bg-[#17201F]/10 rounded-xs" />
            <div className="h-2 w-5/6 bg-[#17201F]/10 rounded-xs" />
            <div className="pt-2 flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#034F46] font-bold">ATTENDANCE: 62</span>
              <span>OCTOBER 14</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D8D8C5] flex items-center justify-between">
            <span className="text-[9px] font-mono text-gray-500">FORMAT: FORMAL DOC</span>
            <FileText className="w-3.5 h-3.5 text-[#034F46]" />
          </div>
        </div>
      ),
    },
    {
      id: "official-submission",
      tag: "GR26-04",
      category: "DOCUMENT 02",
      title: "Official Follow-up & Submission",
      subtitle: "For Dean & Academic Office",
      description:
        "A formal compliance memo structured with internal reference IDs, submission checklist, objective fulfillment notes, and designated signature blocks.",
      stepTarget: "documents",
      accentColor: "#17201F",
      bgGradient: "from-[#17201F] to-[#2B3A38]",
      renderVisual: () => (
        <div className="w-full h-full p-5 flex flex-col justify-between bg-[#17201F] text-left border border-gray-700">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[9px] font-mono text-[#F0D7FF] font-semibold tracking-wider">
              MEMORANDUM &bull; ROUTING
            </span>
            <span className="text-[9px] font-mono text-gray-400">REF: ES-2026-F</span>
          </div>

          <div className="space-y-2 my-auto">
            <div className="text-xs text-white font-serif font-bold">
              Official Follow-up & Submission
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 space-y-1">
              <div>&bull; Action Items Verified: YES</div>
              <div>&bull; Financial Receipts Attached: PENDING</div>
              <div>&bull; Academic Routing: HOD &rarr; DEAN</div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-gray-400">
            <span>OFFICIAL COMPLIANCE</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#237A57]" />
          </div>
        </div>
      ),
    },
    {
      id: "whatsapp-announcement",
      tag: "GR26-05",
      category: "DOCUMENT 03",
      title: "WhatsApp Community Announcement",
      subtitle: "Instant broadcast for student chats",
      description:
        "Ready-to-copy announcement formatted with bold headings, clean bullet points, key takeaways, and speaker credits for high engagement in student WhatsApp groups.",
      stepTarget: "documents",
      accentColor: "#25D366",
      bgGradient: "from-[#075E54] to-[#128C7E]",
      renderVisual: () => (
        <div className="w-full h-full p-4 flex flex-col justify-between bg-[#E5DDD5] text-left text-gray-800">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
            <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center">
              <Send className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-[#075E54] truncate">
              ACM Student Community
            </span>
          </div>

          {/* Chat Bubble */}
          <div className="p-3 rounded-2xl rounded-tl-xs bg-white shadow-xs text-xs space-y-1.5 my-auto">
            <p className="font-bold text-gray-900 leading-tight">
              🚀 Workshop Recap: Web Dev 101!
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Big thanks to 62+ students who joined us in Seminar Hall 2! Prof. Anita covered responsive layouts.
            </p>
            <div className="text-[9px] text-gray-400 text-right">10:42 AM &bull; ✓✓</div>
          </div>

          <div className="text-[10px] font-mono text-gray-600 flex items-center justify-between pt-1">
            <span>1-CLICK COPY READY</span>
            <span className="font-bold text-[#075E54]">WHATSAPP FORMAT</span>
          </div>
        </div>
      ),
    },
    {
      id: "print-export",
      tag: "GR26-06",
      category: "PORTAL EXPORT",
      title: "1-Click Print & PDF Ready",
      subtitle: "Clean monochrome layout",
      description:
        "Formatted strictly for physical notice boards, college files, and administration archives with clean margins, zero ink bleed, and clean page breaks.",
      stepTarget: "documents",
      accentColor: "#034F46",
      bgGradient: "from-[#FFFFFF] to-[#F4F4EE]",
      renderVisual: () => (
        <div className="w-full h-full p-5 flex flex-col justify-between bg-white text-left border border-gray-300 shadow-inner">
          <div className="flex items-center justify-between border-b border-black pb-2">
            <span className="text-[10px] font-mono font-bold text-black uppercase tracking-widest">
              NOTICE BOARD ARCHIVE
            </span>
            <Printer className="w-3.5 h-3.5 text-black" />
          </div>

          <div className="my-auto space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
              <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">SEAL</span>
            </div>
            <p className="text-center font-serif text-xs font-bold text-black">
              Certified Administrative Copy
            </p>
          </div>

          <div className="border-t border-black pt-2 flex items-center justify-between text-[9px] font-mono text-black font-semibold">
            <span>HIGH CONTRAST</span>
            <span>NO INK BLEED</span>
          </div>
        </div>
      ),
    },
  ];

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsMouseDown(true);
    setHasMoved(false);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftState(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    containerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleCardClick = (card: GalleryCard) => {
    if (hasMoved) return; // Prevent clicking while dragging
    setInspectedCard(card);
  };

  const handleGoToFeature = (step: "input" | "facts" | "documents") => {
    setInspectedCard(null);
    if (onSelectStep) {
      onSelectStep(step);
    }
    const targetEl = document.getElementById("interactive-workspace");
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="Features Tilted Gallery"
      className="relative w-full py-8 overflow-hidden select-none"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 px-4 sm:px-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-neutral-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Feature Pipeline
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Speak once. Generate every document.
          </h2>
        </div>

        {/* Technical Instruction Tag (Directly from inspiration) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-xs text-xs font-mono text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>DRAG TO BROWSE, CLICK TO INSPECT</span>
        </div>
      </div>

      {/* Tilted Gallery Viewport */}
      <div
        className="w-full overflow-hidden py-4 -my-4"
        style={{
          perspective: "1200px",
        }}
      >
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex gap-6 overflow-x-auto no-scrollbar px-6 sm:px-12 py-6 cursor-grab active:cursor-grabbing transition-transform duration-300 ease-out`}
          style={{
            transform: "rotate(-2.5deg) scale(0.98)",
            transformOrigin: "center center",
          }}
        >
          {CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="group shrink-0 w-72 sm:w-80 bg-[#121212] border border-white/10 rounded-3xl p-3 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Technical Label (e.g. GR26-04) */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <span className="font-mono text-[11px] font-bold text-neutral-400 tracking-widest">
                  {card.tag}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                  {card.category}
                </span>
              </div>

              {/* Card Canvas Visual */}
              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-inner relative group-hover:scale-[1.01] transition-transform">
                {card.renderVisual()}
                
                {/* Hover Inspect Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-xs transition-opacity flex items-center justify-center">
                  <div className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Maximize2 className="w-3.5 h-3.5 text-black" />
                    <span>Inspect</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Text */}
              <div className="px-2 pt-3 pb-1 text-left">
                <h3 className="font-sans font-bold text-base text-white group-hover:text-purple-300 transition-colors leading-tight">
                  {card.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Modal Dialog */}
      {inspectedCard && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setInspectedCard(null)}
        >
          <div
            className="bg-[#121212] rounded-3xl border border-white/10 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-neutral-300 bg-white/10 px-2.5 py-1 rounded-full">
                  {inspectedCard.tag}
                </span>
                <span className="text-xs font-mono uppercase text-purple-300 font-semibold">
                  {inspectedCard.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectedCard(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Visual Area */}
            <div className="w-full h-52 rounded-2xl overflow-hidden border border-white/10">
              {inspectedCard.renderVisual()}
            </div>

            {/* Modal Body */}
            <div className="space-y-2 text-left">
              <h3 className="font-sans text-2xl font-bold text-white">
                {inspectedCard.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {inspectedCard.description}
              </p>
            </div>

            {/* Modal Action CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setInspectedCard(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleGoToFeature(inspectedCard.stepTarget)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wide shadow-xs transition-all cursor-pointer group"
              >
                <span>Try this in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 text-black opacity-75 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
