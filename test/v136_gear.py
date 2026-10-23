# v136 gear: every helm / chest / boots style of every class built on its animal at rarity 0 and 4, with a weapon:
# no errors, every late piece (hood, quiver) built, triangle counts sane, the hood stands clear of the head and neck
# in the bind pose (its inner surface never inside the body), robes / coats / skirts swing (vertices on the cape bones).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
JS=r"""()=>{window.requestAnimationFrame=()=>0;const out={},it=(tp,r)=>({id:-1,tp,lv:1,req:1,r,up:0,aff:[]});
  const R={warrior:1,assassin:2,mage:3,paladin:4,ranger:5},WT={warrior:'gs',assassin:'dagger',mage:'staff',paladin:'mace',ranger:'bow'};
  for(const cls in R){const D=BRD[R[cls]],arm=CLS[cls].arm,seen={},list=[];
    ITPL.forEach((t,i)=>{if(!['helm','chest','boots'].includes(t.sl)||t.arm!=arm)return;const d=mdGD(it(i,0));if(!d||seen[t.sl+d.st])return;seen[t.sl+d.st]=1;list.push(i)});
    const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls==cls&&itT(it(i,0)).wt==WT[cls]),res=[];
    for(const tp of list)for(const r of [0,4]){const t=ITPL[tp],E={[t.sl]:it(tp,r)},L=mdLookN({skin:D.fur[0],eye:D.eye[0],build:1,height:1,race:D.id},cls);let B=null,err=null,ms=0;
      const t0=performance.now();try{B=mdHeroB(cls,L,E)}catch(e){err=String(e)}ms=performance.now()-t0;
      let tris=0,cape=0,head=null;if(B){for(const q in B.L)tris+=B.L[q].p.length/9;const L2=B.L.c,ci=['cp0','cp1','cp2'].map(n=>B.O.indexOf(n));
        for(let v=0;v<L2.si.length/4;v++)for(let j=0;j<4;j++)if(ci.includes(L2.si[v*4+j])&&L2.sw[v*4+j]>.05){cape++;break}}
      res.push({n:t.n,sl:t.sl,st:mdGD(E[t.sl]).st,r,err,ms:Math.round(ms),tris,cape,hood:!!GK_HOOD[mdGD(E[t.sl]).st]})}
    // the hero model itself (refreshGear) with a full set and the weapon, a few frames of animation
    let aerr=null;try{const h=buildHero();h.mdLook={skin:D.fur[0],eye:D.eye[0],build:1,height:1,race:D.id};const E={};['helm','chest','boots'].forEach(sl=>{const tp=list.find(i=>ITPL[i].sl==sl&&ITPL[i].t==4)||list.find(i=>ITPL[i].sl==sl);if(tp!=null)E[sl]=it(tp,4)});
      if(wtp>=0)E.weapon=it(wtp,4);refreshGear(h,cls,E);for(let t=0;t<40;t++)animHero(9e5+t*16,t>20,h)}catch(e){aerr=String(e)}
    out[cls]={res,aerr}}
  return out}"""
# bind-pose hood clearance: the hood's inner lining must stay outside the head, the neck and the shoulders
JS2=r"""()=>{const it=(tp,r)=>({id:-1,tp,lv:1,req:1,r,up:0,aff:[]}),R={assassin:2,mage:3,ranger:5},out=[];
  for(const cls in R){const D=BRD[R[cls]],arm=CLS[cls].arm;ITPL.forEach((t,i)=>{if(t.sl!='helm'||t.arm!=arm)return;const d=mdGD(it(i,0));if(!d||!GK_HOOD[d.st])return;
    const L=mdLookN({skin:D.fur[0],eye:D.eye[0],build:1,height:1,race:D.id},cls);let n0=null;const f=window.gkHood;
    // count body/armour points that end up outside the hood's surface (inside the cloth's reach) at rows of the head
    window.gkHood=function(B,P,o){const pts=gkPts(B,.9,1.5,(x,y,z)=>z<(D.EYEP[2]-(D.eyeR||.021)-.03)&&x*x+z*z<.3*.3,/^(a[LR]2|tl\d)/),Hd=f.apply(this,arguments);let bad=0;
      for(let q=0;q<pts.length;q+=3){const x=pts[q],y=pts[q+1],z=pts[q+2];if(y<Hd.ys[1]||y>Hd.ys[Hd.nr-2])continue;let i=0,b=9;Hd.ys.forEach((yy,ii)=>{const dd=Math.abs(yy-y);if(dd<b){b=dd;i=ii}});
        const th=(Math.atan2(x,z-Hd.cz[i])+Math.PI*2)%(Math.PI*2),p=Hd.phi[i]||0;if(th<p+.05||th>Math.PI*2-p-.05)continue;const j=Math.round(th/(Math.PI*2)*Hd.N)%Hd.N,r=Hd.R[i][j];
        if(Math.hypot(x,z-Hd.cz[i])>r+.002)bad++}n0={bad,n:pts.length/3};return Hd};
    try{mdHeroB(cls,L,{helm:it(i,0)})}finally{window.gkHood=f}out.push({cls,n:t.n,st:d.st,res:n0})})}
  return out}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    errs=[];pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') and 'v136' in m.text else None)
    R=ev(JS)
    for cls,v in R.items():
        bad=[x for x in v['res'] if x['err']];chk(cls+': every piece builds',not bad and not v['aerr'],(bad[:3],v['aerr']))
        slow=max(x['ms'] for x in v['res']);chk(cls+': builds take under 1.5 s',slow<1500,'slowest %d ms'%slow)
        big=max(x['tris'] for x in v['res']);chk(cls+': triangles under 60k',big<60000,'most %d'%big)
        hoods=[x for x in v['res'] if x['hood']]
        chk(cls+': hoods are built (late pieces ran)',all(x['tris']>0 for x in hoods),len(hoods))
        if cls in('mage','assassin'):
            ch=[x for x in v['res'] if x['sl']=='chest']
            chk(cls+': every chest piece swings on the cape bones',all(x['cape']>40 for x in ch),[x['cape'] for x in ch])
    H=ev(JS2)
    for h in H:
        r=h['res'];chk('%s %s: hood clears the head and neck'%(h['cls'],h['st']),r is not None and r['bad']<=max(3,r['n']*.002),r)
    chk('no v136 errors or warnings in the console',not errs,errs[:3])
play.run(s,w=900,hh=600)
print('FAILURES:',FAIL if FAIL else 'none')
