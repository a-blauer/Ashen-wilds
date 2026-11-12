// ================= v225: many more ways to shape your hero (creator + barber) =================
// Owner (Nov 12 2026): "I want A LOT more customization options for characters. Please make sure all armor and weapons still fit
// and behave properly with the new customization options available."
// Before: build, height, fur colour (6) and eye colour (5). Now, in the creator's Appearance step and the Barber:
//  * Body:  build · height (90–110 %, the model now follows the whole slider; it stopped at 94–106 %) · tail length (70–130 %)
//           · fur colour (14 per animal) · underside (natural, pale, cream, matching, dark, marking colour)
//  * Coat:  pattern (13: tabby stripes, spots, bandit mask, dark saddle, socks, face blaze, pale bib, piebald patches, dark
//           points, grizzled, brindle, ringed tail) · marking colour (12)
//  * Head:  head size (90–112 %) · eye colour (up to 14) · war paint (7 designs) · paint colour (10) · scar (5)
// How it stays safe with gear:
//  * Patterns, underside, war paint and scars are PAINT: while the hero's body is built (mdHeroB) every fur triangle is recoloured
//    by a mask worked out from its position and its bone (mdTri, the one funnel every builder triangle goes through). Armour,
//    clothes, boots, helmets, eyes, nose, claws and weapons are never touched: only colours that are the animal's fur palette
//    count as fur. No triangle is added or moved, so every piece of armour fits exactly as before.
//  * Head size scales the head bone and tail length stretches the tail chain (bone positions). Helmets, hoods, masks and
//    goggles are built into the same skinned body on the head bone, so they scale with the head; nothing the hands hold is
//    on those bones, so weapons, shields and their grips are unchanged. Height still scales the whole model, gear included.
// Saves: the new fields live in hero.look (lkClean keeps them, old saves have none and look as before). The geometry cache key
// (mdLookKey) includes the paint fields. Co-op: the look array grows at the end (index 10 on: pattern, marking colour,
// underside, paint, paint colour, scar, head size, tail length); older partners ignore the extra fields.
var LK225={
  pat:['None','Tabby stripes','Spots','Bandit mask','Dark saddle','Socks','Face blaze','Pale bib','Piebald patches','Dark points','Grizzled','Brindle','Ringed tail'],
  mark:['#14100e','#2e2622','#4a3626','#6a4a2e','#8a5a2a','#b8742e','#d8b070','#ece4d4','#f8f6f0','#8a8a92','#5a2418','#2a3644'],
  bel:['Natural','Pale','Cream','Matching','Dark','Marking colour'],
  fp:['None','Twin streaks','Brow band','Eye rings','Forehead rune','Clan slash','Muzzle stripe'],
  fpc:['#a8261c','#e8e2d4','#141210','#2a58a8','#d8a428','#3a8a46','#7a3aa8','#e86a1a','#2ab8b0','#c83a7a'],
  scar:['None','Over the left eye','Over the right eye','Across the cheek','Across the muzzle'],
  hs:[.9,1.12],tl:[.7,1.3],ht:[.9,1.1],
  // extra coat colours per animal (appended: the old first colour stays each animal's default) and eye colours for all
  fur:{1:['#1c1816','#c8c0b4','#7a5a40','#a04a2a','#4a4a52','#d8c090','#3a2a2a','#9a8a7a'],
       2:['#e8a050','#3a2a20','#d8c8a8','#8a8a92','#141214','#c87a3a','#a89070','#4a4248'],
       3:['#1a1820','#2a3448','#3a2a4a','#24302a','#8a8a90','#5a3a2a','#e8e4dc','#4a4248'],
       4:['#2a2828','#5a4a3a','#b8b0a0','#6a5a48','#8a6a4a','#3a4048','#c8c4bc','#4a3a30'],
       5:['#c87a3a','#e0b070','#5a3a24','#2a2420','#9a9aa0','#d8c8a8','#7a5a3a','#a04a28']},
  eye:['#e8c040','#3ac8b8','#8a2ad8','#d8e8f0','#c83a1a','#5ad85a','#2a5ab8','#e86ab0','#1a1a1a'],
  err:0};
(function(){for(const id in LK225.fur){const D=typeof BRD!='undefined'&&BRD[id];if(!D||!Array.isArray(D.fur))continue;
  const has=new Set(D.fur.map(c=>c.toLowerCase()));LK225.fur[id].forEach(c=>{if(!has.has(c)){D.fur.push(c);has.add(c)}});
  const he=new Set(D.eye.map(c=>c.toLowerCase()));LK225.eye.forEach(c=>{if(!he.has(c)&&D.eye.length<14){D.eye.push(c);he.add(c)}})}})();
function lk225Hex(v){return typeof v=='string'&&/^#[0-9a-f]{6}$/i.test(v)}
function lk225Int(v,n,d){v=+v;return Number.isInteger(v)&&v>=0&&v<n?v:d}
function lk225Num(v,r,d){v=+v;return v!==null&&v!==''&&isFinite(v)?Math.max(r[0],Math.min(r[1],v)):d}
// the new fields of a look, cleaned (saves, co-op and the editors all go through here)
function lk225Of(o){const r={};if(!o||typeof o!='object')return r;
  if(o.pat!=null){const v=lk225Int(o.pat,LK225.pat.length,null);if(v!=null)r.pat=v}
  if(o.bel!=null){const v=lk225Int(o.bel,LK225.bel.length,null);if(v!=null)r.bel=v}
  if(o.fp!=null){const v=lk225Int(o.fp,LK225.fp.length,null);if(v!=null)r.fp=v}
  if(o.scar!=null){const v=lk225Int(o.scar,LK225.scar.length,null);if(v!=null)r.scar=v}
  if(lk225Hex(o.pc))r.pc=o.pc.toLowerCase();if(lk225Hex(o.fpc))r.fpc=o.fpc.toLowerCase();
  if(o.hs!=null){const v=lk225Num(o.hs,LK225.hs,null);if(v!=null)r.hs=+v.toFixed(2)}
  if(o.tl!=null){const v=lk225Num(o.tl,LK225.tl,null);if(v!=null)r.tl=+v.toFixed(2)}
  return r}
// defaults: nothing painted, natural underside, normal head and tail
function lk225Full(L){return Object.assign({pat:0,pc:LK225.mark[0],bel:0,fp:0,fpc:LK225.fpc[0],scar:0,hs:1,tl:1},lk225Of(L))}
{const f=lkClean;lkClean=function(o){const r=f.apply(this,arguments);try{Object.assign(r,lk225Of(o))}catch(_){}return r}}
{const f=mdLookN;mdLookN=function(L,cls){const r=f.apply(this,arguments);try{Object.assign(r,lk225Full(L));
    // height: the model follows the editor's whole range (0.90–1.10)
    if(L&&L.height!=null&&isFinite(+L.height))r.height=Math.max(LK225.ht[0],Math.min(LK225.ht[1],+L.height))}catch(_){}return r}}
{const f=mdLookKey;mdLookKey=function(L){let k=f.apply(this,arguments);try{if(L&&(L.pat||L.bel||L.fp||L.scar))k+='.v'+[L.pat|0,L.pc,L.bel|0,L.fp|0,L.fpc,L.scar|0].join('_')}catch(_){}return k}}
// co-op: appended after index 9 (older partners stop reading at 9)
{const f=mpLookOut;mpLookOut=function(){const a=f.apply(this,arguments);try{if(Array.isArray(a)){const L=lk225Full(mdLookOf(pl,hero.cls));
    while(a.length<10)a.push(0);a.push(L.pat,L.pc,L.bel,L.fp,L.fpc,L.scar,Math.round(L.hs*100),Math.round(L.tl*100))}}catch(_){}return a}}
{const f=mpLookIn;mpLookIn=function(a){const r=f.apply(this,arguments);try{if(r&&Array.isArray(a)&&a.length>=18){
    const c=v=>typeof v=='number'&&isFinite(v)?'#'+('00000'+(v>>>0&0xffffff).toString(16)).slice(-6):v;
    Object.assign(r,lk225Of({pat:a[10],pc:c(a[11]),bel:a[12],fp:a[13],fpc:c(a[14]),scar:a[15],hs:(+a[16]||100)/100,tl:(+a[17]||100)/100}))}}catch(_){}return r}}

// ---------------- the underside colour (each animal's palette, at build) ----------------
function lk225Bel(C,L){const b=L.bel|0;if(!b)return C;const f=C.FUR,o=Object.assign({},C);
  o.BELLY=b==1?mdMix(f,0xe8e2d6,.62):b==2?mdMix(f,0xe0c896,.6):b==3?f:b==4?mdSh(f,.58):mdMix(f,mdC(L.pc||LK225.mark[0]),.82);return o}
(function(){for(let id=1;id<=5;id++){const D=typeof BRD!='undefined'&&BRD[id];if(!D||typeof D.cols!='function'||D.cols.v225)continue;const f=D.cols;
  D.cols=function(L){const C=f.apply(this,arguments);try{return L&&L.bel?lk225Bel(C,L):C}catch(_){return C}};D.cols.v225=1}})();

// ---------------- paint: patterns, war paint and scars on the fur ----------------
var K225={on:0,L:null,D:null,C:null,fur:null,line:null,E:null,R:null,tc:null};
function lk225SS(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
function lk225Rgb(h){h=mdC(h);return [((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255]}
// the fur palette of the animal being built: exact colours (per-face paint) and the colour line fur gradients run along
function lk225Setup(){const C=BR.C||{},D=BR.R,fur=new Set(),pts=[];
  ['FUR','FURD','FURL','BELLY'].forEach(k=>{if(C[k]!=null){const h=mdC(C[k]);fur.add(h);pts.push(lk225Rgb(h))}});
  if(C.FUR!=null&&C.BELLY!=null)[[C.FUR,C.BELLY,.4],[C.FUR,C.BELLY,.5]].forEach(q=>fur.add(mdC(mdMix(q[0],q[1],q[2]))));
  const not=[];['NOSE','PINK','PINKD','EYE','CLAW','TOOTH','MOUTH','BEAK','BEAKL','SCALE','SCALED'].forEach(k=>{if(C[k]!=null){const h=mdC(C[k]);if(!fur.has(h))not.push(lk225Rgb(h))}});
  K225.fur=fur;K225.pts=pts;K225.not=not;
  const E=D&&D.EYEP?D.EYEP:[.035,1.2,.09];K225.E={x:Math.abs(E[0]),y:E[1],z:E[2]};
  const T=D&&D.HBX&&D.TB&&D.TB.length?D.HBX[D.TB[0]]:null;K225.tr=T?[T[1],T[2],T[3]]:null;K225.tn=D&&D.TB?D.TB.length:0}
// is this colour (0..1 rgb) fur? close to the line between the palette's fur colours, and closer to it than to nose / eye / claws
function lk225IsFurRgb(q){const P=K225.pts;if(!P.length)return false;let best=9;
  for(let i=0;i<P.length;i++)for(let j=i;j<P.length;j++){const a=P[i],b=P[j],ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l2=ab[0]*ab[0]+ab[1]*ab[1]+ab[2]*ab[2];
    let t=l2>1e-9?((q[0]-a[0])*ab[0]+(q[1]-a[1])*ab[1]+(q[2]-a[2])*ab[2])/l2:0;t=Math.max(0,Math.min(1,t));
    const d=Math.hypot(q[0]-a[0]-ab[0]*t,q[1]-a[1]-ab[1]*t,q[2]-a[2]-ab[2]*t);if(d<best)best=d}
  if(best>.09)return false;for(const n of K225.not)if(Math.hypot(q[0]-n[0],q[1]-n[1],q[2]-n[2])<best*.8)return false;return true}
// the bone a corner follows most
function lk225Bone(B,v){const si=v.w[0],sw=v.w[1];let b=0;for(let j=1;j<4;j++)if(sw[j]>sw[b])b=j;return B.O[si[b]]||''}
function lk225Reg(n){if(n=='head')return 'head';if(n=='pelvis'||n=='spine'||n=='chest'||n=='neck')return 'torso';if(n=='aL2'||n=='aR2')return 'paw';
  if(n=='aL0'||n=='aL1'||n=='aR0'||n=='aR1')return 'arm';if(n=='lh2'||n=='rh2')return 'foot';if(n=='lh0'||n=='lh1'||n=='rh0'||n=='rh1')return 'leg';if(/^tl\d/.test(n))return 'tail';return ''}
function lk225Hash(x,y,z){const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s)}
// how far along the tail (0 root … 1 tip)
function lk225Tail(p,bn){const n=Math.max(1,K225.tn),i=+bn.slice(2)||0;return Math.min(1,(i+.5)/n)}
// the coat pattern: 0 … 1 toward the marking colour
function lk225Pat(k,p,bn,rg){const E=K225.E,x=p.x,y=p.y,z=p.z,ax=Math.abs(x),SS=lk225SS;
  switch(k){
    case 1:{// tabby: bands round the back, sides and limbs, "M" stripes on the brow, rings on the tail
      if(rg=='torso'){const b=.5+.5*Math.sin(y*58+2.2*Math.sin(x*22));return SS(.6,.8,b)*SS(.05,-.01,z)}
      if(rg=='arm'||rg=='leg')return SS(.62,.82,.5+.5*Math.sin(y*62))*.95;
      if(rg=='tail')return SS(.55,.8,.5+.5*Math.sin(lk225Tail(p,bn)*24));
      if(rg=='head')return y>E.y+.012&&z<E.z+.02?SS(.55,.85,.5+.5*Math.sin(x*150))*SS(E.y+.012,E.y+.03,y):0;return 0}
    case 2:{if(rg=='torso'&&z>.04)return 0;if(rg=='head'&&y<E.y)return 0;const n=Math.sin(x*61+1.3)*Math.sin(y*53+.7)*Math.sin(z*67+2.1);return SS(.3,.48,n)}
    case 3:return rg=='head'&&z>E.z-.06?SS(.034,.018,Math.abs(y-E.y))*SS(E.x+.05,E.x+.03,ax):0;
    case 4:{if(rg=='torso')return SS(.0,-.035,z)*SS(.56,.62,y);if(rg=='head')return SS(E.z-.02,E.z-.06,z)*SS(E.y,E.y+.025,y);if(rg=='tail')return 1;return 0}
    case 5:{if(rg=='paw'||rg=='foot')return 1;if(rg=='arm')return SS(.68,.62,y);if(rg=='leg')return SS(.24,.16,y);return 0}
    case 6:return rg=='head'&&z>E.z-.045&&y>E.y-.075?SS(.022,.012,ax):0;
    case 7:{if(rg=='torso')return SS(.02,.06,z)*SS(.72,.8,y);if(rg=='head')return SS(E.y-.05,E.y-.07,y)*SS(E.z-.03,E.z,z);return 0}
    case 8:{const n=Math.sin(x*14+.4)+Math.sin(y*11+1.7)+Math.sin(z*13+2.9)+.6*Math.sin(x*29+y*23);return SS(.85,1.15,n)}
    case 9:{if(rg=='paw'||rg=='foot')return 1;if(rg=='arm')return SS(.7,.62,y);if(rg=='leg')return SS(.26,.17,y);if(rg=='tail')return SS(.35,.75,lk225Tail(p,bn));
      if(rg=='head')return Math.max(SS(E.z+.015,E.z+.05,z),SS(E.y+.035,E.y+.06,y)*SS(E.x-.01,E.x+.02,ax));return 0}
    case 10:return lk225Hash(Math.round(x*400),Math.round(y*400),Math.round(z*400))>.6?.7:0;
    case 11:{if(rg=='torso'&&z>.05)return 0;return SS(.62,.9,.5+.5*Math.sin(x*95+y*30+4*Math.sin(y*40+z*20)))*.85}
    case 12:return rg=='tail'?SS(.3,.7,.5+.5*Math.sin(lk225Tail(p,bn)*25)):0}
  return 0}
// war paint (head only, crisp per face)
function lk225Paint(k,p){const E=K225.E,x=p.x,y=p.y,z=p.z,ax=Math.abs(x),fr=z>E.z-.045;if(!fr)return 0;
  switch(k){
    case 1:return Math.abs(ax-E.x)<.011&&y<E.y-.012&&y>E.y-.085?1:0;
    case 2:return y>E.y+.016&&y<E.y+.04?1:0;
    case 3:{const d=Math.hypot(ax-E.x,y-E.y);return d>.012&&d<.032?1:0}
    case 4:return ax+Math.abs(y-(E.y+.05))<.024?1:0;
    case 5:{const dx=x-E.x,dy=y-E.y;return Math.abs(dx*.8+dy)<.012&&Math.hypot(dx,dy)<.07?1:0}
    case 6:return ax<.014&&z>E.z+.005&&y<E.y+.01?1:0}
  return 0}
function lk225Scar(k,p){const E=K225.E,x=p.x,y=p.y,z=p.z,ax=Math.abs(x);if(z<E.z-.05)return 0;
  switch(k){
    case 1:return x<0&&Math.abs(ax-E.x)<.008&&Math.abs(y-E.y)<.05&&Math.hypot(ax-E.x,y-E.y)>.008?1:0;
    case 2:return x>0&&Math.abs(ax-E.x)<.008&&Math.abs(y-E.y)<.05&&Math.hypot(ax-E.x,y-E.y)>.008?1:0;
    case 3:return x>0&&ax>E.x-.015&&ax<E.x+.05&&Math.abs((y-(E.y-.04))+(ax-E.x)*.55)<.008?1:0;
    case 4:return z>E.z&&Math.abs((y-(E.y-.03))-x*.9)<.008&&ax<.04?1:0}
  return 0}
// one corner: its colour (0..1) after paint, or null when nothing changes
function lk225Corner(B,v,base,face){const L=K225.L,bn=lk225Bone(B,v),rg=lk225Reg(bn);if(!rg)return null;let c=base,ch=false;
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  if(L.pat){const m=lk225Pat(L.pat,v,bn,rg);if(m>.01){c=mix(c,K225.mk,m);ch=true}}
  if(rg=='head'&&face){if(L.scar&&lk225Scar(L.scar,face)){c=mix(c,[.82,.62,.58],.85);ch=true}
    else if(L.fp&&lk225Paint(L.fp,face)){c=mix(c,K225.pc,.92);ch=true}}
  return ch?c:null}
{const f=mdTri;mdTri=function(B,t,a,b,c,col){if(K225.on&&BR.on&&(t=='c'||!t)){try{if(!K225.fur)lk225Setup();
      const hx=mdC(col),isHex=K225.fur.has(hx),rgbFur=!isHex&&hx===0&&a.rgb&&b.rgb&&c.rgb;
      if(isHex||rgbFur){const vs=[a,b,c],base=lk225Rgb(hx),face={x:(a.x+b.x+c.x)/3,y:(a.y+b.y+c.y)/3,z:(a.z+b.z+c.z)/3};let any=false;
        const out=vs.map(v=>{const q=v.rgb||base;if(rgbFur&&!lk225IsFurRgb(q))return v;const n=lk225Corner(B,v,q,face);if(!n)return v;any=true;return Object.assign({},v,{rgb:n})});
        if(any)return f.call(this,B,t,out[0],out[1],out[2],col)}}catch(e){if(!LK225.err++)console.warn('v225 paint',e)}}
  return f.apply(this,arguments)}}
{const f=mdHeroB;mdHeroB=function(cls,L,E){const paint=L&&!L.skn164&&(L.pat||L.fp||L.scar);if(!paint)return f.apply(this,arguments);
  // the fur palette is only known inside the race build (BR.C): lk225Setup runs on the first painted triangle
  const o={on:K225.on,L:K225.L,fur:K225.fur};K225.on=1;K225.L=L;K225.mk=lk225Rgb(L.pc||LK225.mark[0]);K225.pc=lk225Rgb(L.fpc||LK225.fpc[0]);K225.fur=null;
  try{return f.apply(this,arguments)}finally{K225.on=o.on;K225.L=o.L;K225.fur=o.fur}}}

// ---------------- head size and tail length: bones ----------------
function lk225Bones(h){const b=h&&h.bones,L=h&&h.mdL;if(!b||!L)return;const hs=L.hs||1,tl=L.tl||1;
  if(b.head)b.head.scale.setScalar(hs);
  const D=typeof BRD!='undefined'&&BRD[h._race|0],TB=D&&D.TB||[];
  if(TB.length>=2){TB.forEach((n,i)=>{const o=b[n];if(!o||!i)return;const u=o.userData;if(u.r225!==(h._race|0)||!u.p225){u.p225=o.position.clone();u.r225=h._race|0}o.position.copy(u.p225).multiplyScalar(tl)})}
  else if(TB.length==1&&b[TB[0]])b[TB[0]].scale.setScalar(tl)}
{const f=mdHeroApply;mdHeroApply=function(h,cls,E){const r=f.apply(this,arguments);try{lk225Bones(h)}catch(e){if(!LK225.err++)console.warn('v225 bones',e)}return r}}

// ---------------- the editors (creator step and barber) ----------------
function lk225Ctl(L){const F=lk225Full(L),g=(t,x)=>`<div class="lkg">${t?`<div class="lkl">${t}</div>`:''}${x}</div>`,
    sw=(k,a,cur)=>`<div class="lks">${a.map(c=>`<button class="lksw${cur==c?' on':''}" data-lk="${k}" data-v="${c}" style="background:${c}" title="${c}" aria-label="${k} ${c}"></button>`).join('')}</div>`,
    ch=(k,a,cur)=>`<div class="lkcs">${a.map((n,i)=>`<button class="lkc${cur==i?' on':''}" data-lk="${k}" data-v="${i}">${n}</button>`).join('')}</div>`,
    sl=(k,lab,r,v)=>g(`${lab} <b data-lk225l="${k}">${Math.round(v*100)}%</b>`,`<input class="lkr" type="range" min="${r[0]}" max="${r[1]}" step="0.01" value="${v}" data-lk="${k}" aria-label="${lab}">`);
  const body=sl('tl','Tail length',LK225.tl,F.tl)+g('Underside',ch('bel',LK225.bel,F.bel))+
    `<div class="lk225sec">Coat</div>`+g('Pattern',ch('pat',LK225.pat,F.pat))+(F.pat||F.bel==5?g('Marking colour',sw('pc',LK225.mark,F.pc)):'');
  const head=`<div class="lk225sec">Face</div>`+sl('hs','Head size',LK225.hs,F.hs)+g('War paint',ch('fp',LK225.fp,F.fp))+(F.fp?g('Paint colour',sw('fpc',LK225.fpc,F.fpc)):'')+g('Scar',ch('scar',LK225.scar,F.scar));
  return {body,head}}
{const f=lkCtl;lkCtl=function(L){const r=f.apply(this,arguments);try{const x=lk225Ctl(L);
    r.body=r.body+x.body;
    // the face options go before the Randomize / Reset row
    const i=r.head.lastIndexOf('<div class="lkb">');r.head=i>=0?r.head.slice(0,i)+x.head+r.head.slice(i):r.head+x.head}catch(e){console.warn('v225 editor',e)}return r}}
{const f=lkSet;lkSet=function(state,k,v){if(k=='pc'||k=='fpc'){state.look=Object.assign({},state.look,{[k]:v});return}
  if(k=='hs'||k=='tl'||k=='pat'||k=='bel'||k=='fp'||k=='scar'){state.look=Object.assign({},state.look,{[k]:+v});return}return f.apply(this,arguments)}}
// randomize: the new options too (about half the heroes get a pattern, a few war paint or a scar); reset clears them
{const f=lkInput;lkInput=function(state,e){const a=e.target&&e.target.closest&&e.target.closest('[data-lka]'),r=f.apply(this,arguments);
  try{if(a&&r){if(a.dataset.lka=='rnd'){const R=x=>x[Math.floor(Math.random()*x.length)],q=Math.random;
      Object.assign(state.look,{pat:q()<.55?1+Math.floor(q()*(LK225.pat.length-1)):0,pc:R(LK225.mark),bel:q()<.6?0:Math.floor(q()*LK225.bel.length),
        fp:q()<.25?1+Math.floor(q()*(LK225.fp.length-1)):0,fpc:R(LK225.fpc),scar:q()<.15?1+Math.floor(q()*(LK225.scar.length-1)):0,
        hs:+(.95+q()*.1).toFixed(2),tl:+(.85+q()*.3).toFixed(2)})}}}catch(_){}return r}}
// the sliders' labels follow the value while dragging (the editors only knew the height slider)
function lk225Lbl(e){const t=e.target;if(!t||t.tagName!='INPUT')return;const k=t.dataset.lk;if(k!='hs'&&k!='tl')return;const g=t.closest('.lkg'),b=g&&g.querySelector('[data-lk225l]');if(b)b.textContent=Math.round(+t.value*100)+'%'}
['ccList','ccInfo'].forEach(id=>{const el=$(id);if(el)el.addEventListener('input',lk225Lbl)});
// the right-hand panels hold a slider now (head size): live preview while dragging there too
{const el=$('ccInfo');if(el)el.addEventListener('input',e=>{if(!LK.on)return;if(e.target&&e.target.dataset&&e.target.dataset.lk=='hs'){lkInput(LK,e);lkQueue()}})}
{const f=lkBarberHTML;lkBarberHTML=function(){const had=!!$('lkw');const r=f.apply(this,arguments);if(!had){try{const R=$('lkwR'),Lf=$('lkwL');
    if(Lf)Lf.addEventListener('input',lk225Lbl);
    if(R)R.addEventListener('input',e=>{lk225Lbl(e);if(LKB.on&&e.target&&e.target.dataset&&e.target.dataset.lk=='hs'){lkInput(LKB,e);lkBQ()}})}catch(_){}}return r}}
document.head.insertAdjacentHTML('beforeend',`<style id="lk225css">
.lk225sec{margin:10px 0 2px;font-family:Cinzel,Georgia,serif;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:#c9a24a;border-top:1px solid rgba(201,162,74,.25);padding-top:7px}
.lkp .lkcs{flex-wrap:wrap}
.lkp{overflow-y:auto}
</style>`);
