# v206 owner's list (Nov 7 2026): E engage / R retreat (empower removed), threat on companions (tanks extra), fishing only at
# real water, the food pouch's Add food button, the menu over the quest trackers, the floating lantern 40% brighter.
# Every check prints FAIL … on a wrong result. Pictures: test/out/v206_pouch.png, v206_menu.png.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async()=>{const out={},F=[];window._rr=ren.render;window._pr=POST.render;window.VT=performance.now();window._pn=performance.now;performance.now=()=>VT;window._raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 const key=k=>{const e=new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true});window.dispatchEvent(e)};
 hero.lvl=30;const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];
 const setup=(sp,d)=>{party.length=0;party.push(mkC(sp,25));if(typeof syncFols=='function')syncFols();STEP(5);toPos(q[0],q[1]);STEP(30);
  enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const P0=pl.position.clone(),f0=fols[0];f0.position.set(P0.x+(d||2),P0.y,P0.z);
  const e=spawnEnemy(BIOEN[p.n][0],P0.x+5,P0.z,25,{});e.c.h=e.c.st.hp=1e7;e.agg=1;e.stun=999;return {e,f0}};
 // ---- keys ----
 {const A=KB161.A.map(a=>a[0]+':'+a[2]);out.keys=A.filter(a=>/^(cmd|ret|emp)/.test(a));
  if(!A.includes('cmd:e')||!A.includes('ret:r')||A.some(a=>/^emp/.test(a)))F.push('key map: '+out.keys.join(' '));
  const {e,f0}=setup('Foxlet');tgt=e;CMD={e:null,t:0};key(' ');if(CMD.e)F.push('Space still commands the companions');
  key('e');if(CMD.e!==e)F.push('E did not send the companion at the target');
  key('r');if(CMD.e)F.push('R did not cancel the engage');if(!ret206On())F.push('R did not start a retreat');if(teamFoe()!==null)F.push('retreating companions still have a foe');
  f0.position.set(e.m.position.x-1,0,e.m.position.z);STEP(90);out.retDist=+d2(f0.position,pl.position).toFixed(2);if(out.retDist>4)F.push('the companion did not run back to the hero ('+out.retDist+')');
  key('e');if(ret206On())F.push('E did not end the retreat');
  // empower gone
  const c=party[0];toggleEmp(0);if(c.emp)F.push('toggleEmp still empowers');c.emp=true;compRegen(.1,nowP());if(c.emp)F.push('a leftover empower was not cleared');
  cbarSig='';cbarsRender();const b=document.querySelector('#cbars button[data-e]');if(b&&getComputedStyle(b).display!=='none')F.push('the ⚡ button still shows');
  }

 // ---- threat ----
 for(const sp of ['Foxlet','Stoneshell']){const {e,f0}=setup(sp,-3);RET206.t=0;CMD={e:null,t:0};e.th206=null;const m=e.m,dpl=()=>m.position.distanceTo(pl.position);
  const o=out['th_'+sp]={};hurt(e,500);o.a=eTarget(e,m,dpl())===pl?'hero':'comp';if(o.a!=='hero')F.push(sp+': the hero did the damage but the monster went for the companion');
  let n=0;while(e.th206.c[0]<=e.th206.h*1.3&&n<400){compHit(party[0],e,1);n++}o.hits=n;o.T=[Math.round(e.th206.h),Math.round(e.th206.c[0])];
  o.b=eTarget(e,m,dpl())===f0?'comp':'hero';if(o.b!=='comp')F.push(sp+': the companion out-damaged the hero but the monster stayed on the hero');
  hurt(e,e.th206.c[0]*2);o.c=eTarget(e,m,dpl())===pl?'hero':'comp';if(o.c!=='hero')F.push(sp+': the hero took the threat back but the monster stayed on the companion');
  // tank: the same hit counts more
  e.th206=null;const h0=e.c.h;compHit(party[0],e,1);const got=h0-e.c.h;o.k=+(e.th206.c[0]/Math.max(1,got)).toFixed(2)}
 if(!(out.th_Stoneshell.k>1.5&&Math.abs(out.th_Foxlet.k-1)<.05))F.push('tank threat multiplier wrong: '+out.th_Foxlet.k+' / '+out.th_Stoneshell.k);
 {const {e,f0}=setup('Stoneshell',2);f0.position.set(e.m.position.x-1.5,0,e.m.position.z);e.th206=null;th206Of(e);await new Promise(r=>setTimeout(r,1300));out.pres=+(((e.th206&&e.th206.c[0])||0)/M(e.c)).toFixed(4);
  if(!(out.pres>.01))F.push('a tank next to a monster builds no threat ('+out.pres+')')}
 // ---- fishing ----
 {const wet=(x,y)=>MAP[y]&&MAP[y][x]=='~'&&!BIOMES[MAP.bio[y][x]].lava;let dry=null,good=null;
  for(let y=3;y<H-3&&!(dry&&good);y+=1)for(let x=3;x<W-3;x+=1){if(!insAt(x,y))continue;
   if(!dry&&wet(x,y)&&.02-GHv(x,y)<-.05){let any=false;for(let j=-3;j<=3&&!any;j++)for(let i=-3;i<=3;i++)if(fp206Ok(x+i,y+j)){any=true;break}if(!any)dry=[x,y]}
   if(!good&&!wet(x,y)&&!solid(x,y)){for(let j=-1;j<=1&&!good;j++)for(let i=-1;i<=1;i++)if(fp206Ok(x+i,y+j)){good=[x,y];break}}
   if(dry&&good)break}
  out.fish={dry,good};party.length=0;if(typeof syncFols=='function')syncFols();
  if(dry){toPos(dry[0],dry[1]);out.fish.dryRes=nearWater();if(out.fish.dryRes)F.push('fishing offered where no water shows '+dry)}else F.push('test: no dry water tile found');
  if(good){toPos(good[0],good[1]);out.fish.goodRes=nearWater();if(!out.fish.goodRes)F.push('no fishing beside a real pond '+good)}else F.push('test: no pond found')}
 // ---- lantern (Kindlelight is dark: the hero's floating lantern is out) ----
 {const q0=PMAP[0].path[Math.floor(PMAP[0].path.length/3)];toPos(q0[0],q0[1]);STEP(120)}
 {const r0=Math.random;Math.random=()=>.5;try{FLAN.root.visible=true;const k0=FLAN206.k;FLAN206.k=1;const z=Object.assign({},ZA);atmos(.016,VT);const i1=torch.intensity;Object.assign(ZA,z);FLAN206.k=k0;atmos(.016,VT);const i2=torch.intensity;
   out.lamp=+(i2/i1).toFixed(3);if(FLAN.root.visible&&Math.abs(out.lamp-1.4)>.02)F.push('lantern light ×'+out.lamp+' (want ×1.4)');if(!FLAN.root.visible)out.lampNote='no lantern here'}finally{Math.random=r0}}
 performance.now=window._pn;window.requestAnimationFrame=window._raf;ren.render=window._rr;POST.render=window._pr;requestAnimationFrame(loop);
 out.F=F;return out}"""
JS_UI=r"""async()=>{const F=[],S=ms=>new Promise(r=>setTimeout(r,ms));
 // the pouch
 party.length||party.push(mkC('Foxlet',5));sup.cf_jerky=4;sup.cf_broth=12;const c=party[0];c.cf200=[];
 document.getElementById('cmpBtn').click();await S(600);cmpSel=0;rC();await S(200);
 let b=document.querySelector('#cd [data-cf206]');if(!b)F.push('no Add food button in the pouch');else{b.click();await S(200)}
 const rows=[...document.querySelectorAll('#cd .cf206r')].map(r=>r.textContent.replace(/\s+/g,' ').trim());if(rows.length!==2)F.push('the food list shows '+rows.length+' foods (want 2)');
 let p=document.querySelector('#cd .cf206r button[data-cf200p="cf_jerky"][data-n="5"]');if(p){p.click();await S(200)}else F.push('no +5 for Jerky');
 const s=(c.cf200||[]).find(q=>q.k=='cf_jerky');if(!s||s.n!==4||sup.cf_jerky!==0)F.push('+5 did not move the 4 jerky into the pouch: '+JSON.stringify(c.cf200)+' bag '+sup.cf_jerky);
 p=document.querySelector('#cd .cf206r button[data-cf200p="cf_broth"][data-n="10"]');if(p){p.click();await S(200)}const s2=(c.cf200||[]).find(q=>q.k=='cf_broth');if(!s2||s2.n!==10||sup.cf_broth!==2)F.push('All did not fill a stack of broth: '+JSON.stringify(c.cf200));
 const box=document.querySelector('#cd .cf200');if(box)box.scrollIntoView({block:'center'});
 return {F,rows}}"""
JS_MENU=r"""async()=>{const F=[],S=ms=>new Promise(r=>setTimeout(r,ms));try{closeAll&&closeAll()}catch(_){}document.querySelectorAll('.win:not(.hide),#xw:not(.hide)').forEach(w=>w.classList.add('hide'));
 const t=document.getElementById('chqt132');t.classList.remove('hide');t.innerHTML='<div class="h">Cheddar\'s quests</div><div class="q"><b>Smoke Them Out</b><div class="o">Camp cleared 0/1</div></div><div class="q"><b>Timber for the Burrows</b><div class="o">Wood 3/15</div></div>';
 CHQ132.t=1e15;await S(300);
 document.getElementById('sysBtn').click();await S(700);const on=document.body.classList.contains('sm206'),v=getComputedStyle(t).visibility,z=getComputedStyle(document.getElementById('sysmenu')).zIndex;
 if(!on||v!=='hidden')F.push('menu open but the quest list still shows ('+on+', '+v+')');
 return {F,on,v,z}}"""
JS_MENU2=r"""async()=>{const F=[],S=ms=>new Promise(r=>setTimeout(r,ms));document.getElementById('sysmenu').classList.add('hide');await S(700);const t=document.getElementById('chqt132');
 if(document.body.classList.contains('sm206')||getComputedStyle(t).visibility!=='visible')F.push('menu closed but the quest list stays hidden');return {F}}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1500000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=pg.evaluate(JS);print(json.dumps(r))
    if r.get('err'):F('error '+r['err'])
    for m in r['F']:F(m)
    pg.wait_for_timeout(1500)
    u=pg.evaluate(JS_UI);print(json.dumps(u))
    for m in u['F']:F(m)
    pg.screenshot(path=play.TMP+'/v206_pouch.png',timeout=600000)
    m=pg.evaluate(JS_MENU);print(json.dumps(m))
    for x in m['F']:F(x)
    pg.screenshot(path=play.TMP+'/v206_menu.png',timeout=600000)
    m=pg.evaluate(JS_MENU2);print(json.dumps(m))
    for x in m['F']:F(x)
play.run(s)
print('v206 owner list: checked' if not fails else 'CHECKS FAILED')
