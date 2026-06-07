/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  
  async headers() {
    if (process.env.NODE_ENV === 'development') return [];
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
              "media-src 'self' data: blob: https:",
              "connect-src 'self' https: wss: ws:",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
