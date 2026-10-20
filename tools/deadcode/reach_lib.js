// Reachability of top-level declarations from code that actually runs.
module.exports = function (A, KEEP) {
const { ts, stmts, decls, refs, src, outside } = A;
const fs = require('fs');

const PURE_CALLS = new Set(['V', 'B_', 'D_', 'T_', 'Object.keys', 'Object.values', 'Object.entries', 'Object.freeze', 'Math.max', 'Math.min', 'Math.round', 'Math.floor', 'Math.sqrt', 'Math.PI']);
function pure(n) {
  if (!n) return true;
  switch (n.kind) {
    case ts.SyntaxKind.NumericLiteral: case ts.SyntaxKind.StringLiteral: case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
    case ts.SyntaxKind.TrueKeyword: case ts.SyntaxKind.FalseKeyword: case ts.SyntaxKind.NullKeyword:
    case ts.SyntaxKind.RegularExpressionLiteral: case ts.SyntaxKind.Identifier:
    case ts.SyntaxKind.FunctionExpression: case ts.SyntaxKind.ArrowFunction: case ts.SyntaxKind.ClassExpression:
      return true;
    case ts.SyntaxKind.ArrayLiteralExpression: return n.elements.every(pure);
    case ts.SyntaxKind.ObjectLiteralExpression:
      return n.properties.every(p => ts.isPropertyAssignment(p) ? (!ts.isComputedPropertyName(p.name) && pure(p.initializer)) : ts.isShorthandPropertyAssignment(p) || ts.isMethodDeclaration(p));
    case ts.SyntaxKind.PrefixUnaryExpression: return pure(n.operand);
    case ts.SyntaxKind.ParenthesizedExpression: return pure(n.expression);
    case ts.SyntaxKind.BinaryExpression: return ![ts.SyntaxKind.EqualsToken].includes(n.operatorToken.kind) && !(n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment) && pure(n.left) && pure(n.right);
    case ts.SyntaxKind.ConditionalExpression: return pure(n.condition) && pure(n.whenTrue) && pure(n.whenFalse);
    case ts.SyntaxKind.TemplateExpression: return n.templateSpans.every(s => pure(s.expression));
    case ts.SyntaxKind.PropertyAccessExpression: return false; // getters / undefined objects could throw; be safe
    case ts.SyntaxKind.CallExpression: {
      // data constructors with no side effects, and a few side-effect-free built-ins
      const c = n.expression;
      const nm = ts.isIdentifier(c) ? c.text : (ts.isPropertyAccessExpression(c) && ts.isIdentifier(c.expression)) ? c.expression.text + '.' + c.name.text : '';
      return PURE_CALLS.has(nm) && n.arguments.every(pure);
    }
    case ts.SyntaxKind.ArrowFunction: case ts.SyntaxKind.FunctionExpression: return true;
    case ts.SyntaxKind.NewExpression: {
      // new THREE.Something(...) only allocates (ids shift uniformly); nothing else is touched
      const c = n.expression;
      return ts.isPropertyAccessExpression(c) && ts.isIdentifier(c.expression) && c.expression.text === 'THREE' && (n.arguments || []).every(pure);
    }
    default: return false;
  }
}

// which statements are removable declarations (shadowed fns, or decls with pure initialisers)
const lastFn = {};
stmts.forEach((s, k) => { if (ts.isFunctionDeclaration(s) && s.name) lastFn[s.name.text] = k; });
const shadowed = new Set();
stmts.forEach((s, k) => { if (ts.isFunctionDeclaration(s) && s.name && lastFn[s.name.text] !== k) shadowed.add(k); });
const removable = new Set(shadowed);
const names = new Map(); // stmt idx -> names
stmts.forEach((s, k) => {
  const ns = A.declNames(s).map(x => x[0]);
  if (!ns.length) return;
  names.set(k, ns);
  if (ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) removable.add(k);
  else if (ts.isVariableStatement(s) && s.declarationList.declarations.every(d => ts.isIdentifier(d.name) && pure(d.initializer))) removable.add(k);
});
// name -> live (non-shadowed) declaring statements
const declBy = {};
names.forEach((ns, k) => { if (shadowed.has(k)) return; ns.forEach(n => (declBy[n] = declBy[n] || []).push(k)); });

// names mentioned outside the script (HTML attributes) or inside string literals of the script
const strNames = new Set(require('fs').readFileSync(__dirname + '/keep.txt', 'utf8').split('\n').filter(Boolean));
const word = /[A-Za-z_$][\w$]*/g;
// no inline handlers in the markup, so only script strings can name globals
(function w(n) { if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || n.kind === ts.SyntaxKind.TemplateHead || n.kind === ts.SyntaxKind.TemplateMiddle || n.kind === ts.SyntaxKind.TemplateTail) { /* strings no longer keep names alive: dynamic lookups are listed in keep.txt */ } ts.forEachChild(n, w); })(A.sf);

(function w(n) { if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && ['window','self','globalThis'].includes(n.expression.text)) strNames.add(n.name.text); ts.forEachChild(n, w); })(A.sf);
(KEEP || []).forEach(n => strNames.add(n));
const live = new Set();
const q = [];
const mark = k => { if (!live.has(k)) { live.add(k); q.push(k); } };
stmts.forEach((s, k) => { if (!removable.has(k)) mark(k); });
const strict = false; // strict: ignore names only seen in strings
Object.keys(declBy).forEach(n => { if (!strict && strNames.has(n)) declBy[n].forEach(mark); });
while (q.length) { const k = q.pop(); refs[k].forEach(n => (declBy[n] || []).forEach(mark)); }

const dead = []; stmts.forEach((st, k) => { if (!live.has(k)) dead.push(k); });
return { dead, live, removable, shadowed, strNames, declBy };
};
