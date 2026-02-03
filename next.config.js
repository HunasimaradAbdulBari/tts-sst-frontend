/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Image optimization
  images: {
    domains: ['localhost', 'render.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // CRITICAL: Increase body size limit for large audio files
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // UNLIMITED SIZE
    },
  },

  // API route config for large files
  api: {
    bodyParser: {
      sizeLimit: '500mb', // UNLIMITED SIZE
    },
    responseLimit: false,
  },

  // Headers for large file support
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '*'
          },
        ]
      }
    ]
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;