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

  return (
    <section className={`${styles.section} section`} id="contact">
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.copy}>
            <span className="eyebrow">Contact</span>
            <h2 className="sectionTitle">Start a conversation with our team</h2>
            <p className="sectionLead">
              Share your goals and we will respond with a clear next step.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.label}>
              Name
              <input
                className={styles.input}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={120}
                autoComplete="name"
              />
            </label>

            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={254}
                autoComplete="email"
              />
            </label>

            <label className={styles.label}>
              Phone (optional)
              <input
                className={styles.input}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={40}
                autoComplete="tel"
              />
            </label>

            <label className={styles.label}>
              Message
              <textarea
                className={styles.textarea}
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                required
                maxLength={5000}
              />
            </label>

            <button
              className={styles.button}
              type="submit"
              disabled={submitState.status === 'submitting'}
            >
              {submitState.status === 'submitting' ? 'Sending...' : 'Send Message'}
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
