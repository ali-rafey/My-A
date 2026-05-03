import Link from 'next/link';
import styles from '../../status.module.css';

export default function BlogNotFound() {
  return (
    <div className={`${styles.wrap} container`}>
      <span className="eyebrow">404</span>
      <h1 className="sectionTitle">Post not found</h1>
      <p className="sectionLead">
        The blog post you&apos;re looking for has moved or is no longer published.
      </p>
      <div className={styles.actions}>
        <Link href="/blogs" className={styles.primary}>Back to blog</Link>
        <Link href="/" className={styles.secondary}>Home</Link>
      </div>
    </div>
  );
}
