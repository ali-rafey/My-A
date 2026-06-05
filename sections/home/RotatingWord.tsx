'use client';

import { useEffect, useState } from 'react';
import styles from './Home.module.css';

// Words cycle every ROTATE_MS. The CSS animation runs for ~450ms inside that
// window — the rest of the cycle is comfortable read time before the next swap.
// Stable order so the hero feels intentional, not random.
const WORDS = ['Profitability', 'Scalability', 'Sustainability'] as const;
const ROTATE_MS = 2500;

export default function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={styles.rotatingPill} aria-live="polite">
      {/* `key` remounts the inner span on each tick, restarting the CSS animation. */}
      <span key={index} className={styles.rotatingWord}>
        {WORDS[index]}
      </span>
    </span>
  );
}
