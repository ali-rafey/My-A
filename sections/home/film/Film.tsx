'use client';

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { SCENES, PRELOAD_IMAGES, PortraitContext } from './scenes';
import styles from './Film.module.css';

// =============================================================================
// The home-page film.
// =============================================================================
// A ~one-minute motion piece that tells what EscaLeads does as one story,
// modelled on the reference promo: a question and a brief, then each move in
// the order a business lives it — market research, digital presence, ad
// accounts connected and campaigns launched, the first sales, scaling, and
// the automation that scale calls for. See scenes.tsx for the beat sheet.
//
// HOW IT WORKS
//   • Every scene is composed on a fixed 1280×720 canvas and the canvas is
//     scaled to FILL the stage, the way a full-screen video would — so each
//     frame is exactly composed at any size, but stays vector-sharp and
//     themeable.
//   • Scenes animate with CSS keyframes and per-element delays. The clock here
//     only decides WHICH scene is mounted; pausing freezes every running
//     keyframe (animation-play-state) and the clock together, so they never
//     drift apart.
//   • Only one scene is mounted at a time.
//   • A stage taller than it is wide (a phone, a tablet held upright) gets
//     its own 720×1280 PORTRAIT canvas instead of a letterboxed 16:9 band:
//     the scenes read PortraitContext and re-compose for it — stacked copy,
//     a phone storefront, a vertical n8n flow, taps instead of a cursor.
//
// MOTION + ACCESSIBILITY
//   • WCAG 2.2.2: anything that moves on its own for more than 5s needs a
//     pause control — hence the play/pause button, which is not decoration.
//   • It also pauses itself when scrolled out of view or when the tab is
//     hidden, so it is never burning frames nobody is watching.
//   • prefers-reduced-motion: no autoplay. The film opens on its final frame
//     and plays only if the visitor asks it to.
//   • The canvas is aria-hidden; the story is given to assistive tech as a
//     plain sentence.
// =============================================================================

const TOTAL_MS = SCENES.reduce((sum, s) => sum + s.dur, 0);

const OUTRO_INDEX = SCENES.length - 1;
// The navbar waits for this before its page-load showcase. Fired as the logo
// sting finishes on the first pass, so the bar shows off beside the brand
// instead of over the opening line.
const INTRO_EVENT_AFTER = SCENES.findIndex((s) => s.id === 'logo');

const DESIGN_W = 1280;
const DESIGN_H = 720;
// The portrait canvas, and the stage shape (width / height) below which it is
// used. 0.8 catches every phone and a tablet held upright; a square-ish
// window stays on the landscape film.
const PORTRAIT_W = 720;
const PORTRAIT_H = 1280;
const PORTRAIT_BELOW = 0.8;
// How far past "contain" the canvas may scale to fill the screen. Laptop
// viewports sit close to 16:9, so this crops only a few percent off one axis;
// on a far wider or taller screen it stops here and the stage colour shows
// instead of cropping into the content. Scenes keep a matching safe area.
const MAX_OVERSCAN = 1.12;

// The canvas is chosen before the first paint (a layout effect) so a phone
// never flashes the landscape composition; on the server it is a no-op.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function Film() {
  const [index, setIndex] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [portrait, setPortrait] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const remaining = useRef(SCENES[0].dur);
  const startedAt = useRef(0);
  const skipBookkeeping = useRef(false);
  const introFired = useRef(false);
  const indexRef = useRef(0);
  indexRef.current = index;

  const running = ready && !userPaused && !hidden;

  const goTo = useCallback((target: number) => {
    remaining.current = SCENES[target].dur;
    skipBookkeeping.current = true;
    setIndex(target);
    setEpoch((e) => e + 1);
  }, []);

  // ── Reduced motion: open on the final frame, paused. ────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReduced(true);
      setUserPaused(true);
      remaining.current = SCENES[OUTRO_INDEX].dur;
      setIndex(OUTRO_INDEX);
      window.dispatchEvent(new CustomEvent('escaleads-intro-complete'));
      introFired.current = true;
    }
    setReady(true);
  }, []);

  // ── Warm the image cache so photos are decoded before their scene. ─────
  useEffect(() => {
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, []);

  // ── Pick the canvas for the stage's shape, then fit it (cover, capped). ─
  // A scene is composed for one canvas, so a LATER change of shape (a device
  // turned) replays the current scene from its start rather than snapping its
  // elements to new places mid-animation. The first measure needs no replay:
  // it lands before the first paint, and the scene is keyed on the shape.
  const shape = useRef<boolean | null>(null);
  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const fit = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (!width || !height) return;
      const tall = width / height < PORTRAIT_BELOW;
      const w = tall ? PORTRAIT_W : DESIGN_W;
      const h = tall ? PORTRAIT_H : DESIGN_H;
      const contain = Math.min(width / w, height / h);
      const cover = Math.max(width / w, height / h);
      canvas.style.setProperty('--k', String(Math.min(cover, contain * MAX_OVERSCAN)));
      if (shape.current !== null && shape.current !== tall) goTo(indexRef.current);
      shape.current = tall;
      setPortrait(tall);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [goTo]);

  // ── Pause when off-screen or when the tab is hidden. ───────────────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let offscreen = false;
    let tabHidden = document.hidden;
    const sync = () => setHidden(offscreen || tabHidden);
    const io = new IntersectionObserver(
      ([entry]) => { offscreen = entry.intersectionRatio < 0.25; sync(); },
      { threshold: [0, 0.25, 0.5] },
    );
    io.observe(stage);
    const onVis = () => { tabHidden = document.hidden; sync(); };
    document.addEventListener('visibilitychange', onVis);
    sync();
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // ── The clock. Only decides which scene is mounted. ────────────────────
  useEffect(() => {
    if (!running) return;
    startedAt.current = performance.now();
    const timer = window.setTimeout(() => {
      const current = indexRef.current;
      if (!introFired.current && current === INTRO_EVENT_AFTER) {
        introFired.current = true;
        window.dispatchEvent(new CustomEvent('escaleads-intro-complete'));
      }
      const next = (current + 1) % SCENES.length;
      remaining.current = SCENES[next].dur;
      skipBookkeeping.current = true;
      setIndex(next);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      if (skipBookkeeping.current) {
        skipBookkeeping.current = false;
        return;
      }
      // Paused mid-scene: bank what is left so resuming picks up exactly
      // where the frozen keyframes are.
      remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt.current));
    };
  }, [running, index, epoch]);

  // Dev-only QA hook: lets a test jump to any scene and freeze it at an exact
  // millisecond. Compiled out of production builds.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const w = window as unknown as { __film?: unknown };
    w.__film = {
      scenes: SCENES.map((sc) => ({ id: sc.id, dur: sc.dur })),
      goTo,
      pause: () => setUserPaused(true),
      play: () => setUserPaused(false),
    };
    // ?filmScene=<index>&filmT=<ms> — open frozen on one exact frame, for
    // headless frame capture during QA. Dev only, like the hook above.
    const params = new URLSearchParams(window.location.search);
    const qs = params.get('filmScene');
    let raf = 0;
    if (qs !== null) {
      const target = Math.max(0, Math.min(SCENES.length - 1, Number(qs) || 0));
      const t = Number(params.get('filmT') || 0);
      setUserPaused(true);
      goTo(target);
      const seek = () => {
        const stage = stageRef.current;
        if (!stage) return;
        stage.getAnimations({ subtree: true }).forEach((a) => {
          try { a.pause(); a.currentTime = t; } catch { /* finished */ }
        });
        document.documentElement.setAttribute('data-film-frozen', `${target}@${t}`);
      };
      raf = window.setTimeout(seek, 300);
    }
    return () => { delete w.__film; window.clearTimeout(raf); };
  }, [goTo]);

  const togglePlay = useCallback(() => {
    setUserPaused((p) => {
      // Asking to play from the reduced-motion poster starts from the top.
      if (p && reduced && indexRef.current === OUTRO_INDEX) {
        remaining.current = SCENES[0].dur;
        skipBookkeeping.current = true;
        setIndex(0);
        setEpoch((e) => e + 1);
      }
      return !p;
    });
  }, [reduced]);

  const scene = SCENES[index];
  const Scene = scene.Comp;
  const paused = !running;

  const sceneStyle = useMemo(
    () => ({ '--dur': `${scene.dur}ms`, '--exit': `${Math.max(0, scene.dur - 280)}ms` }) as CSSProperties,
    [scene.dur],
  );

  return (
    <div
      className={styles.film}
      data-orient={portrait ? 'portrait' : 'landscape'}
      data-paused={paused || undefined}
      data-reduced={reduced || undefined}
    >
      {/* The page's only H1. Not shown — the film carries the message on
          screen — but kept for screen readers and search engines. */}
      <h1 className={styles.srOnly}>
        We escalate your business: digital presence, research and data, advertising and automation.
      </h1>

      <Link href="/contact" className={styles.cta}>
        Start a project
        <span className={styles.ctaArrow} aria-hidden="true">&#8594;</span>
      </Link>

      <div ref={stageRef} className={styles.stage} data-tone={scene.tone}>
        <p className={styles.srOnly}>
          A short film: how far can your business go? A brand asks EscaLeads for growth. We study
          its audience and market, build its Shopify storefront, connect Meta and Google Ads and
          launch campaigns. A shopper taps an ad and buys; orders stack up; we scale the budget as
          sales and traffic climb, and automate the follow-up in n8n.
        </p>
        <div ref={canvasRef} className={styles.canvas} aria-hidden="true">
          <div key={`${index}-${epoch}-${portrait ? 'p' : 'l'}`} className={styles.scene} style={sceneStyle}>
            <PortraitContext.Provider value={portrait}>
              <Scene />
            </PortraitContext.Provider>
          </div>
        </div>

        <button
          type="button"
          className={styles.play}
          onClick={togglePlay}
          aria-label={userPaused ? 'Play the film' : 'Pause the film'}
          aria-pressed={!userPaused}
        >
          {userPaused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5.5" width="3.8" height="13" rx="1" /><rect x="13.7" y="5.5" width="3.8" height="13" rx="1" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}

export const FILM_TOTAL_MS = TOTAL_MS;
