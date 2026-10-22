// ================= v117 ability preview (Abilities window) =================
// The selected ability's detail panel opens with a small stage (the shared preview renderer PV): your own hero, in your gear, plays
// the ability's real cast pose (its kqsPoseT track, the same one castAnim plays) against a training dummy, and the ability's effect
// appears in its own colour and shape: projectiles, rings round you, zones on the ground, lines, walls, charges, leaps, pulls,
// auras and summoned spirits (abKind116 reads the ability's data: shape, radius, ground targeting, pose, type). It loops; ↻ replays.
var ABP116={M:null,sig:'',run:null,tex:null};
function abKind116(s){const ty=(s.ty||KQS_TY[s.k]||'')+'',k=s.k||'',p=s.pose||'';
  if(/Summon/i.test(ty))return 'summon';if(s.sh=='line'||k=='beam'||/beam|piercing line/i.test(ty))return 'line';if(s.sh=='wall'||/Wall/.test(ty))return 'wall';
  if(p=='leap'||k=='leap'||/Leap/.test(ty))return 'leap';if(p=='dash'||/charge|Mobility|Teleport|mobility/.test(ty))return 'charge';if(/Pull/.test(ty))return 'pull';
  if((s.gt&&s.sh!='line')||['rain','meteor','trap','mark'].includes(k)||/zone|Trap|Ward|Portal/.test(ty))return 'zone';
  if(['bolt','shot','fan','chain'].includes(k)||/Projectile|Barrage|volley/.test(ty))return 'proj';
  if((s.r&&!s.gt)||['nova','pulse','cone'].includes(k)||/Shout|AoE/.test(ty))return 'nova';
  if(['buff','shield','heal','regen'].includes(k)||/Buff|buff|Defensive|heal|Stealth|Rage$|Time|rewind/.test(ty)||(!s.m&&!s.r))return 'buff';return 'strike'}
var ABP116_POSE={nova:'nova',cone:'spin',rain:'raise',bolt:'cast',shot:'point',beam:'cast',meteor:'raise',fan:'throw',chain:'cast',heal:'raise',buff:'flex',shield:'flex',regen:'raise',pulse:'nova',trap:'throw',mark:'point',leap:'leap'};
function abTex116(){if(ABP116.tex)return ABP116.tex;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return ABP116.tex=new THREE.CanvasTexture(c)}
function abMat116(col,op,side){return new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?.8:op,depthWrite:false,blending:THREE.AdditiveBlending,side:side||THREE.FrontSide})}
// the stage: hero on the left facing right, a dummy on the right; built once per class + gear
function abStage116(){const sig=hero.cls+'|'+SLOTS.map(k=>eq[k]?eq[k].tp+':'+(eq[k].r|0):'').join(',')+'|'+JSON.stringify(hero.look||'');if(ABP116.M&&ABP116.sig===sig)return ABP116.M;
  const root=new THREE.Group(),st=new THREE.Group();root.add(st);st.scale.setScalar(.64);st.position.set(0,.24,0);
  const gnd=new THREE.Mesh(new THREE.CircleGeometry(3.4,48),new THREE.MeshStandardMaterial({color:0x2a2218,roughness:.95}));gnd.rotation.x=-Math.PI/2;st.add(gnd);
  const rim=new THREE.Mesh(new THREE.RingGeometry(3.3,3.4,64),new THREE.MeshBasicMaterial({color:0x6a5434}));rim.rotation.x=-Math.PI/2;rim.position.y=.003;st.add(rim);
  const h=buildHero();h.mdLook=hero.look?Object.assign({},(typeof mdLookOf=='function'?mdLookOf(pl):null)||hero.look):null;refreshGear(h,hero.cls,eq);h.position.set(0,0,0);h.rotation.set(0,0,0);
  for(let t=0;t<300;t+=16)animHero(9e5+t,false,h);h.updateMatrixWorld(true);
  const B=new THREE.Box3(),v=new THREE.Vector3();h.traverse(o=>{if(!o.isSkinnedMesh||!o.visible)return;const P=o.geometry.attributes.position;for(let i=0;i<P.count;i+=3){v.fromBufferAttribute(P,i);o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);B.expandByPoint(v)}});
  const hi=new THREE.Group(),hw=new THREE.Group();hi.add(h);hw.add(hi);const k=1.5/Math.max(.3,B.max.y-B.min.y);hi.scale.setScalar(k);hi.position.y=-B.min.y*k;hw.position.set(-1.45,0,0);hw.rotation.y=Math.PI/2;st.add(hw);
  // training dummy: a post, a straw body and a sack head on a cross bar
  const dm=new THREE.Group(),wood=new THREE.MeshStandardMaterial({color:0x6a4a2a,roughness:.9}),straw=new THREE.MeshStandardMaterial({color:0xc8a860,roughness:1});
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,1.5,8),wood);post.position.y=.75;dm.add(post);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.24,.2,.62,10),straw);body.position.y=.92;dm.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),straw);head.position.y=1.38;dm.add(head);
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.9,.06,.06),wood);bar.position.y=1.12;dm.add(bar);const base=new THREE.Mesh(new THREE.CylinderGeometry(.28,.32,.08,12),wood);base.position.y=.04;dm.add(base);
  dm.position.set(1.6,0,0);st.add(dm);const fx=new THREE.Group();st.add(fx);
  ABP116.sig=sig;return ABP116.M={root,st,h,hw,dm,fx,straw,parts:[]}}
// ---------- effects (all in stage units; each part ticks itself and is freed when done) ----------
function abFx116(M,o){M.parts.push(o);if(o.obj)M.fx.add(o.obj)}
function abClear116(M){M.parts.forEach(p=>{if(p.obj){M.fx.remove(p.obj);p.obj.traverse(q=>{if(q.geometry&&!q.geometry.userData.keep)q.geometry.dispose();if(q.material)q.material.dispose()})}});M.parts=[]}
function abBurst116(M,pos,col,n,spd,life,up){const g=new THREE.BufferGeometry(),P=new Float32Array(n*3),Vv=[];for(let i=0;i<n;i++){P[i*3]=pos.x;P[i*3+1]=pos.y;P[i*3+2]=pos.z;const a=Math.random()*6.28,e=Math.random()*1.2-.2;Vv.push([Math.cos(a)*Math.cos(e)*spd*(.4+Math.random()),Math.sin(e)*spd*(.6+Math.random())+(up||0),Math.sin(a)*Math.cos(e)*spd*(.4+Math.random())])}
  g.setAttribute('position',new THREE.BufferAttribute(P,3));const m=new THREE.PointsMaterial({color:col,size:.18,map:abTex116(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const o=new THREE.Points(g,m);o.frustumCulled=false;
  abFx116(M,{obj:o,life,t:0,tick(dt){this.t+=dt;const A=g.attributes.position;for(let i=0;i<n;i++){Vv[i][1]-=2.4*dt;A.setXYZ(i,A.getX(i)+Vv[i][0]*dt,Math.max(.02,A.getY(i)+Vv[i][1]*dt),A.getZ(i)+Vv[i][2]*dt)}A.needsUpdate=true;m.opacity=Math.max(0,1-this.t/life)}})}
function abRing116(M,pos,col,r0,r1,life,flat){const o=new THREE.Mesh(new THREE.RingGeometry(.86,1,48),abMat116(col,.9,THREE.DoubleSide));if(flat!==false)o.rotation.x=-Math.PI/2;o.position.copy(pos);
  abFx116(M,{obj:o,life,t:0,tick(dt){this.t+=dt;const u=Math.min(1,this.t/life);o.scale.setScalar(r0+(r1-r0)*(1-(1-u)*(1-u)));o.material.opacity=.9*(1-u)}})}
function abDisc116(M,pos,col,r,life,rise){const o=new THREE.Mesh(new THREE.CircleGeometry(r,40),new THREE.MeshBasicMaterial({color:col,map:abTex116(),transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));o.rotation.x=-Math.PI/2;o.position.copy(pos);o.position.y=.02;
  const e=new THREE.Mesh(new THREE.RingGeometry(r*.94,r,48),abMat116(col,.9,THREE.DoubleSide));e.rotation.x=-Math.PI/2;e.position.copy(o.position);e.position.y=.025;const g=new THREE.Group();g.add(o,e);
  abFx116(M,{obj:g,life,t:0,k:0,tick(dt){this.t+=dt;const u=this.t/life,a=u<.12?u/.12:u>.8?(1-u)/.2:1;o.material.opacity=.55*a*(.8+.2*Math.sin(this.t*9));e.material.opacity=.9*a;this.k+=dt;
    if(this.k>.09){this.k=0;const q=pos.clone().add(new THREE.Vector3((Math.random()-.5)*r*1.6,rise?.05:1.8,(Math.random()-.5)*r*1.6));abBurst116(M,q,col,3,.3,.7,rise?1.6:-2.5)}}})}
function abBeam116(M,a,b,col,w,life,flat){const d=b.clone().sub(a),L=d.length(),o=new THREE.Mesh(new THREE.BoxGeometry(L,flat?.04:w,flat?w:w),abMat116(col,.85));o.position.copy(a).add(b).multiplyScalar(.5);o.rotation.y=-Math.atan2(d.z,d.x);if(!flat)o.rotation.z=Math.atan2(d.y,Math.hypot(d.x,d.z));
  abFx116(M,{obj:o,life,t:0,tick(dt){this.t+=dt;const u=this.t/life;o.material.opacity=.85*(u<.1?u/.1:1-u);o.scale.y=o.scale.z=1+.25*Math.sin(this.t*30)}})}
function abShot116(M,a,b,col,delay,size,onHit){const o=new THREE.Mesh(new THREE.SphereGeometry(size||.11,10,8),abMat116(col,1));const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:abTex116(),color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));gl.scale.setScalar((size||.11)*5);o.add(gl);o.visible=false;
  const arc=a.distanceTo(b)*.12;abFx116(M,{obj:o,life:delay+.5,t:0,hit:0,tick(dt){this.t+=dt;const u=(this.t-delay)/.42;if(u<0)return;o.visible=u<1;const p=a.clone().lerp(b,Math.min(1,u));p.y+=Math.sin(Math.min(1,u)*Math.PI)*arc;o.position.copy(p);
    if(u>=1&&!this.hit){this.hit=1;abBurst116(M,b,col,16,1.6,.55);if(onHit)onHit()}}})}
function abHit116(M,col){M.hitT=.35;M.hitC=col}
function abPlay116(M,s){abClear116(M);const col=s.col||0xffd060,K=abKind116(s),hp=new THREE.Vector3(-1.45,0,0),dp=new THREE.Vector3(1.6,0,0),chest=new THREE.Vector3(-1.15,1,0),dc=new THREE.Vector3(1.6,1,0);
  const rr=x=>Math.min(1.7,Math.max(.6,(x||3)*.32));M.kind=K;M.move=null;
  if(K=='strike'){const o=new THREE.Mesh(new THREE.RingGeometry(.55,.85,32,1,0,2.4),abMat116(col,.9,THREE.DoubleSide));o.position.copy(dc).add(new THREE.Vector3(-.5,0,0));o.rotation.set(0,Math.PI/2,-.3);
    abFx116(M,{obj:o,life:.4,t:0,tick(dt){this.t+=dt;o.rotation.z=-.3-this.t*9;o.material.opacity=.9*(1-this.t/.4)}});abBurst116(M,dc,col,22,1.8,.6);abHit116(M,col)}
  if(K=='proj'){const n=s.k=='fan'||/Multishot|volley|Barrage|Missiles|Knives/i.test((s.ty||'')+' '+s.n)?5:s.k=='chain'||/chain/i.test(s.ty||'')?3:1;for(let i=0;i<n;i++){const off=n>1?(i-(n-1)/2)*.32:0;abShot116(M,chest,dc.clone().add(new THREE.Vector3(0,0,off)),col,i*.09,.15,()=>abHit116(M,col))}}
  if(K=='nova'){[0,.14,.28].forEach(d=>abFx116(M,{life:d+.01,t:0,tick(dt){this.t+=dt;if(this.t>=d&&!this.f){this.f=1;abRing116(M,hp.clone().setY(.05),col,.3,rr(s.r)*1.6,.7)}}}));abBurst116(M,hp.clone().setY(.6),col,30,2.2,.8);abHit116(M,col)}
  if(K=='zone'){const r=rr(s.r);abDisc116(M,dp,col,r,1.6,!/rain|meteor/.test(s.k||'')&&!/Barrage/.test(s.ty||''));abRing116(M,dp.clone().setY(.05),col,.2,r,.45);if(/meteor/.test(s.k||'')||/Leap|Barrage/.test(s.ty||''))abShot116(M,dc.clone().add(new THREE.Vector3(-.8,2.6,0)),dp.clone().setY(.2),col,.05,.2,()=>abBurst116(M,dp.clone().setY(.2),col,30,2.4,.7));abHit116(M,col)}
  if(K=='line'){const a=hp.clone().setY(.06).add(new THREE.Vector3(.35,0,0)),b=dp.clone().setY(.06).add(new THREE.Vector3(.6,0,0));abBeam116(M,s.k=='beam'||/beam/i.test(s.ty||'')?chest:a,s.k=='beam'||/beam/i.test(s.ty||'')?dc:b,col,s.k=='beam'?.12:.35,.9,!(s.k=='beam'||/beam/i.test(s.ty||'')));
    for(let i=0;i<5;i++)abBurst116(M,a.clone().lerp(b,i/4),col,8,1.4,.6);abHit116(M,col)}
  if(K=='wall'){for(let i=0;i<5;i++){const o=new THREE.Mesh(new THREE.BoxGeometry(.18,1,.18),abMat116(col,.8));o.position.set(.35,.5,(i-2)*.38);o.scale.y=.01;
    abFx116(M,{obj:o,life:1.5,t:0,d:i*.05,tick(dt){this.t+=dt;const u=Math.max(0,this.t-this.d);o.scale.y=Math.min(1,u/.2);o.position.y=o.scale.y*.5;o.material.opacity=.8*(this.t>1.2?(1.5-this.t)/.3:1)}})}}
  if(K=='buff'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.5,.62,1.7,24,1,true),abMat116(col,.25,THREE.DoubleSide));c.position.copy(hp).setY(.85);
    abFx116(M,{obj:c,life:1.5,t:0,k:0,tick(dt){this.t+=dt;c.material.opacity=.25*(this.t<.2?this.t/.2:Math.max(0,(1.5-this.t)/1.3));c.rotation.y+=dt*2;this.k+=dt;if(this.k>.06){this.k=0;abBurst116(M,hp.clone().add(new THREE.Vector3((Math.random()-.5)*.8,.1,(Math.random()-.5)*.8)),col,2,.25,.8,1.8)}}});
    abRing116(M,hp.clone().setY(.04),col,.2,.9,.6)}
  if(K=='charge'){M.move={k:'dash',t:0};abBurst116(M,hp.clone().setY(.4),col,14,1,.5)}
  if(K=='leap'){M.move={k:'leap',t:0,back:/back|away|Disengage|retreat/i.test((s.d||'')+' '+s.n)}}
  if(K=='pull'){abBeam116(M,chest,dc,col,.05,.7,false);M.move={k:'pull',t:0};abHit116(M,col)}
  if(K=='summon'){const sp=new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),abMat116(col,.7));const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:abTex116(),color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));gl.scale.setScalar(1);sp.add(gl);
    abFx116(M,{obj:sp,life:1.6,t:0,hit:0,tick(dt){this.t+=dt;const u=this.t;if(u<.5){sp.position.set(-.9,.2+u*2,.6)}else{const w=Math.min(1,(u-.5)/.5);sp.position.set(-.9+w*2.5,1.2-w*.2,.6-w*.6)}if(u>1&&!this.hit){this.hit=1;abBurst116(M,dc,col,20,1.8,.6);abHit116(M,col)}sp.material.opacity=u>1.2?Math.max(0,(1.6-u)/.4)*.7:.7}})}}
// ---------- the loop ----------
function abShow116(host,s){const M=abStage116();if(!M||!host)return;ABP116.s=s;ABP116.t0=performance.now();ABP116.fired=0;ABP116.cyc=-1;abClear116(M);M.move=null;M.hitT=0;M.hw.position.set(-1.45,0,0);M.dm.position.set(1.6,0,0);
  const pT=kqsPoseT(s.pose||ABP116_POSE[s.k]||'cast')||kqsPoseT('cast'),ms=Math.max(260,(pT&&pT[1])||380)*1.7/1000,CYC=Math.max(2.6,ms+2);
  pvShow(host,M.root,(now,dt)=>{const t=((now-ABP116.t0)/1000)%CYC,cyc=Math.floor((now-ABP116.t0)/1000/CYC);if(cyc!==ABP116.cyc){ABP116.cyc=cyc;ABP116.fired=0;abClear116(M);M.hw.position.set(-1.45,0,0);M.dm.position.set(1.6,0,0)}
    const h=M.h,b=h.bones;abUndo116(h);const k=(t-.3)/ms;h.sw=k>=0&&k<=1.15?1:0;animHero(now,false,h);
    if(k>=0&&k<=1&&pT&&pT[0]){const P=pT[0](Math.min(1,k)),rec=[];for(const c in P){const ch=HACH[c];if(!ch||!b[ch[0]])continue;const o=b[ch[0]];if(!rec.some(r=>r.o===o))rec.push({o,q0:o.quaternion.clone()});const w=k<.12?k/.12:k>.9?(1-k)/.1:1;o.rotation[ch[1]]+=(P[c]-o.rotation[ch[1]])*w}
      rec.forEach(r=>r.set=r.o.quaternion.clone());h._abp=rec;h.updateMatrixWorld(true)}
    if(k>=.5&&!ABP116.fired){ABP116.fired=1;try{abPlay116(M,s)}catch(e){console.warn('v116 abp',e)}}
    // hero moves for charges and leaps, the dummy for pulls
    const mv=M.move;if(mv){mv.t+=dt||0;const u=mv.t;if(mv.k=='dash'){const w=Math.min(1,u/.3);M.hw.position.x=-1.45+w*2.25;if(u>.3&&!mv.hit){mv.hit=1;abBurst116(M,new THREE.Vector3(1.4,1,0),ABP116.s.col||0xffd060,24,2,.6);abHit116(M,ABP116.s.col)}if(u>1.1)M.hw.position.x=.8-(Math.min(1,(u-1.1)/.4))*2.25}
      if(mv.k=='leap'&&mv.back){const w=Math.min(1,u/.5);M.hw.position.x=-1.45-w*1.2;M.hw.position.y=Math.sin(w*Math.PI)*.8;if(w>=1&&!mv.hit){mv.hit=1;abRing116(M,new THREE.Vector3(-2.65,.05,0),ABP116.s.col||0xffd060,.2,.8,.5)}if(u>1.2){const r=Math.min(1,(u-1.2)/.4);M.hw.position.x=-2.65+r*1.2;M.hw.position.y=0}}
      else if(mv.k=='leap'){const w=Math.min(1,u/.55);M.hw.position.x=-1.45+w*2.2;M.hw.position.y=Math.sin(w*Math.PI)*1.3;if(w>=1&&!mv.hit){mv.hit=1;const c=ABP116.s.col||0xffd060,p=new THREE.Vector3(.9,.05,0);abRing116(M,p,c,.3,1.6,.6);abBurst116(M,p.clone().setY(.3),c,36,2.6,.8);abHit116(M,c)}
        if(u>1.2){const r=Math.min(1,(u-1.2)/.4);M.hw.position.x=.75-r*2.2;M.hw.position.y=0}}
      if(mv.k=='pull'){const w=Math.min(1,u/.35);M.dm.position.x=1.6-w*1.6*(u<1.1?1:Math.max(0,1-(u-1.1)/.4))}}
    // the dummy flinches when hit
    if(M.hitT>0){M.hitT-=dt||0;const a=Math.max(0,M.hitT/.35);M.dm.rotation.z=-.25*a*Math.sin(a*12);M.straw.emissive=M.straw.emissive||new THREE.Color();M.straw.emissive.set(M.hitC||0xffffff).multiplyScalar(.6*a)}else{M.dm.rotation.z=0;if(M.straw.emissive)M.straw.emissive.setRGB(0,0,0)}
    const L0=M.parts;M.parts=[];L0.forEach(p=>p.tick(dt||.016));M.parts=L0.concat(M.parts).filter(p=>{if(p.t>=p.life){if(p.obj){M.fx.remove(p.obj);p.obj.traverse(q=>{if(q.geometry)q.geometry.dispose();if(q.material)q.material.dispose()})}return false}return true});
    M.root.rotation.y=-.38})}
function abUndo116(h){const R=h._abp;if(!R)return;h._abp=null;R.forEach(r=>{if(r.o.quaternion.equals(r.set))r.o.quaternion.copy(r.q0)})}
// ---------- the panel ----------
{const f=XR.abil;XR.abil=function(){const r=f.apply(this,arguments);try{const det=document.querySelector('#xw .kqs-det');const s=kqsFind(hero.cls,KQS.sel)||heroSkills()[0];if(!det||!s)return r;
    det.insertAdjacentHTML('afterbegin',`<div class="abpv"><div class="abpvc" id="abPV"></div><div class="abpvl"><span>▶ Preview · ${kqsKind(s)||'ability'}</span><button data-abpv="1" title="Play it again">↻</button></div></div>`);
    abShow116($('abPV'),s)}catch(e){console.warn('v116 ability preview',e)}return r}}
$('xw').addEventListener('click',e=>{if(xwMode!='abil')return;const t=e.target.closest('[data-abpv]');if(!t)return;e.stopPropagation();ABP116.t0=performance.now();ABP116.cyc=-1},true);
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .abpv{margin:-2px -2px 10px;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#2c2418,#0e0b08 75%)}
#xw .abpvc{height:190px;position:relative}#xw .abpvc canvas{width:100%!important;height:100%!important;display:block}
#xw .abpvl{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 8px;font-size:.72rem;color:var(--mut);border-top:1px solid var(--line);background:rgba(0,0,0,.3)}
#xw .abpvl button{padding:1px 8px!important;font-size:.8rem!important}
@media (max-width:640px){#xw .abpvc{height:150px}}
</style>`);
