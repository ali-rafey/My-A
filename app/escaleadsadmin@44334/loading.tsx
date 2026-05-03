import styles from './admin.module.css';

export default function AdminLoading() {
  return (
    <div className={styles.shell}>
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div className="spinner" role="status" aria-label="Loading admin" />
        </div>
      </div>
    </div>
  );
}
