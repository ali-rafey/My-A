'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './status.module.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`${styles.wrap} container`}>
      <span className="eyebrow">Something went wrong</span>
      <h1 className="sectionTitle">We hit an unexpected error</h1>
      <p className="sectionLead">
        Try again, or head back home and we&apos;ll keep things moving.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className={styles.secondary}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
