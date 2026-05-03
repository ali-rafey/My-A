import styles from './blogs.module.css';

export default function BlogsLoading() {
  return (
    <div className={`${styles.page} container`}>
      <header className={styles.header}>
        <span className="eyebrow">Blog</span>
        <h1 className="sectionTitle">Loading posts…</h1>
      </header>
      <div className={styles.grid} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={styles.card}
            style={{
              minHeight: 320,
              background: 'linear-gradient(90deg, #F2F4F7 25%, #E8F0FF 37%, #F2F4F7 63%)',
              backgroundSize: '400% 100%',
              animation: 'spin 1.4s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    </div>
  );
}
