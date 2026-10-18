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
# --- town --- (v88 Duskhold: textured buildings, readable signs, kingdom upgrades in the world; code in zzM_town.js)
# the v83 kit helpers become *_0 so zzM_town.js can wrap them (the wrapper tags each part with its material)
for _n in ['twStones','twStoneRing','twLogs','twPlanks','twDoor','twWindow','twGable','twCone']:rep('function '+_n+'(','function '+_n+'_0(')
# zone signposts: posts beside the board instead of in front of the text
rep("const zs=(x,z,ry,l1,l2)=>{tc(g,x,z,.15);const key='ZSP';","const zs=(x,z,ry,l1,l2)=>{tcb(g,x,z,1.0,.14);const key='ZSP2';")
rep("""if(!twHas(key)){k=twKit(23);k.L('c',TWC.woodD,[0,0,0],[0,1.95,0],.07,'log');k.p('c',TWC.stoneD,'dod',0,.1,0,.22,.14,.22);
      k.p('c',0x5a3d20,'box',0,1.62,-.02,1.64,.54,.06,0,0,0,.04);k.p('c',TWC.woodD,'box',0,1.9,-.02,1.7,.06,.08,0,0,0,.03);k.p('c',TWC.woodD,'box',0,1.34,-.02,1.7,.06,.08,0,0,0,.03);
      k.p('c',0x5a3d20,'tri',.95,1.62,-.02,.54,.22,.06,0,0,-Math.PI/2,.03)}""","if(!twHas(key)){k=twKit(23);twSignPost(k,1.5,1.55,.44)}")
rep("'#5a3d20','#f4e9c8','#2e1f12',0,1.62,.03,0,420,120)};","'#5a3d20','#f4e9c8','#2e1f12',0,1.55,0,0,420,120)};")
# Trading Post: the board stands on the awning's front beam (the roof eave used to hide it); the gold coin emblem is a baked brass disc
rep("'#2e1f12','#ffd88a','#c9a24a',0,2.78,D/2+.14,0,512,150);","'#2e1f12','#ffd88a','#c9a24a',0,2.2,D/2+1.42,0,512,150);")
rep("\n    TQ(b,G_CYL,sm(0xe0b83a,{metalness:.7,roughness:.3,emissive:0x6a4a00,emissiveIntensity:.5}),0,4.1,D/2+.25,.5,.07,.5,Math.PI/2);","\n    {const cn=twCoin();cn.position.set(0,4.1,D/2+.25);b.add(cn)}")
# gate name boards: painted wood instead of a flat panel
rep("const t=txTex([{t:T.n.toUpperCase(),f:'700 46px'},{t:'· safe haven ·',f:'600 24px'}],512,128,'#14181f','#f4e9c8','#c9a24a');","const t=signTex([{t:T.n.toUpperCase(),f:'700 46px'},{t:'· safe haven ·',f:'600 24px'}],512,128,'#3a2818','#f4e9c8','#c9a24a',3);",2)
# zone camp signs and the courtyard sign: two posts and a crossbar
rep("put(G_CYL,S(0x4a3020),x,.7,z,.06,1.4,.06);sign(g,[{t:C.th.n,f:'700 34px'}],1.6,.4,'#5a3d20','#f4e9d0',null,x,gy(x,z)+1.3,z,-a+Math.PI/2)}","{const sp=twPostG(1.6,1.3,.4);sp.position.set(x,gy(x,z),z);sp.rotation.y=-a+Math.PI/2;g.add(sp)}sign(g,[{t:C.th.n,f:'700 34px'}],1.6,.4,'#5a3d20','#f4e9d0',null,x,gy(x,z)+1.3,z,-a+Math.PI/2)}")
rep("y=GH(x,z),wd=sm(0x3a2a20);TQ(g,G_BOX,wd,x,y+.9,z,.14,1.8,.14);","y=GH(x,z),wd=sm(0x3a2a20);{const sp=twPostG(1.7,1.65,.46);sp.position.set(x,y,z);sp.rotation.y=Math.atan2(Math.cos(ga),Math.sin(ga));g.add(sp)}")
# portal signs sit above the frame's gable cap, held by iron rods (so nothing covers the text)
rep("'#1a1424','#efe6ff',null,0,4.05,.0,0,512,140);","'#1a1424','#efe6ff',null,0,4.34,.0,0,512,140);")
rep("sign(g,[{t:label,f:'700 36px'}],1.8,.36,'#1a1424','#efe6ff',null,0,3.0,0,0);return {g,x,z,disc}}","sign(g,[{t:label,f:'700 36px'}],1.8,.36,'#1a1424','#efe6ff',null,0,3.32,0,0);return {g,x,z,disc}}")
rep("k3.p('c',0x4a4652,'box',0,.25,0,w+.4,.12,1.0,0,0,0,.06)}","k3.p('c',0x4a4652,'box',0,.25,0,w+.4,.12,1.0,0,0,0,.06);twPortalRods(k3,w,h)}")
# hand the palisade and its rails to the kingdom wall builder (kdWalls hides the town's part of them)
rep("lt=inst(LT,Wt.length*4,true);","lt=inst(LT,Wt.length*4,true);KDPAL={lg,lt,Wt:Wt.slice()};")
rep("m.castShadow=true;m.receiveShadow=true;m.userData.lpsSkip=1;scene.add(m)}","m.castShadow=true;m.receiveShadow=true;m.userData.lpsSkip=1;scene.add(m);KDRAIL=m}")
# hearth and alchemy signs hang from their own little post frames (they used to float)
rep("sign(G1,[{t:'🍳 Hearth',f:'700 40px'}],1.1,.34,'#3a2414','#ffe6c0',null,-1.25,2.05,.0,0);sign(G2,[{t:'⚗️ Alchemy',f:'700 40px'}],1.1,.34,'#2a1a3a','#efe6ff',null,1.25,1.75,-.3,0);","sign(G1,[{t:'🍳 Hearth',f:'700 40px'}],1.1,.34,'#3a2414','#ffe6c0',null,-1.25,2.05,.0,0);sign(G2,[{t:'⚗️ Alchemy',f:'700 40px'}],1.1,.34,'#2a1a3a','#efe6ff',null,1.25,1.75,-.48,0);{const p1=twPostG(1.1,2.05,.34);p1.position.set(-1.25,0,0);G1.add(p1);const p2=twPostG(1.1,1.75,.34);p2.position.set(1.25,0,-.48);G2.add(p2)}",2)
# --- end town ---
# --- skills --- (v88 abilities: ability points, 1 starting ability, 50 new abilities, ground targeting; code in zzM_skills.js)
# level-up banner: +1 ability point, and which abilities just became available
rep("banner('LEVEL '+hero.lvl,CLS[hero.cls].n+' · +1 talent point (press K)',ns?'New skill unlocked: '+ns.i+' '+ns.n:'Half of your health and mana restored');",
    "banner('LEVEL '+hero.lvl,CLS[hero.cls].n+' · +1 talent point (K) · +1 ability point (K)',(typeof kqsLvNote=='function'&&kqsLvNote())||'Half of your health and mana restored');")
# --- end skills ---

# --- ui --- (v88 dark-fantasy UI theme + original icon set; theme in zzM_ui.js, icons in zzM_uiicons.js)
# the icon layer goes first in the game script: its canvas patch must exist before any sign/label is drawn,
# and its DOM observer then sees every string the game writes
rep("<script>\n","<script>\n"+open(M+'zzM_uiicons.js').read()+"\n")
# the old "dark fantasy" UI skin (v51) is replaced by the v88 theme: drop its panel/button rules so they don't out-rank it
for _r in ["body.psx .glass{background:linear-gradient(180deg,rgba(24,19,15,.9),rgba(9,7,6,.92));backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid #4a3a26;border-radius:2px;box-shadow:inset 0 0 0 1px #000,inset 0 0 0 2px rgba(150,110,62,.18),0 3px 0 rgba(0,0,0,.6)}",
  "body.psx button{border-radius:2px;background:linear-gradient(#2a211a,#16110d);border-color:#4a3a26}","body.psx button:hover{background:linear-gradient(#3a2d22,#1e1712)}",
  "body.psx button.pri{background:linear-gradient(#6a4a22,#3a2810);border-color:#a8823a;color:#f1e2bf}"]:rep(_r,"")
# --- end ui ---
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1
# order: abilities, town, menus, then the UI theme + icon layer last (so it sees every window)
h=h.replace(a,"\n"+"\n".join(open(M+f).read() for f in ['zzM_skills.js','zzM_town.js','zzM_menus.js','zzM_ui.js'])+a)
open(P,'w').write(h);print('v10 ok')
