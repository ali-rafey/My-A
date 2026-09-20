import styles from './blogs.module.css';

// Loading state for /blogs while the server fetch resolves. It holds the same
// one-screen shape as the real listing — masthead, bar, deck — so the swap
// into content reads as a fill, not a jump. No animation beyond the shimmer.

export default function BlogsLoading() {
  return (
    <section className={`${styles.section} section`}>
      <div className={`container ${styles.container}`}>
        <header className={styles.masthead}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>Our blog</span>
          </span>
          <h1 className={styles.title}>Latest thinking from the team.</h1>
          <p className={styles.subtitle}>
            Practical notes on design, engineering and growth &mdash; from the work
            we do every day.
          </p>
        </header>

        <div className={styles.skeletonDeck} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    </section>
  );
}
