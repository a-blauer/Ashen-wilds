# v83 town: palisade logs get hand-hewn low-poly shapes; visitor stalls are built by twStall (zzG_town.js)
import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
P=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
h=open(P).read()
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(h.count(a),a[:90]);h=h.replace(a,b)
rep("const LG=new THREE.CylinderGeometry(.17,.2,1,7),LT=new THREE.ConeGeometry(.17,.6,7),","const LG=twPaliLog(),LT=twPaliTip(),")
rep("""    TQ(st,G_BOX,sm(0x3a2614),0,.5,0,1.6,1,.5);TQ(st,G_BOX,sm(0xc8b890),0,1.02,0,1.7,.05,.6);
    [-.8,.8].forEach(x=>TQ(st,G_BOX,sm(0x2a1a10),x,1.3,-.9,.08,2.6,.08));TQ(st,G_BOX,sm(col),0,2.55,-.55,1.9,.06,1.1,.35,0);""","    twStall(st,col);")
open(P,'w').write(h);print('pG_town ok')
