// pages/_app.tsx
import type { AppProps } from 'next/app';
import '@/styles/globals.css'; // ← Tailwind の読み込み

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}