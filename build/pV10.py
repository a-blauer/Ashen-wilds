# v88: abilities rework, living Duskhold, slot-based menus, dark-fantasy UI theme + original icons
import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
P=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
h=open(P).read()
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(h.count(a),a[:90]);h=h.replace(a,b)
# --- text patches (each track adds its own below, marked with its name) ---

a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1
# order: abilities, town, menus, then the UI theme + icon layer last (so it sees every window)
h=h.replace(a,"\n"+"\n".join(open(M+f).read() for f in ['zzM_skills.js','zzM_town.js','zzM_menus.js','zzM_ui.js'])+a)
open(P,'w').write(h);print('v10 ok')
