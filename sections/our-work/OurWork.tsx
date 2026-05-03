import { workProjects } from '@/lib/content/static';
import styles from './OurWork.module.css';

export default function OurWork() {
  return (
    <section className={`${styles.section} section`} id="our-work">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Our Work</span>
          <h2 className="sectionTitle">Delivery that shows up in the numbers</h2>
          <p className="sectionLead">
            Recent projects focused on revenue, efficiency, and better customer experiences.
          </p>
        </div>

        <div className={styles.grid}>
          {workProjects.map((project) => (
            <article key={project.id} className={styles.card}>
              <span className={styles.tag}>{project.tag}</span>
              <h3 className={styles.title}>{project.title}</h3>
              <p className={styles.text}>{project.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
