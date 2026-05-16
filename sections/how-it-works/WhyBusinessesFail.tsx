'use client';

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';
import styles from './WhyBusinessesFail.module.css';

// =============================================================================
// "Why Most Businesses Fail Online" — fully-animated retention bento.
// =============================================================================
//
// Layered animation system:
//   1. Background:
//      - Two gradient orbs (pink + blue) on slow drift loops
//      - Graph-paper grid backdrop, eaten on all sides via radial mask
//      - Section-wide cursor halo (rAF-lerped, follows the mouse)
//
//   2. Headline:
//      - Title splits into word-spans, each fades up with 80 ms stagger
//      - Subtitle follows after the last word
//
//   3. Each card:
//      - Scroll-in cascade (cardIn keyframe, 80 ms stagger)
//      - Stat counter 0 → target, ease-out-cubic, ~1.5s
//      - 3D tilt that tracks cursor (rAF-lerped CSS vars, max ±5°)
//      - Magnetic translate (card drifts toward cursor, max 8 px)
//      - Soft white cursor spotlight overlay (mix-blend friendly)
//      - Hover lift (-8 px) with deep navy shadow
//      - Stat-numeral halo brightens on hover
//      - Idle breath (scale 1 → 1.008 → 1, 7 s loop, per-card phase)
//
// All custom-property-based animations rely on @property registrations
// declared in the companion CSS module.
//
// Reduced motion: every dynamic piece short-circuits to its rest state.
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

const TITLE_WORDS = ['Why', 'Most', 'Businesses', 'Fail', 'Online'];

const MAX_TILT_DEG = 5;
const MAX_MAGNET_PX = 8;
const TILT_LERP = 0.18;
const COUNTER_DURATION_MS = 1500;
const COUNTER_BASE_DELAY_MS = 700;
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
// Section-wide cursor halo. Lerps a soft radial-gradient position toward
// the cursor, written to two custom properties on a fixed-fill element.
// -----------------------------------------------------------------------------
function CursorHalo({
  sectionRef,
  reducedMotion,
}: {
  sectionRef: RefObject<HTMLElement>;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const halo = ref.current;
    if (!section || !halo) return;

    let raf = 0;
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;

    const animate = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      halo.style.setProperty('--halo-x', `${currentX.toFixed(1)}%`);
      halo.style.setProperty('--halo-y', `${currentY.toFixed(1)}%`);
      raf = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
    };

    const onLeave = () => {
      targetX = 50;
      targetY = 50;
    };

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [sectionRef, reducedMotion]);

  return <div ref={ref} className={styles.cursorHalo} aria-hidden="true" />;
}

// -----------------------------------------------------------------------------
// BentoCard — owns its counter + per-card mouse tracking (tilt + magnet +
// spotlight position).
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

  // -------- Counter animation --------
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

  // -------- Tilt + magnet via rAF lerp --------
  const targetTiltX = useRef(0);
  const targetTiltY = useRef(0);
  const currentTiltX = useRef(0);
  const currentTiltY = useRef(0);
  const targetMagX = useRef(0);
  const targetMagY = useRef(0);
  const currentMagX = useRef(0);
  const currentMagY = useRef(0);
  const rafRef = useRef(0);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const animate = () => {
    const el = ref.current;
    if (!el) {
      rafRef.current = 0;
      return;
    }
    const dtx = targetTiltX.current - currentTiltX.current;
    const dty = targetTiltY.current - currentTiltY.current;
    const dmx = targetMagX.current - currentMagX.current;
    const dmy = targetMagY.current - currentMagY.current;

    const settled =
      Math.abs(dtx) < 0.02 &&
      Math.abs(dty) < 0.02 &&
      Math.abs(dmx) < 0.05 &&
      Math.abs(dmy) < 0.05;

    if (settled) {
      currentTiltX.current = targetTiltX.current;
      currentTiltY.current = targetTiltY.current;
      currentMagX.current = targetMagX.current;
      currentMagY.current = targetMagY.current;
      el.style.setProperty('--bento-tx', `${currentTiltX.current.toFixed(2)}deg`);
      el.style.setProperty('--bento-ty', `${currentTiltY.current.toFixed(2)}deg`);
      el.style.setProperty('--bento-mag-x', `${currentMagX.current.toFixed(1)}px`);
      el.style.setProperty('--bento-mag-y', `${currentMagY.current.toFixed(1)}px`);
      rafRef.current = 0;
      return;
    }

    currentTiltX.current += dtx * TILT_LERP;
    currentTiltY.current += dty * TILT_LERP;
    currentMagX.current += dmx * TILT_LERP;
    currentMagY.current += dmy * TILT_LERP;
    el.style.setProperty('--bento-tx', `${currentTiltX.current.toFixed(2)}deg`);
    el.style.setProperty('--bento-ty', `${currentTiltY.current.toFixed(2)}deg`);
    el.style.setProperty('--bento-mag-x', `${currentMagX.current.toFixed(1)}px`);
    el.style.setProperty('--bento-mag-y', `${currentMagY.current.toFixed(1)}px`);
    rafRef.current = requestAnimationFrame(animate);
  };

  const onMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = (x - rect.width / 2) / (rect.width / 2);
    const cy = (y - rect.height / 2) / (rect.height / 2);

    // Tilt — leans toward the cursor
    targetTiltX.current = cy * MAX_TILT_DEG;
    targetTiltY.current = -cx * MAX_TILT_DEG;

    // Magnet — card drifts toward the cursor
    targetMagX.current = cx * MAX_MAGNET_PX;
    targetMagY.current = cy * MAX_MAGNET_PX;

    // Spotlight position (no lerp — feels too sluggish; follow exactly)
    el.style.setProperty('--bento-mx', `${(x / rect.width) * 100}%`);
    el.style.setProperty('--bento-my', `${(y / rect.height) * 100}%`);

    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
  };

  const onMouseLeave = () => {
    if (reducedMotion) return;
    targetTiltX.current = 0;
    targetTiltY.current = 0;
    targetMagX.current = 0;
    targetMagY.current = 0;
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
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ''} section`}
      aria-labelledby="why-fail-title"
    >
      {/* Atmosphere layer — orbs + grid backdrop + cursor halo */}
      <div className={`${styles.orb} ${styles.orbPink}`} aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbBlue}`} aria-hidden="true" />
      <div className={styles.gridBackdrop} aria-hidden="true" />
      <CursorHalo sectionRef={sectionRef} reducedMotion={reducedMotion} />

      <div className={`container ${styles.containerInner}`}>
        <header className={styles.header}>
          <h2 id="why-fail-title" className={styles.title}>
            {TITLE_WORDS.map((word, i) => (
              <span
                key={word}
                className={styles.titleWord}
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                {word}
                {i < TITLE_WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <p className={styles.subtitle}>
            The numbers reveal what most businesses ignore.
          </p>
        </header>

        <div className={styles.grid}>
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
