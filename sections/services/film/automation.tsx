/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from 'react';
import k from './kit.module.css';
import s from './automation.module.css';
import type { Film } from './CardFilm';
import { at, Check, cx, GmailMark, IMG, N8nMark, Odo, SheetsMark, ShopBag, SlackMark, UpArrow, WhatsAppMark, v } from './kit';

// =============================================================================
// Automation — busywork that runs itself.
//   1 n8n workflows         the store's workflows, switched on
//   2 Order & lead routing  each order and lead goes to the right place
//   3 WhatsApp & email      the customer hears back the minute it happens
//   4 CRM                   every step lands on the customer's record
// The example business (Fanaar) and every figure are illustrative.
// =============================================================================

const FormMark = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2.5" fill="#7C5CFF" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const SwitchMark = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d="M3 12h6M9 12l5-6h7M9 12h12M9 12l5 6h7" fill="none" stroke="#1F6FE5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const WaitMark = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <circle cx="12" cy="12" r="8" fill="none" stroke="#8A94A6" strokeWidth="1.8" /><path d="M12 8v4l3 2" fill="none" stroke="#8A94A6" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const FLOWS: { name: string; chain: ReactNode[]; when: string }[] = [
  { name: 'Order follow-up', chain: [<ShopBag key="a" />, <SheetsMark key="b" />, <WhatsAppMark key="c" />], when: 'every order' },
  { name: 'Lead routing', chain: [<FormMark key="a" />, <SwitchMark key="b" />, <SlackMark key="c" />], when: 'every new lead' },
  { name: 'Review request', chain: [<ShopBag key="a" />, <WaitMark key="b" />, <GmailMark key="c" />], when: '7 days after delivery' },
  { name: 'Low-stock alert', chain: [<ShopBag key="a" />, <SwitchMark key="b" />, <SlackMark key="c" />], when: 'under 20 m left' },
  { name: 'Abandoned cart', chain: [<ShopBag key="a" />, <WaitMark key="b" />, <WhatsAppMark key="c" />], when: 'after 1 hour' },
];

function Workflows() {
  return (
    <div className={k.fill}>
      <div className={cx(s.app, k.frameIn)} style={at(60)}>
        <div className={s.appTop}>
          <N8nMark size={18} />
          <b>Overview</b>
          <span className={s.appSub}>Fanaar · Production</span>
          <em className={s.create}>Create workflow</em>
        </div>
        <div className={s.stats}>
          <div><span>Executions this week</span><b><Odo value="1,284" d={500} /></b><em className={k.up}><UpArrow size={9} />18%</em></div>
          <div><span>Failure rate</span><b>0%</b><em className={s.ok}>All green</em></div>
          <div><span>Time saved</span><b><Odo value="42" d={650} /> h</b><em className={s.ok}>this week</em></div>
        </div>
        <div className={s.listTabs}><em>Workflows</em><span>Credentials</span><span>Executions</span></div>
        <div className={s.list}>
          {FLOWS.map((f, i) => (
            <div key={f.name} className={cx(s.flow, k.rise)} style={at(700 + i * 120)}>
              <b>{f.name}</b>
              <span className={s.chain}>
                {f.chain.map((m, j) => (
                  <span key={j} className={s.chainNode}>{m}</span>
                ))}
              </span>
              <span className={s.when}>Runs on {f.when}</span>
              <span className={s.toggle} style={at(1600 + i * 280)}><i /></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Wire paths in the editor body's own coordinates (584 × 364).
const IN_ORDER = 'M104 92 C172 92 170 182 236 182';
const IN_LEAD = 'M104 272 C172 272 170 182 236 182';
const OUT = ['M304 182 C382 182 370 70 446 70', 'M304 182 H446', 'M304 182 C382 182 370 294 446 294'];
const ITEMS = [
  { t: 'Order · $189', path: `${IN_ORDER} H304 ${OUT[0].slice(8)}`, d: 450, to: 0 },
  { t: 'Lead · wholesale', path: `${IN_LEAD} H304 ${OUT[1].slice(8)}`, d: 1250, to: 1 },
  { t: 'Order · $40', path: `${IN_ORDER} H304 ${OUT[2].slice(8)}`, d: 2050, to: 2 },
];
const TRAVEL = 1500;

function Node({ x, y, icon, title, sub, trigger, done }: { x: number; y: number; icon: ReactNode; title: string; sub: string; trigger?: boolean; done?: number }) {
  return (
    <div className={cx(s.node, trigger && s.trigger)} style={v({ left: `${x - 34}px`, top: `${y - 34}px` })}>
      {icon}
      <span className={s.nodeText}><b>{title}</b><em>{sub}</em></span>
      {done !== undefined ? (
        <>
          <i className={cx(s.nodeDone, k.pop)} style={at(done)}><Check size={10} /></i>
          <span className={cx(s.nodeCount, k.pop)} style={at(done + 80)}>1 item</span>
        </>
      ) : null}
    </div>
  );
}

function Routing() {
  return (
    <div className={k.fill}>
      <div className={cx(s.app, k.frameIn)} style={at(60)}>
        <div className={s.appTop}>
          <N8nMark size={18} />
          <b>Route orders &amp; leads</b>
          <span className={s.activePill}><i />Active</span>
          <span className={s.saved}>Saved</span>
        </div>
        <div className={s.canvas}>
          <svg className={s.wires} viewBox="0 0 584 364" aria-hidden="true">
            {[IN_ORDER, IN_LEAD, ...OUT].map((d) => <path key={d} className={s.wire} d={d} />)}
            {ITEMS.map((it) => (
              <path key={it.t} className={cx(s.lit, k.draw)} style={at(it.d + TRAVEL * 0.55)} pathLength={1} d={OUT[it.to]} />
            ))}
          </svg>
          <Node x={70} y={92} trigger icon={<ShopBag size={30} />} title="Shopify" sub="New order" />
          <Node x={70} y={272} trigger icon={<FormMark />} title="Website form" sub="New lead" />
          <Node x={270} y={182} icon={<SwitchMark />} title="Switch" sub="Route by type & value" />
          <Node x={480} y={70} icon={<SlackMark size={28} />} title="Slack" sub="#vip-orders" done={ITEMS[0].d + TRAVEL} />
          <Node x={480} y={182} icon={<GmailMark size={28} />} title="Gmail" sub="Wholesale desk" done={ITEMS[1].d + TRAVEL} />
          <Node x={480} y={294} icon={<SheetsMark size={28} />} title="Sheets" sub="Orders log" done={ITEMS[2].d + TRAVEL} />
          <div className={cx(s.sticky, k.rise)} style={at(300)}>
            <b>Rules</b>
            <span>Over $150 → VIP team</span>
            <span>Wholesale lead → desk</span>
            <span>Everything → orders log</span>
          </div>
          {ITEMS.map((it) => (
            <span key={it.t} className={s.item} style={v({ offsetPath: `path('${it.path}')`, '--d': `${it.d}ms`, '--travel': `${TRAVEL}ms` })}>
              {it.t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Messages() {
  return (
    <div className={k.fill}>
      <div className={cx(k.phone, k.frameIn, s.waPhone)} style={at(60)}>
        <div className={k.phoneScreen}>
          <div className={s.waHead}>
            <i className={s.waAvatar}>F</i>
            <span><b>Fanaar <em><Check size={8} /></em></b><small>Business account</small></span>
          </div>
          <div className={s.waChat}>
            <span className={s.waDay}>Today</span>
            <p className={cx(s.bubble, k.rise)} style={at(500)}>Hi Sara, thanks for your order #1047!<small>12:04</small></p>
            <p className={cx(s.bubble, s.bubbleImg, k.rise)} style={at(1200)}>
              <img src={IMG.product} alt="" />
              Packed today and on its way.<small>12:04</small>
            </p>
            <p className={cx(s.bubble, k.rise)} style={at(1900)}>Track it: <u>fanaar.online/t/1047</u><small>12:05</small></p>
            <p className={cx(s.typing, k.fadeIn)} style={at(2500)}><i /><i /><i /></p>
            <p className={cx(s.bubble, s.bubbleOut, k.rise)} style={at(3100)}>Love it, thank you!<small>12:09 <Check size={9} /></small></p>
          </div>
          <div className={s.waInput}><span>Message</span><i /></div>
        </div>
      </div>

      <div className={cx(s.mail, k.frameIn)} style={at(1400)}>
        <div className={s.mailTop}><GmailMark size={16} /><b>Inbox</b><span>1 of 2,048</span></div>
        <div className={s.mailBody}>
          <b className={s.subject}>Your linen is on its way</b>
          <span className={s.from}><i>F</i><span><b>Fanaar</b> &lt;hello@fanaar.online&gt;<em>to Sara · 12:04</em></span></span>
          <img src={IMG.swatches} alt="" />
          <span className={s.mailText}>Hi Sara, your 3 m of Stonewashed Linen shipped today. It should arrive by Friday.</span>
          <em className={s.track}>Track order</em>
        </div>
      </div>
      <span className={cx(k.badge, k.pop, s.sentBy)} style={at(2300)}><N8nMark size={15} />Sent automatically by n8n · 12:04</span>
      <span className={cx(k.badge, k.pop, s.review)} style={at(3400)}><GmailMark size={14} />Review request · scheduled for day 7</span>
    </div>
  );
}

const TIMELINE = [
  { icon: <ShopBag size={15} />, t: 'Order #1047 · $189.00', m: 'Shopify · 12:02', d: 500 },
  { icon: <WhatsAppMark size={15} />, t: 'WhatsApp sent · delivered', m: 'n8n · 12:04', d: 1100 },
  { icon: <GmailMark size={15} />, t: 'Email opened · “Your linen is on its way”', m: '12:31', d: 1700 },
  { icon: <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m8 1.6 1.9 4.1 4.5.5-3.4 3 1 4.4L8 11.3l-4 2.3 1-4.4-3.4-3 4.5-.5Z" fill="#F4B400" /></svg>, t: 'Review left · 5 stars', m: 'Day 7', d: 2300 },
  { icon: <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2.5 8.2V3.5a1 1 0 0 1 1-1h4.7l5.3 5.3-5.7 5.7Z" fill="none" stroke="#7C5CFF" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="5.6" cy="5.6" r="1" fill="#7C5CFF" /></svg>, t: 'Tagged VIP · lifetime value over $400', m: 'n8n · automatic', d: 2900 },
];

function Crm() {
  return (
    <div className={k.fill}>
      <div className={cx(s.app, k.frameIn)} style={at(60)}>
        <div className={s.appTop}>
          <span className={s.crmMark}>C</span>
          <b>Contacts</b>
          <span className={s.appSub}>› Sara Malik</span>
        </div>
        <div className={s.crm}>
          <div className={s.profile}>
            <span className={s.avatar}>SM</span>
            <b>Sara Malik</b>
            <span className={s.email}>sara.m@example.com</span>
            <span className={s.stages}>
              <em className={s.stage1}>Lead</em>
              <em className={s.stage2}>Customer</em>
              <em className={s.stage3}>Repeat buyer</em>
            </span>
            <dl className={s.props}>
              <dt>Orders</dt><dd><Odo value="3" d={2400} /></dd>
              <dt>Lifetime value</dt><dd>$<Odo value="486" d={2550} /></dd>
              <dt>Source</dt><dd>Instagram ad</dd>
              <dt>Tags</dt><dd><em className={cx(s.vip, k.pop)} style={at(3000)}>VIP</em></dd>
            </dl>
          </div>
          <div className={s.activity}>
            <b className={s.activityHead}>Activity</b>
            <div className={s.timeline}>
              {TIMELINE.map((e) => (
                <div key={e.t} className={cx(s.event, k.rise)} style={at(e.d)}>
                  <i>{e.icon}</i>
                  <span><b>{e.t}</b><em>{e.m}</em></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <span className={cx(k.badge, k.pop, s.logged)} style={at(3400)}><N8nMark size={15} />Logged by n8n · 0 manual entries</span>
    </div>
  );
}

export const AUTOMATION: Film = {
  order: [0, 1, 2, 3],
  shots: [
    { dur: 5000, tone: 'dark', Comp: Workflows },
    { dur: 5200, tone: 'dark', Comp: Routing },
    { dur: 5200, tone: 'dark', Comp: Messages },
    { dur: 5200, tone: 'dark', Comp: Crm },
  ],
};
