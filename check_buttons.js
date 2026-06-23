// Verify every inline onclick="fn(...)" resolves: fn must be exposed on window
// OR defined as a global function (game has no IIFE wrapper).
const fs = require('fs');
const games = "anipang baucua blockpuzzle cocangua dalgona jumphop nonogram oanquan pikachu puyo redlight suika tilematch vampire watersort".split(' ');
let bad = 0;
for (const g of games) {
  const c = fs.readFileSync(g + '.html', 'utf8');
  const hasIIFE = /\(function\s*\(\s*\)\s*\{/.test(c);
  const fns = [...new Set([...c.matchAll(/onclick="([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]))];
  const miss = fns.filter(f => {
    const exported = new RegExp('window\\.' + f + '\\s*=').test(c);
    const globalFn = !hasIIFE && new RegExp('function\\s+' + f + '\\b').test(c);
    return !exported && !globalFn;
  });
  console.log((miss.length ? 'DEAD ' : 'ok   ') + g.padEnd(13) + ' onclick:[' + fns.join(',') + ']' + (miss.length ? '  -> MISSING: ' + miss.join(',') : ''));
  if (miss.length) bad++;
}
console.log('\nGames with dead buttons: ' + bad);
