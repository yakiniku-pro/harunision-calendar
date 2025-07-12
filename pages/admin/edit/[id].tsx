import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, query, getDocs, orderBy, serverTimestamp, collection, deleteField } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Link from "next/link";
import Image from "next/image";
import { ADMIN_UIDS } from "@/lib/config";
import { User } from "firebase/auth";
import imageCompression from "browser-image-compression";
import { IMaskInput } from "react-imask";
import { format } from "date-fns";

// --- 型定義 ---
interface Group { id: string; name: string; }
interface PriceTier { tierName: string; amount: string; drinks: '別' | '込み' | 'なし'; }
interface TimeSlot { startAt: string; endAt: string; location: string; }
interface SalePeriod { saleName: string; startAt: string; endAt: string; url: string; }

// --- ヘルパーコンポーネント ---
const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="p-4 bg-white rounded-lg shadow space-y-4">
    <h2 className="text-lg font-semibold border-b pb-2 mb-4">{title}</h2>
    {children}
  </div>
);

const MaskedTimeInput = (props: any) => <IMaskInput mask="00:00" placeholder="HH:MM" className="w-full border p-2 rounded text-center" {...props} />;
const MaskedDateInput = (props: any) => <IMaskInput mask="0000-00-00" placeholder="YYYY-MM-DD" className="mt-1 w-full border p-2 rounded-md" {...props} />;
const MaskedDateTimeInput = (props: any) => <IMaskInput mask="0000-00-00 00:00" placeholder="YYYY-MM-DD HH:MM" className="w-full border p-2 rounded" {...props} />;

export default function EditEventAdmin() {
  const router = useRouter();
  const { id } = router.query;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [ticketSales, setTicketSales] = useState<SalePeriod[]>([{ saleName: '', startAt: '', endAt: '', url: '' }]);
  const [performanceTimes, setPerformanceTimes] = useState<TimeSlot[]>([{ startAt: '', endAt: '', location: '' }]);
  const [bonusEventTimes, setBonusEventTimes] = useState<TimeSlot[]>([{ startAt: '', endAt: '', location: '' }]);
  const [attendanceBonus, setAttendanceBonus] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [memberImage, setMemberImage] = useState<File | null>(null);
  const [existingEventPhotoUrl, setExistingEventPhotoUrl] = useState("");
  const [existingMemberPhotoUrl, setExistingMemberPhotoUrl] = useState("");
  const [isEventPhotoDeleted, setIsEventPhotoDeleted] = useState(false);
  const [isMemberPhotoDeleted, setIsMemberPhotoDeleted] = useState(false);

  const priceRefs = useRef<(HTMLInputElement | null)[]>([]);
  const ticketSaleRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { priceRefs.current[prices.length - 1]?.focus(); }, [prices.length]);
  useEffect(() => { ticketSaleRefs.current[ticketSales.length - 1]?.focus(); }, [ticketSales.length]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser || !ADMIN_UIDS.includes(currentUser.uid)) {
        router.push('/');
        return;
      }
      setUser(currentUser);
      const groupsSnap = await getDocs(query(collection(db, "groups"), orderBy("name")));
      setGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[]);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (typeof id !== 'string' || !id) return;
    
    const fetchEvent = async () => {
      setLoading(true);
      const eventRef = doc(db, "events", id);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        alert("指定されたイベントが見つかりません。");
        router.push("/admin/dashboard");
        return;
      }
      const data = eventSnap.data();
      
      const formatDate = (timestamp: any) => timestamp ? format(timestamp.toDate(), 'yyyy-MM-dd') : '';
      const formatTime = (timeStr: string) => timeStr || "";
      const formatDateTime = (timestamp: any) => timestamp ? format(timestamp.toDate(), 'yyyy-MM-dd HH:mm') : '';

      setGroupId(data.groupId);
      setTitle(data.title);
      setDate(formatDate(data.date));
      setVenue(data.venue || "");
      setOpenTime(formatTime(data.openTime));
      setStartTime(formatTime(data.startTime));
      setPrices(data.prices?.map((p:any) => ({...p, amount: p.amount.toString()})) || [{ tierName: '', amount: '', drinks: '別' }]);
      setWomenOnlyArea(data.womenOnlyArea || '不明');
      setPhotoPolicy(data.photoPolicy || { still: '不明', video: '不明' });
      
      setTicketSales(
        data.ticketSales?.map((s: any) => ({
          ...s,
          startAt: formatDateTime(s.startAt),
          endAt: formatDateTime(s.endAt),
        })) || [{ saleName: '', startAt: '', endAt: '', url: '' }]
      );

      setPerformanceTimes(data.performanceTimes || [{ startAt: '', endAt: '', location: '' }]);
      setBonusEventTimes(data.bonusEventTimes || [{ startAt: '', endAt: '', location: '' }]);
      setAttendanceBonus(data.attendanceBonus || "");
      setExistingEventPhotoUrl(data.eventPhotoUrl || "");
      setExistingMemberPhotoUrl(data.memberPhotoUrl || "");

      setLoading(false);
    }
    fetchEvent();
  }, [id, router]);

  const handleArrayChange = (setter: Function, index: number, field: string, value: string) => {
    setter((prev: any[]) => { const newArr = [...prev]; newArr[index] = { ...newArr[index], [field]: value }; return newArr; });
  };
  const addArrayItem = (setter: Function, newItem: object) => {
    setter((prev: any[]) => [...prev, newItem]);
  };
  const removeArrayItem = (setter: Function, index: number) => {
    setter((prev: any[]) => prev.filter((_, i) => i !== index));
  };
  const compressAndUpload = async (file: File, path: string) => {
    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, compressed);
    return getDownloadURL(fileRef);
  };
  
  const handleDeleteImage = (type: 'event' | 'member') => {
    if (!window.confirm("この画像を削除しますか？\n（「更新」ボタンを押すまで実際の削除は行われません）")) return;
    if (type === 'event') {
      setIsEventPhotoDeleted(true);
      setExistingEventPhotoUrl("");
    } else {
      setIsMemberPhotoDeleted(true);
      setExistingMemberPhotoUrl("");
    }
  };
  
  const handleSubmit = async () => {
    if (!id || typeof id !== 'string') return;
    setIsSubmitting(true);
    try {
      const isMaskedInputComplete = (val: string, length: number) => val && val.length === length;
      const toTimestamp = (dateTimeStr: string) => isMaskedInputComplete(dateTimeStr, 16) ? new Date(dateTimeStr) : null;
      
      const updatedEventData: any = {
        groupId, title, date: new Date(date), venue, 
        openTime: isMaskedInputComplete(openTime, 5) ? openTime : "", 
        startTime: isMaskedInputComplete(startTime, 5) ? startTime : "", 
        prices: prices.filter(p => p.tierName && p.amount).map(p => ({ ...p, amount: Number(p.amount) || 0 })),
        womenOnlyArea, photoPolicy,
        ticketSales: ticketSales.filter(s => s.saleName).map(s => ({
          saleName: s.saleName, url: s.url,
          startAt: toTimestamp(s.startAt),
          endAt: toTimestamp(s.endAt),
        })),
        performanceTimes: performanceTimes.filter(t => isMaskedInputComplete(t.startAt, 5) && isMaskedInputComplete(t.endAt, 5)),
        bonusEventTimes: bonusEventTimes.filter(t => isMaskedInputComplete(t.startAt, 5) && isMaskedInputComplete(t.endAt, 5)),
        attendanceBonus, updatedAt: serverTimestamp(),
      };
      
      if (isEventPhotoDeleted) {
        updatedEventData.eventPhotoUrl = deleteField();
        const imageRef = ref(storage, `events/${id}/event.jpg`);
        try { await deleteObject(imageRef); } catch (e) { console.warn("Storageからのイベント写真削除に失敗:", e); }
      } else if (eventImage) {
        updatedEventData.eventPhotoUrl = await compressAndUpload(eventImage, `events/${id}/event.jpg`);
      }

      if (isMemberPhotoDeleted) {
        updatedEventData.memberPhotoUrl = deleteField();
        const imageRef = ref(storage, `events/${id}/member.jpg`);
        try { await deleteObject(imageRef); } catch (e) { console.warn("Storageからのメンバー写真削除に失敗:", e); }
      } else if (memberImage) {
        updatedEventData.memberPhotoUrl = await compressAndUpload(memberImage, `events/${id}/member.jpg`);
      }
      
      await updateDoc(doc(db, "events", id), updatedEventData);
      alert("イベントを更新しました！");
      router.push("/admin/dashboard");
    } catch (error) { console.error("イベント更新エラー:", error); alert("イベントの更新に失敗しました。");
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;
  if (!user) return <div className="p-4 text-center">管理者としてログインしてください。</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">イベント編集</h1><Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">← ダッシュボードに戻る</Link></div>
      
      <FormSection title="基本情報">
        <div><label className="block text-sm font-medium text-gray-700">グループ*</label><select value={groupId} onChange={e => setGroupId(e.target.value)} disabled className="mt-1 w-full border p-2 rounded-md bg-gray-100"><option value="">-- グループを選択 --</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700">イベント名*</label><input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border p-2 rounded-md" /></div>
        <div><label className="block text-sm font-medium text-gray-700">開催日*</label><MaskedDateInput value={date} onAccept={setDate} /></div>
        <div><label className="block text-sm font-medium text-gray-700">会場</label><input value={venue} onChange={e => setVenue(e.target.value)} className="mt-1 w-full border p-2 rounded-md" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700">開場時間</label><MaskedTimeInput value={openTime} onAccept={setOpenTime} /></div>
          <div><label className="block text-sm font-medium text-gray-700">開演時間</label><MaskedTimeInput value={startTime} onAccept={setStartTime} /></div>
        </div>
      </FormSection>
      
      <FormSection title="料金設定">{prices.map((price, index) => (<div key={index} className="grid grid-cols-[1fr,1fr,auto,auto] gap-2 items-center"><input ref={el => { if (el) (priceRefs.current[index] as any) = el; }} value={price.tierName} onChange={e => handleArrayChange(setPrices, index, 'tierName', e.target.value)} placeholder="券種名 (例: 一般)" className="border p-2 rounded"/><input value={price.amount} onChange={e => handleArrayChange(setPrices, index, 'amount', e.target.value)} placeholder="金額" type="number" className="border p-2 rounded"/><select value={price.drinks} onChange={e => handleArrayChange(setPrices, index, 'drinks', e.target.value as any)} className="border p-2 rounded bg-white"><option value="別">D代別</option><option value="込み">D代込</option><option value="なし">D代なし</option></select><button type="button" onClick={() => removeArrayItem(setPrices, index)} className="px-3 py-2 bg-red-500 text-white rounded text-sm">削除</button></div>))}<button type="button" onClick={() => addArrayItem(setPrices, { tierName: '', amount: '', drinks: '別' })} className="text-sm font-medium text-blue-600 hover:underline">+ 料金種別を追加</button></FormSection>
      <FormSection title="チケット販売期間">{ticketSales.map((sale, index) => (<div key={index} className="p-3 border rounded-lg space-y-3"><div className="flex justify-between items-center"><input ref={el => { if(el) (ticketSaleRefs.current[index] as any) = el;}} value={sale.saleName} onChange={e => handleArrayChange(setTicketSales, index, 'saleName', e.target.value)} placeholder="販売名称 (例: 先行販売)" className="border p-2 rounded w-full"/><button type="button" onClick={() => removeArrayItem(setTicketSales, index)} className="ml-2 px-3 py-2 bg-red-500 text-white rounded text-sm flex-shrink-0">✕</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs text-gray-500">開始日時</label><MaskedDateTimeInput value={sale.startAt} onAccept={(value:string) => handleArrayChange(setTicketSales, index, 'startAt', value)} /></div><div><label className="text-xs text-gray-500">終了日時</label><MaskedDateTimeInput value={sale.endAt} onAccept={(value:string) => handleArrayChange(setTicketSales, index, 'endAt', value)} /></div></div><input value={sale.url} onChange={e => handleArrayChange(setTicketSales, index, 'url', e.target.value)} placeholder="購入URL" className="w-full border p-2 rounded"/></div>))}<button type="button" onClick={() => addArrayItem(setTicketSales, { saleName: '', startAt: '', endAt: '', url: '' })} className="text-sm font-medium text-blue-600 hover:underline">+ 販売期間を追加</button></FormSection>
      <FormSection title="出演・特典会時間">
        <p className="text-sm font-medium text-gray-700 mb-2">出演時間</p>{performanceTimes.map((time, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"><MaskedTimeInput value={time.startAt} onAccept={(value:string) => handleArrayChange(setPerformanceTimes, index, 'startAt', value)} /><MaskedTimeInput value={time.endAt} onAccept={(value:string) => handleArrayChange(setPerformanceTimes, index, 'endAt', value)} /><div className="flex items-center gap-2"><input value={time.location} onChange={e => handleArrayChange(setPerformanceTimes, index, 'location', e.target.value)} placeholder="場所 (例: SKY STAGE)" className="border p-2 rounded w-full"/><button type="button" onClick={() => removeArrayItem(setPerformanceTimes, index)} className="text-red-500 hover:text-red-700 font-bold flex-shrink-0">✕</button></div></div>))}<button type="button" onClick={() => addArrayItem(setPerformanceTimes, { startAt: '', endAt: '', location: '' })} className="text-sm font-medium text-blue-600 hover:underline">+ 出演時間を追加</button>
        <hr className="my-4"/><p className="text-sm font-medium text-gray-700 mb-2">特典会時間</p>{bonusEventTimes.map((time, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"><MaskedTimeInput value={time.startAt} onAccept={(value:string) => handleArrayChange(setBonusEventTimes, index, 'startAt', value)} /><MaskedTimeInput value={time.endAt} onAccept={(value:string) => handleArrayChange(setBonusEventTimes, index, 'endAt', value)} /><div className="flex items-center gap-2"><input value={time.location} onChange={e => handleArrayChange(setBonusEventTimes, index, 'location', e.target.value)} placeholder="場所 (例: GREETING AREA A)" className="border p-2 rounded w-full"/><button type="button" onClick={() => removeArrayItem(setBonusEventTimes, index)} className="text-red-500 hover:text-red-700 font-bold flex-shrink-0">✕</button></div></div>))}<button type="button" onClick={() => addArrayItem(setBonusEventTimes, { startAt: '', endAt: '', location: '' })} className="text-sm font-medium text-blue-600 hover:underline">+ 特典会時間を追加</button>
      </FormSection>

      <FormSection title="詳細情報">
        <div><label className="block text-sm font-medium text-gray-700">女性限定エリア</label><select value={womenOnlyArea} onChange={e => setWomenOnlyArea(e.target.value as any)} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="あり">あり</option><option value="なし">なし</option></select></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700">静止画撮影</label><select value={photoPolicy.still} onChange={e => setPhotoPolicy({...photoPolicy, still: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="OK">OK</option><option value="NG">NG</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700">動画撮影</label><select value={photoPolicy.video} onChange={e => setPhotoPolicy({...photoPolicy, video: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="OK">OK</option><option value="NG">NG</option></select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700">来場特典</label><textarea value={attendanceBonus} onChange={e => setAttendanceBonus(e.target.value)} className="mt-1 w-full border p-2 rounded-md" rows={3}></textarea></div>
      </FormSection>
      
      <FormSection title="画像情報">
        <div>
          <label className="block text-sm font-medium text-gray-700">イベント写真</label>
          {existingEventPhotoUrl && (
            <div className="mt-2 p-2 border rounded-lg">
              <Image src={existingEventPhotoUrl} alt="現在のイベント写真" width={240} height={135} className="rounded-md object-cover" />
              <button onClick={() => handleDeleteImage('event')} type="button" className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200">この画像を削除</button>
            </div>
          )}
          <div className="mt-2">
            <label className="text-xs text-gray-500">{existingEventPhotoUrl ? '画像を差し替える場合は新しいファイルをアップロード' : '新しいファイルをアップロード'}</label>
            <input type="file" accept="image/*" onChange={e => setEventImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm"/>
          </div>
        </div>
        <hr/>
        <div>
          <label className="block text-sm font-medium text-gray-700">メンバー写真</label>
          {existingMemberPhotoUrl && (
            <div className="mt-2 p-2 border rounded-lg">
              <Image src={existingMemberPhotoUrl} alt="現在のメンバー写真" width={240} height={135} className="rounded-md object-cover" />
              <button onClick={() => handleDeleteImage('member')} type="button" className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200">この画像を削除</button>
            </div>
          )}
          <div className="mt-2">
             <label className="text-xs text-gray-500">{existingMemberPhotoUrl ? '画像を差し替える場合は新しいファイルをアップロード' : '新しいファイルをアップロード'}</label>
            <input type="file" accept="image/*" onChange={e => setMemberImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm"/>
          </div>
        </div>
      </FormSection>

      <button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{isSubmitting ? '更新中...' : 'この内容でイベントを更新する'}</button>
    </div>
  );
}