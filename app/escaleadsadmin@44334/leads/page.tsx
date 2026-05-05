import { createServiceClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/format';
import type { Lead } from '@/lib/supabase/types';
import AdminTopbar from '../AdminTopbar';
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

  return (
    <div className={styles.shell}>
      <AdminTopbar />
      <div className={styles.container}>
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
          <div className={`${styles.card} ${styles.tableCard}`}>
            <table className={`${styles.table} ${styles.tableWide}`}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Location</th>
                  <th>IP</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} formattedDate={formatDateTime(lead.created_at)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
