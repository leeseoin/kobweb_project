/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경에서는 output을 제거하여 SSR 지원
  ...(process.env.NODE_ENV === 'production' && { output: "export" }),
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
    NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT || '10000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
  },
  // 개발 환경에서 API 프록시 설정 (CORS 문제 해결용)
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
        {
          source: '/ws/:path*',
          destination: 'http://localhost:8080/ws/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;