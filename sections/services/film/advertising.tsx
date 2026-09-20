/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from 'react';
import k from './kit.module.css';
import s from './advertising.module.css';
import type { Film } from './CardFilm';
import { at, Check, Cursor, cx, GoogleAdsMark, IMG, MetaMark, Odo, Tap, Title, Typed, UpArrow } from './kit';

// =============================================================================
// Advertising — ads that pay for themselves.
//   1 Meta Ads           the campaign is set up and published
//   2 Google Ads         the ad and the Shopping listings on the search page
//   3 Pixel & tracking   every step of a purchase lands in Events Manager
//   4 Creative & scaling the winning ad is kept and its budget scaled
// The example business (Fanaar) and every figure are illustrative.
// =============================================================================

const TickRow = ({ d, label, children }: { d: number; label: string; children: ReactNode }) => (
  <div className={cx(s.setup, k.rise)} style={at(d)}>
    <span className={s.setupHead}>
      <b>{label}</b>
      <i className={k.pop} style={at(d + 700)}><Check size={11} /></i>
    </span>
    {children}
  </div>
);

function Meta() {
  return (
    <div className={k.fill}>
      <div className={cx(s.am, k.frameIn)} style={at(60)}>
        <div className={s.amTop}>
          <MetaMark size={13} />
          <b>Ads Manager</b>
          <span className={s.account}>Fanaar Textile</span>
          <span className={s.crumbs}><em>Campaign</em> › <em>Ad set</em> › <em>Ad</em></span>
        </div>
        <div className={s.amBody}>
          <div className={s.amLeft}>
            <TickRow d={350} label="Campaign objective">
              <span className={s.objective}>
                <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M2 2.5h2l1.4 7.2a1 1 0 0 0 1 .8h5.2a1 1 0 0 0 1-.8L13.5 5H4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Sales
              </span>
            </TickRow>
            <TickRow d={900} label="Audience">
              <span className={s.chips}>
                {['Women 25–44', 'UK · US · UAE', 'Home décor', 'Sewing'].map((c, i) => (
                  <em key={c} className={k.pop} style={at(1100 + i * 110)}>{c}</em>
                ))}
              </span>
              <span className={s.reach}>Estimated reach <b>1.2M – 1.6M</b><i><b className={k.growX} style={at(1450)} /></i></span>
            </TickRow>
            <TickRow d={1500} label="Budget">
              <span className={s.budget}><b>$40.00</b> daily · Advantage+ placements</span>
            </TickRow>
          </div>
          <div className={s.preview}>
            <span className={s.previewLabel}>Ad preview · Instagram feed</span>
            <div className={cx(s.post, k.rise)} style={at(700)}>
              <div className={s.postHead}><i>F</i><span><b>fanaar.textile</b><em>Sponsored</em></span></div>
              <img src={IMG.swatches} alt="" />
              <div className={s.postCta}>Shop now <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="m6 3.5 4.5 4.5L6 12.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <span className={s.postCopy}><b>fanaar.textile</b> Linen that softens with every wash.</span>
            </div>
          </div>
        </div>
        <span className={cx(s.publish, k.press)} style={at(3150)}>Publish</span>
      </div>
      <Cursor x0={560} y0={500} x1={548} y1={432} d={2500} move={560} click={3150} />
      <span className={cx(k.badge, k.badgeDark, k.pop, s.published)} style={at(3400)}><i className={k.liveDot} />Campaign published · Active</span>
    </div>
  );
}

const SHOPPING = [
  { img: IMG.twill, t: 'Stonewashed twill', p: '$18.00' },
  { img: IMG.jersey, t: 'Linen jersey', p: '$14.00' },
  { img: IMG.pique, t: 'Linen piqué', p: '$16.00' },
  { img: IMG.fleece, t: 'Linen fleece', p: '$22.00' },
];

function Google() {
  return (
    <div className={k.fill}>
      <div className={cx(s.serp, k.frameIn)} style={at(60)}>
        <div className={s.serpTop}>
          <span className={s.logo}><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b></span>
          <span className={s.search}>
            <Typed text="linen fabric by the metre" start={350} step={36} blinks={1} />
          </span>
        </div>
        <div className={s.tabs}><em>All</em><span>Shopping</span><span>Images</span><span>Videos</span></div>
        <div className={cx(s.ad, k.rise)} style={at(1450)}>
          <span className={s.adLabel}>Sponsored</span>
          <span className={s.adSite}><i>F</i><span>Fanaar<em>https://fanaar.online</em></span></span>
          <b>Stonewashed Linen by the Metre · Free Shipping Over $100</b>
          <span className={s.adDesc}>Premium lounge linen, cut to order and tested by batch. Order swatches today.</span>
          <span className={s.sitelinks}><em>Shop linen</em><em>Order swatches</em><em>Bestsellers</em></span>
        </div>
        <div className={cx(s.shopping, k.rise)} style={at(2150)}>
          <span className={s.adLabel}>Sponsored · Shop linen fabric</span>
          <div className={s.products}>
            {SHOPPING.map((p, i) => (
              <div key={p.t} className={cx(s.product, k.rise)} style={at(2250 + i * 110)}>
                <img src={p.img} alt="" />
                <b>{p.t}</b>
                <span>{p.p}</span>
                <em>Fanaar · Free delivery</em>
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className={cx(k.badge, k.pop, s.pmax)} style={at(3200)}>
        <GoogleAdsMark size={16} />Performance Max · <b>214 conversions</b>
      </span>
    </div>
  );
}

const EVENTS = [
  { n: 'PageView', d: 450 },
  { n: 'ViewContent', d: 1050 },
  { n: 'AddToCart', d: 1650 },
  { n: 'InitiateCheckout', d: 2250 },
  { n: 'Purchase', val: '$72.00', d: 2850 },
];

function Pixel() {
  return (
    <div className={k.fill}>
      <div className={cx(k.phone, k.frameIn, s.pxPhone)} style={at(60)}>
        <div className={k.phoneScreen}>
          <img className={s.pxImg} src={IMG.product} alt="" />
          <div className={s.pxCopy}>
            <b>Stonewashed Linen</b>
            <span>$18.00 / metre</span>
          </div>
          <span className={s.pxBtn}>Add to cart</span>
          <span className={s.pxBtn2}>Checkout</span>
          <div className={s.pxThanks}>
            <span><Check size={18} /></span>
            <b>Thank you!</b>
            <em>Order #1047 · $72.00</em>
          </div>
        </div>
        <Tap x={102} y={130} d={900} />
        <Tap x={102} y={262} d={1500} />
        <Tap x={102} y={310} d={2100} />
      </div>
      {EVENTS.map((e, i) => (
        <span key={e.n} className={s.signal} style={at(e.d - 250, { '--ty': `${i * 46}px` })} />
      ))}
      <div className={cx(s.em, k.frameIn)} style={at(200)}>
        <div className={s.emTop}><MetaMark size={12} /><b>Events Manager</b></div>
        <div className={s.emBody}>
          <div className={s.dataset}>
            <span><b>Fanaar Pixel</b><em>Dataset ID 4821…907</em></span>
            <span className={s.active}><i className={k.liveDot} />Active</span>
          </div>
          <span className={s.capi}><Check size={10} />Conversions API · connected</span>
          <div className={s.events}>
            {EVENTS.map((e) => (
              <div key={e.n} className={cx(s.event, k.rise, e.val && s.eventBuy)} style={at(e.d)}>
                <b>{e.n}</b>
                {e.val ? <em>{e.val}</em> : <span>Browser · Server</span>}
                <i>Just now</i>
              </div>
            ))}
          </div>
          <div className={cx(s.emq, k.fadeIn)} style={at(3300)}>
            <span>Event match quality</span>
            <i><b className={k.growX} style={at(3350)} /></i>
            <em>8.9 · Great</em>
          </div>
        </div>
      </div>
    </div>
  );
}

const CREATIVES = [
  { img: IMG.swatches, t: 'Softens with every wash', ctr: '0.9' },
  { img: IMG.reel, t: 'Linen you live in', ctr: '3.4' },
  { img: IMG.product, t: 'Cut to order, by the metre', ctr: '1.2' },
];
const WIN = 1;

function Scale() {
  return (
    <div className={k.fill}>
      <span className={k.dots} />
      <Title text="Keep the winner. Scale it." size={28} />
      {CREATIVES.map((c, i) => (
        <div
          key={c.t}
          className={cx(s.creative, k.rise, i !== WIN && s.loser, i === WIN && s.winner)}
          style={at(450 + i * 130, { left: `${40 + i * 192}px` })}
        >
          <img src={c.img} alt="" />
          <b>{c.t}</b>
          <span>CTR <strong><Odo value={c.ctr} d={900 + i * 130} />%</strong></span>
          {i === WIN ? <em className={cx(s.winTag, k.pop)} style={at(1950)}>Winner</em> : null}
        </div>
      ))}
      <div className={cx(k.panel, k.rise, s.scale)} style={at(2150)}>
        <div className={s.budgetCol}>
          <span>Daily budget</span>
          <b className={s.budgetNum}>
            <span className={s.from}>$40</span>
            <span className={s.to}>$<Odo value="160" d={3100} dur={900} /></span>
          </b>
        </div>
        <div className={s.slider}>
          <i><b /></i>
          <span className={s.knob} />
          <span className={s.ticks}><em>$40</em><em>$100</em><em>$160</em></span>
        </div>
        <div className={s.results}>
          <span className={s.roas}>ROAS <b>4.8×</b></span>
          <span className={k.up}><UpArrow /> Purchases 214</span>
        </div>
      </div>
      <Cursor x0={420} y0={500} x1={262} y1={400} d={2500} move={420} click={2950} x2={438} y2={400} d2={3050} move2={700} />
    </div>
  );
}

export const ADVERTISING: Film = {
  order: [0, 1, 2, 3],
  shots: [
    { dur: 5200, Comp: Meta },
    { dur: 5000, Comp: Google },
    { dur: 5000, tone: 'sky', Comp: Pixel },
    { dur: 5200, Comp: Scale },
  ],
};
