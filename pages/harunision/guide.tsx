import Head from 'next/head';

// HTMLの<style>タグの中身をここに記述
const customStyles = `
    html {
        scroll-behavior: smooth;
    }
    body {
        font-family: 'M PLUS Rounded 1c', sans-serif;
        background-color: #F7F2E8; /* 全体の背景色を優しい色に */
    }
    .infographic-section {
        background-color: #ffffff;
        border-radius: 1.5rem; /* 24px */
        padding: 2rem; /* 32px */
        margin-bottom: 2rem; /* 32px */
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        border: 2px solid #E5D9B6; /* ボーダーを追加 */
        scroll-margin-top: 14rem; 
    }
    /* smサイズ以上 (タブレット / メニュー2行) */
    @media (min-width: 640px) {
        .infographic-section {
            scroll-margin-top: 11rem;
        }
    }

    /* lgサイズ以上 (PC / メニュー1行) */
    @media (min-width: 1024px) {
        .infographic-section {
            scroll-margin-top: 8rem;
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
    .infographic-title i {
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
        background-color: #E5D9B6;
        color: #A47E3B;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.875rem; /* 30px */
        margin-right: 1.5rem;
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
        position: relative;
        padding-left: 1.75rem; /* 28px */
        margin-bottom: 0.75rem;
    }
    .note-list li::before {
        content: "\\f00c"; /* Font Awesome check icon */
        font-family: "Font Awesome 6 Free";
        font-weight: 900;
        position: absolute;
        left: 0;
        top: 0;
        color: #A47E3B;
    }
    .gradient-bg {
        background: linear-gradient(135deg, #E5D9B6, #A47E3B);
        color: white;
    }
    .main-header {
        background-image: url('https://googleusercontent.com/file_content/0');
        background-size: cover;
        background-position: center 30%;
        height: 10vh; /* 高さを少し詰める */
        min-height: 250px;
        display: flex;
        flex-direction: column; /* 縦並びに変更 */
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #A47E3B;;
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
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(5px);
        border: 1px solid #E5D9B6;
    }
    .youtube-thumbnail {
        width: 120px;
        height: 90px;
        object-fit: cover;
        border-radius: 0.5rem;
        border: 2px solid #E5D9B6;
    }
`;

// HTMLの<body>タグの中身をここに記述
const bodyContent = `
    <header class="main-header">
        <div>
            <h1 class="text-4xl md:text-6xl font-bold">ハルニシオン</h1>
            <p class="mt-2 text-lg md:text-2xl">はじめてのライブ 応援ガイド</p>
            <p class="text-sm mt-1">(ファンによる非公式まとめ)</p>
        </div>
    </header>

    <main class="container mx-auto p-4 md:p-8 max-w-4xl">
        
        <!-- 公式リンク -->
        <section class="infographic-section text-center -mt-4 mb-8">
            <h3 class="font-bold text-amber-800 mb-3">最新情報やより正確な情報はこちら</h3>
            <div class="flex justify-center gap-4 flex-col sm:flex-row">
                <a href="https://harunision-official.boosty.app/" target="_blank" rel="noopener noreferrer" class="p-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-bold text-center shadow-md">
                    <i class="fas fa-home mr-2"></i>公式HP
                </a>
                <a href="https://x.com/info_hns" target="_blank" rel="noopener noreferrer" class="p-3 bg-gray-800 text-white rounded-lg hover:bg-black transition font-bold text-center shadow-md">
                    <i class="fab fa-twitter mr-2"></i>公式X
                </a>
            </div>
        </section>

        <!-- 目次 -->
        <nav class="toc sticky top-4 z-10 p-4 rounded-2xl shadow-lg mb-8">
            <h2 class="font-bold text-center text-amber-800 mb-3">MENU</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-sm">
                <a href="#music" class="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"><i class="fas fa-music mr-2"></i>楽曲</a>
                <a href="#tickets" class="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"><i class="fas fa-ticket-alt mr-2"></i>チケット</a>
                <a href="#live-rules" class="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"><i class="fas fa-volume-up mr-2"></i>ライブ</a>
                <a href="#benefits" class="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"><i class="fas fa-star mr-2"></i>特典会</a>
                <a href="#release-event" class="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"><i class="fas fa-compact-disc mr-2"></i>リリイベ</a>
                <a href="#more-info" class="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"><i class="fas fa-gift mr-2"></i>その他</a>
            </div>
        </nav>

        <!-- 楽曲を聴いてみよう -->
        <section id="music" class="infographic-section">
            <h2 class="infographic-title"><i class="fas fa-music"></i>楽曲を聴いてみよう</h2>
            <p class="text-center text-gray-700 mb-8">まずは曲から！あなたの好みに合う曲はどれ？ (曲名クリックでYouTubeに飛びます)</p>
            <div class="space-y-6">
                <div>
                    <h3 class="font-bold text-lg text-amber-700 mb-3">【🔥 盛り上がる曲が好き】</h3>
                    <div class="flex gap-4 flex-wrap">
                        <a href="https://www.youtube.com/watch?v=WLzX5eGR_7s" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/WLzX5eGR_7s/mqdefault.jpg" alt="gradationのサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">gradation</span>
                        </a>
                        <a href="https://www.youtube.com/watch?v=eg6qkejk3MQ" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/eg6qkejk3MQ/mqdefault.jpg" alt="音速少女のサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">音速少女</span>
                        </a>
                    </div>
                </div>
                 <div>
                    <h3 class="font-bold text-lg text-amber-700 mb-3">【🎉 楽しい曲が好き】</h3>
                    <div class="flex gap-4 flex-wrap">
                        <a href="https://www.youtube.com/watch?v=UfUqdia0i7I" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/UfUqdia0i7I/mqdefault.jpg" alt="Jumpin'のサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">Jumpin'</span>
                        </a>
                        <a href="https://www.youtube.com/watch?v=DULtUOHm2_s" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/DULtUOHm2_s/mqdefault.jpg" alt="アノソラヘのサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">アノソラヘ(非公式)</span>
                        </a>
                    </div>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-amber-700 mb-3">【💖 アイドルらしい曲が好き】</h3>
                    <div class="flex gap-4 flex-wrap">
                        <a href="https://www.youtube.com/watch?v=EqB4Mx4-lxg" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/EqB4Mx4-lxg/mqdefault.jpg" alt="ハルニシオンのサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">ハルニシオン</span>
                        </a>
                        <a href="https://www.youtube.com/watch?v=ATcZfX0G6R0" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/ATcZfX0G6R0/mqdefault.jpg" alt="白春のサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">白春</span>
                        </a>
                    </div>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-amber-700 mb-3">【🌙 哀愁のある曲が好き】</h3>
                    <div class="flex gap-4 flex-wrap">
                        <a href="https://www.youtube.com/watch?v=CgiHwiqNG1U" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/CgiHwiqNG1U/mqdefault.jpg" alt="仮初花火のサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">仮初花火(非公式)</span>
                        </a>
                        <a href="https://www.youtube.com/watch?v=lgsbJF94n6c" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/lgsbJF94n6c/mqdefault.jpg" alt="FloweBirdのサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">FloweBird</span>
                        </a>
                    </div>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-amber-700 mb-3">【🌌 世界観の出ている曲が好き】</h3>
                    <div class="flex gap-4 flex-wrap">
                        <a href="https://www.youtube.com/watch?v=v1SBoR8b8yY" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/v1SBoR8b8yY/mqdefault.jpg" alt="夜明けを合図にしてのサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">夜明けを合図にして</span>
                        </a>
                         <a href="https://www.youtube.com/watch?v=U4wHNKI3xzI" target="_blank" class="text-center">
                            <img src="https://i.ytimg.com/vi/U4wHNKI3xzI/mqdefault.jpg" alt="微かなルクスのサムネイル" class="youtube-thumbnail">
                            <span class="text-sm font-semibold">微かなルクス(非公式)</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- チケット入手方法 -->
        <section id="tickets" class="infographic-section">
            <h2 class="infographic-title"><i class="fas fa-ticket-alt"></i>チケットを手に入れよう</h2>
            <p class="text-center text-gray-700 mb-8">直接みてみたいと思ったら、チケットを買ってライブに参加しよう！</p>
            <div class="grid md:grid-cols-2 gap-8">
                <div class="text-center p-6 bg-gray-100 rounded-xl">
                    <i class="fas fa-desktop text-5xl text-amber-600 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">① 事前予約</h3>
                    <p class="text-gray-700">多くのライブは各種チケット販売サイトで事前予約ができます。ハルニシオン公式X(旧Twitter)の告知から予約ページに飛んで購入しましょう。</p>
                </div>
                <div class="text-center p-6 bg-gray-100 rounded-xl">
                    <i class="fas fa-door-open text-5xl text-amber-600 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">② 当日券</h3>
                    <p class="text-gray-700">事前予約で完売していなければ、当日券が販売されることがあります。販売の有無は当日発表されることも。料金は事前予約より1,000円程高くなるのが一般的です。</p>
                </div>
            </div>
        </section>

        <!-- ライブ観賞ルール -->
        <section id="live-rules" class="infographic-section">
            <h2 class="infographic-title"><i class="fas fa-volume-up"></i>ライブを楽しもう</h2>
            <div class="text-center mb-8">
                <p>ライブにはいくつかのルールがあります。みんなで守って最高の空間を作りましょう！</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8 text-center">
                <div class="p-4">
                    <div class="bg-red-100 text-red-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4">
                        <i class="fas fa-camera-retro"></i>
                    </div>
                    <h3 class="font-bold text-lg">撮影・録音は基本禁止</h3>
                    <p class="text-sm text-gray-600">ライブ中の写真撮影、動画撮影、録音は基本的にすべて禁止です。目に焼き付けて、心で感じてください！</p>
                </div>
                <div class="p-4">
                    <div class="bg-amber-100 text-amber-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4">
                        <i class="fas fa-people-arrows"></i>
                    </div>
                    <h3 class="font-bold text-lg">周りの人への配慮</h3>
                    <p class="text-sm text-gray-600">過度な割り込みや、周りの人の視界を遮るような大きな動きは避けましょう。譲り合いの気持ちが大切です。</p>
                </div>
                <div class="p-4">
                    <div class="bg-green-100 text-green-600 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4">
                        <i class="fas fa-hand-sparkles"></i>
                    </div>
                    <h3 class="font-bold text-lg">全力で楽しむ！</h3>
                    <p class="text-sm text-gray-600">一番大切なルールです！手拍子、振りコピ、声出し(可能な場合)でメンバーと一緒にライブを盛り上げましょう！</p>
                </div>
            </div>
            <div class="highlight-box">
                <h4 class="font-bold text-lg mb-2"><i class="fas fa-info-circle"></i> 撮影可能なイベントについて</h4>
                <p>イベントによっては、一部の曲や時間帯で写真・動画撮影が可能になる場合があります。その際は、以下の点を守って楽しみましょう。</p>
                <ul class="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>撮影可能なタイミングはメンバーやスタッフの案内に従ってください。</li>
                    <li>撮影時に他のお客様の観覧の妨げにならないよう、配慮をお願いします。（頭より高くカメラを上げない等）</li>
                    <li>事前に公式からルールが案内されている場合は、必ず一読しましょう。</li>
                </ul>
            </div>
        </section>

        <!-- 特典会レギュレーション -->
        <section id="benefits" class="infographic-section">
            <h2 class="infographic-title"><i class="fas fa-star"></i>特典会に参加してみよう</h2>
            <p class="text-center text-gray-700 mb-8">ライブの後は、メンバーと直接交流できる「特典会」があります。参加には特典券が必要です。</p>
            <div class="overflow-x-auto">
                <table class="table-custom">
                    <thead>
                        <tr>
                            <th>特典券の種類</th>
                            <th>価格</th>
                            <th>内容説明</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>トークあり券</strong><br>(サイン＋コメントありチェキ)</td>
                            <td>2,000円</td>
                            <td>好きなメンバーと2ショットチェキを撮影し、その場でチェキにサインとコメント、日付、名前を入れてもらえます。お話できる時間も一番長いです。<strong>※写メは選択できません</strong></td>
                        </tr>
                        <tr>
                            <td><strong>トークなし券</strong><br>(サインなしチェキ or 写メ)</td>
                            <td>1,000円</td>
                            <td>好きなメンバーと2ショットチェキ(サインなし)または写メを撮影します。<strong>※撮影後のお話はできません</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="highlight-box">
                <h4 class="font-bold text-lg mb-2"><i class="fas fa-info-circle"></i> お得な裏技＆注意点</h4>
                <ul class="list-disc list-inside text-sm mt-2 space-y-1">
                    <li><strong>「トークなし券」2枚</strong>で、<strong>「トークあり券」1枚</strong>と同じ内容（サインありチェキ＋トーク）に変更できます。</li>
                    <li>特典券の有効期限は、購入した月の末日までです。期間内であれば、次のライブで使えます！</li>
                </ul>
            </div>
        </section>

        <!-- 特典会の流れ -->
        <section class="infographic-section">
            <h2 class="infographic-title"><i class="fas fa-shoe-prints"></i>特典会の流れ</h2>
            <div class="flow-chart">
                <!-- Step 1 -->
                <div class="flow-step">
                    <div class="icon"><i class="fas fa-cash-register"></i></div>
                    <div class="text">
                        <h4 class="font-bold">① 物販ブースに並ぶ</h4>
                        <p>ライブ終了後、会場内に設置される物販ブースに並びます。列がある場合は最後尾に並び、もし「最後尾」カードがあれば受け取りましょう。</p>
                    </div>
                </div>
                <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
                <!-- Step 2 -->
                <div class="flow-step">
                    <div class="icon"><i class="fas fa-ticket-alt"></i></div>
                    <div class="text">
                        <h4 class="font-bold">② 特典券を購入する</h4>
                        <p>スタッフに希望の特典券の種類と枚数を伝えて購入します。お支払いは現金、クレジットカード、PayPay、交通系ICが使えます。</p>
                    </div>
                </div>
                <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
                <!-- Step 3 -->
                <div class="flow-step">
                    <div class="icon"><i class="fas fa-users"></i></div>
                    <div class="text">
                        <h4 class="font-bold">③ メンバーの列に並ぶ</h4>
                        <p>お目当てのメンバーの列に並びます。最後尾の人が持っている「最後尾」カードを受け取りましょう。</p>
                    </div>
                </div>
                <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
                 <!-- Step 4 -->
                <div class="flow-step">
                    <div class="icon"><i class="fas fa-handshake"></i></div>
                    <div class="text">
                        <h4 class="font-bold">④ 次の人が来たらカードを渡す</h4>
                        <p>自分の後ろに人が来たら、「最後尾こちらです」とカードを渡してあげましょう。</p>
                    </div>
                </div>
                <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
                <!-- Step 5 -->
                <div class="flow-step">
                    <div class="icon"><i class="fas fa-camera"></i></div>
                    <div class="text">
                        <h4 class="font-bold">⑤ 撮影スタッフに希望を伝える</h4>
                        <p>自分の番が来たら、チェキ撮影担当のスタッフに特典券を渡し、「ソロか2ショットか」「チェキか写メか」を伝えます。</p>
                    </div>
                </div>
                <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
                <!-- Step 6 -->
                <div class="flow-step">
                    <div class="icon"><i class="fas fa-user-friends"></i></div>
                    <div class="text">
                        <h4 class="font-bold">⑥ メンバーの隣で撮影！</h4>
                        <p>スタッフの案内に従ってメンバーの隣に立ち、ポーズをとって撮影！最高の思い出を作りましょう。</p>
                    </div>
                </div>
                <div class="flow-arrow"><i class="fas fa-arrow-down"></i></div>
                <!-- Step 7 -->
                <div class="flow-step">
                    <div class="icon"><i class="fas fa-comments"></i></div>
                    <div class="text">
                        <h4 class="font-bold">⑦ メンバーとお話しタイム</h4>
                        <p>撮影後、メンバーの前に移動してお話します。サインあり券の場合は、ここでサインを書いてもらいながらお話できます。時間が来たらスタッフに促されるので、感謝を伝えて終了です。</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 特典会の注意事項 -->
        <section class="infographic-section">
            <h2 class="infographic-title"><i class="fas fa-exclamation-triangle"></i>特典会の注意事項</h2>
            <ul class="note-list space-y-3 text-gray-800">
                <li>特典会に参加する直前に、大きな荷物は指定の場所に置いたり、スタッフに預けましょう。</li>
                <li>安全のため、メンバーの身体に直接触れる行為は禁止です。</li>
                <li>一度に出せる特典券は基本2枚までです。たくさんある場合は、再度並び直しましょう。</li>
                <li>メンバーが不快に感じるような発言や行動は絶対にやめましょう。</li>
                <li>チェキの撮り直しは、明らかに撮影に失敗している場合(目をつぶってしまった等)のみ可能です。</li>
                <li>写メ撮影は、他撮り(スタッフによる撮影)のみとなります。自撮りでの撮影はできません。</li>
            </ul>
        </section>

        <!-- リリースイベント特記事項 -->
        <section id="release-event" class="infographic-section gradient-bg rounded-2xl p-8">
             <h2 class="infographic-title text-white"><i class="fas fa-compact-disc"></i>リリースイベントについて</h2>
             <div class="text-center">
                <p class="mb-4">デジタルシングルの発売に伴うリリースイベント(リリイベ)は、通常のライブとルールが異なります。</p>
                <div class="bg-white/20 p-6 rounded-xl space-y-4 text-left">
                    <div class="flex items-start">
                        <i class="fas fa-ticket-alt text-2xl mt-1 mr-4"></i>
                        <div>
                            <h4 class="font-bold">観覧は基本無料！</h4>
                            <p class="text-sm">誰でも無料でライブを観覧できますが、「miim」アプリで対象商品を購入すると発行される「入場券ページ」を見せることで、整理番号順に優先入場ができます。</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <i class="fas fa-mobile-alt text-2xl mt-1 mr-4"></i>
                        <div>
                            <h4 class="font-bold">特典会も「miim」アプリで</h4>
                            <p class="text-sm">特典会への参加も「miim」アプリを使用します。アプリ内の「特典券ページ」をスタッフに提示してください。</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <i class="fas fa-id-card text-2xl mt-1 mr-4"></i>
                        <div>
                            <h4 class="font-bold">トレーディングカード交換</h4>
                            <p class="text-sm">事前購入金額に応じて、限定トレーディングカードがもらえます。交換場所は会場ごとに案内されるので、公式の告知をチェックしましょう。</p>
                        </div>
                    </div>
                </div>
                <p class="mt-4 text-sm">詳しい方法は、リリイベの告知をよく確認してください。</p>
             </div>
        </section>

        <!-- プレゼント・入場特典・ポイントカード -->
        <section id="more-info" class="infographic-section">
            <h2 class="infographic-title"><i class="fas fa-gift"></i>もっと楽しむための情報</h2>
            <div class="space-y-8">
                <!-- プレゼント -->
                <div>
                    <h3 class="font-bold text-xl mb-2 text-amber-700"><i class="fas fa-gift mr-2"></i>手紙・プレゼント</h3>
                    <p>メンバーへの手紙やプレゼントは、主催イベント時に設置されるプレゼントBOXに入れるか、物販スタッフに預けることで渡せます。ただし、生ものや現金・金券は受け取れません。</p>
                </div>
                <!-- 入場特典 -->
                <div>
                    <h3 class="font-bold text-xl mb-2 text-amber-700"><i class="fas fa-door-closed mr-2"></i>入場特典</h3>
                    <p>ライブやイベントごとに入場特典が付くことがあります。内容は毎回異なり、公式Xで告知されるので要チェック！</p>
                    <div class="bg-gray-100 p-4 rounded-lg mt-2 text-sm">
                        <p><strong>＜特典の例＞</strong></p>
                        <ul class="list-disc list-inside ml-2 mt-1">
                            <li>好きなメンバーと撮れる写メ券</li>
                            <li>サインありの特典券</li>
                            <li>ポイントカードの追加ポイント など</li>
                        </ul>
                    </div>
                </div>
                <!-- ポイントカード -->
                <div>
                    <h3 class="font-bold text-xl mb-2 text-amber-700"><i class="fas fa-star-half-alt mr-2"></i>ポイントカード</h3>
                    <p>ハルニシオンにはお得なポイントカードがあります！物販スタッフに声をかけて作ってもらいましょう。</p>
                     <div class="grid md:grid-cols-2 gap-4 mt-4 text-center">
                        <div class="bg-amber-100 p-4 rounded-lg">
                            <h4 class="font-bold">ポイントが貯まる条件</h4>
                            <p>ライブ入場毎に <strong class="text-amber-700">1pt</strong></p>
                            <p>物販5,000円購入毎に <strong class="text-amber-700">1pt</strong></p>
                        </div>
                        <div class="bg-amber-100 p-4 rounded-lg">
                            <h4 class="font-bold">ポイント特典</h4>
                            <p>累計10pt毎に <strong class="text-amber-700">クジ引き</strong></p>
                            <p>累計50ptで <strong class="text-amber-700">オリジナルTシャツ</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer class="text-center text-gray-500 mt-12 pb-4">
            <p>このガイドはファンが作成した非公式のものです。</p>
            <p>最新・正確な情報はハルニシオン公式SNSをご確認ください。</p>
        </footer>

    </main>

`;


const GuidePage = () => {
    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>ハルニシオン はじめてガイド</title>
                <script src="https://cdn.tailwindcss.com" async></script>
                <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <style dangerouslySetInnerHTML={{ __html: customStyles }} />
            </Head>
            <div className="bg-gray-50" dangerouslySetInnerHTML={{ __html: bodyContent }} />
        </>
    );
};

export default GuidePage;