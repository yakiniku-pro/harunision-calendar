import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface CsvImporterProps {
  groupId: string;
  onImported: () => void;
}

// ★ 場所(location)をパースする関数を定義
const parseTimeSlots = (timeString: string) => {
  if (!timeString) return [];
  return timeString.split('|').map((slot: string) => {
    const lastColonIndex = slot.lastIndexOf(':');
    let timePart = slot;
    let location = "";

    // コロンがあり、それが最初の文字でない場合、場所として分割
    if (lastColonIndex > 0) {
      timePart = slot.substring(0, lastColonIndex);
      location = slot.substring(lastColonIndex + 1);
    }
    
    const timeParts = timePart.split('-');
    if (timeParts.length !== 2) return null; // 不正な時間範囲

    return {
      startAt: timeParts[0],
      endAt: timeParts[1],
      location: location,
    };
  }).filter(Boolean); // nullを除外
};


export default function CsvImporter({ groupId, onImported }: CsvImporterProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("CSVファイルをインポートしますか？\n同じタイトルと日付のイベントが存在する場合、情報が上書きされます。")) {
      event.target.value = '';
      return;
    }
    
    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const eventsToAdd = results.data as any[];
        if (eventsToAdd.length === 0) {
          alert("CSVに登録可能なデータがありません。");
          setIsImporting(false);
          return;
        }

        try {
          const existingEventsQuery = query(collection(db, "events"), where("groupId", "==", groupId));
          const existingEventsSnapshot = await getDocs(existingEventsQuery);
          
          const existingEventsMap = new Map<string, { id: string }>();
          existingEventsSnapshot.forEach(doc => {
            const data = doc.data();
            const dateStr = format((data.date as Timestamp).toDate(), 'yyyy-MM-dd');
            const key = `${data.title}_${dateStr}`;
            existingEventsMap.set(key, { id: doc.id });
          });

          const batch = writeBatch(db);
          let createdCount = 0;
          let updatedCount = 0;

          eventsToAdd.forEach(event => {
            if (!event.title || !event.date) return;

            const prices = (event.prices || "").split('|').map((p: string) => {
              const parts = p.split(':'); if (parts.length !== 3) return null;
              return { tierName: parts[0], amount: Number(parts[1]) || 0, drinks: parts[2] };
            }).filter(Boolean);
            
            const ticketSales = (event.ticketSales || "").split('|').map((s: string) => {
              const parts = s.split(':');
              if (parts.length !== 4) return null;
              return {
                saleName: parts[0],
                startAt: parts[1] ? new Date(parts[1]) : null,
                endAt: parts[2] ? new Date(parts[2]) : null,
                url: parts[3] || ''
              };
            }).filter(Boolean);

            // ★ 新しいパース関数を使用
            const performanceTimes = parseTimeSlots(event.performanceTimes || "");
            const bonusEventTimes = parseTimeSlots(event.bonusEventTimes || "");

            const eventData = {
              groupId: groupId,
              title: event.title,
              date: new Date(event.date),
              venue: event.venue || "",
              openTime: event.openTime || "",
              startTime: event.startTime || "",
              prices: prices,
              womenOnlyArea: event.womenOnlyArea || '不明',
              photoPolicy: { still: event.photoPolicyStill || '不明', video: event.photoPolicyVideo || '不明' },
              ticketSales: ticketSales,
              performanceTimes: performanceTimes,
              bonusEventTimes: bonusEventTimes,
              attendanceBonus: event.attendanceBonus || "",
            };

            const key = `${event.title}_${event.date}`;
            const existingEvent = existingEventsMap.get(key);

            if (existingEvent) {
              const eventRef = doc(db, "events", existingEvent.id);
              batch.update(eventRef, { ...eventData, updatedAt: serverTimestamp() });
              updatedCount++;
            } else {
              const eventRef = doc(collection(db, "events"));
              batch.set(eventRef, { ...eventData, isNew: true, createdAt: serverTimestamp() });
              createdCount++;
            }
          });

          if (createdCount === 0 && updatedCount === 0) {
            alert("必須項目（title, date）が入力されている有効なデータがありませんでした。");
            setIsImporting(false);
            return;
          }

          await batch.commit();
          alert(`インポートが完了しました。\n新規作成: ${createdCount}件\n情報更新: ${updatedCount}件`);
          onImported();
        } catch (error) {
          console.error("一括登録/更新エラー:", error);
          alert("イベントの一括登録/更新に失敗しました。");
        } finally {
          setIsImporting(false);
          event.target.value = '';
        }
      },
      error: (error) => {
        console.error("CSV解析エラー:", error);
        alert("CSVファイルの解析に失敗しました。");
        setIsImporting(false);
      }
    });
  };

  return (
    <div>
      <label 
        htmlFor="csv-importer"
        className={`inline-block px-4 py-2 text-white rounded text-sm cursor-pointer ${
          !groupId || isImporting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-teal-500 hover:bg-teal-600'
        }`}
      >
        CSV一括登録/更新
      </label>
      <input
        type="file"
        id="csv-importer"
        accept=".csv"
        onChange={handleFileChange}
        disabled={!groupId || isImporting}
        className="hidden"
      />
      {isImporting && <p className="text-xs text-gray-600 mt-1">インポート処理中です...</p>}
    </div>
  );
}