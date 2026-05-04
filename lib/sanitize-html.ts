// Rich-HTML sanitizer for blog posts. Pulls in isomorphic-dompurify (which loads jsdom) — heavy.
// Keep this file out of the import graph of fast routes like /api/admin/login.
import DOMPurify from 'isomorphic-dompurify';
import { sanitizeText } from './sanitize';

const RICH_HTML_OPTIONS = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
    'ul', 'ol', 'li', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'figure', 'figcaption',
  ],
  ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'rel', 'target'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeRichHtml(value: unknown): string {
  if (typeof value !== 'string') return '';
  try {
    return DOMPurify.sanitize(value, RICH_HTML_OPTIONS);
  } catch (err) {
    // If jsdom fails to init for any reason, fall back to a strict tag-stripper rather than crashing.
    console.error('sanitizeRichHtml fallback (DOMPurify unavailable):', err instanceof Error ? err.message : err);
    return sanitizeText(value, value.length);
  }
}
