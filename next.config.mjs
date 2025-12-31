/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

// PWAの設定を定義
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

// Next.jsの通常の設定（既存の画像設定もここに含めます）
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
};

// PWA設定とNext.jsの設定を結合してエクスポート
export default pwaConfig(nextConfig);