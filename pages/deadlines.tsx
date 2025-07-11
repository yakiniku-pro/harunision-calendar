import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// 締切情報の型定義
interface Deadline {
  eventId: string;
  eventTitle: string;
  saleName: string;
  endAt: Timestamp;
  url: string;
}

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      setLoading(true);
      try {
        const now = new Date();
        // これから締切を迎えるイベントのみを取得
        const eventsQuery = query(collection(db, "events"), where("date", ">=", now));
        const eventsSnap = await getDocs(eventsQuery);

        const allDeadlines: Deadline[] = [];

        eventsSnap.forEach(doc => {
          const event = doc.data();
          const eventId = doc.id;
          const eventTitle = event.title;

          const salePeriods = {
            "最速先行": event.ticketSales?.preSaleFastest,
            "先行販売": event.ticketSales?.preSaleGeneral,
            "一般販売": event.ticketSales?.generalSale,
          };

          Object.entries(salePeriods).forEach(([saleName, period]) => {
            // 締切日時が未来の場合のみリストに追加
            if (period && period.endAt && period.endAt.toDate() > now) {
              allDeadlines.push({
                eventId,
                eventTitle,
                saleName,
                endAt: period.endAt,
                url: period.url,
              });
            }
          });
        });

        // 締切が近い順にソート
        allDeadlines.sort((a, b) => a.endAt.toMillis() - b.endAt.toMillis());
        setDeadlines(allDeadlines);

      } catch (error) {
        console.error("締切情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, []);

  if (loading) {
    return (
        <main className="p-4 md:p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
            <div className="text-center text-gray-500">締切情報を読み込み中...</div>
        </main>
    );
  }

  return (
    <main className="p-4 md:p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-500">🎟️ チケット予約締切一覧</h1>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            カレンダーに戻る
          </Link>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm p-4 sm:p-6 space-y-4">
          {deadlines.length > 0 ? (
            deadlines.map((deadline, index) => (
              <div key={index} className="p-3 border-b border-gray-200 last:border-b-0">
                <p className="text-sm text-gray-500">{deadline.saleName}</p>
                <Link href={`/event/${deadline.eventId}`} className="font-bold text-lg text-gray-800 hover:text-pink-500">
                  {deadline.eventTitle}
                </Link>
                <p className="font-semibold text-red-500 mt-1">
                  締切: {format(deadline.endAt.toDate(), 'yyyy年M月d日 (E) HH:mm', { locale: ja })}
                </p>
                {deadline.url && (
                  <a href={deadline.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-3 py-1 bg-pink-400 text-white text-xs font-bold rounded-full hover:bg-pink-500">
                    購入ページへ
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">現在、締切が近いチケット販売はありません。</p>
          )}
        </div>
      </div>
    </main>
  );
}
