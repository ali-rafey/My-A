import { ImageResponse } from 'next/og';

// Branded default social-share image for every route (a per-route override, e.g.
// a blog's cover_image, still wins). Generated at the edge with next/og — no new
// dependency, no static asset to maintain. 1200×630 is the standard OG size.
export const runtime = 'edge';
export const alt = 'EscaLeads — Software Solutions for Global Business Growth';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background:
            'linear-gradient(135deg, #0A2036 0%, #0B294A 55%, #061525 100%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: 30,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#7DA9FB',
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '9999px',
              background: '#0E84EC',
            }}
          />
          EscaLeads
        </div>

        <div
          style={{
            marginTop: '34px',
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
          }}
        >
          Software Solutions for Global Business Growth
        </div>

        <div
          style={{
            marginTop: '30px',
            fontSize: 32,
            color: '#94A3B8',
            maxWidth: '840px',
            lineHeight: 1.4,
          }}
        >
          Web apps, mobile experiences, and AI automations engineered to grow.
        </div>
      </div>
    ),
    { ...size },
  );
}
