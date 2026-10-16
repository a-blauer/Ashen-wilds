// ================= v45: Combat overhaul — feel, decisions, smarter enemies, pacing =================
var slowT=0;
const nowP=()=>performance.now();
// ---------- tiny synth for hit sounds (no audio files needed) ----------
let AUD=null,NOISE=null;const sfxLast={};
function audio(){if(!AUD){try{AUD=new (window.AudioContext||window.webkitAudioContext)();const g=AUD.createGain();g.gain.value=.32;g.connect(AUD.destination);AUD.out=g;
  NOISE=AUD.createBuffer(1,AUD.sampleRate,AUD.sampleRate);const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(_){AUD=null}}
  if(AUD&&AUD.state=='suspended')AUD.resume();return AUD}
addEventListener('pointerdown',()=>audio(),{once:true});addEventListener('keydown',()=>audio(),{once:true});
function sfx(k,vol){
  if(SET.sfx===false)return;const a=AUD;if(!a||a.state!='running')return;const t=a.currentTime;if(sfxLast[k]&&t-sfxLast[k]<.045)return;sfxLast[k]=t;vol=vol||1;
  const env=(g,v,at,dec)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol,t+at);g.gain.exponentialRampToValueAtTime(.001,t+at+dec)};
  const osc=(type,f0,f1,dur,v,at)=>{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);env(g,v,at||.004,dur);o.connect(g);g.connect(a.out);o.start(t);o.stop(t+dur+.05)};
  const noise=(ft,f0,f1,dur,v,q)=>{const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;f.type=ft;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);f.Q.value=q||1;env(g,v,.003,dur);s.connect(f);f.connect(g);g.connect(a.out);s.start(t,Math.random()*.5);s.stop(t+dur+.05)};
  ({
   slash:()=>{noise('bandpass',3200,700,.13,.5,1.4);osc('triangle',520,180,.08,.12)},
   blunt:()=>{osc('sine',150,55,.16,.6);noise('lowpass',900,200,.1,.35)},
   stab:()=>{noise('bandpass',4200,1500,.07,.4,2);osc('square',900,400,.04,.06)},
   arrow:()=>{noise('highpass',3500,2000,.05,.3);osc('sine',820,420,.07,.2)},
   zap:()=>{osc('triangle',1100,260,.16,.25);noise('bandpass',2500,900,.09,.15,3)},
   crit:()=>{osc('square',1400,700,.09,.08);osc('sine',1800,1200,.12,.1)},
   brk:()=>{osc('square',520,500,.35,.13);osc('square',783,760,.35,.1);noise('bandpass',2000,1200,.2,.25,4)},
   perfect:()=>{osc('sine',380,1600,.25,.25);osc('sine',1760,1760,.5,.12,.05)},
   power:()=>{osc('sawtooth',180,720,.32,.09);osc('sine',360,1440,.3,.12)},
   boom:()=>{osc('sine',110,40,.45,.6);noise('lowpass',1400,120,.4,.5)},
   chime:()=>{osc('sine',990,990,.25,.12);osc('sine',1320,1320,.35,.1,.06)},
   horn:()=>{osc('sawtooth',196,190,.9,.12,.08);osc('sawtooth',294,290,.9,.08,.08)}
  })[k]?.();
}
// ---------- big popup text + screen flash ----------
{const v=document.createElement('div');v.id='pdv';$('stage').appendChild(v);const s=document.createElement('div');s.id='strk';s.className='hide';$('stage').appendChild(s)}
function popT(p,t,col,big){dn(p,t,col,-46,big?1300:1000);const el=$('stage').lastChild;if(el&&el.className=='dn'){el.style.fontSize=big?'1.55rem':'1.12rem';el.style.fontWeight='900';el.style.letterSpacing='.04em'}}
function flash(col){const v=$('pdv');v.style.setProperty('--fc',col);v.classList.remove('on');void v.offsetWidth;v.classList.add('on')}

// =============== 1. PERFECT DODGE ===============
function dodge(){if(riding)return;const dc=hero.dc||0;const r=dodge_base();if((hero.dc||0)<dc){hero.dshT=nowP();hero.pdOk=0}return r}
function perfectCheck(){
  const t=nowP();if(!hero.dshT||t-hero.dshT>340||hero.pdOk===hero.dshT)return false;hero.pdOk=hero.dshT;
  slowT=.85;hero.pcrit=t+3500;hero.dc=Math.min(Math.floor(HS().dash),(hero.dc||0)+1);
  popT(pl.position,'PERFECT DODGE','#7dd3fc',true);flash('rgba(125,211,252,.35)');burst(gY(pl.position,1),0x9ad8ff,40,3,2.5,.7);ring(pl.position,0x9ad8ff,3.5,420);sfx('perfect');
  return true;
}
function hitHero(e,mult,mt){
  if(hero.iv>0&&townAt(pl.position.x,pl.position.z,.5)<0)perfectCheck();
  const hp0=hero.hp,r=hitHero_base(e,mult,mt),dd=hp0-hero.hp;
  if(dd>0){
    if(e&&e.trait=='Vampiric'&&!e.dead){e.c.h=Math.min(M(e.c),e.c.h+dd*.4);burst(gY(e.m.position,1),0xd02040,8,1,1,.4)}
    const R=CRES[hero.cls];if(R&&R.hurt)resGain(R.hurt);
  }
  return r;
}
// =============== 2/3. BREAKS, HIT FEEDBACK, ELEMENTS, WEAK POINTS (all through the hero's hits) ===============
const ELC={0xff7a2a:'fire',0xff5a1a:'fire',0xffd060:'fire',0x9fe3ff:'frost',0xfff06a:'shock',0xffe08a:'shock',0xd8d8e8:'poison',0xff3a6a:'poison',0xc0a060:'water'};
const FEL={Dragon:'fire',Spirit:'frost',Sky:'shock',Earth:'water',Swarm:'poison'};
const ELI={fire:['🔥',0xff6a1a],frost:['❄️',0x8ad8ff],shock:['⚡',0xfff06a],water:['💧',0x3a8aff],poison:['☠️',0x8ad84a]};
function elRing(e,on){
  if(!e.elR){const r=new THREE.Mesh(new THREE.RingGeometry(.62,.8,28),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.08;e.m.add(r);e.elR=r}
  e.elR.visible=!!on;if(on)e.elR.material.color.setHex(ELI[on][1]);
}
// returns a damage multiplier for the hit that applied it; side effects (stun, chains, explosions) happen here
function applyEl(e,el,raw,src){
  if(!el||!e||e.dead)return 1;const t=nowP(),cur=e.el&&e.el.t>t?e.el.k:null,P=e.m.position;
  if(!cur||cur==el){e.el={k:el,t:t+5000};elRing(e,el);return 1}
  const key=[cur,el].sort().join('+');e.el=null;elRing(e,null);let mult=1;
  const splash=(r,k,col,fx)=>enemies.forEach(o=>{if(o.dead||o===e||d2(o.m.position,P)>r)return;heroHit_base(o,raw*k,heroMt(),{proc:false,s:{col}});if(fx&&!o.dead)eStatus(o,fx,0)});
  switch(key){
    case 'fire+frost':mult=2;popT(P,'MELT!','#fb923c');break;
    case 'frost+water':e.stun=Math.max(e.stun||0,e.boss?.6:2.2);e.frz=2.2;if(!e.boss)mCancel(e);popT(P,'FROZEN!','#93c5fd');burst(gY(P,.8),0xbfe8ff,30,1.5,1.5,.6);break;
    case 'shock+water':{popT(P,'CONDUCT!','#fde047');let n=0;enemies.slice().sort((a,b)=>d2(a.m.position,P)-d2(b.m.position,P)).forEach(o=>{if(n>=3||o.dead||o===e||d2(o.m.position,P)>6)return;n++;zapLine(P,o.m.position);heroHit_base(o,raw*.7,heroMt(),{proc:false,s:{col:0xfff06a}})});mult=1.3;break}
    case 'fire+poison':popT(P,'COMBUST!','#f97316',true);ring(P,0xff7a2a,3.2,380);burst(gY(P,.6),0xff8a3a,60,4,3,.7);shake(.3);sfx('boom');splash(3.2,.9,0xff7a2a);mult=1.6;break;
    case 'fire+shock':popT(P,'OVERLOAD!','#facc15');ring(P,0xfff06a,2.6,320);enemies.forEach(o=>{if(o.dead||d2(o.m.position,P)>2.8)return;const a=V().subVectors(o.m.position,P).setY(0).normalize();o.vx=a.x*9;o.vz=a.z*9});splash(2.8,.7,0xfff06a);mult=1.4;sfx('boom',.6);break;
    case 'frost+shock':e.wk=Math.max(e.wk||0,8);popT(P,'BRITTLE!','#a5f3fc');mult=1.25;break;
    case 'fire+water':e.stun=Math.max(e.stun||0,e.boss?.3:1);if(!e.boss)mCancel(e);popT(P,'STEAM!','#e2e8f0');burst(gY(P,1),0xffffff,30,1.5,2,.8);mult=1.2;break;
    case 'poison+water':popT(P,'SPREAD!','#a3e635');enemies.forEach(o=>{if(o.dead||o===e||d2(o.m.position,P)>5)return;eStatus(o,{poison:5},atkOf(heroMt())*1.2)});mult=1.2;break;
    default:e.el={k:el,t:t+5000};elRing(e,el);return 1;
  }
  return mult;
}
function zapLine(a,b){const g=new THREE.BufferGeometry().setFromPoints([gY(a,1),gY(b,1)]),l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xfff06a,transparent:true,opacity:1}));scene.add(l);tw(260,k=>l.material.opacity=1-k,()=>{scene.remove(l);g.dispose()})}
// weak points: big enemies carry a glowing spot on their back
const WEAKK={giant:1,tortoise:1,boghorror:1,sandwyrm:1,magmadrake:1,orc:1,hollowknight:1};
function addWeak(e){const s=new THREE.Mesh(new THREE.SphereGeometry(.16,12,8),new THREE.MeshBasicMaterial({color:0xffb020}));const hum=EN[e.c.en]&&EN[e.c.en].hum;s.position.set(0,hum?1.25:.85,hum?-.32:-.55);e.m.add(s);e.wp=s;
  const h=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8),new THREE.MeshBasicMaterial({color:0xff8a20,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));s.add(h)}
function behind(e){const ry=e.m.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry),dx=pl.position.x-e.m.position.x,dz=pl.position.z-e.m.position.z,L=Math.hypot(dx,dz)||1;return (fx*dx+fz*dz)/L<-.35}
// the hero's hits
let lastHitSnd=0;
function heroHit(e,raw,mt,o){
  if(!e||e.dead)return 0;o=o||{};const t=nowP();hAgro={e,t};const s=o.s||null;
  // weak point
  if((e.wp||e.boss)&&behind(e)){raw*=e.boss?1.5:2.4;if(t-(e.wpT||0)>500){e.wpT=t;popT(e.m.position,'WEAK POINT!','#fbbf24')}}
  // elements & shatter
  const el=s&&!s.noel?(s.el||ELC[s.col]):null;
  if(el)raw*=applyEl(e,el,raw,'h');
  else if(e.frz>0&&!s?.noel){raw*=1.7;e.frz=0;e.stun=0;popT(e.m.position,'SHATTER!','#e0f2fe');burst(gY(e.m.position,.8),0xe0f2fe,40,2.5,2,.5);sfx('brk',.7)}
  // perfect-dodge crit
  if(hero.pcrit&&t<hero.pcrit){o.crit=true;hero.pcrit=0}
  // class resource from basic attacks
  if(s&&s.basic&&t-(hero.rbT||0)>150){hero.rbT=t;const R=CRES[hero.cls];if(R)resGain(R.gain)}
  // team-up: both of you hitting the same enemy
  e.lhH=t;if(t-(e.lcH||0)<1200)teamGain(5);
  const wasWind=e.atk&&e.atk.ph==0&&!EBASIC[e.atk.n],h0=e.c.h;
  const d=heroHit_base(e,raw,mt,o);
  // hit sound
  if(t-lastHitSnd>40){lastHitSnd=t;const w=hero.cls=='mage'||(s&&s.mt=='m')?'zap':(s&&s.arrow)||hero.cls=='ranger'?'arrow':hero.cls=='paladin'?'blunt':hero.cls=='assassin'?'stab':'slash';sfx(w);if(o.crit||(d&&e.c.h<h0&&h0-e.c.h>M(e.c)*.2))sfx('crit')}
  // break: a heavy hit or any skill interrupts a special attack wind-up
  if(wasWind&&!e.dead&&!e.boss&&e.atk&&((s&&!s.basic)||(h0-e.c.h)>=M(e.c)*.06)){mCancel(e);e.stun=Math.max(e.stun||0,1.1);e.bu=0;popT(e.m.position,'BREAK!','#fde68a',true);burst(gY(e.m.position,1),0xffe08a,30,2.5,2,.5);ring(e.m.position,0xffe08a,1.8,300);hstop=.08;shake(.15);sfx('brk')}
  return d;
}
// companions apply their family's element too
function compHit(c,e,mult,fx){
  if(!e||e.dead)return 0;const t=nowP();e.lcH=t;if(t-(e.lhH||0)<1200)teamGain(5);
  const d=compHit_base(c,e,mult,fx);const el=(typeof runeEl=='function'&&runeEl(c))||FEL[famOf(c.g[0])];if(d>0&&typeof runeHit=='function')runeHit(c,d);
  if(el&&!e.dead&&d>0){const k=applyEl(e,el,d,'c');if(k>1&&!e.dead)hurt(e,Math.round(d*(k-1)),{col:ELI[el][1]},false)}
  return d;
}
function eStatus(e,fx,atk,src){const r=eStatus_base(e,fx,atk,src);if(e&&!e.dead){if(fx.burn&&!(e.el&&e.el.k=='fire'))applyEl(e,'fire',atk||10,'s');else if(fx.poison&&!(e.el&&e.el.k=='poison'))applyEl(e,'poison',atk||10,'s')}return r}
// damage taken by enemies: shields absorb, bodyguards protect
function hurt(e,d,s,crit,dot){
  if(!e||e.dead)return hurt_base(e,d,s,crit,dot);
  if(!dot&&!e.boss){const g=enemies.find(o=>o!==e&&!o.dead&&o.role=='guard'&&o.agg&&d2(o.m.position,e.m.position)<4.5);if(g){d=Math.max(1,Math.round(d*.7));if(nowP()-(e.gdT||0)>900){e.gdT=nowP();dn(e.m.position,'🛡 Guarded','#93c5fd',-34,700)}}}
  if(e.sh>0){const a=Math.min(e.sh,d);e.sh-=a;d-=a;dn(e.m.position,'('+Math.round(a)+')','#93c5fd',-14,600);if(e.sh<=0){e.sh=0;if(e.trait=='Shielded')e.trT=9;if(e.shM){e.shM.visible=false}popT(e.m.position,'SHIELD BROKEN','#bfdbfe');sfx('brk',.5)}
    if(d<=0){e.agg=1;e.m.flT=nowP();return}}
  return hurt_base(e,Math.max(1,Math.round(d)),s,crit,dot);
}

// =============== 4. CLASS RESOURCE ===============
const CRES={warrior:{n:'Rage',i:'💢',col:'#ef4444',gain:11,hurt:7},paladin:{n:'Faith',i:'✨',col:'#facc15',gain:10,hurt:5},assassin:{n:'Combo',i:'🗡️',col:'#a78bfa',gain:20,pips:5},ranger:{n:'Focus',i:'🎯',col:'#4ade80',gain:12},mage:{n:'Arcane',i:'🔮',col:'#60a5fa',gain:13}};
function resGain(v){hero.cr=Math.min(100,(hero.cr||0)+v);hero.crT=nowP();resUI()}
function cast(i){
  if(riding)dismount();
  const sk=heroSkills()[i],ok=sk&&party.length&&!hero.chan&&hero.lvl>=sk.lv&&!((hero.cd['s'+i]||0)>0)&&hero.mp>=sk.mp,R=CRES[hero.cls];
  let pw=0;if(ok&&R&&(hero.cr||0)>=50){pw=hero.cr;hero.buffs.push({n:R.n+' empowered',i:R.i,s:{skillP:.9*pw/100,aoeP:.45*pw/100},t:nowP()+1600});hsDirty();hero.cr=0;
    popT(pl.position,'EMPOWERED ×'+(1+.9*pw/100).toFixed(1),R.col,true);const c=parseInt(R.col.slice(1),16);burst(gY(pl.position,1),c,40,2.5,3,.6);ring(pl.position,c,2.6,320);sfx('power');resUI()}
  const cd0=hero.cd['s'+i]||0,r_=cast_base(i);if((hero.cd['s'+i]||0)>cd0&&typeof lpCast=='function')lpCast(heroSkills()[i]);return r_;
}
{const b=document.createElement('div');b.id='resb';b.innerHTML='<span class="ri"></span><div class="rbar"><i></i><b class="m50"></b></div><span class="rt"></span>';$('bmid').insertBefore(b,$('bmid').firstChild)}
function resUI(){const R=CRES[hero.cls],b=$('resb');if(!R||!b)return;const v=hero.cr||0;b.style.setProperty('--rc',R.col);b.querySelector('.ri').textContent=R.i;
  b.querySelector('i').style.width=v+'%';b.classList.toggle('rdy',v>=50);b.classList.toggle('full',v>=100);
  b.querySelector('.rt').textContent=R.pips?'●'.repeat(Math.floor(v/20))+'○'.repeat(5-Math.floor(v/20)):R.n+' '+Math.round(v);
  b.title=R.n+': fills from basic attacks'+(R.hurt?' and taking hits':'')+'. At 50+ your next skill is empowered (up to ×1.9 damage and bigger area at 100).'}

// =============== 6. TEAM-UP ===============
const TEAM={Beast:['Pack Ambush','🐾',0xff8a3a,{bleed:5}],Sky:['Thunder Dive','⚡',0xfff06a,null,'shock'],Dragon:['Dragonfire','🔥',0xff5a1a,{burn:5},'fire'],Earth:['Earthshatter','🪨',0xc8a070,{stun:1.6}],Spirit:['Soul Frost','❄️',0x9fe3ff,{slow:4},'frost'],Swarm:['Plague Swarm','🕸️',0x8ad84a,{poison:6},'poison']};
function teamGain(v){if(!party[0]||party[0].h<=0)return;hero.tm=Math.min(100,(hero.tm||0)+v);hero.tmT=nowP();if(hero.tm>=100&&!hero.tmRdy){hero.tmRdy=1;say('🤝 Team-up ready! Press X to unleash a joint attack with '+party[0].n+'.');sfx('chime')}}
{const d=document.createElement('div');d.id='tub';d.innerHTML='<span>🤝</span><div class="tbar"><i></i></div><button id="tubB" title="Team-up attack (X)">X</button>';$('act').after(d)}
$('tubB').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();teamUp()});
function teamUp(){
  const c=party[0],f=fols[0];if((hero.tm||0)<100)return say('Fight alongside your companion to fill the team-up meter (hit the same enemies).');
  if(!c||c.h<=0||c.emp||!f)return say('Your lead companion must be out and fighting.');
  let T=tgt&&!tgt.dead&&d2(tgt.m.position,pl.position)<14?tgt:null;if(!T){let bd=13;enemies.forEach(e=>{if(e.dead)return;const dd=d2(e.m.position,pl.position);if(dd<bd){bd=dd;T=e}})}
  if(!T)return say('No enemy close enough for a team-up attack.');
  const fam=famOf(c.g[0]),D=TEAM[fam]||TEAM.Beast,P=T.m.position.clone(),dm=(atkOf(heroMt())+cStat(c,xMt(c)=='m'?'ma':'pa'))*3.2;
  hero.tm=0;hero.tmRdy=0;f.position.set(P.x-1.2,0,P.z-1.2);burst(gY(f.position,.6),D[2],30,2,2,.5);
  popT(P,D[1]+' '+D[0].toUpperCase()+'!',('#'+D[2].toString(16).padStart(6,'0')),true);flash('rgba(255,255,255,.18)');
  setTimeout(()=>{ring(P,D[2],4.5,500);ring(P,D[2],2.5,350);burst(gY(P,.6),D[2],90,5,4,.9);shake(.45);hstop=.14;sfx('boom');
    enemies.slice().forEach(e=>{if(e.dead||d2(e.m.position,P)>4.5)return;heroHit_base(e,dm*(e===T?1.3:1),heroMt(),{proc:false,s:{col:D[2]}});if(!e.dead){if(D[3])eStatus(e,D[3],dm*.15,'h');if(D[4])applyEl(e,D[4],dm*.3,'t')}})},220);
  teamUI();
}
function teamUI(){const d=$('tub');if(!d)return;const v=hero.tm||0;d.querySelector('i').style.width=v+'%';d.classList.toggle('rdy',v>=100);d.classList.toggle('hide',!party.length)}
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey)return;const k=e.key.toLowerCase();if(k=='x'&&!building&&!uiOpen()&&document.activeElement.tagName!='INPUT')teamUp()});
{const mb=$('mbtn');if(mb){const b=document.createElement('button');b.dataset.m='team';b.title='Team-up';b.textContent='🤝';mb.appendChild(b);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();teamUp()})}}

// =============== 7/8/9. ENEMY ROLES, ELITE TRAITS, WEAK POINTS ===============
const ROLEK={shaman:'caster',cultist:'caster',wraith:'caster',orc:'guard',brigand:'guard',hollowknight:'guard',giant:'guard',tortoise:'guard',boghorror:'guard'};
const TRAITS=[['Vampiric','🩸','#f43f5e'],['Frenzied','💢','#fb923c'],['Shielded','🛡️','#93c5fd'],['Explosive','💥','#fbbf24'],['Blinking','🌀','#c084fc']];
function bubble(e){if(e.shM){e.shM.visible=true;return}const s=new THREE.Mesh(new THREE.SphereGeometry(.95,18,12),new THREE.MeshBasicMaterial({color:0x8ac8ff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));s.position.y=.7;e.m.add(s);e.shM=s}
function marker(e,col,y){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.13,0),new THREE.MeshBasicMaterial({color:col}));m.position.y=y||2.1;e.m.add(m);return m}
function spawnEnemy(key,x,z,l,o){
  const e=spawnEnemy_base(key,x,z,l,o);if(!e)return e;o=o||{};
  const role=ROLEK[key];if(role){e.role=role;if(role=='caster')e.rmk=marker(e,0x7ab8ff,EN[key].hum?2.2:1.6);else{const r=new THREE.Mesh(new THREE.RingGeometry(4.2/e.m.bs,4.5/e.m.bs,40),new THREE.MeshBasicMaterial({color:0x93c5fd,transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.06;r.visible=false;e.m.add(r);e.gR=r}}
  if(WEAKK[key])addWeak(e);
  if(o.al&&!o.minion)giveTrait(e);
  return e;
}
function giveTrait(e,k){const T=k?TRAITS.find(t=>t[0]==k):TRAITS[R(0,TRAITS.length-1)];e.trait=T[0];e.c.n=T[0]+' '+e.c.n;e.trT=T[0]=='Shielded'?9:0;if(T[0]=='Shielded'){e.sh=M(e.c)*.3;bubble(e)}}
function eTick(e,dt,now){
  if(dt>0&&!e.dead){
    if(e.el&&e.el.t<now){e.el=null;elRing(e,null)}
    e.frz=Math.max(0,(e.frz||0)-dt);
    if(e.gR)e.gR.visible=!!e.agg;
    if(e.trait&&e.agg){e.trT-=dt;
      if(e.trait=='Frenzied')e.cd-=dt*.7;
      else if(e.trait=='Shielded'&&e.trT<=0&&!(e.sh>0)){e.trT=9;e.sh=M(e.c)*.3;bubble(e);dn(e.m.position,'🛡 Shield','#93c5fd',-30,700)}
      else if(e.trait=='Blinking'&&e.trT<=0&&!e.atk&&d2(e.m.position,pl.position)>3.5){e.trT=7;const ry=pl.rotation.y,bx=pl.position.x-Math.sin(ry)*2,bz=pl.position.z-Math.cos(ry)*2;if(!solid(bx,bz)){burst(gY(e.m.position,.8),0xc084fc,24,2,2,.5);e.m.position.set(bx,0,bz);burst(gY(e.m.position,.8),0xc084fc,24,2,2,.5);sfx('zap',.6)}}}
    if(e.shM)e.shM.visible=e.sh>0;
    // casters shield their friends
    if(e.role=='caster'&&e.agg&&!e.atk){e.scT=(e.scT==null?R(2,4):e.scT)-dt;if(e.scT<=0){e.scT=7;let best=null,bh=2;enemies.forEach(o=>{if(o.dead||o===e||o.boss||d2(o.m.position,e.m.position)>9||o.sh>0)return;const hr=o.c.h/M(o.c);if(hr<bh){bh=hr;best=o}});
      if(best){best.sh=M(best.c)*.25;bubble(best);zapLine(e.m.position,best.m.position);burst(gY(e.m.position,1.6),0x7ab8ff,16,1,2,.5);dn(best.m.position,'🛡 Shielded','#93c5fd',-30,800)}}}
    // scouts run to raise the alarm
    if(e.scout&&e.agg&&!e.alarm){e.alarm={t:3.4};popT(e.m.position,'📯 SCOUT!','#fde047');say('📯 A scout is running to sound the alarm! Stop it before it reaches the horn.');sfx('chime')}
    if(e.alarm){e.alarm.t-=dt;const a=V().subVectors(e.m.position,pl.position).setY(0);if(a.lengthSq()<.01)a.set(1,0,0);a.normalize();walkM(e.m,a.x*3.6*dt,a.z*3.6*dt);e.m.rotation.y=Math.atan2(a.x,a.z);animC(e.m,now,true,3.6);
      if(e.alarm.t<=0){e.alarm=null;e.scout=0;if(e.smk)e.smk.visible=false;soundAlarm(e)}return true}
  }
  return eTick_base(e,dt,now);
}
function soundAlarm(e){
  sfx('horn');banner('📯 ALARM!','The '+(e.camp?e.camp.th.n:'camp')+' is roused','Reinforcements are coming');shake(.2);
  enemies.forEach(o=>{if(!o.dead&&d2(o.m.position,e.m.position)<24){o.agg=1;o.wt=0}});
  const C=e.camp;for(let i=0;i<2;i++){const a=Math.random()*6.283,x=e.m.position.x+Math.cos(a)*3,z=e.m.position.z+Math.sin(a)*3;if(solid(x,z))continue;const k=C?pickMem(C.th):e.c.en,b=BIOMES[MAP.bio[Math.round(z)][Math.round(x)]];const n=spawnEnemy(k,x,z,e.c.l,{zt:b.t,agg:1});n.agg=1;if(C)n.camp=C}
}
function makeScout(e){e.scout=1;e.smk=marker(e,0xfde047,EN[e.c.en]&&EN[e.c.en].hum?2.25:1.7);e.c.n='Scout '+e.c.n}

// =============== 10. KILL STREAKS + launch on kill + explosive elites ===============
let streak=0,streakT=0;
function kill(e){
  if(e.ar!=null)bossDefeated(e);bountyOnKill(e);if(typeof campOnKill=='function')campOnKill(e);if(typeof onKillX=='function')onKillX(e);
  const t=nowP();if(!e.minion||1){streak=t-streakT<5000?streak+1:1;streakT=t;
    if(streak>=2){const m=Math.min(1,.1*(streak-1));hero.buffs=hero.buffs.filter(b=>b.n!='Kill streak');hero.buffs.push({n:'Kill streak',i:'🔥',s:{xp:m,loot:m},t:t+5000});hsDirty()}
    strkUI(true)}
  if(!e.boss){const a=V().subVectors(e.m.position,pl.position).setY(0).normalize(),m=e.m,y0=m.position.y,big=e.c.h<-M(e.c)*.15||streak>=5;
    tw(460,k=>{m.position.x+=a.x*.09*(big?1.6:1);m.position.z+=a.z*.09*(big?1.6:1);m.position.y=y0+Math.sin(k*Math.PI)*(big?1.4:.8);m.rotation.x=-k*1.2})}
  if(e.trait=='Explosive'){const P=e.m.position.clone();popT(P,'💥 It’s going to blow!','#fbbf24');tele(P,3.2,1.25,()=>{burst(gY(P,.6),0xff8a3a,70,4.5,3,.8);ring(P,0xffb020,3.4,380);shake(.35);sfx('boom');if(d2(pl.position,P)<3.3)hitHero(e,2.2,'p');party.slice(0,2).forEach((c,i)=>{const f=fols[i];if(c&&c.h>0&&f&&d2(f.position,P)<3.3){c.h=Math.max(0,c.h-M(c)*.25)}})})}
  return kill_base(e);
}
function strkUI(bump){const d=$('strk');if(!d)return;const t=nowP(),left=5000-(t-streakT);if(streak<2||left<=0){d.classList.add('hide');if(left<=0)streak=0;return}
  d.classList.remove('hide');const m=1+Math.min(1,.1*(streak-1));d.innerHTML=`<b>🔥 ${streak}</b><span>STREAK</span><small>×${m.toFixed(1)} XP & loot</small><i style="width:${Math.max(0,left/50)}%"></i>`;if(bump){d.classList.remove('bump');void d.offsetWidth;d.classList.add('bump')}}

// =============== 11. CAMP RAIDS: clear a camp → its leader arrives → treasure chest ===============
const LEADN=['Grukk','Varra','Morn','Skarth','Ilsa','Thane','Vex','Brakka','Orlo','Zeth'];
function campRaid(C){
  C.raid=1;C.rT=nowP();C.kt=nowP()+1e9;
  setTimeout(()=>{if(d2(pl.position,V(C.x,0,C.z))>60){C.raid=0;C.kt=nowP();return}
    const lead=C.th.mem.slice().sort((a,b)=>(EN[b[0]].w.hp||1)-(EN[a[0]].w.hp||1))[0][0],b=BIOMES[MAP.bio[C.z][C.x]],l=Math.min(MAXLV,zoneLv(C.x,C.z)+3);
    banner('⚔ '+C.th.n.toUpperCase(),'The camp leader answers the call','Defeat the leader to claim the camp’s treasure');sfx('horn');
    const e=spawnEnemy(lead,C.x,C.z,l,{al:1,zt:b.t,agg:1});e.c.st.hp*=2.4;e.c.h=Math.round(e.c.st.hp);e.m.bs*=1.25;e.leader=C;e.camp=C;e.agg=1;giveTrait(e);e.c.n=LEADN[R(0,LEADN.length-1)]+', '+C.th.n.replace(/ (Camp|Hideout|Stockade|Den|Rocks|Roost|Shrine|Ring|Site|Pit|Warcamp|Nest|Graveyard|Fort|Barrows|Bog|Eyrie|Stones|Tomb|Pool|Lookout)$/,'')+' Leader';
    marker(e,0xffd700,EN[lead].hum?2.4:1.9);
    for(let i=0;i<2;i++){const a=i*Math.PI+.5,x=C.x+Math.cos(a)*2.5,z=C.z+Math.sin(a)*2.5;const n=spawnEnemy(pickMem(C.th),x,z,l-2,{zt:b.t,agg:1});n.agg=1;n.camp=C}
  },2200);
}
function campChest(C){
  const g=new THREE.Group(),y=GH(C.x,C.z);g.position.set(C.x,y,C.z);
  TQ(g,G_BOX,sm(0x6a4424),0,.32,0,1.1,.64,.72);TQ(g,G_BOX,sm(0x7a5230),0,.74,0,1.12,.22,.74);TQ(g,G_BOX,sm(0xd8a830,{metalness:.7,roughness:.3}),0,.4,.37,.18,.24,.04);
  [-.5,.5].forEach(x=>TQ(g,G_BOX,sm(0xc89a30,{metalness:.7,roughness:.3}),x,.45,0,.06,.9,.76));
  const gl=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,3.4,20,1,true),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));gl.position.y=1.7;g.add(gl);
  scene.add(g);C.chest={g,x:C.x,z:C.z+.0};say('💰 The leader has fallen! The camp treasure chest is yours. Press F to open it.');sfx('chime');
}
function campChestPrompt(){for(const C of CAMPS){if(C.chest&&Math.hypot(pl.position.x-C.chest.x,pl.position.z-C.chest.z)<2.2)return {label:'F · Open camp treasure',fn:()=>openCampChest(C)}}return null}
function openCampChest(C){
  const ch=C.chest;if(!ch)return;C.chest=null;const p=V(ch.x,0,ch.z+1),l=zoneLv(C.x,C.z),T=tierAt(C.x,C.z);
  tw(500,k=>{ch.g.scale.setScalar(1-k*.9);ch.g.position.y+=.02},()=>scene.remove(ch.g));burst(gY(p,.8),0xffd060,60,3,3,.8);sfx('chime');
  const g=Math.round((40+l*12)*(.9+Math.random()*.3));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1300);
  const it=genItem(l,{minR:Math.random()<.35?2:1,cls:hero.cls});drop('gear',it,p,it.r);
  drop('mat',{k:UPM[T-1][0],n:R(2,4)},p,T-1);
  if(Math.random()<.45){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}
  if(Math.random()<.5)drop('sup',{k:'s_'+pickSeed(T,Object.keys(CROPS)),n:R(1,3)},p,1);
  C.raid=0;C.kt=nowP();hud();
}

// ---------- per-frame bookkeeping (called from homeTick) ----------
function combatTick(dt,now){
  if((hero.cr||0)>0&&now-(hero.crT||0)>6000){hero.cr=Math.max(0,hero.cr-14*dt);resUI()}
  if((hero.tm||0)>0&&hero.tm<100&&now-(hero.tmT||0)>12000){hero.tm=Math.max(0,hero.tm-6*dt)}
  if(now-(combatTick.u||0)>120){combatTick.u=now;teamUI();strkUI(false);resUI()}
  CAMPS.forEach(C=>{if(C.raid&&now-C.rT>150000&&!enemies.some(e=>e.leader===C&&!e.dead)){C.raid=0;C.kt=now}});
}
// settings: sound toggle
{const st=$('s_sfx');if(st){st.checked=SET.sfx!==false;st.onchange=()=>{SET.sfx=st.checked;saveSet()}}}
// ================= v46: breakable camp boxes, Shadow Rush, level by distance from town =================
// ---------- breakable crates & barrels ----------
const BXMAT=[['wood','fiber','stone'],['iron','clay','wood'],['crystal','bone','clay'],['iron','crystal','bone'],['crystal','bone','iron']];
function brkBox(C,b){
  if(b.b)return;b.b=nowP();const p=V(b.x,0,b.z),T=tierAt(b.x,b.z),l=zoneLv(b.x,b.z);
  burst(gY(p,.5),0x8a5a30,26,2.6,2.4,.6);burst(gY(p,.4),0xc8a070,10,1.6,1.6,.5);sfx('blunt');sfx('slash',.5);
  b.g.matrixAutoUpdate=true;tw(260,k=>{b.g.scale.set(1+k*.4,1-k,1+k*.4);b.g.rotation.z=k*.4},()=>{b.g.visible=false;b.g.scale.set(1,1,1);b.g.rotation.z=0});
  const g=Math.max(1,Math.round((2+l*.8)*(.7+Math.random()*.6)));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1000);
  const mk=BXMAT[T-1][R(0,2)];if(RES[mk]||matInfo(mk))drop('mat',{k:mk,n:R(1,3)},p,0);
  const r=Math.random();if(r<.03){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}else if(r<.11)drop('potion',null,p,1);
  hud();
}
function brkNear(p,r,dir,half){
  CAMPS.forEach(C=>{if(!C.boxes||!C.g||!C.g.visible)return;if(Math.abs(C.x-p.x)>CAMP_R+r+2||Math.abs(C.z-p.z)>CAMP_R+r+2)return;
    C.boxes.forEach(b=>{if(b.b)return;const dx=b.x-p.x,dz=b.z-p.z,L=Math.hypot(dx,dz);if(L>r+.45)return;
      if(dir&&L>.4&&Math.acos(Math.max(-1,Math.min(1,(dx*dir.x+dz*dir.z)/L)))>half+.25)return;brkBox(C,b)})});
}
function area(p,r,dm,s,dir,half){const out=area_base(p,r,dm,s,dir,half);if(!(s&&s.cc))brkNear(p,r,dir,half);return out}
function brkShot(p){let hit=false;CAMPS.forEach(C=>{if(hit||!C.boxes||!C.g||!C.g.visible)return;C.boxes.forEach(b=>{if(hit||b.b)return;if(Math.hypot(b.x-p.x,b.z-p.z)<.7){brkBox(C,b);hit=true}})});return hit}
// boxes come back after a few minutes, once you're away from the camp
setInterval(()=>{const t=nowP();CAMPS.forEach(C=>{if(!C.boxes)return;C.boxes.forEach(b=>{if(b.b&&t-b.b>300000&&Math.hypot(b.x-pl.position.x,b.z-pl.position.z)>40){b.b=0;b.g.visible=true}})})},5000);
// ---------- Shadow Rush (assassin skill 1): a collision-safe dash that slices through everything in its path ----------
function shadowRush(dist,raw,mt,fx,sk){
  const hit=new Set();let first=true;const ms=dist/14*1000+40;
  tw(ms,()=>{const P=pl.position;burst(gY(P,.9),0x5a3a8a,4,.6,.8,.45);burst(gY(P,.5),0x1a1028,3,.4,.5,.6);
    enemies.forEach(e=>{if(e.dead||hit.has(e))return;if(d2(e.m.position,P)<1.35+(e.c.al?.3:0)+(e.boss?1.2:0)){hit.add(e);heroHit(e,raw,mt,{crit:first,s:fx});if(typeof lpHas=='function'&&lpHas('venom')&&!e.dead)eStatus(e,{poison:6},atkOf(mt)*.9,'h');first=false;burst(gY(e.m.position,1),sk.col,24,2,2,.5);hstop=.035}});
    brkNear(P,1.2)},
   ()=>{ring(pl.position,0x9a6ae0,1.6,260);if(hit.size>1)popT(pl.position,'×'+hit.size+' RUSH','#c4b5fd')});
}
// ---------- monster level grows with distance from the zone's entry town ----------
const ZDM=[1,1,1,1,1];
function zoneLv(x,y){
  const t=tierAt(x,y),lv=TIER_LV[t-1],T=TOWNS[t-1],near=TS+6,far=ZDM[t-1]*.82;
  const f=Math.max(0,Math.min(1,(Math.hypot(x-T.cx,y-T.cy)-near)/(far-near)));
  return Math.max(lv[0],Math.min(lv[1],Math.round(lv[0]+f*(lv[1]-lv[0])+(Math.random()<.5?0:R(-1,1)))));
}
var camDD=null;
const fntN=(x,z)=>TOWNS.some(t=>Math.abs(x-t.cx)<3.2&&Math.abs(z-t.cy)<3.2);
