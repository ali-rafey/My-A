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

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',         href: '/' },
  { label: 'Services',     href: '/services' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Our Work',     href: '/our-work' },
  { label: 'Contact',      href: '/contact' },
  { label: 'Blogs',        href: '/blogs' },
];

const ADMIN_PATH_PREFIXES = ['/escaleadsadmin@44334', '/escaleadsadmin%4044334'];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const onAdmin = ADMIN_PATH_PREFIXES.some((p) => pathname.startsWith(p));

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

  const toggle = useCallback(() => setIsOpen((open) => !open), []);
  const close = useCallback(() => setIsOpen(false), []);

  if (onAdmin) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Subtle dim + blur scrim while expanded. Clicking it collapses. */}
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
            >
              {item.label}
            </Link>
          ))}
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
