import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Link from "next/link";
import { ADMIN_UIDS } from "@/lib/config";
import { format } from "date-fns";
import Image from "next/image";
import imageCompression from "browser-image-compression";

export default function EditEventPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  // フォームの各フィールドに対応するState
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [venue, setVenue] = useState("");
  const [priceGeneral, setPriceGeneral] = useState("");
  const [pricePriority, setPricePriority] = useState("");
  const [isNew, setIsNew] = useState(true);

  // ★ 画像用のStateを追加
  const [currentEventPhotoUrl, setCurrentEventPhotoUrl] = useState("");
  const [currentMemberPhotoUrl, setCurrentMemberPhotoUrl] = useState("");
  const [newEventImage, setNewEventImage] = useState<File | null>(null);
  const [newMemberImage, setNewMemberImage] = useState<File | null>(null);

  useEffect(() => {
    if (typeof id !== 'string' || !id) return;

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user || !ADMIN_UIDS.includes(user.uid)) {
        router.push("/");
        return;
      }
    });

    const fetchEventData = async () => {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const event = docSnap.data();
          setTitle(event.title || "");
          if (event.date) setDate(format(event.date.toDate(), 'yyyy-MM-dd'));
          setOpenTime(event.openTime || "");
          setStartTime(event.startTime || "");
          setVenue(event.venue || "");
          setPriceGeneral(event.price?.general?.toString() || "");
          setPricePriority(event.price?.priority?.toString() || "");
          setIsNew(event.isNew || false);
          // ★ 既存の画像URLをStateに保存
          setCurrentEventPhotoUrl(event.eventPhotoUrl || "");
          setCurrentMemberPhotoUrl(event.memberPhotoUrl || "");
        } else {
          alert("イベントが見つかりませんでした！");
          router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error("イベントの取得に失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
    return () => unsubscribe();
  }, [id, router]);

  // ★ 画像圧縮とアップロード用の関数 (add-event.tsxからコピー)
  const compressAndUpload = async (file: File, path: string): Promise<string> => {
    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, compressed);
    return await getDownloadURL(fileRef);
  };

  // ★ 画像削除用の関数
  const handleDeleteImage = async (imageType: 'event' | 'member') => {
    if (typeof id !== 'string' || !window.confirm(`${imageType === 'event' ? 'イベント写真' : 'メンバー写真'}を本当に削除しますか？`)) return;

    const filePath = `events/${id}/${imageType}.jpg`;
    const imageRef = ref(storage, filePath);
    const fieldToDelete = imageType === 'event' ? 'eventPhotoUrl' : 'memberPhotoUrl';

    try {
      // Storageからファイルを削除
      await deleteObject(imageRef);
      // Firestoreのフィールドを削除
      await updateDoc(doc(db, "events", id), { [fieldToDelete]: deleteField() });
      // 画面の状態を更新
      if (imageType === 'event') setCurrentEventPhotoUrl("");
      if (imageType === 'member') setCurrentMemberPhotoUrl("");
      alert("画像を削除しました。");
    } catch (error: any) {
        if(error.code === 'storage/object-not-found') {
             await updateDoc(doc(db, "events", id), { [fieldToDelete]: deleteField() });
             if (imageType === 'event') setCurrentEventPhotoUrl("");
             if (imageType === 'member') setCurrentMemberPhotoUrl("");
             alert("データベースのURLを削除しました（ファイルは存在しませんでした）。");
        } else {
            console.error("画像削除エラー:", error);
            alert("画像の削除に失敗しました。");
        }
    }
  };

  const handleUpdate = async () => {
    if (typeof id !== 'string' || !title || !date) {
      alert("タイトルと日付は必須です。");
      return;
    }
    setIsSubmitting(true);

    try {
      const eventRef = doc(db, "events", id);
      
      const updatedData: { [key: string]: any } = {
        title, date: new Date(date), openTime, startTime, venue, isNew,
        price: { general: Number(priceGeneral) || 0, priority: Number(pricePriority) || 0 }
      };

      // ★ 画像の更新処理を追加
      if (newEventImage) {
        const url = await compressAndUpload(newEventImage, `events/${id}/event.jpg`);
        updatedData.eventPhotoUrl = url;
      }
      if (newMemberImage) {
        const url = await compressAndUpload(newMemberImage, `events/${id}/member.jpg`);
        updatedData.memberPhotoUrl = url;
      }

      await updateDoc(eventRef, updatedData);

      alert("イベント情報を更新しました。");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("更新エラー:", error);
      alert("イベントの更新に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center">イベントデータを読み込み中...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">
        ← ダッシュボードに戻る
      </Link>
      <h1 className="text-2xl font-bold">イベントを編集</h1>
      
      <div className="space-y-4">
        {/* ... (タイトルのinputなど、既存のフォーム要素はそのまま) ... */}
        <input placeholder="タイトル *" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 w-full rounded" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 w-full rounded" />
        <input placeholder="開場時間 (例: 18:00)" value={openTime} onChange={e => setOpenTime(e.target.value)} className="border p-2 w-full rounded" />
        <input placeholder="開演時間 (例: 18:30)" value={startTime} onChange={e => setStartTime(e.target.value)} className="border p-2 w-full rounded" />
        <input placeholder="会場" value={venue} onChange={e => setVenue(e.target.value)} className="border p-2 w-full rounded" />
        <input type="number" placeholder="一般料金" value={priceGeneral} onChange={e => setPriceGeneral(e.target.value)} className="border p-2 w-full rounded" />
        <input type="number" placeholder="優先料金" value={pricePriority} onChange={e => setPricePriority(e.target.value)} className="border p-2 w-full rounded" />
      </div>

      <hr className="my-6" />

      {/* ★ 画像編集セクション */}
      <div className="space-y-6">
        {/* イベント写真 */}
        <div>
          <h2 className="text-lg font-semibold">イベント写真</h2>
          {currentEventPhotoUrl ? (
            <div className="my-2">
              <Image src={currentEventPhotoUrl} alt="現在のイベント写真" width={320} height={180} className="rounded" />
              <button onClick={() => handleDeleteImage('event')} className="mt-2 text-sm text-red-600 hover:underline">この写真を削除</button>
            </div>
          ) : <p className="text-sm text-gray-500 my-2">イベント写真はありません。</p>}
          <label className="block text-sm font-medium text-gray-700">新しいイベント写真をアップロード（差し替え）</label>
          <input type="file" accept="image/*" onChange={e => setNewEventImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
        </div>

        {/* メンバー写真 */}
        <div>
          <h2 className="text-lg font-semibold">メンバー写真</h2>
          {currentMemberPhotoUrl ? (
            <div className="my-2">
              <Image src={currentMemberPhotoUrl} alt="現在のメンバー写真" width={320} height={180} className="rounded" />
              <button onClick={() => handleDeleteImage('member')} className="mt-2 text-sm text-red-600 hover:underline">この写真を削除</button>
            </div>
          ) : <p className="text-sm text-gray-500 my-2">メンバー写真はありません。</p>}
          <label className="block text-sm font-medium text-gray-700">新しいメンバー写真をアップロード（差し替え）</label>
          <input type="file" accept="image/*" onChange={e => setNewMemberImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
        </div>
      </div>
      
      <hr className="my-6" />

      <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="h-4 w-4 rounded"/>
            新着としてマークする
          </label>
      </div>

      <button onClick={handleUpdate} disabled={isSubmitting} className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300">
        {isSubmitting ? '保存中...' : '変更を保存'}
      </button>
    </div>
  );
}