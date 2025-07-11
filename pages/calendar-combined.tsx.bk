import MonthlyCalendar from "@/components/MonthlyCalendar";
import WeeklyCalendar from "@/pages/calendar-week";
import Link from "next/link";
import GroupSelector from "@/components/GroupSelector"; // ★インポート
import { useGroup } from "@/contexts/GroupContext";   // ★インポート

export default function CalendarCombined() {
  const { selectedGroupId } = useGroup(); // ★選択中のグループIDを取得

  return (
    <main className="p-4 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">📅 イベントカレンダー</h1>

      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <GroupSelector />
        </div>
        <div className="text-right">
          <Link href="/stats" className="text-sm text-blue-600 underline hover:text-blue-800">
            📊 統計ページを見る
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">📆 月間カレンダー</h2>
        <MonthlyCalendar groupId={selectedGroupId} /> {/* ★ groupIdを渡す */}
      </section>

      <section>
        <h2 className="text-lg font-semibold mt-8 mb-2">🗓️ 今週の予定</h2>
        <WeeklyCalendar groupId={selectedGroupId} /> {/* ★ groupIdを渡す */}
      </section>
    </main>
  );
}