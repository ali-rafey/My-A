// The Admin Guide's content, kept apart from its layout so it can be edited
// without touching a component.
//
// EscaLeads sells one thing — a digital presence that sells — and the other
// three pillars serve it: research informs it, marketing brings people to it,
// automation runs what happens after they buy. Every pillar has the same
// shape, so the page reads the same way four times: the model, the playbook
// (each part: what good looks like, how to check it, what to measure), how you
// deliver it, the numbers to know, the tools, and the beliefs to correct.
//
// Benchmarks are rules of thumb for a first read. A client's own history is
// always the better baseline.
//
// `icon` paths point into /public/guide/icons. A tool without one renders as a
// lettered tile; drop a logo file in that folder and set `icon` to swap it in.

export type PillarId = 'presence' | 'research' | 'marketing' | 'automation';

export type Cost = 'free' | 'freemium' | 'paid' | 'spend' | 'included';

export const COST_LABEL: Record<Cost, string> = {
  free: 'Free',
  freemium: 'Free tier',
  paid: 'Paid',
  spend: 'Pay per ad',
  included: 'Included',
};

export type Tool = {
  name: string;
  role: string;
  cost: Cost;
  icon?: string;
  /** Letters for the tile when there is no icon file. */
  mono?: string;
  /** Tile tint for the lettered version. */
  tint?: string;
};

export type ToolGroup = { label: string; tools: Tool[] };

export type Part = {
  name: string;
  /** One line for the collapsed row. */
  summary: string;
  /** Plain-words definition. */
  what: string;
  /** What good looks like — the audit checklist. */
  good: string[];
  /** How to check it on a real client. */
  check: string;
  /** The number that tells you it's working. */
  measure: string;
};

export type Step = { name: string; detail?: string; output: string };
export type Rule = { label: string; value: string; note: string };
export type Correction = { myth: string; truth: string };

export type Pillar = {
  id: PillarId;
  label: string;
  short: string;
  accent: string;
  /** How it relates to the core offer. */
  role: string;
  question: string;
  definition: string;
  promise: string;
  model: { title: string; note: string };
  parts: Part[];
  steps: Step[];
  packages: string[];
  rules: Rule[];
  tools: ToolGroup[];
  corrections: Correction[];
};

const I = (file: string) => `/guide/icons/${file}`;

export const MISSION = {
  line: 'EscaLeads builds and grows the digital presence of businesses and e-commerce brands.',
  how: 'Research tells you what to build. The presence is where buyers land and decide. Marketing brings the right people to it. Automation runs what happens after they act. Every client needs all four.',
  loop: 'Every month: read the data, pick the next fix, repeat. That loop is the retainer.',
};

export const ENGAGEMENT: { when: string; title: string; detail: string; pillars: PillarId[] }[] = [
  {
    when: 'Week 1',
    title: 'Research & audit',
    detail: 'Competitor teardown and a presence scorecard. Sell this first. It’s your entry offer.',
    pillars: ['research', 'presence'],
  },
  {
    when: 'Weeks 2–4',
    title: 'Fix the foundation',
    detail: 'Offer, brand kit, site, checkout and tracking. No traffic until this is solid.',
    pillars: ['presence', 'marketing'],
  },
  {
    when: 'Month 2',
    title: 'Turn on traffic',
    detail: 'Organic plan and paid campaigns aimed at the ICP, read weekly.',
    pillars: ['marketing'],
  },
  {
    when: 'Ongoing',
    title: 'Automate & report',
    detail: 'Order confirmations, instant lead replies, weekly numbers.',
    pillars: ['automation', 'research'],
  },
];

export const PILLARS: Pillar[] = [
  // ── Digital presence ──────────────────────────────────────────────────────
  {
    id: 'presence',
    label: 'Digital presence',
    short: 'Presence',
    accent: '#2563EB',
    role: 'The core',
    question: 'When someone finds this business online, do they trust it — and buy?',
    definition:
      'Everywhere a business shows up online (website, store, social, search) and how well each place turns a stranger into a repeat customer.',
    promise:
      'A brand people recognise, a site that loads fast and sells, a checkout that doesn’t leak, and customers who come back.',
    model: {
      title: 'From stranger to repeat customer',
      note: 'Every part of a presence sits somewhere on this path, and all of it stands on the offer and the brand.',
    },
    parts: [
      {
        name: 'The offer',
        summary: 'The foundation: what you sell, and why anyone should buy it',
        what: 'What you sell, to whom, at what price, and why it beats the alternative. It’s the foundation. Everything else only amplifies it.',
        good: [
          'One clear hero product or service, not forty equal options',
          'The outcome in the buyer’s words, not a list of features',
          'Price anchored with a bundle, compare-at price or value stack',
          'Risk removed: guarantee, easy returns, COD where buyers expect it',
          'A true reason to buy now: launch, limited stock, season',
        ],
        check:
          'Say it in one sentence: “We help [who] get [result] without [pain].” If you can’t, neither can the customer. Then put it side by side with three rivals’ offers from your research.',
        measure: 'Conversion rate and average order value (AOV), before vs after an offer change.',
      },
      {
        name: 'Brand purpose & perception',
        summary: 'Why the business exists, and what people really think of it',
        what: 'Why the business exists (mission), who it’s for (positioning), and what people actually think of it (perception). Perception is decided by customers, not by the brand.',
        good: [
          'A one-line mission and a one-line positioning statement',
          'A clear “for / not for”: who it serves and who it doesn’t',
          'The same tone of voice in site copy, captions and DM replies',
          'Reviews and comments describe the brand the way it wants to be described',
        ],
        check:
          'Read the last 30 reviews, comments and DMs. Write down the words customers use, then compare them with how the brand describes itself. The gap is the work.',
        measure: 'Review rating, branded searches (people typing the name), tone of comments.',
      },
      {
        name: 'Brand kit & logo',
        summary: 'Logo, colours, fonts, imagery and voice, the same everywhere',
        what: 'The toolkit that makes a brand recognisable everywhere: logo, colours, type, imagery and voice. The logo is one asset in it, not the brand itself.',
        good: [
          'Logo in full, icon-only and one-colour versions (SVG + PNG)',
          'Palette with hex codes (primary, accent, neutrals), checked for contrast',
          'Two fonts at most: one for headings, one for body',
          'Photo and video rules: lighting, backgrounds, people, framing',
          'Voice rules: three words it is, three it isn’t, with example lines',
          'All of it in one shared place (Figma or a Canva Brand Kit)',
        ],
        check:
          'Put the website, Instagram grid, latest ad and packaging side by side. Would a stranger know they’re the same brand with the logo covered?',
        measure: 'Consistency across touchpoints (pass / fail per channel).',
      },
      {
        name: 'Website / store',
        summary: 'The one place the business owns, where sales and data live',
        what: 'The one place the business fully owns. Social platforms rent you an audience; the website is where the sale and the data live.',
        good: [
          'Above the fold: what it is, who it’s for, one main button',
          'Product pages with real photos, video, specs or sizes, delivery time, reviews',
          'Visible trust: contact, returns policy, WhatsApp, real address',
          'Navigation, search and filters a first-time visitor understands',
          'Tracking in place: GA4, Meta Pixel + CAPI, Search Console, Clarity',
        ],
        check:
          'Open it on a mid-range phone on mobile data. Five seconds: can you tell what they sell and why to buy? Then run PageSpeed Insights on the home page and one product page.',
        measure: 'Core Web Vitals, engagement rate, product views per session.',
      },
      {
        name: 'Social & platform profiles',
        summary: 'Instagram, TikTok, LinkedIn, Google: everywhere people check you',
        what: 'Instagram, TikTok, Facebook, LinkedIn, YouTube, Google Business Profile, WhatsApp Business and marketplaces: the places people check before they trust you.',
        good: [
          'Same name, logo, bio and link on every platform',
          'Bio says what you sell, who it’s for, and one call to action',
          'Highlights or pinned posts: best sellers, reviews, how to order, FAQs',
          'Google Business Profile verified, with photos, hours and reviews',
          'A posting rhythm the business can actually keep',
          'Comments and DMs answered the same day',
        ],
        check:
          'Search the brand name on Google, Instagram and TikTok as a stranger would. Note every inconsistency, dead link and unanswered comment.',
        measure: 'Profile visits → link clicks, follower growth, reply time.',
      },
      {
        name: 'UI & UX',
        summary: 'How it looks, and how easily people get what they came for',
        what: 'UI is how it looks. UX is how easily people get what they came for. Good UX removes every reason to hesitate.',
        good: [
          'Designed for phones first: most store traffic is mobile',
          'Fast: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1',
          'Readable without zooming; buttons big enough for thumbs',
          'One primary action per screen, visually obvious',
          'No pop-up in the first seconds, no content jumping as it loads',
        ],
        check:
          'Watch 10 real sessions in Microsoft Clarity. Look for rage clicks, dead clicks, and where people stop scrolling.',
        measure: 'Core Web Vitals (PageSpeed Insights), rage and dead clicks (Clarity), scroll depth.',
      },
      {
        name: 'Conversion rate optimisation (CRO)',
        summary: 'Raising the share of visitors who buy, one leak at a time',
        what: 'Raising the share of visitors who buy, step by step, by finding where they drop off and removing the reason.',
        good: [
          'The funnel measured: visit → product view → cart → checkout → purchase',
          'The biggest drop fixed first, not the easiest one',
          'A written hypothesis for each change: “Because X, changing Y will lift Z”',
          'One change at a time, left running for at least one to two full weeks',
        ],
        check:
          'Open Shopify Analytics (or a GA4 funnel exploration) and find the step with the biggest percentage drop. Watch Clarity recordings of people who left at that step.',
        measure: 'Conversion rate (orders ÷ sessions), add-to-cart rate, checkout completion.',
      },
      {
        name: 'Checkout: initial → final',
        summary: 'Getting people who start checking out to actually finish',
        what: 'Initial checkout is when someone starts checking out; final checkout is the completed order. Everyone who starts and doesn’t finish is money already won and then lost.',
        good: [
          'Guest checkout, with no forced account',
          'Full cost, delivery included, shown before checkout',
          'Express payment: Shop Pay, Apple / Google Pay, wallets, COD where expected',
          'Few fields, autofill on, phone number validated',
          'Trust at the payment step: returns, delivery date, secure badges',
          'Abandoned-checkout reminder by email or WhatsApp within an hour',
        ],
        check:
          'Place a real test order on your phone. Count the taps and fields. Anything that surprises you (extra cost, forced sign-up, a far-off delivery date) is a leak.',
        measure: 'Checkout completion = purchases ÷ started checkouts. Recovered abandoned checkouts.',
      },
      {
        name: 'Customer acquisition',
        summary: 'How new buyers arrive, and whether the presence is ready for them',
        what: 'How new buyers arrive: search, social, ads, referrals, marketplaces. Marketing runs it. Here you make sure the presence is ready to receive them.',
        good: [
          'Every traffic source tagged (UTMs) and visible in GA4',
          'Landing pages that match the ad or post that sent the visitor',
          'Email or WhatsApp capture for visitors not ready to buy yet',
          'Cost to acquire a customer (CAC) known for each channel',
        ],
        check:
          'In GA4 → Acquisition, which channels bring buyers, not just visitors? A lot of “Unassigned” or “(not set)” means tagging is broken.',
        measure: 'CAC = marketing spend ÷ new customers, per channel.',
      },
      {
        name: 'Retention & repeat',
        summary: 'Bringing visitors back and turning buyers into repeat customers',
        what: 'Bringing visitors back and turning first-time buyers into repeat customers. The first order often only pays for the ad; the profit usually comes from the second.',
        good: [
          'Welcome, abandoned-cart, post-purchase and win-back flows running',
          'Order updates on WhatsApp or SMS: confirmed, shipped, delivered',
          'A review request after delivery',
          'A reason to return: refill reminder, loyalty perk, new drop',
          'Retargeting audiences for recent visitors and past buyers',
        ],
        check:
          'Shopify → Customers: what share ordered more than once? GA4: what share of users are returning?',
        measure: 'Repeat purchase rate, customer lifetime value (LTV), LTV : CAC.',
      },
    ],
    steps: [
      { name: 'Discovery', detail: 'Goals, margins, best sellers, current numbers', output: 'Client brief' },
      { name: 'Audit', detail: 'Score all ten parts: 0 missing · 1 weak · 2 solid', output: 'Presence scorecard' },
      { name: 'Prioritise', detail: 'Rank by impact × effort, biggest leak first', output: 'Fix list' },
      { name: 'Fix & build', detail: 'Offer, brand kit, site, checkout, tracking', output: 'Shipped changes' },
      { name: 'Measure', detail: '30 days, compared with the baseline', output: 'Before / after report' },
      { name: 'Improve', detail: 'One CRO test a month', output: 'Retainer' },
    ],
    packages: [
      'Digital presence audit (entry offer)',
      'Brand kit',
      'Store / website build',
      'Checkout & CRO sprint',
      'Retention flows setup',
    ],
    rules: [
      { label: 'Conversion rate', value: '1–3%', note: 'Orders ÷ sessions, typical for e-commerce. Beat the store’s own baseline first.' },
      { label: 'Add-to-cart rate', value: '5–10%', note: 'Share of sessions that add anything to the cart.' },
      { label: 'Cart abandonment', value: '~70%', note: 'The average across stores (Baymard). It’s normal. Recover it with reminders.' },
      { label: 'Checkout completion', value: '½ or more', note: 'Purchases ÷ started checkouts. Much lower means the checkout itself leaks.' },
      { label: 'Page speed (LCP)', value: '≤ 2.5 s', note: 'Main content visible in 2.5 s, plus INP ≤ 200 ms and CLS ≤ 0.1 for a “good” Core Web Vitals score.' },
      { label: 'Repeat purchase rate', value: '20–30%', note: 'Customers who buy again within a year. Consumables should do better.' },
      { label: 'LTV : CAC', value: '3 : 1', note: 'A customer should be worth about three times what they cost to acquire.' },
    ],
    tools: [
      {
        label: 'Brand',
        tools: [
          { name: 'Figma', role: 'Logo, kit, layouts', cost: 'freemium', icon: I('figma.webp') },
          { name: 'Canva', role: 'Brand kit & templates', cost: 'freemium', mono: 'Ca', tint: '#0891B2' },
          { name: 'Coolors', role: 'Palettes & contrast', cost: 'free', mono: 'Co', tint: '#0EA5E9' },
          { name: 'Google Fonts', role: 'Free typefaces', cost: 'free', mono: 'Aa', tint: '#2563EB' },
        ],
      },
      {
        label: 'Build',
        tools: [
          { name: 'Shopify', role: 'Stores & checkout', cost: 'paid', icon: I('shopify-96.png') },
          { name: 'Next.js + Vercel', role: 'Custom sites & apps', cost: 'freemium', icon: I('nextjs.webp') },
        ],
      },
      {
        label: 'Check UX & speed',
        tools: [
          { name: 'PageSpeed Insights', role: 'Core Web Vitals', cost: 'free', mono: 'PS', tint: '#16A34A' },
          { name: 'Microsoft Clarity', role: 'Heatmaps & recordings', cost: 'free', mono: 'Cl', tint: '#0369A1' },
          { name: 'GA4', role: 'Behaviour & funnels', cost: 'free', icon: I('google-analytics.webp') },
        ],
      },
      {
        label: 'Trust & local',
        tools: [
          { name: 'Google Business Profile', role: 'Maps, reviews, hours', cost: 'free', icon: I('google-business.webp') },
          { name: 'Judge.me', role: 'Store reviews', cost: 'freemium', mono: 'Jm', tint: '#0D9488' },
          { name: 'WhatsApp Business', role: 'Chat & catalogue', cost: 'free', icon: I('whatsapp.webp') },
        ],
      },
      {
        label: 'Retention',
        tools: [
          { name: 'Klaviyo', role: 'Email & SMS flows', cost: 'freemium', mono: 'Kl', tint: '#16A34A' },
          { name: 'Shopify Email', role: 'Simple campaigns', cost: 'freemium', icon: I('shopify-96.png') },
        ],
      },
    ],
    corrections: [
      {
        myth: 'The offer is the last thing to sort out.',
        truth:
          'The offer comes first. A strong offer sells on a plain site; a weak one fails on a beautiful one. Value = (dream outcome × how believable it is) ÷ (time to get it × effort it takes). Raise the top, shrink the bottom.',
      },
      {
        myth: 'The brand is the logo.',
        truth:
          'The logo is one file in the kit. The brand is what customers say about the business when it isn’t in the room, and they decide that, not you.',
      },
      {
        myth: '“Initial” and “final” checkout are just steps on the page.',
        truth:
          'They’re tracked events. Meta calls them InitiateCheckout and Purchase; GA4 calls them begin_checkout and purchase. Learn those names, because every report and every ad optimisation runs on them.',
      },
      {
        myth: 'More traffic will fix low sales.',
        truth:
          'Fix conversion before buying traffic. Doubling the conversion rate halves the cost of every customer. Doubling traffic doubles the ad bill.',
      },
    ],
  },

  // ── Research & data ───────────────────────────────────────────────────────
  {
    id: 'research',
    label: 'Research & data',
    short: 'Research',
    accent: '#0D9488',
    role: 'Informs it',
    question: 'What does the market want, what are rivals doing, and what is actually working?',
    definition:
      'Finding out before you spend: what buyers search for, what competitors sell and advertise, what customers say, and what the client’s own numbers really show.',
    promise:
      'An offer built to beat rivals, ads based on what already works in the market, and an honest read of the client’s own data.',
    model: {
      title: 'Six questions, in this order',
      note: 'Start from the question. The tool comes second.',
    },
    parts: [
      {
        name: 'Market demand',
        summary: 'Is anyone searching for this, how many, and when',
        what: 'Whether people want this, how many of them, and when. Measures search and social interest before any money is committed.',
        good: [
          '20–50 keywords buyers actually use, each with a monthly volume',
          'Seasonality mapped: which months peak and which dip',
          'Rising searches spotted early (Trends → Related queries → Rising)',
          'Regional differences checked by city or country',
        ],
        check:
          'Google Trends: compare the product terms over five years in the target country. Keyword Planner: pull volumes and suggested bids (a high bid means buying intent). Type the product into Google, YouTube and TikTok search and note what autocomplete suggests.',
        measure: 'Monthly search volume, trend direction, cost per click as a signal of intent.',
      },
      {
        name: 'Competitor offer',
        summary: 'What rivals sell, at what price, with what promise',
        what: 'Exactly what rivals sell and how they package it: price, bundles, guarantees, delivery promise and discounts.',
        good: [
          '3–5 rivals: direct (same product), indirect (same problem), aspirational (where the client wants to be)',
          'Each rival’s hero product, price, bundles and compare-at prices',
          'Guarantee, returns, delivery time, free-shipping threshold',
          'Discount rhythm: always on sale, seasonal, first-order code',
        ],
        check:
          'Mystery-shop each rival: browse on mobile, add to cart, go to checkout (stop before paying), and join their email and WhatsApp lists to receive their flows. On most Shopify stores, adding /products.json to the domain lists every product and price. The Wayback Machine shows how their offer changed over time.',
        measure: 'Price position (cheaper / same / premium) and offer strength compared with the client.',
      },
      {
        name: 'Competitor digital presence',
        summary: 'How strong rivals are online: traffic, SEO, social, reviews',
        what: 'How strong a rival is online: traffic, search visibility, site quality, social reach and reputation.',
        good: [
          'Estimated monthly traffic and where it comes from',
          'Their top pages and the keywords they rank for',
          'Site speed and mobile experience compared with the client’s',
          'Platform, theme and apps (reviews, upsells, COD forms, email)',
          'Social: followers, posting frequency, which posts get the most views',
          'Review rating and volume on Google and on their store',
        ],
        check:
          'Similarweb for traffic and sources. Semrush or Ahrefs free tools for keywords and backlinks. Wappalyzer or Koala Inspector for platform and apps. PageSpeed Insights on their product page. Their TikTok “Popular” tab and Instagram Reels view counts.',
        measure: 'Traffic estimate, number of ranking keywords, speed score, views per post.',
      },
      {
        name: 'Competitor campaigns',
        summary: 'The ads and content rivals are paying to run',
        what: 'The ads and content rivals pay to show: the hooks, formats, offers and landing pages they bet money on.',
        good: [
          'Every rival’s live ads reviewed on Meta, Google and TikTok',
          'Likely winners flagged using the signals (30+ days, many versions)',
          'Hooks, angles and formats saved in a swipe file',
          'The landing pages behind the ads captured',
          'Repeated monthly. The market moves.',
        ],
        check:
          'Meta Ad Library: pick the country, “Active” ads, search the brand; read the “Started running on” dates. Google Ads Transparency Center: search the advertiser or domain, then filter by region and format (text, image, video). TikTok Creative Center → Top Ads for the category. Visit and follow rivals so their retargeting ads start finding you.',
        measure: 'Live ad count, oldest running ad, main angles, formats (video, static, carousel, UGC).',
      },
      {
        name: 'Customer voice',
        summary: 'What buyers say in their own words: pains, wants, objections',
        what: 'What buyers say in their own words: pains, desires, objections and exact phrases. The best ad copy is lifted from customers.',
        good: [
          '30–50 real quotes, each tagged pain, desire, objection or praise',
          'The top three complaints about rivals, which are the client’s opening',
          'Customer phrases reused in ads, product pages and captions',
        ],
        check:
          'Read rivals’ 3-star reviews first; they’re the most balanced. Then 1-star (what goes wrong) and 5-star (what delights). Search Reddit and YouTube comments for the category. Read the comments under rivals’ ads, where people post their real objections.',
        measure: 'Themes by frequency. Which objection comes up most?',
      },
      {
        name: 'The client’s own data',
        summary: 'GA4, Search Console, Clarity and Shopify: what’s working now',
        what: 'The client’s truth: where visitors come from, what they do, where they drop, and which searches find them.',
        good: [
          'GA4 with e-commerce events: view_item → add_to_cart → begin_checkout → purchase',
          'Search Console verified and linked to GA4',
          'Microsoft Clarity recording sessions',
          'Meta Events Manager showing Pixel + CAPI events with good match quality',
          'One Looker Studio dashboard the client can open anytime',
        ],
        check:
          'GA4 → Reports → Acquisition: which channels bring buyers. Search Console → Performance: queries, clicks and average position (this is where Google rankings live). Shopify → Analytics: the conversion funnel. Clarity: recordings of people who left at checkout.',
        measure: 'Conversion rate by channel, top queries and their position, funnel drop-offs.',
      },
    ],
    steps: [
      { name: 'Write the question', detail: 'The one decision this research must inform', output: 'Research question' },
      { name: 'Pick rivals', detail: '3–5: direct, indirect, aspirational', output: 'Competitor list' },
      { name: 'Teardown', detail: 'Offer, presence, campaigns; same checklist for each', output: 'Teardown sheet' },
      { name: 'Customer voice', detail: 'Reviews, Reddit, ad comments', output: 'Tagged quote bank' },
      { name: 'Synthesise', detail: 'Gaps, angles, what to copy, what to avoid', output: 'One-page brief' },
      { name: 'Re-check', detail: 'Monthly ad sweep, quarterly full teardown', output: 'Updated brief' },
    ],
    packages: [
      'Competitor teardown',
      'Market & keyword brief',
      'Analytics setup (GA4 + Search Console + Clarity)',
      'Monthly insight report',
    ],
    rules: [
      { label: 'Winning-ad signal', value: '30+ days', note: 'An ad still live after a month is very likely profitable. Losers get switched off fast.' },
      { label: 'Rivals per teardown', value: '3–5', note: 'Direct, indirect and one aspirational brand. More than five is noise.' },
      { label: 'Customer quotes', value: '30–50', note: 'Enough to see patterns. Tag each one: pain, desire, objection, praise.' },
      { label: 'Google Trends', value: '0–100', note: 'Relative interest, not search volume. Use Keyword Planner for volume.' },
      { label: 'Traffic tools', value: 'Estimates', note: 'Similarweb and Semrush numbers are modelled. Use them to compare, never to quote.' },
      { label: 'Ad sweep', value: 'Monthly', note: 'A full teardown every quarter, and before any launch.' },
    ],
    tools: [
      {
        label: 'Demand',
        tools: [
          { name: 'Google Trends', role: 'Interest over time', cost: 'free', mono: 'Gt', tint: '#2563EB' },
          { name: 'Keyword Planner', role: 'Search volume & bids', cost: 'free', icon: I('google-ads-96.png') },
          { name: 'AnswerThePublic', role: 'Questions people ask', cost: 'freemium', mono: 'AP', tint: '#EA580C' },
          { name: 'TikTok Creative Center', role: 'Trends, sounds, hashtags', cost: 'free', mono: 'Tk', tint: '#0F172A' },
        ],
      },
      {
        label: 'Rivals’ ads',
        tools: [
          { name: 'Meta Ad Library', role: 'Live FB & IG ads', cost: 'free', icon: I('meta.png') },
          { name: 'Google Ads Transparency', role: 'Search, YouTube, Shopping', cost: 'free', icon: I('google-search.webp') },
          { name: 'TikTok Top Ads', role: 'Best ads by category', cost: 'free', mono: 'Tk', tint: '#0F172A' },
          { name: 'LinkedIn Ad Library', role: 'B2B rivals’ ads', cost: 'free', mono: 'in', tint: '#0A66C2' },
          { name: 'Foreplay', role: 'Save & organise ads', cost: 'paid', mono: 'Fp', tint: '#7C3AED' },
        ],
      },
      {
        label: 'Rivals’ presence',
        tools: [
          { name: 'Similarweb', role: 'Traffic & sources', cost: 'freemium', mono: 'Sw', tint: '#1D4ED8' },
          { name: 'Semrush / Ahrefs', role: 'Keywords & backlinks', cost: 'freemium', mono: 'SA', tint: '#EA580C' },
          { name: 'Wappalyzer', role: 'Tech stack & apps', cost: 'freemium', mono: 'Wa', tint: '#4F46E5' },
          { name: 'Koala Inspector', role: 'Shopify theme & apps', cost: 'freemium', mono: 'Ki', tint: '#16A34A' },
          { name: 'Wayback Machine', role: 'Old versions of sites', cost: 'free', mono: 'Wb', tint: '#475569' },
          { name: 'Social Blade', role: 'Follower history', cost: 'free', mono: 'Sb', tint: '#DC2626' },
        ],
      },
      {
        label: 'Customer voice',
        tools: [
          { name: 'Reddit', role: 'Buyers’ own words', cost: 'free', icon: I('reddit.webp') },
          { name: 'Reviews', role: 'Store, Google, Trustpilot', cost: 'free', mono: '★', tint: '#D97706' },
          { name: 'Comments', role: 'Under rivals’ ads & videos', cost: 'free', mono: '“ ”', tint: '#0D9488' },
        ],
      },
      {
        label: 'Client data',
        tools: [
          { name: 'GA4', role: 'Traffic, funnels, sales', cost: 'free', icon: I('google-analytics.webp') },
          { name: 'Search Console', role: 'Rankings & queries', cost: 'free', icon: I('google-search.webp') },
          { name: 'Microsoft Clarity', role: 'Heatmaps & recordings', cost: 'free', mono: 'Cl', tint: '#0369A1' },
          { name: 'Shopify Analytics', role: 'Store funnel & customers', cost: 'included', icon: I('shopify-96.png') },
          { name: 'Looker Studio', role: 'Client dashboards', cost: 'free', mono: 'Ls', tint: '#4F46E5' },
        ],
      },
    ],
    corrections: [
      {
        myth: 'Google rankings show up in GA4.',
        truth:
          'Rankings live in Google Search Console: queries, impressions, clicks and average position. GA4 shows what people do after they land. Link the two so you see both in one place.',
      },
      {
        myth: 'Google Trends tells you how many people search.',
        truth:
          'It shows relative interest on a 0–100 scale, compared with the term’s own peak. For real monthly searches use Keyword Planner, which is free with a Google Ads account.',
      },
      {
        myth: 'The Ad Library shows which ads work.',
        truth:
          'It shows what’s running, never sales or ROAS. You infer winners from how long an ad has run, how many versions exist, and whether many ads point to the same page.',
      },
      {
        myth: 'Open the tools and see what you find.',
        truth:
          'Write the question first (“Should we price above or below rival X?”), then pick the one source that answers it. Research without a question is just scrolling.',
      },
    ],
  },

  // ── Marketing & advertising ───────────────────────────────────────────────
  {
    id: 'marketing',
    label: 'Marketing & advertising',
    short: 'Marketing',
    accent: '#7C3AED',
    role: 'Brings people to it',
    question: 'How do the right people find this business and choose it?',
    definition:
      'Getting the right people to the presence and giving them a reason to buy: organic content that builds trust, paid ads that buy reach, and tracking that proves what worked.',
    promise:
      'Content and ads aimed at the right buyers on the right channels, tracking that counts every sale, and a weekly report that shows what the money did.',
    model: {
      title: 'The marketing chain',
      note: 'Each link depends on the one before it. Money goes in after tracking works, never before.',
    },
    parts: [
      {
        name: 'ICP & target audience',
        summary: 'Exactly who buys, and why',
        what: 'The Ideal Customer Profile: the specific buyer who gets the most value and is the most profitable. Every channel, message and ad starts here.',
        good: [
          'Who they are: age, location, income, life stage (B2C) or role and company size (B2B)',
          'The problem they feel, in their own words (from Research → Customer voice)',
          'Where they spend time online and what they already buy',
          'What triggers the purchase: an event, a season, a pain moment',
          'Their objections, and what answers each one',
        ],
        check:
          'Look at the client’s best 20 customers (highest spend, most repeat orders). What do they have in common? That’s the ICP, not the customer the client wishes they had.',
        measure: 'Conversion rate and CAC for the ICP segment compared with everyone else.',
      },
      {
        name: 'Channel & medium',
        summary: 'Where to show up, based on where the ICP already is',
        what: 'Where to show up, chosen by where the ICP already is and how they buy, not by what’s trending.',
        good: [
          'One or two main channels done well before adding more',
          'Search channels to catch demand that exists (people already looking)',
          'Social channels to create demand (people not looking yet)',
          'Organic and paid on the same channel, supporting each other',
        ],
        check:
          'Start from the channel picker above, then confirm in GA4 which channels already bring buyers.',
        measure: 'CAC and ROAS per channel; each channel’s share of revenue.',
      },
      {
        name: 'Funnel & strategy',
        summary: 'What moves people from stranger to buyer, step by step',
        what: 'The path from stranger to buyer, and the content or ad that moves people each step. Cold people need a reason to care, warm people need proof, and hot people need a nudge.',
        good: [
          'Content and ads mapped to every stage (see the funnel map)',
          'Retargeting audiences: video viewers, engagers, visitors, cart abandoners',
          'Most budget on reaching new people, a smaller layer on retargeting',
          'An obvious next step at every stage',
        ],
        check:
          'Name the asset that serves each stage. An empty stage is where people fall out.',
        measure: 'Stage by stage: hook rate → CTR → conversion rate → repeat rate.',
      },
      {
        name: 'Offer implementation',
        summary: 'Turning the offer into hooks, proof and a reason to act now',
        what: 'Turning the offer from Digital Presence into ads and posts: the hook, the promise, the proof, and the reason to act now.',
        good: [
          'The first 3 seconds (or first line) state the outcome or the pain',
          'Proof in every ad: reviews, UGC, before / after, numbers',
          'The ad’s promise matches the landing page exactly',
          'Several angles tested: pain, desire, social proof, price, comparison',
        ],
        check:
          'Mute the ad and cover the caption. Does the first frame alone say what’s on offer? Then click through: does the page deliver the same promise?',
        measure: 'Hook rate, CTR, landing-page conversion rate.',
      },
      {
        name: 'Organic posting',
        summary: 'Unpaid content that builds trust and feeds the ads',
        what: 'Unpaid content on the brand’s own profiles. It builds trust, proof and an audience you don’t rent, and it gives ads their best creative.',
        good: [
          '3–4 content pillars: educate, entertain, prove, sell',
          'Short video first (Reels, TikTok, Shorts); carousels for saves',
          'A rhythm the client can keep. Three to five posts a week beats two weeks of daily posts and then silence.',
          'A hook in the first second or first line of every post',
          'The best organic posts get turned into ads',
        ],
        check:
          'Sort the last 30 posts by reach and saves. Double down on the format and topic of the top 20%.',
        measure: 'Reach, saves and shares (worth more than likes), profile visits, link clicks.',
      },
      {
        name: 'Paid ads: Meta (Facebook & Instagram)',
        summary: 'Simple structure, broad targeting, lots of distinct creative',
        what: 'Paid reach on Facebook and Instagram. Meta now rewards simple structure, broad targeting and many genuinely different creatives. The creative does the targeting.',
        good: [
          'Objective matches the goal: Sales for stores, Leads for services',
          'Few campaigns, broad audiences, Advantage+ placements',
          '3–6 genuinely different creative concepts per ad set',
          'Optimised for Purchase (or Lead), never for clicks',
          'Retargeting audiences and exclusions set up',
          'Hands off for 3–7 days after any significant change',
        ],
        check:
          'In Ads Manager, check each ad set’s learning status, then break results down by placement and age. Switch off ads that have spent 2–3× the target cost per purchase with no sale.',
        measure: 'CPM, hook rate, link CTR, cost per purchase (CPA), ROAS.',
      },
      {
        name: 'Paid ads: Google',
        summary: 'Search, Shopping and YouTube ads for people already looking',
        what: 'Ads shown to people already searching (Search), shopping (Shopping), or watching (YouTube). Google catches demand that already exists.',
        good: [
          'Search campaigns on high-intent keywords (“buy”, “price”, “near me”)',
          'A brand campaign protecting the business name',
          'Negative keywords added weekly from the search terms report',
          'Shopify stores: Merchant Center feed → Shopping / Performance Max',
          'Conversions tracked by the Google Ads tag or GA4, with enhanced conversions on',
        ],
        check:
          'Open the search terms report and read what people actually typed. Add the irrelevant ones as negatives. Check Merchant Center for disapproved products.',
        measure: 'Search impression share, CPC, conversion rate, CPA, ROAS.',
      },
      {
        name: 'Meta integration: Pixel + CAPI',
        summary: 'Browser + server tracking, so every sale is counted once',
        what: 'The Meta Pixel tracks actions in the browser. The Conversions API (CAPI) sends the same actions from the server, so ad blockers and iOS privacy can’t hide them. With a shared event ID, Meta counts each sale once and optimises better.',
        good: [
          'Pixel and CAPI both send PageView, ViewContent, AddToCart, InitiateCheckout and Purchase (Lead for services)',
          'The same event_id on browser and server copies, so Meta deduplicates them',
          'Customer details sent hashed (email, phone, fbp / fbc) to raise match quality',
          'Domain verified in Business Manager',
          'Shopify: the Facebook & Instagram app with data sharing set to Maximum',
          'Custom sites: CAPI from your own server, or Meta’s CAPI Gateway',
        ],
        check:
          'Events Manager → your dataset: each event should list Browser and Server as sources, show deduplication, and have an Event Match Quality score. Use Test Events while you place a test order.',
        measure: 'Event Match Quality (aim for 6+ on Purchase; higher is better), Meta-reported vs Shopify orders.',
      },
      {
        name: 'Google tracking & analytics',
        summary: 'GA4, the Google Ads tag, Merchant Center and consent',
        what: 'The Google side of measurement: GA4 for behaviour, the Google Ads tag for conversions, Merchant Center for products, and consent handled properly.',
        good: [
          'GA4 e-commerce events firing with value and currency',
          'Key events marked (purchase, generate_lead)',
          'Google Ads linked to GA4, with enhanced conversions on',
          'UTMs on every link you control: bio, email, WhatsApp, influencers',
          'Consent mode set up where the law requires it (EU / UK visitors)',
        ],
        check:
          'Open GA4 → Admin → DebugView and place a test order; every step should appear. In Google Ads → Goals, each conversion should say Active.',
        measure: 'GA4 purchases vs Shopify orders (should be close); “Unassigned” traffic (should be tiny).',
      },
      {
        name: 'Analytics & campaign reporting',
        summary: 'One honest weekly report on what the money did',
        what: 'One honest weekly view of what the money did: spend, results, what you learned, what you’ll test next. The report is where you prove your value.',
        good: [
          'Same format, same day, every week',
          'Business numbers first (revenue, orders, MER), platform numbers second',
          'Top and bottom three creatives, each with a one-line why',
          'One learning and one next test, every week',
          'Monthly: channel mix, CAC vs LTV, recommendations',
        ],
        check:
          'Would the client understand the report in 60 seconds without you? If not, cut it down.',
        measure: 'Spend, revenue, MER, CPA, ROAS, AOV, new vs returning customers.',
      },
    ],
    steps: [
      { name: 'ICP & offer', detail: 'Who we target and why they buy now', output: 'Audience + offer one-pager' },
      { name: 'Tracking first', detail: 'Pixel + CAPI, GA4, UTMs, all tested', output: 'Verified test purchase' },
      { name: 'Plan', detail: 'Channels, funnel, budget split', output: 'Media plan' },
      { name: 'Creative batch', detail: '3–6 concepts × 2–3 formats', output: 'Ads + posts' },
      { name: 'Launch & read', detail: 'Judge after 3–7 days, not hourly', output: 'Keep / kill / iterate list' },
      { name: 'Report & scale', detail: 'Raise budgets on winners gradually', output: 'Weekly report' },
    ],
    packages: [
      'Tracking setup (Pixel + CAPI + GA4)',
      'Meta ads management',
      'Google ads management',
      'Organic content plan',
      'Monthly report & strategy call',
    ],
    rules: [
      { label: 'Break-even ROAS', value: '1 ÷ margin', note: 'At 40% gross margin you need 2.5 ROAS just to break even. Know it before launch.' },
      { label: 'MER', value: 'Revenue ÷ spend', note: 'All store revenue ÷ all ad spend. Platforms over-claim; this doesn’t.' },
      { label: 'Learning phase', value: '~50 / week', note: 'Conversions per ad set per week before Meta’s delivery stabilises.' },
      { label: 'Hook rate', value: '25%+', note: '3-second views ÷ impressions. Under ~20%, the opening isn’t stopping thumbs.' },
      { label: 'Link CTR (Meta)', value: '~1%+', note: 'On cold traffic. Far lower means the ad hasn’t earned the click.' },
      { label: 'Kill rule', value: '2–3× CPA', note: 'An ad that spends two to three times the target cost per sale with none gets switched off.' },
      { label: 'Budget split', value: '70 / 20 / 10', note: 'Proven winners / variations of winners / brand-new ideas.' },
      { label: 'COD stores', value: 'Delivered only', note: 'Count revenue on delivered orders. Parcels returned to origin make ROAS look better than it is.' },
    ],
    tools: [
      {
        label: 'Paid',
        tools: [
          { name: 'Meta Ads Manager', role: 'Facebook & Instagram', cost: 'spend', icon: I('meta.png') },
          { name: 'Google Ads', role: 'Search, Shopping, YouTube', cost: 'spend', icon: I('google-ads-96.png') },
          { name: 'TikTok Ads Manager', role: 'Younger audiences', cost: 'spend', mono: 'Tk', tint: '#0F172A' },
          { name: 'LinkedIn Campaign Manager', role: 'B2B decision-makers', cost: 'spend', mono: 'in', tint: '#0A66C2' },
        ],
      },
      {
        label: 'Tracking',
        tools: [
          { name: 'Meta Events Manager', role: 'Pixel + CAPI health', cost: 'free', icon: I('meta.png') },
          { name: 'Google Tag Manager', role: 'Tags without code edits', cost: 'free', mono: 'TM', tint: '#2563EB' },
          { name: 'GA4', role: 'Second opinion on results', cost: 'free', icon: I('google-analytics.webp') },
          { name: 'Merchant Center', role: 'Product feed for Google', cost: 'free', mono: 'MC', tint: '#16A34A' },
          { name: 'Campaign URL Builder', role: 'UTM links', cost: 'free', mono: '?u', tint: '#475569' },
        ],
      },
      {
        label: 'Create & post',
        tools: [
          { name: 'Canva', role: 'Fast variations', cost: 'freemium', mono: 'Ca', tint: '#0891B2' },
          { name: 'CapCut', role: 'Short video edits', cost: 'freemium', mono: 'Cc', tint: '#0F172A' },
          { name: 'Figma', role: 'Statics & layouts', cost: 'freemium', icon: I('figma.webp') },
          { name: 'Meta Business Suite', role: 'Schedule FB & IG', cost: 'free', icon: I('instagram.svg') },
        ],
      },
      {
        label: 'Report',
        tools: [
          { name: 'Looker Studio', role: 'Live client dashboard', cost: 'free', mono: 'Ls', tint: '#4F46E5' },
          { name: 'Google Sheets', role: 'Weekly numbers', cost: 'free', mono: 'Gs', tint: '#16A34A' },
          { name: 'Shopify Analytics', role: 'The source of truth', cost: 'included', icon: I('shopify-96.png') },
        ],
      },
    ],
    corrections: [
      {
        myth: 'Marketing and advertising are the same thing.',
        truth:
          'Advertising is paying for reach. Marketing is the whole system: audience, offer, content, channels and retention. Ads amplify whatever you already have, a weak offer included.',
      },
      {
        myth: 'The Pixel is enough.',
        truth:
          'Browser tracking misses sales to ad blockers and iOS privacy settings. CAPI sends the same events from the server, and the shared event_id stops them being counted twice.',
      },
      {
        myth: 'The ROAS in Ads Manager is the result.',
        truth:
          'That’s Meta’s attribution model. Check it against Shopify revenue ÷ total ad spend (MER). When they disagree, trust the store.',
      },
      {
        myth: 'Good media buyers tweak campaigns every day.',
        truth:
          'Significant edits send ad sets back into learning. Change things in batches, then wait 3–7 days. New creative moves results more than new targeting.',
      },
    ],
  },

  // ── Automation ────────────────────────────────────────────────────────────
  {
    id: 'automation',
    label: 'Automation',
    short: 'Automation',
    accent: '#EA580C',
    role: 'Runs what comes next',
    question: 'What happens after an order or a lead arrives, without anyone lifting a finger?',
    definition:
      'Software that does the repetitive work (confirming orders, updating customers, routing leads, following up, reporting) so the business keeps running while the owner sleeps.',
    promise:
      'Fewer fake and returned COD orders, an instant reply to every lead, customers kept informed, and hours of manual work gone every week.',
    model: {
      title: 'Buy, build, or leave it',
      note: 'The first decision on every automation, then the two flows you’ll sell most often.',
    },
    parts: [
      {
        name: 'Buy or build',
        summary: 'Shopify app, n8n, or leave it manual: decide this first',
        what: 'The first decision, every time. Shopify’s app store already solves most standard store jobs; n8n is for work that’s custom, crosses several apps, or needs AI.',
        good: [
          'Standard store job → a Shopify app or Shopify Flow',
          'Custom, cross-app or AI logic → n8n',
          'Rare or judgement-heavy work → stays manual, with a checklist',
          'Costs compared: app subscription vs your build and maintenance time',
        ],
        check:
          'Before building anything, search the Shopify App Store for the job and read the 1–3 star reviews of the top three apps. If one covers 80% of the need, use it.',
        measure: 'Hours saved per week vs monthly cost.',
      },
      {
        name: 'Shopify built-ins & Flow',
        summary: 'What Shopify already automates out of the box',
        what: 'What Shopify does out of the box: order notifications, abandoned-checkout emails, customer tags, and Shopify Flow for if-this-then-that rules inside the store.',
        good: [
          'Order, shipping and delivery notifications branded and in the customer’s language',
          'Abandoned-checkout email switched on',
          'Flow rules: tag big spenders, flag risky orders, hide sold-out items, low-stock alerts',
        ],
        check:
          'Settings → Notifications: send yourself every template and read them on your phone. Apps → Flow: list what already runs.',
        measure: 'Recovered checkouts, manual tasks removed.',
      },
      {
        name: 'COD order confirmation (bot calls & WhatsApp)',
        summary: 'Bot call or WhatsApp to confirm every cash-on-delivery order',
        what: 'For cash-on-delivery stores: an automatic call or WhatsApp message to every new order asking the buyer to confirm. It cuts fake orders and returns to origin (RTO), which cost shipping both ways.',
        good: [
          'Confirmation sent within minutes of the order, while intent is fresh',
          'Clear choices: press 1 or tap Confirm, press 2 or tap Cancel',
          'The answer written back to the Shopify order as a tag',
          'Only confirmed orders get booked with the courier',
          'No answer → retry, then a human call, then cancel after 24–48 hours',
          'Messages in the customer’s language',
        ],
        check:
          'Compare RTO rate and fake-order share for the 30 days before and after. Place test orders and time how fast the confirmation arrives.',
        measure: 'Confirmation rate, RTO rate, share of orders delivered.',
      },
      {
        name: 'Order & post-purchase operations',
        summary: 'Courier booking, tracking updates and review requests',
        what: 'Everything after confirmation: booking the courier, sending tracking, delivery updates, review requests and stock alerts.',
        good: [
          'Courier booked from Shopify (courier’s app or n8n), tracking saved on the order',
          'WhatsApp updates: confirmed → shipped → out for delivery → delivered',
          'A review request a few days after delivery',
          'Low-stock and failed-delivery alerts to the owner',
          'A daily sales summary to the owner’s WhatsApp',
        ],
        check:
          'Follow one order from checkout to doorstep. Count every manual step and every moment the customer hears nothing.',
        measure: 'Manual touches per order, “where is my order?” messages, review count.',
      },
      {
        name: 'Lead capture → instant reply (n8n)',
        summary: 'Every lead saved and answered in seconds',
        what: 'Every lead (website form, Meta lead ad, WhatsApp) lands in one place and gets a reply in seconds. The fastest reply usually wins the deal.',
        good: [
          'Every source feeds one n8n workflow (a webhook or a trigger node)',
          'Data cleaned and de-duplicated: phone format, email, repeat submissions',
          'Saved to a CRM: Google Sheet, Supabase, HubSpot or similar',
          'An instant WhatsApp or email reply with the next step (booking link, price list)',
          'An alert to you with the lead’s details',
          'Follow-ups on day 1, 3 and 7 if there’s no reply',
        ],
        check:
          'Submit a test lead from every source and time the reply. Anything over five minutes is too slow.',
        measure: 'Time to first reply, lead → call rate, lead → customer rate.',
      },
      {
        name: 'Lead generation (n8n)',
        summary: 'Finding and scoring new prospects automatically',
        what: 'Finding prospects automatically: pulling businesses that fit the ICP, adding contact and presence data, scoring them, and queueing outreach. It’s also how EscaLeads finds its own clients.',
        good: [
          'A source list by niche and city: Google Maps, directories, LinkedIn, Apollo',
          'Enrichment: website, socials, email, phone, platform',
          'An AI score for how weak their digital presence is (your opening)',
          'A personalised first line drafted by AI and reviewed by you',
          'Platform terms and anti-spam rules respected, with an opt-out in every message',
        ],
        check:
          'Run 50 leads through the flow and hand-check 10. Are they real, relevant, and is the data right?',
        measure: 'Qualified leads per week, data accuracy, reply rate, meetings booked.',
      },
      {
        name: 'Reporting automations',
        summary: 'Daily and weekly numbers that arrive on their own',
        what: 'Numbers that arrive on their own: daily sales, weekly ad summaries, the monthly client report.',
        good: [
          'Daily: orders, revenue, confirmations, RTO, sent to WhatsApp or Slack',
          'Weekly: ad spend, MER / ROAS, top creatives',
          'Monthly: the Looker Studio link plus your written summary',
        ],
        check:
          'Does the client ever ask you “how are sales?” If they do, an automation is missing.',
        measure: 'Reports sent on time; questions answered before they’re asked.',
      },
      {
        name: 'Reliability & handover',
        summary: 'Alerts, retries and runbooks, so nothing fails silently',
        what: 'What separates a professional automation from a fragile one: it tells you when it breaks, it never sends twice, and someone else could understand it.',
        good: [
          'An n8n Error Trigger workflow alerts you to any failure',
          'Retries on every step that calls an outside service',
          'Duplicate protection: order or lead ID checked so nothing runs twice',
          'Separate credentials per client, with the client owning their accounts',
          'Workflows backed up (JSON export or Git)',
          'A one-page runbook per workflow: what it does, how to pause it, who to call',
        ],
        check:
          'Break it on purpose with a wrong API key or a missing field. Did you get an alert? Did anything half-run?',
        measure: 'Failed runs per month, time to notice a failure.',
      },
    ],
    steps: [
      { name: 'Map the task', detail: 'Who does it, how often, how many minutes', output: 'Task map' },
      { name: 'Buy or build', detail: 'App Store first, then n8n', output: 'Decision' },
      { name: 'Build', detail: 'On test data, never live orders', output: 'Working flow' },
      { name: 'Harden', detail: 'Error alerts, retries, duplicate checks', output: 'Production flow' },
      { name: 'Watch week', detail: 'Live, checked daily for seven days', output: 'Sign-off' },
      { name: 'Handover', detail: 'Runbook, client-owned access', output: 'Care plan' },
    ],
    packages: [
      'COD confirmation setup',
      'Order updates on WhatsApp',
      'Lead → CRM → instant reply',
      'Reporting pack',
      'Automation care plan',
    ],
    rules: [
      { label: 'Automate when', value: '10× / week', note: 'Or when it eats 2+ hours a week. Below that, a checklist is cheaper.' },
      { label: 'Speed to lead', value: '< 5 min', note: 'Reply within five minutes. Chances of converting fall quickly after that.' },
      { label: 'COD confirmation', value: 'Minutes', note: 'Confirm while intent is fresh; retry unanswered orders, then call by hand.' },
      { label: 'Retries', value: '2–3', note: 'Retry outside-service steps a couple of times with a pause, then alert.' },
      { label: 'Follow-ups', value: 'Day 1 · 3 · 7', note: 'Many replies come from a follow-up, not the first message.' },
      { label: 'WhatsApp window', value: '24 h', note: 'Free-form replies within 24 h of the customer’s last message. Outside that window, approved templates only.' },
    ],
    tools: [
      {
        label: 'Inside Shopify',
        tools: [
          { name: 'Shopify Flow', role: 'Rules inside the store', cost: 'included', icon: I('shopify-96.png') },
          { name: 'COD confirmation app', role: 'Bot call / WhatsApp confirm', cost: 'paid', mono: 'Cod', tint: '#EA580C' },
          { name: 'Courier app', role: 'Booking & tracking', cost: 'paid', mono: 'Cr', tint: '#475569' },
        ],
      },
      {
        label: 'Build',
        tools: [
          { name: 'n8n', role: 'Your workflow engine', cost: 'freemium', icon: I('n8n.svg') },
          { name: 'Webhooks', role: 'Apps talk to n8n', cost: 'free', mono: '{ }', tint: '#475569' },
          { name: 'Google Sheets', role: 'Client-friendly CRM & logs', cost: 'free', mono: 'Gs', tint: '#16A34A' },
          { name: 'Supabase', role: 'A real database', cost: 'freemium', icon: I('supabase.webp') },
        ],
      },
      {
        label: 'Talk to people',
        tools: [
          { name: 'WhatsApp Business API', role: 'Templates & bots', cost: 'paid', icon: I('whatsapp.webp') },
          { name: 'Gmail', role: 'Email follow-ups', cost: 'free', icon: I('gmail.webp') },
          { name: 'Slack', role: 'Alerts to you', cost: 'freemium', icon: I('slack.webp') },
          { name: 'Twilio', role: 'Calls & SMS in custom flows', cost: 'paid', mono: 'Tw', tint: '#DC2626' },
        ],
      },
      {
        label: 'AI',
        tools: [
          { name: 'Claude', role: 'Classify, score, draft', cost: 'paid', icon: I('claude.webp') },
          { name: 'Vapi / Retell', role: 'AI voice agents', cost: 'paid', mono: 'Vo', tint: '#7C3AED' },
        ],
      },
      {
        label: 'Find leads',
        tools: [
          { name: 'Apify', role: 'Google Maps & site scrapers', cost: 'freemium', mono: 'Ap', tint: '#16A34A' },
          { name: 'Apollo', role: 'B2B contacts & enrichment', cost: 'freemium', mono: 'Ao', tint: '#0F172A' },
        ],
      },
      {
        label: 'Run & document',
        tools: [
          { name: 'n8n Cloud or self-host', role: 'Docker on a VPS, with backups', cost: 'freemium', mono: 'Ops', tint: '#EA580C' },
          { name: 'GitHub', role: 'Workflow backups', cost: 'free', icon: I('github.webp') },
          { name: 'Notion', role: 'Runbooks per flow', cost: 'freemium', icon: I('notion.webp') },
        ],
      },
    ],
    corrections: [
      {
        myth: 'Build everything in n8n.',
        truth:
          'Don’t rebuild what a Shopify app already does well. An app is someone else’s maintenance; every n8n flow is yours forever. Build where the value is custom.',
      },
      {
        myth: 'Once it works, it’s done.',
        truth:
          'APIs change, tokens expire, fields go missing. A flow without an error alert fails silently, and the client finds out before you do.',
      },
      {
        myth: 'Message everyone on WhatsApp.',
        truth:
          'The WhatsApp Business API needs opt-in and approved templates for any message the business starts. Spammy flows get numbers restricted or banned.',
      },
      {
        myth: 'Automation replaces the relationship.',
        truth:
          'Automate the routine so human time goes to calls, closing and complaints. Always leave a way to reach a real person.',
      },
    ],
  },
];
