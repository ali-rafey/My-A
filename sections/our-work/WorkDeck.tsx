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
// A desktop page holds four plates in one row, a narrow window two. Paging
// appears by itself as soon as there are more projects than that.
//
// A phone gets a DECK instead: one project in front, the ones before it
// peeking out above and the ones after it below, each a step smaller and
// dimmer. A vertical swipe (or the wheel, the arrow keys, or a tap on a peek)
// brings the next one forward. It opens on the middle project, so there is
// always something on both sides. The card itself is the same as on desktop.
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
/** How far a finger has to travel before a swipe turns the deck. */
const SWIPE_PX = 36;
/** Peeks shown on each side of the front card; the rest wait out of sight. */
const DECK_DEPTH = 2;

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
  const touchY = useRef<number | null>(null);
  const centred = useRef(false);

  const pages = chunk(projects, perPage);
  const count = pages.length;
  const current = Math.min(page, count - 1);
  // One project per page is the phone layout, which is the deck.
  const deck = perPage === 1;

  useEffect(() => {
    const sync = () => setPerPage(pageSizeFor(window.innerWidth));
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  // Regrouping on resize can strand the view past the last page. The first
  // time the deck appears it opens on the middle project instead of the first.
  useEffect(() => {
    if (perPage === 1 && !centred.current) {
      centred.current = true;
      setPage(Math.floor(projects.length / 2));
      return;
    }
    setPage((p) => Math.min(p, Math.max(0, Math.ceil(projects.length / perPage) - 1)));
  }, [perPage, projects.length]);

  const goTo = useCallback((index: number) => {
    const target = Math.max(0, Math.min(index, count - 1));
    setPage(target);
    // The paged grid scrolls to its page; the deck just re-poses its cards.
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTo({ left: target * viewport.clientWidth, behavior: 'smooth' });
  }, [count]);

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

  // The deck turns on a vertical swipe; it lets the browser keep sideways
  // gestures (touch-action: pan-x in the CSS).
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchY.current = event.touches[0]?.clientY ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchY.current;
    touchY.current = null;
    const end = event.changedTouches[0]?.clientY;
    if (start === null || end === undefined || open !== null) return;
    const dy = end - start;
    if (Math.abs(dy) < SWIPE_PX) return;
    goTo(current + (dy < 0 ? 1 : -1));
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

  const renderCard = (item: DeckProject, i: number, focusable: boolean, onPick: () => void, label: string) => (
    <button
      type="button"
      className={styles.card}
      style={{ '--i': i } as React.CSSProperties}
      onClick={onPick}
      tabIndex={focusable ? 0 : -1}
      aria-label={label}
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
  );

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
              aria-label={deck ? 'Previous project' : 'Previous projects'}
            >
              {deck ? <>&#8593;</> : <>&#8592;</>}
            </button>
            <span className={styles.pageNum}>
              {num(current + 1)} <i>/</i> {num(count)}
            </span>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(current + 1)}
              disabled={current === count - 1}
              aria-label={deck ? 'Next project' : 'More projects'}
            >
              {deck ? <>&#8595;</> : <>&#8594;</>}
            </button>
          </div>
        ) : null}
      </div>

      {deck ? (
        <div
          className={styles.stack}
          // Room is kept for as many peeks per side as this deck can ever show.
          style={{ '--levels': Math.min(DECK_DEPTH, count - 1) } as React.CSSProperties}
          onWheel={onWheel}
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          tabIndex={count > 1 ? 0 : -1}
          role={count > 1 ? 'group' : undefined}
          aria-label={count > 1 ? 'Projects, swipe up or down or use the arrow keys' : undefined}
        >
          {projects.map((item, i) => {
            const k = i - current;
            // Past the visible depth a card waits, hidden, at the last step.
            const step = Math.max(-DECK_DEPTH, Math.min(DECK_DEPTH, k));
            const depth = Math.abs(step);
            return (
              <span
                key={item.id}
                className={styles.deckCell}
                data-side={k === 0 ? 'front' : k < 0 ? 'above' : 'below'}
                data-gone={Math.abs(k) > DECK_DEPTH || undefined}
                style={{ '--k': step, '--s': 1 - depth * 0.06, '--veil': [0, 0.36, 0.6][depth], zIndex: 20 - Math.abs(k) } as React.CSSProperties}
                aria-hidden={k !== 0}
              >
                {renderCard(
                  item,
                  0,
                  k === 0,
                  () => (k === 0 ? setOpen(item.id) : goTo(i)),
                  k === 0 ? `${item.title} — read the write-up` : `Bring ${item.title} to the front`,
                )}
              </span>
            );
          })}
        </div>
      ) : (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
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
                  {renderCard(item, i, pageIndex === current, () => setOpen(item.id), `${item.title} — read the write-up`)}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {count > 1 ? (
        <div className={styles.dots}>
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.dot}
              data-on={i === current}
              onClick={() => goTo(i)}
              aria-label={deck ? `Project ${num(i + 1)} of ${num(count)}` : `Projects ${num(i + 1)} of ${num(count)}`}
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
