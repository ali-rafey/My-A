import Link from 'next/link';
import { services } from '@/lib/content/static';
import styles from './Services.module.css';

// =============================================================================
// Services — three disciplines in a row.
// =============================================================================
// Editorial card grid: each service has a serial number stamp (01/02/03),
// a strong title, a short description, a thin divider, and a list of the
// concrete capabilities it includes. A small corner arrow indicates the
// card's hover affordance; the whole grid lives in a viewport-fitting
// section centred vertically. Footer CTA pushes interested visitors to
// /contact.
// =============================================================================

export default function Services() {
  return (
    <section className={`${styles.section} section`} id="services">
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>Services</span>
          </span>
          <h2 className={styles.title}>What We Build</h2>
          <p className={styles.subtitle}>Three disciplines, built to compound.</p>
        </header>

        <div className={styles.grid}>
          {services.map((service) => (
            <article key={service.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.serial}>{service.serial}</span>
                <span className={styles.cardArrow} aria-hidden="true">↗</span>
              </div>

              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardDescription}>{service.description}</p>

              <span className={styles.divider} aria-hidden="true" />

              <ul className={styles.capabilities}>
                {service.capabilities.map((capability) => (
                  <li key={capability} className={styles.capability}>
                    <span className={styles.capabilityArrow} aria-hidden="true">→</span>
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <footer className={styles.footer}>
          <span className={styles.footerLead}>Have something specific in mind?</span>
          <Link href="/contact" className={styles.footerCta}>
            <span>Start a Conversation</span>
            <span className={styles.footerArrow} aria-hidden="true">→</span>
          </Link>
        </footer>
      </div>
    </section>
  );
}
