import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp, orderBy, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { format, addDays, startOfWeek, isToday, endOfDay, getDay } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useCalendar } from "@/contexts/CalendarContext"; // ★ 共有Contextをインポート

interface EventData {
  id: string;
  title: string;
  date: Timestamp;
  eventPhotoUrl?: string;
}

const holidays = new Set([
  '2025-01-01', '2025-01-13', '2025-02-11', '2025-02-24', '2025-03-20',
  '2025-04-29', '2025-05-03', '2025-05-05', '2025-05-06', '2025-07-21',
  '2025-08-11', '2025-09-15', '2025-09-23', '2025-10-13', '2025-11-03', '2025-11-24',
]);

export default function WeeklyCalendar({ groupId }: { groupId: string | null }) {
  // ★ ローカルのstartDateを廃止し、共有のdisplayDateを使用
  const { displayDate, setDisplayDate } = useCalendar();
  const startDate = startOfWeek(displayDate, { weekStartsOn: 0 });

  const [events, setEvents] = useState<EventData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [participationStatus, setParticipationStatus] = useState<{ [eventId: string]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEventsAndParticipation = async () => {
      const endDate = endOfDay(addDays(startDate, 6));
      const eventsRef = collection(db, "events");
      const q = groupId
        ? query(eventsRef, where("groupId", "==", groupId), where("date", ">=", Timestamp.fromDate(startDate)), where("date", "<=", Timestamp.fromDate(endDate)), orderBy("date", "asc"))
        : query(eventsRef, where("date", ">=", Timestamp.fromDate(startDate)), where("date", "<=", Timestamp.fromDate(endDate)), orderBy("date", "asc"));
      
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as EventData[];
      setEvents(data);

      if (user && data.length > 0) {
        const newStatus: { [eventId: string]: boolean } = {};
        const recordPromises = data.map(event => getDoc(doc(db, "events", event.id, "userRecords", user.uid)));
        const recordSnapshots = await Promise.all(recordPromises);
        recordSnapshots.forEach((snap, index) => {
          if (snap.exists() && snap.data().participated) {
            newStatus[data[index].id] = true;
          }
        });
        setParticipationStatus(newStatus);
      } else {
        setParticipationStatus({});
      }
    };
    fetchEventsAndParticipation();
  }, [startDate, groupId, user]);

  // ★ 週移動の際に、共有のdisplayDateを更新する
  const handleWeekChange = (offset: number) => {
    setDisplayDate(prev => addDays(prev, offset * 7));
  };

  const eventsForDay = (date: Date) => {
    const ymd = format(date, "yyyy-MM-dd");
    return events.filter(e => format(e.date.toDate(), "yyyy-MM-dd") === ymd);
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => handleWeekChange(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {format(startDate, "yyyy年M月d日")}~{format(addDays(startDate, 6), "M月d日")}
        </h2>
        <button onClick={() => handleWeekChange(1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = addDays(startDate, i);
          const dayEvents = eventsForDay(date);
          const isTodayFlag = isToday(date);
          const dayOfWeek = getDay(date);
          const isHoliday = holidays.has(format(date, 'yyyy-MM-dd'));
          
          let dayClasses = 'rounded-lg p-3 space-y-2 min-h-[140px] transition-colors';
          let dayTextClasses = 'font-semibold';

          if (dayOfWeek === 0 || isHoliday) {
            dayClasses += ' bg-rose-50/80'; dayTextClasses += ' text-rose-600';
          } else if (dayOfWeek === 6) {
            dayClasses += ' bg-sky-50/80'; dayTextClasses += ' text-sky-600';
          } else {
            dayClasses += ' bg-white/60'; dayTextClasses += ' text-gray-700';
          }
          if (isTodayFlag) {
            dayClasses = 'rounded-lg p-3 space-y-2 min-h-[140px] transition-colors bg-amber-100/90 ring-2 ring-amber-300';
            dayTextClasses = 'font-bold text-amber-700';
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
                  <div key={ev.id} onClick={() => router.push(`/event/${ev.id}`)} className="cursor-pointer group block bg-white/80 p-1.5 rounded-md hover:shadow-lg hover:scale-105 transition-all">
                    {ev.eventPhotoUrl && (
                      <Image src={ev.eventPhotoUrl} alt={ev.title} width={240} height={135} className="rounded mb-1 w-full object-cover"/>
                    )}
                    <div className="flex items-center gap-1.5">
                      {participationStatus[ev.id] && <span className="text-pink-500 text-lg leading-none">♥</span>}
                      <p className="text-xs font-semibold text-gray-800 truncate">{ev.title}</p>
                    </div>
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
