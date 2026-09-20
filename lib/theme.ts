// Theme plumbing shared by the first-paint boot script and the toggle UI.
//
// TWO ATTRIBUTES live on <html>, and the distinction matters:
//
//   data-theme       the RESOLVED theme, always exactly "light" or "dark".
//                    This is what styles/tokens.css keys off, so no stylesheet
//                    ever has to re-derive the user's OS preference.
//   data-theme-pref  what the USER chose: "light", "dark", or "auto".
//                    Only the toggle reads this — it is the difference between
//                    "dark because I asked" and "dark because it is night".
//
// Splitting them is what lets "auto" keep tracking the OS after load while the
// CSS stays a single, dumb attribute match.

export const THEME_STORAGE_KEY = 'escaleads-theme';

export type ThemePref = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(pref: ThemePref, prefersDark: boolean): ResolvedTheme {
  if (pref === 'auto') return prefersDark ? 'dark' : 'light';
  return pref;
}

// Runs BEFORE first paint as a blocking inline <script> in <head>. Everything
// about it is shaped by that one constraint:
//
//   * It cannot be a React component or a module import — both run after the
//     first paint, which is exactly when a dark-mode user would see a full
//     white flash of the whole page.
//   * It is wrapped in try/catch because localStorage throws outright in
//     Safari's private mode and under some cookie-blocking settings. A theme
//     preference is never worth taking the page down for; on failure we fall
//     through to the OS preference, and failing that, light.
//   * It is minified by hand rather than by a build step so that what ships is
//     exactly what you can read here.
export const THEME_BOOT_SCRIPT = `(function(){try{var e=document.documentElement,p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})||"auto",d=p==="dark"||(p!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);e.setAttribute("data-theme",d?"dark":"light");e.setAttribute("data-theme-pref",p)}catch(_){document.documentElement.setAttribute("data-theme","light");document.documentElement.setAttribute("data-theme-pref","auto")}})();`;
