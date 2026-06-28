// Static content lifted verbatim from the legacy server's data/*.json files.
// Moving them into the app bundle removes a network round-trip and lets the homepage be fully SSG.

export type Service = {
  id: number;
  title: string;       // Tag label (rendered uppercase via CSS).
  headline: string;    // Poster-style line below the tag.
  description: string;
  capabilities: string[];
};

export type WorkProject = {
  id: number;
  title: string;
  description: string;
  tag: string;
};

export type Step = {
  number: string;
  title: string;
  description: string;
};

// Richer portfolio entries for the dedicated /our-work page (card + carousel
// showcase). Kept separate from `workProjects` so the homepage #our-work
// section is unaffected. `accent` drives the placeholder thumbnail tint until
// real project screenshots are dropped in.
export type CaseStudy = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  accent: string;
};

export const caseStudies: CaseStudy[] = [
  {
    id: 1,
    title: 'MedHealix',
    description:
      'MedHealix is a live enterprise HealthTech platform we built from the ground up — a HIPAA-compliant, co-branded health experience connecting patients with providers across a secure, scalable cloud backend.',
    tags: ['HIPAA Compliance', 'Azure', 'HealthTech', 'Enterprise'],
    accent: '#2563EB',
  },
  {
    id: 2,
    title: 'Earthly Insight',
    description:
      'Earthly Insight is a live, scaling AI platform we built from scratch on Web, iOS, and Android — now with 6,500+ users and 1,000+ daily active sessions, all powered by a multi-model AI engine.',
    tags: ['Multi-AI', 'Cross-Platform', 'GreenTech', 'Mobile'],
    accent: '#16A34A',
  },
  {
    id: 3,
    title: 'Altruva',
    description:
      'Altruva is a live nonprofit FinAI platform backed by $100,000 in Microsoft Azure credits. We built it entirely from scratch — producing financial insights and guidance for mission-driven organizations.',
    tags: ['Azure AI Foundry', 'RAG', 'MCP', 'NonProfit Tech'],
    accent: '#7C3AED',
  },
  {
    id: 4,
    title: 'Syncom AI',
    description:
      'Syncom AI is a live AI copywriting platform we built end-to-end — trained on Gary Halbert, Dan Kennedy, Eugene Schwartz, and other legendary direct-response copywriters to generate high-converting copy on demand.',
    tags: ['AI Copywriting', 'Direct Response', 'MarTech', 'SaaS'],
    accent: '#0F172A',
  },
];

export const services: Service[] = [
  {
    id: 1,
    title: 'Digital Presence',
    headline: 'Built to be seen.',
    description:
      'Your digital storefront, performance-tuned. Websites, brand, and product experiences that turn visitors into customers.',
    capabilities: [
      'Web Development',
      'Brand Identity',
      'UX & Design',
      'Performance & SEO',
    ],
  },
  {
    id: 2,
    title: 'Data Analytics',
    headline: 'Insight that compounds.',
    description:
      'Turn raw signal into clear decisions. Dashboards, attribution models, and insights that compound over time.',
    capabilities: [
      'Analytics Dashboards',
      'Attribution Modeling',
      'Conversion Tracking',
      'Reporting Systems',
    ],
  },
  {
    id: 3,
    title: 'Advertising & Marketing',
    headline: 'Reach that converts.',
    description:
      'Stop wasting budget. Performance ads, organic strategy, and growth campaigns engineered for ROI.',
    capabilities: [
      'Performance Media',
      'SEO Strategy',
      'Content & Brand',
      'Growth Engineering',
    ],
  },
];

export const workProjects: WorkProject[] = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A conversion-focused storefront with inventory sync and analytics visibility.',
    tag: 'Retail',
  },
  {
    id: 2,
    title: 'CRM Dashboard',
    description: 'An internal operations hub that centralizes sales, support, and pipeline tracking.',
    tag: 'Operations',
  },
  {
    id: 3,
    title: 'AI Chatbot',
    description: 'A support assistant for customer queries, qualification, and routing.',
    tag: 'Automation',
  },
];

export const howItWorksSteps: Step[] = [
  {
    number: '01',
    title: 'Discovery Call',
    description: 'We align on your goals, constraints, and the business case for the build.',
  },
  {
    number: '02',
    title: 'We Build',
    description: 'Our team designs, develops, and refines the solution with clear milestones.',
  },
  {
    number: '03',
    title: 'You Grow',
    description: 'You launch with confidence and use the new system to scale faster.',
  },
];
