'use client';

import { type CSSProperties, type ComponentType, useEffect, useRef, useState } from 'react';
import { PRELOAD } from './kit';
import { RESEARCH } from './research';
import { PRESENCE } from './presence';
import { ADVERTISING } from './advertising';
import { AUTOMATION } from './automation';
import styles from './CardFilm.module.css';

// =============================================================================
// CardFilm — a short film inside an open service card.
// =============================================================================
// Built like the home film: a fixed canvas (640×500 here) scaled as one unit
// to fill the card, one shot mounted at a time, each shot's motion in CSS
// keyed off `--d`. A service has four shots, one per part of the service, and
// a story bar on top (four segments + the name of the part on screen); the
// segments are also buttons that jump to their part.
//
// Not playing (a closed card, a carousel slide off to the side, or reduced
// motion) it shows a still: the current shot's finished frame.
// =============================================================================

export type Shot = { dur: number; tone?: 'dark' | 'sky'; /** How the shot cuts in. */ enter?: 'up' | 'zoom' | 'wipe'; Comp: ComponentType };
export type Film = { shots: Shot[]; order: number[] };

const FILMS: Record<number, Film> = { 1: RESEARCH, 2: PRESENCE, 3: ADVERTISING, 4: AUTOMATION };

const DESIGN_W = 640;
const DESIGN_H = 500;
const MAX_OVERSCAN = 1.1;

let preloaded = false;

export default function CardFilm({ id, running }: { id: number; running: boolean }) {
  const film = FILMS[id];
  const [index, setIndex] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preloaded) return;
    preloaded = true;
    PRELOAD.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, []);

  // Fit the canvas: cover the stage, but never crop more than MAX_OVERSCAN.
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const fit = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (!width || !height) return;
      const contain = Math.min(width / DESIGN_W, height / DESIGN_H);
      const cover = Math.max(width / DESIGN_W, height / DESIGN_H);
      canvas.style.setProperty('--k', String(Math.min(cover, contain * MAX_OVERSCAN)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Each time the film starts playing, it starts from its first shot.
  useEffect(() => {
    if (!running) return;
    setIndex(0);
    setEpoch((e) => e + 1);
  }, [running]);

  useEffect(() => {
    if (!running || !film) return;
    const timer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % film.shots.length);
    }, film.shots[index].dur);
    return () => window.clearTimeout(timer);
  }, [running, index, epoch, film]);

  if (!film) return null;
  const shot = film.shots[index];
  const Shot = shot.Comp;
  const still = !running;

  return (
    <div className={styles.film} data-still={still || undefined}>
      <div ref={stageRef} className={styles.stage} data-tone={shot.tone}>
        <div ref={canvasRef} className={styles.canvas} aria-hidden="true">
          <div
            key={`${index}-${epoch}`}
            className={styles.shot}
            data-enter={shot.enter}
            style={{ '--exit': `${Math.max(0, shot.dur - 260)}ms` } as CSSProperties}
          >
            <Shot />
          </div>
        </div>
      </div>

    </div>
  );
}
