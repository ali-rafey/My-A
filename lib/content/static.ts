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
  // The four moves of the home film, in the order a business lives them.
  // Titles double as the contact form's service choices and, slugged, as the
  // /contact?service= hand-off from the Services page. `capabilities` are
  // each service's four parts — the numbered labels in its illustration on
  // /services — so keep them short and keep exactly four.
  {
    id: 1,
    title: 'Research & Data',
    headline: 'Know the market before you spend.',
    description:
      'Audience and market research, competitor analysis and clean analytics, so every build and every campaign starts from evidence, not guesswork.',
    capabilities: [
      'Audience research',
      'Market & competitors',
      'GA4 & analytics',
      'Attribution & reporting',
    ],
  },
  {
    id: 2,
    title: 'Digital Presence',
    headline: 'A storefront people trust on sight.',
    description:
      'Websites and Shopify stores designed around your buyer: fast, findable and built to convert, with the brand to match.',
    capabilities: [
      'Website',
      'Shopify store',
      'Brand & UX',
      'Speed & SEO',
    ],
  },
  {
    id: 3,
    title: 'Advertising',
    headline: 'Ads that pay for themselves.',
    description:
      'Meta and Google campaigns with the pixel, conversions and creative set up properly. Launched, measured, and scaled only when the numbers say so.',
    capabilities: [
      'Meta Ads',
      'Google Ads',
      'Pixel & tracking',
      'Creative & scaling',
    ],
  },
  {
    id: 4,
    title: 'Automation',
    headline: 'Busywork that runs itself.',
    description:
      'n8n workflows that log orders, route leads, reply on WhatsApp and send the follow-up, so your team spends its time on customers, not copy-paste.',
    capabilities: [
      'n8n workflows',
      'Order & lead routing',
      'WhatsApp & email',
      'CRM',
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
