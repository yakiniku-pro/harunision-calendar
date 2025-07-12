import { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { signOut, User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ADMIN_UIDS } from '@/lib/config';

type Props = {
  children: ReactNode;
  title?: string;
};

const Layout = ({ children, title = '推し活カレンダー' }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const isAdmin = user ? ADMIN_UIDS.includes(user.uid) : false;

  // ★ 開発環境フラグ用のstateを追加
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  
  // ★ クライアントサイドでのみ実行し、ホスト名を確認するuseEffectを追加
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDev(window.location.hostname === 'localhost');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('ログアウトしました。');
      router.push('/');
    } catch (error) {
      console.error("ログアウトエラー:", error);
      alert('ログアウトに失敗しました。');
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert('ログインしました。');
    } catch (error) {
      console.error("ログインエラー:", error);
      alert('ログインに失敗しました。');
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f472b6" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif" }}>
        <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-20 border-b border-white/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-pink-500 hover:text-pink-600 transition-colors">
                {/* ★ isDevフラグがtrueの場合に接頭辞を表示 */}
                {isDev && <span className="text-sm font-normal text-green-600 mr-2">[開発環境]</span>}
                推し活カレンダー
              </Link>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link href="/admin/dashboard" className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    管理画面
                  </Link>
                )}
                {user ? (
                  <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    ログアウト
                  </button>
                ) : (
                  <button onClick={handleLogin} className="px-3 py-1.5 text-xs font-semibold text-white bg-pink-400 hover:bg-pink-500 rounded-lg transition-colors">
                    ログイン
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </>
  );
};

export default Layout;