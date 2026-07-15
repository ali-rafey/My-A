import Link from 'next/link';
import { services } from '@/lib/content/static';
import EyesAnimation from './EyesAnimation';
import DataChartAnimation from './DataChartAnimation';
import ReachAnimation from './ReachAnimation';
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
//   3  Advertising & Marketing → ReachAnimation (signals propagating through a network)
// =============================================================================

const CARD_ANIMATIONS: Record<number, React.ReactNode> = {
  1: <EyesAnimation />,
  2: <DataChartAnimation />,
  3: <ReachAnimation />,
};

// Small line icons for each capability, rendered inside an accent chip so the
// capability list reads as a set of tidy "feature" rows instead of a plain
// numbered list. All share one set of stroke props; `currentColor` picks up the
// chip's accent colour. A neutral checkmark is the fallback for any unmapped
// capability name.
const ICON_PROPS = {
  width: 15,
  height: 15,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  'Web Development': (
    <svg {...ICON_PROPS}><path d="M6 4.5 2.5 8 6 11.5" /><path d="M10 4.5 13.5 8 10 11.5" /></svg>
  ),
  'Brand Identity': (
    <svg {...ICON_PROPS}><path d="M8 2.5 13.5 8 8 13.5 2.5 8Z" /></svg>
  ),
  'UX & Design': (
    <svg {...ICON_PROPS}><rect x="2.5" y="3" width="11" height="10" rx="1.5" /><path d="M2.5 6.5h11" /></svg>
  ),
  'Performance & SEO': (
    <svg {...ICON_PROPS}><path d="M3 12a5 5 0 0 1 10 0" /><path d="M8 12 10.5 8" /></svg>
  ),
  'Analytics Dashboards': (
    <svg {...ICON_PROPS}><path d="M3 13h10" /><path d="M5 13V9.5M8 13V6M11 13V8.5" /></svg>
  ),
  'Attribution Modeling': (
    <svg {...ICON_PROPS}><circle cx="4" cy="4" r="1.5" /><circle cx="12" cy="8" r="1.5" /><circle cx="4" cy="12" r="1.5" /><path d="M5.4 4.8 10.6 7.2M5.4 11.2 10.6 8.8" /></svg>
  ),
  'Conversion Tracking': (
    <svg {...ICON_PROPS}><path d="M3 4h10l-3.5 4.5v3l-3 1.5V8.5z" /></svg>
  ),
  'Reporting Systems': (
    <svg {...ICON_PROPS}><path d="M4 2.5h5l3 3v8H4z" /><path d="M9 2.5v3h3" /><path d="M6.2 9h3.6M6.2 11h3.6" /></svg>
  ),
  'Performance Media': (
    <svg {...ICON_PROPS}><path d="M3 6.5v3l6 2.5V4z" /><path d="M9 5.6c1.5.3 1.5 4.5 0 4.8" /></svg>
  ),
  'SEO Strategy': (
    <svg {...ICON_PROPS}><circle cx="7" cy="7" r="3.5" /><path d="M9.6 9.6 13 13" /></svg>
  ),
  'Content & Brand': (
    <svg {...ICON_PROPS}><path d="M10.3 3 13 5.7 6 12.7H3.3V10z" /></svg>
  ),
  'Growth Engineering': (
    <svg {...ICON_PROPS}><path d="M3 11 7 7l2.5 2.5L13 6" /><path d="M10.5 6H13v2.5" /></svg>
  ),
};

const FALLBACK_ICON = (
  <svg {...ICON_PROPS}><path d="M4 8.5 7 11l5-6" /></svg>
);

export default function Services() {
  return (
    <section className={`${styles.section} section`} id="services">
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>Services</span>
          </span>
          <h1 className={styles.title}>What We Build</h1>
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

                  <ol className={styles.capabilities}>
                    {service.capabilities.map((capability) => (
                      <li key={capability} className={styles.capability}>
                        <span className={styles.capabilityIcon} aria-hidden="true">
                          {CAPABILITY_ICONS[capability] ?? FALLBACK_ICON}
                        </span>
                        <span className={styles.capabilityName}>{capability}</span>
                      </li>
                    ))}
                  </ol>
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
