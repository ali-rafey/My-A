'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './blogs.module.css';

// The deck — /blogs' grid, and the only part of the page that moves.
//
// The listing is one screen tall and hides its overflow, so a wheel gesture
// has nothing to scroll; it turns the page instead. The set on screen falls
// back and dims, the next rises in. Arrows, dots, arrow keys and a sideways
// swipe all do the same thing.
//
// Five posts fill a desktop page — one lead across two columns and four
// beside and beneath it — two fill a short window, one fills a phone. Paging
// appears by itself as soon as there are more posts than that.

export type DeckPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  minutes: number;
  cover: string | null;
};

const PAGE_LOCK_MS = 620;

/** How many cards a page holds at this size. Mirrors the CSS grid exactly. */
function pageSizeFor(width: number, height: number): number {
  if (width < 768) return 1;
  if (width < 1100 || height < 760) return 2;
  return 5;
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const num = (n: number) => String(n).padStart(2, '0');

export default function BlogDeck({ posts }: { posts: DeckPost[] }) {
  // Five is what a desktop shows, and what the server renders. The real value
  // lands on mount, so the first client render matches the server's.
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);

  const pages = chunk(posts, perPage);
  const count = pages.length;
  const current = Math.min(page, count - 1);

  useEffect(() => {
    const sync = () => setPerPage(pageSizeFor(window.innerWidth, window.innerHeight));
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, Math.ceil(posts.length / perPage) - 1)));
  }, [perPage, posts.length]);

  const goTo = useCallback((index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const target = Math.max(0, Math.min(index, viewport.children.length - 1));
    setPage(target);
    viewport.scrollTo({ left: target * viewport.clientWidth, behavior: 'smooth' });
  }, []);

  const onScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport || !viewport.clientWidth) return;
    const landed = Math.round(viewport.scrollLeft / viewport.clientWidth);
    setPage((p) => (p === landed ? p : landed));
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (count < 2) return;
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

  return (
    <>
      <div className={styles.bar}>
        <span className={styles.count}>
          Posts: <b>{num(posts.length)}</b>
        </span>

        {count > 1 ? (
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              aria-label="Newer posts"
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
              aria-label="Older posts"
            >
              &#8594;
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={viewportRef}
        className={styles.viewport}
        onScroll={onScroll}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        tabIndex={count > 1 ? 0 : -1}
        role={count > 1 ? 'group' : undefined}
        aria-label={count > 1 ? 'Posts, use the arrow keys to page' : undefined}
      >
        {pages.map((group, pageIndex) => (
          <div
            key={pageIndex}
            className={styles.deckPage}
            data-per={perPage}
            data-fill={group.length}
            data-on={pageIndex === current}
            aria-hidden={pageIndex !== current}
          >
            {group.map((post, i) => (
              <Link
                key={post.id}
                href={`/blogs/${post.slug}`}
                className={styles.card}
                data-lead={i === 0}
                style={{ '--i': i } as React.CSSProperties}
                tabIndex={pageIndex === current ? 0 : -1}
              >
                <span className={styles.thumb}>
                  {post.cover ? (
                    <Image
                      className={styles.cover}
                      src={post.cover}
                      alt=""
                      width={720}
                      height={480}
                      sizes="(max-width: 900px) 100vw, 32rem"
                    />
                  ) : (
                    // No cover: a page of set type rather than a stock photo.
                    <span className={styles.plate} aria-hidden="true">
                      <i className={styles.plateRule} />
                      {[88, 100, 72, 94].map((w, n) => (
                        <i key={n} className={styles.plateLine} style={{ width: `${w}%` }} />
                      ))}
                    </span>
                  )}
                  {pageIndex === 0 && i === 0 ? (
                    <span className={styles.badge}>Featured</span>
                  ) : null}
                </span>

                <span className={styles.body}>
                  <span className={styles.meta}>
                    {post.tag}
                    <i className={styles.metaDot} aria-hidden="true" />
                    {post.minutes} min read
                  </span>
                  <span className={styles.titleRow}>
                    <span className={styles.cardTitle}>{post.title}</span>
                    <span className={styles.go} aria-hidden="true">&#8599;</span>
                  </span>
                  {post.excerpt ? <span className={styles.excerpt}>{post.excerpt}</span> : null}
                  <span className={styles.foot}>
                    <span className={styles.chip}>{post.tag}</span>
                    <time className={styles.date} dateTime={post.date}>{post.date}</time>
                  </span>
                </span>
              </Link>
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
              aria-label={`Posts ${num(i + 1)} of ${num(count)}`}
              aria-current={i === current}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
