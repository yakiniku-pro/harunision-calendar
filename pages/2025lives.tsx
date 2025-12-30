import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { format, parse } from 'date-fns';
import { ja } from 'date-fns/locale';

// 型定義
interface LiveData {
  no: number;
  date: string;
  title: string;
  venue: string;
}

export default function Lives2025Archive() {
  const [lives, setLives] = useState<LiveData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CSVの読み込み処理
  useEffect(() => {
    const fetchCsv = async () => {
      try {
        const response = await fetch('/csv/2025lives.csv');
        const text = await response.text();
        
        // 簡単なCSVパース処理
        const lines = text.split('\n');
        const data: LiveData[] = lines.slice(1) // ヘッダーを飛ばす
          .filter(line => line.trim() !== '')
          .map(line => {
            const parts = line.split(',');
            return {
              no: parseInt(parts[0]),
              date: parts[1],
              title: parts[2]?.replace(/"/g, ''), // 引用符の除去
              venue: parts[3]?.replace(/"/g, '')
            };
          });
        
        setLives(data);
      } catch (error) {
        console.error('CSVの読み込みに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCsv();
  }, []);

  // 月ごとにグループ化
  const { groupedLives, totalCount } = useMemo(() => {
    const groups: { [key: string]: LiveData[] } = {};
    const sorted = [...lives].sort((a, b) => a.no - b.no);
    
    sorted.forEach((live) => {
      try {
        const date = parse(live.date, 'yyyy/MM/dd', new Date());
        const monthDisplay = format(date, 'yyyy年 M月');
        if (!groups[monthDisplay]) groups[monthDisplay] = [];
        groups[monthDisplay].push(live);
      } catch (e) {
        console.error("Date parse error:", live);
      }
    });
    return { groupedLives: groups, totalCount: lives.length };
  }, [lives]);

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black italic">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-900 leading-relaxed overflow-x-hidden">
      <Head>
        <title>2025 LIVES ARCHIVE | ハルニシオン</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* --- 年間サマリ (Hero) --- */}
<header className="relative py-32 px-6 bg-[#111111] text-white overflow-hidden text-center">
  <div className="absolute inset-0">
     <img 
        src="/images/lives/00.jpg" 
        className="w-full h-full object-cover grayscale opacity-30 scale-105" 
        onError={(e) => (e.currentTarget.style.display = 'none')}
     />
     <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#111111]"></div>
  </div>
  
  <div className="relative z-10 max-w-4xl mx-auto">
    {/* HARUNISHIONの文字をタイトルの上に配置 */}
    <span className="inline-block px-5 py-1.5 bg-pink-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full mb-10 shadow-xl">
      Harunishion Archive
    </span>

    <h1 className="text-7xl md:text-[11rem] font-black italic tracking-tighter mb-12 leading-[0.85]">
      <span className="text-pink-500 text-3xl md:text-5xl block not-italic font-bold tracking-[0.2em] mb-4 uppercase">Harunishion</span>
      2025<br/><span className="text-pink-500 text-5xl md:text-8xl uppercase not-italic font-black tracking-normal">Lives</span>
    </h1>
    
    <div className="inline-flex flex-col items-center bg-white/5 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-2xl">
        <p className="text-[11px] font-bold text-pink-400 uppercase tracking-[0.3em] mb-3">Annual Stage Count</p>
        <p className="text-7xl md:text-8xl font-black text-white leading-none">
          {totalCount}<span className="text-2xl md:text-3xl ml-3 opacity-40 font-bold italic lowercase text-pink-500">stages</span>
        </p>
    </div>
  </div>
</header>

      {/* --- 月別セクション --- */}
      <main className="max-w-5xl mx-auto px-6 py-24">
        {Object.entries(groupedLives).map(([monthName, monthLives]) => {
          // 月の番号（02, 03...）を画像ファイル名に使用
          const firstLiveDate = parse(monthLives[0].date, 'yyyy/MM/dd', new Date());
          const monthNum = format(firstLiveDate, 'MM');
          
          return (
            <section key={monthName} className="mb-32">
              {/* 月間ヘッダーカード */}
              <div className="relative h-64 md:h-96 rounded-[3rem] overflow-hidden mb-12 shadow-2xl group border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-500"></div>
                <img 
                  src={`/images/lives/${monthNum}.jpg`} 
                  alt={monthName}
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-1000"
                  onError={(e) => (e.currentTarget.style.opacity = '0')} 
                />
                
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8">
                  <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter drop-shadow-2xl mb-6">
                    {monthName}
                  </h2>
                  <div className="px-8 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-inner">
                    <p className="text-xs font-black tracking-widest uppercase">
                      Monthly Total: <span className="text-pink-400 text-2xl ml-2">{monthLives.length}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* ライブリスト（グリッド） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {monthLives.map((live) => (
                  <div 
                    key={live.no} 
                    className="flex items-center p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-pink-200 transition-all duration-500 group"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-pink-500 transition-all duration-500 group-hover:rotate-6">
                      <span className="text-xs font-black font-mono text-slate-300 group-hover:text-white">
                        #{String(live.no).padStart(3, '0')}
                      </span>
                    </div>

                    <div className="ml-6">
                      <div className="flex flex-col mb-1">
                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-tighter mb-1">
                          {format(parse(live.date, 'yyyy/MM/dd', new Date()), 'yyyy.MM.dd (E)', { locale: ja })}
                        </span>
                        <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {live.title}
                        </h3>
                      </div>
                      <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <svg className="w-3 h-3 mr-1.5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {live.venue}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="bg-[#1a1c1e] text-slate-700 py-32 text-center border-t border-white/5">
        <p className="text-[10px] font-black tracking-[0.8em] uppercase mb-4 text-slate-500">Harunision 2025 Archive</p>
        <p className="text-[9px] opacity-30">All data loaded from static CSV.</p>
      </footer>

      {/* ページ独自のグローバルスタイル（共通ヘッダーを隠すための保険） */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,900;1,900&display=swap');
        body { 
          font-family: 'Inter', sans-serif;
          background-color: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        /* もし共通Layoutコンポーネントがヘッダーを出してしまう場合の対策 */
        nav, header:not(.relative), footer:not(.bg-slate-900) {
          display: none !important;
        }
      `}</style>
    </div>
  );
}