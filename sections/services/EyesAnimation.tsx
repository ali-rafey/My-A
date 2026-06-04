import styles from './EyesAnimation.module.css';

// Pure SVG + CSS animation. No React state — no client component needed.
//
// 6-second loop, infinite:
//   0.0 – 2.5 s : pupils scan around, settle looking down at card content
//   2.5 – 3.0 s : pupils fade out, hearts pop into the eye whites
//   3.0 – 5.5 s : in-eye hearts pulse; six floaters burst out and drift up
//   5.5 – 6.0 s : hearts fade, pupils return — loop
//
// Drawn as a single inline SVG so it ships as zero-JS markup and the entire
// thing animates on the GPU via CSS transform/opacity keyframes.
// `aria-hidden` because this is decorative.
export default function EyesAnimation() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        viewBox="0 0 220 150"
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ─── LEFT EYE ─────────────────────────────────────────────────── */}
        <g>
          <ellipse
            cx="65" cy="58" rx="34" ry="42"
            fill="#FFFFFF"
            stroke="#0A2036" strokeWidth="3.5"
          />
          {/* Pupil — scans around, then fades out for love phase */}
          <g className={styles.pupil}>
            <circle cx="65" cy="70" r="13" fill="#0A2036" />
            <circle cx="60" cy="64" r="3.5" fill="#FFFFFF" />
          </g>
          {/* Heart-eye — pops in once pupil fades; positioned with static
              SVG transform on the outer <g>, animated on the inner <g> via
              CSS so the two transform contexts don't conflict. */}
          <g transform="translate(65 70)">
            <g className={styles.heartScale}>
              <path
                d="M 0 9 C 0 9, -11 2, -11 -4 C -11 -9, -5 -10, 0 -4 C 5 -10, 11 -9, 11 -4 C 11 2, 0 9, 0 9 Z"
                fill="#E11D48"
              />
              <ellipse cx="-4" cy="-3" rx="2" ry="3" fill="rgba(255,255,255,0.55)" />
            </g>
          </g>
          {/* Cheek squint line under the eye — gives the cute look the
              operator's reference image has. */}
          <path
            d="M 36 99 Q 65 112 94 99"
            stroke="#0A2036" strokeWidth="3.5"
            fill="none" strokeLinecap="round"
          />
        </g>

        {/* ─── RIGHT EYE (mirror of left) ──────────────────────────────── */}
        <g>
          <ellipse
            cx="155" cy="58" rx="34" ry="42"
            fill="#FFFFFF"
            stroke="#0A2036" strokeWidth="3.5"
          />
          <g className={styles.pupil}>
            <circle cx="155" cy="70" r="13" fill="#0A2036" />
            <circle cx="150" cy="64" r="3.5" fill="#FFFFFF" />
          </g>
          <g transform="translate(155 70)">
            <g className={styles.heartScale}>
              <path
                d="M 0 9 C 0 9, -11 2, -11 -4 C -11 -9, -5 -10, 0 -4 C 5 -10, 11 -9, 11 -4 C 11 2, 0 9, 0 9 Z"
                fill="#E11D48"
              />
              <ellipse cx="-4" cy="-3" rx="2" ry="3" fill="rgba(255,255,255,0.55)" />
            </g>
          </g>
          <path
            d="M 126 99 Q 155 112 184 99"
            stroke="#0A2036" strokeWidth="3.5"
            fill="none" strokeLinecap="round"
          />
        </g>

        {/* ─── FLOATING HEARTS ─────────────────────────────────────────────
            Six instances, staggered via per-class animation-delay. Each
            outer <g> sets a static spawn point; the inner <g> with
            .floaterMove does the float-up + scale + fade. Drift direction
            comes from a per-floater CSS custom property `--drift`. */}
        <g className={`${styles.floater} ${styles.f1}`} transform="translate(65 52)">
          <g className={styles.floaterMove}>
            <path d="M 0 6 C 0 6, -8 1, -8 -3 C -8 -7, -3 -7, 0 -3 C 3 -7, 8 -7, 8 -3 C 8 1, 0 6, 0 6 Z" fill="#E11D48" />
          </g>
        </g>
        <g className={`${styles.floater} ${styles.f2}`} transform="translate(95 58)">
          <g className={styles.floaterMove}>
            <path d="M 0 5 C 0 5, -7 1, -7 -2 C -7 -6, -3 -6, 0 -2 C 3 -6, 7 -6, 7 -2 C 7 1, 0 5, 0 5 Z" fill="#EC4899" />
          </g>
        </g>
        <g className={`${styles.floater} ${styles.f3}`} transform="translate(155 52)">
          <g className={styles.floaterMove}>
            <path d="M 0 6 C 0 6, -8 1, -8 -3 C -8 -7, -3 -7, 0 -3 C 3 -7, 8 -7, 8 -3 C 8 1, 0 6, 0 6 Z" fill="#E11D48" />
          </g>
        </g>
        <g className={`${styles.floater} ${styles.f4}`} transform="translate(125 58)">
          <g className={styles.floaterMove}>
            <path d="M 0 5 C 0 5, -7 1, -7 -2 C -7 -6, -3 -6, 0 -2 C 3 -6, 7 -6, 7 -2 C 7 1, 0 5, 0 5 Z" fill="#EC4899" />
          </g>
        </g>
        <g className={`${styles.floater} ${styles.f5}`} transform="translate(45 36)">
          <g className={styles.floaterMove}>
            <path d="M 0 5 C 0 5, -6 1, -6 -2 C -6 -5, -3 -5, 0 -2 C 3 -5, 6 -5, 6 -2 C 6 1, 0 5, 0 5 Z" fill="#F472B6" />
          </g>
        </g>
        <g className={`${styles.floater} ${styles.f6}`} transform="translate(175 36)">
          <g className={styles.floaterMove}>
            <path d="M 0 5 C 0 5, -6 1, -6 -2 C -6 -5, -3 -5, 0 -2 C 3 -5, 6 -5, 6 -2 C 6 1, 0 5, 0 5 Z" fill="#F472B6" />
          </g>
        </g>
      </svg>
    </div>
  );
}
