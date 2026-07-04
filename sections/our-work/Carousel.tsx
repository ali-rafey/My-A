'use client';

import { Children, useState } from 'react';
import styles from './WorkShowcase.module.css';

// Client wrapper for the Work Showcase carousel.
//
// The project cards themselves are rendered on the SERVER (passed in here as
// `children`), so their CSS ships as part of the route's stylesheet and is
// applied before paint on client-side navigation — no flash of unstyled
// content. This thin client layer only owns the page index, the sliding
// transform, and the prev/next controls.
export default function Carousel({ children }: { children: React.ReactNode }) {
  const slides = Children.toArray(children);
  const pageCount = slides.length;
  const [page, setPage] = useState(0);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1));

  return (
    <>
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {slides}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.navButton}
          onClick={goPrev}
          disabled={page === 0}
          aria-label="Previous projects"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {pageCount > 1 ? (
          <span className={styles.pageStatus} aria-live="polite">
            {page + 1} / {pageCount}
          </span>
        ) : null}

        <button
          type="button"
          className={styles.navButton}
          onClick={goNext}
          disabled={page === pageCount - 1}
          aria-label="Next projects"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
