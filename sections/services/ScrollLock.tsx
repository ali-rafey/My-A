'use client';

import { useEffect } from 'react';

// Locks <html> and <body> scrolling for the lifetime of this component, then
// restores whatever inline values were there before. Used by the Services
// section so the page is a single fixed-viewport experience: the trackpad
// drag won't move the page and the macOS overscroll bounce won't reveal a
// blank area underneath.
//
// IMPORTANT: this does NOT set height:100vh on <html>/<body> anymore. Pinning
// the root to a fixed 100vh made the html box shorter than the real visual
// viewport whenever the address bar was showing (Chrome's 100vh = the
// address-bar-hidden height), and with overflow:hidden the html background
// could no longer propagate to fill that strip — so the browser painted it
// with the profile THEME colour (the blue/green/pink band). overflow:hidden
// alone is enough to lock scrolling; the fixed white backdrop in app/layout
// guarantees the viewport is always painted regardless of any height gap.
//
// We can't do this from Services.module.css because CSS Modules reject rules
// that are entirely :global — every rule needs at least one local class or
// id. Toggling inline styles in JS sidesteps that without any CSS plumbing.
export default function ScrollLock() {
  useEffect(() => {
    const docEl = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: docEl.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: docEl.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    docEl.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    docEl.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      docEl.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      docEl.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, []);

  return null;
}
