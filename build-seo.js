/* build-seo.js — add SEO + author signature to every games-core game.
   For each game: (1) a top-of-file ownership comment, (2) a <head> SEO block
   (description, keywords, canonical, Open Graph, Twitter, JSON-LD VideoGame with
   ManhDS as author + allin1site.com as publisher), and (3) a discreet on-page
   "allin1site.com" credit link + a styled console signature.
   Idempotent (marked regions). Run:  node build-seo.js */
const fs = require('fs');
const path = require('path');

const AUTHOR = 'ManhDS';
const EMAIL  = 'manhdauvn09@gmail.com';
const SITE   = 'https://allin1site.com';
const YEAR   = '2026';

// base, subdomain, name, theme, lang, description
const G = [
  ['2048','2048','2048','#0b1020','vi','Chơi 2048 online miễn phí — vuốt gộp số, chinh phục ô 2048 và phá kỷ lục. Mượt trên điện thoại & PC.'],
  ['anipang','anipang','Anipang Match-3','#0b1020','vi','Anipang Match-3: xếp 3 viên cùng màu ăn điểm, combo mãn nhãn. Game xếp hình chơi miễn phí online.'],
  ['baucua','baucua','Bầu Cua Tôm Cá','#0b1020','vi','Bầu Cua Tôm Cá online — lắc xúc xắc dân gian, đặt cửa ăn tiền. Chơi miễn phí, vui ngày Tết.'],
  ['blockpuzzle','blockpuzzle','Block Puzzle','#0b1020','vi','Block Puzzle: đặt khối lấp đầy hàng và cột để phá, thử thách trí tuệ. Chơi miễn phí online.'],
  ['caro','caro','Cờ Caro','#0b1020','vi','Cờ Caro (Gomoku) online — đấu với máy hoặc bạn bè, đủ 5 quân là thắng. Miễn phí trên mọi thiết bị.'],
  ['cocangua','cocangua','Cờ Cá Ngựa','#0b1020','vi','Cờ Cá Ngựa online — tung xúc xắc đua ngựa về đích, chơi cùng 3 bot. Miễn phí, giải trí gia đình.'],
  ['dalgona','dalgona','Dalgona Honeycomb','#0b1020','vi','Dalgona Honeycomb — khắc hình kẹo đường như Squid Game, khéo tay mới thắng. Chơi miễn phí online.'],
  ['flappy','flappy','Flappy','#0b1026','vi','Flappy online — vỗ cánh né ống, ghi điểm cao. Đơn giản mà gây nghiện, chơi miễn phí trên web.'],
  ['jumphop','jumphop','Jump Hop','#0b1020','vi','Jump Hop 跳一跳 — canh lực nhảy qua bệ, càng xa càng nhiều điểm. Game canh nhịp chơi miễn phí.'],
  ['mahjong','mahjong','Mahjong Solitaire','#0b1020','ja','Mahjong Solitaire (麻雀ソリティア) — ghép cặp quân bài giống nhau để dọn sạch bàn. Miễn phí, thư giãn.'],
  ['nonogram','nonogram','Nonogram','#0b1020','vi','Nonogram (Picross) — giải câu đố logic theo số để lộ bức hình. Rèn tư duy, chơi miễn phí online.'],
  ['oanquan','oanquan','Ô Ăn Quan','#0b1020','vi','Ô Ăn Quan online — cờ dân gian Việt Nam, rải sỏi ăn quan. Đấu với máy, chơi miễn phí.'],
  ['otoshi','otoshi','Daruma Otoshi','#0b1020','ja','Daruma Otoshi (だるま落とし) — gõ văng từng khối mà giữ daruma đứng vững. Game khéo tay chơi miễn phí.'],
  ['pikachu','pikachu','Pikachu Connect','#0b1020','vi','Pikachu Connect — nối 2 hình giống nhau bằng đường gấp ≤3 đoạn để xóa. Kinh điển, chơi miễn phí.'],
  ['puyo','puyo','Puyo Puyo','#0b1020','vi','Puyo Puyo — xếp 4 puyo cùng màu để nổ chuỗi combo. Game giải đố màu sắc chơi miễn phí online.'],
  ['redlight','redlight','Red Light Green Light','#0b1020','vi','Red Light Green Light — chạy khi đèn xanh, đứng im khi đèn đỏ như Squid Game. Chơi miễn phí online.'],
  ['suika','suika','Suika','#0b1020','vi','Suika (game dưa hấu) — thả và gộp trái cây thành dưa hấu, vật lý mãn nhãn. Chơi miễn phí online.'],
  ['taiko','taikorhythm','Taiko Rhythm','#0b1020','ja','Taiko Rhythm (太鼓リズム) — gõ trống theo nhịp Don/Ka, game âm nhạc gây nghiện. Chơi miễn phí online.'],
  ['tetris','tetris','Tetris','#0b1020','vi','Tetris online — xoay và xếp khối, phá hàng ghi điểm. Game kinh điển mọi thời đại, chơi miễn phí.'],
  ['tilematch','tilematch','Tile Match 3D','#0b1020','vi','Tile Match 3D — chọn 3 ô giống nhau để xóa, dọn sạch bàn. Game giải đố gây nghiện, chơi miễn phí.'],
  ['typing-race','type','Đua Gõ Phím','#0a0e1a','vi','Đua Gõ Phím — luyện gõ nhanh và chính xác, đua tốc độ typing. Cải thiện kỹ năng, chơi miễn phí online.'],
  ['vampire','vampire','Vampire Survivors','#0b1020','vi','Vampire Survivors — sống sót trước biển quái, lên cấp và nâng vũ khí. Game bắn sinh tồn chơi miễn phí.'],
  ['watersort','watersort','Water Sort','#0b1020','vi','Water Sort Puzzle — rót nước phân loại từng màu vào đúng ống. Game giải đố thư giãn chơi miễn phí online.'],
];

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function reEsc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

const SIG_COMMENT = '<!-- ManhDS-signature :: © ' + YEAR + ' ' + AUTHOR
  + ' · ' + EMAIL + ' · ' + SITE + ' :: Toàn bộ game do ' + AUTHOR + ' tạo. All rights reserved. -->';

// Discreet on-page credit link + console signature (identical for every game).
const SIG_SCRIPT =
  '(function(){try{'
  + 'document.addEventListener("DOMContentLoaded",function(){'
  + 'var a=document.createElement("a");a.href="' + SITE + '";a.target="_blank";a.rel="noopener";'
  + 'a.textContent="allin1site.com";a.title="Game by ' + AUTHOR + ' · ' + EMAIL + ' · allin1site.com";'
  + 'a.setAttribute("aria-label","Tác giả ' + AUTHOR + ' — allin1site.com");'
  + 'a.style.cssText="position:fixed;left:calc(6px + env(safe-area-inset-left));bottom:calc(4px + env(safe-area-inset-bottom));z-index:2147482000;font:600 10px/1 system-ui,-apple-system,sans-serif;color:rgba(128,140,165,.6);text-decoration:none;letter-spacing:.3px;padding:2px 5px;pointer-events:auto;transition:color .2s;-webkit-tap-highlight-color:transparent";'
  + 'a.onmouseover=function(){a.style.color="#4aa3ff"};a.onmouseout=function(){a.style.color="rgba(128,140,165,.6)"};'
  + '(document.body||document.documentElement).appendChild(a);});'
  + 'console.log("%c🎮 "+(document.title||"Game")+"%c\\n© ' + YEAR + ' ' + AUTHOR + ' · ✉ ' + EMAIL + ' · 🌐 allin1site.com","font:800 13px system-ui;color:#ffce54","font:11px system-ui;color:#9fb0d4");'
  + '}catch(e){}})();';

const MS = '<!--SEO:start-->', ME = '<!--SEO:end-->';
let done = 0, skipped = [];

for(const [base, sub, name, theme, lang, desc] of G){
  const p = path.join(__dirname, base + '.html');
  if(!fs.existsSync(p)){ skipped.push(base + '(no html)'); continue; }
  let html = fs.readFileSync(p, 'utf8');

  const url = 'https://' + sub + '.games-core.com/';
  const ogLocale = lang === 'ja' ? 'ja_JP' : 'vi_VN';
  const ogTitle = name + ' — Chơi miễn phí online';
  const keywords = [name, name + ' online', 'chơi ' + name + ' miễn phí', 'mini game',
                    'game online miễn phí', 'html5 game', 'allin1site'].join(', ');

  // og:image: reuse the PWA emoji icon if a manifest exists, else omit
  let ogImage = '';
  const mfPath = path.join(__dirname, base + '.webmanifest');
  if(fs.existsSync(mfPath)){
    try { const mf = JSON.parse(fs.readFileSync(mfPath,'utf8')); if(mf.icons && mf.icons[0]) ogImage = mf.icons[0].src; } catch(_){}
  }

  const jsonld = {
    '@context':'https://schema.org', '@type':'VideoGame',
    name: name, description: desc, url: url, inLanguage: lang,
    genre: 'Casual', gamePlatform: 'Web browser',
    applicationCategory: 'GameApplication', operatingSystem: 'Any (Web)',
    isAccessibleForFree: true,
    author: { '@type':'Person', name: AUTHOR, email: EMAIL, url: SITE },
    creator:{ '@type':'Person', name: AUTHOR, url: SITE },
    publisher:{ '@type':'Organization', name: 'allin1site.com', url: SITE },
    copyrightHolder:{ '@type':'Person', name: AUTHOR, url: SITE },
    copyrightYear: YEAR,
    offers:{ '@type':'Offer', price:'0', priceCurrency:'VND' }
  };

  const lines = [
    MS,
    '<meta name="description" content="' + esc(desc) + '">',
    '<meta name="keywords" content="' + esc(keywords) + '">',
    '<meta name="author" content="' + esc(AUTHOR + ' (' + EMAIL + ')') + '">',
    '<meta name="copyright" content="© ' + YEAR + ' ' + AUTHOR + ' — allin1site.com">',
    '<meta name="robots" content="index,follow">',
    '<link rel="canonical" href="' + url + '">',
    '<link rel="author" href="' + SITE + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="allin1site.com">',
    '<meta property="og:title" content="' + esc(ogTitle) + '">',
    '<meta property="og:description" content="' + esc(desc) + '">',
    '<meta property="og:url" content="' + url + '">',
    '<meta property="og:locale" content="' + ogLocale + '">',
    (ogImage ? '<meta property="og:image" content="' + ogImage + '">' : ''),
    '<meta name="twitter:card" content="summary">',
    '<meta name="twitter:title" content="' + esc(ogTitle) + '">',
    '<meta name="twitter:description" content="' + esc(desc) + '">',
    (ogImage ? '<meta name="twitter:image" content="' + ogImage + '">' : ''),
    '<script type="application/ld+json">' + JSON.stringify(jsonld) + '</' + 'script>',
    '<script>' + SIG_SCRIPT + '</' + 'script>',
    ME
  ].filter(Boolean);
  const block = lines.join('\n');

  // 1) remove any previous SEO block, strip stray/duplicate SEO metas, then inject fresh
  if(html.indexOf(MS) !== -1){
    html = html.replace(new RegExp(reEsc(MS) + '[\\s\\S]*?' + reEsc(ME) + '\\r?\\n?'), '');
  }
  html = html
    .replace(/[ \t]*<meta\s+name="description"[^>]*>\s*\r?\n?/gi, '')
    .replace(/[ \t]*<meta\s+name="keywords"[^>]*>\s*\r?\n?/gi, '')
    .replace(/[ \t]*<meta\s+name="author"[^>]*>\s*\r?\n?/gi, '')
    .replace(/[ \t]*<link\s+rel="canonical"[^>]*>\s*\r?\n?/gi, '')
    .replace(/[ \t]*<link\s+rel="author"[^>]*>\s*\r?\n?/gi, '')
    .replace(/[ \t]*<meta\s+property="og:[^"]*"[^>]*>\s*\r?\n?/gi, '')
    .replace(/[ \t]*<meta\s+name="twitter:[^"]*"[^>]*>\s*\r?\n?/gi, '');
  if(/<\/head>/i.test(html)){
    html = html.replace(/<\/head>/i, block + '\n</head>');
  } else { skipped.push(base + '(no </head>)'); continue; }

  // 2) top-of-file ownership comment (idempotent)
  if(html.indexOf('ManhDS-signature') === -1){
    if(/<!doctype html>/i.test(html)) html = html.replace(/<!doctype html>/i, function(m){ return m + '\n' + SIG_COMMENT; });
    else html = SIG_COMMENT + '\n' + html;
  }

  fs.writeFileSync(p, html, 'utf8');
  done++;
}

console.log('SEO build: updated ' + done + '/' + G.length + ' games.');
if(skipped.length) console.log('Skipped: ' + skipped.join(', '));
