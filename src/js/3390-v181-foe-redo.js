// ================= v181: eleven enemy models rebuilt from scratch =================
// Owner (Oct 30 2026): "completely redo the yeti, stormborn jotun, all naga models, the harpy, blood magister, vampire thrall,
// blood knight, crimson executioner and nosferatu — too simple, goofy looking, bad anatomy or didn't fit the game's style".
// This file: an anatomy toolkit (sculpted torsos, muscled arms with real hands and fingers, legs, bare feet, faces) and the new
// humanoid bodies, registered like the v113 / v137 builders (N3.humB[key].body, built inside the v99 proportion preset).
// The naga (snake bodies on tail bones of their own) and the harpies (an upright skeleton of their own) are in 3391 / 3392.
var A181={on:true,keys:{},pre:{},cur:null};
// own proportions per model (v99 presets: the rest pose of bones and body is re-proportioned the same way), so legs, arms, neck
// and head follow each creature's anatomy instead of the stubby HB base
Object.assign(AW_PROP99.PRE,{
  v181k:{pelvis:[.95,1,.92],spine:[.9,1.12,.88],chest:[.95,1.08,.9],neck:[1,1.35,1],head:.74,arm:[1.22,.95],hand:.92,leg:[1.46,1],foot:1,cape:[1.4,1]},
  v181g:{pelvis:[.84,1,.8],spine:[.76,1.14,.76],chest:[.82,1.1,.8],neck:[.92,1.55,.92],head:.8,arm:[1.3,.82],hand:1,leg:[1.42,.84],foot:1.05,cape:[1.38,1]},
  v181y:{pelvis:[1.1,1,1.05],spine:[1.1,1.02,1.1],chest:[1.18,1.04,1.12],neck:[1.1,.85,1.1],head:.8,arm:[1.42,1.15],hand:1.25,leg:[1.06,1.15],foot:1.2,cape:[1,1]},
  v181j:{pelvis:[1.04,1,1],spine:[1,1.1,1],chest:[1.08,1.08,1.04],neck:[1,1.2,1],head:.8,arm:[1.26,1.08],hand:1.12,leg:[1.36,1.08],foot:1.08,cape:[1.3,1]},
  v181e:{pelvis:[1.08,1,1.05],spine:[1.06,1.05,1.1],chest:[1.06,1.05,1.05],neck:[1,1.05,1],head:.8,arm:[1.22,1.1],hand:1.1,leg:[1.3,1.1],foot:1.05,cape:[1.3,1]},
  v181m:{pelvis:[.86,1,.84],spine:[.8,1.16,.8],chest:[.86,1.1,.84],neck:[.95,1.5,.95],head:.76,arm:[1.28,.85],hand:.95,leg:[1.5,.9],foot:1,cape:[1.45,1]}});
{const f=AW_PROP99.forKey;AW_PROP99.forKey=k=>A181.on&&A181.pre[k]||f(k)}
{const f=mkBones;mkBones=function(Sp){const S=AW_PROP99,pn=A181.cur&&A181.pre[A181.cur];if(!pn)return f.apply(this,arguments);const o=S.ctx;S.ctx=pn;try{return f.apply(this,arguments)}finally{S.ctx=o}}}
{const f=mkHumanoid;mkHumanoid=function(key){const o=A181.cur;A181.cur=A181.on&&A181.pre[key]?key:null;try{return f.apply(this,arguments)}finally{A181.cur=o}}}
function a181Reg(key,fn,pre){if(!A181.on)return;const D=N3.humB[key]||(N3.humB[key]={});D.body=fn;A181.keys[key]=1;if(pre)A181.pre[key]=pre}
const a181V=(x,y,z)=>new THREE.Vector3(x,y,z);
// a stable 0..1 hash (scatter, ragged hems)
function a181H(a,b,c){const v=Math.sin(a*127.1+b*311.7+(c||0)*74.7)*43758.5453;return v-Math.floor(v)}

// soft uneven shading instead of stripes: base darkened by smooth noise (amt 0..1), f = blotch frequency
function a181Nz(base,m,amt,f,seed){const v=n3Sn(m.x,m.y,m.z,f||14,seed||0);return mdSh(base,1-(amt==null?.25:amt)*(1-v*1.6>0?1-v*1.6:0)-(amt==null?.25:amt)*.3*v)}
// ---------------- torso ----------------
// shapes: rings [y, rx (half width), f (front), b (back), z]; weights by height as every humanoid (mdTorsoW)
const A181T={
  brute:[[.42,.15,.11,.12],[.48,.18,.13,.14],[.54,.19,.15,.145],[.6,.19,.165,.135],[.67,.2,.175,.13],[.74,.215,.17,.135],[.81,.235,.165,.145],[.87,.25,.165,.155],[.925,.255,.15,.16],[.965,.232,.12,.155],[1.0,.14,.095,.125],[1.035,.088,.078,.085],[1.075,.072,.07,.07]],
  knight:[[.42,.13,.1,.11],[.5,.148,.108,.122],[.56,.146,.104,.114],[.62,.134,.098,.1],[.7,.146,.106,.104],[.78,.18,.13,.114],[.86,.214,.146,.126],[.92,.226,.14,.132],[.965,.2,.11,.118],[1.0,.104,.078,.088],[1.035,.064,.064,.06],[1.075,.057,.059,.056]],
  lean:[[.42,.13,.092,.1],[.5,.148,.1,.114],[.56,.146,.096,.11],[.62,.13,.088,.094],[.7,.138,.094,.098],[.78,.162,.112,.106],[.86,.188,.126,.116],[.92,.198,.122,.122],[.965,.18,.098,.11],[1.0,.094,.07,.08],[1.035,.056,.056,.054],[1.075,.05,.053,.05]],
  gaunt:[[.42,.12,.084,.094],[.5,.134,.088,.104],[.56,.128,.08,.098],[.62,.11,.066,.088],[.7,.118,.074,.092],[.78,.146,.1,.104],[.86,.168,.116,.114],[.92,.178,.112,.12],[.965,.166,.09,.112],[1.0,.086,.064,.076],[1.035,.05,.052,.05],[1.075,.046,.05,.047]]};
function a181TRings(kind,sc){const s=sc||{};return (Array.isArray(kind)?kind:A181T[kind]).map(q=>{const y=q[0],up=y>.97?(s.neck||1):1;
  return {p:[0,y,(q[4]||0)+(s.z?s.z(y):0)],rx:q[1]*(s.w||1)*up,f:q[2]*(s.d||1)*up,b:q[3]*(s.d||1)*up,w:mdTorsoW(y),y}})}
function a181Torso(B,P,R,col,o){P._T=R;mdLoft(B,R,Object.assign({seg:16,capA:true,col},o||{}));return R}
// a shell over the torso between y0 and y1 (armour, coats): the torso rings pushed out by off (+ per-ring flare fn)
function a181TShell(P,y0,y1,off,fl){const T=P._T,R=[];const at=y=>{const q=mdTorsoAt(P,y);return {p:[0,y,q.z],rx:q.rx,f:q.f,b:q.b,w:mdTorsoW(y),y}};
  R.push(at(y0));T.forEach(r=>{if(r.y>y0+.008&&r.y<y1-.008)R.push(Object.assign({},r,{p:r.p.slice()}))});R.push(at(y1));
  R.forEach(r=>{const e=off+(fl?fl(r.y):0);r.rx+=e;r.f+=e;r.b+=e});return R}

// ---------------- arms, hands ----------------
// A: {sh deltoid, bi upper arm, el elbow, fo forearm, wr wrist} (1 = average man); returns the rings (shells reuse them)
function a181ArmR(P,s,A){A=A||{};const bn=s<0?'aL':'aR',Bt=P.bones,A0=mdV(Bt[bn+'0']),A1=mdV(Bt[bn+'1']),A2=mdV(Bt[bn+'2']),L=(a,b,t)=>a.clone().lerp(b,t),xo=s*(P.armX||0);
  const g=k=>A[k]==null?1:A[k],r=(p,rx,f,b,w,part)=>({p:[p.x+xo,p.y,p.z],rx,f,b,w,part}),sh=g('sh'),bi=g('bi'),el=g('el'),fo=g('fo'),wr=g('wr');
  return [r(A0.clone().add(a181V(-s*.035,.04,0)),.066*sh,.064*sh,.07*sh,[['chest',.6],[bn+'0',.4]],'up'),
    r(L(A0,A1,.06).add(a181V(s*.014,.012,0)),.08*sh,.074*sh,.076*sh,[['chest',.15],[bn+'0',.85]],'up'),
    r(L(A0,A1,.3).add(a181V(s*.006,0,0)),.066*bi,.066*bi,.064*bi,[[bn+'0',1]],'up'),
    r(L(A0,A1,.58),.056*bi,.07*bi,.06*bi,[[bn+'0',1]],'up'),
    r(L(A0,A1,.86),.05*el,.052*el,.054*el,[[bn+'0',.85],[bn+'1',.15]],'up'),
    r(A1,.045*el,.044*el,.054*el,[[bn+'0',.5],[bn+'1',.5]],'el'),
    r(L(A1,A2,.2),.055*fo,.052*fo,.056*fo,[[bn+'1',1]],'fore'),
    r(L(A1,A2,.55),.046*fo,.042*fo,.044*fo,[[bn+'1',1]],'fore'),
    r(L(A1,A2,.93),.033*wr,.033*wr,.031*wr,[[bn+'1',.5],[bn+'2',.5]],'wrist')]}
function a181Arm(B,P,s,A,col,o){const R=a181ArmR(P,s,A);mdLoft(B,mdDome(R),Object.assign({seg:10,capA:true,col},o||{}));return R}
// a finger / claw: a chain of tapered segments from p along d, each turning by curl about axis ax
function a181Digit(k,bn,col,p,d,len,r,n,curl,ax,tip,tipCol,t){t=t||'c';let a=p.slice(),dir=a181V(...d).normalize();const AX=a181V(...ax).normalize(),q=new THREE.Quaternion().setFromAxisAngle(AX,curl);
  for(let i=0;i<n;i++){const L=len/n,b=[a[0]+dir.x*L,a[1]+dir.y*L,a[2]+dir.z*L],r0=r*(1-i*.18/n*2),r1=r*(1-(i+1)*.18/n*2);k.L(bn,t,col,a,b,r0,r1,5);a=b;dir.applyQuaternion(q)}
  if(tip){const b=[a[0]+dir.x*tip,a[1]+dir.y*tip,a[2]+dir.z*tip];k.L(bn,t,tipCol==null?0x141012:tipCol,a,b,r*.75,.0015,4)}}
// a hand: palm loft + fingers and thumb (kit). H: {kind 'open'|'claw'|'fist', len (finger length factor), w (palm), col, nail, tip (claw length)}
function a181Hand(B,P,k,s,H){H=H||{};const bn=s<0?'aL':'aR',A1=mdV(P.bones[bn+'1']),A2=mdV(P.bones[bn+'2']),d=A2.clone().sub(A1).normalize(),xo=s*(P.armX||0),w=H.w||1,col=H.col,nail=H.nail==null?mdSh(col,.6):H.nail;
  const at=t=>A2.clone().add(d.clone().multiplyScalar(t)).add(a181V(xo,0,0)),W=[[bn+'2',1]];
  const R=[{p:at(-.012).toArray(),rx:.03*w,f:.034*w,b:.03*w,w:[[bn+'1',.4],[bn+'2',.6]]},{p:at(.03).toArray(),rx:.026*w,f:.046*w,b:.04*w,w:W},{p:at(.07).toArray(),rx:.024*w,f:.048*w,b:.04*w,w:W},{p:at(.088).toArray(),rx:.02*w,f:.044*w,b:.036*w,w:W}];
  mdLoft(B,R,{seg:8,capB:true,col,t:H.t||'c'});
  const kn=at(.084),fl=(H.len||1)*(H.kind=='claw'?.095:H.kind=='fist'?.06:.075),r=.0105*w*(H.fr||1),inward=[-s,0,0];
  for(let i=0;i<4;i++){const z=(1.5-i)*.022*w-.004,l=fl*(i==0||i==3?.86:1)*(i==3?.85:1),p=[kn.x-s*.004,kn.y,kn.z+z];
    if(H.kind=='fist')a181Digit(k,bn+'2',col,p,[d.x-s*.4,d.y,d.z+.05],l,r*1.1,2,1.15,[0,0,s],0,null,H.t);
    else a181Digit(k,bn+'2',col,p,[d.x-s*.18,d.y,d.z+z*.8],l,r,3,H.kind=='claw'?.28:.16,[0,0,s],H.tip||(H.kind=='claw'?.035:.006),nail,H.t)}
  const tb=at(.03);a181Digit(k,bn+'2',col,[tb.x-s*.012,tb.y,tb.z+.036*w],[d.x-s*.3,d.y*.6,.75],fl*.75,r*1.15,2,.3,[0,1,0],H.kind=='claw'?.03:.005,nail,H.t)}

// ---------------- legs, feet ----------------
function a181LegR(P,s,L0){L0=L0||{};const l=s<0?'lh':'rh',Bt=P.bones,H0=mdV(Bt[l+'0']),K=mdV(Bt[l+'1']),A=mdV(Bt[l+'2']),L=(a,b,t)=>a.clone().lerp(b,t),g=k=>L0[k]==null?1:L0[k];
  const th=g('th'),kn=g('kn'),ca=g('ca'),an=g('an'),r=(p,rx,f,b,w,part)=>({p:p.toArray(),rx,f,b,w,part});
  return [r(H0.clone().add(a181V(-s*.004,.03,0)),.094*th,.096*th,.104*th,[['pelvis',.55],[l+'0',.45]],'hip'),
    r(L(H0,K,.22),.092*th,.098*th,.094*th,[[l+'0',1]],'thigh'),r(L(H0,K,.55),.08*th,.088*th,.082*th,[[l+'0',1]],'thigh'),
    r(L(H0,K,.86),.066*kn,.068*kn,.064*kn,[[l+'0',.85],[l+'1',.15]],'knee'),r(K.clone().add(a181V(0,0,.004)),.062*kn,.07*kn,.058*kn,[[l+'0',.5],[l+'1',.5]],'knee'),
    r(L(K,A,.22),.064*ca,.058*ca,.078*ca,[[l+'1',1]],'shin'),r(L(K,A,.5),.054*ca,.05*ca,.06*ca,[[l+'1',1]],'shin'),
    r(L(K,A,.8),.042*an,.04*an,.042*an,[[l+'1',1]],'shin'),r(A.clone().add(a181V(0,.012,0)),.042*an,.042*an,.044*an,[[l+'1',.4],[l+'2',.6]],'ankle')]}
function a181Leg(B,P,s,L0,col,o){const R=a181LegR(P,s,L0);mdLoft(B,mdDome(R),Object.assign({seg:10,capA:true,col},o||{}));return R}
// a bare foot (heel, sole, toes); F: {w, len, claw (toe claw length), col, nail}
function a181Foot(B,P,k,s,F){F=F||{};const bn=(s<0?'lh':'rh')+'2',A=mdV(P.bones[bn]),w=F.w||1,ln=F.len||1,col=F.col,x=A.x,W=[[bn,1]];
  const r=(z,y,rx,f,b)=>({p:[x,y,A.z+z*ln],rx:rx*w,f,b,w:W});
  mdLoft(B,[r(-.065,.048,.04,.03,.036),r(-.035,.052,.05,.042,.044),r(.03,.042,.054,.034,.04),r(.09,.03,.056,.024,.028),r(.115,.024,.05,.018,.02)],{seg:9,ref:[0,1,0],capA:true,capB:true,col});
  const n=F.toes||5;for(let i=0;i<n;i++){const tx=x+(i-(n-1)/2)*.021*w*(5/n),tz=A.z+.112*ln,l=(F.toe||.03)*(i==Math.floor(n/2)?1.1:.9);
    k.L(bn,'c',col,[tx,.022,tz],[tx+(i-(n-1)/2)*.004,.014,tz+l],.011*w,.008*w,4);if(F.claw)k.L(bn,'c',F.nail==null?0x141012:F.nail,[tx+(i-(n-1)/2)*.004,.014,tz+l],[tx+(i-(n-1)/2)*.006,.003,tz+l+F.claw],.007*w,.001,4)}}

// ---------------- heads ----------------
// a sculpted skull + face around the head bone: brow ridge, eye line, cheekbones, upper jaw, chin, crown. h: {w, jaw, chin,
// cheek, gaunt (hollow cheeks), brow, len (face forward), crown (cranium height), back}; sets P._H (mdHeadZ / mdHeadX use it)
function a181HeadR(P,h){h=h||{};const w=h.w||1,jw=h.jaw||1,ln=h.len||1,cr=h.crown||1,ch=h.cheek||1,ga=h.gaunt||0,bk=h.back||1,fz=h.fz||0;
  const R=(y,rx,f,b,ww,z)=>({p:[0,y,(z||0)+fz],rx:rx*w,f:f*ln,b:b*bk,w:ww||[['head',1]],y});
  const Q=[R(1.012,.054,.052,.054,[['neck',.6],['head',.4]],.0),R(1.036,.062*jw,.07*(h.chin||1),.062,[['neck',.25],['head',.75]]),R(1.058,.07*jw,.094*(h.chin||1),.068),R(1.083,.078*jw-ga*.012,.104,.078),
    R(1.108,(.086-ga*.014)*ch,.108,.088),R(1.13,.094*ch,.106,.096),R(1.15,.096,.1,.102),R(1.172,.097,.106*(h.brow||1),.106),R(1.196,.095,.096,.108),
    R(1.196+.026*cr,.088,.078,.104),R(1.196+.05*cr,.07,.05,.084),R(1.196+.068*cr,.036,.022,.044)];return Q}
function a181Head(B,P,h,col,o){const H=a181HeadR(P,h);P._H=H;mdLoft(B,H,Object.assign({seg:16,capA:true,capB:true,col},o||{}));return H}
// eyes in dark sockets: glowing (glow colour) or plain
function a181Eyes(k,P,e){e=e||{};const y=e.y||1.148,x=e.x||.04,z=mdHeadZ(P,y),r=e.r||1;[-1,1].forEach(s=>{
  k.p('head','sph','c',e.sock==null?0x0c0808:e.sock,s*x,y+.002,z-.012,.026*r,.017*r,.014,0,0,s*(e.tilt||.15));
  if(e.glow!=null)k.p('head','sph','g',e.glow,s*x,y,z-.004,.012*r,.007*r,.006,0,0,s*(e.tilt||.15));
  else{k.p('head','sph','c',0xd8d0c4,s*x,y,z-.006,.014*r,.008*r,.007);k.p('head','sph','c',e.iris||0x3a1a10,s*(x-.002),y,z-.0005,.006*r,.006*r,.004)}
  if(e.brow!==false)k.p('head','box','c',e.brow==null?mdSh(e.skin||0x806060,.62):e.brow,s*(x+.004),y+.02,mdHeadZ(P,y+.02)-.004,.042,.012,.02,-.2,0,s*(e.browTilt==null?-.25:e.browTilt))})}
// a nose ridge (bridge → tip), nostrils
function a181Nose(k,P,col,n){n=n||{};const y0=1.15,y1=n.y1||1.105,z0=mdHeadZ(P,y0)-.008,z1=mdHeadZ(P,y1)+(n.out||.024),l=n.len||1;
  k.L('head','c',col,[0,y0,z0],[0,y1,z1*l+z0*(1-l)],n.r||.013,n.tip||.011,4);k.p('head','sph','c',col,0,y1-.004,z1-.008,.017*(n.w||1),.012,.014);
  [-1,1].forEach(s=>k.p('head','sph','c',mdSh(col,.45),s*.009,y1-.01,z1-.006,.005,.003,.004))}
// a mouth: lips slit, optional fangs / teeth
function a181Mouth(k,P,o){o=o||{};const y=o.y||1.074,z=mdHeadZ(P,y),w=o.w||1;k.p('head','box','c',o.col==null?0x1a0808:o.col,0,y,z-.004,.05*w,o.open||.008,.012);
  if(o.lip!=null)k.p('head','box','c',o.lip,0,y+.008+(o.open||0)/2,z-.002,.052*w,.006,.01);
  (o.fangs||[]).forEach(f=>k.p('head','cone4','c',o.tooth||0xe8e0d0,f[0],y+(f[2]?-.004:.002),z-.002,.0055,f[1],.0055,f[2]?0:Math.PI))}
// a pointed ear: base on the side of the head, tip back and up
function a181Ear(k,P,s,col,e){e=e||{};const y=e.y||1.15,x=mdHeadX(P,y),L=e.len||.08,up=e.up==null?.45:e.up,bk=e.back==null?.5:e.back;
  const tip=[s*(x+L*Math.cos(up)*.6),y+L*Math.sin(up),-.01-L*bk*.6];k.L('head','c',col,[s*(x-.004),y-.008,-.004],tip,e.r||.022,.002,4);
  k.L('head','c',col,[s*(x-.004),y-.02,.004],[tip[0]*.97,tip[1]-.012,tip[2]+.006],(e.r||.022)*.7,.002,4);if(e.inner)k.p('head','sph','c',e.inner,s*(x+.006),y+.004,-.008,.006,.022,.012,0,0,s*-.6)}
// strands of hair from the scalp: n strands round the back / sides, falling to y1
function a181Hair(k,P,col,o){o=o||{};const n=o.n||18,y1=o.y1||.98,col2=o.col2==null?mdSh(col,.75):o.col2;
  for(let i=0;i<n;i++){const a=(o.a0==null?.9:o.a0)+i/(n-1)*((o.a1==null?Math.PI*2-.9:o.a1)-(o.a0==null?.9:o.a0)),y=1.215+a181H(i,3)*.02,x=Math.sin(a),z=Math.cos(a),R=mdHeadX(P,y)*.98,F=.1;
    const p=[x*R,y,z*(z>0?F:.106)-.004],m=[x*(R+.02),y-.09,z*.12-.006],e=[x*(R+.012+a181H(i,7)*.03),y1+a181H(i,9)*.06,z*.11-.02-a181H(i,5)*.03];
    k.L('head','c',i%2?col:col2,p,m,o.r||.018,(o.r||.018)*.7,4);k.L(o.bn||'neck','c',i%2?col:col2,m,e,(o.r||.018)*.7,.003,4)}}

// long hair: a draped shell over the crown and down the back of the head, open at the face, ragged ends; o {y1, col, col2, thick, rag, front (0..1 how far it wraps forward)}
function a181HairCap(B,P,o){const th=o.thick||.014,y1=o.y1||.96,fr=o.front==null?.15:o.front,col2=o.col2==null?mdSh(o.col,.7):o.col2,R=[];
  const Y=[1.272,1.255,1.225,1.195,1.165,1.135,1.1,1.06,1.02,y1+(1.02-y1)*.5,y1];Y.forEach((y,i)=>{const hy=Math.max(1.03,Math.min(1.26,y)),x=mdHeadX(P,hy),H=P._H;let f=.05,b=.1;
    for(let j=0;j<H.length-1;j++){if(hy<=H[j+1].y){const t=(hy-H[j].y)/(H[j+1].y-H[j].y);f=H[j].f+(H[j+1].f-H[j].f)*t;b=H[j].b+(H[j+1].b-H[j].b)*t;break}}
    const below=Math.max(0,1.06-y),w=y>1.1?[['head',1]]:y>1.0?[['head',.6],['neck',.4]]:[['neck',.5],['chest',.5]];
    R.push({p:[0,y,-.004-below*.25],rx:i==0?th*.4:(y>1.06?x:x+below*.3)+th,f:(y>1.2?f:Math.min(f,.06))+th,b:(y>1.06?b:b+below*.25)+th,w})});
  mdLoft(B,R,{seg:20,capA:true,col:m=>Math.round(Math.atan2(m.c,m.s)*10)%2?o.col:col2,keep:m=>{const a=Math.atan2(m.c,m.s);if(m.y<1.2&&Math.abs(a)<Math.PI*(1-fr)/2+.35)return false;if(m.i>R.length-2.5&&a181H(Math.round(a*7),1)<(o.rag==null?.5:o.rag)*(m.i-(R.length-2.5)))return false;return true}})}
// ---------------- clothes, armour, capes ----------------
// a draped cape on the cape bones: folds (wavy outline), ragged hem; o: {len, w, col, ins (inside), trim, rag (0..1), y0}
function a181Cape(B,P,o){const off=(P.tOff||0)+.012,len=o.len||.3,w=o.w||1,col=o.col,ins=o.ins==null?mdSh(col,.55):o.ins,rag=o.rag==null?.5:o.rag,y0=o.y0||.995;
  const at=(y,bn,rx)=>{const q=mdTorsoAt(P,Math.min(.97,y));return {p:[0,y,-(Math.max(q.b,.11)+off+Math.max(0,.97-y)*.13)],rx:rx*w,f:.014,b:.014,w:bn}};
  const R=[at(y0,[['chest',.7],['cp0',.3]],.17),at(.9,[['chest',.2],['cp0',.8]],.215),at(.78,[['cp0',1]],.235),at(.64,[['cp0',.5],['cp1',.5]],.25),at(.5,[['cp1',1]],.26),at(.36,[['cp1',.4],['cp2',.6]],.27),at(len,[['cp2',1]],.28)];
  R[0].p[2]=-(mdTorsoAt(P,Math.min(.97,y0)).b+off-.004);
  mdLoft(B,R,{seg:22,capA:true,col:m=>m.s>.2?ins:(o.trim!=null&&m.i<.6?o.trim:Math.round(Math.atan2(m.c,-m.s)*9)%2?col:mdSh(col,.82)),
    keep:m=>!(m.i>R.length-2.2&&a181H(Math.round(Math.atan2(m.c,m.s)*6),2)<rag*(m.i-(R.length-2.2))*.9)})}
// banded lames (plates) on a loft: colour by ring index
function a181Band(c1,c2,n){return m=>Math.floor(m.i*(n||1))%2?c1:c2}
// a closed boot / sabaton over the foot: heel, instep, a pointed toe; o: {col, t, toe (point length), cuff}
function a181Boot(B,P,s,o){const bn=(s<0?'lh':'rh')+'2',A=mdV(P.bones[bn]),x=A.x,W=[[bn,1]],tp=o.toe||.05,r=(z,y,rx,f,b)=>({p:[x,y,A.z+z],rx,f,b,w:W});
  mdLoft(B,[r(-.075,.055,.046,.036,.044),r(-.04,.07,.058,.05,.054),r(.03,.052,.06,.04,.048),r(.1,.036,.056,.028,.03),r(.12+tp*.5,.026,.04,.018,.02),r(.12+tp,.016,.01,.006,.008)],{seg:10,ref:[0,1,0],capA:true,capB:true,col:o.col,t:o.t||'c'})}
// shells over arm / leg rings (slices of the ring lists), pushed out by off
function a181Shell(B,R,i0,i1,off,col,o){const Q=R.slice(i0,i1+1).map(r=>Object.assign({},r,{rx:r.rx+off,f:r.f+off,b:r.b+off}));mdLoft(B,i0==0?mdDome(Q):Q,Object.assign({seg:10,col},i0==0?{capA:true}:{},o||{}))}
// a helm over the head rings (the face is hidden): o {off, col, t, slit (visor slit colour), face fn(m)→colour|null}
function a181Helm(B,P,o){const H=P._H,off=o.off||.022;const R=H.map(r=>Object.assign({},r,{p:r.p.slice(),rx:r.rx+off,f:r.f+off*1.2,b:r.b+off}));
  mdLoft(B,R,{seg:18,capA:false,capB:true,t:o.t||'m',col:m=>{const c=o.face&&o.face(m);return c!=null?c:o.col}})}

// ===================================================================== Blood Knight =====================================================================
// A towering vampire knight in fluted plate the colour of dried blood: layered bat-wing pauldrons with swept fins, a closed
// helm with a narrow T-slit (the eyes burn inside it) and a crest of blades, a mail skirt under banded tassets, spiked
// couters and poleyns, pointed sabatons, a torn crimson cape. Carries the greatsword.
a181Reg('vampk',function(B,P,k,L){const pl=0x2a1419,pl2=0x40202a,ed=0x5a262c,gd=0x6e5230,ml=0x3a3a40,un=0x161012,cl=0x4e0a14,glow=0xff2a30;
  a181Torso(B,P,a181TRings('knight',{w:1.04,d:1.04}),un);
  const AR=[-1,1].map(s=>a181Arm(B,P,s,{sh:1.1,bi:1.08,fo:1.08,wr:1.05},un)),LR=[-1,1].map(s=>a181Leg(B,P,s,{th:.98,kn:.95,ca:.96,an:.92},un));
  const H=a181HeadR(P,{w:1.04,jaw:1.05});P._H=H;
  // cuirass: breastplate with a centre ridge and fluting, banded lames over the belly, a gilded rim
  const C=a181TShell(P,.6,.975,.024,y=>y>.8?.008:y<.66?-.004:0);mdLoft(B,C,{seg:18,t:'m',col:m=>m.i<.45||m.i>C.length-1.5?gd:m.y<.74?(Math.round(m.y*36)%2?pl:pl2):Math.abs(m.c)<.1&&m.s>0?pl2:Math.round(Math.atan2(m.c,m.s)*7)%2?pl:mdSh(pl,.82)});
  // gorget
  mdLoft(B,[{p:[0,.955,0],rx:.2,f:.15,b:.14,w:[['chest',1]]},{p:[0,.995,0],rx:.13,f:.11,b:.11,w:[['chest',.6],['neck',.4]]},{p:[0,1.03,0],rx:.088,f:.086,b:.086,w:[['neck',1]]},{p:[0,1.05,0],rx:.08,f:.08,b:.08,w:[['neck',.5],['head',.5]]}],{seg:16,t:'m',col:m=>m.i>2.4?gd:Math.round(m.i*2)%2?pl:pl2});
  // tassets (banded lames) over a mail skirt
  mdSkirt(B,P,.6,.42,.03,.012,{n:5,col:m=>Math.round(m.y*50)%3==0?0x1c1c20:0x2a2a30});
  mdSkirt(B,P,.6,.4,.035,.03,{n:5,t:'m',keep:m=>Math.abs(m.c)>.2||m.s<-.2,col:m=>m.y<.42?gd:Math.round(m.y*28)%2?pl:pl2});
  // belt with a skull-and-wing buckle
  mdLoft(B,a181TShell(P,.585,.615,.038),{seg:18,t:'m',col:0x1a1012});const bz=mdTorsoAt(P,.6).f+.045;k.p('pelvis','sph','m',gd,0,.6,bz,.03,.028,.014);
  [-1,1].forEach(s=>k.p('pelvis','cone4','m',gd,s*.04,.605,bz-.004,.012,.05,.006,0,0,s*1.25));
  // the chest: a gilded bat sigil round a blood gem
  const cz=mdTorsoAt(P,.86).f+.036;k.p('chest','oct','g',glow,0,.86,cz,.022,.03,.012);[-1,1].forEach(s=>{for(let i=0;i<3;i++)k.p('chest','cone4','m',gd,s*(.035+i*.022),.87-i*.012,cz-.006-i*.003,.012,.06-i*.012,.005,0,0,s*(1.0+i*.25))});
  // pauldrons: three layered dome lames each side, a swept fin of blades, a gilded rim
  [-1,1].forEach((s,i)=>{const a=s<0?'aL0':'aR0',x=P.bones[a][1];
    [[1.005,.118,.085,.125,pl],[.965,.11,.07,.118,pl2],[.925,.1,.06,.108,ed]].forEach(([y,sx,sy,sz,c],j)=>{k.p(a,'hem','m',c,x+s*(.02+j*.012),y,0,sx,sy,sz,0,0,s*(.42+j*.12));k.p(a,'tor','m',gd,x+s*(.02+j*.012),y-.004,0,sx*1.0,.012,sz*1.0,0,0,s*(.42+j*.12))});
    for(let j=0;j<3;j++)k.p(a,'cone4','m',j==1?pl2:pl,x+s*(.02+j*.025),1.06+j*.015,-.03-j*.03,.024,.16-j*.035,.008,-.55-j*.12,0,-s*(.3+j*.15));
    // rerebrace, couter with a back spike, vambrace flared at the wrist
    const R=AR[i];a181Shell(B,R,2,4,.016,pl,{t:'m',col:m=>Math.round(m.i*2)%2?pl:pl2});a181Shell(B,R,6,8,.016,pl,{t:'m',col:m=>m.i>1.6?gd:pl});
    const e=R[5].p;k.p(a.replace('0','1'),'sph','m',pl2,e[0],e[1],e[2]-.01,.06,.055,.06);k.L(a.replace('0','1'),'m',ed,[e[0],e[1],e[2]-.05],[e[0]+s*.02,e[1]+.03,e[2]-.12],.022,.002,4);
    a181Hand(B,P,k,s,{kind:'fist',col:pl,t:'m',w:1.1});
    // cuisses, poleyn with a spike, greaves, pointed sabatons
    const G=LR[i],l=s<0?'lh':'rh';a181Shell(B,G,1,3,.014,pl,{t:'m',col:m=>Math.round(m.i*2)%2?pl:pl2});
    const kq=G[4].p;k.p(l+'1','hem','m',pl2,kq[0],kq[1],kq[2]+.04,.07,.05,.06,Math.PI/2,0,0);k.L(l+'1','m',ed,[kq[0],kq[1]+.01,kq[2]+.09],[kq[0],kq[1]+.07,kq[2]+.15],.02,.002,4);
    a181Shell(B,G,5,8,.014,pl,{t:'m',col:m=>m.i<.4?gd:m.s>.6?pl2:pl});a181Boot(B,P,s,{col:pl,t:'m',toe:.07})});
  // closed helm: T-slit, burning eyes inside, a bevor, a crest of blades and two horns sweeping back
  a181Helm(B,P,{off:.026,col:pl,face:m=>{if(m.s>.55){if(m.y>1.138&&m.y<1.158)return 0x080404;if(Math.abs(m.c)<.12&&m.y>1.07&&m.y<1.15)return 0x080404}return m.y>1.2&&Math.abs(m.c)<.14?pl2:m.y<1.05?gd:null}});
  [-1,1].forEach(s=>k.p('head','sph','g',glow,s*.04,1.148,mdHeadZ(P,1.148)+.012,.013,.006,.006));
  k.L('head','m',pl2,[0,1.262,.06],[0,1.29,-.04],.016,.012,4);k.L('head','m',pl2,[0,1.29,-.04],[0,1.25,-.18],.012,.002,4);
  [-1,1].forEach(s=>{let p=[s*.09,1.2,-.02];const d=[[s*.06,.03,-.05],[s*.04,.05,-.06],[s*.01,.06,-.06],[-s*.005,.05,-.05]];d.forEach((q,j)=>{const n=[p[0]+q[0],p[1]+q[1],p[2]+q[2]];k.L('head','m',j<2?pl:ed,p,n,.028-j*.006,.022-j*.006,5);p=n});k.L('head','m',gd,p,[p[0],p[1]+.03,p[2]-.03],.008,.001,4)});
  a181Cape(B,P,{len:.16,w:1.15,col:cl,ins:0x1a0408,trim:gd,rag:.7})},'v181k');
ST179.vampk={sx:.06,hx:-.04,lk:.12,rk:.12,az:.06,lz:-.08,le:-.15};

// ===================================================================== Vampire Thrall =====================================================================
// A starved blood-servant: gaunt and hunched, ash-grey skin with dark veins, ribs and collarbones showing, an iron slave
// collar with a broken chain, a torn crimson coat hanging open, ragged breeches, bare clawed feet. Pointed ears, lank black
// hair, burning eyes sunk in dark sockets, a snarl of fangs. Long black claws; a dagger in the right hand.
a181Reg('vamp',function(B,P,k,L){const sk=0x6e636b,sk2=0x544a52,vein=0x3a2230,co=0x4a0c16,co2=0x2a060c,br=0x1e161a,ir=0x3a3434;
  const skin=m=>a181H(Math.round(m.x*40),Math.round(m.y*40),Math.round(m.z*40))<.12?vein:m.s<-.2?sk2:sk;
  a181Torso(B,P,a181TRings('gaunt',{w:.98}),m=>m.y<.6?br:skin(m));
  const AR=[-1,1].map(s=>a181Arm(B,P,s,{sh:.85,bi:.8,el:.85,fo:.82,wr:.85},skin)),LR=[-1,1].map(s=>a181Leg(B,P,s,{th:.82,kn:.85,ca:.8,an:.85},m=>m.y<.22?skin(m):br));
  [-1,1].forEach(s=>{a181Hand(B,P,k,s,{kind:s>0?'fist':'claw',col:sk,len:s>0?1:1.25,nail:0x1a1214,tip:.045,w:.92});a181Foot(B,P,k,s,{col:sk2,claw:.022,len:1.05,w:.95})});
  // head: hollow cheeks, sharp cheekbones, long jaw
  const H=a181Head(B,P,{w:.92,jaw:.9,gaunt:1,cheek:1.06,len:1.05,crown:1.05},m=>m.s>.5&&m.y>1.135&&m.y<1.165&&Math.abs(m.c)>.08?0x2a1a22:m.y<1.1&&m.s>.3&&Math.abs(m.c)>.25?sk2:sk);
  a181Eyes(k,P,{glow:0xff2a30,brow:0x2a1a22,tilt:.3,browTilt:-.45});a181Nose(k,P,sk,{out:.026,len:1.05});
  a181Mouth(k,P,{open:.016,col:0x2a0608,lip:0x5a3a44,fangs:[[-.016,.026],[.016,.026],[-.008,.012,1],[.008,.012,1]]});
  [-1,1].forEach(s=>a181Ear(k,P,s,sk,{len:.1,up:.5,back:.75}));a181HairCap(B,P,{col:0x0e0a0c,col2:0x1c1418,y1:.97,thick:.01,rag:.8,front:.05});
  // collarbones, ribs, veins on the arms
  [-1,1].forEach(s=>{const p=n3Surf(P,.955,s*.25,.004),q=n3Surf(P,.965,s*.95,.004);k.L('chest','c',sk,p,q,.009,.007,3);for(let i=0;i<4;i++){const y=.88-i*.04,a=n3Surf(P,y,s*.35,.002),b=n3Surf(P,y-.03,s*1.15,.002);k.L('chest','c',sk2,a,b,.007,.006,3)}});
  // a torn waistcoat over the ribs, open in a deep V
  mdLoft(B,a181TShell(P,.6,.95,.008),{seg:18,col:m=>Math.round(m.y*40)%4==0?0x1a1416:0x2a2226,keep:m=>!(m.s>.8&&m.y>.74)&&!(m.y<.66&&a181H(Math.round(m.c*10),7)<.4)});
  // the open coat: shoulders and back down to torn tails, sleeves to the elbow, ragged
  mdLoft(B,a181TShell(P,.58,.985,.02),{seg:18,col:m=>a181Nz(co,m,.35,14),keep:m=>!(m.s>.55)});
  mdSkirt(B,P,.6,.3,.06,.02,{n:5,col:co2,keep:m=>m.s<.35&&!(m.y<.42&&a181H(Math.round(m.c*12),4)<.5)});
  [-1,1].forEach((s,i)=>{const R=AR[i];a181Shell(B,R,0,5,.012,co,{col:m=>m.i>6.2?co2:co,keep:m=>!(m.i>6.3&&a181H(Math.round(m.c*8),s)<.45)})});
  // ragged breeches torn below the knee, a rope belt
  LR.forEach((G,i)=>a181Shell(B,G,0,5,.008,br,{keep:m=>!(m.i>6.3&&a181H(Math.round(m.c*9),i+3)<.5)}));mdLoft(B,a181TShell(P,.585,.61,.012),{seg:16,col:0x3a2e22});
  // iron collar with a broken chain
  mdLoft(B,[{p:[0,1.005,0],rx:.075,f:.072,b:.072,w:[['neck',1]]},{p:[0,1.035,0],rx:.07,f:.068,b:.068,w:[['neck',1]]}],{seg:12,t:'m',col:ir});k.p('neck','tor','m',ir,0,1.0,.078,.016,.008,.016,Math.PI/2,0,0);
  for(let i=0;i<3;i++)k.p('chest','tor','m',mdSh(ir,.8),.004*i,.975-i*.026,mdTorsoAt(P,.975-i*.026).f+.006,.012,.006,.014,i%2?0:Math.PI/2,0,i%2?Math.PI/2:0);
  // dried blood down the chin and chest
  k.p('head','box','c',0x3a0408,.012,1.05,mdHeadZ(P,1.05)-.004,.008,.04,.004);k.p('chest','box','c',0x3a0408,.03,.88,mdTorsoAt(P,.88).f-.002,.012,.08,.004,0,0,.1)},'v181g');
ST179.vamp={sx:.3,hx:-.28,lk:.28,rk:.28,ax:-.25,lx:-.4,az:.14,lz:-.16,ex:-.45,le:-.7};
// a long robe / coat skirt from the waist down: rings flare out, the skin follows pelvis above and the legs below (each
// side its own thigh / shin); o {y0, y1, fl (flare at the hem), off, col, keep, t, seg, dz (hem pushed back)}
function a181Robe(B,P,o){const y0=o.y0||.62,y1=o.y1==null?.04:o.y1,n=o.n||7,q=mdTorsoAt(P,y0),R=[],off=o.off||.012;
  for(let i=0;i<n;i++){const t=i/(n-1),y=y0+(y1-y0)*t,e=Math.min(1,t*2.2),w=Math.max(q.rx,.19);R.push({p:[0,y,(q.z||0)-(o.dz||0)*t*t],rx:q.rx+(w-q.rx)*e+(o.fl||.1)*t+off,f:q.f+(Math.max(q.f,.13)-q.f)*e+(o.fl||.1)*.7*t+off,b:q.b+(Math.max(q.b,.13)-q.b)*e+(o.fl||.1)*.9*t+off,w:[['pelvis',1]],t})}
  const wf=(x,y)=>{const d=Math.max(0,Math.min(1,(y0-y)/Math.max(.05,y0-.3))),k=Math.max(0,Math.min(1,(.3-y)/.25)),l=Math.max(0,Math.min(1,.5-x/.2));
    if(d<=0)return [['pelvis',1]];const a=d*(1-k*.6)*.85,b=d*k*.45;return [['pelvis',1-a-b],['lh0',a*l],['rh0',a*(1-l)],[x<0?'lh1':'rh1',b]]};
  mdLoft(B,R,{seg:o.seg||20,off:0,wf,col:o.col,keep:o.keep,t:o.t||'c'});return R}
// a bell sleeve: from the elbow ring, opening wide past the wrist
function a181Bell(B,P,R,o){const a=R[5],b=R[8],d=[b.p[0]-a.p[0],b.p[1]-a.p[1],b.p[2]-a.p[2]],w=a.w,w2=b.w,op=o.open||.09,off=o.off||.016;
  const ring=(t,r,ww)=>({p:[a.p[0]+d[0]*t,a.p[1]+d[1]*t,a.p[2]+d[2]*t],rx:r,f:r,b:r,w:ww});
  mdLoft(B,[ring(0,a.rx+off,w),ring(.45,a.rx+off+op*.3,R[7].w),ring(.9,a.rx+off+op*.75,w2),ring(1.25,a.rx+off+op,w2)],{seg:12,col:o.col,keep:o.keep})}
// a tall standing collar behind the head (open at the front), ribbed; o {h (top), w (spread), col, ins, rib}
function a181Collar(B,P,k,o){const top=o.h||1.22,w=o.w||1,R=[],Y=[.962,1.0,1.05,1.1,1.16,top];Y.forEach((y,i)=>{const t=i/(Y.length-1),r=(.095+t*t*.15+t*.03)*w;R.push({p:[0,y,-.015-t*t*.07],rx:r,f:r*.8,b:r*.75,w:y<1.0?[['chest',1]]:[['chest',.45],['neck',.55]]})});
  const cut=o.cut||.35;mdLoft(B,R,{seg:22,col:m=>m.s>-.1&&m.i>.5?o.ins:o.col,keep:m=>{const a=Math.abs(Math.atan2(m.c,m.s));if(a<Math.PI*cut+m.i*.12)return false;if(o.rag&&m.i>R.length-2.2&&a181H(Math.round(a*9),4)<o.rag)return false;return true}});
  if(o.rib!=null)for(let i=0;i<4;i++){const a=Math.PI*(.62+i*.25)*(i%2?1:-1),x=Math.sin(a),z=Math.cos(a),p0=R[1],p1=R[R.length-1];k.L('neck','m',o.rib,[x*p0.rx*1.02,p0.p[1],p0.p[2]+z*p0.b*1.02],[x*p1.rx*1.04,p1.p[1]+.01,p1.p[2]+z*p1.b*1.04],.007,.004,4)}}

// ===================================================================== Blood Magister =====================================================================
// A tall, slender vampire noble who works blood into spells: a high ribbed collar fanning behind the head, slicked-back
// black hair with a widow's peak, a long gaunt aristocratic face, layered floor-length robes (a black under-robe, a crimson
// over-robe open down the front, dark-gold embroidered hems), bell sleeves, a sash with a blood vial, long nailed fingers.
a181Reg('vampm',function(B,P,k,L){const sk=0x7e727c,sk2=0x625660,rb=0x560c18,rb2=0x3a0610,un=0x160a0e,gd=0x5a4226,glow=0xff2a3a;
  a181Torso(B,P,a181TRings('lean',{w:.94}),un);const AR=[-1,1].map(s=>a181Arm(B,P,s,{sh:.88,bi:.85,fo:.85,wr:.85},un));[-1,1].forEach(s=>a181Leg(B,P,s,{th:.85,ca:.85},un));
  [-1,1].forEach(s=>{a181Hand(B,P,k,s,{kind:s>0?'fist':'open',col:sk,len:1.25,nail:0x1a0a10,tip:.02,w:.9});a181Boot(B,P,s,{col:0x120a0c,toe:.04})});
  a181Head(B,P,{w:.92,jaw:.92,gaunt:.7,cheek:1.05,len:1.06,crown:1.08},m=>m.s>.5&&m.y>1.135&&m.y<1.165&&Math.abs(m.c)>.08?0x3a2a32:m.y<1.1&&m.s>.3&&Math.abs(m.c)>.25?sk2:sk);
  a181Eyes(k,P,{glow,brow:0x1a1014,tilt:.25,browTilt:-.35});a181Nose(k,P,sk,{out:.028,len:1.08,w:.9});a181Mouth(k,P,{open:.004,col:0x2a0a0e,lip:0x4a2a34,fangs:[[-.014,.018],[.014,.018]]});
  [-1,1].forEach(s=>a181Ear(k,P,s,sk,{len:.065,up:.4,back:.8,r:.018}));
  a181HairCap(B,P,{col:0x0c080a,col2:0x18101a,y1:1.04,thick:.012,rag:.2,front:.0});k.p('head','cone4','c',0x0c080a,0,1.21,mdHeadZ(P,1.21)-.006,.03,.05,.012,Math.PI);
  // robes: under-robe to the floor, over-robe open at the front with gilded hems, a sash, the collar
  a181Robe(B,P,{y0:.62,y1:.02,fl:.12,off:.016,col:m=>m.y<.05?gd:un});
  mdLoft(B,a181TShell(P,.6,.99,.02,y=>y>.9?.004:0),{seg:20,col:m=>Math.abs(Math.atan2(m.c,m.s))<.5?gd:Math.round(m.y*24)%2?rb:mdSh(rb,.9),keep:m=>Math.abs(Math.atan2(m.c,m.s))>.32});
  a181Robe(B,P,{y0:.62,y1:.03,fl:.16,off:.036,dz:.05,col:m=>m.y<.06||Math.abs(Math.atan2(m.c,m.s))<.5?gd:Math.round(Math.atan2(m.c,m.s)*8)%2?rb:rb2,keep:m=>Math.abs(Math.atan2(m.c,m.s))>.42});
  mdLoft(B,a181TShell(P,.57,.64,.05),{seg:20,col:rb2});const sz=mdTorsoAt(P,.6).f+.058;k.p('pelvis','oct','m',gd,0,.6,sz,.03,.035,.014);k.L('pelvis','c',rb2,[.05,.58,sz-.01],[.08,.38,sz-.02],.022,.016,4);
  k.L('pelvis','m',gd,[-.07,.58,sz-.01],[-.08,.52,sz-.004],.004,.004,3);k.p('pelvis','cyl','g',glow,-.08,.49,sz-.004,.014,.05,.014);k.p('pelvis','cyl','m',gd,-.08,.52,sz-.004,.016,.008,.016);
  [-1,1].forEach((s,i)=>{const R=AR[i];a181Shell(B,R,0,5,.014,rb,{col:m=>Math.round(m.i*3)%2?rb:mdSh(rb,.88)});a181Bell(B,P,R,{col:m=>m.i>2.2?gd:rb,off:.016,open:.08})});
  a181Collar(B,P,k,{h:1.23,w:1.05,col:rb2,ins:0x1a0408,rib:gd});
  const cz=mdTorsoAt(P,.86).f+.024;k.p('chest','oct','g',glow,0,.88,cz,.02,.032,.01);for(let i=0;i<7;i++){const a=(i-3)*.16,p=n3Surf(P,.95-Math.abs(i-3)*.02,a,.026);k.p('chest','sph','m',gd,p[0],p[1],p[2],.009)}},'v181m');
ST179.vampm={sx:.08,hx:-.06,lk:.08,rk:.08,lz:-.06,le:-.25};

// ===================================================================== Nosferatu =====================================================================
// The oldest of the vampires, more beast than noble: a bald, elongated skull with huge bat ears, a hooked nose and rat-like
// front teeth, eyes burning deep in black sockets; corpse-grey skin over every rib and knuckle of the spine; impossibly long
// fingers ending in hooked nails; a long, rotted black coat with a torn standing collar that drags in tatters.
a181Reg('nosferatu',function(B,P,k,L){const sk=0x5e6058,sk2=0x464a40,vein=0x2e2a28,co=0x14100e,co2=0x221a18,glow=0xff2a20,nail=0x2a2018;
  const skin=m=>a181H(Math.round(m.x*30),Math.round(m.y*30),Math.round(m.z*30))<.1?vein:m.s<-.3?sk2:sk;
  a181Torso(B,P,a181TRings('gaunt',{w:.92,d:.95}),skin);const AR=[-1,1].map(s=>a181Arm(B,P,s,{sh:.78,bi:.72,el:.8,fo:.76,wr:.8},skin));[-1,1].forEach(s=>a181Leg(B,P,s,{th:.76,kn:.82,ca:.72,an:.8},co));
  [-1,1].forEach(s=>{a181Hand(B,P,k,s,{kind:'claw',col:sk,len:1.9,nail,tip:.07,w:.9,fr:.85});a181Foot(B,P,k,s,{col:sk2,claw:.03,len:1.15,w:.9,toe:.04})});
  a181Head(B,P,{w:.86,jaw:.78,gaunt:1.2,cheek:1.08,len:1.08,crown:1.4,back:1.22,chin:.9},m=>m.s>.45&&m.y>1.13&&m.y<1.17&&Math.abs(m.c)>.06?0x141010:m.y>1.24&&a181H(Math.round(m.x*50),Math.round(m.y*50))<.15?vein:m.s<-.3?sk2:sk);
  a181Eyes(k,P,{glow,sock:0x060404,r:1.15,tilt:.45,browTilt:-.6,brow:sk2});a181Nose(k,P,sk,{out:.042,len:1.25,r:.015,tip:.008,y1:1.1});
  a181Mouth(k,P,{y:1.07,open:.012,col:0x140606,lip:sk2,w:.8,fangs:[[-.006,.032],[.006,.032],[-.02,.012],[.02,.012]]});
  [-1,1].forEach(s=>{a181Ear(k,P,s,sk,{len:.17,up:.7,back:.55,r:.032,y:1.16,inner:0x5a3a3a});k.L('head','c',sk2,[s*.05,1.19,mdHeadZ(P,1.19)-.02],[s*.07,1.27,-.02],.008,.004,3)});
  // ribs, spine knuckles, collarbones
  [-1,1].forEach(s=>{const p=n3Surf(P,.955,s*.25,.003),q=n3Surf(P,.965,s*1.0,.003);k.L('chest','c',sk,p,q,.009,.007,3);for(let i=0;i<5;i++){const y=.9-i*.036,a=n3Surf(P,y,s*.3,.002),b=n3Surf(P,y-.03,s*1.2,.002);k.L('chest','c',sk2,a,b,.008,.006,3)}});
  for(let i=0;i<8;i++){const y=1.0-i*.055,p=n3Surf(P,y,Math.PI,.004);k.p(n3TB(y),'sph','c',sk,p[0],p[1],p[2],.018,.014,.014)}
  // the coat: open, from the shoulders to the shins, shredded, sleeves to the forearm, a torn standing collar
  mdLoft(B,a181TShell(P,.58,.985,.016),{seg:18,col:m=>Math.round(m.y*26)%3==0?co2:co,keep:m=>Math.abs(Math.atan2(m.c,m.s))>.75});
  a181Robe(B,P,{y0:.6,y1:.1,fl:.14,off:.03,dz:.08,col:m=>Math.round(Math.atan2(m.c,m.s)*7)%2?co:co2,keep:m=>Math.abs(Math.atan2(m.c,m.s))>.85&&!(m.y<.3&&a181H(Math.round(Math.atan2(m.c,m.s)*9),3)<(.3-m.y)*4)});
  [-1,1].forEach((s,i)=>{a181Shell(B,AR[i],0,6,.014,co,{col:m=>Math.round(m.i)%3?co:co2,keep:m=>!(m.i>7.2&&a181H(Math.round(m.c*8),s+5)<.6)})});
  mdLoft(B,a181TShell(P,.59,.62,.03),{seg:16,col:0x2a1e16});
  a181Collar(B,P,k,{h:1.2,w:1.1,col:co,ins:0x2a0a0a,rib:null,rag:.5,cut:.4})},'v181g');

// ---------------- fur, fringes ----------------
// a fringe of hanging points (fur shag, torn cloth, pelt edges) round a ring: n points from ring points [x,y,z] down by len,
// weights per point; both faces drawn. P0 = array of {x,y,z,w (mdW weights)}; o {len, col, col2, jag (length variation), out (push out)}
function a181Fringe(B,pts,o){const n=pts.length,ln=o.len||.06,cx=o.cx||0,cz=o.cz||0;
  for(let i=0;i<n-(o.closed?0:1);i++){const a=pts[i],b=pts[(i+1)%n],h=a181H(i,a.y*50,a.x*30),L=ln*(1-(o.jag==null?.55:o.jag)*h),ox=(a.x+b.x)/2,oz=(a.z+b.z)/2,r=Math.hypot(ox-cx,oz-cz)||1,ou=o.out||.3,sw=(a181H(i,7,a.z*20)-.5)*.4;
    const tip={x:ox+(ox-cx)/r*L*ou+(oz-cz)/r*L*sw,y:(a.y+b.y)/2-L,z:oz+(oz-cz)/r*L*ou-(ox-cx)/r*L*sw,w:a.w},col=mdC(o.col2!=null&&a181H(i,3,a.y*9)<.3?o.col2:mdSh(o.col,.82+a181H(i,11)*.22));mdTri(B,o.t||'c',a,b,tip,col);mdTri(B,o.t||'c',b,a,tip,col)}}
// fringe points round a torso height (or a ring list entry), pushed out by off
function a181TRingPts(B,P,y,off,n,a0,a1){const q=mdTorsoAt(P,y),out=[],w=mdW(B,mdTorsoW(y));for(let i=0;i<=n;i++){const a=(a0==null?0:a0)+((a1==null?Math.PI*2:a1)-(a0==null?0:a0))*i/n,c=Math.cos(a),s=Math.sin(a);
  out.push({x:s*(q.rx+off),y,z:q.z+c*((c>=0?q.f:q.b)+off),w})}return out}
function a181RingPts(B,r,off,n,ref){n=Math.max(n,Math.round(n*1.6));const out=[],w=mdW(B,r.w);for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;out.push({x:r.p[0]+Math.sin(a)*(r.rx+off),y:r.p[1],z:r.p[2]+Math.cos(a)*((Math.cos(a)>=0?r.f:r.b)+off),w})}return out}
// a layered shag: a shell over the torso band [y0,y1] with a pointed fringe under it
function a181Shag(B,P,y0,y1,off,col,col2,len,keepA){mdLoft(B,a181TShell(P,y0,y1,off),{seg:20,col:m=>a181Nz(col,m,.3,16,y0*10)});
  a181Fringe(B,a181TRingPts(B,P,y0,off,44),{len,col,col2,closed:true,cx:0,cz:mdTorsoAt(P,y0).z})}

// ===================================================================== Yeti =====================================================================
// A snow ape: hunched on long, heavy arms, short bowed legs, a deep chest. Layered shag (a mantle over the shoulders and back,
// a belly layer, ragged cuffs at the forearms and shins) in dirty grey-white over a blue-grey undercoat. Black leathery face,
// hands and feet; a heavy brow over small pale eyes, a flat nose, a jutting jaw with long lower fangs; black claws.
a181Reg('yeti',function(B,P,k,L){const f1=0x9c9e9c,f2=0x868a8e,f3=0xb0b2ae,un=0x5e6672,sk=0x30343c,sk2=0x22262c,cl=0x101214;
  const fur=m=>a181Nz(f1,m,.35,12);
  a181Torso(B,P,a181TRings('brute',{w:1.06,d:1.1,z:y=>y>.85?-(y-.85)*.25:0}),m=>m.y<.62&&m.s>.4?un:fur(m));
  const AR=[-1,1].map(s=>a181Arm(B,P,s,{sh:1.12,bi:1.25,el:1.15,fo:1.4,wr:1.25},fur)),LR=[-1,1].map(s=>a181Leg(B,P,s,{th:1.4,kn:1.3,ca:1.35,an:1.2},fur));
  [-1,1].forEach(s=>{a181Hand(B,P,k,s,{kind:'claw',col:sk,len:.85,nail:cl,tip:.035,w:1.35,fr:1.4});a181Foot(B,P,k,s,{col:sk,claw:.025,len:1.15,w:1.35,toe:.03,nail:cl})});
  // the ape head: heavy brow, deep-set eyes, flat nose, jutting jaw, fur all round the face
  a181Head(B,P,{w:1.05,jaw:1.3,chin:1.25,len:1.22,brow:1.25,crown:.8,back:.95,cheek:1.1},m=>m.s>.35&&m.y<1.19&&Math.abs(m.c)<.6?(m.y>1.135&&m.y<1.165?sk2:sk):fur(m));
  a181Eyes(k,P,{glow:0x9ad8ff,sock:0x0a0c10,r:.75,brow:false,tilt:.05});{const bz=mdHeadZ(P,1.175)-.012;k.L('head','c',sk2,[-.085,1.17,bz-.02],[0,1.18,bz+.006],.026,.024,6).L('head','c',sk2,[0,1.18,bz+.006],[.085,1.17,bz-.02],.024,.026,6)}
  const nz=mdHeadZ(P,1.11);k.p('head','sph','c',sk2,0,1.11,nz-.004,.04,.022,.022);[-1,1].forEach(s=>k.p('head','sph','c',0x050608,s*.016,1.105,nz+.012,.008,.006,.004));
  a181Mouth(k,P,{y:1.065,open:.012,col:0x0a0606,lip:sk2,w:1.3,tooth:0xd8d0b8,fangs:[[-.032,.032,1],[.032,.032,1],[-.026,.02],[.026,.02]]});
  a181HairCap(B,P,{col:f1,col2:f1,y1:.95,thick:.03,rag:.3,front:.35});
  // layered shag: shoulder mantle, chest / back layer, belly layer; ragged cuffs on the forearms, thighs and shins
  a181Shag(B,P,.84,.99,.022,f3,f1,.11);a181Shag(B,P,.7,.84,.018,f1,f2,.09);a181Shag(B,P,.54,.66,.012,f2,f1,.08);
  [-1,1].forEach((s,i)=>{const R=AR[i],G=LR[i];a181Shell(B,R,2,4,.014,f3,{col:fur});a181Fringe(B,a181RingPts(B,R[4],.014,14),{len:.08,col:f3,col2:f1,closed:true,cx:R[4].p[0],cz:R[4].p[2]});
    a181Shell(B,R,6,8,.018,f1,{col:fur});a181Fringe(B,a181RingPts(B,R[8],.018,14),{len:.09,col:f1,col2:f3,closed:true,cx:R[8].p[0],cz:R[8].p[2]});
    a181Fringe(B,a181RingPts(B,G[2],.02,16),{len:.1,col:f1,col2:f2,closed:true,cx:G[2].p[0],cz:G[2].p[2]});a181Shell(B,G,5,7,.016,f1,{col:fur});a181Fringe(B,a181RingPts(B,G[7],.016,14),{len:.08,col:f3,col2:f1,closed:true,cx:G[7].p[0],cz:G[7].p[2]})});
  // icicles frozen into the shoulder fur, an old scar across the face
  [[-.18,.97],[.16,.95],[-.08,1.0],[.22,.92]].forEach(([x,y],i)=>{const p=n3Surf(P,y,Math.PI-x*3,.03);k.p('chest','cone4','g',0xbfe6ff,p[0],p[1]-.05,p[2],.01,.07+i*.01,.01,Math.PI)});
  k.L('head','c',0x5a2a2a,[-.05,1.17,mdHeadZ(P,1.17)-.002],[-.01,1.1,mdHeadZ(P,1.1)+.002],.004,.004,3)},'v181y');
ST179.yeti={sx:.55,hx:-.5,lk:.3,rk:.3,ax:-.2,lx:-.2,az:.18,lz:-.18,ex:-.35,le:-.35};

// ===================================================================== Stormborn Jotun =====================================================================
// A frost giant of the storm peaks: blue-grey skin over a huge frame, storm runes glowing under the skin of chest and arms,
// a long braided white beard and mane, a horned iron helm (heavy bull horns), a wolf-pelt mantle over the shoulders, iron
// rune-bracers, a leather war-kilt with studded straps, fur-wrapped boots. Carries the storm hammer.
a181Reg('jotun',function(B,P,k,L){const sk=0x5e7388,sk2=0x485a6e,rune=0x8ae0ff,wh=0xd8e0e8,wh2=0xb0bcc8,pe=0x5a4e40,pe2=0x3e342a,lt=0x2e2218,ir=0x3a3e46,ir2=0x52565e,hn=0xb8ac90;
  a181Torso(B,P,a181TRings('brute',{w:1.04,d:1.0}),m=>m.y<.6?lt:m.s<-.3?sk2:sk);
  const AR=[-1,1].map(s=>a181Arm(B,P,s,{sh:1.4,bi:1.38,el:1.2,fo:1.35,wr:1.2},m=>m.s<-.3?sk2:sk)),LR=[-1,1].map(s=>a181Leg(B,P,s,{th:1.3,kn:1.2,ca:1.3,an:1.15},lt));
  [-1,1].forEach(s=>a181Hand(B,P,k,s,{kind:s>0?'fist':'open',col:sk,len:1,nail:sk2,w:1.25,fr:1.3}));
  a181Head(B,P,{w:1.02,jaw:1.15,chin:1.1,len:1.08,brow:1.15,crown:.95},m=>m.s<-.3?sk2:sk);
  a181Eyes(k,P,{glow:rune,brow:wh2,browTilt:-.3,r:.9});a181Nose(k,P,sk,{out:.03,w:1.2,r:.016});
  // beard: a broad mass from the jaw, two long braids with iron rings; the mane down the back
  const z=y=>mdHeadZ(P,y);mdLoft(B,[{p:[0,1.12,z(1.11)-.05],rx:.1,f:.04,b:.05,w:[['head',1]]},{p:[0,1.07,z(1.07)-.02],rx:.1,f:.05,b:.05,w:[['head',1]]},{p:[0,1.0,z(1.04)+.01],rx:.085,f:.05,b:.04,w:[['head',1]]},{p:[0,.92,z(1.04)+.01],rx:.06,f:.04,b:.03,w:[['head',.6],['neck',.4]]},{p:[0,.86,z(1.04)],rx:.02,f:.02,b:.015,w:[['neck',1]]}],{seg:12,capB:true,col:m=>Math.round(m.c*6)%2?wh:wh2,keep:m=>m.s>-.3||m.i>.8});
  [-1,1].forEach(s=>{k.L('head','c',wh,[s*.05,1.0,z(1.0)-.01],[s*.06,.82,z(1.0)+.01],.018,.01,5);k.p('head','tor','m',ir2,s*.057,.9,z(1.0),.022,.02,.022)});
  a181HairCap(B,P,{col:wh,col2:wh2,y1:.88,thick:.02,rag:.5,front:.1});
  // horned helm: an iron cap with a nasal and cheek guards, heavy horns sweeping out and forward
  mdLoft(B,P._H.slice(6).map(r=>Object.assign({},r,{p:r.p.slice(),rx:r.rx+.024,f:r.f+.026,b:r.b+.024})),{seg:16,capB:true,t:'m',col:m=>m.i<.6?ir2:Math.round(Math.atan2(m.c,m.s)*4)%2?ir:mdSh(ir,.85)});
  k.p('head','box','m',ir2,0,1.15,z(1.15)+.022,.024,.08,.014);[-1,1].forEach(s=>{let p=[s*.1,1.21,-.01];[[s*.07,.02,.0],[s*.06,.04,.03],[s*.02,.05,.05],[-s*.01,.04,.05]].forEach((q,j)=>{const n=[p[0]+q[0],p[1]+q[1],p[2]+q[2]];k.L('head','c',j<3?hn:mdSh(hn,.8),p,n,.036-j*.008,.028-j*.008,6);p=n})});
  for(let i=0;i<6;i++){const a=Math.PI*(.5+i*.2);k.p('head','sph','m',ir2,Math.sin(a)*(mdHeadX(P,1.19)+.024),1.19,Math.cos(a)*.1,.008)}
  // wolf-pelt mantle with a ragged edge; iron bracers with a glowing rune band; runes on chest and arms
  mdLoft(B,a181TShell(P,.86,1.01,.035,y=>y>.97?.01:0),{seg:22,col:m=>a181Nz(pe,m,.35,14)});a181Fringe(B,a181TRingPts(B,P,.86,.035,48),{len:.13,col:pe,col2:pe2,closed:true,cz:mdTorsoAt(P,.86).z});
  k.p('chest','sph','c',pe2,-.17,1.0,.06,.07,.05,.06);[-1,1].forEach(s=>k.p('chest','cone4','c',0xd8d0b8,-.17+s*.03,.96,.1,.008,.03,.008,Math.PI));
  [[.86,0,.09],[.8,-.35,.07],[.8,.35,.07],[.74,0,.06],[.9,-.6,.05],[.9,.6,.05]].forEach(([y,a,l],i)=>{const p=n3Surf(P,y,a,.001);k.p(n3TB(y),'box','g',rune,p[0],p[1],p[2],.008,l,.003,0,a,i%2?.6:-.6)});
  [-1,1].forEach((s,i)=>{const R=AR[i],bn=s<0?'aL':'aR';a181Shell(B,R,6,8,.02,ir,{t:'m',col:m=>m.i>.8&&m.i<1.3?rune:Math.round(m.i*3)%2?ir:ir2});
    for(let j=0;j<2;j++){const p=R[2+j].p;k.p(bn+'0','box','g',rune,p[0]+s*.02,p[1],p[2]+.05,.006,.05,.003,0,0,s*.4)}});
  // war-kilt: leather panels with iron studs over a fur loincloth; a heavy belt; fur-wrapped boots
  mdSkirt(B,P,.6,.32,.06,.018,{n:5,col:m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*6)%2?lt:mdSh(lt,.85),m,.3,10),keep:m=>Math.round(Math.atan2(m.c,m.s)*6)%3!=0||m.y>.48});
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,p=n3Surf(P,.5,a,.055);k.p('pelvis','sph','m',ir2,p[0],p[1],p[2],.01)}
  mdLoft(B,a181TShell(P,.57,.64,.05),{seg:20,col:0x1e160e});k.p('pelvis','box','m',ir2,0,.605,mdTorsoAt(P,.6).f+.06,.07,.05,.012);
  LR.forEach((G,i)=>{const s=i?1:-1;a181Shell(B,G,5,8,.03,pe,{col:m=>a181Nz(pe,m,.35,16)});a181Fringe(B,a181RingPts(B,G[5],.03,14),{len:.06,col:pe,col2:pe2,closed:true,cx:G[5].p[0],cz:G[5].p[2]});a181Boot(B,P,s,{col:pe2,toe:.03})})},'v181j');

// ===================================================================== Crimson Executioner =====================================================================
// The Citadel's headsman: a huge, heavy man gone to gut and muscle, pallid skin crossed with old scars and fresh stitches. A
// blackened leather hood laced shut over the whole head (two ragged eye holes, a seam over the crown, a drawstring at the
// throat), a stiff leather apron black with old blood, a heavy belt hung with hooks, a cleaver and chains, broken manacles on
// both wrists, leather wraps on the forearms, breeches and iron-shod boots. Carries the great axe.
a181Reg('executioner',function(B,P,k,L){const sk=0x8a7468,sk2=0x6a564c,scar=0x5a2a26,hd=0x22160f,hd2=0x341f14,ap=0x2e1c12,ap2=0x1e120c,bl=0x2a0808,ir=0x3a3a3e,ir2=0x56565c,lt=0x2a1a10;
  a181Torso(B,P,a181TRings('brute',{w:1.06,d:1.12,z:y=>y>.88?-(y-.88)*.2:0}),m=>m.y<.6?lt:m.s<-.3?sk2:sk);
  const AR=[-1,1].map(s=>a181Arm(B,P,s,{sh:1.38,bi:1.35,el:1.2,fo:1.32,wr:1.2},m=>m.s<-.3?sk2:sk)),LR=[-1,1].map(s=>a181Leg(B,P,s,{th:1.3,kn:1.2,ca:1.25,an:1.12},lt));
  [-1,1].forEach(s=>{a181Hand(B,P,k,s,{kind:s>0?'fist':'open',col:sk,len:.95,nail:sk2,w:1.2,fr:1.3});a181Boot(B,P,s,{col:0x1a120c,toe:.03})});
  // the belly over the belt
  mdLoft(B,[{p:[0,.6,.03],rx:.16,f:.16,b:.05,w:[['pelvis',1]]},{p:[0,.66,.05],rx:.19,f:.17,b:.06,w:[['pelvis',.5],['spine',.5]]},{p:[0,.74,.04],rx:.2,f:.15,b:.06,w:[['spine',1]]},{p:[0,.8,.02],rx:.18,f:.12,b:.05,w:[['spine',.5],['chest',.5]]}],{seg:16,capA:true,capB:true,col:m=>m.s>0?sk:sk2,keep:m=>m.s>-.2});
  // the hood: over the whole head, laced, eye holes, a crown seam, a drawstring
  const H=a181HeadR(P,{w:1.06,jaw:1.15,chin:1.1,len:1.05,crown:.9});P._H=H;
  mdLoft(B,H.map(r=>Object.assign({},r,{p:r.p.slice(),rx:r.rx+.014,f:r.f+.014,b:r.b+.016})),{seg:16,capB:true,col:m=>m.s>.45&&m.y>1.13&&m.y<1.17&&Math.abs(m.c)>.12&&Math.abs(m.c)<.6?0x050303:Math.abs(m.c)<.05&&m.y>1.18?hd2:a181Nz(hd,m,.35,18)});
  mdLoft(B,[{p:[0,.98,0],rx:.13,f:.13,b:.12,w:[['chest',.6],['neck',.4]]},{p:[0,1.03,0],rx:.1,f:.1,b:.1,w:[['neck',1]]},{p:[0,1.06,0],rx:.088,f:.09,b:.09,w:[['neck',.5],['head',.5]]}],{seg:16,col:m=>m.y<1.0?hd2:hd});
  [-1,1].forEach(s=>k.p('head','sph','g',0xff6a3a,s*.045,1.15,mdHeadZ(P,1.15)+.006,.009,.006,.004));
  for(let i=0;i<6;i++)k.p('head','box','c',0x7a6a50,0,1.2+i*.012,mdHeadZ(P,1.2+i*.012)+.008-i*.012,.026,.004,.006,-.3-i*.2);
  k.p('neck','tor','c',0x5a4a32,0,1.035,0,.11,.012,.11);k.L('neck','c',0x5a4a32,[.03,1.03,.1],[.04,.94,.12],.006,.004,3).L('neck','c',0x5a4a32,[-.01,1.03,.1],[-.02,.95,.11],.006,.004,3);
  // the apron: chest to knees, black with blood; straps over the shoulders and round the back
  mdLoft(B,a181TShell(P,.6,.95,.02,y=>y<.82&&y>.62?.035:0),{seg:20,col:m=>n3Sn(m.x,m.y,m.z,11,3)>.7?bl:a181Nz(ap,m,.35,14),keep:m=>m.s>.35});
  mdLoft(B,[{p:[0,.6,mdTorsoAt(P,.6).f+.06],rx:.17,f:.025,b:.025,w:[['pelvis',1]]},{p:[0,.45,mdTorsoAt(P,.5).f+.08],rx:.18,f:.02,b:.02,w:[['pelvis',.6],['lh0',.2],['rh0',.2]]},{p:[0,.3,mdTorsoAt(P,.5).f+.1],rx:.18,f:.018,b:.018,w:[['pelvis',.3],['lh0',.35],['rh0',.35]]}],{seg:10,col:m=>n3Sn(m.x,m.y,m.z,11,5)>.72?bl:a181Nz(ap,m,.35,14),keep:m=>m.s>0});
  [-1,1].forEach(s=>{const p=n3Surf(P,.95,s*.5,.022),q=n3Surf(P,.96,Math.PI-s*.4,.012);k.L('chest','c',ap2,p,[s*.17,1.0,0],.016,.016,4).L('chest','c',ap2,[s*.17,1.0,0],q,.016,.016,4)});
  // belt with hooks, a cleaver and a hanging chain
  mdLoft(B,a181TShell(P,.57,.63,.07),{seg:20,col:0x1a100a});const bz=mdTorsoAt(P,.6).f+.075;k.p('pelvis','box','m',ir2,0,.6,bz,.06,.05,.012);
  k.p('pelvis','box','m',ir,.2,.5,.06,.012,.14,.09,0,0,.08);k.L('pelvis','c',0x3a2414,[.2,.6,.06],[.2,.56,.06],.012,.012,4);
  for(let i=0;i<7;i++)k.p('pelvis','tor','m',ir2,-.18-i*.004,.58-i*.03,.08-i*.004,.014,.006,.014,i%2?0:Math.PI/2,0,i%2?Math.PI/2:0);
  // scars and stitches on the arms and back; manacles with a broken link; forearm wraps
  [[.9,2.4],[.78,-2.6],[.85,Math.PI]].forEach(([y,a])=>{const p=n3Surf(P,y,a,.002),q=n3Surf(P,y-.08,a+.3,.002);k.L('chest','c',scar,p,q,.006,.005,3);for(let i=0;i<4;i++){const t=i/3,c=[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];k.p('chest','box','c',0x1a1010,c[0],c[1],c[2],.016,.003,.003,0,a,.5)}});
  [-1,1].forEach((s,i)=>{const R=AR[i];a181Shell(B,R,6,7,.014,0x3a2a1c,{col:m=>Math.round(m.i*6)%2?0x3a2a1c:0x2a1e14});a181Shell(B,R,8,8,.02,ir,{t:'m'});mdLoft(B,[R[7],R[8]].map(r=>Object.assign({},r,{rx:r.rx+.022,f:r.f+.022,b:r.b+.022})),{seg:10,t:'m',col:ir});
    const w=R[8].p;k.p(s<0?'aL1':'aR1','tor','m',ir2,w[0],w[1]-.03,w[2]+.05,.014,.006,.016,Math.PI/2,0,0);
    const p=R[2].p;k.L(s<0?'aL0':'aR0','c',scar,[p[0]+s*.06,p[1]+.03,p[2]+.02],[p[0]+s*.065,p[1]-.05,p[2]+.04],.005,.005,3)});
  LR.forEach((G,i)=>a181Shell(B,G,6,8,.016,0x1a120c,{col:m=>m.i>1.4?ir:0x1a120c,t:'c'}))},'v181e');
