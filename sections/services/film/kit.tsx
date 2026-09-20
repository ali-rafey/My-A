/* eslint-disable @next/next/no-img-element */
// Plain <img> on purpose: the photos sit inside a canvas scaled as one unit
// with a CSS transform, so next/image's layout-based srcset would pick sizes
// from a box the transform makes meaningless. CardFilm preloads them.

import type { CSSProperties, ReactNode } from 'react';
import k from './kit.module.css';

// =============================================================================
// Kit — primitives for the service films (640×500 canvas, see CardFilm.tsx).
// =============================================================================
// Same grammar as the home film: `--d` is when an element starts (ms from the
// start of its shot); durations live in the CSS. Every shot settles and then
// holds, so its last frame is a complete picture (CardFilm shows that frame
// when a film is not playing).
// =============================================================================

export type Vars = Record<string, string | number>;
export const v = (o: Vars) => o as unknown as CSSProperties;
export const at = (d: number, extra: Vars = {}) => v({ '--d': `${d}ms`, ...extra });
export const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

export const IMG = {
  audience: '/film/audience.jpg',
  reader: '/film/reader.jpg',
  meadow: '/film/meadow.jpg',
  reel: '/film/reel.jpg',
  wallpaper: '/film/wallpaper.jpg',
  product: '/film/product.jpg',
  swatches: '/film/swatches.jpg',
  twill: '/film/twill.jpg',
  jersey: '/film/jersey.jpg',
  pique: '/film/pique.jpg',
  fleece: '/film/fleece.jpg',
  terry: '/film/french-terry.jpg',
  mark: '/film/fanaar-mark.png',
};
export const PRELOAD = Object.values(IMG);

/**
 * Types text one keystroke at a time with a caret riding the newest glyph;
 * the last one blinks `blinks` times (or for good when omitted). A small fixed
 * wobble and a beat after spaces and stops keep it human and repeatable.
 */
export function Typed({ text, start, step = 40, blinks = 2 }: { text: string; start: number; step?: number; blinks?: number }) {
  const chars = [...text];
  const times: number[] = [];
  let t = start;
  chars.forEach((ch, i) => {
    times.push(Math.round(t));
    const wobble = (((i * 7) % 5) - 2) * step * 0.12;
    const pause = ch === ' ' ? step * 0.5 : /[.,:?]/.test(ch) ? step * 1.4 : 0;
    t += step + wobble + pause;
  });
  const last = chars.length - 1;
  const glyph = (ch: string, i: number) => (
    <span
      key={i}
      className={cx(k.ch, i === last && k.chLast)}
      style={v({ '--d': `${times[i]}ms`, '--step': `${i === last ? step : times[i + 1] - times[i]}ms`, '--blinks': blinks })}
    >
      {ch}
    </span>
  );
  const out: ReactNode[] = [];
  let word: ReactNode[] = [];
  chars.forEach((ch, i) => {
    if (ch === ' ') {
      if (word.length) out.push(<span key={`w${i}`} className={k.word}>{word}</span>);
      word = [];
      out.push(glyph(ch, i));
    } else {
      word.push(glyph(ch, i));
    }
  });
  if (word.length) out.push(<span key="wEnd" className={k.word}>{word}</span>);
  return <span>{out}</span>;
}

/** A shot's headline, typed. */
export function Title({ text, d = 150, step = 42, x = 40, y = 66, size = 30 }: {
  text: string; d?: number; step?: number; x?: number; y?: number; size?: number;
}) {
  return (
    <span className={k.title} style={v({ left: `${x}px`, top: `${y}px`, fontSize: `${size}px` })}>
      <Typed text={text} start={d} step={step} />
    </span>
  );
}

/**
 * Words that rise into place one after another, as the home film's hook does.
 */
export function Words({ text, start = 260, step = 85 }: { text: string; start?: number; step?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={`${w}-${i}`} className={k.word} style={at(start + i * step)}>
          <span className={k.wordIn}>{w}</span>{' '}
        </span>
      ))}
    </>
  );
}

/**
 * The opening beat of a shot: the client's own problem, then what we do about
 * it, alone in the middle of the card. It holds, then clears for the screens.
 */
export function Beat({ lead, text, hold = 2100, size = 34, type = false, to }: {
  lead: string; text: string; hold?: number; size?: number;
  /** Type it out instead of rising word by word. */
  type?: boolean;
  /** Leave toward a point on the composition, as if the words become it. */
  to?: { x: number; y: number; scale: number };
}) {
  return (
    <div
      className={k.beat}
      style={v({
        '--o': `${hold}ms`,
        ...(to ? { '--ex': `${to.x}px`, '--ey': `${to.y}px`, '--es': to.scale } : {}),
      })}
    >
      <span className={k.beatLead}>{lead}</span>
      <span className={k.beatText} style={{ fontSize: `${size}px` }}>
        {type ? <Typed text={text} start={420} step={40} blinks={1} /> : <Words text={text} start={420} />}
      </span>
    </div>
  );
}

/** Pointer: glides from (x0,y0) to (x1,y1) and clicks; optionally on to (x2,y2). */
export function Cursor({ x0, y0, x1, y1, d, move = 520, click, x2, y2, d2, move2 = 460, click2 }: {
  x0: number; y0: number; x1: number; y1: number; d: number; move?: number; click?: number;
  x2?: number; y2?: number; d2?: number; move2?: number; click2?: number;
}) {
  const leg2 = x2 !== undefined && y2 !== undefined && d2 !== undefined;
  return (
    <span
      className={cx(k.cursor, leg2 && k.cursor2)}
      data-transient
      style={v({
        '--x0': `${x0}px`, '--y0': `${y0}px`, '--x1': `${x1}px`, '--y1': `${y1}px`,
        '--d': `${d}ms`, '--mv': `${move}ms`, '--c': `${click ?? d + move + 100}ms`,
        ...(leg2 ? { '--x2': `${x2}px`, '--y2': `${y2}px`, '--d2': `${d2}ms`, '--mv2': `${move2}ms`, '--c2': `${click2 ?? d2 + move2 + 100}ms` } : {}),
      })}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M5 3.2 19.2 12.4l-6.3 1.3 3.7 6.7-2.6 1.4-3.7-6.7L5.6 19Z" fill="#0D1117" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** A finger tap on a touch screen, centred on (x, y). */
export function Tap({ x, y, d }: { x: number; y: number; d: number }) {
  return <span className={k.tap} data-transient style={at(d, { left: `${x - 26}px`, top: `${y - 26}px` })} />;
}

/** Odometer: each digit rolls up to its value. */
const STRIP = Array.from({ length: 20 }, (_, i) => <span key={i}>{i % 10}</span>);
export function Odo({ value, d, dur = 1300 }: { value: string; d: number; dur?: number }) {
  return (
    <span className={k.odoNum}>
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className={k.odo}>
            <span className={k.odoCol} style={v({ '--n': Number(ch), '--d': `${d + i * 40}ms`, '--od': `${dur}ms` })}>{STRIP}</span>
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  );
}

export const Check = ({ size = 12 }: { size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);

export function UpArrow({ size = 10 }: { size?: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true">
      <path d="M3 9 9 3M4.5 3H9v4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A plain app window with a title bar. */
export function Win({ className, style, bar, children }: { className?: string; style?: CSSProperties; bar?: ReactNode; children: ReactNode }) {
  return (
    <div className={cx(k.win, className)} style={style}>
      <div className={k.winBar}><i /><i /><i />{bar}</div>
      <div className={k.winBody}>{children}</div>
    </div>
  );
}

// ── Brand marks, drawn simply: recognisable at a glance, not traced ─────────
export function ShopBag({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M5.5 8h13l-1.2 12.5H6.7z" fill="#95BF47" />
      <path d="M9 8V6.8a3 3 0 0 1 6 0V8" fill="none" stroke="#5E8E3E" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
export function MetaMark({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 20" width={size * 1.6} height={size} aria-hidden="true">
      <path d="M3 13.5C3 8 5.6 3.5 9 3.5c3.6 0 6 5.2 8 8.6 1.8 3 3.2 4.4 5 4.4 2.2 0 4-2.3 4-5.6 0-4-2-7.4-4.8-7.4-3.2 0-5.3 4.6-8.2 9.3C11 16.9 9.5 17 8 17c-3 0-5-1.4-5-3.5Z" fill="none" stroke="#0866FF" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}
export function GoogleG({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" fill="#FBBC04" />
      <path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6Z" fill="#EA4335" />
    </svg>
  );
}
export function GoogleAdsMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="10.2" y="1.5" width="6" height="20" rx="3" transform="rotate(-30 13.2 11.5)" fill="#4285F4" />
      <rect x="4.5" y="4" width="6" height="15" rx="3" transform="rotate(30 7.5 11.5)" fill="#FBBC04" />
      <circle cx="5" cy="18.6" r="3" fill="#34A853" />
    </svg>
  );
}
export function GaMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="15" y="3" width="5" height="18" rx="2.5" fill="#F9AB00" />
      <rect x="8.5" y="9" width="5" height="12" rx="2.5" fill="#E37400" />
      <circle cx="4.5" cy="18.5" r="2.5" fill="#E37400" />
    </svg>
  );
}
export function InstaMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="svc-insta" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA75" /><stop offset="0.4" stopColor="#FA7E1E" /><stop offset="0.7" stopColor="#D62976" /><stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#svc-insta)" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="5.5" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="#fff" />
    </svg>
  );
}
export function WhatsAppMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#25D366" />
      <path d="M7.2 17.2 8 14.6A5.2 5.2 0 1 1 10 16.4l-2.8.8Z" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 9.6c.2 1.6 1.3 2.8 2.9 3.4l.8-.8 1.2.6-.2 1c-2.6.1-4.9-2.2-4.9-4.8l1-.2.6 1.2-.8.8Z" fill="#fff" />
    </svg>
  );
}
export function GmailMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M3 7.5v10A1.5 1.5 0 0 0 4.5 19H7v-7.2l5 3.7 5-3.7V19h2.5a1.5 1.5 0 0 0 1.5-1.5v-10l-9 6.7-9-6.7Z" fill="#EA4335" />
      <path d="M3 7.5 12 14.2l9-6.7V6.4a1.6 1.6 0 0 0-2.6-1.3L12 9.9 5.6 5.1A1.6 1.6 0 0 0 3 6.4v1.1Z" fill="#C5221F" />
      <path d="M7 19v-7.2L3 8.8v8.7A1.5 1.5 0 0 0 4.5 19H7Z" fill="#4285F4" />
      <path d="M17 19v-7.2l4-3v8.7a1.5 1.5 0 0 1-1.5 1.5H17Z" fill="#34A853" />
    </svg>
  );
}
export function SheetsMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#0F9D58" />
      <path d="M15 2v5h5" fill="#87CEAC" />
      <path d="M7.5 11h9v7h-9zM7.5 13.3h9M7.5 15.7h9M11.5 11v7" fill="none" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}
export function SlackMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="9.5" y="2.5" width="3.5" height="9" rx="1.75" fill="#36C5F0" />
      <rect x="12.5" y="9.5" width="9" height="3.5" rx="1.75" fill="#2EB67D" />
      <rect x="11" y="12.5" width="3.5" height="9" rx="1.75" fill="#ECB22E" />
      <rect x="2.5" y="11" width="9" height="3.5" rx="1.75" fill="#E01E5A" />
    </svg>
  );
}
export function N8nMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M4 12h5.5M14.5 12H17M12 12c0-2 1.2-3.5 3-3.5h1.5M12 12c0 2 1.2 3.5 3 3.5h1.5" fill="none" stroke="#EA4B71" strokeWidth="1.8" />
      <circle cx="3.5" cy="12" r="2" fill="#EA4B71" /><circle cx="11" cy="12" r="2" fill="#EA4B71" />
      <circle cx="19" cy="8.5" r="2" fill="#EA4B71" /><circle cx="19" cy="15.5" r="2" fill="#EA4B71" />
    </svg>
  );
}

/** The example business's mark (inside the screens only). */
export function FanaarLogo({ size = 16 }: { size?: number }) {
  return (
    <span className={k.fanaar}>
      <img src={IMG.mark} alt="" width={size * 1.38} height={size} />
      FANAAR
    </span>
  );
}
