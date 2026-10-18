# --- dens --- (v89) bigger Sovereign dens: every den is 35% larger (DK) and its scenery a little taller (DKY).
# The dens are still built by zzK_den*.js at their original size; zzN_dens.js then maps every den mesh, prop position,
# collision tile and mechanic position outward from the den centre. These text patches handle the numbers that live
# inside const/arrow code or runtime formulas (ring radii, ranges, map generation).
import re as _re
# DK/DKY must exist before any module runs (w0_world.js uses them during map generation)
_i=h.rindex('<script>')+8;h=h[:_i]+'\nvar DK=1.35,DKY=1.15;\n'+h[_i:]
# ---- the playable circle ----
rep('const ARENA_R=14,','const ARENA_R=14*DK,')
# ---- map generation (w0_world.js): a bigger walkable, flattened clearing; keep the den away from the zone edge ----
# (v89 world track: zones are 30% bigger and the den clearing is PM_DENR=25 wide, which already covers the bigger den's
#  walkable stamp, water keep-out, prop filter and camp distance; only the numbers below still need the den scale)
rep("for(let y=b.y-16;y<=b.y+16;y++)for(let x=b.x-16;x<=b.x+16;x++)if(Math.hypot(x-b.x,y-b.y)<15.5)m[y][x]='a';",
    "for(let y=b.y-22;y<=b.y+22;y++)for(let x=b.x-22;x<=b.x+22;x++)if(Math.hypot(x-b.x,y-b.y)<15.5*DK)m[y][x]='a';")
rep('[[p.ba,PM_DENR+3],[p.wa,19]].forEach(([c,R0])=>{const q=Math.hypot(i-c[0],j-c[1]),m=smt(R0-5,R0,q)',
    '[[p.ba,Math.max(PM_DENR+3,22*DK),5*DK],[p.wa,19,5]].forEach(([c,R0,W0])=>{const q=Math.hypot(i-c[0],j-c[1]),m=smt(R0-W0,R0,q)')
_m=_re.search(r'const ba=awayWA\([^;]*;',h);assert _m,'ba line'
h=h[:_m.end()]+'ba[0]=cl(ba[0],36,PMW-36);ba[1]=cl(ba[1],36,PMH-36);'+h[_m.end():]
rep('Math.hypot(x-p.ba[0],z-p.ba[1])<30','Math.hypot(x-p.ba[0],z-p.ba[1])<Math.max(30,24*DK)',2)   # zone roster keeps clear of the den
rep('BOSSES.some(b=>Math.hypot(b.x-x,b.y-y)<20)','BOSSES.some(b=>Math.hypot(b.x-x,b.y-y)<20*DK)')  # dungeon entrances
# ---- base Sovereign moves that scatter over a fixed area ----
rep('V(A.cx+(Math.random()-.5)*20,0,A.cz+(Math.random()-.5)*20)','V(A.cx+(Math.random()-.5)*20*DK,0,A.cz+(Math.random()-.5)*20*DK)',2)
rep('V(A.cx+(Math.random()-.5)*22,0,A.cz+(Math.random()-.5)*22)','V(A.cx+(Math.random()-.5)*22*DK,0,A.cz+(Math.random()-.5)*22*DK)')
rep('r=5+Math.random()*6,x=A.cx','r=(5+Math.random()*6)*DK,x=A.cx')
# ---- den 0: the Drowned Hollow ----
rep('sx=A.cx+Math.cos(a)*12.3,sz=A.cz+Math.sin(a)*12.3','sx=A.cx+Math.cos(a)*12.3*DK,sz=A.cz+Math.sin(a)*12.3*DK')
rep('d01FanSet(T.fan,T.ox,T.oz,T.gy+T.eye.rotation.y,half,26,AR.pil,A,y)','d01FanSet(T.fan,T.ox,T.oz,T.gy+T.eye.rotation.y,half,26*DK,AR.pil,A,y)')
rep('d01FanSet(T.fan,T.ox,T.oz,wy,half,26,AR.pil,A,y)','d01FanSet(T.fan,T.ox,T.oz,wy,half,26*DK,AR.pil,A,y)')
rep('d01Clip(T.ox,T.oz,dx/L,dz/L,26,AR.pil,null,0)','d01Clip(T.ox,T.oz,dx/L,dz/L,26*DK,AR.pil,null,0)')
rep('L=d01Clip(ox,oz,dx,dz,26,AR.pil,A,ARENA_R+.3)','L=d01Clip(ox,oz,dx,dz,26*DK,AR.pil,A,ARENA_R+.3)')
rep('burst(V(A.cx+Math.cos(a)*15,y0+.4,A.cz+Math.sin(a)*15)','burst(V(A.cx+Math.cos(a)*15*DK,y0+.4,A.cz+Math.sin(a)*15*DK)')
# ---- den 1: the Serpent Mere ----
rep('else if(L<17){const q=pl.position.clone();N.atk','else if(L<17*DK){const q=pl.position.clone();N.atk')
rep('Math.hypot(pl.position.x-b.x,pl.position.z-b.z)<1.95&&hero.hp>0','Math.hypot(pl.position.x-b.x,pl.position.z-b.z)<2.25&&hero.hp>0')
rep('burst(V(A.cx+Math.cos(a)*15.2,y0+.3,A.cz+Math.sin(a)*15.2)','burst(V(A.cx+Math.cos(a)*15.2*DK,y0+.3,A.cz+Math.sin(a)*15.2*DK)')
rep('if(Math.abs(p.x-A.cx)>16||Math.abs(p.z-A.cz)>16)return;','if(Math.abs(p.x-A.cx)>16*DK||Math.abs(p.z-A.cz)>16*DK)return;')
rep('if(hyOnStone(p.x,p.z))p.y=GH(p.x,p.z)+.34','if(hyOnStone(p.x,p.z))p.y=GH(p.x,p.z)+.34*DKY')
# ---- den 2: the Frozen Sepulchre (warm circles grow with the Warmfires) ----
rep('const RW_WARM=3.1,','const RW_WARM=3.1*DK,')
# ---- den 3: the Sunken Pit ----
rep('SS_SAND=0xd9b273,SS_CORE=3.0;','SS_SAND=0xd9b273,SS_CORE=3.0*DK;')
rep('Math.min(d,14)/14','Math.min(d,ARENA_R)/ARENA_R')
rep('r=13.5*(1-k)+.5','r=13.5*DK*(1-k)+.5')
rep('if(C.ok&&d2(C.p,m.position)<2.0)','if(C.ok&&d2(C.p,m.position)<2.3)')
rep('if(l<2.2&&l>.01){m.position.x=C.x+cx/l*2.2;m.position.z=C.z+cz/l*2.2}','if(l<2.5&&l>.01){m.position.x=C.x+cx/l*2.5;m.position.z=C.z+cz/l*2.5}')
rep('r=3+Math.random()*10;v.set(A.cx','r=(3+Math.random()*10)*DK;v.set(A.cx')
# ---- den 4: the Charnel Pit (and the shared wall cutaway used by den 5) ----
rep('function dqCut(base,A,rIn,yMin){','function dqCut(base,A,rIn,yMin){rIn*=DK;yMin*=DKY;')
rep('b.position.y=y0+1.45+k*.12','b.position.y=y0+1.45*DKY+k*.12')
rep('S.tide={r:15.2,min:8.4,sp:.16}','S.tide={r:15.2*DK,min:8.4*DK,sp:.16*DK}')
rep('[[D4.tide,0,15.6],','[[D4.tide,0,15.6*DK],')
rep('gx=A.cx+Math.cos(A.dqA)*15.3,gz=A.cz+Math.sin(A.dqA)*15.3','gx=A.cx+Math.cos(A.dqA)*15.3*DK,gz=A.cz+Math.sin(A.dqA)*15.3*DK')
rep('Math.hypot(cam.position.x-A.cx,cam.position.z-A.cz)>14.2?.16:.5','Math.hypot(cam.position.x-A.cx,cam.position.z-A.cz)>14.2*DK?.16:.5')
# ---- den 5: the Crimson Throne Hall ----
rep('cc=ox*ox+oz*oz-13.4*13.4','cc=ox*ox+oz*oz-(13.4*DK)**2')
rep('r=3.5+rng()*7,x=A.cx','r=(3.5+rng()*7)*DK,x=A.cx')
rep('r=Math.random()*14;burst(V(A.cx+Math.cos(a)*r,y0+.2','r=Math.random()*14*DK;burst(V(A.cx+Math.cos(a)*r,y0+.2')
rep('r=Math.random()*14;burst(V(A.cx+Math.cos(a)*r,GH(A.cx,A.cz)+.4','r=Math.random()*14*DK;burst(V(A.cx+Math.cos(a)*r,GH(A.cx,A.cz)+.4')
rep('ring(V(A.cx,0,A.cz),0xff2040,14,700)','ring(V(A.cx,0,A.cz),0xff2040,14*DK,700)')
rep('x=A.cx+Math.cos(a)*6.3,z=A.cz+Math.sin(a)*6.3','x=A.cx+Math.cos(a)*6.3*DK,z=A.cz+Math.sin(a)*6.3*DK')
rep('dqWarn(S,{x:A.cx,z:A.cz,r:13.6,','dqWarn(S,{x:A.cx,z:A.cz,r:13.6*DK,')
rep('Math.hypot(cam.position.x-A.cx,cam.position.z-A.cz)>14.1?.14:.42','Math.hypot(cam.position.x-A.cx,cam.position.z-A.cz)>14.1*DK?.14:.42')
