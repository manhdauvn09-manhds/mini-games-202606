/* build-pwa.js — make every games-core game installable as a PWA.
   For each game it (1) writes <basename>.webmanifest with an emoji app icon and
   (2) injects a PWA head block (manifest link + apple meta + pwa.js) into the HTML.
   Idempotent: re-running updates the block between the PWA markers instead of duplicating.
   Run:  node build-pwa.js            (from the repo root) */
const fs = require('fs');
const path = require('path');

const DEF = '#0b1020';
// basename (no .html) -> name, short_name, emoji, theme, lang
const GAMES = [
  ['2048',        '2048',                  '2048',       '🔢', DEF,       'vi'],
  ['anipang',     'Anipang Match-3',       'Anipang',    '💎', DEF,       'vi'],
  ['baucua',      'Bầu Cua Tôm Cá',        'Bầu Cua',    '🦀', DEF,       'vi'],
  ['blockpuzzle', 'Block Puzzle',          'Block',      '🧱', DEF,       'vi'],
  ['caro',        'Cờ Caro',               'Caro',       '⭕', DEF,       'vi'],
  ['cocangua',    'Cờ Cá Ngựa',            'Cá Ngựa',    '🐴', DEF,       'vi'],
  ['dalgona',     'Dalgona',               'Dalgona',    '🍬', DEF,       'vi'],
  ['flappy',      'Flappy',                'Flappy',     '🐤', '#0b1026', 'vi'],
  ['jumphop',     'Jump Hop',              'Jump Hop',   '🎯', DEF,       'vi'],
  ['mahjong',     'Mahjong Solitaire',     'Mahjong',    '🀄', DEF,       'ja'],
  ['nonogram',    'Nonogram',              'Nonogram',   '🧩', DEF,       'vi'],
  ['oanquan',     'Ô Ăn Quan',             'Ô Ăn Quan',  '🪨', DEF,       'vi'],
  ['otoshi',      'Daruma Otoshi',         'Daruma',     '🪆', DEF,       'ja'],
  ['pikachu',     'Pikachu Connect',       'Pikachu',    '⚡', DEF,       'vi'],
  ['puyo',        'Puyo Puyo',             'Puyo',       '🟣', DEF,       'vi'],
  ['redlight',    'Red Light Green Light', 'Red Light',  '🚦', DEF,       'vi'],
  ['suika',       'Suika',                 'Suika',      '🍉', DEF,       'vi'],
  ['taiko',       'Taiko Rhythm',          'Taiko',      '🥁', DEF,       'ja'],
  ['tetris',      'Tetris',                'Tetris',     '🟦', DEF,       'vi'],
  ['tilematch',   'Tile Match 3D',         'Tile Match', '🔷', DEF,       'vi'],
  ['typing-race', 'Đua Gõ Phím',           'Gõ Phím',    '⌨️', '#0a0e1a', 'vi'],
  ['vampire',     'Vampire Survivors',     'Vampire',    '🧛', DEF,       'vi'],
  ['watersort',   'Water Sort',            'Water Sort', '🧪', DEF,       'vi'],
];

function svgIcon(emoji, theme, fs_){
  return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>"
    + "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>"
    + "<stop offset='0' stop-color='#2a3566'/><stop offset='1' stop-color='" + theme + "'/>"
    + "</linearGradient></defs>"
    + "<rect width='512' height='512' fill='url(#g)'/>"
    + "<text x='256' y='266' font-size='" + fs_ + "' text-anchor='middle' dominant-baseline='central'>" + emoji + "</text>"
    + "</svg>";
}
function dataUri(svg){ return 'data:image/svg+xml,' + encodeURIComponent(svg); }

const MS = '<!--PWA:start-->', ME = '<!--PWA:end-->';
function esc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

let done = 0, manifests = 0, skipped = [];
for(const [base, name, short, emoji, theme, lang] of GAMES){
  const htmlPath = path.join(__dirname, base + '.html');
  if(!fs.existsSync(htmlPath)){ skipped.push(base + ' (no html)'); continue; }

  const iconAny  = dataUri(svgIcon(emoji, theme, 300));
  const iconMask = dataUri(svgIcon(emoji, theme, 250));

  // 1) manifest
  const manifest = {
    name, short_name: short, id: './', start_url: './', scope: './',
    display: 'standalone', orientation: 'any',
    background_color: theme, theme_color: theme, lang,
    categories: ['games'],
    icons: [
      { src: iconAny,  sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: iconMask, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
    ]
  };
  fs.writeFileSync(path.join(__dirname, base + '.webmanifest'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  manifests++;

  // 2) inject head block
  let html = fs.readFileSync(htmlPath, 'utf8');
  const block = MS + '\n'
    + '<link rel="manifest" href="' + base + '.webmanifest">\n'
    + '<meta name="mobile-web-app-capable" content="yes">\n'
    + '<meta name="apple-mobile-web-app-capable" content="yes">\n'
    + '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
    + '<meta name="apple-mobile-web-app-title" content="' + name.replace(/"/g,'&quot;') + '">\n'
    + '<meta name="application-name" content="' + name.replace(/"/g,'&quot;') + '">\n'
    + '<link rel="apple-touch-icon" href="' + iconAny + '">\n'
    + '<link rel="icon" type="image/svg+xml" href="' + iconAny + '">\n'
    + '<script defer src="pwa.js"></script>\n'
    + ME;

  if(html.indexOf(MS) !== -1){
    html = html.replace(new RegExp(esc(MS) + '[\\s\\S]*?' + esc(ME)), block);
  } else if(/<\/head>/i.test(html)){
    html = html.replace(/<\/head>/i, block + '\n</head>');
  } else {
    skipped.push(base + ' (no </head>)'); continue;
  }
  fs.writeFileSync(htmlPath, html, 'utf8');
  done++;
}

console.log('PWA build: injected ' + done + '/' + GAMES.length + ' HTML, wrote ' + manifests + ' manifests.');
if(skipped.length) console.log('Skipped: ' + skipped.join(', '));
