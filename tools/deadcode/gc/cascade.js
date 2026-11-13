// one round: node cascade.js <repo>  -> cuts dead top-level statements out of src/js; prints count
const fs=require('fs'),path=require('path');const REPO=process.argv[2];const DC=REPO+'/tools/deadcode';
const SRC=REPO+'/src/js';const files=fs.readdirSync(SRC).filter(f=>f.endsWith('.js')).sort();
const parts=files.map(f=>fs.readFileSync(path.join(SRC,f),'utf8'));
process.argv[2]=REPO+'/dist/ashen-wilds.html';process.env.NOMAIN=1;process.chdir(DC);
const A=require(DC+'/an.js');const R=require(DC+'/reach_lib.js')(A,new Set());
const all=parts.join('');if(A.src.indexOf(all)<0&&A.src.trim()!==all.trim()){console.log('script mismatch',A.src.length,all.length);}
const base=A.src.indexOf(all.slice(0,200));
const offs=[];{let o=0;parts.forEach(p=>{offs.push(o);o+=p.length;});}
const fileAt=p=>{let lo=0,hi=offs.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(offs[m]<=p)lo=m;else hi=m-1;}return lo;};
const cuts=R.dead.map(k=>{const st=A.stmts[k];return [st.pos-base,st.end-base,st.getStart()-base,A.declNames(st).map(x=>x[0]).join(',')]}).sort((a,b)=>b[0]-a[0]);
let n=0,bytes=0;const names=[];
for(const [a,b,gs,nm] of cuts){const fa=fileAt(a<0?0:a),fb=fileAt(b-1);if(fa!==fb){console.log('spans files, skipped',nm);continue;}
  const o=offs[fa];let s=parts[fa];const chunk=s.slice(a-o,b-o);
  const hdr=chunk.slice(0,gs-a).split('\n').filter(l=>/^\/\/ ={5,}/.test(l.trim()));
  parts[fa]=s.slice(0,a-o)+(hdr.length?'\n'+hdr.join('\n'):'')+s.slice(b-o);n++;bytes+=b-a;names.push(nm);}
if(!process.env.DRY)files.forEach((f,i)=>fs.writeFileSync(path.join(SRC,f),parts[i]));
if(process.env.DRY){const top=cuts.map(c=>[c[1]-c[0],c[3]]).sort((a,b)=>b[0]-a[0]).slice(0,40);console.log(top.map(t=>t.join(' ')).join('\n'));}else fs.appendFileSync('/tmp/kq_removed_names.txt',names.join('\n')+'\n');
console.log('CUT',n,bytes);
