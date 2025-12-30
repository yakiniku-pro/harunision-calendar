import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function EventExport() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // 日付の昇順（古い順）
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // --- 会場名を抽出するロジック (最優先を再設定) ---
  const getVenue = (event: any) => {
    // 1. 直下の location フィールド (これが最も確実な場合があります)
    if (event.location) return event.location;

    // 2. ticketSales 内の venue
    const ts = event.ticketSales;
    if (ts) {
      const first = Array.isArray(ts) ? ts[0] : ts[0] || ts["0"];
      if (first?.venue) return first.venue;
    }

    // 3. timeSlots 内の location (ここに入っているパターンもあります)
    const slots = event.timeSlots;
    if (slots) {
      const first = Array.isArray(slots) ? slots[0] : slots[0] || slots["0"];
      if (first?.location) return first.location;
    }

    return "";
  };

  // --- ライブ数を抽出するロジック (performanceTimesをカウント) ---
  const getLiveCount = (event: any) => {
    // ご指摘の performanceTimes フィールドをチェック
    const pt = event.performanceTimes;
    
    if (!pt) return 0;
    
    if (Array.isArray(pt)) {
      return pt.length;
    }
    
    // オブジェクト形式で保存されている場合への対応
    if (typeof pt === 'object') {
      return Object.keys(pt).filter(key => !isNaN(Number(key))).length;
    }

    return 0;
  };

  const copyToClipboard = () => {
    const header = "No\t開催日\tイベント名\t会場\tライブ数\n";
    const rows = events.map((e, index) => {
      const dateStr = format(e.date.toDate(), "yyyy/MM/dd");
      return `${index + 1}\t${dateStr}\t${e.title}\t${getVenue(e)}\t${getLiveCount(e)}`;
    }).join("\n");

    navigator.clipboard.writeText(header + rows);
    alert("コピーしました！");
  };

  if (loading) return <div className="p-8">読み込み中...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">イベント集計リスト</h1>
            <p className="text-sm text-pink-500 mt-1">performanceTimes をカウント中</p>
          </div>
          <button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold">
            コピー
          </button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">No</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">日付</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">イベント名</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">会場</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500">ライブ数</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {events.map((e, index) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 text-sm text-gray-400 font-mono">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(e.date.toDate(), "yyyy/MM/dd")}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{e.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getVenue(e)}</td>
                  <td className="px-4 py-4 text-sm text-center font-bold text-pink-500">
                    {getLiveCount(e)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}