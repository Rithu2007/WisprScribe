"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Mic,
  ListChecks,
  Files,
  ShieldCheck,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Copy,
  Download,
  FileDown,
  Printer,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Menu,
  X,
  Plus,
  FileText,
  Clock,
  Calendar,
  Users,
  MapPin,
  Building,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  FactMap,
  FactKey,
  FACT_FIELD_DEFINITIONS,
  ExtractedField,
} from "@/lib/extraction-schema";
import { extractFactsDeterministically } from "@/lib/deterministic-fallback";
import {
  SAMPLE_EVENTS,
  DEFAULT_SAMPLE_EVENT,
  type SampleEvent,
} from "@/lib/sample-events";
import { buildCollegeDocument, DocumentPurpose } from "@/lib/document-model";
import { renderCollegeDocumentHtml } from "@/lib/renderers/html-preview-renderer";
import { generatePdfBlob } from "@/lib/renderers/pdf-renderer";
import { generateDocxBlob } from "@/lib/renderers/docx-renderer";
import { generateWhatsAppAnnouncement } from "@/lib/templates/whatsapp-announcement";
import { VoiceListeningStudio } from "@/components/voice-listening-studio";
import { ClarifyingQuestionsView } from "@/components/clarifying-questions-view";
import { ProcessingScreen } from "@/components/processing-screen";
import { planMissingQuestions, ClarifyingQuestion } from "@/lib/question-planner";

export type NavItemKey =
  | "workspace"
  | "studio"
  | "clarify"
  | "processing"
  | "review"
  | "documents";

export type WorkflowStatus =
  | "idle"
  | "listening"
  | "clarifying"
  | "ready_for_review"
  | "documents_ready";

interface VerbaWorkspaceShellProps {
  initialNav?: NavItemKey;
}

export const VerbaWorkspaceShell: React.FC<VerbaWorkspaceShellProps> = ({
  initialNav = "workspace",
}) => {
  // Navigation & workflow state
  const [activeNav, setActiveNav] = useState<NavItemKey>(initialNav);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>("idle");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Restore saved sidebar preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wisprscribe_sidebar_open") ?? localStorage.getItem("verba_sidebar_open");
      if (saved !== null) {
        setIsSidebarOpen(saved === "true");
      }
    } catch {}
  }, []);

  const toggleSidebar = (open: boolean) => {
    setIsSidebarOpen(open);
    try {
      localStorage.setItem("wisprscribe_sidebar_open", String(open));
    } catch {}
  };

  // Keyboard shortcut listener: Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => {
          const next = !prev;
          try {
            localStorage.setItem("wisprscribe_sidebar_open", String(next));
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Core event state (Starts clean without dummy data)
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [lastModifiedTimestamp, setLastModifiedTimestamp] = useState<string>("");

  // Extracted facts state
  const initialEmpty = useMemo(() => extractFactsDeterministically(""), []);
  const [facts, setFacts] = useState<FactMap>(initialEmpty.facts);
  const [hasExtracted, setHasExtracted] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);

  // Document outputs state
  const [activeDocTab, setActiveDocTab] = useState<DocumentPurpose | "whatsapp">("report");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);
  const [hasGeneratedDocs, setHasGeneratedDocs] = useState<boolean>(false);

  // Modal & Toast state
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedDraft = localStorage.getItem("wisprscribe_active_event_draft") ?? localStorage.getItem("verba_active_event_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (
            parsed.transcript ||
            parsed.hasExtracted ||
            (parsed.workflowStatus && parsed.workflowStatus !== "idle")
          ) {
            if (parsed.transcript) setTranscript(parsed.transcript);
            if (parsed.facts) setFacts(parsed.facts);
            if (parsed.workflowStatus) setWorkflowStatus(parsed.workflowStatus);
            if (parsed.lastModifiedTimestamp) setLastModifiedTimestamp(parsed.lastModifiedTimestamp);
            if (parsed.hasExtracted !== undefined) setHasExtracted(parsed.hasExtracted);
            if (parsed.hasGeneratedDocs !== undefined) setHasGeneratedDocs(parsed.hasGeneratedDocs);
            else if (parsed.hasExtracted) setHasGeneratedDocs(true);
            if (parsed.activeNav) setActiveNav(parsed.activeNav);
            if (parsed.selectedPresetId) setSelectedPresetId(parsed.selectedPresetId);
          }
        }
      } catch (err) {
        console.warn("Could not restore event draft:", err);
      }
    }
  }, []);

  // Auto-save draft to localStorage whenever active work changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (transcript.trim() || hasExtracted || workflowStatus !== "idle") {
          localStorage.setItem(
            "wisprscribe_active_event_draft",
            JSON.stringify({
              transcript,
              facts,
              workflowStatus,
              hasExtracted,
              hasGeneratedDocs,
              activeNav,
              lastModifiedTimestamp: lastModifiedTimestamp || "Just now",
              selectedPresetId,
            })
          );
        } else {
          localStorage.removeItem("wisprscribe_active_event_draft");
          localStorage.removeItem("verba_active_event_draft");
        }
      } catch {}
    }
  }, [transcript, facts, workflowStatus, hasExtracted, hasGeneratedDocs, activeNav, lastModifiedTimestamp, selectedPresetId]);

  // Delete event handler
  const handleDeleteEvent = () => {
    setSelectedPresetId("");
    setTranscript("");
    const blank = extractFactsDeterministically("");
    setFacts(blank.facts);
    setHasExtracted(false);
    setHasGeneratedDocs(false);
    setClarifyingQuestions([]);
    setWorkflowStatus("idle");
    setLastModifiedTimestamp("");
    setShowDeleteConfirmModal(false);
    setActiveNav("workspace");
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("wisprscribe_active_event_draft");
        localStorage.removeItem("verba_active_event_draft");
      } catch {}
    }
    showToast("Event draft deleted.");
  };

  // Fact metrics: count confirmed vs unconfirmed
  const factKeys = Object.keys(facts) as FactKey[];
  const confirmedCount = factKeys.filter(
    (k) => facts[k]?.status === "confirmed" || facts[k]?.status === "edited"
  ).length;
  const needReviewCount = factKeys.filter(
    (k) => facts[k]?.status === "needs_confirmation"
  ).length;

  const hasActiveEvent = Boolean(transcript.trim() || hasExtracted || workflowStatus !== "idle");

  // Step 1 & 2: Analysis and Clarification trigger
  const handleAnalyzeTranscript = async (spokenText: string) => {
    setTranscript(spokenText);
    setIsExtracting(true);
    setLastModifiedTimestamp("Just now");
    setWorkflowStatus("clarifying");

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: spokenText }),
      });
      const data = await res.json();

      let extracted: FactMap;
      if (data.ok && data.facts) {
        extracted = data.facts;
      } else {
        const fallbackResult = extractFactsDeterministically(spokenText);
        extracted = fallbackResult.facts;
      }

      setFacts(extracted);
      setHasExtracted(true);

      // Step 2: Missing-question planning
      const missing = planMissingQuestions(extracted);
      setClarifyingQuestions(missing);

      setIsExtracting(false);

      // Rule: Once the user clicks "Analyze Event," ask for the remaining or missing details
      setActiveNav("clarify");
    } catch {
      const fallbackResult = extractFactsDeterministically(spokenText);
      setFacts(fallbackResult.facts);
      setHasExtracted(true);
      const missing = planMissingQuestions(fallbackResult.facts);
      setClarifyingQuestions(missing);
      setIsExtracting(false);
      setActiveNav("clarify");
    }
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: SampleEvent) => {
    setSelectedPresetId(preset.id);
    setTranscript(preset.transcript);
    setLastModifiedTimestamp("Just now");
    setActiveNav("studio");
    setWorkflowStatus("listening");
    showToast(`Loaded sample: ${preset.title}`);
  };

  // Primary action: "+ New event" click handler
  const handleNewEventClick = () => {
    if (hasActiveEvent && workflowStatus !== "idle") {
      setIsNewEventModalOpen(true);
    } else {
      startFreshListeningStudio();
    }
  };

  const startFreshListeningStudio = () => {
    setSelectedPresetId("");
    setTranscript("");
    const blank = extractFactsDeterministically("");
    setFacts(blank.facts);
    setHasExtracted(false);
    setHasGeneratedDocs(false);
    setClarifyingQuestions([]);
    setWorkflowStatus("listening");
    setIsNewEventModalOpen(false);
    setActiveNav("studio");
  };

  // Fact edit handler
  const handleFactValueChange = (key: FactKey, newVal: string) => {
    const original = facts[key];
    const trimmed = newVal.trim();
    setFacts((prev) => ({
      ...prev,
      [key]: {
        ...original,
        value:
          trimmed === ""
            ? null
            : original?.value !== null &&
              typeof original?.value === "number" &&
              !isNaN(Number(trimmed))
            ? Number(trimmed)
            : newVal,
        status: "edited",
        reason: "Manually edited during review.",
      },
    }));
  };

  // Confirm single fact
  const handleConfirmFact = (key: FactKey) => {
    const original = facts[key];
    setFacts((prev) => ({
      ...prev,
      [key]: {
        ...original,
        status: "confirmed",
        reason: "Confirmed by user.",
      },
    }));
    showToast(`Confirmed ${FACT_FIELD_DEFINITIONS.find((d) => d.key === key)?.label || key}`);
  };

  // Confirm all facts
  const handleConfirmAll = () => {
    setFacts((prev) => {
      const next = { ...prev };
      (Object.keys(next) as FactKey[]).forEach((k) => {
        if (next[k]) {
          next[k] = {
            ...next[k],
            status: "confirmed",
            reason: "Confirmed by user.",
          };
        }
      });
      return next;
    });
    showToast("All fields confirmed.");
  };

  // Unified Document Model & Preview
  const activeCollegeDoc = useMemo(() => {
    if (activeDocTab === "whatsapp") return null;
    return buildCollegeDocument(facts, activeDocTab);
  }, [facts, activeDocTab]);

  const activeDocHtml = useMemo(() => {
    if (!activeCollegeDoc) return "";
    return renderCollegeDocumentHtml(activeCollegeDoc);
  }, [activeCollegeDoc]);

  const whatsappText = useMemo(() => generateWhatsAppAnnouncement(facts), [facts]);

  const handleDownloadPdf = async () => {
    if (!activeCollegeDoc) return;
    try {
      setIsGeneratingPdf(true);
      const blob = await generatePdfBlob(activeCollegeDoc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const rawName = facts.eventName?.value || "College-Event";
      const cleanName = String(rawName).replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `WisprScribe_${activeDocTab}_${cleanName}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      showToast("Error generating PDF document");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!activeCollegeDoc) return;
    try {
      setIsGeneratingDocx(true);
      const blob = await generateDocxBlob(activeCollegeDoc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const rawName = facts.eventName?.value || "College-Event";
      const cleanName = String(rawName).replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `WisprScribe_${activeDocTab}_${cleanName}.docx`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`);
    } catch (err) {
      console.error("Failed to generate DOCX:", err);
      showToast("Error generating DOCX document");
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  const handleDownloadWhatsappTxt = () => {
    const blob = new Blob([whatsappText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const rawName = facts.eventName?.value || "College-Event";
    const cleanName = String(rawName).replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `WhatsApp_Notice_${cleanName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded WhatsApp notice as .txt");
  };

  const handleCopyWhatsapp = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText);
      showToast("WhatsApp announcement copied to clipboard.");
    } catch {
      showToast("Copy failed, please copy manually.");
    }
  };

  const currentPreset = SAMPLE_EVENTS.find((p) => p.id === selectedPresetId);

  return (
    <div className="min-h-screen flex bg-[#FFFFEB] text-[#17201F] font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#034F46] text-[#FFFFEB] text-xs font-medium shadow-lg border border-[#034F46]/20 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#237A57] bg-[#FFFFEB] rounded-full" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. SIDEBAR (DESKTOP & MOBILE DRAWER)                                */}
      {/* =================================================================== */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[270px] bg-[#FFFFEB] border-r border-[#D8D8C5] flex flex-col p-5 space-y-6 transition-transform duration-200 ease-in-out print:hidden ${
          isMobileMenuOpen
            ? "translate-x-0 shadow-2xl"
            : isSidebarOpen
            ? "-translate-x-full lg:translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col space-y-5">
          {/* Top: Landing page return link and sidebar close/collapse controls */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2 py-1 -ml-1.5 rounded-md text-xs font-medium text-[#5A6361] hover:text-[#034F46] hover:bg-[#E8E8D7] transition-colors group"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Landing Page</span>
            </Link>

            <div className="flex items-center gap-1">
              {/* Desktop Close/Collapse Button */}
              <button
                type="button"
                onClick={() => toggleSidebar(false)}
                className="p-1.5 rounded-md text-[#85857C] hover:text-[#034F46] hover:bg-[#E8E8D7] transition-colors hidden lg:flex items-center justify-center cursor-pointer"
                title="Close sidebar (Ctrl+B)"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-md text-[#85857C] hover:text-[#17201F] hover:bg-[#E8E8D7] transition-colors lg:hidden flex items-center justify-center cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Project Name Brand Row */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-[#034F46]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#034F46] flex items-center justify-center text-[#FFFFEB] font-serif font-bold text-lg shadow-xs group-hover:bg-[#023D36] transition-colors shrink-0">
              W
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-lg text-[#034F46] tracking-tight leading-none truncate">
                WISPRSCRIBE
              </span>
              <span className="text-[10px] italic text-[#85857C] leading-none mt-1">
                Voice-first paperwork
              </span>
            </div>
          </Link>

          {/* Primary Action Button: "New event" */}
          <button
            type="button"
            onClick={handleNewEventClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] font-medium text-sm transition-colors shadow-xs active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#034F46] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span suppressHydrationWarning>New event</span>
          </button>

          {/* Main Navigation Group: EXACTLY Workspace, Review facts, Documents */}
          <div className="space-y-1">
            {/* 1. Workspace */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("workspace");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "workspace"
                  ? "bg-[#E8E8D7] text-[#034F46] font-semibold"
                  : "text-[#17201F] hover:bg-[#E8E8D7]/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-[#034F46]" />
                <span>Workspace</span>
              </div>
            </button>

            {/* 2. Review facts */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("review");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "review"
                  ? "bg-[#E8E8D7] text-[#034F46] font-semibold"
                  : "text-[#17201F] hover:bg-[#E8E8D7]/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ListChecks className="w-4 h-4 text-[#034F46]" />
                <span>Review facts</span>
              </div>
              {hasExtracted && needReviewCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#B7791F]/15 text-[#B7791F] font-bold">
                  {needReviewCount} need review
                </span>
              )}
            </button>

            {/* 3. Documents */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("documents");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "documents"
                  ? "bg-[#E8E8D7] text-[#034F46] font-semibold"
                  : "text-[#17201F] hover:bg-[#E8E8D7]/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Files className="w-4 h-4 text-[#034F46]" />
                <span>Documents</span>
              </div>
              {hasGeneratedDocs && (
                <span className="text-[10px] text-[#85857C]">3</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MAIN WORKSPACE SHELL                                             */}
      {/* =================================================================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ease-in-out ${
          isSidebarOpen ? "lg:pl-[270px]" : "lg:pl-0"
        }`}
      >
        {/* Mobile Header: Hamburger Menu Toggle */}
        <header className="sticky top-0 z-30 bg-[#FFFFEB]/95 backdrop-blur-sm border-b border-[#D8D8C5] px-4 py-3 flex items-center justify-between lg:hidden print:hidden">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-serif text-lg font-bold text-[#034F46]">WISPRSCRIBE</span>
            <span className="text-[10px] uppercase tracking-wider text-[#85857C] font-mono">Workspace</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-[#034F46] font-medium px-2.5 py-1 rounded-md border border-[#D8D8C5] hover:bg-[#E8E8D7] transition-colors"
            >
              Landing
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-md border border-[#D8D8C5] text-[#17201F] hover:bg-[#E8E8D7] cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Desktop Header when Sidebar is Closed: "Open sidebar" button */}
        {!isSidebarOpen && (
          <header className="sticky top-0 z-30 bg-[#FFFFEB]/95 backdrop-blur-sm border-b border-[#D8D8C5] px-4 sm:px-8 py-2.5 hidden lg:flex items-center justify-between transition-all animate-fade-in print:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSidebar(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D8D8C5] bg-[#FFFFEB] hover:bg-[#E8E8D7] text-[#034F46] text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                title="Open sidebar (Ctrl+B)"
                aria-label="Open sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 text-[#034F46] group-hover:scale-110 transition-transform" />
                <span>Open sidebar</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#034F46] hover:bg-[#E8E8D7] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Landing Page</span>
              </Link>
            </div>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-serif text-sm font-semibold text-[#034F46]">WISPRSCRIBE</span>
              <span className="text-[10px] uppercase tracking-wider text-[#85857C] font-mono">Workspace</span>
            </Link>
          </header>
        )}

        {/* Dynamic Main Workspace Content */}
        <main
          className={`flex-1 p-4 sm:p-8 w-full mx-auto space-y-6 ${
            activeNav === "documents" ? "max-w-5xl" : "max-w-3xl"
          }`}
        >
          {/* =============================================================== */}
          {/* STAGE 1 / VIEW 1: DASHBOARD WORKSPACE (DEFAULT)                 */}
          {/* =============================================================== */}
          {activeNav === "workspace" && (
            <div className="space-y-6">
              {/* Welcome Area (Honest Demo Identity, Minimal, No Button) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8D8C5] shadow-xs space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E8E8D7] text-[#034F46] text-[10px] font-semibold">
                  <span>Demo workspace</span>
                  <span>&bull;</span>
                  <span>Sample college events</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17201F] tracking-tight">
                  WisprScribe Workspace
                </h1>
                <p className="text-xs text-[#85857C] max-w-lg leading-relaxed">
                  Speak once. Submit right. Turn spoken recaps into verified paperwork without inventing facts.
                </p>
              </div>

              {/* Work Summary (Honest Values / Empty State) */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#85857C] uppercase tracking-wider block">
                  Workspace Summary
                </span>

                {!hasActiveEvent ? (
                  <div className="p-8 rounded-xl bg-[#FFFFFF] border border-[#D8D8C5] text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-xl bg-[#E8E8D7] flex items-center justify-center mx-auto text-[#034F46]">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-bold text-[#17201F]">
                        No events yet
                      </h3>
                      <p className="text-xs text-[#85857C] max-w-md mx-auto">
                        Create your first event by speaking what happened.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleNewEventClick}
                      className="px-5 py-2.5 rounded-lg bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span suppressHydrationWarning>New event</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D8C5] shadow-xs">
                      <span className="text-[11px] text-[#85857C] block">Events created</span>
                      <span className="font-serif text-2xl font-bold text-[#17201F] mt-1 block">1</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D8C5] shadow-xs">
                      <span className="text-[11px] text-[#85857C] block">Events in progress</span>
                      <span className="font-serif text-2xl font-bold text-[#17201F] mt-1 block">
                        {workflowStatus !== "documents_ready" ? 1 : 0}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D8C5] shadow-xs">
                      <span className="text-[11px] text-[#85857C] block">Documents generated</span>
                      <span className="font-serif text-2xl font-bold text-[#237A57] mt-1 block">
                        {workflowStatus === "documents_ready" ? 3 : 0}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8D8C5] shadow-xs">
                      <span className="text-[11px] text-[#85857C] block">Events needing review</span>
                      <span className="font-serif text-2xl font-bold text-[#B7791F] mt-1 block">
                        {needReviewCount > 0 ? 1 : 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Work Card (When Event Exists / Resumed from Previously Exited Work) */}
              {hasActiveEvent && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#85857C] uppercase tracking-wider block">
                      In-Progress Event &bull; Previously Exited Work
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirmModal(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#85857C] hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      title="Delete this in-progress event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete event</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#D8D8C5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-lg font-bold text-[#17201F]">
                          {facts.eventName?.value || (transcript ? "Active Spoken Draft" : "Untitled Event")}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#034F46]/10 text-[#034F46]">
                          {workflowStatus === "listening" && "Audio Recorded"}
                          {workflowStatus === "clarifying" && "Clarification In Progress"}
                          {workflowStatus === "ready_for_review" && "Facts Extracted"}
                          {workflowStatus === "documents_ready" && "Documents Ready"}
                          {workflowStatus === "idle" && "Draft In Progress"}
                        </span>
                      </div>

                      {/* Previously Exited Work Excerpt Preview */}
                      {transcript && (
                        <p className="text-xs text-[#17201F]/80 italic line-clamp-2 max-w-xl font-serif bg-[#FFFFEB]/60 p-2.5 rounded-lg border border-[#D8D8C5]/70">
                          &ldquo;{transcript}&rdquo;
                        </p>
                      )}

                      <p className="text-xs text-[#85857C]">
                        {needReviewCount > 0
                          ? `${needReviewCount} fact${needReviewCount > 1 ? "s" : ""} needing confirmation`
                          : "All extracted facts confirmed"}
                        {lastModifiedTimestamp && ` &bull; Saved ${lastModifiedTimestamp}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirmModal(true)}
                        className="px-3.5 py-2.5 rounded-lg border border-[#D8D8C5] hover:border-red-300 hover:bg-red-50 text-xs font-semibold text-[#85857C] hover:text-red-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        title="Delete and erase this work"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (workflowStatus === "documents_ready") {
                            setActiveNav("documents");
                          } else if (workflowStatus === "ready_for_review") {
                            setActiveNav("review");
                          } else if (workflowStatus === "clarifying") {
                            setActiveNav("clarify");
                          } else {
                            setActiveNav("studio");
                          }
                        }}
                        className="px-5 py-2.5 rounded-lg bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Resume event</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* STAGE 2: VOICE LISTENING STUDIO                                 */}
          {/* =============================================================== */}
          {activeNav === "studio" && (
            <VoiceListeningStudio
              initialTranscript={transcript}
              onBackToDashboard={() => setActiveNav("workspace")}
              onAnalyzeTranscript={handleAnalyzeTranscript}
              onTranscriptChange={(newTranscript) => {
                setTranscript(newTranscript);
                setLastModifiedTimestamp("Just now");
              }}
              isAnalyzing={isExtracting}
            />
          )}

          {/* =============================================================== */}
          {/* STAGE 3: CLARIFYING QUESTIONS WIZARD                            */}
          {/* =============================================================== */}
          {activeNav === "clarify" && (
            <ClarifyingQuestionsView
              questions={clarifyingQuestions}
              initialFacts={facts}
              onBackToStudio={() => setActiveNav("studio")}
              onConfirmClarifications={(updatedFacts) => {
                setFacts(updatedFacts);
                setHasExtracted(true);
                setHasGeneratedDocs(true);
                setActiveNav("processing");
              }}
            />
          )}

          {/* =============================================================== */}
          {/* STAGE 4A: PROCESSING SCREEN                                      */}
          {/* =============================================================== */}
          {activeNav === "processing" && (
            <ProcessingScreen
              onComplete={() => {
                setHasExtracted(true);
                setHasGeneratedDocs(true);
                setWorkflowStatus("ready_for_review");
                setActiveNav("review");
              }}
            />
          )}

          {/* =============================================================== */}
          {/* STAGE 4B: REVIEW FACTS DESTINATION                              */}
          {/* =============================================================== */}
          {activeNav === "review" && (
            <div className="space-y-6">
              {!hasExtracted ? (
                <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-[#D8D8C5] text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#E8E8D7] flex items-center justify-center mx-auto text-[#034F46]">
                    <ListChecks className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl font-bold text-[#17201F]">
                      No Facts Extracted Yet
                    </h3>
                    <p className="text-xs text-[#85857C] max-w-md mx-auto">
                      Start by dictating what happened in the Listening Studio. WisprScribe will extract structured fields with zero hallucination.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNewEventClick}
                    className="px-5 py-2.5 rounded-lg bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Open Listening Studio</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Header & Status Indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="font-serif text-3xl font-bold text-[#17201F]">
                        Review Facts
                      </h1>
                      <p className="text-sm text-[#85857C] mt-1">
                        Check and edit fields parsed strictly from your spoken recap.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D8D8C5] shadow-xs">
                        <span className="text-[#237A57] font-bold">{confirmedCount} confirmed</span>
                        <span className="text-[#85857C]"> &bull; </span>
                        <span className="text-[#B7791F] font-bold">{needReviewCount} need review</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmAll}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E8E8D7] hover:bg-[#D8D8C5] text-[#034F46] transition-colors cursor-pointer"
                      >
                        Confirm all
                      </button>
                    </div>
                  </div>

                  {/* Zero-Invention Rule Reminder */}
                  <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8D8C5] text-xs flex items-center gap-2 text-[#85857C]">
                    <ShieldCheck className="w-4 h-4 text-[#237A57] shrink-0" />
                    <span>
                      <strong>Zero-Invention Rule:</strong> Fields not explicitly stated in your voice notes are marked with amber <strong>&ldquo;Confirm this.&rdquo;</strong> tags.
                    </span>
                  </div>

                  {/* Fact Fields Table */}
                  <div className="bg-[#FFFFFF] border border-[#D8D8C5] rounded-xl overflow-hidden shadow-xs divide-y divide-[#D8D8C5]">
                    {FACT_FIELD_DEFINITIONS.map((def) => {
                      const field = facts[def.key];
                      const status = field?.status || "needs_confirmation";
                      const val = field?.value;

                      return (
                        <div
                          key={def.key}
                          className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="w-full md:w-1/3">
                            <div className="font-bold text-[#17201F] text-sm font-serif">
                              {def.label}
                            </div>
                            <p className="text-[11px] text-[#85857C] mt-0.5">
                              {def.description}
                            </p>
                          </div>

                          <div className="flex-1 max-w-md">
                            <input
                              type="text"
                              value={String(val ?? "")}
                              onChange={(e) => handleFactValueChange(def.key, e.target.value)}
                              placeholder={def.placeholder}
                              className="w-full px-3 py-1.5 rounded-md border border-[#D8D8C5] bg-[#FFFFEB]/60 text-xs text-[#17201F] focus:outline-none focus:border-[#034F46] focus:bg-[#FFFFFF]"
                            />
                            {field?.sourceText && (
                              <span className="text-[10px] text-[#85857C] italic block mt-1">
                                &ldquo;{field.sourceText}&rdquo;
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                            {status === "needs_confirmation" ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#B7791F]/15 text-[#B7791F] font-bold text-[10px]">
                                Confirm this.
                              </span>
                            ) : status === "edited" ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#034F46]/15 text-[#034F46] font-bold text-[10px]">
                                Edited by you
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-[#237A57]/15 text-[#237A57] font-bold text-[10px]">
                                Confirmed
                              </span>
                            )}

                            {status !== "confirmed" && (
                              <button
                                type="button"
                                onClick={() => handleConfirmFact(def.key)}
                                className="px-2.5 py-1 rounded bg-[#E8E8D7] hover:bg-[#D8D8C5] text-[#034F46] font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Primary Action Button: Create documents */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveNav("studio")}
                      className="text-xs font-semibold text-[#85857C] hover:text-[#17201F] flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Listening Studio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setWorkflowStatus("documents_ready");
                        setActiveNav("documents");
                      }}
                      className="px-7 py-3 rounded-xl bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] font-serif text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Create documents</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* STAGE 5: DOCUMENTS DESTINATION                                  */}
          {/* =============================================================== */}
          {activeNav === "documents" && (
            <div className="space-y-6">
              {!hasGeneratedDocs ? (
                <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-[#D8D8C5] text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#E8E8D7] flex items-center justify-center mx-auto text-[#034F46]">
                    <Files className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl font-bold text-[#17201F]">
                      No Documents Generated Yet
                    </h3>
                    <p className="text-xs text-[#85857C] max-w-md mx-auto">
                      Paperwork is generated strictly from verified event facts. Review your facts and click &ldquo;Create documents&rdquo; to unlock this suite.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNewEventClick}
                    className="px-5 py-2.5 rounded-lg bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New event</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="font-serif text-3xl font-bold text-[#17201F]">
                        Generated Documents
                      </h1>
                      <p className="text-sm text-[#85857C] mt-1">
                        Unified standard institutional documents generated strictly from verified facts.
                      </p>
                    </div>

                    {/* Format Tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#E8E8D7] border border-[#D8D8C5] flex-wrap">
                      <button
                        type="button"
                        onClick={() => setActiveDocTab("report")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          activeDocTab === "report"
                            ? "bg-[#FFFFFF] text-[#034F46] font-bold shadow-xs"
                            : "text-[#85857C] hover:text-[#17201F]"
                        }`}
                      >
                        Event Report
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDocTab("permission")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          activeDocTab === "permission"
                            ? "bg-[#FFFFFF] text-[#034F46] font-bold shadow-xs"
                            : "text-[#85857C] hover:text-[#17201F]"
                        }`}
                      >
                        Permission Letter
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDocTab("sanction")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          activeDocTab === "sanction"
                            ? "bg-[#FFFFFF] text-[#034F46] font-bold shadow-xs"
                            : "text-[#85857C] hover:text-[#17201F]"
                        }`}
                      >
                        Sanction Request
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveDocTab("whatsapp")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          activeDocTab === "whatsapp"
                            ? "bg-[#FFFFFF] text-[#034F46] font-bold shadow-xs"
                            : "text-[#85857C] hover:text-[#17201F]"
                        }`}
                      >
                        WhatsApp Notice
                      </button>
                    </div>
                  </div>

                  {/* Missing Fields Alert (Trust Rule) */}
                  {activeCollegeDoc && activeCollegeDoc.missingFields.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-semibold text-amber-950">
                          Pending Information ({activeCollegeDoc.missingFields.length} field{activeCollegeDoc.missingFields.length > 1 ? "s" : ""}):
                        </div>
                        <div className="text-[11px] text-amber-800">
                          {activeCollegeDoc.missingFields.map((f) => `[To be confirmed: ${f}]`).join(" • ")}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Institutional Unified Format Badge */}
                  <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#D8D8C5] text-xs text-[#034F46] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#034F46]" />
                      <span>
                        <strong>Unified Institutional College Format:</strong> Single letterhead, standard typography, and consistent signature frame.
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-[#64748B] shrink-0">
                      Standard Frame &bull; Pure Black 12pt Serif
                    </div>
                  </div>

                  {/* In-Context Action Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FFFFFF] border border-[#D8D8C5]">
                    <div className="text-xs text-[#85857C]">
                      {activeDocTab !== "whatsapp"
                        ? `Official ${activeDocTab} document — 100% editable in Microsoft Word & Google Docs.`
                        : "Plain-text announcement formatted for instant copy and distribution."}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {activeDocTab !== "whatsapp" ? (
                        <>
                          <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="px-4 py-2 rounded-lg bg-[#034F46] hover:bg-[#023D36] disabled:opacity-50 text-[#FFFFEB] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDownloadDocx}
                            disabled={isGeneratingDocx}
                            className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#E8E8D7] border border-[#D8D8C5] text-[#034F46] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            title="Download fully editable Microsoft Word (.docx) document — compatible with MS Word and Google Docs"
                          >
                            <Download className="w-3.5 h-3.5 text-[#034F46]" />
                            <span>{isGeneratingDocx ? "Generating Word DOCX..." : "Download Word (.docx)"}</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleCopyWhatsapp}
                            className="px-4 py-2 rounded-lg bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy notice</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDownloadWhatsappTxt}
                            className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#E8E8D7] border border-[#D8D8C5] text-[#034F46] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5 text-[#034F46]" />
                            <span>Download .txt</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Document Preview Surface */}
                  <div className="bg-[#EAEAE0] p-4 sm:p-8 rounded-2xl border border-[#D8D8C5] shadow-inner min-h-[480px]">
                    {activeDocTab !== "whatsapp" ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: activeDocHtml }}
                        className="unified-college-doc-preview"
                      />
                    ) : (
                      <div className="max-w-xl mx-auto p-5 rounded-xl bg-[#FFFFEB] border border-[#D8D8C5] text-sm leading-relaxed whitespace-pre-wrap font-sans shadow-sm">
                        <div className="text-xs font-bold uppercase text-[#034F46] mb-3 pb-1 border-b border-[#D8D8C5]">
                          WhatsApp Plain-Text Announcement
                        </div>
                        {whatsappText}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* 3. RESET CONFIRMATION MODAL ("+ New event")                         */}
      {/* =================================================================== */}
      {isNewEventModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#FFFFEB] border border-[#D8D8C5] shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#034F46]">
              <AlertTriangle className="w-5 h-5 text-[#B7791F]" />
              <h2 className="font-serif text-lg font-bold text-[#17201F]">
                Start a New Event Recap?
              </h2>
            </div>

            <p className="text-xs text-[#85857C] leading-relaxed">
              Starting a new event will clear your current in-progress audio and facts in this local session.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsNewEventModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#D8D8C5] text-xs font-semibold text-[#17201F] hover:bg-[#E8E8D7] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startFreshListeningStudio}
                className="px-4 py-2 rounded-lg bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Start new event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFEB] border border-[#D8D8C5] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#17201F]">
                  Delete this event?
                </h3>
                <p className="text-xs text-[#85857C]">
                  This action will discard your draft.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#17201F] leading-relaxed">
              Are you sure you want to discard this in-progress event? This will delete your spoken transcript, verified facts, and draft documents.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-[#D8D8C5] bg-white text-xs font-semibold text-[#17201F] hover:bg-[#E8E8D7] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, delete event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WisprScribeWorkspaceShell = VerbaWorkspaceShell;
