'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.css';

// Bottom-anchored expand-on-click navbar.
//
// Default state: only the logo button is visible, centered horizontally
// near the bottom of the viewport. Clicking the logo expands the navbar:
// nav items slide in to the left of the logo, the navbar widens, and the
// logo's screen position shifts rightward as a natural side-effect of
// the centered container growing outward.
//
// Closes on: clicking the logo again, clicking a nav link (auto-close on
// route change), clicking the scrim outside, or pressing Escape.

type NavItem = { label: string; href: string; icon: JSX.Element };

// Inline SVGs (no icon-library dependency). All inherit the link colour via
// `currentColor`, so they turn blue when the item is active/hovered exactly
// like the text used to.
const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

// Drawn in the same hand as the rest of the site: one weight of line, round
// ends, and a single filled mark where a glyph needs a focal point. Each
// silhouette is deliberately unlike the others so the collapsed-to-icons bar
// stays readable without labels.
const NAV_ITEMS: NavItem[] = [
  {
    // A house with an arched door — drawn, not a filled polygon.
    label: 'Home',
    href: '/',
    icon: (
      <svg {...svgProps}>
        <path d="M3.4 10.4 12 3.7l8.6 6.7" />
        <path d="M5.5 9v10.4a1.2 1.2 0 0 0 1.2 1.2h10.6a1.2 1.2 0 0 0 1.2-1.2V9" />
        <path d="M9.8 20.6v-4.1a2.2 2.2 0 0 1 4.4 0v4.1" />
      </svg>
    ),
  },
  {
    // The four services, one of them open — the /services page in miniature.
    label: 'Services',
    href: '/services',
    icon: (
      <svg {...svgProps}>
        <rect x="3.4" y="3.4" width="7.3" height="7.3" rx="2.2" />
        <rect x="13.3" y="3.4" width="7.3" height="7.3" rx="2.2" fill="currentColor" stroke="none" />
        <rect x="3.4" y="13.3" width="7.3" height="7.3" rx="2.2" />
        <rect x="13.3" y="13.3" width="7.3" height="7.3" rx="2.2" />
      </svg>
    ),
  },
  {
    // A plotted line on its axis, ending on the point that matters.
    label: 'Stats',
    href: '/how-it-works',
    icon: (
      <svg {...svgProps}>
        <path d="M4.2 3.6v15.4a1.2 1.2 0 0 0 1.2 1.2h15" />
        <path d="m7.6 16.1 3.4-4.4 3 2.3 4-5.6" />
        <circle cx="18.6" cy="7.9" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    // A stack of shipped screens: the one in front has a picture in it.
    label: 'Our Work',
    href: '/our-work',
    icon: (
      <svg {...svgProps}>
        <path d="M7.8 5.2h8.8a2.4 2.4 0 0 1 2.4 2.4v8.2" />
        <rect x="3" y="8" width="13.2" height="11.4" rx="2.4" />
        <path d="m3.2 16 3.2-2.9 2.3 2 2.6-2.9 4.8 4.4" />
        <circle cx="7.1" cy="11.7" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    // The contact page is a conversation, so its mark is one too.
    label: 'Contact',
    href: '/contact',
    icon: (
      <svg {...svgProps}>
        <path d="M20.6 12.2c0 3.85-3.85 7-8.6 7a10 10 0 0 1-2.7-.36L4 21l1.4-3.6a6.45 6.45 0 0 1-2-4.6c0-3.85 3.85-7 8.6-7s8.6 2.95 8.6 6.4Z" />
        <circle cx="8.6" cy="12.3" r="0.95" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12.3" r="0.95" fill="currentColor" stroke="none" />
        <circle cx="15.4" cy="12.3" r="0.95" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    // A written page with its corner turned.
    label: 'Blogs',
    href: '/blogs',
    icon: (
      <svg {...svgProps}>
        <path d="M5.8 3.6h7.3L19 9.5v9.9a1.6 1.6 0 0 1-1.6 1.6H5.8a1.6 1.6 0 0 1-1.6-1.6V5.2a1.6 1.6 0 0 1 1.6-1.6Z" />
        <path d="M12.9 3.7v4.2a1.6 1.6 0 0 0 1.6 1.6h4.3" />
        <path d="M7.5 13.1h6.6M7.5 16.6h4.2" />
      </svg>
    ),
  },
];

const ADMIN_PATH_PREFIXES = ['/escaleadsadmin@44334', '/escaleadsadmin%4044334'];

// Length of the expand morph. Must stay in sync with `--nav-duration` on
// `.expanded` in Navbar.module.css — the showcase below has to hold the bar
// open until the motion has actually landed, and no longer.
const EXPAND_MS = 620;
// How long the fully-expanded bar is held before it collapses again.
const HOLD_MS = 1400;

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // True only while the page-load showcase is holding the bar open. The scrim
  // keys off this so the automatic hint never dims/blurs the page — only a
  // visitor's own click does. (The comment on the scrim always promised this;
  // the code previously showed the scrim for the showcase too.)
  const [showcasing, setShowcasing] = useState(false);
  const onAdmin = ADMIN_PATH_PREFIXES.some((p) => pathname.startsWith(p));
  // Ali's portfolio at /meet-ali is a standalone sub-site with its own
  // masthead and "Back to EscaLeads" links — the marketing navbar stays off it.
  const onPortfolio = pathname === '/meet-ali' || pathname.startsWith('/meet-ali/');

  // Auto-collapse on route change.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Escape closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Page-load showcase: auto-expand the navbar, hold briefly, then collapse.
  // Runs ONCE per fresh page load (Cmd+R / new tab) — never on client-side
  // route changes. Even though Navbar lives in the root layout and persists
  // across navigations, the empty deps array below pins this effect to the
  // initial mount only. Without that pin, every link click re-triggered the
  // 900 ms timer on the destination page.
  //
  // On the home page the navbar is the FINAL beat of an orchestrated intro
  // sequence: graph draws → hero copy fades in → navbar expands. The
  // Home section dispatches `escaleads-intro-complete` once its fade lands;
  // we listen for that event here instead of using the default 900 ms delay.
  // A safety fallback still triggers the showcase if the event never fires.
  //
  // Honours prefers-reduced-motion (skipped entirely).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let openTimer = 0;
    let closeTimer = 0;
    const startShowcase = (delay = 50) => {
      openTimer = window.setTimeout(() => {
        setShowcasing(true);
        setIsOpen(true);
      }, delay);
      closeTimer = window.setTimeout(() => {
        setIsOpen(false);
        setShowcasing(false);
      }, delay + EXPAND_MS + HOLD_MS);
    };

    if (pathname === '/') {
      // Wait for the Home section's intro to land, then run the showcase.
      // The fallback timer must be cancelled the moment the event fires —
      // otherwise BOTH the event handler AND the fallback end up triggering
      // a showcase, and the navbar expands twice.
      let fallback = 0;
      const handler = () => {
        if (fallback) clearTimeout(fallback);
        startShowcase();
      };
      window.addEventListener('escaleads-intro-complete', handler, { once: true });
      // Safety net: if the event never arrives (e.g. Home crashed), still
      // run the showcase after a generous timeout.
      fallback = window.setTimeout(() => {
        window.removeEventListener('escaleads-intro-complete', handler);
        startShowcase();
      }, 6500);
      return () => {
        window.removeEventListener('escaleads-intro-complete', handler);
        if (fallback) clearTimeout(fallback);
        if (openTimer) clearTimeout(openTimer);
        if (closeTimer) clearTimeout(closeTimer);
      };
    }

    // Non-home pages: 900 ms quiet → expand → hold → collapse.
    startShowcase(900);
    return () => {
      if (openTimer) clearTimeout(openTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
    // Intentionally run once on mount only — see the comment above. pathname
    // is read for the initial-route branch but must NOT re-run the showcase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(() => {
    // A real click ends the showcase's claim on the bar, so the scrim behaves
    // normally for the visitor from here on.
    setShowcasing(false);
    setIsOpen((open) => !open);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (onAdmin || onPortfolio) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile (≤768px) gets an entirely different bar — a top pill with a
          drop-down drawer. Both are rendered and CSS picks one by breakpoint,
          so there is no JS media query, no hydration mismatch, and the desktop
          bar below is untouched by it. */}
      <MobileNav />

      {/* Subtle dim + blur scrim while MANUALLY expanded. Clicking it
          collapses. Hidden during the auto-showcase so the page-load hint
          doesn't wash the whole screen blue. */}
      <div
        className={`${styles.scrim} ${isOpen && !showcasing ? styles.scrimOpen : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      <nav
        className={`${styles.navbar} ${isOpen ? styles.expanded : ''}`}
        aria-label="Primary navigation"
      >
        {/* The glass itself: background + border + blur + shadow on a layer of
            its own, so expanding fades ONE opacity instead of interpolating a
            backdrop blur radius frame by frame. Purely decorative. */}
        <span className={styles.pill} aria-hidden="true" />

        {/* Menu items — rendered always, hidden via CSS when collapsed.
            tabIndex flips so they're not focusable while invisible.
            The outer div is a fixed-size window; the inner one is the strip
            that slides into it from behind the logo. */}
        <div className={styles.menuClip} aria-hidden={!isOpen}>
          <div className={styles.menuItems}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${isActive(item.href) ? styles.active : ''}`}
                tabIndex={isOpen ? 0 : -1}
                onClick={close}
                aria-label={item.label}
                title={item.label}
              >
                <span className={styles.linkIcon}>{item.icon}</span>
                {/* Label only shows for the active item — every other item
                    stays icon-only. Rendered always so the bar's width is
                    known without a measure pass. */}
                <span className={styles.linkLabel}>{item.label}</span>
              </Link>
            ))}

            {/* Theme switch — a control, not a destination, so unlike the links
              above it does NOT close the bar on click: you want to see the
              theme change against the open navbar you are looking at. */}
          <ThemeToggle tabIndex={isOpen ? 0 : -1} />

          {/* Primary CTA — a gradient accent pill that stands apart from the
                plain text links. Points at the contact/quote flow. */}
            <Link
              href="/contact"
              className={styles.quoteBtn}
              tabIndex={isOpen ? 0 : -1}
              onClick={close}
            >
              Get a Quote
            </Link>
          </div>
        </div>

        <button
          type="button"
          className={styles.logoButton}
          onClick={toggle}
          aria-label={isOpen ? 'Collapse navigation' : 'Open navigation'}
          aria-expanded={isOpen}
        >
          <Image
            src="/logo-icon.png"
            alt="EscaLeads"
            width={500}
            height={500}
            priority
            // Laid out at 60px but displayed at 80px while collapsed (CSS
            // scale), so request a source sized for the larger of the two.
            sizes="120px"
            className={styles.logoImage}
          />
        </button>
      </nav>
    </>
  );
}
