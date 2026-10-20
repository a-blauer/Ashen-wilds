// Approximate JS scope resolution for the TypeScript AST: does identifier `id` resolve to a non-global binding?
const cache = new WeakMap();
module.exports = function (ts) {
  const K = ts.SyntaxKind;
  const isFn = n => ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n) || ts.isConstructorDeclaration(n);
  const bindNames = (name, out) => {
    if (!name) return;
    if (ts.isIdentifier(name)) out.add(name.text);
    else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) name.elements.forEach(e => e && !ts.isOmittedExpression(e) && bindNames(e.name, out));
  };
  // names declared by `var` / function declarations anywhere in a function body (not in nested functions)
  function varNames(body, out) {
    (function w(n) {
      if (n !== body && isFn(n)) { if (ts.isFunctionDeclaration(n) && n.name) out.add(n.name.text); return; }
      if (ts.isVariableDeclarationList(n) && !(n.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const))) n.declarations.forEach(d => bindNames(d.name, out));
      if (ts.isClassExpression(n)) return;
      ts.forEachChild(n, w);
    })(body);
  }
  // names declared directly in a block / loop head by let, const, class or function
  function blockNames(n, out) {
    const list = n.statements || [];
    list.forEach(s => {
      if (ts.isVariableStatement(s) && (s.declarationList.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const))) s.declarationList.declarations.forEach(d => bindNames(d.name, out));
      if (ts.isFunctionDeclaration(s) && s.name) out.add(s.name.text);
      if (ts.isClassDeclaration(s) && s.name) out.add(s.name.text);
    });
  }
  function scopeSet(n) {
    if (cache.has(n)) return cache.get(n);
    const out = new Set();
    if (isFn(n)) {
      n.parameters.forEach(p => bindNames(p.name, out));
      if (ts.isFunctionExpression(n) && n.name) out.add(n.name.text);
      if (n.body) { varNames(n.body, out); if (ts.isBlock(n.body)) blockNames(n.body, out); }
      out.add('arguments');
    } else if (ts.isBlock(n) || ts.isCaseBlock(n)) {
      if (ts.isCaseBlock(n)) n.clauses.forEach(c => blockNames(c, out)); else blockNames(n, out);
    } else if ((ts.isForStatement(n) || ts.isForInStatement(n) || ts.isForOfStatement(n)) && n.initializer && ts.isVariableDeclarationList(n.initializer) && (n.initializer.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const))) {
      n.initializer.declarations.forEach(d => bindNames(d.name, out));
    } else if (ts.isCatchClause(n) && n.variableDeclaration) {
      bindNames(n.variableDeclaration.name, out);
    } else if (ts.isClassExpression(n) && n.name) out.add(n.name.text);
    cache.set(n, out);
    return out;
  }
  return function isLocal(id) {
    const name = id.text;
    for (let p = id.parent; p && !ts.isSourceFile(p); p = p.parent) {
      if (isFn(p) || ts.isBlock(p) || ts.isCaseBlock(p) || ts.isForStatement(p) || ts.isForInStatement(p) || ts.isForOfStatement(p) || ts.isCatchClause(p) || ts.isClassExpression(p)) {
        // a top-level block's let/const are still "global-ish" for our purposes only if the block is a statement of the
        // source file; they're local to it, which is correct
        if (scopeSet(p).has(name)) return true;
      }
    }
    return false;
  };
};
