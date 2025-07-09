// pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

// Vercelデプロイ用のコメント
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/calendar-combined");
  }, [router]);

  return null;
}