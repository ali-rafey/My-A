/* eslint-disable @next/next/no-img-element */
import k from './kit.module.css';
import s from './presence.module.css';
import type { Film } from './CardFilm';
import { at, Check, cx, FanaarLogo, GoogleG, IMG, Odo, ShopBag, Tap, Title, Typed, Cursor } from './kit';

// =============================================================================
// Digital Presence — a storefront people trust on sight.
//   1 Website       a wireframe becomes the live site
//   2 Brand & UX    the brand kit it is built from
//   3 Shopify store a shopper buys on a phone; the order lands in Shopify
//   4 Speed & SEO   green scores, and the first result on Google
// The example business (Fanaar) and every figure are illustrative.
// =============================================================================

const CARDS = [
  { img: IMG.twill, t: 'Twill', p: '$18 / m' },
  { img: IMG.jersey, t: 'Jersey', p: '$14 / m' },
  { img: IMG.fleece, t: 'Fleece', p: '$22 / m' },
];

function Website() {
  return (
    <div className={k.fill}>
      <div className={cx(k.win, k.frameIn, s.browser)} style={at(80)}>
        <div className={k.winBar}>
          <i /><i /><i />
          <span className={s.url}>
            <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5" fill="currentColor" /><path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            fanaar.online
          </span>
        </div>
        <div className={s.page}>
          <div className={s.skel}>
            <div className={cx(s.skNav, k.fadeIn)} style={at(250)}><i /><i /><i /><i /></div>
            <div className={s.skHero}>
              <div className={k.fadeIn} style={at(400)}><i /><i /><i /><i /></div>
              <span className={k.fadeIn} style={at(520)} />
            </div>
            <div className={s.skCards}>
              {[0, 1, 2].map((i) => <span key={i} className={k.fadeIn} style={at(640 + i * 90)} />)}
            </div>
          </div>
          <div className={s.real}>
            <div className={s.nav}>
              <FanaarLogo size={14} />
              <span>Shop fabric</span><span>Swatches</span><span>Journal</span>
              <em>Cart (0)</em>
              <b>Shop now</b>
            </div>
            <div className={s.hero}>
              <div className={s.copy}>
                <span className={s.eyebrow}>Linen · cut to order</span>
                <b>Cloth, cut<br />to order.</b>
                <span className={s.sub}>Stonewashed linen by the metre, shipped worldwide.</span>
                <div className={s.btns}><em>Shop fabric</em><i>Order swatches</i></div>
              </div>
              <img src={IMG.swatches} alt="" />
            </div>
            <div className={s.cards}>
              {CARDS.map((c) => (
                <div key={c.t} className={s.card}>
                  <img src={c.img} alt="" />
                  <span>{c.t}<em>{c.p}</em></span>
                </div>
              ))}
            </div>
          </div>
          <span className={s.wipe} />
        </div>
      </div>
      <span className={cx(k.badge, k.pop, s.live)} style={at(2900)}><i className={k.liveDot} />Live · fanaar.online</span>
    </div>
  );
}

const PALETTE = [
  { n: 'Earth', h: '#2B211A' },
  { n: 'Sand', h: '#E9DCC9' },
  { n: 'Sage', h: '#8FA68A' },
  { n: 'Clay', h: '#C8764F' },
  { n: 'Ink', h: '#0D1B3E' },
];

function Brand() {
  return (
    <div className={k.fill}>
      <span className={k.dots} />
      <Title text="Feels like the cloth." />
      <div className={cx(s.tile, s.logoTile, k.pop)} style={at(600)}>
        <FanaarLogo size={22} />
        <span className={s.tileTag}>Logo</span>
      </div>
      <div className={cx(s.tile, s.typeTile, k.pop)} style={at(760)}>
        <b>Aa</b>
        <span>Playfair Display<br /><em>Inter for text</em></span>
        <span className={s.tileTag}>Type</span>
      </div>
      <div className={cx(s.tile, s.photoTile, k.pop)} style={at(920)}>
        <img src={IMG.reel} alt="" />
        <span className={s.tileTag}>Art direction</span>
      </div>
      <div className={cx(s.tile, s.paletteTile, k.pop)} style={at(1080)}>
        {PALETTE.map((c, i) => (
          <div key={c.n} className={s.swatch}>
            <i className={k.growY} style={at(1250 + i * 80, { background: c.h })} />
            <b>{c.n}</b>
            <span>{c.h}</span>
          </div>
        ))}
      </div>
      <div className={cx(s.tile, s.uiTile, k.pop)} style={at(1240)}>
        <em className={s.btnDark}>Shop fabric</em>
        <em className={s.btnLine}>Order swatches</em>
        <span className={s.priceTag}>$18 / m</span>
        <span className={s.toggle}><i /></span>
      </div>
      <div className={cx(k.phone, k.rise, s.miniPhone)} style={at(1400)}>
        <div className={k.phoneScreen}>
          <img className={s.miniImg} src={IMG.product} alt="" />
          <div className={s.miniCopy}>
            <b>Stonewashed Linen</b>
            <span>$18 / metre</span>
            <div className={s.miniDots}><i /><i /><i /><i /></div>
          </div>
          <span className={s.miniCta}>Add to cart</span>
        </div>
      </div>
      <Cursor x0={520} y0={480} x1={284} y1={304} d={2500} move={620} click={3150} />
    </div>
  );
}

const ORDERS = [
  { n: '#1047', who: 'Amelia R.', amt: '$72.00' },
  { n: '#1046', who: 'Noor K.', amt: '$36.00' },
  { n: '#1045', who: 'Clara M.', amt: '$90.00' },
  { n: '#1044', who: 'Idris A.', amt: '$54.00' },
];

function Store() {
  return (
    <div className={k.fill}>
      <div className={cx(k.phone, k.frameIn, s.phone)} style={at(60)}>
        <div className={k.phoneScreen}>
          <div className={s.pdp}>
            <img src={IMG.product} alt="" />
            <div className={s.pdpBody}>
              <span className={s.pdpBrand}>FANAAR</span>
              <b>Stonewashed Linen</b>
              <span className={s.pdpPrice}>$18.00 / metre</span>
              <div className={s.pdpRow}>
                <div className={s.pdpDots}><i /><i /><i /><i /></div>
                <span className={s.qty}>− 3 m +</span>
              </div>
              <span className={cx(s.addBtn, k.press)} style={at(1250)}>Add to cart</span>
            </div>
          </div>
          <div className={cx(s.sheet, k.slideUp)} style={at(1550)}>
            <span className={s.grab} />
            <b>Your cart</b>
            <div className={s.line}><img src={IMG.product} alt="" /><span>Stonewashed Linen<em>3 m · Natural</em></span><b>$54.00</b></div>
            <span className={cx(s.shopPay, k.press)} style={at(2450)}>Shop<i>Pay</i></span>
            <span className={s.checkout}>Checkout</span>
            <div className={s.done}>
              <span className={s.doneMark}><Check size={20} /></span>
              <b>Order confirmed</b>
              <span>#1048 · $54.00</span>
            </div>
          </div>
        </div>
        <Tap x={104} y={302} d={1150} />
        <Tap x={104} y={291} d={2350} />
      </div>

      <div className={cx(s.admin, k.frameIn)} style={at(300)}>
        <div className={s.adminTop}><ShopBag size={16} /><b>shopify</b><span className={s.adminSearch}>Search</span></div>
        <div className={s.adminBody}>
          <div className={s.adminHead}><b>Orders</b><span>Today</span></div>
          <div className={s.table}>
            <div className={cx(s.row, s.rowNew)}>
              <b>#1048</b><span>Sara M.</span><em className={s.paid}>Paid</em><b>$54.00</b>
            </div>
            {ORDERS.map((o) => (
              <div key={o.n} className={s.row}>
                <b>{o.n}</b><span>{o.who}</span><em className={s.paid}>Paid</em><b>{o.amt}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className={cx(k.badge, k.pop, s.builtOn)} style={at(700)}><ShopBag />Built on Shopify</span>
      <span className={cx(k.badge, k.pop, s.newOrder)} style={at(3300)}><ShopBag />New order · $54.00</span>
    </div>
  );
}

const SCORES = [
  { n: '98', t: 'Performance' },
  { n: '100', t: 'Accessibility' },
  { n: '100', t: 'Best practices' },
  { n: '100', t: 'SEO' },
];

function Star() {
  return <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="m8 1.6 1.9 4.1 4.5.5-3.4 3 1 4.4L8 11.3l-4 2.3 1-4.4-3.4-3 4.5-.5Z" fill="#F4B400" /></svg>;
}

function Speed() {
  return (
    <div className={k.fill}>
      <div className={cx(k.panel, k.frameIn, s.psi)} style={at(80)}>
        <div className={s.psiHead}>
          <b>PageSpeed Insights</b>
          <span>fanaar.online · Mobile</span>
        </div>
        <div className={s.gauges}>
          {SCORES.map((g, i) => (
            <div key={g.t} className={s.gauge}>
              <div className={s.ring}>
                <svg viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="19" />
                  <circle className={k.draw} style={at(400 + i * 150)} cx="22" cy="22" r="19" pathLength={1} />
                </svg>
                <b><Odo value={g.n} d={450 + i * 150} dur={1100} /></b>
              </div>
              <span>{g.t}</span>
            </div>
          ))}
        </div>
        <div className={s.vitals}>
          {[['LCP', '1.2 s'], ['INP', '90 ms'], ['CLS', '0.01']].map(([m, val], i) => (
            <span key={m} className={k.fadeIn} style={at(1300 + i * 120)}><i /> {m} <b>{val}</b></span>
          ))}
          <em className={k.fadeIn} style={at(1700)}>Core Web Vitals: passed</em>
        </div>
      </div>

      <div className={cx(k.panel, k.rise, s.serp)} style={at(1500)}>
        <div className={s.query}>
          <GoogleG size={16} />
          <span><Typed text="linen fabric by the metre" start={1800} step={34} blinks={1} /></span>
        </div>
        <div className={cx(s.result, k.rise)} style={at(2800)}>
          <span className={s.site}><i>F</i><span>Fanaar<em>https://fanaar.online › shop</em></span></span>
          <b>Stonewashed Linen by the Metre | Fanaar</b>
          <span className={s.rating}><Star /><Star /><Star /><Star /><Star /> Rating 4.9 · 312 reviews</span>
          <span className={s.snippet}>Premium lounge linen, cut to order and tested by batch. Free shipping over $100.</span>
        </div>
        <div className={cx(s.resultGhost, k.fadeIn)} style={at(3000)}><i /><i /><i /></div>
        <span className={cx(s.rank, k.pop)} style={at(3400)}>#1</span>
      </div>
    </div>
  );
}

export const PRESENCE: Film = {
  order: [0, 2, 1, 3],
  shots: [
    { dur: 5000, Comp: Website },
    { dur: 5000, Comp: Brand },
    { dur: 5200, tone: 'sky', Comp: Store },
    { dur: 5200, Comp: Speed },
  ],
};
