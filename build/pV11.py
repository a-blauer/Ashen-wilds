# v89: track framework. Each track owns build/pN_<track>.py (text patches, exec'd in sorted order with the shared
# `h` and `rep`) and src/modules/zzN_<track>*.js (spliced in sorted order before the talBtn marker, after everything else).
import os as _os,glob as _g
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
P=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
h=open(P).read()
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(h.count(a),a[:90]);h=h.replace(a,b)
for _p in sorted(_g.glob(_ROOT+'/build/pN_*.py')):
    print('patch',_os.path.basename(_p));exec(open(_p).read())
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1
_ms=sorted(_g.glob(M+'zzN_*.js'))
h=h.replace(a,"\n"+"\n".join(open(f).read() for f in _ms)+a)
print('modules',[_os.path.basename(f) for f in _ms])
open(P,'w').write(h);print('v11 ok')
