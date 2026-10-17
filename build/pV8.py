# v85: recall instances, courtyard growth, companion command, fishing loot, animation and combat-readability passes
import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
P=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
h=open(P).read()
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(h.count(a),a[:90]);h=h.replace(a,b)

# level ups restore half of your health and mana instead of all of it
rep("hero.lvl++;hsDirty();hero.hp=heroMax();hero.mp=mpMax();","hero.lvl++;hsDirty();hero.hp=Math.min(heroMax(),Math.max(0,hero.hp)+heroMax()*.5);hero.mp=Math.min(mpMax(),(hero.mp||0)+mpMax()*.5);")
rep("'Health and mana fully restored');","'Half of your health and mana restored');")
# healing potion cooldown 6s -> 9s
rep("pots--;hero.cdP=6;","pots--;hero.cdP=9;")
rep("slot('p','🧪','Q',hero.cdP||0,6,","slot('p','🧪','Q',hero.cdP||0,9,",2)
# gear upgrades cost 35% less gold
rep("g:Math.round((25+it.lv*7)*(u+1)*(1+it.r*.3)),","g:Math.round((25+it.lv*7)*(u+1)*(1+it.r*.3)*.65),")

# fishing: no gold; each catch may also bring up a gold pouch, a ring or an amulet (see fishTreasure in zzI_v85.js)
rep("giveS('fish',f[3]+1);const g=[3,8,20,120][f[3]]*T;gold+=g;","giveS('fish',f[3]+1);")
rep("sub:'+'+(f[3]+1)+' Fish · +'+g+' gold'+(first?","sub:'+'+(f[3]+1)+' Fish'+(first?")
rep("fishEnd();hud()}\nfunction fishUI(){","fishTreasure(f[3],T,p);fishEnd();hud()}\nfunction fishUI(){")

# recall bar says where you are going (home, or back to a saved zone run)
rep("$('rcT').textContent='🌀 Recalling to '+(home||TOWNS[0]).n+'...'","$('rcT').textContent=(typeof RECBACK!='undefined'&&RECBACK&&INST?'🌀 Returning to your '+PMAP[INST.r].n+' run...':'🌀 Recalling to '+(home||TOWNS[0]).n+'...')")

a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1
h=h.replace(a,"\n"+"\n".join(open(M+f).read() for f in ['zzI_v85.js','zzI_combat.js','zzI_anim.js'])+a)
open(P,'w').write(h);print('v8 ok')
