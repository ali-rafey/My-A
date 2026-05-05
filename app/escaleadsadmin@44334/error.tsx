'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminError({
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
    <div className={`${styles.shell} ${styles.shellCentered}`}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.stateTitle}>Something broke in the admin</h1>
          <p className={styles.stateText}>The page hit an error. Try again, or head back to the dashboard.</p>
          <div className={styles.formActions}>
            <button type="button" className={styles.button} onClick={() => reset()}>
              Try again
            </button>
            <Link href="/escaleadsadmin@44334" className={`${styles.button} ${styles.buttonGhost}`}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
