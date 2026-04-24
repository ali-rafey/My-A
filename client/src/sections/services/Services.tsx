import { useEffect, useState } from 'react';
import styles from './Services.module.css';

type Service = {
  id: number;
  title: string;
  description: string;
};

type ServiceState =
  | { status: 'loading'; services: Service[]; error: null }
  | { status: 'error'; services: Service[]; error: string }
  | { status: 'success'; services: Service[]; error: null };

export default function Services() {
  const [state, setState] = useState<ServiceState>({
    status: 'loading',
    services: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadServices = async (): Promise<void> => {
      try {
        const response = await fetch('/api/services', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load services.');
        }

        const data: Service[] = await response.json();
        setState({ status: 'success', services: data, error: null });
      } catch (error: unknown) {
        if ((error as DOMException).name === 'AbortError') {
          return;
        }
        setState({
          status: 'error',
          services: [],
          error: error instanceof Error ? error.message : 'Something went wrong.',
        });
      }
    };

    void loadServices();

    return () => controller.abort();
  }, []);

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

        {state.status === 'loading' ? (
          <div className={styles.state}>
            <div className="spinner" aria-label="Loading services" />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="statusBox" role="alert">{state.error}</div>
        ) : null}

        {state.status === 'success' ? (
          <div className={styles.grid}>
            {state.services.map((service) => (
              <article key={service.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardText}>{service.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
