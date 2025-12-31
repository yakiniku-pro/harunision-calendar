import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { collection, getDocs, where, query, orderBy, Timestamp, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADMIN_UIDS } from "@/lib/config";
import { User } from "firebase/auth";
import { format, startOfYear, endOfYear, getYear, addYears, subYears } from "date-fns";
import { ja } from "date-fns/locale";
import CsvImporter from "@/components/admin/CsvImporter";

// 型定義
interface Event { id: string; title: string; date: Timestamp; }
interface Group { id: string; name: string; }

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(false);

  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date());
  const [openMonths, setOpenMonths] = useState<{ [month: string]: boolean }>({});

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser && ADMIN_UIDS.includes(currentUser.uid)) {
        setUser(currentUser);
        const groupsSnap = await getDocs(query(collection(db, "groups"), orderBy("name")));
        setAllGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[]);
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchEvents = useCallback(async () => {
    if (!selectedGroupId) {
      setEvents([]);
      return;
    };
    setIsEventsLoading(true);
    const startDate = startOfYear(selectedYear);
    const endDate = endOfYear(selectedYear);
    
    const q = query(
      collection(db, "events"),
      where("groupId", "==", selectedGroupId),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "desc")
    );

    try {
      const snapshot = await getDocs(q);
      setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Event[]);
    } catch (error) {
      console.error("Firestore Error:", error);
    }
    setIsEventsLoading(false);
  }, [selectedGroupId, selectedYear]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  const groupedEvents = useMemo(() => {
    const groups: { [month: string]: Event[] } = {};
    events.forEach(event => {
      const month = format(event.date.toDate(), 'yyyy-MM');
      if (!groups[month]) groups[month] = [];
      groups[month].push(event);
    });
    if (Object.keys(groups).length > 0) {
      const latestMonth = Object.keys(groups).sort().reverse()[0];
      setOpenMonths({ [latestMonth]: true });
    } else {
      setOpenMonths({});
    }
    return groups;
  }, [events]);

  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`「${title}」を本当に削除しますか？`)) {
      await deleteDoc(doc(db, "events", id));
      setEvents(events.filter(e => e.id !== id));
      alert("イベントを削除しました。");
    }
  };

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;
  if (!user) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
      </div>
      
      <div className="flex gap-2 flex-wrap p-4 bg-gray-100 rounded-lg items-center">
          <Link href="/admin/groups" className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">グループ管理</Link>
          <Link href="/admin/persons" className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">人物管理</Link>
          <Link href="/admin/memberships" className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600">在籍・表示順管理</Link>
          <Link href="/admin/analytics" className="px-3 py-2 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600">利用状況分析</Link>
          
          <div className="border-l pl-2 ml-2 flex gap-2">
            <Link href="/admin/add-event" className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">＋ 新規イベント追加</Link>
            <CsvImporter groupId={selectedGroupId} onImported={fetchEvents} />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">グループ</label>
          <select onChange={(e) => setSelectedGroupId(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white">
            <option value="">-- グループを選択 --</option>
            {allGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">年</label>
          <div className="flex items-center gap-4 mt-1">
            <button onClick={() => setSelectedYear(subYears(selectedYear, 1))} className="px-4 py-2 bg-gray-200 rounded">← 前年</button>
            <span className="text-lg font-bold w-24 text-center">{getYear(selectedYear)}年</span>
            <button onClick={() => setSelectedYear(addYears(selectedYear, 1))} className="px-4 py-2 bg-gray-200 rounded">→</button>
          </div>
        </div>
      </div>
      
      {selectedGroupId && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isEventsLoading ? <p className="p-4 text-center">イベントを読み込み中...</p> : 
           Object.keys(groupedEvents).length === 0 ? <p className="p-4 text-center text-gray-500">この年のイベントはありません。</p> :
           Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div key={month} className="border-t first:border-t-0">
              <button onClick={() => setOpenMonths(p => ({ ...p, [month]: !p[month] }))} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100">
                <h2 className="text-lg font-semibold">{format(new Date(month), 'yyyy年 M月', { locale: ja })} ({monthEvents.length}件)</h2>
                <span className="text-xl">{openMonths[month] ? '▲' : '▼'}</span>
              </button>
              {openMonths[month] && (
                <ul className="divide-y divide-gray-200">
                  {monthEvents.map(event => (
                    <li key={event.id} className="p-4 flex justify-between items-center bg-white">
                      <div>
                        <p className="text-sm text-gray-500">{format(event.date.toDate(), "yyyy年MM月dd日 (E)", { locale: ja })}</p>
                        <p className="font-semibold text-lg">{event.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/edit/${event.id}`} className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">編集</Link>
                        <button onClick={() => handleDeleteEvent(event.id, event.title)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">削除</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
           ))
          }
        </div>
      )}
    </div>
  );
}