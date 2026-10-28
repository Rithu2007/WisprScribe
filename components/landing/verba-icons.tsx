import React from "react";

export function SpeechBubbleIcon({ className = "inline-block h-[0.8em] align-middle" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2h-6l-4 4v-4H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    </svg>
  );
}

export function DocumentIcon({ className = "inline-block h-[0.8em] align-middle" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 3h10l6 6v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M14 3v6h6" />
    </svg>
  );
}

export function WaveformIcon({ className = "inline-block h-[0.8em] align-middle" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12h2l2-6 3 12 3-8 3 5 2-3h5" />
    </svg>
  );
}

export function CheckmarkIcon({ className = "inline-block h-[0.8em] align-middle text-[#55D69A]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export function AmberDotIcon({ className = "inline-block h-[0.8em] align-middle" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="4" fill="#E2A83B" />
    </svg>
  );
}

export function TealArrowIcon({ className = "inline-block h-[0.8em] align-middle text-[#39D7B5]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
