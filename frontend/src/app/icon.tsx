import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// Brand favicon: rounded green tile with a golden crescent + star (☪️ stylized).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #10B981, #059669)',
          borderRadius: 14,
          fontSize: 40,
        }}
      >
        <span style={{ color: '#FCD34D' }}>☪</span>
      </div>
    ),
    { ...size },
  );
}
