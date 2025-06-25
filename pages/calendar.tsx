// pages/calendar.tsx
import MonthlyCalendar from "@/components/MonthlyCalendar";

export default function CalendarPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">イベントカレンダー</h1>
      <MonthlyCalendar />
    </main>
  );
}