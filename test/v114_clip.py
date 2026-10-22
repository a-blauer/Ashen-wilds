# v114 armour clipping check: every helm / chest / boots style of each class (tiers + sets), plus amulet and ring, on its
# animal; bind pose and posed frames (idle, run, attack wind-up, attack strike). Prints counts of
#   poke = body triangles with armour just beneath (fur through the gear), hide = armour triangles under the body surface.
#   python3 v114_clip.py            RACE=rat,cat  POSED=0 (bind pose only)  ONLY=boots,helm:hat (combos whose name has one of these)  OUT=out/v114_clip.json   MAX=… (fail threshold)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v114_clip_lib.js').read()
RACES={'rat':('warrior','gs','gs1'),'cat':('assassin','dagger','dag1'),'raven':('mage','staff','sword0'),'badger':('paladin','mace','mace1'),'weasel':('ranger','bow','sling')}
RL=[r for r in os.environ.get('RACE','rat,cat,raven,badger,weasel').split(',') if r in RACES]
POSED=os.environ.get('POSED','1')!='0';MAX=int(os.environ.get('MAX','0'))
JS=r"""async(a)=>{const [cls,wt,mv,posed]=a;POST.render=()=>{};
  const it=(tp,r)=>({id:-1,tp,lv:1,req:1,r:r==null?3:r,up:0,aff:[]});const arm=CLS[cls].arm;
  // one item of every helm / chest / boots style of the class's armour type (tiers and sets)
  const seen={},items=[];ITPL.forEach((t,i)=>{if(!['helm','chest','boots'].includes(t.sl)||t.arm!=arm)return;const d=mdGD(it(i));if(!d||seen[t.sl+d.st])return;seen[t.sl+d.st]=1;items.push({sl:t.sl,tp:i,st:d.st,n:t.n})});
  const am=ITPL.findIndex(t=>t.sl=='amulet'),rg=ITPL.findIndex(t=>t.sl=='ring'),wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls==cls&&itT(it(i)).wt==wt);
  const combos=[{n:'class outfit',E:{}}].concat(items.map(x=>({n:x.sl+':'+x.st+' ('+x.n+')',E:{[x.sl]:it(x.tp)}})));if(am>=0&&rg>=0)combos.push({n:'amulet+ring',E:{amulet:it(am),ring:it(rg)}});
  if(!V100A.T.sword0)V100A_build();
  const pose=(H,k)=>{const T=V100A.T[mv];if(!T)return;const P=T(k),b=H.bones;for(const c in P){const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]=P[c]}H.updateMatrixWorld(true)};
  const out=[];let Tm=9e5;const ONLY=window.CLIP_ONLY;
  for(const C of combos){if(ONLY&&!ONLY.some(o=>C.n.includes(o)))continue;const {T,B}=CLIP.build(cls,C.E),r={n:C.n,bind:CLIP.check(T,{names:B.O})};
    if(posed){const D=brOf(cls),h=buildHero();h.mdLook={skin:D.fur[2]||D.fur[0],eye:D.eye[0],build:1,height:1,race:D.id};const E=Object.assign({},C.E);if(wtp>=0)E.weapon=it(wtp);refreshGear(h,cls,E);
      const W=CLIP.warp(B,T),frames={};
      for(let t=0;t<900;t+=16){Tm+=16;animHero(Tm,false,h);h.position.set(0,0,0)}h.updateMatrixWorld(true);frames.idle=CLIP.check(CLIP.posed(h,W),{names:B.O});
      for(let t=0;t<900;t+=16){Tm+=16;animHero(Tm,true,h);h.position.set(0,0,0)}h.updateMatrixWorld(true);frames.run=CLIP.check(CLIP.posed(h,W),{names:B.O});
      pose(h,.35);frames.windup=CLIP.check(CLIP.posed(h,W),{names:B.O});pose(h,.62);frames.strike=CLIP.check(CLIP.posed(h,W),{names:B.O});
      r.posed=frames}
    out.push(r)}
  return out}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(L)=>{eval(L);window.requestAnimationFrame=()=>0}",LIB)
    if os.environ.get('HUMAN'):ev("()=>{CLIP.human=1}")
    if os.environ.get('ONLY'):ev('(o)=>{window.CLIP_ONLY=o}',os.environ['ONLY'].split(','))
    ALL={};worst=0
    for race in RL:
        cls,wt,mv=RACES[race]
        res=ev(JS,[cls,wt,mv,POSED]);ALL[race]=res
        print('==',race,cls,flush=True)
        for r in res:
            fr=[('bind',r['bind'])]+(list(r['posed'].items()) if POSED else [])
            cnt=' '.join('%s %d/%d'%(k,v['nPoke'],v['nHide']) for k,v in fr)
            top={}
            for k,v in fr:
                for kk,n in list(v['poke'].items())+[('hide '+a,b) for a,b in v['hide'].items()]:top[kk]=max(top.get(kk,0),n)
            tops=', '.join('%s %d'%(k,n) for k,n in sorted(top.items(),key=lambda x:-x[1])[:5])
            worst=max([worst]+[v['nPoke']+v['nHide'] for k,v in fr])
            print('  %-44s %s   | %s'%(r['n'][:44],cnt,tops),flush=True)
    json.dump(ALL,open(os.environ.get('OUT',play.TMP+'/v114_clip.json'),'w'))
    print('WORST',worst);print('FAILURES:','none' if worst<=MAX else ['clipping above %d'%MAX])
play.run(s,w=900,hh=600)
