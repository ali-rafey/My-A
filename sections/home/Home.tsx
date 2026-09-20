import Film from './film/Film';
import styles from './Home.module.css';

// Home hero — the EscaLeads film. See ./film/Film.tsx for how it runs and
// ./film/scenes.tsx for the story, scene by scene.
export default function Home() {
  return (
    <section className={styles.section} id="home">
      <Film />
    </section>
  );
}
