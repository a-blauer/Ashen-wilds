import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
OUT=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
P=OUT
h=open(P).read()
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(h.count(a),a[:90]);h=h.replace(a,b)
rep("const W=742,H=448,TS=14;","const W=920,H=568,TS=21,TK=1.5;")
rep("t.mp=[t.cx,t.cy-7.9];t.mv=[t.cx+10.2,t.cy-7.7];t.col=[];t.tv=[t.cx-9.5,t.cy-7.5];t.sp=[t.cx,t.cy+7];","t.mp=[t.cx,t.cy-11.85];t.mv=[t.cx+15.3,t.cy-11.55];t.col=[];t.tv=[t.cx-14.25,t.cy-11.25];t.sp=[t.cx,t.cy+10.5];")
i=h.index("function buildTown(T){");j=h.index("\nTOWNS.forEach(buildTown);",i);body=h[i:j]
mk="  // zone signposts by the gates\n";assert body.count(mk)==1
k=body.index(mk);pre,post=body[:k],body[k:]
import re
post=re.sub(r'\bTS\b','TS0',post)
start='''  const TS0=TS/TK,_c0=T.col.length,_l0=TLAMP.length;let _pend=T.col.length;
  g.add=function(...os){os.forEach(o=>{const lx=o.position.x,lz=o.position.z;for(let q=_pend;q<T.col.length;q++){const c=T.col[q];if(Math.abs(c.x-T.cx-lx)<.7&&Math.abs(c.z-T.cy-lz)<.7&&!c._s){c.x+=lx*(TK-1);c.z+=lz*(TK-1);c._s=1}}_pend=T.col.length;o.position.x*=TK;o.position.z*=TK});return THREE.Group.prototype.add.apply(this,os)};
'''
end_mark="  g.traverse(o=>{if(o.isMesh&&o.parent!==g)o.matrixAutoUpdate=true});\n"
assert post.count(end_mark)==1
post=post.replace(end_mark,"  delete g.add;for(let q=_l0;q<TLAMP.length;q++){const L=TLAMP[q];L[0]=T.cx+(L[0]-T.cx)*TK;L[2]=T.cy+(L[2]-T.cy)*TK}\n"+end_mark)
h=h[:i]+pre+start+post+h[j:]
# steward / old notice board spot
h=h.replace('T.cx-10.8','T.cx-16.2').replace('T.cy+3.1','T.cy+4.65')
rep("const gap=c.l-hero.lvl;xp*=gap<-5?.25:gap<-2?.7:gap>2?1.2:1;xp=Math.round(xp);","const gap=c.l-hero.lvl;xp*=gap<-5?.25:gap<-2?.7:gap>2?1.2:1;xp*=.6375*(e&&e.wv?.75:1);xp=Math.max(1,Math.round(xp));")
loot="""
// ---- v66: leaner loot — monster drops -30% (wave trial: a further -50%), eggs -30%; bosses keep their guaranteed loot ----
var LT={on:0};
{const f=lootE;lootE=function(e){LT.on=!e||e.boss||(e.c&&e.c.boss)?0:e.wv?2:1;try{return f.apply(this,arguments)}finally{LT.on=0}}}
{const f=drop;drop=function(kind,data,p,r){if(LT.on){const keep=.7*(LT.on==2?.5:1);if(Math.random()>keep)return}return f.apply(this,arguments)}}
"""
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1;h=h.replace(a,loot+a)
rep("if(safeP){e.agg=0;if(e.atk)mCancel(e)}else if(","if(e.wv&&!safeP)e.agg=1;else if(safeP){e.agg=0;if(e.atk)mCancel(e)}else if(")
rep("party.slice(0,2).forEach(c2=>{if(!c2||c2.h<=0||c2.l>=MAXLV)return;","party.slice(0,2).forEach(c2=>{if(!c2||c2.l>=MAXLV)return;")
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1;h=h.replace(a,"\n"+open(M+'zzzzz_fish.js').read()+"\n"+open(M+'zz7_v71.js').read()+"\n"+open(M+'zz8_danger.js').read()+"\n"+open(M+'zz9_cmpegg.js').read()+a)
# v74: eggs live in the Companions window
rep("Open Eggs (U) and click it.","Open Companions & Eggs (P) and click it.")
# v73: death screen pauses the game like any open window
rep("'tal','hatch','start','xw'].some(","'tal','hatch','start','xw','dth'].some(")
rep('<div id="fade"></div>','<div id="fade"></div><div id="dth" class="hide"></div>')
rep('<h2>World Map</h2><span class="wsub">Each walled town marks the start of a harder region · N or Esc to close</span>','<h2>Map</h2><span class="wsub">The area you are in · N or Esc to close</span>')
rep('<canvas id="wmc" width="1060" height="640" style="width:100%;display:block;border-radius:4px;background:#0a0d12"></canvas>','<canvas id="wmc" width="1060" height="640" style="max-width:100%;max-height:calc(100vh - 150px);width:auto;height:auto;display:block;margin:0 auto;border-radius:4px;background:#0a0d12"></canvas>')
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1;h=h.replace(a,"\n{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{const x=Math.round(pl.position.x),z=Math.round(pl.position.z),g=regionAt(x,z);if(g>=0&&MAP.DW[z*W+x]>=0){const p=PMAP[g];toPos(p.en[0],p.en[1])}}catch(_){}return r}}"+a)
rep("while(k0>0&&solid(o.x+(tp.x-o.x)*k0,o.z+(tp.z-o.z)*k0))k0-=.1;","while(k0>0&&plBlocked(o.x+(tp.x-o.x)*k0,o.z+(tp.z-o.z)*k0))k0-=.05;UNS.air=nowP()+480;")
uns="""
// ---- v70: never get stuck — after any jump, dash, pull or knockback the hero is nudged to the nearest free spot ----
function plBlocked(x,z){if(inRealm)return false;return CR.some(([a,b])=>solid(x+a,z+b))||tcHit(x,z)}
var UNS={ok:null,t:0};
function unstick(){if(inRealm||!party.length)return;const p=pl.position;if(nowP()<(UNS.air||0))return;
  if(!plBlocked(p.x,p.z)){UNS.ok=[p.x,p.z];UNS.t=0;return}
  for(let r=.2;r<=6;r+=.2)for(let a=0;a<6.283;a+=.3/Math.max(1,r)){const x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;if(!plBlocked(x,z)){p.x=x;p.z=z;return}}
  if(UNS.ok){p.x=UNS.ok[0];p.z=UNS.ok[1]}}
{const f=homeTick;homeTick=function(){f.apply(this,arguments);try{unstick()}catch(_){}}}
"""
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1;h=h.replace(a,uns+a)

# v77: the Magic Shop building (and its walls) only appear once it is built at the Steward
rep("  // ---------- Magic Shop (east) ----------\n  {const b=new THREE.Group();","  // ---------- Magic Shop (east) ----------\n  {const b=new THREE.Group();T.mvG=b;T.mvArr=T.col;const mvc0=T.col.length;")
rep("  }\n  // ---------- Tavern (west) ----------","  T.mvCol=T.col.slice(mvc0);\n  }\n  // ---------- Tavern (west) ----------")

# v78: arsenal (weapon types, attacks, 100 items) and mounts + Stable
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1;h=h.replace(a,"\n"+open(M+'zzA_arsenal.js').read()+"\n"+open(M+'zzB_mounts.js').read()+"\n"+open(M+'zzC_music.js').read()+"\n"+open(M+'zzD_lowpoly.js').read()+"\n"+"\n".join(open(f).read() for f in sorted(__import__('glob').glob(M+'zzE_*.js')))+a)
open(P,'w').write(h);print('v6 ok')
