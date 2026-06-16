import styles from './ReachAnimation.module.css';
import type { CSSProperties } from 'react';

// Pure SVG + CSS. "Viral network spread" — a central node continuously fires
// bright signals along thin connections to a ring of 6 surrounding nodes.
// Each signal arrives at its outer node and triggers a halo + colour pulse,
// then the cycle repeats. The 6 signals are staggered by 0.4 s so the page
// always shows multiple in flight — the effect reads as a campaign
// propagating through an audience, not a synchronised pulse.
//
// Replaces the megaphone on the Advertising & Marketing card. Premium-
// dataviz silhouette, not gimmicky — and tied to the card's "reach that
// converts" headline literally (signals = reach, glow = conversion).

type Node = { x: number; y: number };

const CENTER: Node = { x: 110, y: 75 };
const RADIUS = 58;

// 6 outer nodes at every 60° around the centre. The hexagonal ring reads
// cleaner than 8+ nodes at this canvas size (220 × 150).
const OUTER_NODES: Node[] = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * 60) * Math.PI / 180;
  return {
    x: CENTER.x + RADIUS * Math.cos(angle),
    y: CENTER.y + RADIUS * Math.sin(angle),
  };
});

// 0.4 s between adjacent signals so the 6 of them fit inside the 2.4 s loop
// with continuous activity but no overlap-storm.
const LOOP_S = 2.4;
const STEP_S = 0.4;

export default function ReachAnimation() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        viewBox="0 0 220 150"
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Static thin connections — drawn first so everything sits over them. */}
        {OUTER_NODES.map((n, i) => (
          <line
            key={`L${i}`}
            x1={CENTER.x} y1={CENTER.y}
            x2={n.x} y2={n.y}
            stroke="rgba(10, 32, 54, 0.16)"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        ))}

        {/* Outer nodes: dim base circle + glow halo that pulses on signal arrival. */}
        {OUTER_NODES.map((n, i) => {
          const delay = (i * STEP_S).toFixed(2);
          const style: CSSProperties = { ['--delay' as string]: `${delay}s` };
          return (
            <g key={`N${i}`}>
              <circle
                cx={n.x} cy={n.y} r="14"
                className={styles.outerHalo}
                style={style}
                fill="#0877DE"
              />
              <circle
                cx={n.x} cy={n.y} r="5.5"
                className={styles.outerNode}
                style={style}
              />
            </g>
          );
        })}

        {/* Signals — bright blue dots that travel from the centre to each
            outer node. Outer <g> pins the static origin at the centre; inner
            <g> takes the CSS transform/opacity animation. */}
        {OUTER_NODES.map((n, i) => {
          const dx = n.x - CENTER.x;
          const dy = n.y - CENTER.y;
          const delay = (i * STEP_S).toFixed(2);
          const style: CSSProperties = {
            ['--dx' as string]: `${dx.toFixed(1)}px`,
            ['--dy' as string]: `${dy.toFixed(1)}px`,
            ['--delay' as string]: `${delay}s`,
          };
          return (
            <g key={`S${i}`} transform={`translate(${CENTER.x} ${CENTER.y})`}>
              <g className={styles.signal} style={style}>
                {/* A faint glow blob behind the bright signal head */}
                <circle r="6" fill="#0877DE" opacity="0.35" />
                <circle r="3.2" fill="#0877DE" />
              </g>
            </g>
          );
        })}

        {/* Centre — softly-pulsing halo + solid core. The source of signals. */}
        <circle cx={CENTER.x} cy={CENTER.y} r="22" className={styles.centerHalo} fill="#0877DE" />
        <circle cx={CENTER.x} cy={CENTER.y} r="8" className={styles.centerNode} fill="#0A2036" />
      </svg>
    </div>
  );
}
