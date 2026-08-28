export type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  meta_description: string | null;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
  ip_address: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

export type BlogInput = {
  title: string;
  slug: string;
  content: string;
  cover_image?: string | null;
  meta_description?: string | null;
  tags?: string[];
  published: boolean;
};

// ---------------------------------------------------------------------------
// Outbound prospects
// ---------------------------------------------------------------------------
// A prospect is assembled from two halves: the immutable research record in data/prospects.csv
// (ProspectRecord) and the mutable pipeline state in public.prospect_status (ProspectStatusRow).
// Prospect is the merged shape the admin UI renders.

export type ProspectStatusValue =
  | 'new'
  | 'researching'
  | 'contacted'
  | 'replied'
  | 'call_booked'
  | 'won'
  | 'lost'
  | 'not_a_fit';

export const PROSPECT_STATUSES: ProspectStatusValue[] = [
  'new',
  'researching',
  'contacted',
  'replied',
  'call_booked',
  'won',
  'lost',
  'not_a_fit',
];

export const PROSPECT_STATUS_LABELS: Record<ProspectStatusValue, string> = {
  new: 'New',
  researching: 'Researching',
  contacted: 'Contacted',
  replied: 'Replied',
  call_booked: 'Call booked',
  won: 'Won',
  lost: 'Lost',
  not_a_fit: 'Not a fit',
};

export type ProspectRecord = {
  id: string;
  name: string;
  role: string;
  brand: string;
  brand_stage: 'pre_launch' | 'early_revenue' | 'established';
  product_category: string;
  country: string;
  market: string;
  signal_type: 'pre_launch_founder' | 'weak_store';
  signal_summary: string;
  signal_quote: string;
  signal_date: string;
  source_platform: string;
  source_url: string;
  website: string;
  tech_gaps: string[];
  needs_tech: boolean;
  needs_manufacturing: 'yes' | 'no' | 'unknown';
  contact_route: string;
  contact_value: string;
  // Social presence and phone. Sparse by design: small brands publish an email and an Instagram,
  // very rarely a phone number. Empty strings mean "not published", never "not looked for".
  instagram: string;
  linkedin: string;
  phone: string;
  // Year the brand started trading. The single most important filter for this list - an operator
  // six years in already has a supplier and a developer; someone who started last year has neither.
  founded_year: string;
  verified: boolean;
  verified_on: string;
  opt_out: boolean;
};

export type ProspectStatusRow = {
  prospect_id: string;
  status: ProspectStatusValue;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Prospect = ProspectRecord & {
  score: number;
  score_reasons: string[];
  status: ProspectStatusValue;
  notes: string | null;
  last_contacted_at: string | null;
};
