/* eslint-disable @next/next/no-img-element */
import k from './kit.module.css';
import s from './research.module.css';
import type { Film } from './CardFilm';
import { at, Beat, cx, GaMark, GmailMark, GoogleG, IMG, InstaMark, Odo, ShopBag, UpArrow, v } from './kit';

// =============================================================================
// Research & Data — know the market before you spend.
// =============================================================================
// Each shot states the client's problem and what we do about it, and the words
// share the frame with the picture rather than taking turns with it:
//   1 Audience research        the crowd is already behind the line; it
//                              focuses down to the one buyer who pays
//   2 Market & competitors     rivals land on the map while the line reads,
//                              then the line shrinks into the gap it names
//   3 GA4 & analytics          a chart fills the frame, the camera pulls back
//                              and it turns out to be the GA4 report
//   4 Attribution & reporting  channel marks fly in around the line, then wire
//                              themselves into the path that made the sale
// The example business (Fanaar) and every figure are illustrative.
// =============================================================================

const WALL = [
  { img: IMG.audience, label: 'Hikers · 18–24' },
  { img: IMG.reader, label: 'Home & slow living · 25–44' },
  { img: IMG.meadow, label: 'Festival · 18–30' },
  { img: IMG.wallpaper, label: 'Travel · 35–50' },
];
const PICK = 1;

function Audience() {
  return (
    <div className={k.fill}>
      {WALL.map((p, i) => (
        <div
          key={p.img}
          className={cx(s.tile, k.fadeIn, i === PICK ? s.tilePick : s.tileGone)}
          style={at(100 + i * 90, { left: `${21 + i * 152}px` })}
        >
          <img className={s.mono} src={p.img} alt="" />
          {i === PICK ? <img className={s.color} src={p.img} alt="" /> : null}
          <span className={s.tileTag}>{p.label}</span>
        </div>
      ))}
      <span className={s.scrim} />
      <Beat lead="You are paying to reach everyone." text="Who actually buys?" hold={1900} size={38} type />
      <span className={s.scan} />

      <div className={cx(k.panel, k.rise, s.buyer)} style={at(3750)}>
        <span className={cx(s.buyerHead, k.rise)} style={at(3950)}><i />Core buyer</span>
        <b className={k.rise} style={at(4050)}>Women 25–44 who buy for the home</b>
        <dl>
          {[
            { t: 'Share of sales', n: '38', u: '%' },
            { t: 'Average order', n: '86', u: '$', pre: true },
            { t: 'Orders a year', n: '2.3', u: '×' },
          ].map((m, i) => (
            <div key={m.t} className={k.rise} style={at(4250 + i * 190)}>
              <dt>{m.t}</dt>
              <dd>{m.pre ? m.u : null}<Odo value={m.n} d={4350 + i * 190} dur={900} />{m.pre ? null : m.u}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

const RIVALS = [
  { n: 'Linenhouse', x: 492, y: 110 },
  { n: 'Textura', x: 136, y: 196 },
  { n: 'Weavely', x: 268, y: 300 },
  { n: 'Fabrico', x: 118, y: 300 },
];

function Market() {
  return (
    <div className={k.fill}>
      <div className={s.field}>
        <svg className={s.axes} viewBox="0 0 640 500" aria-hidden="true">
          <path className={cx(s.axis, k.draw)} style={at(150)} pathLength={1} d="M60 348H600" />
          <path className={cx(s.axis, k.draw)} style={at(150)} pathLength={1} d="M60 348V44" />
          <path className={s.axisSoft} d="M60 196H600M330 44V348" />
        </svg>
        <span className={cx(s.axisLabel, s.axisQ)}>Quality</span>
        <span className={cx(s.axisLabel, s.axisP)}>Price</span>
        {RIVALS.map((r, i) => (
          <span key={r.n} className={cx(s.rival, k.pop)} style={at(500 + i * 180, { left: `${r.x}px`, top: `${r.y}px` })}>
            <i>{r.n[0]}</i>
            <em>{r.n}</em>
          </span>
        ))}
        <span className={cx(s.ring, k.pop)} style={at(2450)} />
        <span className={cx(s.ringTag, k.rise)} style={at(2600)}>The gap · premium, fair price</span>
        <span className={s.you} style={at(3100)}>F</span>
      </div>

      <span className={s.mapScrim} />
      <Beat
        lead="Four rivals, all selling the same thing."
        text="Where your business finds its gap."
        hold={2000}
        to={{ x: 10, y: -72, scale: 0.42 }}
      />

      <div className={cx(k.panel, k.rise, s.side, s.demand)} style={at(3600)}>
        <span>Search demand · “linen fabric”</span>
        <b>+38% <em className={k.up}><UpArrow /> vs last year</em></b>
        <svg viewBox="0 0 160 36" preserveAspectRatio="none" aria-hidden="true">
          <path className={k.draw} style={at(3800)} pathLength={1} d="M0 32 C 20 30, 34 28, 50 26 S 80 20, 96 18 S 126 10, 140 7 S 154 3, 160 2" />
        </svg>
      </div>
      <div className={cx(k.panel, k.rise, s.side, s.tracked)} style={at(3850)}>
        <span>Competitors tracked</span>
        <b><Odo value="12" d={3950} /></b>
      </div>
      <div className={cx(k.rise, s.side, s.weak)} style={at(4150)}>
        <span>Their weak spot</span>
        <b>Slow shipping · 9 days on average</b>
      </div>
    </div>
  );
}

const USERS = 'M0 150 C 30 146, 50 140, 80 142 S 130 120, 160 124 S 210 100, 240 96 S 290 80, 320 70 S 370 44, 400 30';
const PRIOR = 'M0 160 C 40 158, 80 154, 120 152 S 200 146, 240 140 S 320 132, 360 128 S 390 124, 400 122';

function Analytics() {
  return (
    <div className={k.fill}>
      {/* The chart fills the frame first; the camera pulls back and it turns
          out to be the chart inside GA4. */}
      <div className={s.pullBack}>
        <div className={s.ga}>
          <div className={cx(s.gaTop, k.fadeIn)} style={at(2700)}>
            <GaMark size={18} />
            <b>Analytics</b>
            <span className={s.gaProp}>Fanaar · fanaar.online</span>
            <span className={s.gaSearch}>Try searching “revenue by channel”</span>
          </div>
          <div className={cx(s.gaRail, k.fadeIn)} style={at(2800)}><i className={s.gaRailOn} /><i /><i /><i /><i /></div>
          <div className={s.gaMain}>
            <div className={cx(s.gaHead, k.fadeIn)} style={at(2800)}><b>Reports snapshot</b><span>Last 28 days</span></div>
            <div className={s.gaCard}>
              <div className={cx(s.gaTabs, k.fadeIn)} style={at(2900)}>
                {[
                  { t: 'Users', n: '24.8K', u: '62%' },
                  { t: 'New users', n: '19.1K', u: '58%' },
                  { t: 'Engagement', n: '1m 42s', u: '12%' },
                  { t: 'Revenue', n: '$48.9K', u: '71%' },
                ].map((m, i) => (
                  <div key={m.t} className={cx(s.gaTab, i === 0 && s.gaTabOn)}>
                    <span>{m.t}</span>
                    <b>{m.n}</b>
                    <em className={k.up}><UpArrow size={9} />{m.u}</em>
                  </div>
                ))}
              </div>
              <svg className={s.gaChart} viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true">
                <path className={cx(s.gaGrid, k.fadeIn)} style={at(2900)} d="M0 42H400M0 84H400M0 126H400" />
                <path className={cx(s.gaPrior, k.fadeIn)} style={at(3000)} d={PRIOR} />
                <path className={cx(s.gaLine, k.draw)} style={at(300)} pathLength={1} d={USERS} />
              </svg>
              <span className={cx(s.gaTip, k.pop)} style={at(4300)}>Today · 1,284 users</span>
            </div>
            <div className={cx(s.gaLive, k.rise)} style={at(3100)}>
              <span>Users in last 30 minutes</span>
              <b><Odo value="312" d={3300} /></b>
              <div className={s.gaBars}>
                {[0.35, 0.5, 0.42, 0.62, 0.55, 0.7, 0.6, 0.78, 0.72, 0.9, 0.84, 1].map((h, i) => (
                  <i key={i} className={k.growY} style={at(3400 + i * 55, { height: `${h * 100}%` })} />
                ))}
              </div>
              <span className={s.gaCountry}>United Kingdom <b>38%</b></span>
              <span className={s.gaCountry}>United States <b>27%</b></span>
            </div>
          </div>
        </div>
      </div>

      <span className={s.chartScrim} />
      <Beat lead="Half the spend earns its keep. Which half?" text="See what is actually working." hold={1900} />
      <span className={cx(k.badge, k.pop, s.insight)} style={at(4900)}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8l5.1-1.4Z" fill="#1F6FE5" /></svg>
        Visitors from Instagram buy 2.1× more
      </span>
    </div>
  );
}

const STEPS = [
  { mark: <InstaMark size={30} />, t: 'Instagram ad', d: 'Day 1', credit: '45%', fx: -280, fy: -110 },
  { mark: <GoogleG size={30} />, t: 'Google search', d: 'Day 3', credit: '35%', fx: -40, fy: -260 },
  { mark: <GmailMark size={30} />, t: 'Email', d: 'Day 5', credit: '20%', fx: 40, fy: 260 },
  { mark: <ShopBag size={30} />, t: 'Purchase · $72', d: 'Day 6', fx: 300, fy: 110 },
];

function Attribution() {
  return (
    <div className={k.fill}>
      <span className={k.dots} />
      <svg className={s.wire} viewBox="0 0 640 500" aria-hidden="true">
        <path className={cx(s.wirePath, k.draw)} style={at(2500)} pathLength={1} d="M92 156H548" />
      </svg>
      {STEPS.map((st, i) => (
        <div
          key={st.t}
          className={s.stop}
          style={v({ left: `${92 + i * 152}px`, '--fx': `${st.fx}px`, '--fy': `${st.fy}px` })}
        >
          <span className={s.stopMark} style={at(300 + i * 140)}>{st.mark}</span>
          <b className={k.fadeIn} style={at(2650 + i * 180)}>{st.t}</b>
          <span className={cx(s.stopDay, k.fadeIn)} style={at(2650 + i * 180)}>{st.d}</span>
          {st.credit ? <em className={cx(s.credit, k.pop)} style={at(3500 + i * 140)}>{st.credit}</em> : null}
        </div>
      ))}

      <Beat lead="Six days, four touches, one sale." text="Know which channel earned it." hold={2000} />

      <div className={cx(k.panel, s.report, k.slideUp)} style={at(4300)}>
        <div className={s.reportHead}>
          <GaMark size={16} />
          <b>Weekly report · Fanaar</b>
          <span>Monday 08:00 · sent automatically</span>
        </div>
        <div className={s.reportRow}>
          <div><span>Revenue</span><b>$<Odo value="4,820" d={4550} dur={900} /></b><em className={k.up}><UpArrow size={9} />18%</em></div>
          <div><span>Best channel</span><b>Instagram</b><em className={s.muted}>46% of sales</em></div>
          <div><span>Cost per sale</span><b>$<Odo value="7.42" d={4650} dur={900} /></b><em className={k.up}>12% lower</em></div>
          <div className={s.week}>
            {[0.45, 0.6, 0.52, 0.7, 0.66, 0.84, 1].map((h, i) => (
              <i key={i} className={k.growY} style={at(4900 + i * 60, { height: `${h * 100}%` })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const RESEARCH: Film = {
  order: [0, 1, 2, 3],
  shots: [
    { dur: 7200, Comp: Audience },
    { dur: 7000, enter: 'up', Comp: Market },
    { dur: 7000, enter: 'zoom', Comp: Analytics },
    { dur: 7200, enter: 'wipe', Comp: Attribution },
  ],
};
