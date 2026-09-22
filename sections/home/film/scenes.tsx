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
// data (glyphs, cards, nodes, taps) pick their portrait set here; everything
// else is re-laid in the portrait block at the end of scenes.module.css.
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
//   4. presence       build the storefront on what the research found
//   5. connect        wire the store to Meta Ads and Google Ads
//   6. launch         campaigns go live in Ads Manager and Google Ads
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
  twill: '/film/twill.jpg',
  jersey: '/film/jersey.jpg',
  pique: '/film/pique.jpg',
  fleece: '/film/fleece.jpg',
  terry: '/film/french-terry.jpg',
  mark: '/film/fanaar-mark.png',
};

export const PRELOAD_IMAGES = Object.values(IMG).concat('/logo-icon.png');

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
      <img className={s.lockMark} src="/logo-icon.png" alt="" width={500} height={500} />
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
function ShopBag({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M5.5 8h13l-1.2 12.5H6.7z" fill="#95BF47" />
      <path d="M9 8V6.8a3 3 0 0 1 6 0V8" fill="none" stroke="#5E8E3E" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared screens (the example business: Fanaar)
// ─────────────────────────────────────────────────────────────────────────────

const FABRICS = [
  { t: 'Twill', p: '$18/m', img: IMG.twill },
  { t: 'Jersey', p: '$14/m', img: IMG.jersey },
  { t: 'Piqué', p: '$16/m', img: IMG.pique },
  { t: 'Fleece', p: '$22/m', img: IMG.fleece },
  { t: 'French Terry', p: '$19/m', img: IMG.terry },
];

function SiteMock() {
  return (
    <div className={s.site}>
      <div className={s.siteNav}>
        <span className={s.fanaarLogo}>
          <img src={IMG.mark} alt="" width={300} height={218} />
          FANAAR
        </span>
        <span className={s.siteLinks}>Shop fabric · Swatches · Journal · About</span>
        <span className={s.siteCart}>Cart (0)</span>
        <span className={s.siteCta}>Shop now</span>
      </div>
      <div className={s.siteHero}>
        <div className={s.siteCopy}>
          <span className={s.siteEyebrow}>Lounge fabric · cut to order</span>
          <span className={`${s.siteHeadline} ${s.siteHeadlineMove}`}>
            We make the cloth<br />you live in.
          </span>
          <span className={s.siteSub}>Traced to origin · Tested by batch · Shipped worldwide</span>
        </div>
        <img src={IMG.meadow} alt="" />
      </div>
      <div className={s.siteCards}>
        {FABRICS.map((c, i) => (
          <div key={c.t} className={`${s.siteCard} ${s.rise}`} style={at(700 + i * 110)}>
            <img src={c.img} alt="" />
            <span>{c.t}<em>{c.p}</em></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// The same store as it reads on a phone: photo-led hero with the headline
// over it, fabrics two to a row.
function MobileSiteMock() {
  return (
    <div className={`${s.site} ${s.mSite}`}>
      <div className={s.mNav}>
        <span className={s.fanaarLogo}>
          <img src={IMG.mark} alt="" width={300} height={218} />
          FANAAR
        </span>
        <span className={s.mCart}>Cart (0)</span>
        <span className={s.mBurger}><i /><i /></span>
      </div>
      <div className={s.mHero}>
        <img src={IMG.meadow} alt="" />
        <div className={s.mCopy}>
          <span className={s.mEyebrow}>Lounge fabric · cut to order</span>
          <span className={`${s.mHeadline} ${s.siteHeadlineMove}`}>We make the cloth<br />you live in.</span>
          <span className={s.mShop}>Shop fabric</span>
        </div>
      </div>
      <div className={s.mCards}>
        {FABRICS.slice(0, 4).map((c, i) => (
          <div key={c.t} className={`${s.siteCard} ${s.rise}`} style={at(700 + i * 110)}>
            <img src={c.img} alt="" />
            <span>{c.t}<em>{c.p}</em></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Browser({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`${s.browser} ${className ?? ''}`} style={style}>
      <div className={s.browserBar}><i /><i /><i /><span>fanaar.online</span></div>
      <div className={s.browserBody}>{children}</div>
    </div>
  );
}

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
          <i><ShopBag size={22} /></i>
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
// 6 · PRESENCE — the storefront, built on what the research found
// ─────────────────────────────────────────────────────────────────────────────
function Site() {
  const portrait = usePortrait();
  return (
    <div className={`${s.fill} ${s.skyBg}`}>
      {portrait ? (
        <div className={`${s.phone} ${s.sitePhone}`}>
          <div className={s.phoneScreen}><MobileSiteMock /></div>
        </div>
      ) : (
        <Browser className={s.siteFrame}>
          <SiteMock />
        </Browser>
      )}
      <span className={`${s.floatBadge} ${s.pop}`} style={at(2100, undefined, portrait ? { left: '404px', top: '204px' } : { left: '936px', top: '58px' })}>
        <i className={s.liveDot} />Live · fanaar.online
      </span>
      <span className={`${s.floatBadge} ${s.pop}`} style={at(2500, undefined, portrait ? { left: '84px', top: '900px' } : { left: '112px', top: '536px' })}>
        <ShopBag />Built on Shopify
      </span>
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
// 8 · LAUNCH — Meta Ads Manager, then the camera pans to Google Ads
// ─────────────────────────────────────────────────────────────────────────────
const PAN_AT = 3000;
const G = PAN_AT + 600; // Google's screen starts moving once it is in view

// Where a thumb lands on the portrait canvas, measured off the laid-out
// portrait screens (each is the centre of the control it presses).
const PORTRAIT_TAPS = {
  launchToggle: { x: 103, y: 616 },
  launchPublish: { x: 600, y: 387 },
  scaleBudget: { x: 231, y: 978 },
  automateRun: { x: 360, y: 1064 },
};

function MetaAdsMock() {
  return (
    <div className={s.meta}>
      <div className={s.metaTop}>
        <span className={s.metaBrand}><MetaMark size={16} />Ads Manager</span>
        <span className={s.metaAcct}>Fanaar Textile <em>▾</em></span>
        <span className={s.metaPixel}><i />Pixel · Purchase events received</span>
        <span className={s.metaPublish}>Publish</span>
      </div>
      <div className={s.metaBody}>
        <div className={s.metaRail}>{[0, 1, 2, 3, 4].map((i) => <i key={i} data-on={i === 0 || undefined} />)}</div>
        <div className={s.metaMain}>
          <div className={s.metaTabs}>
            <span data-on>Campaigns</span><span>Ad sets</span><span>Ads</span>
            <em>Last 7 days ▾</em>
          </div>
          <div className={s.metaTools}>
            <span className={s.metaCreate}>+ Create</span><span>Duplicate</span><span>Edit</span><span>A/B test</span>
          </div>
          <div className={`${s.metaRow} ${s.metaHead}`}>
            <span>Off/On</span><span>Campaign</span><span>Delivery</span><span>Budget</span><span>Results</span><span>Cost per result</span><span>Amount spent</span><span>ROAS</span>
          </div>
          <div className={`${s.metaRow} ${s.metaHot}`}>
            <span><i className={`${s.tgl} ${s.tglFlip}`} style={at(1300)} /></span>
            <span><b>Linen launch — Advantage+ shopping</b></span>
            <span className={s.deliv}>
              <em className={s.dvOff}>Off</em>
              <em className={s.dvReview}><i />In review</em>
              <em className={s.dvActive}><i />Active</em>
            </span>
            <span>$40.00<small>Daily</small></span>
            <span className={s.metaLate}><b>38</b><small>Purchases</small></span>
            <span className={s.metaLate}>$7.42</span>
            <span className={s.metaLate}>$282.10</span>
            <span className={s.metaLate}><b>4.80</b></span>
          </div>
          <div className={s.metaRow}>
            <span><i className={s.tgl} data-on /></span>
            <span><b>Retargeting — viewed product</b></span>
            <span className={s.deliv}><em className={s.dvStatic}><i />Active</em></span>
            <span>$20.00<small>Daily</small></span>
            <span><b>21</b><small>Purchases</small></span>
            <span>$5.11</span>
            <span>$107.40</span>
            <span><b>6.12</b></span>
          </div>
          <div className={s.metaRow}>
            <span><i className={s.tgl} data-on /></span>
            <span><b>Lookalike — past buyers</b></span>
            <span className={s.deliv}><em className={s.dvStatic}><i />Active</em></span>
            <span>$25.00<small>Daily</small></span>
            <span><b>17</b><small>Purchases</small></span>
            <span>$6.35</span>
            <span>$108.00</span>
            <span><b>5.20</b></span>
          </div>
          <div className={s.metaRow}>
            <span><i className={s.tgl} /></span>
            <span><b>Swatch kit — traffic</b></span>
            <span className={s.deliv}><em className={s.dvMuted}>Off</em></span>
            <span>$10.00<small>Daily</small></span>
            <span>—</span><span>—</span><span>$0.00</span><span>—</span>
          </div>
          <div className={s.metaRow}>
            <span><i className={s.tgl} /></span>
            <span><b>Winter linen — draft</b></span>
            <span className={s.deliv}><em className={s.dvMuted}>Draft</em></span>
            <span>$30.00<small>Daily</small></span>
            <span>—</span><span>—</span><span>$0.00</span><span>—</span>
          </div>
          <div className={s.metaFoot}>Results from 5 campaigns</div>
        </div>
      </div>
      <span className={s.metaToast}><i>{CHECK}</i>Campaign published</span>
    </div>
  );
}

const GA_CLICKS = 'M0 150 C 40 146, 70 140, 110 134 S 180 118, 220 110 S 290 96, 330 80 S 410 58, 450 50 S 540 26, 600 16';
const GA_CONV = 'M0 170 C 50 168, 90 164, 130 160 S 200 150, 240 146 S 320 132, 360 124 S 440 104, 480 96 S 560 74, 600 64';

function GoogleAdsMock() {
  const tiles = [
    { k: 'Clicks', val: '4.21K', c: 'blue' },
    { k: 'Impressions', val: '186K', c: '' },
    { k: 'Conversions', val: '214', c: 'red' },
    { k: 'Conv. value', val: '$18.6K', c: '' },
  ];
  return (
    <div className={s.gads}>
      <div className={s.gTop}>
        <span className={s.gBrand}><GoogleAdsMark />Google Ads</span>
        <span className={s.gAcct}>Fanaar Textile<em>482-193-7710</em></span>
        <span className={s.gSearch}>Search for a page or campaign</span>
        <span className={s.gAvatar}>F</span>
      </div>
      <div className={s.gBody}>
        <div className={s.gRail}>
          <span className={s.gCreate}>+</span>
          {['Campaigns', 'Goals', 'Tools', 'Billing', 'Admin'].map((t, i) => (
            <span key={t} data-on={i === 0 || undefined}><i />{t}</span>
          ))}
        </div>
        <div className={s.gMain}>
          <span className={s.gCrumb}>All campaigns ›</span>
          <div className={s.gTitle}>
            <b>PMax — Fanaar storefront</b>
            <span className={s.gState}>
              <em className={s.gPending}>Pending</em>
              <em className={s.gEligible}><i>{CHECK}</i>Eligible</em>
            </span>
            <span className={s.gType}>Performance Max</span>
          </div>
          <div className={s.gTiles}>
            {tiles.map((t, i) => (
              <div key={t.k} className={`${s.gTile} ${t.c ? s[`gt_${t.c}`] : ''}`} data-on={t.c ? true : undefined}>
                <span>{t.k}</span>
                <b><Odo value={t.val} d={G + 200 + i * 120} dur={1400} /></b>
              </div>
            ))}
          </div>
          <div className={s.gChartCard}>
            <svg viewBox="0 0 600 180" className={s.gChart}>
              {[45, 90, 135].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} className={s.gridLine} />)}
              <path d={GA_CONV} className={`${s.gLineRed} ${s.draw}`} style={at(G + 450)} pathLength={1} />
              <path d={GA_CLICKS} className={`${s.gLineBlue} ${s.draw}`} style={at(G + 300)} pathLength={1} />
            </svg>
            <div className={s.gSide}>
              <span className={s.gCap}>Conversion goal</span>
              <b>Purchase (Shopify)</b>
              <span className={`${s.gRecording} ${s.pop}`} style={at(G + 900)}><i />Recording conversions</span>
              <span className={s.gCap}>Asset group · Ad strength</span>
              <div className={s.gAssets}>
                <img src={IMG.reel} alt="" /><img src={IMG.product} alt="" /><img src={IMG.meadow} alt="" />
                <em className={s.pop} style={at(G + 1100)}>Excellent</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Launch() {
  const portrait = usePortrait();
  return (
    <div className={s.fill}>
      {/* Landscape pans across to Google Ads; portrait scrolls down to it. */}
      <div className={s.adsStrip} style={at(PAN_AT)}>
        <div className={`${s.adsWin} ${s.frameEnter}`}>
          <MetaAdsMock />
        </div>
        <div className={`${s.adsWin} ${s.adsWinNext}`}>
          <GoogleAdsMock />
        </div>
      </div>
      {portrait ? (
        <>
          <Tap x={PORTRAIT_TAPS.launchToggle.x} y={PORTRAIT_TAPS.launchToggle.y} d={1160} />
          <Tap x={PORTRAIT_TAPS.launchPublish.x} y={PORTRAIT_TAPS.launchPublish.y} d={1980} />
        </>
      ) : (
        <span className={s.outAt} style={at(0, 2800)}>
          <Cursor
            x0={1060} y0={660} x1={189} y1={300} d={600} move={640} click={1260}
            x2={1130} y2={112} d2={1450} move2={560} click2={2080}
          />
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
const NOTIFS = [
  { items: 1, amt: '$72.00', d: 500 },
  { items: 3, amt: '$186.00', d: 1250 },
  { items: 1, amt: '$48.00', d: 1800 },
  { items: 4, amt: '$240.00', d: 2200 },
  { items: 2, amt: '$96.00', d: 2500 },
  { items: 2, amt: '$132.00', d: 2750 },
];

// Each new order lands on top and pushes the older ones down, like iOS: every
// later arrival wraps an older card in one more one-slot shift.
function Notification({ i }: { i: number }) {
  const n = NOTIFS[i];
  let el: ReactNode = (
    <div className={s.notif} style={at(n.d)}>
      <span className={s.notifIcon}><ShopBag size={20} /></span>
      <div>
        <span className={s.notifApp}>SHOPIFY<em>now</em></span>
        <b>Fanaar Textile</b>
        <span>You have a new order for {n.items} {n.items === 1 ? 'item' : 'items'} totaling {n.amt} from Online Store.</span>
      </div>
    </div>
  );
  for (let j = i + 1; j < NOTIFS.length; j += 1) {
    el = <div className={s.notifShift} style={at(NOTIFS[j].d)}>{el}</div>;
  }
  return <div className={s.notifSlot}>{el}</div>;
}

function Orders() {
  return (
    <div className={s.fill}>
      <Holo soft />
      <div className={`${s.phone} ${s.phoneLeft} ${s.phoneIn}`}>
        <div className={`${s.phoneScreen} ${s.lock}`}>
          <img src={IMG.wallpaper} alt="" />
          <span className={s.lockDate}>Friday 19 September</span>
          <span className={s.lockTime}>9:41</span>
          <div className={s.notifs}>
            {NOTIFS.map((_, i) => <Notification key={i} i={i} />)}
          </div>
        </div>
      </div>
      <div className={s.salesToday}>
        <span className={s.rise} style={at(300)}>Sales today</span>
        <b><Odo value="$774.00" d={500} dur={2600} /></b>
        <em className={s.pop} style={at(3000)}><Up>6 orders in the last hour</Up></em>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11 · SCALE — budget up; sales and traffic climb with it
// ─────────────────────────────────────────────────────────────────────────────
const SALES = 'M0 200 C 50 196, 80 190, 120 186 S 190 170, 230 164 S 300 150, 340 130 S 420 108, 460 86 S 540 44, 600 18';
const SALES_PREV = 'M0 204 C 60 202, 120 198, 180 196 S 280 190, 340 186 S 440 180, 500 176 S 570 172, 600 170';
const SPARKS = [
  'M0 26 C 12 24, 20 22, 30 18 S 48 14, 60 6',
  'M0 28 C 10 27, 22 24, 30 20 S 46 10, 60 4',
  'M0 26 C 14 25, 22 20, 32 18 S 50 12, 60 8',
  'M0 24 C 12 23, 24 22, 34 16 S 50 10, 60 7',
];

function ShopifyMock({ o = 0 }: { o?: number }) {
  const nav = ['Home', 'Orders', 'Products', 'Customers', 'Content', 'Analytics', 'Marketing', 'Discounts'];
  const metrics = [
    { k: 'Sessions', val: '24,860', c: '62%' },
    { k: 'Total sales', val: '$48,920', c: '128%' },
    { k: 'Orders', val: '612', c: '94%' },
    { k: 'Conversion rate', val: '3.4%', c: '41%' },
  ];
  // Listed newest first but revealed oldest first, so each new order lands
  // on top of the last one.
  const orders = [
    { id: '#1052', who: 'Amelia R.', what: 'Jersey · 4 m', amt: '$56.00', d: 3100 },
    { id: '#1051', who: 'Noor K.', what: 'Twill · 6 m', amt: '$108.00', d: 2700 },
    { id: '#1050', who: 'Clara M.', what: 'Linen · 3 m', amt: '$72.00', d: 2300 },
  ];
  const products = [
    { k: 'Stonewashed Linen', p: 38 },
    { k: 'Jersey', p: 27 },
    { k: 'French Terry', p: 19 },
  ];
  return (
    <div className={s.shop}>
      <div className={s.shopTop}>
        <span className={s.shopBrand}><ShopBag size={20} />shopify</span>
        <span className={s.shopSearch}>Search<kbd>⌘ K</kbd></span>
        <span className={s.shopStore}><i>FT</i>Fanaar Textile</span>
      </div>
      <div className={s.shopBody}>
        <div className={s.shopNav}>
          {nav.map((n, i) => (
            <span key={n} data-on={i === 0 || undefined}>
              <i />{n}{n === 'Orders' ? <em>12</em> : null}
            </span>
          ))}
          <b>Sales channels</b>
          <span><i />Online Store</span>
        </div>
        <div className={s.shopMain}>
          <div className={s.shopPills}><span>Today</span><span>All channels</span></div>
          <div className={s.shopGrid}>
            <div className={s.shopCard}>
              <div className={s.shopMetrics}>
                {metrics.map((m, i) => (
                  <div key={m.k} className={s.shopMetric} data-on={i === 1 || undefined}>
                    <span>{m.k}</span>
                    <b><Odo value={m.val} d={o + 350 + i * 120} dur={1600} /></b>
                    <div className={s.shopDelta}>
                      <span className={s.pop} style={at(o + 1900 + i * 100)}><Up>{m.c}</Up></span>
                      <svg viewBox="0 0 60 30"><path d={SPARKS[i]} className={s.draw} style={at(o + 500 + i * 120)} pathLength={1} /></svg>
                    </div>
                  </div>
                ))}
              </div>
              <div className={s.shopChartHead}>
                <b>Total sales over time</b>
                <span><i />This month <i data-prev />Last month</span>
              </div>
              <svg viewBox="0 0 600 220" className={s.shopChart}>
                {[55, 110, 165].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} className={s.gridLine} />)}
                <path d={SALES_PREV} className={`${s.shopPrev} ${s.areaIn}`} style={at(o + 600)} />
                <path d={SALES} className={`${s.shopLine} ${s.draw}`} style={at(o + 700)} pathLength={1} />
              </svg>
            </div>
            <div className={s.shopSide}>
              <div className={s.shopCard}>
                <b className={s.shopCardTitle}>New orders</b>
                {orders.map((od) => (
                  <div key={od.id} className={`${s.shopOrder} ${s.orderIn}`} style={at(o + od.d)}>
                    <span><b>{od.id}</b>{od.who}</span>
                    <span>{od.what}</span>
                    <em>{od.amt}</em>
                    <i>Paid</i>
                  </div>
                ))}
              </div>
              <div className={s.shopCard}>
                <b className={s.shopCardTitle}>Top products by sales</b>
                {products.map((p, i) => (
                  <div key={p.k} className={s.shopProduct}>
                    <span>{p.k}</span><em>{p.p}%</em>
                    <i><b className={s.growX} style={v({ width: `${p.p * 2.4}%`, '--d': `${o + 1200 + i * 140}ms` })} /></i>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Scale() {
  const portrait = usePortrait();
  const live = [5, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14, 18, 17, 20];
  return (
    <div className={s.fill}>
      <div className={s.scaleTitle} style={at(0, 1150)}>
        <span className={s.hookW} style={at(80)}>Scale</span>{' '}
        <span className={s.hookW} style={at(240)}>what</span>{' '}
        <span className={`${s.hookW} ${s.hookEm}`} style={at(420)}>works.</span>
      </div>
      <div className={s.scaleCam}>
        <div className={s.scaleShop}>
          <div className={s.enterAt} style={at(1100)}>
            <ShopifyMock o={1100} />
          </div>
        </div>

        <div className={`${s.budgetCard} ${s.cardFly}`} style={at(1700)}>
          <span className={s.bcHead}><MetaMark size={13} />Ads Manager</span>
          <b className={s.bcName}>Linen launch — Advantage+</b>
          <span className={s.bcLabel}>Daily budget</span>
          <span className={s.bcBudget}>
            <em className={s.bcOld}>$40.00</em>
            <em className={s.bcNew}>$160.00</em>
          </span>
          <div className={s.bcStats}>
            <span>ROAS<b>4.8×</b></span>
            <span>Purchases<b>214</b></span>
          </div>
          <span className={s.bcBtn}>Increase budget</span>
          <span className={s.bcScaled}><Up>Scaled 4×</Up></span>
        </div>

        <div className={`${s.gaCard} ${s.cardFly}`} style={at(2000)}>
          <span className={s.gaCardHead}><GaMark />Analytics<em>fanaar.online</em></span>
          <span className={s.gaCap}>Users in last 30 minutes</span>
          <b className={s.gaBig}><Odo value="312" d={2200} dur={1400} /></b>
          <div className={s.gaBars}>
            {live.map((h, i) => <i key={i} className={s.growY} style={v({ height: `${h * 5}%`, '--d': `${2300 + i * 45}ms` })} />)}
          </div>
          <div className={s.gaEvent}><span>purchase</span><b>61</b><Up>112%</Up></div>
        </div>
      </div>
      {portrait ? (
        <Tap x={PORTRAIT_TAPS.scaleBudget.x} y={PORTRAIT_TAPS.scaleBudget.y} d={2800} />
      ) : (
        <Cursor x0={1150} y0={660} x1={1020} y1={292} d={2250} move={560} click={2900} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12 · AUTOMATE — the busywork runs itself, in n8n
// ─────────────────────────────────────────────────────────────────────────────
const RUN = 3200; // when the workflow executes

type N8nNode = { id: string; x: number; y: number; name: string; sub: string; icon: ReactNode; trigger?: boolean; ok?: number; branch?: boolean };
const NODES: N8nNode[] = [
  { id: 'shopify', x: 120, y: 200, name: 'Shopify Trigger', sub: 'On order created', icon: <ShopBag size={40} />, trigger: true, ok: RUN + 150 },
  {
    id: 'sheets', x: 340, y: 200, name: 'Google Sheets', sub: 'Append row: orders', ok: RUN + 550,
    icon: <svg viewBox="0 0 24 24" width="36" height="36"><path d="M6 2h9l5 5v15H6z" fill="#0F9D58" /><path d="M15 2v5h5" fill="#87CEAC" /><path d="M9 11h8v7H9zM9 14.5h8M13 11v7" fill="none" stroke="#fff" strokeWidth="1.3" /></svg>,
  },
  {
    id: 'if', x: 560, y: 200, name: 'If', sub: 'First order?', ok: RUN + 950, branch: true,
    icon: <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#408000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h5l4-6h5M10 12l4 6h5" /><path d="m17 4 2 2-2 2M17 16l2 2-2 2" /></svg>,
  },
  {
    id: 'wa', x: 810, y: 100, name: 'WhatsApp', sub: 'Send welcome + care guide', ok: RUN + 1350,
    icon: <svg viewBox="0 0 24 24" width="38" height="38"><circle cx="12" cy="12" r="10" fill="#25D366" /><path d="M8.6 7.6c.3-.3.8-.3 1 .1l.9 1.7c.1.3.1.6-.1.8l-.6.7c.5 1.2 1.5 2.2 2.7 2.8l.7-.6c.2-.2.5-.3.8-.1l1.7.9c.4.2.4.7.1 1l-.9.9c-.6.6-1.6.7-2.4.3-2.2-1-4-2.8-5-5-.4-.8-.3-1.8.3-2.4Z" fill="#fff" /></svg>,
  },
  {
    id: 'gmail', x: 810, y: 300, name: 'Gmail', sub: 'Send reorder offer',
    icon: <svg viewBox="0 0 24 24" width="36" height="36"><path d="M3 7.5V18h4v-7l5 3.6 5-3.6v7h4V7.5l-2-1.5-7 5.2L5 6z" fill="#EA4335" /><path d="M3 7.5 5 6v12H3z" fill="#4285F4" /><path d="M21 7.5 19 6v12h2z" fill="#34A853" /></svg>,
  },
];

// Portrait runs the same workflow top to bottom — the way it has to read on
// a phone — so the If splits left (WhatsApp) and right (Gmail) at the foot.
// (Coordinates on the portrait editor's own 520×756 canvas panel.)
const NODE_AT_P: Record<string, [number, number]> = {
  shopify: [210, 112],
  sheets: [210, 252],
  if: [210, 392],
  wa: [50, 548],
  gmail: [370, 548],
};
// The column nodes carry their names beside them; the two at the foot keep
// theirs underneath, where nothing runs.
const NODE_SIDE_P = new Set(['shopify', 'sheets', 'if']);

type Edge = { d: string; ok?: number; label?: { x: number; y: number } };
// Connections, from each node's output handle to the next node's input.
const EDGES: Edge[] = [
  { d: 'M220 250 C 280 250, 280 250, 340 250', ok: RUN + 350, label: { x: 280, y: 238 } },
  { d: 'M440 250 C 500 250, 500 250, 560 250', ok: RUN + 750, label: { x: 500, y: 238 } },
  { d: 'M660 236 C 740 236, 730 150, 810 150', ok: RUN + 1150, label: { x: 736, y: 170 } },
  { d: 'M660 264 C 740 264, 730 350, 810 350' },
];
// Portrait handles sit on the bottom (out) and top (in) of each node.
const EDGES_P: Edge[] = [
  { d: 'M260 218 C 260 230, 260 236, 260 248', ok: RUN + 350, label: { x: 292, y: 226 } },
  { d: 'M260 358 C 260 370, 260 376, 260 388', ok: RUN + 750, label: { x: 292, y: 366 } },
  { d: 'M236 496 C 236 526, 100 516, 100 544', ok: RUN + 1150, label: { x: 146, y: 510 } },
  { d: 'M284 496 C 284 526, 420 516, 420 544' },
];

function N8nMock() {
  const portrait = usePortrait();
  const edges = portrait ? EDGES_P : EDGES;
  return (
    <div className={s.n8n}>
      <div className={s.n8nTop}>
        <span className={s.n8nCrumb}>Personal <em>/</em> <b>New order → follow-up</b></span>
        <span className={s.n8nTabs}><b>Editor</b><span>Executions</span></span>
        <span className={s.n8nRight}>
          <span className={s.n8nActive}>Active<i className={`${s.tgl} ${s.tglFlip} ${s.tglGreen}`} style={at(RUN + 2100)} /></span>
          <span className={s.n8nShare}>Share</span>
          <span className={s.n8nSaved}>Saved</span>
        </span>
      </div>
      <div className={s.n8nBody}>
        <div className={s.n8nRail}>
          <span className={s.n8nLogo}>
            <svg viewBox="0 0 32 20" width="26" height="16"><circle cx="4" cy="10" r="3" fill="#EA4B71" /><circle cx="16" cy="4" r="3" fill="#EA4B71" /><circle cx="16" cy="16" r="3" fill="#EA4B71" /><circle cx="28" cy="10" r="3" fill="#EA4B71" /><path d="M7 10h4l2-5M11 10l2 5M19 4l6 5M19 16l6-5" stroke="#EA4B71" strokeWidth="1.8" fill="none" /></svg>
          </span>
          {[0, 1, 2, 3].map((i) => <i key={i} />)}
        </div>
        <div className={s.n8nCanvas}>
          <div className={`${s.n8nSticky} ${s.rise}`} style={at(1900)}>
            <b>Order follow-up</b>
            Runs on every Shopify order: logs it, then welcomes first-time buyers on WhatsApp.
          </div>
          {/* The viewBox is the canvas panel's own size, so path units are px. */}
          <svg className={s.n8nEdges} viewBox={portrait ? '0 0 520 756' : '0 0 1064 514'}>
            {edges.map((e, i) => (
              <g key={i}>
                <path d={e.d} className={`${s.edge} ${s.fadeIn}`} style={at(2000 + i * 120)} />
                {e.ok ? <path d={e.d} className={`${s.edgeOk} ${s.drawFast}`} style={at(e.ok)} pathLength={1} /> : null}
              </g>
            ))}
          </svg>
          {edges.map((e, i) => (e.label ? (
            <span key={i} className={s.edgeLabel} style={at((e.ok ?? 0) + 200, undefined, { left: `${e.label.x}px`, top: `${e.label.y}px` })}>1 item</span>
          ) : null))}
          {NODES.map((n, i) => (
            <div
              key={n.id}
              className={`${s.node} ${n.trigger ? s.nodeTrigger : ''} ${n.branch ? s.nodeBranch : ''} ${portrait && NODE_SIDE_P.has(n.id) ? s.nodeSide : ''}`}
              style={at(1950 + i * 110, undefined, {
                left: `${portrait ? NODE_AT_P[n.id][0] : n.x}px`,
                top: `${portrait ? NODE_AT_P[n.id][1] : n.y}px`,
                '--ok': `${n.ok ?? 999999}ms`,
              })}
            >
              {n.trigger ? (
                <span className={s.nodeBolt}>
                  <svg viewBox="0 0 24 24" width="18" height="18"><path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" fill="#FF6D5A" /></svg>
                </span>
              ) : null}
              <span className={s.nodeIcon}>{n.icon}</span>
              {n.ok ? <span className={s.nodeOk}>{CHECK}</span> : null}
              {n.branch ? <span className={s.nodePorts}><em>true</em><em>false</em></span> : null}
              <span className={s.nodeName}><b>{n.name}</b>{n.sub}</span>
            </div>
          ))}
          <span className={s.n8nExec}>
            <svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 2h4M7 2v4L3.5 12.5A1.5 1.5 0 0 0 4.8 14.8h6.4a1.5 1.5 0 0 0 1.3-2.3L9 6V2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            Execute workflow
          </span>
          <span className={s.n8nToast}><i>{CHECK}</i>Workflow executed successfully</span>
        </div>
      </div>
    </div>
  );
}

function Automate() {
  const portrait = usePortrait();
  return (
    <div className={`${s.fill} ${s.darkBg}`}>
      <span className={s.bigCaret} />
      <span className={`${s.termLine} ${s.inout}`} style={at(250, 1450)}>
        <em>→</em> <Typed text="automate the busywork" start={300} step={42} />
      </span>
      <div className={s.n8nAt}>
        <N8nMock />
      </div>
      {portrait ? (
        <Tap x={PORTRAIT_TAPS.automateRun.x} y={PORTRAIT_TAPS.automateRun.y} d={2980} />
      ) : (
        <Cursor x0={1100} y0={680} x1={666} y1={606} d={2350} move={600} click={3060} />
      )}
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
  { id: 'site', dur: 4400, Comp: Site },
  { id: 'connect', dur: 3000, Comp: Connect },
  { id: 'launch', dur: 6200, Comp: Launch },
  { id: 'purchase', dur: 4800, Comp: Purchase },
  { id: 'orders', dur: 4600, Comp: Orders },
  { id: 'scale', dur: 6000, Comp: Scale },
  { id: 'automate', dur: 7200, tone: 'dark', Comp: Automate },
  { id: 'outro', dur: 4600, Comp: Outro },
];
