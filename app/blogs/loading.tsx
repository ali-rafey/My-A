import styles from './blogs.module.css';

// Loading state for /blogs while the server fetch resolves.
// Renders the same header + grid shape as the real page so the
// transition into the loaded content reads as a content swap,
// not a layout shift. No animation — static skeleton cards.

export default function BlogsLoading() {
  return (
    <section className={`${styles.section} section`}>
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>Blog</span>
          </span>
          <h1 className={styles.title}>Ideas, systems, and growth insights.</h1>
          <p className={styles.subtitle}>
            Practical thinking from the work we do every day.
          </p>
        </header>

        {/* Static skeleton placeholders — no animation. Three cards matching
            the real grid layout. */}
        <div className={styles.grid} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    </section>
  );
}
