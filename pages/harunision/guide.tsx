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
    body { font-family: 'M PLUS Rounded 1c', sans-serif; background: linear-gradient(to bottom, #fdfbfb, #f7f2e8); }
    .scroll-reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
    .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
    .infographic-section { background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-radius: 1.5rem; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid rgba(229, 217, 182, 0.5); scroll-margin-top: 12rem; }
    @media (min-width: 640px) { .infographic-section { scroll-margin-top: 10rem; } }
    .infographic-title { font-size: 1.875rem; font-weight: 800; color: #A47E3B; text-align: center; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; }
    .infographic-title .svg-inline--fa { margin-right: 0.75rem; }
    .flow-chart { display: flex; flex-direction: column; align-items: center; }
    .flow-step { display: flex; align-items: center; margin-bottom: 1.5rem; width: 100%; }
    .flow-step .icon { flex-shrink: 0; width: 4rem; height: 4rem; background: linear-gradient(135deg, #E5D9B6, #A47E3B); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.875rem; margin-right: 1.5rem; box-shadow: 0 4px 10px rgba(164, 126, 59, 0.3); }
    .flow-step .text { background-color: #F7F2E8; padding: 1rem; border-radius: 0.75rem; flex-grow: 1; }
    .flow-arrow { font-size: 2rem; color: #A47E3B; margin: -1rem 0 0.5rem 0; }
    .note-list li { display: flex; align-items: flex-start; margin-bottom: 0.75rem; }
    .note-list .svg-inline--fa { margin-right: 0.75rem; color: #A47E3B; margin-top: 0.25rem; }
    .gradient-bg { background: linear-gradient(135deg, #E5D9B6, #A47E3B); color: white; }
    .main-header { background-image: url('https://storage.googleapis.com/gemini-prod-us-central1-gd-scratchpad-assets/Gja9yNmb0AA6_8e.jpg-87a66fb0-8637-44c0-b146-2af3b8f238bf'); background-size: cover; background-position: center 30%; height: 30vh; min-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #A47E3B; text-shadow: 0px 0px 8px rgba(255, 255, 255, 1), 0px 0px 10px rgba(255, 255, 255, 1); border-bottom-left-radius: 2rem; border-bottom-right-radius: 2rem; padding: 1rem; }
    .main-header h1 { font-size: 3rem; font-weight: 800; }
    .main-header p { font-size: 1.25rem; font-weight: 500; }
    .table-custom { width: 100%; border-collapse: collapse; }
    .table-custom th, .table-custom td { border: 2px solid #E5D9B6; padding: 1rem; text-align: left; }
    .table-custom th { background-color: #F7F2E8; color: #A47E3B; font-weight: 700; }
    .table-custom td { background-color: #fff; }
    .highlight-box { background-color: #fff8e1; border-left: 5px solid #A47E3B; padding: 1.5rem; margin-top: 1.5rem; border-radius: 0.5rem; }
    .toc { background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid #E5D9B6; transition: top 0.4s ease-in-out; }
    .toc a { display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .toc a:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .youtube-thumbnail { width: 240px; height: 180px; object-fit: cover; border-radius: 0.5rem; border: 2px solid #E5D9B6; transition: transform 0.3s ease; }
    a:hover .youtube-thumbnail { transform: scale(1.05); }
    .member-card { background-color: #fff; border-radius: 1rem; padding: 1.5rem; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #E5D9B6; transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .member-card:hover { transform: translateY(-5px); box-shadow: 0 12px 20px -10px rgba(0,0,0,0.2); }
    .member-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 1rem; border: 4px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.2); }
    .member-color { width: 20px; height: 20px; border-radius: 50%; display: inline-block; vertical-align: middle; margin-right: 0.5rem; border: 1px solid rgba(0,0,0,0.1); }
  `}</style>
);


const GuidePage = () => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ハルニシオン はじめてガイド</title>
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap" rel="stylesheet" />
        {/* FontAwesomeはクライアントコンポーネント側で読み込むため、ここでは不要 */}
      </Head>
      <GlobalStyles />
      <div id="page-top">
        <header className="main-header">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold">ハルニシオン</h1>
            <p className="mt-2 text-lg md:text-2xl">はじめてのライブ 応援ガイド</p>
            <p className="text-sm mt-1">(非公式まとめ)</p>
          </div>
        </header>
        
        <GuideClient />

        <footer className="text-center text-gray-500 mt-12 pb-4">
          <p>このガイドはファンが作成した非公式のものです。</p>
          <p>最新情報や正確な情報はハルニシオン公式SNSをご確認ください。</p>
        </footer>
      </div>
    </>
  );
};

export default GuidePage;