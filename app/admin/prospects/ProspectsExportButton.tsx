'use client';

import styles from '../admin.module.css';

export default function ProspectsExportButton() {
  return (
    <a className={styles.button} href="/api/admin/prospects/export" download>
      Export CSV
    </a>
  );
}
