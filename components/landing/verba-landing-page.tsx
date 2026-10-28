"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { ProblemSection } from "@/components/landing/problem-section";
import { RevealSection } from "@/components/landing/reveal-section";
import { SlideWorkflow } from "@/components/landing/slide-workflow";
import { CtaSection } from "@/components/landing/cta-section";

const TOTAL_STEPS = 4;

export function VerbaLandingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Sync ref with state
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  // Prevent vertical scrolling entirely on landing page
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const goToStep = useCallback(
    (newStep: number) => {
      const current = activeStepRef.current;
      if (newStep === current || newStep < 0 || newStep >= TOTAL_STEPS) return;
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      const releaseTimeout = setTimeout(() => {
        isAnimatingRef.current = false;
      }, 400);

      const direction = newStep > current ? 1 : -1;
      const container = slideContainerRef.current;

      if (!container) {
        clearTimeout(releaseTimeout);
        activeStepRef.current = newStep;
        setActiveStep(newStep);
        isAnimatingRef.current = false;
        return;
      }

      // Smooth GSAP slide transition
      const tl = gsap.timeline({
        onComplete: () => {
          activeStepRef.current = newStep;
          setActiveStep(newStep);
          // Animate new slide entering
          gsap.fromTo(
            container,
            { opacity: 0, y: direction * 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              ease: "power3.out",
              onComplete: () => {
                clearTimeout(releaseTimeout);
                isAnimatingRef.current = false;
              },
            }
          );
        },
      });

      // Slide current slide out
      tl.to(container, {
        opacity: 0,
        y: -direction * 16,
        duration: 0.18,
        ease: "power2.inOut",
      });
    },
    []
  );

  const goNext = useCallback(() => {
    const current = activeStepRef.current;
    if (current < TOTAL_STEPS - 1) {
      goToStep(current + 1);
    } else {
      router.push("/dashboard");
    }
  }, [goToStep, router]);

  const goPrev = useCallback(() => {
    const current = activeStepRef.current;
    if (current > 0) {
      goToStep(current - 1);
    }
  }, [goToStep]);

  // Global Keyboard Navigation (Enter, Space, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Wheel listener debounced for slide navigation
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 450) return;

      if (Math.abs(e.deltaY) > 20) {
        lastWheelTime = now;
        if (e.deltaY > 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goNext, goPrev]);

  // Touch Swipe navigation for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 40) goNext();
      else if (diffX < -40) goPrev();
    } else {
      if (diffY > 40) goNext();
      else if (diffY < -40) goPrev();
    }

    touchStartY.current = null;
    touchStartX.current = null;
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // If the click is inside an interactive link or button (e.g. Try WisprScribe on step 4), do not override
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, textarea")) return;
    goNext();
  };

  return (
    <div
      onClick={handleContainerClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 w-screen h-screen max-h-screen overflow-hidden bg-[#050505] text-[#F5F2E8] flex flex-col justify-between selection:bg-[#39D7B5]/20 selection:text-[#39D7B5] cursor-pointer"
    >
      {/* Main Single-Viewport Presentation Stage */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-center relative pointer-events-auto">
        <div ref={slideContainerRef} className="w-full flex items-center justify-center pointer-events-auto">
          {activeStep === 0 && <ProblemSection isActive={true} />}
          {activeStep === 1 && <RevealSection isActive={true} />}
          {activeStep === 2 && <SlideWorkflow isActive={true} />}
          {activeStep === 3 && <CtaSection isActive={true} />}
        </div>
      </main>

      {/* Minimal light prompt */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 pb-6 sm:pb-8 flex items-center justify-center select-none pointer-events-auto">
        <button
          type="button"
          onClick={goNext}
          className="px-6 py-2.5 text-xs sm:text-sm font-sans font-light text-[#A8AAA3]/60 hover:text-[#F5F2E8] tracking-wider transition-colors cursor-pointer rounded-full hover:bg-white/[0.04]"
        >
          Click enter to continue
        </button>
      </footer>
    </div>
  );
}
