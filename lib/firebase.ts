// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDAenepaa0pPtzU353yMkez6Djtfn0ULk",
  authDomain: "harunision-calendar.firebaseapp.com",
  projectId: "harunision-calendar",
  storageBucket: "harunision-calendar.firebasestorage.app",
  messagingSenderId: "747524530304",
  appId: "1:747524530304:web:23f92363200373228f4665",
  measurementId: "G-MK0BP7LJ20"
};

// 再初期化を防ぐ
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// lib/firebase.ts（既にあるファイル）に追記
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth"; // ← 忘れず追加

export const ensureUserDocument = async (user: User) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || "",
      email: user.email || "",
      createdAt: new Date().toISOString()
    });
  }
};