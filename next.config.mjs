/** @type {import('next').NextConfig} */
const nextConfig = {
  // For local development, basePath is '/'
  // This file will be overwritten during deployment with the appropriate basePath
  images: {},
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2gb',
    },
  },
  /** Auth pages live under `app/auth/*`; legacy links use `/signin`, `/signup`, etc. */
  async redirects() {
    return [
      { source: '/signin', destination: '/auth/signin', permanent: false },
      { source: '/signup', destination: '/auth/signup', permanent: false },
      { source: '/forgot-password', destination: '/auth/forgot-password', permanent: false },
      { source: '/reset-password', destination: '/auth/reset-password', permanent: false },
      { source: '/Account-Verify', destination: '/auth/Account-Verify', permanent: false },
      { source: '/Verify-Otp', destination: '/auth/Verify-Otp', permanent: false },
    ];
  },
  /** Lets Google Identity Services / OAuth popups use postMessage with the opener (avoids COOP console errors). */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
