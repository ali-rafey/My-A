'use client';

import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { services } from '@/lib/content/static';
import { serviceSlug } from '@/lib/content/service-slug';
import CardFilm from './film/CardFilm';
import styles from './Services.module.css';

// =============================================================================
// Services — four numbered cards, one open at a time.
// =============================================================================
// A quiet grey page with a faint grid, a two-line headline, and the four
// services as a row of white cards. The open card is wider and taller and
// plays its scene (ServiceScenes): a small product UI that shows, part by
// part, what the service does for a client. The others show only their number
// and name. Hovering (with a short intent delay), clicking or focusing a card
// opens it. Scenes only run while the page is on screen and visible.
//
// Below 900px the row becomes a swipeable carousel of open cards, with round
// arrows and a pill for the current slide.
// =============================================================================

const pad = (n: number) => String(n).padStart(2, '0');

const ICONS: Record<number, JSX.Element> = {
  1: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M8 12.5v-1.5M10.5 12.5V8.5M13 12.5V10" />
    </svg>
  ),
  2: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 9h18M6.5 6.8h.01M9 6.8h.01" />
    </svg>
  ),
  3: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z" />
      <path d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" />
    </svg>
  ),
  4: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="9.5" width="5" height="5" rx="1.2" />
      <rect x="16" y="3.5" width="5" height="5" rx="1.2" />
      <rect x="16" y="15.5" width="5" height="5" rx="1.2" />
      <path d="M8 12h3.5a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 1 14.5 6H16M13 12v4.5a1.5 1.5 0 0 0 1.5 1.5H16" />
    </svg>
  ),
};

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h9.5M8.5 4l4 4-4 4" />
  </svg>
);

export default function Services() {
  const [active, setActive] = useState(0);
  // Under 900px the cards are a carousel and every card is shown open.
  const [carousel, setCarousel] = useState(false);
  // Scenes play only while they can be seen, and never under reduced motion.
  const [canPlay, setCanPlay] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const intent = useRef<number>();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let onScreen = true;
    const sync = () => setCanPlay(onScreen && !still.matches && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    }, { threshold: 0.2 });
    io.observe(section);
    still.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      io.disconnect();
      still.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    const sync = () => setCarousel(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => () => window.clearTimeout(intent.current), []);

  // Carousel: the slide nearest the middle is the current one.
  useEffect(() => {
    const row = rowRef.current;
    if (!carousel || !row) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = row.scrollLeft + row.clientWidth / 2;
        let best = 0;
        let bestGap = Infinity;
        Array.from(row.children).forEach((child, i) => {
          const el = child as HTMLElement;
          const gap = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
          if (gap < bestGap) {
            bestGap = gap;
            best = i;
          }
        });
        setActive(best);
      });
    };
    row.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      row.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [carousel]);

  const open = (i: number) => {
    const row = rowRef.current;
    const target = row?.children[i] as HTMLElement | undefined;
    if (carousel && row && target) {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      row.scrollTo({ left: target.offsetLeft - (row.clientWidth - target.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
    }
    setActive(i);
  };

  // Hover opens a card only once the pointer settles on it, so sweeping
  // across the row does not flick every card open on the way.
  const onEnter = (i: number) => (e: PointerEvent) => {
    if (carousel || e.pointerType !== 'mouse') return;
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => setActive(i), 110);
  };
  const onLeave = () => window.clearTimeout(intent.current);

  // Left and right arrows move between the cards, as in a tab list.
  const onKey = (i: number) => (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + services.length) % services.length;
    rowRef.current?.querySelectorAll<HTMLButtonElement>('[data-hit]')[next]?.focus();
  };

  return (
    <section ref={sectionRef} className={styles.section} id="services" aria-labelledby="services-title">
      <div className={styles.wrap}>
        <header className={styles.head}>
          <div>
            <p className={styles.label}>
              <Image src="/logo-icon.png" alt="" width={22} height={22} />
              Our services
            </p>
            <h1 id="services-title" className={styles.title}>
              Four ways we escalate <em>your business.</em>
            </h1>
          </div>
          <div className={styles.intro}>
            <p>
              Research, design, ads and automation, run as one plan: we find your buyers, build what they
              trust, put you in front of them, and let the busywork run itself.
            </p>
            <Link href="/contact" className={styles.cta}>
              Start a project
              <Arrow />
            </Link>
          </div>
        </header>

        <ul ref={rowRef} className={styles.row}>
          {services.map((service, i) => {
            const isOpen = carousel || active === i;
            const panel = `service-${service.id}-more`;
            return (
              <li
                key={service.id}
                className={styles.card}
                data-active={active === i}
                onPointerEnter={onEnter(i)}
                onPointerLeave={onLeave}
              >
                <span className={styles.num} aria-hidden="true">{pad(i + 1)}.</span>

                <div className={styles.visual}>
                  <CardFilm id={service.id} running={canPlay && active === i} />
                </div>

                <div className={styles.body}>
                  <span className={styles.icon} aria-hidden="true">{ICONS[service.id]}</span>
                  <h2 className={styles.name}>
                    <button
                      type="button"
                      className={styles.hit}
                      data-hit
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      onClick={() => open(i)}
                      onFocus={() => {
                        if (!carousel) setActive(i);
                      }}
                      onKeyDown={onKey(i)}
                    >
                      {service.title}
                    </button>
                  </h2>

                  <div className={styles.more} id={panel}>
                    <p className={styles.srOnly}>{service.headline}</p>
                    <ul className={styles.srOnly} aria-label={`${service.title} includes`}>
                      {service.capabilities.map((part) => (
                        <li key={part}>{part}</li>
                      ))}
                    </ul>
                    <Link
                      href={`/contact?service=${serviceSlug(service.title)}`}
                      className={styles.discuss}
                      aria-label={`Discuss ${service.title}`}
                    >
                      Discuss
                      <span aria-hidden="true"><Arrow /></span>
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.pager}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Previous service"
            disabled={active === 0}
            onClick={() => open(active - 1)}
          >
            <Arrow />
          </button>
          <div className={styles.dots}>
            {services.map((service, i) => (
              <button
                key={service.id}
                type="button"
                className={styles.dot}
                aria-label={`Show ${service.title}`}
                aria-current={active === i}
                onClick={() => open(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Next service"
            disabled={active === services.length - 1}
            onClick={() => open(active + 1)}
          >
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}
