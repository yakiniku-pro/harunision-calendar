import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { GroupProvider } from '@/contexts/GroupContext';
import { CalendarProvider } from '@/contexts/CalendarContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GroupProvider>
      <CalendarProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CalendarProvider>
    </GroupProvider>
  );
}

export default MyApp;
