import RotatingWord from './RotatingWord';
import ProcessCurve from '../process-curve/ProcessCurve';
import styles from './Home.module.css';

// Marquee items at the bottom of the hero. Slow horizontal scroll, dot-separated.
// The list is rendered twice in the DOM so the CSS keyframe can translate -50%
// and loop seamlessly.
const MARQUEE_ITEMS = [
  'Software Engineering',
  'Mobile Applications',
  'AI & Automation',
  'E-commerce Platforms',
  'SaaS Products',
  'Brand Systems',
  'CRM Dashboards',
  'API Integrations',
  'Growth Strategy',
  'Performance UX',
] as const;

export default function Home() {
  return (
    <section className={`${styles.section} section`} id="home">
      {/* Decorative background layers — all aria-hidden. From back to front:
          1. base white→soft gradient is on `.section` itself
          2. aurora — soft blurred radial in the accent blue, top-right, drifts
          3. grid — faint orthogonal lines, masked to fade out toward edges
          4. noise — SVG fractal noise overlay for film-grain texture */}
      <div className={styles.bgWrap} aria-hidden="true">
        <div className={styles.aurora} />
        <div className={styles.grid} />
        <div className={styles.noise} />
      </div>

      <div className="container">
        {/* Two-column layout: copy on the left, process curve on the right.
            Stacks to a single column under 1024px so the headline always reads. */}
        <div className={styles.heroGrid}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              Available for projects · 2026
            </span>

            <h1 className={styles.headline}>
              <span className={styles.headlineLine}>We Escalate Your Leads</span>
              <span className={styles.headlineLine}>
                Into <RotatingWord />
              </span>
            </h1>

            <p className={styles.lead}>
              Your Business Deserves More Than Just Growth, It Deserves a Legacy
            </p>

            <div className={styles.actions}>
              <a href="#contact" className={styles.primaryBtn}>
                <span>Start a project</span>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </a>
              <a href="#our-work" className={styles.ghostBtn}>
                See our work
              </a>
            </div>
          </div>

          <div className={styles.curveSlot}>
            <ProcessCurve />
          </div>
        </div>
      </div>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {/* Two copies of the list. CSS animates the track by -50% so the
              cut-point lands exactly between identical halves — seamless loop. */}
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className={styles.marqueeItem}>
              <span className={styles.marqueeDot} aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
