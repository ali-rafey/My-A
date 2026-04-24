import { useEffect, useState } from 'react';
import styles from './OurWork.module.css';

type WorkProject = {
  id: number;
  title: string;
  description: string;
  tag: string;
};

type WorkState =
  | { status: 'loading'; projects: WorkProject[]; error: null }
  | { status: 'error'; projects: WorkProject[]; error: string }
  | { status: 'success'; projects: WorkProject[]; error: null };

export default function OurWork() {
  const [state, setState] = useState<WorkState>({
    status: 'loading',
    projects: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadWork = async (): Promise<void> => {
      try {
        const response = await fetch('/api/work', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load work.');
        }

        const data: WorkProject[] = await response.json();
        setState({ status: 'success', projects: data, error: null });
      } catch (error: unknown) {
        if ((error as DOMException).name === 'AbortError') {
          return;
        }
        setState({
          status: 'error',
          projects: [],
          error: error instanceof Error ? error.message : 'Something went wrong.',
        });
      }
    };

    void loadWork();

    return () => controller.abort();
  }, []);

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

        {state.status === 'loading' ? (
          <div className={styles.state}>
            <div className="spinner" aria-label="Loading work" />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="statusBox" role="alert">{state.error}</div>
        ) : null}

        {state.status === 'success' ? (
          <div className={styles.grid}>
            {state.projects.map((project) => (
              <article key={project.id} className={styles.card}>
                <span className={styles.tag}>{project.tag}</span>
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.text}>{project.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
