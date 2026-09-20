/* eslint-disable @next/next/no-img-element */
import { services as SERVICE_DATA } from '@/lib/content/static';
import {
  GaMark,
  GoogleG,
  InstaMark,
  MetaMark,
  N8nMark,
  SERVICE_MARKS,
  SheetsMark,
  ShopBag,
  WhatsAppMark,
} from './marks';
import s from './Brief.module.css';

// The brief — the right-hand half of /contact.
//
// It does two jobs at once:
//   1. it writes itself as the visitor answers, so the thing they are about
//      to send is on screen before they send it — nobody has to remember
//      what they typed three questions ago;
//   2. its stage plays back the service under the cursor, so picking
//      "Advertising" shows an ad, not a word.
//
// Every figure and screen in the stage is illustrative, drawn in the home
// film's language: paper, grain, real photographs, one blue.
//
// The stage is 16:10 and everything inside it is sized in `em` against a
// `cqw` root, so the whole scene scales with the column instead of needing
// the film's measure-and-scale engine.

export type BriefField = 'name' | 'service' | 'details' | 'email';

type Props = {
  name: string;
  picked: string[];
  details: string;
  email: string;
  /** The question on screen — its row gets the caret. */
  active: BriefField;
  /** Service id whose scene the stage is playing, or null for the idle stage. */
  scene: number | null;
  sent: boolean;
};

const PHOTO = {
  audience: '/film/audience.jpg',
  product: '/film/product.jpg',
  reel: '/film/reel.jpg',
  swatches: '/film/swatches.jpg',
};

// ── Stage scenes ───────────────────────────────────────────────────────────
// Coordinates inside each scene are percentages of a 320 x 200 frame, which
// is what the SVG overlays use as their viewBox.

function ResearchScene() {
  return (
    <div className={s.scene}>
      <div className={`${s.card} ${s.gaCard}`}>
        <div className={s.gaHead}>
          <GaMark size={13} />
          <b>Last 28 days</b>
          <em className={s.up}>+38%</em>
        </div>
        <svg className={s.spark} viewBox="0 0 200 64" preserveAspectRatio="none" aria-hidden="true">
          <path className={s.sparkGrid} d="M0 16H200M0 32H200M0 48H200" />
          <path
            className={s.sparkLine}
            pathLength={1}
            d="M2 56C22 53 36 48 52 46S82 36 96 31 126 18 142 14s38-8 56-11"
          />
        </svg>
        <div className={s.gaFoot}>
          <span><b>24.8K</b>users</span>
          <span><b>$48.9K</b>revenue</span>
        </div>
      </div>

      <div className={s.buyer}>
        <img src={PHOTO.audience} alt="" />
        <span>
          <b>Core buyer</b>
          <i>Women 25&ndash;44</i>
        </span>
      </div>

      <span className={s.tag}>Evidence, not guesswork</span>
    </div>
  );
}

function PresenceScene() {
  return (
    <div className={s.scene}>
      <div className={s.win}>
        <div className={s.winBar}>
          <i /><i /><i />
          <span className={s.winUrl}>fanaar.online</span>
        </div>
        <div className={s.winBody}>
          <img className={s.winShot} src={PHOTO.product} alt="" />
          <div className={s.winCopy}>
            <b>Linen throw</b>
            <span className={s.winPrice}>$72</span>
            <i className={s.bar} style={{ width: '90%' }} />
            <i className={s.bar} style={{ width: '64%' }} />
            <span className={s.buy}>Add to cart</span>
          </div>
        </div>
      </div>

      <div className={s.phone}>
        <img src={PHOTO.swatches} alt="" />
        <span className={s.phoneBuy} />
      </div>

      <span className={`${s.tag} ${s.tagLeft}`}>Built to convert</span>
    </div>
  );
}

function AdsScene() {
  return (
    <div className={s.scene}>
      <div className={`${s.card} ${s.ad}`}>
        <div className={s.adHead}>
          <MetaMark size={11} />
          <b>Fanaar</b>
          <em>Sponsored</em>
        </div>
        <img className={s.adShot} src={PHOTO.reel} alt="" />
        <div className={s.adCta}>
          Shop now
          <span className={s.adArrow} aria-hidden="true">&#8594;</span>
        </div>
      </div>

      <div className={s.metrics}>
        <div className={s.metric}>
          <span>ROAS</span>
          <b>3.4&times;</b>
        </div>
        <div className={s.bars}>
          {[0.32, 0.46, 0.4, 0.62, 0.55, 0.78, 1].map((h, i) => (
            <i key={i} style={{ height: `${h * 100}%`, animationDelay: `${420 + i * 70}ms` }} />
          ))}
        </div>
        <div className={s.channels}>
          <GoogleG size={14} />
          <InstaMark size={14} />
        </div>
      </div>

      <span className={s.tag}>Spend that returns</span>
    </div>
  );
}

// Trigger to hub, then hub out to the two things it does. Ends stop short of
// each node tile so the wire lands on the tile edge, not under it.
const WIRES = [
  'M74 100H143',
  'M177 100c24 0 24-36 53-36',
  'M177 100c24 0 24 36 53 36',
];

function AutomationScene() {
  return (
    <div className={s.scene}>
      <svg className={s.wires} viewBox="0 0 320 200" aria-hidden="true">
        <g className={s.wireSet}>
          <path className={s.wire} pathLength={1} d={WIRES[0]} />
          <path className={s.wire} pathLength={1} d={WIRES[1]} />
          <path className={s.wire} pathLength={1} d={WIRES[2]} />
        </g>
        <g className={s.pulseSet}>
          <path className={s.pulse} pathLength={1} d={WIRES[0]} />
          <path className={s.pulse} pathLength={1} d={WIRES[1]} />
          <path className={s.pulse} pathLength={1} d={WIRES[2]} />
        </g>
      </svg>

      <span className={`${s.node} ${s.nodeA}`}>
        <ShopBag size={17} />
        <em>New order</em>
      </span>
      <span className={`${s.node} ${s.nodeHub}`}>
        <N8nMark size={18} />
      </span>
      <span className={`${s.node} ${s.nodeB}`}>
        <WhatsAppMark size={16} />
        <em>Thanks, on its way</em>
      </span>
      <span className={`${s.node} ${s.nodeC}`}>
        <SheetsMark size={16} />
        <em>Logged</em>
      </span>

      <span className={`${s.tag} ${s.tagLeft}`}>Runs without you</span>
    </div>
  );
}

function IdleScene() {
  return (
    <div className={`${s.scene} ${s.idle}`}>
      <div className={s.idleMarks}>
        {SERVICE_DATA.map((service, i) => {
          const Mark = SERVICE_MARKS[service.id];
          return (
            <span key={service.id} style={{ animationDelay: `${i * 110}ms` }}>
              {Mark ? <Mark size={20} /> : null}
            </span>
          );
        })}
      </div>
      <p className={s.idleNote}>Pick what you need &mdash; we&rsquo;ll show you what that looks like.</p>
    </div>
  );
}

const SCENES: Record<number, () => JSX.Element> = {
  1: ResearchScene,
  2: PresenceScene,
  3: AdsScene,
  4: AutomationScene,
};

// ── The card ───────────────────────────────────────────────────────────────
function Ghost({ lines = 1 }: { lines?: number }) {
  return (
    <span className={s.ghost} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
}

export default function Brief({ name, picked, details, email, active, scene, sent }: Props) {
  const Scene = scene ? SCENES[scene] : undefined;
  const chosen = picked
    .map((title) => SERVICE_DATA.find((service) => service.title === title) ?? { id: 0, title })
    .filter(Boolean);

  const row = (field: BriefField, filled: boolean) =>
    `${s.row} ${filled ? s.rowOn : ''} ${!sent && active === field ? s.rowLive : ''}`;

  return (
    <aside className={s.brief} aria-hidden="true">
      <div className={s.stage} data-scene={scene ?? 'idle'}>
        {Scene ? <Scene key={scene} /> : <IdleScene />}
      </div>

      <div className={s.head}>
        <span className={s.tab}>Project brief</span>
        <span className={`${s.state} ${sent ? s.stateSent : ''}`}>
          <i />
          {sent ? 'Sent' : 'Draft'}
        </span>
      </div>

      <dl className={s.rows}>
        <div className={row('name', Boolean(name.trim()))}>
          <dt>From</dt>
          <dd>
            {name.trim() ? (
              <>
                {name.trim()}
                {!sent && active === 'name' ? <span className={s.caret} /> : null}
              </>
            ) : (
              <Ghost />
            )}
          </dd>
        </div>

        <div className={row('service', chosen.length > 0)}>
          <dt>About</dt>
          <dd>
            {chosen.length ? (
              <span className={s.chips}>
                {chosen.map((service) => {
                  const Mark = SERVICE_MARKS[service.id];
                  return (
                    <span key={service.title} className={s.chip}>
                      {Mark ? <Mark size={13} /> : null}
                      {service.title}
                    </span>
                  );
                })}
              </span>
            ) : (
              <Ghost />
            )}
          </dd>
        </div>

        <div className={row('details', Boolean(details.trim()))}>
          <dt>Project</dt>
          <dd>
            {details.trim() ? (
              <span className={s.body}>
                {details.trim()}
                {!sent && active === 'details' ? <span className={s.caret} /> : null}
              </span>
            ) : (
              <Ghost lines={2} />
            )}
          </dd>
        </div>

        <div className={row('email', Boolean(email.trim()))}>
          <dt>Reply to</dt>
          <dd>
            {email.trim() ? (
              <>
                {email.trim()}
                {!sent && active === 'email' ? <span className={s.caret} /> : null}
              </>
            ) : (
              <Ghost />
            )}
          </dd>
        </div>
      </dl>

      <p className={s.foot}>
        {sent
          ? 'With us now. A person reads this one.'
          : 'Nothing leaves this page until you press send.'}
      </p>
    </aside>
  );
}
