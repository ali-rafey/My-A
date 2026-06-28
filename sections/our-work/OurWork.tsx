import Link from 'next/link';
import { workProjects } from '@/lib/content/static';
import styles from './OurWork.module.css';

// =============================================================================
// Our Work — portfolio index.
// =============================================================================
// Clean white page, left-aligned editorial header (eyebrow pill + Playfair
// italic title, matching the Services section), then hairline-divided rows.
// Each project is a row with a big muted index number that lights up on hover,
// the body sliding slightly right, a soft accent wash sweeping in, and a
// trailing arrow that draws toward the edge. Footer CTA points at /contact.
// =============================================================================

export default function OurWork() {
  return (
    <section className={`${styles.section} section`} id="our-work">
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>Our Work</span>
          </span>
          <h2 className={styles.title}>Delivery that shows up in the numbers</h2>
          <p className={styles.lead}>
            Recent projects focused on revenue, efficiency, and better customer experiences.
          </p>
        </header>

        <ol className={styles.list}>
          {workProjects.map((project, i) => (
            <li
              key={project.id}
              className={styles.row}
              style={{ '--row-index': i } as React.CSSProperties}
            >
              <span className={styles.index} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className={styles.body}>
                <span className={styles.tag}>{project.tag}</span>
                <h3 className={styles.rowTitle}>{project.title}</h3>
                <p className={styles.rowText}>{project.description}</p>
              </div>

              <span className={styles.arrow} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M6 16L16 6M16 6H8M16 6V14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </li>
          ))}
        </ol>

        <footer className={styles.footer}>
          <span className={styles.footerLead}>Have a project in mind?</span>
          <Link href="/contact" className={styles.footerCta}>
            <span>Start a Conversation</span>
            <span className={styles.footerArrow} aria-hidden="true">→</span>
          </Link>
        </footer>
      </div>
    </section>
  );
}
