// Static content lifted verbatim from the legacy server's data/*.json files.
// Moving them into the app bundle removes a network round-trip and lets the homepage be fully SSG.

export type Service = {
  id: number;
  title: string;
  description: string;
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
    title: 'Web Development',
    description: 'High-performance web apps, dashboards, and customer portals built for scale.',
  },
  {
    id: 2,
    title: 'Mobile Apps',
    description: 'Cross-platform mobile experiences that stay fast, clean, and maintainable.',
  },
  {
    id: 3,
    title: 'AI Solutions',
    description: 'Automations and intelligent assistants that reduce manual effort and improve decisions.',
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
