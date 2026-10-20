// Static analysis of the built game script: top-level declarations, duplicates, reachability.
const ts = (()=>{try{return require('typescript')}catch(_){return require(require('child_process').execSync('npm root -g').toString().trim()+'/typescript')}})();
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const i = html.lastIndexOf('<script>'), j = html.lastIndexOf('</script>');
const src = html.slice(i + 8, j);
const outside = html.slice(0, i) + html.slice(j);
const sf = ts.createSourceFile('g.js', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const K = ts.SyntaxKind;
const isLocal = require('./scope.js')(ts);

// --- top-level declarations
const stmts = sf.statements;
const decls = []; // {idx,name,kind,start,end}
function declNames(s) {
  if (ts.isFunctionDeclaration(s) && s.name) return [[s.name.text, 'fn']];
  if (ts.isClassDeclaration(s) && s.name) return [[s.name.text, 'class']];
  if (ts.isVariableStatement(s)) {
    const out = [];
    const f = n => { if (ts.isIdentifier(n)) out.push(n.text); else if (n.elements) n.elements.forEach(e => e.name && f(e.name)); };
    s.declarationList.declarations.forEach(d => f(d.name));
    const kw = s.declarationList.flags & ts.NodeFlags.Const ? 'const' : s.declarationList.flags & ts.NodeFlags.Let ? 'let' : 'var';
    return out.map(n => [n, kw]);
  }
  return [];
}
stmts.forEach((s, idx) => declNames(s).forEach(([n, k]) => decls.push({ idx, name: n, kind: k, start: s.getStart(), end: s.end })));

// --- references: identifiers in read/any position, excluding property names / keys / declaration names
function isRefIdent(n) {
  const p = n.parent;
  if (!p) return false;
  if (ts.isPropertyAccessExpression(p) && p.name === n) return false;
  if ((ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p) || ts.isPropertyDeclaration(p) || ts.isGetAccessor(p) || ts.isSetAccessor(p)) && p.name === n) return false;
  if (ts.isFunctionDeclaration(p) && p.name === n) return false;
  if (ts.isVariableDeclaration(p) && p.name === n) return false;
  if (ts.isParameter(p) && p.name === n) return false;
  if (ts.isLabeledStatement(p) || ts.isBreakOrContinueStatement(p)) return false;
  if (isLocal(n)) return false;
  return true;
}
// per-statement set of referenced names
let _refs = null;
const computeRefs = () => _refs || (_refs = stmts.map(s => { const set = new Set(); const w = n => { if (ts.isIdentifier(n) && isRefIdent(n)) set.add(n.text); ts.forEachChild(n, w); }; w(s); return set; }));

module.exports = { isLocal, ts, sf, src, html, outside, stmts, decls, declNames, i, j };
Object.defineProperty(module.exports, 'refs', { get: computeRefs });

if (require.main === module && !process.env.NOMAIN) {
  const byName = {};
  decls.forEach(d => (byName[d.name] = byName[d.name] || []).push(d));
  let dupBytes = 0, dupN = 0; const dupList = [];
  for (const [n, ds] of Object.entries(byName)) {
    const fns = ds.filter(d => d.kind === 'fn');
    if (fns.length > 1) fns.slice(0, -1).forEach(d => { dupBytes += d.end - d.start; dupN++; dupList.push([n, d.end - d.start]); });
  }
  console.log('statements', stmts.length, 'decls', decls.length, 'names', Object.keys(byName).length);
  console.log('shadowed fn decls', dupN, 'bytes', dupBytes);
  dupList.sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(x => console.log('  ', x[0], x[1]));
  // statement kinds summary
  const kinds = {}; stmts.forEach(s => { const k = K[s.kind]; kinds[k] = (kinds[k] || 0) + (s.end - s.pos); });
  console.log(kinds);
}
