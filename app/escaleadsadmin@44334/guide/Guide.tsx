'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  COST_LABEL,
  ENGAGEMENT,
  MISSION,
  PILLARS,
  type Part,
  type Pillar,
  type PillarId,
  type Tool,
} from './content';
import { PillarModel } from './diagrams';
import s from './guide.module.css';

// The Admin Guide: the four pillars EscaLeads sells, one at a time.
//
// Calm by default. A pillar opens on its main features only, one row each;
// the detail for a feature sits behind its expand button, and everything that
// is reference rather than headline (diagrams, delivery steps, numbers, tools,
// common mistakes) is folded under "Go deeper". How the four pillars fit
// together closes the page, also folded. The open pillar lives in the
// URL hash (#research, #automation…) so a link or a reload lands on it.
//
// Plain <img> for the icons: they are small local files on an admin-only page,
// and the image optimiser buys nothing here.

const MARKS: Record<PillarId, JSX.Element> = {
  presence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5s-1.2 6-3.6 8.5M12 3.5C9.6 6 8.4 8.8 8.4 12s1.2 6 3.6 8.5" />
    </svg>
  ),
  research: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M7.5 12l2-2.4 1.8 1.4 2.2-3" />
    </svg>
  ),
  marketing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  ),
  automation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="19" cy="6.5" r="2.2" />
      <circle cx="19" cy="17.5" r="2.2" />
      <path d="M7.2 12h2.6M14.2 12c1.8 0 2-4.3 2.6-5.1M14.2 12c1.8 0 2 4.3 2.6 5.1" />
    </svg>
  ),
};

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

// Line icons for the "Go deeper" rows.
const DEEP = {
  picture: icon('M4 5h16v14H4zM4 15l4.5-4.5 3.5 3.5 2.5-2.5L20 17'),
  steps: icon('M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01'),
  numbers: icon('M5 9h14M5 15h14M10 4 8 20M16 4l-2 16'),
  tools: icon('M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z'),
  bulb: icon('M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z'),
  map: icon('M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14'),
};

const BY_ID = Object.fromEntries(PILLARS.map((p) => [p.id, p])) as Record<PillarId, Pillar>;

const accent = (p: Pillar) => ({ '--acc': p.accent }) as React.CSSProperties;

function PlusIcon() {
  return <span className={s.plus} aria-hidden="true" />;
}

function Disclosure({
  id,
  glyph,
  title,
  meta,
  children,
}: {
  id: string;
  glyph: ReactNode;
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = `guide-deep-${id}`;
  return (
    <div className={s.deep} data-open={open}>
      <button type="button" className={s.deepHead} aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
        <span className={s.deepGlyph}>{glyph}</span>
        <span className={s.deepTitle}>
          <b>{title}</b>
          {meta ? <i>{meta}</i> : null}
        </span>
        <PlusIcon />
      </button>
      <div id={bodyId} className={s.deepBody} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

function ToolTile({ tool }: { tool: Tool }) {
  return (
    <span className={s.tool}>
      <span className={s.toolIcon} data-mono={!tool.icon} style={tool.icon ? undefined : ({ '--t': tool.tint ?? '#475569' } as React.CSSProperties)}>
        {tool.icon ? <img src={tool.icon} alt="" /> : <b>{tool.mono}</b>}
      </span>
      <span className={s.toolText}>
        <span className={s.toolTop}>
          <b>{tool.name}</b>
          <em className={s.cost} data-cost={tool.cost}>{COST_LABEL[tool.cost]}</em>
        </span>
        <i>{tool.role}</i>
      </span>
    </span>
  );
}

function Features({ id, parts }: { id: PillarId; parts: Part[] }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const allOpen = open.size === parts.length;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section aria-label="Main features">
      <div className={s.listHead}>
        <span className={s.label}>What it covers · {parts.length}</span>
        <button
          type="button"
          className={s.linkButton}
          onClick={() => setOpen(allOpen ? new Set() : new Set(parts.map((_, i) => i)))}
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <ol className={s.features}>
        {parts.map((p, i) => {
          const isOpen = open.has(i);
          const bodyId = `guide-${id}-feature-${i}`;
          return (
            <li key={p.name} className={s.feature} data-open={isOpen}>
              <button type="button" className={s.featureHead} aria-expanded={isOpen} aria-controls={bodyId} onClick={() => toggle(i)}>
                <span className={s.featureNum}>{i + 1}</span>
                <span className={s.featureText}>
                  <b>{p.name}</b>
                  <i>{p.summary}</i>
                </span>
                <PlusIcon />
              </button>

              <div id={bodyId} className={s.featureBody} hidden={!isOpen}>
                <p className={s.featureWhat}>{p.what}</p>
                <div className={s.featureGrid}>
                  <div>
                    <span className={s.miniLabel}>What good looks like</span>
                    <ul className={s.checks}>
                      {p.good.map((g) => <li key={g}>{g}</li>)}
                    </ul>
                  </div>
                  <div className={s.featureSide}>
                    <div>
                      <span className={s.miniLabel}>How to check</span>
                      <p>{p.check}</p>
                    </div>
                    <div className={s.measure}>
                      <span className={s.miniLabel}>Measure</span>
                      <p>{p.measure}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Panel({ p }: { p: Pillar }) {
  const toolCount = p.tools.reduce((n, g) => n + g.tools.length, 0);

  return (
    <div className={s.panel}>
      <header className={s.pillarHead}>
        <span className={s.pillarMark}>{MARKS[p.id]}</span>
        <div>
          <h2>{p.label}</h2>
          <p>{p.definition}</p>
        </div>
      </header>

      <Features id={p.id} parts={p.parts} />

      <section aria-label="Go deeper">
        <div className={s.listHead}>
          <span className={s.label}>Go deeper</span>
        </div>
        <div className={s.deepList}>
          <Disclosure id={`${p.id}-model`} glyph={DEEP.picture} title="The big picture" meta={p.model.title}>
            <p className={s.deepNote}>{p.model.note}</p>
            <PillarModel id={p.id} />
          </Disclosure>

          <Disclosure id={`${p.id}-deliver`} glyph={DEEP.steps} title="How you deliver it" meta={`${p.steps.length} steps · ${p.packages.length} packages to sell`}>
            <p className={s.deepNote}>
              <b>What the client gets:</b> {p.promise}
            </p>
            <ol className={s.steps}>
              {p.steps.map((step, i) => (
                <li key={step.name} className={s.step}>
                  <span className={s.stepNum}>{i + 1}</span>
                  <b className={s.stepName}>{step.name}</b>
                  {step.detail ? <span className={s.stepDetail}>{step.detail}</span> : null}
                  <span className={s.stepOut}>
                    <em>You hand over</em>
                    {step.output}
                  </span>
                </li>
              ))}
            </ol>
            <div className={s.packages}>
              <span className={s.miniLabel}>Packages you can sell</span>
              <div className={s.packageList}>
                {p.packages.map((pkg) => <span key={pkg} className={s.package}>{pkg}</span>)}
              </div>
            </div>
          </Disclosure>

          <Disclosure id={`${p.id}-numbers`} glyph={DEEP.numbers} title="Numbers to know" meta={`${p.rules.length} rules of thumb`}>
            <p className={s.deepNote}>For a first read. The client’s own history is always the better baseline.</p>
            <div className={s.rules}>
              {p.rules.map((r) => (
                <div key={r.label} className={s.rule}>
                  <span className={s.ruleLabel}>{r.label}</span>
                  <b className={s.ruleValue}>{r.value}</b>
                  <span className={s.ruleNote}>{r.note}</span>
                </div>
              ))}
            </div>
          </Disclosure>

          <Disclosure id={`${p.id}-tools`} glyph={DEEP.tools} title="Tools" meta={`${toolCount} tools, grouped by job`}>
            <p className={s.deepNote}>Start with the free ones. Pay only when a client’s budget justifies it.</p>
            <div className={s.toolGroups}>
              {p.tools.map((g) => (
                <div key={g.label} className={s.toolRow}>
                  <span className={s.toolRowLabel}>{g.label}</span>
                  <div className={s.toolList}>
                    {g.tools.map((t) => <ToolTile key={t.name} tool={t} />)}
                  </div>
                </div>
              ))}
            </div>
          </Disclosure>

          <Disclosure id={`${p.id}-right`} glyph={DEEP.bulb} title="Get it right" meta={`${p.corrections.length} common mistakes`}>
            <div className={s.corrections}>
              {p.corrections.map((c) => (
                <div key={c.myth} className={s.correction}>
                  <span className={s.mythTag}>You might think</span>
                  <p className={s.myth}>{c.myth}</p>
                  <span className={s.truthTag}>Actually</span>
                  <p className={s.truth}>{c.truth}</p>
                </div>
              ))}
            </div>
          </Disclosure>
        </div>
      </section>
    </div>
  );
}

export default function Guide() {
  const [active, setActive] = useState<PillarId>('presence');

  // Land on the pillar named in the hash, and follow it if it changes.
  useEffect(() => {
    const read = () => {
      const id = window.location.hash.slice(1) as PillarId;
      if (PILLARS.some((p) => p.id === id)) setActive(id);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const choose = (id: PillarId) => {
    setActive(id);
    window.history.replaceState(null, '', `#${id}`);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = PILLARS[(index + step + PILLARS.length) % PILLARS.length];
    choose(next.id);
    document.getElementById(`guide-tab-${next.id}`)?.focus();
  };

  return (
    <div className={s.guide}>
      <div className={s.pillars} role="tablist" aria-label="Pillars">
        {PILLARS.map((p, i) => (
          <button
            key={p.id}
            id={`guide-tab-${p.id}`}
            type="button"
            role="tab"
            aria-selected={active === p.id}
            aria-controls={`guide-panel-${p.id}`}
            tabIndex={active === p.id ? 0 : -1}
            className={s.pillarTab}
            style={accent(p)}
            onClick={() => choose(p.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            <span className={s.pillarTabMark}>{MARKS[p.id]}</span>
            <span className={s.pillarTabText}>
              <b>{p.label}</b>
              <i>{p.role}</i>
            </span>
          </button>
        ))}
      </div>

      {PILLARS.map((p) => (
        <div
          key={p.id}
          id={`guide-panel-${p.id}`}
          role="tabpanel"
          className={s.panelWrap}
          aria-labelledby={`guide-tab-${p.id}`}
          hidden={active !== p.id}
          style={accent(p)}
        >
          {active === p.id ? <Panel p={p} /> : null}
        </div>
      ))}

      <div className={s.fit}>
        <Disclosure id="fit" glyph={DEEP.map} title="How the four pillars work together" meta="The order every client moves through them">
          <p className={s.deepNote}>
            <b>{MISSION.line}</b> {MISSION.how}
          </p>
          <ol className={s.engagement}>
            {ENGAGEMENT.map((e) => (
              <li key={e.when} className={s.engStep}>
                <span className={s.engWhen}>{e.when}</span>
                <b className={s.engTitle}>{e.title}</b>
                <p className={s.engDetail}>{e.detail}</p>
                <span className={s.engChips}>
                  {e.pillars.map((id) => (
                    <span key={id} className={s.chip} style={accent(BY_ID[id])}>
                      {BY_ID[id].short}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ol>
          <p className={s.deepNote}>{MISSION.loop}</p>
        </Disclosure>
      </div>
    </div>
  );
}
