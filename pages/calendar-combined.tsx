import Link from "next/link";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import WeeklyCalendar from "@/pages/calendar-week";

export default function CalendarCombined() {
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">📅 月間＋週次カレンダー</h1>

      <div className="text-right mb-4">
        <Link href="/stats" className="text-sm text-blue-600 underline hover:text-blue-800">
          📊 統計ページを見る
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">📆 月間カレンダー</h2>
        <MonthlyCalendar />
      </section>

      <section>
        <h2 className="text-lg font-semibold mt-8 mb-2">🗓️ 今週の予定</h2>
        <WeeklyCalendar />
      </section>
    </div>
  );
}