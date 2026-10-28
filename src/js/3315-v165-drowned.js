// ================= v165 The Black Channel — the drowned dead in the water =================
// The Drowned Wretch (EN.dgwretch): a gaunt corpse of the channel, grey-green and waterlogged, its ribs showing through the
// skin, long black hair plastered over its face, pale eyes, a hanging jaw and long black claws. Registered by hand (not n3Def:
// it is no roaming monster, has no signature moves and never runs the normal AI). The Drowned Hulk is the Dirge's own bloated
// Drowned Thrall (EN.drowned) as an elite, much bigger.
// In the water they are driven by dg165WTick (from 3316's raft): a real enemy (targetable, hurt, killed, XP, co-op mirrored by
// position) whose eTick returns true so the normal AI never runs. States (e.w.st):
//   swim   under the surface toward its slot at the raft's edge (hidden: no target, no health bar; ripples, bubbles and a hand
//          breaking the surface on each stroke show where it is)
//   rise   comes up beside the raft (a splash), reaching for the edge
//   cling  hands on the deck, half out of the water: rakes the planks it holds (the raft loses them), or lunges at a hero
//          standing close (a wind-up, then the claws)
//   flinch knocked back by a hit (a moment without raking)
//   sink   dead or torn loose: falls back and sinks in a swirl of bubbles
// Every pose is set fresh each frame on the humanoid rig (pelvis, spine, chest, neck, head, arms, legs), from smooth sine
// motion and eased blends between states, so they move fluidly in and out of the water.
var DG165W={err:0};
(function(){
const C={skin:0x6a7a72,skin2:0x4a5a54,bruise:0x3a3a4a,rot:0x2a3428,rib:0x9a9a86,hair:0x0c0e0e,hair2:0x1a1e1c,claw:0x0a0a0a,eye:0xb8fff0,shroud:0x6a6a5c,shroud2:0x4a4a40,weed:0x2a4a2a};
HUMLOOK.dgwretch={skin:[106,122,114],tunic:C.shroud,cape:[60,60,50],pants:[60,60,50],sc:1.12,wpn:'none'};
const D={body(B,P,k){P.build=0;P.belly=-.1;P.af=.82;P.lf=.84;P.head={w:.95,jaw:1.18,top:.96};
  Object.assign(P.col,{skin:C.skin,torso:C.skin,sleeve:C.skin,fore:C.skin,hand:C.skin2,pants:C.shroud2,shin:C.skin2,boot:C.skin2,sole:C.rot,belt:C.rot,neck:C.skin});
  n3Paint(P,(m,s,part)=>{const n=n3Sn(m.x,m.y,m.z,13,5),r=n3Nz(m.x,m.y,m.z,9);if(r>.965)return C.rot;if(n>.74)return C.bruise;if(part=='hand'&&m.y<.5)return C.skin2;if(n<.25)return C.skin2;return C.skin});
  mdBody(B,P);mdHead(B,P,{eyes:'glow',glow:C.eye,brow:false,ears:false,nose:false,mouth:0x060808,noHair:true,headCol:m=>{const n=n3Sn(m.x,m.y,m.z,15,3);return n>.72?C.bruise:n<.3?C.skin2:C.skin}});
  const z=y=>mdHeadZ(P,y);
  // a slack, gaping jaw with broken teeth
  k.p('head','box','c',0x040606,0,1.065,z(1.065)+.004,.055,.05,.012);for(let i=0;i<5;i++)k.p('head','box','c',0xb8b098,-.026+i*.013,1.088,z(1.088)+.006,.006,.014,.004);
  // the ribs: arcs on the chest and the sunken belly
  for(let i=0;i<5;i++){const y=.92-i*.045;for(let j=0;j<7;j++){const a=-1.2+j*.4,p=n3Surf(P,y-Math.abs(a)*.02,a,.004);k.p('chest','box','c',C.rib,p[0],p[1],p[2],.03,.008,.012,0,a,0)}}
  // long black hair, plastered down over the face and shoulders
  for(let i=0;i<16;i++){const a=-2.9+i*.36,fr=Math.abs(a)<.8,len=fr?.3+(i%3)*.05:.42+(i%4)*.09,p=[Math.sin(a)*.085,1.22,Math.cos(a)*.08];
    k.S('head',i%3?C.hair:C.hair2,p[0],p[1],p[2]+(fr?.02:0),fr?.03:.04,len,a,fr?-.12:-.05,i)}
  k.p('head','sph','c',C.hair,0,1.2,-.005,.098,.06,.094);
  // claws: four long black talons on each hand
  [-1,1].forEach(s=>{const b=P.bones[s<0?'aL2':'aR2'];for(let f=0;f<4;f++){const x=b[1]+s*.01+(f-1.5)*.016,y=b[2]-.06,zz=b[3]+.012;n3Claw(k,s<0?'aL2':'aR2',C.claw,[x,y,zz],[0,-1,.25],.15,.008,.3,3)}});
  // rags of a burial shroud on the shoulders and hips, weed caught in them
  for(let i=0;i<8;i++){const a=-2.6+i*.75,p=n3Surf(P,.93,a,.02);k.S('chest',i%2?C.shroud:C.shroud2,p[0],p[1],p[2],.08,.28+(i%3)*.08,a,.15,i)}
  for(let i=0;i<9;i++){const a=-2.8+i*.7,p=n3Surf(P,.55,a,.03);k.S('pelvis',i%2?C.shroud:C.shroud2,p[0],p[1],p[2],.1,.32+(i%3)*.1,a,.1,i+9)}
  [-1,1].forEach(s=>{const q=n3ArmAt(P,s,.7);k.S(q[3],C.weed,q[0]+s*.03,q[1],q[2],.025,.22,s*1.4,0,s+3)})}};
EN.dgwretch={n:'Drowned Wretch',e:'🧟',w:{hp:.45,pa:.95,ma:.5,pd:.6,md:.8},mt:'p',moves:['strike'],fam:'Spirit',hum:'dgwretch',v113:1};
try{S.dgwretch=S.dgwretch||{e:'🧟',c:0x6a7a72,h:'X',t:'x',hp:20,a:8,d:5};MSET.dgwretch=['strike'];N3.humB.dgwretch=D}catch(e){console.warn('v165 wretch',e)}
})();
// ---------------- the pose: absolute rotations on the rig, every frame ----------------
// q = {pitch (body forward, rad), arms: [L, R] each {x shoulder fwd (−up), z out, e elbow}, head {x, y}, legs kick phase k, legsBent b}
function dg165WBones(e){const g=e.m;if(!g||!g.h||!g.h.bones)return null;return g.h.bones}
function dg165WApply(e,q){const b=dg165WBones(e);if(!b)return;const g=e.m,body=g.b;
  if(body){body.rotation.x=q.pitch||0;body.rotation.z=q.roll||0;body.position.y=0}
  const set=(o,x,y,z)=>{if(o){o.rotation.x=x||0;o.rotation.y=y||0;o.rotation.z=z||0}};
  set(b.spine,q.sp||0,q.sy||0,0);set(b.chest,q.ch||0,0,q.cr||0);set(b.neck,q.nk||0,0,0);set(b.head,q.hx||0,q.hy||0,q.hz||0);
  const A=q.arms||[{},{}];['aL','aR'].forEach((n,i)=>{const a=A[i]||{},s=i?1:-1;set(b[n+'0'],a.x||0,a.y||0,s*(a.z||0));set(b[n+'1'],a.e||0,0,0);set(b[n+'2'],a.w||0,0,s*(a.wz||0))});
  const L=q.legs||{};['lh','rh'].forEach((n,i)=>{const s=i?1:-1,k=L.k||0;set(b[n+'0'],(L.b||0)+Math.sin(k+i*Math.PI)*(L.a||0),0,s*(L.z||0));set(b[n+'1'],(L.kb||0)+Math.max(0,Math.sin(k+i*Math.PI+1))*(L.a||0)*.8,0,0)});
  if(b.pelvis){b.pelvis.rotation.set(q.px||0,0,0)}}
// blend two pose objects (same shape) by t
function dg165WMix(a,b,t){if(t<=0)return a;if(t>=1)return b;const o={};for(const k in a){const x=a[k],y=b[k];if(typeof x=='number')o[k]=x+((y==null?x:y)-x)*t;else if(Array.isArray(x))o[k]=x.map((q,i)=>dg165WMix(q,y&&y[i]||q,t));else if(x&&typeof x=='object')o[k]=dg165WMix(x,y||x,t);else o[k]=x}
  for(const k in b)if(!(k in o))o[k]=b[k];return o}
// the poses (t = seconds, ph = the wretch's own phase so no two move alike)
function dg165WPose(st,t,ph,k){const s=Math.sin,c=Math.cos;
  if(st=='swim'){const w=t*2.6+ph,st0=s(w);// a breaststroke, face down, legs kicking
    return {pitch:1.35+.05*s(w*2),roll:.08*s(w),sp:.1,ch:.05,nk:-.5,hx:-.55,hy:.1*s(w*.5),arms:[{x:-2.6-.4*st0,z:.4+.7*Math.max(0,st0),e:-.25-.4*Math.max(0,-st0)},{x:-2.6-.4*st0,z:.4+.7*Math.max(0,st0),e:-.25-.4*Math.max(0,-st0)}],legs:{k:w*1.6,a:.38,b:.1,kb:.2}}}
  if(st=='tread'){const w=t*1.7+ph;// upright in the water, arms sculling, head lolling
    return {pitch:.2+.05*s(w),roll:.06*s(w*.7),sp:.1,ch:.08,nk:.1,hx:.25+.1*s(w*.6),hy:.3*s(w*.33),hz:.12*s(w*.5),arms:[{x:-.5+.35*s(w),z:.7+.25*c(w),e:-.6},{x:-.5+.35*s(w+2),z:.7+.25*c(w+2),e:-.6}],legs:{k:w,a:.3,b:-.1,kb:.4}}}
  if(st=='reach'){const w=t*3+ph;// coming up: both arms reaching high for the edge
    return {pitch:.25,sp:-.15,ch:-.1,nk:-.2,hx:-.35,hy:.1*s(w),arms:[{x:-2.7+.15*s(w),z:.35,e:-.15,w:-.3},{x:-2.5+.15*s(w+1.5),z:.3,e:-.2,w:-.3}],legs:{k:w,a:.35,b:-.2,kb:.4}}}
  if(st=='cling'){const w=t*1.3+ph;// leaning on the deck, hands flat on the planks, head swaying, shoulders working
    return {pitch:.62+.04*s(w),roll:.05*s(w*.8),sp:.2,ch:.12+.04*s(w*1.3),nk:-.1,hx:-.5+.12*s(w*.9),hy:.35*s(w*.4),hz:.15*s(w*.6),
      arms:[{x:-1.25+.08*s(w),z:.45,e:-.55+.08*s(w*1.7),w:.35},{x:-1.25+.08*s(w+2),z:.45,e:-.55+.08*s(w*1.7+1),w:.35}],legs:{k:w,a:.2,b:.3,kb:.6}}}
  if(st=='rake'){// k 0..1 through one rake of arm k.arm: raise high, slam down, drag back across the planks
    const a=k.k,arm=k.arm,up=a<.38?a/.38:a<.52?1-(a-.38)/.14:0,drag=a>=.52?(a-.52)/.48:0,e=up*up*(3-2*up);
    const R={x:-1.3-1.5*e+.5*drag,z:.4-.15*e,e:-.6-.5*e+.4*drag,w:.4-.6*e};const L={x:-1.2,z:.45,e:-.5,w:.35};
    return {pitch:.62+.2*(1-e)*(a>.38?1:0)-.1*e,sp:.2+.15*(a>.38&&a<.6?1:0),ch:.12-.12*e,nk:-.1,hx:-.6-.3*e+.2*drag,hy:arm?.2:-.2,arms:arm?[L,R]:[R,L],legs:{k:a*6,a:.2,b:.3,kb:.6}}}
  if(st=='lunge'){// k 0..1: rearing up out of the water, arms wide, then the double swipe
    const a=k.k,up=Math.min(1,a/.6),hit=a>.6?(a-.6)/.4:0,e=up*up*(3-2*up);
    return {pitch:.3-.45*e+.9*hit,sp:-.25*e+.35*hit,ch:-.15*e+.2*hit,nk:-.25*e,hx:-.5*e+.3*hit,arms:[{x:-2.2*e+1.2*hit,z:.9*e-.5*hit,e:-.4},{x:-2.2*e+1.2*hit,z:.9*e-.5*hit,e:-.4}],legs:{k:a*8,a:.3,b:-.2,kb:.5}}}
  if(st=='flinch'){const a=k.k;return {pitch:.2-.3*s(a*Math.PI),sp:-.3*s(a*Math.PI),ch:-.1,nk:-.3,hx:-.7*s(a*Math.PI),arms:[{x:-.6,z:1.0,e:-.4},{x:-.8,z:.9,e:-.3}],legs:{k:a*5,a:.3,b:0,kb:.4}}}
  if(st=='sink'){const a=k.k,w=t*4+ph;// falling back, arms clawing at the surface as it goes under
    return {pitch:-.7*Math.min(1,a*2),roll:.2*s(w*.6),sp:-.3,ch:-.2,nk:-.3,hx:-.6,hy:.4*s(w*.3),arms:[{x:-2.4+.6*s(w),z:.6+.4*s(w*1.3),e:-.5},{x:-2.2+.6*s(w+1.7),z:.6+.4*s(w*1.1+1),e:-.5}],legs:{k:w,a:.4,b:.2,kb:.4}}}
  return {}}
// the water line for a wretch in each state: where its feet are (the body hangs below the surface; the water hides the rest)
var DG165WY={swim:-1.35,tread:-.8,rise:-.65,cling:-.58,lunge:-.4,flinch:-.75,sink:-.62};
