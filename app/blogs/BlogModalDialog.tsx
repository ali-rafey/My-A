'use client';

// Client-side wrapper for the intercepting-route modal. Responsible for everything the server
// component can't do: locking body scroll, closing on Escape / scrim click, and `router.back()`
// to dismiss (which pops the /blogs/<slug> URL back to /blogs, also collapsing the modal slot).
//
// The actual post content (title, cover, body) is composed by the server component at
// app/blogs/@modal/(.)[slug]/page.tsx and passed in as children — keeps the data fetch + sanitize
// on the server and this file purely interactive.
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import styles from './BlogModalDialog.module.css';

type Props = {
  children: React.ReactNode;
  title: string;
};

export default function BlogModalDialog({ children, title }: Props) {
  const router = useRouter();
  const close = useCallback(() => router.back(), [router]);

  // Lock page scroll while the modal is open + bind Escape to close. Both are cleaned up on
  // unmount so the listing page's scroll position is preserved when the modal dismisses.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [close]);

  return (
    <>
      <div
        className={styles.scrim}
        onClick={close}
        aria-hidden="true"
      />
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // Stop propagation so a click inside the dialog doesn't bubble up to the scrim and close it.
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={close}
          aria-label="Close post"
        >
          <span aria-hidden="true">×</span>
        </button>
        <div className={styles.scroll}>
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </>
  );
}
