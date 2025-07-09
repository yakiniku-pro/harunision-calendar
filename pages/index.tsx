// pages/index.tsx（トップアクセス時に /calendar-combined へ自動リダイレクト）
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/calendar-combined");
  }, [router]);

  return null;
}