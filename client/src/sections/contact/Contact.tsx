import { type ChangeEvent, type FormEvent, useState } from 'react';
import styles from './Contact.module.css';

type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export default function Contact() {
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    message: '',
  });
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitState({ status: 'submitting' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const payload: { status: string; message: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to submit contact form.');
      }

      setSubmitState({ status: 'success', message: payload.message });
      setForm({ name: '', email: '', message: '' });
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

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              Name
              <input
                className={styles.input}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
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
              />
            </label>

            <button className={styles.button} type="submit" disabled={submitState.status === 'submitting'}>
              {submitState.status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>

            {submitState.status === 'success' ? <p className={styles.success}>{submitState.message}</p> : null}
            {submitState.status === 'error' ? <p className={styles.error}>{submitState.message}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
