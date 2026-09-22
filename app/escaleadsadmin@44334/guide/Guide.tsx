'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CATEGORIES, LEVELS, type Category, type Tool } from './content';
import {
  AutomationMenu,
  FourQuestions,
  Funnel,
  MarketingVsAdvertising,
  OfferLadder,
  PriorityMatrix,
  SignalPath,
  WorkflowAnatomy,
} from './diagrams';
import s from './guide.module.css';

// The Admin Guide: four disciplines, one at a time.
//
// The overview row shows where each one stands and the single next move; the
// tabs below open the full playbook for one. The open tab lives in the URL
// hash (#research, #automation…) so a link or a reload lands on the same one.
//
// Plain <img> for the icons: they are small local files on an admin-only page,
// and the image optimiser buys nothing here.

type Id = Category['id'];

const MARKS: Record<Id, JSX.Element> = {
  software: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />
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

const accent = (c: Category) => ({ '--acc': c.accent }) as React.CSSProperties;

function Meter({ level, compact = false }: { level: number; compact?: boolean }) {
  return (
    <span className={compact ? s.meterCompact : s.meter} aria-label={`Level ${level} of 5: ${LEVELS[level - 1]}`}>
      <span className={s.meterRungs}>
        {LEVELS.map((name, i) => (
          <span key={name} className={s.rungStep} data-on={i < level} data-here={i === level - 1}>
            {!compact ? <em>{name}</em> : null}
          </span>
        ))}
      </span>
      {compact ? <b className={s.meterLabel}>{LEVELS[level - 1]}</b> : null}
    </span>
  );
}

function ToolTile({ tool }: { tool: Tool }) {
  return (
    <span className={s.tool} data-inuse={Boolean(tool.inUse)}>
      <span className={s.toolIcon} style={tool.icon ? undefined : ({ '--t': tool.tint ?? '#475569' } as React.CSSProperties)}>
        {tool.icon ? <img src={tool.icon} alt="" /> : <b>{tool.mono}</b>}
      </span>
      <span className={s.toolText}>
        <b>{tool.name}</b>
        <i>{tool.role}</i>
      </span>
      {tool.inUse ? <span className={s.inUse} title="You use this today">In use</span> : null}
    </span>
  );
}

function SectionHead({ n, title, note }: { n: string; title: string; note?: string }) {
  return (
    <div className={s.sectionHead}>
      <span className={s.sectionNum}>{n}</span>
      <h3>{title}</h3>
      {note ? <p>{note}</p> : null}
    </div>
  );
}

function Diagrams({ id }: { id: Id }) {
  if (id === 'software') return <OfferLadder />;
  if (id === 'research') return <FourQuestions />;
  if (id === 'marketing') {
    return (
      <>
        <MarketingVsAdvertising />
        <div className={s.pair}>
          <div className={s.panelCard}>
            <span className={s.cardLabel}>The funnel — what each stage is for</span>
            <Funnel />
          </div>
          <div className={s.panelCard}>
            <span className={s.cardLabel}>Your strength — how tracking should flow</span>
            <SignalPath />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className={s.panelCard}>
        <span className={s.cardLabel}>Anatomy of a workflow that doesn’t break</span>
        <WorkflowAnatomy />
      </div>
      <div className={s.pair}>
        <div className={s.panelCard}>
          <span className={s.cardLabel}>What to automate first</span>
          <PriorityMatrix />
        </div>
        <div className={s.panelCard}>
          <span className={s.cardLabel}>Automations you can sell as a package</span>
          <AutomationMenu />
        </div>
      </div>
    </>
  );
}

const IDEA_TITLE: Record<Id, { title: string; note: string }> = {
  software: { title: 'The offer ladder', note: 'Four things you already build — each one can be a package.' },
  research: { title: 'The four questions', note: 'Start from the question. The tool comes second.' },
  marketing: { title: 'Marketing vs advertising', note: 'Advertising is one lever. Marketing is the machine it plugs into.' },
  automation: { title: 'How good automation is built', note: 'Reliable, prioritised, sellable.' },
};

function Panel({ c }: { c: Category }) {
  return (
    <div className={s.panel}>
      <header className={s.hero}>
        <span className={s.heroMark}>{MARKS[c.id]}</span>
        <div className={s.heroText}>
          <span className={s.heroKicker}>{c.label}</span>
          <h2>{c.definition}</h2>
        </div>
        <div className={s.heroLevel}>
          <span className={s.heroLevelLabel}>Where you are</span>
          <Meter level={c.level} />
        </div>
      </header>

      <section>
        <SectionHead n="01" title="The path" note="From how you work today to the scaled version of it." />
        <div className={s.path}>
          <div className={s.pathCol} data-kind="now">
            <span className={s.pathHead}>Now</span>
            <ul>{c.now.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <span className={s.pathArrow} aria-hidden="true" />
          <div className={s.pathCol} data-kind="next">
            <span className={s.pathHead}>Next 90 days</span>
            <ul>{c.next.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <span className={s.pathArrow} aria-hidden="true" />
          <div className={s.pathCol} data-kind="scaled">
            <span className={s.pathHead}>Scaled</span>
            <ul>{c.scaled.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </section>

      <section>
        <SectionHead n="02" title={IDEA_TITLE[c.id].title} note={IDEA_TITLE[c.id].note} />
        <Diagrams id={c.id} />
      </section>

      <section>
        <SectionHead n="03" title="The stack" note="Grouped by job. Tagged where you already use it." />
        <div className={s.stack}>
          {c.stack.map((g) => (
            <div key={g.label} className={s.stackRow}>
              <span className={s.stackLabel}>{g.label}</span>
              <div className={s.stackTools}>
                {g.tools.map((t) => <ToolTile key={t.name} tool={t} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead n="04" title="The process" note="The same steps, every client, every time." />
        <ol className={s.flow}>
          {c.flow.map((step, i) => (
            <li key={step} className={s.flowStep}>
              <span className={s.flowDot}>{i + 1}</span>
              <span className={s.flowName}>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHead n="05" title="This month" note="Small enough to finish. Each one moves you up a rung." />
        <div className={s.month}>
          <ul className={s.checklist}>
            {c.month.map((m) => (
              <li key={m}>
                <span className={s.checkBox} aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
          <div className={s.swap}>
            <div className={s.swapStop}>
              <span>Stop</span>
              <b>{c.stop}</b>
            </div>
            <div className={s.swapStart}>
              <span>Start</span>
              <b>{c.start}</b>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Guide() {
  const [active, setActive] = useState<Id>('software');
  const tabsRef = useRef<HTMLDivElement | null>(null);

  // Land on the tab named in the hash, and follow it if it changes.
  useEffect(() => {
    const read = () => {
      const id = window.location.hash.slice(1) as Id;
      if (CATEGORIES.some((c) => c.id === id)) setActive(id);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const choose = (id: Id, scroll = false) => {
    setActive(id);
    window.history.replaceState(null, '', `#${id}`);
    if (scroll) tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = CATEGORIES[(index + step + CATEGORIES.length) % CATEGORIES.length];
    choose(next.id);
    document.getElementById(`guide-tab-${next.id}`)?.focus();
  };

  return (
    <div className={s.guide}>
      <div className={s.overview}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={s.overCard}
            style={accent(c)}
            data-on={active === c.id}
            onClick={() => choose(c.id, true)}
          >
            <span className={s.overTop}>
              <span className={s.overMark}>{MARKS[c.id]}</span>
              <b>{c.label}</b>
            </span>
            <Meter level={c.level} compact />
            <span className={s.overNext}>
              <i>Next move</i>
              {c.nextMove}
            </span>
          </button>
        ))}
      </div>

      <div ref={tabsRef} className={s.tabs} role="tablist" aria-label="Guide sections">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.id}
            id={`guide-tab-${c.id}`}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            aria-controls={`guide-panel-${c.id}`}
            tabIndex={active === c.id ? 0 : -1}
            className={s.tab}
            style={accent(c)}
            onClick={() => choose(c.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            <span className={s.tabMark}>{MARKS[c.id]}</span>
            {c.short}
          </button>
        ))}
      </div>

      {CATEGORIES.map((c) => (
        <div
          key={c.id}
          id={`guide-panel-${c.id}`}
          role="tabpanel"
          className={s.panelWrap}
          aria-labelledby={`guide-tab-${c.id}`}
          hidden={active !== c.id}
          style={accent(c)}
        >
          {active === c.id ? <Panel c={c} /> : null}
        </div>
      ))}
    </div>
  );
}
