'use client';

import styles from './Home.module.css';

function smoothScrollTo(id: string) {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
  }
}

export default function HeroActions() {
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.primary} onClick={() => smoothScrollTo('services')}>
        Get Started
      </button>
      <button type="button" className={styles.secondary} onClick={() => smoothScrollTo('how-it-works')}>
        Learn More
      </button>
    </div>
  );
}
