import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import AdminTopbar from './AdminTopbar';
import styles from './admin.module.css';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createServiceClient();
  const [blogsRes, leadsRes, unreadRes, draftRes] = await Promise.all([
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('read', false),
    supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('published', false),
  ]);
  return {
    blogs: blogsRes.count ?? 0,
    leads: leadsRes.count ?? 0,
    unread: unreadRes.count ?? 0,
    drafts: draftRes.count ?? 0,
  };
}

export default async function AdminRootPage() {
  const session = await getAdminSession();

  if (!session.isAdmin) {
    return (
      <div className={`${styles.shell} ${styles.shellCentered}`}>
        <LoginForm />
      </div>
    );
  }

  const stats = await getStats().catch(() => ({ blogs: 0, leads: 0, unread: 0, drafts: 0 }));

  return (
    <div className={styles.shell}>
      <AdminTopbar />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {session.username}.</p>
          </div>
        </div>

        <div className={styles.cardGrid}>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.statValue}>{stats.blogs}</div>
            <div className={styles.statLabel}>Total blog posts</div>
          </div>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.statValue}>{stats.drafts}</div>
            <div className={styles.statLabel}>Drafts</div>
          </div>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.statValue}>{stats.leads}</div>
            <div className={styles.statLabel}>Total leads</div>
          </div>
          <div className={`${styles.card} ${styles.statCard}`}>
            <div className={styles.statValue}>{stats.unread}</div>
            <div className={styles.statLabel}>Unread leads</div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionHeading}>Quick links</h2>
          <div className={styles.formActions}>
            <Link className={styles.button} href="/escaleadsadmin@44334/blogs/new">
              Write a new post
            </Link>
            <Link className={`${styles.button} ${styles.buttonGhost}`} href="/escaleadsadmin@44334/blogs">
              Manage blogs
            </Link>
            <Link className={`${styles.button} ${styles.buttonGhost}`} href="/escaleadsadmin@44334/leads">
              Review leads
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
