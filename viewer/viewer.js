// ================= Kill Quest animation viewer =================
// Runs AFTER the game script, on the real game code: real models, real attack/ability code, real effects.
// Three tabs: Companions (every species, every evolution stage: basic attack + its 4 abilities), Monsters (every zone
// enemy and each of its attack moves) and Hero (every class and weapon type: each combo hit, full combo, class skills).
// The stage is a quiet spot in a portal zone; natural spawns are switched off, the viewer keeps only its own actors.
var KV={on:false,mode:'comp',sel:{comp:'Foxlet',mon:'hobgoblin',cls:'warrior'},stage:0,wt:null,dummy:null,mon:null,
  P:null,tod:.32,home:{},busyT:0,orbit:{yaw:2.1,pitch:.32,dist:7.5,fx:0,fy:.9,fz:0},focus:null,loop:false,last:null,queue:[],qT:0,label:''};
(function(){
const Q=s=>document.querySelector(s),QA=s=>[].slice.call(document.querySelectorAll(s));
const now_=()=>performance.now();
const FAMI={Beast:'🐾',Earth:'⛰️',Sky:'🪶',Dragon:'🐉',Spirit:'👻',Swarm:'🕷️'};
const KINDN={bite:'Melee bite',bolt:'Projectile',nova:'Burst around it',cone:'Cone in front',beam:'Beam',rain:'Area at target',chain:'Chain',shield:'Shields you',heal:'Heals you',buff:'Buffs you',fan:'Spread',meteor:'Delayed strike'};
const MOVEN={strike:'Strike',bite:'Bite',pounce:'Pounce',charge:'Charge',spin:'Spin',slam:'Slam',spit:'Spit',throw:'Throw',bolt:'Magic bolt',rainfire:'Rain of fire'};
const MOVEI={strike:'⚔️',bite:'🦷',pounce:'🐾',charge:'💨',spin:'🌀',slam:'💥',spit:'🟢',throw:'🎯',bolt:'✴️',rainfire:'☄️'};
const MOVED={strike:1.7,bite:1.5,spin:1.6,slam:1.8,pounce:4.2,charge:4.6,spit:5.2,throw:6,bolt:6,rainfire:6};
const RANGEDW={bow:1,staff:1,knives:1,crossbow:1,sling:1,wand:1,orb:1};
const STAGEN=['Hatchling','Stage 1','Stage 2','Stage 3'];

// ---------- start: make a hero through the real creator, then build the stage ----------
function boot(){
  try{applyDev('desktop')}catch(_){}try{$('devp').classList.add('hide')}catch(_){}
  let n=0;const go=()=>{n++;
    try{if(!$('start').classList.contains('hide')){ccCls='warrior';ccSp='Foxlet';ccStep=1;ccBegin()}}catch(e){console.warn('viewer boot',e)}
    let open=false;try{open=!$('start').classList.contains('hide')||uiOpen()}catch(_){}
    if(open&&n<40){try{document.querySelectorAll('.panel:not(.hide) .x,.modal:not(.hide) .x').forEach(b=>b.click())}catch(_){}setTimeout(go,250);return}
    setTimeout(stageUp,300)};
  setTimeout(go,200);
}
function stageUp(){
  try{CHEAT.god=true}catch(_){}
  try{mOn=false}catch(_){}
  // a flat, open, well-lit spot: Hillside Crest's road
  const p=KVSPOT();toPos(p[0],p[1],0);KV.P=V(p[0],0,p[1]);
  hero.lvl=50;hero.hp=heroMax();hero.mp=mpMax();
  // no natural spawns, no auto spells, no boss timers
  spawn=function(){};spawnBoss=function(){};compSpells=function(){};
  enemies.slice().forEach(e=>{try{removeE(e)}catch(_){}});
  KV.on=true;document.body.classList.add('kv-on');
  try{window.dispatchEvent(new Event('resize'))}catch(_){}
  buildUI();select('comp',KV.sel.comp);
  requestAnimationFrame(frame);
}
window.KVSPOT=function(){try{const z=PMAP[1].path;const p=z[Math.min(z.length-1,40)];return [p[0],p[1]]}catch(_){return [pl.position.x,pl.position.z]}};

// ---------- actors ----------
function at(dx,dz){return V(KV.P.x+dx,0,KV.P.z+dz)}
function keepOnly(list){enemies.slice().forEach(e=>{if(!list.includes(e))try{removeE(e)}catch(_){}})}
function mkFoe(key,pos){const e=spawnEnemy(key,pos.x,pos.z,30,{});if(!e)return null;e.__kv=1;e.c.st.hp=1e9;e.c.h=6e8;e.agg=0;e.cd=1e9;
  e.m.position.copy(pos);try{scene.remove(e.hb)}catch(_){}try{if(e.rmk)e.rmk.visible=false}catch(_){}return e}
function freezeFoe(e){if(!e||e.dead)return;e.cd=1e9;e.c.h=6e8;e.root=99;e.agg=1;if(e.atk==null)e.tgI=null}
function setComp(sp,stage){
  const c=hatch(Object.assign(mkEgg(sp,0,1),{basic:true}));c.l=50;c.evo=stage;c.sp=[SP2[sp][8]].concat(EVSP[famOf(sp)].slice(0,3));c.cdm={};c.emp=false;c.h=M(c);
  party=[c];cmpSel=0;try{ui()}catch(_){}try{sync()}catch(_){}
  const f=fols[0];if(f){f.position.copy(KV.home.comp);f.rotation.y=0}
}
function layout(){
  const m=KV.mode;
  if(m=='comp'){KV.home.comp=at(0,0);KV.home.dummy=at(0,3.4);KV.home.hero=at(-1.9,-1.3)}
  else if(m=='mon'){KV.home.mon=at(0,0);KV.home.hero=at(0,MOVED.strike)}
  else{KV.home.hero=at(0,0);KV.home.dummy=at(0,RANGEDW[KV.wt]?6.5:2.3)}
}
function placeHero(p){pl.position.set(p.x,GH(p.x,p.z),p.z);pl.step=null;hero.dash=null}

// ---------- selecting a subject ----------
function select(mode,key,opt){
  KV.mode=mode;KV.queue=[];KV.last=null;
  if(mode=='comp'){KV.sel.comp=key;if(opt&&opt.stage!=null)KV.stage=opt.stage}
  else if(mode=='mon')KV.sel.mon=key;
  else{KV.sel.cls=key;KV.wt=(opt&&opt.wt)||KV.wt;if(!wtList(key).some(w=>w.wt==KV.wt))KV.wt=wtList(key)[0].wt}
  layout();
  // the companion always exists (the game pauses with an empty party); it is hidden off stage outside its tab
  const csp=mode=='comp'?KV.sel.comp:(party[0]&&party[0].g&&party[0].g[0])||'Foxlet';
  if(mode=='comp'||!party.length)setComp(csp,mode=='comp'?KV.stage:0);
  if(mode=='hero')setHero(KV.sel.cls,KV.wt);else if(hero.cls!='warrior'||mode=='comp')setHero('warrior',null,true);
  keepOnly([]);KV.dummy=null;KV.mon=null;
  if(mode=='comp'||mode=='hero'){KV.dummy=mkFoe(Q('#kvTarget')?Q('#kvTarget').value:'hobgoblin',KV.home.dummy)}
  if(mode=='mon'){KV.mon=mkFoe(key,KV.home.mon)}
  placeHero(KV.home.hero);
  // camera: frame the scene from the side
  const sc=mode=='mon'?Math.max(1,(EN[key].sc||1)):1;KV.orbit.dist=(mode=='hero'&&RANGEDW[KV.wt]?9.5:7.2)*sc;
  KV.busyT=0;QA('#kvTabs button').forEach(x=>x.classList.toggle('on',x.dataset.t==mode));renderDetail();renderList();
}
function setHero(cls,wt,quiet){
  hero.cls=cls;hero.lvl=50;hero.cd={};hero.cr=0;hero.buffs=[];
  const T=wt?wtList(cls).find(w=>w.wt==wt):wtList(cls)[0];
  eq={};eq.weapon={id:uid++,tp:T.tp,lv:50,req:1,r:3,up:0,aff:[]};
  const ch=ITPL.findIndex(t=>t.sl=='chest'&&t.arm==CLS[cls].arm&&t.t==2);if(ch>=0)eq.chest={id:uid++,tp:ch,lv:50,req:1,r:2,up:0,aff:[]};
  if(cls=='paladin'){const o=ITPL.findIndex(t=>t.sl=='offhand'&&t.t==2);if(o>=0)eq.offhand={id:uid++,tp:o,lv:50,req:1,r:2,up:0,aff:[]}}
  try{hsDirty()}catch(_){}try{refreshGear()}catch(e){console.warn(e)}hero.hp=heroMax();hero.mp=mpMax();try{ui()}catch(_){}
  combo=0;atkCd=0;
}
function wtList(cls){const out=[],seen={};ITPL.forEach((t,i)=>{if(t.sl=='weapon'&&t.cls==cls)seen[t.wt]=i});
  Object.keys(seen).forEach(wt=>out.push({wt,tp:seen[wt],n:WTYPE[wt].n,i:WTYPE[wt].i}));return out}
function comboN(wt){if(MW[wt])return MW[wt].N;if(WBEH[wt])return 0;const C=CLS[hero.cls];if(C.atk=='melee4')return 4;if(C.atk=='melee3')return 3;return 0}

// ---------- actions ----------
function busy(ms){KV.busyT=Math.max(KV.busyT,now_()+ms)}
function caption(t,s){KV.label=t;const o=Q('#kvCap');if(o){o.innerHTML='<b>'+t+'</b>'+(s?'<span>'+s+'</span>':'');o.classList.remove('hide');clearTimeout(KV.capT);KV.capT=setTimeout(()=>o.classList.add('hide'),2600/Math.max(.1,KVCLK.speed||1))}}
function act(a,fromQueue){if(!fromQueue)KV.queue=[];KV.last=a;
  QA('.kv-act').forEach(b=>b.classList.toggle('on',b.dataset.k==a.k));
  try{a.run()}catch(e){console.warn('viewer action',e)}caption(a.t,a.s);busy(a.ms||1600)}
function compActions(){const c=party[0],f=fols[0],out=[];if(!c||!f)return out;const sp=c.g[0],fam=famOf(sp),mg=xMt(c)=='m';
  out.push({k:'basic',i:mg?'✴️':'🦷',t:'Basic attack',s:mg?'Magic bolt':'Bite',ms:1300,run(){const e=KV.dummy;if(!e)return;KV.home.comp&&f.position.copy(KV.home.comp);faceTo(f,e.m.position);
    if(mg){f.lk=1;const b=f.b;tw(220,k=>{if(b){b.position.y=Math.sin(k*Math.PI)*.12;b.rotation.x=-Math.sin(k*Math.PI)*.25}},()=>{if(b){b.position.y=0;b.rotation.x=0}f.lk=0;compBolt(f,c,e,()=>{if(!e.dead)compHit(c,e,1)})})}
    else{f.lk=1;lunge(f,e.m.position,()=>{f.lk=0;if(!e.dead)compHit(c,e,1)})}}});
  c.sp.forEach((n,j)=>{const S=CSP[n],R=(typeof SPX105!='undefined'&&SPX105[n])||{};
    out.push({k:'sp'+j,i:S.i,t:n,s:(j?'Unlocks at stage '+j:'Signature')+' · '+(KINDN[S.k]||S.k)+(R.m?' · '+R.m+' motion':''),d:S.d,ms:2600,lock:j>KV.stage,run(){const e=KV.dummy;f.lk=0;f._m105=null;KV.home.comp&&f.position.copy(KV.home.comp);if(e)faceTo(f,e.m.position);c.cdm[n]=0;hero.sh=0;compCast(c,f,S,e)}})});
  return out}
function monActions(){const key=KV.sel.mon,ms=(typeof MSET!='undefined'&&MSET[key])||EN[key].moves||['strike'];
  return ms.map(n=>({k:'m'+n,i:MOVEI[n]||(MV[n]&&MV[n].ic)||'⚔️',t:MOVEN[n]||(MV[n]&&MV[n].nm)||n,s:(MV[n]?(MV[n].sh||'')+' · wind-up '+MV[n].wind+'s':''),ms:(MV[n]?(MV[n].wind+MV[n].act+MV[n].rec)*1000+700:1800),run(){const e=KV.mon;if(!e)return;
    mCancel(e);e.m.position.copy(KV.home.mon);const M_=MV[n]||{},dd=MOVED[n]||(M_.rmin>0?Math.max(M_.rmin+.8,Math.min(M_.rmax-.5,4.5)):Math.min(1.7,(M_.rmax||2)-.2)),hp=V(KV.home.mon.x,0,KV.home.mon.z+dd);placeHero(hp);KV.home.hero=hp;faceTo(e.m,hp);e.cd=1e9;mStart(e,pl,n)}}))}
function heroActions(){const out=[],wt=KV.wt,N=comboN(wt),ranged=RANGEDW[wt];
  const prep=()=>{placeHero(KV.home.hero);faceTo(pl,KV.dummy?KV.dummy.m.position:at(0,3));tgt=KV.dummy;atkCd=0;hero.chan=null;try{riding=null}catch(_){}};
  if(N){for(let i=0;i<N;i++)out.push({k:'h'+i,i:i==N-1?'💥':'⚔️',t:i==N-1?'Finisher (hit '+(i+1)+')':'Hit '+(i+1),s:WTYPE[wt].n+' combo',ms:1200,run(){prep();combo=i;comboT=performance.now();swing()}});
    out.push({k:'full',i:'🔁',t:'Full combo',s:N+' hits in a row',ms:N*700+800,run(){prep();combo=0;comboT=performance.now();let n=0;const go=()=>{if(KV.mode!='hero')return;if(atkCd>0||hero.chan){setTimeout(go,30);return}if(n++>=N)return;swing();setTimeout(go,40)};go()}})}
  else{out.push({k:'h0',i:'🎯',t:'Attack',s:WTYPE[wt].n+(ranged?' · ranged':''),ms:1600,run(){prep();swing()}});
    out.push({k:'full',i:'🔁',t:'Attack 5 times',s:wt=='knives'?'every 4th throw is a fan of 5':wt=='wand'?'every 5th bolt is a big one':'repeated attacks',ms:5200,run(){prep();let n=0;const go=()=>{if(KV.mode!='hero')return;if(atkCd>0){setTimeout(go,30);return}if(n++>=5)return;tgt=KV.dummy;swing();setTimeout(go,40)};go()}})}
  try{heroSkills().forEach((sk,i)=>{if(!sk)return;out.push({k:'s'+i,i:sk.i,t:sk.n,s:'Class skill '+(i+1),d:sk.d,ms:(sk.dur&&sk.k=='channel'?sk.dur*1000:0)+2200,run(){prep();hero.cd={};hero.mp=mpMax();hero.cr=0;hero.lvl=50;cast(i)}})})}catch(e){console.warn(e)}
  return out}
function actions(){return KV.mode=='comp'?compActions():KV.mode=='mon'?monActions():heroActions()}
function faceTo(o,p){const dx=p.x-o.position.x,dz=p.z-o.position.z;if(dx*dx+dz*dz>1e-4)o.rotation.y=Math.atan2(dx,dz)}
function playAll(){const A=actions().filter(a=>a.k!='full');KV.queue=A.slice(1);act(A[0],true);KV.qT=now_()+(A[0].ms||1600)+400}

// ---------- the per-frame stage keeper ----------
function frame(){requestAnimationFrame(frame);if(!KV.on)return;const t=now_(),idle=t>KV.busyT;
  ['fz','bag','inc','cmp','shop','mshop','wmap','setw','tal','hatch','start','xw','dth','devp'].forEach(i=>{const el=$(i);if(el&&!el.classList.contains('hide'))el.classList.add('hide')});try{if(typeof KQMENU!='undefined')KQMENU.on=false}catch(_){}
  hero.hp=heroMax();if(KV.mode!='hero')hero.mp=mpMax();try{TOD=KV.tod}catch(_){}
  const keep=[KV.dummy,KV.mon].filter(Boolean);enemies.slice().forEach(e=>{if(!keep.includes(e))try{removeE(e)}catch(_){}});
  keep.forEach(freezeFoe);
  if(KV.mon){KV.mon.agg=1;if(idle&&!KV.mon.atk)ease(KV.mon.m,KV.home.mon,6);if(!KV.mon.atk)faceTo(KV.mon.m,pl.position)}
  if(KV.dummy){if(idle)ease(KV.dummy.m,KV.home.dummy,6);KV.dummy.agg=0;faceTo(KV.dummy.m,pl.position)}
  // hero: back to the mark and facing the action when nothing is happening
  if(idle&&!hero.chan&&!hero.dash&&atkCd<=0){ease(pl,KV.home.hero,5);const fo=KV.mode=='mon'?KV.mon:KV.dummy;if(fo)faceTo(pl,fo.m.position)}
  if(KV.mode=='hero'&&KV.dummy)tgt=KV.dummy;else tgt=null;
  // queue (Play all) and loop
  if(KV.queue.length&&t>KV.qT){const a=KV.queue.shift();act(a,true);KV.qT=t+(a.ms||1600)+400}
  else if(!KV.queue.length&&KV.loop&&KV.last&&t>KV.busyT+500){act(KV.last,true)}
  // camera focus follows the action, gently
  const subj=KV.mode=='comp'?fols[0]:KV.mode=='mon'?KV.mon&&KV.mon.m:pl,other=KV.mode=='mon'?pl:KV.dummy&&KV.dummy.m;
  if(subj){const a=subj.position,b=other?other.position:a,fx=(a.x+b.x)/2,fz=(a.z+b.z)/2,fy=GH(fx,fz)+.8*(KV.mode=='mon'?Math.max(1,(EN[KV.sel.mon].sc||1)):1);
    const F=KV.focus||(KV.focus=V(fx,fy,fz));F.x+=(fx-F.x)*.08;F.y+=(fy-F.y)*.08;F.z+=(fz-F.z)*.08}
  // the time readout
  const sp=Q('#kvSpdT');if(sp)sp.textContent=KVCLK.speed==0?'paused':'×'+(+KVCLK.speed).toFixed(KVCLK.speed<1?2:0).replace(/\.?0+$/,'');
}
function ease(o,h,k){if(!h)return;const dx=h.x-o.position.x,dz=h.z-o.position.z;if(dx*dx+dz*dz<1e-4)return;const r=Math.min(1,.016*k*(KVCLK.speed||0)+.0);o.position.x+=dx*r;o.position.z+=dz*r}

// the companion stays on its mark (its own AI would chase the target and cast on its own)
compTick=function(dt,now){const f=fols[0],c=party[0];if(!f||!c)return;f.vel=f.vel||V();
  if(KV.mode!='comp'){f.visible=false;f.position.set(KV.P.x-60,0,KV.P.z-60);return}
  f.visible=true;f.position.y=GH(f.position.x,f.position.z);const h=KV.home.comp;let mv=false;
  if(!f.lk&&!f._m105&&h&&now_()>KV.busyT){const dx=h.x-f.position.x,dz=h.z-f.position.z,L=Math.hypot(dx,dz);if(L>.05){const s=Math.min(L,dt*3);f.position.x+=dx/L*s;f.position.z+=dz/L*s;mv=L>.2;if(mv)f.rotation.y=Math.atan2(dx,dz)}}
  if(!mv&&!f.lk&&KV.dummy)faceTo(f,KV.dummy.m.position);
  animC(f,now,mv,mv?2:0)};

// ---------- camera: orbit the action; drag to turn, wheel / pinch to zoom ----------
{const R=ren.render.bind(ren);ren.render=function(s,c){if(KV.on&&c===cam)orbitCam();if(window.KVNODRAW)return;return R(s,c)}}
{const f=chunkVis;chunkVis=function(){if(KV.on)orbitCam();return f.apply(this,arguments)}}
function orbitCam(){const O=KV.orbit,F=KV.focus||V(KV.P.x,1,KV.P.z),cp=Math.cos(O.pitch);
  cam.position.set(F.x+Math.sin(O.yaw)*cp*O.dist,F.y+Math.sin(O.pitch)*O.dist,F.z+Math.cos(O.yaw)*cp*O.dist);
  const g=GH(cam.position.x,cam.position.z)+.4;if(cam.position.y<g)cam.position.y=g;
  if(typeof shk!='undefined'&&shk>0){cam.position.x+=(Math.random()-.5)*shk*.6;cam.position.y+=(Math.random()-.5)*shk*.6}
  cam.lookAt(F.x,F.y,F.z);cam.updateMatrixWorld()}
function camPreset(n){const O=KV.orbit;const base=KV.mode=='hero'?0:0;
  if(n=='side'){O.yaw=Math.PI/2+.45;O.pitch=.3}else if(n=='front'){O.yaw=0+.15;O.pitch=.25}else if(n=='back'){O.yaw=Math.PI+.25;O.pitch=.35}else if(n=='top'){O.yaw=Math.PI/2+.2;O.pitch=1.2}}

// ---------- UI ----------
function buildUI(){
  const st=Q('#stage');
  const ov=document.createElement('div');ov.id='kvOv';ov.innerHTML='<div id="kvCap" class="hide"></div><div id="kvHint">Drag to turn · scroll or pinch to zoom</div>';st.appendChild(ov);
  const pn=document.createElement('aside');pn.id='kvPanel';
  pn.innerHTML=`<header><h1>Kill Quest <span>Animation Viewer</span></h1></header>
  <nav id="kvTabs"><button data-t="comp" class="on">🥚 Companions</button><button data-t="mon">👹 Monsters</button><button data-t="hero">⚔️ Hero</button></nav>
  <div id="kvList"></div>
  <section id="kvDetail"></section>
  <footer id="kvCtl">
    <div class="row"><span class="lbl">Speed</span><div class="seg" id="kvSpd"><button data-s="1" class="on">1×</button><button data-s=".5">½×</button><button data-s=".25">¼×</button><button data-s=".1">⅒×</button></div>
      <button id="kvPause" title="Pause / play (Space)">Pause</button><button id="kvStep" title="Step one frame (.)">Step</button></div>
    <div class="row"><span class="lbl">View</span><div class="seg" id="kvCam"><button data-c="side">Side</button><button data-c="front">Front</button><button data-c="back">Back</button><button data-c="top">Top</button></div>
      <label class="chk"><input type="checkbox" id="kvLoop"> Loop</label></div>
    <div class="row" id="kvTgtRow"><span class="lbl">Target</span><select id="kvTarget"></select></div>
  </footer>`;
  document.body.appendChild(pn);
  const tsel=Q('#kvTarget');['hobgoblin','orc','skeleton','troll','snowwolf','tortoise','goo','yeti'].forEach(k=>{if(EN[k]){const o=document.createElement('option');o.value=k;o.textContent=EN[k].e+' '+EN[k].n;tsel.appendChild(o)}});
  tsel.onchange=()=>{select(KV.mode,KV.mode=='comp'?KV.sel.comp:KV.sel.cls)};
  Q('#kvTabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;QA('#kvTabs button').forEach(x=>x.classList.toggle('on',x===b));const t=b.dataset.t;select(t,t=='comp'?KV.sel.comp:t=='mon'?KV.sel.mon:KV.sel.cls);camPreset('side')};
  Q('#kvSpd').onclick=e=>{const b=e.target.closest('button');if(!b)return;setSpeed(+b.dataset.s)};
  Q('#kvPause').onclick=()=>setSpeed(KVCLK.speed==0?(KV.prevS||1):0);
  Q('#kvStep').onclick=()=>{if(KVCLK.speed!=0)setSpeed(0);KVCLK.step+=16};
  Q('#kvCam').onclick=e=>{const b=e.target.closest('button');if(b)camPreset(b.dataset.c)};
  Q('#kvLoop').onchange=e=>{KV.loop=e.target.checked};
  Q('#kvList').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;if(KV.mode=='hero')select('hero',b.dataset.k);else select(KV.mode,b.dataset.k)};
  Q('#kvDetail').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.stage!=null){KV.stage=+b.dataset.stage;select('comp',KV.sel.comp,{stage:KV.stage});return}
    if(b.dataset.wt){select('hero',KV.sel.cls,{wt:b.dataset.wt});return}
    if(b.id=='kvAll'){playAll();return}
    const a=actions().find(x=>x.k==b.dataset.k);if(a)act(a)};
  // orbit input on the stage
  const gl=Q('#gl');let drag=null,pinch=null;const pts={};
  ov.addEventListener('pointerdown',e=>{pts[e.pointerId]={x:e.clientX,y:e.clientY};ov.setPointerCapture(e.pointerId);const ks=Object.keys(pts);
    if(ks.length==2){const a=pts[ks[0]],b=pts[ks[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),d0:KV.orbit.dist};drag=null}else drag={x:e.clientX,y:e.clientY}});
  ov.addEventListener('pointermove',e=>{if(!pts[e.pointerId])return;pts[e.pointerId]={x:e.clientX,y:e.clientY};const ks=Object.keys(pts);
    if(pinch&&ks.length==2){const a=pts[ks[0]],b=pts[ks[1]],d=Math.hypot(a.x-b.x,a.y-b.y);KV.orbit.dist=Math.max(2.5,Math.min(22,pinch.d0*pinch.d/Math.max(10,d)));return}
    if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};KV.orbit.yaw-=dx*.008;KV.orbit.pitch=Math.max(-.05,Math.min(1.35,KV.orbit.pitch+dy*.006))}});
  const up=e=>{delete pts[e.pointerId];if(Object.keys(pts).length<2)pinch=null;if(!Object.keys(pts).length)drag=null};ov.addEventListener('pointerup',up);ov.addEventListener('pointercancel',up);
  ov.addEventListener('wheel',e=>{e.preventDefault();KV.orbit.dist=Math.max(2.5,Math.min(22,KV.orbit.dist*(1+Math.sign(e.deltaY)*.1)))},{passive:false});
  // keys: the game's own keys are switched off; a few viewer shortcuts instead
  const keyH=e=>{if(e.target&&(e.target.tagName=='INPUT'||e.target.tagName=='SELECT'))return;e.stopImmediatePropagation();if(e.type!='keydown')return;
    if(e.key==' '){e.preventDefault();Q('#kvPause').click()}else if(e.key=='.')Q('#kvStep').click();else if(e.key=='r'||e.key=='R'){if(KV.last)act(KV.last)}
    else if(/^[1-9]$/.test(e.key)){const a=actions()[+e.key-1];if(a)act(a)}};
  window.addEventListener('keydown',keyH,true);window.addEventListener('keyup',keyH,true);
  camPreset('side');
}
function setSpeed(s){if(s!=0)KV.prevS=s;KVCLK.speed=s;QA('#kvSpd button').forEach(b=>b.classList.toggle('on',+b.dataset.s==s));Q('#kvPause').textContent=s==0?'Play':'Pause'}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function renderList(){const L=Q('#kvList');let h='';
  if(KV.mode=='comp'){const fams={};SPK.forEach(k=>{(fams[SP2[k][0]]=fams[SP2[k][0]]||[]).push(k)});
    for(const f in fams){h+=`<div class="grp">${FAMI[f]||''} ${f}</div><div class="chips">`+fams[f].sort((a,b)=>SP2[a][1]-SP2[b][1]).map(k=>`<button data-k="${k}" class="${KV.sel.comp==k?'on':''}"><i>${SP2[k][3]}</i>${k}<small>T${SP2[k][1]}</small></button>`).join('')+'</div>'}}
  else if(KV.mode=='mon'){const bk={beast:[],hum:[]};Object.keys(EN).forEach(k=>{if(/^boss/.test(k)||!EN[k].moves||!EN[k].moves.length)return;(EN[k].hum?bk.hum:bk.beast).push(k)});
    [['Creatures','beast'],['Humanoids','hum']].forEach(([n,g])=>{h+=`<div class="grp">${n}</div><div class="chips">`+bk[g].map(k=>`<button data-k="${k}" class="${KV.sel.mon==k?'on':''}"><i>${EN[k].e}</i>${esc(EN[k].n)}</button>`).join('')+'</div>'})}
  else{h+='<div class="grp">Class</div><div class="chips">'+CLSK.map(k=>`<button data-k="${k}" class="${KV.sel.cls==k?'on':''}"><i>${CLS[k].i}</i>${CLS[k].n}</button>`).join('')+'</div>'}
  L.innerHTML=h;Q('#kvTgtRow').style.display=KV.mode=='mon'?'none':''}
function renderDetail(){const D=Q('#kvDetail');let h='';const A=actions();
  if(KV.mode=='comp'){const k=KV.sel.comp,q=SP2[k];h+=`<h2><i>${q[3]}</i> ${k}</h2><p class="meta">${FAMI[q[0]]||''} ${q[0]} family · tier ${q[1]} · ${xMt(party[0])=='m'?'magic (keeps its distance)':'physical (closes in)'}</p>
    <div class="lbl2">Evolution look</div><div class="seg wide">${STAGEN.map((n,i)=>`<button data-stage="${i}" class="${KV.stage==i?'on':''}">${n}</button>`).join('')}</div>`}
  else if(KV.mode=='mon'){const e=EN[KV.sel.mon];h+=`<h2><i>${e.e}</i> ${esc(e.n)}</h2><p class="meta">${e.hum?'Humanoid':'Creature ('+e.rig+' body)'} · ${e.fam} · ${e.mt=='m'?'magic':'physical'}${e.ranged?' · ranged':''}${e.sc&&e.sc!=1?' · size ×'+e.sc:''}</p>
    <p class="note">Red ground shapes are the warning players see before the hit lands.</p>`}
  else{const C=CLS[KV.sel.cls];h+=`<h2><i>${C.i}</i> ${C.n}</h2><p class="meta">${esc(C.role)}</p><div class="lbl2">Weapon</div><div class="seg wide wrapb">${wtList(KV.sel.cls).map(w=>`<button data-wt="${w.wt}" class="${KV.wt==w.wt?'on':''}">${w.i} ${w.n}</button>`).join('')}</div>`
    if(typeof WDESC!='undefined'&&WDESC[KV.wt])h+=`<p class="note">${esc(WDESC[KV.wt])}</p>`}
  h+=`<div class="lbl2 rowh"><span>${KV.mode=='comp'?'Attack and abilities':KV.mode=='mon'?'Attacks':'Attacks and skills'}</span><button id="kvAll">▶ Play all</button></div><div class="acts">`+
    A.map((a,i)=>`<button class="kv-act${a.lock?' lock':''}" data-k="${a.k}" title="${esc(a.d||'')}"><i>${a.i}</i><span><b>${esc(a.t)}</b><small>${esc(a.s||'')}</small></span><kbd>${i<9?i+1:''}</kbd></button>`).join('')+'</div>';
  D.innerHTML=h}
window.KVselect=select;window.KVact=k=>{const a=actions().find(x=>x.k==k);if(a)act(a);return !!a};window.KVactions=()=>actions().map(a=>a.k);

// wait for the game to finish loading
const wait=()=>{if(typeof hero!='undefined'&&typeof ccBegin=='function'&&document.querySelector('#ccNext'))boot();else setTimeout(wait,100)};wait();
})();
