# v192 (3530; 3075): Cheddar's quests all open at once, and the zone rewards are quiet coats switched on per creature.
# Checks: every quest of each zone can be accepted on a fresh hero (no tier lock, the board shows no "Locked" card); a half-done
# v148.1 save keeps its progress; the hero never wears a coat; a companion coat dresses only the creature's own body (not
# evolution armour, glow, Devotion glow, effects), a mount coat only the coat loft (not tack, saddle, reins, flames); the coat
# is subtle (no glowing cracks: emissive at most a faint rim; colours close to the base brightness); on / off chips in the
# Companions window and the Stable / Mounts windows; saved on the companion / mount; an old v164 save with worn coats moves
# them to the active companion / mount once and keeps loading; coats not earned are dropped.
# SHOT=1 also saves out/v192_comp_ui.png (Companions window) and out/v192_mount_ui.png (Mounts window).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
 try{
  // ---- 1) every quest open at once ----
  out.open=PMAP.map((p,z)=>(CHQD148[z]||[]).every(q=>chq148Open(q)));
  CHQ132.st={};(CHQD148[0]||[]).forEach(q=>chqAccept132(q.id));out.acc0=(CHQD148[0]||[]).filter(q=>CHQ132.st[q.id]&&CHQ132.st[q.id].s===1).length;out.n0=(CHQD148[0]||[]).length;
  CHQ132.st={};const s=chq148Spot();toPos(s.fx,s.fz);await wait(200);openX('chq132');CHQ148.tab=0;rX();await wait(150);
  out.locked=$('xwB').querySelectorAll('.cq132.lk8,.cq132bt[disabled]').length;out.accBtns=$('xwB').querySelectorAll('[data-cq8a]').length;out.sub=$('xwS').textContent;
  out.allBtn=!!$('xwF').querySelector('[data-cq8all]');$('xwF').querySelector('[data-cq8all]').click();await wait(100);out.accAll=(CHQD148[0]||[]).filter(q=>CHQ132.st[q.id]).length;closeX();
  // a v148.1 save with half-done tiers: progress stays
  const L=CHQD148[0],easy=L.filter(q=>q.df==1),med=L.filter(q=>q.df==2);CHQ132.st={};
  CHQ132.st[easy[0].id]={s:3,p:easy[0].o.map(o=>o[1])};CHQ132.st[easy[1].id]={s:1,p:easy[1].o.map(()=>1)};CHQ132.st[med[0].id]={s:2,p:med[0].o.map(o=>o[1])};
  const sv=x2Save();CHQ132.st={};x2Load(sv);await wait(100);
  out.keep=[CHQ132.st[easy[0].id]&&CHQ132.st[easy[0].id].s,CHQ132.st[easy[1].id]&&CHQ132.st[easy[1].id].p[0],CHQ132.st[med[0].id]&&CHQ132.st[med[0].id].s];
  const hard=L.find(q=>q.df==3);chqAccept132(hard.id);out.hardAfterLoad=!!CHQ132.st[hard.id];CHQ132.st={};

  // ---- 2) coats ----
  out.kinds=SKN164_Z.map(id=>SKN164.D[id].k);
  SKN164.u=Object.keys(SKN164.D);
  // the hero: nothing, even with an old "worn" hero skin
  SKN164.e.race='lantern';skn164Refresh();heroOutfit(pl,hero.cls);await wait(100);out.heroSkin=(pl._mdM&&pl._mdM.c&&pl._mdM.c.userData.skn164)||null;out.lookIdx9=mpLookOut()[9];
  // a companion: Foxlet evolved (armour), Devoted (glow): the coat goes on the body only
  const a=mkC('Foxlet',30,0,'');a.evo=3;a.z=1;a.dvp=2800;party[0]=a;leadK[0]='';sync();await wait(100);
  out.defOff=!a.sk192&&!fols[0].userData.sk192k;
  sk192Set(a,'rime');const g=fols[0];const on=[],offL=[];g.traverse(o=>{if(!o.isMesh)return;const m=o.material,k=m&&m.userData&&m.userData.sk192;(k?on:offL).push(o)});
  out.compOn=on.length;out.compBody=on.some(o=>o.isSkinnedMesh&&o.parent===g.b);out.compEvo=on.filter(o=>{for(let p=o;p&&p!==g;p=p.parent)if(p.userData&&p.userData.evo100)return true;return false}).length;
  out.compGlow=on.filter(o=>o.material.transparent||o.material.blending===THREE.AdditiveBlending||o.name=='dv191').length;out.compOthers=offL.length;
  out.dvKept=!!g.getObjectByName('dv191');
  // subtle: the coat's emissive is a faint rim only; no time uniform (nothing pulses)
  const P=SK192.D;out.rimMax=Math.max(...Object.values(P).map(d=>d.rs));out.noTime=!/uT164|uT192/.test(SK192_FC+SK192_FE);
  // a fresh build of the same companion (window preview, a partner's copy) wears it too
  const g2=cr(a);let n2=0;g2.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.sk192==='rime')n2++});out.rebuild=n2;
  // the companions window: chips, click Off then the coat
  cmpSel=0;$('cmp').classList.remove('hide');KQM.ctab='ov';rC();await wait(100);
  out.chips=[...document.querySelectorAll('#cd [data-sk192c]')].map(b=>(b.classList.contains('on')?'*':'')+b.textContent.trim());
  document.querySelector('#cd [data-sk192c=""]').click();await wait(80);out.uiOff=a.sk192||null;let n3=0;fols[0].traverse(o=>{if(o.isMesh&&o.material.userData.sk192)n3++});out.uiOffMeshes=n3;
  document.querySelector('#cd [data-sk192c="wraith"]').click();await wait(80);out.uiOn=a.sk192;
  $('cmp').classList.add('hide');
  // a mount: the coat loft only (tack, reins, saddle keep theirs)
  mounts.length=0;newMount('pony');mActive=mounts[0].id;inCombatNow=()=>false;toPos(s.fx+6,s.fz+6);await wait(150);if(riding)dismount();toggleMount();await wait(150);
  out.mDef=!riding.sk192;sk192SetM(riding,'blood');let mo=[],mx=[];mModel.traverse(o=>{if(!o.isMesh)return;(o.material.userData.sk192?mo:mx).push(o)});
  out.mountOn=mo.map(o=>!!o.userData.mdlBody);out.mountOthers=mx.length;
  // the coat follows the mount after dismount / remount
  dismount();toggleMount();await wait(150);let mm=0;mModel.traverse(o=>{if(o.isMesh&&o.material.userData.sk192==='blood')mm++});out.remount=mm;
  // mounts window chips
  closeX&&closeX();dismount();openX('mounts');await wait(150);out.mChips=[...document.querySelectorAll('#xw [data-sk192m]')].map(b=>(b.classList.contains('on')?'*':'')+b.textContent.trim());
  document.querySelector('#xw [data-sk192m="storm"]').click();await wait(80);out.mUi=mounts[0].sk192;
  if(!window.SHOT192)closeX();
  // render with the coats (shader compiles)
  try{ren.render(scene,cam);out.gl=ren.getContext().getError()}catch(e){out.gl=String(e)}
  // ---- saves ----
  const sv2=x2Save(),snap=gameSnapshot();out.savedC=snap.party[0].sk192;out.savedM=snap.mounts[0].sk192;out.v192=sv2.skn164&&sv2.skn164.v192;
  // an old v164 save: the worn companion / mount coats move to the active companion / mount once
  delete a.sk192;delete mounts[0].sk192;x2Load({skn164:{u:['rime','blood','lantern'],e:{race:'lantern',comp:'rime',mount:'blood'}},chq:sv2.chq});await wait(100);
  out.mig=[a.sk192||null,mounts[0].sk192||null,SKN164.e.race];
  // the same old save again after a v192 save: nothing switched on again
  delete a.sk192;x2Load(x2Save());await wait(50);out.noRemig=a.sk192||null;
  // coats not earned are dropped
  a.sk192='wraith';x2Load({skn164:{u:['rime'],e:{},v192:1},chq:sv2.chq});await wait(50);out.drop=a.sk192||null;
  // a v163 save (no skn164 at all) loads
  x2Load({chq:sv2.chq});await wait(50);out.v163=SKN164.u.length;
 }catch(e){out.err=String(e&&e.stack||e)}
 out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'THREE.WebGLProgram' in m.text else None)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('SHOT'):pg.evaluate("()=>{window.SHOT192=1}")
    r=pg.evaluate(JS);print(json.dumps(r)[:3000])
    if os.environ.get('SHOT'):
        pg.screenshot(path=play.TMP+'/v192_mount_ui.png',timeout=600000)
        pg.evaluate("()=>{closeX();$('cmp').classList.remove('hide');rC();return 1}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v192_comp_ui.png',timeout=600000)
    exp=lambda c,m:(None if c else F(m))
    if r.get('err'):F('error '+r['err'][:600]);return
    exp(all(r['open']),'every quest of every zone is open (%s)'%r['open'])
    exp(r['acc0']==r['n0']==8,'all 8 Kindlelight quests accepted on a fresh hero (%s of %s)'%(r['acc0'],r['n0']))
    exp(r['locked']==0 and r['accBtns']==8,'the board shows no locked quest and 8 Accept buttons (%s locked, %s buttons)'%(r['locked'],r['accBtns']))
    exp('all quests open' in r['sub'],'the board says every quest is open (%s)'%r['sub'])
    exp(r['allBtn'] and r['accAll']==8,'Accept all takes all 8 (%s)'%r['accAll'])
    exp(r['keep']==[3,1,2] and r['hardAfterLoad'],'a half-done v148.1 save keeps its progress, Hard open after load (%s %s)'%(r['keep'],r['hardAfterLoad']))
    exp(sorted(r['kinds'])==['comp','comp','comp','mount','mount','mount'],'three companion and three mount coats (%s)'%r['kinds'])
    exp(not r['heroSkin'] and not r['lookIdx9'],'the hero wears no skin, co-op look index 9 empty (%s %s)'%(r['heroSkin'],r['lookIdx9']))
    exp(r['defOff'],'a companion has no coat unless chosen')
    exp(r['compOn']>0 and r['compBody'] and r['compEvo']==0 and r['compGlow']==0 and r['compOthers']>0,'a companion coat is on the body only (on %s, body %s, evo armour %s, glow %s, untouched %s)'%(r['compOn'],r['compBody'],r['compEvo'],r['compGlow'],r['compOthers']))
    exp(r['dvKept'],'the Devoted glow stays')
    exp(r['rimMax']<=.08 and r['noTime'],'the coat is subtle: rim at most .08, nothing pulses (%s %s)'%(r['rimMax'],r['noTime']))
    exp(r['rebuild']>0,'a fresh build of the companion wears its coat (%s)'%r['rebuild'])
    exp(len(r['chips'])==4 and r['chips'][0]=='Off' and any(c.startswith('*') and 'Rimeborn' in c for c in r['chips']),'Companions window: Off + 3 coat chips, the worn one marked (%s)'%r['chips'])
    exp(r['uiOff'] is None and r['uiOffMeshes']==0 and r['uiOn']=='wraith','the chips switch the coat off and on (%s %s %s)'%(r['uiOff'],r['uiOffMeshes'],r['uiOn']))
    exp(r['mDef'],'a mount has no coat unless chosen')
    exp(len(r['mountOn'])==1 and all(r['mountOn']) and r['mountOthers']>0,'a mount coat is on the coat loft only (%s, untouched %s)'%(r['mountOn'],r['mountOthers']))
    exp(r['remount']==1,'the coat is back after remounting (%s)'%r['remount'])
    exp(len(r['mChips'])==4 and any(c.startswith('*') and 'Bloodcrown' in c for c in r['mChips']),'Mounts window: Off + 3 coat chips per mount (%s)'%r['mChips'])
    exp(r['mUi']=='storm','the mount chips switch the coat (%s)'%r['mUi'])
    exp(r['gl']==0,'the coat shader compiles (gl error %s)'%r['gl'])
    exp(r['savedC']=='wraith' and r['savedM']=='storm' and r['v192']==1,'the coat is saved with the companion / mount (%s %s %s)'%(r['savedC'],r['savedM'],r['v192']))
    exp(r['mig']==['rime','blood',None],'an old v164 save moves worn coats to the active companion / mount, none on the hero (%s)'%r['mig'])
    exp(r['noRemig'] is None,'a v192 save does not switch them on again (%s)'%r['noRemig'])
    exp(r['drop'] is None,'a coat not earned is dropped (%s)'%r['drop'])
    exp(r['v163']==0,'a save without coats loads (%s)'%r['v163'])
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v192 cheddar:',len(fails),'fails')
play.run(s)
