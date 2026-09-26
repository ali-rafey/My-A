'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react';
import styles from './admin.module.css';

// Picks an image off the operator's machine, posts it to /api/admin/upload, and
// hands back the stored URL. Pasting a URL still works for images already
// hosted elsewhere — the field below the picker is the same value.
//
// A plain <img> rather than next/image: the preview is an admin-only thumbnail,
// and running arbitrary just-uploaded URLs through the optimiser buys nothing.

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export default function ImageUploader({ label, value, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      // Let the same file be chosen again after a failure.
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={styles.uploader}>
      <span className={styles.uploaderLabel}>{label}</span>

      <div className={styles.uploaderRow}>
        <div className={styles.uploaderThumb}>
          {value ? (
            <img src={value} alt="" />
          ) : (
            <span className={styles.uploaderEmpty}>No image</span>
          )}
        </div>

        <div className={styles.uploaderControls}>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className={styles.fileInput}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <div className={styles.uploaderButtons}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSmall}`}
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
            </button>
            {value ? (
              <button
                type="button"
                className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
                onClick={() => { onChange(''); setError(null); }}
                disabled={busy}
              >
                Remove
              </button>
            ) : null}
          </div>

          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={600}
            placeholder="…or paste an image URL"
          />
          <span className={styles.hint}>
            {hint ?? 'JPEG, PNG, GIF or WebP, up to 6MB.'}
          </span>
          {error ? <span className={`${styles.error} ${styles.inlineError}`} role="alert">{error}</span> : null}
        </div>
      </div>
    </div>
  );
}
