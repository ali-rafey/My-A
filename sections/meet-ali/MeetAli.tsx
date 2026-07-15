import Link from 'next/link';
import PortalLauncher from './PortalLauncher';
import ChatBot from './ChatBot';
import styles from './MeetAli.module.css';

// =============================================================================
// Meet Ali — personal portfolio SPA.
// =============================================================================
// A self-contained single-page portfolio, designed to be lifted out to its own
// subdomain later: everything it needs lives in sections/meet-ali/ +
// app/meet-ali/ + public/pinch-portal/. Dark "personal lab" aesthetic — deep
// ink canvas, warm ivory type, Playfair italic display, and the Pinch Portal's
// signature green as the single accent.
//
// Server component; the only client islands are PortalLauncher (camera/hand
// tracking) and ChatBot (message state) per CLAUDE.md §6.14.
//
// All personal copy below is PLACEHOLDER — Ali swaps in his real education,
// hobbies, and bio when ready.
// =============================================================================

const EDUCATION = [
  {
    period: '20XX — 20XX',
    title: 'BS Computer Science',
    place: 'Your University, City',
    note: 'Placeholder — final degree, thesis, or honors line goes here.',
  },
  {
    period: '20XX',
    title: 'Certification / Diploma',
    place: 'Institute or Platform',
    note: 'Placeholder — a certification or program worth naming.',
  },
] as const;

const HOBBIES = [
  'Computer vision',
  'Building AI agents',
  'Automation',
  'Cricket',
  'Photography',
  'Reading',
] as const;

const LOVES = [
  {
    title: 'Making machines see',
    text: 'Hand tracking, gesture interfaces, and the strange joy of a computer that watches back.',
  },
  {
    title: 'Shipping real products',
    text: 'From idea to deployed URL — the full arc, not just the demo.',
  },
  {
    title: 'Systems that compound',
    text: 'Automations and agents that keep working while I sleep.',
  },
] as const;

export default function MeetAli() {
  return (
    <div className={styles.page}>
      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <header className={styles.masthead}>
        <span className={styles.wordmark}>
          <span className={styles.wordmarkDot} aria-hidden="true" />
          ali
        </span>
        <nav className={styles.mastNav} aria-label="Portfolio sections">
          <a href="#about">About</a>
          <a href="#lab">Lab</a>
          <a href="#chat">Chat</a>
        </nav>
        <Link href="/" className={styles.mastBack}>
          <span aria-hidden="true">←</span>
          <span>EscaLeads</span>
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Portfolio · Personal Lab</p>
        <h1 className={styles.heroTitle}>
          I&rsquo;m <em>Ali.</em>
        </h1>
        <p className={styles.heroLede}>
          I build software that responds to people — web platforms by day, computer-vision
          experiments by night. This page is my corner of the internet: who I am, what I love,
          and a few things you can play with.
        </p>
        <div className={styles.heroCue} aria-hidden="true">
          <span className={styles.heroCueLine} />
          <span>scroll</span>
        </div>
      </section>

      {/* ── About / Education ────────────────────────────────────────────── */}
      <section id="about" className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionIndex}>01</span>
          <h2 className={styles.sectionTitle}>
            Education <em>&amp; qualification</em>
          </h2>
        </div>

        <ol className={styles.eduList}>
          {EDUCATION.map((e) => (
            <li key={e.title} className={styles.eduRow}>
              <span className={styles.eduPeriod}>{e.period}</span>
              <div className={styles.eduBody}>
                <h3 className={styles.eduTitle}>{e.title}</h3>
                <p className={styles.eduPlace}>{e.place}</p>
                <p className={styles.eduNote}>{e.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Hobbies / Loves ──────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionIndex}>02</span>
          <h2 className={styles.sectionTitle}>
            Hobbies <em>&amp; what I love</em>
          </h2>
        </div>

        <ul className={styles.hobbyRow} aria-label="Hobbies">
          {HOBBIES.map((h) => (
            <li key={h} className={styles.hobbyChip}>
              {h}
            </li>
          ))}
        </ul>

        <div className={styles.loveGrid}>
          {LOVES.map((l) => (
            <article key={l.title} className={styles.loveCard}>
              <h3 className={styles.loveTitle}>{l.title}</h3>
              <p className={styles.loveText}>{l.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Interactive lab: Pinch Portal + Chatbot windows ──────────────── */}
      <section id="lab" className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionIndex}>03</span>
          <h2 className={styles.sectionTitle}>
            The <em>lab</em>
          </h2>
        </div>
        <p className={styles.sectionLede}>
          Two live experiments. The portal tracks your hands through the camera — pinch both
          and stretch the space between them. The assistant answers for me when I&rsquo;m away.
        </p>

        <div className={styles.windowGrid}>
          <PortalLauncher />
          <div id="chat">
            <ChatBot />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <span className={styles.footerNote}>Built by Ali · running in your browser</span>
        <Link href="/" className={styles.footerBack}>
          <span aria-hidden="true">←</span>
          <span>Back to EscaLeads</span>
        </Link>
      </footer>
    </div>
  );
}
