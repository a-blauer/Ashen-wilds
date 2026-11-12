# v225 owner's list: the Inn bench is gone, the shop view keeps the keeper at the side on a computer screen (and swaps live),
# the Paladin holds his shield up in front, Cheats → Teleport reaches field instances, Dens and quest places, the companion food
# pouch takes basic foods, mana costs follow the level and regeneration is the same for every class, and the new hero looks:
# saved, sent to co-op partners, painted only on fur (positions and armour untouched), head size / tail length on the bones.
# Every check prints FAIL … on a wrong result.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async()=>{const out={},F=[];window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));const V=THREE.Vector3;
 try{CHEAT.god=true}catch(_){}
 // ---- 1 · the Inn's fireside bench ----
 {const b=DM196I.seats.filter(s=>s.k=='bench').length;out.benchSeats=b;if(b)F.push('the Inn still lists '+b+' fireside bench seats');
  const [x,z]=lotW103(DM196I.l,3.8,-3.6),near=DM196I.col.filter(c=>Math.hypot(c.x-x,c.z-z)<.5).length;out.benchCol=near;if(near)F.push('a collider still stands where the bench was')}
 // ---- 2 · the shop view on a computer screen ----
 try{const P=CHQ148.P&&CHQ148.P.ch&&CHQ148.P.ch.root;if(!P)F.push('no Cheddar at his board');else{const p=P.getWorldPosition(new V());toPos(p.x+1.6,p.z+1.6);STEP(5);
    openX('chq132');IM220.on=null;im220Tick();const x=$('xw');out.shop={side:x.classList.contains('sk220'),top:x.classList.contains('sk220v'),w:$('stage').clientWidth,h:$('stage').clientHeight};
    if(!out.shop.side||out.shop.top)F.push('Cheddar\'s board on a '+out.shop.w+'x'+out.shop.h+' stage used the phone layout');
    const st=$('stage'),w0=st.style.width;st.style.width='420px';im220Tick();out.shop.narrow=x.classList.contains('sk220v');if(!out.shop.narrow)F.push('a narrow stage did not swap to the keeper-above layout');
    st.style.width=w0;im220Tick();out.shop.back=x.classList.contains('sk220');if(!out.shop.back)F.push('widening the stage again did not swap back');closeX();im220Tick()}}
 catch(e){F.push('shop view: '+e.message)}
 // ---- 3 · teleport ----
 try{const o=tp225Opts();['town','sabeksi','sascent','ssandrun','ssanctum','schannel','qlair144','qmaw151'].forEach(v=>{if(o.indexOf('value="'+v+'"')<0)F.push('teleport list has no '+v)});
  const N=PMAP[2].ins[1];tp225Go('i'+N.g);await wait(800);STEP(2);out.tp1=curIns()&&curIns().g;if(out.tp1!==N.g)F.push('teleport to '+N.n+' landed in '+out.tp1);
  const D=PMAP[4].ins[3];tp225Go('i'+D.g);await wait(800);STEP(2);out.tp2=curIns()&&curIns().g;if(out.tp2!==D.g)F.push('teleport to the Dirge Den landed in '+out.tp2);
  tp225Go('sabeksi');await wait(900);STEP(2);out.tp3=curIns()&&curIns().sp;if(out.tp3!=='abeksi')F.push('teleport into Abeksi landed in '+out.tp3);
  tp225Go('town');await wait(900);STEP(2);{const T=TOWNS[0],d=Math.hypot(pl.position.x-T.cx,pl.position.z-T.cy);out.tp4=Math.round(d);if(d>150)F.push('teleport home did not reach Duskhold ('+Math.round(d)+' m away)')}}
 catch(e){F.push('teleport: '+e.message)}
 // ---- 4 · basic foods in the companion food pouch ----
 try{const c=party[0];c.cf200=[];if(SUP.meat)sup.meat=5;else mats.meat=5;if(SUP.berries)sup.berries=4;else mats.berries=4;
  cf200Put(c,'meat',3);out.pouch=JSON.stringify(c.cf200);if(!(c.cf200[0]&&c.cf200[0].k=='meat'&&c.cf200[0].n==3))F.push('meat did not go in the pouch: '+out.pouch);if(cnt('meat')!==2)F.push('meat not taken from the bag: '+cnt('meat'));
  cf200Put(c,'berries',2);if(cnt('berries')!==2)F.push('berries not taken from the bag: '+cnt('berries'));
  const mx=M(c);c.h=1;c._cf200=0;cf200Eat(c,0);out.ate=Math.round(c.h-1);if(!(c.h>1))F.push('the companion did not eat a basic food');
  CF206.open=true;const h=cf200Html(c);if(h.indexOf('basic food')<0&&!/🍖|🫐/.test(h))F.push('the pouch list shows no basic food');CF206.open=false;
  const m0=cnt('meat'),left=(c.cf200.find(s=>s.k=='meat')||{n:0}).n;cf200Take(c,'meat');if(cnt('meat')!==m0+left)F.push('taking meat out did not give it back');
  // an old pouch with companion food still works
  c.cf200=[{k:'cf_jerky',n:2}];cf200P(c);if(!c.cf200.length)F.push('companion food dropped from the pouch')}
 catch(e){F.push('pouch: '+e.message)}
 // ---- 5 · mana ----
 try{out.mana=v225Mana();const M=out.mana;
  // sustain: the share of casting the six costliest abilities on cooldown that regeneration pays for (.15 at level 1 → .30 at 50)
  for(const c in M){const r=M[c];if(r.l50.sustain<.24||r.l50.sustain>.38)F.push(c+' level 50 sustain '+r.l50.sustain+' (casting every ability on cooldown)');
    if(r.l10.sustain<.12||r.l10.sustain>.26)F.push(c+' level 10 sustain '+r.l10.sustain);
    if(r.l50.geared>.6)F.push(c+' with mana gear sustains '+r.l50.geared+' at level 50 (endless mana)');
    if(Math.abs(r.l50.regenPct-1.6)>.25)F.push(c+' regenerates '+r.l50.regenPct+'% of max mana per second');}
  for(const L of ['l10','l50']){const S=Object.values(M).map(r=>r[L].sustain),spread=Math.max(...S)-Math.min(...S);if(spread>.06)F.push('classes differ in mana sustain at '+L+': '+S.join(' '))}
  // the cost a hero pays follows the multiplier, and a miss refunds exactly what was paid
  {const sk=heroSkills()[0];if(sk&&sk.__mp225!=null){const m=mana225Mul(hero.cls,hero.lvl);if(sk.mp!==Math.max(1,Math.round(sk.__mp225*m)))F.push('the cost getter disagrees: '+sk.mp)}}}
 catch(e){F.push('mana: '+e.message)}
 // ---- 6 · hero looks ----
 try{const L0={pat:3,pc:'#ece4d4',bel:1,fp:2,fpc:'#a8261c',scar:1,hs:1.08,tl:1.2,height:1.1};
  const c=lkClean(L0);['pat','pc','bel','fp','fpc','scar','hs','tl'].forEach(k=>{if(c[k]!==L0[k])F.push('lkClean lost '+k+': '+c[k])});
  if(lkClean({pat:99,pc:'red',hs:5}).pat!=null)F.push('lkClean kept a bad pattern');if(lkClean({hs:5}).hs!==LK225.hs[1])F.push('head size not clamped');
  const n1=mdLookN(L0,'warrior');if(Math.abs(n1.height-1.1)>1e-6)F.push('height clamped to '+n1.height);
  if(mdLookKey(mdLookN({},'warrior'))===mdLookKey(n1))F.push('the paint is not in the geometry key');
  // build with and without paint: same positions, same metal / glow, cloth colours differ only where fur is
  const E={};['helm','chest','boots'].forEach(sl=>{const i=ITPL.findIndex(t=>t.sl==sl&&t.arm=='heavy'&&(t.t|0)==3);if(i>=0)E[sl]={id:-1,tp:i,lv:20,req:1,r:2,up:0,aff:[]}});
  const G=(L,cls)=>{const B=mdHeroB(cls,mdLookN(L,cls),E);return B.L};
  for(const cls of ['warrior','assassin','mage','paladin','ranger']){const A=G({},cls),B=G({pat:9,fp:3,scar:2,pc:'#f8f6f0'},cls);
    const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
    if(!same(A.c.p,B.c.p))F.push(cls+': painting moved vertices');if(!same(A.m.c,B.m.c)||!same(A.m.p,B.m.p))F.push(cls+': painting changed metal');
    let d=0;for(let i=0;i<A.c.c.length;i++)if(Math.abs(A.c.c[i]-B.c.c[i])>1e-6)d++;(out.paint=out.paint||{})[cls]=d;if(!d)F.push(cls+': the paint changed nothing')}
  // bones: head size and tail length on the player's model, put back when cleared
  hero.cls='ranger';hero.look=lkClean({hs:1.1,tl:1.25});heroRebuild();STEP(2);const h=pl.bones.head.scale.x;out.hs=+h.toFixed(3);if(Math.abs(h-1.1)>1e-3)F.push('head bone scale '+h);
  const D=BRD[pl._race],t1=D&&D.TB&&pl.bones[D.TB[1]];if(t1){const p1=t1.position.length();hero.look=lkClean({});heroRebuild();STEP(2);const p0=t1.position.length();out.tl=+(p1/p0).toFixed(3);if(Math.abs(p1/p0-1.25)>.01)F.push('tail stretch '+(p1/p0));
    if(Math.abs(pl.bones.head.scale.x-1)>1e-6)F.push('head scale stayed after clearing')}
  // co-op array and saves
  hero.look=lkClean(L0);heroRebuild();const a=mpLookOut();out.lookArr=a.length;if(a.length<18)F.push('look array too short: '+a.length);
  const back=mpLookIn(a);['pat','bel','fp','scar'].forEach(k=>{if(back[k]!==L0[k])F.push('co-op look lost '+k)});if(Math.abs(back.hs-1.08)>.011||Math.abs(back.tl-1.2)>.011)F.push('co-op look lost head / tail');
  if(back.pc!==L0.pc||back.fpc!==L0.fpc)F.push('co-op look lost colours '+back.pc+' '+back.fpc);
  const old=mpLookIn(a.slice(0,10));if(!old||old.pat)F.push('an older partner\'s look array broke');
  const s=gameSnapshot();if(!s.hero.look||s.hero.look.pat!==3||s.hero.look.tl!==1.2)F.push('the save lost the new look: '+JSON.stringify(s.hero.look));
  // the editors render the new controls
  const ct=lkCtl(lkFull('ranger',L0));['data-lk="ns"','data-lk="cl"','data-lk="pat"','data-lk="bel"','data-lk="tl"','data-lk="hs"','data-lk="fp"','data-lk="scar"','data-lk="pc"','data-lk="fpc"'].forEach(k=>{if((ct.body+ct.head).indexOf(k)<0)F.push('editor misses '+k)});
  out.furN=BRD[5].fur.length;if(BRD[5].fur.length<12)F.push('only '+BRD[5].fur.length+' fur colours')}
 catch(e){F.push('look: '+e.message+' '+String(e.stack).slice(0,200))}
 // ---- 7 · the paladin holds the shield up in front ----
 try{hero.cls='paladin';hero.look=null;heroRebuild();refreshGear(pl,'paladin',eq);{const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1],0)}STEP(20);
  enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});gd213Down();STEP(40);const sh=pl.gearG[pl.gearG.length-1],P=pl.position,a=pl.rotation.y,fw=new V(Math.sin(a),0,Math.cos(a)),rt=new V(Math.cos(a),0,-Math.sin(a));
  const Q=sh.getWorldQuaternion(new THREE.Quaternion()),c=sh.getWorldPosition(new V()).sub(P),n=new V(0,0,-1).applyQuaternion(Q),u=new V(0,1,0).applyQuaternion(Q);
  out.shield={fwd:+c.dot(fw).toFixed(2),side:+c.dot(rt).toFixed(2),up:+c.y.toFixed(2),face:+n.dot(fw).toFixed(2),upright:+u.y.toFixed(2)};const S=out.shield;
  if(S.fwd<.3)F.push('shield not in front ('+S.fwd+')');if(Math.abs(S.side)>.15)F.push('shield off to the side ('+S.side+')');if(Math.abs(S.face)<.85)F.push('shield face not turned forward ('+S.face+')');if(S.upright<.8)F.push('shield not upright ('+S.upright+')');
  gd213Up();STEP(20)}
 catch(e){F.push('paladin: '+e.message)}
 out.F=F;return out}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=pg.evaluate(JS);print(json.dumps(r))
    if r.get('err'):F('error '+r['err'])
    for m in r['F']:F(m)
play.run(s)
print('v225 checks: ok' if not fails else 'CHECKS FAILED')
