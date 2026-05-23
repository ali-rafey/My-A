// Wraps the /blogs segment with a parallel @modal slot. Clicking a card from /blogs uses an
// intercepting route at app/blogs/@modal/(.)[slug]/page.tsx to mount the post as a modal overlay
// instead of full-page navigating. Refresh / direct visits / search-engine crawlers still hit the
// standalone /blogs/[slug]/page.tsx (SSG + ISR + Article JSON-LD) — SEO unchanged.
export default function BlogsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
