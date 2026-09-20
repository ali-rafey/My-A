// Date formatting helpers for blog cards / lead rows.
const dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

export function formatDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return dateFmt.format(date);
}

export function formatDateTime(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return dateTimeFmt.format(date);
}

// Minutes to read a post, from its stored HTML. 200 wpm is the usual desk
// estimate; the floor of 1 keeps a one-paragraph note from reading "0 min".
export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
