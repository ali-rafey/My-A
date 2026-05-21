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
