// Plain-text → safe HTML for the blog editor.
// Lets admins type body content as plain text without learning HTML; on save we wrap it into
// paragraphs and auto-link URLs. The downstream `sanitizeRichHtml` pass still runs after this,
// so anything we emit must be inside its allow-list (p, br, a — all safe).
//
// Detection: if the input already looks like authored HTML (block tags at the start of a line),
// pass it through unchanged. Keeps backward compatibility with posts written before this change
// and lets advanced users paste rich content from other tools.
//
// No `server-only` directive — pure string manipulation, safe to call from the BlogEditor's live
// preview as well as the API routes.

const BLOCK_HTML_RE = /<\s*(p|h[1-6]|ul|ol|li|blockquote|pre|figure|hr|div|article|section)\b/i;
const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"”’])/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function textToHtml(input: string): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Pass-through path: looks like already-authored HTML. We do NOT escape here; the caller is
  // expected to run it through sanitizeRichHtml afterwards, which will strip anything unsafe.
  if (BLOCK_HTML_RE.test(trimmed)) return trimmed;

  // Plain-text path: escape everything, then add paragraph/line-break structure and auto-link URLs.
  const escaped = escapeHtml(trimmed);

  // Split on blank lines (one or more empty lines) into paragraphs. Preserve single newlines
  // inside a paragraph as <br>.
  const paragraphs = escaped
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(/\n/g, '<br>'));

  // Auto-link http(s) URLs after escaping (so the literal URL stays a string, but we wrap it).
  const linked = paragraphs.map((p) =>
    p.replace(URL_RE, (url) => `<a href="${url}" rel="noopener noreferrer" target="_blank">${url}</a>`),
  );

  return linked.map((p) => `<p>${p}</p>`).join('\n');
}
