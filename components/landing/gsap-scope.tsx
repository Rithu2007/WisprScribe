"use client";

import React, { useRef } from "react";
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  MorphSVGPlugin,
  DrawSVGPlugin,
  Flip,
  Observer,
  CustomEase,
  MotionPathPlugin,
  ScrollToPlugin,
} from "@/lib/gsap";

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  MorphSVGPlugin,
  DrawSVGPlugin,
  Flip,
  Observer,
  CustomEase,
  MotionPathPlugin,
  ScrollToPlugin,
};

interface GSAPScopeProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function GSAPScope({ children, className = "", id }: GSAPScopeProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scopeRef} id={id} className={`gsap-scope-container ${className}`}>
      {children}
    </div>
  );
}
