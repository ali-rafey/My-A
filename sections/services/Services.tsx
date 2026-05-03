import { services } from '@/lib/content/static';
import styles from './Services.module.css';

export default function Services() {
  return (
    <section className={`${styles.section} section`} id="services">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Services</span>
          <h2 className="sectionTitle">Software built for real growth</h2>
          <p className="sectionLead">
            We design and deliver products that help teams ship faster, automate smarter, and scale with confidence.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((service) => (
            <article key={service.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardText}>{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
