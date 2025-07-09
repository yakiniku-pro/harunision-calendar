import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link"; // Linkをインポート

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // idが文字列で、かつ空でないことを確認
    if (typeof id !== "string" || !id) return;

    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, "events", id));
        if (snap.exists()) {
          const data = snap.data();
          setEvent(data);
          setChekiMemo(data.chekiMemo || {});
          // auth.currentUserが利用可能になってからUIDを比較
          const currentUser = auth.currentUser;
          if (currentUser) {
            setJoined(data.participants?.includes(currentUser.uid) || false);
          }
        } else {
          console.warn("イベントが見つかりません");
        }
      } catch (error) {
        console.error("取得失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    // Firebase Authの初期化を待つ
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUid(user?.uid || null);
      fetchEvent();
    });

    return () => unsubscribe();
  }, [id]);

  const updateCheki = async () => {
    if (typeof id !== "string") return;
    await updateDoc(doc(db, "events", id), { chekiMemo });
    alert("チェキ枚数を保存しました！");
  };

  const toggleParticipation = async () => {
    if (!id || !uid || typeof id !== "string") return;
    const ref = doc(db, "events", id);
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

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;
  if (!event) return <div className="p-4 text-center text-red-500">イベントが見つかりませんでした。</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Link href="/calendar-combined" className="text-sm text-blue-600 underline hover:text-blue-800">
          ← カレンダーに戻る
      </Link>

      <h1 className="text-3xl font-bold">{event.title}</h1>
      
      {/* ClientOnlyを使わず、event.dateが存在する場合のみformatするように変更 */}
      {event.date && <p>📅 日付：{format(event.date.toDate(), "yyyy年MM月dd日")}</p>}
      <p>⏰ 開場：{event.openTime || "未定"} ／ 開演：{event.startTime || "未定"}</p>
      <p>📍 会場：{event.venue}</p>
      <p>💴 料金：{event.price?.priority}円（優先）／{event.price?.general}円（一般）</p>

      {event.eventPhotoUrl && (
        <div>
          <h2 className="text-xl font-semibold mt-4">📸 イベント写真</h2>
          <Image src={event.eventPhotoUrl} alt="event photo" width={640} height={360} className="rounded mt-2" />
        </div>
      )}

      {event.memberPhotoUrl && (
        <div>
          <h2 className="text-xl font-semibold mt-4">🧑‍🎤 メンバー写真</h2>
          <Image src={event.memberPhotoUrl} alt="member photo" width={640} height={360} className="rounded mt-2" />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">📝 チェキメモ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map(name => (
            <div key={name} className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 ${colors[name]} rounded-full flex-shrink-0`} />
              <span className="w-24 font-medium">{name}</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => adjust(name, -1)}>-</button>
                <span className="w-6 text-center">{chekiMemo[name] || 0}</span>
                <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => adjust(name, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={updateCheki} className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
          チェキ枚数を保存
        </button>
      </div>

      <div>
        <button onClick={toggleParticipation} className={`w-full px-4 py-2 rounded text-white font-semibold transition-opacity ${joined ? "bg-gray-500 hover:opacity-90" : "bg-blue-500 hover:opacity-90"}`}>
          {joined ? "参加を取り消す" : "参加する"}
        </button>
      </div>
    </div>
  );
}