import styles from './MegaphoneAnimation.module.css';

// Pure SVG + CSS. Reads as a megaphone broadcasting — perfect for the
// Advertising & Marketing card ("reach that converts").
//
// Master cycle: 2-second ripple loop, infinite. Four sound waves are
// rendered as identical arc paths; each scales out from the megaphone's
// mouth (transform-origin pinned to the left edge of each path's bounding
// box, which coincides with the mouth opening). Per-wave animation-delay
// staggers them by 0.4 s so a new wave is always emerging while the
// previous one is still spreading — continuous broadcast.
//
// The megaphone itself wiggles ±2° around its handle on a 0.6 s sub-loop
// so it reads as actively shouting, not static furniture.
// `aria-hidden` because this is decorative.
export default function MegaphoneAnimation() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        viewBox="0 0 220 150"
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sound waves — drawn FIRST so the megaphone sits on top of them.
            Each is a half-ellipse arc opening to the right. Same path on all
            four; the stagger comes from per-class animation-delay. */}
        <path className={`${styles.wave} ${styles.w1}`}
              d="M 108 50 Q 152 75 108 100"
              fill="none" stroke="#0877DE" strokeWidth="3" strokeLinecap="round" />
        <path className={`${styles.wave} ${styles.w2}`}
              d="M 108 50 Q 152 75 108 100"
              fill="none" stroke="#0877DE" strokeWidth="3" strokeLinecap="round" />
        <path className={`${styles.wave} ${styles.w3}`}
              d="M 108 50 Q 152 75 108 100"
              fill="none" stroke="#0877DE" strokeWidth="3" strokeLinecap="round" />
        <path className={`${styles.wave} ${styles.w4}`}
              d="M 108 50 Q 152 75 108 100"
              fill="none" stroke="#0877DE" strokeWidth="3" strokeLinecap="round" />

        {/* Megaphone body — drawn as a single navy path. The outer <g> takes
            the static position; the inner <g> takes the wiggle animation
            (rotates around the handle end so the horn flares back and forth). */}
        <g className={styles.megaphone}>
          {/* Trigger / strap line */}
          <line x1="48" y1="92" x2="48" y2="108"
                stroke="#0A2036" strokeWidth="3" strokeLinecap="round" />

          {/* Handle / grip — small dark rectangle behind the body */}
          <rect x="22" y="68" width="14" height="14" rx="2.5" fill="#0A2036" />

          {/* Horn body — trapezoid that opens to the right */}
          <path
            d="M 36 60 L 52 60 L 105 28 L 105 122 L 52 90 L 36 90 Z"
            fill="#0A2036"
            stroke="#0A2036"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Inner ring at the mouth — gives the horn a sense of depth */}
          <ellipse cx="105" cy="75" rx="4" ry="47"
                   fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" />

          {/* Top highlight along the horn's lit edge */}
          <path d="M 52 60 L 105 28 L 105 35 L 56 64 Z"
                fill="rgba(255, 255, 255, 0.18)" />
        </g>
      </svg>
    </div>
  );
}
