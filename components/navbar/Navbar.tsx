'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

type NavItem = {
  id: string;
  label: string;
  href?: string; // when set, use real navigation instead of section scroll
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'our-work', label: 'Our Work' },
  { id: 'contact', label: 'Contact Us' },
  { id: 'blogs', label: 'Blogs', href: '/blogs' },
];

const ADMIN_PATH_PREFIXES = ['/escaleadsadmin@44334', '/escaleadsadmin%4044334'];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const onHomePage = pathname === '/';
  const onAdmin = ADMIN_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!onHomePage) return;

    const sections = navItems
      .filter((item) => !item.href)
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { root: null, threshold: 0.45, rootMargin: '-20% 0px -45% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onHomePage]);

  useEffect(() => {
    document.body.classList.toggle('menuOpen', mobileOpen);
    return () => {
      document.body.classList.remove('menuOpen');
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close menu on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => setMobileOpen(false);

  if (onAdmin) return null;

  const handleSectionClick = (id: string) => {
    closeMobileMenu();
    if (!onHomePage) {
      router.push(`/#${id}`);
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      // Update URL hash without jump.
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const handleLogoClick = (event: React.MouseEvent) => {
    closeMobileMenu();
    if (onHomePage) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    }
  };

  return (
    <header
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${mobileOpen ? styles.menuOpen : ''}`}
    >
      <nav className={styles.inner} aria-label="Primary navigation">
        <Link className={styles.logo} href="/" onClick={handleLogoClick}>
          <Image
            src="/logo-icon.png"
            alt="EscaLeads"
            width={500}
            height={500}
            priority
            className={styles.logoImage}
          />
        </Link>

        <div className={styles.links} aria-label="Desktop navigation">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.id}
                className={`${styles.link} ${pathname.startsWith(item.href) ? styles.active : ''}`}
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                className={`${styles.link} ${onHomePage && activeId === item.id ? styles.active : ''}`}
                onClick={() => handleSectionClick(item.id)}
              >
                {item.label}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className={styles.cta}
          onClick={() => handleSectionClick('contact')}
        >
          Let&apos;s Talk
        </button>

        <button
          type="button"
          className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!mobileOpen}
      >
        {navItems.map((item) =>
          item.href ? (
            <Link key={item.id} className={styles.mobileLink} href={item.href} onClick={closeMobileMenu}>
              {item.label}
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              className={styles.mobileLink}
              onClick={() => handleSectionClick(item.id)}
            >
              {item.label}
            </button>
          ),
        )}
      </div>
    </header>
  );
}
