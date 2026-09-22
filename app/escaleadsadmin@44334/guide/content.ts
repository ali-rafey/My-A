// The Admin Guide's content, kept apart from its layout so it can be edited
// without touching a component. Each category follows the same shape, so the
// page reads the same way four times over: where you are, the path from here
// to scaled, the stack, the repeatable process, and what to do this month.
//
// `icon` paths point into /public/guide/icons. A tool without one renders as a
// lettered tile; drop a logo file in that folder and set `icon` to swap it in.

export type Tool = {
  name: string;
  role: string;
  icon?: string;
  /** Letters for the tile when there is no icon file. */
  mono?: string;
  /** Tile tint for the lettered version. */
  tint?: string;
  /** Already part of how you work today. */
  inUse?: boolean;
};

export type StackGroup = { label: string; tools: Tool[] };

export type Category = {
  id: 'software' | 'research' | 'marketing' | 'automation';
  label: string;
  short: string;
  accent: string;
  /** 1 Starter · 2 Capable · 3 Solid · 4 Scaled · 5 Leading */
  level: 1 | 2 | 3 | 4 | 5;
  definition: string;
  nextMove: string;
  now: string[];
  next: string[];
  scaled: string[];
  stack: StackGroup[];
  flow: string[];
  month: string[];
  stop: string;
  start: string;
};

export const LEVELS = ['Starter', 'Capable', 'Solid', 'Scaled', 'Leading'] as const;

const I = (file: string) => `/guide/icons/${file}`;

export const CATEGORIES: Category[] = [
  {
    id: 'software',
    label: 'Software development',
    short: 'Software',
    accent: '#2563EB',
    level: 3,
    definition: 'Websites, stores, and the business software behind them.',
    nextMove: 'Turn your admin portal into a reusable starter.',
    now: ['Shopify storefronts', 'React & Next.js sites', 'Custom admin portals', 'Each build starts from scratch'],
    next: [
      'One starter repo: auth, admin, CMS, forms',
      'Shared component library',
      'Three fixed-price packages',
      'Error monitoring on every live site',
      'Preview link for every change',
    ],
    scaled: [
      'Productised packages with set timelines',
      'Starter kit halves build time',
      'Monthly care retainers',
      'Automated tests on every push',
      'Written handover for every client',
    ],
    stack: [
      {
        label: 'Build',
        tools: [
          { name: 'Next.js', role: 'Sites & web apps', icon: I('nextjs.webp'), inUse: true },
          { name: 'React', role: 'Interface', mono: 'Re', tint: '#0EA5E9', inUse: true },
          { name: 'TypeScript', role: 'Fewer bugs', mono: 'TS', tint: '#2563EB' },
          { name: 'Shopify', role: 'E-commerce', icon: I('shopify-96.png'), inUse: true },
        ],
      },
      {
        label: 'Data & money',
        tools: [
          { name: 'Supabase', role: 'Database & auth', icon: I('supabase.webp'), inUse: true },
          { name: 'Stripe', role: 'Payments', mono: 'St', tint: '#6366F1' },
        ],
      },
      {
        label: 'Ship',
        tools: [
          { name: 'GitHub', role: 'Code & reviews', icon: I('github.webp'), inUse: true },
          { name: 'Vercel', role: 'Hosting & previews', mono: 'Ve', tint: '#0F172A', inUse: true },
          { name: 'GitHub Actions', role: 'Checks on push', mono: 'GA', tint: '#334155' },
        ],
      },
      {
        label: 'Quality',
        tools: [
          { name: 'Playwright', role: 'End-to-end tests', mono: 'Pw', tint: '#16A34A' },
          { name: 'Sentry', role: 'Error alerts', mono: 'Se', tint: '#7C3AED' },
        ],
      },
      {
        label: 'Plan & design',
        tools: [
          { name: 'Figma', role: 'Design & handoff', icon: I('figma.webp') },
          { name: 'Notion', role: 'Briefs & docs', icon: I('notion.webp') },
        ],
      },
    ],
    flow: ['Brief', 'Scope & price', 'Design', 'Build', 'QA', 'Launch', 'Care plan'],
    month: [
      'Pull your admin portal into a reusable starter repo',
      'Write three fixed-price packages with clear deliverables',
      'Add Sentry and an uptime check to every live client site',
      'Keep a one-page handover: logins, how-to, support',
      'Offer a monthly care plan instead of one-off fixes',
    ],
    stop: 'Starting every project from an empty folder',
    start: 'Shipping from your own starter and design system',
  },
  {
    id: 'research',
    label: 'Research & data',
    short: 'Research',
    accent: '#0D9488',
    level: 1,
    definition: 'Deciding with evidence: who buys, what they search, what rivals run, what works.',
    nextMove: 'Write the question first, then pick the source.',
    now: ['Meta Ad Library', 'Google Trends', 'Mostly gut feel'],
    next: [
      'A research brief for every client',
      'Keyword + competitor sheet',
      'Customer quotes from reviews & Reddit',
      'GA4 + Clarity on every site',
    ],
    scaled: [
      'One research template per engagement',
      'Monthly insight report per client',
      'Reusable Looker Studio dashboard',
      'Research sold as a paid audit',
    ],
    stack: [
      {
        label: 'Demand',
        tools: [
          { name: 'Google Trends', role: 'Interest over time', mono: 'Gt', tint: '#2563EB', inUse: true },
          { name: 'Keyword Planner', role: 'Search volume', icon: I('google-ads-96.png') },
          { name: 'Search Console', role: 'What finds you', icon: I('google-search.webp') },
        ],
      },
      {
        label: 'Competition',
        tools: [
          { name: 'Meta Ad Library', role: 'Rivals’ live ads', icon: I('meta.png'), inUse: true },
          { name: 'TikTok Creative Center', role: 'Top ads & trends', mono: 'Tk', tint: '#0F172A' },
          { name: 'SimilarWeb', role: 'Rivals’ traffic', mono: 'Sw', tint: '#1D4ED8' },
        ],
      },
      {
        label: 'Customer',
        tools: [
          { name: 'Reddit', role: 'Buyers’ own words', icon: I('reddit.webp') },
          { name: 'Reviews', role: 'Praise & complaints', mono: '★', tint: '#D97706' },
          { name: 'AnswerThePublic', role: 'Questions people ask', mono: 'AP', tint: '#EA580C' },
        ],
      },
      {
        label: 'Performance',
        tools: [
          { name: 'GA4', role: 'Traffic & sales', icon: I('google-analytics.webp') },
          { name: 'Microsoft Clarity', role: 'Heatmaps & replays', mono: 'Cl', tint: '#0369A1' },
          { name: 'Looker Studio', role: 'Client dashboards', mono: 'Ls', tint: '#4F46E5' },
        ],
      },
      {
        label: 'When a client pays',
        tools: [
          { name: 'Semrush / Ahrefs', role: 'SEO & competitor depth', mono: 'Se', tint: '#EA580C' },
          { name: 'BigQuery', role: 'GA4 raw export', mono: 'BQ', tint: '#2563EB' },
        ],
      },
    ],
    flow: ['Question', 'Collect', 'Synthesise', 'Decide', 'Measure'],
    month: [
      'Make a one-page research brief built on the four questions',
      'Next client: 20 keywords with volume, 5 rivals’ ads, 30 customer quotes',
      'Install GA4 and Microsoft Clarity on every site you run',
      'Build one Looker Studio dashboard you can reuse',
      'Package the research as a fixed-price audit',
    ],
    stop: 'Browsing tools without a question',
    start: 'Writing the question, then choosing the source',
  },
  {
    id: 'marketing',
    label: 'Marketing & advertising',
    short: 'Marketing',
    accent: '#7C3AED',
    level: 2,
    definition: 'Getting the right people to want what you sell — and paying to reach them faster.',
    nextMove: 'Test creative weekly; add Google and email.',
    now: ['Meta ads', 'Pixel + Conversions API', 'Reading campaign structure'],
    next: [
      'A creative testing system: hooks × formats',
      'Simple structure, broad targeting',
      'Google Search for high-intent buyers',
      'Welcome + abandoned-cart email',
      'UTMs and GA4 on every campaign',
    ],
    scaled: [
      'Fresh creative every week',
      'Meta, Google and email working as one',
      'A weekly performance review',
      'Offer and landing-page tests',
      'Blended numbers: CAC, ROAS, LTV',
    ],
    stack: [
      {
        label: 'Paid',
        tools: [
          { name: 'Meta Ads', role: 'Social reach', icon: I('meta.png'), inUse: true },
          { name: 'Google Ads', role: 'Search intent', icon: I('google-ads-96.png') },
          { name: 'TikTok Ads', role: 'Younger reach', mono: 'Tk', tint: '#0F172A' },
        ],
      },
      {
        label: 'Measure',
        tools: [
          { name: 'Pixel + CAPI', role: 'Browser + server events', icon: I('meta.png'), inUse: true },
          { name: 'GA4', role: 'Second opinion', icon: I('google-analytics.webp') },
          { name: 'UTMs', role: 'Tag every link', mono: '?u', tint: '#475569' },
        ],
      },
      {
        label: 'Create',
        tools: [
          { name: 'Figma', role: 'Statics & layouts', icon: I('figma.webp') },
          { name: 'Canva', role: 'Fast variations', mono: 'Ca', tint: '#0891B2' },
          { name: 'CapCut', role: 'Short video', mono: 'Cc', tint: '#0F172A' },
        ],
      },
      {
        label: 'Own the audience',
        tools: [
          { name: 'Klaviyo', role: 'Store email & SMS', mono: 'Kl', tint: '#16A34A' },
          { name: 'Instagram', role: 'Organic & proof', icon: I('instagram.svg') },
          { name: 'Google Business', role: 'Local search', icon: I('google-business.webp') },
        ],
      },
    ],
    flow: ['Offer', 'Creative', 'Launch', 'Read (3–7 days)', 'Cut or scale', 'Iterate'],
    month: [
      'Run one structured test: 3 hooks × 2 formats',
      'Check Event Match Quality on every client pixel',
      'Put UTMs on every ad and read results in GA4 too',
      'Set up welcome and abandoned-cart flows for one Shopify client',
      'Launch a small Google Search campaign on high-intent terms',
    ],
    stop: 'Tweaking audiences every day',
    start: 'Testing creative weekly and letting delivery find buyers',
  },
  {
    id: 'automation',
    label: 'Automation',
    short: 'Automation',
    accent: '#EA580C',
    level: 2,
    definition: 'Work that runs itself: orders, leads, replies and reports.',
    nextMove: 'Every flow ships with alerts and a template.',
    now: ['n8n', 'Simple trigger → action flows'],
    next: [
      'An error workflow that alerts you',
      'Separate credentials per client',
      'Reusable sub-workflows',
      'Webhooks from your Next.js apps',
      'AI steps to classify and draft',
    ],
    scaled: [
      'A template library installed in hours',
      'Monitoring, retries and backups',
      'A monthly automation retainer',
      'A runbook for every flow',
    ],
    stack: [
      {
        label: 'Orchestrate',
        tools: [
          { name: 'n8n', role: 'Your workflow engine', icon: I('n8n.svg'), inUse: true },
          { name: 'Make / Zapier', role: 'When a client insists', mono: 'Mz', tint: '#7C3AED' },
        ],
      },
      {
        label: 'Connect',
        tools: [
          { name: 'Webhooks', role: 'Apps talk to n8n', mono: '{ }', tint: '#475569' },
          { name: 'Supabase', role: 'Store the records', icon: I('supabase.webp'), inUse: true },
          { name: 'Google Sheets', role: 'Client-friendly logs', mono: 'Gs', tint: '#16A34A' },
          { name: 'Shopify', role: 'Orders & customers', icon: I('shopify-96.png'), inUse: true },
        ],
      },
      {
        label: 'Reach people',
        tools: [
          { name: 'WhatsApp Business', role: 'Instant replies', icon: I('whatsapp.webp') },
          { name: 'Gmail', role: 'Email follow-ups', icon: I('gmail.webp') },
          { name: 'Slack', role: 'Team alerts', icon: I('slack.webp') },
        ],
      },
      {
        label: 'Think',
        tools: [
          { name: 'Claude', role: 'Classify, extract, draft', icon: I('claude.webp') },
        ],
      },
      {
        label: 'Run',
        tools: [
          { name: 'n8n Cloud or self-host', role: 'Docker on a VPS, with backups', mono: 'Ops', tint: '#EA580C' },
        ],
      },
    ],
    flow: ['Map the manual task', 'Pick the trigger', 'Build', 'Test on real data', 'Add alerts', 'Document & hand over'],
    month: [
      'Add an error workflow that pings you for every flow',
      'Turn your three most-used flows into templates',
      'Automate your own leads: form → Supabase → WhatsApp reply',
      'Add one AI step: sort incoming leads by service',
      'Write a one-page runbook for each client flow',
    ],
    stop: 'Shipping one-off flows nobody watches',
    start: 'Every flow ships with alerts, a template and a runbook',
  },
];
