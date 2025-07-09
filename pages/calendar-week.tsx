import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, addDays, startOfWeek, isToday } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";

interface EventData {
  id: string;
  title: string;
  date: Timestamp;
  eventPhotoUrl?: string;
}

export default function WeeklyCalendar() {
  // 日本の週の始まり（日曜日）に設定
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [events, setEvents] = useState<EventData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const endDate = addDays(startDate, 6);
      const q = query(
        collection(db, "events"),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "asc") // 日付順にソート
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as EventData[];
      setEvents(data);
    };
    fetchEvents();
  }, [startDate]);

  const handleWeekChange = (offset: number) => {
    setStartDate(prev => addDays(prev, offset * 7));
  };

  const eventsForDay = (date: Date) => {
    const ymd = format(date, "yyyy-MM-dd");
    return events.filter(e => format(e.date.toDate(), "yyyy-MM-dd") === ymd);
  };

  return (
    // <main>タグを<div>に変更
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => handleWeekChange(-1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">前週</button>
        <h2 className="text-xl font-bold text-center">
          {format(startDate, "yyyy年M月d日")}~{format(addDays(startDate, 6), "M月d日")}
        </h2>
        <button onClick={() => handleWeekChange(1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">次週</button>
      </div>

      {/* レスポンシブ対応：スマホでは縦(grid-cols-1)、PC(md以上)では7列(grid-cols-7) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = addDays(startDate, i);
          const dayEvents = eventsForDay(date);
          const isTodayFlag = isToday(date);

          return (
            <div key={i} className={`border rounded-lg p-3 space-y-2 ${isTodayFlag ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
              <h3 className={`font-semibold ${isTodayFlag ? 'text-blue-600' : 'text-gray-700'}`}>
                {format(date, "M/d (E)")}
              </h3>
              {dayEvents.length === 0 ? (
                <p className="text-xs text-gray-400">予定なし</p>
              ) : (
                dayEvents.map(ev => (
                  <div key={ev.id} onClick={() => router.push(`/event/${ev.id}`)} className="cursor-pointer group block">
                    {ev.eventPhotoUrl && (
                      <Image
                        src={ev.eventPhotoUrl}
                        alt={ev.title}
                        width={240}
                        height={135}
                        className="rounded mb-1 group-hover:opacity-80 transition-opacity w-full object-cover"
                      />
                    )}
                    <p className="text-sm font-medium text-blue-600 group-hover:underline">
                      {ev.title}
                    </p>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}