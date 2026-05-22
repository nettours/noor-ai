/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // إيقاف CSP في التطوير حتى يعمل localhost
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "media-src 'self' data: blob: https://cdn.islamic.network https://server8.mp3quran.net https://server7.mp3quran.net https://server10.mp3quran.net https://server11.mp3quran.net https://server13.mp3quran.net https://download.quranicaudio.com https://everyayah.com",
              "connect-src 'self' http://localhost:4000 ws://localhost:4000 https://api.alquran.cloud https://api.aladhan.com https://api.anthropic.com https://cdn.islamic.network https://*.mp3quran.net https://download.quranicaudio.com https://everyayah.com wss://*.up.railway.app https://*.up.railway.app wss://*.vercel.app",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // السماح بكل المصادر
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // إعدادات Turbopack الجديدة (بدون experimental)
  turbopack: {
    rules: {},
  },
};

module.exports = nextConfig;
