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
  const [mounted, setMounted] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const router = useRouter();
  const isGuidePage = router.pathname === '/harunision/guide';
  const hideHeader = isGuidePage;
  const hideFooter = isGuidePage;
  const pageTitle = isGuidePage ? 'ハルニシオンの楽しみ方' : title;

  // マウント完了後かつユーザーが管理者リストに含まれるか判定
  const isAdmin = mounted && user ? ADMIN_UIDS.includes(user.uid) : false;

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    if (typeof window !== 'undefined') {
      setIsDev(window.location.hostname === 'localhost');
    }

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("ログインエラー:", error);
      alert('ログインに失敗しました。');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="ハルニシオン公式スケジュール" />
      </Head>

      {!hideHeader && (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-pink-500 hover:text-pink-600 transition-colors">
                {isDev && <span className="text-sm font-normal text-green-600 mr-2">[開発環境]</span>}
                推し活カレンダー
              </Link>
              <div className="flex items-center gap-2">
                {/* マウント前（サーバー側レンダリング時）の不一致を防ぐため mounted を確認 */}
                {mounted && isAdmin && (
                  <Link href="/admin/dashboard" className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    管理画面
                  </Link>
                )}
                {mounted && (
                  user ? (
                    <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      ログアウト
                    </button>
                  ) : (
                    <button onClick={handleLogin} className="px-3 py-1.5 text-xs font-semibold text-white bg-pink-400 hover:bg-pink-500 rounded-lg shadow-sm transition-colors">
                      ログイン
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>

      {!hideFooter && (
        <footer className="bg-white border-t border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© 2024 ハルニシオン推し活カレンダー</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
