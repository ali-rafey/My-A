import { useEffect, useState } from 'react';
import styles from './Blogs.module.css';

type Blog = {
  id: number;
  title: string;
  date: string;
  summary: string;
};

type BlogsState =
  | { status: 'loading'; blogs: Blog[]; error: null }
  | { status: 'error'; blogs: Blog[]; error: string }
  | { status: 'success'; blogs: Blog[]; error: null };

export default function Blogs() {
  const [state, setState] = useState<BlogsState>({
    status: 'loading',
    blogs: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadBlogs = async (): Promise<void> => {
      try {
        const response = await fetch('/api/blogs', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load blogs.');
        }

        const data: Blog[] = await response.json();
        setState({ status: 'success', blogs: data, error: null });
      } catch (error: unknown) {
        if ((error as DOMException).name === 'AbortError') {
          return;
        }
        setState({
          status: 'error',
          blogs: [],
          error: error instanceof Error ? error.message : 'Something went wrong.',
        });
      }
    };

    void loadBlogs();

    return () => controller.abort();
  }, []);

  return (
    <section className={`${styles.section} section`} id="blogs">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Blogs</span>
          <h2 className="sectionTitle">Ideas, systems, and growth insights</h2>
          <p className="sectionLead">
            Practical thinking from the work we do every day across product, engineering, and automation.
          </p>
        </div>

        {state.status === 'loading' ? (
          <div className={styles.state}>
            <div className="spinner" aria-label="Loading blogs" />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="statusBox" role="alert">{state.error}</div>
        ) : null}

        {state.status === 'success' ? (
          <div className={styles.grid}>
            {state.blogs.map((blog) => (
              <article key={blog.id} className={styles.card}>
                <span className={styles.date}>{blog.date}</span>
                <h3 className={styles.title}>{blog.title}</h3>
                <p className={styles.text}>{blog.summary}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
