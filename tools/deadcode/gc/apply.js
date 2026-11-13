const fs=require('fs'),path=require('path');const L=JSON.parse(fs.readFileSync('apply.json','utf8'));const D=process.argv[2];
const by={};L.forEach(v=>(by[v.f]=by[v.f]||[]).push(v));let saved=0;
for(const f in by){let s=fs.readFileSync(path.join(D,f),'utf8');
  by[f].sort((a,b)=>b.s-a.s).forEach(v=>{const o=v.off;
    if(v.dupDead){let e=v.e-o;if(s[e]==='\n')e++;saved+=e-(v.s-o);s=s.slice(0,v.s-o)+s.slice(e);}
    else{if(s[v.bs-o]!=='{'||s[v.be-o-1]!=='}')throw new Error('bad '+v.id);saved+=v.be-v.bs-2;s=s.slice(0,v.bs-o)+'{}'+s.slice(v.be-o);}});
  fs.writeFileSync(path.join(D,f),s);}
console.log('files',Object.keys(by).length,'saved',saved);
