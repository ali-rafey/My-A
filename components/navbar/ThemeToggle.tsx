'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  THEME_STORAGE_KEY,
  resolveTheme,
  type ResolvedTheme,
  type ThemePref,
} from '@/lib/theme';
import styles from './Navbar.module.css';

// Sun / moon toggle. Sits in the navbar strip as the last item before the CTA.
//
// Behaviour: the site follows the OS until you touch this, and from then on it
// obeys you. That is why the click handler writes a concrete "light"/"dark"
// rather than cycling through a third "auto" state — a three-way toggle behind
// a single 22px icon is a guessing game, and the honest default (follow the OS)
// is already what an untouched install does.

type Props = {
  tabIndex: number;
  /** Drawer variant: renders a full-width row with a text label beside the
      icon. The compact desktop strip uses the icon alone. */
  withLabel?: boolean;
};

const iconProps = {
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

export default function ThemeToggle({ tabIndex, withLabel = false }: Props) {
  // Starts null, not "light". The correct value only exists on the client (the
  // boot script computed it from localStorage + matchMedia), and guessing here
  // would render one icon on the server and the other after hydration — React
  // logs a mismatch and the icon visibly flips. Null renders a placeholder of
  // exactly the same size, so nothing moves when the real value lands.
  const [theme, setTheme] = useState<ResolvedTheme | null>(null);
  const [pref, setPref] = useState<ThemePref>('auto');

  useEffect(() => {
    const el = document.documentElement;
    const current = el.getAttribute('data-theme');
    const storedPref = el.getAttribute('data-theme-pref') as ThemePref | null;
    setTheme(current === 'dark' ? 'dark' : 'light');
    setPref(storedPref ?? 'auto');
  }, []);

  // While the preference is "auto", keep tracking the OS live — someone
  // flipping their system to dark at sunset should see the site follow without
  // a reload. Once they have made an explicit choice this listener stops
  // applying, which is the whole point of storing pref separately.
  useEffect(() => {
    if (pref !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      const next: ResolvedTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      setTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const toggle = useCallback(() => {
    const el = document.documentElement;
    const next: ResolvedTheme =
      (el.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    el.setAttribute('data-theme', next);
    el.setAttribute('data-theme-pref', next);
    setTheme(next);
    setPref(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode / blocked storage: the theme still applies for this page
      // view, it just will not be remembered. Not worth surfacing.
    }
  }, []);

  const isDark = theme === 'dark';
  const label = theme === null
    ? 'Toggle theme'
    : isDark
      ? 'Switch to light theme'
      : 'Switch to dark theme';

  return (
    <button
      type="button"
      className={`${styles.themeToggle}${withLabel ? ` ${styles.themeToggleLabelled}` : ''}`}
      onClick={toggle}
      tabIndex={tabIndex}
      aria-label={label}
      title={label}
      // Reflects state for assistive tech without needing a visible label.
      aria-pressed={theme === null ? undefined : isDark}
    >
      <span className={styles.linkIcon}>
        {isDark ? (
          // Sun — the action, not the state: shown while dark, click for light.
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg {...iconProps}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
          </svg>
        )}
      </span>
      {withLabel ? (
        <span className={styles.themeToggleText}>
          {theme === null ? 'Theme' : isDark ? 'Light mode' : 'Dark mode'}
        </span>
      ) : null}
    </button>
  );
}
