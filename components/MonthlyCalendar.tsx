import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Event {
  id: string;
  title: string;
  date: Timestamp;
}

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
    <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800">{format(currentMonth, 'yyyy年 M月', { locale: ja })}</h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={day} className={`font-bold py-2 ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-sky-500' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="border-t border-r border-gray-100"></div>
        ))}
        {days.map((day) => {
          const dayEvents = events.filter(e => isSameDay(e.date.toDate(), day));
          const dayOfWeek = getDay(day);
          const isHoliday = holidays.has(format(day, 'yyyy-MM-dd'));
          const isTodayFlag = isToday(day);
          
          let dayClasses = 'border-t border-r border-gray-100 min-h-[120px] p-1.5 flex flex-col hover:bg-gray-50/50 transition-colors';
          let dayTextClasses = 'text-xs font-semibold w-6 h-6 flex items-center justify-center mx-auto';

          if (dayOfWeek === 0 || isHoliday) {
            dayClasses += ' bg-rose-50/70';
            dayTextClasses += ' text-rose-600';
          } else if (dayOfWeek === 6) {
            dayClasses += ' bg-sky-50/70';
            dayTextClasses += ' text-sky-600';
          } else {
            dayTextClasses += ' text-gray-600';
          }
          
          if (isTodayFlag) {
            dayClasses = 'border-t border-r border-gray-100 min-h-[120px] p-1.5 flex flex-col transition-colors bg-amber-100/90 ring-1 ring-amber-300';
            dayTextClasses = `text-xs font-bold w-6 h-6 flex items-center justify-center mx-auto text-amber-700`;
          }
          
          return (
            <div key={day.toString()} className={dayClasses}>
              <time dateTime={format(day, 'yyyy-MM-dd')} className={dayTextClasses}>
                {isTodayFlag ? <span className="bg-amber-400 text-white rounded-full w-6 h-6 flex items-center justify-center">{format(day, 'd')}</span> : format(day, 'd')}
              </time>
              <div className="flex-grow space-y-1 mt-1 overflow-y-auto">
                {dayEvents.map(event => (
                  <div key={event.id} onClick={() => router.push(`/event/${event.id}`)} className="bg-white/80 text-gray-800 text-xs rounded px-1.5 py-1 cursor-pointer hover:shadow-md hover:scale-105 transition-all truncate">
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
