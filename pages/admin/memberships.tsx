import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { collection, getDocs, addDoc, updateDoc, doc, where, query, orderBy, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADMIN_UIDS } from "@/lib/config";
import { User } from "firebase/auth";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// 型定義
interface Group { id: string; name: string; memberOrder?: string[]; }
interface Person { id: string; primaryName: string; }
interface Membership { id: string; personId: string; groupId: string; nameDuringMembership: string; joinedAt: any; leftAt: any | null; }

// 日付を安全にフォーマットするヘルパー関数
const formatDateField = (dateValue: any): string => {
  if (!dateValue) return '';
  if (typeof dateValue.toDate === 'function') {
    return format(dateValue.toDate(), "yyyy年MM月dd日 (E)", { locale: ja });
  }
  try {
    return format(new Date(dateValue), "yyyy年MM月dd日 (E)", { locale: ja });
  } catch {
    return '無効な日付';
  }
};

export default function ManageMembershipsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [allMemberships, setAllMemberships] = useState<Membership[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [memberOrder, setMemberOrder] = useState<string[]>([]);
  const [newPersonId, setNewPersonId] = useState("");
  const [newJoinDate, setNewJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && ADMIN_UIDS.includes(user.uid)) {
        setUser(user);
        const groupsSnap = await getDocs(query(collection(db, "groups"), orderBy("name")));
        setAllGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[]);
        const personsSnap = await getDocs(query(collection(db, "persons"), orderBy("primaryName")));
        setAllPersons(personsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Person[]);
        const membershipsSnap = await getDocs(collection(db, "memberships"));
        setAllMemberships(membershipsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Membership[]);
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!selectedGroupId) {
      setMemberOrder([]);
      return;
    };
    const selectedGroup = allGroups.find(g => g.id === selectedGroupId);
    setMemberOrder(selectedGroup?.memberOrder || []);
  }, [selectedGroupId, allGroups]);
  
  const handleAddMembership = async () => {
    if (!selectedGroupId || !newPersonId || !newJoinDate) return alert("グループ、人物、加入日を選択してください。");
    const person = allPersons.find(p => p.id === newPersonId);
    if (!person) return;

    try {
      const newMembershipRef = await addDoc(collection(db, "memberships"), {
        groupId: selectedGroupId, personId: newPersonId, nameDuringMembership: person.primaryName,
        joinedAt: new Date(newJoinDate), leftAt: null,
      });
      setAllMemberships([...allMemberships, { id: newMembershipRef.id, groupId: selectedGroupId, personId: newPersonId, nameDuringMembership: person.primaryName, joinedAt: new Date(newJoinDate), leftAt: null }]);
      
      const newOrder = [...memberOrder, newPersonId];
      await updateDoc(doc(db, "groups", selectedGroupId), { memberOrder: newOrder });
      setMemberOrder(newOrder);
      alert(`${person.primaryName}さんをグループに追加しました。`);
      setNewPersonId("");
    } catch (error) { console.error("在籍情報追加エラー:", error); }
  };
  
  const handleRemoveMember = async (personIdToRemove: string) => {
    const personName = getPersonName(personIdToRemove);
    if (!selectedGroupId || !window.confirm(`${personName}さんをグループから除外しますか？（脱退として記録されます）`)) return;
    const activeMembership = allMemberships.find(m => m.personId === personIdToRemove && m.groupId === selectedGroupId && m.leftAt === null);
    if (!activeMembership) return alert("エラー：アクティブな在籍情報が見つかりませんでした。");
    try {
      const batch = writeBatch(db);
      const membershipRef = doc(db, "memberships", activeMembership.id);
      batch.update(membershipRef, { leftAt: new Date() });
      const groupRef = doc(db, "groups", selectedGroupId);
      const newOrder = memberOrder.filter(pid => pid !== personIdToRemove);
      batch.update(groupRef, { memberOrder: newOrder });
      await batch.commit();
      setMemberOrder(newOrder);
      setAllMemberships(allMemberships.map(m => m.id === activeMembership.id ? { ...m, leftAt: new Date() } : m));
      alert(`${personName}さんをグループから除外しました。`);
    } catch (error) { console.error("メンバー除外エラー:", error); }
  };

  const handleSaveOrder = async () => {
    if (!selectedGroupId) return;
    try {
      await updateDoc(doc(db, "groups", selectedGroupId), { memberOrder });
      alert("表示順を保存しました。");
    } catch (error) { console.error("順序保存エラー:", error); }
  };

  const moveMember = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...memberOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setMemberOrder(newOrder);
  };

  const getPersonName = (personId: string) => allPersons.find(p => p.id === personId)?.primaryName || '不明な人物';
  
  const activeMembersInOrder = memberOrder
    .map(pid => {
      const membership = allMemberships.find(m => m.personId === pid && m.groupId === selectedGroupId && m.leftAt === null);
      return membership ? { id: pid, name: getPersonName(pid), joinedAt: membership.joinedAt } : null;
    })
    .filter(member => member !== null);

  const availablePersons = allPersons.filter(p => !allMemberships.some(m => m.personId === p.id && m.groupId === selectedGroupId && m.leftAt === null));

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;
  if (!user) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">在籍情報・表示順管理</h1>
        <Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">
          ← ダッシュボードに戻る
        </Link>
      </div>
      <div>
        <label htmlFor="group-select" className="block text-sm font-medium text-gray-700">管理するグループを選択</label>
        <select id="group-select" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
          <option value="">-- グループを選択 --</option>
          {allGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
      </div>
      {selectedGroupId && (
        <>
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">在籍メンバーを追加</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <select value={newPersonId} onChange={(e) => setNewPersonId(e.target.value)} className="p-2 border rounded-md">
                <option value="">-- 人物を選択 --</option>
                {availablePersons.map(person => (
                  <option key={person.id} value={person.id}>{person.primaryName}</option>
                ))}
              </select>
              <input type="date" value={newJoinDate} onChange={(e) => setNewJoinDate(e.target.value)} className="p-2 border rounded-md"/>
              <button onClick={handleAddMembership} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                このメンバーをグループに追加
              </button>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">在籍メンバーと表示順</h2>
              <button onClick={handleSaveOrder} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">この表示順を保存</button>
            </div>
            <ul className="space-y-2">
              {activeMembersInOrder.map((member, index) => member && (
                <li key={member.id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    {member.joinedAt && (
                      <p className="text-sm text-gray-500">
                        加入日: {formatDateField(member.joinedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveMember(index, 'up')} disabled={index === 0} className="text-xl disabled:opacity-30">↑</button>
                    <button onClick={() => moveMember(index, 'down')} disabled={index === activeMembersInOrder.length - 1} className="text-xl disabled:opacity-30">↓</button>
                    <button onClick={() => handleRemoveMember(member.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">除外</button>
                  </div>
                </li>
              ))}
              {activeMembersInOrder.length === 0 && <p className="text-sm text-gray-500">このグループに在籍中のメンバーはいません。</p>}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}