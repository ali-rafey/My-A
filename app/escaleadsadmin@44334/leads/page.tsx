import { createServiceClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/format';
import type { Lead } from '@/lib/supabase/types';
import LeadRow from './LeadRow';
import ExportButton from './ExportButton';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

async function getLeads(): Promise<Lead[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('admin leads list failed:', error.message);
    return [];
  }
  return (data ?? []) as Lead[];
}

export default async function AdminLeadsPage() {
  const leads = await getLeads();
  const unread = leads.filter((lead) => !lead.read).length;
  const readCount = leads.length - unread;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Leads</h1>
          <p>{leads.length} total · {unread} unread</p>
        </div>
        <ExportButton />
      </div>

      {leads.length === 0 ? (
        <div className={styles.empty}>No leads yet. Submissions from the contact form will appear here.</div>
      ) : (
        <>
          <div className={styles.leadSummaryGrid}>
            <div className={`${styles.card} ${styles.leadSummaryCard}`}>
              <div className={styles.leadSummaryValue}>{leads.length}</div>
              <div className={styles.leadSummaryLabel}>Total leads</div>
            </div>
            <div className={`${styles.card} ${styles.leadSummaryCard}`}>
              <div className={styles.leadSummaryValue}>{unread}</div>
              <div className={styles.leadSummaryLabel}>Unread leads</div>
            </div>
            <div className={`${styles.card} ${styles.leadSummaryCard}`}>
              <div className={styles.leadSummaryValue}>{readCount}</div>
              <div className={styles.leadSummaryLabel}>Read leads</div>
            </div>
          </div>

          <div className={styles.leadList}>
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} formattedDate={formatDateTime(lead.created_at)} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
