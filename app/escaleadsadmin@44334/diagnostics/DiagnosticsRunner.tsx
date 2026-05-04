'use client';

import { useState } from 'react';
import styles from '../admin.module.css';

type Check = { name: string; ok: boolean; detail: string };
type Result = { checks: Check[]; halt: string | null };

export default function DiagnosticsRunner() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch('/api/admin/diagnostics');
      const data = (await response.json().catch(() => ({}))) as Partial<Result> & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || `${response.status} ${response.statusText}`);
      }
      setResult({ checks: data.checks ?? [], halt: data.halt ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnostics request failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className={styles.formActions}>
        <button type="button" className={styles.button} onClick={run} disabled={running}>
          {running ? 'Running checks…' : 'Run diagnostics'}
        </button>
      </div>

      {error ? <div className={styles.error} role="alert" style={{ marginTop: 16 }}>{error}</div> : null}

      {result ? (
        <div style={{ marginTop: 16 }}>
          {result.halt ? (
            <div className={styles.error} role="alert" style={{ marginBottom: 16 }}>
              <strong>Halted:</strong> {result.halt}
            </div>
          ) : null}

          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Check</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {result.checks.map((check) => (
                <tr key={check.name}>
                  <td style={{ fontSize: '1.2rem' }}>{check.ok ? '✅' : '❌'}</td>
                  <td><strong>{check.name}</strong></td>
                  <td>
                    <code style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>
                      {check.detail}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.checks.every((c) => c.ok) && !result.halt ? (
            <div className={styles.success} style={{ marginTop: 16 }}>
              All checks passed. The lead pipeline is fully functional. If the contact form still isn&apos;t
              saving leads in production, hard-refresh the public site (Cmd/Ctrl + Shift + R) so the
              browser picks up the latest deployed JS.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
