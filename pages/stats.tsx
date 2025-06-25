import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function StatsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [uid, setUid] = useState<string>("");

  useEffect(() => {
    setUid(auth.currentUser?.uid || "");
    const fetch = async () => {
      const snap = await getDocs(collection(db, "events"));
      const data = snap.docs.map(d => d.data());
      setEvents(data);
    };
    fetch();
  }, []);

  const total = events.length;
  const participated = events.filter(ev => ev.participants?.includes(uid)).length;

  const chekiStats: { [name: string]: number } = {};
  events.forEach(ev => {
    if (ev.chekiMemo) {
      Object.entries(ev.chekiMemo).forEach(([name, count]) => {
        chekiStats[name] = (chekiStats[name] || 0) + (count as number);
      });
    }
  });

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">📊 統計</h1>
      <p>🎫 総イベント数：{total}</p>
      <p>✅ 参加済みイベント数：{participated}</p>

      <div>
        <h2 className="text-lg font-semibold mt-4 mb-2">📷 メンバー別チェキ総数</h2>
        <ul className="list-disc list-inside text-sm">
          {Object.entries(chekiStats).map(([name, count]) => (
            <li key={name}>{name}：{count}枚</li>
          ))}
        </ul>
      </div>
    </main>
  );
}