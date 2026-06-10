'use client';

import { useEffect, useState } from 'react';
import RotatingWord from './RotatingWord';
import ProcessCurve from '../process-curve/ProcessCurve';
import styles from './Home.module.css';

// ---------------------------------------------------------------------------
// One-time intro gate
// ---------------------------------------------------------------------------
// Module-level flag: persists across remounts in the same browser tab, resets
// on a fresh page load (Cmd+R, new tab) because the module is re-evaluated.
// So:
//   • fresh load on /                          → intro plays
//   • client-side nav /services → /            → intro skipped, page just shows
//   • Cmd+R after that                          → intro plays again
// ---------------------------------------------------------------------------
let introHasPlayed = false;

const FADE_MS = 800;        // hero copy fade-in duration
const NAVBAR_LEAD_MS = 200; // pause after copy lands before navbar showcase

type Phase = 'drawing' | 'fading' | 'done';

export default function Home() {
  // First mount in this tab: 'drawing'. Subsequent navigations back to /:
  // start at 'done' so the page just appears with no animation.
  const [phase, setPhase] = useState<Phase>(introHasPlayed ? 'done' : 'drawing');

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (introHasPlayed || reduceMotion) {
      // Skip — but still fire the event so the Navbar (if it's waiting)
      // can run its showcase. Reduced-motion users get the flag set too so
      // they're not re-tried on the next mount.
      setPhase('done');
      window.dispatchEvent(new CustomEvent('escaleads-intro-complete'));
      if (reduceMotion) introHasPlayed = true;
      return;
    }
    // NOTE: do NOT set introHasPlayed = true here. React Strict Mode in dev
    // mounts every effect twice (mount → cleanup → mount). If we flagged the
    // intro as "played" on the first mount, the second mount would skip the
    // intro and fire the navbar event immediately — which is exactly the
    // "navbar expands without waiting" bug. The flag is set only AFTER the
    // intro completes (in handleCurveDone below), so a second strict-mode
    // mount safely re-starts the same intro and the cleanup of the first
    // mount has already cancelled the original rAF.
    setPhase('drawing');
  }, []);

  // Called by ProcessCurve the moment the curve finishes drawing.
  const handleCurveDone = () => {
    setPhase('fading');
    setTimeout(() => {
      setPhase('done');
      // Lock in "intro has played" only after the full sequence has finished.
      introHasPlayed = true;
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
