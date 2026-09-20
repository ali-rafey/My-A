import { listPublishedProjects } from '@/lib/content/projects';
import WorkDeck, { type DeckProject } from './WorkDeck';
import styles from './WorkShowcase.module.css';

// =============================================================================
// Work Showcase — the dedicated /our-work page.
// =============================================================================
// One screen, never a scroll: a masthead, a rule, and a deck of project plates
// that pages instead of growing. The deck (WorkDeck) is the client half; the
// masthead stays server-rendered so the page's copy is in the HTML.
//
// Every project comes from the Work manager in the admin (published rows in
// the `projects` table). There is no hardcoded portfolio behind this any more:
// with nothing published the page says so.
//
// The list at the foot is the whole portfolio in plain markup, visually
// hidden. The deck's off-screen pages are aria-hidden and its cards open a
// dialog, so this is what a screen reader and a crawler read — it carries the
// page's content, it is not decoration.
// =============================================================================

export default async function WorkShowcase() {
  const rows = await listPublishedProjects();

  const projects: DeckProject[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary ?? '',
    category: row.category ?? '',
    image: row.image_url,
    tags: row.tags ?? [],
    statusLabel: row.status_label ?? '',
    liveUrl: row.live_url,
  }));

  return (
    <section className={`${styles.section} section`} id="our-work">
      <div className={`container ${styles.container}`}>
        <header className={styles.masthead}>
          <h1 className={styles.title}>Our work</h1>
          <p className={styles.note}>
            Platforms we designed, built and shipped end to end &mdash; each one in
            production, carrying real users.
          </p>
        </header>

        {projects.length === 0 ? (
          <div className={styles.empty}>
            <p>The portfolio is being put together.</p>
            <p className={styles.emptyNote}>New work will appear here shortly.</p>
          </div>
        ) : (
          <WorkDeck projects={projects} />
        )}
      </div>

      {projects.length > 0 ? (
        <ul className={styles.srOnly}>
          {projects.map((project) => (
            <li key={project.id}>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
              <p>{project.tags.join(', ')}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
