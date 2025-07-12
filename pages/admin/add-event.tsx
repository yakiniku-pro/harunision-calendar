import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { auth, db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, query, getDocs, orderBy, serverTimestamp, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import { ADMIN_UIDS } from "@/lib/config";
import { User } from "firebase/auth";
import imageCompression from "browser-image-compression";
import { IMaskInput } from "react-imask";

// --- 型定義 ---
interface Group { id: string; name: string; }
interface PriceTier { tierName: string; amount: string; drinks: '別' | '込み' | 'なし'; }
interface TimeSlot { startAt: string; endAt: string; location: string; }
interface SalePeriod { saleName: string; startAt: string; endAt: string; url: string; } // ★ 日時を単一のstringに統合

// --- ヘルパーコンポーネント ---
const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="p-4 bg-white rounded-lg shadow space-y-4">
    <h2 className="text-lg font-semibold border-b pb-2 mb-4">{title}</h2>
    {children}
  </div>
);

const MaskedTimeInput = (props: any) => <IMaskInput mask="00:00" placeholder="HH:MM" className="w-full border p-2 rounded text-center" {...props} />;
const MaskedDateInput = (props: any) => <IMaskInput mask="0000-00-00" placeholder="YYYY-MM-DD" className="mt-1 w-full border p-2 rounded-md" {...props} />;
// ★ YYYY-MM-DD HH:MM形式のマスク付き入力コンポーネント
const MaskedDateTimeInput = (props: any) => <IMaskInput mask="0000-00-00 00:00" placeholder="YYYY-MM-DD HH:MM" className="w-full border p-2 rounded" {...props} />;


export default function AddEventAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [prices, setPrices] = useState<PriceTier[]>([{ tierName: '一般', amount: '', drinks: '別' }]);
  const [womenOnlyArea, setWomenOnlyArea] = useState<'なし' | 'あり' | '不明'>('不明');
  const [photoPolicy, setPhotoPolicy] = useState({ still: '不明', video: '不明' });
  const [ticketSales, setTicketSales] = useState<SalePeriod[]>([{ saleName: '一般販売', startAt: '', endAt: '', url: '' }]); // ★ stateを更新
  const [performanceTimes, setPerformanceTimes] = useState<TimeSlot[]>([{ startAt: '', endAt: '', location: '' }]);
  const [bonusEventTimes, setBonusEventTimes] = useState<TimeSlot[]>([{ startAt: '', endAt: '', location: '' }]);
  const [attendanceBonus, setAttendanceBonus] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [memberImage, setMemberImage] = useState<File | null>(null);
  
  const priceRefs = useRef<(HTMLInputElement | null)[]>([]);
  const ticketSaleRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { priceRefs.current[prices.length - 1]?.focus(); }, [prices.length]);
  useEffect(() => { ticketSaleRefs.current[ticketSales.length - 1]?.focus(); }, [ticketSales.length]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        if (currentUser && ADMIN_UIDS.includes(currentUser.uid)) {
          setUser(currentUser);
          const groupsSnap = await getDocs(query(collection(db, "groups"), orderBy("name")));
          setGroups(groupsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Group[]);
        } else if (!currentUser) {
           router.push("/");
        }
      } catch (error) { console.error("初期化エラー:", error); } 
      finally { setLoading(false); }
    });
    return () => unsubscribe();
  }, [router]);

  const handleArrayChange = (setter: Function, index: number, field: string, value: string) => {
    setter((prev: any[]) => { const newArr = [...prev]; newArr[index] = { ...newArr[index], [field]: value }; return newArr; });
  };
  
  const addArrayItem = (setter: Function, newItem: object) => setter((prev: any[]) => [...prev, newItem]);
  const removeArrayItem = (setter: Function, index: number) => setter((prev: any[]) => prev.filter((_, i) => i !== index));
  const compressAndUpload = async (file: File, path: string) => {
    const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1280 });
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, compressed);
    return getDownloadURL(fileRef);
  };
  
  const handleSubmit = async () => {
    if (!groupId || !title || !date) return alert("グループ、タイトル、日付は必須です。");
    setIsSubmitting(true);
    try {
      const isMaskedInputComplete = (val: string, length: number) => val && val.length === length;
      const toTimestamp = (dateTimeStr: string) => isMaskedInputComplete(dateTimeStr, 16) ? new Date(dateTimeStr) : null;
      
      const newEventData = {
        groupId, title, date: new Date(date), venue, 
        openTime: isMaskedInputComplete(openTime, 5) ? openTime : "", 
        startTime: isMaskedInputComplete(startTime, 5) ? startTime : "", 
        status: 'published',
        prices: prices.filter(p => p.tierName && p.amount).map(p => ({ ...p, amount: Number(p.amount) || 0 })),
        womenOnlyArea, photoPolicy,
        ticketSales: ticketSales.filter(s => s.saleName).map(s => ({
          saleName: s.saleName, url: s.url,
          startAt: toTimestamp(s.startAt),
          endAt: toTimestamp(s.endAt),
        })),
        performanceTimes: performanceTimes.filter(t => isMaskedInputComplete(t.startAt, 5) && isMaskedInputComplete(t.endAt, 5)),
        bonusEventTimes: bonusEventTimes.filter(t => isMaskedInputComplete(t.startAt, 5) && isMaskedInputComplete(t.endAt, 5)),
        attendanceBonus, isNew: true, createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "events"), newEventData);
      
      const eventPhotoUrl = eventImage ? await compressAndUpload(eventImage, `events/${docRef.id}/event.jpg`) : null;
      const memberPhotoUrl = memberImage ? await compressAndUpload(memberImage, `events/${docRef.id}/member.jpg`) : null;
      if (eventPhotoUrl || memberPhotoUrl) {
          await updateDoc(docRef, { ...(eventPhotoUrl && { eventPhotoUrl }), ...(memberPhotoUrl && { memberPhotoUrl }) });
      }
      alert("イベントを追加しました！");
      router.push("/admin/dashboard");
    } catch (error) { console.error("イベント追加エラー:", error); alert("イベントの追加に失敗しました。");
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="p-4 text-center">読み込み中...</div>;
  if (!user) return <div className="p-4 text-center">管理者としてログインしてください。</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">新規イベント追加</h1><Link href="/admin/dashboard" className="text-sm text-blue-600 underline hover:text-blue-800">← ダッシュボードに戻る</Link></div>
      
      <FormSection title="基本情報">
        <div><label className="block text-sm font-medium text-gray-700">グループ*</label><select value={groupId} onChange={e => setGroupId(e.target.value)} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="">-- グループを選択 --</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
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
        <p className="text-sm font-medium text-gray-700 mb-2">出演時間</p>
        {performanceTimes.map((time, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"><MaskedTimeInput value={time.startAt} onAccept={(value:string) => handleArrayChange(setPerformanceTimes, index, 'startAt', value)} /><MaskedTimeInput value={time.endAt} onAccept={(value:string) => handleArrayChange(setPerformanceTimes, index, 'endAt', value)} /><div className="flex items-center gap-2"><input value={time.location} onChange={e => handleArrayChange(setPerformanceTimes, index, 'location', e.target.value)} placeholder="場所 (例: SKY STAGE)" className="border p-2 rounded w-full"/><button type="button" onClick={() => removeArrayItem(setPerformanceTimes, index)} className="text-red-500 hover:text-red-700 font-bold flex-shrink-0">✕</button></div></div>))}<button type="button" onClick={() => addArrayItem(setPerformanceTimes, { startAt: '', endAt: '', location: '' })} className="text-sm font-medium text-blue-600 hover:underline">+ 出演時間を追加</button>
        <hr className="my-4"/><p className="text-sm font-medium text-gray-700 mb-2">特典会時間</p>
        {bonusEventTimes.map((time, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"><MaskedTimeInput value={time.startAt} onAccept={(value:string) => handleArrayChange(setBonusEventTimes, index, 'startAt', value)} /><MaskedTimeInput value={time.endAt} onAccept={(value:string) => handleArrayChange(setBonusEventTimes, index, 'endAt', value)} /><div className="flex items-center gap-2"><input value={time.location} onChange={e => handleArrayChange(setBonusEventTimes, index, 'location', e.target.value)} placeholder="場所 (例: GREETING AREA A)" className="border p-2 rounded w-full"/><button type="button" onClick={() => removeArrayItem(setBonusEventTimes, index)} className="text-red-500 hover:text-red-700 font-bold flex-shrink-0">✕</button></div></div>))}<button type="button" onClick={() => addArrayItem(setBonusEventTimes, { startAt: '', endAt: '', location: '' })} className="text-sm font-medium text-blue-600 hover:underline">+ 特典会時間を追加</button>
      </FormSection>

      <FormSection title="詳細情報"><label className="block text-sm font-medium text-gray-700">女性限定エリア</label><select value={womenOnlyArea} onChange={e => setWomenOnlyArea(e.target.value as any)} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="あり">あり</option><option value="なし">なし</option></select><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">静止画撮影</label><select value={photoPolicy.still} onChange={e => setPhotoPolicy({...photoPolicy, still: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="OK">OK</option><option value="NG">NG</option></select></div><div><label className="block text-sm font-medium text-gray-700">動画撮影</label><select value={photoPolicy.video} onChange={e => setPhotoPolicy({...photoPolicy, video: e.target.value})} className="mt-1 w-full border p-2 rounded-md bg-white"><option value="不明">不明</option><option value="OK">OK</option><option value="NG">NG</option></select></div></div><div><label className="block text-sm font-medium text-gray-700">来場特典</label><textarea value={attendanceBonus} onChange={e => setAttendanceBonus(e.target.value)} className="mt-1 w-full border p-2 rounded-md" rows={3}></textarea></div></FormSection>
      
      <FormSection title="画像情報"><div><label className="block text-sm font-medium text-gray-700">イベント写真</label><input type="file" accept="image/*" onChange={e => setEventImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm"/></div><div><label className="block text-sm font-medium text-gray-700">メンバー写真</label><input type="file" accept="image/*" onChange={e => setMemberImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm"/></div></FormSection>

      <button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-6 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors">{isSubmitting ? '保存中...' : 'この内容でイベントを追加する'}</button>
    </div>
  );
}