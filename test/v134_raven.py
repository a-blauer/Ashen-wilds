# v134 raven Mage: the race, and every piece of Mage gear fitted to him (bind pose, rest-space geometry + the v114 clip check).
#   python3 v134_raven.py      prints ok / FAIL lines
#   checks: the Mage is the raven (race 3, one tail bone); hats sit above the brows; hoods leave the eyes and beak free;
#   circlets ring the head above the eyes; robes end at mid-shank; footwear keeps the toes; wing feathers and the tail fan
#   never go through a robe (v114 clip pokes on the forearm / tail bones); the bare model builds.
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v114_clip_lib.js').read()
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info,flush=True)
    if not ok:FAIL.append(n)
JS=r"""()=>{const out={},it=(tp,r)=>({id:-1,tp,lv:1,req:1,r:r==null?3:r,up:0,aff:[]}),D=BRD[3];
  out.race={key:D&&D.key,cls:BR_CLS.mage,br:brRace({},'mage'),tb:D&&D.TB.length};
  const items=[];const seen={};ITPL.forEach((t,i)=>{if(!['helm','chest','boots'].includes(t.sl)||t.arm!='cloth')return;const d=mdGD(it(i));if(!d||seen[t.sl+d.st])return;seen[t.sl+d.st]=1;items.push({sl:t.sl,st:d.st,tp:i})});
  out.items=[];
  for(const I of items.concat([{sl:'outfit',st:'outfit',tp:-1}])){const E={};if(I.tp>=0)E[I.sl]=it(I.tp);const r={sl:I.sl,st:I.st};
    try{const {T,B}=CLIP.build('mage',E),c=CLIP.check(T,{names:B.O});const gear=T.filter(t=>t.l==I.sl||(I.sl=='outfit'&&(t.l=='outfit'||t.l=='chest'))),body=T.filter(t=>t.l=='body');
      const ys=a=>a.map(t=>Math.min(t.v[1],t.v[4],t.v[7]));r.n=gear.length;r.minY=gear.length?Math.min(...ys(gear)):null;
      // hood: the furthest forward point of the head piece around eye height (the beak and eyes must stay free)
      const near=gear.filter(t=>{const y=(t.v[1]+t.v[4]+t.v[7])/3,x=Math.abs((t.v[0]+t.v[3]+t.v[6])/3);return y>1.14&&y<1.21&&x>.05});r.eyeZ=near.length?Math.max(...near.map(t=>Math.max(t.v[2],t.v[5],t.v[8]))):null;
      // circlet / hat: lowest point in front of the skull's centre line (above the brows?)
      const front=gear.filter(t=>(t.v[2]+t.v[5]+t.v[8])/3>-.02);r.frontMinY=front.length?Math.min(...ys(front)):null;
      const bi=n=>B.O.indexOf(n),onB=(t,n)=>{const j=bi(n);for(let k=0;k<4;k++)if(t.si[k]==j&&t.sw[k]>.5)return true;return false};
      r.toes=body.filter(t=>onB(t,'lh2')||onB(t,'rh2')).length;
      r.pokeArm=(c.poke.aL1||0)+(c.poke.aR1||0)+(c.poke.aL2||0)+(c.poke.aR2||0);r.pokeTail=c.poke.tl0||0;r.hideHelm=c.hide['helm:head']||0;r.poke=c.nPoke;r.hide=c.nHide}
    catch(e){r.err=String(e)}
    out.items.push(r)}
  // the bare model
  try{BR.bare=true;const h=buildHero();h.mdLook={skin:D.fur[0],eye:D.eye[0],build:1,height:1,race:3};refreshGear(h,'mage',{});out.bare=!!huBody(h)&&huBody(h).geometry.attributes.position.count}catch(e){out.bareErr=String(e)}finally{BR.bare=false}
  return out}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("(L)=>{eval(L);window.requestAnimationFrame=()=>0}",LIB)
    r=ev(JS);R=r['race']
    chk('the Mage is the raven (race 3, one tail bone)',R['key']=='raven' and R['cls']==3 and R['br']==3 and R['tb']==1,R)
    chk('the bare raven builds',bool(r.get('bare')) and not r.get('bareErr'),r.get('bareErr') or r.get('bare'))
    for x in r['items']:
        n='%s:%s'%(x['sl'],x['st'])
        if x.get('err'):chk(n+' builds',False,x['err']);continue
        chk(n+' builds',x['n']>0,x['n'])
        if x['sl'] in ('chest','outfit'):
            chk(n+' ends at mid-shank (lowest point above .15)',x['minY']>=.15,round(x['minY'],3))
            chk(n+' no wing feathers through it (forearm pokes <= 4)',x['pokeArm']<=4,x['pokeArm'])
            chk(n+' no tail feathers through it (tail pokes <= 4)',x['pokeTail']<=4,x['pokeTail'])
        if x['sl']=='helm':
            if x['st'] in ('hat','witch'):chk(n+' sits above the brows (front lowest point > 1.2)',x['frontMinY']>1.2,round(x['frontMinY'],3))
            if x['st'] in ('circlet','diadem','crown'):chk(n+' rings the head above the eyes',x['frontMinY']>1.205,round(x['frontMinY'],3))
            if x['st'] in ('linen','tallcowl','star'):chk(n+' leaves the eyes free (forward edge behind z .03)',x['eyeZ'] is None or x['eyeZ']<.03,x['eyeZ'])
            chk(n+' is not buried in the head (hide <= 80)',x['hideHelm']<=80,x['hideHelm'])
        if x['sl']=='boots':chk(n+' keeps the bird feet (toes on the foot bones)',x['toes']>=300,x['toes'])
    print('FAILURES:',FAIL if FAIL else 'none')
play.run(s,w=900,hh=600)
