# v212: Space dashes, Shift is each class's defence (warrior timed block + decaying shield stacks, paladin shield block for
# 1 stamina, assassin timed parry, mage mana ward, ranger pet taunt). Spells are not blocked / parried (the ward takes them).
# Every check prints FAIL … on a wrong result.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async()=>{const out={},F=[];window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 const key=(k,up)=>{document.body.dispatchEvent(new KeyboardEvent(up?'keyup':'keydown',{key:k,bubbles:true,cancelable:true}))};
 try{CHEAT.god=false}catch(_){}
 hero.lvl=30;const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];
 toPos(q[0],q[1]);STEP(30);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
 const P0=pl.position.clone();const e=spawnEnemy(BIOEN[p.n][0],P0.x+1.5,P0.z,30,{});e.c.h=e.c.st.hp=1e7;e.agg=1;e.stun=999;
 const R0=Math.random;Math.random=()=>.5;   // no random block / spread while measuring
 const hit=(mt)=>{hero.hp=heroMax();hero.iv=0;const h0=hero.hp;if(mt==='spell')hitHero(e,1,'m');else hitTarget(e,pl,1);return h0-hero.hp};
 const reset=()=>{GD212.hold=false;GD212.wsh=[];GD212.mana=false;GD212.last=-1e9;hero.sh=0;hero.dc=2;hero.iv=0};
 // ---- keys: Space dashes, Shift does not ----
 {const A=KB161.A.map(a=>a[0]+':'+a[2]);if(!A.includes('dash: ')||!A.includes('guard:shift'))F.push('key map: '+A.filter(a=>/^(dash|guard)/.test(a)).join(' '));
  reset();hero.cdD=0;const d0=hero.dc;key(' ');out.spaceDash=d0-hero.dc;if(!(hero.dc<d0))F.push('Space did not dash');STEP(30);hero.dc=2;hero.cdD=0;
  hero.cls='warrior';const d1=hero.dc;key('Shift');if(hero.dc<d1)F.push('Shift still dashes');if(!GD212.hold)F.push('Shift did not raise the warrior guard');key('Shift',1);if(GD212.hold)F.push('releasing Shift kept the guard up');STEP(20)}
 // ---- baseline ----
 hero.cls='warrior';reset();const base=hit();out.base=base;if(!(base>3))F.push('baseline hit too small to measure: '+base);
 const near=(a,b,t)=>Math.abs(a-b)<=Math.max(2,b*(t||.08));
 // ---- warrior ----
 {reset();gd212Down();const d=hit();const w=gd212WshSum(nowP());out.war={d,w:Math.round(w)};
  if(!near(d,base*.5,.15))F.push('warrior timed block took '+d+' (want ~'+Math.round(base*.5)+')');
  if(!near(w,base*.5,.2))F.push('warrior block shield '+Math.round(w)+' (want ~'+Math.round(base*.5)+')');
  // the shield takes the next hit first
  gd212Up();GD212.last=-1e9;gd212Down();GD212.t0=nowP()-1000;const d2=hit();out.war.d2=d2;gd212Up();const w2=gd212WshSum(nowP());if(!(w2<w))F.push('the block shield did not absorb the next hit');
  // stacking
  gd212Up();GD212.last=-1e9;GD212.wsh=[];gd212Down();hit();GD212.last=-1e9;gd212Up();gd212Down();hit();out.war.stacks=GD212.wsh.length;if(GD212.wsh.length<2)F.push('warrior shields did not stack');
  // decay over 5 s
  GD212.wsh=[{a0:100,t0:nowP()}];VT+=2500;const half=gd212WshSum(nowP());VT+=2600;const gone=gd212WshSum(nowP());out.war.decay=[Math.round(half),Math.round(gone)];
  if(!(half>40&&half<60)||gone>0)F.push('warrior shield decay wrong: '+half+' then '+gone);
  // late: the window is past
  reset();gd212Down();GD212.t0=nowP()-1000;const late=hit();out.war.late=late;if(!near(late,base))F.push('a late warrior guard still blocked: '+late);
  reset();gd212Down();const sp=hit('spell');out.war.spell=sp;if(sp<=0)F.push('the warrior blocked a spell');gd212Up()}
 // ---- paladin ----
 {hero.cls='paladin';reset();gd212Down();GD212.t0=nowP()-5000;const d=hit();out.pal={d,dc:hero.dc};if(d!==0)F.push('paladin shield let '+d+' through');if(Math.abs(hero.dc-1)>.01)F.push('paladin block cost '+(2-hero.dc)+' stamina');
  hero.dc=0;const d2=hit();out.pal.empty=d2;if(!near(d2,base))F.push('paladin with no stamina still blocked: '+d2);
  hero.dc=2;const sp=hit('spell');out.pal.spell=sp;if(sp<=0)F.push('the paladin blocked a spell');if(hero.dc<2)F.push('a spell cost the paladin stamina');gd212Up();
  reset();const off=hit();if(!near(off,base))F.push('paladin blocked with the guard down: '+off)}
 // ---- assassin ----
 {hero.cls='assassin';reset();gd212Down();const d=hit();out.asn={d};if(d!==0)F.push('assassin timed parry let '+d+' through');gd212Up();
  reset();gd212Down();GD212.t0=nowP()-600;const late=hit();out.asn.late=late;if(!near(late,base))F.push('a late parry still worked: '+late);gd212Up();
  reset();gd212Down();const sp=hit('spell');out.asn.spell=sp;if(sp<=0)F.push('the assassin parried a spell');gd212Up();
  // mashing does not reopen the window
  reset();gd212Down();gd212Up();GD212.t0=nowP()-900;GD212.last=nowP();gd212Down();const mash=hit();out.asn.mash=mash;if(mash===0)F.push('mashing Shift reopened the parry window');gd212Up()}
 // ---- mage ----
 {hero.cls='mage';reset();hero.mp=5000;gd212Down();out.mage={on:GD212.mana};if(!GD212.mana)F.push('Shift did not raise the mana ward');
  const m0=hero.mp,d=hit(),dm=m0-hero.mp;out.mage.d=d;out.mage.mana=Math.round(dm);if(d!==0)F.push('the mana ward let '+d+' health through');if(!near(dm,base*GD212.mr,.15))F.push('the ward drained '+dm+' mana (want ~'+base+')');
  hero.mp=5000;const m1=hero.mp,sp=hit('spell');out.mage.spell=[sp,Math.round(m1-hero.mp)];if(sp!==0||!(m1-hero.mp>0))F.push('the ward did not take a spell');
  hero.mp=3;hero.hp=heroMax();hit();out.mage.dry=GD212.mana;if(GD212.mana)F.push('the ward stayed up with no mana');
  hero.mp=5000;gd212Down();if(!GD212.mana)F.push('the ward did not come back up');gd212Down();if(GD212.mana)F.push('a second Shift did not drop the ward');reset();const off=hit();if(!near(off,base))F.push('ward down but damage still drained mana')}
 // ---- ranger ----
 {hero.cls='ranger';reset();party.length=0;party.push(mkC('Foxlet',25));if(typeof syncFols=='function')syncFols();STEP(5);const f0=fols[0];f0.position.set(P0.x-2,P0.y,P0.z);f0.visible=true;
  e.tz212=null;e.stun=0;e.agg=1;const m=e.m,dpl=()=>m.position.distanceTo(pl.position);e.tgI=null;const t0=eTarget(e,m,dpl());out.rng={before:t0===pl?'hero':'comp'};
  GD212.cdT=0;gd212Down();const t1=eTarget(e,m,dpl());out.rng.after=t1===f0?'comp':t1===pl?'hero':'other';if(t1!==f0)F.push('the taunt did not pull the monster onto the companion ('+out.rng.after+')');
  out.rng.cd=Math.round((GD212.cdT-nowP())/1000);if(!(out.rng.cd>=GD212.tCd-1))F.push('no taunt cooldown: '+out.rng.cd);
  VT+=3200;const t2=eTarget(e,m,dpl());out.rng.later=t2===pl?'hero':'comp';
  const n0=GD212.cdT;gd212Down();if(GD212.cdT!==n0)F.push('the taunt fired again during its cooldown')}
 Math.random=R0;
 // ---- the hotbar slot ----
 {hero.cls='warrior';hud();const b=document.querySelector('#acts [data-x="g"]'),d=document.querySelector('#acts [data-x="d"] .kb');out.slot=!!b;out.dashKey=d&&d.textContent;
  if(!b)F.push('no class defence slot on the hotbar');if(!d||!/Space/.test(d.textContent))F.push('the dash slot does not say Space: '+(d&&d.textContent))}
 out.F=F;return out}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=pg.evaluate(JS);print(json.dumps(r))
    if r.get('err'):F('error '+r['err'])
    for m in r['F']:F(m)
play.run(s)
print('v212 guard: checked' if not fails else 'CHECKS FAILED')
