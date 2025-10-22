import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack: (config) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // react-force-graph에서 발생하는 AFRAME 에러 무시
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push({
        'checkpoint-controls': 'checkpoint-controls',
        'aframe': 'aframe'
      });
    }

    return config;
  },
};

export default nextConfig;
