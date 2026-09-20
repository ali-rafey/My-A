'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import styles from './MobileNav.module.css';

// Mobile navbar (≤ 768px) — a top-anchored floating pill with a drawer that
// drops down behind it. Modelled on the Technobiz LTD bar, rebuilt in this
// project's stack (CSS Modules + --surface-* tokens, not Tailwind) so it
// themes light/dark with everything else.
//
// It is a SIBLING of the desktop bottom bar, not a variant of it: the two have
// genuinely different DOM, and rendering both while CSS picks one avoids any
// breakpoint detection in JS — no hydration mismatch, no first-paint flash,
// and the desktop bar's tuned expand animation is left completely untouched.

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Stats', href: '/how-it-works' },
  { label: 'Our Work', href: '/our-work' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
];

// The pill has room for two before it crowds the icons; the rest live in the
// drawer. Both are dropped entirely under ~360px.
const PILL_ITEMS: NavItem[] = [
  { label: 'Services', href: '/services' },
  { label: 'Our Work', href: '/our-work' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Collapse on navigation.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Freeze the page behind the drawer. The previous value is restored rather
  // than cleared, so this cannot stomp a scroll lock another component owns
  // (the Services section sets one of its own).
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className={styles.root} data-open={open || undefined}>
      {/* Scrim first in source order so the pill and panel paint over it. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className={styles.scrim}
      />

      {/* Drawer panel. Padded at the top to clear the pill, which floats above
          it and keeps its close button reachable while the drawer is open. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className={styles.panel}
        aria-hidden={!open}
      >
        <span className={styles.panelLogoChip}>
          <Image
            src="/logo-icon.png"
            alt="EscaLeads"
            width={500}
            height={500}
            sizes="160px"
            className={styles.panelLogo}
          />
        </span>

        <ul className={styles.list}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={close}
                tabIndex={open ? 0 : -1}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`${styles.listLink} ${isActive(item.href) ? styles.listLinkActive : ''}`}
              >
                <span>{item.label}</span>
                <ArrowIcon className={styles.listArrow} />
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.panelFooter}>
          <ThemeToggle tabIndex={open ? 0 : -1} withLabel />
        </div>

        <Link
          href="/contact"
          onClick={close}
          tabIndex={open ? 0 : -1}
          className={styles.panelCta}
        >
          Get a Quote
          <ChevronPair />
        </Link>
      </div>

      {/* The pill itself — always on top of the panel. */}
      <nav className={styles.pill} aria-label="Primary navigation">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className={styles.burger}
        >
          {/* Two bars, not three: the lower one is short at rest and grows to
              full width as it rotates, so the open/close morph reads as one
              movement rather than a middle bar blinking out. */}
          <span className={styles.burgerBars}>
            <span className={styles.burgerBar} />
            <span className={styles.burgerBar} />
          </span>
        </button>

        <ul className={styles.pillLinks}>
          {PILL_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={close}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`${styles.pillLink} ${isActive(item.href) ? styles.pillLinkActive : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <span className={styles.spacer} />

        <Link href="/" onClick={close} aria-label="Home" className={styles.homeBtn}>
          <Image
            src="/logo-icon.png"
            alt=""
            width={500}
            height={500}
            sizes="96px"
            className={styles.homeLogo}
          />
        </Link>

        <Link
          href="/contact"
          onClick={close}
          aria-label="Get a Quote"
          className={styles.ctaBtn}
        >
          <ArrowIcon className={styles.ctaIcon} />
        </Link>
      </nav>
    </div>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronPair() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.ctaChevron}>
      <path
        d="m6 5 7 7-7 7M14 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
