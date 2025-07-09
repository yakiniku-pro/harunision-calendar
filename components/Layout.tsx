import { ReactNode } from 'react';
import Head from 'next/head';

type Props = {
  children: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'harunision-calendar' }: Props) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      
      {/* ここに将来的にヘッダーを置く */}
      {/* <header>...</header> */}

      <div className="bg-gray-50 min-h-screen">
        <main>{children}</main>
      </div>

      {/* ここに将来的にフッターを置く */}
      {/* <footer>...</footer> */}
    </>
  );
};

export default Layout;