const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Use custom service worker
  sw: 'sw.js',
  // Exclude API routes and server actions from precaching
  buildExcludes: [/middleware-manifest\.json$/, /middleware-runtime\.js$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['vercel-blob.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'wglifeos.vercel.app'],
    },
  },
}

module.exports = withPWA(nextConfig)
