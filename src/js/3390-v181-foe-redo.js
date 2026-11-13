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
  brute:[[.42,.15,.11,.12],[.48,.18,.13,.14],[.54,.19,.15,.145],[.6,.19,.165,.135],[.67,.2,.175,.13],[.74,.215,.17,.135],[.81,.235,.165,.145],[.87,.25,.165,.155],[.925,.25,.15,.16],[.965,.21,.12,.155],[1.0,.15,.1,.13],[1.035,.1,.085,.095],[1.075,.076,.072,.072]],
  knight:[[.42,.13,.1,.11],[.5,.148,.108,.122],[.56,.146,.104,.114],[.62,.134,.098,.1],[.7,.146,.106,.104],[.78,.18,.13,.114],[.86,.214,.146,.126],[.92,.226,.14,.132],[.965,.2,.11,.118],[1.0,.104,.078,.088],[1.035,.064,.064,.06],[1.075,.057,.059,.056]],
  lean:[[.42,.13,.092,.1],[.5,.148,.1,.114],[.56,.146,.096,.11],[.62,.13,.088,.094],[.7,.138,.094,.098],[.78,.162,.112,.106],[.86,.188,.126,.116],[.92,.198,.122,.122],[.965,.18,.098,.11],[1.0,.094,.07,.08],[1.035,.056,.056,.054],[1.075,.05,.053,.05]],
  gaunt:[[.42,.12,.084,.094],[.5,.134,.088,.104],[.56,.128,.08,.098],[.62,.11,.066,.088],[.7,.118,.074,.092],[.78,.146,.1,.104],[.86,.168,.116,.114],[.92,.178,.112,.12],[.965,.166,.09,.112],[1.0,.086,.064,.076],[1.035,.05,.052,.05],[1.075,.046,.05,.047]]};
function a181TRings(kind,sc){const s=sc||{};return (Array.isArray(kind)?kind:A181T[kind]).map(q=>{const y=q[0],up=y>.97?(s.neck||1):1;
  return {p:[0,y,(q[4]||0)+(s.z?s.z(y):0)],rx:q[1]*(s.w||1)*up,f:q[2]*(s.d||1)*up,b:q[3]*(s.d||1)*up,w:mdTorsoW(y),y}})}
function a181Torso(B,P,R,col,o){P._T=R;mdLoft(B,R,Object.assign({seg:16,capA:true,col},o||{}));return R}

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
// a closed boot / sabaton over the foot: heel, instep, a pointed toe; o: {col, t, toe (point length), cuff}
function a181Boot(B,P,s,o){const bn=(s<0?'lh':'rh')+'2',A=mdV(P.bones[bn]),x=A.x,W=[[bn,1]],tp=o.toe||.05,r=(z,y,rx,f,b)=>({p:[x,y,A.z+z],rx,f,b,w:W});
  mdLoft(B,[r(-.075,.055,.046,.036,.044),r(-.04,.07,.058,.05,.054),r(.03,.052,.06,.04,.048),r(.1,.036,.056,.028,.03),r(.12+tp*.5,.026,.04,.018,.02),r(.12+tp,.016,.01,.006,.008)],{seg:10,ref:[0,1,0],capA:true,capB:true,col:o.col,t:o.t||'c'})}

// ===================================================================== Blood Knight =====================================================================
// A towering vampire knight in fluted plate the colour of dried blood: layered bat-wing pauldrons with swept fins, a closed
// helm with a narrow T-slit (the eyes burn inside it) and a crest of blades, a mail skirt under banded tassets, spiked
// couters and poleyns, pointed sabatons, a torn crimson cape. Carries the greatsword.
a181Reg('vampk',function(B,P,k,L){},'v181k');
ST179.vampk={sx:.06,hx:-.04,lk:.12,rk:.12,az:.06,lz:-.08,le:-.15};

// ===================================================================== Vampire Thrall =====================================================================
// A starved blood-servant: gaunt and hunched, ash-grey skin with dark veins, ribs and collarbones showing, an iron slave
// collar with a broken chain, a torn crimson coat hanging open, ragged breeches, bare clawed feet. Pointed ears, lank black
// hair, burning eyes sunk in dark sockets, a snarl of fangs. Long black claws; a dagger in the right hand.
a181Reg('vamp',function(B,P,k,L){},'v181g');
ST179.vamp={sx:.3,hx:-.28,lk:.28,rk:.28,ax:-.25,lx:-.4,az:.14,lz:-.16,ex:-.45,le:-.7};

// ===================================================================== Blood Magister =====================================================================
// A tall, slender vampire noble who works blood into spells: a high ribbed collar fanning behind the head, slicked-back
// black hair with a widow's peak, a long gaunt aristocratic face, layered floor-length robes (a black under-robe, a crimson
// over-robe open down the front, dark-gold embroidered hems), bell sleeves, a sash with a blood vial, long nailed fingers.
a181Reg('vampm',function(B,P,k,L){},'v181m');
ST179.vampm={sx:.08,hx:-.06,lk:.08,rk:.08,lz:-.06,le:-.25};

// ===================================================================== Nosferatu =====================================================================
// The oldest of the vampires, more beast than noble: a bald, elongated skull with huge bat ears, a hooked nose and rat-like
// front teeth, eyes burning deep in black sockets; corpse-grey skin over every rib and knuckle of the spine; impossibly long
// fingers ending in hooked nails; a long, rotted black coat with a torn standing collar that drags in tatters.
a181Reg('nosferatu',function(B,P,k,L){},'v181g');

// ===================================================================== Yeti =====================================================================
// A snow ape: hunched on long, heavy arms, short bowed legs, a deep chest. Layered shag (a mantle over the shoulders and back,
// a belly layer, ragged cuffs at the forearms and shins) in dirty grey-white over a blue-grey undercoat. Black leathery face,
// hands and feet; a heavy brow over small pale eyes, a flat nose, a jutting jaw with long lower fangs; black claws.
a181Reg('yeti',function(B,P,k,L){},'v181y');
ST179.yeti={sx:.55,hx:-.5,lk:.3,rk:.3,ax:-.2,lx:-.2,az:.18,lz:-.18,ex:-.35,le:-.35};

// ===================================================================== Stormborn Jotun =====================================================================
// A frost giant of the storm peaks: blue-grey skin over a huge frame, storm runes glowing under the skin of chest and arms,
// a long braided white beard and mane, a horned iron helm (heavy bull horns), a wolf-pelt mantle over the shoulders, iron
// rune-bracers, a leather war-kilt with studded straps, fur-wrapped boots. Carries the storm hammer.
a181Reg('jotun',function(B,P,k,L){},'v181j');

// ===================================================================== Crimson Executioner =====================================================================
// The Citadel's headsman: a huge, heavy man gone to gut and muscle, pallid skin crossed with old scars and fresh stitches. A
// blackened leather hood laced shut over the whole head (two ragged eye holes, a seam over the crown, a drawstring at the
// throat), a stiff leather apron black with old blood, a heavy belt hung with hooks, a cleaver and chains, broken manacles on
// both wrists, leather wraps on the forearms, breeches and iron-shod boots. Carries the great axe.
a181Reg('executioner',function(B,P,k,L){},'v181e');
