import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, doc, getDoc, query, where, Timestamp, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";
import { User } from "firebase/auth";
import { format, parse, differenceInDays, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale";

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler );

// --- 型定義 ---
interface Person { id: string; primaryName: string; color?: string; }
interface Group { id: string; name: string; }
interface EventData { id: string; title: string; date: Timestamp; groupId: string; }
interface MonthlyStat { totalEvents: number; participatedEvents: number; chekis: { [personId: string]: number }; }
interface OshiHighlightStats {
  totalChekis: number;
  attendedEventsCount: number;
  firstDate: Date | null;
  lastDate: Date | null;
  monthlyChekis: { [month: string]: number };
}

// --- メインコンポーネント ---
export default function StatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'highlight'>('summary');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;

  return (
    <main className="p-4 md:p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-500">📊 統計情報</h1>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            カレンダーに戻る
          </Link>
        </div>
        
        {user ? (
          <>
            <div className="flex p-1 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm">
              <TabButton current={activeTab} view="summary" label="全体サマリー" onClick={setActiveTab} />
              <TabButton current={activeTab} view="highlight" label="推し活ハイライト" onClick={setActiveTab} />
            </div>
            {activeTab === 'summary' && <SummaryView user={user} />}
            {activeTab === 'highlight' && <HighlightView user={user} />}
          </>
        ) : (
          <p className="text-center text-gray-600 p-8 bg-white/70 rounded-xl">統計情報を表示するにはログインが必要です。</p>
        )}
      </div>
    </main>
  );
}

// --- タブボタンコンポーネント ---
const TabButton = ({ current, view, label, onClick }: any) => (
  <button onClick={() => onClick(view)} className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${current === view ? 'bg-white text-pink-500 shadow-md' : 'text-gray-500 hover:bg-white/60'}`}>
    {label}
  </button>
);

// --- 全体サマリー表示コンポーネント ---
function SummaryView({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<{ [month: string]: MonthlyStat }>({});
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
          const personsSnap = await getDocs(collection(db, "persons"));
          setAllPersons(personsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Person[]);
          const groupsSnap = await getDocs(collection(db, "groups"));
          setAllGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[]);
        } catch (error) {
          console.error("基本データの取得に失敗しました:", error);
        }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const calculateStats = async () => {
      setLoading(true);
      try {
        const eventsRef = collection(db, "events");
        const q = selectedGroupId === 'all' ? query(eventsRef) : query(eventsRef, where("groupId", "==", selectedGroupId));
        const eventsSnap = await getDocs(q);
        const stats: { [month: string]: MonthlyStat } = {};
        const userRecordPromises = eventsSnap.docs.map(eventDoc => getDoc(doc(db, "events", eventDoc.id, "userRecords", user.uid)));
        const userRecordSnapshots = await Promise.all(userRecordPromises);

        eventsSnap.docs.forEach((eventDoc, index) => {
          const eventData = eventDoc.data();
          const eventMonth = format(eventData.date.toDate(), 'yyyy-MM');
          if (!stats[eventMonth]) stats[eventMonth] = { totalEvents: 0, participatedEvents: 0, chekis: {} };
          stats[eventMonth].totalEvents++;
          const userRecordSnap = userRecordSnapshots[index];
          if (userRecordSnap.exists()) {
            const userData = userRecordSnap.data();
            if (userData.participated) stats[eventMonth].participatedEvents++;
            if (userData.chekiMemo) {
              Object.entries(userData.chekiMemo).forEach(([personId, count]) => {
                stats[eventMonth].chekis[personId] = (stats[eventMonth].chekis[personId] || 0) + (count as number);
              });
            }
          }
        });
        setMonthlyStats(stats);
      } catch (error) {
        console.error("統計データの計算に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    calculateStats();
  }, [user, selectedGroupId]);

  // ★ エラー修正：useMemoがundefinedを返した場合のフォールバックを追加
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
  }, [monthlyStats, allPersons]) || { totalChekiStats: [], activeMembers: [] }; // ★ ここにフォールバックを追加

  const sortedMonths = Object.keys(monthlyStats).sort();
  const chartData = {
    labels: sortedMonths.map(month => format(parse(month, 'yyyy-MM', new Date()), 'yy年M月', { locale: ja })),
    datasets: [
      { label: 'あなたの参加イベント数', data: sortedMonths.map(month => monthlyStats[month]?.participatedEvents || 0), borderColor: 'rgb(236, 72, 153)', backgroundColor: 'rgba(236, 72, 153, 0.5)' },
      { label: '総イベント数', data: sortedMonths.map(month => monthlyStats[month]?.totalEvents || 0), borderColor: 'rgb(209, 213, 219)', backgroundColor: 'rgba(209, 213, 219, 0.5)' },
    ],
  };
  const maxTotalEvents = Math.max(...Object.values(monthlyStats).map(stat => stat.totalEvents), 0);
  const chartOptions = {
    responsive: true, plugins: { legend: { position: 'top' as const } },
    scales: { y: { beginAtZero: true, max: maxTotalEvents < 10 ? 10 : undefined, ticks: { precision: 0 } } },
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
        <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700">表示するグループ</label>
        <select id="group-filter" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white">
          <option value="all">すべてのグループ</option>
          {allGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
      </div>
      {loading ? <div className="p-4 text-center">統計情報を計算中...</div> :
        <>
          <div className="p-4 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">メンバー別 累計チェキ枚数</h2>
            <ul className="space-y-3">{totalChekiStats.map(({ personId, name, color, count }) => (<li key={personId} className="flex items-center justify-between"><div className="flex items-center gap-3"><span style={{ backgroundColor: color }} className="w-5 h-5 rounded-full border"></span><span className="font-medium text-gray-700">{name}</span></div><span className="font-bold text-lg text-gray-800">{count}枚</span></li>))}{totalChekiStats.length === 0 && <p className="text-sm text-gray-500">チェキの記録はありません。</p>}</ul>
          </div>
          <div className="p-4 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">月別イベント参加数</h2>
            <Line data={chartData} options={chartOptions}/>
          </div>
          <div className="p-4 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">月別・メンバー別チェキ枚数</h2>
            <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50/50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月</th>{activeMembers.map(member => (<th key={member.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="flex items-center justify-center gap-2"><span style={{ backgroundColor: member.color || '#ccc' }} className="w-3 h-3 rounded-full border"></span>{member.primaryName}</div></th>))}</tr></thead><tbody className="bg-white/80 divide-y divide-gray-200">{sortedMonths.map(month => (<tr key={month}><td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{format(parse(month, 'yyyy-MM', new Date()), 'yy年M月', { locale: ja })}</td>{activeMembers.map(member => (<td key={member.id} className="px-4 py-4 whitespace-nowrap text-center text-gray-500">{monthlyStats[month]?.chekis[member.id] || 0}</td>))}</tr>))}</tbody></table></div>
          </div>
        </>
      }
    </div>
  );
}

// --- 推し活ハイライト表示コンポーネント ---
function HighlightView({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [oshiStats, setOshiStats] = useState<{ [personId: string]: OshiHighlightStats }>({});
  const [selectedOshiId, setSelectedOshiId] = useState<string>('');

  useEffect(() => {
    const calculateAllOshiStats = async () => {
      setLoading(true);
      try {
        const personsSnap = await getDocs(collection(db, "persons"));
        const persons = personsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Person[];
        setAllPersons(persons);

        const eventsSnap = await getDocs(query(collection(db, "events")));
        const events = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as EventData[];
        
        const userRecordPromises = events.map(event => getDoc(doc(db, "events", event.id, "userRecords", user.uid)));
        const userRecordSnapshots = await Promise.all(userRecordPromises);
        
        const stats: { [personId: string]: OshiHighlightStats } = {};

        userRecordSnapshots.forEach((snap, index) => {
          if (snap.exists() && snap.data().participated) {
            const event = events[index];
            const chekiMemo = snap.data().chekiMemo || {};
            Object.entries(chekiMemo).forEach(([personId, count]) => {
              if ((count as number) > 0) {
                if (!stats[personId]) {
                  stats[personId] = { totalChekis: 0, attendedEventsCount: 0, firstDate: null, lastDate: null, monthlyChekis: {} };
                }
                const eventDate = event.date.toDate();
                stats[personId].totalChekis += count as number;
                stats[personId].attendedEventsCount++;
                if (!stats[personId].firstDate || isBefore(eventDate, stats[personId].firstDate!)) {
                  stats[personId].firstDate = eventDate;
                }
                if (!stats[personId].lastDate || isAfter(eventDate, stats[personId].lastDate!)) {
                  stats[personId].lastDate = eventDate;
                }
                const monthKey = format(eventDate, 'yyyy-MM');
                stats[personId].monthlyChekis[monthKey] = (stats[personId].monthlyChekis[monthKey] || 0) + (count as number);
              }
            });
          }
        });
        setOshiStats(stats);
      } catch (error) { console.error("ハイライトデータの計算に失敗:", error); } 
      finally { setLoading(false); }
    };
    calculateAllOshiStats();
  }, [user]);

  const oshiList = Object.keys(oshiStats).map(id => allPersons.find(p => p.id === id)).filter(Boolean) as Person[];
  const selectedOshiData = selectedOshiId ? oshiStats[selectedOshiId] : null;
  const selectedOshiInfo = selectedOshiId ? allPersons.find(p => p.id === selectedOshiId) : null;

  const oshiChartData = useMemo(() => {
    if (!selectedOshiData) return null;
    const allMonths = Object.keys(selectedOshiData.monthlyChekis).sort();
    return {
      labels: allMonths.map(m => format(parse(m, 'yyyy-MM', new Date()), 'yy/M')),
      datasets: [{
        label: '月別チェキ枚数',
        data: allMonths.map(m => selectedOshiData.monthlyChekis[m]),
        borderColor: selectedOshiInfo?.color || '#f472b6',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, `${selectedOshiInfo?.color || '#f472b6'}60`);
          gradient.addColorStop(1, `${selectedOshiInfo?.color || '#f472b6'}00`);
          return gradient;
        },
        fill: true,
        tension: 0.3,
      }]
    };
  }, [selectedOshiData, selectedOshiInfo]);

  if (loading) return <div className="p-4 text-center">ハイライトを生成中...</div>;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
        <label htmlFor="oshi-select" className="block text-sm font-medium text-gray-700">推しメンバーを選択</label>
        <select id="oshi-select" value={selectedOshiId} onChange={(e) => setSelectedOshiId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white">
          <option value="">-- メンバーを選択 --</option>
          {oshiList.map(p => <option key={p.id} value={p.id}>{p.primaryName}</option>)}
        </select>
      </div>
      {selectedOshiData && selectedOshiInfo && oshiChartData && (
        <div className="p-6 bg-white/80 backdrop-blur-sm border-2 rounded-2xl shadow-lg" style={{ borderColor: selectedOshiInfo.color || '#ccc' }}>
          <div className="text-center mb-4">
            <p className="text-sm" style={{ color: selectedOshiInfo.color || '#6b7280' }}>あなたの推し活ハイライト</p>
            <h3 className="text-3xl font-bold" style={{ color: selectedOshiInfo.color || '#1f2937' }}>{selectedOshiInfo.primaryName}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><p className="text-xs text-gray-500">累計チェキ枚数</p><p className="text-2xl font-bold">{selectedOshiData.totalChekis}<span className="text-sm font-normal ml-1">枚</span></p></div>
            <div><p className="text-xs text-gray-500">参加イベント数</p><p className="text-2xl font-bold">{selectedOshiData.attendedEventsCount}<span className="text-sm font-normal ml-1">回</span></p></div>
            <div><p className="text-xs text-gray-500">初めて会った日</p><p className="text-md font-semibold">{selectedOshiData.firstDate ? format(selectedOshiData.firstDate, 'yyyy/MM/dd') : '-'}</p></div>
            <div><p className="text-xs text-gray-500">最近会った日</p><p className="text-md font-semibold">{selectedOshiData.lastDate ? `${differenceInDays(new Date(), selectedOshiData.lastDate)}日前` : '-'}</p></div>
          </div>
          <div className="mt-4 h-32"><Line data={oshiChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 8 } } }, y: { ticks: { precision: 0 } } } }}/></div>
        </div>
      )}
    </div>
  );
}
