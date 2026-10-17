// ================= v85: readable enemy attacks — projectiles, effects, ranges, dimmer warnings =================
// 1) every projectile / spell move shows a wind-up glow at the caster's hand or mouth, a travelling projectile and an impact
// 2) attack ranges: ranged moves fire at range (and point-blank for pure casters), melee only in reach; companion spells only in range
// 3) red ground warnings are 35% dimmer
// 4) Rime Wraith orbs gather at the arena edge and drift inward
var KQ={fx:[],gm:{},mm:{},sm:{},dim:.65};
// ---------- shared geometry / materials (never disposed) ----------
function kqGeo(k){const g=KQ.gm;if(g[k])return g[k];
  g[k]=k=='sph'?new THREE.SphereGeometry(1,12,9):k=='shaft'?new THREE.CylinderGeometry(.028,.028,1,6).rotateX(Math.PI/2):k=='head'?new THREE.ConeGeometry(.07,.2,6).rotateX(Math.PI/2):
    k=='fl'?new THREE.PlaneGeometry(.12,.16):k=='rock'?new THREE.DodecahedronGeometry(.2,0):k=='tor'?new THREE.TorusGeometry(.32,.035,6,20):k=='rune'?new THREE.RingGeometry(.72,.9,36).rotateX(-Math.PI/2):
    k=='disc'?new THREE.CircleGeometry(.55,20).rotateX(-Math.PI/2):k=='spike'?new THREE.ConeGeometry(.16,1.1,5).rotateX(Math.PI/2):k=='col'?new THREE.CylinderGeometry(.18,.32,1,10,1,true).translate(0,.5,0):new THREE.SphereGeometry(1,8,6);
  return g[k]}
function kqAdd(c){const m=KQ.mm;return m[c]||(m[c]=addMat(c))}
function kqBas(c){const m=KQ.mm;return m['b'+c]||(m['b'+c]=new THREE.MeshBasicMaterial({color:c}))}
function kqSpr(c,s){const k=c,m=KQ.sm[k]||(KQ.sm[k]=new THREE.SpriteMaterial({map:SPR,color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));const o=new THREE.Sprite(m);o.scale.setScalar(s||1);return o}
function kqLit(c,k){const a=new THREE.Color(c),b=new THREE.Color(0xffffff);return a.lerp(b,k==null?.55:k).getHex()}
// one-off fading flash (own material, disposed)
function kqFlash(p,c,s,ms){const o=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR,color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));o.position.copy(p);scene.add(o);
  tw(ms||240,k=>{o.scale.setScalar(.3+s*k);o.material.opacity=1-k*k},()=>{scene.remove(o);o.material.dispose()})}
// per-frame effect list, ticked from eshotTick (runs every frame of the main loop)
function kqFx(o){KQ.fx.push(o);return o}
function kqFxTick(dt){const L=KQ.fx;for(let i=L.length-1;i>=0;i--){const o=L[i];let keep=false;try{keep=o.tick(dt)}catch(err){console.warn('kqfx',err)}
  if(!keep){L.splice(i,1);try{o.end&&o.end()}catch(err){}}}}
function kqRm(o){if(o&&o.parent)o.parent.remove(o)}
// ---------- who throws what ----------
const KQR={spit:1,throw:1,bolt:1},KQMEL={bite:1,strike:1};
const KQBC={shaman:0x9aff5a,cultist:0xff7a2a,wraith:0x9fb8ff,revenant:0xe8c070,spitter:0xc8f03a,nagas:0x4ae0d0,trollsh:0x9ad8ff,selem:0xe0b060,vampm:0xff3a5a};
const KQRC={shaman:[0x8aff4a,'fire'],cultist:[0xff6a2a,'fire'],giant:[0xbfe0ff,'storm'],revenant:[0xe0b060,'fire'],nagas:[0x4ad8c8,'fire'],trollsh:[0x9ad8ff,'ice'],vampm:[0xff3050,'fire']};
const KQARROW={bonearcher:1,nagaa:1};
function kqKey(e){return e&&e.c&&e.c.g?e.c.g[0]:''}
function kqKind(e,n){const k=kqKey(e);if(n=='throw')return KQARROW[k]?'arrow':'rock';if(n=='bolt')return 'orb';if(n=='rainfire')return 'meteor';return 'glob'}
function kqCol(e,n){const k=kqKey(e);
  if(n=='bolt')return KQBC[k]||(e.c.mt=='m'?0xc08aff:0xffd27a);
  if(n=='rainfire')return (KQRC[k]||[0xff6a2a])[0];
  if(n=='throw')return KQARROW[k]?0xffe8b0:0xd8c8a8;
  return SPITC[rigOf(k)]||(e.c.mt=='m'?0xff7a2a:0xb0ff6a)}
// where the shot leaves from: the raised right hand of humanoids, the mouth of creatures
const _kqV=new THREE.Vector3();
function kqHand(e,out){out=out||new THREE.Vector3();const m=e.m,bs=m.bs||1,b=m.h&&m.h.bones;
  if(b&&(b.aR2||b.aR1)){(b.aR2||b.aR1).getWorldPosition(out);if(isFinite(out.y)&&out.distanceTo(m.position)<4*bs)return out}
  const ry=m.rotation.y;out.set(m.position.x+Math.sin(ry)*.55*bs,GH(m.position.x,m.position.z)+(m.isHum?1.5:.72)*bs,m.position.z+Math.cos(ry)*.55*bs);return out}
// ---------- projectile models ----------
function kqShot(kind,c,sz){const g=new THREE.Group();sz=sz||1;
  if(kind=='arrow'){const sh=new THREE.Mesh(kqGeo('shaft'),kqBas(0xcdbb90));sh.scale.set(1.3,1.3,1.05);g.add(sh);const hd=new THREE.Mesh(kqGeo('head'),kqBas(0xd8dde4));hd.position.z=.6;g.add(hd);
    [0,1].forEach(i=>{const f=new THREE.Mesh(kqGeo('fl'),kqBas(0xb03a2a));f.material.side=THREE.DoubleSide;f.position.z=-.45;f.rotation.z=i*Math.PI/2;f.rotation.y=Math.PI/2;g.add(f)});
    const gl=kqSpr(c,1.1);gl.position.z=.45;g.add(gl);g.scale.setScalar(1.35*sz)}
  else if(kind=='rock'){const r=new THREE.Mesh(kqGeo('rock'),kqBas(0x8a8070));r.scale.setScalar(1.5*sz);g.add(r);g.userData.spin=r;g.add(kqSpr(0xe8d8b0,1.3*sz))}
  else if(kind=='orb'||kind=='meteor'){const R=(kind=='meteor'?.34:.2)*sz,core=new THREE.Mesh(kqGeo('sph'),kqBas(kqLit(c,.6)));core.scale.setScalar(R);g.add(core);
    const h1=kqSpr(c,R*7);g.add(h1);const h2=kqSpr(kqLit(c,.3),R*3.6);g.add(h2);
    const t=new THREE.Mesh(kqGeo('tor'),kqAdd(c));t.scale.setScalar(R*4.2);g.add(t);g.userData.spin=t}
  else{const core=new THREE.Mesh(kqGeo('sph'),kqBas(c));core.scale.setScalar(.22*sz);g.add(core);const h=kqSpr(c,1.6*sz);g.add(h);
    const d=new THREE.Mesh(kqGeo('sph'),kqBas(kqLit(c,.4)));d.scale.setScalar(.11*sz);d.position.set(.12*sz,.1*sz,-.16*sz);g.add(d)}
  return g}
function kqImpact(p,c,kind,hit){
  if(kind=='arrow'||kind=='rock'){burst(p,kind=='rock'?0xb8a888:0xffe8b0,hit?12:8,1.4,1.2,.35);burst(p,0xc8b090,6,1,1,.4);kqFlash(p,kind=='rock'?0xffe0b0:0xfff0c8,1.2,160);if(hit)ring(p,0xffe0a0,1.2,220);return}
  kqFlash(p,c,hit?2.6:1.8,240);burst(p,c,hit?22:14,2,1.6,.5);burst(p,kqLit(c),8,1,2.2,.35);ring(p,c,hit?1.8:1.2,300)}
// ---------- wind-up at the caster: a growing glow at the hand/mouth, plus a rune circle for spells ----------
function kqCast(e,a){
  const n=a.n,c=kqCol(e,n),mag=n=='bolt'||n=='rainfire',bs=e.m.bs||1,g=new THREE.Group();
  const s1=kqSpr(c,1),s2=kqSpr(kqLit(c,.5),.5);g.add(s1,s2);scene.add(g);
  let rn=null;if(mag){rn=new THREE.Mesh(kqGeo('rune'),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide}));rn.renderOrder=22;rn.scale.setScalar(Math.max(1,bs*.9));scene.add(rn)}
  const big=(n=='throw'?.55:mag?1.25:.95)*Math.min(1.6,Math.max(.8,bs)),cleanup=()=>{kqRm(g);if(rn){kqRm(rn);rn.material.dispose()}};
  kqFx({t:0,tick(dt){this.t+=dt;
    if(e.atk!==a||e.dead){cleanup();return false}
    const P=kqHand(e,_kqV);
    if(a.ph==0){const k=Math.max(0,Math.min(1,1-a.t/a.T)),fl=k>.75?1+.25*Math.sin(this.t*40):1;
      g.position.copy(P);s1.scale.setScalar((.25+big*1.6*k)*fl);s2.scale.setScalar((.1+big*.6*k)*fl);
      if(Math.random()<dt*18)burst(P,c,1,.5*k,.4,.35);
      if(rn){rn.position.set(e.m.position.x,GH(e.m.position.x,e.m.position.z)+.16,e.m.position.z);rn.material.opacity=.75*k;rn.rotation.y+=dt*2.5}
      return true}
    // release
    burst(P,c,mag?18:10,1.4,1.2,.4);kqFlash(P,c,big*2.2,200);
    if(n=='rainfire'){const col=new THREE.Mesh(kqGeo('col'),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));col.position.copy(P);scene.add(col);
      tw(420,k=>{col.scale.set(1-.6*k,1+9*k,1-.6*k);col.material.opacity=.7*(1-k)},()=>{scene.remove(col);col.material.dispose()})}
    cleanup();return false}});
}
// ---------- fire rain: a meteor (or hail, or a lightning bolt) drops from the sky onto the red circle ----------
function kqRain(e,a){
  const k=kqKey(e),rc=KQRC[k]||[0xff6a2a,'fire'],c=rc[0],ty=rc[1],tp=a.tp.clone(),FALL=.62;let ms=[],done=false;
  const ox=(e.m.position.x-tp.x),oz=(e.m.position.z-tp.z),ol=Math.hypot(ox,oz)||1,sky=V(tp.x+ox/ol*3.5,0,tp.z+oz/ol*3.5);
  const offs=[[0,0,1],[.9,-.6,.55],[-.8,.7,.5]];
  kqFx({tick(dt){
    if(e.atk!==a||e.dead){ms.forEach(kqRm);return false}
    const rem=a.ph==0?a.t+a.M.act:a.ph==1?a.t:0;
    if(rem<FALL&&rem>0&&!ms.length)ms=offs.map(o=>{const g=kqShot(ty=='ice'?'orb':'meteor',c,o[2]*(ty=='ice'?1.6:1.15));g.userData.o=o;scene.add(g);return g});
    if(ms.length&&!done){const kk=Math.max(0,Math.min(1,1-rem/FALL));
      ms.forEach((g,i)=>{const o=g.userData.o,kq=Math.min(1,kk*(1+i*.12)),x=tp.x+o[0]+(sky.x-tp.x)*(1-kq),z=tp.z+o[1]+(sky.z-tp.z)*(1-kq);g.position.set(x,GH(x,z)+.3+9.5*(1-kq),z);g.visible=kq<1;
        if(g.userData.spin)g.userData.spin.rotation.x+=dt*8;if(Math.random()<.8)burst(g.position,c,2,.3,.6,.4)});
      if(rem<=0||a.ph==2){done=true;ms.forEach(kqRm);
        if(ty=='storm'){const top=gY(tp,12);bolt(top,gY(tp,.2),0xdff0ff);bolt(top.clone().add(V(.6,0,.4)),gY(tp,.2),0x9ad8ff);sfx('zap',.6)}
        kqFlash(gY(tp,.6),c,3.2,300);burst(gY(tp,.4),kqLit(c),18,2.4,3,.5)}}
    return !done}});
}
// ---------- monster moves: hooks ----------
{const f=mStart;mStart=function(e,tg,n){f.apply(this,arguments);const a=e&&e.atk;if(!a||a.n!==n)return;
  kqDimTel(a);
  if(KQR[n]||n=='rainfire'){try{kqCast(e,a);if(n=='rainfire')kqRain(e,a)}catch(err){console.warn('kqcast',err)}}}}
function kqDimTel(a){const t=a&&a.tel;if(!t)return;[t.o,t.f].forEach(q=>{if(q&&q.material&&q.material.opacity!==q._kw){q.material.opacity*=KQ.dim;q._kw=q.material.opacity}})}
{const f=mTick;mTick=function(e,dt,now){const a=e.atk,n0=eshots.length;
  f.apply(this,arguments);
  if(a&&eshots.length>n0)for(let i=n0;i<eshots.length;i++)kqDress(eshots[i],e,a);
  if(e.atk)kqDimTel(e.atk)}}
// swap the plain sphere the base game fires for a proper projectile that leaves from the hand/mouth
function kqDress(s,e,a){
  if(s.kq)return;s.kq=1;const kind=kqKind(e,a.n),c=a.n=='spit'?s.c:kqCol(e,a.n),old=s.m,g=kqShot(kind,c,a.sz||1),P=kqHand(e,_kqV);
  g.position.set(old.position.x,P.y,old.position.z);scene.remove(old);if(old.geometry)old.geometry.dispose();if(old.material)old.material.dispose();
  scene.add(g);s.m=g;s.c=c;s.kind=kind;s.tg=a.tg;s.y0=P.y-GH(P.x,P.z);s.hy=e.m.isHum?1.0:.75;s.age=0;
  if(kind=='arrow')g.lookAt(g.position.x+s.v.x,g.position.y,g.position.z+s.v.z);
}
eshotTick=function(dt){
  kqFxTick(dt);
  for(let i=eshots.length-1;i>=0;i--){const s=eshots[i],o=s.m,p=o.position;s.t-=dt;s.age=(s.age||0)+dt;
    p.x+=s.v.x*dt;p.z+=s.v.z*dt;const y0=s.y0==null?.7:s.y0,hy=s.hy||.7,hk=Math.min(1,s.age/.28);p.y=GH(p.x,p.z)+y0+(hy-y0)*(1-(1-hk)*(1-hk));
    if(s.kind=='arrow')o.lookAt(p.x+s.v.x,p.y,p.z+s.v.z);
    else if(o.userData&&o.userData.spin){o.userData.spin.rotation.x+=dt*12;o.userData.spin.rotation.y+=dt*7}
    if(s.kind=='arrow'){if(Math.random()<.6)burst(p,0xfff0c8,1,.05,.05,.22)}else if(s.kind=='rock'){if(Math.random()<.4)burst(p,0xb8a888,1,.15,.1,.3)}
    else{burst(p,s.c,Math.random()<.5?2:1,.25,.25,.38);if(s.kind=='glob'&&Math.random()<.25)burst(p,s.c,1,.1,-1.5,.5)}
    let gone=s.t<=0||solid(p.x,p.z),hit=null;
    if(!gone){if(Math.hypot(p.x-pl.position.x,p.z-pl.position.z)<.6)hit=pl;
      else if(s.tg&&s.tg!==pl&&fols.indexOf(s.tg)>=0&&s.tg.visible&&Math.hypot(p.x-s.tg.position.x,p.z-s.tg.position.z)<.75)hit=s.tg}
    if(hit){gone=true;hitTarget(s.e,hit,s.mult,s.mt)}
    if(gone){kqImpact(p,s.c,s.kind,!!hit);scene.remove(o);if(!s.kq&&o.geometry)o.geometry.dispose();eshots.splice(i,1)}}
};
// ---------- attack choice: ranged moves are ordinary attacks at range; up close, fight up close ----------
MV.spit.rmin=0;MV.throw.rmin=0;MV.bolt.rmin=0;   // casters with no melee may still fire point-blank (ePick prefers melee when in reach)
function ePick(e,ok){
  e.buN=e.buN||R(2,4);const ready=(e.bu|0)>=e.buN,ms=MSET[kqKey(e)]||['bite'],hasBM=ms.some(n=>KQMEL[n]),isB=n=>KQMEL[n]||KQR[n];
  let pool=ok;const mel=ok.filter(n=>!KQR[n]&&MV[n]&&MV[n].rmax<3);
  if(mel.length&&(mel.some(n=>KQMEL[n])||ready||!hasBM))pool=ok.filter(n=>!KQR[n]);   // in reach: no point-blank shots when a melee move is usable
  const sp=pool.filter(n=>!isB(n)),bs=pool.filter(isB);
  let pk=null;if(ready&&sp.length)pk=sp[Math.random()*sp.length|0];else if(bs.length)pk=bs[Math.random()*bs.length|0];
  else if(sp.length&&!hasBM&&mel.length)pk=sp[Math.random()*sp.length|0];  // no basic melee (wraith, Gloomcap…): use its spin/slam instead of idling next to you
  if(!pk)return null;
  if(isB(pk)){e.bu=(e.bu|0)+1;if(e.bu>=e.buN&&e.m)ring(e.m.position,0xffb020,1.1,300)}else{e.bu=0;e.buN=R(2,4)-(e.c.al?1:0)}
  return pk;
}
// preferred fighting distance: archers/casters keep away; spell/spit users without a basic melee hover at mid range
function kqPref(e){const k=kqKey(e),ms=MSET[k]||['bite'],en=EN[k]||{},hasR=ms.some(n=>KQR[n]||n=='rainfire'),hasBM=ms.some(n=>KQMEL[n]);
  if(en.ranged)return 5.2;if(hasR&&!hasBM)return 4;return ms.some(n=>n=='bite'||n=='spin'||n=='slam'||n=='strike')?1.3:4.3}
{const f=eTick;eTick=function(e,dt,now){if(e&&!e.boss&&!e._kp&&e.c){e._kp=1;e.pref=kqPref(e)}return f.apply(this,arguments)}}
// ---------- companion spells: only cast when the target is inside the spell's reach ----------
function kqSpRange(sp){switch(sp.k){case 'bite':return 3.2;case 'cone':return (sp.r||2.6)+.4;case 'nova':return (sp.r||2.6);case 'beam':return 7.5;case 'fan':return 9;case 'bolt':return 12;default:return 9}}
function compSpells(dt){
  fols.forEach((f,i)=>{
    const c=party[i];if(!f||!c||c.h<=0||c.emp||!c.sp)return;c.cdm=c.cdm||{};const spd=FAMD[famOf(c.g[0])].spd*((c.mods||[]).includes('Swift')?1.18:1);
    for(const k in c.cdm)c.cdm[k]=Math.max(0,c.cdm[k]-dt*spd);
    const t0=teamFoe(),L=t0?d2(t0.m.position,f.position):99,t=t0&&L<9?t0:null;
    c.sp.forEach(n=>{
      const sp=CSP[n];if(!sp||c.cdm[n]>0)return;
      const help=sp.k=='shield'||sp.k=='heal'||sp.k=='buff';
      if(help){const need=sp.k=='heal'?hero.hp<heroMax()*.7:enemies.some(e=>e.agg&&!e.dead&&d2(e.m.position,pl.position)<10);if(!need)return}
      else if(!t||f.lk||L>kqSpRange(sp)+(t.boss?2.2:0))return;
      c.cdm[n]=sp.cd;compCast(c,f,sp,t);
    });
  });
}
// ---------- dimmer red ground warnings (35% less opaque) ----------
function tele(pos,r,delay,fn,line){
  const D=KQ.dim,mk=(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
  const geo=()=>line?new THREE.PlaneGeometry(line.w,line.l,3,Math.max(4,Math.round(line.l))):new THREE.RingGeometry(.001,1,Math.max(24,Math.round(r*10)),Math.max(3,Math.round(r*1.5)));
  const go=geo(),gf=geo(),base=go.attributes.position.array.slice(),ox=pos.x,oz=pos.z;
  let ca=1,sa=0;if(line){const a=Math.atan2(-line.d.x,-line.d.z);ca=Math.cos(a);sa=Math.sin(a)}
  const drape=(g,k)=>{const P=g.attributes.position;for(let i=0;i<P.count;i++){let u=base[i*3],v=base[i*3+1];
      if(line){const lz=-(v)-line.l/2;const wx=ox+u*ca+lz*sa,wz=oz-u*sa+lz*ca;P.setXYZ(i,wx,GH(wx,wz)+.14,wz)}
      else{const wx=ox+u*r*k,wz=oz-v*r*k;P.setXYZ(i,wx,GH(wx,wz)+.14,wz)}}P.needsUpdate=true;g.computeBoundingSphere()};
  drape(go,1);drape(gf,line?1:.15);
  const o=new THREE.Mesh(go,mk(0xd01808,.22*D)),f=new THREE.Mesh(gf,mk(0xff3010,.12*D)),edge=line?null:new THREE.Mesh(new THREE.RingGeometry(.93,1,Math.max(24,Math.round(r*10)),1),mk(0xff2a10,.85*D));
  o.renderOrder=f.renderOrder=20;o.frustumCulled=f.frustumCulled=false;scene.add(o,f);
  if(edge){const P=edge.geometry.attributes.position,b2=P.array.slice();for(let i=0;i<P.count;i++){const wx=ox+b2[i*3]*r,wz=oz-b2[i*3+1]*r;P.setXYZ(i,wx,GH(wx,wz)+.15,wz)}edge.renderOrder=21;edge.frustumCulled=false;scene.add(edge)}
  let last=-1;
  tw(delay*1000,k=>{f.material.opacity=(.12+.33*k)*D;if(!line){const q=Math.round((.15+.85*k)*20)/20;if(q!==last){last=q;drape(gf,q)}}},()=>{scene.remove(o,f);if(edge)scene.remove(edge);go.dispose();gf.dispose();if(edge)edge.geometry.dispose();o.material.dispose();f.material.dispose();if(edge)edge.material.dispose();fn()});
}
// ================= Sovereign spells: visible projectiles =================
// new BMV entries are wrapped like zzz_mp.js does, so the boss driver still relays them to the other player
function kqBmv(k,fn){BMV[k]=function(e,A,en){const top=MP.inAI&&!MP.dep;MP.dep++;try{if(top&&MP.on&&MP.others&&A)MP.evq.push(['b',A.i,k,+(+en).toFixed(3)]);return fn.apply(this,arguments)}finally{MP.dep--}}}
function kqMouth(e){const m=e.m,bs=m.bs||3,ry=m.rotation.y;return V(m.position.x+Math.sin(ry)*.35*bs,GH(m.position.x,m.position.z)+Math.min(5,.85*bs)+(e.lift?.6:0),m.position.z+Math.cos(ry)*.35*bs)}
// a glow gathering at the Sovereign before it casts
function kqBossCast(e,col,ms){const g=kqSpr(col,.5),g2=kqSpr(kqLit(col,.5),.3);scene.add(g,g2);
  tw(ms,k=>{const p=kqMouth(e);g.position.copy(p);g2.position.copy(p);g.scale.setScalar(.5+3.2*k);g2.scale.setScalar(.3+1.4*k);if(Math.random()<.4)burst(p,col,1,.8,.6,.4)},()=>{const p=kqMouth(e);scene.remove(g,g2);burst(p,col,20,2,2,.5);kqFlash(p,col,4,220)})}
// real-time timed effect (boss moves run on setTimeout/tw timing, so these use the clock too)
function kqTimed(dur,step,end,alive){const t0=performance.now();kqFx({tick(){const k=(performance.now()-t0)/(dur*1000);if(alive&&!alive()){end&&end(true);return false}if(k>=1){end&&end(false);return false}step(k);return true}})}
// a glob lobbed in an arc that lands when the red circle fires
function kqLob(A,from,to,dur,col,sz){const g=kqShot('glob',col,sz||1.8);g.position.copy(from);scene.add(g);const h=3+d2(from,to)*.22,ty=GH(to.x,to.z)+.3;
  kqTimed(dur,k=>{const x=from.x+(to.x-from.x)*k,z=from.z+(to.z-from.z)*k;g.position.set(x,from.y+(ty-from.y)*k+h*4*k*(1-k),z);if(Math.random()<.7)burst(g.position,col,1,.2,.2,.4)},()=>kqRm(g),()=>A.f)}
// something falling from the sky onto a red circle, landing exactly when it fires
function kqFall(A,to,delay,col,kind,sz,from){const FALL=Math.min(delay,.7),wait=delay-FALL;let g=null;const sx=from?from.x-to.x:-2,sz2=from?from.z-to.z:-2,sl=Math.hypot(sx,sz2)||1;
  kqTimed(delay,k=>{const t=k*delay;if(t<wait)return;if(!g){g=kind=='spike'?(()=>{const q=new THREE.Group(),s=new THREE.Mesh(kqGeo('spike'),kqBas(kqLit(col,.5)));s.scale.setScalar(1.3*(sz||1));s.rotation.x=Math.PI/2;q.add(s,kqSpr(col,1.6*(sz||1)));return q})():kqShot(kind||'meteor',col,sz||1.2);scene.add(g)}
    const q=(t-wait)/FALL,x=to.x+sx/sl*3*(1-q),z=to.z+sz2/sl*3*(1-q);g.position.set(x,GH(x,z)+.3+10*(1-q),z);if(g.userData.spin)g.userData.spin.rotation.x+=.3;if(Math.random()<.8)burst(g.position,col,2,.3,.6,.4)},
    ab=>{kqRm(g);if(!ab){kqFlash(gY(to,.5),col,3,260);burst(gY(to,.4),kqLit(col),12,2,2.4,.45)}},()=>A.f)}
// a lance that races out along a red line, reaching the end the moment it fires
function kqSweep(A,o,d,l,delay,col,kind){const TR=Math.min(delay,.38),wait=delay-TR;let g=null;
  kqTimed(delay,k=>{const t=k*delay;if(t<wait)return;if(!g){g=new THREE.Group();if(kind=='bone'){const s=new THREE.Mesh(kqGeo('spike'),kqBas(0xf0e8d8));s.scale.set(1.4,1.4,1.6);g.add(s,kqSpr(col,1.6))}else g.add(kqShot('orb',col,1.6));scene.add(g)}
    const q=(t-wait)/TR,s=1+(l-1)*q,x=o.x+d.x*s,z=o.z+d.z*s;g.position.set(x,GH(x,z)+.8,z);g.lookAt(x+d.x,g.position.y,z+d.z);burst(g.position,col,2,.3,.4,.4);if(kind=='bone'&&Math.random()<.5)burst(gY(g.position,-.6),0xc8b090,2,.6,.6,.4)},()=>kqRm(g),()=>A.f)}
// ---- rewritten Sovereign moves (same damage and timing as before, plus the visuals) ----
kqBmv('rain',function(e,A,en){let n=0;const N=e.bs.ph>=3?7:5;kqBossCast(e,A.b.col,450*en);const f=()=>{if(n++>=N||e.dead||!A.f)return;const q=pl.position.clone().add(V((Math.random()-.5)*3,0,(Math.random()-.5)*3));
    kqFall(A,q,.9*en,A.b.col,'meteor',1.1,e.m.position);
    tele(q,2.1,.9*en,()=>{if(!A.f)return;ring(q,A.b.col,5,350);burst(gY(q,.3),A.b.col,24,4,3,.6);if(d2(pl.position,q)<2.2)bossHit(e,1)});setTimeout(f,420*en)};f();return {d:(N*.42+1)*en,lock:0}});
kqBmv('spit',function(e,A,en){const N=e.bs.ph>=3?5:3,mo=kqMouth(e);kqBossCast(e,0x7aff4a,300);for(let i=0;i<N;i++){const q=inArena(A,pl.position.clone().add(V((Math.random()-.5)*6,0,(Math.random()-.5)*6)));if(i==0)q.copy(inArena(A,pl.position.clone()));
    const dl=(.9+i*.15)*en;kqLob(A,mo,q,dl,0x7aff4a,1.9);
    tele(q,2.2,dl,()=>{if(!A.f)return;burst(gY(q,.3),0x7aff4a,16,2,2,.5);if(d2(pl.position,q)<2.2)bossHit(e,.7);bxPool(A,q,2.2,6,0x6aff3a)})}return {d:1.3*en,lock:0}});
kqBmv('spores',function(e,A,en){const mo=kqMouth(e);kqBossCast(e,0xb050e0,300);for(let i=0;i<(e.bs.ph>=2?5:4);i++){const q=inArena(A,i==0?pl.position.clone():V(A.cx+(Math.random()-.5)*20,0,A.cz+(Math.random()-.5)*20));const dl=(.9+i*.1)*en;
    kqLob(A,mo,q,dl,0xc070ff,2.2);tele(q,2.6,dl,()=>{if(A.f)bxPool(A,q,2.6,7,0xb050e0,.25)})}say('☁ Toxic spores drift across the arena.');return {d:1.4*en,lock:0}});
kqBmv('bonelines',function(e,A,en){const o=e.m.position.clone(),a0=Math.atan2(pl.position.x-o.x,pl.position.z-o.z);let hit=false;kqBossCast(e,0xe8e0c8,1000*en*.8);[-.45,0,.45].forEach(da=>{const d=V(Math.sin(a0+da),0,Math.cos(a0+da));
    kqSweep(A,o,d,15,1.0*en,0xe8e0c8,'bone');
    tele(o,0,1.0*en,()=>{if(!A.f)return;for(let s=1;s<15;s+=1.2)burst(gY(o.clone().addScaledVector(d,s),.6),0xe8e0c8,3,1,3,.5);if(!hit&&inLine(pl.position,o,d,15,2.2)&&hero.iv<=0){hit=true;bossHit(e,1.2)}},{w:2.2,l:15,d})});return {d:1.6*en,lock:1}});
kqBmv('cross',function(e,A,en){const o=e.m.position.clone(),a0=Math.random()<.5?0:Math.PI/4;let hit=false;kqBossCast(e,A.b.col,1250*en*.8);
    for(let k=0;k<4;k++){const a=a0+k*Math.PI/2,d=V(Math.sin(a),0,Math.cos(a));kqSweep(A,o,d,14,1.25*en,A.b.col,'orb');tele(o,0,1.25*en,()=>{if(!A.f)return;for(let s=1;s<14;s+=1.5)burst(gY(o.clone().addScaledVector(d,s),.3),A.b.col,3,1,2,.4);if(!hit&&inLine(pl.position,o,d,14,2.6)&&hero.iv<=0){hit=true;bossHit(e,1.3)}},{w:2.6,l:14,d})}
    if(e.bs.ph>=3)setTimeout(()=>{if(!A.f||e.dead)return;const o2=e.m.position.clone();let h2=false;for(let k=0;k<4;k++){const a=a0+Math.PI/4+k*Math.PI/2,d=V(Math.sin(a),0,Math.cos(a));kqSweep(A,o2,d,14,1.1*en,A.b.col,'orb');tele(o2,0,1.1*en,()=>{if(!A.f)return;if(!h2&&inLine(pl.position,o2,d,14,2.6)&&hero.iv<=0){h2=true;bossHit(e,1.3)}},{w:2.6,l:14,d})}},900*en);
    return {d:(e.bs.ph>=3?2.6:1.7)*en,lock:1}});
kqBmv('lightning',function(e,A,en){const o=e.m.position.clone(),d=toPl(o);kqBossCast(e,0xcfe8ff,500*en);for(let i=0;i<8;i++){const q=inArena(A,o.clone().addScaledVector(d,2+i*2.4),.8),dl=(.6+i*.13)*en;
    kqFall(A,q,dl,0xcfe8ff,'orb',1.2,o);
    tele(q,1.8,dl,()=>{if(!A.f)return;bolt(gY(q,11),gY(q,.2),0xdff0ff);burst(gY(q,2),0xcfe8ff,12,1,6,.3);ring(q,0x9ad8ff,3,200);if(d2(pl.position,q)<1.8)bossHit(e,1)})}return {d:1.8*en,lock:0}});
kqBmv('mines',function(e,A,en){const N=6+e.bs.ph*2,ice=A.b.sp=='IceWraith',kind=ice?'spike':'meteor';kqBossCast(e,A.b.col,500*en);
    for(let k=0;k<N;k++){const a=Math.random()*6.283,r=2+Math.random()*(ARENA_R-3.5),q=V(A.cx+Math.cos(a)*r,0,A.cz+Math.sin(a)*r),dl=(1.5+k*.12)*en;kqFall(A,q,dl,A.b.col,kind,1,e.m.position);
      tele(q,1.9,dl,()=>{if(!A.f)return;ring(q,A.b.col,4,300);burst(gY(q,.3),A.b.col,20,3,3,.5);if(d2(pl.position,q)<2)bossHit(e,1.1)})}
    const q0=pl.position.clone();kqFall(A,q0,1.4*en,A.b.col,kind,1.2,e.m.position);tele(q0,1.9,1.4*en,()=>{if(A.f&&d2(pl.position,q0)<2)bossHit(e,1.1)});return {d:1.2*en,lock:0}});
// ---- Rime Wraith orbs: they gather at the arena's outer edge (a frost swirl marks each spot) and then hunt you inward ----
kqBmv('orbs',function(e,A,en){const N=e.bs.ph>=2?6:4,col=A.b.col,a0=Math.random()*6.283,WARN=.95*en;kqBossCast(e,col,WARN*1000);
  for(let i=0;i<N;i++){const a=a0+i/N*6.283,R0=ARENA_R-1.4,q=V(A.cx+Math.cos(a)*R0,0,A.cz+Math.sin(a)*R0),gy=GH(q.x,q.z);
    // spawn telegraph: a blue frost circle + a rising wisp at the edge
    const rg=new THREE.Mesh(kqGeo('rune'),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide}));rg.renderOrder=22;rg.position.set(q.x,gy+.16,q.z);scene.add(rg);
    const w=kqSpr(col,.4);w.position.set(q.x,gy+.3,q.z);scene.add(w);
    kqTimed(WARN,k=>{rg.material.opacity=.85*k;rg.scale.setScalar(1.6-.6*k);rg.rotation.y+=.08;w.position.y=gy+.3+.9*k;w.scale.setScalar(.4+1.6*k);if(Math.random()<.5)burst(V(q.x,gy+.2,q.z),col,1,.8,1.2,.5)},
      ab=>{kqRm(rg);kqRm(w);rg.material.dispose();if(ab||e.dead)return;
        const g=kqShot('orb',col,1.8),cr=new THREE.Mesh(kqGeo('sph'),new THREE.MeshBasicMaterial({color:0x2a6ad0,transparent:true,opacity:.6,depthWrite:false}));cr.scale.setScalar(.62);cr.renderOrder=-1;g.add(cr);const sh=new THREE.Mesh(kqGeo('disc'),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));sh.renderOrder=21;sh.position.y=-1.08;g.add(sh);
        g.position.set(q.x,gy+1.2,q.z);scene.add(g);burst(g.position,col,24,2,2,.5);kqFlash(g.position,col,3,240);
        bxA(A).push({k:'orb',ms:g,t:9,sp:3.3+i*.18,e});
        kqFx({end(){sh.material.dispose()},tick(){if(!g.parent)return false;sh.position.y=(GH(g.position.x,g.position.z)+.12-g.position.y)/(g.scale.x||1);if(Math.random()<.6)burst(g.position,col,1,.25,.2,.45);return true}})},()=>A.f)}
  say('✦ Wailing orbs gather at the edge of the arena — they hunt you down!');return {d:1.2*en,lock:0}});
