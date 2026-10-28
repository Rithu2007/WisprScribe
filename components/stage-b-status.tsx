import React from "react";
import { CheckCircle2, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";

interface StageBStatusProps {
  onQuickLoadCodingClub?: () => void;
  onQuickExtract?: () => void;
  isLoading?: boolean;
}

export const StageBStatus: React.FC<StageBStatusProps> = ({
  onQuickLoadCodingClub,
  onQuickExtract,
  isLoading,
}) => {
  return (
    <div className="bg-[#FFFFFF] border border-[#D8D8C5] rounded-xl shadow-xs p-6 space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#E8E8D7] text-[#034F46] border border-[#D8D8C5]">
          Stage B Ready
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#17201F] mt-2">
          How Fact Extraction Works
        </h3>
        <p className="text-sm text-[#575750] mt-1 leading-relaxed">
          EventScribe never hallucinates missing details. Spoken recaps are parsed into a strict 14-field schema. Facts you did not state are explicitly tagged for confirmation.
        </p>
      </div>

      {/* Trust Principle Visual Box */}
      <div className="p-4 rounded-lg bg-[#FFFFEB] border border-[#D8D8C5] space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#17201F]">
          <ShieldCheck className="w-4 h-4 text-[#237A57]" aria-hidden="true" />
          <span>The Zero-Invention Rule</span>
        </div>
        <ul className="text-xs text-[#575750] space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#237A57] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Stated facts</strong> (e.g., 62 attendees, Prof. Mehta, Seminar Hall 2) are verified and locked.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#B7791F] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Unstated facts</strong> (e.g., exact calendar date, faculty coordinator, official department) trigger an amber <span className="text-[#B7791F] font-semibold">&ldquo;Confirm this&rdquo;</span> alert.
            </span>
          </li>
        </ul>
      </div>

      {/* 3 Step Workflow Preview */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#575750]">
          3-Step Verification Pipeline
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-3 rounded-lg bg-[#FFFFEB]/60 border border-[#D8D8C5]">
            <span className="font-bold text-[#034F46]">1. Speak Once</span>
            <p className="text-[#575750] mt-1">Dictate using voice in natural everyday language.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FFFFEB]/60 border border-[#D8D8C5]">
            <span className="font-bold text-[#034F46]">2. Review Facts</span>
            <p className="text-[#575750] mt-1">Verify parsed table, fill flagged fields, edit details.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FFFFEB]/60 border border-[#D8D8C5]">
            <span className="font-bold text-[#034F46]">3. Generate Papers</span>
            <p className="text-[#575750] mt-1">Print Report, Follow-up Submission, &amp; WhatsApp announcement.</p>
          </div>
        </div>
      </div>

      {/* Quick Judge Demo Action */}
      <div className="pt-2 border-t border-[#E8E8D7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-[#575750]">
          Ready to verify Stage B? Try the preloaded sample on the left.
        </span>
        <button
          type="button"
          onClick={onQuickExtract}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#034F46] hover:text-[#17201F] transition-colors focus-visible:outline-2 focus-visible:outline-[#034F46]"
        >
          <span>Run Fact Extractor</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
