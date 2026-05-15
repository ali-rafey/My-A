'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './WhyBusinessesFail.module.css';

// Editorial bento section: five problem cards on an asymmetric pastel grid.
// Each card has the same building blocks (title, stat numeral, stat label,
// body copy) but card 1 uses a horizontal layout (title left / stat right)
// while cards 2-5 use a vertical layout (title top / stat middle / body
// bottom). Placement and colour are assigned via :nth-child in CSS so the
// TSX stays pure data.
//
// Animation: IntersectionObserver flips a `visible` class on the grid; the
// CSS keyframe + nth-child stagger then reveals each card with an 80 ms
// cascade. animation-delay (not transition-delay) so hover stays instant.

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

export default function WhyBusinessesFail() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

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
            <article key={card.title} className={styles.card}>
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
