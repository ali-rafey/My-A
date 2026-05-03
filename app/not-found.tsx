import Link from 'next/link';
import styles from './status.module.css';

export default function NotFound() {
  return (
    <div className={`${styles.wrap} container`}>
      <span className="eyebrow">404</span>
      <h1 className="sectionTitle">Page not found</h1>
      <p className="sectionLead">
        The page you&apos;re looking for has moved or never existed.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>Back to home</Link>
        <Link href="/blogs" className={styles.secondary}>Read the blog</Link>
      </div>
    </div>
  );
}
