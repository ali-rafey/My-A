'use client';

import { useState } from 'react';
import { caseStudies, type CaseStudyMockup } from '@/lib/content/static';
import styles from './WorkShowcase.module.css';

// =============================================================================
// Work Showcase — the dedicated /our-work page.
// =============================================================================
// Centred header, then a paged carousel of project cards (2×2 per page). Each
// card pairs a demo "product screenshot" thumbnail (an inline SVG UI mockup
// tinted with the project's accent) with the title, description, and tags. The
// carousel slides one page of four at a time; prev/next controls disable at
// the boundaries. The SVG mockups stand in until real screenshots are added.
// =============================================================================

// Inline SVG "demo screenshot" for a card. `currentColor` is the project accent
// (set on the <svg> via CSS); neutral grays fill the surrounding chrome so each
// mockup reads as a real product UI. One layout per CaseStudy mockup kind.
function ProjectMockup({ kind }: { kind: CaseStudyMockup }) {
  const common = {
    viewBox: '0 0 320 220',
    // Intrinsic dimensions so the SVG can never balloon to full size before the
    // CSS module applies (dev-mode FOUC). `.mockup` scales it to 100% once the
    // stylesheet loads; these attributes only bound the pre-style frame.
    width: 320,
    height: 220,
    className: styles.mockup,
    preserveAspectRatio: 'xMidYMid slice' as const,
    xmlns: 'http://www.w3.org/2000/svg',
  };

  if (kind === 'dashboard') {
    return (
      <svg {...common}>
        <rect x="0" y="0" width="320" height="220" fill="#FFFFFF" />
        <rect x="0" y="0" width="60" height="220" fill="#F1F5F9" />
        <rect x="14" y="22" width="32" height="7" rx="3.5" fill="currentColor" />
        <rect x="14" y="46" width="32" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="14" y="62" width="32" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="14" y="78" width="32" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="76" y="16" width="86" height="9" rx="4.5" fill="#94A3B8" />
        <circle cx="300" cy="20" r="9" fill="currentColor" />
        <rect x="76" y="44" width="104" height="58" rx="9" fill="#F8FAFC" stroke="#E2E8F0" />
        <rect x="196" y="44" width="108" height="58" rx="9" fill="#F8FAFC" stroke="#E2E8F0" />
        <rect x="90" y="58" width="42" height="6" rx="3" fill="#CBD5E1" />
        <rect x="90" y="74" width="58" height="14" rx="3" fill="currentColor" />
        <rect x="210" y="58" width="42" height="6" rx="3" fill="#CBD5E1" />
        <rect x="210" y="74" width="48" height="14" rx="3" fill="#94A3B8" />
        <rect x="76" y="120" width="228" height="78" rx="9" fill="#F8FAFC" stroke="#E2E8F0" />
        <polyline
          points="92,180 128,162 160,170 196,140 232,150 268,116 292,128"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === 'mobile') {
    return (
      <svg {...common}>
        <rect x="0" y="0" width="320" height="220" fill="#FFFFFF" />
        <circle cx="60" cy="48" r="46" fill="currentColor" opacity="0.08" />
        <circle cx="270" cy="180" r="54" fill="currentColor" opacity="0.07" />
        <rect x="118" y="24" width="84" height="172" rx="18" fill="#0F172A" />
        <rect x="124" y="30" width="72" height="160" rx="13" fill="#FFFFFF" />
        <rect x="124" y="30" width="72" height="34" rx="13" fill="currentColor" />
        <rect x="124" y="52" width="72" height="12" fill="currentColor" />
        <circle cx="160" cy="44" r="8" fill="#FFFFFF" opacity="0.9" />
        <rect x="134" y="78" width="52" height="9" rx="4.5" fill="#E2E8F0" />
        <rect x="134" y="78" width="30" height="9" rx="4.5" fill="currentColor" />
        <rect x="134" y="100" width="52" height="20" rx="6" fill="#F1F5F9" />
        <rect x="134" y="128" width="52" height="20" rx="6" fill="#F1F5F9" />
        <rect x="134" y="156" width="52" height="20" rx="6" fill="#F1F5F9" />
        <rect x="142" y="107" width="22" height="6" rx="3" fill="#CBD5E1" />
        <rect x="142" y="135" width="30" height="6" rx="3" fill="#CBD5E1" />
        <rect x="142" y="163" width="26" height="6" rx="3" fill="#CBD5E1" />
      </svg>
    );
  }

  if (kind === 'analytics') {
    return (
      <svg {...common}>
        <rect x="0" y="0" width="320" height="220" fill="#FFFFFF" />
        <rect x="28" y="22" width="120" height="9" rx="4.5" fill="#94A3B8" />
        <rect x="28" y="40" width="70" height="6" rx="3" fill="#CBD5E1" />
        <line x1="28" y1="178" x2="296" y2="178" stroke="#E2E8F0" strokeWidth="2" />
        <rect x="40" y="120" width="30" height="58" rx="4" fill="#E2E8F0" />
        <rect x="86" y="96" width="30" height="82" rx="4" fill="currentColor" opacity="0.45" />
        <rect x="132" y="132" width="30" height="46" rx="4" fill="#E2E8F0" />
        <rect x="178" y="80" width="30" height="98" rx="4" fill="currentColor" />
        <rect x="224" y="108" width="30" height="70" rx="4" fill="#E2E8F0" />
        <rect x="270" y="64" width="30" height="114" rx="4" fill="currentColor" opacity="0.7" />
        <rect x="28" y="194" width="46" height="14" rx="7" fill="currentColor" opacity="0.14" />
        <rect x="82" y="194" width="46" height="14" rx="7" fill="#F1F5F9" />
        <rect x="136" y="194" width="46" height="14" rx="7" fill="#F1F5F9" />
      </svg>
    );
  }

  // editor
  return (
    <svg {...common}>
      <rect x="0" y="0" width="320" height="220" fill="#0F172A" />
      <rect x="0" y="0" width="320" height="30" fill="#1E293B" />
      <circle cx="20" cy="15" r="4" fill="#475569" />
      <rect x="36" y="11" width="70" height="8" rx="4" fill="#334155" />
      <rect x="232" y="9" width="72" height="14" rx="7" fill="currentColor" />
      <rect x="28" y="52" width="180" height="9" rx="4.5" fill="#475569" />
      <rect x="28" y="74" width="248" height="7" rx="3.5" fill="#334155" />
      <rect x="28" y="90" width="232" height="7" rx="3.5" fill="#334155" />
      <rect x="28" y="106" width="248" height="7" rx="3.5" fill="#334155" />
      <rect x="28" y="122" width="150" height="7" rx="3.5" fill="#334155" />
      <rect x="28" y="148" width="120" height="9" rx="4.5" fill="currentColor" opacity="0.85" />
      <rect x="28" y="170" width="248" height="7" rx="3.5" fill="#334155" />
      <rect x="28" y="186" width="196" height="7" rx="3.5" fill="#334155" />
      <rect x="228" y="184" width="3" height="14" fill="currentColor" />
    </svg>
  );
}

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
                          <ProjectMockup kind={project.mockup} />
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
