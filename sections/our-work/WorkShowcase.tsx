'use client';

import { useState } from 'react';
import { caseStudies } from '@/lib/content/static';
import styles from './WorkShowcase.module.css';

// =============================================================================
// Work Showcase — the dedicated /our-work page.
// =============================================================================
// Centred header, then a paged carousel of project cards (2×2 per page). Each
// card pairs a placeholder "browser screenshot" thumbnail with the project
// title, description, and category tags. The carousel slides one page of four
// at a time; prev/next controls disable at the boundaries. Placeholder
// thumbnails stand in until real project screenshots are added.
// =============================================================================

const PER_PAGE = 4;

// Split the flat list into pages of four for the carousel track.
const pages: (typeof caseStudies)[] = [];
for (let i = 0; i < caseStudies.length; i += PER_PAGE) {
  pages.push(caseStudies.slice(i, i + PER_PAGE));
}

export default function WorkShowcase() {
  const [page, setPage] = useState(0);
  const pageCount = pages.length;

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1));

  return (
    <section className={`${styles.section} section`} id="our-work">
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>Real Results, Real Impact</h1>
          <p className={styles.subtitle}>
            A showcase of the innovative software and AI solutions we have delivered for our
            clients across various industries.
          </p>
        </header>

        <div className={styles.viewport}>
          <div
            className={styles.track}
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((group, gi) => (
              <div className={styles.page} key={gi} aria-hidden={gi !== page}>
                <div className={styles.grid}>
                  {group.map((project) => (
                    <article key={project.id} className={styles.card}>
                      <div
                        className={styles.thumb}
                        style={{ '--accent': project.accent } as React.CSSProperties}
                      >
                        <div className={styles.browserBar} aria-hidden="true">
                          <span className={styles.dot} />
                          <span className={styles.dot} />
                          <span className={styles.dot} />
                        </div>
                        <div className={styles.thumbBody}>
                          <span className={styles.thumbMark}>{project.title.charAt(0)}</span>
                        </div>
                      </div>

                      <div className={styles.content}>
                        <h3 className={styles.cardTitle}>{project.title}</h3>
                        <p className={styles.cardText}>{project.description}</p>
                        <ul className={styles.tags}>
                          {project.tags.map((tag) => (
                            <li key={tag} className={styles.tag}>
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
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
      </div>
    </section>
  );
}
