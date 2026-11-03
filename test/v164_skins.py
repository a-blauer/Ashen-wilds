# v164 (3235; v192 3530: coats per creature, no hero skin): Cheddar's board has exactly 8 quests per zone (Easy -> Medium -> Hard), and turning in the last quest of a zone unlocks
# that zone's exclusive skin (worn at once): hero skins change the fur only (sentinel colour + shader on the hero's own material),
# companion skins the whole creature, mount skins the coat. The board shows the zone's skin; Wear / Take off; saves keep it.
# SHOT=1 also saves a picture of the board with the skin card (out/v164_board.png).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  out.n=PMAP.map((p,z)=>(CHQD148[z]||[]).length);out.ids=[].concat(...PMAP.map((p,z)=>(CHQD148[z]||[]).map(q=>q.id)));
  out.dup=out.ids.length-new Set(out.ids).size;out.zok=PMAP.every((p,z)=>(CHQD148[z]||[]).every(q=>q.z===z&&q.ik==='z'+z&&CHQ132_ID[q.id]===q));
  out.tiers=PMAP.map((p,z)=>{const L=CHQD148[z]||[];return [1,2,3].map(d=>L.filter(q=>(q.df||1)==d).length)});
  out.order=PMAP.every((p,z)=>{const L=CHQD148[z]||[];for(let i=1;i<L.length;i++)if((L[i].df||1)<(L[i-1].df||1))return false;return true});
  out.skins=SKN164_Z.map(id=>SKN164.D[id]&&SKN164.D[id].k);
  // ---- finish Kindlelight: the last turn-in unlocks Lanternbound and it is worn ----
  const T=TOWNS[0],s=chq148Spot();toPos(s.fx,s.fz);await wait(300);
  const L0=CHQD148[0];L0.forEach((q,i)=>{CHQ132.st[q.id]={s:i<7?3:2,p:q.o.map(o=>chq148Need(q,o))}});out.before=SKN164.u.slice();
  openX('chq132');CHQ148.tab=0;rX();await wait(150);out.card1=!!$('xwB').querySelector('.sk164:not(.have)');out.card1Txt=($('xwB').querySelector('.sk164 small')||{}).textContent;closeX();
  chqTurnIn132(L0[7].id);await wait(300);out.after=SKN164.u.slice();out.worn=SKN164.e.race;
  const body=huBody(pl),c=body.geometry.attributes.color;let mag=0;for(let i=0;i<c.count;i++){const r=c.getX(i),g=c.getY(i),b=c.getZ(i);if(Math.min(r,b)-g>.3&&Math.abs(r-b)<.15)mag++}
  out.mag=mag;out.patched=pl._mdM.c.userData.skn164||null;out.metal=pl._mdM.m?pl._mdM.m.userData.skn164||null:null;
  // the hero's real fur colour is kept in the look, and the sentinel only goes to the model
  out.lookSkin=JSON.stringify(hero.look||{}).indexOf('16711935')<0;
  // ---- the board shows the card (v192: earned, switched on per creature elsewhere: no Wear button) ----
  openX('chq132');CHQ148.tab=0;rX();await wait(200);out.card=!!$('xwB').querySelector('.sk164.have');out.cardBtn=!!$('xwB').querySelector('[data-sk164]');
  closeX();
  // ---- companions and the mount (v192: per creature, c.sk192 / m.sk192) ----
  SKN164.u=Object.keys(SKN164.D);sk192Set(party[0],'rime');const f=fols[0];let cm=0;if(f)f.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.sk192==='rime')cm++});out.comp=[cm,party[0].sk192||null];
  sk192Set(party[0],null);let cb=0;if(f)f.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.sk192)cb++});out.compOff=cb;
  if(!mounts.length)newMount(MNTK[0]);toPos(s.fx+6,s.fz+6);await wait(200);hero.lastHit=-1e9;try{toggleMount()}catch(e){out.mtErr=String(e)}await wait(200);sk192SetM(riding,'blood');
  let mm=0,mn=0;if(typeof mModel!='undefined'&&mModel)mModel.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial){mn++;if(o.material.userData.sk192==='blood')mm++}});out.mount=[mm,mn];out.riding=!!riding;
  // shared materials stay clean (the coats are copies)
  out.shared=[dkM().c,dkM().sc].every(m=>!m.userData.skn164&&!m.userData.sk192);
  // ---- saves ----
  const snap=JSON.stringify(x2Save().skn164);SKN164.u=[];SKN164.e={race:null,comp:null,mount:null};x2Load({skn164:JSON.parse(snap),chq:x2Save().chq});await wait(200);
  out.saved=snap;out.loaded=JSON.stringify({u:SKN164.u,e:SKN164.e,m:riding&&riding.sk192});
  // a render with the skin on compiles (no shader errors)
  try{ren.render(scene,cam);out.gl=ren.getContext().getError()}catch(e){out.gl=String(e)}
  out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'THREE.WebGLProgram' in m.text else None)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="assassin"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000])
    if os.environ.get('SHOT'):
        pg.evaluate("()=>{openX('chq132');CHQ148.tab=0;rX();return 1}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v164_board.png',timeout=600000)
    exp=lambda c,m:(None if c else F(m))
    exp(all(n==8 for n in r['n']),'every zone has 8 quests (%s)'%r['n'])
    exp(r['dup']==0 and r['zok'],'quest ids unique and tied to their zone')
    exp(all(t[0]>=2 and t[1]>=2 and t[2]>=2 for t in r['tiers']) and r['order'],'each zone climbs Easy -> Medium -> Hard (%s)'%r['tiers'])
    exp(sorted(r['skins'])==['comp','comp','comp','mount','mount','mount'],'v192: three companion and three mount coats, no hero skin (%s)'%r['skins'])
    exp('lantern' not in r['before'] and 'lantern' in r['after'] and not r['worn'],'the last Kindlelight quest unlocks Lanternbound; the hero wears nothing (%s -> %s, %s)'%(r['before'],r['after'],r['worn']))
    exp(r['mag']==0 and not r['patched'] and not r['metal'],'v192: the hero model has no skin: no fur sentinel, no shader (%s %s %s)'%(r['mag'],r['patched'],r['metal']))
    exp(r['lookSkin'],'the hero’s own fur colour is kept in the saved look')
    exp(r['card'] and not r['cardBtn'],'the board shows the earned coat, no hero Wear button (%s %s)'%(r['card'],r['cardBtn']))
    exp(r['card1'] and '7 of 8' in (r['card1Txt'] or ''),'before the last quest the card shows the locked coat and progress (%s)'%r['card1Txt'])
    exp(r['comp'][0]>0 and r['comp'][1]=='rime' and r['compOff']==0,'a companion coat dresses the companion and comes off (%s %s)'%(r['comp'],r['compOff']))
    exp(r['riding'] and r['mount'][0]>0 and r['mount'][0]<r['mount'][1],'a mount coat dresses the ridden mount, not its tack (%s)'%r['mount'])
    exp(r['shared'],'shared materials are never changed')
    exp('lantern' in r['loaded'] and '"race":null' in r['loaded'] and '"m":"blood"' in r['loaded'],'saves keep unlocked coats and the mount’s own coat (%s)'%r['loaded'])
    exp(r['gl']==0,'the skin shader compiles (gl error %s)'%r['gl'])
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v164 skins:',len(fails),'fails')
play.run(s)
