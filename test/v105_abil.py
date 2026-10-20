# v105: every companion ability's own move + effect. For each spell: cast it from a companion of its family at a
# training dummy, check it did its work (damage / shield / heal / buff / zone), and shoot the strike moment.
#   python3 v105_abil.py          checks + sheets out/v105_abil_<n>.png          SP=Cyclone,Hex  only those   NOSHOT=1
import os,json,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
from PIL import Image,ImageDraw
OUT=play.TMP;NOSHOT=os.environ.get('NOSHOT');ONLY=[q for q in os.environ.get('SP','').split(',') if q];fails=[]
def s(pg):
    L.start(pg);ev=pg.evaluate
    names=ev("()=>Object.keys(CSP)")
    if ONLY:names=[n for n in names if n in ONLY]
    ev("""()=>{const p=PMAP[0].path[60];toPos(p[0],p[1]);hero.lvl=50;hero.hp=heroMax();TOD=.35;STEP(.5);
      window.SPF=n=>{for(const k of SPK){if(SP2[k][8]==n)return k}for(const f in EVSP)if(EVSP[f].includes(n))return famTier(f,1);return 'Foxlet'};
      window.SETC=n=>{const sp=SPF(n),c=hatch(Object.assign(mkEgg(sp,0,1),{basic:true}));c.l=50;c.h=M(c);party=[c].concat(party.filter(q=>q!==c)).slice(0,3);cmpSel=0;c.sp=[n];c.cdm={};c.emp=false;ui();STEP(.1);return sp};
      return 1}""")
    res=[];ims=[]
    for n in names:
        r=ev("""(n)=>{const sp=SETC(n),f=fols[0],c=party[0];enemies.slice().forEach(e=>{if(e.__d)removeE(e)});
          const P=pl.position,a=camYaw;f.position.set(P.x+1.2,0,P.z);f.rotation.y=0;
          const e=spawnEnemy(EN.goo?'goo':Object.keys(EN)[0],P.x+1.2,P.z+2.6,30,{});e.__d=1;e.c.st.hp=1e9;e.c.h=6e8;e.agg=0;e.cd=99;e.m.position.set(P.x+1.2,0,P.z+2.6);
          hero.sh=0;hero.hp=heroMax()*.5;hero.buffs=[];const h0=e.c.h,z0=zones.length,s0=shots.length,hp0=hero.hp;
          c.cdm[n]=999;compCast(c,f,CSP[n],e);const R=SPX105[n],M=MV105[R?R.m:'snap'],D=M?M.D*(R.d||1):400,hk=M?M.h:.5;
          window.__AB={e,h0,z0,s0,hp0,D,hk,n,f};return {n,sp,mv:R&&R.m,D}}""",n)
        # step to the strike moment (+ a little), shoot, then finish the motion and let projectiles land
        ev("()=>{const A=__AB;STEP(A.D*A.hk/1000+.06)}")
        if not NOSHOT:
            ev("""()=>{const A=__AB,f=A.f,e=A.e,p=f.position,q=e.m.position,mx=(p.x+q.x)/2,mz=(p.z+q.z)/2;FC([mx+4.6,1.0+2.6,mz-.6],[mx,.8,mz])}""")
            p=OUT+'/v105_abil_one.png';L.shot(pg,p);im=Image.open(p);w,h=im.size;im=im.crop((int(w*.12),int(h*.05),int(w*.88),int(h*.95))).resize((300,220));d=ImageDraw.Draw(im);d.rectangle([0,0,300,14],fill=(0,0,0));d.text((3,1),n+' · '+str(r['mv']),fill=(255,230,170));ims.append(im)
        o=ev("""()=>{const A=__AB;window.FCAM=null;const e=A.e;e.c.st.pa=0;e.c.st.ma=0;STEP(Math.max(.05,A.D/1000*(1-A.hk))+.05);const lk=A.f._m105?'moving':'';STEP(1.2);
          return {dmg:Math.round(A.h0-e.c.h),zone:zones.length>A.z0||zones.some(z=>z.cc),shots:shots.length-A.s0,sh:Math.round(hero.sh),heal:Math.round(hero.hp-A.hp0),buff:hero.buffs.length,lk:lk}}""")
        k=ev("(n)=>CSP[n].k",n);good=(o['dmg']>0) if k in('bite','cone','nova','beam','bolt','fan','chain','meteor','rain') else (o['sh']>0 if k=='shield' else o['heal']>0 if k=='heal' else o['buff']>0)
        good=good and not o['lk']
        print(('PASS ' if good else 'FAIL ')+n,k,r['mv'],json.dumps(o));res.append((n,good))
        if not good:fails.append(n)
    if ims:
        for i in range(0,len(ims),12):
            S=Image.new('RGB',(1200,660));[S.paste(im,((j%4)*300,(j//4)*220)) for j,im in enumerate(ims[i:i+12])];S.save(OUT+'/v105_abil_%d.png'%(i//12))
    u=ev("()=>{const s=new Set(Object.keys(SPX105).map(k=>{const R=SPX105[k];return [R.m,R.a||1,R.d||1,R.sg||1].join('|')}));return [s.size,Object.keys(SPX105).length,Object.keys(CSP).filter(k=>!SPX105[k])]}")
    print('motions',u);ok=u[0]==u[1] and not u[2]
    print(('PASS ' if ok else 'FAIL ')+'every spell has its own recipe and no two share the same motion settings',u)
    if not ok:fails.append('unique')
    print('CHECKS OK' if not fails else 'CHECKS FAILED: '+', '.join(fails))
play.run(s,w=1000,hh=620)
