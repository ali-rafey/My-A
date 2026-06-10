'use client';

import { useEffect, useRef } from 'react';
import styles from './ProcessCurve.module.css';

// Canvas-drawn exponential growth curve with a soft accent glow, drifting
// particles tracking the curve, and four labelled milestones
// (Discover → Design → Build → Launch). Renders only a <canvas>; the host
// section provides the surrounding layout. White-theme colors: navy labels,
// muted-steel descriptions, white rings around dots.

const STEPS = [
  { t: 'Discover', d: 'Map your goals to a\nmeasurable, lean plan.',         pct: 0.06 },
  { t: 'Design',   d: 'Strategy, brand and UX\naligned to your audience.', pct: 0.30 },
  { t: 'Build',    d: 'Web, mobile and AI\nin tight, shippable sprints.',  pct: 0.58 },
  { t: 'Launch',   d: 'Deploy, measure, and\ncompound real-user growth.', pct: 0.88 },
] as const;

const C1: [number, number, number] = [125, 169, 251];
const C2: [number, number, number] = [ 46, 110, 247];
const C3: [number, number, number] = [  8, 119, 222];
const C4: [number, number, number] = [  4,  75, 137];

function lerp(a: [number, number, number], b: [number, number, number], t: number) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(
    a[1] + (b[1] - a[1]) * t,
  )},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}
function gradColor(t: number) {
  if (t < 0.5) return lerp(C1, C2, t / 0.5);
  return lerp(C2, C4, (t - 0.5) / 0.5);
}

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

    // White-canvas theme.
    const inkLabel = '#0A2036';
    const inkMuted = 'rgba(10, 32, 54, 0.55)';
    const lineSoft = 'rgba(10, 32, 54, 0.12)';
    const dotRing = '#FFFFFF';

    // Mark the intro start the first time draw() runs while intro is on.
    if (intro && introStartRef.current === null) {
      introStartRef.current = performance.now();
      progressRef.current = 0;
      introDoneRef.current = false;
    }

    function draw() {
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
      gradient.addColorStop(0, '#7DA9FB');
      gradient.addColorStop(0.45, '#2E6EF7');
      gradient.addColorStop(0.75, '#0877DE');
      gradient.addColorStop(1, '#044B89');

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
        ctx.fillStyle = gradColor(part.pct);
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
      const stepColors = [C1, C2, C3, C4];
      STEPS.forEach((s, si) => {
        if (s.pct > p) return;
        const mx = s.pct * cw;
        const my = curveY(mx, cw, h);
        const col = `rgb(${stepColors[si].join(',')})`;

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

        ctx.font = "11px 'Inter', system-ui, sans-serif";
        ctx.fillStyle = inkMuted;
        s.d.split('\n').forEach((line, li) => {
          ctx.fillText(line, padL + mx, baseY + 38 + li * 13);
        });
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
