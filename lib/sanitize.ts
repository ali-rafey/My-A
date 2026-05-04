// Plain-text sanitizer — NO DOMPurify dependency.
// This is the file imported by hot paths like /api/admin/login and /api/leads, so we keep it
// dependency-free. Rich-HTML sanitization for blog posts lives in lib/sanitize-html.ts and is
// imported only by the routes that need it.

export function sanitizeText(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') return '';
  const stripped = value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_match, name) => {
      switch (name) {
        case 'amp': return '&';
        case 'lt': return '';
        case 'gt': return '';
        case 'quot': return '"';
        case '#39': return "'";
        case 'nbsp': return ' ';
        default: return '';
      }
    });
  return stripped.trim().slice(0, maxLength);
}

export function isValidEmail(value: string): boolean {
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
