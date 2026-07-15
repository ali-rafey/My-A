'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import shared from './MeetAli.module.css';
import styles from './ChatBot.module.css';

// Lab window #2 — "Ask Ali" chatbot. UI ONLY for now: messages live in local
// state and the bot answers with a canned line after a short typing delay.
// When the real assistant is wired up, replace `respond()` with the API call —
// the message list, composer, and window chrome all stay as they are.

type Message = { id: number; role: 'bot' | 'user'; text: string };

const WELCOME: Message = {
  id: 0,
  role: 'bot',
  text: "Hey, I'm Ali's assistant. Ask me about his work, education, or what he's building — I'll answer for him when he's away.",
};

const CANNED_REPLY =
  "Good question — my brain is still being wired up. The real assistant ships soon; until then, everything about Ali is on this page.";

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const logRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(1);

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, typing]);

  const respond = () => {
    setTyping(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: nextId.current++, role: 'bot', text: CANNED_REPLY }]);
      setTyping(false);
    }, 900);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { id: nextId.current++, role: 'user', text }]);
    setDraft('');
    respond();
  };

  return (
    <div className={shared.window}>
      <div className={shared.windowBar}>
        <span className={shared.windowLights} aria-hidden="true">
          <span className={`${shared.windowLight} ${shared.lightRed}`} />
          <span className={`${shared.windowLight} ${shared.lightYellow}`} />
          <span className={`${shared.windowLight} ${shared.lightGreen}`} />
        </span>
        <span className={shared.windowName}>ask-ali — assistant</span>
        <span className={shared.windowBadge}>
          <span className={shared.windowBadgeDot} aria-hidden="true" />
          Beta
        </span>
      </div>

      <div ref={logRef} className={styles.log} aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === 'bot' ? styles.rowBot : styles.rowUser}
          >
            {m.role === 'bot' ? (
              <span className={styles.avatar} aria-hidden="true">
                a
              </span>
            ) : null}
            <p className={m.role === 'bot' ? styles.bubbleBot : styles.bubbleUser}>{m.text}</p>
          </div>
        ))}

        {typing ? (
          <div className={styles.rowBot}>
            <span className={styles.avatar} aria-hidden="true">
              a
            </span>
            <p className={`${styles.bubbleBot} ${styles.typing}`} aria-label="Assistant is typing">
              <span />
              <span />
              <span />
            </p>
          </div>
        ) : null}
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask something about Ali…"
          maxLength={500}
          aria-label="Message the assistant"
        />
        <button
          type="submit"
          className={styles.send}
          disabled={!draft.trim() || typing}
          aria-label="Send message"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2.5 8H13M13 8 8.5 3.5M13 8 8.5 12.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
