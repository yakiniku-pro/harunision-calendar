import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { collection, getDocs, addDoc, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADMIN_UIDS } from "@/lib/config";
import { User } from "firebase/auth";

// 型定義
interface Person { id: string; primaryName: string; color?: string; }
interface Group { id: string; name: string; }
interface Membership { personId: string; groupId: string; }

export default function ManagePersonsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [allMemberships, setAllMemberships] = useState<Membership[]>([]);

  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonColor, setNewPersonColor] = useState("#ffffff");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  
  // ★ 1. 開閉状態を管理するState。'unregistered'は最初から開いておく
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    unregistered: true,
  });
  
  const router = useRouter();

  const fetchData = async () => {
    const personsSnap = await getDocs(query(collection(db, "persons"), orderBy("primaryName")));
    setAllPersons(personsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Person[]);
    
    const groupsSnap = await getDocs(query(collection(db, "groups"), orderBy("name")));
    setAllGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[]);

    const membershipsSnap = await getDocs(collection(db, "memberships"));
    setAllMemberships(membershipsSnap.docs.map(d => d.data()) as Membership[]);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && ADMIN_UIDS.includes(user.uid)) {
        setUser(user);
        fetchData();
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const groupedPersons = useMemo(() => {
    const registeredPersonIds = new Set(allMemberships.map(m => m.personId));
    const unregistered = allPersons.filter(p => !registeredPersonIds.has(p.id));
    const byGroup: { [groupId: string]: { groupName: string, members: Person[] } } = {};
    allMemberships.forEach(membership => {
      const group = allGroups.find(g => g.id === membership.groupId);
      const person = allPersons.find(p => p.id === membership.personId);
      if (group && person) {
        if (!byGroup[group.id]) {
          byGroup[group.id] = { groupName: group.name, members: [] };
        }
        if (!byGroup[group.id].members.some(m => m.id === person.id)) {
            byGroup[group.id].members.push(person);
        }
      }
    });
    return { unregistered, byGroup };
  }, [allPersons, allGroups, allMemberships]);

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return alert("名前を入力してください。");
    try {
      await addDoc(collection(db, "persons"), { 
        primaryName: newPersonName,
        color: newPersonColor 
      });
      setNewPersonName("");
      setNewPersonColor("#ffffff");
      fetchData();
      alert("人物を追加しました。");
    } catch (error) { console.error("人物追加エラー:", error); }
  };

  const handleUpdatePerson = async () => {
    if (!editingPerson || !editingPerson.primaryName.trim()) return;
    try {
      await updateDoc(doc(db, "persons", editingPerson.id), {
        primaryName: editingPerson.primaryName,
        color: editingPerson.color || "#ffffff"
      });
      setEditingPerson(null);
      fetchData();
      alert("名前を更新しました。");
    } catch (error) { console.error("更新エラー:", error); }
  };

  // ★ 2. トグル用の関数
  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const PersonEditor = ({ person }: { person: Person }) => (
    <li key={person.id} className="p-3 border-b last:border-b-0 bg-white">
      {editingPerson?.id === person.id ? (
        <div className="flex gap-2 items-center">
          <input type="color" value={editingPerson.color || "#ffffff"} onChange={(e) => setEditingPerson({ ...editingPerson, color: e.target.value })} className="p-1 h-10 w-10 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none" />
          <input type="text" value={editingPerson.primaryName} onChange={(e) => setEditingPerson({ ...editingPerson, primaryName: e.target.value })} className="flex-grow border p-2 rounded" />
          <button onClick={handleUpdatePerson} className="px-3 py-1 bg-green-500 text-white rounded">保存</button>
          <button onClick={() => setEditingPerson(null)} className="px-3 py-1 bg-gray-400 text-white rounded">キャンセル</button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span style={{ backgroundColor: person.color || '#ccc' }} className="w-4 h-4 rounded-full border"></span>
            <span className="font-medium">{person.primaryName}</span>
          </div>
          <button onClick={() => setEditingPerson(person)} className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">編集</button>
        </div>
      )}
    </li>
  );

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;
  if (!user) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">人物管理</h1>
        <Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">
          ← ダッシュボードに戻る
        </Link>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">新しい人物を追加</h2>
        <div className="flex gap-2 items-center">
          <input type="color" value={newPersonColor} onChange={(e) => setNewPersonColor(e.target.value)} className="p-1 h-10 w-10 block bg-white border border-gray-200 cursor-pointer rounded-lg" />
          <input type="text" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} placeholder="本名や活動の軸となる名前" className="flex-grow border p-2 rounded" />
          <button onClick={handleAddPerson} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">追加</button>
        </div>
      </div>

      {/* ★ 3. グループ化・トグル付きのリスト表示 */}
      <div className="rounded-lg shadow overflow-hidden">
        {/* 未所属の人物 */}
        <button onClick={() => toggleGroup('unregistered')} className="w-full flex justify-between items-center p-4 bg-yellow-100 border-b border-yellow-200 cursor-pointer hover:bg-yellow-200">
          <h2 className="text-lg font-semibold">未所属の人物</h2>
          <span className="text-xl">{openGroups['unregistered'] ? '▲' : '▼'}</span>
        </button>
        {openGroups['unregistered'] && (
          <ul className="divide-y divide-gray-200">
            {groupedPersons.unregistered.length > 0 ? (
              groupedPersons.unregistered.map(person => <PersonEditor key={person.id} person={person} />)
            ) : (
              <li className="p-4 text-sm text-gray-500 bg-white">未所属の人物はいません。</li>
            )}
          </ul>
        )}

        {/* グループ別の人物 */}
        {Object.entries(groupedPersons.byGroup).map(([groupId, groupData]) => (
          <div key={groupId} className="border-t">
            <button onClick={() => toggleGroup(groupId)} className="w-full flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100">
              <h2 className="text-lg font-semibold">{groupData.groupName}</h2>
              <span className="text-xl">{openGroups[groupId] ? '▲' : '▼'}</span>
            </button>
            {openGroups[groupId] && (
               <ul className="divide-y divide-gray-200">
                {groupData.members.map(person => <PersonEditor key={person.id} person={person} />)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}