'use client';

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { services as SERVICE_DATA } from '@/lib/content/static';
import { serviceSlug } from '@/lib/content/service-slug';
import Brief from './Brief';
import { MarkTalk, SERVICE_MARKS, TickMark } from './marks';
import styles from './Contact.module.css';

// Contact — a four-question conversation instead of a form.
//
// One question on screen at a time; each answer folds into a compact, editable
// line and the next question slides in beneath it. Asks only what turns a
// message into an actionable lead:
//
//   1. name      so the reply can be personal (and the next question can be)
//   2. service   what they need — pre-selected when arriving from a service's
//                "Discuss" link on /services (?service=<slug>)
//   3. details   the part a human actually reads
//   4. email     asked LAST: by then the visitor has invested three answers,
//                which is when handing over an address feels least like a toll
//
// Beside it, on anything wider than a tablet, the brief writes itself as they
// type (see Brief.tsx) and plays back whichever service block is under the
// cursor. It is decorative — `aria-hidden` — because every value in it is
// already in the form a screen reader is reading.
//
// WIRE CONTRACT UNCHANGED: POST /api/leads { name, email, phone, message }.
// The service choice is folded into `message` (the leads table has no column
// for it, and supabase/schema.sql is frozen). Phone is sent empty — the API
// already treats it as optional.
//
// ⚠️  DIRECT_EMAIL and the "one business day" promise are placeholders; neither
//     existed anywhere in this codebase.

const DIRECT_EMAIL = 'hello@escaleads.space';
const PORTFOLIO_URL = 'https://alianees.online';

const NOT_SURE = 'Not sure yet';
const SERVICE_OPTIONS = [...SERVICE_DATA.map((s) => s.title), NOT_SURE];

// One line per block — what the service is, in the words a visitor uses.
// Falls back to the service's own capabilities if an id ever goes missing.
const BLOCK_LINE: Record<number, string> = {
  1: 'Audience, market, analytics',
  2: 'Website, store, brand',
  3: 'Meta & Google, measured',
  4: 'Busywork that runs itself',
};

const NEXT_STEPS = [
  'We read it — a person, not an autoresponder.',
  'We reply with any questions we need to scope it.',
  'You get a clear next step: approach, timeline and cost.',
];

type StepId = 'name' | 'service' | 'details' | 'email';
const STEPS: StepId[] = ['name', 'service', 'details', 'email'];
const LAST = STEPS.length - 1;

const SUMMARY_LABEL: Record<StepId, string> = {
  name: 'Name',
  service: 'Service',
  details: 'Project',
  email: 'Email',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? '';

function composeMessage(details: string, picked: string[]): string {
  const real = picked.filter((p) => p !== NOT_SURE);
  if (!real.length) return details.trim();
  return `${details.trim()}\n\n———\nServices: ${real.join(', ')}`;
}

type Status = 'idle' | 'submitting' | 'success';

export default function Contact() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [serviceDone, setServiceDone] = useState(false);
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [reply, setReply] = useState('');
  // Service id under the cursor (or keyboard focus) on the service step. It
  // only previews the stage — picking is still a click.
  const [preview, setPreview] = useState<number | null>(null);

  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null>(null);
  const successRef = useRef<HTMLHeadingElement | null>(null);
  const stepChanged = useRef(false);

  // Pre-select a service handed over from /services. Read from
  // window.location rather than useSearchParams so this static page needs no
  // Suspense boundary and cannot mismatch on hydration.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('service');
    if (!slug) return;
    const match = SERVICE_DATA.find((s) => serviceSlug(s.title) === slug);
    if (match) setPicked([match.title]);
  }, []);

  // Move focus to each new question as it appears — but NOT on first load:
  // auto-focusing on arrival would pop the keyboard on a phone and yank the
  // viewport before the visitor has read a word.
  useEffect(() => {
    if (!stepChanged.current) return;
    fieldRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const isComplete = (id: StepId): boolean => {
    if (id === 'name') return name.trim().length > 0;
    if (id === 'service') return serviceDone;
    if (id === 'details') return details.trim().length > 0;
    return EMAIL_RE.test(email.trim());
  };

  const validate = (id: StepId): string | null => {
    if (id === 'name' && !name.trim()) return 'Add a name so we know who we are talking to.';
    if (id === 'details' && !details.trim()) return 'A sentence or two is plenty.';
    if (id === 'email') {
      if (!email.trim()) return 'We need somewhere to send the reply.';
      if (!EMAIL_RE.test(email.trim())) return 'That email does not look quite right.';
    }
    return null;
  };

  const goTo = (index: number) => {
    stepChanged.current = true;
    setError(null);
    setPreview(null);
    setStep(index);
  };

  // Continue to the first question that still needs an answer. After an edit
  // this jumps straight back to where the visitor was instead of walking them
  // through questions they have already answered.
  const advance = () => {
    const id = STEPS[step];
    const problem = validate(id);
    if (problem) {
      setError(problem);
      return;
    }
    if (id === 'service') setServiceDone(true);
    const done = (sid: StepId) => (sid === id ? true : isComplete(sid));
    const next = STEPS.findIndex((sid, i) => i < LAST && !done(sid));
    goTo(next === -1 ? LAST : next);
  };

  const togglePick = (option: string) => {
    setError(null);
    setPicked((current) => {
      if (option === NOT_SURE) return current.includes(NOT_SURE) ? [] : [NOT_SURE];
      const withoutUnsure = current.filter((p) => p !== NOT_SURE);
      return withoutUnsure.includes(option)
        ? withoutUnsure.filter((p) => p !== option)
        : [...withoutUnsure, option];
    });
  };

  const submit = async () => {
    const problem = validate('email');
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStatus('submitting');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: '',
          message: composeMessage(details, picked),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(payload.message || 'Failed to submit form.');
      setReply(payload.message || '');
      setStatus('success');
    } catch (err: unknown) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again in a moment.');
    }
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === LAST) void submit();
    else advance();
  };

  // A textarea keeps Enter for new lines; Cmd/Ctrl+Enter moves on.
  const onDetailsKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      advance();
    }
  };

  const reset = () => {
    setName(''); setPicked([]); setServiceDone(false); setDetails(''); setEmail('');
    setError(null); setReply(''); setStatus('idle'); setPreview(null);
    stepChanged.current = true;
    setStep(0);
  };

  const summaryValue = (id: StepId): string => {
    if (id === 'name') return name.trim();
    if (id === 'service') return picked.length ? picked.join(', ') : 'Skipped';
    if (id === 'details') {
      const t = details.trim().replace(/\s+/g, ' ');
      return t.length > 64 ? `${t.slice(0, 64)}…` : t;
    }
    return email.trim();
  };

  const who = firstName(name);
  const progress = status === 'success' ? 1 : step / STEPS.length;
  const errorId = 'contact-step-error';

  // What the brief's stage plays: whatever is under the cursor, else the most
  // recent pick. `picked` is appended to, so its last real service is it.
  const pickedIds = picked
    .map((title) => SERVICE_DATA.find((s) => s.title === title)?.id)
    .filter((id): id is number => typeof id === 'number');
  const scene = preview ?? (pickedIds.length ? pickedIds[pickedIds.length - 1] : null);

  const brief = (
    <Brief
      name={name}
      picked={picked}
      details={details}
      email={email}
      active={STEPS[step]}
      scene={scene}
      sent={status === 'success'}
    />
  );

  // ── Success ──────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <section className={`${styles.section} section`} id="contact">
        <div className={`container ${styles.container}`}>
          <div className={styles.shell}>
            <div className={styles.main}>
              <div className={styles.progress} aria-hidden="true">
                <span className={styles.progressBar} style={{ transform: 'scaleX(1)' }} />
              </div>
              <div className={`${styles.card} ${styles.done}`} role="status">
                <span className={styles.doneMark} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="m5 13 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h1 ref={successRef} tabIndex={-1} className={styles.doneTitle}>
                  Thanks{who ? `, ${who}` : ''}. It&rsquo;s with us.
                </h1>
                <p className={styles.doneBody}>
                  {reply && !/thanks/i.test(reply) ? `${reply} ` : ''}
                  We&rsquo;ll reply to <strong>{email.trim()}</strong> within one business day.
                </p>
                <ol className={styles.doneSteps}>
                  {NEXT_STEPS.map((line, i) => (
                    <li key={line}>
                      <span className={styles.doneNum} aria-hidden="true">{i + 1}</span>
                      {line}
                    </li>
                  ))}
                </ol>
                <button type="button" className={styles.ghost} onClick={reset}>
                  Send another message
                </button>
              </div>
            </div>
            {brief}
          </div>
        </div>
      </section>
    );
  }

  // ── Conversation ─────────────────────────────────────────────────────────
  const id = STEPS[step];
  const answered = STEPS.slice(0, step).filter((sid) => isComplete(sid));

  return (
    <section className={`${styles.section} section`} id="contact">
      <div className={`container ${styles.container}`}>
        <div className={styles.shell}>
          <header className={styles.head}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              Contact
            </span>
            <h1 className={styles.title}>
              Tell us where you want to <em className={styles.titleAccent}>grow</em>.
            </h1>
          </header>

          <div className={styles.main}>
            <div className={styles.progressRow}>
              <span className={styles.progressText}>
                Question {step + 1} of {STEPS.length}
              </span>
              <div className={styles.progress} aria-hidden="true">
                <span
                  className={styles.progressBar}
                  style={{ transform: `scaleX(${Math.max(progress, 0.04)})` }}
                />
              </div>
            </div>

            <form className={styles.card} onSubmit={onFormSubmit} noValidate>
              {answered.length ? (
                <ul className={styles.answers}>
                  {answered.map((sid) => (
                    <li key={sid} className={styles.answer}>
                      <span className={styles.answerLabel}>{SUMMARY_LABEL[sid]}</span>
                      <span className={styles.answerValue}>{summaryValue(sid)}</span>
                      <button
                        type="button"
                        className={styles.edit}
                        onClick={() => goTo(STEPS.indexOf(sid))}
                        aria-label={`Edit ${SUMMARY_LABEL[sid].toLowerCase()}`}
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Keyed on the step so each question mounts fresh and plays its
                  entrance. Only transform + opacity animate. */}
              <div key={id} className={styles.question}>
                {id === 'name' && (
                  <>
                    <label htmlFor="c-name" className={styles.prompt}>
                      First — what should we call you?
                    </label>
                    <input
                      id="c-name"
                      ref={(el) => { fieldRef.current = el; }}
                      className={styles.input}
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(null); }}
                      maxLength={120}
                      autoComplete="name"
                      placeholder="Your name"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
                    />
                  </>
                )}

                {id === 'service' && (
                  <fieldset className={styles.fieldset}>
                    <legend className={styles.prompt}>
                      {who ? `Nice to meet you, ${who}. ` : ''}What can we help with?
                    </legend>
                    <p className={styles.promptHint}>Pick any that fit.</p>
                    {/* Hovering a block plays it on the brief's stage; leaving
                        the grid hands the stage back to whatever is picked.
                        Focus previews too, but only a KEYBOARD focus: moving to
                        this question focuses the first block programmatically,
                        and that must not silently choose a service to show. */}
                    <div
                      className={styles.blocks}
                      onMouseLeave={() => setPreview(null)}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPreview(null);
                      }}
                    >
                      {SERVICE_OPTIONS.map((option, i) => {
                        const service = SERVICE_DATA.find((s) => s.title === option);
                        const Mark = service ? SERVICE_MARKS[service.id] : MarkTalk;
                        const line = service
                          ? BLOCK_LINE[service.id] ?? service.capabilities.slice(0, 2).join(' · ')
                          : 'Talk it through with us';
                        const on = picked.includes(option);
                        return (
                          <button
                            key={option}
                            ref={i === 0 ? (el) => { fieldRef.current = el; } : undefined}
                            type="button"
                            className={`${styles.block} ${on ? styles.blockOn : ''} ${service ? '' : styles.blockWide}`}
                            aria-pressed={on}
                            onClick={() => togglePick(option)}
                            onMouseEnter={() => setPreview(service?.id ?? null)}
                            onFocus={(e) => {
                              if (e.target.matches(':focus-visible')) setPreview(service?.id ?? null);
                            }}
                          >
                            <span className={styles.blockMark} aria-hidden="true">
                              {Mark ? <Mark size={20} /> : null}
                            </span>
                            <span className={styles.blockText}>
                              <b>{option}</b>
                              <i>{line}</i>
                            </span>
                            <span className={styles.blockTick} aria-hidden="true">
                              {on ? <TickMark size={13} /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {id === 'details' && (
                  <>
                    <label htmlFor="c-details" className={styles.prompt}>
                      Tell us a little about it.
                    </label>
                    <p className={styles.promptHint}>What you are trying to achieve, and what is in the way.</p>
                    <textarea
                      id="c-details"
                      ref={(el) => { fieldRef.current = el; }}
                      className={styles.textarea}
                      name="message"
                      value={details}
                      onChange={(e) => { setDetails(e.target.value); setError(null); }}
                      onKeyDown={onDetailsKey}
                      rows={3}
                      maxLength={4000}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
                    />
                  </>
                )}

                {id === 'email' && (
                  <>
                    <label htmlFor="c-email" className={styles.prompt}>
                      Last one — where should we reply?
                    </label>
                    <input
                      id="c-email"
                      ref={(el) => { fieldRef.current = el; }}
                      className={styles.input}
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      maxLength={254}
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@company.com"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
                    />
                  </>
                )}

                {error ? (
                  <p id={errorId} className={styles.error} role="alert">{error}</p>
                ) : null}

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.next}
                    disabled={status === 'submitting'}
                  >
                    {id === 'email'
                      ? status === 'submitting' ? 'Sending…' : 'Send message'
                      : id === 'service' && !picked.length ? 'Skip' : 'Continue'}
                    {status !== 'submitting' ? (
                      <span className={styles.nextArrow} aria-hidden="true">&#8594;</span>
                    ) : null}
                  </button>
                  <span className={styles.keyHint} aria-hidden="true">
                    {id === 'details' ? (
                      <><kbd>&#8984;</kbd> + <kbd>Enter</kbd></>
                    ) : id === 'service' ? null : (
                      <>press <kbd>Enter &#8629;</kbd></>
                    )}
                  </span>
                </div>
              </div>
            </form>

            <p className={styles.aside}>
              Rather email? <a href={`mailto:${DIRECT_EMAIL}`}>{DIRECT_EMAIL}</a>
              <span className={styles.asideSep} aria-hidden="true">·</span>
              <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">
                Meet Ali <span aria-hidden="true">&#8599;</span>
              </a>
            </p>
          </div>

          {brief}
        </div>
      </div>
    </section>
  );
}
