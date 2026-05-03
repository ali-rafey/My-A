import DOMPurify from 'isomorphic-dompurify';

// Strip all HTML — for short inputs (name, email, phone, plain message).
export function sanitizeText(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') return '';
  const stripped = DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return stripped.trim().slice(0, maxLength);
}

// Allow safe rich-text HTML (for blog content authored in admin).
export function sanitizeRichHtml(value: unknown): string {
  if (typeof value !== 'string') return '';
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
      'ul', 'ol', 'li', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'figure', 'figcaption',
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'rel', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

export function isValidEmail(value: string): boolean {
  // Conservative RFC-5322-lite check; the real check is the confirmation email anyway.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
