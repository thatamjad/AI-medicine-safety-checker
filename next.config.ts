import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: Remove this in production - fix TypeScript errors
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: ['localhost'],
    formats: ['image/webp'],
  },
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  // External packages for server components
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
