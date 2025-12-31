import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useGroup } from "@/contexts/GroupContext";

interface Group {
  id: string;
  name: string;
}

export default function GroupSelector() {
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const { selectedGroupId, setSelectedGroupId } = useGroup();

  useEffect(() => {
    const fetchGroups = async () => {
      const groupsSnap = await getDocs(query(collection(db, "groups"), orderBy("name")));
      const groups = groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[];
      setAllGroups(groups);
      // 初期状態でグループが選択されていなければ、最初のグループを自動選択
      if (!selectedGroupId && groups.length > 0) {
        setSelectedGroupId(groups[0].id);
      }
    };
    fetchGroups();
  }, []); // 初回のみ実行

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupId(e.target.value || null);
  };

  return (
    <div className="mb-4">
      <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">グループを選択</label>
      <select
        id="group-select"
        value={selectedGroupId || ""}
        onChange={handleGroupChange}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white"
      >
        <option value="">-- すべてのグループ --</option>
        {allGroups.map(group => (
          <option key={group.id} value={group.id}>{group.name}</option>
        ))}
      </select>
    </div>
  );
}