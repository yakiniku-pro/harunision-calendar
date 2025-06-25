// pages/index.tsx
import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserDocument } from "@/lib/firebase"; // 追加
import ClientOnly from "@/components/ClientOnly";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await ensureUserDocument(result.user); // Firestore登録を追加
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <main className="p-4">
      {user ? (
        <div>
          <h1 className="text-4xl font-bold text-blue-500 text-center">Tailwind 動いてる？</h1>
          <p>ようこそ、{user.displayName} さん！</p>
          <button onClick={handleLogout}>ログアウト</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Googleでログイン</button>
      )}
    </main>
  );
  
}