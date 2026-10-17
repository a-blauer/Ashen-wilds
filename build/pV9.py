# v86: Sovereign dens (zzK_dens.js foundation + one zzK_den<i>.js per boss, then build them all)
import os as _os,glob
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
P=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
h=open(P).read()
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(h.count(a),a[:90]);h=h.replace(a,b)
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1
dens=sorted(glob.glob(M+'zzK_den[0-9]*.js'))
h=h.replace(a,"\n"+open(M+'zzK_dens.js').read()+"\n"+"\n".join(open(f).read() for f in dens)+"\ndenBuildAll();\n"+a)
open(P,'w').write(h);print('v9 ok',len(dens))
