import styles from './admin.module.css';

export default function AdminLoading() {
  return (
    <div className={`${styles.shell} ${styles.shellCentered}`}>
      <div className={styles.container}>
        <div className={styles.loadingWrap}>
          <div className="spinner" role="status" aria-label="Loading admin" />
        </div>
      </div>
    </div>
  );
}
