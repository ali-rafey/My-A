import RotatingWord from './RotatingWord';
import styles from './Home.module.css';

export default function Home() {
  return (
    <section className={`${styles.section} section`} id="home">
      {/* Faint graph-paper backdrop. Decorative — hidden from a11y tree.
          Two nested divs: outer carries the top/bottom fade, inner carries
          the left-side fade + the grid lines. We split them this way because
          `mask-composite: intersect` is not reliably honored across browsers
          when stacking masks on a single element. */}
      <div className={styles.gridFrame} aria-hidden="true">
        <div className={styles.grid} />
      </div>

      <div className="container">
        <div className={styles.copy}>
          <h1 className={styles.headline}>
            <span className={styles.headlineLine}>We Escalate Your Leads</span>
            <span className={styles.headlineLine}>
              Into <RotatingWord />
            </span>
          </h1>

          <p className={styles.lead}>
            Your Business Deserves More Than Just Growth, It Deserves a Legacy
          </p>
        </div>
      </div>
    </section>
  );
}
