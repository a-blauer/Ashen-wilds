// ================= v81: smoother, more responsive combat animation =================
// The hero's upper body is now driven by one "action" at a time (swing, spin, bow, staff, cast, dodge).
// - A new action starts from the pose the body is in right now, so combos flow into each other.
// - When an action ends, the body eases back to walking/idle instead of snapping.
// - Hit-stop slows the action for a moment on impact, so hits feel heavy.
// - Dodging cancels an attack; an attack pressed a little early is remembered and fires when ready.
// - Walking and stopping blend in and out; getting hit adds a short flinch on top of anything.
// - Enemy poses are smoothed between wind-up, strike and recovery, so they no longer jump.
var HA={cur:null,snap:null,sb:0,buf:0,flT:-1e9};
// pose channels: key -> [bone, axis]
const HACH={sy:['spine','y'],sx:['spine','x'],py:['pelvis','y'],ax:['aR0','x'],az:['aR0','z'],ex:['aR1','x'],lx:['aL0','x'],lz:['aL0','z'],le:['aL1','x'],hx:['head','x'],lh:['lh0','x'],rh:['rh0','x']};
const haWrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const haIO=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2,haOut=x=>1-Math.pow(1-x,3),haIn=x=>x*x*x;
const haMix=(A,B,t)=>{const o={};for(const k in A)o[k]=A[k]+((B[k]==null?A[k]:B[k])-A[k])*t;return o};
function haRead(b){const o={};for(const k in HACH){const [n,ax]=HACH[k];if(b[n])o[k]=b[n].rotation[ax]}o.sy=haWrap(o.sy||0);o.py=haWrap(o.py||0);return o}
// start an action: pose(k) gives channel values for progress k (0..1); hit fires once at k>=hitAt
function haPlay(ms,pose,hitAt,onHit,blendIn){
  haCancel(true);
  HA.cur={ms:Math.max(60,ms||300),k:0,pose,hitAt:hitAt==null?2:hitAt,onHit,hit:0,from:pl.bones?haRead(pl.bones):{},bi:blendIn==null?.22:blendIn};
  pl.sw=1;
}
// stop the current action. keepHit: fire a pending hit (a new attack replacing an old one); otherwise it is dropped (dodge cancel)
function haCancel(keepHit){const A=HA.cur;if(!A)return;HA.cur=null;if(keepHit&&!A.hit&&A.onHit&&A.hitAt<=1){A.hit=1;A.onHit()}
  if(pl.bones){HA.snap=haRead(pl.bones);HA.sb=1}pl.sw=hero.chan?1:0}

// ---------- the actions (same names and timing as before, so all callers keep working) ----------
function swingAnim(st,ms,onHit){
  st=st|0;const K0=SWK[st]||SWK[0],cv=q=>({sy:q.sy,sx:q.sx,ax:q.ax,az:q.az,ex:q.ex,lx:q.lx,py:q.py*.5}),R=cv(SW0),W=cv(K0.W),S=cv(K0.S);
  // overshoot a little past the strike pose for follow-through
  const O=haMix(W,S,1.12);
  haPlay(ms||300,k=>k<.3?haMix(R,W,haIO(k/.3)):k<.46?haMix(W,O,haOut((k-.3)/.16)):k<.6?haMix(O,S,haIO((k-.46)/.14)):haMix(S,R,haIO((k-.6)/.4)),.42,onHit,.3);
}
function castAnim(){haPlay(320,k=>{const a=-Math.sin(k*Math.PI)*1.8;return {lx:a,ax:a,sx:-.12*Math.sin(k*Math.PI)}},2,null,.2)}
function haDodge(){haCancel(false);haPlay(280,k=>{const s=k<.35?haOut(k/.35):1-haIO((k-.35)/.65);return {sx:.6*s,lh:-.95*s,rh:-.6*s,ax:-.6*s,lx:-.6*s,hx:.2*s}},2,null,.1)}
function heroFlinch(){HA.flT=nowP()}

// ---------- per-frame hero animation: walk/idle, then the action, then settle and flinch ----------

// ---------- input: remember an attack pressed just before the weapon is ready ----------
// only fresh presses are remembered (not the repeat calls made every frame while the button is held)
HA.press=-1e9;{const mark=e=>{if(e.type!='keydown'||e.key==' ')HA.press=performance.now()};['pointerdown','mousedown','keydown'].forEach(t=>addEventListener(t,mark,true))}
{const f=swing;swing=function(){const a0=atkCd,r=f.apply(this,arguments);if(atkCd>a0+1e-4)HA.buf=0;else if(a0>0&&a0<.35&&party.length&&!hero.chan&&performance.now()-HA.press<40)HA.buf=nowP();return r}}
// ---------- dodge cancels the current attack and plays its own quick tuck ----------
{const f=dodge;dodge=function(){const d0=hero.dash,n0=tws.length;const r=f.apply(this,arguments);
  if(hero.dash&&hero.dash!==d0){for(let i=tws.length-1;i>=n0;i--)if(String(tws[i].fn).includes('spine.rotation.x=.55'))tws.splice(i,1);HA.buf=0;haDodge()}return r}}

// ---------- enemies: smooth pose changes between attack phases, sharper hit flinch ----------
function animC(g,now,mv,sp){
  animC0(g,now,mv,sp);
  if(!g.isE)return;
  const dt=Math.min(.05,Math.max(0,(now-(g._at||now))/1000));g._at=now;
  const b=g.b,P=g.pose||{},S=g.ps||(g.ps={rx:0,ry:0,z:0,y:0}),k=1-Math.exp(-dt*32),ry=P.ry||0;
  while(S.ry-ry>Math.PI)S.ry-=Math.PI*2;while(ry-S.ry>Math.PI)S.ry+=Math.PI*2;
  S.rx+=((P.rx||0)-S.rx)*k;S.ry+=(ry-S.ry)*k;S.z+=((P.z||0)-S.z)*k;S.y+=((P.y||0)-S.y)*Math.min(1,k*1.5);
  const x=g.flT?(now-g.flT)/260:2,fl=x>=0&&x<1?Math.pow(1-x,2):0;
  b.rotation.x=S.rx-.45*fl;b.rotation.y=S.ry;b.position.z=S.z-.18*fl;b.position.y+=S.y;
}


