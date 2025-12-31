import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADMIN_UIDS } from "@/lib/config";
import { User } from "firebase/auth";

interface Group {
  id: string;
  name: string;
}

export default function ManageGroupsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const router = useRouter();

  // グループ一覧を取得
  const fetchGroups = async () => {
    const q = query(collection(db, "groups"), orderBy("name"));
    const snapshot = await getDocs(q);
    const groupsData = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    })) as Group[];
    setGroups(groupsData);
  };
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && ADMIN_UIDS.includes(user.uid)) {
        setUser(user);
        fetchGroups();
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);
  
  // 新しいグループを追加
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      alert("グループ名を入力してください。");
      return;
    }
    try {
      await addDoc(collection(db, "groups"), {
        name: newGroupName,
      });
      setNewGroupName("");
      fetchGroups(); // リストを再取得して更新
      alert("グループを追加しました。");
    } catch (error) {
      console.error("グループ追加エラー:", error);
      alert("グループの追加に失敗しました。");
    }
  };

  // グループを削除
  const handleDeleteGroup = async (id: string, name: string) => {
    if (window.confirm(`「${name}」を本当に削除しますか？関連するイベント等も表示されなくなる可能性があります。`)) {
      try {
        await deleteDoc(doc(db, "groups", id));
        fetchGroups(); // リストを再取得して更新
        alert("グループを削除しました。");
      } catch (error) {
        console.error("グループ削除エラー:", error);
        alert("グループの削除に失敗しました。");
      }
    }
  };

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;
  if (!user) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">グループ管理</h1>
        <Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">
          ← ダッシュボードに戻る
        </Link>
      </div>

      {/* グループ追加フォーム */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">新しいグループを追加</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="グループ名"
            className="flex-grow border p-2 rounded"
          />
          <button onClick={handleAddGroup} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            追加
          </button>
        </div>
      </div>

      {/* グループ一覧 */}
      <div className="bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold p-4 border-b">登録済みグループ一覧</h2>
        <ul className="divide-y divide-gray-200">
          {groups.map(group => (
            <li key={group.id} className="p-4 flex justify-between items-center">
              <span className="font-medium">{group.name}</span>
              <button
                onClick={() => handleDeleteGroup(group.id, group.name)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}