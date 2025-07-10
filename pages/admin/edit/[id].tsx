import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, getDocs, orderBy, serverTimestamp, deleteField } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Link from "next/link";
import { ADMIN_UIDS } from "@/lib/config";
import { User } from "firebase/auth";
import { format } from 'date-fns';
import Image from "next/image";
import imageCompression from "browser-image-compression";

// 型定義
interface Group { id: string; name: string; }
interface PriceTier { tierName: string; amount: string; drinks: '別' | '込み' | 'なし'; }
interface TimeSlot { startAt: string; endAt: string; }
interface SalePeriod { startAt: string; endAt: string; url: string; }

// フォームの各セクションをコンポーネント化
const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="p-4 bg-white rounded-lg shadow space-y-4">
    <h2 className="text-lg font-semibold border-b pb-2 mb-4">{title}</h2>
    {children}
  </div>
);

export default function EditEventPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  // --- State定義 ---
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [prices, setPrices] = useState<PriceTier[]>([{ tierName: '', amount: '', drinks: '別' }]);
  const [womenOnlyArea, setWomenOnlyArea] = useState<'なし' | 'あり' | '不明'>('不明');
  const [photoPolicy, setPhotoPolicy] = useState({ still: '不明', video: '不明' });
  const [ticketSales, setTicketSales] = useState({
    preSaleFastest: { startAt: '', endAt: '', url: '' },
    preSaleGeneral: { startAt: '', endAt: '', url: '' },
    generalSale:    { startAt: '', endAt: '', url: '' },
  });
  const [ticketUrl, setTicketUrl] = useState("");
  const [performanceTimes, setPerformanceTimes] = useState<TimeSlot[]>([{ startAt: '', endAt: '' }]);
  const [bonusEventTimes, setBonusEventTimes] = useState<TimeSlot[]>([{ startAt: '', endAt: '' }]);
  const [attendanceBonus, setAttendanceBonus] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [memberImage, setMemberImage] = useState<File | null>(null);
  const [currentEventPhotoUrl, setCurrentEventPhotoUrl] = useState("");
  const [currentMemberPhotoUrl, setCurrentMemberPhotoUrl] = useState("");

  useEffect(() => {
    if (typeof id !== 'string' || !id) return;
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser && ADMIN_UIDS.includes(currentUser.uid)) {
        setUser(currentUser);
        try {
          const groupsSnap = await getDocs(query(collection(db, "groups"), orderBy("name")));
          setGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[]);
          
          const docRef = doc(db, "events", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const event = docSnap.data();
            setGroupId(event.groupId || "");
            setTitle(event.title || "");
            if (event.date) setDate(format(event.date.toDate(), 'yyyy-MM-dd'));
            setVenue(event.venue || "");
            setOpenTime(event.openTime || "");
            setStartTime(event.startTime || "");
            const fetchedPrices = event.prices?.map((p: any) => ({ ...p, amount: p.amount.toString() })) || [];
            setPrices(fetchedPrices.length > 0 ? fetchedPrices : [{ tierName: '', amount: '', drinks: '別' }]);
            setWomenOnlyArea(event.womenOnlyArea || '不明');
            setPhotoPolicy(event.photoPolicy || { still: '不明', video: '不明' });
            const toDateString = (timestamp: any) => timestamp ? format(timestamp.toDate(), 'yyyy-MM-dd') : '';
            setTicketSales({
                preSaleFastest: { ...event.ticketSales?.preSaleFastest, startAt: toDateString(event.ticketSales?.preSaleFastest?.startAt), endAt: toDateString(event.ticketSales?.preSaleFastest?.endAt) },
                preSaleGeneral: { ...event.ticketSales?.preSaleGeneral, startAt: toDateString(event.ticketSales?.preSaleGeneral?.startAt), endAt: toDateString(event.ticketSales?.preSaleGeneral?.endAt) },
                generalSale:    { ...event.ticketSales?.generalSale,    startAt: toDateString(event.ticketSales?.generalSale?.startAt),    endAt: toDateString(event.ticketSales?.generalSale?.endAt) },
            });
            setTicketUrl(event.ticketUrl || "");
            const fetchedPerfTimes = event.performanceTimes || [];
            setPerformanceTimes(fetchedPerfTimes.length > 0 ? fetchedPerfTimes : [{ startAt: '', endAt: '' }]);
            const fetchedBonusTimes = event.bonusEventTimes || [];
            setBonusEventTimes(fetchedBonusTimes.length > 0 ? fetchedBonusTimes : [{ startAt: '', endAt: '' }]);
            setAttendanceBonus(event.attendanceBonus || "");
            setCurrentEventPhotoUrl(event.eventPhotoUrl || "");
            setCurrentMemberPhotoUrl(event.memberPhotoUrl || "");
          } else {
            alert("イベントが見つかりません"); router.push("/admin/dashboard");
          }
        } catch (error) { console.error("データ読み込みエラー:", error); }
      } else { router.push("/"); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, router]);
  
  const handleArrayChange = (setter: Function, index: number, field: string, value: string) => {
    setter((prev: any[]) => { const newArr = [...prev]; newArr[index][field] = value; return newArr; });
  };
  const addArrayItem = (setter: Function, newItem: object) => setter((prev: any[]) => [...prev, newItem]);
  const removeArrayItem = (setter: Function, index: number) => setter((prev: any[]) => prev.filter((_, i) => i !== index));
  const handleTicketSaleChange = (period: keyof typeof ticketSales, field: keyof SalePeriod, value: string) => {
    setTicketSales(prev => ({ ...prev, [period]: { ...prev[period], [field]: value } }));
  };
  const compressAndUpload = async (file: File, path: string) => {
    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
    const fileRef = ref(storage, path); await uploadBytes(fileRef, compressed); return getDownloadURL(fileRef);
  };
  const handleDeleteImage = async (imageType: 'event' | 'member') => {
    if (typeof id !== 'string' || !window.confirm(`${imageType === 'event' ? 'イベント写真' : 'メンバー写真'}を本当に削除しますか？`)) return;
    const filePath = `events/${id}/${imageType}.jpg`; const imageRef = ref(storage, filePath);
    const fieldToDelete = imageType === 'event' ? 'eventPhotoUrl' : 'memberPhotoUrl';
    try {
      await deleteObject(imageRef);
      await updateDoc(doc(db, "events", id), { [fieldToDelete]: deleteField() });
      if (imageType === 'event') setCurrentEventPhotoUrl(""); else setCurrentMemberPhotoUrl("");
      alert("画像を削除しました。");
    } catch (error: any) {
        if(error.code === 'storage/object-not-found') {
             await updateDoc(doc(db, "events", id), { [fieldToDelete]: deleteField() });
             if (imageType === 'event') setCurrentEventPhotoUrl(""); else setCurrentMemberPhotoUrl("");
             alert("データベースのURLを削除しました（ファイルは存在しませんでした）。");
        } else { console.error("画像削除エラー:", error); alert("画像の削除に失敗しました。"); }
    }
  };

  const handleUpdate = async () => {
    if (typeof id !== 'string' || !groupId || !title || !date) return alert("グループ、タイトル、日付は必須です。");
    setIsSubmitting(true);
    try {
      const eventRef = doc(db, "events", id);
      const toTimestamp = (dateStr: string) => dateStr ? new Date(dateStr) : null;
      const updatedEventData: { [key: string]: any } = {
        groupId, title, date: new Date(date), venue, openTime, startTime,
        prices: prices.filter(p => p.tierName && p.amount).map(p => ({ ...p, amount: Number(p.amount) })),
        womenOnlyArea, photoPolicy, ticketUrl,
        ticketSales: {
            preSaleFastest: { ...ticketSales.preSaleFastest, startAt: toTimestamp(ticketSales.preSaleFastest.startAt), endAt: toTimestamp(ticketSales.preSaleFastest.endAt) },
            preSaleGeneral: { ...ticketSales.preSaleGeneral, startAt: toTimestamp(ticketSales.preSaleGeneral.startAt), endAt: toTimestamp(ticketSales.preSaleGeneral.endAt) },
            generalSale:    { ...ticketSales.generalSale,    startAt: toTimestamp(ticketSales.generalSale.startAt),    endAt: toTimestamp(ticketSales.generalSale.endAt) },
        },
        performanceTimes: performanceTimes.filter(t => t.startAt && t.endAt),
        bonusEventTimes: bonusEventTimes.filter(t => t.startAt && t.endAt),
        attendanceBonus, updatedAt: serverTimestamp(),
      };
      if (eventImage) updatedEventData.eventPhotoUrl = await compressAndUpload(eventImage, `events/${id}/event.jpg`);
      if (memberImage) updatedEventData.memberPhotoUrl = await compressAndUpload(memberImage, `events/${id}/member.jpg`);
      
      await updateDoc(eventRef, updatedEventData);
      alert("イベントを更新しました！"); router.push("/admin/dashboard");
    } catch (error) { console.error("イベント更新エラー:", error); alert("イベントの更新に失敗しました。");
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;
  if (!user) return <div className="p-4 text-center">管理者としてログインしてください。</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">イベントを編集</h1><Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">← ダッシュボードに戻る</Link></div>
      <FormSection title="基本情報">
        <div>
          <label className="block text-sm font-medium text-gray-700">グループ*</label>
          <select value={groupId} onChange={e => setGroupId(e.target.value)} className="mt-1 w-full border p-2 rounded-md bg-white">
            <option value="">-- グループを選択 --</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">イベント名*</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border p-2 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">開催日*</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full border p-2 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">会場</label>
          <input value={venue} onChange={e => setVenue(e.target.value)} className="mt-1 w-full border p-2 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700">開場時間</label><input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} className="mt-1 w-full border p-2 rounded-md"/></div>
          <div><label className="block text-sm font-medium text-gray-700">開演時間</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 w-full border p-2 rounded-md"/></div>
        </div>
      </FormSection>
      
      <FormSection title="料金設定">
        {prices.map((price, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 border rounded">
            <input value={price.tierName} onChange={e => handleArrayChange(setPrices, index, 'tierName', e.target.value)} placeholder="券種名 (例: 一般)" className="border p-2 rounded"/>
            <input value={price.amount} onChange={e => handleArrayChange(setPrices, index, 'amount', e.target.value)} placeholder="金額" type="number" className="border p-2 rounded"/>
            <select value={price.drinks} onChange={e => handleArrayChange(setPrices, index, 'drinks', e.target.value as any)} className="border p-2 rounded bg-white">
              <option value="別">D代別</option><option value="込み">D代込</option><option value="なし">D代なし</option>
            </select>
            <button onClick={() => removeArrayItem(setPrices, index)} className="px-3 py-2 bg-red-500 text-white rounded text-sm">削除</button>
          </div>
        ))}
        <button onClick={() => addArrayItem(setPrices, { tierName: '', amount: '', drinks: '別' })} className="text-sm font-medium text-blue-600 hover:underline">+ 料金種別を追加</button>
      </FormSection>

      <FormSection title="チケット販売期間">
        {Object.entries({preSaleFastest: '最速先行', preSaleGeneral: '先行販売', generalSale: '一般販売'}).map(([key, label]) => (
            <div key={key} className="p-2 border rounded space-y-2">
                <p className="text-sm font-bold text-gray-600">{label}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div><label className="text-xs text-gray-500">開始日</label><input type="date" value={ticketSales[key as keyof typeof ticketSales].startAt} onChange={e => handleTicketSaleChange(key as any, 'startAt', e.target.value)} className="w-full border p-2 rounded"/></div>
                    <div><label className="text-xs text-gray-500">終了日</label><input type="date" value={ticketSales[key as keyof typeof ticketSales].endAt} onChange={e => handleTicketSaleChange(key as any, 'endAt', e.target.value)} className="w-full border p-2 rounded"/></div>
                </div>
                <input value={ticketSales[key as keyof typeof ticketSales].url} onChange={e => handleTicketSaleChange(key as any, 'url', e.target.value)} placeholder="購入URL" className="w-full border p-2 rounded"/>
            </div>
        ))}
      </FormSection>

      <FormSection title="出演・特典会時間">
        <p className="text-sm font-medium text-gray-700 mb-2">出演時間</p>
        {performanceTimes.map((time, index) => (
          <div key={index} className="flex items-center gap-2">
             <input type="time" value={time.startAt} onChange={e => handleArrayChange(setPerformanceTimes, index, 'startAt', e.target.value)} className="border p-2 rounded"/>
             <span className="text-gray-500">〜</span>
             <input type="time" value={time.endAt} onChange={e => handleArrayChange(setPerformanceTimes, index, 'endAt', e.target.value)} className="border p-2 rounded"/>
             <button onClick={() => removeArrayItem(setPerformanceTimes, index)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
          </div>
        ))}
        <button onClick={() => addArrayItem(setPerformanceTimes, { startAt: '', endAt: '' })} className="text-sm font-medium text-blue-600 hover:underline">+ 出演時間を追加</button>
        <hr className="my-4"/>
        <p className="text-sm font-medium text-gray-700 mb-2">特典会時間</p>
        {bonusEventTimes.map((time, index) => (
          <div key={index} className="flex items-center gap-2">
             <input type="time" value={time.startAt} onChange={e => handleArrayChange(setBonusEventTimes, index, 'startAt', e.target.value)} className="border p-2 rounded"/>
             <span className="text-gray-500">〜</span>
             <input type="time" value={time.endAt} onChange={e => handleArrayChange(setBonusEventTimes, index, 'endAt', e.target.value)} className="border p-2 rounded"/>
             <button onClick={() => removeArrayItem(setBonusEventTimes, index)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
          </div>
        ))}
        <button onClick={() => addArrayItem(setBonusEventTimes, { startAt: '', endAt: '' })} className="text-sm font-medium text-blue-600 hover:underline">+ 特典会時間を追加</button>
      </FormSection>

      <FormSection title="詳細情報">
        <div><label className="block text-sm font-medium text-gray-700">チケット購入URL (その他)</label><input value={ticketUrl} onChange={e => setTicketUrl(e.target.value)} className="mt-1 w-full border p-2 rounded-md" placeholder="https://..."/></div>
        <div><label className="block text-sm font-medium text-gray-700">女性限定エリア</label><select value={womenOnlyArea} onChange={e => setWomenOnlyArea(e.target.value as any)} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="あり">あり</option><option value="なし">なし</option></select></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700">静止画撮影</label><select value={photoPolicy.still} onChange={e => setPhotoPolicy({...photoPolicy, still: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="OK">OK</option><option value="NG">NG</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700">動画撮影</label><select value={photoPolicy.video} onChange={e => setPhotoPolicy({...photoPolicy, video: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="OK">OK</option><option value="NG">NG</option></select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700">来場特典</label><textarea value={attendanceBonus} onChange={e => setAttendanceBonus(e.target.value)} className="mt-1 w-full border p-2 rounded-md" rows={3}></textarea></div>
      </FormSection>
      <FormSection title="画像情報">
        {/* イベント写真 */}
        <div>
          <h3 className="text-md font-semibold text-gray-800">イベント写真</h3>
          {currentEventPhotoUrl && <div className="my-2"><Image src={currentEventPhotoUrl} alt="現在のイベント写真" width={320} height={180} className="rounded" /><button onClick={() => handleDeleteImage('event')} className="mt-2 text-sm text-red-600 hover:underline">この写真を削除</button></div>}
          <label className="block text-sm font-medium text-gray-700">{currentEventPhotoUrl ? '新しいイベント写真に差し替え' : 'イベント写真をアップロード'}</label>
          <input type="file" accept="image/*" onChange={e => setEventImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm"/>
        </div>
        <hr className="my-4"/>
        {/* メンバー写真 */}
        <div>
          <h3 className="text-md font-semibold text-gray-800">メンバー写真</h3>
          {currentMemberPhotoUrl && <div className="my-2"><Image src={currentMemberPhotoUrl} alt="現在のメンバー写真" width={320} height={180} className="rounded" /><button onClick={() => handleDeleteImage('member')} className="mt-2 text-sm text-red-600 hover:underline">この写真を削除</button></div>}
          <label className="block text-sm font-medium text-gray-700">{currentMemberPhotoUrl ? '新しいメンバー写真に差し替え' : 'メンバー写真をアップロード'}</label>
          <input type="file" accept="image/*" onChange={e => setMemberImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm"/>
        </div>
      </FormSection>
      <button onClick={handleUpdate} disabled={isSubmitting} className="w-full mt-6 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors">{isSubmitting ? '保存中...' : '変更を保存する'}</button>
    </div>
  );
}