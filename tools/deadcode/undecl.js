// undecl.js page.html [page2.html] -> names referenced but declared nowhere (in any scope); with two pages, the new ones in page2
process.env.NOMAIN=1;
function scan(file){
  for(const k of Object.keys(require.cache))delete require.cache[k];
  process.argv[2]=file;const A=require('./an.js');const {ts,sf}=A;
  const decl=new Set(),refs=new Map();
  const addDecl=n=>{if(!n)return;if(ts.isIdentifier(n))decl.add(n.text);else if(n.elements)n.elements.forEach(e=>e&&e.name&&addDecl(e.name));else if(n.properties)n.properties.forEach(p=>addDecl(p.name||p))};
  (function w(n){
    if((ts.isVariableDeclaration(n)||ts.isParameter(n)||ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isClassDeclaration(n)||ts.isClassExpression(n)||ts.isBindingElement(n))&&n.name)addDecl(n.name);
    if(ts.isCatchClause(n)&&n.variableDeclaration)addDecl(n.variableDeclaration.name);
    if(ts.isIdentifier(n)){const p=n.parent;const skip=(ts.isPropertyAccessExpression(p)&&p.name===n)||((ts.isPropertyAssignment(p)||ts.isMethodDeclaration(p)||ts.isGetAccessor(p)||ts.isSetAccessor(p)||ts.isPropertyDeclaration(p))&&p.name===n)||ts.isLabeledStatement(p)||ts.isBreakOrContinueStatement(p)||(ts.isBindingElement(p)&&p.propertyName===n);
      if(!skip){const inTypeof=ts.isTypeOfExpression(p);const isW=ts.isBinaryExpression(p)&&p.left===n&&p.operatorToken.kind===ts.SyntaxKind.EqualsToken;const r=refs.get(n.text)||{n:0,typeofOnly:true,writeOnly:true};r.n++;if(!inTypeof)r.typeofOnly=false;if(!isW)r.writeOnly=false;refs.set(n.text,r)}}
    ts.forEachChild(n,w)})(sf);
  const und=new Map();refs.forEach((r,k)=>{if(!decl.has(k))und.set(k,r)});return und}
const a=scan(process.argv[2]);
if(process.argv[3]){const b=scan(process.argv[3]);const out=[];b.forEach((r,k)=>{if(!a.has(k))out.push(k+(r.typeofOnly?' (typeof only)':r.writeOnly?' (write only)':'')+' x'+r.n)});console.log(out.length?'NEW UNDECLARED: '+out.join(', '):'no new undeclared names')}
else console.log([...a.keys()].sort().join(' '))
