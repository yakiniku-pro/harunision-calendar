import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faArrowUp, faUsers, faMusic, faTicketAlt, faVolumeUp, faStar, faCompactDisc, faGift,
  faDesktop, faDoorOpen, faCameraRetro, faPeopleArrows, faHandSparkles, faInfoCircle, faShoePrints,
  faCashRegister, faHandshake, faCamera, faUserFriends, faComments, faExclamationTriangle,
  faMobileAlt, faIdCard, faDoorClosed, faStarHalfAlt
} from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';


// --- データ定義 ---

// メンバー情報
const membersData = [
  {
    name: '馬場 彩華',
    englishName: 'Sayaka Baba',
    color: '#fdfd96',
    nickname: 'さやまる',
    x_account: '@syk_HNS',
    x_url: 'https://x.com/syk_HNS',
    description: '晴れやかな笑顔がトレードマーク。張りのある声とキレのあるダンスに注目。',
    imgSrc: '../sayaka.webp',
  },
  {
    name: '芹沢 心色',
    englishName: 'Kokoa Serizawa',
    color: '#ff6961',
    nickname: 'ここちゃん',
    x_account: '@cocoro_HNS',
    x_url: 'https://x.com/cocoro_HNS',
    description: '感情を揺さぶる透明でパワフルな歌声が特徴。グループの末っ子。',
    imgSrc: '../kokoro.webp',
  },
  {
    name: '来海 とい',
    englishName: 'Toi Kurumi',
    color: '#77dd77',
    nickname: 'といちゃん',
    x_account: '@toi_HNS',
    x_url: 'https://x.com/toi_HNS',
    description: '人を惹き混む笑顔ながら、ステージ上でのパフォーマンスは圧倒的。',
    imgSrc: '../toi.webp',
  },
  {
    name: '長浜 瑠花',
    englishName: 'Ruka Nagahama',
    color: '#d7bde2',
    nickname: 'るーるん',
    x_account: '@ruka_HNS',
    x_url: 'https://x.com/ruka_HNS',
    description: '気品漂うたたずまいに繊細で透明な歌声を持つ。しかし実際に話してみると…',
    imgSrc: '../ruka.webp',
  },
  {
    name: '村瀬 ゆうな',
    englishName: 'Yuna Murase',
    color: '#f8b4b4',
    nickname: 'ゆうな',
    x_account: '@yuuna_HNS',
    x_url: 'https://x.com/yuuna_HNS',
    description: '大人びた雰囲気を持ち、饒舌で多才。甘い歌声が楽曲に華を添える。',
    imgSrc: '../yuna.webp',
  },
  {
    name: '福間 彩音',
    englishName: 'Ayane Fukuma',
    color: '#a0d8ef',
    nickname: 'あやねん',
    x_account: '@ayane_HNS',
    x_url: 'https://x.com/ayane_HNS',
    description: '高嶺の花のような見た目とは裏腹に、感情を乗せたパフォーマンスが得意。',
    imgSrc: '../ayane.webp',
  },
];

// 楽曲情報
const musicData = [
  {
    category: '【🔥 盛り上がる曲が好き】',
    songs: [
      { title: 'gradation', url: 'https://www.youtube.com/watch?v=WLzX5eGR_7s', thumbnail: 'https://i.ytimg.com/vi/WLzX5eGR_7s/mqdefault.jpg' },
      { title: '音速少女', url: 'https://www.youtube.com/watch?v=eg6qkejk3MQ', thumbnail: 'https://i.ytimg.com/vi/eg6qkejk3MQ/mqdefault.jpg' },
    ],
  },
  {
    category: '【🎉 楽しい曲が好き】',
    songs: [
      { title: "Jumpin'", url: 'https://www.youtube.com/watch?v=UfUqdia0i7I', thumbnail: 'https://i.ytimg.com/vi/UfUqdia0i7I/mqdefault.jpg' },
      { title: 'アノソラヘ(非公式)', url: 'https://www.youtube.com/watch?v=DULtUOHm2_s', thumbnail: 'https://i.ytimg.com/vi/DULtUOHm2_s/mqdefault.jpg' },
    ],
  },
  {
    category: '【💖 アイドルらしい曲が好き】',
    songs: [
      { title: 'ハルニシオン', url: 'https://www.youtube.com/watch?v=EqB4Mx4-lxg', thumbnail: 'https://i.ytimg.com/vi/EqB4Mx4-lxg/mqdefault.jpg' },
      { title: '白春', url: 'https://www.youtube.com/watch?v=ATcZfX0G6R0', thumbnail: 'https://i.ytimg.com/vi/ATcZfX0G6R0/mqdefault.jpg' },
    ],
  },
  {
    category: '【🌙 哀愁のある曲が好き】',
    songs: [
      { title: '仮初花火(非公式)', url: 'https://www.youtube.com/watch?v=CgiHwiqNG1U', thumbnail: 'https://i.ytimg.com/vi/CgiHwiqNG1U/mqdefault.jpg' },
      { title: 'FloweBird', url: 'https://www.youtube.com/watch?v=lgsbJF94n6c', thumbnail: 'https://i.ytimg.com/vi/lgsbJF94n6c/mqdefault.jpg' },
    ],
  },
  {
    category: '【🌌 世界観の出ている曲が好き】',
    songs: [
      { title: '夜明けを合図にして', url: 'https://www.youtube.com/watch?v=v1SBoR8b8yY', thumbnail: 'https://i.ytimg.com/vi/v1SBoR8b8yY/mqdefault.jpg' },
      { title: '微かなルクス(非公式)', url: 'https://www.youtube.com/watch?v=U4wHNKI3xzI', thumbnail: 'https://i.ytimg.com/vi/U4wHNKI3xzI/mqdefault.jpg' },
    ],
  },
];


// --- スタイル定義 ---
const GlobalStyles = () => (
  <style>{`
    html {
        scroll-behavior: smooth;
    }
    body {
        font-family: 'M PLUS Rounded 1c', sans-serif;
        background: linear-gradient(to bottom, #fdfbfb, #f7f2e8);
    }
    
    /* セクションのスクロールアニメーション */
    .scroll-reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    .scroll-reveal.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .infographic-section {
        background-color: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 1.5rem; /* 24px */
        padding: 2rem; /* 32px */
        margin-bottom: 2rem; /* 32px */
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(229, 217, 182, 0.5);
        
        /* スティッキーメニューの高さに応じてスクロール位置を調整 */
        /* デフォルト (モバイル) */
        scroll-margin-top: 12rem; 
    }

    /* smサイズ以上 (タブレット・PC) */
    @media (min-width: 640px) {
        .infographic-section {
            scroll-margin-top: 10rem;
        }
    }

    .infographic-title {
        font-size: 1.875rem; /* 30px */
        font-weight: 800;
        color: #A47E3B; /* メインカラー */
        text-align: center;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .infographic-title .svg-inline--fa {
        margin-right: 0.75rem;
    }
    .flow-chart {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .flow-step {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        width: 100%;
    }
    .flow-step .icon {
        flex-shrink: 0;
        width: 4rem; /* 64px */
        height: 4rem; /* 64px */
        background: linear-gradient(135deg, #E5D9B6, #A47E3B);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.875rem; /* 30px */
        margin-right: 1.5rem;
        box-shadow: 0 4px 10px rgba(164, 126, 59, 0.3);
    }
    .flow-step .text {
        background-color: #F7F2E8;
        padding: 1rem;
        border-radius: 0.75rem; /* 12px */
        flex-grow: 1;
    }
    .flow-arrow {
        font-size: 2rem;
        color: #A47E3B;
        margin: -1rem 0 0.5rem 0;
    }
    .note-list li {
        display: flex;
        align-items: flex-start;
        margin-bottom: 0.75rem;
    }
    .note-list .svg-inline--fa {
        margin-right: 0.75rem;
        color: #A47E3B;
        margin-top: 0.25rem;
    }
    .gradient-bg {
        background: linear-gradient(135deg, #E5D9B6, #A47E3B);
        color: white;
    }
    .main-header {
        background-image: url('https://storage.googleapis.com/gemini-prod-us-central1-gd-scratchpad-assets/Gja9yNmb0AA6_8e.jpg-87a66fb0-8637-44c0-b146-2af3b8f238bf');
        background-size: cover;
        background-position: center 30%;
        height: 30vh; /* 高さを少し詰める */
        min-height: 250px;
        display: flex;
        flex-direction: column; /* 縦並びに変更 */
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #A47E3B; /* メインテーマカラーに変更 */
        /* 明るい色の影で文字を縁取り、視認性を向上 */
        text-shadow: 0px 0px 8px rgba(255, 255, 255, 1), 0px 0px 10px rgba(255, 255, 255, 1);
        border-bottom-left-radius: 2rem;
        border-bottom-right-radius: 2rem;
        padding: 1rem;
    }
    .main-header h1 {
        font-size: 3rem;
        font-weight: 800;
    }
    .main-header p {
        font-size: 1.25rem;
        font-weight: 500; /* サブタイトルも少し太くして見やすく */
    }
    .table-custom {
        width: 100%;
        border-collapse: collapse;
    }
    .table-custom th, .table-custom td {
        border: 2px solid #E5D9B6;
        padding: 1rem;
        text-align: left;
    }
    .table-custom th {
        background-color: #F7F2E8;
        color: #A47E3B;
        font-weight: 700;
    }
    .table-custom td {
        background-color: #fff;
    }
    .highlight-box {
        background-color: #fff8e1;
        border-left: 5px solid #A47E3B;
        padding: 1.5rem;
        margin-top: 1.5rem;
        border-radius: 0.5rem;
    }
    .toc {
        background-color: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid #E5D9B6;
        transition: top 0.4s ease-in-out;
    }
    .toc a {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .toc a:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .youtube-thumbnail {
        width: 320px;  /* 120pxから変更 */
        height: 240px; /* 90pxから変更 */
        object-fit: cover;
        border-radius: 0.5rem;
        border: 2px solid #E5D9B6;
        transition: transform 0.3s ease; /* ホバーエフェクトを追加 */
    }
    a:hover .youtube-thumbnail {
        transform: scale(1.05); /* 少し拡大するエフェクト */
    }
    .member-card {
        background-color: #fff;
        border-radius: 1rem;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        border: 1px solid #E5D9B6;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .member-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 20px -10px rgba(0,0,0,0.2);
    }
    .member-img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        margin: 0 auto 1rem;
        border: 4px solid #fff;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }
    .member-color {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: inline-block;
        vertical-align: middle;
        margin-right: 0.5rem;
        border: 1px solid rgba(0,0,0,0.1);
    }
  `}</style>
);


// --- メインコンポーネント ---
const App = () => {
  const tocMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // スクロールで表示/非表示になるメニュー
    const handleScroll = () => {
      const tocMenu = tocMenuRef.current;
      if (tocMenu) {
        let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const tocHeight = tocMenu.offsetHeight;

        window.addEventListener('scroll', () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
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
        }, false);
      }
    };
    
    // スクロールでのフェードインアニメーション
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    scrollRevealElements.forEach(el => observer.observe(el));
    
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollRevealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const noteItems = [
    "特典会に参加する直前に、大きな荷物は指定の場所に置いたり、スタッフに預けましょう。",
    "安全のため、メンバーの身体に直接触れる行為は禁止です。",
    "一度に出せる特典券は基本2枚までです。たくさんある場合は、再度並び直しましょう。",
    "メンバーが不快に感じるような発言や行動は絶対にやめましょう。",
    "チェキの撮り直しは、明らかに撮影に失敗している場合(目をつぶってしまった等)のみ可能です。",
    "写メ撮影は、他撮り(スタッフによる撮影)のみとなります。自撮りでの撮影はできません。"
  ];

  return (
    <>
      <GlobalStyles />
      <div id="page-top" className="bg-gray-50">
        <header className="main-header">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold">ハルニシオン</h1>
            <p className="mt-2 text-lg md:text-2xl">はじめてのライブ 応援ガイド</p>
            <p className="text-sm mt-1">(非公式まとめ)</p>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-8 max-w-4xl">
          <section className="infographic-section text-center -mt-4 mb-8 scroll-reveal">
            <h3 className="font-bold text-amber-800 mb-3">より正確・最新の情報はこちら</h3>
            <div className="flex justify-center gap-4 flex-row">
              <a href="https://harunision-official.boosty.app/" target="_blank" rel="noopener noreferrer" className="flex-1 p-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-bold text-center shadow-md">
                <FontAwesomeIcon icon={faHome} className="mr-2" />公式HP
              </a>
              <a href="https://x.com/info_hns" target="_blank" rel="noopener noreferrer" className="flex-1 p-3 bg-gray-800 text-white rounded-lg hover:bg-black transition font-bold text-center shadow-md">
                <FontAwesomeIcon icon={faTwitter} className="mr-2" />公式X
              </a>
            </div>
          </section>

          <nav ref={tocMenuRef} id="toc-menu" className="toc sticky top-4 z-10 p-4 rounded-2xl shadow-lg mb-8">
            <h2 className="font-bold text-center text-amber-800 mb-3">MENU</h2>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <a href="#page-top" className="p-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"><FontAwesomeIcon icon={faArrowUp} className="mr-2" />トップへ</a>
              <a href="#members" className="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"><FontAwesomeIcon icon={faUsers} className="mr-2" />メンバー</a>
              <a href="#music" className="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"><FontAwesomeIcon icon={faMusic} className="mr-2" />楽曲</a>
              <a href="#tickets" className="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"><FontAwesomeIcon icon={faTicketAlt} className="mr-2" />チケット</a>
              <a href="#live-rules" className="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"><FontAwesomeIcon icon={faVolumeUp} className="mr-2" />ライブ</a>
              <a href="#benefits" className="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"><FontAwesomeIcon icon={faStar} className="mr-2" />特典会</a>
              <a href="#release-event" className="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"><FontAwesomeIcon icon={faCompactDisc} className="mr-2" />リリイベ</a>
              <a href="#more-info" className="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"><FontAwesomeIcon icon={faGift} className="mr-2" />その他</a>
            </div>
          </nav>
          
          <section id="members" className="infographic-section scroll-reveal">
            <h2 className="infographic-title"><FontAwesomeIcon icon={faUsers} />メンバー紹介</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
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

          <section id="music" className="infographic-section scroll-reveal">
            <h2 className="infographic-title"><FontAwesomeIcon icon={faMusic} />楽曲を聴いてみよう</h2>
            <p className="text-center text-gray-700 mb-8">まずは曲から！あなたの好みに合う曲はどれ？ (曲名クリックでYouTubeに飛びます)</p>
            <div className="space-y-6">
              {musicData.map((category) => (
                <div key={category.category}>
                  <h3 className="font-bold text-lg text-amber-700 mb-3">{category.category}</h3>
                  <div className="flex gap-4 flex-wrap">
                    {category.songs.map(song => (
                      <a key={song.title} href={song.url} target="_blank" rel="noopener noreferrer" className="text-center">
                        <img src={song.thumbnail} alt={`${song.title}のサムネイル`} className="youtube-thumbnail" />
                        <span className="text-sm font-semibold">{song.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="tickets" className="infographic-section scroll-reveal">
            <h2 className="infographic-title"><FontAwesomeIcon icon={faTicketAlt} />チケットを手に入れよう</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-gray-100 rounded-xl">
                    <FontAwesomeIcon icon={faDesktop} className="text-5xl text-amber-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">① 事前予約</h3>
                    <p className="text-gray-700">多くのライブは各種チケット販売サイトで事前予約ができます。ハルニシオン公式X(旧Twitter)の告知から予約ページに飛んで購入しましょう。</p>
                </div>
                <div className="text-center p-6 bg-gray-100 rounded-xl">
                    <FontAwesomeIcon icon={faDoorOpen} className="text-5xl text-amber-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">② 当日券</h3>
                    <p className="text-gray-700">事前予約で完売していなければ、当日券が販売されることがあります。販売の有無は当日発表されることも。料金は事前予約より1,000円程高くなるのが一般的です。</p>
                </div>
            </div>
          </section>

          <section id="live-rules" className="infographic-section scroll-reveal">
            <h2 className="infographic-title"><FontAwesomeIcon icon={faVolumeUp} />ライブを楽しもう</h2>
            <div className="text-center mb-8">
                <p>ライブにはいくつかのルールがあります。みんなで守って最高の空間を作りましょう！</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-4">
                    <div className="bg-red-100 text-red-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4">
                        <FontAwesomeIcon icon={faCameraRetro} />
                    </div>
                    <h3 className="font-bold text-lg">撮影・録音は基本禁止</h3>
                    <p className="text-sm text-gray-600">ライブ中の写真撮影、動画撮影、録音は基本的にすべて禁止です。目に焼き付けて、心で感じてください！</p>
                </div>
                <div className="p-4">
                    <div className="bg-amber-100 text-amber-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4">
                        <FontAwesomeIcon icon={faPeopleArrows} />
                    </div>
                    <h3 className="font-bold text-lg">周りの人への配慮</h3>
                    <p className="text-sm text-gray-600">過度な割り込みや、周りの人の視界を遮るような大きな動きは避けましょう。譲り合いの気持ちが大切です。</p>
                </div>
                <div className="p-4">
                    <div className="bg-green-100 text-green-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4">
                        <FontAwesomeIcon icon={faHandSparkles} />
                    </div>
                    <h3 className="font-bold text-lg">全力で楽しむ！</h3>
                    <p className="text-sm text-gray-600">一番大切なルールです！手拍子、振りコピ、声出し(可能な場合)でメンバーと一緒にライブを盛り上げましょう！</p>
                </div>
            </div>
            <div className="highlight-box">
                <h4 className="font-bold text-lg mb-2"><FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> 撮影可能なイベントについて</h4>
                <p>イベントによっては、一部の曲や時間帯で写真・動画撮影が可能になる場合があります。その際は、以下の点を守って楽しみましょう。</p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>撮影可能なタイミングはメンバーやスタッフの案内に従ってください。</li>
                    <li>撮影時に他のお客様の観覧の妨げにならないよう、配慮をお願いします。（頭より高くカメラを上げない等）</li>
                    <li>事前に公式からルールが案内されている場合は、必ず一読しましょう。</li>
                </ul>
            </div>
          </section>

          <section id="benefits" className="infographic-section scroll-reveal">
            <h2 className="infographic-title"><FontAwesomeIcon icon={faStar} />特典会に参加してみよう</h2>
            <p className="text-center text-gray-700 mb-8">ライブの後は、メンバーと直接交流できる「特典会」があります。参加には特典券が必要です。</p>
            <div className="overflow-x-auto">
                <table className="table-custom">
                    <thead>
                        <tr>
                            <th>特典券の種類</th>
                            <th>価格</th>
                            <th>内容説明</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>トークあり券</strong><br/>(サイン＋コメントありチェキ)</td>
                            <td>2,000円</td>
                            <td>好きなメンバーと2ショットチェキを撮影し、その場でチェキにサインとコメント、日付、名前を入れてもらえます。お話できる時間も一番長いです。<strong>※写メは選択できません</strong></td>
                        </tr>
                        <tr>
                            <td><strong>トークなし券</strong><br/>(サインなしチェキ or 写メ)</td>
                            <td>1,000円</td>
                            <td>好きなメンバーと2ショットチェキ(サインなし)または写メを撮影します。<strong>※撮影後のお話はできません</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="highlight-box">
                <h4 className="font-bold text-lg mb-2"><FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> お得な裏技＆注意点</h4>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li><strong>「トークなし券」2枚</strong>で、<strong>「トークあり券」1枚</strong>と同じ内容（サインありチェキ＋トーク）に変更できます。</li>
                    <li>特典券の有効期限は、購入した月の末日までです。期間内であれば、次のライブで使えます！</li>
                </ul>
            </div>
          </section>

          <section className="infographic-section scroll-reveal">
            <h2 className="infographic-title"><FontAwesomeIcon icon={faShoePrints} />特典会の流れ</h2>
            <div className="flow-chart">
                <div className="flow-step">
                    <div className="icon"><FontAwesomeIcon icon={faCashRegister} /></div>
                    <div className="text">
                        <h4 className="font-bold">① 物販ブースに並ぶ</h4>
                        <p>ライブ終了後、会場内に設置される物販ブースに並びます。列がある場合は最後尾に並び、もし「最後尾」カードがあれば受け取りましょう。</p>
                    </div>
                </div>
                <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={90} /></div>
                <div className="flow-step">
                    <div className="icon"><FontAwesomeIcon icon={faTicketAlt} /></div>
                    <div className="text">
                        <h4 className="font-bold">② 特典券を購入する</h4>
                        <p>スタッフに希望の特典券の種類と枚数を伝えて購入します。お支払いは現金、クレジットカード、PayPay、交通系ICが使えます。</p>
                    </div>
                </div>
                <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={90} /></div>
                <div className="flow-step">
                    <div className="icon"><FontAwesomeIcon icon={faUsers} /></div>
                    <div className="text">
                        <h4 className="font-bold">③ メンバーの列に並ぶ</h4>
                        <p>お目当てのメンバーの列に並びます。最後尾の人が持っている「最後尾」カードを受け取りましょう。</p>
                    </div>
                </div>
                <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={90} /></div>
                 <div className="flow-step">
                    <div className="icon"><FontAwesomeIcon icon={faHandshake} /></div>
                    <div className="text">
                        <h4 className="font-bold">④ 次の人が来たらカードを渡す</h4>
                        <p>自分の後ろに人が来たら、「最後尾こちらです」とカードを渡してあげましょう。</p>
                    </div>
                </div>
                <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={90} /></div>
                <div className="flow-step">
                    <div className="icon"><FontAwesomeIcon icon={faCamera} /></div>
                    <div className="text">
                        <h4 className="font-bold">⑤ 撮影スタッフに希望を伝える</h4>
                        <p>自分の番が来たら、チェキ撮影担当のスタッフに特典券を渡し、「ソロか2ショットか」「チェキか写メか」を伝えます。</p>
                    </div>
                </div>
                <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={90} /></div>
                <div className="flow-step">
                    <div className="icon"><FontAwesomeIcon icon={faUserFriends} /></div>
                    <div className="text">
                        <h4 className="font-bold">⑥ メンバーの隣で撮影！</h4>
                        <p>スタッフの案内に従ってメンバーの隣に立ち、ポーズをとって撮影！最高の思い出を作りましょう。</p>
                    </div>
                </div>
                <div className="flow-arrow"><FontAwesomeIcon icon={faArrowUp} rotation={90} /></div>
                <div className="flow-step">
                    <div className="icon"><FontAwesomeIcon icon={faComments} /></div>
                    <div className="text">
                        <h4 className="font-bold">⑦ メンバーとお話しタイム</h4>
                        <p>撮影後、メンバーの前に移動してお話します。サインあり券の場合は、ここでサインを書いてもらいながらお話できます。時間が来たらスタッフに促されるので、感謝を伝えて終了です。</p>
                    </div>
                </div>
            </div>
          </section>

          <section className="infographic-section scroll-reveal">
            <h2 className="infographic-title"><FontAwesomeIcon icon={faExclamationTriangle} />特典会の注意事項</h2>
            <ul className="note-list space-y-3 text-gray-800">
              {noteItems.map((item, index) => (
                <li key={index}>
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="release-event" className="infographic-section gradient-bg rounded-2xl p-8 scroll-reveal">
             <h2 className="infographic-title text-white"><FontAwesomeIcon icon={faCompactDisc} />リリースイベントについて</h2>
             <div className="text-center">
                <p className="mb-4">デジタルシングルの発売に伴うリリースイベント(リリイベ)は、通常のライブとルールが異なります。</p>
                <div className="bg-white/20 p-6 rounded-xl space-y-4 text-left">
                    <div className="flex items-start">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-2xl mt-1 mr-4" />
                        <div>
                            <h4 className="font-bold">観覧は基本無料！</h4>
                            <p className="text-sm">誰でも無料でライブを観覧できますが、「miim」アプリで対象商品を購入すると発行される「入場券ページ」を見せることで、整理番号順に優先入場ができます。</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <FontAwesomeIcon icon={faMobileAlt} className="text-2xl mt-1 mr-4" />
                        <div>
                            <h4 className="font-bold">特典会も「miim」アプリで</h4>
                            <p className="text-sm">特典会への参加も「miim」アプリを使用します。アプリ内の「特典券ページ」をスタッフに提示してください。</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <FontAwesomeIcon icon={faIdCard} className="text-2xl mt-1 mr-4" />
                        <div>
                            <h4 className="font-bold">トレーディングカード交換</h4>
                            <p className="text-sm">事前購入金額に応じて、限定トレーディングカードがもらえます。交換場所は会場ごとに案内されるので、公式の告知をチェックしましょう。</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <FontAwesomeIcon icon={faHandSparkles} className="text-2xl mt-1 mr-4" />
                        <div>
                            <h4 className="font-bold">ハイタッチ会に参加しよう！<span className="ml-2 inline-block bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">参加無料</span></h4>
                            <p className="text-sm">ライブ終了後には、メンバー全員とハイタッチできるイベントが開催されることも！こちらは無料で参加できるので、ぜひ思い出作りに参加してください。</p>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-sm">詳しい方法は、リリイベの告知をよく確認してください。</p>
             </div>
          </section>

          <section id="more-info" className="infographic-section scroll-reveal">
            <h2 className="infographic-title"><FontAwesomeIcon icon={faGift} />もっと楽しむための情報</h2>
            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faGift} className="mr-2" />手紙・プレゼント</h3>
                    <p>メンバーへの手紙やプレゼントは、主催イベント時に設置されるプレゼントBOXに入れるか、物販スタッフに預けることで渡せます。ただし、生ものや現金・金券は受け取れません。</p>
                </div>
                <div>
                    <h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faDoorClosed} className="mr-2" />入場特典</h3>
                    <p>ライブやイベントごとに入場特典が付くことがあります。内容は毎回異なり、公式Xで告知されるので要チェック！</p>
                    <div className="bg-gray-100 p-4 rounded-lg mt-2 text-sm">
                        <p><strong>＜特典の例＞</strong></p>
                        <ul className="list-disc list-inside ml-2 mt-1">
                            <li>好きなメンバーと撮れる写メ券</li>
                            <li>サインありの特典券</li>
                            <li>ポイントカードの追加ポイント など</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-xl mb-2 text-amber-700"><FontAwesomeIcon icon={faStarHalfAlt} className="mr-2" />ポイントカード</h3>
                    <p>ハルニシオンにはお得なポイントカードがあります！物販スタッフに声をかけて作ってもらいましょう。</p>
                     <div className="grid md:grid-cols-2 gap-4 mt-4 text-center">
                        <div className="bg-amber-100 p-4 rounded-lg">
                            <h4 className="font-bold">ポイントが貯まる条件</h4>
                            <p>ライブ入場毎に <strong className="text-amber-700">1pt</strong></p>
                            <p>物販5,000円購入毎に <strong className="text-amber-700">1pt</strong></p>
                        </div>
                        <div className="bg-amber-100 p-4 rounded-lg">
                            <h4 className="font-bold">ポイント特典</h4>
                            <p>累計10pt毎に <strong className="text-amber-700">クジ引き</strong></p>
                            <p>累計50ptで <strong className="text-amber-700">オリジナルTシャツ</strong></p>
                        </div>
                    </div>
                </div>
            </div>
          </section>

          <footer className="text-center text-gray-500 mt-12 pb-4">
            <p>このガイドはファンが作成した非公式のものです。</p>
            <p>最新・正確な情報はハルニシオン公式SNSをご確認ください。</p>
          </footer>
        </main>
      </div>
    </>
  );
};

export default App;
