import { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface GroupContextType {
  selectedGroupId: string | null;
  setSelectedGroupId: (groupId: string | null) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const value = useMemo(() => ({
    selectedGroupId,
    setSelectedGroupId,
  }), [selectedGroupId]);

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};