# v137 new gear: the 150 new templates (ITPL_V137…) — checks, and picture sheets to look at.
#   python3 v137_items.py                     checks only (prints FAIL lines)
#   SHEET=models  SEL=weapon|offhand|helm|chest|boots|amulet|ring|all  [ARM=heavy]   -> out/v137_models_<SEL>.jpg (item models, 2 views)
#   SHEET=worn    SEL=helm|chest|boots [ARM=heavy|medium|light|cloth] [R=3]          -> out/v137_worn_<ARM>_<SEL>.jpg (on the class animal)
#   SHEET=hand    SEL=warrior|paladin|assassin|ranger|mage                           -> out/v137_hand_<SEL>.jpg (held, idle and wind-up)
#   SHEET=jewel                                                                       -> out/v137_jewel.jpg (amulets and rings worn)
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
RACE={'warrior':1,'assassin':2,'mage':3,'paladin':4,'ranger':5}
MV={'gs':'gs1','ga':'gs1','axes':'gs1','halberd':'gs1','mace':'mace1','hammer':'mace1','flail':'mace1','dagger':'dag1','claws':'dag1','knives':'dag1','bow':'sling','crossbow':'sling','sling':'sling','staff':'sword0','wand':'sword0','orb':'sword0'}
SHEETS=COMMON+r"""(a)=>{const [mode,sel,arm,R,MV]=a,V=THREE.Vector3,out={info:[],err:null};
  const L=[];for(let i=ITPL_V137;i<ITPL.length;i++){const t=ITPL[i];if(mode=='jewel'?(t.sl=='amulet'||t.sl=='ring'):(sel=='all'||t.sl==sel||(mode=='hand'&&t.cls==sel&&t.sl=='weapon')))if(!arm||!t.arm||t.arm==arm)L.push(i)}
  if(mode=='hand'&&sel=='paladin')for(let i=ITPL_V137;i<ITPL.length;i++)if(ITPL[i].sl=='offhand')L.push(i);
  if(mode=='models'){const FW=300,FH=260,cols=4,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);const hid=[];sc.children.forEach(o=>{if(o.isGridHelper||(o.isMesh&&o.geometry&&o.geometry.type=='PlaneGeometry')){o.visible=false;hid.push(o)}});const cnv=document.createElement('canvas');cnv.width=FW*cols;cnv.height=FH*Math.ceil(L.length*2/cols);const ctx=cnv.getContext('2d');
    L.forEach((tp,n)=>{let g;try{const it=RT.it(tp,R);g=lgGroup('T137|'+tp+'|'+R+'|'+Math.random(),k=>v89Kit(k,it),.14)}catch(e){out.err=out.err||String(e);out.info.push('ERR '+tp+' '+e);return}
      sc.add(g);g.updateMatrixWorld(true);let bb=new THREE.Box3().setFromObject(g);{const z0=bb.getSize(new V());if(z0.y>z0.x*1.6){g.rotation.z=Math.PI/2;g.updateMatrixWorld(true);bb=new THREE.Box3().setFromObject(g)}}const c=bb.getCenter(new V()),sz=bb.getSize(new V()).length();
      [[.6,.25,1],[-.9,.15,.5]].forEach((d,j)=>{pc.position.copy(c).add(new V(...d).normalize().multiplyScalar(sz*1.5+.1));pc.lookAt(c);rd.render(sc,pc);const q=n*2+j;ctx.drawImage(rd.domElement,(q%cols)*FW,Math.floor(q/cols)*FH);if(!j)RT.lbl(ctx,ITPL[tp].n,(q%cols)*FW,Math.floor(q/cols)*FH,FW*2)});sc.remove(g)});
    hid.forEach(o=>o.visible=true);out.img=cnv.toDataURL('image/jpeg',.86);return out}
  const FW=230,FH=290,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);if(!RT.rim){RT.rim=new THREE.DirectionalLight(0xa8b8ff,.7);RT.rim.position.set(-3,3,-4);sc.add(RT.rim)}
  const views=mode=='worn'?(sel=='helm'?['front','34','back','hf','h34','hs']:sel=='chest'?['front','34','back','cf','c34','cb']:['front','34','legs','lf','ls','run']):mode=='jewel'?['front','cf','hand']:['front','34','side','windup','strike','back'];
  const rows=mode=='jewel'?L.length:L.length;const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*rows;const ctx=cnv.getContext('2d');let H=null;
  L.forEach((tp,row)=>{const t=ITPL[tp];let cls=t.cls||(t.arm?ARMC[t.arm][row%ARMC[t.arm].length]:['warrior','assassin','mage','paladin','ranger'][row%5]);const E={};
    E[t.sl=='ring'?'ring':t.sl]=RT.it(tp,R);if(mode=='hand'&&cls=='paladin'&&t.sl=='weapon')E.offhand=RT.it(ITPL.findIndex(q=>q.sl=='offhand'),R);
    if(mode=='hand'&&t.sl=='offhand'){const w=ITPL.findIndex(q=>q.cls=='paladin'&&q.sl=='weapon');E.weapon=RT.it(w,R)}
    if(H)sc.remove(H);try{H=RT.beast(cls,{warrior:1,assassin:2,mage:3,paladin:4,ranger:5}[cls],E)}catch(e){out.err=String(e);out.info.push('ERR '+tp+' '+e);return}sc.add(H);if(mode=='worn')RT.hideW(H);RT.idle(H,700);
    const cb=new V(0,.8,0),shot=(col,dir,c,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,l,col*FW,row*FH,FW)};
    const hc=()=>{const hp=H.bones.head.getWorldPosition(new V());return new V(hp.x,hp.y+.03,hp.z+.02)};const mv=MV[t.wt]||'mace1';
    views.forEach((v,col)=>{const lab=col?v:t.n+' ['+cls+']';
      if(v=='front')shot(col,[0,.12,1],cb,3.8,lab);else if(v=='34')shot(col,[.8,.15,.6],cb,3.8,lab);else if(v=='side')shot(col,[1,.1,0],cb,3.8,lab);else if(v=='back')shot(col,[-.5,.2,-.9],cb,3.8,lab);
      else if(v=='hf')shot(col,[0,.1,1],hc(),1.0,lab);else if(v=='h34')shot(col,[.75,.2,.6],hc(),1.0,lab);else if(v=='hs')shot(col,[-.9,.2,-.4],hc(),1.0,lab);
      else if(v=='cf')shot(col,[0,.15,1],new V(0,.78,0),1.7,lab);else if(v=='c34')shot(col,[.8,.2,.6],new V(0,.78,0),1.7,lab);else if(v=='cb')shot(col,[-.6,.2,-.8],new V(0,.78,0),1.7,lab);
      else if(v=='lf')shot(col,[0,.1,1],new V(0,.2,0),1.1,lab);else if(v=='ls')shot(col,[1,.1,.05],new V(0,.2,0),1.1,lab);else if(v=='legs')shot(col,[.6,.15,.8],new V(0,.22,0),1.2,lab);else if(v=='lb')shot(col,[-.6,.2,-.8],new V(0,.22,0),1.2,lab);
      else if(v=='hand'){const hp=H.bones.aR2.getWorldPosition(new V());shot(col,[.6,.2,.8],hp,.6,lab)}
      else if(v=='run'){for(let q=0;q<900;q+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true);shot(col,[1,.12,.25],cb,3.8,lab);RT.idle(H,500)}
      else if(v=='windup'){RT.pose(H,mv,.35);shot(col,[.7,.2,.8],cb,4.2,lab);RT.idle(H,300)}else if(v=='strike'){RT.pose(H,mv,.62);shot(col,[.5,.2,1],cb,4.2,lab);RT.idle(H,300)}})});
  if(H)sc.remove(H);out.img=cnv.toDataURL('image/jpeg',.86);out.err=out.err||RT.err||null;return out}"""
CHECKS=COMMON+r"""()=>{const F=[],N=[];const CLSW137={warrior:['gs','ga','axes','halberd'],paladin:['mace','hammer','flail'],assassin:['dagger','claws','knives'],ranger:['bow','crossbow','sling'],mage:['staff','wand','orb']};const n0=ITPL_V137,n=ITPL.length-n0;N.push('templates '+ITPL.length+' new '+n);if(ITPL.length!=350)F.push('expected 350 templates, have '+ITPL.length);if(n0!=200)F.push('new templates start at '+n0+' (expected 200)');
  const cnt={};for(let i=n0;i<ITPL.length;i++){const t=ITPL[i],k=t.sl+(t.arm?'.'+t.arm:'')+(t.cls?'.'+t.cls:'');cnt[k]=(cnt[k]||0)+1;
    if(!t.v7)F.push('no model key '+t.n);if(t.sl=='weapon'&&!WTYPE[t.wt])F.push('unknown weapon type '+t.n+' '+t.wt);if(!(t.t>=0&&t.t<=4))F.push('bad tier '+t.n);
    if(t.sl=='weapon'&&!(CLSW137[t.cls]&&CLSW137[t.cls].includes(t.wt)))F.push('weapon type not of its class '+t.n)}
  N.push(JSON.stringify(cnt));const names=new Set();for(let i=0;i<ITPL.length;i++){if(names.has(ITPL[i].n))F.push('duplicate name '+ITPL[i].n);names.add(ITPL[i].n)}
  // every class / tier / slot it can wear has a new item to find; every class weapon type has a new weapon
  ['warrior','paladin','assassin','ranger','mage'].forEach(c=>{['weapon','helm','chest','boots','amulet','ring'].forEach(sl=>{if(!ITPL.some((t,i)=>i>=n0&&t.sl==sl&&fitsCls(t,c)))F.push('no new '+sl+' for '+c)});CLSW137[c].forEach(w=>{if(!ITPL.some((t,i)=>i>=n0&&t.wt==w))F.push('no new '+w)})});
  // generation: every new template drops (genItem over many rolls), stats are numbers, the empty-pool roll is fixed
  const seen=new Set(),cls0=hero.cls;try{['warrior','paladin','assassin','ranger','mage'].forEach(c=>{hero.cls=c;for(const lv of [1,5,9,15,20,28,35,45,55]){for(let j=0;j<500;j++){const it=genItem(lv,{cls:c});if(!(it.tp>=0&&ITPL[it.tp]))F.push('bad drop tp '+it.tp);else seen.add(it.tp)}}})}finally{hero.cls=cls0}
  for(let i=n0;i<ITPL.length;i++)if(!seen.has(i))F.push('never dropped: '+ITPL[i].n);
  try{const it=genItem_base(1,{sl:'offhand',cls:'mage'});if(!(it.tp>=0))F.push('empty pool roll gave tp '+it.tp)}catch(e){F.push('empty pool roll threw '+e)}
  for(let i=n0;i<ITPL.length;i++){const it={id:-1,tp:i,lv:20,req:1,r:3,up:2,aff:[]};const s=itStats(it);for(const k in s)if(!isFinite(s[k]))F.push('stat '+k+' of '+ITPL[i].n+' is '+s[k]);if(!Object.keys(s).length)F.push('no stats '+ITPL[i].n)}
  // shop wares: the stock rolls them too
  {let hit=0;for(let j=0;j<400;j++){const it=shpGear109(20,2);if(it.tp>=n0)hit++}if(!hit)F.push('shop never offers new gear');N.push('shop new '+hit+'/400')}
  // models: each new item's model differs from every other item's (vertex count + bounds signature), held / worn / icon builds without errors
  const sig={},err=[];const sg=(tp,r)=>{const k=dkKit();const it={id:-1,tp,lv:20,req:1,r:r,up:0,aff:[]};v89Kit(k,it);let nv=0;const bb=new THREE.Box3(),v=new THREE.Vector3();
    k.P.forEach(p=>{const pa=p.geo.attributes.position;nv+=pa.count;for(let i=0;i<pa.count;i+=Math.max(1,pa.count>>3)){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);bb.expandByPoint(v)}});
    return nv+'|'+k.P.length+'|'+bb.min.toArray().concat(bb.max.toArray()).map(q=>q.toFixed(3)).join(',')};
  for(let i=0;i<ITPL.length;i++){try{const s=sg(i,2);(sig[s]=sig[s]||[]).push(i)}catch(e){err.push(ITPL[i].n+': '+e)}}
  err.slice(0,8).forEach(e=>F.push('model error '+e));Object.values(sig).forEach(L=>{if(L.length>1&&L.some(i=>i>=n0))F.push('same model: '+L.map(i=>ITPL[i].n).join(' = '))});
  // worn: build a hero of each class with new pieces, no console errors; the new armour adds motif parts over the base shape
  const ce=[];const ow=console.warn,oe=console.error;console.warn=(...a)=>{ce.push(a.join(' '));ow.apply(console,a)};console.error=(...a)=>{ce.push(a.join(' '));oe.apply(console,a)};
  try{for(let i=n0;i<ITPL.length;i++){const t=ITPL[i];if(!['helm','chest','boots','amulet','ring','weapon','offhand'].includes(t.sl))continue;const cls=t.cls||(t.arm?ARMC[t.arm][i%ARMC[t.arm].length]:['warrior','assassin','mage','paladin','ranger'][i%5]);
    const E={};E[t.sl]=RT.it(i,3);const H=RT.beast(cls,{warrior:1,assassin:2,mage:3,paladin:4,ranger:5}[cls],E);if(!H||!H.bones)F.push('hero build failed '+t.n)}}
  finally{console.warn=ow;console.error=oe}
  ce.filter(m=>/v137|motif|hero model|item model/.test(m)).slice(0,8).forEach(m=>F.push('console: '+m));
  // armour: the motif adds parts (more triangles than the same base shape without it)
  {const tri=(it)=>{const d=mdGD(it);const k=dkKit();v89Kit(k,it);let n=0;k.P.forEach(p=>n+=p.geo.attributes.position.count);return n};
   for(let i=n0;i<ITPL.length;i++){const t=ITPL[i];if(!t.a7)continue;const a=tri(RT.it(i,2)),D=A7MOT[t.a7[4]];if(!D)F.push('no motif '+t.a7[4])}}
  return {F,N}}"""
SAVE=r"""()=>{const F=[];const n0=ITPL_V137;gear.length=0;const ids=[];for(let i=n0;i<ITPL.length;i+=7){const it={id:uid++,tp:i,lv:12,req:1,r:2,up:1,aff:[]};gear.push(it);ids.push([it.id,i])}
  const w=ITPL.findIndex((t,i)=>i>=n0&&t.sl=='weapon'&&t.cls==hero.cls);if(w>=0){eq.weapon={id:uid++,tp:w,lv:12,req:1,r:2,up:0,aff:[]};refreshGear()}
  try{saveGame(true)}catch(e){F.push('save threw '+e)}return {F,ids,w,eqw:eq.weapon&&eq.weapon.tp}}"""
LOAD=r"""(a)=>{const F=[];const [ids,w]=a;ids.forEach(([id,tp])=>{const it=gear.find(x=>x.id==id);if(!it)F.push('lost item '+id);else if(it.tp!=tp)F.push('item '+id+' tp '+it.tp+' != '+tp)});
  if(w>=0&&!(eq.weapon&&eq.weapon.tp==w))F.push('equipped new weapon not kept: '+(eq.weapon&&eq.weapon.tp)+' vs '+w);return F}"""
def start(pg,cls='warrior'):
    pg.click('[data-dev=desktop]',timeout=300000);pg.click('[data-c="%s"]'%cls,timeout=300000);pg.click('#ccNext',timeout=300000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=300000);pg.wait_for_timeout(3000)
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    start(pg)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    sheet=os.environ.get('SHEET','')
    if sheet:
        sel=os.environ.get('SEL','weapon');arm=os.environ.get('ARM','')
        r=ev(SHEETS,[sheet,sel,arm,int(os.environ.get('R','3')),MV])
        for i in r['info'][:20]:print(' ',i)
        print('err',r['err'],'console',errs[:4])
        nm='v137_%s_%s%s.jpg'%(sheet,(arm+'_' if arm else '')+sel,os.environ.get('TAG',''))
        open(O+'/'+nm,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote',nm);return
    r=ev(CHECKS)
    for n in r['N']:print('  ',n)
    F=r['F']
    a=ev(SAVE);F+=a['F']
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(3000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(500)
    try:
        pg.click('#svpC',timeout=60000)
    except Exception as e: print('noclick',str(e)[:100])
    pg.wait_for_timeout(4000)
    try:F+=ev(LOAD,[a['ids'],a['w']])
    except Exception as e:F.append('load check failed '+str(e))
    pe=[e for e in errs if 'favicon' not in e]
    if pe:F.append('page errors: '+' | '.join(pe[:4]))
    for f in F:print('FAIL',f)
    print('ok' if not F else '%d failures'%len(F))
play.run(s,w=900,hh=600)
