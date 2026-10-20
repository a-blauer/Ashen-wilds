// Remove statically dead top-level statements from the game's inline script, repeating until nothing changes.
//   node strip.js in.html out.html [--keep name1,name2]
// Dead = function declarations shadowed by a later declaration of the same name, plus declarations (functions,
// classes, vars with side-effect-free initialisers) that no running code, HTML attribute or string literal names.
// Section header lines ("// ====") inside removed ranges are kept.
const fs = require('fs');
const [inp, outp] = process.argv.slice(2);
const keepArg = process.argv.indexOf('--keep');
const KEEP = new Set(keepArg > 0 ? process.argv[keepArg + 1].split(',') : []);
let html = fs.readFileSync(inp, 'utf8');
let total = 0, round = 0;
const removedNames = [];
for (;;) {
  fs.writeFileSync(__dirname + '/_cur.html', html);
  for (const k of Object.keys(require.cache)) delete require.cache[k];
  process.argv[2] = __dirname + '/_cur.html';
  process.env.NOMAIN = 1;
  const A = require('./an.js');
  const R = require('./reach_lib.js')(A, KEEP);
  const dead = R.dead;
  if (!dead.length) break;
  round++;
  // build cut ranges on the script text
  const s = A.src;
  const cuts = dead.map(k => {
    const st = A.stmts[k];
    return [st.pos, st.end, k];
  }).sort((a, b) => a[0] - b[0]);
  let out = '', last = 0, bytes = 0;
  for (const [a, b, k] of cuts) {
    out += s.slice(last, a);
    const chunk = s.slice(a, b);
    // keep section headers that sit in the removed statement's leading trivia
    const hdr = chunk.split('\n').filter(l => /^\/\/ ={5,}/.test(l.trim()) && chunk.indexOf(l) < (A.stmts[k].getStart() - a));
    if (hdr.length) out += '\n' + hdr.join('\n');
    bytes += b - a;
    removedNames.push((A.declNames(A.stmts[k]).map(x => x[0]).join(',') || '?') + (R.shadowed.has(k) ? '*' : ''));
    last = b;
  }
  out += s.slice(last);
  html = A.html.slice(0, A.i + 8) + out + A.html.slice(A.j);
  total += bytes;
  console.log('round', round, 'removed', dead.length, 'statements', bytes, 'bytes');
}
fs.writeFileSync(outp, html);
fs.writeFileSync(outp + '.removed.txt', removedNames.join('\n') + '\n');
console.log('total removed', total, 'bytes; written', outp, html.length);
