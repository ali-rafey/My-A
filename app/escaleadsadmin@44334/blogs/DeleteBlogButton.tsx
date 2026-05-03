'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function DeleteBlogButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${styles.buttonDanger}`}
      onClick={handleDelete}
      disabled={busy}
    >
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
}
