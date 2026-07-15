'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PinchPortal.module.css';

// ---------------------------------------------------------------------------
// Pinch Portal — browser port of Ali's Python/OpenCV desktop experiment.
//
// Everything runs client-side in the visitor's browser: MediaPipe's
// HandLandmarker (WASM) tracks both hands on the webcam feed, and when the
// thumb + index finger of BOTH hands pinch, the two pinch points become
// opposite corners of a live "portal" rectangle filled with a rotating
// carousel of images. No video is recorded or uploaded — frames never leave
// the device. The browser itself asks the visitor for camera permission the
// first time (standard getUserMedia prompt) and remembers their answer.
//
// MediaPipe is deliberately NOT an npm dependency (CLAUDE.md §4.5). It is
// self-hosted under /public/pinch-portal/vendor/ (@mediapipe/tasks-vision
// 0.10.21 bundle + wasm + hand model) and dynamic-imported only when the
// portal is opened — same-origin, so the strict CSP needs no changes, and
// it adds zero weight to the site bundle and nothing to package.json.
// ---------------------------------------------------------------------------

const VISION_BUNDLE_URL = '/pinch-portal/vendor/vision_bundle.mjs';
const VISION_WASM_URL = '/pinch-portal/vendor/wasm';
const HAND_MODEL_URL = '/pinch-portal/vendor/hand_landmarker.task';

// Tuning — mirrors the desktop original.
const PINCH_RATIO = 0.35; // tighter than this (vs hand size) STARTS a pinch
const PINCH_RELEASE_RATIO = 0.5; // an ongoing pinch only ENDS past this (hysteresis)
const PINCH_HOLD_MS = 500; // grace period when tracking momentarily loses a hand
const MIN_RECT_SIZE = 4; // portal collapses to a thin line, never disappears
const IMAGE_COUNT = 21; // files in /public/pinch-portal/img-XX.jpeg
const IMAGE_SWAP_MS = 120; // ~8 images/sec — fast strobe, but each image registers

// Brand blue, brightened a step so the frame/dots stay legible over live video.
const PORTAL_COLOR = '#3AA0FF';

// Minimal typings for the self-hosted MediaPipe module.
interface Landmark {
  x: number;
  y: number;
  z: number;
}
interface Category {
  categoryName: string;
  score: number;
}
interface HandLandmarkerResult {
  landmarks: Landmark[][];
  handedness: Category[][];
}
interface HandLandmarkerLike {
  detectForVideo(video: HTMLVideoElement, timestampMs: number): HandLandmarkerResult;
  close(): void;
}

type Status =
  | { kind: 'loading' }
  | { kind: 'camera' }
  | { kind: 'running' }
  | { kind: 'error'; message: string };

// --------------------------- pure engine helpers ---------------------------

/**
 * Pinch = thumb tip (landmark 4) close to index tip (landmark 8), measured
 * against the hand's own size (wrist 0 -> index knuckle 5) so it works at any
 * distance from the camera. Hysteresis avoids on/off flicker at the boundary.
 */
function detectPinch(
  lm: Landmark[],
  wasPinching: boolean,
): { pinching: boolean; x: number; y: number } {
  const thumb = lm[4];
  const indexTip = lm[8];
  const wrist = lm[0];
  const indexBase = lm[5];
  const pinchDist = Math.hypot(thumb.x - indexTip.x, thumb.y - indexTip.y);
  const handSize = Math.hypot(wrist.x - indexBase.x, wrist.y - indexBase.y);
  const ratio = wasPinching ? PINCH_RELEASE_RATIO : PINCH_RATIO;
  return {
    pinching: pinchDist < handSize * ratio,
    x: (thumb.x + indexTip.x) / 2,
    y: (thumb.y + indexTip.y) / 2,
  };
}

/**
 * Turn two pinch coordinates on one axis into portal edges: sorted, kept
 * inside the frame, and never thinner than minSize — so the portal collapses
 * into a thin visible line (instead of vanishing) when both hands line up.
 */
function portalSpan(a: number, b: number, minSize: number, limit: number): [number, number] {
  let lo = Math.round(Math.min(a, b));
  let hi = Math.round(Math.max(a, b));
  if (hi - lo < minSize) {
    const centre = Math.round((lo + hi) / 2);
    lo = centre - Math.floor(minSize / 2);
    hi = lo + minSize;
  }
  if (lo < 0) {
    hi -= lo;
    lo = 0;
  }
  if (hi > limit - 1) {
    lo -= hi - (limit - 1);
    hi = limit - 1;
  }
  return [Math.max(lo, 0), hi];
}

/** Cover-fit an image into the portal (like CSS object-fit: cover). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}

/** Neon border + corner brackets that scale with (and vanish on) thin portals. */
function drawPortalFrame(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  const thin = Math.min(x2 - x1, y2 - y1);
  ctx.strokeStyle = PORTAL_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(x1 + 0.5, y1 + 0.5, x2 - x1, y2 - y1);
  if (thin < 32) return; // collapsed: sleek outline only

  const bracket = Math.max(8, Math.floor(thin / 6));
  ctx.lineWidth = thin < 60 ? 1 : thin < 120 ? 2 : 3;
  ctx.beginPath();
  const corners: Array<[number, number, number, number]> = [
    [x1, y1, 1, 1],
    [x2, y1, -1, 1],
    [x1, y2, 1, -1],
    [x2, y2, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.moveTo(cx + dx * bracket, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * bracket);
  }
  ctx.stroke();
}

// -------------------------------- component --------------------------------

export default function PinchPortal({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Keyboard: Esc closes (mirrors the desktop app).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    let landmarker: HandLandmarkerLike | null = null;
    let lastVideoTime = -1;

    const video = document.createElement('video');
    video.playsInline = true;
    video.muted = true;

    // Per-session carousel + pinch state.
    const images: HTMLImageElement[] = [];
    let currentImage: HTMLImageElement | null = null;
    let lastSwap = 0;
    // label -> last confirmed pinch point (canvas px) + timestamp; entries
    // survive PINCH_HOLD_MS after tracking loses the hand.
    const activePinch = new Map<string, { x: number; y: number; t: number }>();

    function loop(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      const canvas = canvasRef.current;
      if (!canvas || !landmarker || video.readyState < 2) return;

      const W = video.videoWidth;
      const H = video.videoHeight;
      if (!W || !H) return;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Best-quality scaling for both the video frame and the portal images.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Mirror the video so it behaves like a mirror (selfie view).
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -W, 0, W, H);
      ctx.restore();

      // Only run detection when the video has a new frame.
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const result = landmarker.detectForVideo(video, now);

        const seen = new Set<string>();
        for (let i = 0; i < result.landmarks.length; i++) {
          const label = result.handedness[i]?.[0]?.categoryName ?? `hand-${i}`;
          seen.add(label);
          const p = detectPinch(result.landmarks[i], activePinch.has(label));
          if (p.pinching) {
            // Detection ran on the unmirrored video, so mirror x to match the canvas.
            activePinch.set(label, { x: (1 - p.x) * W, y: p.y * H, t: now });
          } else {
            activePinch.delete(label); // visible hand with open fingers = real release
          }
        }
        // Hands tracking LOST (not released) keep their pinch for the grace period.
        for (const [label, v] of activePinch) {
          if (!seen.has(label) && now - v.t > PINCH_HOLD_MS) activePinch.delete(label);
        }
      }

      const left = activePinch.get('Left');
      const right = activePinch.get('Right');
      if (!left || !right) return;

      const [x1, x2] = portalSpan(left.x, right.x, MIN_RECT_SIZE, W);
      const [y1, y2] = portalSpan(left.y, right.y, MIN_RECT_SIZE, H);
      const w = x2 - x1;
      const h = y2 - y1;

      // >>> THE MASK <<< — only the rectangle between the pinch points changes:
      // a carousel that moves to a different random image every IMAGE_SWAP_MS.
      if (now - lastSwap >= IMAGE_SWAP_MS) {
        lastSwap = now;
        const ready = images.filter((im) => im.complete && im.naturalWidth > 0);
        if (ready.length > 0) {
          let pick = ready[Math.floor(Math.random() * ready.length)];
          while (ready.length > 1 && pick === currentImage) {
            pick = ready[Math.floor(Math.random() * ready.length)];
          }
          currentImage = pick;
        }
      }
      if (currentImage) drawCover(ctx, currentImage, x1, y1, w, h);

      // Cosmetics: frame, pinch dots and label all scale with the portal.
      drawPortalFrame(ctx, x1, y1, x2, y2);
      const dot = Math.max(2, Math.min(8, Math.floor(Math.min(w, h) / 5)));
      ctx.fillStyle = PORTAL_COLOR;
      ctx.beginPath();
      ctx.arc(left.x, left.y, dot, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(right.x, right.y, dot, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '600 15px Inter, sans-serif';
      ctx.fillText('PORTAL // LIVE', x1, Math.max(20, y1 - 10));
    }

    async function init() {
      try {
        // 1) Hand-tracking engine (self-hosted, cached by the browser after first load).
        const bundleUrl = VISION_BUNDLE_URL; // variable keeps webpack from bundling it
        const vision = await import(/* webpackIgnore: true */ bundleUrl);
        const fileset = await vision.FilesetResolver.forVisionTasks(VISION_WASM_URL);
        if (disposed) return;

        const options = (delegate: 'GPU' | 'CPU') => ({
          baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.3,
          minTrackingConfidence: 0.3,
        });
        try {
          landmarker = await vision.HandLandmarker.createFromOptions(fileset, options('GPU'));
        } catch {
          landmarker = await vision.HandLandmarker.createFromOptions(fileset, options('CPU'));
        }
        if (disposed) return;

        // 2) Portal images start loading in the background.
        for (let i = 1; i <= IMAGE_COUNT; i++) {
          const im = new Image();
          im.src = `/pinch-portal/img-${String(i).padStart(2, '0')}.jpeg`;
          images.push(im);
        }

        // 3) Webcam — this is the point where the browser shows its own
        // camera-permission prompt to first-time visitors.
        setStatus({ kind: 'camera' });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (disposed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();

        setStatus({ kind: 'running' });
        raf = requestAnimationFrame(loop);
      } catch (err) {
        if (disposed) return;
        const denied =
          err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'NotFoundError');
        setStatus({
          kind: 'error',
          message: denied
            ? 'Camera access was denied or no camera was found. Allow camera access for this site and try again.'
            : 'Could not start the portal. Check your connection and camera, then try again.',
        });
      }
    }

    init();

    // Closing the portal stops EVERYTHING: render loop, camera, tracking.
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
      landmarker?.close();
    };
  }, []);

  // The overlay presents the live canvas inside the portfolio's window chrome
  // (same title-bar language as the lab windows on the page beneath). The red
  // traffic light AND the labelled esc button both close; engine untouched.
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Pinch Portal">
      <div className={styles.window}>
        <div className={styles.windowBar}>
          <span className={styles.windowLights}>
            <button
              type="button"
              className={`${styles.windowLight} ${styles.lightRed}`}
              onClick={() => onCloseRef.current()}
              aria-label="Close Pinch Portal"
            />
            <span className={`${styles.windowLight} ${styles.lightYellow}`} aria-hidden="true" />
            <span className={`${styles.windowLight} ${styles.lightGreen}`} aria-hidden="true" />
          </span>
          <span className={styles.windowName}>pinch-portal — live camera</span>
          <span
            className={`${styles.liveBadge} ${status.kind === 'running' ? styles.liveOn : ''}`}
          >
            <span className={styles.liveDot} aria-hidden="true" />
            {status.kind === 'running' ? 'Live' : 'Standby'}
          </span>
          <button
            type="button"
            className={styles.escButton}
            onClick={() => onCloseRef.current()}
          >
            esc
          </button>
        </div>

        <div className={styles.windowBody}>
          <canvas ref={canvasRef} className={styles.canvas} />

          {status.kind !== 'running' && (
            <div className={styles.status}>
              {status.kind === 'loading' && <p>Loading hand-tracking engine…</p>}
              {status.kind === 'camera' && <p>Starting camera — allow access when prompted.</p>}
              {status.kind === 'error' && <p>{status.message}</p>}
            </div>
          )}
        </div>

        <div className={styles.statusBar}>
          <p className={styles.hint}>
            Pinch thumb + index on <strong>both hands</strong> to open the portal
          </p>
          <span className={styles.hintKeys}>esc closes</span>
        </div>
      </div>
    </div>
  );
}
