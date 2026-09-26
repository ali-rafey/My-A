import type { PillarId } from './content';
import s from './guide.module.css';

// The diagrams that carry each pillar's model. Plain HTML/CSS so text wraps
// and stays crisp at any width. Every colour comes from the panel's --acc, so
// a diagram takes on its pillar's accent without knowing which one it is in.

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={s.card}>
      <span className={s.cardLabel}>{label}</span>
      {children}
    </div>
  );
}

// ── Digital presence ────────────────────────────────────────────────────────
const JOURNEY = [
  { stage: 'Found', where: 'Social & platform profiles · acquisition', metric: 'Reach, profile visits' },
  { stage: 'Land', where: 'Website / store', metric: 'Speed, engagement' },
  { stage: 'Trust', where: 'UI & UX · reviews · perception', metric: 'Product views' },
  { stage: 'Buy', where: 'CRO · initial → final checkout', metric: 'Conversion rate' },
  { stage: 'Return', where: 'Retention & repeat', metric: 'Repeat rate, LTV' },
];

const FOUNDATION = [
  { name: 'The offer', note: 'What you sell, and why it wins' },
  { name: 'Brand purpose & perception', note: 'Why you exist, what people think' },
  { name: 'Brand kit & logo', note: 'How you look and sound' },
];

function Journey() {
  return (
    <div className={s.journey}>
      <ol className={s.journeyStages}>
        {JOURNEY.map((j, i) => (
          <li key={j.stage} className={s.jStage} style={{ '--o': 0.28 + i * 0.18 } as React.CSSProperties}>
            <span className={s.jNum}>{i + 1}</span>
            <b>{j.stage}</b>
            <i>{j.where}</i>
            <em>{j.metric}</em>
          </li>
        ))}
      </ol>
      <div className={s.foundation}>
        <span className={s.foundationLabel}>Everything stands on</span>
        <div className={s.foundationBlocks}>
          {FOUNDATION.map((f) => (
            <span key={f.name} className={s.fBlock}>
              <b>{f.name}</b>
              <i>{f.note}</i>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Per 1,000 visits on an illustrative healthy store (2% conversion).
const LEAK = [
  { step: 'Visits', n: 1000, event: 'PageView · page_view' },
  { step: 'Viewed a product', n: 450, event: 'ViewContent · view_item' },
  { step: 'Added to cart', n: 60, event: 'AddToCart · add_to_cart' },
  { step: 'Initial checkout', n: 35, event: 'InitiateCheckout · begin_checkout' },
  { step: 'Final checkout', n: 20, event: 'Purchase · purchase' },
];

function Leak() {
  const drops = LEAK.map((x, i) => (i === 0 ? 0 : 1 - x.n / LEAK[i - 1].n));
  const worst = drops.indexOf(Math.max(...drops));
  return (
    <>
      <ol className={s.leak}>
        {LEAK.map((x, i) => (
          <li key={x.step} className={s.leakStep} data-worst={i === worst}>
            {i > 0 ? (
              <span className={s.leakDrop} data-worst={i === worst} aria-label={`${Math.round(drops[i] * 100)}% drop`}>
                −{Math.round(drops[i] * 100)}%
              </span>
            ) : null}
            <b className={s.leakN}>{x.n.toLocaleString('en-US')}</b>
            <span className={s.leakName}>{x.step}</span>
            <span className={s.leakPct}>{x.n / 10}% of visits</span>
            <code className={s.leakEvent}>{x.event}</code>
          </li>
        ))}
      </ol>
      <p className={s.diagramNote}>
        <b>Fix the biggest drop first.</b> Here it’s product page → cart. Shopify Analytics shows this funnel
        for the real store, and the event names under each step (Meta · GA4) are what the Pixel and GA4 record.
      </p>
    </>
  );
}

// ── Research & data ─────────────────────────────────────────────────────────
const QUESTIONS = [
  { lens: 'Market', key: 'Demand', q: 'Is anyone looking for this, and when?', where: ['Google Trends', 'Keyword Planner', 'TikTok Creative Center'] },
  { lens: 'Rivals', key: 'Offer', q: 'What do rivals sell, at what price, with what promise?', where: ['Their store', '/products.json', 'Wayback Machine'] },
  { lens: 'Rivals', key: 'Presence', q: 'How strong are they online?', where: ['Similarweb', 'Semrush / Ahrefs', 'Wappalyzer', 'PageSpeed'] },
  { lens: 'Rivals', key: 'Campaigns', q: 'What ads and content are they paying for?', where: ['Meta Ad Library', 'Google Ads Transparency', 'TikTok Top Ads'] },
  { lens: 'Customers', key: 'Voice', q: 'What do buyers love, hate and wish for?', where: ['3-star reviews', 'Reddit', 'Ad comments'] },
  { lens: 'Client', key: 'Our data', q: 'What is working for the client right now?', where: ['GA4', 'Search Console', 'Clarity', 'Shopify'] },
];

function SixQuestions() {
  return (
    <ol className={s.questions}>
      {QUESTIONS.map((item, i) => (
        <li key={item.key} className={s.question}>
          <span className={s.qTop}>
            <span className={s.qNum}>{i + 1}</span>
            <span className={s.qLens}>{item.lens}</span>
            <span className={s.qKey}>{item.key}</span>
          </span>
          <b className={s.qText}>{item.q}</b>
          <span className={s.qWhere}>
            {item.where.map((w) => <i key={w}>{w}</i>)}
          </span>
        </li>
      ))}
    </ol>
  );
}

const SIGNALS = [
  { sign: 'Running 30+ days', why: 'Advertisers switch off losers within days. Still live after a month means it pays.' },
  { sign: 'Many versions of one idea', why: 'Same concept, different hooks, sizes or faces: they’re scaling it.' },
  { sign: 'Several countries or languages', why: 'A proven winner being rolled into new markets.' },
  { sign: 'Many ads, one landing page', why: 'That page converts. Study it.' },
  { sign: 'Real buyer comments', why: 'Questions about price, size and delivery mean real demand.' },
];

function WinnerSignals() {
  return (
    <>
      <ul className={s.signals}>
        {SIGNALS.map((x) => (
          <li key={x.sign}>
            <b>{x.sign}</b>
            <i>{x.why}</i>
          </li>
        ))}
      </ul>
      <p className={s.diagramNote}>
        <b>Ad libraries never show sales or ROAS.</b> These signals are how you read performance from the outside.
      </p>
    </>
  );
}

const TEARDOWN_COLS = ['Rival', 'Hero offer & price', 'Promise / hook', 'Risk reversal', 'Traffic (est.)', 'Live ads', 'Customers complain', 'Our opening'];
const TEARDOWN_ROWS = [
  ['Rival A', 'Bundle of 3, 20% off', '“Results in 14 days”', 'COD + 7-day return', '~40k / mo · 60% social', '23 · oldest 94 days', 'Slow delivery, sizing', 'Next-day city delivery + size guide'],
  ['Rival B', 'Single item, premium price', '“Made by hand”', 'None stated', '~12k / mo · 70% search', '4 · oldest 12 days', 'Price, no reviews', 'Social proof + a guarantee'],
];

function TeardownSheet() {
  return (
    <>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>{TEARDOWN_COLS.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
          </thead>
          <tbody>
            {TEARDOWN_ROWS.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={s.diagramNote}>
        <b>Example rows.</b> One sheet per client, same columns every time. The last column becomes the offer and
        the ad angles.
      </p>
    </>
  );
}

// ── Marketing & advertising ─────────────────────────────────────────────────
const CHAIN = [
  { t: 'ICP', d: 'Who exactly buys' },
  { t: 'Offer', d: 'Why they’d buy now' },
  { t: 'Channel', d: 'Where they already are' },
  { t: 'Funnel', d: 'What moves them each step' },
  { t: 'Track', d: 'Pixel + CAPI, GA4, UTMs' },
  { t: 'Launch', d: 'Organic + paid, tested' },
  { t: 'Report', d: 'What the money did' },
];

function Chain() {
  return (
    <ol className={s.chain}>
      {CHAIN.map((c, i) => (
        <li key={c.t} className={s.link} data-gate={c.t === 'Track'}>
          <span className={s.linkNum}>{i + 1}</span>
          <b>{c.t}</b>
          <i>{c.d}</i>
        </li>
      ))}
    </ol>
  );
}

const PICKER = [
  { icp: 'Young consumers, visual or impulse products', go: 'TikTok, Instagram Reels, Meta ads' },
  { icp: 'Adults 25–55, everyday consumer products', go: 'Facebook + Instagram (Meta ads)' },
  { icp: 'People already searching for the solution', go: 'Google Search + Shopping' },
  { icp: 'Local customers: clinic, salon, restaurant', go: 'Google Business Profile, Google Search, local Meta ads' },
  { icp: 'Businesses and decision-makers (B2B)', go: 'LinkedIn, Google Search, email outreach' },
  { icp: 'Products that need explaining', go: 'YouTube, retargeting, email' },
];

function ChannelPicker() {
  return (
    <ul className={s.picker}>
      {PICKER.map((p) => (
        <li key={p.icp}>
          <span className={s.pickIf}>{p.icp}</span>
          <span className={s.pickArrow} aria-hidden="true" />
          <b className={s.pickGo}>{p.go}</b>
        </li>
      ))}
    </ul>
  );
}

function SignalPath() {
  return (
    <>
      <div className={s.signal}>
        <div className={s.signalSources}>
          <span className={s.signalBox}><i>Browser</i><b>Meta Pixel</b></span>
          <span className={s.signalBox}><i>Server</i><b>Conversions API</b></span>
        </div>
        <span className={s.signalJoin}><em>same event_id</em></span>
        <span className={`${s.signalBox} ${s.signalHub}`}><i>Events Manager</i><b>Counts each sale once</b></span>
        <span className={s.signalArrow} aria-hidden="true" />
        <span className={s.signalBox}><i>Match quality</i><b>More sales matched to ads</b></span>
        <span className={s.signalArrow} aria-hidden="true" />
        <span className={`${s.signalBox} ${s.signalEnd}`}><i>Result</i><b>Cheaper, better buyers</b></span>
      </div>
      <p className={s.diagramNote}>
        <b>Google does the same job</b> with the Google Ads tag, enhanced conversions and GA4.
      </p>
    </>
  );
}

const FUNNEL = [
  { stage: 'Awareness', temp: 'Cold', who: 'Strangers who fit the ICP', organic: 'Reels, TikToks, trends, education', paid: 'Broad video ads on Meta, TikTok, YouTube', watch: 'Hook rate · CPM' },
  { stage: 'Consideration', temp: 'Warm', who: 'Watched, engaged or visited', organic: 'Carousels, reviews, how-tos, behind the scenes', paid: 'Retarget viewers and visitors with proof', watch: 'CTR · page conversion' },
  { stage: 'Conversion', temp: 'Hot', who: 'Added to cart, started checkout', organic: 'Stories with the offer, fast DM replies', paid: 'Catalog ads, Google Search & Shopping', watch: 'CPA · ROAS' },
  { stage: 'Retention', temp: 'Customer', who: 'Bought at least once', organic: 'Email, WhatsApp, community', paid: 'Cross-sell, lookalikes of buyers', watch: 'Repeat rate · LTV' },
];

function FunnelMap() {
  return (
    <div className={s.tableWrap}>
      <table className={`${s.table} ${s.funnelTable}`}>
        <thead>
          <tr>
            <th scope="col">Stage</th>
            <th scope="col">Who they are</th>
            <th scope="col">Organic</th>
            <th scope="col">Paid</th>
            <th scope="col">Watch</th>
          </tr>
        </thead>
        <tbody>
          {FUNNEL.map((f) => (
            <tr key={f.stage}>
              <th scope="row">
                <span className={s.stageTag}>{f.stage}</span>
                <i className={s.stageTemp}>{f.temp}</i>
              </th>
              <td>{f.who}</td>
              <td>{f.organic}</td>
              <td>{f.paid}</td>
              <td className={s.watch}>{f.watch}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Automation ──────────────────────────────────────────────────────────────
function BuyOrBuild() {
  return (
    <div className={s.tree}>
      <div className={s.treeRow}>
        <div className={s.treeQ}>
          <span>Q1</span>
          <b>Is it a standard store job?</b>
          <i>Order confirmation, abandoned cart, reviews, courier booking, order updates</i>
        </div>
        <span className={s.treeYes}>If yes</span>
        <div className={s.treeA} data-kind="buy">
          <b>Buy it</b>
          <i>A Shopify app or Shopify Flow. Live today, maintained by someone else.</i>
        </div>
      </div>
      <span className={s.treeNo}>If no</span>
      <div className={s.treeRow}>
        <div className={s.treeQ}>
          <span>Q2</span>
          <b>Does it happen 10+ times a week, or eat 2+ hours?</b>
          <i>Lead replies, CRM updates, reports, anything across several apps or needing AI</i>
        </div>
        <span className={s.treeYes}>If yes</span>
        <div className={s.treeA} data-kind="build">
          <b>Build it in n8n</b>
          <i>Custom and cross-app, and yours to own, so it needs alerts, retries and a runbook.</i>
        </div>
      </div>
      <span className={s.treeNo}>If no</span>
      <div className={s.treeRow}>
        <div className={s.treeA} data-kind="manual">
          <b>Leave it manual</b>
          <i>Write a checklist. Revisit when it grows.</i>
        </div>
      </div>
    </div>
  );
}

const COD_OUTCOMES = [
  { key: 'Confirmed', how: 'Presses 1 or taps Confirm', then: 'Tag “confirmed” → book the courier', kind: 'ok' },
  { key: 'Cancelled', how: 'Presses 2 or taps Cancel', then: 'Cancel the order → restock', kind: 'stop' },
  { key: 'No answer', how: 'Missed call, no reply', then: 'Retry 2× → human call → cancel after 24–48 h', kind: 'wait' },
];

function CodFlow() {
  return (
    <>
      <div className={s.cod}>
        <div className={s.codNode}>
          <i>Trigger</i>
          <b>New COD order in Shopify</b>
        </div>
        <span className={s.codArrow} aria-hidden="true" />
        <div className={`${s.codNode} ${s.codHub}`}>
          <i>Within minutes</i>
          <b>Bot call or WhatsApp</b>
        </div>
        <span className={s.codArrow} aria-hidden="true" />
        <ul className={s.codOutcomes}>
          {COD_OUTCOMES.map((o) => (
            <li key={o.key} data-kind={o.kind}>
              <b>{o.key}</b>
              <i>{o.how}</i>
              <span>{o.then}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className={s.diagramNote}>
        <b>Usually a Shopify app, not a build.</b> Reach for n8n + Twilio or an AI voice agent only when the
        client needs custom logic the apps can’t do.
      </p>
    </>
  );
}

const LEAD_STEPS = [
  { t: 'Lead arrives', d: 'Site form · Meta lead ad · WhatsApp' },
  { t: 'n8n trigger', d: 'Webhook or trigger node' },
  { t: 'Clean & de-dupe', d: 'Phone format, email, repeats' },
  { t: 'Score & sort', d: 'AI step: service, budget, urgency' },
  { t: 'Save to CRM', d: 'Sheet · Supabase · HubSpot' },
  { t: 'Instant reply', d: 'WhatsApp or email, in seconds' },
  { t: 'Alert you', d: 'Lead details to Slack or WhatsApp' },
  { t: 'Follow up', d: 'Day 1 · 3 · 7 if no reply' },
];

function LeadFlow() {
  return (
    <div className={s.leadFlow}>
      <ol className={s.leadSteps}>
        {LEAD_STEPS.map((x, i) => (
          <li key={x.t}>
            <span className={s.nodeDot}>{i + 1}</span>
            <b>{x.t}</b>
            <i>{x.d}</i>
          </li>
        ))}
      </ol>
      <div className={s.errorPath}>
        <b>If any step fails</b>
        <span>Error workflow → alert you with the lead attached, so nobody is left without a reply</span>
      </div>
    </div>
  );
}

// ── Per-pillar layout ───────────────────────────────────────────────────────
export function PillarModel({ id }: { id: PillarId }) {
  if (id === 'presence') {
    return (
      <div className={s.stackGap}>
        <Journey />
        <Card label="Where the money leaks: per 1,000 visits">
          <Leak />
        </Card>
      </div>
    );
  }

  if (id === 'research') {
    return (
      <div className={s.stackGap}>
        <SixQuestions />
        <Card label="Is that competitor ad a winner? Read the signals">
          <WinnerSignals />
        </Card>
        <Card label="The teardown sheet: questions 2–5 in one place">
          <TeardownSheet />
        </Card>
      </div>
    );
  }

  if (id === 'marketing') {
    return (
      <div className={s.stackGap}>
        <Chain />
        <div className={s.pair}>
          <Card label="Channel picker: if the ICP is…, start with…">
            <ChannelPicker />
          </Card>
          <Card label="Pixel + CAPI: how the signal should flow">
            <SignalPath />
          </Card>
        </div>
        <Card label="Funnel map: what to show each stage">
          <FunnelMap />
        </Card>
      </div>
    );
  }

  return (
    <div className={s.stackGap}>
      <Card label="Buy or build: ask in this order">
        <BuyOrBuild />
      </Card>
      <Card label="COD order confirmation">
        <CodFlow />
      </Card>
      <Card label="Lead → instant reply, in n8n">
        <LeadFlow />
      </Card>
    </div>
  );
}
