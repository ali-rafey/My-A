import s from './guide.module.css';

// The diagrams that carry each category's big idea. Plain HTML/CSS where the
// text needs to wrap and stay crisp, SVG only where the shape IS the idea
// (the nested circles). Every colour comes from the panel's --acc, so a
// diagram takes on its category's accent without knowing which one it is in.

// ── Software ────────────────────────────────────────────────────────────────
const RUNGS = [
  { name: 'Shopify storefront', gain: 'Fastest route to revenue' },
  { name: 'Marketing site', gain: 'Brand, SEO and leads' },
  { name: 'Web app', gain: 'Logins, dashboards, payments' },
  { name: 'Business software', gain: 'Admin portals, CRMs, internal tools' },
];

export function OfferLadder() {
  return (
    <div className={s.ladder}>
      <div className={s.ladderBars}>
        {RUNGS.map((r, i) => (
          <div key={r.name} className={s.rung} style={{ '--h': `${38 + i * 19}%`, '--o': 0.35 + i * 0.2 } as React.CSSProperties}>
            <span className={s.rungBar}>
              <b>0{i + 1}</b>
              <i className={s.rungYou}>You build this</i>
            </span>
            <span className={s.rungName}>{r.name}</span>
            <span className={s.rungGain}>{r.gain}</span>
          </div>
        ))}
      </div>
      <p className={s.diagramNote}>
        <b>Productise every rung.</b> Same scope, same price, same starter — each build gets faster than the last.
      </p>
    </div>
  );
}

// ── Research ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { key: 'Demand', q: 'Is anyone looking for this?', where: ['Google Trends', 'Keyword Planner', 'Search Console'] },
  { key: 'Competition', q: 'What are rivals running and selling?', where: ['Meta Ad Library', 'TikTok Creative Center', 'SimilarWeb'] },
  { key: 'Customer', q: 'What do buyers say, in their own words?', where: ['Reddit threads', 'Product reviews', 'Ad comments'] },
  { key: 'Performance', q: 'What is actually working?', where: ['GA4', 'Microsoft Clarity', 'Looker Studio'] },
];

export function FourQuestions() {
  return (
    <div className={s.questions}>
      {QUESTIONS.map((item, i) => (
        <div key={item.key} className={s.question}>
          <span className={s.qNum}>{i + 1}</span>
          <span className={s.qKey}>{item.key}</span>
          <b className={s.qText}>{item.q}</b>
          <span className={s.qWhere}>
            {item.where.map((w) => <i key={w}>{w}</i>)}
          </span>
        </div>
      ))}
      <p className={`${s.diagramNote} ${s.span2}`}>
        <b>Every client needs all four answered.</b> Ad Library and Trends only touch the first two — the other half is where the insight is.
      </p>
    </div>
  );
}

// ── Marketing ───────────────────────────────────────────────────────────────
const LEVERS = [
  { t: 'Brand', x: 180, y: 52 },
  { t: 'SEO', x: 98, y: 94 },
  { t: 'Content', x: 262, y: 94 },
  { t: 'Email', x: 76, y: 156 },
  { t: 'Social', x: 284, y: 156 },
  { t: 'Partners', x: 102, y: 216 },
  { t: 'Referrals', x: 258, y: 216 },
];

export function MarketingVsAdvertising() {
  return (
    <div className={s.mva}>
      <svg className={s.mvaArt} viewBox="0 0 360 300" role="img" aria-label="Advertising is one lever inside marketing">
        <circle cx="180" cy="150" r="140" className={s.mvaOuter} />
        {LEVERS.map((l) => (
          <g key={l.t}>
            <rect x={l.x - l.t.length * 3.6 - 10} y={l.y - 11} width={l.t.length * 7.2 + 20} height="22" rx="11" className={s.mvaPill} />
            <text x={l.x} y={l.y + 4} textAnchor="middle" className={s.mvaPillText}>{l.t}</text>
          </g>
        ))}
        <circle cx="180" cy="156" r="50" className={s.mvaInner} />
        <text x="180" y="153" textAnchor="middle" className={s.mvaInnerText}>Advertising</text>
        <text x="180" y="170" textAnchor="middle" className={s.mvaInnerSub}>paid reach</text>
        <text x="180" y="266" textAnchor="middle" className={s.mvaLabel}>MARKETING</text>
      </svg>

      <div className={s.mvaDefs}>
        <div className={s.mvaDef}>
          <span className={s.mvaTag}>Marketing</span>
          <b>Everything that makes the right people want what you sell.</b>
          <ul>
            <li>Audience, positioning, offer, content, retention</li>
            <li>Owned, earned <em>and</em> paid channels</li>
            <li>Compounds — it keeps working after you stop</li>
          </ul>
        </div>
        <div className={`${s.mvaDef} ${s.mvaDefSolid}`}>
          <span className={s.mvaTag}>Advertising</span>
          <b>Paying to put a message in front of people.</b>
          <ul>
            <li>One lever inside marketing</li>
            <li>Fast, measurable, scalable</li>
            <li>Rented — it stops when the spend stops</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const STAGES = [
  { name: 'Awareness', goal: 'Reach new people', metric: 'CPM · hook rate' },
  { name: 'Consideration', goal: 'Earn their trust', metric: 'CTR · landing CVR' },
  { name: 'Conversion', goal: 'Ask for the sale', metric: 'CPA · ROAS' },
  { name: 'Retention', goal: 'Bring them back', metric: 'Repeat rate · LTV' },
];

export function Funnel() {
  return (
    <div className={s.funnel}>
      {STAGES.map((st, i) => (
        <div key={st.name} className={s.stage} style={{ '--w': `${100 - i * 14}%`, '--o': 0.95 - i * 0.18 } as React.CSSProperties}>
          <span className={s.stageBar}>
            <b>{st.name}</b>
            <i>{st.goal}</i>
          </span>
          <span className={s.stageMetric}>{st.metric}</span>
        </div>
      ))}
    </div>
  );
}

export function SignalPath() {
  return (
    <div className={s.signal}>
      <div className={s.signalSources}>
        <span className={s.signalBox}><i>Browser</i><b>Meta Pixel</b></span>
        <span className={s.signalBox}><i>Server</i><b>Conversions API</b></span>
      </div>
      <span className={s.signalJoin}>
        <em>same event_id</em>
      </span>
      <span className={`${s.signalBox} ${s.signalHub}`}><i>Events Manager</i><b>Deduplicates</b></span>
      <span className={s.signalArrow} aria-hidden="true" />
      <span className={s.signalBox}><i>Result</i><b>Higher match quality</b></span>
      <span className={s.signalArrow} aria-hidden="true" />
      <span className={`${s.signalBox} ${s.signalEnd}`}><i>Result</i><b>Better optimisation</b></span>
    </div>
  );
}

// ── Automation ──────────────────────────────────────────────────────────────
const ANATOMY = [
  { part: 'Trigger', example: 'New Shopify order' },
  { part: 'Filter', example: 'Only paid orders' },
  { part: 'Transform', example: 'Shape the record' },
  { part: 'Action', example: 'Sheet + WhatsApp' },
  { part: 'Alert', example: 'Slack if it fails' },
];

export function WorkflowAnatomy() {
  return (
    <div className={s.anatomy}>
      {ANATOMY.map((a, i) => (
        <div key={a.part} className={s.node} data-last={i === ANATOMY.length - 1}>
          <span className={s.nodeDot}>{i + 1}</span>
          <b>{a.part}</b>
          <i>{a.example}</i>
        </div>
      ))}
    </div>
  );
}

export function PriorityMatrix() {
  return (
    <div className={s.matrix}>
      <span className={s.axisY}>How often it happens →</span>
      <div className={s.matrixGrid}>
        <div className={s.cell2}><b>Automate when cheap</b><i>Notifications, reminders</i></div>
        <div className={`${s.cell2} ${s.cellHot}`}><b>Automate first</b><i>Lead routing, order logging</i></div>
        <div className={`${s.cell2} ${s.cellCold}`}><b>Leave it manual</b><i>One-off tasks</i></div>
        <div className={s.cell2}><b>Template it</b><i>Monthly reports, onboarding</i></div>
      </div>
      <span className={s.axisX}>Minutes it takes each time →</span>
    </div>
  );
}

const MENU = [
  'Lead → CRM → instant WhatsApp reply',
  'Order → sheet → customer message',
  'Abandoned-cart reminder',
  'Weekly ads report to Slack',
  'Form → proposal draft (AI)',
  'Review request after delivery',
];

export function AutomationMenu() {
  return (
    <div className={s.menu}>
      {MENU.map((m) => (
        <span key={m} className={s.menuItem}>{m}</span>
      ))}
    </div>
  );
}
