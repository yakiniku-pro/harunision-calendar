import { createContext, useState, useContext, ReactNode, useMemo } from 'react';

// ★ activeView（月間/週間）の状態も管理するように拡張
interface CalendarContextType {
  displayDate: Date;
  setDisplayDate: (date: Date) => void;
  activeView: 'month' | 'week';
  setActiveView: (view: 'month' | 'week') => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'month' | 'week'>('month'); // デフォルトは月間表示

  const value = useMemo(() => ({
    displayDate,
    setDisplayDate,
    activeView,
    setActiveView,
  }), [displayDate, activeView]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
