# v134: zone uniques — every unique made at its zone's level, names / stats / tooltip, the drop roll, and a contact sheet of their
# models (icons kit; weapons for three classes) -> out/v134_uniques.jpg
import os,sys,re,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
JS=COMMON+r"""()=>{const F=[],out={};const FW=200,FH=200,{rd,sc,pc}=RT.mk(FW,FH,0x2c3036),V=THREE.Vector3;
  const keys=Object.keys(UNQ134),cells=[];const cls0=hero.cls;
  keys.forEach(k=>{const U=UNQ134[k];const C=U.sl=='weapon'?['warrior','ranger','mage']:[cls0];C.forEach(c=>{hero.cls=c;const it=unqMake134(k,U.z!=null?PMAP[U.z].lv[1]:30);hero.cls=cls0;
    if(!it){F.push('could not make '+k+' for '+c);return}const nm=itName(it),st=itStats(it);
    if(!/✦/.test(nm))F.push('no unique name '+k);for(const s in U.e)if(!(st[s]>=U.e[s]-1e-9))F.push('bonus missing '+k+' '+s);
    if(it.r!==4||it.aff.length<4)F.push('rarity/affixes '+k+' '+it.r+' '+it.aff.length);
    const tip=kqmGearTip(it,{});if(!/✦ Unique/.test(tip)||!/Unique /.test(tip))F.push('tooltip '+k);
    cells.push({k,c,it,nm})})});
  // the drop roll: force it and see a unique on the ground in a field instance
  const I=PMAP[3].ins[1];insArrive(I);const P0=UNQ134_P.kill;UNQ134_P.kill=1;const n0=drops.length;
  unqRoll134({m:{position:new V(I.en[0],0,I.en[1])},c:{}});UNQ134_P.kill=P0;const d=drops.slice(n0).find(q=>q.kind=='gear'&&q.data&&q.data.u);
  if(!d)F.push('no unique dropped');else{out.dropped=itName(d.data);if(UNQ134[d.data.u].z!==3)F.push('wrong zone unique '+d.data.u)}
  // fishing: a forced catch roll brings up a fishing unique; monsters never drop one
  {const n2=drops.length,P1=UNQ134_FISH[3];UNQ134_FISH[3]=1;const ok=unqFish134(3,pl.position.clone());UNQ134_FISH[3]=P1;const d2=drops.slice(n2).find(q=>q.kind=='gear'&&q.data&&q.data.u);
   if(!ok||!d2||UNQ134[d2.data.u].src!=='fish')F.push('no fishing unique');else{out.fished=itName(d2.data);if(!/Fished up/.test(kqmGearTip(d2.data,{})))F.push('fish tooltip')}
   for(const z in UNQ134_ZK)if(UNQ134_ZK[z].some(k=>UNQ134[k].src==='fish'))F.push('fishing unique in zone list '+z)}
  // no roll in Duskhold
  const n1=drops.length;UNQ134_P.kill=1;TWN100_home();unqRoll134({m:{position:pl.position.clone()},c:{}});UNQ134_P.kill=P0;if(drops.length!==n1)F.push('unique dropped in town');
  // contact sheet of the models
  const cols=7,rows=Math.ceil(cells.length/cols),cnv=document.createElement('canvas');cnv.width=FW*cols;cnv.height=FH*rows;const x=cnv.getContext('2d');
  cells.forEach((C,i)=>{const g=lgGroup('T|'+v89Key(C.it),k=>v89Kit(k,C.it),.14),P=new THREE.Group();P.add(g);v89Pose(g,itT(C.it));P.position.y=1.5;sc.add(P);P.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(P),c=bb.getCenter(new V()),r=bb.getSize(new V()).length()/2;pc.position.copy(c).add(new V(.15,.2,1).normalize().multiplyScalar(r*4.2));pc.lookAt(c);
    rd.render(sc,pc);x.drawImage(rd.domElement,(i%cols)*FW,Math.floor(i/cols)*FH);RT.lbl(x,C.nm.slice(0,28),(i%cols)*FW,Math.floor(i/cols)*FH,FW);sc.remove(P)});
  // the hero holding a unique weapon
  hero.cls=cls0;const w=unqMake134('bloodthorn',30);eq.weapon=w;refreshGear();const W=(pl.gearG||[])[0];out.held=W?W.children.length:0;if(!W)F.push('no held weapon');
  out.names=cells.map(c=>c.nm);return {F,out,img:cnv.toDataURL('image/jpeg',.88)}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev(JS)
    for f in r['F']:print('FAIL',f)
    print(json.dumps(r['out'])[:1500])
    open(play.TMP+'/v134_uniques.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
    if not r['F']:print('OK v134 uniques')
play.run(s,w=900,hh=600)
