import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
OUT=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
P=OUT
h=open(P).read()
def rep(a,b):
    global h
    assert h.count(a)==1,(h.count(a),a[:80]);h=h.replace(a,b)
rep("\n$('talBtn').onclick=openTal;\n","\n"+open(M+'zzz_mp.js').read()+"\n$('talBtn').onclick=openTal;\n")
rep("if(!m.visible||e.dead)return;","if((!m.visible&&!mpAct(e))||e.dead)return;")
rep("e.m.position.distanceTo(pl.position)>85)removeE(e)","e.m.position.distanceTo(pl.position)>85&&!mpNear(e.m.position,85))removeE(e)")
rep("if(uiOpen()||!party.length)dt=0;","if((uiOpen()&&!mpLive())||!party.length)dt=0;")
rep("O settings · Tab target enemy","O settings · Y co-op · Tab target enemy")
open(P,"w").write(h);print("v4 ok")
