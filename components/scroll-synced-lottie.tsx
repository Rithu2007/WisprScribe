"use client";

import React, { useEffect, useRef, useState } from "react";

export type SourceType = "URL" | "Upload";

export interface ScrollSyncedLottieProps {
  sourceType?: SourceType;
  jsonUrl?: string;
  jsonFile?: object | null;
  offset?: [string, string];
  progressTransition?: {
    stiffness?: number;
    damping?: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_LOTTIE_SRC = "/animations/scroll-logo-dark.json";
const FALLBACK_REMOTE_SRC = "https://misc.framerstatic.com/lottie/logo.json";

const clamp = (min: number, max: number, v: number): number =>
  Math.max(min, Math.min(max, v));

/**
 * ScrollSyncedLottie Component
 * Adapted from Framer: https://framer.com/m/ScrollSyncedLottie-dC8j.js@GMXQndtKJWornBks0Z2O
 * 
 * Synchronizes a Lottie animation frame-by-frame to the user's scroll position.
 */
export function ScrollSyncedLottie({
  sourceType = "URL",
  jsonUrl = DEFAULT_LOTTIE_SRC,
  jsonFile = null,
  offset = ["start end", "end start"],
  className = "",
  style = {},
}: ScrollSyncedLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animationRef = useRef<any>(null);
  const isReadyRef = useRef<boolean>(false);
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  const lottieData = sourceType === "URL" ? (jsonUrl || FALLBACK_REMOTE_SRC) : jsonFile;

  // Frame update handler
  const updateAnimationFrame = (progress: number) => {
    const anim = animationRef.current;
    if (!anim) return;
    const total = anim.totalFrames || 0;
    if (total <= 0) return;
    const targetFrame = clamp(0, total - 1, progress * total);
    anim.goToAndStop(targetFrame, true);
  };

  // Smooth progress ticker using requestAnimationFrame
  useEffect(() => {
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      // Smooth interpolation (lerp) towards target progress
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0005) {
        currentProgressRef.current += diff * 0.15; // Smooth spring-like lerp
        if (isReadyRef.current) {
          updateAnimationFrame(currentProgressRef.current);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Scroll listener to calculate intersection progress based on target and viewport
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Calculate progress relative to viewport:
      // When element top enters bottom of screen: progress = 0
      // When element bottom leaves top of screen: progress = 1
      const totalDistance = windowHeight + rect.height;
      const currentDistance = windowHeight - rect.top;
      const rawProgress = totalDistance > 0 ? currentDistance / totalDistance : 0;
      targetProgressRef.current = clamp(0, 1, rawProgress);
    };

    // Calculate on initial load
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [offset]);

  // Load Lottie animation
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!canvasRef.current) return;

    if (animationRef.current) {
      try {
        animationRef.current.destroy();
      } catch {
        // Safe destroy
      }
      animationRef.current = null;
    }

    if (!lottieData) return;

    isReadyRef.current = false;
    let isCancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let anim: any = null;

    (async () => {
      try {
        const { default: lottie } = await import("lottie-web");
        if (isCancelled || !canvasRef.current) return;

        // Clear canvas container contents to prevent duplicate SVGs
        canvasRef.current.innerHTML = "";

        const animConfig: Parameters<typeof lottie.loadAnimation>[0] = {
          container: canvasRef.current,
          renderer: "svg",
          loop: false,
          autoplay: false,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
          },
          ...(typeof lottieData === "string"
            ? { path: lottieData }
            : { animationData: lottieData }),
        };

        anim = lottie.loadAnimation(animConfig);
        animationRef.current = anim;

        const onDOMLoaded = () => {
          if (isCancelled) return;
          isReadyRef.current = true;
          updateAnimationFrame(currentProgressRef.current);
        };

        anim.addEventListener("DOMLoaded", onDOMLoaded);
      } catch (err) {
        console.warn("ScrollSyncedLottie failed to load animation:", err);
      }
    })();

    return () => {
      isCancelled = true;
      if (anim) {
        try {
          anim.destroy();
        } catch {
          // Safe destroy
        }
      }
      animationRef.current = null;
      isReadyRef.current = false;
    };
  }, [lottieData]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </div>
  );
}

export default ScrollSyncedLottie;
