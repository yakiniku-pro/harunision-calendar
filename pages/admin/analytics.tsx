import { useEffect, useState } from "react";
import Link from "next/link";
import { collectionGroup, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { ja } from "date-fns/locale";

// 型定義を更新
interface DailyStat {
  date: string;
  activeUsers: Set<string>;
  participationCount: number;
  chekiCount: number;
  otherCount: number;
}

export default function AnalyticsAdmin() {
  const [stats, setStats] = useState<{ [date: string]: DailyStat }>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const startDate = startOfMonth(currentMonth);
        const endDate = endOfMonth(currentMonth);

        const q = query(
          collectionGroup(db, 'userRecords'),
          where('updatedAt', '>=', startDate),
          where('updatedAt', '<=', endDate),
          orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const dailyStats: { [date: string]: DailyStat } = {};

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!data.updatedAt) return;
          const docDate = (data.updatedAt as Timestamp).toDate();
          const dateKey = format(docDate, 'yyyy-MM-dd');

          if (!dailyStats[dateKey]) {
            dailyStats[dateKey] = {
              date: dateKey,
              activeUsers: new Set<string>(),
              participationCount: 0,
              chekiCount: 0,
              otherCount: 0,
            };
          }
          
          // lastActionの値に応じてカウントを振り分ける
          switch (data.lastAction) {
            case 'participation':
              dailyStats[dateKey].participationCount += 1;
              break;
            case 'cheki':
              dailyStats[dateKey].chekiCount += 1;
              break;
            default:
              // lastActionが記録される前の古いデータ
              dailyStats[dateKey].otherCount += 1;
              break;
          }
          
          dailyStats[dateKey].activeUsers.add(doc.id);
        });
        
        setStats(dailyStats);

      } catch (error) {
        console.error("利用状況データの取得に失敗しました:", error);
        alert("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentMonth]);

  const sortedDates = Object.keys(stats).sort().reverse();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">利用状況分析</h1>
        <Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">← ダッシュボードに戻る</Link>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="px-4 py-2 bg-gray-200 rounded">← 前月</button>
          <span className="text-lg font-bold w-32 text-center">{format(currentMonth, 'yyyy年 M月')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="px-4 py-2 bg-gray-200 rounded">→</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">参加登録</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">チェキ記録</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクティブユーザー数</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">読み込み中...</td></tr>
            ) : sortedDates.length > 0 ? (
              sortedDates.map(dateKey => (
                <tr key={dateKey}>
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(dateKey), 'M月d日 (E)', {locale: ja})}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stats[dateKey].participationCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stats[dateKey].chekiCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stats[dateKey].activeUsers.size}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">この月のデータはありません。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}