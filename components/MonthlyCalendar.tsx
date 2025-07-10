import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Event {
  id: string;
  title: string;
  date: Timestamp;
}

// 祝日リスト (YYYY-MM-DD形式) - weeklyと共通
const holidays = new Set([
  '2025-01-01', '2025-01-13', '2025-02-11', '2025-02-24', '2025-03-20',
  '2025-04-29', '2025-05-03', '2025-05-05', '2025-05-06', '2025-07-21',
  '2025-08-11', '2025-09-15', '2025-09-23', '2025-10-13', '2025-11-03', '2025-11-24',
]);

export default function MonthlyCalendar({ groupId }: { groupId: string | null }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchEventsForMonth = async () => {
      const firstDay = startOfMonth(currentMonth);
      const lastDay = endOfMonth(currentMonth);
      
      const eventsRef = collection(db, "events");
      const q = groupId 
        ? query(eventsRef, where("groupId", "==", groupId), where("date", ">=", firstDay), where("date", "<=", lastDay), orderBy("date"))
        : query(eventsRef, where("date", ">=", firstDay), where("date", "<=", lastDay), orderBy("date"));
        
      const snapshot = await getDocs(q);
      const fetchedEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(fetchedEvents);
    };

    fetchEventsForMonth();
  }, [currentMonth, groupId]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startingDayIndex = getDay(startOfMonth(currentMonth));

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-4 py-2 bg-gray-200 rounded">&lt;</button>
        <h2 className="text-xl font-bold">{format(currentMonth, 'yyyy年 MMMM', { locale: ja })}</h2>
        <button onClick={nextMonth} className="px-4 py-2 bg-gray-200 rounded">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={day} className={`font-bold py-2 ${i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-600'}`}>
            {day}
          </div>
        ))}
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="border rounded-md bg-gray-50"></div>
        ))}
        {days.map(day => {
          const dayEvents = events.filter(e => isSameDay(e.date.toDate(), day));
          const dayOfWeek = getDay(day);
          const isHoliday = holidays.has(format(day, 'yyyy-MM-dd'));
          
          let dayClasses = 'border rounded-md min-h-[120px] p-1 flex flex-col';
          if (dayOfWeek === 0 || isHoliday) dayClasses += ' bg-red-50';
          else if (dayOfWeek === 6) dayClasses += ' bg-blue-50';
          
          return (
            <div key={day.toString()} className={dayClasses}>
              <time dateTime={format(day, 'yyyy-MM-dd')} className={`text-xs ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''} ${dayOfWeek === 0 || isHoliday ? 'text-red-600' : dayOfWeek === 6 ? 'text-blue-600' : ''}`}>
                {format(day, 'd')}
              </time>
              <div className="flex-grow space-y-1 mt-1 overflow-y-auto">
                {dayEvents.map(event => (
                  <div key={event.id} onClick={() => router.push(`/event/${event.id}`)} className="bg-blue-100 text-blue-800 text-xs rounded px-1 py-0.5 cursor-pointer hover:bg-blue-200">
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
