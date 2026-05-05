'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Blog } from '@/lib/supabase/types';
import styles from '../admin.module.css';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial?: Blog;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export default function BlogEditor({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [content, setContent] = useState(initial?.content ?? '');
  const [coverImage, setCoverImage] = useState(initial?.cover_image ?? '');
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? '');
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '));
  const [published, setPublished] = useState(initial?.published ?? false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug: slug || slugify(title),
      content,
      cover_image: coverImage || null,
      meta_description: metaDescription || null,
      tags,
      published,
    };

    try {
      const url = mode === 'create' ? '/api/admin/blogs' : `/api/admin/blogs/${initial!.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; blog?: Blog };
      if (!response.ok) throw new Error(data.error || 'Save failed');

      setSuccess(mode === 'create' ? 'Post created.' : 'Post updated.');
      if (mode === 'create' && data.blog) {
        router.push(`/escaleadsadmin@44334/blogs/${data.blog.id}/edit`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={`${styles.formGrid} ${styles.editorGrid}`} onSubmit={handleSubmit}>
      <div className={`${styles.formRow} ${styles.formRowFull}`}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          maxLength={200}
          placeholder="How software systems unlock faster growth"
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(slugify(e.target.value));
            setSlugTouched(true);
          }}
          required
          maxLength={80}
          placeholder="how-software-unlocks-growth"
        />
        <span className={styles.hint}>
          URL: /blogs/<code>{slug || 'your-slug'}</code>
        </span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="metaDescription">Meta description (SEO)</label>
        <input
          id="metaDescription"
          type="text"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          maxLength={300}
          placeholder="A 1-2 sentence summary that appears in search results."
        />
        <span className={styles.hint}>{metaDescription.length}/300 characters</span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="coverImage">Cover image URL</label>
        <input
          id="coverImage"
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          maxLength={500}
          placeholder="https://images.example.com/cover.jpg"
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="growth, automation, product"
        />
      </div>

      <div className={`${styles.formRow} ${styles.formRowFull}`}>
        <div className={styles.fieldHeader}>
          <label htmlFor="content">Content (HTML)</label>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
            onClick={() => setShowPreview((p) => !p)}
          >
            {showPreview ? 'Hide preview' : 'Preview'}
          </button>
        </div>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder={`<p>Your post in HTML.</p>\n<h2>A heading</h2>\n<p>Allowed tags: p, h1-h6, ul, ol, li, blockquote, pre, code, img, a, strong, em, hr, figure.</p>`}
        />
        <span className={styles.hint}>
          Content is sanitized server-side. Allowed tags: p, h1–h6, ul/ol/li, a, img, strong, em, blockquote, pre, code, hr, figure.
        </span>
        {showPreview ? (
          <div className={styles.preview} dangerouslySetInnerHTML={{ __html: content }} />
        ) : null}
      </div>

      <div className={styles.toggleRow}>
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <label htmlFor="published">Published (visible on /blogs)</label>
      </div>

      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      {success ? <div className={styles.success} role="status">{success}</div> : null}

      <div className={styles.formActions}>
        <button type="submit" className={styles.button} disabled={busy}>
          {busy ? 'Saving…' : mode === 'create' ? 'Create post' : 'Save changes'}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonGhost}`}
          onClick={() => router.push('/escaleadsadmin@44334/blogs')}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
