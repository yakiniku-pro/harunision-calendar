import { useState } from 'react';
import Papa from 'papaparse';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface CsvImporterProps {
  groupId: string;
  onImported: () => void; // インポート完了を親に通知する関数
}

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
          // ★ 1. まず、選択されたグループの既存イベントをすべて取得する
          const existingEventsQuery = query(collection(db, "events"), where("groupId", "==", groupId));
          const existingEventsSnapshot = await getDocs(existingEventsQuery);
          
          // ★ 2. 高速で照合するためのマップを作成（キー: 'タイトル_日付'）
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

            // --- CSVから詳細情報をパースするロジック (変更なし) ---
            const prices = (event.prices || "").split('|').map((p: string) => {
              const parts = p.split(':'); if (parts.length !== 3) return null;
              return { tierName: parts[0], amount: Number(parts[1]) || 0, drinks: parts[2] };
            }).filter(Boolean);
            const performanceTimes = (event.performanceTimes || "").split('|').map((t: string) => {
              const parts = t.split('-'); if (parts.length !== 2) return null;
              return { startAt: parts[0], endAt: parts[1] };
            }).filter(Boolean);
            const bonusEventTimes = (event.bonusEventTimes || "").split('|').map((t: string) => {
              const parts = t.split('-'); if (parts.length !== 2) return null;
              return { startAt: parts[0], endAt: parts[1] };
            }).filter(Boolean);
            
            // --- 登録/更新するデータを作成 ---
            const eventData = {
              groupId: groupId, title: event.title, date: new Date(event.date),
              venue: event.venue || "", openTime: event.openTime || "", startTime: event.startTime || "",
              prices: prices, womenOnlyArea: event.womenOnlyArea || '不明',
              photoPolicy: { still: event.photoPolicyStill || '不明', video: event.photoPolicyVideo || '不明' },
              ticketUrl: event.ticketUrl || "", ticketSales: {},
              performanceTimes: performanceTimes, bonusEventTimes: bonusEventTimes,
              attendanceBonus: event.attendanceBonus || "",
            };

            // ★ 3. 既存イベントがあるかチェック
            const key = `${event.title}_${event.date}`;
            const existingEvent = existingEventsMap.get(key);

            if (existingEvent) {
              // ★ 4. 存在する場合：更新処理をバッチに追加
              const eventRef = doc(db, "events", existingEvent.id);
              batch.update(eventRef, { ...eventData, updatedAt: serverTimestamp() });
              updatedCount++;
            } else {
              // ★ 5. 存在しない場合：新規作成処理をバッチに追加
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
        className={`inline-block px-4 py-2 bg-teal-500 text-white rounded text-sm cursor-pointer ${!groupId || isImporting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-teal-600'}`}
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
