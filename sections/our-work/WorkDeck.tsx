'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './WorkShowcase.module.css';

// The deck — /our-work's grid, and the only part of the page that moves.
//
// The page itself never scrolls: the section is exactly one viewport tall, so
// there is nothing for a wheel gesture to do. The deck takes that gesture and
// turns it into a page turn instead — the projects on screen fall back and
// dim, the next set rises in. Arrows, dots, arrow keys and a plain sideways
// swipe all do the same thing.
//
// A desktop page holds four plates in one row, a narrow window two, a phone
// one. Paging appears by itself as soon as there are more projects than that.
//
// One row rather than a two-by-two because the plates are square: two rows of
// square plates cannot fit a screen without squeezing the page down to a
// column about half the width of a laptop.
//
// Cards are compact by design, so the write-up does not fit on them. Opening
// a card is what shows it.
//
// Everything here comes from the Work manager in the admin — there is no
// fallback content. An empty portfolio renders an empty page, on purpose.

export type DeckProject = {
  id: string;
  title: string;
  summary: string;
  category: string;
  image: string | null;
  tags: string[];
  statusLabel: string;
  liveUrl: string | null;
};

const PAGE_LOCK_MS = 620;

/** How many cards a page holds at this size. Mirrors the CSS grid exactly. */
function pageSizeFor(width: number): number {
  if (width < 768) return 1;
  if (width < 1100) return 2;
  return 4;
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const num = (n: number) => String(n).padStart(2, '0');

export default function WorkDeck({ projects }: { projects: DeckProject[] }) {
  // Four is what a desktop shows, and what the server renders. The real value
  // lands on mount, so the first client render matches the server's.
  const [perPage, setPerPage] = useState(4);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const pages = chunk(projects, perPage);
  const count = pages.length;
  const current = Math.min(page, count - 1);

  useEffect(() => {
    const sync = () => setPerPage(pageSizeFor(window.innerWidth));
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  // Regrouping on resize can strand the view past the last page.
  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, Math.ceil(projects.length / perPage) - 1)));
  }, [perPage, projects.length]);

  const goTo = useCallback((index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const target = Math.max(0, Math.min(index, viewport.children.length - 1));
    setPage(target);
    viewport.scrollTo({ left: target * viewport.clientWidth, behavior: 'smooth' });
  }, []);

  // A sideways swipe or a drag on the trackpad scrolls the viewport natively;
  // this keeps the indicator honest about where it landed.
  const onScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport || !viewport.clientWidth) return;
    const landed = Math.round(viewport.scrollLeft / viewport.clientWidth);
    setPage((p) => (p === landed ? p : landed));
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (count < 2 || open !== null) return;
    // A horizontal gesture is already scrolling the viewport itself.
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (Math.abs(event.deltaY) < 8 || lockRef.current) return;
    lockRef.current = true;
    window.setTimeout(() => { lockRef.current = false; }, PAGE_LOCK_MS);
    goTo(current + (event.deltaY > 0 ? 1 : -1));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); goTo(current + 1); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); goTo(current - 1); }
  };

  // Escape closes the write-up, and focus moves to its close button so the
  // keyboard is not left behind on the card underneath.
  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const project = open === null ? null : projects.find((c) => c.id === open) ?? null;

  return (
    <>
      <div className={styles.bar}>
        <span className={styles.count}>
          Items: <b>{num(projects.length)}</b>
        </span>

        {count > 1 ? (
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              aria-label="Previous projects"
            >
              &#8592;
            </button>
            <span className={styles.pageNum}>
              {num(current + 1)} <i>/</i> {num(count)}
            </span>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(current + 1)}
              disabled={current === count - 1}
              aria-label="More projects"
            >
              &#8594;
            </button>
          </div>
        ) : null}
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role */}
      <div
        ref={viewportRef}
        className={styles.viewport}
        onScroll={onScroll}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        tabIndex={count > 1 ? 0 : -1}
        role={count > 1 ? 'group' : undefined}
        aria-label={count > 1 ? 'Projects, use the arrow keys to page' : undefined}
      >
        {pages.map((group, pageIndex) => (
          <div
            key={pageIndex}
            className={styles.page}
            data-per={perPage}
            data-fill={group.length}
            data-on={pageIndex === current}
            aria-hidden={pageIndex !== current}
          >
            {group.map((item, i) => (
              <span key={item.id} className={styles.cell}>
              <button
                type="button"
                className={styles.card}
                style={{ '--i': i } as React.CSSProperties}
                onClick={() => setOpen(item.id)}
                tabIndex={pageIndex === current ? 0 : -1}
                aria-label={`${item.title} — read the write-up`}
              >
                <span className={styles.media}>
                  {item.image ? (
                    <Image
                      className={styles.shot}
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 92vw, 46vw"
                    />
                  ) : (
                    <span className={styles.plate} aria-hidden="true">{item.title.slice(0, 1)}</span>
                  )}
                  {item.category ? <span className={styles.chip}>{item.category}</span> : null}
                </span>
                <span className={styles.caption}>
                  {item.statusLabel ? (
                    <span className={styles.kicker}>
                      <i aria-hidden="true" />
                      {item.statusLabel}
                    </span>
                  ) : null}
                  <span className={styles.cardTitle}>{item.title}</span>
                </span>
              </button>
              </span>
            ))}
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className={styles.dots}>
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.dot}
              data-on={i === current}
              onClick={() => goTo(i)}
              aria-label={`Projects ${num(i + 1)} of ${num(count)}`}
              aria-current={i === current}
            />
          ))}
        </div>
      ) : null}

      {project ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={project.title}>
          <button
            type="button"
            className={styles.scrim}
            onClick={() => setOpen(null)}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className={styles.sheet}>
            <div className={styles.sheetScreen}>
              {project.image ? (
                <Image
                  className={styles.shot}
                  src={project.image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 92vw, 32rem"
                />
              ) : (
                <span className={styles.plate} aria-hidden="true">{project.title.slice(0, 1)}</span>
              )}
            </div>
            <div className={styles.sheetText}>
              {project.statusLabel ? (
                <span className={styles.kicker}>
                  <i aria-hidden="true" />
                  {project.statusLabel}
                </span>
              ) : null}
              <h2 className={styles.sheetTitle}>{project.title}</h2>
              {project.summary ? <p className={styles.sheetBody}>{project.summary}</p> : null}
              {project.tags.length ? (
                <ul className={styles.tags}>
                  {project.tags.map((tag) => (
                    <li key={tag} className={styles.tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}
              {project.liveUrl ? (
                <Link className={styles.visit} href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  Visit the site
                  <span aria-hidden="true">&#8599;</span>
                </Link>
              ) : null}
            </div>
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              &#10005;
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
