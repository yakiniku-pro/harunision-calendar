// components/MonthlyCalendar.tsx（イベントあり＝ピンク、参加済み＝青に区別表示）
import { useEffect, useState } from "react";
import { format } from "date-fns";
import ja from "date-fns/locale/ja";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { useRouter } from "next/router";

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

interface EventData extends DocumentData {
  id: string;
  title: string;
  date: Timestamp;
  participants?: string[];
}

export default function MonthlyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUid(auth.currentUser?.uid || null);
  }, []);

  const fetchEvents = async () => {
    const first = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const last = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const q = query(
      collection(db, "events"),
      where("date", ">=", Timestamp.fromDate(first)),
      where("date", "<=", Timestamp.fromDate(last))
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EventData[];
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const getCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      dates.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    return dates;
  };

  const getEventForDate = (date: Date): EventData | undefined => {
    const ymd = format(date, "yyyy-MM-dd");
    return events.find(
      (ev) => format(ev.date.toDate(), "yyyy-MM-dd") === ymd
    );
  };

  const isJoined = (ev: EventData): boolean => {
    return uid && ev.participants?.includes(uid);
  };

  const handleClick = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleMonthChange = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => handleMonthChange(-1)}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          ◀ 前月
        </button>
        <h2 className="text-2xl font-bold">
          {format(currentMonth, "yyyy年 M月", { locale: ja })}
        </h2>
        <button
          onClick={() => handleMonthChange(1)}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          次月 ▶
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center text-sm text-gray-600 font-semibold">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {getCalendarDates().map((date, index) => {
          const event = date ? getEventForDate(date) : undefined;
          const joined = event && isJoined(event);
          return (
            <div
              key={index}
              onClick={() => event && handleClick(event.id)}
              className={`h-20 rounded-lg border text-sm flex items-start justify-start p-2 relative shadow-sm transition hover:shadow-md ${
                date ? "bg-white cursor-pointer" : "bg-gray-50 cursor-default"
              }`}
            >
              {date && (
                <>
                  <span>{date.getDate()}</span>
                  {event && (
                    <span
                      className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                        joined ? "bg-blue-500" : "bg-pink-500"
                      }`}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}