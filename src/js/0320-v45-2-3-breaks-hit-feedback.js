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
  e.lhH=t;
  const wasWind=e.atk&&e.atk.ph==0,h0=e.c.h;
  const d=heroHit_base(e,raw,mt,o);
  // hit sound
  if(t-lastHitSnd>40){lastHitSnd=t;const w=hero.cls=='mage'||(s&&s.mt=='m')?'zap':(s&&s.arrow)||hero.cls=='ranger'?'arrow':hero.cls=='paladin'?'blunt':hero.cls=='assassin'?'stab':'slash';sfx(w);if(o.crit||(d&&e.c.h<h0&&h0-e.c.h>M(e.c)*.2))sfx('crit')}
  // break: a heavy hit or any skill interrupts a special attack wind-up
  if(wasWind&&!e.dead&&!e.boss&&e.atk&&cbBreakChk(e)){mCancel(e);e.stun=Math.max(e.stun||0,1.1);e.bu=0;popT(e.m.position,'BREAK!','#fde68a',true);burst(gY(e.m.position,1),0xffe08a,30,2.5,2,.5);ring(e.m.position,0xffe08a,1.8,300);hstop=.08;shake(.15);sfx('brk')}
  return d;
}
// companions apply their family's element too
function compHit(c,e,mult,fx){
  if(!e||e.dead)return 0;const t=nowP();e.lcH=t;
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

