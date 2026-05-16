'use client';

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import styles from './WhyBusinessesFail.module.css';

// =============================================================================
// "Why Most Businesses Fail Online" — animated bento.
// =============================================================================
//
// What's animated:
//   1. Entry: cards fade up with an 80ms cascade once the grid enters view.
//   2. Counters: each stat numeral counts from 0 to its target with
//      ease-out-cubic over ~1.5s, staggered per card.
//   3. 3D tilt: each card tracks the cursor with rAF-lerped rotateX/Y,
//      max ±5°. CSS custom properties carry the angles into the card's
//      compound transform.
//   4. Spotlight: a soft white radial gradient (::before in CSS) follows
//      the cursor inside the hovered card, position written to two
//      custom properties from this component.
//
// Reduced motion: all of the above are skipped. Stats render at their
// final values, cards render in their final state, no tilt or spotlight.
// =============================================================================

type Card = {
  title: string;
  stat: string;
  statLabel: string;
  body: string;
};

const CARDS: Card[] = [
  {
    title: "Going Online Isn't Enough Anymore",
    stat: '83%',
    statLabel: 'Stay Invisible',
    body:
      'Having a website is no longer a competitive advantage. Without strategy, ' +
      'visibility, and the right digital ecosystem, most businesses simply go unnoticed.',
  },
  {
    title: 'Advertise Smarter Not Louder',
    stat: '200%',
    statLabel: 'Cost Rise',
    body: 'Spending more on ads without strategy burns budget and builds nothing.',
  },
  {
    title: 'SEO in the AI Era',
    stat: '42%',
    statLabel: 'Miss Their Market',
    body:
      'Search has changed. AI is reshaping how customers find businesses. ' +
      'Old SEO tactics no longer work.',
  },
  {
    title: 'Most Businesses Go Online and Disappear',
    stat: '10%',
    statLabel: 'Survive 90 Days',
    body: 'Launching is easy. Surviving requires data, strategy, and execution.',
  },
  {
    title: 'Blind Decisions on Wrong Data',
    stat: '60%',
    statLabel: "Can't Read Data",
    body:
      "Vanity metrics like traffic and followers don't pay bills. " +
      'Real growth needs real data.',
  },
];

const MAX_TILT_DEG = 5;
const TILT_LERP = 0.18;
const COUNTER_DURATION_MS = 1500;
const COUNTER_BASE_DELAY_MS = 500;
const COUNTER_PER_INDEX_MS = 100;

function parseStat(stat: string): { target: number; suffix: string } {
  const m = stat.match(/^(\d+)(.*)$/);
  return m ? { target: parseInt(m[1], 10), suffix: m[2] } : { target: 0, suffix: stat };
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// -----------------------------------------------------------------------------
// BentoCard — owns its counter and its mouse-tracked tilt/spotlight state.
// -----------------------------------------------------------------------------
function BentoCard({
  card,
  index,
  visible,
  reducedMotion,
}: {
  card: Card;
  index: number;
  visible: boolean;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { target, suffix } = parseStat(card.stat);
  const [count, setCount] = useState(0);

  // -------- Counter animation: 0 → target with ease-out-cubic ----------
  useEffect(() => {
    if (!visible) return;
    if (reducedMotion) {
      setCount(target);
      return;
    }

    const startDelay = COUNTER_BASE_DELAY_MS + index * COUNTER_PER_INDEX_MS;
    let startTime: number | null = null;
    let raf = 0;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (startTime === null) startTime = now + startDelay;
      const elapsed = now - startTime;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / COUNTER_DURATION_MS, 1);
      setCount(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, index, reducedMotion]);

  // -------- 3D tilt + spotlight: rAF-lerp the CSS variables ----------
  // currentX/Y hold the angle being displayed; targetX/Y hold the angle
  // we're easing toward. animate() pumps the lerp until the values
  // converge, then stops. Storing in refs avoids re-renders on every
  // mouse move (which would be 60+/s).
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const animate = () => {
    const el = ref.current;
    if (!el) {
      rafRef.current = 0;
      return;
    }
    const dx = targetX.current - currentX.current;
    const dy = targetY.current - currentY.current;
    if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.02) {
      currentX.current = targetX.current;
      currentY.current = targetY.current;
      el.style.setProperty('--bento-tx', `${currentX.current.toFixed(2)}deg`);
      el.style.setProperty('--bento-ty', `${currentY.current.toFixed(2)}deg`);
      rafRef.current = 0;
      return;
    }
    currentX.current += dx * TILT_LERP;
    currentY.current += dy * TILT_LERP;
    el.style.setProperty('--bento-tx', `${currentX.current.toFixed(2)}deg`);
    el.style.setProperty('--bento-ty', `${currentY.current.toFixed(2)}deg`);
    rafRef.current = requestAnimationFrame(animate);
  };

  const onMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = (x - rect.width / 2) / (rect.width / 2);   // -1 .. 1
    const cy = (y - rect.height / 2) / (rect.height / 2); // -1 .. 1

    // Tilt toward cursor: cursor at top → top of card rises toward viewer.
    targetX.current = cy * MAX_TILT_DEG;
    targetY.current = -cx * MAX_TILT_DEG;

    // Spotlight follows cursor exactly (no easing — feels too sluggish).
    el.style.setProperty('--bento-mx', `${(x / rect.width) * 100}%`);
    el.style.setProperty('--bento-my', `${(y / rect.height) * 100}%`);

    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
  };

  const onMouseLeave = () => {
    if (reducedMotion) return;
    targetX.current = 0;
    targetY.current = 0;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
  };

  return (
    <article
      ref={ref}
      className={styles.card}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <h3 className={styles.cardTitle}>{card.title}</h3>
      <div className={styles.stat}>
        <span className={styles.statNumber}>
          {count}
          {suffix}
        </span>
        <span className={styles.statLabel}>{card.statLabel}</span>
      </div>
      <p className={styles.cardBody}>{card.body}</p>
    </article>
  );
}

// -----------------------------------------------------------------------------
// Main section
// -----------------------------------------------------------------------------
export default function WhyBusinessesFail() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);

  return (
    <section className={`${styles.section} section`} aria-labelledby="why-fail-title">
      {/* Graph-paper backdrop. Sits below cards; eaten on all sides via
          a radial mask in CSS so it reads as atmosphere, not a hard plane. */}
      <div className={styles.gridBackdrop} aria-hidden="true" />

      <div className="container">
        <header className={styles.header}>
          <h2 id="why-fail-title" className={styles.title}>
            Why Most Businesses Fail Online
          </h2>
          <p className={styles.subtitle}>
            The numbers reveal what most businesses ignore.
          </p>
        </header>

        <div
          ref={gridRef}
          className={`${styles.grid} ${visible ? styles.visible : ''}`}
        >
          {CARDS.map((card, i) => (
            <BentoCard
              key={card.title}
              card={card}
              index={i}
              visible={visible}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
