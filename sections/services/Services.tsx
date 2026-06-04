import Link from 'next/link';
import { services } from '@/lib/content/static';
import EyesAnimation from './EyesAnimation';
import DataChartAnimation from './DataChartAnimation';
import TargetArrowAnimation from './TargetArrowAnimation';
import styles from './Services.module.css';

// =============================================================================
// Services — three corner-tab cards in a row.
// =============================================================================
// Each card carries a navy "corner tab" label at the top-left (sharing the
// card's outer top-left curve and tapering with a smaller inner radius on
// the bottom-right). Beneath the tab area: a poster-style headline, a
// description, a hairline divider, and a list of concrete capabilities.
// Footer CTA points at /contact.
//
// Each card also carries a context-specific animation in the .cardArt slot
// above the body. Maps by service id:
//   1  Digital Presence       → EyesAnimation (eyes that fall in love)
//   2  Data Analytics         → DataChartAnimation (bars + trendline + arrow)
//   3  Advertising & Marketing → TargetArrowAnimation (arrow hitting target + ripples)
// =============================================================================

const CARD_ANIMATIONS: Record<number, React.ReactNode> = {
  1: <EyesAnimation />,
  2: <DataChartAnimation />,
  3: <TargetArrowAnimation />,
};

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
          {services.map((service) => {
            const art = CARD_ANIMATIONS[service.id];
            return (
              <article key={service.id} className={styles.card}>
                <div className={styles.tag}>
                  <span>{service.title}</span>
                </div>

                {/* Per-card SVG animation. Absolutely-positioned slot at the
                    top-centre of the card so the corner tag at top-left and
                    the card body below both keep their layout. */}
                {art ? <div className={styles.cardArt}>{art}</div> : null}

                <div className={styles.cardBody}>
                  <h3 className={styles.cardHeadline}>{service.headline}</h3>
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
                </div>
              </article>
            );
          })}
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
