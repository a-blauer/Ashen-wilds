// ---------------- sounds (Web Audio, same bus as sfx) ----------------
function kqsSnd(k){try{if(SET.sfx===false||SET.sfxV!=null&&!(+SET.sfxV>0))return;const a=AUD;if(!a||a.state!='running'||!a.out)return;const t=a.currentTime;
  const tone=(ty,f,at,dur,v,f1)=>{const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f,t+at);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+at+dur);g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v,t+at+.008);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);o.connect(g);g.connect(a.out);o.start(t+at);o.stop(t+at+dur+.05)};
  const nz=(ft,f0,f1,at,dur,v,q)=>{if(!NOISE)return;const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;s.loop=true;f.type=ft;f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t+at);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+at+dur);
    g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v,t+at+dur*.2);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);s.connect(f);f.connect(g);g.connect(a.out);s.start(t+at,Math.random()*.5);s.stop(t+at+dur+.05)};
  ({shout:()=>{tone('sawtooth',150,0,.5,.12,90);tone('sawtooth',225,0,.45,.07,130);nz('bandpass',700,300,0,.5,.25,1.5)},
    charge:()=>{nz('lowpass',600,150,0,.5,.35);[0,.11,.22,.33].forEach(at=>tone('sine',90,at,.09,.25,55))},
    thud:()=>{tone('sine',110,0,.35,.5,38);nz('lowpass',1200,150,0,.25,.4)},
    quake:()=>{nz('lowpass',300,60,0,.9,.45);tone('sine',60,0,.8,.35,30)},
    boom:()=>{tone('sine',95,0,.6,.55,32);nz('lowpass',1600,90,0,.55,.5)},
    horn:()=>{tone('sawtooth',196,0,.7,.08,190);tone('sawtooth',294,.05,.7,.06,290)},
    chain:()=>{[0,.05,.1,.16,.22].forEach(at=>{tone('square',1800+Math.random()*900,at,.05,.04);nz('highpass',4000,6000,at,.05,.06)})},
    holy:()=>{[523,659,784,1047].forEach((f,i)=>tone('sine',f,i*.04,1.1,.07));nz('highpass',5000,8000,0,.6,.04)},
    bell:()=>{tone('sine',880,0,1.2,.1);tone('sine',1320,0,.9,.05);tone('sine',2200,0,.5,.03)},
    whoosh:()=>nz('bandpass',500,2600,0,.28,.3,1.2),
    poison:()=>{[0,.08,.17,.27].forEach(at=>tone('sine',300+Math.random()*200,at,.12,.06,700));nz('bandpass',900,400,0,.4,.12,2)},
    shadow:()=>{tone('sine',220,0,.5,.12,80);nz('bandpass',1200,300,0,.45,.18,2)},
    beast:()=>{tone('sawtooth',260,0,.25,.06,520);tone('sawtooth',520,.2,.6,.05,300);nz('bandpass',800,1600,.18,.5,.1,2)},
    arrow:()=>nz('highpass',3000,1500,0,.12,.2),
    draw:()=>{tone('triangle',180,0,.9,.05,420);nz('bandpass',600,1500,0,.9,.06,4)},
    snipe:()=>{nz('highpass',5000,1500,0,.25,.35);tone('sine',1200,0,.2,.15,300);tone('sine',90,0,.3,.3,40)},
    ice:()=>{[1760,2349,2637,3136].forEach((f,i)=>tone('triangle',f,i*.03,.35,.05));nz('highpass',6000,9000,0,.3,.1)},
    fire:()=>{nz('lowpass',1800,300,0,.7,.35);tone('sawtooth',110,0,.5,.05,70)},
    portal:()=>{tone('sine',300,0,.6,.12,1200);tone('triangle',600,.04,.6,.05,2000);nz('bandpass',800,4000,0,.5,.1,3)},
    rewind:()=>{tone('sine',1400,0,.7,.1,300);tone('sine',700,.1,.6,.06,150);[0,.1,.2,.3,.4].forEach(at=>tone('square',2400,at,.03,.03))},
    beam:()=>{tone('sawtooth',220,0,2.3,.05,240);tone('sine',880,0,2.3,.05,900);nz('bandpass',1500,1800,0,2.3,.05,6)},
    tick:()=>tone('triangle',1500,0,.04,.05,1200)})[k]?.()}catch(_){}}

// ---------------- casting ----------------
function kqsPoseT(p){if(typeof ATK=='undefined')return null;return ({cast:[ATK.cast,340],raise:[ATK.raise,420],nova:[ATK.nova,420],flex:[ATK.flex,420],leap:[ATK.leap,440],dash:[ATK.dash,260],point:[ATK.point,360],spin:[ATK.spin,380],
  great1:[ATK.great&&ATK.great[1],360],slam:[ATK.hammer&&ATK.hammer[2],420],thrust:[ATK.thrust,300],throw:[ATK.knives,340]})[p]||null}
{const f=castAnim;castAnim=function(){const sk=typeof ATK_SK!='undefined'?ATK_SK:null,p=sk&&sk.pose;if(!p)return f.apply(this,arguments);
  try{if(typeof atkMpSig=='function')atkMpSig();else if(typeof MP!='undefined'&&MP)MP.sw=(MP.sw+1)%1000;if(p=='bow'){bowAnim(sk.pms||420);return}const T=kqsPoseT(p);if(!T||!T[0])return f.apply(this,arguments);
    haPlay(sk.pms||T[1],T[0],2,null,.15);if(p=='leap'&&HA.cur)HA.cur.legFull=1}catch(err){return f.apply(this,arguments)}}}
// new abilities run here; old kinds go through the old cast_base
{const f=cast_base;cast_base=function(i){const sk=heroSkills()[i];if(!sk||sk.k!='x'||!sk.x)return f.apply(this,arguments);
  if(!party.length||hero.chan||KQS.ch)return;
  if(hero.lvl<sk.lv){if(performance.now()-(hero.nmT||0)>900){hero.nmT=performance.now();say(sk.i+' '+sk.n+' unlocks at level '+sk.lv+'.')}return}
  const key='s'+i;if((hero.cd[key]||0)>0)return;const s=HS();
  if(hero.mp<sk.mp){if(performance.now()-(hero.nmT||0)>1200){hero.nmT=performance.now();say('Not enough mana.')}return}
  const H=KQH[sk.x];if(!H)return;
  hero.mp-=sk.mp;hero.cd[key]=Math.random()<s.echo?.6:sk.cd*kqrC(sk)*(1-Math.min(.5,s.cdr));
  const gp=sk.gt?(KQS.gp?KQS.gp.clone():kqsDefPt(sk)):null,d=gp&&d2(gp,pl.position)>.3?kqsDir(pl.position,gp):aimDir();face(d);
  const mt=sk.mt||CLS[hero.cls].mt,A=atkOf(mt)*(1+s.skillP)*kqrP(sk),cr=KQS.cr0||0;
  const c={rk:kqrP(sk),sk,i,key,s,P:pl.position,d,mt,A,raw:A*(sk.m||0),R:(sk.r||0)*(1+s.aoeP),now:performance.now(),gp,fx:{mt,col:sk.col,stun:sk.stun,burn:sk.burn},cr,pips:Math.min(5,Math.floor(cr/20))};
  let ok;const prev=typeof ATK_SK!='undefined'?ATK_SK:null;try{ATK_SK=sk;castAnim()}catch(_){}finally{ATK_SK=prev}
  try{ok=H(c)}catch(err){console.error('ability '+sk.n,err);ok=true}
  if(ok===false){hero.cd[key]=0;hero.mp+=sk.mp;if(performance.now()-(hero.nmT||0)>900){hero.nmT=performance.now();say('No target in reach.')}}
  hud();return ok}}
function kqsCan(sk,i,msg){if(!sk||!party.length||hero.chan||KQS.ch)return false;const t=performance.now();
  if(hero.lvl<sk.lv){if(msg&&t-(hero.nmT||0)>900){hero.nmT=t;say(sk.i+' '+sk.n+' unlocks at level '+sk.lv+'.')}return false}
  if((hero.cd['s'+i]||0)>0)return false;if(hero.mp<sk.mp){if(msg&&t-(hero.nmT||0)>1200){hero.nmT=t;say('Not enough mana.')}return false}return true}
// outermost cast: ground targeting + class-resource spenders (the resource is taken before the empower check in t_combat's cast)
{const f=cast;cast=function(i){i=+i;const sk=heroSkills()[i];
  if(KQS.ch&&!KQS.fire)return;
  if(!sk){if(KQS.tg&&!KQS.fire)kqsTgEnd();return f.apply(this,arguments)}
  if(sk.gt&&!KQS.fire){if(KQS.tg&&KQS.tg.i===i)return kqsTgFire();if(!kqsCan(sk,i,true))return;kqsTgStart(i,sk);return}
  if(KQS.tg&&!KQS.fire)kqsTgEnd();
  const cr0=hero.cr||0,cd0=hero.cd['s'+i]||0;KQS.cr0=sk.spend?cr0:0;if(sk.spend)hero.cr=0;let r;
  try{r=f.apply(this,arguments)}finally{if(sk.spend){if(!((hero.cd['s'+i]||0)>cd0))hero.cr=cr0;try{resUI()}catch(_){}}KQS.cr0=0}return r}}
{const f=aimPoint;aimPoint=function(maxD){if(KQS.gp){const v=kqsV(KQS.gp.x-pl.position.x,KQS.gp.z-pl.position.z),L=v.length();if(L>maxD)v.multiplyScalar(maxD/L);return kqsV(pl.position.x+v.x,pl.position.z+v.z)}return f.apply(this,arguments)}}
{const f=aimDir;aimDir=function(){if(KQS.gp&&d2(KQS.gp,pl.position)>.3)return kqsDir(pl.position,KQS.gp);return f.apply(this,arguments)}}

// ---------------- ground targeting ----------------
function kqsRng(sk){return sk.rng||10}
function kqsPick(cx,cy){try{const r=gl.getBoundingClientRect();if(!r.width)return null;const nd=new THREE.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);KQS.rc=KQS.rc||new THREE.Raycaster();cam.updateMatrixWorld();KQS.rc.setFromCamera(nd,cam);
  const o=KQS.rc.ray.origin,dv=KQS.rc.ray.direction;if(dv.y>-1e-3)return null;let h=pl.position.y,p=null;for(let k=0;k<4;k++){const t=(h-o.y)/dv.y;if(t<0)return null;p=kqsV(o.x+dv.x*t,o.z+dv.z*t);h=GH(p.x,p.z)}return p}catch(_){return null}}
function kqsClamp(sk,p){const P=pl.position,R=kqsRng(sk);const v=kqsV(p.x-P.x,p.z-P.z),L=v.length();if(L>R)v.multiplyScalar(R/L);let q=kqsV(P.x+v.x,P.z+v.z);if(sk.land)q=kqsLand(P,q);return q}
function kqsDefPt(sk){const P=pl.position,R=kqsRng(sk);let p=null;if(tgt&&!tgt.dead&&d2(tgt.m.position,P)<R+1)p=tgt.m.position.clone();else if(KQS.mIn&&KQS.mx!=null)p=kqsPick(KQS.mx,KQS.my);
  if(!p){const f=kqsV(Math.sin(pl.rotation.y),Math.cos(pl.rotation.y));p=kqsV(P.x+f.x*Math.min(6,R),P.z+f.z*Math.min(6,R))}return kqsClamp(sk,p)}
function kqsRetBuild(sk){kqsRetHide();const col=sk.col||0xffffff,M={sk,rng:kqsDrapeRing(.975,72,col,.55),cen:kqsDrapeM(new THREE.RingGeometry(.12,.22,16,1),kqsDMat(0xffffff,.9,false),31)};
  if(sk.sh=='line'||sk.sh=='wall'){M.fill=kqsDrapeM(new THREE.PlaneGeometry(1,1,2,16),kqsDMat(col,.24,false),30);M.edge=kqsDrapeM(kqsFrameGeo(),kqsDMat(col,.9,false),31)}
  else if(sk.sh=='cone'){M.fill=kqsDrapeM(new THREE.RingGeometry(.001,1,20,3,-.75,1.5),kqsDMat(col,.24,false),30)}
  else{M.fill=kqsDrapeM(new THREE.RingGeometry(.001,1,40,3),kqsDMat(col,.2,false),30);M.edge=kqsDrapeM(new THREE.RingGeometry(.92,1,48,1),kqsDMat(col,.95,false),31)}
  KQS.ret=M;return M}
function kqsDrapeRing(r0,seg,col,op){return kqsDrapeM(new THREE.RingGeometry(r0,1,seg,1),kqsDMat(col,op,false),29)}
// the outline of a line/wall reticle: the two long edges and both ends as thin strips (unit square, centered)
function kqsFrameGeo(){const s=new THREE.BufferGeometry(),pts=[],q=(x0,y0,x1,y1)=>pts.push(x0,y0,0,x1,y0,0,x1,y1,0,x0,y0,0,x1,y1,0,x0,y1,0);const add=(x0,x1)=>{for(let j=0;j<16;j++){const y0=-.5+j/16,y1=-.5+(j+1)/16;pts.push(x0,y0,0,x1,y0,0,x1,y1,0,x0,y0,0,x1,y1,0,x0,y1,0)}};add(-.5,-.44);add(.44,.5);q(-.5,-.5,.5,-.48);q(-.5,.48,.5,.5);
  s.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return s}
function kqsRetHide(){const M=KQS.ret;if(!M)return;['rng','cen','fill','edge'].forEach(k=>{if(M[k])kqsRm(M[k])});KQS.ret=null}
function kqsRetUpd(now){const T=KQS.tg;if(!T)return;const sk=T.sk,P=pl.position;
  if(KQS.touch==null&&KQS.mIn&&KQS.mx!=null){const p=kqsPick(KQS.mx,KQS.my);if(p)T.p=kqsClamp(sk,p);else T.p=kqsClamp(sk,T.p)}else T.p=kqsClamp(sk,T.p);
  const M=KQS.ret||kqsRetBuild(sk),R=kqsRng(sk),p=T.p,pul=.75+Math.sin(now/140)*.25;
  kqsDrape(M.rng,(u,v)=>[P.x+u*R,P.z-v*R],.18);kqsDrape(M.cen,(u,v)=>[p.x+u,p.z-v],.2);
  const r=(sk.r||1)*(1+HS().aoeP);
  if(sk.sh=='line'){const d=kqsDir(P,p),n=kqsV(-d.z,d.x),L=Math.max(3,Math.min(sk.L||R,d2(P,p)+(sk.x=='r_stamp'?1.5:0))),w=sk.w||2,fn=(u,v)=>{const y=(v+.5)*L,x=u*w;return [P.x+d.x*y+n.x*x,P.z+d.z*y+n.z*x]};kqsDrape(M.fill,fn,.17);kqsDrape(M.edge,fn,.18)}
  else if(sk.sh=='wall'){const d=kqsDir(P,p),n=kqsV(-d.z,d.x),L=sk.L||7,w=(sk.w||1.4),fn=(u,v)=>{const y=v*L,x=u*w;return [p.x+n.x*y+d.x*x,p.z+n.z*y+d.z*x]};kqsDrape(M.fill,fn,.17);kqsDrape(M.edge,fn,.18)}
  else if(sk.sh=='cone'){const d=kqsDir(P,p),n=kqsV(-d.z,d.x);kqsDrape(M.fill,(u,v)=>[P.x+(u*d.x+v*n.x)*r,P.z+(u*d.z+v*n.z)*r],.17)}
  else{const fn=(u,v)=>[p.x+u*r,p.z-v*r];kqsDrape(M.fill,fn,.17);kqsDrape(M.edge,fn,.18)}
  if(M.edge)M.edge.material.opacity=.95*pul;M.fill.material.opacity=.16+.1*pul;
  if(!pl.sw&&!(pl.mvd&&now-pl.mvd.t<120)&&d2(p,P)>.4){const d=kqsDir(P,p);pl.rotation.y=Math.atan2(d.x,d.z)}}
function kqsTgStart(i,sk){kqsTgEnd();KQS.tg={i,sk,p:kqsDefPt(sk),t0:performance.now()};kqsRetBuild(sk);const b=$('kqsTg');if(b){b.querySelector('.kqs-tgn').innerHTML=sk.i+' <b>'+sk.n+'</b>';b.classList.remove('hide')}kqsSnd('tick');try{hud()}catch(_){}}
function kqsTgEnd(){if(!KQS.tg&&!KQS.ret)return;KQS.tg=null;KQS.touch=null;kqsRetHide();const b=$('kqsTg');if(b)b.classList.add('hide');try{hud()}catch(_){}}
function kqsTgFire(){const T=KQS.tg;if(!T)return;try{kqsRetUpd(performance.now())}catch(_){}const p=T.p.clone();kqsTgEnd();KQS.gp=p;KQS.fire=1;let r;try{r=cast(T.i)}finally{KQS.gp=null;KQS.fire=0}return r}
{const b=document.createElement('div');b.id='kqsTg';b.className='glass kqs-tg hide';b.innerHTML='<span class="kqs-tgn"></span><span class="kqs-tgh">Click the ground to cast · Esc or right-click to cancel</span><button class="kqs-tgx" title="Cancel">✕</button>';($('stage')||document.body).appendChild(b);
  b.querySelector('.kqs-tgx').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();kqsTgEnd()})}
addEventListener('pointermove',e=>{if(e.pointerType=='mouse'||!e.pointerType){KQS.mx=e.clientX;KQS.my=e.clientY;KQS.mIn=kqsOnGl(e.target)}
  if(KQS.tg&&KQS.touch!=null&&e.pointerId===KQS.touch){const p=kqsPick(e.clientX,e.clientY);if(p)KQS.tg.p=kqsClamp(KQS.tg.sk,p);e.stopImmediatePropagation()}},true);
function kqsOnGl(t){return !!t&&(t===gl||gl.contains(t))}
addEventListener('pointerdown',e=>{if(!KQS.tg||!kqsOnGl(e.target))return;if(e.button==2){kqsTgEnd();return}if(e.button!==0&&e.pointerType=='mouse')return;e.stopImmediatePropagation();e.preventDefault();
  if(e.pointerType&&e.pointerType!='mouse'){KQS.touch=e.pointerId;const p=kqsPick(e.clientX,e.clientY);if(p)KQS.tg.p=kqsClamp(KQS.tg.sk,p);return}
  KQS.mx=e.clientX;KQS.my=e.clientY;KQS.mIn=true;KQS.eat=1;kqsTgFire()},true);
addEventListener('pointerup',e=>{if(KQS.touch!=null&&e.pointerId===KQS.touch){KQS.touch=null;e.stopImmediatePropagation();if(KQS.tg){const p=kqsPick(e.clientX,e.clientY);if(p)KQS.tg.p=kqsClamp(KQS.tg.sk,p);kqsTgFire()}}if(e.button==0)setTimeout(()=>KQS.eat=0,0)},true);
addEventListener('mousedown',e=>{if(KQS.eat&&e.button==0)e.stopImmediatePropagation()},true);
addEventListener('keydown',e=>{if(e.key=='Escape'&&KQS.tg){kqsTgEnd();e.stopImmediatePropagation();e.preventDefault()}},true);
gl.addEventListener('pointerleave',()=>{KQS.mIn=false});

// ---------------- per-frame: reticle, channel, lasting effects, history ----------------
function kqsClear(){kqsTgEnd();if(KQS.ch)kqsChanEnd(true);KQS.objs.splice(0).forEach(o=>{o.abort=1;try{o.end&&o.end(o)}catch(_){}});KQS.stealth=0;KQS.unbrk=0;KQS.hist=[];kqsStealthVis(false)}
function kqsTick(dt,now){
  if(KQS.tg){if(!party.length||uiOpen()||hero.chan)kqsTgEnd();else kqsRetUpd(now)}
  if(dt<=0)return;
  for(const n in KQS.cdn){KQS.cdn[n]-=dt;if(KQS.cdn[n]<=0)delete KQS.cdn[n]}
  const C=KQS.ch;if(C){C.t-=dt;C.el+=dt;C.ti-=dt;if(C.upd)C.upd(dt,now);if(C.ti<=0){C.ti+=C.iv;try{C.tick(C)}catch(err){console.error(err)}}if(C.t<=0)kqsChanEnd(false)}
  for(let i=KQS.objs.length-1;i>=0;i--){const o=KQS.objs[i];if(!o)continue;o.age+=dt;let keep=true;try{if(o.tick)keep=o.tick(dt,now,o)!==false}catch(err){console.error('ability fx',err);keep=false}
    if(!keep||o.age>=o.life){const j=KQS.objs.indexOf(o);if(j>=0)KQS.objs.splice(j,1);try{o.end&&o.end(o)}catch(err){console.error(err)}}}
  if(KQS.stealth){if(KQS.stealth<now){KQS.stealth=0;kqsStealthVis(false)}else{enemies.forEach(e=>{if(!e.dead&&!e.boss&&e.agg&&!e.wv&&d2(e.m.position,pl.position)<30){e.agg=0;if(e.atk)mCancel(e)}});if(Math.random()<.3)burst(gY(pl.position,.6),0x3a2a4a,1,.4,.6,.6)}}
  KQS.histT-=dt;if(KQS.histT<=0){KQS.histT=.1;KQS.hist.push({t:now,x:pl.position.x,z:pl.position.z,hp:hero.hp,mp:hero.mp});while(KQS.hist.length&&now-KQS.hist[0].t>4600)KQS.hist.shift()}}
{const f=heroTick;heroTick=function(dt,now){const r=f.apply(this,arguments);try{kqsTick(dt,now)}catch(err){console.error(err)}return r}}

// ---------------- HUD: empty slots, aiming highlight, ability-point chip ----------------
{const f=hud;hud=function(){f.apply(this,arguments);try{const A=$('acts');if(!A||!party.length)return;const L=heroSkills();
  if(L.length<KQS_SLOTS){const btns=[...A.querySelectorAll('button[data-x]')],sk=btns.filter(b=>/^\d+$/.test(b.dataset.x)),after=sk[sk.length-1]||btns.find(b=>b.dataset.x=='a');
    let h='';for(let i=L.length;i<KQS_SLOTS;i++)h+=`<button class="hs kqs-empty" data-x="E${i}" title="Empty ability slot — open Abilities (C)"><span class="ic">＋</span><span class="kb">${i+1}</span><span class="sb">empty</span><span class="cdv" style="height:0"></span></button>`;
    if(after)after.insertAdjacentHTML('afterend',h)}
  if(KQS.tg){const b=A.querySelector('button[data-x="'+KQS.tg.i+'"]');if(b)b.classList.add('kqs-aim')}
  L.forEach((s,i)=>{if(s.gt){const b=A.querySelector('button[data-x="'+i+'"]');if(b)b.classList.add('kqs-gt')}});
  const ap=apFree(),B=$('buffs');if(B&&ap>0)B.insertAdjacentHTML('afterbegin',`<span class="bf kqs-apn" data-kqsopen="1" title="Spend ability points (C · Abilities)">⚡ ${ap} ability point${ap>1?'s':''} · C</span>`)}catch(err){}}}
$('acts').addEventListener('pointerdown',e=>{const b=e.target.closest('.kqs-empty');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openAbil()},true);
document.addEventListener('click',e=>{const t=e.target.closest('[data-kqsopen]');if(!t)return;e.preventDefault();if(!$('tal').classList.contains('hide'))$('tal').classList.add('hide');if($('sysmenu'))$('sysmenu').classList.add('hide');if(xwMode!='abil'||$('xw').classList.contains('hide'))openAbil()});

// ---------------- the Abilities window (#xw, mode 'abil') ----------------
function openAbil(){if(!party.length)return;if(!$('tal').classList.contains('hide'))$('tal').classList.add('hide');if(!$('xw').classList.contains('hide')&&xwMode=='abil')return closeX();if(uiOpen()&&$('xw').classList.contains('hide'))return;kqsTgEnd();if(!KQS.sel)KQS.sel=heroSkills()[0].n;KQS.tab='ab';openX('abil');try{mSfx('open')}catch(_){}}
function kqsKind(s){const t=s.ty||KQS_TY[s.k]||'';return t}
function kqsInfo(s){const a=[];if(s.cd)a.push('⏱ '+s.cd+'s cooldown');a.push('💧 '+(s.mp||0)+' mana');if(s.gt)a.push('🎯 ground target · range '+kqsRng(s)+(s.sh=='line'?' · line '+(s.L||'')+'×'+(s.w||''):s.sh=='wall'?' · wall '+s.L:' · radius '+(s.r||1)));else if(s.r)a.push('◯ radius '+s.r);if(s.dur)a.push('⌛ '+s.dur+'s');if(s.spend)a.push(CRES[hero.cls]?CRES[hero.cls].i+' spends '+CRES[hero.cls].n:'');return a.filter(Boolean)}
XR.abil=()=>{const c=hero.cls,C=CLS[c],all=kqsAll(c),eqd=heroSkills(),ap=apFree(),sel=kqsFind(c,KQS.sel)||eqd[0],nUn=all.filter(s=>kqsUnl(c,s)).length;
  $('xwT').textContent='⚡ Abilities';$('xwS').innerHTML=`${C.i} ${C.n} · <b class="kqs-apv">${ap}</b> ability point${ap==1?'':'s'} · ${nUn} / ${all.length} learned · +1 point every level`;
  const slots=[0,1,2,3].slice(0,KQS_SLOTS).map(q=>{const s=eqd[q];return `<div class="kqs-slot${s?'':' empty'}${KQS.slot===q?' on':''}" data-kqslot="${q}" title="${s?s.n+' — key '+(q+1):'Empty slot '+(q+1)}"><span class="kqs-sk">${q+1}</span><span class="kqs-si">${s?s.i:'＋'}</span><span class="kqs-sn">${s?s.n:'Empty'}</span>${s&&eqd.length>1?`<button class="kqs-sx" data-kqsun="${q}" title="Remove from key ${q+1}">✕</button>`:''}</div>`}).join('');
  const row=s=>{const un=kqsUnl(c,s),q=eqd.indexOf(s),why=kqsWhy(s),def=s===kqsDef(c),cost=apCost(s);
    const st=un?(q>=0?`<span class="kqs-eqd">Key ${q+1}</span>`:`<button data-kqseq="${s.n}" title="Put on key ${(KQS.slot|0)+1}">Equip</button>`):why?`<span class="kqs-lk">🔒 ${why.replace('Reach level','Lv')}</span>`:`<button class="pri" data-kqsbuy="${s.n}">Unlock · ${cost} ⚡</button>`;
    return `<div class="rw kqs-ab${un?' un':' lk'}${s.gt?' gt':''}${sel===s?' on':''}${q>=0?' eq':''}" data-kqsel="${s.n}"><span class="rn"><span class="kqs-ic">${s.i}</span><b>${s.n}</b>${def?' <span class="kqs-tag def">Default</span>':''}${s.nw?' <span class="kqs-tag nw">New</span>':''}${s.gt?' <span class="kqs-tag gt">🎯 Ground</span>':''}<small>Lv ${s.lv} · ${kqsKind(s)}${def?'':' · '+cost+' ⚡'}</small></span><span class="ra">${st}</span></div>`};
  const tiers=[[1,9],[10,19],[20,29],[30,39],[40,50]].map(([a,b])=>{const L=all.filter(s=>s.lv>=a&&s.lv<=b);return L.length?`<div class="sec">Level ${a}–${b}</div><div class="rows">${L.map(row).join('')}</div>`:''}).join('');
  const un=kqsUnl(c,sel),why=kqsWhy(sel),q=eqd.indexOf(sel),cost=apCost(sel);
  const det=`<div class="kqs-det glass"><div class="kqs-dh"><span class="kqs-di">${sel.i}</span><div><b>${sel.n}</b><small>${kqsKind(sel)}${sel.gt?' · ground-targeted':''}</small></div></div><p>${sel.d}</p><div class="kqs-stats">${kqsInfo(sel).map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="kqs-req"><span>Level ${sel.lv}${hero.lvl>=sel.lv?' ✔':' ✖'}</span>${sel.req?`<span>Requires ${sel.req}${kqsUnl(c,kqsFind(c,sel.req))?' ✔':' ✖'}</span>`:''}<span>${sel===kqsDef(c)?'Class default':'Cost '+cost+' ⚡'}</span></div>
    ${un?`<div class="sec">Put on a key</div><div class="btns kqs-keys">${[0,1,2,3].slice(0,KQS_SLOTS).map(k=>`<button data-kqseq="${sel.n}" data-kqsk="${k}" class="${q===k?'pri':''}" ${k>eqd.length-(q>=0?1:0)?'disabled':''}>${k+1}</button>`).join('')}${q>=0&&eqd.length>1?`<button data-kqsun="${q}">Unequip</button>`:''}</div>`
      :`<div class="btns"><button class="pri" data-kqsbuy="${sel.n}" ${why?'disabled':''}>${why?'🔒 '+why:'Unlock for '+cost+' ability point'+(cost>1?'s':'')}</button></div>`}
    ${sel.gt?'<div class="mut kqs-hint">Press its key, aim the circle with the mouse (or drag on a touch screen), then click / tap — or press the key again — to cast. Right-click or Esc cancels.</div>':''}</div>`;
  $('xwB').innerHTML=`<div class="kqs-ld"><div class="sec">Equipped · keys 1–${KQS_SLOTS}</div><div class="kqs-slots">${slots}</div></div><div class="xcols kqs-cols"><div class="kqs-list">${tiers}</div><div>${det}</div></div>`;
  $('xwF').innerHTML=`<span class="mut dtl">You earn 1 ability point every level. Unlock abilities here, then choose which ${KQS_SLOTS} sit on keys 1–${KQS_SLOTS}.</span><button data-kqsreset="1" ${apSpent()?'':'disabled'}>Reset abilities (🪙 ${kqsResetCost()})</button>`};
$('xw').addEventListener('click',e=>{if(xwMode!='abil')return;const t=e.target.closest('[data-kqsbuy],[data-kqseq],[data-kqsun],[data-kqslot],[data-kqsel],[data-kqsreset],[data-kqstal]');if(!t||t.disabled)return;e.stopPropagation();const D=t.dataset;
  try{mSfx('tick')}catch(_){}
  if(D.kqsbuy!=null)return kqsBuy(D.kqsbuy);
  if(D.kqseq!=null){const k=D.kqsk!=null?+D.kqsk:KQS.slot|0;KQS.sel=D.kqseq;skSet(Math.min(k,heroSkills().length-(heroSkills().some(s=>s.n==D.kqseq)?1:0)),D.kqseq);return}
  if(D.kqsun!=null)return kqsUneq(+D.kqsun);
  if(D.kqsreset!=null)return kqsReset();
    if(D.kqslot!=null){KQS.slot=+D.kqslot;const s=heroSkills()[KQS.slot];if(s)KQS.sel=s.n;rX();return}
  if(D.kqsel!=null){KQS.sel=D.kqsel;rX()}});
// the talents window points to the ability book (replaces the v71 skill list)
function skHTML(){return '';const ap=apFree();return `<div class="sksec kqs-link"><span>⚡ <b>Abilities</b> are learned with ability points (1 per level), separate from talent points. You have <b>${ap}</b> to spend.</span><button class="pri" data-kqsopen="1">Open Abilities</button></div>`}
// v116: Talents (K) and Abilities (C) are two separate windows with their own keys; neither links to the other.
// C opens the Abilities window and closes it again.
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.key.toLowerCase()!='c')return;const a=document.activeElement;if(a&&(a.tagName=='INPUT'||a.tagName=='TEXTAREA'||a.tagName=='SELECT'))return;
  if(!$('xw').classList.contains('hide')&&xwMode=='abil'){closeX();e.stopImmediatePropagation();return}if(!uiOpen())openAbil()},true);
{const f=openTal;openTal=function(){if(!$('xw').classList.contains('hide')&&xwMode=='abil')closeX();KQS.tab='tal';return f.apply(this,arguments)}}
function kqsTabs(on){const ap=apFree();return `<div class="tabs kqs-tabs"><button class="${on=='tal'?'on':''}" data-kqstal="1">✦ Talents${tpFree()?' <b class="kqs-n">'+tpFree()+'</b>':''}</button><button class="${on=='ab'?'on':''}" data-kqsopen="1">⚡ Abilities${ap?' <b class="kqs-n">'+ap+'</b>':''}</button></div>`}
// (v116: the Talents window no longer carries a Talents | Abilities tab bar)
document.addEventListener('click',e=>{const t=e.target.closest('#tal [data-kqstal]');if(t)e.preventDefault()});
{const t=$('talBtn');if(t&&!$('abBtn')){t.insertAdjacentHTML('afterend','<button id="abBtn">⚡ Abilities <kbd>C</kbd></button>');$('abBtn').onclick=()=>{if($('sysmenu'))$('sysmenu').classList.add('hide');openAbil()}}}
document.head.insertAdjacentHTML('beforeend',`<style>
.kqs-tg{position:absolute;left:50%;top:84px;transform:translateX(-50%);z-index:30;display:flex;align-items:center;gap:10px;padding:6px 8px 6px 14px;font-size:.8rem;pointer-events:auto;border-radius:10px;white-space:nowrap;max-width:calc(100% - 32px);box-sizing:border-box}
.kqs-tg .kqs-tgh{opacity:.8}.kqs-tg kbd{font-size:.7rem}.kqs-tg .kqs-tgx{min-width:30px;padding:3px 8px}
body.mob .kqs-tg .kqs-tgh::after{content:' · drag on the screen, lift to cast'}
@media(max-width:700px){.kqs-tg{white-space:normal;top:70px}.kqs-tg .kqs-tgh{font-size:.7rem}}
#acts .hs.kqs-empty{opacity:.42;border-style:dashed}#acts .hs.kqs-aim{outline:2px solid #f0cc72;outline-offset:1px;box-shadow:0 0 14px rgba(240,204,114,.6)}
.kqs-apn{cursor:pointer;color:#c4b5fd}
.kqs-ld .kqs-slots{display:grid;grid-template-columns:repeat(${KQS_SLOTS},1fr);gap:6px;margin-bottom:8px}
.kqs-slot{position:relative;display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(0,0,0,.25);cursor:pointer;min-width:0}
.kqs-slot.on{border-color:#f0cc72;box-shadow:0 0 0 1px #f0cc72 inset}.kqs-slot.empty{opacity:.55;border-style:dashed}
.kqs-sk{font-size:.68rem;font-weight:800;opacity:.7}.kqs-si{font-size:1.25rem}.kqs-sn{font-size:.76rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
.kqs-sx{min-width:0;padding:1px 6px;font-size:.7rem;line-height:1.2}
.kqs-cols{align-items:start}.kqs-list{max-height:min(54vh,520px);overflow:auto;padding-right:4px}
.kqs-ab{cursor:pointer}.kqs-ab.lk{opacity:.62}.kqs-ab.on{outline:1px solid #f0cc72}.kqs-ab .kqs-ic{font-size:1.15rem;margin-right:6px}
.kqs-tag{font-size:.6rem;padding:1px 5px;border-radius:6px;background:rgba(255,255,255,.1);vertical-align:middle;font-weight:700}.kqs-tag.gt{background:rgba(240,204,114,.18);color:#f0cc72}.kqs-tag.nw{background:rgba(110,231,183,.16);color:#6ee7b7}.kqs-tag.def{background:rgba(147,197,253,.16);color:#93c5fd}
.kqs-eqd{font-size:.72rem;font-weight:800;color:#f0cc72}.kqs-lk{font-size:.7rem;opacity:.8;white-space:nowrap}
.kqs-det{padding:10px 12px;border-radius:10px}.kqs-dh{display:flex;gap:10px;align-items:center}.kqs-di{font-size:2.1rem}.kqs-dh small{display:block;opacity:.75;font-size:.72rem}
.kqs-det p{margin:8px 0;font-size:.82rem;line-height:1.4}.kqs-stats,.kqs-req{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}.kqs-stats span,.kqs-req span{font-size:.7rem;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,.07)}
.kqs-keys button{min-width:36px}.kqs-hint{font-size:.72rem;margin-top:8px}
.kqs-tabs{display:flex;gap:4px;margin:0 10px}.kqs-tabs button{padding:4px 10px;font-size:.78rem}.kqs-tabs button.on{border-color:#f0cc72;color:#f0cc72}.kqs-n{font-size:.68rem;margin-left:4px;padding:0 5px;border-radius:8px;background:#7c3aed;color:#fff}
#xwB>.kqs-tabs{margin:0 0 8px}
.kqs-link{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:.8rem}
@media(max-width:700px){.kqs-ld .kqs-slots{grid-template-columns:repeat(2,1fr)}.kqs-list{max-height:none}}
</style>`);

