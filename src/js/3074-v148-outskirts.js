// ================= v148: Duskhold's outskirts are a one-time starter resource patch =================
// The island round the walls (KF109's wild outskirts: pines, dead trees, rocks, bushes; one merged kit per kingdom stage, 1960)
// could be chopped and mined since v141, but each tree or rock came back after OUT141.rest and bushes could not be picked.
// Now every pine, dead tree, rock and bush there can be gathered (wood, stone, plant fibre through the normal gathering:
// same skills, same amounts) and once it is gathered it is gone for good: its part of the merged mesh collapses on the spot,
// its collider goes, and it is never built again. The ones gathered are saved (x2.out148, candidate indices of kfWildCand109,
// which is a fixed seeded list), so a reload or a bigger kingdom stage leaves them out. The patch is meant to start the first
// buildings with; the zones remain the lasting source.
var OUT148={h:new Set(),rg:null,key:null,hint:0};
function out148Kind(p){return p.t=='pine'||p.t=='dead'?'tree':p.t=='rock'?'rock':p.t=='bush'?'bush':null}
// every candidate knows its own index in the fixed list
{const f=kfWildCand109;kfWildCand109=function(){const L=f.apply(this,arguments);L.forEach((p,i)=>{if(p.ci==null)p.ci=i});return L}}
// v109's kfWild109 with: gathered candidates left out, a fresh bake each time (the old one freed), and each item's vertex ranges
// in the baked meshes kept so a gathered item can be collapsed without baking again
kfWild109=function(F){const T=TOWNS[0];if(KF109.wild){T.g.remove(KF109.wild);KF109.wild=null}
  if(OUT148.key&&typeof TWBK!='undefined'&&TWBK[OUT148.key]){try{Object.values(TWBK[OUT148.key]).forEach(g=>g.dispose&&g.dispose())}catch(_){}delete TWBK[OUT148.key]}
  const fixed=T.col.filter(c=>KF109.wcol.indexOf(c)<0&&!(KF109.leg&&KF109.leg.c.some(q=>q.c===c)));
  const keep=kfWildCand109().filter(p=>{const ax=Math.abs(p.x);if(OUT148.h.has(p.ci))return false;
    if(ax<F.WX+2.4&&p.z>-TS-2.4&&p.z<F.SZ+2.4)return false;if(ax<4.6&&p.z>F.SZ-1)return false;
    return !fixed.some(c=>{const dx=T.cx+p.x-c.x,dz=T.cy+p.z-c.z;return c.r!=null?dx*dx+dz*dz<(c.r+1.4)*(c.r+1.4):Math.abs(dx)<c.hx+1.4&&Math.abs(dz)<c.hz+1.4})});
  KF109.wsel={s:F.s,L:keep};const key='KFWILD148|'+F.s+'|'+(OUT148.n=(OUT148.n|0)+1);OUT148.key=key;const k=twKit(4243+F.s),R=[];
  keep.forEach(p=>{const {x,z,s,ry}=p,a=k.P.length;
    if(p.t=='pine'){k.as('bark',()=>k.L('c',0x3a2a1c,[x,0,z],[x,1.2*s,z],.14*s,'log'));k.as('leaf',()=>[[1.0,1.15,1.5],[1.6,.9,1.25],[2.2,.62,1.0]].forEach(([y,r,h],j)=>k.p('c',[0x1e3626,0x24402a,0x2a4a30][j],'cone6',x,y*s,z,r*s,h*s,r*s,0,ry+j,0,.08)))}
    else if(p.t=='dead'){k.as('bark',()=>{k.L('c',0x2e2620,[x,0,z],[x+.1*s,2.4*s,z+.05],.15*s,'log');k.L('c',0x2e2620,[x+.05,1.5*s,z],[x+.8*s*Math.cos(ry),2.2*s,z+.8*s*Math.sin(ry)],.06*s,'log');k.L('c',0x2e2620,[x+.05,1.9*s,z],[x-.6*s*Math.cos(ry),2.6*s,z-.6*s*Math.sin(ry)],.05*s,'log')})}
    else if(p.t=='rock'){k.as('stone',()=>{k.p('c',[0x5a5662,0x4e4a54,0x66626c][Math.floor(s*7)%3],'dod',x,.22*s,z,.55*s,.42*s,.5*s,0,ry,0,.18);if(s>1)k.p('c',0x4e4a54,'dod',x+.5*s,.12*s,z+.3*s,.3*s,.24*s,.3*s,0,ry*2,0,.2)})}
    else if(p.t=='bush'){k.as('leaf',()=>[[0,0],[.35,.2],[-.3,.25]].forEach(([a,b],j)=>k.p('c',[0x24402a,0x2e4a30,0x35502e][j],'ico',x+a*s,.3*s,z+b*s,.42*s,.34*s,.42*s,0,ry+j,0,.12)))}
    else{for(let j=0;j<3;j++)k.p('c',[0x4a5a34,0x3e5030][j%2],'cone4',x+(j-1)*.15,.18*s,z+(j%2)*.12,.07,.36*s,.07,0,j,(j-1)*.2,.1)}
    R.push([a,k.P.length])});
  const P=k.P.slice(),g=twGroup(k,key);g.name='kfwild';T.g.add(g);KF109.wild=g;g.traverse(o=>{if(o.isMesh)o.castShadow=false});
  // vertex ranges per item in each baked mesh (twBake packs the parts of one material class in list order, non-indexed)
  const off={},cnt=P.map(q=>q.geo.attributes.position.count),st=P.map((q,j)=>{const o=off[q.t]|0;off[q.t]=o+cnt[j];return o});
  const M={};g.children.forEach(m=>{for(const t in TWBK[key])if(TWBK[key][t]===m.geometry)M[t]=m.geometry});
  OUT148.rg=keep.map((p,i)=>{const [a,b]=R[i],L=[];for(let j=a;j<b;j++){const q=P[j];if(M[q.t])L.push([M[q.t],st[j],cnt[j]])}return L});
  kfColSet109(KF109.wcol,keep.map(p=>{if(p.t!='pine'&&p.t!='dead'&&p.t!='rock')return null;const c={x:T.cx+p.x,z:T.cy+p.z,r:p.t=='rock'?.4*p.s:.3};p.col148=c;return c}).filter(Boolean));
  try{if(typeof OUT141!='undefined')OUT141.src=null}catch(_){}}
// a gathered item: its vertices collapse to one point, its collider goes
function out148Take(i){const W=KF109.wsel,p=W&&W.L[i];if(!p||OUT148.h.has(p.ci))return;OUT148.h.add(p.ci);
  (OUT148.rg&&OUT148.rg[i]||[]).forEach(([G,s,n])=>{const a=G.attributes.position;const x=a.getX(s),y=a.getY(s),z=a.getZ(s);for(let v=s;v<s+n;v++)a.setXYZ(v,x,y-5,z);a.needsUpdate=true});
  const T=TOWNS[0];if(p.col148){const j=T.col.indexOf(p.col148);if(j>=0)T.col.splice(j,1);const w=KF109.wcol.indexOf(p.col148);if(w>=0)KF109.wcol.splice(w,1)}
  p.gone148=1;try{const v=new THREE.Vector3();burst(gY(v.set(T.cx+p.x,0,T.cy+p.z),.6),p.t=='rock'?0x8a8690:p.t=='bush'?0x5a8a40:0x6a4a2a,30,2.5,2.5,.8)}catch(_){}
  if(!OUT148.hint){OUT148.hint=1;say('🌲 What you gather outside Duskhold\'s walls does not grow back: '+out148Left()+' trees, rocks and bushes are left. The portal zones never run out.')}}
function out148Left(){const W=KF109.wsel;return W&&W.L?W.L.filter(p=>!p.gone148&&out148Kind(p)).length:0}
// the gathering target: the nearest pine, dead tree, rock or bush still standing (replaces v141's, which skipped bushes)
{const f=gTarget;gTarget=function(){const r=f.apply(this,arguments);if(r&&r.o141==null)return r;try{if(typeof curMap=='function'&&curMap()>=0)return null;
  const W=KF109.wsel,G=KF109.wild;if(!W||!W.L||!G)return null;const T=TOWNS[0],P=pl.position;let best=null,bd=2.3;
  W.L.forEach((p,i)=>{const kind=out148Kind(p);if(!kind||p.gone148)return;const x=T.cx+p.x,z=T.cy+p.z;
    const d=Math.hypot(x-P.x,z-P.z)-(kind=='rock'?.45*(p.s||1):kind=='bush'?.35*(p.s||1):.15);if(d<bd){bd=d;best={kind,x:Math.round(x),y:Math.round(z),k:-1,w148:i}}});
  return best}catch(_){return null}}}
{const f=gFinish;gFinish=function(tg){const r=f.apply(this,arguments);try{if(tg&&tg.w148!=null)out148Take(tg.w148)}catch(e){console.warn('v148 outskirts',e)}return r}}
// saves
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.out148=[...OUT148.h];return o}}
{const f=x2Load;x2Load=function(s){OUT148.h=new Set(s&&Array.isArray(s.out148)?s.out148.filter(n=>Number.isInteger(n)&&n>=0):[]);OUT148.hint=OUT148.h.size?1:0;return f.apply(this,arguments)}}
// the kit standing now was baked by v109's version: build it again the new way
try{kfWild109(kf109())}catch(e){console.warn('v148 outskirts',e)}
