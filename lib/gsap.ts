"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { CustomEase } from "gsap/CustomEase";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(
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
  ScrambleTextPlugin,
  Draggable,
  InertiaPlugin
);

try {
  CustomEase.create("verba", "M0,0 C0.16,1 0.3,1 1,1");
} catch (e) {
  // safe fallback
}

if (typeof window !== "undefined") {
  (window as any).gsap = gsap;
  (window as any).ScrollTrigger = ScrollTrigger;
}

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
  ScrambleTextPlugin,
  Draggable,
  InertiaPlugin,
};
