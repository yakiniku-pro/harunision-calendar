import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import Link from "next/link";
import { ADMIN_UIDS } from "@/lib/config"; // Import from the new config file

export default function AddEventAdmin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [venue, setVenue] = useState("");
  const [priceGeneral, setPriceGeneral] = useState("");
  const [pricePriority, setPricePriority] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [memberImage, setMemberImage] = useState<File | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && ADMIN_UIDS.includes(user.uid)) {
        setUser(user);
      } else {
        router.push("/");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const compressAndUpload = async (file: File, path: string): Promise<string> => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
    });
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, compressed);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async () => {
    if (!title || !date) {
      alert("タイトルと日付は必須です");
      return;
    }
    setIsSubmitting(true);

    try {
      const newEvent: any = {
        title,
        date: new Date(date),
        openTime,
        startTime,
        venue,
        isNew,
        price: {
          general: Number(priceGeneral) || 0,
          priority: Number(pricePriority) || 0
        },
        participants: [],
        chekiMemo: {}
      };

      const docRef = await addDoc(collection(db, "events"), newEvent);

      const eventPhotoUrl = eventImage ? await compressAndUpload(eventImage, `events/${docRef.id}/event.jpg`) : null;
      const memberPhotoUrl = memberImage ? await compressAndUpload(memberImage, `events/${docRef.id}/member.jpg`) : null;
      
      await updateDoc(docRef, {
        ...(eventPhotoUrl && { eventPhotoUrl }),
        ...(memberPhotoUrl && { memberPhotoUrl })
      });

      alert("イベントを追加しました！");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("イベント追加エラー:", error);
      alert("イベントの追加に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="p-4 text-center">読み込み中...</div>;
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">
          ← ダッシュボードに戻る
      </Link>
      <h1 className="text-2xl font-bold">イベント追加</h1>
      
      <div className="space-y-4">
        <input placeholder="タイトル *" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 w-full rounded" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 w-full rounded" />
        <input placeholder="開場時間 (例: 18:00)" value={openTime} onChange={e => setOpenTime(e.target.value)} className="border p-2 w-full rounded" />
        <input placeholder="開演時間 (例: 18:30)" value={startTime} onChange={e => setStartTime(e.target.value)} className="border p-2 w-full rounded" />
        <input placeholder="会場" value={venue} onChange={e => setVenue(e.target.value)} className="border p-2 w-full rounded" />
        <input type="number" placeholder="一般料金" value={priceGeneral} onChange={e => setPriceGeneral(e.target.value)} className="border p-2 w-full rounded" />
        <input type="number" placeholder="優先料金" value={pricePriority} onChange={e => setPricePriority(e.target.value)} className="border p-2 w-full rounded" />

        <div>
          <label className="block text-sm font-medium text-gray-700">イベント写真</label>
          <input type="file" accept="image/*" onChange={e => setEventImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">メンバー写真</label>
          <input type="file" accept="image/*" onChange={e => setMemberImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="h-4 w-4 rounded"/>
            新着としてマークする
          </label>
        </div>

        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
          {isSubmitting ? '処理中...' : 'イベントを追加'}
        </button>
      </div>
    </div>
  );
}