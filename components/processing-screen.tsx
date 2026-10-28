"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProcessingScreenProps {
  onComplete: () => void;
}

const STATUS_MESSAGES = [
  "Organizing your event details…",
  "Checking for missing information…",
  "Preparing your review…",
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);

  useEffect(() => {
    // Step through the 3 truthful status messages calmly (1.1s each)
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < STATUS_MESSAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#FFFFEB] border border-[#D8D8C5] shadow-xs flex items-center justify-center mx-auto text-[#034F46]">
        <Loader2 className="w-8 h-8 animate-spin text-[#034F46]" />
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-bold text-[#17201F] transition-all duration-300">
          {STATUS_MESSAGES[currentMessageIndex]}
        </h2>
        <p className="text-xs text-[#85857C]">
          Structuring facts with zero invention for your final review.
        </p>
      </div>

      <div className="flex justify-center items-center gap-1.5 pt-2">
        {STATUS_MESSAGES.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentMessageIndex
                ? "w-6 bg-[#034F46]"
                : idx < currentMessageIndex
                ? "w-2 bg-[#237A57]"
                : "w-2 bg-[#D8D8C5]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
