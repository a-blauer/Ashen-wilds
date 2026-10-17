# v79: world tidy-up, balance, HUD rework, companion care, Kindlelight gloom, fixes
import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
P=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
h=open(P).read()
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(h.count(a),a[:90]);h=h.replace(a,b)

# kill gold -35%
rep("const g=Math.round((3+l*1.4)*(1+al*2+bs*12)*(.7+Math.random()*.6));gold+=g;","const g=Math.max(1,Math.round((3+l*1.4)*(1+al*2+bs*12)*(.7+Math.random()*.6)*.65));gold+=g;")
# wave trial XP: a further -30% (was x0.75, now x0.525)
rep("xp*=.6375*(e&&e.wv?.75:1);","xp*=.6375*(e&&e.wv?.525:1);")
# no forward lunge on combo finishers (they made dodging hard); normal hits keep their small step
rep("const d=aimDir();face(d);pl.step={x:d.x,z:d.z,t:st==2?.16:.1,sp:st==2?5.5:3.5};","const d=aimDir();face(d);pl.step=st==2?null:{x:d.x,z:d.z,t:.1,sp:3.5};")
rep("atkCd=base*(fin?1.3:1);pl.step={x:d.x,z:d.z,t:fin?.16:.1,sp:fin?5.5:3.5};","atkCd=base*(fin?1.3:1);pl.step=fin?null:{x:d.x,z:d.z,t:.1,sp:3.5};")
rep("atkCd=base*(fin?1.3:1);pl.step={x:d.x,z:d.z,t:fin&&Q.fin=='pounce'?.2:fin?.16:.1,sp:fin&&Q.fin=='pounce'?10:fin?5.5:3.5};","atkCd=base*(fin?1.3:1);pl.step=fin?null:{x:d.x,z:d.z,t:.1,sp:3.5};")

a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1
h=h.replace(a,"\n"+open(M+'zzC_v79.js').read()+"\n"+open(M+'zzD_limbs.js').read()+a)
open(P,'w').write(h);print('v7 ok')
