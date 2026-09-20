'use client';

import { useEffect, useRef } from 'react';
import styles from './ProcessCurve.module.css';

// Canvas-drawn exponential growth curve with a soft accent glow, drifting
// particles tracking the curve, and four labelled milestones
// (Discover → Design → Build → Launch). Renders only a <canvas>; the host
// section provides the surrounding layout. Colours are sampled from the
// --surface-* tokens on <html> and re-sampled when the theme changes.

const STEPS = [
  { t: 'Discover', d: 'Map your goals to a\nmeasurable, lean plan.',         pct: 0.06 },
  { t: 'Design',   d: 'Strategy, brand and UX\naligned to your audience.', pct: 0.30 },
  { t: 'Build',    d: 'Web, mobile and AI\nin tight, shippable sprints.',  pct: 0.58 },
  { t: 'Launch',   d: 'Deploy, measure, and\ncompound real-user growth.', pct: 0.88 },
] as const;

type RGB = [number, number, number];

// A <canvas> cannot read CSS custom properties, so the palette is sampled off
// <html> instead. Kept behind a ref and refreshed by a data-theme observer
// rather than by re-running the draw effect: re-running would restart the
// intro animation (and re-fire onIntroDone, which drives the navbar showcase)
// every time someone flips the theme.
type CurvePalette = {
  inkLabel: string;
  inkMuted: string;
  lineSoft: string;
  dotRing: string;
  stops: [RGB, RGB, RGB, RGB];
};

const FALLBACK_STOPS: [RGB, RGB, RGB, RGB] = [
  [125, 169, 251],
  [46, 110, 247],
  [8, 119, 222],
  [4, 75, 137],
];

function hexToRgb(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function readPalette(): CurvePalette {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  const ink = v('--surface-ink-rgb', '10, 32, 54');
  const parsed = v('--surface-curve-stops', '')
    .split(',')
    .map((c) => hexToRgb(c))
    .filter((c): c is RGB => c !== null);
  return {
    inkLabel: v('--surface-heading', '#0A2036'),
    inkMuted: `rgba(${ink}, 0.55)`,
    lineSoft: `rgba(${ink}, 0.12)`,
    // Matches the page ground so each dot reads as punched out of the curve.
    dotRing: v('--surface-page', '#FFFFFF'),
    stops: parsed.length === 4 ? (parsed as [RGB, RGB, RGB, RGB]) : FALLBACK_STOPS,
  };
}

function lerp(a: RGB, b: RGB, t: number) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(
    a[1] + (b[1] - a[1]) * t,
  )},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}
function gradColor(stops: [RGB, RGB, RGB, RGB], t: number) {
  if (t < 0.5) return lerp(stops[0], stops[1], t / 0.5);
  return lerp(stops[1], stops[3], (t - 0.5) / 0.5);
}
const rgbCss = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

type ProcessCurveProps = {
  className?: string;
  /** When true, the curve animates from 0 → 1 over `introDurationMs` on mount.
      When false (default), the curve renders fully on every frame. The intro
      animation runs INSIDE the existing rAF draw loop — no React re-renders. */
  intro?: boolean;
  /** Fires once when the intro animation reaches 100%. */
  onIntroDone?: () => void;
  /** Duration of the intro draw in milliseconds. Default 2500. */
  introDurationMs?: number;
};

const DEFAULT_INTRO_MS = 2500;

export default function ProcessCurve({
  className,
  intro = false,
  onIntroDone,
  introDurationMs = DEFAULT_INTRO_MS,
}: ProcessCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  // All animation state is stored in refs so the rAF loop can read/write
  // without going through React state — that's what was causing the visible
  // lag near the top of the curve (60Hz React re-renders + aggressive
  // ease-out made the last 10 % of the timeline visually almost stall).
  const progressRef = useRef(intro ? 0 : 1);
  const introStartRef = useRef<number | null>(null);
  const introDoneRef = useRef(false);
  const onIntroDoneRef = useRef(onIntroDone);
  useEffect(() => { onIntroDoneRef.current = onIntroDone; }, [onIntroDone]);

  const paletteRef = useRef<CurvePalette>({
    inkLabel: '#0A2036',
    inkMuted: 'rgba(10, 32, 54, 0.55)',
    lineSoft: 'rgba(10, 32, 54, 0.12)',
    dotRing: '#FFFFFF',
    stops: FALLBACK_STOPS,
  });

  // Re-sample on theme change. Mutating the ref is enough — the rAF loop picks
  // the new palette up on its very next frame, with no re-render and without
  // disturbing the intro animation's progress.
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => { paletteRef.current = readPalette(); };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxMaybe = canvasEl.getContext('2d');
    if (!ctxMaybe) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctxMaybe;

    const dpr = window.devicePixelRatio || 1;
    let time = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function curveY(x: number, w: number, h: number) {
      const padB = 92;
      const padT = 18;
      const usable = h - padB - padT;
      const t = x / w;
      const raw = (Math.exp(3.8 * t) - 1) / (Math.exp(3.8) - 1);
      return h - padB - raw * usable;
    }

    const particles = Array.from({ length: 18 }, () => ({
      pct: Math.random(),
      speed: 0.0004 + Math.random() * 0.0005,
      size: 1.5 + Math.random() * 2.5,
      offsetY: (Math.random() - 0.5) * 28,
      opacity: 0.3 + Math.random() * 0.5,
    }));

    // Seed the palette for this mount; the observer below keeps it current.
    paletteRef.current = readPalette();

    // Mark the intro start the first time draw() runs while intro is on.
    if (intro && introStartRef.current === null) {
      introStartRef.current = performance.now();
      progressRef.current = 0;
      introDoneRef.current = false;
    }

    function draw() {
      // One property read per frame — no getComputedStyle in the hot path.
      const { inkLabel, inkMuted, lineSoft, dotRing, stops } = paletteRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      time++;

      // Intro tick — advance progress linearly from 0 → 1 over the duration.
      // Linear (not ease-out) so the curve "lands" at the peak at a steady
      // pace instead of crawling the last 10 % which read as lag.
      if (introStartRef.current !== null && !introDoneRef.current) {
        const elapsed = performance.now() - introStartRef.current;
        const t = Math.min(1, elapsed / introDurationMs);
        progressRef.current = t;
        if (t >= 1) {
          introDoneRef.current = true;
          // Defer the callback so it doesn't synchronously trigger React
          // state updates inside our rAF tick.
          const cb = onIntroDoneRef.current;
          if (cb) queueMicrotask(cb);
        }
      }

      const padL = 40;
      const padR = 40;
      const cw = w - padL - padR;

      const gradient = ctx.createLinearGradient(padL, 0, padL + cw, 0);
      gradient.addColorStop(0, rgbCss(stops[0]));
      gradient.addColorStop(0.45, rgbCss(stops[1]));
      gradient.addColorStop(0.75, rgbCss(stops[2]));
      gradient.addColorStop(1, rgbCss(stops[3]));

      // Partial-draw window — only render up to progress * cw across.
      const p = Math.max(0, Math.min(1, progressRef.current));
      const drawW = cw * p;

      if (drawW > 0) {
        // Glow
        ctx.save();
        ctx.filter = 'blur(18px)';
        ctx.globalAlpha = 0.34;
        ctx.beginPath();
        ctx.moveTo(padL, curveY(0, cw, h));
        for (let x = 0; x <= drawW; x += 3) ctx.lineTo(padL + x, curveY(x, cw, h));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.restore();

        // Main curve
        ctx.beginPath();
        ctx.moveTo(padL, curveY(0, cw, h));
        for (let x = 0; x <= drawW; x += 2) ctx.lineTo(padL + x, curveY(x, cw, h));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Particles — only ones whose pct has already been "drawn" appear.
      particles.forEach((part) => {
        part.pct = (part.pct + part.speed) % 1;
        if (part.pct > p) return;
        const px = part.pct * cw;
        const py = curveY(px, cw, h) + part.offsetY + Math.sin(time * 0.03 + part.pct * 10) * 6;
        ctx.beginPath();
        ctx.arc(padL + px, py, part.size, 0, Math.PI * 2);
        ctx.fillStyle = gradColor(stops, part.pct);
        ctx.globalAlpha = part.opacity * (0.6 + 0.4 * Math.sin(time * 0.04 + part.pct * 8));
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Baseline
      const baseY = h - 90;
      ctx.beginPath();
      ctx.moveTo(padL, baseY);
      ctx.lineTo(padL + cw, baseY);
      ctx.strokeStyle = lineSoft;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Milestones — each only appears once the curve has drawn past it.
      const stepColors = stops;
      STEPS.forEach((s, si) => {
        if (s.pct > p) return;
        const mx = s.pct * cw;
        const my = curveY(mx, cw, h);
        const col = rgbCss(stepColors[si]);

        ctx.beginPath();
        ctx.moveTo(padL + mx, my + 12);
        ctx.lineTo(padL + mx, baseY);
        ctx.strokeStyle = lineSoft;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(padL + mx, my, 16, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.15 + 0.05 * Math.sin(time * 0.04);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(padL + mx, my, 6, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(padL + mx, my, 6, 0, Math.PI * 2);
        ctx.strokeStyle = dotRing;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = "600 14px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = inkLabel;
        ctx.textAlign = 'center';
        ctx.fillText(s.t, padL + mx, baseY + 22);

        // The two-line descriptions are centred on each milestone and collide
        // once the milestones are packed closer than the text is wide — which
        // happens on narrow (mobile) canvases. Below this width, draw only the
        // short labels above; the descriptions reappear when there's room.
        if (w >= 520) {
          ctx.font = "11px 'Inter', system-ui, sans-serif";
          ctx.fillStyle = inkMuted;
          s.d.split('\n').forEach((line, li) => {
            ctx.fillText(line, padL + mx, baseY + 38 + li * 13);
          });
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className={`${styles.canvas} ${className ?? ''}`} aria-hidden="true" />;
}
