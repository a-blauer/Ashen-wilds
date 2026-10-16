import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
OUT=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
import re
P=OUT
h=open(P).read()
def rep(old,new,n=1):
    global h
    assert h.count(old)==n,(h.count(old),old[:110])
    h=h.replace(old,new)
# ---- consts that must change in place ----
rep("const M=c=>Math.round((B(c,'hp')+c.l*4)*mul(c)*vm(c,0)*c.iv.hp*(c.al?2.5:c.boss?7:1)),A=c=>Math.round((B(c,'a')+c.l*1.6)*mul(c)*vm(c,1)*c.iv.a*(c.al?1.4:c.boss?1.5:1)),D=c=>Math.round((B(c,'d')+c.l*1.2)*mul(c)*vm(c,2)*c.iv.d*(c.al?1.2:c.boss?1.3:1)),",
    "const M=c=>cM(c),A=c=>cPA(c),D=c=>cPD(c),")
rep("const mk=(n,l,f=0,v='',iv)=>{const rv=()=>.85+Math.random()*.3;","const mk=(n,l,f=0,v='',iv)=>mkC(n,l,f,v,iv),mkOld=(n,l,f=0,v='',iv)=>{const rv=()=>.85+Math.random()*.3;")
rep("nm=c=>em(c)+' '+(c.al?'Alpha ':'')+(c.v?c.v+' ':'')+c.n+' Lv'+c.l+'★'.repeat(c.f);","nm=c=>em(c)+' '+(c.al?'Alpha ':'')+(c.v?c.v+' ':'')+c.n+' Lv'+c.l+'★'.repeat(Math.floor(c.fp||c.f||0))+(c.evo?' '+'✦'.repeat(c.evo):'');")
rep("const dmg=(a,b,k,p)=>Math.max(1,Math.round(A(a)*k*(a.ch?.8:1)*(.85+Math.random()*.3)-D(b)*(p?0:.5)));","const dmg=(a,b,k,p)=>dmgCE(a,b,k,p);")
rep("const TIER_LV=[[2,6],[7,11],[12,17],[18,23],[24,30]]","const TIER_LV=[[1,9],[10,19],[20,29],[30,39],[40,49]]")
for nm_,a,b in [("Ashen Warden",11,18),("Mire Colossus",13,19),("Crypt Matriarch",17,29),("Hollow King",22,39),("Stormwing Sovereign",27,48),("Wyrm of the Waste",31,50)]:
    h=re.sub(r"(\{name:'%s',sp:'\w+',x:\d+,y:\d+,lvl:)%d\}"%(re.escape(nm_),a),lambda m:m.group(1)+str(b)+"}",h,1)
assert "lvl:50}" in h
rep("const mpMax=()=>Math.round(30+3*Math.max(1,...party.map(c=>c.l))),","const mpMax=()=>Math.round(HS().mp),")
rep("const gs=k=>Object.values(eq).reduce((t,i)=>t+(i[k]||0),0);","const gs=k=>0;")
rep("const empS=k=>party.slice(0,2).reduce((t,c)=>t+(c.emp&&c.h>0?.5*(k=='hp'?M(c):k=='a'?A(c):D(c)):0),0);","const empS=k=>0;")
rep("const heroMax=()=>Math.round(60+4*Math.max(1,...party.map(c=>c.l))+gs('hp')+empS('hp')),heroAtk=()=>5+A(party[0])*.8+gs('atk')+empS('a'),df=()=>gs('def')+Math.round(empS('d'));",
    "const heroMax=()=>Math.round(HS().hp),heroAtk=()=>atkOf(heroMt()),df=()=>Math.round(HS().pd);")
rep("const matInfo=k=>RES[k]||Object.values(FAM).find(f=>f[0]==k)||[k,'📦'];","const matInfo=k=>RES[k]||Object.values(FAM).find(f=>f[0]==k)||UPM.find(u=>u[0]==k)||[k,'📦'];")
rep(",en=e=>`<span style=\"color:${RAR[e.tier][1]}\">🥚 ${RAR[e.tier][0]} ${e.sp} Egg <small>${TGI[e.tag]||''} ${e.tag||''}</small></span>`;",
    ",en=e=>`<span style=\"color:${RAR[e.tier][1]}\">🥚 Tier ${e.tier+1} ${e.sp} Egg <small>${TGI[e.tag]||''} ${e.tag||''}</small></span>`;")
rep("const topL=()=>Math.max(1,...party.map(c=>c.l))","const topL=()=>hero.lvl||1")
rep("eq={weapon:{id:0,sl:'weapon',r:0,nm:'Rusty Sword',atk:1,cd:.42,rg:2.4}}","eq={}")
rep("const k=c.n+c.f+c.v+c.g.join()+c.cl.join()+c.tr;","const k=c.n+c.f+c.v+c.g.join()+c.cl.join()+c.tr+'|'+(c.evo||0);")
# ---- creature rig: tier/evolution rigs and humanoid enemies ----
rep("if(SPEC[c.g[0]]){try{return crRig(c,c.g[0])}catch(e){console.error('rig failed',c.g[0],e)}}",
    "if(EN[c.g[0]]&&EN[c.g[0]].hum)return mkHumanoid(EN[c.g[0]].hum);{const rn=rigOf(c.g[0]);if(SPEC[rn]){try{return crRig(c,rn)}catch(e){console.error('rig failed',rn,e)}}}")
rep("c.g.slice(1).forEach((o,i)=>{const so=SPEC[o]","c.g.slice(1).forEach((o,i)=>{const so=SPEC[rigOf(o)]")
rep("  [['b|'+c.g.join()+'|'+c.cl.join()+'|'+(x.red?1:0),parts],['v|'+n+'|'+c.v+'|'+c.tr,vparts]]","  crOrn(c,vax,bk,hd);\n  [['b|'+c.g.join()+'|'+c.cl.join()+'|'+(x.red?1:0),parts],['v|'+n+'|'+c.v+'|'+c.tr+'|'+ornLv(c)+'|'+famOf(c.g[0]),vparts]]")
rep("g.bs=(S.sc||1)*(1+.07*c.f)*c.z;","g.bs=(S.sc||1)*(1+.04*(c.f||0))*c.z*(SP2[c.g[0]]?1+.12*(SP2[c.g[0]][1]-1):1)*(1+.06*(c.evo||0));")
# ---- gathering: Gatherer modifier ----
rep("function gStart(t){gat={tg:t,t:0,need:Math.max(.7,(gSoft(t)?1.1:1.6)-.06*gSkill(t).l),sw:0}}","function gStart(t){gat={tg:t,t:0,need:Math.max(.5,((gSoft(t)?1.1:1.6)-.06*gSkill(t).l)*(HS().gath>0?.7:1)),sw:0}}")
rep("bonus=Math.floor(sk.l/3)","bonus=Math.floor(sk.l/3)+(HS().gath>0?1:0)")
# ---- hatch result text ----
rep("$('hr').innerHTML='<b>'+nm(c)+'</b><br>HP '+M(c)+' · ATK '+A(c)+' · DEF '+D(c)",
    "$('hr').innerHTML='<b>'+nm(c)+'</b><br>'+famT(c)+'<br>HP '+M(c)+' · PA '+cPA(c)+' · MA '+cMA(c)+' · PD '+D(c)+' · MD '+cMD(c)+'<br>Modifiers: '+(c.mods||[]).map(m=>MODS[m].i+' '+m).join(', ')+'<br>Spell: '+CSP[c.sp[0]].i+' '+c.sp[0]")
rep("return Math.max(lv[0],Math.min(lv[1]+1,Math.round(","return Math.max(lv[0],Math.min(lv[1],Math.round(")
rep("WASD move · Hold right mouse + drag to rotate camera · Left click attack · 1-4 spells · Shift dodge","WASD move · Hold right mouse + drag to rotate camera · Left click attack · 1-4 class skills · Shift dash (2 charges) · K talents · Tab target")
# ---- windows / keys ----
rep('  <div id="craft" class="modal w hide">','  <div id="tal" class="modal w hide"><div class="win" style="width:min(860px,100%)"><div class="wh"><h2>Talents</h2><span class="wsub" id="talSub"></span><button class="x" id="talClose" title="Close (Esc)">✕</button></div><div class="wb"><div id="talT" class="talg"></div></div><div class="wf"><span id="talInfo" class="mut dtl"></span><button id="talReset">Reset</button></div></div></div>\n  <div id="craft" class="modal w hide">')
rep("const WINS=['fz','bag','inc','cmp','shop','mshop','craft','wmap','setw'];","const WINS=['fz','bag','inc','cmp','shop','mshop','craft','wmap','setw','tal'];")
rep("['fz','bag','inc','cmp','shop','mshop','craft','wmap','setw','hatch','start']","['fz','bag','inc','cmp','shop','mshop','craft','wmap','setw','tal','hatch','start']")
rep("{const tw={i:'bag',p:'cmp',u:'inc',g:'fz',c:'craft',n:'wmap',o:'setw'}[k]","{const tw={i:'bag',p:'cmp',u:'inc',g:'fz',c:'craft',n:'wmap',o:'setw',k:'tal'}[k]")
rep("if(k=='o')openSet();","if(k=='o')openSet();if(k=='k')openTal();")
rep('<button id="setBtn">⚙️ Settings <kbd>O</kbd></button>','<button id="talBtn">✦ Talents <kbd>K</kbd></button><button id="setBtn">⚙️ Settings <kbd>O</kbd></button>')
# ---- monster AI ----
rep("ms=MSET[e.c.g[0]]||['bite'],pref=e.pref||(e.pref=ms.some(n=>n=='bite'||n=='spin'||n=='slam')?1.3:4.3)","ms=MSET[e.c.g[0]]||['bite'],pref=e.pref||(e.pref=(EN[e.c.g[0]]||{}).ranged?5:ms.some(n=>n=='bite'||n=='spin'||n=='slam'||n=='strike')?1.3:4.3)")
rep("    let tg=pl,bd=dpl;fols.forEach(","    if(eTick(e,dt,now))return;\n    let tg=pl,bd=dpl;fols.forEach(")
rep("    walkM(m,(ux*sp+e.vx)*dt,(uz*sp+e.vz)*dt);e.vx*=.85;e.vz*=.85;\n    animC(m,now,sp>0,sp);","    if(!(e.root>0))walkM(m,(ux*sp+e.vx)*dt,(uz*sp+e.vz)*dt);e.vx*=.85;e.vz*=.85;\n    animC(m,now,sp>0,sp);")
rep("  const a=e.atk,M0=a.M,m=e.m,P=m.pose||(m.pose={}),ib=1/(m.bs||1),tg=a.tg;\n  a.t-=dt;","  const a=e.atk,M0=a.M,m=e.m,P=m.pose||(m.pose={}),ib=1/(m.bs||1),tg=a.tg;\n  a.t-=dt;{const kk=a.ph==0?1-a.t/a.T:a.ph==1?1-a.t/(a.A||1):a.t/(a.R||1);m.ak={n:a.n,ph:a.ph,k:Math.max(0,Math.min(1,kk))}}")
rep("    if(a.n=='bite'){P.rx=-.32*q;P.z=-.18*q}","    if(a.n=='bite'||a.n=='strike'){P.rx=-.32*q;P.z=-.18*q}")
rep("    else if(a.n=='spit'){P.rx=-.45*q;m.atk=k>.5?1:0}","    else if(a.n=='spit'||a.n=='throw'||a.n=='bolt'||a.n=='rainfire'){P.rx=-.45*q;m.atk=k>.5?1:0}")
rep("      if(a.n=='spit'){const c=SPITC[e.c.g[0]]||0xb0ff6a,","      if(a.n=='spit'||M0.proj){const c=(M0.proj&&M0.proj.col)||SPITC[rigOf(e.c.g[0])]||(e.c.mt=='m'?0xff7a2a:0xb0ff6a),")
rep("eshots.push({m:o,v:dd.multiplyScalar(7.5),t:1.6,e,c,mult:M0.dmg});","eshots.push({m:o,v:dd.multiplyScalar((M0.proj&&M0.proj.spd)||7.5),t:1.6,e,c,mult:M0.dmg*(e.enr?1.3:1),mt:M0.mt||e.c.mt});")
rep("    if(a.n=='bite'){P.rx=.4*s;P.z=.75*s;m.atk=1;","    if(a.n=='bite'||a.n=='strike'){P.rx=.4*s;P.z=.75*s;m.atk=1;")
rep("    else if(a.n=='spit'){P.rx=-.45+.85*s}","    else if(a.n=='spit'||a.n=='throw'||a.n=='bolt'){P.rx=-.45+.85*s}\n    else if(a.n=='rainfire'){P.rx=-.3+.6*s;if(a.t<=0&&!a.hit){a.hit=1;ring(a.tp,0xff6a2a,M0.r*a.sz*1.6,380);burst(gY(a.tp,.3),0xff6a2a,30,2.4,2.5,.6);if(d2(tg.position,a.tp)<M0.r*a.sz+.3)hitTarget(e,tg,M0.dmg*(e.enr?1.3:1),'m')}}")
rep("if(a.t<=0){e.atk=null;m.pose=null;m.atk=0;e.cd=M0.cd*(e.c.al?.8:1)*(.75+Math.random()*.5)}","if(a.t<=0){e.atk=null;m.pose=null;m.atk=0;m.ak=null;e.cd=M0.cd*(e.c.al?.8:1)*(e.enr?.65:1)*(.75+Math.random()*.5)}")
rep("e.atk=null;if(e.m){e.m.pose=null;e.m.atk=0}}","e.atk=null;if(e.m){e.m.pose=null;e.m.atk=0;e.m.ak=null}}")
rep("hitTarget(s.e,pl,s.mult)","hitTarget(s.e,pl,s.mult,s.mt)")
# enemy damage multiplier for enraged in melee hits: handled in hitHero via e.enr
# ---- main loop ----
a=h.index("  // spell projectiles\n  for(let i=shots.length-1;i>=0;i--){");b=h.index("  // monsters: wander, aggro, attack")
h=h[:a]+"  shotTick(dt);\n"+h[b:]
rep("  if(dt>0){if(hero.mp==null)hero.mp=mpMax();hero.mp=Math.min(mpMax(),hero.mp+dt*(2.5+mpMax()*.04))}\n","")
rep("  if(al>0&&dt>0){walk(pl,ax/al*4.5*dt,az/al*4.5*dt);","  if(al>0&&dt>0){const msp=4.5*(1+HS().mspd)*(hero.chan?.55:1);walk(pl,ax/al*msp*dt,az/al*msp*dt);")
rep("  featTick(dt,now,al);","  featTick(dt,now,al);heroTick(dt,now);")
rep("lunge(f,t.m.position,()=>{f.lk=0;if(!t.dead)hurt(t,dmg(c,t.c,1),null)})","lunge(f,t.m.position,()=>{f.lk=0;if(!t.dead)compHit(c,t,1)})")
rep("  if(atkHeld&&dt>0)swing();","  if(atkHeld&&dt>0&&!hero.chan)swing();")
# ---- CSS ----
css=open(M+'d_css.css').read()
rep("</style>",css+"\n</style>")
# ---- neutralize original const declarations that v2 redefines ----
import json,os
REN=json.load(open(M+'ren.json')) if os.path.exists(M+'ren.json') else []
cut=h.index("// ---------- Start ----------")
for nm_ in REN:
    pre=h[:cut]
    m=re.search(r'((?:const|let)\s+|,\s*)'+re.escape(nm_)+r'(\s*=)',pre)
    assert m,('rename miss',nm_)
    pre=pre[:m.start()]+m.group(1)+nm_+'_old'+m.group(2)+pre[m.end():]
    h=pre+h[cut:]
# ---- splice the v2 modules in place of the old start section ----
a=h.index("// ---------- Start ----------");b=h.rindex("</script>")
v2=open(M+'a_data.js').read()+"\n"+open(M+'b_logic.js').read()+"\n"+open(M+'c_ui.js').read()
h=h[:a]+v2+"\n$('talBtn').onclick=openTal;\nui();refreshGear();\n"+h[b:]
open(P,'w').write(h);print('patched',len(h))
