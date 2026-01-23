import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Skills Store - Install Claude Skills in 2 Clicks';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.5,
        }}
      />

      {/* Logo icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={{ marginRight: 16 }}>
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="#171717"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#171717',
          marginBottom: 24,
          letterSpacing: '-0.02em',
        }}
      >
        Skills Store
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 32,
          color: '#525252',
          marginBottom: 48,
          textAlign: 'center',
          maxWidth: 800,
        }}
      >
        Install superpowers into Claude in 2 clicks
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: 'flex',
          gap: 16,
        }}
      >
        {['No coding required', 'Open source', '100+ skills'].map((text) => (
          <div
            key={text}
            style={{
              background: '#171717',
              color: '#fafafa',
              padding: '12px 24px',
              borderRadius: 9999,
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* Bottom URL */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          fontSize: 20,
          color: '#a3a3a3',
        }}
      >
        skills-store-delta.vercel.app
      </div>
    </div>,
    {
      ...size,
    }
  );
}
