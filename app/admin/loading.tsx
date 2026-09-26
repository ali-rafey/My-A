import styles from './admin.module.css';

// Rendered inside the persistent admin layout while a child route is loading. Layout already
// provides the sidebar + container, so this just fills the content slot.
export default function AdminLoading() {
  return (
    <div className={styles.loadingWrap}>
      <div className="spinner" role="status" aria-label="Loading admin" />
    </div>
  );
}
