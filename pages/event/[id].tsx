import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from "date-fns";
import ClientOnly from "@/components/ClientOnly";

const members = ["馬場彩華", "芹沢心色", "来海とい", "長浜瑠花", "村瀬ゆうな", "福間彩音"];
const colors: { [name: string]: string } = {
  "馬場彩華": "bg-yellow-400",
  "芹沢心色": "bg-red-500",
  "来海とい": "bg-green-400",
  "長浜瑠花": "bg-purple-500",
  "村瀬ゆうな": "bg-pink-400",
  "福間彩音": "bg-sky-400"
};

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState<any>(null);
  const [chekiMemo, setChekiMemo] = useState<{ [name: string]: number }>({});
  const [uid, setUid] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, "events", String(id)));
      if (snap.exists()) {
        setEvent(snap.data());
        setChekiMemo(snap.data().chekiMemo || {});
        setJoined(snap.data().participants?.includes(auth.currentUser?.uid) || false);
      }
      setUid(auth.currentUser?.uid || null);
    };
    fetch();
  }, [id]);

  const updateCheki = async () => {
    if (!id) return;
    await updateDoc(doc(db, "events", String(id)), {
      chekiMemo
    });
    alert("チェキ枚数を保存しました！");
  };

  const toggleParticipation = async () => {
    if (!id || !uid) return;
    const ref = doc(db, "events", String(id));
    await updateDoc(ref, {
      participants: joined ? arrayRemove(uid) : arrayUnion(uid)
    });
    setJoined(!joined);
  };

  const adjust = (name: string, delta: number) => {
    setChekiMemo(prev => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + delta)
    }));
  };

  if (!event) return <div className="p-4">読み込み中...</div>;

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <ClientOnly>
        <p>📅 日付：{format(event.date.toDate(), "yyyy年MM月dd日")}</p>
      </ClientOnly>
      <p>⏰ 開場：{event.openTime || "未定"} ／ 開演：{event.startTime || "未定"}</p>
      <p>📍 会場：{event.venue}</p>
      <p>💴 料金：{event.price?.priority}円（優先）／{event.price?.general}円（一般）</p>

      <div>
        <h2 className="font-semibold mb-2">📝 チェキメモ</h2>
        <div className="grid grid-cols-2 gap-2">
          {members.map(name => (
            <div key={name} className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 ${colors[name]} rounded-full`} />
              <span className="w-20">{name}</span>
              <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => adjust(name, -1)}>-</button>
              <span>{chekiMemo[name] || 0}</span>
              <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => adjust(name, 1)}>+</button>
            </div>
          ))}
        </div>
        <button onClick={updateCheki} className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">保存</button>
      </div>

      <div>
        <button onClick={toggleParticipation} className={`px-4 py-2 rounded ${joined ? "bg-gray-400" : "bg-blue-500"} text-white hover:opacity-90`}>
          {joined ? "参加を取り消す" : "参加する"}
        </button>
      </div>
    </main>
  );
}