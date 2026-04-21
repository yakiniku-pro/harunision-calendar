import Head from 'next/head';
import dynamic from 'next/dynamic';

// クライアントコンポーネントをSSRなしで動的にインポート
const GuideClient = dynamic(() => import('@/components/harunision/GuideClient'), {
  ssr: false,
});

// スタイル定義
const GlobalStyles = () => (
  <style>{`
    html { scroll-behavior: smooth; }
    body {
      font-family: 'M PLUS Rounded 1c', sans-serif;
      background:
        radial-gradient(circle at top left, rgba(214, 236, 250, 0.85), transparent 28%),
        radial-gradient(circle at top right, rgba(255, 247, 223, 0.8), transparent 24%),
        linear-gradient(180deg, #f8fcff 0%, #eef6fb 38%, #f8f6ef 100%);
      color: #5c5a55;
    }
    .scroll-reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
    .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
    .infographic-section {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(250, 252, 255, 0.92));
      backdrop-filter: blur(14px);
      border-radius: 1.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 22px 50px -28px rgba(104, 139, 168, 0.35), 0 18px 30px -24px rgba(198, 173, 96, 0.28);
      border: 1px solid rgba(225, 234, 244, 0.95);
      scroll-margin-top: 12rem;
    }
    @media (min-width: 640px) { .infographic-section { scroll-margin-top: 10rem; } }
    .infographic-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: #8b7342;
      text-align: center;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.04em;
    }
    .infographic-title .svg-inline--fa { margin-right: 0.75rem; }
    .flow-chart { display: flex; flex-direction: column; align-items: center; }
    .flow-step { display: flex; align-items: center; margin-bottom: 1.5rem; width: 100%; }
    .flow-step .icon { flex-shrink: 0; width: 4rem; height: 4rem; background: linear-gradient(135deg, #f2dd8f, #bfdcf2); color: #6f643f; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.875rem; margin-right: 1.5rem; box-shadow: 0 10px 20px rgba(159, 184, 204, 0.28); border: 1px solid rgba(255,255,255,0.9); }
    .flow-step .text { background: linear-gradient(180deg, #fefefe, #f6fbff); padding: 1rem; border-radius: 1rem; flex-grow: 1; border: 1px solid rgba(219, 229, 239, 0.8); }
    .flow-arrow { font-size: 2rem; color: #9aa56e; margin: -1rem 0 0.5rem 0; }
    .note-list li { display: flex; align-items: flex-start; margin-bottom: 0.75rem; }
    .note-list .svg-inline--fa { margin-right: 0.75rem; color: #8b7342; margin-top: 0.25rem; }
    .gradient-bg { background: linear-gradient(135deg, rgba(190, 224, 248, 0.92), rgba(245, 222, 158, 0.95)); color: #554e40; box-shadow: 0 22px 48px -30px rgba(116, 151, 182, 0.45); }
    .main-header {
      position: relative;
      overflow: hidden;
      background-image:
        linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.42)),
        url('https://storage.googleapis.com/gemini-prod-us-central1-gd-scratchpad-assets/Gja9yNmb0AA6_8e.jpg-87a66fb0-8637-44c0-b146-2af3b8f238bf');
      background-size: cover;
      background-position: center 30%;
      height: 24vh;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #75623a;
      text-shadow: 0 1px 0 rgba(255,255,255,0.95), 0 0 18px rgba(255,255,255,0.92);
      border-bottom-left-radius: 2.5rem;
      border-bottom-right-radius: 2.5rem;
      padding: 1rem 1rem 1.25rem;
      box-shadow: 0 20px 40px -28px rgba(148, 181, 210, 0.5);
    }
    .main-header::after {
      content: '';
      position: absolute;
      inset: auto 0 0;
      height: 46%;
      background: linear-gradient(180deg, transparent, rgba(248, 252, 255, 0.88));
      pointer-events: none;
    }
    .main-header > div { position: relative; z-index: 1; max-width: 680px; }
    .header-logo { width: min(440px, 82vw); height: auto; margin: 0 auto 0.9rem; filter: drop-shadow(0 8px 18px rgba(255,255,255,0.75)); }
    .main-header h1 { font-size: clamp(1.65rem, 4.1vw, 2.7rem); font-weight: 800; letter-spacing: 0.08em; line-height: 1.35; }
    .main-header p { font-size: clamp(0.95rem, 2vw, 1.12rem); font-weight: 500; }
    .table-custom { width: 100%; border-collapse: collapse; }
    .table-custom th, .table-custom td { border: 1px solid rgba(214, 227, 238, 0.95); padding: 1rem; text-align: left; }
    .table-custom th { background: linear-gradient(180deg, #fbfbf8, #f2f7fb); color: #8b7342; font-weight: 700; }
    .table-custom td { background-color: rgba(255,255,255,0.88); }
    .highlight-box { background: linear-gradient(180deg, rgba(255, 251, 239, 0.95), rgba(245, 249, 255, 0.92)); border-left: 5px solid #d9bf6f; padding: 1.5rem; margin-top: 1.5rem; border-radius: 1rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8); }
    .toc { background-color: rgba(250, 252, 255, 0.76); backdrop-filter: blur(14px); border: 1px solid rgba(223, 232, 242, 0.95); box-shadow: 0 16px 36px -28px rgba(120, 151, 180, 0.5); transition: top 0.4s ease-in-out; }
    .toc a { display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .toc a:hover { transform: translateY(-2px); box-shadow: 0 10px 18px -14px rgba(98,126,153,0.5); }
    .youtube-thumbnail { width: 240px; height: 180px; object-fit: cover; border-radius: 1rem; border: 1px solid rgba(222, 231, 240, 0.95); box-shadow: 0 14px 28px -22px rgba(98,126,153,0.5); transition: transform 0.3s ease, box-shadow 0.3s ease; }
    a:hover .youtube-thumbnail { transform: scale(1.05); }
    a:hover .youtube-thumbnail { box-shadow: 0 20px 34px -24px rgba(98,126,153,0.65); }
    .member-card { background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,251,255,0.93)); border-radius: 1.25rem; padding: 1.5rem; text-align: center; box-shadow: 0 16px 30px -24px rgba(98,126,153,0.45); border: 1px solid rgba(222, 231, 240, 0.95); transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .member-card:hover { transform: translateY(-5px); box-shadow: 0 24px 38px -28px rgba(98,126,153,0.55); }
    .member-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 1rem; border: 4px solid rgba(255,255,255,0.95); box-shadow: 0 10px 20px -14px rgba(98,126,153,0.45); }
    .member-color { width: 20px; height: 20px; border-radius: 50%; display: inline-block; vertical-align: middle; margin-right: 0.5rem; border: 1px solid rgba(0,0,0,0.1); }
  `}</style>
);


const GuidePage = () => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ハルニシオンの楽しみ方</title>
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap" rel="stylesheet" />
        {/* FontAwesomeはクライアントコンポーネント側で読み込むため、ここでは不要 */}
      </Head>
      <GlobalStyles />
      <div id="page-top">
        <header className="main-header">
          <div>
            <img src="/harunision-logo.png" alt="ハルニシオン ロゴ" className="header-logo" />
            <h1 className="text-4xl md:text-6xl font-bold">ハルニシオンの楽しみ方</h1>
            <p className="text-sm mt-2 tracking-[0.22em] text-stone-600">非公式まとめ</p>
          </div>
        </header>
        
        <GuideClient />
      </div>
    </>
  );
};

export default GuidePage;
