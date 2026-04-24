import styles from './Home.module.css';

export default function Home() {
  return (
    <section className={`${styles.section} section`} id="home">
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.copy}>
            <span className="eyebrow">Software Solutions for Global Business Growth</span>
            <h1 className="sectionTitle">
              We Help Businesses Grow Faster
            </h1>
            <p className="sectionLead">
              Your trusted partner for software solutions worldwide.
            </p>
            <div className={styles.actions}>
              <a className={styles.primary} href="#services">
                Get Started
              </a>
              <a className={styles.secondary} href="#how-it-works">
                Learn More
              </a>
            </div>
          </div>

          <div className={styles.panel} aria-hidden="true">
            <div className={styles.panelCard}>
              <span className={styles.panelLabel}>Trusted by</span>
              <strong className={styles.panelValue}>30+ brands</strong>
              <span className={styles.panelText}>Modern systems for growth, automation, and delivery.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
