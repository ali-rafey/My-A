'use client';

import styles from '../admin.module.css';

export default function ExportButton() {
  return (
    <a
      className={styles.button}
      href="/api/admin/leads/export"
      download
    >
      Export CSV
    </a>
  );
}
