import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { format, addDays, startOfToday } from "date-fns";
import { ja } from "date-fns/locale";

// --- 型定義 ---
interface Deadline {
  eventId: string;
  eventTitle: string;
  saleName: string;
  endAt: Timestamp;
  url: string;
}

// --- トグルセクション用のコンポーネント ---
const DeadlineSection = ({ title, deadlines, colorClasses, isOpen, onToggle }: {
  title: string;
  deadlines: Deadline[];
  colorClasses: string;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className={`rounded-xl shadow-sm overflow-hidden border ${isOpen ? 'bg-white/70' : 'bg-white/50'}`}>
    <button
      onClick={onToggle}
      className={`w-full flex justify-between items-center p-4 transition-colors ${colorClasses}`}
    >
      <h2 className="text-lg font-bold">{title} ({deadlines.length}件)</h2>
      <span className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
    </button>
    {isOpen && (
      <div className="p-4 space-y-4">
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
          <p className="text-center text-gray-500 py-4">対象の締切はありません。</p>
        )}
      </div>
    )}
  </div>
);

export default function DeadlinesPage() {
  const [allDeadlines, setAllDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    urgent: true,
    soon: true,
    later: false,
  });
  
  // ★★★ フィルターの状態を管理するStateを追加 ★★★
  const [filterSenko, setFilterSenko] = useState(false);
  const [filterChusen, setFilterChusen] = useState(false);

  useEffect(() => {
    const fetchDeadlines = async () => {
      setLoading(true);
      try {
        const today = startOfToday();
        const eventsQuery = query(collection(db, "events"), where("date", ">=", today));
        const eventsSnap = await getDocs(eventsQuery);

        const deadlines: Deadline[] = [];
        eventsSnap.forEach(doc => {
          const event = doc.data();
          const salePeriods = event.ticketSales;
          // 新旧両方のデータ形式に対応
          const salesArray = Array.isArray(salePeriods) ? salePeriods : 
            (typeof salePeriods === 'object' && salePeriods !== null) ? 
            Object.entries(salePeriods).map(([key, value]) => ({ saleName: key, ...(value as object) })) : [];

          salesArray.forEach((period: any) => {
            if (period && period.endAt && period.endAt.toDate() >= today) {
              deadlines.push({
                eventId: doc.id,
                eventTitle: event.title,
                saleName: period.saleName,
                endAt: period.endAt,
                url: period.url,
              });
            }
          });
        });
        deadlines.sort((a, b) => a.endAt.toMillis() - b.endAt.toMillis());
        setAllDeadlines(deadlines);
      } catch (error) {
        console.error("締切情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeadlines();
  }, []);

  // ★★★ フィルターロジックをuseMemoに追加 ★★★
  const categorizedDeadlines = useMemo(() => {
    const today = startOfToday();
    const tomorrow = addDays(today, 2);
    const nextWeek = addDays(today, 8);

    const filtered = allDeadlines.filter(d => {
      const saleName = d.saleName || '';
      const senkoMatch = !filterSenko || saleName.includes('先行');
      const chusenMatch = !filterChusen || saleName.includes('抽選');
      return senkoMatch && chusenMatch;
    });

    const urgent: Deadline[] = [];
    const soon: Deadline[] = [];
    const later: Deadline[] = [];

    filtered.forEach(d => {
      const endDate = d.endAt.toDate();
      if (endDate < tomorrow) {
        urgent.push(d);
      } else if (endDate < nextWeek) {
        soon.push(d);
      } else {
        later.push(d);
      }
    });
    return { urgent, soon, later };
  }, [allDeadlines, filterSenko, filterChusen]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
          <h1 className="text-2xl md:text-3xl font-bold text-pink-500">🎟️ 予約締切一覧</h1>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            カレンダーに戻る
          </Link>
        </div>
        
        {/* ★★★ フィルターボタンのUIを追加 ★★★ */}
        <div className="p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 mr-2">絞り込み:</span>
            <button
              onClick={() => setFilterSenko(!filterSenko)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                filterSenko ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              先行のみ
            </button>
            <button
              onClick={() => setFilterChusen(!filterChusen)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                filterChusen ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              抽選のみ
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <DeadlineSection
            title="期限：今日～明日まで"
            deadlines={categorizedDeadlines.urgent}
            colorClasses="bg-red-200/80 text-red-800"
            isOpen={openSections.urgent}
            onToggle={() => toggleSection('urgent')}
          />
          <DeadlineSection
            title="期限：1週間以内"
            deadlines={categorizedDeadlines.soon}
            colorClasses="bg-amber-200/80 text-amber-800"
            isOpen={openSections.soon}
            onToggle={() => toggleSection('soon')}
          />
          <DeadlineSection
            title="期限：1週間以上先"
            deadlines={categorizedDeadlines.later}
            colorClasses="bg-gray-200/80 text-gray-800"
            isOpen={openSections.later}
            onToggle={() => toggleSection('later')}
          />
        </div>
      </div>
    </main>
  );
}