'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/supabase/types';
import ImageUploader from '../ImageUploader';
import styles from '../admin.module.css';

type Mode = 'create' | 'edit';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export default function ProjectEditor({ mode, initial }: { mode: Mode; initial?: Project }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
  const [liveUrl, setLiveUrl] = useState(initial?.live_url ?? '');
  const [statusLabel, setStatusLabel] = useState(initial?.status_label ?? 'Live');
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '));
  const [published, setPublished] = useState(initial?.published ?? false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    const payload = {
      title,
      slug: slug || slugify(title),
      summary: summary || null,
      category: category || null,
      image_url: imageUrl || null,
      live_url: liveUrl || null,
      status_label: statusLabel || 'Live',
      sort_order: Number(sortOrder) || 0,
      tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
      published,
    };

    try {
      const url = mode === 'create' ? '/api/admin/projects' : `/api/admin/projects/${initial!.id}`;
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; project?: Project };
      if (!response.ok) throw new Error(data.error || 'Save failed');

      setSuccess(mode === 'create' ? 'Project created.' : 'Project updated.');
      if (mode === 'create' && data.project) {
        router.push(`/escaleadsadmin@44334/projects/${data.project.id}/edit`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={`${styles.formGrid} ${styles.editorGrid}`} onSubmit={handleSubmit}>
      <div className={`${styles.formRow} ${styles.formRowFull}`}>
        <label htmlFor="title">Project name</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          maxLength={120}
          placeholder="MedHealix"
        />
        <span className={styles.hint}>Shown under the image on /our-work, in capitals.</span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
          required
          maxLength={80}
          placeholder="medhealix"
        />
        <span className={styles.hint}>Internal identifier. Must be unique.</span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="category">Category</label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          maxLength={40}
          placeholder="HealthTech"
        />
        <span className={styles.hint}>The chip in the corner of the image.</span>
      </div>

      <div className={`${styles.formRow} ${styles.formRowFull}`}>
        <ImageUploader
          label="Project image"
          value={imageUrl}
          onChange={setImageUrl}
          hint="The card is a wide landscape — a screenshot around 1200 × 800 works best. JPEG, PNG, GIF or WebP, up to 6MB."
        />
      </div>

      <div className={`${styles.formRow} ${styles.formRowFull}`}>
        <label htmlFor="summary">Write-up</label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={1200}
          placeholder="What it is, what you built, and what it does for the client. Shown when a visitor opens the card."
        />
        <span className={styles.hint}>{summary.length}/1200 characters</span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="HIPAA, Azure, Enterprise"
        />
        <span className={styles.hint}>Up to 8. Shown in the write-up.</span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="liveUrl">Live URL (optional)</label>
        <input
          id="liveUrl"
          type="url"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          maxLength={600}
          placeholder="https://client.example.com"
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="statusLabel">Status label</label>
        <input
          id="statusLabel"
          type="text"
          value={statusLabel}
          onChange={(e) => setStatusLabel(e.target.value)}
          maxLength={40}
          placeholder="Live"
        />
        <span className={styles.hint}>The small line above the name.</span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="sortOrder">Order</label>
        <input
          id="sortOrder"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          step={1}
        />
        <span className={styles.hint}>Lower numbers come first.</span>
      </div>

      <div className={styles.toggleRow}>
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <label htmlFor="published">Published (visible on /our-work)</label>
      </div>

      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      {success ? <div className={styles.success} role="status">{success}</div> : null}

      <div className={styles.formActions}>
        <button type="submit" className={styles.button} disabled={busy}>
          {busy ? 'Saving…' : mode === 'create' ? 'Create project' : 'Save changes'}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonGhost}`}
          onClick={() => router.push('/escaleadsadmin@44334/projects')}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
