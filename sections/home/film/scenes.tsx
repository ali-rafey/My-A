/* eslint-disable @next/next/no-img-element */
// Plain <img> on purpose: these photos live inside a canvas that is scaled as
// one unit with a CSS transform, and the Film preloads every one of them on
// mount. next/image's responsive srcset would pick a size from the element's
// LAYOUT box — which the transform makes meaningless here.

import { createContext, useContext } from 'react';
import type { CSSProperties, ComponentType, ReactNode } from 'react';
import s from './scenes.module.css';

// Which canvas the scene is being composed for (set by Film.tsx). Portrait is
// 720×1280; its safe area is x 50–670, y 150–1110 — the navbar pill covers
// the top band on a phone and the CTA the bottom one. Positions that live in
// data (glyphs, cards, strip, audience, chart, wires, taps) pick their
// portrait set here; everything else is re-laid in the portrait block at the
// end of scenes.module.css.
export const PortraitContext = createContext(false);
const usePortrait = () => useContext(PortraitContext);

// =============================================================================
// Scenes — composed on a 1280×720 canvas, or a 720×1280 one on a phone
// (see Film.tsx and PortraitContext above).
// =============================================================================
// THE STORY — what EscaLeads does, in the order a business lives it:
//   1. the question   "How far can your business go?"
//   2. the brief      a business asks for growth
//   3. market         study the audience and the market FIRST
//   4. presence       a store that is effortless to use
//   5. connect        wire the store to Meta Ads and Google Ads
//   6. launch         the campaign goes live and reaches the core buyer
//   7. the sale       the ad in a feed → Shop now → Shop Pay
//   8. orders         Shopify order notifications stack up
//   9. scale          budget up, while sales and traffic climb
//  10. automate       the busywork runs itself in n8n
//  11. sign-off
//
// The film is about EscaLeads. The example business — Fanaar, a lounge-fabric
// house — only lives INSIDE the screens (its store, its ads, its orders), the
// way the reference film's bike app does. Every figure, name and order shown
// is illustrative UI inside a demo; nothing is presented as a real result.
//
// Timing: every animated element takes `--d` (start, ms from scene start) and
// optionally `--o` (when it leaves). Durations live in the CSS. Each scene
// settles well before it ends and then HOLDS, so it can be read.
// =============================================================================

// Inline style that mixes regular properties with `--custom` properties.
type Vars = Record<string, string | number>;
const v = (o: Vars) => o as unknown as CSSProperties;
const at = (d: number, o?: number, extra: Vars = {}) =>
  v({ '--d': `${d}ms`, ...(o !== undefined ? { '--o': `${o}ms` } : {}), ...extra });

const IMG = {
  meadow: '/film/meadow.jpg',
  swatches: '/film/swatches.jpg',
  audience: '/film/audience.jpg',
  reader: '/film/reader.jpg',
  reel: '/film/reel.jpg',
  product: '/film/product.jpg',
  wallpaper: '/film/wallpaper.jpg',
  mark: '/film/fanaar-mark.png',
  shopify: '/film/marks/shopify.png',
};

// The "In wear" strip: the third section of the live Fanaar storefront, with
// its own photographs, names and notes, replayed in the presence scene.
const COLLECTION = [
  { id: 'air', name: 'Air', desc: 'Cloth you can see the light through.', notes: ['Held up to the light', 'Open weave — low cover factor', 'The first thing anyone tests'] },
  { id: 'stillness', name: 'Stillness', desc: 'The hour when nothing is asked of you.', notes: ['Sleeves past the wrist', 'Knit that keeps its shape', 'Warmth without the weight'] },
  { id: 'morning', name: 'Morning', desc: 'A first cup, a cuff not yet fastened.', notes: ['Linen, creased and unbothered', 'Cool against a warm room', 'Softer with every wash'] },
  { id: 'open-air', name: 'Open air', desc: 'Cloth reads differently with weather in it.', notes: ['Cut loose enough to move', 'Wind finds the drape', 'Colour held under full sun'] },
  { id: 'afternoon', name: 'Afternoon', desc: 'Wide trousers, bare feet, dappled ground.', notes: ['Weight that falls straight', 'No cling in the heat', 'Shadow reads the surface'] },
  { id: 'touch', name: 'Touch', desc: 'The hand decides before the eye does.', notes: ['Hand-feel, judged in a second', 'A grain you can find blind', 'The test no spec sheet passes'] },
  { id: 'movement', name: 'Movement', desc: 'Fabric only tells the truth in motion.', notes: ['Drape measured by how it falls', 'Sheer enough to blur', 'Recovery after every step'] },
  { id: 'drape', name: 'Drape', desc: 'How it hangs is the whole design.', notes: ['The shoulder sets the line', 'Fullness without bulk', 'Seams that disappear'] },
].map((c) => ({ ...c, img: `/film/collection/${c.id}.jpg` }));

export const PRELOAD_IMAGES = [...Object.values(IMG), ...COLLECTION.map((c) => c.img), '/logo-icon.png', '/logo-icon-dark.png'];

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Types text out one keystroke at a time, with a caret that rides the newest
 * character. Spaces are keystrokes too, so the caret never drops out between
 * words, and the rhythm is a little human: a beat longer after a space or a
 * full stop, and a small, fixed wobble so it never reads as a metronome (the
 * wobble is deterministic, so every loop types identically).
 * `blinks` — how many times the caret blinks once typing is done before it
 * goes; omit it to keep blinking, as a live input does.
 */
function Typed({ text, start, step = 30, className, blinks }: {
  text: string; start: number; step?: number; className?: string; blinks?: number;
}) {
  const chars = [...text];
  const at0: number[] = [];
  let t = start;
  chars.forEach((ch, i) => {
    at0.push(Math.round(t));
    const wobble = (((i * 7) % 5) - 2) * step * 0.12;
    const pause = ch === ' ' ? step * 0.5 : /[.,:]/.test(ch) ? step * 1.4 : 0;
    t += step + wobble + pause;
  });
  const last = chars.length - 1;
  const glyph = (ch: string, i: number) => (
    <span
      key={i}
      className={`${s.ch} ${i === last ? s.chLast : ''}`}
      style={v({
        '--d': `${at0[i]}ms`,
        // The caret stays on this character exactly until the next one lands.
        '--step': `${i === last ? step : at0[i + 1] - at0[i]}ms`,
        ...(i === last && blinks !== undefined ? { '--blinks': blinks } : {}),
      })}
    >
      {ch}
    </span>
  );
  // Words stay unbreakable; the spaces between them are their own glyphs, so
  // a long line can still wrap there.
  const out: ReactNode[] = [];
  let word: ReactNode[] = [];
  chars.forEach((ch, i) => {
    if (ch === ' ') {
      if (word.length) out.push(<span key={`w${i}`} className={s.word}>{word}</span>);
      word = [];
      out.push(glyph(ch, i));
    } else {
      word.push(glyph(ch, i));
    }
  });
  if (word.length) out.push(<span key="wEnd" className={s.word}>{word}</span>);
  return <span className={`${s.typed} ${className ?? ''}`}>{out}</span>;
}

/**
 * Pointer that glides from (x0,y0) to (x1,y1) and clicks — and, optionally,
 * on to (x2,y2) for a second click.
 */
function Cursor({ x0, y0, x1, y1, d, move = 520, click, x2, y2, d2, move2 = 480, click2 }: {
  x0: number; y0: number; x1: number; y1: number; d: number; move?: number; click?: number;
  x2?: number; y2?: number; d2?: number; move2?: number; click2?: number;
}) {
  const leg2 = x2 !== undefined && y2 !== undefined && d2 !== undefined;
  return (
    <span
      className={`${s.cursor} ${leg2 ? s.cursor2 : ''}`}
      style={v({
        '--x0': `${x0}px`, '--y0': `${y0}px`, '--x1': `${x1}px`, '--y1': `${y1}px`,
        '--d': `${d}ms`, '--mv': `${move}ms`, '--c': `${click ?? d + move + 120}ms`,
        ...(leg2
          ? { '--x2': `${x2}px`, '--y2': `${y2}px`, '--d2': `${d2}ms`, '--mv2': `${move2}ms`, '--c2': `${click2 ?? d2 + move2 + 120}ms` }
          : {}),
      })}
    >
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path d="M5 3.2 19.2 12.4l-6.3 1.3 3.7 6.7-2.6 1.4-3.7-6.7L5.6 19Z" fill="#0D1117" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** A finger tap on a touch screen. */
function Tap({ x, y, d }: { x: number; y: number; d: number }) {
  return <span className={s.tap} style={at(d, undefined, { left: `${x - 40}px`, top: `${y - 40}px` })} />;
}

type Glyph = { g: string; x: number; y: number; d: number; o?: number; c?: 'blue' | 'lav' | 'peach' | 'mint' };
function Glyphs({ items }: { items: Glyph[] }) {
  return (
    <>
      {items.map((it, i) => (
        <span
          key={i}
          className={`${s.glyph} ${it.c ? s[`g_${it.c}`] : ''}`}
          style={v({ left: `${it.x}px`, top: `${it.y}px`, '--d': `${it.d}ms`, '--o': `${it.o ?? it.d + 1200}ms` } as Vars)}
        >
          {it.g}
        </span>
      ))}
    </>
  );
}

function Holo({ soft = false }: { soft?: boolean }) {
  return (
    <div className={`${s.holo} ${soft ? s.holoSoft : ''}`}>
      <span className={s.holoA} />
      <span className={s.holoB} />
      <span className={s.holoC} />
    </div>
  );
}

function BrandLockup({ d = 0 }: { d?: number }) {
  // The slide-in travel: the mark starts where the centred lockup's middle
  // will be, which is closer in on the narrower portrait word.
  const shift = usePortrait() ? 150 : 190;
  return (
    <div className={s.lockup} style={v({ '--d': `${d}ms`, '--shift': `${shift}px` })}>
      <span className={s.lockDot} />
      {/* One mark per theme; the dark one is light ink, so it needs no disc. */}
      <img className={`${s.lockMark} ${s.markLight}`} src="/logo-icon.png" alt="" width={500} height={500} />
      <img className={`${s.lockMark} ${s.markDark}`} src="/logo-icon-dark.png" alt="" width={500} height={500} />
      <span className={s.lockWord}>
        <span className={s.lockEsca}>esca</span>
        <span className={s.lockLeads}>leads</span>
      </span>
    </div>
  );
}

/**
 * Odometer. Each digit is a strip of 0–9 twice over that rolls up to its
 * value — transform-only, so it pauses and freezes with the rest of the film.
 */
const DIGIT_STRIP = Array.from({ length: 20 }, (_, i) => <span key={i}>{i % 10}</span>);
function Odo({ value, d, dur = 1500 }: { value: string; d: number; dur?: number }) {
  return (
    <span className={s.odoNum}>
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className={s.odo}>
            <span className={s.odoCol} style={v({ '--n': Number(ch), '--d': `${d + i * 45}ms`, '--od': `${dur}ms` })}>
              {DIGIT_STRIP}
            </span>
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  );
}

function Up({ children }: { children: ReactNode }) {
  return (
    <em className={s.up}>
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4.5 3H9v4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {children}
    </em>
  );
}

const CHECK = <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>;

// Brand marks, drawn simply — recognisable at a glance, not traced.
// Shopify's own bag, as the raster mark the brand ships — a hand-drawn bag
// read as a generic shopping icon, not as Shopify.
function ShopBag({ size = 18 }: { size?: number }) {
  return <img className={s.markImg} src={IMG.shopify} alt="" width={size} height={size} />;
}
function MetaMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 20" width={size * 1.6} height={size} aria-hidden="true">
      <path d="M3 13.5C3 8 5.6 3.5 9 3.5c3.6 0 6 5.2 8 8.6 1.8 3 3.2 4.4 5 4.4 2.2 0 4-2.3 4-5.6 0-4-2-7.4-4.8-7.4-3.2 0-5.3 4.6-8.2 9.3C11 16.9 9.5 17 8 17c-3 0-5-1.4-5-3.5Z" fill="none" stroke="#0866FF" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}
function GoogleAdsMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="10.2" y="1.5" width="6" height="20" rx="3" transform="rotate(-30 13.2 11.5)" fill="#4285F4" />
      <rect x="4.5" y="4" width="6" height="15" rx="3" transform="rotate(30 7.5 11.5)" fill="#FBBC04" />
      <circle cx="5" cy="18.6" r="3" fill="#34A853" />
    </svg>
  );
}
function GaMark() {
  return <span className={s.gaLogo}><i /><i /><i /></span>;
}

// n8n's mark, traced from its official logo (the node chain).
const N8N_PATH = 'M24 8.4c0 1.325-1.102 2.4-2.462 2.4-1.146 0-2.11-.765-2.384-1.8h-3.436c-.602 0-1.115.424-1.214 1.003l-.101.592a2.38 2.38 0 01-.8 1.405c.412.354.704.844.8 1.405l.1.592A1.222 1.222 0 0015.719 15h.975c.273-1.035 1.237-1.8 2.384-1.8 1.36 0 2.461 1.075 2.461 2.4S20.436 18 19.078 18c-1.147 0-2.11-.765-2.384-1.8h-.975c-1.204 0-2.23-.848-2.428-2.005l-.101-.592a1.222 1.222 0 00-1.214-1.003H10.97c-.308.984-1.246 1.7-2.356 1.7-1.11 0-2.048-.716-2.355-1.7H4.817c-.308.984-1.246 1.7-2.355 1.7C1.102 14.3 0 13.225 0 11.9s1.102-2.4 2.462-2.4c1.183 0 2.172.815 2.408 1.9h1.337c.236-1.085 1.225-1.9 2.408-1.9 1.184 0 2.172.815 2.408 1.9h.952c.601 0 1.115-.424 1.213-1.003l.102-.592c.198-1.157 1.225-2.005 2.428-2.005h3.436c.274-1.035 1.238-1.8 2.384-1.8C22.898 6 24 7.075 24 8.4zm-1.23 0c0 .663-.552 1.2-1.232 1.2-.68 0-1.23-.537-1.23-1.2 0-.663.55-1.2 1.23-1.2.68 0 1.231.537 1.231 1.2zM2.461 13.1c.68 0 1.23-.537 1.23-1.2 0-.663-.55-1.2-1.23-1.2-.68 0-1.231.537-1.231 1.2 0 .663.55 1.2 1.23 1.2zm6.153 0c.68 0 1.231-.537 1.231-1.2 0-.663-.55-1.2-1.23-1.2-.68 0-1.231.537-1.231 1.2 0 .663.55 1.2 1.23 1.2zm10.462 3.7c.68 0 1.23-.537 1.23-1.2 0-.663-.55-1.2-1.23-1.2-.68 0-1.23.537-1.23 1.2 0 .663.55 1.2 1.23 1.2z';
function N8nMark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 5.5 24 13" width={size} height={(size * 13) / 24} aria-hidden="true">
      <path d={N8N_PATH} fill="#EA4B71" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
function SheetsMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v15H6z" fill="#0F9D58" /><path d="M15 2v5h5" fill="#87CEAC" /><path d="M9 11h8v7H9zM9 14.5h8M13 11v7" fill="none" stroke="#fff" strokeWidth="1.3" /></svg>;
}
function WaMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#25D366" /><path d="M8.6 7.6c.3-.3.8-.3 1 .1l.9 1.7c.1.3.1.6-.1.8l-.6.7c.5 1.2 1.5 2.2 2.7 2.8l.7-.6c.2-.2.5-.3.8-.1l1.7.9c.4.2.4.7.1 1l-.9.9c-.6.6-1.6.7-2.4.3-2.2-1-4-2.8-5-5-.4-.8-.3-1.8.3-2.4Z" fill="#fff" /></svg>;
}
function GmailMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5V18h4v-7l5 3.6 5-3.6v7h4V7.5l-2-1.5-7 5.2L5 6z" fill="#EA4335" /><path d="M3 7.5 5 6v12H3z" fill="#4285F4" /><path d="M21 7.5 19 6v12h2z" fill="#34A853" /></svg>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Motion-graphic primitives — the big title and the designer's callout
// ─────────────────────────────────────────────────────────────────────────────

/** A headline that builds word by word, then lifts away at `out`. */
function IntroTitle({ words, out }: { words: { w: string; em?: boolean }[]; out: number }) {
  return (
    <div className={s.introTitle} style={at(0, out)}>
      {words.map((w, i) => (
        <span key={w.w} className={`${s.hookW} ${w.em ? s.hookEm : ''}`} style={at(80 + i * 170)}>{w.w}</span>
      ))}
    </div>
  );
}

/**
 * A designer's callout: a dot on the thing, a leader, a note. `side` is where
 * the note sits relative to the dot — left, right or up.
 */
function Spec({ x, y, d, side, icon, children }: {
  x: number; y: number; d: number; side: 'l' | 'r' | 'u'; icon: ReactNode; children: ReactNode;
}) {
  const place = side === 'l' ? s.specL : side === 'u' ? s.specU : s.specR;
  return (
    <span className={`${s.spec} ${place}`} style={at(d, undefined, { left: `${x}px`, top: `${y}px` })}>
      <i className={s.specLead} />
      <span className={s.specNote}>{icon}{children}</span>
    </span>
  );
}

const SPEC_ICON = {
  speed: <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M9.2 1.5 3.5 9h3.8L6.6 14.5 12.5 7H8.7z" /></svg>,
  motion: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M2 13.5C7.5 13.5 7.5 2.5 14 2.5" /></svg>,
  touch: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="8" cy="8" r="2.4" fill="currentColor" stroke="none" /><circle cx="8" cy="8" r="5.7" /></svg>,
};

// The hook collage's sales curve.
const LINE = 'M0 190 C 60 182, 90 176, 130 168 S 210 150, 250 146 S 330 120, 370 112 S 450 92, 490 70 S 560 40, 600 22';

// ─────────────────────────────────────────────────────────────────────────────
// 1 · HOOK — "How far can your business go?"
// ─────────────────────────────────────────────────────────────────────────────
// The question builds word by word and then STAYS, so it can actually be read;
// the evidence (a store, ads, sales, an order) gathers around it, and only
// then does everything collapse into the logo.
const HOOK_GLYPHS: Glyph[] = [
  { g: '/', x: 612, y: 330, d: 0, o: 330 },
  { g: '//', x: 626, y: 330, d: 330, o: 600 },
  // Around the question, never on it (it spans x 315–965, y 283–439).
  { g: '<', x: 250, y: 340, d: 760, o: 2350 },
  { g: '>', x: 1000, y: 340, d: 790, o: 2350 },
  { g: '/', x: 470, y: 205, d: 900, o: 2400, c: 'lav' },
  { g: '%', x: 640, y: 196, d: 950, o: 2400, c: 'blue' },
  { g: '↗', x: 800, y: 212, d: 1000, o: 2450, c: 'blue' },
  { g: '*', x: 620, y: 482, d: 1050, o: 2450 },
  { g: '$', x: 430, y: 470, d: 1100, o: 2500, c: 'peach' },
  { g: '#', x: 840, y: 478, d: 1150, o: 2500, c: 'lav' },
  { g: '+', x: 300, y: 452, d: 1200, o: 2550 },
  { g: '@', x: 990, y: 246, d: 1250, o: 2550, c: 'blue' },
  { g: '/', x: 1010, y: 436, d: 1300, o: 2600 },
];

// Portrait: the same beats around a question stacked on three lines (it
// spans roughly x 90–630, y 510–770 there).
const HOOK_GLYPHS_P: Glyph[] = [
  { g: '/', x: 348, y: 612, d: 0, o: 330 },
  { g: '//', x: 362, y: 612, d: 330, o: 600 },
  { g: '<', x: 44, y: 624, d: 760, o: 2350 },
  { g: '>', x: 650, y: 624, d: 790, o: 2350 },
  { g: '/', x: 170, y: 420, d: 900, o: 2400, c: 'lav' },
  { g: '%', x: 340, y: 404, d: 950, o: 2400, c: 'blue' },
  { g: '↗', x: 520, y: 424, d: 1000, o: 2450, c: 'blue' },
  { g: '*', x: 350, y: 822, d: 1050, o: 2450 },
  { g: '$', x: 170, y: 814, d: 1100, o: 2500, c: 'peach' },
  { g: '#', x: 530, y: 820, d: 1150, o: 2500, c: 'lav' },
  { g: '+', x: 84, y: 780, d: 1200, o: 2550 },
  { g: '@', x: 600, y: 470, d: 1250, o: 2550, c: 'blue' },
  { g: '/', x: 616, y: 776, d: 1300, o: 2600 },
];

type HookWord = { w: string; d: number; line: 0 | 1 | 2; em?: boolean };
const HOOK_WORDS: HookWord[] = [
  { w: 'How', d: 650, line: 0 },
  { w: 'far', d: 850, line: 0 },
  { w: 'can', d: 1050, line: 0 },
  { w: 'your', d: 1450, line: 1 },
  { w: 'business', d: 1650, line: 1 },
  { w: 'go?', d: 2050, line: 1, em: true },
];
// On a phone "go?" gets a line of its own — the payoff, at full size.
const HOOK_WORDS_P: HookWord[] = HOOK_WORDS.map((w) => (w.em ? { ...w, line: 2 } : w));

const SNIPPETS = [
  { t: 'utm_source=instagram', x: 150, y: 180, d: 1900 },
  { t: 'roas: 4.8x', x: 960, y: 170, d: 1980 },
  { t: 'CTR 4.2%', x: 1010, y: 520, d: 2060 },
  { t: 'order.created()', x: 170, y: 540, d: 2140 },
  { t: '<Storefront />', x: 540, y: 150, d: 2220 },
];
const SNIPPETS_P = [
  { t: 'utm_source=instagram', x: 64, y: 330, d: 1900 },
  { t: 'roas: 4.8x', x: 470, y: 352, d: 1980 },
  { t: 'CTR 4.2%', x: 480, y: 900, d: 2060 },
  { t: 'order.created()', x: 72, y: 920, d: 2140 },
  { t: '<Storefront />', x: 250, y: 252, d: 2220 },
];

const SUCK_AT = 4600;

type Card = { k: string; x: number; y: number; w: number; h: number; fx: number; fy: number; r: number; d: number };
const COLLAGE: Card[] = [
  { k: 'site', x: 90, y: 86, w: 330, h: 190, fx: -260, fy: -120, r: -3, d: 2700 },
  { k: 'chart', x: 880, y: 80, w: 300, h: 176, fx: 240, fy: -140, r: 3, d: 2830 },
  { k: 'meta', x: 110, y: 400, w: 190, h: 250, fx: -220, fy: 180, r: 4, d: 2960 },
  { k: 'google', x: 840, y: 480, w: 350, h: 104, fx: 260, fy: 160, r: -2, d: 3090 },
  { k: 'order', x: 975, y: 296, w: 250, h: 72, fx: 300, fy: 0, r: 0, d: 3220 },
];
// Portrait: two cards above the question, three below.
const COLLAGE_P: Card[] = [
  { k: 'site', x: 50, y: 176, w: 330, h: 190, fx: -200, fy: -140, r: -3, d: 2700 },
  { k: 'chart', x: 370, y: 262, w: 300, h: 176, fx: 200, fy: -140, r: 3, d: 2830 },
  { k: 'meta', x: 62, y: 804, w: 190, h: 250, fx: -200, fy: 160, r: 4, d: 2960 },
  { k: 'google', x: 300, y: 964, w: 350, h: 104, fx: 220, fy: 160, r: -2, d: 3090 },
  { k: 'order', x: 362, y: 834, w: 250, h: 72, fx: 260, fy: 0, r: 0, d: 3220 },
];

function CollageCard({ c }: { c: Card }) {
  // Everything collapses into the middle of whichever canvas this is.
  const portrait = usePortrait();
  const sx = (portrait ? 360 : 640) - (c.x + c.w / 2);
  const sy = (portrait ? 640 : 360) - (c.y + c.h / 2);
  return (
    <div
      className={s.collageCard}
      style={v({
        left: `${c.x}px`, top: `${c.y}px`, width: `${c.w}px`, height: `${c.h}px`,
        '--fx': `${c.fx}px`, '--fy': `${c.fy}px`, '--r': `${c.r}deg`,
        '--sx': `${sx}px`, '--sy': `${sy}px`, '--d': `${c.d}ms`, '--o': `${SUCK_AT}ms`,
      } as Vars)}
    >
      {c.k === 'site' && (
        <div className={s.miniSite}>
          <img src={IMG.meadow} alt="" />
          <b>The cloth you live in.</b>
          <span className={s.miniCta}>Shop now</span>
        </div>
      )}
      {c.k === 'chart' && (
        <div className={s.miniChart}>
          <span>Online store sales</span><b>$48.9K <em>↗</em></b>
          <svg viewBox="0 0 600 210" preserveAspectRatio="none"><path d={LINE} /></svg>
        </div>
      )}
      {c.k === 'meta' && (
        <div className={s.miniAd}>
          <span className={s.miniAdHead}><i />fanaar.textile · Sponsored</span>
          <img src={IMG.swatches} alt="" />
          <span className={s.miniAdCta}>Shop now</span>
        </div>
      )}
      {c.k === 'google' && (
        <div className={s.miniSerp}>
          <span><b>Sponsored</b> · fanaar.online</span>
          <strong>Stonewashed Linen by the Metre — Fanaar</strong>
          <em>Premium lounge fabric, lab-tested by batch. Free shipping over $100.</em>
        </div>
      )}
      {c.k === 'order' && (
        <div className={s.miniLead}>
          <i><ShopBag size={26} /></i>
          <span><b>New order · #1047</b><em>$72.00 · Online Store</em></span>
        </div>
      )}
    </div>
  );
}

function Hook() {
  const portrait = usePortrait();
  const words = portrait ? HOOK_WORDS_P : HOOK_WORDS;
  const lines = portrait ? [0, 1, 2] : [0, 1];
  return (
    <div className={s.fill}>
      <Glyphs items={portrait ? HOOK_GLYPHS_P : HOOK_GLYPHS} />
      {(portrait ? SNIPPETS_P : SNIPPETS).map((sn) => (
        <span key={sn.t} className={s.snippet} style={v({ left: `${sn.x}px`, top: `${sn.y}px`, '--d': `${sn.d}ms`, '--o': `${sn.d + 900}ms` } as Vars)}>
          {sn.t}
        </span>
      ))}
      <div className={s.hookStage}>
        <div className={s.hookLine} style={at(0, SUCK_AT)}>
          {lines.map((line) => (
            <span key={line} className={s.hookRow}>
              {words.filter((w) => w.line === line).map((w, i, row) => (
                <span key={w.w}>
                  <span className={`${s.hookW} ${w.em ? s.hookEm : ''}`} style={at(w.d)}>{w.w}</span>
                  {i < row.length - 1 ? ' ' : null}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      {(portrait ? COLLAGE_P : COLLAGE).map((c) => <CollageCard key={c.k} c={c} />)}
      <span className={s.suckBlob} style={at(SUCK_AT + 160)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · LOGO STING
// ─────────────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className={s.fill}>
      <BrandLockup d={0} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · THE BRIEF
// ─────────────────────────────────────────────────────────────────────────────
const BRIEF = 'We sell premium lounge fabric online. Find our buyers, build a store that feels like our cloth, and run ads that sell.';

function Brief() {
  const portrait = usePortrait();
  return (
    <div className={s.fill}>
      <div className={`${s.prompt} ${s.promptSent}`} style={at(0)}>
        <Typed text={BRIEF} start={350} step={23} className={s.promptText} />
        <span className={s.promptSend} style={at(3880)}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <span className={s.promptTools}><b>+</b><i /></span>
      </div>
      {portrait ? (
        // A thumb on the send button instead of a pointer.
        <Tap x={617} y={513} d={3780} />
      ) : (
        <Cursor x0={1080} y0={640} x1={930} y1={306} d={3250} move={520} click={3850} />
      )}
      <Glyphs items={portrait ? [
        { g: '<', x: 64, y: 360, d: 3900, o: 4250, c: 'blue' },
        { g: '*', x: 620, y: 330, d: 3950, o: 4250 },
        { g: '/', x: 610, y: 820, d: 3990, o: 4250, c: 'lav' },
        { g: '↗', x: 84, y: 840, d: 4030, o: 4250, c: 'blue' },
      ] : [
        { g: '<', x: 250, y: 330, d: 3900, o: 4250, c: 'blue' },
        { g: '*', x: 1040, y: 220, d: 3950, o: 4250 },
        { g: '/', x: 1000, y: 470, d: 3990, o: 4250, c: 'lav' },
        { g: '↗', x: 300, y: 470, d: 4030, o: 4250, c: 'blue' },
      ]} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 · MARKET — the audience and the market, before anything is built
// ─────────────────────────────────────────────────────────────────────────────
// Evidence snaps onto a dotted grid (the reference's own device), then the
// frame closes on the one thing that matters: who the buyer is.
// Every tile sits on the 110px grid. Portrait moves the grid's columns to
// x 85 + 110n so a five-cell row is centred, and stacks: evidence, the title,
// the buyer, then the rest of the evidence.
type Box = [left: number, top: number, width: number, height: number];
const MARKET_BOXES: Record<string, { l: Box; p: Box }> = {
  stat: { l: [145, 140, 220, 110], p: [85, 250, 220, 110] },
  holo: { l: [365, 140, 110, 110], p: [305, 250, 110, 110] },
  trend: { l: [145, 360, 330, 110], p: [85, 800, 330, 110] },
  chips: { l: [475, 360, 220, 110], p: [415, 800, 220, 110] },
  markets: { l: [475, 470, 220, 44], p: [415, 910, 220, 44] },
  photo: { l: [695, 140, 330, 330], p: [195, 470, 330, 330] },
  reader: { l: [1025, 140, 110, 110], p: [415, 250, 110, 110] },
  aov: { l: [1025, 360, 110, 110], p: [525, 250, 110, 110] },
  rivals: { l: [255, 470, 220, 44], p: [85, 910, 220, 44] },
};

function Market() {
  const portrait = usePortrait();
  const box = (k: string, d: number) => {
    const [left, top, width, height] = portrait ? MARKET_BOXES[k].p : MARKET_BOXES[k].l;
    return at(d, undefined, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
  };
  return (
    <div className={s.fill}>
      <div className={s.marketCam}>
        <span className={s.gridField} />

        <span className={s.marketTitle}>
          <Typed text="Know the market." start={350} step={55} blinks={2} />
        </span>

        <div className={`${s.tile} ${s.tileStat} ${s.dimLater}`} style={box('stat', 600)}>
          <span>Search demand · “linen fabric”</span>
          <b>+38%</b>
          <Up>vs. last year</Up>
        </div>
        <span className={`${s.tile} ${s.tileHolo} ${s.dimLater}`} style={box('holo', 760)} />
        <div className={`${s.tile} ${s.tileDark} ${s.dimLater}`} style={box('trend', 900)}>
          <span>Interest over 12 months</span>
          <svg viewBox="0 0 300 60" preserveAspectRatio="none">
            <path d="M0 52 C 30 50, 50 46, 80 44 S 130 40, 160 34 S 210 26, 240 16 S 280 8, 300 4" className={s.draw} style={at(1100)} pathLength={1} />
          </svg>
        </div>
        <div className={`${s.tile} ${s.tileChips} ${s.dimLater}`} style={box('chips', 1050)}>
          <span>Women 25–44</span><span>Slow living</span><span>Sustainable</span><span>Home sewing</span>
        </div>
        <div className={`${s.tile} ${s.tileLabel} ${s.dimLater}`} style={box('markets', 1200)}>
          <i />Top markets · UK · US · UAE
        </div>

        <div className={`${s.tile} ${s.tilePhoto}`} style={box('photo', 700)}>
          <img className={s.photoMono} src={IMG.audience} alt="" />
          <img className={s.photoColor} src={IMG.audience} alt="" />
          <span className={s.buyerRing} />
        </div>
        <span className={s.buyerTag}><i />Core buyer · 25–44 · buys for home</span>

        <div className={`${s.tile} ${s.tilePhoto} ${s.dimLater}`} style={box('reader', 1350)}>
          <img className={s.photoMono} src={IMG.reader} alt="" />
        </div>
        <div className={`${s.tile} ${s.tileStat} ${s.tileSmall} ${s.dimLater}`} style={box('aov', 1500)}>
          <span>Avg. order value</span>
          <b>$86</b>
          <i className={s.tileGo}>→</i>
        </div>
        <div className={`${s.tile} ${s.tileLabel} ${s.tileLabelDark} ${s.dimLater}`} style={box('rivals', 1650)}>
          <i />Competitors: 12 tracked
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 · PRESENCE — "Make it effortless."
// ─────────────────────────────────────────────────────────────────────────────
// Why it is here: the store has to be a pleasure to use. So no browser window
// — the storefront's own "In wear" strip (the third section of the live Fanaar
// site: its photographs and its copy) plays the way it plays there. One soft
// glide; the feature grows while its neighbours step aside by exactly the
// overflow; the notes and the name change with it. Blue callouts mark WHY it
// feels effortless — the speed, the tap target, the motion.
type StripGeo = { w: number; h: number; gap: number; k: number; cx: number; cy: number };
const STRIP = [...COLLECTION, ...COLLECTION, ...COLLECTION];
const STRIP_GEO: Record<'l' | 'p', StripGeo> = {
  l: { w: 112, h: 150, gap: 10, k: 2.1, cx: 640, cy: 372 },
  p: { w: 120, h: 160, gap: 10, k: 2.2, cx: 360, cy: 620 },
};
const STRIP_FROM = COLLECTION.length; // "Air", in the reel's middle pass
const STRIP_IN = 1000; // the reel glides in as the title lifts away
const STRIP_STEPS = [2450, 3450]; // each press of [ → ] moves the feature one on
// The centre of "[ → ]", where the pointer and the thumb press it.
const NEXT_AT = { l: { x: 1142, y: 632 }, p: { x: 483, y: 1010 } };

function Site() {
  const portrait = usePortrait();
  const g = STRIP_GEO[portrait ? 'p' : 'l'];
  const next = NEXT_AT[portrait ? 'p' : 'l'];
  const pitch = g.w + g.gap;
  const aside = (g.w * (g.k - 1)) / 2; // how far each neighbour steps aside
  const actives = [STRIP_FROM, STRIP_FROM + 1, STRIP_FROM + 2];
  const offset = (a: number) => g.cx - (a * pitch + g.w / 2);
  const pose = (i: number, a: number) =>
    `translateX(${i < a ? -aside : i > a ? aside : 0}px) scale(${i === a ? g.k : 1})`;
  // The notes and the name leave on a press and the next ones arrive after it.
  const swap = (k: number) => at(k === 0 ? STRIP_IN + 250 : STRIP_STEPS[k - 1] + 140, STRIP_STEPS[k]);
  const shown = actives.map((a) => STRIP[a]);

  // Callout anchors, taken from the strip at rest (the feature is always
  // centred, so these hold through every glide).
  const featureTop = g.cy - (g.h * g.k) / 2;
  const stillTop = g.cy - g.h / 2;
  const speedAt = portrait
    ? { x: g.cx - pitch - aside - 8, y: stillTop }
    : { x: g.cx - 2 * pitch - aside, y: stillTop };
  const motionAt = portrait
    ? { x: g.cx + 60, y: featureTop, side: 'u' as const }
    : { x: g.cx + (g.w * g.k) / 2, y: featureTop + 24, side: 'r' as const };
  const touchAt = { x: portrait ? next.x : next.x - 20, y: next.y - 22 };

  return (
    <div className={`${s.fill} ${s.fanaarBg}`}>
      <IntroTitle words={[{ w: 'Make' }, { w: 'it' }, { w: 'effortless.', em: true }]} out={1150} />

      <span className={`${s.fanaarMark} ${s.rise}`} style={at(STRIP_IN + 150)}>
        <img src={IMG.mark} alt="" width={300} height={218} />
        FANAAR
      </span>
      <div className={s.stripNotes}>
        {shown.map((c, k) => (
          <span key={c.id} className={s.slipSwap} style={swap(k)}>
            {c.notes.map((n) => <span key={n}>{n}</span>)}
          </span>
        ))}
      </div>

      <div
        className={s.stripTrack}
        style={v({
          top: `${stillTop}px`,
          height: `${g.h}px`,
          '--xin': `${offset(STRIP_FROM) + 520}px`,
          '--x0': `${offset(actives[0])}px`,
          '--x1': `${offset(actives[1])}px`,
          '--x2': `${offset(actives[2])}px`,
          '--din': `${STRIP_IN}ms`,
          '--s1': `${STRIP_STEPS[0]}ms`,
          '--s2': `${STRIP_STEPS[1]}ms`,
        })}
      >
        {STRIP.map((c, i) => {
          // Only the stills whose pose changes at a press animate: the one
          // leaving the feature and the one taking it.
          const moves = STRIP_STEPS
            .map((t, k) => ({ t, from: pose(i, actives[k]), to: pose(i, actives[k + 1]) }))
            .filter((m) => m.from !== m.to);
          const style: Vars = { left: `${i * pitch}px`, width: `${g.w}px`, zIndex: i, transform: pose(i, actives[0]) };
          moves.forEach((m, j) => {
            const n = j === 0 ? 'a' : 'b';
            style[`--f${n}`] = m.from;
            style[`--t${n}`] = m.to;
            style[`--d${n}`] = `${m.t}ms`;
          });
          const moving = moves.length === 2 ? s.stillAB : moves.length === 1 ? s.stillA : '';
          return (
            <span key={`${c.id}-${i}`} className={`${s.still} ${moving}`} style={v(style)}>
              <img src={c.img} alt="" />
            </span>
          );
        })}
      </div>

      <div className={s.stripName}>
        <span className={`${s.stripEyebrow} ${s.rise}`} style={at(STRIP_IN + 250)}>In wear</span>
        <span className={s.stripNameSwap}>
          {shown.map((c, k) => (
            <span key={c.id} className={s.slipSwap} style={swap(k)}>
              <b>{c.name}</b>
              <em>{c.desc}</em>
            </span>
          ))}
        </span>
      </div>
      <div className={`${s.stripNav} ${s.rise}`} style={at(STRIP_IN + 350)}>
        <span>[ ← ]</span>
        <span>View fabrics</span>
        <span>[ → ]</span>
      </div>

      {/* Why it feels effortless. */}
      <Spec x={speedAt.x} y={speedAt.y} d={1750} side="u" icon={SPEC_ICON.speed}>Loads in 0.9s</Spec>
      <span className={s.tapBox} style={at(2150, undefined, { left: `${next.x - 22}px`, top: `${next.y - 22}px` })} />
      <Spec x={touchAt.x} y={touchAt.y} d={2200} side="u" icon={SPEC_ICON.touch}>44px tap target</Spec>
      <Spec x={motionAt.x} y={motionAt.y} d={2650} side={motionAt.side} icon={SPEC_ICON.motion}>Ease-out · 1s glide</Spec>

      {portrait ? (
        STRIP_STEPS.map((t) => <Tap key={t} x={next.x} y={next.y} d={t - 120} />)
      ) : (
        <span className={s.outAt} style={at(0, 4300)}>
          <Cursor
            x0={1010} y0={700} x1={next.x - 5} y1={next.y - 3} d={1850} move={520} click={STRIP_STEPS[0] - 70}
            x2={next.x - 5} y2={next.y - 3} d2={STRIP_STEPS[1] - 200} move2={40} click2={STRIP_STEPS[1] - 70}
          />
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7 · CONNECT — Meta Ads, then Google Ads
// ─────────────────────────────────────────────────────────────────────────────
function Connect() {
  return (
    <div className={s.fill}>
      <div className={s.connect}>
        <span className={`${s.pillLine} ${s.pop} ${s.dissolve}`} style={at(0, 2250)}>Connect to</span>
        <span className={`${s.linkDot} ${s.pop} ${s.dissolve}`} style={at(220, 2250)}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </span>
        <span className={s.swap}>
          <span className={`${s.pillLine} ${s.pillBlue} ${s.flipOut}`} style={at(450, 1300)}>Meta Ads</span>
          <span className={`${s.pillLine} ${s.pillLime} ${s.flipIn} ${s.dissolve}`} style={at(1350, 2250)}>Google Ads</span>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8 · LAUNCH — put it in front of them
// ─────────────────────────────────────────────────────────────────────────────
// Why it is here: the campaign goes live and the ad reaches the people the
// research found. So no Ads Manager — one creative and one Publish; then the
// ad lands in every placement while, across the audience, the core buyer
// lights up. Meta and Google are the marks on the creative, the way a buyer
// meets them.
const PUB = 1400; // Publish is pressed
const RING_MS = 1500; // a pulse ring takes this long to reach its full radius

type Person = { x: number; y: number; hit: boolean; a: number; d: number };
type Placed = { x: number; y: number; w: number; h: number; r: number };
type PlaceKind = 'stories' | 'feed' | 'search' | 'shopping';
type LaunchGeo = {
  cx: number; cy: number; ring: number;
  card: Box; button: Box; target: number; counters: number;
  place: Record<PlaceKind, Placed>;
  crowd: Person[];
};

// The audience: a staggered field of people, lit as the pulse reaches them.
function crowd(cols: number, rows: number, x0: number, y0: number, dx: number, dy: number, cx: number, cy: number, ring: number): Person[] {
  const out: Person[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = x0 + c * dx + (r % 2 ? dx / 2 : 0);
      const y = y0 + r * dy;
      out.push({
        x,
        y,
        // A fixed two in nine are the core buyer, so every loop lights the same.
        hit: (c * 7 + r * 11) % 9 < 2,
        a: 120 + (c + r) * 16,
        d: Math.round(PUB + (Math.hypot(x - cx, y - cy) / ring) * RING_MS),
      });
    }
  }
  return out;
}

const LAUNCH: Record<'l' | 'p', LaunchGeo> = {
  l: {
    cx: 640, cy: 315, ring: 820,
    card: [545, 190, 190, 250], button: [525, 468, 230, 50], target: 92, counters: 574,
    place: {
      stories: { x: 150, y: 116, w: 124, h: 220, r: -4 },
      feed: { x: 1000, y: 108, w: 170, h: 214, r: 3 },
      search: { x: 96, y: 432, w: 300, h: 100, r: -2 },
      shopping: { x: 1010, y: 396, w: 160, h: 200, r: 4 },
    },
    crowd: crowd(21, 11, 72, 60, 56, 60, 640, 315, 820),
  },
  p: {
    cx: 360, cy: 445, ring: 900,
    card: [250, 300, 220, 290], button: [235, 624, 250, 54], target: 196, counters: 952,
    place: {
      stories: { x: 52, y: 282, w: 116, h: 206, r: -4 },
      feed: { x: 544, y: 272, w: 124, h: 170, r: 3 },
      search: { x: 56, y: 736, w: 290, h: 96, r: -2 },
      shopping: { x: 468, y: 716, w: 150, h: 190, r: 4 },
    },
    crowd: crowd(11, 17, 64, 180, 58, 56, 360, 445, 900),
  },
};

const PLACE_TAG: Record<PlaceKind, { meta: boolean; label: string }> = {
  stories: { meta: true, label: 'Instagram Stories' },
  feed: { meta: true, label: 'Instagram Feed' },
  search: { meta: false, label: 'Google Search' },
  shopping: { meta: false, label: 'Google Shopping' },
};

/** The same ad, as it lands in one placement — flown out from the creative. */
function Placement({ kind, p, d, cx, cy }: { kind: PlaceKind; p: Placed; d: number; cx: number; cy: number }) {
  const tag = PLACE_TAG[kind];
  return (
    <div
      className={s.place}
      style={v({
        left: `${p.x}px`, top: `${p.y}px`, width: `${p.w}px`,
        '--sx': `${cx - (p.x + p.w / 2)}px`, '--sy': `${cy - (p.y + p.h / 2)}px`, '--r': `${p.r}deg`, '--d': `${d}ms`,
      })}
    >
      <div className={`${s.placeBody} ${s[`pl_${kind}`]}`} style={v({ height: `${p.h}px` })}>
        {kind === 'stories' && (
          <>
            <img src={IMG.reel} alt="" />
            <span className={s.storyBar}><i /><i /></span>
            <span className={s.storyUser}><i />fanaar.textile</span>
            <span className={s.storyCta}>Shop now</span>
          </>
        )}
        {kind === 'feed' && (
          <>
            <span className={s.feedHead}><i />fanaar.textile</span>
            <img src={IMG.swatches} alt="" />
            <span className={s.feedCta}>Shop now <b>›</b></span>
          </>
        )}
        {kind === 'search' && (
          <>
            <span><b>Sponsored</b> · fanaar.online</span>
            <strong>Stonewashed Linen by the Metre — Fanaar</strong>
            <em>Premium lounge fabric, lab-tested by batch.</em>
          </>
        )}
        {kind === 'shopping' && (
          <>
            <img src={IMG.product} alt="" />
            <b>Stonewashed Linen</b>
            <strong>$24.00 / m</strong>
            <em>fanaar.online</em>
          </>
        )}
      </div>
      <span className={s.placeTag}>
        {tag.meta ? <MetaMark size={11} /> : <GoogleAdsMark size={13} />}
        {tag.label}
      </span>
    </div>
  );
}

function Launch() {
  const portrait = usePortrait();
  const g = LAUNCH[portrait ? 'p' : 'l'];
  const [bx, by, bw, bh] = g.button;
  const press = { x: bx + bw / 2, y: by + bh / 2 };
  const kinds: PlaceKind[] = ['stories', 'feed', 'search', 'shopping'];
  return (
    <div className={s.fill}>
      {g.crowd.map((p, i) => (
        <span
          key={i}
          className={`${s.person} ${p.hit ? s.personHit : ''}`}
          style={v({ left: `${p.x}px`, top: `${p.y}px`, '--a': `${p.a}ms`, '--d': `${p.d}ms` })}
        />
      ))}
      {[0, 1, 2].map((k) => (
        <span
          key={k}
          className={s.ring}
          style={at(PUB + k * 260, undefined, {
            left: `${g.cx - g.ring}px`, top: `${g.cy - g.ring}px`, width: `${g.ring * 2}px`, height: `${g.ring * 2}px`,
          })}
        />
      ))}
      <span className={s.targetTag} style={at(300, undefined, { top: `${g.target}px` })}>
        <i />Core buyer · 25–44 · buys for home
      </span>

      <div
        className={s.adCard}
        style={v({
          left: `${g.card[0]}px`, top: `${g.card[1]}px`, width: `${g.card[2]}px`, height: `${g.card[3]}px`,
          '--d': '150ms', '--p': `${PUB}ms`,
        })}
      >
        <span className={s.adHead}><i />fanaar.textile<em>Sponsored</em></span>
        <img src={IMG.reel} alt="" />
        <span className={s.adCaption}>Stonewashed linen, cut to the metre.</span>
        <span className={s.adCta}>Shop now <b>›</b></span>
        <span className={`${s.adBadge} ${s.adBadgeL}`}><MetaMark size={15} /></span>
        <span className={`${s.adBadge} ${s.adBadgeR}`}><GoogleAdsMark size={20} /></span>
      </div>

      <div
        className={s.publish}
        style={at(500, undefined, { left: `${bx}px`, top: `${by}px`, width: `${bw}px`, height: `${bh}px`, '--p': `${PUB}ms` })}
      >
        <span>Publish campaign</span>
        <span className={s.publishLive}><i />Live on Meta + Google</span>
      </div>

      {kinds.map((k, i) => (
        <Placement key={k} kind={k} p={g.place[k]} d={PUB + 450 + i * 170} cx={g.cx} cy={g.cy} />
      ))}

      <div className={s.reachRow} style={at(PUB + 1500, undefined, { top: `${g.counters}px` })}>
        {[['Reach', '48.2K'], ['Clicks', '1,930'], ['Sales', '38']].map(([k, val], i) => (
          <span key={k} className={s.reach}>
            <em>{k}</em>
            <b><Odo value={val} d={PUB + 1600 + i * 140} dur={1500} /></b>
          </span>
        ))}
      </div>

      {portrait ? (
        <Tap x={press.x} y={press.y} d={PUB - 80} />
      ) : (
        <span className={s.outAt} style={at(0, PUB + 700)}>
          <Cursor x0={1080} y0={690} x1={press.x - 5} y1={press.y - 3} d={650} move={600} click={PUB - 60} />
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9 · THE SALE — the ad in a feed → Shop now → product → Shop Pay
// ─────────────────────────────────────────────────────────────────────────────
function Purchase() {
  // Portrait draws the phone 1.3x about its centre (see scenes.module.css), so
  // the taps land where its buttons end up.
  const portrait = usePortrait();
  return (
    <div className={s.fill}>
      <Holo />
      <div className={`${s.phone} ${s.phoneIn}`}>
        <div className={s.phoneScreen}>
          <div className={s.reel}>
            <img src={IMG.reel} alt="" />
            <span className={s.reelTop}>Sponsored</span>
            <span className={s.reelSide}><i /><i /><i /></span>
            <div className={s.reelBottom}>
              <span className={s.reelUser}><i />fanaar.textile<em>Follow</em></span>
              <span className={s.reelCaption}>Stonewashed linen, cut to the metre.</span>
              <span className={s.reelCta}>Shop now <b>›</b></span>
            </div>
          </div>
          <div className={`${s.pdp} ${s.slideIn}`} style={at(1750)}>
            <img src={IMG.product} alt="" />
            <div className={s.pdpBody}>
              <span className={s.pdpShop}>FANAAR</span>
              <b>Stonewashed Linen</b>
              <span className={s.pdpPrice}>$24.00 <em>/ metre</em></span>
              <span className={s.pdpSwatches}><i /><i /><i /><em>Sage</em></span>
              <span className={s.pdpQty}>Qty <b>3 m</b></span>
              <span className={s.pdpCart}>Add to cart</span>
              <span className={s.shopPay}>Buy with <b>shop</b></span>
            </div>
          </div>
          <div className={`${s.thanks} ${s.slideIn}`} style={at(3150)}>
            <span className={s.doneTick}>{CHECK}</span>
            <b>Order confirmed</b>
            <span>#1047 · 3 m Stonewashed Linen</span>
            <strong>$72.00</strong>
          </div>
        </div>
      </div>
      <Tap x={portrait ? 360 : 640} y={portrait ? 956 : 590} d={1450} />
      <Tap x={portrait ? 360 : 640} y={portrait ? 848 : 507} d={2900} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10 · ORDERS — the store owner's lock screen
// ─────────────────────────────────────────────────────────────────────────────
// Drawn to an iPhone's own proportions and in the format the Shopify app
// really sends on iOS — "Order #1542" over "$250.00, 3 items from Online
// Store", a timestamp on the right, the white app tile — in the system's own
// frosted material: light glass in the light theme, dark glass in the dark.
// Two older orders are already there; six new ones land on top, each pushing
// the stack down one slot as iOS does, and a card pushed past the last slot
// fades away the way iOS folds older notifications out of sight.
type Notif = { id: string; amt: string; items: number; when: string; d?: number };
const NOTIFS: Notif[] = [
  // Oldest first, so each later card draws over the one it pushes down.
  { id: '#1045', amt: '$112.00', items: 2, when: '41m ago' },
  { id: '#1046', amt: '$120.00', items: 2, when: '18m ago' },
  { id: '#1047', amt: '$72.00', items: 1, when: 'now', d: 500 },
  { id: '#1048', amt: '$186.00', items: 3, when: 'now', d: 1250 },
  { id: '#1049', amt: '$72.00', items: 1, when: 'now', d: 1800 },
  { id: '#1050', amt: '$48.00', items: 1, when: 'now', d: 2200 },
  { id: '#1051', amt: '$108.00', items: 2, when: 'now', d: 2500 },
  { id: '#1052', amt: '$56.00', items: 1, when: 'now', d: 2750 },
];
/** Slots the lock screen has room for; the next push fades a card out. */
const NOTIF_SLOTS = 7;

// Each card is wrapped in one shift per later arrival, so every new order
// moves everything under it down exactly one slot.
function Notification({ i }: { i: number }) {
  const n = NOTIFS[i];
  // The cards already on screen start stacked under each other.
  let slot = NOTIFS.slice(i + 1).filter((m) => m.d === undefined).length;
  let el: ReactNode = (
    <div className={`${s.notif} ${n.d === undefined ? s.notifThere : ''}`} style={n.d === undefined ? undefined : at(n.d)}>
      <span className={s.notifIcon}><ShopBag size={21} /></span>
      <span className={s.notifText}>
        <span className={s.notifHead}>
          <b>Order {n.id}</b>
          <em>{n.when}</em>
        </span>
        <span className={s.notifBody}>
          {n.amt}, {n.items} {n.items === 1 ? 'item' : 'items'} from Online Store
        </span>
      </span>
    </div>
  );
  const start = slot;
  for (let j = i + 1; j < NOTIFS.length; j += 1) {
    const later = NOTIFS[j];
    if (later.d === undefined) continue;
    slot += 1;
    const out = slot === NOTIF_SLOTS;
    el = <div className={out ? s.notifShiftOut : s.notifShift} style={at(later.d)}>{el}</div>;
    if (out) break;
  }
  return <div className={s.notifSlot} style={v({ '--start': start })}>{el}</div>;
}

const SIGNAL = (
  <svg viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
    <rect x="0" y="8" width="3" height="4" rx="0.8" /><rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
    <rect x="10" y="3" width="3" height="9" rx="0.8" /><rect x="15" y="0" width="3" height="12" rx="0.8" />
  </svg>
);
const WIFI = (
  <svg viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
    <path d="M8 2.4c2.2 0 4.2.85 5.7 2.25l1.2-1.25A9.9 9.9 0 0 0 8 .6 9.9 9.9 0 0 0 1.1 3.4l1.2 1.25A8.1 8.1 0 0 1 8 2.4Zm0 3.4c1.3 0 2.5.5 3.4 1.3l1.2-1.25A6.6 6.6 0 0 0 8 4a6.6 6.6 0 0 0-4.6 1.85L4.6 7.1A4.8 4.8 0 0 1 8 5.8Zm0 3.35c.45 0 .85.17 1.15.45L8 10.8 6.85 9.6c.3-.28.7-.45 1.15-.45Z" />
  </svg>
);
const BATTERY = (
  <svg viewBox="0 0 27 12" aria-hidden="true">
    <rect x="0.5" y="0.5" width="23" height="11" rx="3.4" fill="none" stroke="currentColor" opacity="0.4" />
    <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
    <path d="M25 4v4c.8-.3 1.4-1.1 1.4-2S25.8 4.3 25 4Z" fill="currentColor" opacity="0.4" />
  </svg>
);

function Orders() {
  return (
    <div className={s.fill}>
      <Holo soft />
      <div className={`${s.phone} ${s.phoneLock} ${s.phoneIn}`}>
        <div className={`${s.phoneScreen} ${s.lock}`}>
          <img src={IMG.wallpaper} alt="" />
          <span className={s.island} />
          <span className={s.lockStatus}>{SIGNAL}{WIFI}{BATTERY}</span>
          <span className={s.lockDate}>Friday 19 September</span>
          <span className={s.lockTime}>9:41</span>
          <div className={s.notifs}>
            {NOTIFS.map((n, i) => <Notification key={n.id} i={i} />)}
          </div>
          <span className={`${s.lockButton} ${s.lockButtonL}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 2h8v4l-2 3v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9L8 6Z" /></svg>
          </span>
          <span className={`${s.lockButton} ${s.lockButtonR}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 4h6l1.5 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5Zm3 4.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" /></svg>
          </span>
          <span className={s.homeBar} />
        </div>
      </div>
      <div className={s.salesToday}>
        <span className={s.rise} style={at(300)}>Sales today</span>
        <b><Odo value="$774.00" d={500} dur={2600} /></b>
        <em className={s.pop} style={at(3000)}><Up>8 orders in the last hour</Up></em>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11 · SCALE — more budget on what works; the numbers follow
// ─────────────────────────────────────────────────────────────────────────────
// Why it is here: the winning campaign gets four times the budget and sales
// and traffic climb with it. So no Shopify admin and no Analytics window — the
// growth is drawn on the page: the budget slides from $40 to $160 and the
// sales line turns up at that exact moment. Shopify, Analytics and Meta are
// the small marks on the numbers each of them reports.
const KNOB = 2450; // the budget starts to move…
const BUMP = 3000; // …and lands at ×4, where the line turns up

type ScaleGeo = {
  chart: Box;
  slow: string; // before the budget moves, in chart units
  fast: string; // after — starts where `slow` ends
  prev: string; // last month, dashed
  grid: number[];
  turn: number; // x where the line turns up
  pins: [number, number][]; // points on `fast`
  budget: { left: number; top: number; slider: number };
};
const SCALE_GEO: Record<'l' | 'p', ScaleGeo> = {
  l: {
    chart: [110, 250, 1060, 300],
    slow: 'M0 280 C 120 276, 240 262, 330 252 S 440 240, 490 235',
    fast: 'M490 235 C 580 226, 650 200, 720 170 S 860 100, 940 70 S 1020 40, 1060 30',
    prev: 'M0 288 C 200 285, 400 281, 600 276 S 900 268, 1060 262',
    grid: [75, 150, 225],
    turn: 490,
    pins: [[720, 170], [940, 70], [1060, 30]],
    budget: { left: 110, top: 590, slider: 260 },
  },
  p: {
    chart: [60, 440, 600, 300],
    slow: 'M0 272 C 70 268, 140 256, 190 248 S 250 236, 280 232',
    fast: 'M280 232 C 330 224, 370 200, 410 172 S 490 100, 530 74 S 580 42, 600 32',
    prev: 'M0 284 C 120 281, 240 277, 360 273 S 520 266, 600 262',
    grid: [75, 150, 225],
    turn: 280,
    pins: [[410, 172], [530, 74], [600, 32]],
    budget: { left: 60, top: 800, slider: 320 },
  },
};

// The budget row: value (110) + gap (14), then the slider; knob on its centre line.
const SLIDER_X = 124;
const KNOB_Y = 48;

function Scale() {
  const portrait = usePortrait();
  const g = SCALE_GEO[portrait ? 'p' : 'l'];
  const [cl, ct, cw, ch] = g.chart;
  const area = `${g.slow} ${g.fast.replace(/^M\S+ \S+ /, '')} L${cw} ${ch} L0 ${ch} Z`;
  const knob0 = g.budget.left + SLIDER_X + g.budget.slider * 0.25;
  const knob1 = g.budget.left + SLIDER_X + g.budget.slider;
  const knobY = g.budget.top + KNOB_Y;
  const pins: { icon: ReactNode; k: string; val: ReactNode }[] = [
    { icon: <GaMark />, k: 'Traffic', val: <Up>62%</Up> },
    { icon: <ShopBag size={16} />, k: 'Orders', val: '612' },
    { icon: <MetaMark size={11} />, k: 'ROAS', val: '4.8×' },
  ];
  return (
    <div className={s.fill}>
      <IntroTitle words={[{ w: 'Scale' }, { w: 'what' }, { w: 'works.', em: true }]} out={1150} />

      <div className={s.scaleStat}>
        <span className={`${s.toolTag} ${s.rise}`} style={at(1200)}><ShopBag size={16} />Total sales · this month</span>
        <b className={s.rise} style={at(1250)}><Odo value="$48,920" d={1350} dur={3000} /></b>
        <em className={s.pop} style={at(4500)}><Up>128% on last month</Up></em>
      </div>
      <span className={`${s.livePill} ${s.pop}`} style={at(2000)}>
        <i className={s.liveDot} />
        <GaMark />
        <b><Odo value="312" d={2100} dur={1400} /></b>
        on the site right now
      </span>

      <svg
        className={s.scaleChart}
        viewBox={`0 0 ${cw} ${ch}`}
        style={v({ left: `${cl}px`, top: `${ct}px`, width: `${cw}px`, height: `${ch}px` })}
      >
        {g.grid.map((y) => <line key={y} x1="0" x2={cw} y1={y} y2={y} className={`${s.gridLine} ${s.fadeIn}`} style={at(1150)} />)}
        <line x1="0" x2={cw} y1={ch} y2={ch} className={`${s.chartBase} ${s.fadeIn}`} style={at(1150)} />
        <path d={g.prev} className={`${s.chartPrev} ${s.fadeIn}`} style={at(1250)} />
        <path d={area} className={s.chartArea} style={at(BUMP + 1300)} />
        <path d={g.slow} className={`${s.chartLine} ${s.draw}`} style={at(1300)} pathLength={1} />
        <path d={g.fast} className={`${s.chartLine} ${s.draw}`} style={at(BUMP)} pathLength={1} />
      </svg>
      <span className={s.turnLine} style={at(BUMP - 100, undefined, { left: `${cl + g.turn}px`, top: `${ct}px`, height: `${ch}px` })} />
      <span className={`${s.turnTag} ${s.pop}`} style={at(BUMP, undefined, { left: `${cl + g.turn}px`, top: `${ct - 10}px` })}>Budget ×4</span>

      {g.pins.map(([px, py], i) => (
        <span key={pins[i].k} className={s.pin} style={at(BUMP + 520 + i * 390, undefined, { left: `${cl + px}px`, top: `${ct + py}px` })}>
          <i className={s.pinDot} />
          <span className={s.pinNote}>{pins[i].icon}<em>{pins[i].k}</em><b>{pins[i].val}</b></span>
        </span>
      ))}

      <div className={`${s.budget} ${s.rise}`} style={at(1500, undefined, { left: `${g.budget.left}px`, top: `${g.budget.top}px` })}>
        <span className={s.budgetHead}><MetaMark size={12} />Linen launch · daily budget</span>
        <span className={s.budgetRow}>
          <span className={s.flipNum} style={v({ '--k': `${BUMP - 60}ms` })}><span>$40</span><span>$160</span></span>
          <span
            className={s.slider}
            style={v({
              width: `${g.budget.slider}px`,
              '--k0': `${g.budget.slider * 0.25}px`, '--k1': `${g.budget.slider}px`,
              '--k': `${KNOB}ms`, '--kd': `${BUMP - KNOB}ms`,
            })}
          >
            <i className={s.sliderFill} />
            <i className={s.sliderKnob} />
          </span>
          <span className={`${s.times} ${s.pop}`} style={at(BUMP)}>×4</span>
        </span>
      </div>

      {portrait ? (
        <span
          className={s.drag}
          style={v({
            left: `${knob0}px`, top: `${knobY}px`, '--dx': `${knob1 - knob0}px`,
            '--d': `${KNOB - 300}ms`, '--k': `${KNOB}ms`, '--kd': `${BUMP - KNOB}ms`, '--o': `${BUMP + 250}ms`,
          })}
        />
      ) : (
        <span className={s.outAt} style={at(0, BUMP + 700)}>
          <Cursor
            x0={640} y0={710} x1={knob0 - 5} y1={knobY - 3} d={1850} move={520} click={KNOB - 60}
            x2={knob1 - 5} y2={knobY - 3} d2={KNOB} move2={BUMP - KNOB} click2={BUMP + 20}
          />
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12 · AUTOMATE — the busywork runs itself
// ─────────────────────────────────────────────────────────────────────────────
// Why it is here: once orders flow, the follow-up has to happen without
// anyone. So no n8n editor — an order drops in, a pulse runs through the
// workflow (n8n is the mark on the hub), and the three jobs a person used to
// do happen on their own: the order is logged, the buyer is welcomed on
// WhatsApp, the reorder email is booked. A second order runs the same way,
// faster, because it always will. No pointer: nobody presses anything.
const RUNS = [2350, 4950]; // an order enters the workflow
const IN_MS = [460, 340]; // order → hub, per run
const OUT_MS = [540, 380]; // hub → each job (landscape fan), per run
const SPINE_MS = [1100, 760]; // hub → last job (phone spine), per run
const FAN = 80; // the fanned jobs set off this far apart

type Job = 'sheet' | 'wa' | 'mail';
const JOBS: Job[] = ['sheet', 'wa', 'mail'];
type FlowGeo = {
  order: Box;
  hub: [number, number, number]; // centre x, centre y, radius
  label: [number, number, 'below' | 'left'];
  jobs: Record<Job, Box>;
  handled: Box;
  // Landscape fans out from the hub, one wire per job. A phone has no room
  // for three side by side, so one spine runs down through the stacked jobs
  // and each fires as the pulse reaches its top (`at`: fraction of the spine).
  flow:
    | { kind: 'fan'; in: string; out: Record<Job, string> }
    | { kind: 'spine'; in: string; spine: string; at: Record<Job, number> };
};
const FLOW: Record<'l' | 'p', FlowGeo> = {
  l: {
    order: [70, 300, 350, 104],
    hub: [620, 352, 58],
    label: [620, 424, 'below'],
    jobs: { sheet: [800, 104, 372, 176], wa: [800, 297, 372, 110], mail: [800, 432, 372, 130] },
    handled: [70, 452, 350, 76],
    flow: {
      kind: 'fan',
      in: 'M420 352 L 562 352',
      out: {
        sheet: 'M678 352 C 740 352, 738 192, 800 192',
        wa: 'M678 352 L 800 352',
        mail: 'M678 352 C 740 352, 738 497, 800 497',
      },
    },
  },
  p: {
    order: [60, 160, 600, 104],
    hub: [360, 366, 60],
    label: [276, 366, 'left'],
    jobs: { sheet: [60, 466, 600, 172], wa: [60, 678, 600, 140], mail: [60, 858, 600, 148] },
    handled: [60, 1030, 600, 72],
    flow: {
      kind: 'spine',
      in: 'M360 264 L 360 306',
      spine: 'M360 426 L 360 858',
      at: { sheet: 40 / 432, wa: 252 / 432, mail: 1 },
    },
  },
};

const box = ([left, top, width, height]: Box) => ({ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });

type Leg = { d: string; t: number; ms: number; linear?: boolean };
// Every wire a run travels, and when each job receives it.
function flowTiming(g: FlowGeo) {
  const hubAt = (r: number) => RUNS[r] + IN_MS[r];
  const f = g.flow;
  if (f.kind === 'fan') {
    return {
      legs: (r: number): Leg[] => [
        { d: f.in, t: RUNS[r], ms: IN_MS[r] },
        ...JOBS.map((j, k) => ({ d: f.out[j], t: hubAt(r) + k * FAN, ms: OUT_MS[r] })),
      ],
      arrive: (r: number, j: Job) => hubAt(r) + JOBS.indexOf(j) * FAN + OUT_MS[r],
    };
  }
  return {
    legs: (r: number): Leg[] => [
      { d: f.in, t: RUNS[r], ms: IN_MS[r] },
      { d: f.spine, t: hubAt(r), ms: SPINE_MS[r], linear: true },
    ],
    arrive: (r: number, j: Job) => Math.round(hubAt(r) + f.at[j] * SPINE_MS[r]),
  };
}

function Automate() {
  const portrait = usePortrait();
  const g = FLOW[portrait ? 'p' : 'l'];
  const [hx, hy, hr] = g.hub;
  const { legs, arrive } = flowTiming(g);
  const orders = [
    { id: '#1051', who: 'Noor K.', what: 'Twill · 6 m', amt: '$108.00', d: 1700, o: RUNS[1] - 350 },
    { id: '#1052', who: 'Amelia R.', what: 'Jersey · 4 m', amt: '$56.00', d: RUNS[1] - 250 },
  ];
  const rows: [string, string, string, string, number?][] = [
    ['#1049', 'Sara K.', 'Linen', '$72.00'],
    ['#1050', 'Clara M.', 'Piqué', '$48.00'],
    ['#1051', 'Noor K.', 'Twill', '$108.00', arrive(0, 'sheet')],
    ['#1052', 'Amelia R.', 'Jersey', '$56.00', arrive(1, 'sheet')],
  ];
  return (
    <div className={`${s.fill} ${s.darkBg}`}>
      <span className={s.bigCaret} />
      <span className={`${s.termLine} ${s.inout}`} style={at(250, 1450)}>
        <em>→</em> <Typed text="automate the busywork" start={300} step={42} />
      </span>

      <svg className={s.wires} viewBox={portrait ? '0 0 720 1280' : '0 0 1280 720'}>
        {legs(0).map((leg, i) => (
          <g key={leg.d}>
            <path d={leg.d} className={`${s.wire} ${s.fadeIn}`} style={at(1950 + i * 80)} />
            <path d={leg.d} className={s.wireOk} style={at(leg.t, undefined, { '--run': `${leg.ms}ms` })} pathLength={1} />
          </g>
        ))}
      </svg>
      {RUNS.map((_, r) => legs(r).map((leg) => (
        <span
          key={`${r}-${leg.d}`}
          className={`${s.pulse} ${leg.linear ? s.pulseLinear : ''}`}
          style={{ offsetPath: `path('${leg.d}')`, ...at(leg.t, undefined, { '--run': `${leg.ms}ms` }) }}
        />
      )))}

      {orders.map((o) => (
        <div key={o.id} className={s.orderCard} style={at(o.d, o.o, box(g.order))}>
          <i><ShopBag size={34} /></i>
          <span><b>New order · {o.id}</b><em>{o.who} · {o.what}</em></span>
          <strong>{o.amt}</strong>
        </div>
      ))}

      <div className={s.hub} style={at(1850, undefined, { left: `${hx - hr}px`, top: `${hy - hr}px`, width: `${hr * 2}px`, height: `${hr * 2}px` })}>
        <N8nMark size={56} />
        {RUNS.map((run, r) => <span key={run} className={s.hubRing} style={at(run + IN_MS[r])} />)}
      </div>
      <span
        className={`${s.hubLabel} ${g.label[2] === 'left' ? s.hubLabelLeft : ''} ${s.fadeIn}`}
        style={at(2000, undefined, { left: `${g.label[0]}px`, top: `${g.label[1]}px` })}
      >
        <b>n8n</b><i className={s.hubSep}> · </i>runs on every order
      </span>

      <div className={`${s.job} ${s.rise}`} style={at(1950, undefined, box(g.jobs.sheet))}>
        <span className={s.jobHead}><SheetsMark />Orders<em>Google Sheets</em></span>
        <div className={s.sheet}>
          <span className={s.sheetHead}><i>Order</i><i>Customer</i><i>Fabric</i><i>Total</i></span>
          {rows.map(([id, who, what, amt, d]) => (
            <span key={id} className={`${s.sheetRow} ${d ? s.sheetNew : ''}`} style={d ? at(d) : undefined}>
              <i>{id}</i><i>{who}</i><i>{what}</i><i>{amt}</i>
            </span>
          ))}
        </div>
        <span className={s.jobDone} style={at(arrive(0, 'sheet') + 60)}>{CHECK}</span>
      </div>

      <div className={`${s.job} ${s.rise}`} style={at(2050, undefined, box(g.jobs.wa))}>
        <span className={s.jobHead}><WaMark />WhatsApp<em>to Noor K.</em></span>
        <div className={s.waBody}>
          <span className={`${s.typing} ${s.inout}`} style={at(arrive(0, 'wa') - 40, arrive(0, 'wa') + 320)}><i /><i /><i /></span>
          <span className={s.bubble} style={at(arrive(0, 'wa') + 340)}>
            Hi Noor, your twill is on its way. Care guide inside.
            <em>9:41 <i className={s.ticks}>{CHECK}{CHECK}</i></em>
          </span>
        </div>
        <span className={s.jobDone} style={at(arrive(0, 'wa') + 400)}>{CHECK}</span>
      </div>

      <div className={`${s.job} ${s.rise}`} style={at(2150, undefined, box(g.jobs.mail))}>
        <span className={s.jobHead}><GmailMark />Gmail<em>Reorder offer</em></span>
        <b className={s.mailSubject}>10% off your next metre, Noor</b>
        <span className={s.mailLine}>For when the twill runs out.</span>
        <span className={`${s.mailWhen} ${s.pop}`} style={at(arrive(0, 'mail') + 40)}><i />Scheduled · in 30 days</span>
        <span className={s.jobDone} style={at(arrive(0, 'mail') + 80)}>{CHECK}</span>
      </div>

      <div className={`${s.handled} ${s.rise}`} style={at(4000, undefined, box(g.handled))}>
        <i>{CHECK}</i>
        <span>
          <b>Every order, handled.</b>
          <em>
            <span className={s.flipNum} style={v({ '--k': `${arrive(1, 'sheet') + 40}ms` })}><span>38</span><span>39</span></span>
            {' '}orders this week · zero manual steps
          </em>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13 · OUTRO — lockup + tagline
// ─────────────────────────────────────────────────────────────────────────────
function Outro() {
  const portrait = usePortrait();
  return (
    <div className={s.fill}>
      <Glyphs items={portrait ? [
        { g: '/', x: 280, y: 580, d: 0, o: 520 },
        { g: '<', x: 420, y: 690, d: 60, o: 540, c: 'blue' },
        { g: '%', x: 240, y: 700, d: 120, o: 560, c: 'lav' },
        { g: '↗', x: 480, y: 570, d: 180, o: 580, c: 'blue' },
      ] : [
        { g: '/', x: 560, y: 300, d: 0, o: 520 },
        { g: '<', x: 700, y: 410, d: 60, o: 540, c: 'blue' },
        { g: '%', x: 520, y: 420, d: 120, o: 560, c: 'lav' },
        { g: '↗', x: 760, y: 290, d: 180, o: 580, c: 'blue' },
      ]} />
      <div className={s.outroLift}>
        <BrandLockup d={450} />
      </div>
      <span className={s.tagline}>
        <span className={s.taglineRing} />
        <Typed text="Grow it your way" start={2300} step={48} />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry — the order IS the story.
// `tone: 'dark'` lets the stage behind the canvas match on very wide screens.
// ─────────────────────────────────────────────────────────────────────────────
export const SCENES: { id: string; dur: number; tone?: 'dark'; Comp: ComponentType }[] = [
  { id: 'hook', dur: 5600, Comp: Hook },
  { id: 'logo', dur: 2200, Comp: Logo },
  { id: 'brief', dur: 4600, Comp: Brief },
  { id: 'market', dur: 5600, Comp: Market },
  { id: 'site', dur: 5400, Comp: Site },
  { id: 'connect', dur: 3000, Comp: Connect },
  { id: 'launch', dur: 6200, Comp: Launch },
  { id: 'purchase', dur: 4800, Comp: Purchase },
  { id: 'orders', dur: 4600, Comp: Orders },
  { id: 'scale', dur: 6000, Comp: Scale },
  { id: 'automate', dur: 7200, tone: 'dark', Comp: Automate },
  { id: 'outro', dur: 4600, Comp: Outro },
];
