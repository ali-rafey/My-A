'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `${response.status} ${response.statusText}`;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

export default function DeleteBlogButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await readError(response));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${styles.buttonDanger}`}
        onClick={handleDelete}
        disabled={busy}
        title={error ?? undefined}
      >
        {busy ? 'Deleting…' : 'Delete'}
      </button>
      {error ? <span className={`${styles.error} ${styles.inlineError}`} role="alert">{error}</span> : null}
    </>
  );
}
