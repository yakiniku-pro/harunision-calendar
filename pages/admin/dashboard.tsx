import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { format } from "date-fns";
import { ADMIN_UIDS } from "@/lib/config"; // Import from the new config file

interface Event {
  id: string;
  title: string;
  date: any;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && ADMIN_UIDS.includes(user.uid)) {
        setUser(user);
        const fetchEvents = async () => {
          const q = query(collection(db, "events"), orderBy("date", "desc"));
          const snapshot = await getDocs(q);
          const eventsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Event[];
          setEvents(eventsData);
          setLoading(false);
        };
        fetchEvents();
      } else {
        router.push("/");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`「${title}」を本当に削除しますか？この操作は元に戻せません。`)) {
      try {
        await deleteDoc(doc(db, "events", id));
        setEvents(events.filter(event => event.id !== id));
        alert("イベントを削除しました。");
      } catch (error) {
        console.error("削除エラー: ", error);
        alert("イベントの削除に失敗しました。");
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center">読み込み中...</div>;
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
        <Link href="/admin/add-event" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          ＋ 新規イベント追加
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {events.length > 0 ? (
            events.map(event => (
              <li key={event.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {format(event.date.toDate(), "yyyy年MM月dd日")}
                  </p>
                  <p className="font-semibold text-lg">{event.title}</p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Link href={`/admin/edit/${event.id}`} className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">
                    編集
                  </Link>
                  <button 
                    onClick={() => handleDelete(event.id, event.title)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">登録されているイベントはありません。</li>
          )}
        </ul>
      </div>
    </div>
  );
}