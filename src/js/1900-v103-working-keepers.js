// ================= v103 kingdom (5/5): shopkeepers at work =================
// Every shopkeeper stands at the station of their shop instead of in the street, and works:
//   smith    hammers at the anvil (sparks on each blow)      alch     stirs the cauldron with a ladle
//   cook     turns the roast on the spit                      bard     plays the lute on the stage
//   merchant polishes a curio, now and then holds it up       sage     channels the rune circle, a mote between the hands
//   trainer  drills the straw training post with a stick      stable   forks hay into the stall
//   magic    attunes the floating crystal
// The walk-up prompt stays at the door spot in the street (lotDoor103). The keeper's street collider is dropped (the
// station is inside the shop's footprint). Visitor keepers (merchant, trainer, bard, sage) are moved the same way.
// Animation: absolute from the rest pose of the town-folk skeleton (idlNB), every frame, in place of the v93 idle
// (idlNpc is wrapped for models marked _wk); a slow breath and head glances keep it alive between strokes.
// WK103[k] = {x,z,y,ry (shop-local station, facing), tool, f(P,t,S)}; P(bone,rx,ry,rz) adds to the rest rotation.
var WK103={
 smith:{x:-.4,z:1.85,ry:0,tool:'hammer',f(P,t,S){const T=1.25,u=(t/T)%1,up=u<.55?wkSS103(0,.55,u):1-wkSS103(.55,.68,u),hit=u>.66&&u<.72;
   P('aR0',-.8-1.25*up,0,.18);P('aR1',-.45-.9*up,0,0);P('aR2',-.1+.3*up);S.td=wkLerp103([0,-.42,1],[0,.8,-.55],up);P('aL0',-.75,0,-.12);P('aL1',-.85,0,-.2);
   P('spine',.06+.06*(1-up),.12,0);P('chest',.05,.08-.05*up,0);P('head',.18+.05*up,-.1,0);P('lh0',-.08);P('lh1',.12);P('rh0',.1);
   if(hit&&!S.hit){S.hit=1;wkSpark103(S,0xffb040)}if(u<.3)S.hit=0}},
 alch:{x:1.0,z:1.82,ry:0,tool:'ladle',f(P,t,S){const a=t*2.4;P('aR0',-1.2+.14*Math.sin(a),.0,.12+.16*Math.cos(a));P('aR1',-.45+.12*Math.cos(a));P('aL0',.05,0,-.08);P('aL1',-.2,0,-.9);S.td=[.18*Math.cos(a),-.82,.55+.12*Math.sin(a)];
   P('spine',.12,.1*Math.sin(a),0);P('chest',.06,.08*Math.sin(a),0);P('head',.3,.08*Math.sin(a*.5),0)}},
 cook:{x:-.42,z:2.55,ry:-Math.PI/2,tool:'',f(P,t,S){const a=t*2.2;P('aR0',-1.1+.28*Math.sin(a),0,.05+.1*Math.cos(a));P('aR1',-.2+.3*Math.cos(a));P('aL0',-.95,0,-.25);P('aL1',-.35,0,-.3);
   P('spine',.1,0,0);P('head',.22,.25*Math.sin(t*.4),0);P('rh0',-.1);P('rh1',.15)}},
 bard:{x:0,z:-.4,y:.64,ry:0,tool:'lute',f(P,t,S){const s=Math.sin(t*9.5),b=Math.sin(t*3.2);P('aL0',-.95,.25,-.35);P('aL1',-1.15,0,-.25);P('aR0',-.55,0,.3);P('aR1',-.95+.16*s,0,.15);P('aR2',.15*s);
   P('chest',.04,.06*b,0);P('head',-.06+.08*Math.abs(b),.2*Math.sin(t*.7),.06*b);P('lh0',-.05*Math.max(0,b));P('lh2',.12*Math.max(0,b))}},
 merchant:{x:.45,z:2.2,ry:0,tool:'orb',f(P,t,S){const T=9,u=(t/T)%1,hold=wkSS103(.55,.65,u)*(1-wkSS103(.85,.95,u)),a=t*5;
   P('aR0',-.9-.7*hold+.06*Math.sin(a)*(1-hold),0,.1);P('aR1',-1.1+.4*hold);P('aL0',-.85+.4*hold,0,-.12+.08*Math.cos(a)*(1-hold));P('aL1',-1.15+.5*hold);
   P('head',.35-.45*hold,.15*hold,.12*hold);P('spine',.05,0,0)}},
 sage:{x:0,z:1.7,ry:0,tool:'mote',f(P,t,S){const a=t*.9,w=.12*Math.sin(a*1.7);P('aR0',-1.15+w,0,.35);P('aL0',-1.15-w,0,-.35);P('aR1',-.45);P('aL1',-.45);P('aR2',-.5);P('aL2',-.5);
   P('head',-.08+.05*Math.sin(a),0,0);P('chest',-.06,0,0);if(S.mote){S.mote.position.y=1.32+.05*Math.sin(t*2.1);S.mote.rotation.y=t*1.6;S.mote.scale.setScalar(.85+.2*Math.sin(t*3.1))}}},
 trainer:{x:.15,z:2.55,ry:2.24,tool:'stick',f(P,t,S){const T=1.6,u=(t/T)%1,sw=u<.4?wkSS103(0,.4,u):1-wkSS103(.45,.6,u);
   P('aR0',-1.0-.4*sw,.3-.9*(1-sw),.4*sw);P('aR1',-.6+.3*sw);S.td=wkLerp103([.85,.1,.55],[-.55,.15,.85],sw);P('aL0',-.35,0,-.15);P('aL1',-.6);P('spine',0,.35*sw-.2,0);P('chest',.05,.2*sw-.1,0);P('head',.1,-.25*sw+.15,0)}},
 stable:{x:-.85,z:2.55,ry:-2.06,tool:'fork',f(P,t,S){const T=2.6,u=(t/T)%1,dig=u<.45?wkSS103(0,.45,u):1-wkSS103(.5,.85,u),toss=wkSS103(.5,.7,u)*(1-wkSS103(.75,.95,u));
   P('aR0',-.55-.6*toss+.25*dig,0,.2);P('aR1',-.6-.4*toss);P('aL0',-.95-.5*toss+.3*dig,0,-.1);P('aL1',-.35);S.td=wkLerp103(wkLerp103([0,-.25,1],[0,-.75,.65],dig),[0,.55,.85],toss);
   P('spine',.25*dig-.08*toss,.15*toss,0);P('chest',.15*dig,0,0);P('head',.1*dig,0,0);P('lh0',-.25*dig);P('lh1',.35*dig);P('rh1',.2*dig)}},
 magic:{x:.62,z:2.25,ry:Math.PI/2,tool:'',f(P,t,S){const a=t*1.3;P('aR0',-1.0+.15*Math.sin(a),0,.25+.15*Math.cos(a));P('aL0',-1.0+.15*Math.sin(a+Math.PI),0,-.25-.15*Math.cos(a));P('aR1',-.55);P('aL1',-.55);P('aR2',-.6);P('aL2',-.6);
   P('head',.28,0,0);P('spine',.08,0,0)}}};
function wkLerp103(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function wkSS103(a,b,x){const t=x<=a?0:x>=b?1:(x-a)/(b-a);return t*t*(3-2*t)}
function wkSpark103(S,col){try{if(!S.g||!S.g.visible)return;const p=S.g.getWorldPosition(new THREE.Vector3()),r=S.g.rotation.y+S.base;const fx=Math.sin(r),fz=Math.cos(r);
  if(Math.hypot(p.x-pl.position.x,p.z-pl.position.z)>22)return;burst(new THREE.Vector3(p.x+fx*.62,p.y+.82,p.z+fz*.62),col,8,.5,1.6,.35)}catch(_){}}
// tools and props (hung on the right hand, or between the hands)
function wkTool103(kind){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c});
  const stick=(l,c)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.018,.022,l,5),M(c||0x5a3a22));m.position.y=-l*.3;g.add(m);return m};
  if(kind=='hammer'){stick(.42);const h=new THREE.Mesh(new THREE.BoxGeometry(.16,.07,.07),M(0x3a3a42));h.position.y=-.38;g.add(h)}
  else if(kind=='ladle'){stick(.9,0x6a4a2a);const h=new THREE.Mesh(new THREE.SphereGeometry(.06,6,4,0,6.3,0,1.6),M(0x7a5a3a));h.position.y=-.62;h.rotation.x=Math.PI;g.add(h)}
  else if(kind=='stick'){stick(.85,0x6a4a2a)}
  else if(kind=='fork'){stick(1.3,0x6a4a2a);for(let i=-1;i<=1;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.012,.22,.012),M(0x4a4a52));t.position.set(i*.05,-1.0,0);g.add(t)}}
  else if(kind=='orb'){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(.07,1),new THREE.MeshBasicMaterial({color:0x7ad8ff}));o.position.set(0,-.06,.05);g.add(o)}
  else if(kind=='lute'){const b=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),M(0x9a6a32));b.scale.set(1,1.25,.45);g.add(b);const n=new THREE.Mesh(new THREE.BoxGeometry(.05,.5,.03),M(0x5a3a1a));n.position.set(0,.38,0);g.add(n);
    const hd=new THREE.Mesh(new THREE.BoxGeometry(.07,.12,.04),M(0x4a2a12));hd.position.set(0,.66,-.02);hd.rotation.x=-.4;g.add(hd);const sh=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.01,10),M(0x1a1008));sh.rotation.x=Math.PI/2;sh.position.set(0,.04,.08);g.add(sh)}
  return g}
// put a keeper model (the group that carries the bones) at its station and mark it as working
function wkPlace103(n,k,q,S0){const W0=WK103[k];if(!n||!W0||!q||!q._lot)return;const l=LOTM103[q._lot],[x,z]=lotW103(l,W0.x,W0.z);
  n.position.set(x,W0.y||0,z);n.rotation.y=l.ry+W0.ry;if(n.parent&&n.parent.position)n.parent.position.y=TOWNS[0].ph;
  if(!n._wk){n._wk={k,t0:Math.random()*20,base:0,g:n,mote:null};n._wk.rest=czRest103(n);
    if(W0.tool&&W0.tool!='mote'){const tl=wkTool103(W0.tool);n.add(tl);if(W0.tool=='lute'){tl.position.set(.02,1.02,.22);tl.rotation.set(.15,0,-.85)}else tl.userData.hand=1;n._wk.tool=tl}
    if(W0.tool=='mote'){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.08,0),new THREE.MeshBasicMaterial({color:0xc8a0ff}));m.position.set(0,1.32,.42);m.userData.lpsSkip=1;n.add(m);n._wk.mote=m}}
  n._wk.k=k}
// one frame of work
function wkAnim103(n,now){const S=n._wk,W0=WK103[S.k];if(!W0||!n.bones)return;if(!n.visible||(n.parent&&!n.parent.visible))return;
  try{if(typeof cam!='undefined'){const p=n.parent===scene?n.position:n.getWorldPosition(WK103._v||(WK103._v=new THREE.Vector3()));if(Math.hypot(p.x-cam.position.x,p.z-cam.position.z)>40)return}}catch(_){}
  const B=n.bones,R=S.rest,t=now/1000+S.t0;for(const k in R){const b=B[k],r=R[k];b.rotation.set(r[0],r[1],r[2]);b.position.set(r[3],r[4],r[5])}
  const P=(k,x,y,z)=>{const b=B[k];if(!b)return;b.rotation.x+=x||0;b.rotation.y+=y||0;b.rotation.z+=z||0};
  const br=Math.sin(t*1.6);P('chest',-.015*br,0,0);P('aR0',0,0,.012*br);P('aL0',0,0,-.012*br);P('neck',0,.12*Math.sin(t*.23),0);
  S.td=null;W0.f(P,t,S);
  // a hand tool sits in the right fist, pointing where the pose says (keeper frame: +z forward); default: along the forearm
  const tl=S.tool;if(tl&&tl.userData.hand&&B.aR2){n.updateMatrixWorld(true);const v=WK103._h||(WK103._h=new THREE.Vector3()),e=WK103._e||(WK103._e=new THREE.Vector3());
    B.aR2.getWorldPosition(v);B.aR1.getWorldPosition(e);n.worldToLocal(v);n.worldToLocal(e);tl.position.copy(v);
    const d=WK103._d||(WK103._d=new THREE.Vector3());if(S.td)d.set(S.td[0],S.td[1],S.td[2]);else d.subVectors(v,e);d.normalize();tl.quaternion.setFromUnitVectors(WK103_DN,d)}}
var WK103_DN=new THREE.Vector3(0,-1,0);
{const f=idlNpc;idlNpc=function(g,now){if(g&&g._wk)return wkAnim103(g,now);return f.apply(this,arguments)}}
// every built shop's keeper (and the visitor keepers) at their stations
function wk103Sync(){if(typeof WK103=="undefined")return;const T=TOWNS[0];TWN100_SH.forEach(q=>{if(!q._lot)return;const g=TWN100_S.npc[q.k];if(g){const n=g.children.find(c=>c.bones);if(n){wkPlace103(n,q.k,q);
      (TWN100_S.col[q.k]||[]).forEach(c=>{const i=T.col.indexOf(c);if(i>=0)T.col.splice(i,1)});TWN100_S.col[q.k]=[]}}});
  VIS.forEach(v=>{if(!v.g)return;const q=TWN100_SH.find(s=>s.k==v.k),n=v.g.children.find(c=>c.bones);if(q&&n)wkPlace103(n,v.k,q)})}
{const f=visTick;visTick=function(){const r=f.apply(this,arguments);try{if(VIS.some(v=>v.g&&!v.g._wkd)){VIS.forEach(v=>{if(v.g)v.g._wkd=1});wk103Sync()}}catch(e){console.warn('v103 keepers',e)}return r}}
try{wk103Sync()}catch(e){console.warn('v103 keepers',e)}
