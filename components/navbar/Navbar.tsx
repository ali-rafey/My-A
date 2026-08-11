'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: (
      <svg {...svgProps}>
        <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    label: 'Services',
    href: '/services',
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Stats',
    href: '/how-it-works',
    icon: (
      <svg {...svgProps}>
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.2 1 2.5h6c0-1.3.3-1.8 1-2.5A6 6 0 0 0 12 3z" />
      </svg>
    ),
  },
  {
    label: 'Our Work',
    href: '/our-work',
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    label: 'Blogs',
    href: '/blogs',
    icon: (
      <svg {...svgProps}>
        <path d="M4 4h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M8 8h7M8 12h7M8 16h4" />
      </svg>
    ),
  },
];

const ADMIN_PATH_PREFIXES = ['/escaleadsadmin@44334', '/escaleadsadmin%4044334'];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
    const startShowcase = () => {
      openTimer = window.setTimeout(() => {
        setIsOpen(true);
      }, 50);
      closeTimer = window.setTimeout(() => {
        setIsOpen(false);
      }, 50 + 1500 + 1200);
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

    // Non-home pages: original 900 ms quiet → expand → hold → collapse.
    openTimer = window.setTimeout(() => setIsOpen(true), 900);
    closeTimer = window.setTimeout(() => setIsOpen(false), 900 + 1500 + 1200);
    return () => {
      if (openTimer) clearTimeout(openTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
    // Intentionally run once on mount only — see the comment above. pathname
    // is read for the initial-route branch but must NOT re-run the showcase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(() => {
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
      {/* Subtle dim + blur scrim while MANUALLY expanded. Clicking it
          collapses. Hidden during the auto-showcase so the page-load hint
          doesn't wash the whole screen blue. */}
      <div
        className={`${styles.scrim} ${isOpen ? styles.scrimOpen : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      <nav
        className={`${styles.navbar} ${isOpen ? styles.expanded : ''}`}
        aria-label="Primary navigation"
      >
        {/* Menu items — rendered always, hidden via CSS when collapsed.
            tabIndex flips so they're not focusable while invisible. */}
        <div className={styles.menuItems} aria-hidden={!isOpen}>
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
              {/* Label only expands for the active item — every other item
                  stays icon-only. Rendered always so the reveal can animate. */}
              <span className={styles.linkLabel}>{item.label}</span>
            </Link>
          ))}

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
            className={styles.logoImage}
          />
        </button>
      </nav>
    </>
  );
}
