'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './WhyBusinessesFail.module.css';

// Editorial bento section: five problem cards, each anchored by a single
// stat. Animates in once when scrolled into view with a 80ms cascade.
//
// Animation rationale: a one-shot IntersectionObserver flips a class on
// the grid; cards transition via animation-delay nth-child stagger.
// animation-delay is decoupled from transition-delay, so hover (which
// reuses the same transform property) responds instantly without waiting
// out the stagger offset.

type Card = {
  title: string;
  stat: string;
  statLabel: string;
  body: string;
  span: 1 | 2;
};

const CARDS: Card[] = [
  {
    title: "Going Online Isn't Enough Anymore",
    stat: '83%',
    statLabel: 'Stay Invisible',
    body:
      'Having a website is no longer a competitive advantage. Without strategy, ' +
      'visibility, and the right digital ecosystem, most businesses simply go unnoticed.',
    span: 2,
  },
  {
    title: 'Advertise Smarter Not Louder',
    stat: '200%',
    statLabel: 'Cost Rise',
    body: 'Spending more on ads without strategy burns budget and builds nothing.',
    span: 1,
  },
  {
    title: 'SEO in the AI Era',
    stat: '42%',
    statLabel: 'Miss Their Market',
    body:
      'Search has changed. AI is reshaping how customers find businesses. ' +
      'Old SEO tactics no longer work.',
    span: 1,
  },
  {
    title: 'Most Businesses Go Online and Disappear',
    stat: '10%',
    statLabel: 'Survive 90 Days',
    body: 'Launching is easy. Surviving requires data, strategy, and execution.',
    span: 1,
  },
  {
    title: 'Blind Decisions on Wrong Data',
    stat: '60%',
    statLabel: "Can't Read Data",
    body:
      "Vanity metrics like traffic and followers don't pay bills. " +
      'Real growth needs real data.',
    span: 1,
  },
];

export default function WhyBusinessesFail() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    // Reduced motion: skip the scroll trigger, render fully visible immediately.
    if (
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
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
  }, []);

  return (
    <section className={`${styles.section} section`} aria-labelledby="why-fail-title">
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
          {CARDS.map((card) => (
            <article
              key={card.title}
              className={
                card.span === 2 ? `${styles.card} ${styles.cardLarge}` : styles.card
              }
            >
              {/* Thin gradient accent line that reveals on hover. */}
              <span className={styles.accent} aria-hidden="true" />

              <h3 className={styles.cardTitle}>{card.title}</h3>

              <div className={styles.stat}>
                <span className={styles.statNumber}>{card.stat}</span>
                <span className={styles.statLabel}>{card.statLabel}</span>
              </div>

              <p className={styles.cardBody}>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
