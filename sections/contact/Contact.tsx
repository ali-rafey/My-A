'use client';

import { type ChangeEvent, type FormEvent, useState } from 'react';
import styles from './Contact.module.css';

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

const initial: ContactFormState = { name: '', email: '', phone: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState<ContactFormState>(initial);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState({ status: 'submitting' });

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to submit form.');
      }

      setSubmitState({
        status: 'success',
        message: payload.message || 'Thanks — we will get back to you soon.',
      });
      setForm(initial);
    } catch (error: unknown) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  };

  const submitting = submitState.status === 'submitting';

  return (
    <section className={`${styles.section} section`} id="contact">
      <div className={`container ${styles.container}`}>
        <div className={styles.wrap}>
          <header className={styles.head}>
            <span className={styles.eyebrow}>Contact</span>
            <h2 className={styles.title}>Let&rsquo;s talk.</h2>
            <p className={styles.lead}>
              Share your goals and we&rsquo;ll respond with a clear next step.
            </p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Name</span>
                <input
                  className={styles.input}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Jane Doe"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="jane@company.com"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Phone <span className={styles.optional}>optional</span>
              </span>
              <input
                className={styles.input}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={40}
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Message</span>
              <textarea
                className={styles.textarea}
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                maxLength={5000}
                placeholder="Tell us about your project, timeline, and what success looks like."
              />
            </label>

            <button className={styles.button} type="submit" disabled={submitting}>
              <span>{submitting ? 'Sending…' : 'Send Message'}</span>
              {!submitting ? (
                <span className={styles.buttonArrow} aria-hidden="true">→</span>
              ) : null}
            </button>

            {submitState.status === 'success' ? (
              <p className={styles.success} role="status">{submitState.message}</p>
            ) : null}
            {submitState.status === 'error' ? (
              <p className={styles.error} role="alert">{submitState.message}</p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
