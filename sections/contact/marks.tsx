// Marks for the contact page — drawn in the home film's hand.
//
// Two kinds live here:
//   * service marks  monoline, `currentColor`, so a block's mark takes the
//                    block's own colour when it is picked;
//   * channel marks  the real products a visitor recognises (Meta, Google,
//                    WhatsApp, n8n…), simplified to the few strokes that
//                    survive at 16px — the same treatment as the film kit.
//
// Deliberately NOT imported from sections/services/film/kit.tsx: that module
// also pulls in the film's stylesheet and its photo manifest, none of which
// /contact needs.

type MarkProps = { size?: number };

// ── Service marks ──────────────────────────────────────────────────────────
const line = (size: number) => ({
  viewBox: '0 0 24 24',
  width: size,
  height: size,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

/** Research & Data — a lens over a rising line. */
export function MarkResearch({ size = 22 }: MarkProps) {
  return (
    <svg {...line(size)}>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M15.6 15.6 21 21" />
      <path d="M7.2 12.6l2.4-2.9 2 1.7 2.5-3.4" />
    </svg>
  );
}

/** Digital Presence — a storefront window with a phone beside it. */
export function MarkPresence({ size = 22 }: MarkProps) {
  return (
    <svg {...line(size)}>
      <path d="M3 8.2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v6.6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 9.8h15" />
      <circle cx="5.6" cy="8" r="0.55" fill="currentColor" stroke="none" />
      <path d="M15.6 20.4V13a1.6 1.6 0 0 1 1.6-1.6h2.2A1.6 1.6 0 0 1 21 13v7.4a1.6 1.6 0 0 1-1.6 1.6h-2.2a1.6 1.6 0 0 1-1.6-1.6Z" />
    </svg>
  );
}

/** Advertising — a placed ad, and the click it earns. */
export function MarkAds({ size = 22 }: MarkProps) {
  return (
    <svg {...line(size)}>
      <path d="M3.5 5.6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H9.4" />
      <path d="M3.5 11.4 7 8.3l2.6 2.3 3.1-3.2 2.9 2.7" />
      <path d="m11.6 14.6 8 3.3-3.3 1.2-1.2 3.3Z" fill="currentColor" stroke="none" />
      <path d="m11.6 14.6 8 3.3-3.3 1.2-1.2 3.3Z" />
    </svg>
  );
}

/** Automation — one trigger, branching into the work it does for you. */
export function MarkAutomation({ size = 22 }: MarkProps) {
  return (
    <svg {...line(size)}>
      <path d="M5.6 12h3.6M14.4 12h1.9" />
      <path d="M12 12c0-2.6 1.3-4.4 3.6-4.4h.8M12 12c0 2.6 1.3 4.4 3.6 4.4h.8" />
      <circle cx="3.6" cy="12" r="1.9" />
      <circle cx="11.9" cy="12" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="18.6" cy="7.6" r="1.9" />
      <circle cx="18.6" cy="16.4" r="1.9" />
    </svg>
  );
}

/** Not sure yet — a conversation. */
export function MarkTalk({ size = 22 }: MarkProps) {
  return (
    <svg {...line(size)}>
      <path d="M20.5 12.4c0 3.9-3.8 7-8.5 7a9.9 9.9 0 0 1-2.6-.34L4 21l1.3-3.5a6.5 6.5 0 0 1-1.8-4.3c0-3.9 3.8-7 8.5-7s8.5 2.9 8.5 6.2Z" />
      <circle cx="8.6" cy="12.4" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12.4" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="15.4" cy="12.4" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ── Channel marks ──────────────────────────────────────────────────────────
export function GoogleG({ size = 16 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M21.6 12.2c0-.7-.06-1.35-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.75-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9Z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.85-2.85C16.96 2.95 14.7 2 12 2a10 10 0 0 0-8.9 5.5l3.3 2.6C7.2 7.65 9.4 5.9 12 5.9Z" fill="#EA4335" />
    </svg>
  );
}

export function MetaMark({ size = 14 }: MarkProps) {
  return (
    <svg viewBox="0 0 32 20" width={size * 1.6} height={size} aria-hidden="true">
      <path
        d="M3 13.5C3 8 5.6 3.5 9 3.5c3.6 0 6 5.2 8 8.6 1.8 3 3.2 4.4 5 4.4 2.2 0 4-2.3 4-5.6 0-4-2-7.4-4.8-7.4-3.2 0-5.3 4.6-8.2 9.3C11 16.9 9.5 17 8 17c-3 0-5-1.4-5-3.5Z"
        fill="none"
        stroke="#0866FF"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InstaMark({ size = 16 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="#D6249F" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="#D6249F" strokeWidth="1.8" />
      <circle cx="17.1" cy="6.9" r="1.2" fill="#F58529" />
    </svg>
  );
}

export function WhatsAppMark({ size = 16 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#25D366" />
      <path d="M7.2 17.2 8 14.6A5.2 5.2 0 1 1 10 16.4l-2.8.8Z" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 9.6c.2 1.6 1.3 2.8 2.9 3.4l.8-.8 1.2.6-.2 1c-2.6.1-4.9-2.2-4.9-4.8l1-.2.6 1.2-.8.8Z" fill="#fff" />
    </svg>
  );
}

export function SheetsMark({ size = 16 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M6 2.5h8l4.5 4.5v14.5H6z" fill="#0F9D58" />
      <path d="M14 2.5 18.5 7H14z" fill="#0B7C46" />
      <path d="M8.6 11.2h7v6.4h-7z" fill="none" stroke="#fff" strokeWidth="1.2" />
      <path d="M8.6 13.8h7M12.1 11.2v6.4" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}

export function N8nMark({ size = 16 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M4 12h5.5M14.5 12H17M12 12c0-2 1.2-3.5 3-3.5h1.5M12 12c0 2 1.2 3.5 3 3.5h1.5" fill="none" stroke="#EA4B71" strokeWidth="1.8" />
      <circle cx="3.5" cy="12" r="2" fill="#EA4B71" />
      <circle cx="11" cy="12" r="2" fill="#EA4B71" />
      <circle cx="19" cy="8.5" r="2" fill="#EA4B71" />
      <circle cx="19" cy="15.5" r="2" fill="#EA4B71" />
    </svg>
  );
}

export function ShopBag({ size = 16 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M5.5 8h13l-1.2 12.5H6.7z" fill="#95BF47" />
      <path d="M9 8V6.8a3 3 0 0 1 6 0V8" fill="none" stroke="#5E8E3E" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function GaMark({ size = 16 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect x="16.4" y="3" width="4.6" height="18" rx="2.3" fill="#F9AB00" />
      <rect x="9.7" y="9" width="4.6" height="12" rx="2.3" fill="#E37400" />
      <circle cx="5.3" cy="18.6" r="2.4" fill="#E37400" />
    </svg>
  );
}

/** A checked circle, used to stamp a finished step. */
export function TickMark({ size = 16 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="m6 12.4 3.8 3.8L18 7.6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Service id (lib/content/static.ts) to its mark. */
export const SERVICE_MARKS: Record<number, (p: MarkProps) => JSX.Element> = {
  1: MarkResearch,
  2: MarkPresence,
  3: MarkAds,
  4: MarkAutomation,
};
