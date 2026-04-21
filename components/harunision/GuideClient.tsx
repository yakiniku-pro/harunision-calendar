"use client";

import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowUp, faUsers, faMusic, faTicketAlt, faVolumeUp, faStar, faCompactDisc, faGift, faDesktop, faDoorOpen, faCameraRetro, faPeopleArrows, faHandSparkles, faInfoCircle, faShoePrints, faCashRegister, faHandshake, faCamera, faUserFriends, faComments, faExclamationTriangle, faMobileAlt, faIdCard, faDoorClosed, faStarHalfAlt, faSeedling, faPenFancy } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';

// --- データ定義 ---
const membersData = [
  { name: '馬場 彩華', englishName: 'Sayaka Baba', color: '#fdfd96', nickname: 'さやまる', x_account: '@syk_HNS', x_url: 'https://x.com/syk_HNS', description: '晴れやかな笑顔がトレードマーク。張りのある声とキレのあるダンスに注目。', imgSrc: '../sayaka.webp' },
  { name: '芹沢 心色', englishName: 'Kokoro Serisawa', color: '#ff6961', nickname: 'こころ', x_account: '@cocoro_HNS', x_url: 'https://x.com/cocoro_HNS', description: '感情を揺さぶる透明でパワフルな歌声が特徴。人懐っこいグループの末っ子。', imgSrc: '../kokoro.webp' },
  { name: '来海 とい', englishName: 'Toi Kurumi', color: '#77dd77', nickname: 'といちゃん', x_account: '@toi_HNS', x_url: 'https://x.com/toi_HNS', description: '人を惹き込む笑顔ながら、ステージ上でのパフォーマンスは圧倒的。', imgSrc: '../toi.webp' },
  { name: '長浜 瑠花', englishName: 'Ruka Nagahama', color: '#d7bde2', nickname: 'るかちゃん', x_account: '@ruka_HNS', x_url: 'https://x.com/ruka_HNS', description: '気品漂うたたずまいに繊細で透明な歌声を持つ。しかし実際に話してみると…', imgSrc: '../ruka.webp' },
  { name: '村瀬 ゆうな', englishName: 'Yuna Murase', color: '#f8b4b4', nickname: 'うな', x_account: '@yuuna_HNS', x_url: 'https://x.com/yuuna_HNS', description: '大人びた雰囲気を持ち、饒舌で多才。甘い歌声が楽曲に華を添える。', imgSrc: '../yuna.webp' },
  { name: '福間 彩音', englishName: 'Ayane Fukuma', color: '#a0d8ef', nickname: 'あち', x_account: '@ayane_HNS', x_url: 'https://x.com/ayane_HNS', description: '透明感あるビジュアルとは裏腹に、感情の乗った力強いパフォーマンスが魅力。', imgSrc: '../ayane.webp' },
];

const musicData = [
  {
    category: '【✨ 感動的な曲が好き】',
    songs: [
      { title: 'アオバ', url: 'https://www.youtube.com/watch?v=m3WcrkHqAtQ', thumbnail: 'https://i.ytimg.com/vi/m3WcrkHqAtQ/mqdefault.jpg' },
      { title: 'ただ、君に咲く。', url: 'https://www.youtube.com/watch?v=db3LSL5TfbU', thumbnail: 'https://i.ytimg.com/vi/db3LSL5TfbU/mqdefault.jpg' },
      { title: 'ドラマチック', url: 'https://www.youtube.com/watch?v=Kr-FkKdl0oM', thumbnail: 'https://i.ytimg.com/vi/Kr-FkKdl0oM/mqdefault.jpg' },
    ],
  },
  {
    category: '【🔥 盛り上がる曲が好き】',
    songs: [
      { title: 'gradation', url: 'https://www.youtube.com/watch?v=WLzX5eGR_7s', thumbnail: 'https://i.ytimg.com/vi/WLzX5eGR_7s/mqdefault.jpg' },
      { title: '音速少女', url: 'https://www.youtube.com/watch?v=eg6qkejk3MQ', thumbnail: 'https://i.ytimg.com/vi/eg6qkejk3MQ/mqdefault.jpg' },
      { title: 'Luv it !', url: 'https://www.youtube.com/watch?v=y9CDl21AHe8', thumbnail: 'https://i.ytimg.com/vi/y9CDl21AHe8/mqdefault.jpg' },
    ],
  },
  {
    category: '【🎉 楽しい曲が好き】',
    songs: [
      { title: "Jumpin'", url: 'https://www.youtube.com/watch?v=UfUqdia0i7I', thumbnail: 'https://i.ytimg.com/vi/UfUqdia0i7I/mqdefault.jpg' },
      { title: 'アノソラヘ', url: 'https://www.youtube.com/watch?v=ky-MCAKDFFg', thumbnail: 'https://i.ytimg.com/vi/ky-MCAKDFFg/mqdefault.jpg' },
      { title: '流れ星はどこから来るのか', url: 'https://www.youtube.com/watch?v=2YmNYjqujs4', thumbnail: 'https://i.ytimg.com/vi/2YmNYjqujs4/mqdefault.jpg' },
    ],
  },
  {
    category: '【💖 アイドルらしい曲が好き】',
    songs: [
      { title: 'ハルニシオン', url: 'https://www.youtube.com/watch?v=EqB4Mx4-lxg', thumbnail: 'https://i.ytimg.com/vi/EqB4Mx4-lxg/mqdefault.jpg' },
      { title: '白春', url: 'https://www.youtube.com/watch?v=ATcZfX0G6R0', thumbnail: 'https://i.ytimg.com/vi/ATcZfX0G6R0/mqdefault.jpg' },
      { title: 'ツインレイ', url: 'https://www.youtube.com/watch?v=2qKTTZQFzK8', thumbnail: 'https://i.ytimg.com/vi/2qKTTZQFzK8/mqdefault.jpg' },
    ],
  },
  {
    category: '【🌙 哀愁のある曲が好き】',
    songs: [
      { title: '仮初花火', url: 'https://www.youtube.com/watch?v=CgiHwiqNG1U', thumbnail: 'https://i.ytimg.com/vi/CgiHwiqNG1U/mqdefault.jpg' },
      { title: 'FloweBird', url: 'https://www.youtube.com/watch?v=lgsbJF94n6c', thumbnail: 'https://i.ytimg.com/vi/lgsbJF94n6c/mqdefault.jpg' },
      { title: '何だったんだろう', url: 'https://www.youtube.com/watch?v=ZJPXHzMbknk', thumbnail: 'https://i.ytimg.com/vi/ZJPXHzMbknk/mqdefault.jpg' },
    ],
  },
  {
    category: '【🌌 世界観の出ている曲が好き】',
    songs: [
      { title: '夜明けを合図にして', url: 'https://www.youtube.com/watch?v=v1SBoR8b8yY', thumbnail: 'https://i.ytimg.com/vi/v1SBoR8b8yY/mqdefault.jpg' },
      { title: '微かなルクス', url: 'https://www.youtube.com/watch?v=U4wHNKI3xzI', thumbnail: 'https://i.ytimg.com/vi/U4wHNKI3xzI/mqdefault.jpg' },
      { title: '僕の知らない僕に変えた', url: 'https://www.youtube.com/watch?v=hWH3qP0tuGE', thumbnail: 'https://i.ytimg.com/vi/hWH3qP0tuGE/mqdefault.jpg' },
    ],
  },
];

const noteItems = [
    "特典会に参加する直前に、大きな荷物は指定の場所に置いたり、スタッフに預けましょう。",
    "安全のため、メンバーの身体に直接触れる行為は禁止です。",
    "一度に出せる特典券は基本2枚までです。たくさんある場合は、再度並び直しましょう。",
    "メンバーが不快に感じるような発言や行動は絶対にやめましょう。",
    "チェキの撮り直しは、明らかに撮影に失敗している場合(目をつぶってしまった等)のみ可能です。",
    "写メ撮影は、他撮り(スタッフによる撮影)のみとなります。自撮りでの撮影はできません。"
];

export default function GuideClient() {
  const tocMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    scrollRevealElements.forEach(el => observer.observe(el));
    
    const tocMenu = tocMenuRef.current;
    let lastScrollTop = 0;
    const handleScroll = () => {
      if (!tocMenu) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const tocHeight = tocMenu.offsetHeight;
      if (scrollTop > 500) { 
        if (scrollTop > lastScrollTop) {
          tocMenu.style.top = `-${tocHeight + 20}px`;
        } else {
          tocMenu.style.top = '1rem';
        }
      } else {
        tocMenu.style.top = '1rem';
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollRevealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-4xl">
      <section className="infographic-section text-center -mt-1 mb-10 scroll-reveal">
        <h3 className="font-bold text-amber-800 mb-4">公式の最新情報はこちら</h3>
        <div className="flex justify-center gap-4 flex-row">
          <a href="https://harunision-official.boosty.app/" target="_blank" rel="noopener noreferrer" className="flex-1 p-3 bg-sky-200 text-slate-700 rounded-xl hover:bg-sky-100 transition font-bold text-center shadow-md border border-white/70">
            <FontAwesomeIcon icon={faHome} className="mr-2" />公式HP
          </a>
          <a href="https://x.com/info_hns" target="_blank" rel="noopener noreferrer" className="flex-1 p-3 bg-white/90 text-slate-700 rounded-xl hover:bg-slate-50 transition font-bold text-center shadow-md border border-sky-100">
            <FontAwesomeIcon icon={faTwitter} className="mr-2" />公式X
          </a>
        </div>
      </section>

      <nav ref={tocMenuRef} id="toc-menu" className="toc sticky top-4 z-10 p-4 rounded-2xl shadow-lg mb-8">
        <h2 className="font-bold text-center text-amber-800 mb-3">MENU</h2>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <a href="#page-top" className="p-2 bg-white/90 text-slate-700 rounded-xl hover:bg-sky-50 border border-sky-100"><FontAwesomeIcon icon={faArrowUp} className="mr-2" />ﾄｯﾌﾟへ</a>
          <a href="#music" className="p-2 bg-white/90 text-slate-700 rounded-xl hover:bg-sky-50 border border-sky-100"><FontAwesomeIcon icon={faMusic} className="mr-2" />楽曲</a>
          <a href="#members" className="p-2 bg-white/90 text-slate-700 rounded-xl hover:bg-sky-50 border border-sky-100"><FontAwesomeIcon icon={faUsers} className="mr-2" />ﾒﾝﾊﾞｰ</a>
          <a href="#tickets" className="p-2 bg-white/90 text-slate-700 rounded-xl hover:bg-sky-50 border border-sky-100"><FontAwesomeIcon icon={faTicketAlt} className="mr-2" />ﾁｹｯﾄ</a>
          <a href="#live-rules" className="p-2 bg-white/90 text-slate-700 rounded-xl hover:bg-sky-50 border border-sky-100"><FontAwesomeIcon icon={faVolumeUp} className="mr-2" />ﾗｲﾌﾞ</a>
          <a href="#benefits" className="p-2 bg-white/90 text-slate-700 rounded-xl hover:bg-sky-50 border border-sky-100"><FontAwesomeIcon icon={faStar} className="mr-2" />特典会</a>
          <a href="#release-event" className="p-2 bg-white/90 text-slate-700 rounded-xl hover:bg-sky-50 border border-sky-100"><FontAwesomeIcon icon={faCompactDisc} className="mr-2" />ﾘﾘｲﾍﾞ</a>
          <a href="#more-info" className="p-2 bg-white/90 text-slate-700 rounded-xl hover:bg-sky-50 border border-sky-100"><FontAwesomeIcon icon={faGift} className="mr-2" />その他</a>
        </div>
      </nav>

      {/* ★★★ ここからが復元されたコンテンツ ★★★ */}
      <section id="music" className="infographic-section scroll-reveal">
        <h2 className="infographic-title"><FontAwesomeIcon icon={faMusic} />楽曲を聴いてみよう</h2>
        <p className="text-center text-gray-700 mb-8">魅力あふれる曲ばかり！<br/>あなたの好みに合う曲はどれ？ </p>
        <div className="space-y-6">
          {musicData.map((category) => (
            <div key={category.category}>
              <h3 className="font-bold text-lg text-amber-700 mb-3">{category.category}</h3>
              <div className="flex gap-4 flex-wrap">
              {category.songs.map(song => (
                <a key={song.title} href={song.url} target="_blank" rel="noopener noreferrer" className="text-center group">
                <div className="relative">
                  {song.thumbnail ? (
                    <img src={song.thumbnail} alt={`${song.title}のサムネイル`} className="youtube-thumbnail group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="youtube-thumbnail flex items-center justify-center bg-amber-50 text-amber-800 text-sm font-semibold px-4 text-center">
                      {song.title}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center mt-1"><FontAwesomeIcon icon={faYoutube} className="text-red-500 mr-1.5" /><span className="text-sm font-semibold group-hover:text-amber-700">{song.title}</span></div>
                </a>
              ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="members" className="infographic-section scroll-reveal">
        <h2 className="infographic-title"><FontAwesomeIcon icon={faUsers} />メンバー紹介</h2>
        <p className="text-center text-gray-700 mb-8">気になるメンバーを見つけたらフォローしよう</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {membersData.map((member) => (
            <div key={member.name} className="member-card">
              <img src={member.imgSrc} alt={`${member.name}の画像`} className="member-img" style={{ borderColor: member.color }} />
              <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{member.englishName}</p>
              <div className="text-left text-sm space-y-1">
                <p><span className="member-color" style={{ backgroundColor: member.color }}></span><strong>担当カラー:</strong> {member.color === '#fdfd96' ? 'イエロー' : member.color === '#ff6961' ? 'レッド' : member.color === '#77dd77' ? 'グリーン' : member.color === '#d7bde2' ? 'パープル' : member.color === '#f8b4b4' ? 'ピンク' : '水色'}</p>
                <p><strong>愛称:</strong> {member.nickname}</p>
                <p><a href={member.x_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><FontAwesomeIcon icon={faTwitter} className="mr-1" />{member.x_account}</a></p>
              </div>
              <p className="text-left text-sm mt-2 p-2 bg-gray-50 rounded">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tickets" className="infographic-section scroll-reveal">
        <h2 className="infographic-title"><FontAwesomeIcon icon={faTicketAlt} />チケットを入手</h2>
        <p className="text-center text-gray-700 mb-8">直接見てみたくなったらチケットを購入！<br/>ライブ日程や詳細の確認は↓こちらから
        <div className="mt-3"><a href="https://harunision-calendar.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-block p-3 bg-gradient-to-r from-sky-200 to-amber-100 text-slate-700 rounded-xl hover:from-sky-100 hover:to-amber-50 transition font-bold text-center shadow-md border border-white/80">カレンダーをチェック</a></div></p>
        <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center p-6 bg-gradient-to-b from-white to-sky-50 rounded-2xl border border-sky-100 shadow-sm"><FontAwesomeIcon icon={faDesktop} className="text-5xl text-amber-500 mb-4" /><h3 className="text-xl font-bold mb-2">① 事前予約</h3><p className="text-gray-700">多くのライブは各種チケット販売サイトで事前予約ができます。ハルニシオン公式X(旧Twitter)の告知から予約ページに飛んで購入しましょう。</p></div>
            <div className="text-center p-6 bg-gradient-to-b from-white to-sky-50 rounded-2xl border border-sky-100 shadow-sm"><FontAwesomeIcon icon={faDoorOpen} className="text-5xl text-amber-500 mb-4" /><h3 className="text-xl font-bold mb-2">② 当日券</h3><p className="text-gray-700">事前予約で完売していなければ、当日券が販売されることがあります。販売の有無は当日発表されることも。料金は事前予約より1,000円程高くなるのが一般的です。</p></div>
        </div>
      </section>

      <section id="live-rules" className="infographic-section scroll-reveal">
        <h2 className="infographic-title"><FontAwesomeIcon icon={faVolumeUp} />ライブを楽しもう</h2>
        <div className="text-center mb-8"><p>ライブにはいくつかのルールがあります。みんなで守って最高の空間を作りましょう！</p></div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-4"><div className="bg-red-100 text-red-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"><FontAwesomeIcon icon={faCameraRetro} /></div><h3 className="font-bold text-lg">撮影・録音は基本禁止</h3><p className="text-sm text-gray-600">ライブ中の写真撮影、動画撮影、録音は基本的にすべて禁止です。目に焼き付けて、心で感じてください！</p></div>
            <div className="p-4"><div className="bg-amber-100 text-amber-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"><FontAwesomeIcon icon={faPeopleArrows} /></div><h3 className="font-bold text-lg">周りの人への配慮</h3><p className="text-sm text-gray-600">過度な割り込みや、周りの人の視界を遮るような大きな動きは避けましょう。譲り合いの気持ちが大切です。</p></div>
            <div className="p-4"><div className="bg-green-100 text-green-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"><FontAwesomeIcon icon={faHandSparkles} /></div><h3 className="font-bold text-lg">全力で楽しむ！</h3><p className="text-sm text-gray-600">一番大切なルールです！手拍子、振りコピ、声出し(可能な場合)でメンバーと一緒にライブを盛り上げましょう！</p></div>
        </div>
        <div className="highlight-box"><h4 className="font-bold text-lg mb-2"><FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> 撮影可能なイベントについて</h4><p>イベントによっては、一部の曲や時間帯で写真・動画撮影が可能になる場合があります。その際は、以下の点を守って楽しみましょう。</p><ul className="list-disc list-inside text-sm mt-2 space-y-1"><li>撮影可能なタイミングはメンバーやスタッフの案内に従ってください。</li><li>撮影時に他のお客様の観覧の妨げにならないよう、配慮をお願いします。（頭より高くカメラを上げない等）</li><li>事前に公式からルールが案内されている場合は、必ず一読しましょう。</li></ul></div>
      </section>

      <section id="benefits" className="infographic-section scroll-reveal">
        <h2 className="infographic-title"><FontAwesomeIcon icon={faStar} />特典会に参加しよう</h2>
        <p className="text-center text-gray-700 mb-8">ライブの後は、メンバーと直接交流できる「特典会」があります。参加には特典券が必要です。</p>
        <div className="space-y-8">
          <div><h3 className="font-bold text-lg text-amber-800 bg-amber-100 p-3 rounded-t-lg border-b-2 border-amber-200">トークあり券 <span className="text-sm font-normal">(サイン＋コメントありチェキ)</span></h3><div className="overflow-x-auto"><table className="table-custom"><thead><tr><th className="w-1/4 sm:w-1/5">価格</th><th>内容説明</th></tr></thead><tbody><tr><td>2,000円</td><td>好きなメンバーと2ショットチェキを撮影し、その場でチェキにサインとコメント、日付、名前を入れてもらえます。お話できる時間も一番長いです。<strong>※写メは選択できません</strong></td></tr></tbody></table></div></div>
          <div><h3 className="font-bold text-lg text-amber-800 bg-amber-100 p-3 rounded-t-lg border-b-2 border-amber-200">トークなし券 <span className="text-sm font-normal">(サインなしチェキ or 写メ)</span></h3><div className="overflow-x-auto"><table className="table-custom"><thead><tr><th className="w-1/4 sm:w-1/5">価格</th><th>内容説明</th></tr></thead><tbody><tr><td>1,000円</td><td>好きなメンバーと2ショットチェキ(サインなし)または写メを撮影します。<strong>※撮影後のお話はできません</strong></td></tr></tbody></table></div></div>
        </div>
        <div className="highlight-box"><h4 className="font-bold text-lg mb-2"><FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> 備考＆注意点</h4><ul className="list-disc list-inside text-sm mt-2 space-y-1"><li><strong>「トークなし券」2枚</strong>で、<strong>「トークあり券」1枚</strong>と同じ内容（サインありチェキ＋トーク）に変更できます。</li><li>特典券の有効期限は、購入した月の末日までです。期間内であれば、次のライブで使えます！</li></ul></div>
      </section>

      <section className="infographic-section scroll-reveal">
        <h2 className="infographic-title"><FontAwesomeIcon icon={faShoePrints} />特典会の流れ</h2>
        <div className="flow-chart">
            <div className="flow-step"><div className="icon"><FontAwesomeIcon icon={faCashRegister} /></div><div className="text"><h4 className="font-bold">① 物販ブースに並ぶ</h4><p>ライブ終了後、会場内に設置される物販ブースに並びます。</p></div></div>
            <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={180} /></div>
            <div className="flow-step"><div className="icon"><FontAwesomeIcon icon={faTicketAlt} /></div><div className="text"><h4 className="font-bold">② 特典券を購入する</h4><p>スタッフに希望の特典券の種類と枚数を伝えて購入します。</p></div></div>
            <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={180} /></div>
            <div className="flow-step"><div className="icon"><FontAwesomeIcon icon={faUsers} /></div><div className="text"><h4 className="font-bold">③ メンバーの列に並ぶ</h4><p>お目当てのメンバーの列に並びます。</p></div></div>
            <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={180} /></div>
             <div className="flow-step"><div className="icon"><FontAwesomeIcon icon={faHandshake} /></div><div className="text"><h4 className="font-bold">④ 次の人が来たらカードを渡す</h4><p>自分の後ろに人が来たら、「最後尾こちらです」とカードを渡してあげましょう。</p></div></div>
            <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={180} /></div>
            <div className="flow-step"><div className="icon"><FontAwesomeIcon icon={faCamera} /></div><div className="text"><h4 className="font-bold">⑤ 撮影スタッフに希望を伝える</h4><p>自分の番が来たら、特典券を渡し、「ソロか2ショットか」「チェキか写メか」を伝えます。</p></div></div>
            <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={180} /></div>
            <div className="flow-step"><div className="icon"><FontAwesomeIcon icon={faUserFriends} /></div><div className="text"><h4 className="font-bold">⑥ メンバーの隣で撮影！</h4><p>スタッフの案内に従ってメンバーの隣に立ち、ポーズをとって撮影！</p></div></div>
            <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={180} /></div>
            <div className="flow-step"><div className="icon"><FontAwesomeIcon icon={faComments} /></div><div className="text"><h4 className="font-bold">⑦ メンバーとお話しタイム</h4><p>撮影後、メンバーの前に移動してお話します。時間が来たらスタッフに促されるので、感謝を伝えて終了です。</p></div></div>
        </div>
      </section>

      <section className="infographic-section scroll-reveal">
        <h2 className="infographic-title"><FontAwesomeIcon icon={faExclamationTriangle} />特典会の注意事項</h2>
        <ul className="note-list space-y-3 text-gray-800">
          {noteItems.map((item, index) => (<li key={index}><FontAwesomeIcon icon={faInfoCircle} /><span>{item}</span></li>))}
        </ul>
      </section>

      <section id="release-event" className="infographic-section gradient-bg rounded-2xl p-8 scroll-reveal">
         <h2 className="infographic-title text-white"><FontAwesomeIcon icon={faCompactDisc} />リリースイベント</h2>
         <div className="text-center"><p className="mb-4">デジタルシングルの発売に伴うリリイベは、通常のライブとルールが異なります。</p>
            <div className="bg-white/20 p-6 rounded-xl space-y-4 text-left">
                <div className="flex items-start"><FontAwesomeIcon icon={faTicketAlt} className="text-2xl mt-1 mr-4" /><div><h4 className="font-bold">観覧は基本無料！</h4><p className="text-sm">「miim」アプリで対象商品を購入すると、整理番号順に優先入場ができます。</p></div></div>
                <div className="flex items-start"><FontAwesomeIcon icon={faMobileAlt} className="text-2xl mt-1 mr-4" /><div><h4 className="font-bold">特典会も「miim」アプリで</h4><p className="text-sm">特典会参加も「miim」アプリを使用します。</p></div></div>
                <div className="flex items-start"><FontAwesomeIcon icon={faIdCard} className="text-2xl mt-1 mr-4" /><div><h4 className="font-bold">トレカ交換</h4><p className="text-sm">購入金額に応じて、限定トレカがもらえます。</p></div></div>
                <div className="flex items-start"><FontAwesomeIcon icon={faHandSparkles} className="text-2xl mt-1 mr-4" /><div><h4 className="font-bold">ハイタッチ会に参加しよう！<span className="ml-2 inline-block bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">参加無料</span></h4><p className="text-sm">ライブ終了後には、メンバー全員とハイタッチできるイベントが開催されることも！</p></div></div>
            </div>
            <p className="mt-4 text-sm">詳しい方法は、リリイベの告知をよく確認してください。</p>
         </div>
      </section>

      <section id="more-info" className="infographic-section scroll-reveal">
        <h2 className="infographic-title"><FontAwesomeIcon icon={faGift} />もっと楽しむには？</h2>
        <div className="space-y-8">
            <div><h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faYoutube} className="mr-2" />Youtube番組</h3><div className="bg-gray-100 p-4 rounded-lg mt-2 flex flex-col sm:flex-row items-center gap-4"><a href="https://www.youtube.com/@harunision" target="_blank" rel="noopener noreferrer" className="flex-shrink-0"><img src="https://i.ytimg.com/vi/Ve5zhtWV2-g/mqdefault.jpg" alt="咲け！ハルニシオンのサムネイル" className="youtube-thumbnail" /></a><div className="text-center sm:text-left"><a href="https://www.youtube.com/@harunision" target="_blank" rel="noopener noreferrer" className="font-bold text-amber-800 hover:underline text-lg">咲け！ハルニシオン</a><p className="text-sm text-gray-600 mt-1">メンバーの素顔が詰まった各種映像を楽しめる公式YouTube番組です。</p></div></div></div>
            <div><h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faSeedling} className="mr-2" />ハルニシオン園芸部</h3><p>公式ファンクラブ（メンバーシップ）です。限定コンテンツや先行情報など特典多数！</p><div className="mt-3"><a href="https://harunision-official.boosty.app/store/memberships" target="_blank" rel="noopener noreferrer" className="inline-block p-3 bg-gradient-to-r from-emerald-100 to-sky-100 text-slate-700 rounded-xl hover:from-emerald-50 hover:to-sky-50 transition font-bold text-center shadow-md border border-white/80">ファンクラブに入会する</a></div></div>
            <div><h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faPenFancy} className="mr-2" />オンラインサイン会</h3><p>オンライン上のサイン会。特別なテーマのチェキに豪華なデコレーションをしてもらえます。サインを書いている様子は配信され、あなたの名前を読み上げてくれることも！</p></div>
            <div><h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faGift} className="mr-2" />手紙・プレゼント</h3><p>主催イベント時に設置されるプレゼントBOXに入れるか、物販スタッフに預けることで渡せます。ただし、生ものや現金・金券は受け取れません。</p></div>
            <div><h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faDoorClosed} className="mr-2" />入場特典</h3><p>ライブごとに入場特典が付くことがあります。内容は毎回異なり、公式Xで告知されるので要チェック！</p><div className="bg-gradient-to-b from-white to-sky-50 p-4 rounded-xl mt-2 text-sm border border-sky-100"><p><strong>＜特典の例＞</strong></p><ul className="list-disc list-inside ml-2 mt-1"><li>好きなメンバーと撮れる写メ券</li><li>サインありの特典券</li><li>ポイントカードの追加ポイント など</li></ul></div></div>
            <div><h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faStarHalfAlt} className="mr-2" />ポイントカード</h3><p>ハルニシオンにはお得なポイントカードがあります！物販スタッフに声をかけて作ってもらいましょう。</p><div className="grid md:grid-cols-2 gap-4 mt-4 text-center"><div className="bg-gradient-to-b from-amber-50 to-white p-4 rounded-xl border border-amber-100"><h4 className="font-bold">ポイントが貯まる条件</h4><p>ライブ入場毎に <strong className="text-amber-700">1pt</strong></p><p>物販5,000円購入毎に <strong className="text-amber-700">1pt</strong></p></div><div className="bg-gradient-to-b from-sky-50 to-white p-4 rounded-xl border border-sky-100"><h4 className="font-bold">ポイント特典</h4><p>累計10pt毎に <strong className="text-amber-700">クジ引き</strong></p><p>累計50pt/100ptで <strong className="text-amber-700">オリジナルTシャツ</strong></p></div></div></div>
        </div>
      </section>
    </main>
  );
}
