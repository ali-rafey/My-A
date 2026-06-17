'use client';

import { useEffect } from 'react';

// Locks <html> and <body> scrolling for the lifetime of this component, then
// restores whatever inline values were there before. Used by the Services
// section so the page is a single fixed-viewport experience: the trackpad
// drag won't move the page and the macOS overscroll bounce won't reveal a
// blank area underneath.
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
      htmlHeight: docEl.style.height,
      bodyHeight: body.style.height,
      htmlOverscroll: docEl.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    docEl.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    docEl.style.height = '100vh';
    body.style.height = '100vh';
    docEl.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      docEl.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      docEl.style.height = prev.htmlHeight;
      body.style.height = prev.bodyHeight;
      docEl.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, []);

  return null;
}
