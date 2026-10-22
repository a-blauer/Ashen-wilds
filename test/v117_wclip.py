# v116 weapon clipping: the raven Mage (or RACE=) with each weapon type and robe tier, idle / run / attack frames.
# Prints weapon points inside the robe / armour shell (v117_wclip_lib.js) and writes out/v117_wclip_<race>.jpg (red = inside).
#   RACE=raven (default)  WT=staff,wand,orb  MAX=… fail when any idle/run frame has more inside points than this (default 0)
import os,sys,json,base64,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
LIB=open(HERE+'/v117_wclip_lib.js').read()
RACES={'rat':('warrior',1,'sword0'),'cat':('assassin',2,'dag1'),'raven':('mage',3,'sword0'),'badger':('paladin',4,'mace1'),'weasel':('ranger',5,'sling')}
RACE=os.environ.get('RACE','raven');cls,rid,mv=RACES[RACE]
WTS=os.environ.get('WT','staff,wand,orb' if RACE=='raven' else '').split(',')
MAX=int(os.environ.get('MAX','0'));FAIL=[]
JS=COMMON+r"""(a)=>{const [cls,race,wts,mv,SL]=a,FW=230,FH=300,{rd,sc,pc}=RT.mk(FW,FH),V=THREE.Vector3,res=[];
  const arm=CLS[cls].arm,tiers=[null,0,2,4],ST=window.STY_,frames=['idle','run1','run2','run3','wind-up','strike'];
  const cnv=document.createElement('canvas');cnv.width=FW*frames.length;cnv.height=FH*wts.length*tiers.length;const ctx=cnv.getContext('2d');let row=0,H=null;
  const dots=new THREE.Group();sc.add(dots);const dg=new THREE.SphereGeometry(.008,4,3),dm=new THREE.MeshBasicMaterial({color:0xff2020,depthTest:false});
  for(const wt of wts){const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls==cls&&itT(RT.it(i)).wt==wt);
    for(const ti of tiers){const E={};if(wtp>=0)E.weapon=RT.it(wtp,2);
      if(ti!=null)['helm','chest','boots'].forEach(sl=>{const tp=RT.find(sl,arm,SL[sl][ti]);if(tp>=0)E[sl]=RT.it(tp,Math.min(4,ti))});
      if(H)sc.remove(H);H=RT.beast(cls,race,E);sc.add(H);
      const name=wt+' · '+(ti==null?'class outfit':'tier '+(ti+1));
      frames.forEach((fr,col)=>{if(fr=='idle')RT.idle(H,700);else if(fr.startsWith('run')){for(let t=0;t<(fr=='run1'?900:170);t+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true)}
        else{RT.idle(H,300);H.sw=1;for(let t=0;t<500;t+=16){RT.T+=16;animHero(RT.T,false,H);H.position.set(0,0,0)}RT.pose(H,mv,fr=='wind-up'?.35:.62);H.sw=0}
        const m=WCLIP.measure(H);res.push({w:wt,t:ti,f:fr,n:m.n,in:m.inside,d:m.depth});
        while(dots.children.length)dots.remove(dots.children[0]);m.pts.forEach(p=>{const s=new THREE.Mesh(dg,dm);s.renderOrder=9;s.position.set(p[0],p[1],p[2]);dots.add(s)});
        const cb=new V(0,.7,0),d=new V(.75,.25,.85).normalize().multiplyScalar(3.4);pc.position.copy(cb).add(d);pc.lookAt(cb);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);
        RT.lbl(ctx,(col?'':name+' · ')+fr+' · '+m.inside,col*FW,row*FH,FW)});
      row++}}
  sc.remove(H);sc.remove(dots);return {img:cnv.toDataURL('image/jpeg',.86),res,err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{"+LIB+"}")
    A={'warrior':'heavy','paladin':'heavy','assassin':'light','ranger':'medium','mage':'cloth'}[cls]
    SL={'helm':{'heavy':['nasal','horned','great','visage','winged'],'medium':['hood','pelt','cowl','skullhood','galemask'],'light':['wrap','viper','ashcowl','glassmask','stormhood'],'cloth':['linen','hat','circlet','diadem','crown']}[A],
        'chest':{'heavy':['mail','hauberk','cuirass','warplate','aegis'],'medium':['padded','brigandine','vest','longcoat','mantle'],'light':['wraps','scale','garb','shroud','raiment'],'cloth':['robe','moss','pyre','vestments','regalia']}[A],
        'boots':{'heavy':['hobnail','sabaton','greave','stomper','tread'],'medium':['trail','pelt','stalker','strider','gale'],'light':['soft','wrapped','ashstep','glass','storm'],'cloth':['sandal','slipper','pyre','lich','tempest']}[A]}
    r=ev(JS,[cls,rid,[w for w in WTS if w] or [None],mv,SL])
    open(play.TMP+'/v117_wclip_%s.jpg'%RACE,'wb').write(base64.b64decode(r['img'].split(',')[1]))
    tot={}
    for q in r['res']:
        k='carry' if q['f'] in('idle','run1','run2','run3') else 'attack';tot.setdefault(k,[0,0]);tot[k][0]+=q['in'];tot[k][1]=max(tot[k][1],q['d'])
        if q['in']:print('  %-6s tier %-4s %-8s inside %4d / %4d  depth %.3f'%(q['w'],q['t'],q['f'],q['in'],q['n'],q['d']))
    print('totals (inside points, deepest m):',tot,r['err'])
    bad=[q for q in r['res'] if q['f'] in('idle','run1','run2','run3') and q['in']>MAX]
    print(('ok   ' if not bad else 'FAIL ')+'%s: no weapon points inside the robe/armour while carrying (%d frames over) %s'%(RACE,len(bad),' '.join('%s/t%s/%s:%d@%.3f'%(q['w'],q['t'],q['f'],q['in'],q['d']) for q in bad)))
    if bad:FAIL.append('carry')
play.run(s,w=900,hh=600)
print('FAILURES:',FAIL if FAIL else 'none')
