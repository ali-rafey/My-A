// URL-safe key for a service, used to hand a pre-selected service from the
// Services page to the contact flow (/contact?service=digital-presence).
// Derived from the title rather than stored, so lib/content/static.ts keeps a
// single source of truth and a renamed service simply gets a new slug.
export function serviceSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
