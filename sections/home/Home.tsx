'use client';

import { useEffect, useState } from 'react';
import RotatingWord from './RotatingWord';
import ProcessCurve from '../process-curve/ProcessCurve';
import styles from './Home.module.css';

// ---------------------------------------------------------------------------
// One-time intro gate
// ---------------------------------------------------------------------------
// Module-level state: persists across Home remounts in the same browser tab,
// resets on a fresh page load (Cmd+R, new tab) because the module is
// re-evaluated. So:
//   • fresh load on /                       → intro plays
//   • Cmd+R on any page, then visit /       → intro plays
//   • client-side nav from any page to /    → intro skipped, page just shows
//   • navigate away mid-intro and come back → intro skipped (started counts)
//
// The flag flips the instant the intro starts (not when it completes) so the
// "navigate away mid-intro" case is handled. To survive React Strict Mode's
// dev double-mount (effect runs → cleanup → effect runs again, all within a
// frame) we ignore the flag when the previous start was less than
// STRICT_MODE_WINDOW_MS ago — that's Strict Mode's second pass, not a real
// re-entry. A real user couldn't navigate that fast.
// ---------------------------------------------------------------------------
let introHasStarted = false;
let introStartedAt = 0;
const STRICT_MODE_WINDOW_MS = 100;

const FADE_MS = 800;        // hero copy fade-in duration
const NAVBAR_LEAD_MS = 200; // pause after copy lands before navbar showcase

type Phase = 'drawing' | 'fading' | 'done';

export default function Home() {
  // First mount in this tab: 'drawing'. Subsequent navigations back to /:
  // start at 'done' so the page just appears with no animation.
  const [phase, setPhase] = useState<Phase>(introHasStarted ? 'done' : 'drawing');

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const now =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    const isStrictModeReentry =
      introHasStarted && now - introStartedAt < STRICT_MODE_WINDOW_MS;

    if ((introHasStarted && !isStrictModeReentry) || reduceMotion) {
      // Already played in this module session — OR reduced-motion: skip the
      // intro and fire the event so the Navbar (if it's waiting) can run.
      setPhase('done');
      window.dispatchEvent(new CustomEvent('escaleads-intro-complete'));
      if (reduceMotion) {
        introHasStarted = true;
        introStartedAt = now;
      }
      return;
    }

    // Flag the start NOW so a navigate-away-mid-intro followed by a navigate
    // back also counts as "already played" (subsequent mount sees the flag
    // and skips). The Strict Mode dev double-mount is filtered above by the
    // 100ms timestamp window — Strict Mode's second pass falls through and
    // restarts the intro cleanly because the first pass's cleanup has
    // already cancelled the original rAF inside ProcessCurve.
    introHasStarted = true;
    introStartedAt = now;
    setPhase('drawing');
  }, []);

  // Called by ProcessCurve the moment the curve finishes drawing.
  const handleCurveDone = () => {
    setPhase('fading');
    setTimeout(() => {
      setPhase('done');
      window.dispatchEvent(new CustomEvent('escaleads-intro-complete'));
    }, FADE_MS + NAVBAR_LEAD_MS);
  };

  const showSupporting = phase !== 'drawing';

  return (
    <section className={`${styles.section} section`} id="home">
      <div className={styles.bgWrap} aria-hidden="true">
        <div className={styles.aurora} />
        <div className={styles.grid} />
        <div className={styles.noise} />
      </div>

      <div className="container">
        <div className={styles.heroGrid}>
          <div className={`${styles.copy} ${showSupporting ? '' : styles.copyHidden}`}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              Available for projects · 2026
            </span>

            <h1 className={styles.headline}>
              <span className={styles.headlineLine}>We Escalate Your Leads</span>
              <span className={styles.headlineLine}>
                Into <RotatingWord />
              </span>
            </h1>

            <p className={styles.lead}>
              Your Business Deserves More Than Just Growth, It Deserves a Legacy
            </p>

            <div className={styles.actions}>
              <a href="#contact" className={styles.primaryBtn}>
                <span>Start a project</span>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </a>
              <a href="#our-work" className={styles.ghostBtn}>
                See our work
              </a>
            </div>
          </div>

          <div className={styles.curveSlot}>
            <ProcessCurve
              intro={phase === 'drawing'}
              onIntroDone={handleCurveDone}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
