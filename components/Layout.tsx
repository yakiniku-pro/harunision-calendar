import { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { 
  signOut, 
  User, 
  onAuthStateChanged,
  GoogleAuthProvider, // 追加
  signInWithPopup     // 追加
} from 'firebase/auth';
import { ADMIN_UIDS } from '@/lib/config';

type Props = {
  children: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'harunision-calendar' }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const isAdmin = user ? ADMIN_UIDS.includes(user.uid) : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
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

  // ★ ログイン処理用の関数を追加
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider(); // Google認証プロバイダー
    try {
      await signInWithPopup(auth, provider); // ポップアップでログイン
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
      </Head>
      
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
              harunision-calendar
            </Link>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  管理画面
                </Link>
              )}

              {/* ★ ユーザーの有無でログイン/ログアウトボタンを切り替え */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  ログアウト
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  ログイン
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gray-50 min-h-screen">
        <main>{children}</main>
      </div>
    </>
  );
};

export default Layout;
