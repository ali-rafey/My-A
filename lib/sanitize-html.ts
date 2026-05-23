// Rich-HTML sanitizer for blog posts. Uses the `sanitize-html` package — a parser-based, pure-JS
// HTML allow-list sanitizer with NO jsdom dependency. This replaced an earlier
// `isomorphic-dompurify` implementation that pulled in jsdom → html-encoding-sniffer, which
// require()s the ESM-only @exodus/bytes/encoding-lite.js. Recent Node runtimes (the one Vercel
// ships included) reject that, which crashed the admin blog POST/PUT routes at sanitize time.
//
// The exported `sanitizeRichHtml` signature is unchanged — every caller still receives the same
// (string-in, string-out) function. The allow-list matches the previous DOMPurify configuration.
import sanitizeHtml from 'sanitize-html';
import { sanitizeText } from './sanitize';

const RICH_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
    'ul', 'ol', 'li', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'figure', 'figcaption',
  ],
  // sanitize-html scopes attributes per-tag (DOMPurify's ALLOWED_ATTR was global). Bind each
  // attribute only to the tag that actually uses it — tightens the surface area beyond the prior
  // config without breaking any output textToHtml or the editor produce.
  allowedAttributes: {
    a: ['href', 'title', 'rel', 'target'],
    img: ['src', 'alt', 'title'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // Disallow protocol-relative URLs (//foo.bar) — DOMPurify's ALLOWED_URI_REGEXP rejected them
  // implicitly; sanitize-html needs the explicit flag.
  allowProtocolRelative: false,
};

export function sanitizeRichHtml(value: unknown): string {
  if (typeof value !== 'string') return '';
  try {
    return sanitizeHtml(value, RICH_HTML_OPTIONS);
  } catch (err) {
    // If the parser ever throws (it shouldn't for any normal input), fall back to a strict
    // tag-stripper rather than crashing the route.
    console.error('sanitizeRichHtml fallback (parser failed):', err instanceof Error ? err.message : err);
    return sanitizeText(value, value.length);
  }
}
