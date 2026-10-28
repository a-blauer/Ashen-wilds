# v139 (owner's list, Oct 2026): attributes replace talents, Character window on C (abilities on K), smaller per-level gains,
# power on a smaller scale, recommended power instead of level ranges, flat kill XP, flail trail at the ball's reach,
# the inventory preview keeps drawing. Prints PASS/FAIL lines.
import play,json
CHK=r"""(()=>{const R={},ok=(k,v,why)=>{R[k]={ok:!!v,why:why===undefined?null:why}};
  window.requestAnimationFrame=window.requestAnimationFrame||(f=>setTimeout(f,16));const say0=window.say;window.say=()=>{};
  try{
  // --- points and spending ---
  hero.lvl=1;atr139Clear();ok('lv1_zero',atr139Unspent()===0&&tpFree()===0,atr139Unspent());
  hero.lvl=10;hsDirty();ok('lv10_points',atr139Unspent()===27&&tpFree()===27,atr139Unspent());
  const pa0=HS().pa;atr139Add('str',5);ok('pending_not_applied',atr139Pts('str')===0&&atr139Free()===22);
  atr139Sub('str',2);ok('sub',ATR139.pend.str===3);atr139Undo();ok('undo',!atr139PendN()&&atr139Free()===27);
  atr139Add('str',10);atr139Apply();hsDirty();const s1=HS();ok('apply',atr139Pts('str')===10&&atr139Unspent()===17,atr139Pts('str'));
  ok('str_pa',Math.abs(s1.pa-(pa0+14)*1)<2||s1.pa>pa0+13,[pa0,s1.pa]);
  ok('str10_bonus',talMods().basicP>=.05,talMods().basicP);
  ok('no_overspend',atr139Add('dex',999)===17&&atr139Free()===0);atr139Undo();
  const g=atr139Auto();ok('auto_all',g===17&&atr139Free()===0,g);atr139Apply();ok('auto_applied',atr139Unspent()===0);
  // --- talents are gone ---
  hero.tal.w1=5;hero.tal.w11=3;hsDirty();ok('talents_dead',talRank('w1')===0&&!('cdm' in talMods()&&talMods().cdm>=.5));
  // migration on load: talent ranks removed, abilities / evolutions / attributes kept
  hero.tal['ab:Cleave']=2;hero.tal['__ev:Cleave']=1;delete hero.tal.__at138;const st=atr139Spent();
  saveGame&&saveGame();loadGame();
  ok('migrate',!('w1' in hero.tal)&&!('w11' in hero.tal)&&hero.tal['ab:Cleave']===2&&hero.tal['__ev:Cleave']===1&&atr139Spent()===st&&hero.tal.__at138===1,Object.keys(hero.tal));
  // reset costs gold and returns every point
  gold=0;ok('reset_needs_gold',!atr139Reset()&&atr139Spent()===st);gold=99999;ok('reset',atr139Reset()&&atr139Spent()===0&&gold===99999-atr139ResetCost());
  // flat gains halved-ish: level 30 naked warrior has less health than before (55% of the old growth)
  ok('flat_per',Math.abs(CLS.warrior.per.hp-24*ATR139.flat*(typeof LV141!='undefined'?LV141.k:1))<.01&&CLS.warrior.per.mp===1.5,CLS.warrior.per);
  // --- power scale ---
  hero.lvl=1;hsDirty();const p1=heroPower();hero.lvl=50;hsDirty();atr139Auto();atr139Apply();const p50=heroPower();
  ok('power_small',p1>=60&&p1<=140&&p50<1000,[p1,p50]);ok('rec_small',recPower(1)<=150&&recPower(50)<=900&&recPower(50)%5===0,[recPower(1),recPower(50)]);
  // --- flat kill XP: no bonus or penalty for the level gap ---
  hero.lvl=20;hero.xp=0;const hk=HXP164;HXP164=1;const xpAt=l=>{hero.xp=0;const e={c:{l,al:0,boss:0}};return gainXP(e)};const a=xpAt(10),b=xpAt(20),c=xpAt(30);HXP164=hk;hero.lvl=20;   /* v164: the hero's 25% cut off, so the ratio is not lost to rounding */
  const base=l=>8+12*l;ok('xp_flat',Math.abs(a/b-base(10)/base(20))<.03&&Math.abs(c/b-base(30)/base(20))<.03,[a,b,c]);
  // --- labels: power instead of level ranges ---
  const I=INSL[insG(0,0)];insArrive(I);for(let i=0;i<3;i++){window._vt=(window._vt||performance.now()+1e5)+16;loop(window._vt)}
  const loc=typeof locName=='function'?locName():($('areaT')?$('areaT').textContent:'');ok('loc_no_lv',!/Lv \d/.test(loc)&&/Rec\. power/.test($('areaT').textContent),$('areaT').textContent);
  let pw='';try{openX('portal',0);pw=$('xwB').textContent+' '+$('xwS').textContent;closeX()}catch(e){pw='ERR '+e.message}ok('portal_no_lv',!/Lv \d+–\d+/.test(pw)&&/Rec\. power/.test(pw),pw.slice(0,200));
  ok('rp_txt',/^⚔ Rec\. power \d/.test(rpTxt139(5)),rpTxt139(5));
  // --- keys: C character, K abilities ---
  closeWin();try{closeX()}catch(_){}dispatchEvent(new KeyboardEvent('keydown',{key:'c'}));dispatchEvent(new KeyboardEvent('keyup',{key:'c'}));
  ok('c_character',!$('tal').classList.contains('hide')&&!!$('ch139St')&&/Power/.test($('ch139St').textContent));
  ok('char_rows',document.querySelectorAll('#ch139At .at139').length===6);
  dispatchEvent(new KeyboardEvent('keydown',{key:'c'}));dispatchEvent(new KeyboardEvent('keyup',{key:'c'}));ok('c_closes',$('tal').classList.contains('hide'));
  dispatchEvent(new KeyboardEvent('keydown',{key:'k'}));dispatchEvent(new KeyboardEvent('keyup',{key:'k'}));ok('k_abilities',!$('xw').classList.contains('hide')&&xwMode=='abil',xwMode);try{closeX()}catch(_){}
  // the + button in the Character window
  hero.lvl=5;atr139Clear();openTal();const btn=document.querySelector('#ch139At [data-at139="vig"]');btn&&btn.click();ok('plus_click',ATR139.pend.vig===1,ATR139.pend);
  const ap=document.querySelector('#ch139Bar [data-at139x="apply"]');ap&&ap.click();ok('apply_click',atr139Pts('vig')===1);closeWin();
  // inventory block
  $('bagBtn').click();ok('bag_attr',!!document.querySelector('#kqmAtr139 .at139')&&document.querySelectorAll('#kqmAtr139 .at139').length===6);
  // the preview keeps drawing after closing and reopening the bag
  closeWin();PV.run=false;$('bagBtn').click();ok('pv_restarts',PV.run===true);closeWin();
  }catch(e){ok('threw',false,String(e&&e.stack||e).slice(0,400))}
  window.say=say0;return R})()"""
FLAIL=r"""(()=>{window.requestAnimationFrame=()=>0;POST.render=()=>{};window._vt=(window._vt||performance.now())+1e5;
 const STEP=n=>{for(let i=0;i<n;i++){_vt+=16;loop(_vt);scene.updateMatrixWorld()}};
 insArrive(INSL[insG(0,0)]);STEP(5);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});ROST.slots=[];
 hero.cls='paladin';const tp=ITPL.findIndex(t=>t.wt=='flail');eq.weapon={id:999,tp,lv:1,req:1,r:0,up:0,aff:[]};refreshGear(pl,'paladin',eq);hsDirty();
 const W=pl.gearG[0],v=new THREE.Vector3(),rings=[];let ball=0;
 const o0=scene.add.bind(scene);scene.add=function(...a){a.forEach(g=>{if(g&&g.isGroup&&g.children[0]&&g.children[0].geometry&&g.children[0].geometry.type=='RingGeometry'){const p=g.children[0].geometry.parameters;rings.push(+(p.outerRadius*(g.scale.x||1)).toFixed(2))}});return o0(...a)};
 for(let s=0;s<3;s++){swing();for(let i=0;i<40;i++){STEP(1);W.updateMatrixWorld(true);W.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;for(let j=0;j<P.count;j+=3){v.fromBufferAttribute(P,j).applyMatrix4(o.matrixWorld);ball=Math.max(ball,Math.hypot(v.x-pl.position.x,v.z-pl.position.z))}})}STEP(30)}
 scene.add=o0;return {ball:+ball.toFixed(2),rings}})()"""
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    F=ev(FLAIL);ok=len(F['rings'])>=3 and max(F['rings'])<=F['ball']+.3
    print(('PASS' if ok else 'FAIL'),'flail_trail',json.dumps(F),flush=True)
    ev("()=>{hero.cls='warrior';eq.weapon=null;refreshGear(pl,'warrior',eq);hsDirty();return 1}")
    R=ev(CHK);fails=[k for k,v in R.items() if not v['ok']]+([] if ok else ['flail'])
    for k,v in R.items():print(('PASS' if v['ok'] else 'FAIL'),k,'' if v['ok'] else json.dumps(v['why'])[:300],flush=True)
    print('CHECKS OK' if not fails else 'CHECKS FAILED: %s'%fails)
play.run(s)
