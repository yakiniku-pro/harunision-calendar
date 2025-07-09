import Link from "next/link";
import MonthlyCalendar from "@/components/MonthlyCalendar";

export default function CalendarPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">イベントカレンダー</h1>

      <Link href="/calendar-week">
        <span className="text-sm text-blue-600 underline hover:text-blue-800">週カレンダーを表示</span>
      </Link>

      <MonthlyCalendar />
    </main>
  );
}