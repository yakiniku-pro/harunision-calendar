import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, addDays, startOfWeek, isToday, endOfDay, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";
import { useRouter } from "next/router";

interface EventData {
  id: string;
  title: string;
  date: Timestamp;
  eventPhotoUrl?: string;
}

// 祝日リスト (YYYY-MM-DD形式)
const holidays = new Set([
  '2025-01-01', '2025-01-13', '2025-02-11', '2025-02-24', '2025-03-20',
  '2025-04-29', '2025-05-03', '2025-05-05', '2025-05-06', '2025-07-21',
  '2025-08-11', '2025-09-15', '2025-09-23', '2025-10-13', '2025-11-03', '2025-11-24',
]);

export default function WeeklyCalendar({ groupId }: { groupId: string | null }) {
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [events, setEvents] = useState<EventData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const endDate = endOfDay(addDays(startDate, 6)); 
      const eventsRef = collection(db, "events");

      const q = groupId
        ? query(eventsRef, where("groupId", "==", groupId), where("date", ">=", Timestamp.fromDate(startDate)), where("date", "<=", Timestamp.fromDate(endDate)), orderBy("date", "asc"))
        : query(eventsRef, where("date", ">=", Timestamp.fromDate(startDate)), where("date", "<=", Timestamp.fromDate(endDate)), orderBy("date", "asc"));
      
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as EventData[];
      setEvents(data);
    };
    fetchEvents();
  }, [startDate, groupId]);

  const handleWeekChange = (offset: number) => {
    setStartDate(prev => addDays(prev, offset * 7));
  };

  const eventsForDay = (date: Date) => {
    const ymd = format(date, "yyyy-MM-dd");
    return events.filter(e => format(e.date.toDate(), "yyyy-MM-dd") === ymd);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => handleWeekChange(-1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">前週</button>
        <h2 className="text-xl font-bold text-center">
          {format(startDate, "yyyy年M月d日")}~{format(addDays(startDate, 6), "M月d日")}
        </h2>
        <button onClick={() => handleWeekChange(1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">次週</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = addDays(startDate, i);
          const dayEvents = eventsForDay(date);
          const isTodayFlag = isToday(date);
          
          const dayOfWeek = getDay(date); // 0:日曜, 6:土曜
          const isHoliday = holidays.has(format(date, 'yyyy-MM-dd'));
          
          let dayClasses = 'border rounded-lg p-3 space-y-2';
          let dayTextClasses = 'font-semibold';

          if (isTodayFlag) dayClasses += ' bg-sky-50';
          if (dayOfWeek === 0 || isHoliday) {
            dayClasses += ' border-red-200';
            dayTextClasses += ' text-red-600';
          } else if (dayOfWeek === 6) {
            dayClasses += ' border-blue-200';
            dayTextClasses += ' text-blue-600';
          } else {
            dayClasses += ' bg-white';
            dayTextClasses += ' text-gray-700';
          }

          return (
            <div key={i} className={dayClasses}>
              <h3 className={dayTextClasses}>
                {format(date, "M/d (E)", { locale: ja })}
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
