import styles from './TargetArrowAnimation.module.css';

// Pure SVG + CSS. 5-second loop:
//   0   – 36%  arrow flies in from the left toward the bullseye
//   36  – 42%  impact: bullseye flashes white briefly
//   42  – 78%  three ripple rings expand outward from the impact point
//              (staggered so they pulse in waves)
//   78  – 92%  hold
//   92  – 100% arrow fades back to its start, ripples fade — loop
//
// Visual story: "reach that converts" — the arrow is a campaign, the target
// is the audience, the bullseye is conversion, the ripples are reach.
// `aria-hidden` because this is decorative.
export default function TargetArrowAnimation() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        viewBox="0 0 220 150"
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Target — four concentric ring strokes for a clean dartboard read. */}
        <circle cx="110" cy="75" r="50" fill="none" stroke="#0A2036" strokeWidth="2.5" />
        <circle cx="110" cy="75" r="38" fill="none" stroke="#0A2036" strokeWidth="2.5" />
        <circle cx="110" cy="75" r="26" fill="none" stroke="#0A2036" strokeWidth="2.5" />
        <circle cx="110" cy="75" r="14" fill="none" stroke="#0A2036" strokeWidth="2.5" />

        {/* Crosshairs through the target — subtle, low opacity */}
        <line x1="55" y1="75" x2="165" y2="75" stroke="#0A2036" strokeWidth="1" opacity="0.18" />
        <line x1="110" y1="20" x2="110" y2="130" stroke="#0A2036" strokeWidth="1" opacity="0.18" />

        {/* Bullseye — flashes white on arrow impact */}
        <circle className={styles.bullseye} cx="110" cy="75" r="6" fill="#0877DE" />

        {/* Ripple rings — three of them, staggered. They live on TOP of the
            target so the expanding stroke reads as "spreading reach". */}
        <circle className={`${styles.ripple} ${styles.r1}`} cx="110" cy="75" r="6" fill="none" stroke="#0877DE" strokeWidth="2.5" />
        <circle className={`${styles.ripple} ${styles.r2}`} cx="110" cy="75" r="6" fill="none" stroke="#0877DE" strokeWidth="2.5" />
        <circle className={`${styles.ripple} ${styles.r3}`} cx="110" cy="75" r="6" fill="none" stroke="#0877DE" strokeWidth="2.5" />

        {/* Arrow — shaft + arrowhead + fletching, all in navy. Outer <g> sets
            the vertical anchor; inner <g> takes the CSS x-translate animation. */}
        <g transform="translate(0 75)">
          <g className={styles.arrow}>
            {/* Fletching at the tail */}
            <path d="M 0 0 L -10 -8 L -4 0 L -10 8 Z" fill="#0A2036" />
            {/* Shaft */}
            <line x1="0" y1="0" x2="70" y2="0" stroke="#0A2036" strokeWidth="3" strokeLinecap="round" />
            {/* Arrowhead */}
            <path d="M 68 -7 L 82 0 L 68 7 Z" fill="#0A2036" />
          </g>
        </g>
      </svg>
    </div>
  );
}
