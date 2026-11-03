# v194 rune look sheets: runed weapons and armour on a hero.
#   python3 v194_rune_look.py           -> out/v194_runes_weapons.jpg, out/v194_runes_armor.jpg
#   CLS=warrior (default)  T=item tier 0..4 (default 3)
# Rows = rune sets (single types and mixes); columns = whole hero (3/4), weapon or chest close-up, back (armour sheet).
# Also checks: the shells and motes exist on runed weapons and not on plain ones; the armour model key changes with runes.
import os,sys,re,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
CLS=os.environ.get('CLS','warrior');TI=int(os.environ.get('T','3'))
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
JS=COMMON+r"""(a)=>{const [cls,ti,mode]=a,V=THREE.Vector3,out={info:[]};const RACE={warrior:1,assassin:2,mage:3,paladin:4,ranger:5},arm=CLS[cls].arm;
  const mk=(tp,ru)=>({id:-1,tp,lv:ti*10+5,req:1,r:3,up:0,aff:[],rs:ru?ru.length:0,ru:ru||[]});
  const W=ITPL.findIndex(q=>q.sl=='weapon'&&q.cls==cls&&q.t==ti&&!q.nw),Hm=ITPL.findIndex(q=>q.sl=='helm'&&q.arm==arm&&q.t==ti&&!q.nw),Ch=ITPL.findIndex(q=>q.sl=='chest'&&q.arm==arm&&q.t==ti&&!q.nw),Bo=ITPL.findIndex(q=>q.sl=='boots'&&q.arm==arm&&q.t==ti&&!q.nw);
  const rows=mode=='w'?[[],['r_ember'],['r_frost'],['r_storm'],['r_venom'],['r_might'],['r_leech'],['r_ember','r_frost'],['r_storm2','r_venom2'],['r_leech3','r_might3'],['r_ember3','r_frost3','r_storm3']]
    :[[],['r_vigor'],['r_ward'],['r_deflect'],['r_tide'],['r_swift'],['r_thorns'],['r_vigor','r_ward'],['r_tide2','r_thorns2'],['r_vigor3','r_deflect3','r_swift3']];
  const FW=300,FH=330,cols=3,{rd,sc,pc}=RT.mk(FW,FH,0x111317);sc.children.forEach(o=>{if(o.isGridHelper)o.visible=false});
  const cnv=document.createElement('canvas');cnv.width=FW*cols;cnv.height=FH*rows.length;const ctx=cnv.getContext('2d');
  rows.forEach((ru,n)=>{const E={weapon:mk(W,mode=='w'?ru:null),helm:mk(Hm,mode=='a'?ru:null),chest:mk(Ch,mode=='a'?ru:null),boots:mk(Bo,mode=='a'?ru:null)};
    let H;try{H=RT.beast(cls,RACE[cls],E)}catch(e){out.info.push('ERR '+e);return}sc.add(H);RT.idle(H,400);
    let sh=0,pt=0;H.traverse(o=>{if(o.userData&&o.userData.rv194){if(o.isPoints)pt++;else if(o.isMesh)sh++}});out.info.push({ru:ru.join('+')||'none',shells:sh,motes:pt,key:H._mdKey&&H._mdKey.length});
    const bb=new THREE.Box3().setFromObject(H),c=bb.getCenter(new V()),hh=bb.getSize(new V()).y;
    const wg=(H.gearG||[])[0];let wc=c.clone();if(wg){const b2=new THREE.Box3().setFromObject(wg);wc=b2.getCenter(new V())}
    const chest=H.bones&&H.bones.chest?H.bones.chest.getWorldPosition(new V()):c.clone().setY(c.y+hh*.15);
    const views=mode=='w'?[[c,[.7,.25,1],hh*1.55],[wc,[0,.1,1],1],[wc,[1,.3,.2],1]]:[[c,[.6,.2,1],hh*1.6],[chest,[.35,.12,1],1.05],[chest,[.3,.15,-1],1.05]];
    const solo=(on)=>{const keep=new Set();(H.gearG||[]).forEach(g=>g.traverse(o=>keep.add(o)));H.traverse(o=>{if((o.isMesh||o.isPoints)&&!keep.has(o))o.layers.set(on?1:0)})};
    views.forEach(([tg,d,dist],j)=>{const wv=mode=='w'&&j>0;if(wv){solo(true);const b3=new THREE.Box3().setFromObject(wg);tg=b3.getCenter(new V());dist=b3.getSize(new V()).length()*1.25}
      pc.position.copy(tg).add(new V(...d).normalize().multiplyScalar(dist));pc.lookAt(tg);window.__T194=(j+1)*1.7;rd.render(sc,pc);ctx.drawImage(rd.domElement,j*FW,n*FH);if(wv)solo(false)});
    RT.lbl(ctx,ru.map(k=>rn194Name(k)).join(' + ')||'no runes',0,n*FH,FW*3);sc.remove(H)});
  out.url=cnv.toDataURL('image/jpeg',.86);return out}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    for mode,name in (('w','weapons'),('a','armor')):
        r=ev(JS,[CLS,TI,mode])
        open(O+'/v194_runes_%s.jpg'%name,'wb').write(base64.b64decode(r['url'].split(',')[1]));print('wrote v194_runes_%s.jpg'%name)
        for q in r['info']:print(' ',q)
        I=[q for q in r['info'] if isinstance(q,dict)]
        if mode=='w':
            chk('plain weapon has no rune look',bool(I) and I[0]['shells']==0 and I[0]['motes']==0,I[:1])
            chk('runed weapons have shells and motes',all(q['shells']>0 and q['motes']>0 for q in I[1:]),[q for q in I[1:] if not(q['shells']>0 and q['motes']>0)])
        chk(mode+' sheet built without errors',not [q for q in r['info'] if isinstance(q,str)],[q for q in r['info'] if isinstance(q,str)][:3])
    print('FAILS',len(FAIL))
play.run(s,w=900,hh=600)
