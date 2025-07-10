import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { GroupProvider } from '@/contexts/GroupContext'; // ★インポート

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // ★ GroupProviderで全体を囲む
    <GroupProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GroupProvider>
  );
}

export default MyApp;