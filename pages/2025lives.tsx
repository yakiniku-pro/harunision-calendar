import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { format, parse } from 'date-fns';
import { ja } from 'date-fns/locale';

interface LiveData {
  no: number;
  date: string;
  title: string;
  venue: string;
}

export default function Lives2025Archive() {
  const [lives, setLives] = useState<LiveData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCsv = async () => {
      try {
        const response = await fetch('/csv/2025lives.csv');
        const text = await response.text();
        
        const lines = text.split(/\r?\n/);
        const parsedData: LiveData[] = lines.slice(1)
          .filter(line => line.trim() !== '')
          .map(line => {
            // 改良版パースロジック：カンマでのみ分割し、前後の不要な空白や引用符を掃除する
            const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            
            if (parts.length < 4) return null;
            
            return {
              no: parseInt(parts[0]),
              date: parts[1],
              title: parts[2], // スペースが含まれていてもそのまま取得
              venue: parts[3]
            };
          })
          .filter((item): item is LiveData => item !== null);
        
        setLives(parsedData);
      } catch (error) {
        console.error('CSV Loading Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCsv();
  }, []);

  const { groupedLives, totalCount } = useMemo(() => {
    const groups: { [key: string]: LiveData[] } = {};
    const sorted = [...lives].sort((a, b) => a.no - b.no);
    sorted.forEach((live) => {
      try {
        const date = parse(live.date, 'yyyy/MM/dd', new Date());
        const monthDisplay = format(date, 'yyyy年 M月');
        if (!groups[monthDisplay]) groups[monthDisplay] = [];
        groups[monthDisplay].push(live);
      } catch (e) {}
    });
    return { groupedLives: groups, totalCount: lives.length };
  }, [lives]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (isLoading) return (
    <div className="fixed inset-0 bg-[#111] z-[9999] flex items-center justify-center text-white italic font-black text-2xl">LOADING...</div>
  );

  return (
    <div id="archive-page-root" className="min-h-screen bg-[#fafafa] font-sans text-slate-900 overflow-x-hidden relative z-[1000]">
      <Head>
        <title>2025 LIVES | ハルニシオン ARCHIVE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,900;1,900&display=swap');
        nav:not(.archive-side-nav), header:not(.archive-header), footer:not(.archive-footer), aside { 
          display: none !important; height: 0 !important; visibility: hidden !important;
        }
        body { font-family: 'Inter', sans-serif; background: #fafafa !important; margin: 0 !important; padding: 0 !important; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* --- サイドナビ --- */}
      <nav className="archive-side-nav fixed right-1 top-1/2 -translate-y-1/2 z-[1100] flex flex-col items-center gap-0.5 bg-black/85 backdrop-blur-2xl p-1 rounded-[1.5rem] border border-white/10 shadow-2xl md:right-4 md:p-2 md:gap-1">
        <span className="text-[6px] font-black text-pink-500 mb-1 uppercase tracking-tighter">Month</span>
        {Object.keys(groupedLives).map((month) => {
          const m = month.split(' ')[1].replace('月', '');
          return (
            <a key={month} href={`#month-${parseInt(m)}`} className="w-7 h-7 md:w-11 md:h-11 flex items-center justify-center text-[10px] md:text-[14px] font-black text-white hover:bg-pink-600 rounded-full transition-all">
              {m}
            </a>
          );
        })}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="archive-header relative min-h-screen md:min-h-[85vh] flex items-center justify-center bg-[#111] text-white overflow-hidden text-center">
        <div className="absolute inset-0">
           <img src="/images/lives/00.jpg" className="hidden md:block w-full h-full object-cover opacity-50 scale-105" style={{ objectPosition: 'center 30%' }} />
           <picture className="md:hidden">
              <source srcSet="/images/lives/00_sp.jpg" media="(max-width: 768px)" />
              <img src="/images/lives/00.jpg" className="w-full h-full object-cover opacity-50" style={{ objectPosition: 'center 30%' }} />
           </picture>
           <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-[#fafafa]"></div>
        </div>
        <div className="relative z-10 px-6 w-full max-w-4xl">
          <span className="inline-block px-5 py-2 bg-pink-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full mb-10 shadow-xl">Harunision Archive</span>
          <h1 className="text-7xl md:text-[11rem] font-black italic tracking-tighter mb-12 leading-[0.8] drop-shadow-2xl">
            <span className="text-pink-500 text-3xl md:text-5xl block not-italic font-bold tracking-[0.2em] mb-4 uppercase text-white">Harunision</span>
            2025 LIVES
          </h1>
          <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur-2xl p-10 md:p-14 rounded-[4rem] border border-white/20 shadow-2xl">
              <p className="text-[11px] font-bold text-pink-300 uppercase tracking-widest mb-2 text-white/70">Annual Performance Count</p>
              <p className="text-7xl md:text-8xl font-black text-white leading-none tabular-nums">
                {totalCount}<span className="text-3xl ml-3 text-pink-500 font-bold italic uppercase tracking-normal">SHOWS</span>
              </p>
          </div>
        </div>
      </header>

      {/* --- LIST SECTION --- */}
      <main className="max-w-4xl mx-auto px-4 py-24 relative z-20">
        {Object.entries(groupedLives).map(([monthName, monthLives]) => {
          const mNum = monthLives[0].date.split('/')[1];
          return (
            <section key={monthName} id={`month-${parseInt(mNum)}`} className="mb-28 scroll-mt-20">
              <div className="relative h-56 md:h-80 rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-white/10 text-center">
                <div className="absolute inset-0 bg-slate-300"></div>
                <img src={`/images/lives/${mNum}.jpg`} alt={monthName} className="absolute inset-0 w-full h-full object-cover brightness-[0.45]" onError={(e) => (e.currentTarget.style.opacity = '0')} />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
                  <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-4 drop-shadow-xl">{monthName}</h2>
                  <div className="px-8 py-2 bg-pink-600/90 backdrop-blur shadow-lg rounded-full">
                    <p className="text-[12px] font-black uppercase tracking-[0.3em]">{monthLives.length} SHOWS</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {monthLives.map((live) => (
                  <div key={live.no} className="flex items-start p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm group">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 flex-shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-all mt-1 shadow-inner">
                      #{String(live.no).padStart(3, '0')}
                    </div>
                    
                    <div className="ml-5 md:ml-8 flex-1 min-w-0">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1.5">
                          {format(parse(live.date, 'yyyy/MM/dd', new Date()), 'yyyy.MM.dd (E)', { locale: ja })}
                        </span>
                        
                        {/* 修正点：スペースを含めて全文表示される設定 */}
                        <h3 className="font-bold text-slate-900 text-[16px] md:text-[22px] leading-[1.3] break-words whitespace-normal group-hover:text-pink-600 transition-colors">
                          {live.title}
                        </h3>
                      </div>
                      
                      <p className="text-[10px] md:text-[13px] text-slate-400 font-bold uppercase tracking-widest mt-3 flex items-center border-t border-slate-50 pt-2">
                        <span className="mr-2 text-pink-400 font-black shrink-0">@</span> 
                        <span className="break-words whitespace-normal">{live.venue}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* --- FOOTER & TOP BUTTON --- */}
      <footer className="archive-footer bg-[#111] py-32 px-6 text-center">
        <button onClick={scrollToTop} className="mb-20 bg-white/10 hover:bg-pink-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all border border-white/10 group shadow-3xl">
          <svg className="w-10 h-10 group-hover:-translate-y-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
        <p className="text-[12px] font-black tracking-[1em] text-slate-500 uppercase mb-3">Harunision Archive</p>
        <p className="text-[10px] text-slate-700 font-bold tracking-widest uppercase">2025</p>
      </footer>
    </div>
  );
}