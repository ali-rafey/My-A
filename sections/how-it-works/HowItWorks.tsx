import { howItWorksSteps } from '@/lib/content/static';
import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  return (
    <section className={`${styles.section} section`} id="how-it-works">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">How It Works</span>
          <h2 className="sectionTitle">A simple process with clear outcomes</h2>
          <p className="sectionLead">
            We keep delivery direct and transparent so every stage moves the business forward.
          </p>
        </div>

        <div className={styles.grid}>
          {howItWorksSteps.map((step) => (
            <article key={step.number} className={styles.card}>
              <span className={styles.number}>{step.number}</span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.text}>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
