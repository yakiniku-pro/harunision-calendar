import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADMIN_UIDS } from "@/lib/config";
import { format, isWithinInterval, isPast, parse } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { User } from "firebase/auth";

// 型定義
interface EventData {
  title: string; date: any; venue: string; openTime: string; startTime: string;
  prices: { tierName: string; amount: number; drinks: string; }[];
  womenOnlyArea: string; photoPolicy: { still: string; video: string; };
  ticketSales: any;
  performanceTimes: { startAt: string; endAt: string; }[];
  bonusEventTimes: { startAt: string; endAt: string; }[];
  attendanceBonus: string; eventPhotoUrl?: string; memberPhotoUrl?: string;
  groupId: string;
}
interface Person { id: string; primaryName:string; color?: string; }
interface Membership { personId: string; nameDuringMembership: string; joinedAt: any; leftAt: any | null; groupId: string; }

// セクション表示用コンポーネント
const InfoSection = ({ title, children, condition = true }: { title: string, children: React.ReactNode, condition?: boolean }) => {
  if (!condition) return null;
  return (
    <div className="pt-4 mt-4 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <div className="space-y-2 text-sm text-gray-700">{children}</div>
    </div>
  );
};

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState<EventData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [participated, setParticipated] = useState(false);
  const [chekiMemo, setChekiMemo] = useState<{ [personId: string]: number }>({});
  const [activeMembers, setActiveMembers] = useState<Person[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  
  const isAdmin = user ? ADMIN_UIDS.includes(user.uid) : false;

  useEffect(() => {
    if (typeof id !== 'string' || !id) return;

    const fetchEventData = async () => {
      setLoading(true);
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
          setEvent(null);
          return;
        }
        const eventData = eventSnap.data() as EventData;
        setEvent(eventData);

        const membershipsQuery = query(collection(db, "memberships"), where("groupId", "==", eventData.groupId));
        const membershipsSnap = await getDocs(membershipsQuery);
        const eventDate = eventData.date.toDate();
        
        const activePersonIds = membershipsSnap.docs
          .map(d => d.data() as Membership)
          .filter(m => {
            const joined = m.joinedAt.toDate();
            const left = m.leftAt ? m.leftAt.toDate() : new Date(8640000000000000); 
            return isWithinInterval(eventDate, { start: joined, end: left });
          })
          .map(m => m.personId);

        if (activePersonIds.length > 0) {
          const personsQuery = query(collection(db, "persons"), where("__name__", "in", activePersonIds));
          const personsSnap = await getDocs(personsQuery);
          setActiveMembers(personsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Person[]);
        } else {
          setActiveMembers([]);
        }
      } catch (error) {
        console.error("イベントデータの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser && typeof id === 'string') {
        const userRecordRef = doc(db, "events", id, "userRecords", currentUser.uid);
        const userRecordSnap = await getDoc(userRecordRef);
        if (userRecordSnap.exists()) {
          const data = userRecordSnap.data();
          setParticipated(data.participated || false);
          setChekiMemo(data.chekiMemo || {});
        } else {
          setParticipated(false);
          setChekiMemo({});
        }
      } else {
        setParticipated(false);
        setChekiMemo({});
      }
    });

    return () => unsubscribe();
  }, [id]);
  
  const toggleParticipation = async () => {
    if (!user || typeof id !== 'string') return;
    const newStatus = !participated;
    setParticipated(newStatus);
    const userRecordRef = doc(db, "events", id, "userRecords", user.uid);
    await setDoc(userRecordRef, { participated: newStatus }, { merge: true });
    alert(newStatus ? "イベントに参加登録しました。" : "参加を取り消しました。");
  };

  const updateCheki = async () => {
    if (!user || typeof id !== 'string') return;
    setSaveStatus('saving');
    try {
      const userRecordRef = doc(db, "events", id, "userRecords", user.uid);
      await setDoc(userRecordRef, { chekiMemo }, { merge: true });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 1000);
    } catch (error) {
      console.error("チェキ枚数の保存に失敗しました:", error);
      alert("保存に失敗しました。");
      setSaveStatus('idle');
    }
  };

  const adjust = (personId: string, delta: number) => {
    setChekiMemo(prev => ({
      ...prev,
      [personId]: Math.max(0, (prev[personId] || 0) + delta)
    }));
  };

  const getEventEndTime = () => {
    if (!event) return new Date();
    const dateStr = format(event.date.toDate(), 'yyyy-MM-dd');
    const lastBonusTime = event.bonusEventTimes?.[event.bonusEventTimes.length - 1]?.endAt;
    const lastPerfTime = event.performanceTimes?.[event.performanceTimes.length - 1]?.endAt;
    const endTimeStr = lastBonusTime || lastPerfTime || event.startTime || "23:59";
    try {
        return parse(`${dateStr} ${endTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());
    } catch {
        return new Date();
    }
  };

  const eventHasEnded = isPast(getEventEndTime());
  const participationStatus = participated ? (eventHasEnded ? "参加済み" : "参加予定") : "不参加";
  
  const statusStyles = {
    "参加済み": "bg-green-100 text-green-800",
    "参加予定": "bg-blue-100 text-blue-800",
    "不参加": "bg-gray-100 text-gray-800",
  };

  const shouldShowDetails = 
    (event?.womenOnlyArea && event.womenOnlyArea !== '不明') ||
    (event?.photoPolicy?.still && event.photoPolicy.still !== '不明') ||
    (event?.photoPolicy?.video && event.photoPolicy.video !== '不明') ||
    !!event?.attendanceBonus;
    
  let displayTicketSales: { saleName: string; startAt: any; endAt: any; url: string; }[] = [];
  if (event?.ticketSales) {
    if (Array.isArray(event.ticketSales)) {
      displayTicketSales = event.ticketSales;
    } else if (typeof event.ticketSales === 'object') {
      displayTicketSales = Object.entries(event.ticketSales).map(([key, value]: [string, any]) => ({
        saleName: key === 'preSaleFastest' ? '最速先行' : key === 'preSaleGeneral' ? '先行販売' : '一般販売',
        ...value
      })).filter(s => s.startAt || s.endAt || s.url);
    }
  }

  if (loading) return (
    <main className="p-4 md:p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="text-center text-gray-500">読み込み中...</div>
    </main>
  );
  if (!event) return (
    <main className="p-4 md:p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          カレンダーに戻る
        </Link>
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm p-4 sm:p-6 text-center text-red-500">
          イベントが見つかりませんでした。
        </div>
      </div>
    </main>
  );

  return (
    <main className="p-4 md:p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          カレンダーに戻る
        </Link>
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm p-4 sm:p-6">
          {isAdmin && (
            <div className="mb-4 p-3 bg-amber-100/80 border border-amber-200 rounded-lg text-center">
              <Link href={`/admin/edit/${id}`} className="font-bold text-amber-700 hover:underline">
                管理者としてこのイベントを編集する
              </Link>
            </div>
          )}
          
          {user && (
            <div className="mb-4 p-3 flex justify-between items-center bg-white/50 rounded-lg">
              <div>
                <span className="text-xs text-gray-500">あなたの参加状況</span>
                <p className={`px-2 py-0.5 inline-block text-sm font-bold rounded-full ${statusStyles[participationStatus]}`}>
                  {participationStatus}
                </p>
              </div>
              <button
                onClick={toggleParticipation}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  participated ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-pink-400 text-white hover:bg-pink-500'
                }`}
              >
                {participated ? '参加を取り消す' : '参加する'}
              </button>
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-md text-gray-500 mt-1">{format(event.date.toDate(), "yyyy年MM月dd日 (E)", { locale: ja })}</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.eventPhotoUrl && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">イベント写真</h3>
                <Image src={event.eventPhotoUrl} alt="イベント写真" width={640} height={360} className="rounded-lg object-cover" />
              </div>
            )}
            {event.memberPhotoUrl && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">メンバー写真</h3>
                <Image src={event.memberPhotoUrl} alt="メンバー写真" width={640} height={360} className="rounded-lg object-cover" />
              </div>
            )}
          </div>

          <InfoSection title="基本情報">
            <p><strong>会場:</strong> {event.venue || '未定'}</p>
            <p><strong>時間:</strong> 開場 {event.openTime || '未定'} / 開演 {event.startTime || '未定'}</p>
          </InfoSection>

          <InfoSection title="料金" condition={event.prices && event.prices.length > 0}>
            {event.prices.map(p => <p key={p.tierName}><strong>{p.tierName}:</strong> ¥{p.amount.toLocaleString()} (D代{p.drinks})</p>)}
          </InfoSection>

          <InfoSection title="チケット販売" condition={displayTicketSales.length > 0}>
            {displayTicketSales.map((sale, i) => (
              <div key={i} className="p-2 border-l-4" style={{borderColor: `hsl(${i * 100}, 70%, 80%)`}}>
                <p className="font-bold">{sale.saleName}</p>
                <p>期間: {sale.startAt ? format(sale.startAt.toDate(), 'M/d HH:mm') : '?'} 〜 {sale.endAt ? format(sale.endAt.toDate(), 'M/d HH:mm') : '?'}</p>
                {sale.url && <a href={sale.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs break-all">購入ページへ</a>}
              </div>
            ))}
          </InfoSection>

          <InfoSection title="出演時間" condition={event.performanceTimes && event.performanceTimes.length > 0}>
            {event.performanceTimes.map((t, i) => <p key={i}>{t.startAt} 〜 {t.endAt}</p>)}
          </InfoSection>

          <InfoSection title="特典会" condition={event.bonusEventTimes && event.bonusEventTimes.length > 0}>
            {event.bonusEventTimes.map((t, i) => <p key={i}>{t.startAt} 〜 {t.endAt}</p>)}
          </InfoSection>
          
          <InfoSection title="詳細" condition={shouldShowDetails}>
            {event.womenOnlyArea !== '不明' && <p><strong>女性エリア:</strong> {event.womenOnlyArea}</p>}
            {event.photoPolicy?.still !== '不明' && <p><strong>静止画撮影:</strong> {event.photoPolicy.still}</p>}
            {event.photoPolicy?.video !== '不明' && <p><strong>動画撮影:</strong> {event.photoPolicy.video}</p>}
            {event.attendanceBonus && <p><strong>来場特典:</strong> {event.attendanceBonus}</p>}
          </InfoSection>
          
          {user && (
            <InfoSection title="あなたのチェキ記録" condition={activeMembers.length > 0}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2">
                {activeMembers.map(person => {
                  const currentCount = chekiMemo[person.id] || 0;
                  const isMinusDisabled = currentCount === 0;
                  return (
                    <div key={person.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span style={{ backgroundColor: person.color || '#ccc' }} className="w-5 h-5 rounded-full border flex-shrink-0"></span>
                        <span className="w-24 font-medium truncate">{person.primaryName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* ★★★ スプリット・ボタンUI (無効化対応版) ★★★ */}
                        <div className={`flex rounded-md shadow-sm ${isMinusDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <button onClick={() => adjust(person.id, -1)} disabled={isMinusDisabled} className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-l-md font-semibold disabled:bg-gray-200 disabled:text-gray-400">-1</button>
                          <button onClick={() => adjust(person.id, -0.5)} disabled={isMinusDisabled} className="px-2 py-1 bg-gray-300 hover:bg-gray-400 border-l border-gray-400 text-white text-xs disabled:bg-gray-100 disabled:text-gray-400">-0.5</button>
                        </div>
                        <span className="w-10 text-center font-bold text-xl text-pink-500">{currentCount}</span>
                        <div className="flex rounded-md shadow-sm">
                          <button onClick={() => adjust(person.id, 0.5)} className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-white text-xs">+0.5</button>
                          <button onClick={() => adjust(person.id, 1)} className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-r-md border-l border-pink-600 font-semibold">+1</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={updateCheki}
                disabled={saveStatus !== 'idle'}
                className={`mt-4 w-full px-4 py-2 text-white font-semibold rounded-lg transition-all flex items-center justify-center
                  ${saveStatus === 'success' ? 'bg-green-500' : 'bg-pink-500 hover:bg-pink-600'}
                  ${saveStatus === 'saving' ? 'bg-pink-300 cursor-not-allowed' : ''}
                `}
              >
                {saveStatus === 'idle' && 'チェキ枚数を保存'}
                {saveStatus === 'saving' && '保存中...'}
                {saveStatus === 'success' && <span className="flex items-center gap-2">✔ 保存しました！</span>}
              </button>
            </InfoSection>
          )}
        </div>
      </div>
    </main>
  );
}
