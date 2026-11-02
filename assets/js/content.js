// NIWA ヒント小屋（スマホ版）の ことば と さくひん。
// 文は {ja, en} の組。表示は app.js が ことばの設定で選ぶ。
// 作品を足すときは WORKS に 1 つ足して、ROOMS の works に id を入れるだけ。

export const SITE = {
  name: 'NIWA',
  by: { ja: 'by Marcy Miwa', en: 'by Marcy Miwa' },
  // PC版（3D の温室）の URL。決まったらここに入れる（空なら案内だけ出す）。
  pcUrl: '',
  instagram: 'https://www.instagram.com/marcy.miwa/',
};

// 画面のことば
export const UI = {
  skipToList: { ja: 'もじだけの ページへ', en: 'Text-only page' },
  soundLabel: { ja: 'おと', en: 'Sound' },
  soundOn: { ja: 'ON', en: 'ON' },
  soundOff: { ja: 'OFF', en: 'OFF' },
  langLabel: { ja: 'ことば（日本語 / English）', en: 'Language (日本語 / English)' },
  back: { ja: 'もどる', en: 'Back' },
  close: { ja: 'とじる', en: 'Close' },
  speaker: { ja: 'まーしー', en: 'Marcy' },
  stage: { ja: 'ヒント小屋', en: 'The Hint Hut' },
  window: { ja: 'マーシーの窓', en: "Marcy's window" },
  details: { ja: 'くわしく', en: 'Details' },
  year: { ja: 'とし', en: 'Year' },
  place: { ja: 'ばしょ', en: 'Place' },
  format: { ja: 'かたち', en: 'Format' },
  room: { ja: 'へや', en: 'Room' },
  materials: { ja: 'そざい', en: 'Materials' },
  allWorks: { ja: 'さくひん いちらん', en: 'All works' },
  pcOnly: {
    ja: 'この へやの なかは PC版の 温室で あるいて みられるよ。',
    en: 'You can walk inside this room in the PC version of the greenhouse.',
  },
  tbd: { ja: 'じゅんびちゅう', en: 'Coming soon' },
  textOnly: { ja: 'もじだけの ページ', en: 'Text-only page' },
};

// へや（温室の壁ぎわの扉）
export const ROOMS = [
  {
    id: 'kaichiku', no: 1, color: '#ff6a2b',
    name: { ja: '解築停留所', en: 'Kaichiku Bus Stop' },
    about: {
      ja: 'とうじの 展示ばしょを そのまま 再現した へや。インスタレーションを みたり さわったり できるよ。',
      en: 'A room that recreates the original exhibition space. You can see and touch the installations.',
    },
    works: ['saigo-no-yosooi', 'matsugo-no-uruoi', 'kakawaru', 'tension'],
  },
  {
    id: 'cura', no: 2, color: '#f23a9a',
    name: { ja: '個展 CURA', en: 'Solo Exhibition CURA' },
    about: {
      ja: 'わたしの 個展の へや。代表作が いるよ。ながおしで さわってみてね。',
      en: 'The room of my solo show, home of my main piece. Press and hold to touch it.',
    },
    works: ['you-touch-me'],
  },
  {
    id: 'blankspace', no: 3, color: '#33d6b4',
    name: { ja: 'blankspace', en: 'blankspace' },
    about: {
      ja: 'プロトタイプの おきば。ためしに つくった ものたちが ならんでる。',
      en: 'A place for prototypes — things I made to try ideas out.',
    },
    works: ['iine-game'],
  },
  {
    id: 'vj', no: 4, color: '#6f86ff',
    name: { ja: 'VJ 体験ブース', en: 'VJ Booth' },
    about: {
      ja: '渋谷の VJ で つかった ものたち。デッキで 映像を まぜて あそべるよ。ノリノリで どうぞ！',
      en: 'Things I used for VJ sets in Shibuya. Mix visuals on the deck — get groovy!',
    },
    works: ['playful-classics'],
  },
  {
    id: 'shop', no: 5, color: '#ffbe2e',
    name: { ja: '販売ブース', en: 'Shop' },
    about: {
      ja: '電子工作・物理作品・NFT アートを おいている お店。',
      en: 'A little shop of electronics, physical works and NFT art.',
    },
    works: ['chocolate', 'lighting'],
  },
];

// 庭にある もの（へやの外）
export const GARDEN = {
  id: 'garden', no: 0, color: '#a8e032',
  name: { ja: '庭', en: 'The Garden' },
  about: {
    ja: '温室の まんなかの 庭。らせん階段が あって、のぼれるよ。',
    en: 'The garden at the heart of the greenhouse, with a spiral staircase you can climb.',
  },
  works: ['tsukuru-koto'],
};

// さくひん
export const WORKS = [
  {
    id: 'you-touch-me', room: 'cura', featured: true, motif: 'mirror',
    title: { ja: 'You touch me, and I mirror you.', en: 'You touch me, and I mirror you.' },
    year: '2026', place: { ja: 'TOKYO', en: 'Tokyo' },
    format: { ja: 'インスタレーション', en: 'Installation' },
    caption: {
      ja: 'ふれると、光と音が ながれだす。ふれた手を、作品が うつしかえす。',
      en: 'Touch it, and light and sound begin to flow. The work mirrors the hand that touches it.',
    },
    point: { ja: '万物に おもいやりを もつこと。', en: 'Having compassion for all things.' },
    links: [],
  },
  {
    id: 'tsukuru-koto', room: 'garden', featured: true, motif: 'spiral',
    title: { ja: 'つくることは、生きること。', en: 'To Make Is to Live.' },
    year: '2026', place: { ja: 'TOKYO', en: 'Tokyo' },
    format: { ja: 'エッセイ', en: 'Essay' },
    caption: {
      ja: 'エッセイを 3D の らせん階段に くみなおした。一段ずつ のぼりながら よむ。',
      en: 'An essay rebuilt as a 3D spiral staircase, read one step at a time as you climb.',
    },
    point: { ja: '関わりを もつことへの いとおしさ。', en: 'The tenderness of being connected.' },
    links: [],
  },
  {
    id: 'saigo-no-yosooi', room: 'kaichiku', motif: 'lip',
    title: { ja: '最期のよそおい', en: 'Final Adornment' },
    year: '2026', place: { ja: '解築停留所', en: 'Kaichiku' },
    format: { ja: 'インスタレーション', en: 'Installation' },
    caption: {
      ja: '3D データに リップを ぬって あそべる インスタレーション。',
      en: 'An installation where you can play by putting lipstick on 3D data.',
    },
    links: [],
  },
  {
    id: 'matsugo-no-uruoi', room: 'kaichiku', motif: 'drop',
    title: { ja: '末期のうるおい', en: 'Last Moisture' },
    year: '2026', place: { ja: '解築停留所', en: 'Kaichiku' },
    format: { ja: 'インスタレーション', en: 'Installation' },
    caption: { ja: '', en: '' },
    links: [],
  },
  {
    id: 'kakawaru', room: 'kaichiku', motif: 'knot',
    title: { ja: 'かかわる', en: 'Kakawaru (To Relate)' },
    year: '2026', place: { ja: '解築停留所', en: 'Kaichiku' },
    format: { ja: 'インスタレーション', en: 'Installation' },
    caption: { ja: '', en: '' },
    links: [],
  },
  {
    id: 'tension', room: 'kaichiku', motif: 'spark',
    title: { ja: '私のテンションが高いわけ', en: 'Why My Energy Is So High' },
    year: '2026', place: { ja: '解築停留所', en: 'Kaichiku' },
    format: { ja: 'エッセイのインスタレーション', en: 'Essay installation' },
    caption: {
      ja: 'エッセイを インスタレーションに した。とうじの ようすを 再現する。',
      en: 'An essay turned into an installation, recreating the day it was shown.',
    },
    links: [],
  },
  {
    id: 'iine-game', room: 'blankspace', motif: 'node',
    title: { ja: 'いいのゲーム（仮）', en: 'The “Good” Game (working title)' },
    year: '2026', place: { ja: '', en: '' },
    format: { ja: 'TouchDesigner（.tox）', en: 'TouchDesigner (.tox)' },
    caption: { ja: '', en: '' },
    links: [],
  },
  {
    id: 'playful-classics', room: 'vj', motif: 'wave',
    title: { ja: 'Playful Classics', en: 'Playful Classics' },
    year: '2026', place: { ja: 'TOKYO', en: 'Tokyo' },
    format: { ja: '映像作品', en: 'Video' },
    caption: {
      ja: 'クラシックの 演奏の 音と うごく 映像。',
      en: 'Visuals that move with live classical music.',
    },
    links: [],
  },
  {
    id: 'chocolate', room: 'shop', motif: 'choco',
    title: { ja: 'チョコレートのやつ（仮）', en: 'The Chocolate One (working title)' },
    year: '2026', place: { ja: '', en: '' },
    format: { ja: 'Web サイト', en: 'Website' },
    caption: { ja: '', en: '' },
    links: [],
  },
  {
    id: 'lighting', room: 'shop', motif: 'lamp',
    title: { ja: '照明作品（仮）', en: 'Lighting Work (working title)' },
    year: '2026', place: { ja: '', en: '' },
    format: { ja: '立体', en: 'Object' },
    caption: { ja: '', en: '' },
    links: [],
  },
];

// まーしーの ことば
export const TALK = {
  greeting: [
    { ja: 'やっほー！ まーしーだよ。', en: "Hi there! I'm Marcy." },
    { ja: 'ここは ヒント小屋。\nNIWA（塔の中の温室）の まんなかに あるよ。', en: "This is the Hint Hut,\nright in the middle of NIWA — a greenhouse inside a tower." },
    { ja: 'なにか ききたいこと ある？', en: 'Anything you want to ask?' },
  ],
  again: [
    { ja: 'ほかに ききたいこと ある？', en: 'Anything else?' },
  ],
  mutterings: [
    { ja: '関係性を むすぶことで、作品が うまれるんだ。', en: 'Works are born from tying relationships together.' },
    { ja: '温室なのは、あたたかい ほうが すきだから。', en: "It's a greenhouse because I like it warm." },
    { ja: 'ノードって、結び目の ことなんだよ。', en: 'A “node” is a knot, you know.' },
    { ja: 'まよったら、いつでも この 小屋に もどってきてね。', en: 'If you get lost, come back to this hut anytime.' },
  ],
  commands: [
    {
      id: 'howto', icon: '?',
      label: { ja: 'あそびかた', en: 'How to play' },
      lines: [
        { ja: 'ここは スマホ版の ヒント小屋。\nこの 窓で わたしと はなせるよ。', en: "This is the phone version of the Hint Hut.\nYou can talk with me in this window." },
        { ja: 'ことばを タップすると つぎへ すすむよ。\nえらびたい ものを タップしてね。', en: 'Tap the text to continue.\nTap whatever you want to choose.' },
        { ja: 'わたしを タップすると、ひとりごとを いうよ。', en: "Tap me and I'll mumble something." },
        { ja: 'PC で ひらくと、温室の なかを あるいて へやを まわれるよ。', en: 'Open this on a computer to walk around the greenhouse and visit the rooms.' },
      ],
    },
    { id: 'rooms', icon: '◇', label: { ja: 'へやのこと', en: 'The rooms' } },
    { id: 'take', icon: '→', label: { ja: 'つれていって', en: 'Take me there' } },
    { id: 'works', icon: '★', label: { ja: 'さくひん いちらん', en: 'All works' } },
    {
      id: 'me', icon: '♡',
      label: { ja: 'まーしーのこと', en: 'About Marcy' },
      lines: [
        { ja: 'わたしは まーしー（三輪 万裕子）。\nクリエイティブテクノロジスト だよ。', en: "I'm Marcy (Mayuko Miwa),\na creative technologist." },
        { ja: '見る人の ふるまいで かわる、インタラクティブな 作品を つくってる。', en: 'I make interactive works that change with how people behave around them.' },
        { ja: 'TouchDesigner や Blender で、映像と 音と 光を むすんでるよ。', en: 'I tie together visuals, sound and light with TouchDesigner and Blender.' },
      ],
    },
    {
      id: 'contact', icon: '✉',
      label: { ja: 'れんらく', en: 'Contact' },
      lines: [
        { ja: 'いっしょに なにか つくりたい？ うれしい！', en: 'Want to make something together? Yay!' },
        { ja: 'Instagram の DM に きがるに れんらくしてね。', en: 'Feel free to send me a DM on Instagram.' },
      ],
      links: [{ label: { ja: 'Instagram @marcy.miwa', en: 'Instagram @marcy.miwa' }, url: 'https://www.instagram.com/marcy.miwa/' }],
    },
    {
      id: 'bye', icon: '✿',
      label: { ja: 'またね', en: 'See you' },
      lines: [
        { ja: 'きてくれて ありがとう！', en: 'Thanks for coming!' },
        { ja: 'また いつでも あそびにきてね。\nまたね〜！', en: 'Come back and play anytime.\nSee you!' },
      ],
    },
  ],
  roomsIntro: [
    { ja: '温室の かべぎわに、とびらが 5 まい あるよ。\nどの へやの はなしを きく？', en: 'There are five doors along the greenhouse walls.\nWhich room do you want to hear about?' },
  ],
  takeIntro: [
    { ja: 'どこに いく？', en: 'Where do you want to go?' },
  ],
  worksIntro: [
    { ja: 'これまでの さくひんだよ。きになる ものを タップしてね。', en: 'Here are my works so far. Tap one that catches your eye.' },
  ],
  enterRoom: { ja: '{room} に つれていくね！', en: "Let's go to {room}!" },
  roomEmpty: { ja: 'この へやは いま じゅんびちゅう。もう ちょっと まってね。', en: "This room is still being set up. Hang on a little longer!" },
};
