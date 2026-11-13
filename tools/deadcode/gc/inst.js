// node inst.js <src/js dir> <out dir>  -> instrumented copies + ids.json
const ts=require(require('child_process').execSync('npm root -g').toString().trim()+'/typescript');
const fs=require('fs'),path=require('path');
const [,, SRC, OUT]=process.argv;fs.mkdirSync(OUT,{recursive:true});
const files=fs.readdirSync(SRC).filter(f=>f.endsWith('.js')).sort();
const ids={};const topDecl={};// name -> [{id}]
let prelude='var __W={},__C={};function __R(i,f){try{__W[i]=new WeakRef(f)}catch(e){}return f}\n';
const out={};
const parts=files.map(f=>fs.readFileSync(path.join(SRC,f),'utf8'));const offs=[];{let o=0;parts.forEach(p=>{offs.push(o);o+=p.length;});}
const fileAt=p=>{let lo=0,hi=offs.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(offs[m]<=p)lo=m;else hi=m-1;}return lo;};
for(const f of ['ALL']){
  const src=parts.join('');
  const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const edits=[];
  const isFn=n=>ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isMethodDeclaration(n)||ts.isGetAccessor(n)||ts.isSetAccessor(n)||ts.isConstructorDeclaration(n);
  function visit(n){
    if(isFn(n)){
      if((ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isFunctionDeclaration(n))&&n.body&&!n.asteriskToken){
        const id=f+':'+n.getStart()+':'+n.end;
        const kind=ts.isFunctionDeclaration(n)?'decl':'expr';
        let name=n.name?n.name.text:null;
        ids[id]={f:files[fileAt(n.getStart())],fe:files[fileAt(n.end-1)],off:offs[fileAt(n.getStart())],s:n.getStart(),e:n.end,kind,name,bs:n.body.getStart(),be:n.body.end,block:ts.isBlock(n.body)};
        const mark='__C['+JSON.stringify(id)+']=1';
        if(ts.isBlock(n.body))edits.push([n.body.getStart()+1,n.body.getStart()+1,mark+';']);
        else{edits.push([n.body.getStart(),n.body.getStart(),'('+mark+',(']);edits.push([n.body.end,n.body.end,'))']);}
        if(kind==='expr'){edits.push([n.getStart(),n.getStart(),'__R('+JSON.stringify(id)+',']);edits.push([n.end,n.end,')']);}
        else if(name){
          const p=n.parent;
          if(ts.isSourceFile(p)){(topDecl[name]=topDecl[name]||[]).push(id);ids[id].top=1;}
          else if(ts.isBlock(p)){edits.push([p.getStart()+1,p.getStart()+1,'__R('+JSON.stringify(id)+','+name+');']);}
          else ids[id].skip=1;
        }
      }
      return; // do not descend: only load-level functions
    }
    ts.forEachChild(n,visit);
  }
  visit(sf);
  edits.sort((a,b)=>b[0]-a[0]||0);
  // stable for same position: closing ')' before opening? handle by order of insertion
  let s=src;
  // apply from the end; for equal positions keep original push order reversed
  const idx=edits.map((e,i)=>[e,i]).sort((a,b)=>b[0][0]-a[0][0]||b[1]-a[1]);
  for(const [[a,b,t]] of idx)s=s.slice(0,a)+t+s.slice(b);
  out[f]=s;
}
for(const name in topDecl){const L=topDecl[name];L.forEach((id,i)=>{if(i<L.length-1)ids[id].dupDead=1;});prelude+='__R('+JSON.stringify(L[L.length-1])+','+name+');';}
fs.writeFileSync(path.join(OUT,'0000-all.js'),prelude+'\n'+out.ALL);
fs.writeFileSync(path.join(OUT,'..','ids.json'),JSON.stringify(ids));
console.log('tracked',Object.keys(ids).length);
