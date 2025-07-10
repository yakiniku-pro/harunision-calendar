import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";
import { User } from "firebase/auth";
import { format, parse } from "date-fns";
import { ja } from "date-fns/locale";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

interface MonthlyStat {
  totalEvents: number;
  participatedEvents: number;
  chekis: { [memberName: string]: number };
}

export default function StatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<{ [month: string]: MonthlyStat }>({});
  const [allMembers, setAllMembers] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const eventsSnap = await getDocs(collection(db, "events"));
        
        const stats: { [month: string]: MonthlyStat } = {};
        const memberSet = new Set<string>();

        for (const eventDoc of eventsSnap.docs) {
          const eventData = eventDoc.data();
          const eventMonth = format(eventData.date.toDate(), 'yyyy-MM');

          if (!stats[eventMonth]) {
            stats[eventMonth] = { totalEvents: 0, participatedEvents: 0, chekis: {} };
          }
          stats[eventMonth].totalEvents++;

          const userRecordSnap = await getDoc(doc(db, "events", eventDoc.id, "userRecords", currentUser.uid));
          if (userRecordSnap.exists()) {
            const userData = userRecordSnap.data();
            if (userData.participated) {
              stats[eventMonth].participatedEvents++;
            }
            if (userData.chekiMemo) {
              Object.entries(userData.chekiMemo).forEach(([name, count]) => {
                if ((count as number) > 0) {
                  stats[eventMonth].chekis[name] = (stats[eventMonth].chekis[name] || 0) + (count as number);
                  memberSet.add(name);
                }
              });
            }
          }
        }
        setMonthlyStats(stats);
        setAllMembers(Array.from(memberSet).sort());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // グラフ用にデータを整形
  const sortedMonths = Object.keys(monthlyStats).sort();
  const chartData = {
    labels: sortedMonths.map(month => format(parse(month, 'yyyy-MM', new Date()), 'yy年M月', { locale: ja })),
    datasets: [
      {
        label: 'あなたの参加イベント数',
        data: sortedMonths.map(month => monthlyStats[month].participatedEvents),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: '総イベント数',
        data: sortedMonths.map(month => monthlyStats[month].totalEvents),
        borderColor: 'rgb(209, 213, 219)',
        backgroundColor: 'rgba(209, 213, 219, 0.5)',
      },
    ],
  };

  // ★ グラフのY軸オプションを動的に設定
  const maxTotalEvents = Math.max(...Object.values(monthlyStats).map(stat => stat.totalEvents), 0);
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        beginAtZero: true, // Y軸を0から始める
        // Y軸の最大値を、データに応じて設定
        max: maxTotalEvents < 10 ? 10 : undefined,
        ticks: {
          // Y軸の目盛りを整数に強制する
          precision: 0, 
        },
      },
    },
  };

  if (loading) return <div className="p-4 text-center">統計情報を計算中...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">📊 統計情報</h1>
        <Link href="/calendar-combined" className="text-sm text-blue-600 underline hover:text-blue-800">
          ← カレンダーに戻る
        </Link>
      </div>
      
      {user ? (
        <>
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">月別イベント参加数</h2>
            {/* ★ 作成したオプションをグラフに適用 */}
            <Line data={chartData} options={chartOptions}/>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">月別・メンバー別チェキ枚数</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月</th>
                    {allMembers.map(member => (
                      <th key={member} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{member}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedMonths.map(month => (
                    <tr key={month}>
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{format(parse(month, 'yyyy-MM', new Date()), 'yy年M月', { locale: ja })}</td>
                      {allMembers.map(member => (
                        <td key={member} className="px-4 py-4 whitespace-nowrap text-center text-gray-500">
                          {monthlyStats[month]?.chekis[member] || 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p>統計情報を表示するにはログインが必要です。</p>
      )}
    </div>
  );
}