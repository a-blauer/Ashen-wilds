# v185: close pictures of every camp (all their structures: tents, huts, palisades, towers ...): eight views from inside the
# camp looking out at its ring of structures, ~6 m up, no fog.   python3 v185_camps.py [regex on instance name] [TAG]
#   CAMPS=0,6,13: only those camps.  -> out/survey/<TAG>/camp_<i>_<side>.png + camps_sheet_<n>.jpg; index in out/survey/<TAG>/camps.json
import os,sys,json,re,time
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
FLT=sys.argv[1] if len(sys.argv)>1 else '.';TAG=sys.argv[2] if len(sys.argv)>2 else 'camps'
OUT=play.TMP+'/survey/'+TAG;os.makedirs(OUT,exist_ok=True);BR=float(os.environ.get('BRIGHT',2.2))
PLAN=r"""(flt)=>{const re=new RegExp(flt),o=[];CAMPS.forEach(C=>{const I=insAt(C.x,C.z);if(!I||!re.test(I.n))return;o.push({kind:'camp',i:C.i,x:C.x,z:C.z,r:C.r||12,n:I.n,name:(C.th&&C.th.n)||C.key||'',dark:I.z===0||I.z===4||I.z===5})});
  INSL.forEach(I=>{if(I.tri||!re.test(I.n))return;const d=I.z===0||I.z===4||I.z===5;if(I.ba)o.push({kind:'boss',i:'b'+I.g,x:I.ba[0],z:I.ba[1],r:I.den?24:14,n:I.n,name:'boss area',dark:d});
    if(I.en)o.push({kind:'entry',i:'e'+I.g,x:Math.round(I.en[0]),z:Math.round(I.en[1]),r:10,n:I.n,name:'entrance',dark:d})});o.sort((a,b)=>(a.kind=='boss'&&/Den/.test(a.n))-(b.kind=='boss'&&/Den/.test(b.n)));return o}"""
SHOT=r"""([P,k,br])=>{const a=k*.785+.2,R=P.r,dx=Math.sin(a),dz=Math.cos(a),tx=P.x+dx*R*.62,tz=P.z+dz*R*.62,cx=P.x+dx*R*.12,cz=P.z+dz*R*.12,g=GH(tx,tz),gc=GH(cx,cz);
  {try{if(typeof AF!=="undefined"&&AF)arenaClear(AF)}catch(_){}}toPos(P.x-dx*2,P.z-dz*2,a+3.1416);try{rosterTick()}catch(_){}
  window.EXB=br;window.FCAM=null;STEP(k?0.25:1.2);FC([cx,Math.max(gc,g)+5.5,cz],[tx,g+.6,tz],true);try{if(typeof AF!=="undefined"&&AF)arenaClear(AF)}catch(_){}STEP(.15);return 1}"""
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.32;document.querySelectorAll('#banner,#glog,#pk').forEach(e=>e.style.display='none');const f=POST.render;POST.render=function(){const u=POST.u.ex,v=u.value;if(window.EXB&&window.EXB!==1)u.value=v*EXB;const r=f.apply(this,arguments);u.value=v;return r}}")
    plan=ev(PLAN,FLT);ONLY=os.environ.get('CAMPS');plan=[p for p in plan if not ONLY or (p['kind']=='camp' and str(p['i']) in ONLY.split(','))];print('places',len(plan),flush=True);t0=time.time();idx=[]
    from PIL import Image,ImageDraw
    for j,P in enumerate(plan):
        fs=[]
        for k in range(8 if P['kind']=='camp' else 0):
            ev(SHOT,[P,k,BR if P['dark'] else 1]);f=OUT+'/%s_%s_%d.png'%(P['kind'],P['i'],k);L.shot(pg,f);fs.append(f)
        if not fs:continue
        P['files']=fs;idx.append(P);json.dump(idx,open(OUT+'/camps.json','w'))
        ims=[Image.open(f) for f in fs];w,h=ims[0].size;sh=Image.new('RGB',(w,h*2))
        for q,im in enumerate(ims):sh.paste(im.resize((w//2,h//2)),((q%2)*w//2,(q//2)*h//2))
        ImageDraw.Draw(sh).text((6,4),'%s %s  %s  (%d,%d)'%(P['n'],P['kind'],P['name'],P['x'],P['z']),fill=(255,255,0));sh.save(OUT+'/%s_%s_sheet.jpg'%(P['kind'],P['i']),quality=88)
        print(j,P['n'],P['kind'],P['name'],'%.0fs'%(time.time()-t0),flush=True)
play.run(s,w=int(os.environ.get('W',900)),hh=int(os.environ.get('HH',520)))
