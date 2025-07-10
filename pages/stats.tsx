import { useEffect, useState, useMemo, useCallback } from "react";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
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

// 型定義
interface Person { id: string; primaryName: string; color?: string; }
interface Group { id: string; name: string; }
interface MonthlyStat {
  totalEvents: number;
  participatedEvents: number;
  chekis: { [personId: string]: number };
}

export default function StatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // データを管理するState
  const [monthlyStats, setMonthlyStats] = useState<{ [month: string]: MonthlyStat }>({});
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all'); // 'all'をデフォルトに

  // データの取得と集計を行うメインのuseEffect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          // 人物情報とグループ情報は最初に一度だけ取得
          const personsSnap = await getDocs(collection(db, "persons"));
          setAllPersons(personsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Person[]);
          
          const groupsSnap = await getDocs(collection(db, "groups"));
          setAllGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[]);

        } catch (error) {
          console.error("基本データの取得に失敗しました:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // グループ選択に応じて統計を再計算
  useEffect(() => {
    if (!user) return;

    const calculateStats = async () => {
      setLoading(true);
      try {
        const eventsRef = collection(db, "events");
        const q = selectedGroupId === 'all'
          ? query(eventsRef)
          : query(eventsRef, where("groupId", "==", selectedGroupId));
        
        const eventsSnap = await getDocs(q);
        const stats: { [month: string]: MonthlyStat } = {};

        for (const eventDoc of eventsSnap.docs) {
          const eventData = eventDoc.data();
          const eventMonth = format(eventData.date.toDate(), 'yyyy-MM');

          if (!stats[eventMonth]) {
            stats[eventMonth] = { totalEvents: 0, participatedEvents: 0, chekis: {} };
          }
          stats[eventMonth].totalEvents++;

          const userRecordSnap = await getDoc(doc(db, "events", eventDoc.id, "userRecords", user.uid));
          if (userRecordSnap.exists()) {
            const userData = userRecordSnap.data();
            if (userData.participated) stats[eventMonth].participatedEvents++;
            if (userData.chekiMemo) {
              Object.entries(userData.chekiMemo).forEach(([personId, count]) => {
                stats[eventMonth].chekis[personId] = (stats[eventMonth].chekis[personId] || 0) + (count as number);
              });
            }
          }
        }
        setMonthlyStats(stats);
      } catch (error) {
        console.error("統計データの計算に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    calculateStats();
  }, [user, selectedGroupId]);

  const { totalChekiStats, activeMembers } = useMemo(() => {
    const totalChekis: { [personId: string]: number } = {};
    const memberSet = new Set<string>();
    Object.values(monthlyStats).forEach(monthData => {
      Object.entries(monthData.chekis).forEach(([personId, count]) => {
        totalChekis[personId] = (totalChekis[personId] || 0) + count;
        memberSet.add(personId);
      });
    });
    const activeMembers = allPersons.filter(p => memberSet.has(p.id));
    const sortedTotalChekis = Object.entries(totalChekis)
      .map(([personId, count]) => {
        const person = allPersons.find(p => p.id === personId);
        return { personId, name: person?.primaryName || '不明', color: person?.color || '#ccc', count };
      }).sort((a, b) => b.count - a.count);
    return { totalChekiStats: sortedTotalChekis, activeMembers };
  }, [monthlyStats, allPersons]);

  const sortedMonths = Object.keys(monthlyStats).sort();
  const chartData = {
    labels: sortedMonths.map(month => format(parse(month, 'yyyy-MM', new Date()), 'yy年M月', { locale: ja })),
    datasets: [
      { label: 'あなたの参加イベント数', data: sortedMonths.map(month => monthlyStats[month].participatedEvents), borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
      { label: '総イベント数', data: sortedMonths.map(month => monthlyStats[month].totalEvents), borderColor: 'rgb(209, 213, 219)', backgroundColor: 'rgba(209, 213, 219, 0.5)' },
    ],
  };
  const maxTotalEvents = Math.max(...Object.values(monthlyStats).map(stat => stat.totalEvents), 0);
  const chartOptions = {
    responsive: true, plugins: { legend: { position: 'top' as const } },
    scales: { y: { beginAtZero: true, max: maxTotalEvents < 10 ? 10 : undefined, ticks: { precision: 0 } } },
  };

  if (loading && !user) return <div className="p-4 text-center">読み込み中...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">📊 統計情報</h1>
        <Link href="/calendar-combined" className="text-sm text-blue-600 underline hover:text-blue-800">← カレンダーに戻る</Link>
      </div>
      
      {user ? (
        <>
          {/* ★ グループ選択プルダウンを追加 */}
          <div className="p-4 bg-white rounded-lg shadow">
            <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700">表示するグループ</label>
            <select
              id="group-filter"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white"
            >
              <option value="all">すべてのグループ</option>
              {allGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          {loading ? <div className="p-4 text-center">統計情報を計算中...</div> :
            <>
              <div className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">メンバー別 累計チェキ枚数</h2>
                <ul className="space-y-3">
                  {totalChekiStats.map(({ personId, name, color, count }) => (
                    <li key={personId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><span style={{ backgroundColor: color }} className="w-5 h-5 rounded-full border"></span><span className="font-medium">{name}</span></div>
                      <span className="font-bold text-lg">{count}枚</span>
                    </li>
                  ))}
                  {totalChekiStats.length === 0 && <p className="text-sm text-gray-500">チェキの記録はありません。</p>}
                </ul>
              </div>

              <div className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">月別イベント参加数</h2>
                <Line data={chartData} options={chartOptions}/>
              </div>

              <div className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">月別・メンバー別チェキ枚数</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月</th>
                        {activeMembers.map(member => (
                          <th key={member.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-2"><span style={{ backgroundColor: member.color || '#ccc' }} className="w-3 h-3 rounded-full border"></span>{member.primaryName}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedMonths.map(month => (
                        <tr key={month}>
                          <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{format(parse(month, 'yyyy-MM', new Date()), 'yy年M月', { locale: ja })}</td>
                          {activeMembers.map(member => (
                            <td key={member.id} className="px-4 py-4 whitespace-nowrap text-center text-gray-500">{monthlyStats[month]?.chekis[member.id] || 0}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          }
        </>
      ) : (
        <p>統計情報を表示するにはログインが必要です。</p>
      )}
    </div>
  );
}
