# Environment audit pictures: look at given world spots (a JSON list of views) and save one picture each plus a contact sheet.
#   python3 env_look.py views.json [TAG]
#   a view: {"n":name, "x":..,"z":.., "d":distance, "h":height above the target, "a":azimuth degrees, "ty":target height above ground}
#   The hero stands behind the camera (in the same instance), so the see-through window round the hero cuts nothing in view.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP+'/env'
os.makedirs(OUT,exist_ok=True)
V=json.load(open(sys.argv[1]));TAG=sys.argv[2] if len(sys.argv)>2 else 'look'
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=+(window.ENV_TOD||.3);document.querySelectorAll('#banner,#glog').forEach(e=>e.style.display='none')}")
    if os.environ.get('TOD'):ev("()=>{TOD=%s}"%os.environ['TOD'])
    shots=[]
    for i,v in enumerate(V):
        r=ev("""(v)=>{const d=v.d||8,h=v.h==null?3:v.h,a=(v.a||0)*Math.PI/180,ty=v.ty==null?1:v.ty;const gx=v.x,gz=v.z,g=GH(gx,gz);
          const cx=gx+Math.sin(a)*d,cz=gz+Math.cos(a)*d,hx=gx+Math.sin(a)*(d+3),hz=gz+Math.cos(a)*(d+3);
          if(v.js)eval(v.js);const I=insAt(Math.round(gx),Math.round(gz));toPos(hx,hz,a);try{rosterTick()}catch(_){}
          window.FCAM=null;STEP(1.2);const ly=v.ly!=null?v.ly:g+ty;FC([cx,(v.ay!=null?v.ay:ly+h),cz],[gx,ly,gz]);STEP(.3);return I?I.n:'?'}""",v)
        p=OUT+'/%s_%02d.png'%(TAG,i);L.shot(pg,p);shots.append((p,v.get('n','')));print(i,v.get('n',''),r,p,flush=True)
    try:
        from PIL import Image,ImageDraw
        ims=[Image.open(p) for p,_ in shots];w,h=ims[0].size;cols=3;rows=(len(ims)+cols-1)//cols;W2,H2=w//2,h//2
        sh=Image.new('RGB',(W2*cols,H2*rows))
        for i,im in enumerate(ims):
            t=im.resize((W2,H2));ImageDraw.Draw(t).text((6,6),'%d %s'%(i,shots[i][1]),fill=(255,255,0));sh.paste(t,((i%cols)*W2,(i//cols)*H2))
        sh.save(OUT+'/%s_sheet.png'%TAG)
    except Exception as e:print('sheet',e)
play.run(s,w=960,hh=560)
