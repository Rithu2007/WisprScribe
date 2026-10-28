"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  AnimatePresence,
  motionValue,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  MotionValue,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.55, 0, 0.75, 0.06] as const;
const SPREAD = [0, -5, 4, -3, 2.5, -2];
const INSTANT = { duration: 0 };

const StaticContext = createContext(false);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function toRgb(c: string) {
  const s = (c || "").trim();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const fn = s.match(/rgba?\(([^)]+)\)/);
  if (fn) {
    const [r, g, b] = fn[1].split(",").map((x) => parseFloat(x));
    return { r, g, b };
  }
  return { r: 255, g: 255, b: 255 };
}

const rgba = (c: string, a: number) => {
  const { r, g, b } = toRgb(c);
  return `rgba(${r},${g},${b},${a})`;
};

const mix = (a: string, b: string, t: number) => {
  const A = toRgb(a);
  const B = toRgb(b);
  return `rgb(${Math.round(lerp(A.r, B.r, t))},${Math.round(lerp(A.g, B.g, t))},${Math.round(lerp(A.b, B.b, t))})`;
};

const isLight = (c: string) => {
  const { r, g, b } = toRgb(c);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
};

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(q.matches);
    const fn = () => setR(q.matches);
    q.addEventListener?.("change", fn);
    return () => q.removeEventListener?.("change", fn);
  }, []);
  return r;
}

/** Generative Artwork for Workflow Cards: Mic -> Processing -> PDF */
function Poster({
  accent,
  index,
  light,
}: {
  accent: string;
  index: number;
  light: boolean;
}) {
  const base = light ? "#FFFFFF" : "#060607";
  const top = mix(accent, base, 0.6);
  const bottom = mix(accent, base, 0.86);
  const deep = light ? mix(accent, "#0A0A0C", 0.35) : mix(accent, "#FFFFFF", 0.2);
  const hi = mix(accent, "#FFFFFF", 0.5);
  const line = light ? rgba(deep, 0.35) : "rgba(255,255,255,0.35)";
  const id = `sd${index}${accent.replace(/[^0-9a-z]/gi, "")}`;
  const kind = index % 3;

  let art: React.ReactNode;

  if (kind === 0) {
    // 1. Mic Symbol (Microphone with acoustic soundwaves, stand, and spectrum bars)
    art = (
      <>
        <defs>
          <filter id={id + "glow"} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <linearGradient id={id + "micGrad"} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor={hi} />
            <stop offset="75%" stopColor={accent} />
            <stop offset="100%" stopColor={deep} />
          </linearGradient>
          <radialGradient id={id + "ambient"} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={hi} stopOpacity="0.45" />
            <stop offset="70%" stopColor={accent} stopOpacity="0.15" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient radial glow */}
        <circle cx="150" cy="170" r="110" fill={`url(#${id}ambient)`} />
        <circle cx="150" cy="165" r="70" fill={accent} opacity="0.3" filter={`url(#${id}glow)`} />

        {/* Acoustic Soundwave Arcs - Left */}
        <path
          d="M 96 142 A 28 28 0 0 0 96 188"
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 80 128 A 48 48 0 0 0 80 202"
          fill="none"
          stroke={hi}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M 64 114 A 68 68 0 0 0 64 216"
          fill="none"
          stroke={line}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 5"
          opacity="0.55"
        />

        {/* Acoustic Soundwave Arcs - Right */}
        <path
          d="M 204 142 A 28 28 0 0 1 204 188"
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 220 128 A 48 48 0 0 1 220 202"
          fill="none"
          stroke={hi}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M 236 114 A 68 68 0 0 1 236 216"
          fill="none"
          stroke={line}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 5"
          opacity="0.55"
        />

        {/* U-Shaped Suspension Cradle */}
        <path
          d="M 112 165 C 112 216 188 216 188 165"
          fill="none"
          stroke={deep}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 112 165 C 112 216 188 216 188 165"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Microphone Capsule */}
        <rect
          x="124"
          y="118"
          width="52"
          height="88"
          rx="26"
          fill={`url(#${id}micGrad)`}
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />

        {/* Grille Acoustic Slits */}
        <line x1="137" y1="138" x2="163" y2="138" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        <line x1="133" y1="148" x2="167" y2="148" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        <line x1="133" y1="158" x2="167" y2="158" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        <line x1="137" y1="168" x2="163" y2="168" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

        {/* Capsule Mid-Band Divider */}
        <line x1="124" y1="175" x2="176" y2="175" stroke={deep} strokeWidth="2" opacity="0.4" />

        {/* Active Recording Indicator LED */}
        <circle cx="150" cy="189" r="3.5" fill="#FFFFFF" />
        <circle cx="150" cy="189" r="6" fill="#FFFFFF" opacity="0.35" />

        {/* Vertical Stand Stem */}
        <line x1="150" y1="216" x2="150" y2="252" stroke={deep} strokeWidth="6" strokeLinecap="round" />
        <line x1="150" y1="216" x2="150" y2="252" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.75" />

        {/* Weighted Desk Base */}
        <ellipse cx="150" cy="254" rx="42" ry="7" fill={deep} opacity="0.7" />
        <ellipse cx="150" cy="252" rx="36" ry="5" fill={accent} opacity="0.8" />
        <line x1="116" y1="252" x2="184" y2="252" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

        {/* Equalizer Frequency Bars */}
        {[-32, -22, -12, 0, 12, 22, 32].map((xOffset, i) => {
          const heights = [8, 14, 20, 24, 20, 14, 8];
          const h = heights[i];
          return (
            <rect
              key={i}
              x={150 + xOffset - 2.5}
              y={278 - h / 2}
              width="5"
              height={h}
              rx="2.5"
              fill={i === 3 ? "#FFFFFF" : accent}
              opacity={0.4 + (i % 2 === 1 ? 0.35 : 0.2)}
            />
          );
        })}
      </>
    );
  } else if (kind === 1) {
    // 2. Processing Symbol (AI Synthesis, gyroscopic orbital rings, neural core spark)
    art = (
      <>
        <defs>
          <filter id={id + "glow"} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <radialGradient id={id + "procGrad"} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor={hi} />
            <stop offset="100%" stopColor={accent} />
          </radialGradient>
        </defs>

        {/* Ambient radial glow */}
        <circle cx="150" cy="195" r="95" fill={accent} opacity="0.3" filter={`url(#${id}glow)`} />

        {/* Outer Circular Data Ring */}
        <circle
          cx="150"
          cy="195"
          r="92"
          fill="none"
          stroke={line}
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.75"
        />

        {/* Segmented Processing Gear Ring */}
        <circle
          cx="150"
          cy="195"
          r="76"
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          strokeDasharray="16 10"
          opacity="0.85"
        />

        {/* Intersecting Elliptical Gyro Orbits */}
        <ellipse
          cx="150"
          cy="195"
          rx="82"
          ry="32"
          fill="none"
          stroke={hi}
          strokeWidth="2"
          strokeDasharray="7 5"
          transform="rotate(-28 150 195)"
          opacity="0.85"
        />
        <ellipse
          cx="150"
          cy="195"
          rx="82"
          ry="32"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          transform="rotate(32 150 195)"
          opacity="0.7"
        />

        {/* Radiating Synapse Data Pins (8 directions) */}
        {Array.from({ length: 8 }).map((_, k) => {
          const angle = (k * 45 * Math.PI) / 180;
          const x1 = 150 + Math.cos(angle) * 36;
          const y1 = 195 + Math.sin(angle) * 36;
          const x2 = 150 + Math.cos(angle) * 62;
          const y2 = 195 + Math.sin(angle) * 62;
          return (
            <line
              key={k}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={k % 2 === 0 ? hi : accent}
              strokeWidth="2"
              strokeDasharray={k % 2 === 0 ? undefined : "3 3"}
              opacity="0.8"
            />
          );
        })}

        {/* Orbiting Satellite Data Nodes */}
        <circle cx="82" cy="162" r="5" fill="#FFFFFF" />
        <circle cx="82" cy="162" r="8" fill={accent} opacity="0.4" />
        <circle cx="218" cy="228" r="5" fill="#FFFFFF" />
        <circle cx="218" cy="228" r="8" fill={accent} opacity="0.4" />
        <circle cx="150" cy="103" r="4.5" fill={hi} />
        <circle cx="150" cy="287" r="4.5" fill={hi} />

        {/* Central Diamond Processing Chip */}
        <rect
          x="123"
          y="168"
          width="54"
          height="54"
          rx="14"
          fill={`url(#${id}procGrad)`}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          transform="rotate(45 150 195)"
        />

        {/* 4-Pointed AI Intelligence Core Spark */}
        <path
          d="M 150 176 Q 150 195 169 195 Q 150 195 150 214 Q 150 195 131 195 Q 150 195 150 176 Z"
          fill="#FFFFFF"
        />
        <circle cx="150" cy="195" r="3.5" fill={accent} />
      </>
    );
  } else {
    // 3. PDF Symbol (Official document with folded corner, PDF badge, structured lines, verified stamp)
    art = (
      <>
        <defs>
          <filter id={id + "glow"} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <linearGradient id={id + "sheetGrad"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={light ? "#FFFFFF" : "#1A1A22"} />
            <stop offset="100%" stopColor={light ? "#F5F6F8" : "#121217"} />
          </linearGradient>
          <linearGradient id={id + "flapGrad"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={hi} />
            <stop offset="100%" stopColor={accent} />
          </linearGradient>
        </defs>

        {/* Ambient radial glow */}
        <circle cx="150" cy="195" r="95" fill={accent} opacity="0.25" filter={`url(#${id}glow)`} />

        {/* Document Drop Shadow */}
        <path
          d="M 92 107 L 178 107 L 220 149 L 220 279 A 12 12 0 0 1 208 291 L 92 291 A 12 12 0 0 1 80 279 L 80 119 A 12 12 0 0 1 92 107 Z"
          fill="rgba(0,0,0,0.12)"
          filter={`url(#${id}glow)`}
        />

        {/* Document Sheet Body with Folded Top-Right Corner */}
        <path
          d="M 92 103 L 178 103 L 220 145 L 220 275 A 12 12 0 0 1 208 287 L 92 287 A 12 12 0 0 1 80 275 L 80 115 A 12 12 0 0 1 92 103 Z"
          fill={`url(#${id}sheetGrad)`}
          stroke={light ? rgba(deep, 0.28) : "rgba(255,255,255,0.22)"}
          strokeWidth="2"
        />

        {/* Fold Under-Shadow */}
        <polygon points="178,145 220,145 178,103" fill="rgba(0,0,0,0.18)" />

        {/* Folded Top-Right Flap */}
        <path
          d="M 178 103 L 178 137 A 8 8 0 0 0 186 145 L 220 145 Z"
          fill={`url(#${id}flapGrad)`}
          stroke={accent}
          strokeWidth="1.5"
        />

        {/* "PDF" Pill Badge */}
        <rect x="98" y="124" width="60" height="24" rx="6" fill={accent} />
        <text
          x="128"
          y="141"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="13"
          fontWeight="800"
          fontFamily="var(--font-josefin-sans), 'Josefin Sans', sans-serif"
          letterSpacing="1"
        >
          PDF
        </text>

        {/* Document Header Line */}
        <rect x="98" y="163" width="104" height="6" rx="3" fill={deep} opacity="0.75" />

        {/* Document Text Body Lines */}
        <rect x="98" y="178" width="90" height="5" rx="2.5" fill={line} />
        <rect x="98" y="191" width="98" height="5" rx="2.5" fill={line} />
        <rect x="98" y="204" width="76" height="5" rx="2.5" fill={line} />

        {/* Checklist Rows with miniature indicators */}
        <circle cx="103" cy="223" r="3.5" fill={accent} />
        <rect x="112" y="221" width="56" height="4" rx="2" fill={line} />

        <circle cx="103" cy="237" r="3.5" fill={accent} />
        <rect x="112" y="235" width="46" height="4" rx="2" fill={line} />

        {/* Official Faculty Verification Seal Stamp (Bottom-Right) */}
        <circle cx="178" cy="248" r="21" fill={accent} />
        <circle
          cx="178"
          cy="248"
          r="17"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        {/* Verification Checkmark Inside Seal */}
        <path
          d="M 170 248 L 175 254 L 187 241"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `linear-gradient(170deg, ${top} 0%, ${bottom} 70%)`,
      }}
    >
      <svg
        viewBox="0 0 300 400"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {art}
      </svg>
    </div>
  );
}

interface Item {
  title: string;
  subtitle: string;
  accent: string;
  link?: string;
}

interface Geometry {
  W: number;
  H: number;
  portrait: boolean;
  cardW: number;
  cardH: number;
  sx: number;
  sy: number;
  pad: number;
}

interface Options {
  items?: Item[];
  theme?: "light" | "dark" | "custom";
  background?: string;
  foreground?: string;
  accent?: string;
  textSide?: "left" | "right";
  startIndex?: number;
  autoplay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  drag?: boolean;
  keyboard?: boolean;
  throwDirection?: "auto" | "left" | "right";
  throwTilt?: number;
  visibleCards?: number;
  stackOffset?: number;
  spread?: number;
  cardAspect?: number;
  cardScale?: number;
  radius?: number;
  dim?: number;
  tilt?: number;
  hoverTilt?: boolean;
  glow?: number;
  titleScale?: number;
  showSubtitle?: boolean;
  showControls?: boolean;
  showProgress?: boolean;
  newTab?: boolean;
  onChange?: (index: number) => void;
  style?: React.CSSProperties;
}

function DeckCard({
  item,
  index,
  depth,
  x,
  geo,
  o,
  light,
  isTop,
  still,
  interactive,
  onRelease,
  onTap,
}: {
  item: Item;
  index: number;
  depth: number;
  x: MotionValue<number>;
  geo: Geometry;
  o: Required<Options>;
  light: boolean;
  isTop: boolean;
  still: boolean;
  interactive: boolean;
  onRelease: (i: number, info: { offset: { x: number }; velocity: { x: number } }) => void;
  onTap: (i: number) => void;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const dragRot = useTransform(
    x,
    [-geo.cardW * 2, 0, geo.cardW * 2],
    [-o.throwTilt, 0, o.throwTilt]
  );
  const moved = useRef(false);
  const visible = depth <= o.visibleCards;
  const k = Math.min(depth, o.visibleCards);

  const target = {
    y: -k * geo.cardH * 0.045 * o.stackOffset,
    scale: 1 - k * 0.055,
    rotate: depth === 0 ? 0 : SPREAD[depth % SPREAD.length] * o.spread,
    opacity: visible ? 1 : 0,
  };

  const resetHover = () => {
    if (inner.current) inner.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    if (glare.current) glare.current.style.opacity = "0";
  };

  useEffect(() => {
    if (!isTop) resetHover();
  }, [isTop]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !o.hoverTilt || !isTop || e.pointerType !== "mouse" || !inner.current)
      return;
    const r = e.currentTarget.getBoundingClientRect();
    const lx = clamp((e.clientX - r.left) / r.width);
    const ly = clamp((e.clientY - r.top) / r.height);
    inner.current.style.transform = `rotateX(${(0.5 - ly) * 10}deg) rotateY(${(lx - 0.5) * 12}deg)`;
    if (glare.current) {
      glare.current.style.opacity = "1";
      glare.current.style.background = `radial-gradient(circle at ${lx * 100}% ${ly * 100}%, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)`;
    }
  };

  const canDrag = interactive && isTop && o.drag;

  return (
    <motion.div
      initial={false}
      animate={target}
      transition={
        still
          ? INSTANT
          : {
              type: "spring",
              stiffness: 170,
              damping: 22,
              mass: 0.9,
            }
      }
      style={{
        position: "absolute",
        left: geo.sx - geo.cardW / 2,
        top: geo.sy - geo.cardH / 2,
        width: geo.cardW,
        height: geo.cardH,
        zIndex: 100 - depth,
        pointerEvents: interactive && isTop ? "auto" : "none",
      }}
    >
      <motion.div
        drag={canDrag ? "x" : false}
        dragMomentum={false}
        dragElastic={0.9}
        onDragStart={() => {
          moved.current = true;
          resetHover();
        }}
        onDragEnd={(_, info) => onRelease(index, info)}
        onPointerDown={() => (moved.current = false)}
        onPointerMove={onMove}
        onPointerLeave={resetHover}
        onClick={() => interactive && !moved.current && onTap(index)}
        whileTap={canDrag ? { cursor: "grabbing" } : undefined}
        style={{
          x,
          rotate: dragRot,
          position: "absolute",
          inset: 0,
          cursor: interactive && isTop ? (o.drag ? "grab" : "pointer") : "default",
          touchAction: "pan-y",
          transformPerspective: 1200,
        }}
      >
        <div
          ref={inner}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: o.radius,
            overflow: "hidden",
            background: light ? "#E9E8E4" : "#0D0D10",
            boxShadow: light
              ? `0 ${depth === 0 ? 40 : 18}px ${depth === 0 ? 70 : 40}px -30px rgba(20,20,30,${depth === 0 ? 0.45 : 0.3}), 0 2px 6px rgba(20,20,30,0.06)`
              : `0 40px 70px -24px rgba(0,0,0,0.7)`,
            transition: still ? undefined : "transform .6s cubic-bezier(.22,1,.36,1), box-shadow .6s",
          }}
        >
          <Poster accent={item.accent || o.accent} index={index} light={light} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: o.radius,
              boxShadow: `inset 0 0 0 1px ${light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)"}, inset 0 1px 0 rgba(255,255,255,0.35)`,
              background: "linear-gradient(155deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 30%)",
              pointerEvents: "none",
            }}
          />
          {interactive && (
            <div
              ref={glare}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                mixBlendMode: "overlay",
                transition: "opacity .5s",
                pointerEvents: "none",
              }}
            />
          )}
          <motion.div
            initial={false}
            animate={{ opacity: clamp(k * o.dim * 0.5) }}
            transition={still ? INSTANT : { duration: 0.5 }}
            style={{
              position: "absolute",
              inset: 0,
              background: o.background,
              pointerEvents: "none",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Staggered Word Reveal */
function Words({
  text,
  style,
  delay = 0,
  still = false,
}: {
  text: string;
  style?: React.CSSProperties;
  delay?: number;
  still?: boolean;
}) {
  if (still) return <span style={{ display: "block", ...style }}>{text}</span>;
  const words = String(text || "").split(" ");
  return (
    <span style={{ display: "block", ...style }}>
      {words.map((w, k) => (
        <React.Fragment key={k}>
          <span
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              paddingBottom: "0.1em",
              marginBottom: "-0.1em",
            }}
          >
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%", transition: { duration: 0.85, ease: EASE, delay: delay + k * 0.06 } }}
              exit={{ y: "-110%", transition: { duration: 0.35, ease: EASE_IN, delay: k * 0.02 } }}
              style={{ display: "inline-block" }}
            >
              {w}
            </motion.span>
          </span>
          {k < words.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </span>
  );
}

/** Magnetic Navigation Button */
function Btn({
  onClick,
  label,
  children,
  fg,
  size = 46,
  solid = false,
  bg,
  interactive = true,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  fg: string;
  size?: number;
  solid?: boolean;
  bg?: string;
  interactive?: boolean;
}) {
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, { stiffness: 260, damping: 18, mass: 0.6 });
  const y = useSpring(ty, { stiffness: 260, damping: 18, mass: 0.6 });

  return (
    <motion.button
      type="button"
      onClick={interactive ? onClick : undefined}
      aria-label={label}
      onPointerMove={(e) => {
        if (!interactive || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        tx.set((e.clientX - r.left - r.width / 2) * 0.35);
        ty.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        tx.set(0);
        ty.set(0);
      }}
      whileHover={interactive ? { scale: 1.06 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        x,
        y,
        position: "relative",
        width: size,
        height: size,
        borderRadius: 999,
        border: solid ? "none" : `1px solid ${rgba(fg, 0.16)}`,
        background: solid ? fg : "transparent",
        color: solid ? bg : fg,
        display: "grid",
        placeItems: "center",
        cursor: interactive ? "pointer" : "default",
        padding: 0,
      }}
    >
      {children}
    </motion.button>
  );
}

/** Circular Autoplay Indicator Ring */
function PlayRing({
  progress,
  accent,
  size,
}: {
  progress: MotionValue<number>;
  fg: string;
  accent: string;
  size: number;
}) {
  const r = size / 2 + 1;
  const C = 2 * Math.PI * r;
  const off = useTransform(progress, (v) => C * (1 - v));
  const s = size + 6;
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ position: "absolute", inset: -3, pointerEvents: "none", transform: "rotate(-90deg)" }}
    >
      <motion.circle
        cx={s / 2}
        cy={s / 2}
        r={r}
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={C}
        style={{ strokeDashoffset: off }}
      />
    </svg>
  );
}

const Arrow = ({ dir = 1 }: { dir?: number }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 14 14"
    fill="none"
    style={{ transform: dir === -1 ? "scaleX(-1)" : undefined }}
  >
    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Expanding Progress Indicator */
function Progress({
  n,
  active,
  progress,
  fg,
  accent,
  onSelect,
  still,
  interactive,
}: {
  n: number;
  active: number;
  progress: MotionValue<number>;
  fg: string;
  accent: string;
  onSelect: (i: number) => void;
  still: boolean;
  interactive: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: n }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={interactive ? () => onSelect(i) : undefined}
          aria-label={`Go to item ${i + 1}`}
          style={{ padding: "8px 0", background: "none", border: 0, cursor: interactive ? "pointer" : "default" }}
        >
          <motion.span
            initial={false}
            animate={{ width: i === active ? 28 : 6 }}
            transition={still ? INSTANT : { type: "spring", stiffness: 300, damping: 30 }}
            style={{
              display: "block",
              position: "relative",
              height: 6,
              borderRadius: 6,
              background: rgba(fg, 0.16),
              overflow: "hidden",
            }}
          >
            {i === active && (
              <motion.span
                style={{
                  position: "absolute",
                  inset: 0,
                  background: accent,
                  scaleX: progress,
                  transformOrigin: "0 50%",
                  borderRadius: 6,
                }}
              />
            )}
          </motion.span>
        </button>
      ))}
    </div>
  );
}

const THEMES = {
  light: { background: "#F2F1ED", foreground: "#141416" },
  dark: { background: "#0D0D10", foreground: "#F4F4F5" },
  custom: {},
};

/** Workflow Items for WisprScribe: Mic -> Processing -> PDF */
const WORKFLOW_ITEMS: Item[] = [
  {
    title: "Spoken Event Recap",
    subtitle: "Record or paste messy, spontaneous post-event chatter with real-time voice speech recognition.",
    accent: "#6F7CFF", // 1st Card: Mic Symbol
  },
  {
    title: "AI Synthesis & Processing",
    subtitle: "Deterministic AI locks dates, venues, attendance, and speakers with strict zero hallucinations.",
    accent: "#FF7A45", // 2nd Card: Processing Symbol
  },
  {
    title: "Verified College PDF",
    subtitle: "Official printable submission-ready report with digital faculty seal stamp and Deanery sign-off.",
    accent: "#9DBB2C", // 3rd Card: PDF Symbol
  },
];

export const StackSlider: React.FC<Options> = (props) => {
  const o: Required<Options> = {
    items: WORKFLOW_ITEMS,
    theme: "light",
    background: "#F2F1ED",
    foreground: "#141416",
    accent: "#6F7CFF",
    textSide: "left",
    startIndex: 0,
    autoplay: true,
    interval: 4,
    pauseOnHover: true,
    drag: true,
    keyboard: true,
    throwDirection: "auto",
    throwTilt: 14,
    visibleCards: 3,
    stackOffset: 1.4,
    spread: 1,
    cardAspect: 0.78,
    cardScale: 1,
    radius: 22,
    dim: 0.35,
    tilt: 6,
    hoverTilt: true,
    glow: 1,
    titleScale: 1,
    showSubtitle: true,
    showControls: true,
    showProgress: true,
    newTab: false,
    onChange: () => {},
    style: {},
    ...props,
    ...(THEMES[props.theme || "light"] || {}),
  };

  const items = o.items && o.items.length ? o.items : WORKFLOW_ITEMS;
  const n = items.length;
  const fg = o.foreground;
  const light = isLight(o.background);
  const reduced = useReducedMotion();

  const isStatic = false;
  const interactive = true;
  const still = reduced;

  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 650 });

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const upd = () => {
      const w = el.offsetWidth || 1200;
      const h = el.offsetHeight || 650;
      setSize((s) => (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 1 ? s : { w, h }));
    };
    upd();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo: Geometry = useMemo(() => {
    const W = size.w;
    const H = size.h;
    const portrait = W < H * 1.05;
    const a = o.cardAspect;
    const cardH = (portrait ? Math.min(H * 0.46, (W * 0.64) / a) : Math.min(H * 0.64, (W * 0.3) / a)) * o.cardScale;
    const cardW = cardH * a;
    const textLeft = o.textSide === "left";
    const sx = portrait ? W / 2 : textLeft ? W * 0.68 : W * 0.32;
    const sy = portrait ? H * 0.4 : H * 0.52;
    return {
      W,
      H,
      portrait,
      cardW,
      cardH,
      sx,
      sy,
      pad: portrait ? 22 : Math.max(32, W * 0.06),
    };
  }, [size.w, size.h, o.cardAspect, o.cardScale, o.textSide]);

  // Deck state
  const start = clamp(Math.round(o.startIndex), 0, n - 1);
  const initialOrder = () => Array.from({ length: n }, (_, k) => (start + k) % n);
  const [order, setOrder] = useState(initialOrder);
  const orderRef = useRef(order);
  orderRef.current = order;

  useEffect(() => setOrder(initialOrder()), [n, start]);

  const xs = useMemo(() => Array.from({ length: n }, () => motionValue(0)), [n]);
  const active = order[0] ?? 0;
  const progress = useMotionValue(0);
  const [playing, setPlaying] = useState(o.autoplay && !isStatic);
  const hovering = useRef(false);
  const busy = useRef(false);

  useEffect(() => setPlaying(o.autoplay && !isStatic), [o.autoplay, isStatic]);
  useEffect(() => {
    if (isStatic) return;
    o.onChange?.(active);
  }, [active, isStatic]);

  // "auto" throws away from the text: card moves to the right
  const throwDir =
    o.throwDirection === "auto"
      ? geo.portrait || o.textSide === "left"
        ? 1
        : -1
      : o.throwDirection === "right"
      ? 1
      : -1;

  // Next: top card moves to the right, reorders to the back, and aligns behind the stack
  const throwTop = useCallback(
    async (dir: number, velocity = 0) => {
      if (isStatic || busy.current || n < 2) return;
      busy.current = true;
      progress.set(0);
      const top = orderRef.current[0];
      const x = xs[top];
      if (!still) {
        await animate(x, dir * (geo.cardW * 1.25 + 40), {
          type: "spring",
          stiffness: 260,
          damping: 30,
          velocity,
          restDelta: 20,
        });
      }
      setOrder((ord) => [...ord.slice(1), ord[0]]);
      if (still) x.set(0);
      else animate(x, 0, { type: "spring", stiffness: 140, damping: 20, delay: 0.05 });
      setTimeout(() => (busy.current = false), still ? 0 : 260);
    },
    [xs, n, geo.cardW, still, isStatic, progress]
  );

  // Previous: brings back the bottom card to the front from the right
  const bringBack = useCallback(() => {
    if (isStatic || busy.current || n < 2) return;
    busy.current = true;
    progress.set(0);
    const last = orderRef.current[n - 1];
    const x = xs[last];
    if (!still) x.set(throwDir * (geo.cardW * 1.25 + 40));
    setOrder((ord) => [ord[n - 1], ...ord.slice(0, n - 1)]);
    if (!still) animate(x, 0, { type: "spring", stiffness: 150, damping: 20 });
    setTimeout(() => (busy.current = false), still ? 0 : 320);
  }, [xs, n, geo.cardW, still, isStatic, progress, throwDir]);

  const next = useCallback(() => throwTop(throwDir), [throwTop, throwDir]);

  const goTo = useCallback(
    (i: number) => {
      if (isStatic || i === orderRef.current[0] || busy.current) return;
      progress.set(0);
      setOrder((ord) => {
        const at = ord.indexOf(i);
        return [...ord.slice(at), ...ord.slice(0, at)];
      });
      if (!still) {
        const x = xs[i];
        x.set(throwDir * geo.cardW);
        animate(x, 0, { type: "spring", stiffness: 150, damping: 20 });
      }
    },
    [xs, geo.cardW, still, isStatic, progress, throwDir]
  );

  const onRelease = (i: number, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (isStatic) return;
    const x = xs[i];
    const dx = info.offset.x;
    const vx = info.velocity.x;
    if (Math.abs(dx) > geo.cardW * 0.28 || Math.abs(vx) > 550) {
      throwTop(dx + vx * 0.1 > 0 ? 1 : -1, vx);
    } else {
      animate(x, 0, { type: "spring", stiffness: 320, damping: 26 });
    }
  };

  const onTap = (i: number) => {
    if (isStatic) return;
    const it = items[i];
    if (it.link && typeof window !== "undefined") window.open(it.link, o.newTab ? "_blank" : "_self");
    else next();
  };

  // Autoplay
  useEffect(() => {
    if (isStatic || !playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      const paused = (o.pauseOnHover && hovering.current) || busy.current || document.hidden;
      if (!paused) {
        const v = progress.get() + dt / Math.max(0.8, o.interval);
        if (v >= 1) {
          progress.set(0);
          next();
        } else progress.set(v);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isStatic, playing, o.interval, o.pauseOnHover, next, progress]);

  // Stack parallax with mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, (v) => v * o.tilt), { stiffness: 90, damping: 18 });
  const rotX = useSpring(useTransform(my, (v) => -v * o.tilt), { stiffness: 90, damping: 18 });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isStatic || !o.keyboard) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      bringBack();
    } else if (e.key === " ") {
      e.preventDefault();
      setPlaying((v) => !v);
    }
  };

  const cur = items[active] || {};
  const accent = cur.accent || o.accent;
  const titleSize = (geo.portrait ? Math.min(34, geo.W * 0.085) : Math.min(68, geo.W * 0.048)) * o.titleScale;

  const textBlock: React.CSSProperties = geo.portrait
    ? { position: "absolute", left: geo.pad, right: geo.pad, bottom: 26 }
    : o.textSide === "left"
    ? { position: "absolute", left: geo.pad, width: geo.W * 0.36, top: "50%", transform: "translateY(-50%)" }
    : { position: "absolute", right: geo.pad, width: geo.W * 0.36, top: "50%", transform: "translateY(-50%)" };

  const subtitleStyle: React.CSSProperties = {
    lineHeight: 1.55,
    color: rgba(fg, 0.65),
    maxWidth: 420,
    fontFamily: "var(--font-josefin-sans), 'Josefin Sans', sans-serif",
    fontSize: geo.portrait ? 14 : 17,
  };

  const titleStyle: React.CSSProperties = {
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    fontWeight: 700,
    color: fg,
    fontFamily: "var(--font-josefin-sans), 'Josefin Sans', sans-serif",
    fontSize: titleSize,
  };

  const textGap = geo.portrait ? 10 : 16;

  return (
    <StaticContext.Provider value={isStatic}>
      <div
        ref={root}
        role="region"
        aria-roledescription="carousel"
        aria-label="WisprScribe Workflow Stack Slider"
        tabIndex={interactive && o.keyboard ? 0 : -1}
        onKeyDown={onKeyDown}
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => {
          hovering.current = false;
          mx.set(0);
          my.set(0);
        }}
        onPointerMove={(e) => {
          if (isStatic || e.pointerType !== "mouse") return;
          const r = root.current?.getBoundingClientRect();
          if (!r) return;
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        style={{
          ...o.style,
          position: "relative",
          width: "100%",
          minHeight: geo.portrait ? 560 : 640,
          overflow: "hidden",
          background: o.background,
          color: fg,
          fontFamily: "var(--font-josefin-sans), 'Josefin Sans', sans-serif",
          userSelect: "none",
          WebkitUserSelect: "none",
          outline: "none",
          borderRadius: 32,
        }}
      >
        {/* Glow ambient behind stack */}
        {o.glow > 0 && (
          <div
            aria-hidden={true}
            style={{
              position: "absolute",
              left: geo.sx,
              top: geo.sy,
              width: geo.cardW * 2.6,
              height: geo.cardH * 1.6,
              transform: "translate(-50%, -50%)",
              color: accent,
              transition: still ? undefined : "color 1.2s ease",
              background: "radial-gradient(closest-side, currentColor, transparent)",
              opacity: (light ? 0.22 : 0.28) * o.glow,
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* 3D Stack of Cards */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            rotateX: isStatic ? 0 : rotX,
            rotateY: isStatic ? 0 : rotY,
            transformPerspective: 1400,
            transformOrigin: `${geo.sx}px ${geo.sy}px`,
          }}
        >
          {items.map((it, i) => {
            const depth = order.indexOf(i);
            return (
              <DeckCard
                key={i}
                item={it}
                index={i}
                depth={depth < 0 ? n : depth}
                x={xs[i]}
                geo={geo}
                o={o}
                light={light}
                isTop={depth === 0}
                still={still}
                interactive={interactive}
                onRelease={onRelease}
                onTap={onTap}
              />
            );
          })}
        </motion.div>

        {/* Text Details & Controls */}
        <div style={{ ...textBlock, display: "flex", flexDirection: "column", gap: geo.portrait ? 18 : 30 }}>
          <div aria-live="polite" style={{ display: "grid" }}>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ gridArea: "1 / 1", alignSelf: "end", display: "flex", flexDirection: "column", gap: textGap }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: accent,
                      boxShadow: `0 0 10px ${accent}`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-josefin-sans), 'Josefin Sans', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: rgba(fg, 0.5),
                    }}
                  >
                    WORKFLOW STAGE 0{active + 1}
                  </span>
                </div>

                <Words text={cur.title} style={titleStyle} still={reduced} />

                {o.showSubtitle && cur.subtitle && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={reduced ? INSTANT : { duration: 0.8, ease: EASE, delay: 0.18 }}
                    style={subtitleStyle}
                  >
                    {cur.subtitle}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls: Arrows & Progress */}
          {(o.showControls || o.showProgress) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                flexWrap: "wrap",
                paddingTop: 10,
              }}
            >
              {o.showControls && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {/* Left Arrow Button */}
                  <Btn onClick={bringBack} label="Previous" fg={fg} interactive={interactive}>
                    <Arrow dir={-1} />
                  </Btn>
                  {/* Right Arrow Button (Next - triggers card moving to right and aligning behind) */}
                  <Btn onClick={next} label="Next" fg={fg} solid={true} bg={o.background} interactive={interactive}>
                    {o.autoplay && playing && !isStatic && <PlayRing progress={progress} fg={fg} accent={accent} size={46} />}
                    <Arrow />
                  </Btn>
                </div>
              )}

              {o.showProgress && (
                <Progress
                  n={n}
                  active={active}
                  progress={progress}
                  fg={fg}
                  accent={accent}
                  onSelect={goTo}
                  still={still}
                  interactive={interactive}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </StaticContext.Provider>
  );
};

export default StackSlider;