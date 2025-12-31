import { useState } from "react";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import WeeklyCalendar from "@/pages/calendar-week";
import Link from "next/link";
import GroupSelector from "@/components/GroupSelector";
import { useGroup } from "@/contexts/GroupContext";
import { useCalendar } from "@/contexts/CalendarContext";

export default function NewCalendarPage() {
  const { selectedGroupId } = useGroup();
  const { activeView, setActiveView } = useCalendar();

  const TabButton = ({ view, label }: { view: 'month' | 'week', label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
        activeView === view
          ? 'bg-white text-pink-500 shadow-md'
          : 'text-gray-500 hover:bg-white/60'
      }`}
    >
      {label}
    </button>
  );

  const SidebarCard = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
      <div className="p-4">
        {children}
      </div>
    </div>
  );

  return (
    <main className="p-4 md:p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            <SidebarCard>
              <GroupSelector />
            </SidebarCard>
            <SidebarCard>
              {/* ★ ボタンのレイアウトと文言を修正 */}
              <div className="grid grid-cols-2 gap-2">
                <Link href="/stats" className="group flex items-center justify-center text-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all">
                  <span className="mr-1">📊</span>
                  統計情報
                </Link>
                <Link href="/deadlines" className="group flex items-center justify-center text-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all">
                  <span className="mr-1">🎟️</span>
                  締切一覧
                </Link>
              </div>
            </SidebarCard>
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-end mb-4">
              <div className="flex p-1 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm">
                <TabButton view="month" label="月間" />
                <TabButton view="week" label="週間" />
              </div>
            </div>
            
            {activeView === 'month' && <MonthlyCalendar groupId={selectedGroupId} />}
            {activeView === 'week' && <WeeklyCalendar groupId={selectedGroupId} />}
          </div>
        </div>
      </div>
    </main>
  );
}
