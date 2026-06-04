import styles from './DataChartAnimation.module.css';

// Pure SVG + CSS. 5-second loop:
//   0   – 30%  bars cascade in from the baseline (staggered scaleY)
//   30  – 45%  trendline strokes across the bar tops
//   45  – 55%  arrow pops at the end of the trendline
//   55  – 92%  hold
//   92  – 100% bars and line collapse, loop
//
// Visual story: "insight that compounds" — bars step up, last bar is the
// accent colour (the winning data point), trendline traces them, arrow
// declares the upward trend. `aria-hidden` because this is decorative.
export default function DataChartAnimation() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        viewBox="0 0 220 150"
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Baseline */}
        <line
          x1="18" y1="125" x2="202" y2="125"
          stroke="#0A2036" strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Bars — five steel bars with the tallest (last) in accent.
            transform-origin: bottom is what makes each grow from the baseline. */}
        <rect className={`${styles.bar} ${styles.b1}`} x="30"  y="78"  width="22" height="46" rx="3" fill="#73838F" />
        <rect className={`${styles.bar} ${styles.b2}`} x="62"  y="65"  width="22" height="59" rx="3" fill="#73838F" />
        <rect className={`${styles.bar} ${styles.b3}`} x="94"  y="82"  width="22" height="42" rx="3" fill="#73838F" />
        <rect className={`${styles.bar} ${styles.b4}`} x="126" y="50"  width="22" height="74" rx="3" fill="#73838F" />
        <rect className={`${styles.bar} ${styles.b5}`} x="158" y="28"  width="22" height="96" rx="3" fill="#0877DE" />

        {/* Trendline drawn with stroke-dasharray reveal. pathLength=1 lets the
            keyframe use 0..1 directly so the line strokes from left to right. */}
        <polyline
          className={styles.trendline}
          pathLength={1}
          points="41,78 73,65 105,82 137,50 169,28"
          stroke="#0877DE" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Arrow up at the trendline's end. Outer <g> holds the static
            position; inner <g> takes the CSS animation. */}
        <g transform="translate(169 28)">
          <g className={styles.arrow}>
            <path d="M 0 -10 L 6 -4 L 2 -4 L 2 6 L -2 6 L -2 -4 L -6 -4 Z" fill="#0877DE" />
          </g>
        </g>

        {/* Pulsing dot at the trendline endpoint — punctuates the "winning" data point. */}
        <g transform="translate(169 28)">
          <circle className={styles.endDot} r="4" fill="#0877DE" />
        </g>
      </svg>
    </div>
  );
}
