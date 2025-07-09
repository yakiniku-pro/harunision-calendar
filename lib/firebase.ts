// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ログインユーザーのユーザードキュメントを確保する関数
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