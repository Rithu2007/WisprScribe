"use client";

import React, { useState } from "react";
import {
  FactMap,
  FactKey,
  FACT_FIELD_DEFINITIONS,
} from "@/lib/extraction-schema";
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Home,
} from "lucide-react";

interface FactReviewTableProps {
  facts: FactMap;
  warnings?: string[];
  extractorUsed?: string;
  notice?: string | null;
  onFactsChange: (updatedFacts: FactMap) => void;
  onResetReview?: () => void;
  onProceedToDocuments?: () => void;
  onBackToInput?: () => void;
  onNavigateHome?: () => void;
}

type FilterMode = "all" | "needs_confirmation" | "confirmed";

export const FactReviewTable: React.FC<FactReviewTableProps> = ({
  facts,
  extractorUsed,
  onFactsChange,
  onProceedToDocuments,
  onBackToInput,
  onNavigateHome,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const keys = Object.keys(facts) as FactKey[];
  const confirmedCount = keys.filter((k) => facts[k].status === "confirmed").length;
  const needsConfirmationCount = keys.filter(
    (k) => facts[k].status === "needs_confirmation"
  ).length;

  const handleValueChange = (key: FactKey, newValue: string) => {
    const original = facts[key];
    const trimmed = newValue.trim();

    const updatedField = {
      ...original,
      value:
        trimmed === ""
          ? null
          : original.value !== null &&
            typeof original.value === "number" &&
            !isNaN(Number(trimmed))
          ? Number(trimmed)
          : newValue,
      status: "edited" as const,
      reason: "Manually edited during fact review.",
    };

    onFactsChange({
      ...facts,
      [key]: updatedField,
    });
  };

  const handleMarkConfirmed = (key: FactKey) => {
    const original = facts[key];
    onFactsChange({
      ...facts,
      [key]: {
        ...original,
        status: "confirmed",
        reason: "Confirmed and verified by user.",
      },
    });
  };

  const filteredFields = FACT_FIELD_DEFINITIONS.filter((def) => {
    const status = facts[def.key]?.status;
    if (filterMode === "all") return true;
    if (filterMode === "needs_confirmation") return status === "needs_confirmation";
    if (filterMode === "confirmed") return status === "confirmed" || status === "edited";
    return true;
  });

  return (
    <div className="bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-white">
      {/* Header Row: Title & Confirmation Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            id="fact-review-heading"
            className="font-sans text-2xl font-bold text-white flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-purple-400" aria-hidden="true" />
            <span>Verified Fact Matrix</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Zero-invention: Stated facts are verified; missing details remain blank in amber for confirmation.
          </p>
        </div>

        {/* Counter Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{confirmedCount} Confirmed</span>
          </span>
          {needsConfirmationCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{needsConfirmationCount} Needs Confirmation</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => setFilterMode("all")}
          className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
            filterMode === "all"
              ? "bg-white text-black font-semibold shadow-xs"
              : "bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/5"
          }`}
        >
          All Fields ({keys.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterMode("needs_confirmation")}
          className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            filterMode === "needs_confirmation"
              ? "bg-amber-500 text-black font-semibold shadow-xs"
              : "bg-amber-950/30 text-amber-300 border border-amber-500/30 hover:bg-amber-950/50"
          }`}
        >
          <span>Confirm This ({needsConfirmationCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode("confirmed")}
          className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            filterMode === "confirmed"
              ? "bg-emerald-500 text-black font-semibold shadow-xs"
              : "bg-emerald-950/30 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-950/50"
          }`}
        >
          <span>Confirmed ({confirmedCount})</span>
        </button>
      </div>

      {/* Fields List (Clean Cards) */}
      <div className="divide-y divide-white/10 border border-white/10 rounded-2xl overflow-hidden max-h-[540px] overflow-y-auto bg-[#141414]">
        {filteredFields.map((fieldDef) => {
          const field = facts[fieldDef.key] || {
            value: null,
            status: "needs_confirmation",
            sourceText: null,
            reason: "Missing from recap.",
          };
          const isConfirmed = field.status === "confirmed";
          const isNeedsConfirmation = field.status === "needs_confirmation";
          const isEdited = field.status === "edited";
          const isNull = field.value === null;

          return (
            <div
              key={fieldDef.key}
              className={`p-4 transition-colors ${
                isNeedsConfirmation ? "bg-amber-950/15" : "bg-[#141414]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Field Label & Source Info */}
                <div className="sm:w-5/12 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label
                      htmlFor={`field-input-${fieldDef.key}`}
                      className="text-xs font-bold text-white"
                    >
                      {fieldDef.label}
                    </label>

                    {isConfirmed && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    )}
                    {isNeedsConfirmation && (
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Confirm this
                      </span>
                    )}
                    {isEdited && (
                      <span className="text-[10px] font-semibold text-neutral-400 bg-white/10 px-2 py-0.5 rounded-full">
                        Edited
                      </span>
                    )}
                  </div>

                  {field.sourceText ? (
                    <p className="text-[11px] text-neutral-400">
                      Source: <span className="italic font-medium text-neutral-300">&ldquo;{field.sourceText}&rdquo;</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-neutral-500 italic">Not stated in recap</p>
                  )}
                </div>

                {/* Input and Inline Confirm */}
                <div className="sm:w-7/12 flex items-center gap-2">
                  <input
                    id={`field-input-${fieldDef.key}`}
                    type={fieldDef.type === "number" ? "number" : "text"}
                    value={field.value !== null ? String(field.value) : ""}
                    onChange={(e) => handleValueChange(fieldDef.key, e.target.value)}
                    placeholder={fieldDef.placeholder}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border transition-all focus:outline-hidden text-white placeholder:text-neutral-500 ${
                      isNeedsConfirmation && isNull
                        ? "bg-amber-950/20 border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                        : "bg-[#1C1C1C] border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20"
                    }`}
                  />

                  {isNeedsConfirmation && (
                    <button
                      type="button"
                      onClick={() => handleMarkConfirmed(fieldDef.key)}
                      disabled={isNull}
                      title={isNull ? "Type value to confirm" : "Confirm value"}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
                        isNull
                          ? "bg-white/5 text-neutral-600 opacity-40 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-xs"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Confirm</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          {onBackToInput && (
            <button
              type="button"
              onClick={onBackToInput}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Spoken Notes</span>
            </button>
          )}

          {onNavigateHome && (
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome();
              }}
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white font-semibold hover:underline transition-colors"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Landing Page</span>
            </a>
          )}
        </div>

        {onProceedToDocuments && (
          <button
            type="button"
            onClick={onProceedToDocuments}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs tracking-wide transition-all shadow-xs active:translate-y-px cursor-pointer group"
          >
            <span>Generate College Paperwork</span>
            <ArrowRight className="w-3.5 h-3.5 text-black opacity-75 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
