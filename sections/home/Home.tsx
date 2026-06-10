'use client';

import { useEffect, useState } from 'react';
import RotatingWord from './RotatingWord';
import ProcessCurve from '../process-curve/ProcessCurve';
import styles from './Home.module.css';

// Marquee items at the bottom of the hero. Slow horizontal scroll, dot-separated.
// The list is rendered twice in the DOM so the CSS keyframe can translate -50%
// and loop seamlessly.
const MARQUEE_ITEMS = [
  'Software Engineering', 'Mobile Applications', 'AI & Automation',
  'E-commerce Platforms', 'SaaS Products', 'Brand Systems',
  'CRM Dashboards', 'API Integrations', 'Growth Strategy', 'Performance UX',
] as const;

// ---------------------------------------------------------------------------
// Hero intro — plays on every fresh page load.
// ---------------------------------------------------------------------------
//   drawing  curve draws from ground (left) to peak (right), 2.5s.
//   fading   hero copy + marquee fade in together, 0.8s.
//   done     normal layout; a CustomEvent fires so the Navbar can run its
//            own expand-showcase as the final step in the sequence.
//
// Visitors with prefers-reduced-motion skip straight to 'done' and we fire
// the event immediately so the Navbar still gets its trigger (it'll noop
// on reduced-motion anyway, so no visual disruption either way).
// ---------------------------------------------------------------------------
const DRAW_MS = 2500;
const FADE_HOLD_MS = 150;   // tiny pause after draw before content fades
const FADE_MS = 800;        // content fade-in duration
const NAVBAR_LEAD_MS = 200; // pause after content lands before navbar triggers

type Phase = 'drawing' | 'fading' | 'done';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('drawing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setPhase('done');
      setProgress(1);
      window.dispatchEvent(new CustomEvent('escaleads-intro-complete'));
      return;
    }

    setPhase('drawing');
    setProgress(0);

    let rafId = 0;
    let fadeTimer = 0;
    let doneTimer = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / DRAW_MS);
      // Ease-out so the curve builds quickly then settles into its peak.
      const eased = 1 - Math.pow(1 - t, 2.4);
      setProgress(eased);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Hold a beat, then fade in the rest of the hero.
        fadeTimer = window.setTimeout(() => {
          setPhase('fading');
          // After the fade completes, mark done and signal the navbar.
          doneTimer = window.setTimeout(() => {
            setPhase('done');
            window.dispatchEvent(new CustomEvent('escaleads-intro-complete'));
          }, FADE_MS + NAVBAR_LEAD_MS);
        }, FADE_HOLD_MS);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, []);

  // Hero copy + marquee become visible the moment phase leaves 'drawing'.
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
            <ProcessCurve progress={progress} />
          </div>
        </div>
      </div>

      <div
        className={`${styles.marquee} ${showSupporting ? '' : styles.marqueeHidden}`}
        aria-hidden="true"
      >
        <div className={styles.marqueeTrack}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className={styles.marqueeItem}>
              <span className={styles.marqueeDot} aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
