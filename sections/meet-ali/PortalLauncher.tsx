'use client';

import { useState } from 'react';
import PinchPortal from './PinchPortal';
import styles from './MeetAli.module.css';

// Lab window #1 — Pinch Portal launcher. The only job of this client island is
// mounting/unmounting <PinchPortal/> (which owns the camera + hand tracking);
// closing it stops everything. Presented in the portfolio's shared window
// chrome so it pairs with the chatbot window beside it.
export default function PortalLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.window}>
        <div className={styles.windowBar}>
          <span className={styles.windowLights} aria-hidden="true">
            <span className={`${styles.windowLight} ${styles.lightRed}`} />
            <span className={`${styles.windowLight} ${styles.lightYellow}`} />
            <span className={`${styles.windowLight} ${styles.lightGreen}`} />
          </span>
          <span className={styles.windowName}>pinch-portal — live camera</span>
          <span className={styles.windowBadge}>
            <span className={styles.windowBadgeDot} aria-hidden="true" />
            CV
          </span>
        </div>

        <div className={styles.portalBody}>
          <span className={styles.portalBackdrop} aria-hidden="true" />
          <h3 className={styles.portalTitle}>Pinch Portal</h3>
          <p className={styles.portalText}>
            Pinch thumb + index on both hands and a live portal opens between them — stretch
            it, flatten it, watch images flow through.
          </p>
          <button type="button" className={styles.portalLaunch} onClick={() => setOpen(true)}>
            <span>Launch experience</span>
            <span aria-hidden="true">→</span>
          </button>
          <p className={styles.portalNote}>
            Uses your camera · runs 100% in-browser · nothing recorded or uploaded
          </p>
        </div>
      </div>

      {open && <PinchPortal onClose={() => setOpen(false)} />}
    </>
  );
}
