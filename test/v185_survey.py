# v185: a picture survey of every area of every instance (owner, Oct 31 2026: "thoroughly check every part of every instance
# and zone"). For each instance (the six zones' fields I-III and dens, the special instances, Duskhold) a grid of high oblique
# views without fog covers the whole rectangle; the hero stands at each spot so camps and set pieces near it are built.
#   python3 v185_survey.py [regex on the instance name] [TAG]  -> out/survey/<TAG>/<inst>_<nn>.png + <inst>_sheet.jpg
#   STEPX / STEPZ: grid spacing (default 46); H: camera height above the spot (24); D: distance back (20); W/HH: picture size
#   BRIGHT: exposure multiplier for the dark zones (Kindlelight, The Dirge, The Citadel; default 2.2) so the survey can see
import os,sys,json,re,time
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
FLT=sys.argv[1] if len(sys.argv)>1 else '.';TAG=sys.argv[2] if len(sys.argv)>2 else 'all'
OUT=play.TMP+'/survey/'+TAG;os.makedirs(OUT,exist_ok=True)
SX=float(os.environ.get('STEPX',46));SZ=float(os.environ.get('STEPZ',46));CH=float(os.environ.get('H',24));CD=float(os.environ.get('D',20))
BR=float(os.environ.get('BRIGHT',2.2))
PLAN=r"""([sx,sz,flt])=>{const re=new RegExp(flt),out=[];
  const add=(n,g,x0,y0,w,h,dark)=>{if(!re.test(n))return;const pts=[];const nx=Math.max(1,Math.round(w/sx)),nz=Math.max(1,Math.round(h/sz));
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+(i+.5)*w/nx,z=y0+(j+.5)*h/nz;let ok=0;
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const y=GH(Math.round(x+a*w/nx*.35),Math.round(z+b*h/nz*.35));if(y>-8)ok++}
      if(ok)pts.push([Math.round(x),Math.round(z)])}
    out.push({n,g,dark,pts})};
  INSL.forEach(I=>{if(I.tri)return;add(I.n,I.g,I.x0,I.y0,I.w,I.h,I.z===0||I.z===4||I.z===5)});
  add('Duskhold',-1,0,240,100,110,false);
  return out}"""
SHOT=r"""([p,ch,cd,br,k])=>{const [x,z]=p,g=GH(x,z),a=(k%4)*1.5708+.6;
  {try{if(typeof AF!=="undefined"&&AF)arenaClear(AF)}catch(_){}}toPos(x-Math.sin(a)*1.5,z-Math.cos(a)*1.5,a);try{rosterTick()}catch(_){}
  window.EXB=br;window.FCAM=null;STEP(1.0);
  const cx=x+Math.sin(a)*cd,cz=z+Math.cos(a)*cd;FC([cx,g+ch,cz],[x,g,z],true);STEP(.25);try{if(typeof AF!=="undefined"&&AF)arenaClear(AF)}catch(_){}
  const I=insAt(x,z);return {inst:I?I.n:'?',g:Math.round(g*10)/10}}"""
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.32;document.querySelectorAll('#banner,#glog,#pk').forEach(e=>e.style.display='none');const f=POST.render;POST.render=function(){const u=POST.u.ex,v=u.value;if(window.EXB&&window.EXB!==1)u.value=v*EXB;const r=f.apply(this,arguments);u.value=v;return r}}")
    plan=ev(PLAN,[SX,SZ,FLT]);tot=sum(len(p['pts']) for p in plan);print('instances',len(plan),'views',tot,flush=True)
    idx=[];t0=time.time();k=0
    for P in plan:
        nm=re.sub(r'[^A-Za-z0-9]+','_',P['n']).strip('_');shots=[]
        for i,p in enumerate(P['pts']):
            r=ev(SHOT,[p,CH,CD,BR if P['dark'] else 1,k]);k+=1
            f=OUT+'/%s_%02d.png'%(nm,i);L.shot(pg,f);shots.append({'f':f,'x':p[0],'z':p[1],'inst':r['inst']})
        idx.append({'n':P['n'],'shots':shots});print(P['n'],len(shots),'views, %.0fs so far'%(time.time()-t0),flush=True)
        try:
            from PIL import Image,ImageDraw
            ims=[Image.open(q['f']) for q in shots];w,h=ims[0].size;cols=4;rows=(len(ims)+cols-1)//cols;W2,H2=w//2,h//2
            sh=Image.new('RGB',(W2*cols,H2*rows))
            for j,im in enumerate(ims):
                t=im.resize((W2,H2));ImageDraw.Draw(t).text((5,4),'%d (%d,%d)'%(j,shots[j]['x'],shots[j]['z']),fill=(255,255,0));sh.paste(t,((j%cols)*W2,(j//cols)*H2))
            sh.save(OUT+'/%s_sheet.jpg'%nm,quality=88)
        except Exception as e:print('sheet',e)
        json.dump(idx,open(OUT+'/index.json','w'))
    print('done %.0fs'%(time.time()-t0),flush=True)
play.run(s,w=int(os.environ.get('W',900)),hh=int(os.environ.get('HH',520)))
