"use client";

import React, { useState } from "react";
import { ClarifyingQuestion } from "@/lib/question-planner";
import { FactMap, FactKey } from "@/lib/extraction-schema";
import { ArrowRight, ArrowLeft, Check, HelpCircle, CheckCircle2 } from "lucide-react";

interface ClarifyingQuestionsViewProps {
  questions: ClarifyingQuestion[];
  initialFacts: FactMap;
  onConfirmClarifications: (updatedFacts: FactMap) => void;
  onBackToStudio: () => void;
}

export const ClarifyingQuestionsView: React.FC<ClarifyingQuestionsViewProps> = ({
  questions,
  initialFacts,
  onConfirmClarifications,
  onBackToStudio,
}) => {
  // Store answers mapped by fieldKey
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [blankFields, setBlankFields] = useState<Record<string, boolean>>({});

  const handleInputChange = (fieldKey: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    if (blankFields[fieldKey]) {
      setBlankFields((prev) => ({ ...prev, [fieldKey]: false }));
    }
  };

  const handleLeaveBlank = (fieldKey: string) => {
    setBlankFields((prev) => ({ ...prev, [fieldKey]: true }));
    setAnswers((prev) => ({ ...prev, [fieldKey]: "" }));
  };

  const handleProceed = () => {
    // Clone facts and merge answers into the canonical FactMap
    const updated: FactMap = { ...initialFacts };

    questions.forEach((q) => {
      const ans = answers[q.fieldKey]?.trim();
      const isBlank = blankFields[q.fieldKey];

      if (ans && !isBlank) {
        updated[q.fieldKey] = {
          value: q.type === "number" ? Number(ans) || ans : ans,
          status: "confirmed",
          sourceText: `Provided during guided clarification question: "${ans}"`,
          reason: "Explicitly confirmed by user during clarification.",
        };
      } else if (isBlank) {
        updated[q.fieldKey] = {
          value: null,
          status: "needs_confirmation",
          sourceText: null,
          reason: "Marked as unknown / left blank by user.",
        };
      }
    });

    onConfirmClarifications(updated);
  };

  const handleApplyDefaultsAndProceed = () => {
    const updated: FactMap = { ...initialFacts };

    questions.forEach((q) => {
      const existing = answers[q.fieldKey]?.trim();
      const defaultVal = q.defaultValue !== undefined ? String(q.defaultValue) : "";
      const valToUse = existing || defaultVal;

      if (valToUse) {
        updated[q.fieldKey] = {
          value: q.type === "number" ? Number(valToUse) || valToUse : valToUse,
          status: "confirmed",
          sourceText: `Applied standard collegiate default: "${valToUse}"`,
          reason: "Confirmed via quick default selection.",
        };
      } else {
        updated[q.fieldKey] = {
          value: null,
          status: "needs_confirmation",
          sourceText: null,
          reason: "Left blank for later confirmation.",
        };
      }
    });

    onConfirmClarifications(updated);
  };

  // Check if all questions are either answered or explicitly left blank
  const isComplete =
    questions.length === 0 ||
    questions.every(
      (q) => (answers[q.fieldKey] && answers[q.fieldKey].trim() !== "") || blankFields[q.fieldKey]
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToStudio}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#85857C] hover:text-[#034F46] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to transcript</span>
        </button>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#85857C] bg-[#E8E8D7] px-2.5 py-1 rounded-md">
          02 / Clarify
        </span>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D8D8C5] rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-[#17201F]">
            A few details are still needed.
          </h1>
          <p className="text-sm text-[#85857C]">
            WisprScribe identified the core facts you spoke. Please clarify the remaining required fields, or choose &ldquo;Leave blank&rdquo; if unknown.
          </p>
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#237A57]/10 border border-[#237A57]/30 text-xs text-[#237A57] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <strong className="font-bold">All core details identified!</strong>
              <p className="mt-0.5 text-xs text-[#17201F]">
                Your spoken recap covered all minimum institutional requirements.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const currentVal = answers[q.fieldKey] || "";
              const isMarkedBlank = !!blankFields[q.fieldKey];

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isMarkedBlank
                      ? "bg-[#FFFFEB]/40 border-[#D8D8C5] opacity-75"
                      : currentVal.trim()
                      ? "bg-[#FFFFFF] border-[#237A57]/60 shadow-xs ring-1 ring-[#237A57]/20"
                      : "bg-[#FFFFFF] border-[#D8D8C5]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <label
                      htmlFor={`input-${q.id}`}
                      className="font-serif text-base font-bold text-[#17201F] block"
                    >
                      <span className="text-[#034F46] mr-2 font-mono text-xs">
                        {idx + 1}.
                      </span>
                      {q.question}
                    </label>

                    {currentVal.trim() && !isMarkedBlank && (
                      <span className="text-[10px] font-bold text-[#237A57] px-2 py-0.5 rounded-full bg-[#237A57]/15 shrink-0">
                        Answered
                      </span>
                    )}
                    {isMarkedBlank && (
                      <span className="text-[10px] font-bold text-[#85857C] px-2 py-0.5 rounded-full bg-[#E8E8D7] shrink-0">
                        Left blank
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#85857C] mb-3">{q.hint}</p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      id={`input-${q.id}`}
                      type={q.type}
                      disabled={isMarkedBlank}
                      value={currentVal}
                      onChange={(e) => handleInputChange(q.fieldKey, e.target.value)}
                      placeholder={q.placeholder}
                      className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#D8D8C5] bg-[#FFFFEB]/50 text-xs text-[#17201F] focus:outline-none focus:border-[#034F46] focus:bg-[#FFFFFF] transition-colors disabled:opacity-40"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        isMarkedBlank
                          ? setBlankFields((prev) => ({ ...prev, [q.fieldKey]: false }))
                          : handleLeaveBlank(q.fieldKey)
                      }
                      className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                        isMarkedBlank
                          ? "bg-[#034F46] text-[#FFFFEB] border-[#034F46]"
                          : "border-[#D8D8C5] bg-[#FFFFEB] hover:bg-[#E8E8D7] text-[#85857C] hover:text-[#17201F]"
                      }`}
                    >
                      {isMarkedBlank ? "Edit answer" : "I do not know / Leave blank"}
                    </button>
                  </div>

                  {/* Suggestion Chips */}
                  {q.options && q.options.length > 0 && !isMarkedBlank && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-[#D8D8C5]/50">
                      <span className="text-[11px] text-[#85857C] mr-1">Quick choose:</span>
                      {q.options.map((opt) => {
                        const optStr = String(opt);
                        const isSelected = currentVal === optStr;
                        return (
                          <button
                            key={optStr}
                            type="button"
                            onClick={() => handleInputChange(q.fieldKey, optStr)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#034F46] text-[#FFFFEB] border-[#034F46]"
                                : "bg-[#FFFFEB] hover:bg-[#E8E8D7] text-[#17201F] border-[#D8D8C5]"
                            }`}
                          >
                            {optStr}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Readiness notice & Primary confirmation button */}
        <div className="pt-4 border-t border-[#D8D8C5] space-y-4">
          <div className="p-4 rounded-xl bg-[#FFFFEB] border border-[#D8D8C5] text-xs text-[#17201F] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#237A57] shrink-0" />
            <span className="font-serif text-sm">
              We have enough information to prepare your facts for review.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleApplyDefaultsAndProceed}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#034F46] text-[#034F46] hover:bg-[#034F46]/10 font-serif text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Apply Standard Defaults & Proceed</span>
            </button>

            <button
              type="button"
              onClick={handleProceed}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#034F46] hover:bg-[#023D36] text-[#FFFFEB] font-serif text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2.5 active:translate-y-px"
            >
              <span>Confirm & Generate Documents</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
