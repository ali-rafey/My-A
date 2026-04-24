import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';

type NavItem = {
  id: string;
  label: string;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'our-work', label: 'Our Work' },
  { id: 'contact', label: 'Contact Us' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string>('home');

  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        root: null,
        threshold: 0.45,
        rootMargin: '-20% 0px -45% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menuOpen', mobileOpen);

    return () => {
      document.body.classList.remove('menuOpen');
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = (): void => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeMobileMenu = (): void => {
    setMobileOpen(false);
  };

  return (
    <header
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${mobileOpen ? styles.menuOpen : ''}`}
    >
      <nav className={styles.inner} aria-label="Primary navigation">
        <a className={styles.logo} href="#home" onClick={closeMobileMenu}>
          YourAgency
        </a>

        <div className={styles.links} aria-label="Desktop navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              className={`${styles.link} ${activeId === item.id ? styles.active : ''}`}
              href={`#${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <a className={styles.cta} href="#contact">
          Let&apos;s Talk
        </a>

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
        {navItems.map((item) => (
          <a key={item.id} className={styles.mobileLink} href={`#${item.id}`} onClick={closeMobileMenu}>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}
