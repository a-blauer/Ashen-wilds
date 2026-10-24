# v135 checks (suite form, prints FAIL lines): bow shows one string while drawing, the entrance portal opens the travel window,
# no Wave Trials, right click toggles mouse-look, a second ring slot, the hatch reveal frees the window, monsters fall over and
# fade (no float/shrink), the ability preview leaves the world's hero in place, scenery fade + instance clip are applied.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async()=>{const F=[],out={},sleep=ms=>new Promise(r=>setTimeout(r,ms)),V3=THREE.Vector3;
 // ---- bow: one string while drawing ----
 console.log('V135 step: bow: one string while drawing');
 try{hero.cls='ranger';const wi=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt=='bow');eq.weapon={id:uid++,tp:wi,lv:5,req:1,r:1,up:0,aff:[]};refreshGear();
   const W=(pl.gearG||[]).find(o=>o.userData.wt=='bow');if(!W)F.push('no bow model');else{const S=[];W.traverse(o=>{if(o.isMesh&&o.material===lgMats().s)S.push(o)});
     if(!S.length)F.push('bow has no string mesh');bowFxSet(.8,1);const a=S.every(o=>!o.visible)&&BOW_FX.g.visible;bowFxSet(0,0);const b=S.every(o=>o.visible)&&!BOW_FX.g.visible;
     if(!a)F.push('two strings while drawing');if(!b)F.push('string missing at rest');out.bowH=+(new THREE.Box3().setFromObject(W).getSize(new V3()).length()).toFixed(2)}}catch(e){F.push('bow '+e)}
 hero.cls='warrior';delete eq.weapon;refreshGear();
 // ---- no Wave Trials ----
 console.log('V135 step: no Wave Trials');
 if(RPORT.some(r=>r.k=='wave'))F.push('wave portal still there');waveStart(0);if(WV)F.push('wave trial started');bossDone.add(0);xwArg=0;XR.portal();if(/Wave Trial/.test($('xwB').innerHTML))F.push('portal lists the Wave Trial');
 // ---- the entrance portal opens the travel window ----
 console.log('V135 step: the entrance portal opens the travel window');
 {const I=PMAP[0].ins[0];INSR[0]=Math.max(INSR[0]||0,2);insArrive(I);await sleep(300);const r=RPORT.find(q=>q.k=='home'&&q.ig===I.g);toPos(r.x,r.z+.5);const p=worldPrompt();out.home=p&&p.label;
  if(!p||!/Travel/.test(p.label))F.push('home portal prompt: '+(p&&p.label));else{p.fn();await sleep(50);if(xwMode!=='portal135')F.push('travel window not open: '+xwMode);
   const h=$('xwB').innerHTML;if(!/data-p135="home"/.test(h))F.push('no Duskhold row');if(!/You are here/.test(h))F.push('current instance not marked');if(!/data-pk="1"/.test(h))F.push('instance II missing');
   $('xwB').querySelector('[data-pk="1"]').click();await sleep(1500);const J=curIns();if(!J||J.k!==1)F.push('did not travel to II: '+(J&&J.n));}}
 // ---- right click toggles mouse-look ----
 console.log('V135 step: right click toggles mouse-look');
 {closeX();const g=gl,ev=b=>g.dispatchEvent(new PointerEvent('pointerdown',{button:b,buttons:b==2?2:4,bubbles:true,clientX:300,clientY:200}));
  ev(2);const on1=!!orb;window.dispatchEvent(new PointerEvent('pointerup',{button:2,bubbles:true}));const on2=!!orb;ev(2);const on3=!!orb;
  if(!on1)F.push('right click did not turn mouse-look on');if(!on2)F.push('releasing right click turned it off');if(on3)F.push('second right click did not turn it off');}
 // ---- second ring ----
 console.log('V135 step: second ring');
 {if(!SLOTS.includes('ring2'))F.push('no ring2 slot');const ri=ITPL.findIndex(t=>t.sl=='ring');const mk=()=>({id:uid++,tp:ri,lv:1,req:1,r:2,up:0,aff:[]});const a=mk(),b=mk();gear.push(a,b);delete eq.ring;delete eq.ring2;
  selI={k:'g',id:a.id};invAct();selI={k:'g',id:b.id};invAct();if(eq.ring!==a||eq.ring2!==b)F.push('rings not in both slots');const s=HS();out.ringCrit=+s.crit.toFixed(3);
  $('bag').classList.remove('hide');rB();await sleep(100);if(!document.querySelector('#bag [data-kqs="ring2"],#bag .kqm-doll .kqm-it[data-id="'+b.id+'"]'))F.push('ring2 not on the paper doll');try{$('bag').classList.add('hide')}catch(_){}}
 // ---- hatch reveal frees the window ----
 console.log('V135 step: hatch reveal frees the window');
 {try{if(party.length){openCmp(false);CE.hat={c:party[0],egg:{},done:true};hAct=true;hq.length=0;rC();const b=$('cl').querySelector('button[data-i]');if(!b)F.push('no list button');else{$('cl').onclick({target:b});if(CE.hat||hAct)F.push('hatch reveal still blocks the list')}$('cmp').classList.add('hide')}}catch(e){F.push('hatch '+e)}}
 // ---- monsters fall over and fade ----
 console.log('V135 step: monsters fall over and fade');
 {let e=null;for(let i=0;i<20&&!e;i++){e=enemies.find(q=>!q.dead&&!q.boss&&q.m&&q.m.parent&&q.m.b&&!q.m._ssr);if(!e)await sleep(500)}await sleep(800);out.nEn=enemies.length;if(!e)F.push('no enemy to kill');else{const y0=e.m.position.y,s0=e.m.scale.x;e.c.h=0;kill(e);e.dead=true;await sleep(900);
   out.deathY=+(e.m.position.y-y0).toFixed(2);out.roll=+e.m.b.rotation.z.toFixed(2);if(e.m.position.y-y0>.2)F.push('body floats up '+out.deathY);if(Math.abs(e.m.scale.x-(e.m.bs||s0))>1e-3)F.push('body shrinks '+e.m.scale.x+' vs '+e.m.bs);if(Math.abs(e.m.b.rotation.z)<1)F.push('body did not fall over '+out.roll);
   await sleep(1800);let fading=false;e.m.traverse(o=>{if(o.material&&o.material.transparent&&o.material.userData&&o.material.userData.d135&&o.material.opacity<1)fading=true});if(!fading&&e.m.parent)F.push('no fade');
   await sleep(1500);if(e.m.parent)F.push('body not removed')}}
 // ---- the ability preview pins the world's hero ----
 console.log('V135 step: the ability preview pins the worlds hero');
 {const P=pl.position.clone(),saved=ABX.on,sw=ABX.w,sc=ABX.ctx;let seen=null;const aw=abxWatch;abxWatch=()=>{};const tt=townTick;townTick=function(n,p){if(!seen)seen=p.clone();return tt.apply(this,arguments)};
  ABX.on=true;ABX.ctx=0;ABX.w={pos:P.clone(),ry:0};pl.position.set(P.x+7,P.y,P.z+7);await sleep(1200);townTick=tt;const stage=pl.position.clone();ABX.on=saved;abxWatch=aw;ABX.w=sw;ABX.ctx=sc;pl.position.copy(P);
  if(!seen)F.push('main loop not seen');else if(seen.distanceTo(P)>.01)F.push('the world saw the preview hero move '+seen.distanceTo(P).toFixed(2));if(stage.distanceTo(P)<6)F.push('the stage lost its own position')}
 // ---- scenery fade and the instance clip ----
 console.log('V135 step: scenery fade and the instance clip');
 {await sleep(2500);let n=0;scene.traverse(o=>{if(o.isMesh&&o.material&&!Array.isArray(o.material)&&F135.done.has(o.material)&&/f135/.test(o.material.customProgramCacheKey()))n++});out.faded=n;if(n<20)F.push('few faded scenery meshes '+n);
  const I=curIns(),c=CLIP135.value;if(!I)F.push('not in an instance');else if(Math.abs(c.x-(I.x0-3))>.01||Math.abs(c.w-(I.y0+I.h+3))>.01)F.push('clip rect not the instance');
  // item icons and small previews are drawn outside the main view: the fade and clip must leave them alone (icons sit at the
  // world origin, outside every instance)
  try{if(v89Init()){const ri=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt=='gs');const it={id:-5,tp:ri,lv:30,req:1,r:2,up:0,aff:[]};v89Render(it);const R_=CPIC.r.domElement,c=document.createElement('canvas');c.width=R_.width;c.height=R_.height;
    const x=c.getContext('2d');x.drawImage(R_,0,0);const D=x.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<D.length;i+=4)if(D[i]>20)n++;out.iconPx=n;if(n<200)F.push('item icon blank in an instance ('+n+' px)')}}catch(e){F.push('icon '+e)}
  if(FX135ON.value!==0)F.push('fade/clip flag left on outside the main view');
  // the camera no longer climbs over rocks/walls: only the ground moves it
  out.blk=/r=='R'/.test(String(loop))?'old':'new'}
 return {F,out}}"""
def s(pg):
    pg.set_default_timeout(600000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    pg.on('console',lambda m:print(m.text,flush=True) if m.text.startswith('V135') else None)
    r=pg.evaluate(JS)
    for f in r['F']:print('FAIL',f)
    print(json.dumps(r['out']))
    if not r['F']:print('OK v135 checks')
play.run(s,w=1000,hh=640)
