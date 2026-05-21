// Static content lifted verbatim from the legacy server's data/*.json files.
// Moving them into the app bundle removes a network round-trip and lets the homepage be fully SSG.

export type Service = {
  id: number;
  serial: string;
  title: string;
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
    serial: '01',
    title: 'Digital Products',
    description:
      'Build software people love. We design and ship web apps, mobile experiences, and AI-powered tools ready to scale.',
    capabilities: [
      'Web Applications',
      'Mobile Apps',
      'AI Integration',
      'Backend Engineering',
    ],
  },
  {
    id: 2,
    serial: '02',
    title: 'Data Analytics',
    description:
      'Turn raw signal into clear decisions. Dashboards, attribution models, and insights that compound.',
    capabilities: [
      'Analytics Dashboards',
      'Attribution Modeling',
      'Conversion Tracking',
      'Reporting Systems',
    ],
  },
  {
    id: 3,
    serial: '03',
    title: 'Advertising & Marketing',
    description:
      'Stop wasting budget. Performance ads, SEO, and growth campaigns engineered for ROI.',
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
