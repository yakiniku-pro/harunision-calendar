import { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface CalendarContextType {
  displayDate: Date;
  // ★ setDisplayDateの型を修正
  setDisplayDate: React.Dispatch<React.SetStateAction<Date>>;
  activeView: 'month' | 'week';
  setActiveView: (view: 'month' | 'week') => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'month' | 'week'>('month');

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
