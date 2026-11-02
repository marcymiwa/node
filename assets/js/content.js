// NIWA ヒント小屋（スマホ版）の ことば と さくひん。
// 文は {ja, en} の組。表示は app.js が ことばの設定で選ぶ。
// PC版（塔の中の温室）の ことば（content.js / tower の会話）を そのまま使っている。
// スマホにあわせて書きかえたのは「あそびかた」だけ（PC版は キーボードの説明のため）。
// 作品を足すときは WORKS に 1 つ足して、ROOMS の works に id を入れるだけ。

export const SITE = {
  name: 'NIWA',
  // PC版（3D の温室）の URL。公開したら ここに入れる（空なら ボタンを出さない）。
  pcUrl: '',
  textUrl: './list.html',
  contact: {
    email: 'contact@marcymiwa.com',
    instagram: { handle: '@marcy.miwa', url: 'https://www.instagram.com/marcy.miwa/' },
    pdf: null, // ポートフォリオの PDF（できたら URL を入れる）
  },
};

// 画面のことば
export const UI = {
  by: { ja: 'by Marcy Miwa', en: 'by Marcy Miwa' },
  skipToList: { ja: 'もじだけの ページへ', en: 'Text-only page' },
  soundLabel: { ja: 'おと', en: 'Sound' },
  soundOn: { ja: 'おとあり', en: 'On' },
  soundOff: { ja: 'おとなし', en: 'Off' },
  langLabel: { ja: '使用言語（日本語 / English）', en: 'Language (日本語 / English)' },
  back: { ja: 'もどる', en: 'Back' },
  close: { ja: 'とじる', en: 'Close' },
  speaker: { ja: 'まーしー', en: 'Marcy' },
  stage: { ja: 'ヒント小屋', en: 'The hint hut' },
  window: { ja: 'マーシーの窓', en: "Marcy's window" },
  talkAgain: { ja: 'はなす', en: 'Talk' },
  details: { ja: 'くわしく', en: 'More' },
  year: { ja: '制作年', en: 'Year' },
  place: { ja: '場所', en: 'Place' },
  format: { ja: '形式', en: 'Format' },
  room: { ja: 'へや', en: 'Room' },
  spot: { ja: 'へやの どこ', en: 'Where' },
  approach: { ja: '近づくと', en: 'Up close' },
  point: { ja: 'この作品で伝えたい一点', en: 'The one thing' },
  caption: { ja: 'キャプション', en: 'Caption' },
  featured: { ja: '代表作', en: 'Featured' },
  allWorks: { ja: 'さくひん いちらん', en: 'Works' },
  garden: { ja: '庭', en: 'Garden' },
  soon: { ja: 'じゅんびちゅう', en: 'Coming soon' },
  textOnly: { ja: 'もじだけの ページ', en: 'Text-only page' },
  pcOnly: {
    ja: 'この へやの なかは、パソコンの 3D の温室で あるいて みられるよ。',
    en: 'On a computer, you can walk around inside this room in the 3D greenhouse.',
  },
  openPc: { ja: '3D の温室へ', en: 'Enter the 3D greenhouse' },
  clips: { ja: '映像', en: 'Clips' },
  items: { ja: 'おいている もの', en: 'In the shop' },
  gyro: { ja: 'かたむけて みる', en: 'Tilt to look' },
  recenter: { ja: 'しょうめん', en: 'Face the hut' },
  lookHint: { ja: 'スマホを かたむけるか、ドラッグで まわりを みられるよ。', en: 'Tilt your phone or drag to look around.' },
  gyroNo: { ja: 'かたむきが つかえないみたい… ドラッグで みてね。', en: "Tilt isn't available… drag to look around." },
};

// へや（温室の かべの 階段の とびら）。色は lab candy の着せかえの色。
export const ROOMS = [
  {
    id: 'kaichiku', no: 1, color: '#a8e032',
    name: { ja: '解築停留所', en: 'Kaichiku Teiryujo' },
    lede: {
      ja: '当時の展示場所(旧高島第七小学校)を、スキャンで再現した部屋。教室・廊下・トイレ。',
      en: 'The original venue, the former Takashima No.7 Elementary School, recreated from 3D scans: a classroom, a hallway and a toilet.',
    },
    works: ['yosooi', 'kakawaru', 'uruoi', 'tension'],
  },
  {
    id: 'cura', no: 2, color: '#9d7eff',
    name: { ja: '個展CURA', en: 'Solo Exhibition CURA' },
    lede: {
      ja: '当時の展示場所を再現した部屋。You touch me, and I mirror you.',
      en: 'A room that recreates the original venue. You touch me, and I mirror you.',
    },
    works: ['touch'],
  },
  {
    id: 'blankspace', no: 3, color: '#eef3ff', soon: true,
    name: { ja: 'blankspace', en: 'blankspace' },
    lede: { ja: 'プロトタイプ置き場。いまは じゅんびちゅう。', en: 'A place for prototypes. Coming soon.' },
    works: [],
  },
  {
    id: 'vj', no: 4, color: '#ff33a8',
    name: { ja: 'VJ体験ブース', en: 'VJ Booth' },
    lede: {
      ja: '渋谷でVJしたときの映像たち。デッキにさわると、つぎの映像にきりかわる。',
      en: 'Visuals from my VJ set in Shibuya. Touch the deck to switch to the next clip.',
    },
    works: [],
    // PC版の デッキで きりかわる 7 本（2026-08-15 OR SHIBUYA）
    clips: [
      { id: '01', name: 'thermal field', colors: ['#ff33a8', '#ffbe2e', '#2f4fb8'] },
      { id: '02', name: 'editorial grid', colors: ['#fff6e9', '#2a2140', '#f23a9a'] },
      { id: '03', name: 'thermal contour', colors: ['#ff6a2b', '#9d7eff', '#33d6b4'] },
      { id: '04', name: 'riso halftone', colors: ['#2f4fb8', '#f23a9a', '#fff6e9'] },
      { id: '05', name: 'heat matrix', colors: ['#ffbe2e', '#ff33a8', '#2a2140'] },
      { id: '07', name: 'bayer dither', colors: ['#a8e032', '#2a2140', '#eef3ff'] },
      { id: '08', name: 'crt bars', colors: ['#6f86ff', '#ff33a8', '#33d6b4'] },
    ],
  },
  {
    id: 'shop', no: 5, color: '#ffbe2e', soon: true,
    name: { ja: '販売ブース', en: 'Shop' },
    lede: {
      ja: '電子工作、物理作品、NFTアート。ご依頼・ご購入はお問い合わせください。',
      en: 'Electronics, physical works and NFT art. For commissions and purchases, please get in touch.',
    },
    works: [],
    items: [
      { ja: '電子工作', en: 'Electronics' },
      { ja: '物理作品', en: 'Physical works' },
      { ja: 'NFTアート', en: 'NFT art' },
    ],
  },
];

// 庭（とびらの 外。らせん階段がある）
export const GARDEN = {
  id: 'garden', no: 0, color: '#33d6b4',
  name: { ja: '庭', en: 'Garden' },
  lede: {
    ja: '温室の まんなかの 庭。らせん階段「つくることは、生きること。」は のぼれるよ。',
    en: 'The garden in the middle of the greenhouse. You can climb the spiral staircase, “To make is to live.”',
  },
  works: ['tsukuru'],
};

// さくひん（いちらんの じゅんばん: PC版と おなじ）
export const WORKS = [
  {
    id: 'touch', room: 'cura', hero: true, motif: 'mirror',
    title: { ja: 'You touch me, and I mirror you.', en: 'You touch me, and I mirror you.' },
    year: '2026',
    place: { ja: '個展「CURA」／東京', en: 'Solo exhibition “CURA”, Tokyo' },
    format: { ja: 'インスタレーション', en: 'Installation' },
    lede: {
      ja: 'touch-reactiveな作品で、ミラーニューロンの外部化を試みました。',
      en: 'A touch-reactive work that attempts to externalize mirror neurons.',
    },
    approach: { ja: '近づくと、光と音が流れ出す。', en: 'Come closer, and light and sound begin to flow.' },
    point: { ja: '万物に思いやりをもつこと。', en: 'To hold compassion for all things.' },
    // 展示のキャプション（会場で 使ったもの）
    caption: {
      ja: 'どうぞ、そっとお花に\nあるいはだれかに触れてみてください。\n触れると空間に光が広がります。\nそれはお花が喜んでいるように 見えるかもしれませんが、\nあなた自身の心の中に生まれた 「よろこび」の形でもあります。\n私たちには、他者の感情を鏡のように映し出す\n不思議な働きがあります。\nあなたが触れて生まれた優しい光は\nそれを見た誰かの心にも反射し\nあたたかな癒しを届けます。\n誰かを大切に思うことはあなたをCURAすること\nあなたを大切に思うことは誰かをCURAすること\n私とあなた、ヒトとモノ。\n触れ合うことで境界線は静かに溶け合い、\nあなたの幸せが、いつの間にか誰かを癒していく。\nここから始まる、絶え間ない 「癒し」の循環に\nどうかゆっくりと身をゆだねてみてください。',
      en: 'Please, gently touch the flowers,\nor perhaps someone beside you.\nAs you touch, light spreads across the space.\nIt may seem as though the flowers are rejoicing, but it is also the shape of the “joy”\nborn within your own heart.\nWe possess a wondrous ability\nto reflect the emotions of others like a mirror.\nThe gentle light born from your touch will reflect in the hearts of those who see it, delivering a warm sense of healing.\nTo cherish someone is to CURA yourself.\nTo cherish yourself is to CURA someone else.\nYou and I, people and things.\nThrough touch, our boundaries quietly melt away, and your happiness, before you know it, heals another.\nPlease, slowly surrender yourself to this endless cycle of healing that begins right here.',
    },
  },
  {
    id: 'tsukuru', room: 'garden', hero: true, motif: 'spiral',
    title: { ja: 'つくることは、生きること。', en: 'つくることは、生きること。' },
    subtitle: { ja: '', en: 'To make is to live.' },
    year: '2026',
    place: { ja: '東京', en: 'Tokyo' },
    format: { ja: 'エッセイ', en: 'Essay' },
    approach: { ja: '近づくと、徐々に階段をのぼっていく。', en: 'Come closer, and you gradually climb the stairs.' },
    point: { ja: '関わりをもつことへの愛おしさ。', en: 'The tenderness of being involved with one another.' },
  },
  {
    id: 'yosooi', room: 'kaichiku', motif: 'lip',
    title: { ja: '最期のよそおい', en: '最期のよそおい' },
    year: '2026',
    place: { ja: '解築停留所(旧高島第七小学校)／東京', en: 'Kaichiku Teiryujo (former Takashima No.7 Elementary School), Tokyo' },
    spot: { ja: '教室', en: 'Classroom' },
    format: { ja: 'インスタレーション', en: 'Installation' },
    lede: { ja: '廃校に死に化粧を施しました。', en: 'I applied death makeup to a closed-down school.' },
  },
  {
    id: 'kakawaru', room: 'kaichiku', motif: 'knot',
    title: { ja: 'かかわる', en: 'かかわる' },
    year: '2026',
    place: { ja: '解築停留所(旧高島第七小学校)／東京', en: 'Kaichiku Teiryujo (former Takashima No.7 Elementary School), Tokyo' },
    spot: { ja: '奥のトイレ', en: 'The toilet at the back' },
    format: { ja: 'インスタレーション', en: 'Installation' },
  },
  {
    id: 'uruoi', room: 'kaichiku', motif: 'drop',
    title: { ja: '末期のうるおい', en: '末期のうるおい' },
    year: '2026',
    place: { ja: '解築停留所(旧高島第七小学校)／東京', en: 'Kaichiku Teiryujo (former Takashima No.7 Elementary School), Tokyo' },
    spot: { ja: '教室の中', en: 'Inside the classroom' },
    format: { ja: 'インスタレーション', en: 'Installation' },
    lede: {
      ja: '廃校アートの第2弾で、末期の水を模したtouch-reactiveな作品です。',
      en: 'The second closed-school piece: a touch-reactive work modeled on matsugo-no-mizu, the last water offered to the dying.',
    },
  },
  {
    id: 'tension', room: 'kaichiku', motif: 'spark',
    title: { ja: '私のテンションが高いわけ', en: '私のテンションが高いわけ' },
    year: '2026',
    place: { ja: '解築停留所(旧高島第七小学校)／東京', en: 'Kaichiku Teiryujo (former Takashima No.7 Elementary School), Tokyo' },
    spot: { ja: '廊下', en: 'Hallway' },
    format: { ja: 'エッセイのインスタレーション', en: 'Essay installation' },
  },
];

// まーしーの ことば（PC版の マーシーの窓と おなじ）
export const TALK = {
  hello: { ja: 'やっほー！', en: 'Hey there!' },
  intro: { ja: 'まーしーだよ。ここは わたしの 庭。', en: "I'm Marcy. This is my garden." },
  murmurs: [
    { ja: '温室なのは、あたたかいほうが好きだから。', en: "It's a greenhouse because I like it warm." },
    { ja: 'ここは庭であり、土間でもある場所。', en: 'This is a garden, and also a doma — an earthen floor under a roof.' },
    { ja: 'つくることは、生きること。', en: 'To make is to live.' },
    { ja: '万物に思いやりをもつこと。', en: 'Hold compassion for all things.' },
    { ja: '関係性を結ぶことで、作品たちは生まれる。', en: 'Works are born from tying relationships together.' },
    { ja: 'node は結び目。TouchDesigner も Blender も、関係性でできてる。', en: 'A node is a knot. TouchDesigner and Blender are made of relationships, too.' },
    { ja: 'この庭では、あなたのふるまいが世界に映るよ。', en: 'In this garden, the way you move is reflected in the world.' },
  ],
  menuAgain: { ja: 'ほかに ききたいことは ある？', en: 'Anything else you would like to know?' },

  // メインの コマンド（PC版と おなじ じゅんばん）
  menu: [
    { id: 'howto', label: { ja: 'あそびかた', en: 'How to play' } },
    { id: 'rooms', label: { ja: 'へやのこと', en: 'The rooms' } },
    { id: 'works', label: { ja: 'さくひん', en: 'Works' } },
    { id: 'about', label: { ja: 'まーしーのこと', en: 'About Marcy' } },
    { id: 'bye', label: { ja: 'またね', en: 'See you' } },
  ],

  // スマホ版の あそびかた（PC版は W A S D の説明なので、さわりかたに書きかえた）
  howto: [
    { ja: 'ここは ヒント小屋。この まどで わたしと はなせるよ。', en: 'This is the hint hut. You can talk with me in this window.' },
    { ja: 'もじを タップすると つぎへ。えらびたい ものを タップしてね。', en: 'Tap the text to go on, and tap whatever you want to choose.' },
    { ja: 'かべの とびらを タップすると、その へやの はなしが きけるよ。わたしを タップすると ひとりごと。', en: 'Tap a door on the wall to hear about that room. Tap me and I will mumble something.' },
    { ja: 'パソコンで ひらくと、温室の なかを あるいて へやに はいれるよ。', en: 'On a computer, you can walk around the greenhouse and go into the rooms.' },
  ],

  roomsAsk: { ja: 'どの へやの はなしを きく？', en: 'Which room would you like to hear about?' },
  take: { ja: 'つれていって', en: 'Take me there' },
  going: { ja: 'いってらっしゃい！', en: 'Off you go!' },

  // とびらを タップしたとき
  door: { is: { ja: 'の とびらだ。', en: ' — a door.' }, ask: { ja: 'はいる？', en: 'Go in?' } },
  enter: { ja: 'はいる', en: 'Go in' },
  cancel: { ja: 'やめる', en: 'Not now' },

  about: [
    { ja: 'We are born curators of our souls.', en: 'We are born curators of our souls.' },
    { ja: 'アーティスト、キュレーター。クリエイティブコーディングをしています。', en: 'I am an artist and curator. I am into creative coding.' },
    { ja: 'TouchDesigner / Blender / Resolume Avenue / DMX', en: 'TouchDesigner / Blender / Resolume Avenue / DMX' },
  ],
  contact: { ja: 'れんらくは こちら\ncontact@marcymiwa.com\nInstagram @marcy.miwa', en: 'Get in touch\ncontact@marcymiwa.com\nInstagram @marcy.miwa' },
  contactLabel: { ja: 'れんらく', en: 'Contact' },
  mail: { ja: 'メール', en: 'Email' },

  byeShort: { ja: 'またね！', en: 'See you!' },
  farewell: { ja: 'きてくれて ありがとう！ さくひんの いちらんは ここから みられるよ。', en: 'Thanks for coming! You can find the list of works here.' },
  farewellPdf: { ja: 'きてくれて ありがとう！ さくひんの いちらんと PDF は ここから みられるよ。', en: 'Thanks for coming! You can find the list of works and the PDF here.' },

  worksAsk: { ja: 'どの さくひんを みる？', en: 'Which work would you like to see?' },
};
