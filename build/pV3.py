import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
OUT=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
import json
import re
P=OUT
h=open(P).read()
def rep(old,new,n=1):
    global h
    c=h.count(old)
    assert c==n,('count',c,n,old[:90])
    h=h.replace(old,new)
# ---- world scale x1.4 ----
h=h.replace('const W=530,H=320,TS=10;','const W=742,H=448,TS=14;',1)
assert 'const W=742' in h
# ---- roomier towns: push buildings and props outward to fit the bigger walls ----
for a,b in [("t.mp=[t.cx,t.cy-4.9];t.mv=[t.cx+7.2,t.cy-4.7];t.col=[];t.tv=[t.cx-6.5,t.cy-4.5];t.sp=[t.cx,t.cy+5];","t.mp=[t.cx,t.cy-7.9];t.mv=[t.cx+10.2,t.cy-7.7];t.col=[];t.tv=[t.cx-9.5,t.cy-7.5];t.sp=[t.cx,t.cy+7];"),
  ("B(-9,-4,-9,-6);B(-2,2,-9,-6);B(4,9,-9,-6);B(-1,1,-4,-4);","B(-12,-7,-12,-9);B(-2,2,-12,-9);B(7,12,-12,-9);B(-1,1,-7,-7);"),
  ("b.position.set(0,0,-7.5);g.add(b);const W1=4.8","b.position.set(0,0,-10.5);g.add(b);const W1=4.8"),
  ("b.position.set(6.5,0,-7.5);g.add(b);","b.position.set(9.5,0,-10.5);g.add(b);"),
  ("const px=T.cx+6.5,pz=T.cy-7.5;","const px=T.cx+9.5,pz=T.cy-10.5;"),
  ("b.position.set(-6.5,0,-7.5);g.add(b);","b.position.set(-9.5,0,-10.5);g.add(b);"),
  ("const px=T.cx-6.5+2.1,pz=T.cy-7.5-.9","const px=T.cx-9.5+2.1,pz=T.cy-10.5-.9"),
  ("bench(g,-4.2,3.6,0);bench(g,4.2,3.6,0);","bench(g,-6.2,5.2,0);bench(g,6.2,5.2,0);"),
  ("planter(g,-7.6,4.2,2.0);planter(g,7.6,4.2,2.0);","planter(g,-11.4,5.6,2.0);planter(g,11.4,5.6,2.0);"),
  ("tree(g,-8.3,8.2,1);tree(g,8.3,8.2,1.1);tree(g,-8.4,5.8,.8);tree(g,8.4,6.2,.85);","tree(g,-12.2,12.0,1);tree(g,12.2,12.0,1.1);tree(g,-12.4,8.6,.8);"),
  ("tcb(g,-7.3,1.4,.95,.18);const nb=new THREE.Group();nb.position.set(-7.3,0,1.4);","tcb(g,-10.8,2.4,.95,.18);const nb=new THREE.Group();nb.position.set(-10.8,0,2.4);"),
  ("tc(g,7.4,7.0,1.05);const c=new THREE.Group();c.position.set(7.4,0,7.0);","tc(g,11.4,8.4,1.05);const c=new THREE.Group();c.position.set(11.4,0,8.4);"),
  ("crate(g,-8.4,7.2,.7);crate(g,-7.6,7.6,.55);barrel(g,-7.8,6.4);tc(g,-5.2,8.2,.5);TQ(g,G_CYL,sm(0xd8bc5a),-5.2,.25,8.2,","crate(g,-12.3,10.4,.7);crate(g,-11.5,10.9,.55);barrel(g,-11.8,9.6);tc(g,-8,12.2,.5);TQ(g,G_CYL,sm(0xd8bc5a),-8,.25,12.2,"),
  ("lamp(g,T,-8.8,-2.5);lamp(g,T,8.8,-2.5);lamp(g,T,-4.5,6.8);lamp(g,T,4.5,6.8);","lamp(g,T,-12.6,-3.6);lamp(g,T,12.6,-3.6);lamp(g,T,-6.5,9.8);lamp(g,T,6.5,9.8);"),
  ("[-TS+.62,6,Math.PI/2],[TS-.62,6,-Math.PI/2]","[-TS+.62,8,Math.PI/2],[TS-.62,8,-Math.PI/2]")]:
    assert h.count(a)==1,('town',a[:60],h.count(a));h=h.replace(a,b)
h=h.replace('const RIDGE=[125,230,335,440]','const RIDGE=[175,322,469,616]',1)
for a,b in [('cy:160,fx:46','cy:224,fx:64'),('r:0,cy:105','r:0,cy:147'),('r:1,cy:215','r:1,cy:301'),('r:2,cy:110','r:2,cy:154'),('r:3,cy:205','r:3,cy:287')]:
    assert h.count(a)==1,a;h=h.replace(a,b)
_i=h.index('const BIOMES=[');_j=h.index('\n];',_i);h=h[:_i]+re.sub(r'\{n:([^,]+),sp:([^,]+),x:(\d+),y:(\d+)',lambda m:'{n:'+m.group(1)+',sp:'+m.group(2)+',x:'+str(round(int(m.group(3))*1.4))+',y:'+str(round(int(m.group(4))*1.4)),h[_i:_j])+h[_j:]
# ---- wrap: rename the LAST declaration of each function to NAME_base ----
for nm in ['lootE','take','gFinish','hud','fuseVal','rB0','rS','rF','swing','cast','dodge','gStart','enterRealm','down','kill','doUpgrade','doRecall','spawn','heroHit','hatch','mkC','rC0','mini','HS','hitHero','compHit','hurt','eTick','eStatus','spawnEnemy','area','genItem','idHTML','atmos']:
    i=h.rindex('function '+nm+'(')
    h=h[:i]+'function '+nm+'_base('+h[i+len('function '+nm+'('):]
# ---- const renames ----
rep('const realmSolid=','const realmSolid_old=')
rep("else{e.wt-=dt;if(e.wt<=0){e.wt=R(3,7);e.wx=m.position.x+R(-6,6);e.wz=m.position.z+R(-6,6)}\n      const wx=e.wx-m.position.x,wz=e.wz-m.position.z,wl=Math.hypot(wx,wz);if(wl>.4){sp=.8;ux=wx/wl;uz=wz/wl}}","else{const r_=enemyWander(e,m,dt,now);ux=r_[0];uz=r_[1];sp=r_[2]}")
rep("if(ok.length){mStart(e,tg,ok[Math.random()*ok.length|0]);animC(m,now,false,0);return}","if(ok.length){const pk=ePick(e,ok);if(pk){if(e.ip){m.pose=null;e.ip=0}mStart(e,tg,pk);animC(m,now,false,0);return}}")
rep("const sh=shots[i];sh.m.position.addScaledVector(sh.v,dt);","const sh=shots[i];if(sh.s.home&&dt>0)homeShot(sh,dt);sh.m.position.addScaledVector(sh.v,dt);")
rep("{col:hero.cls=='mage'?0x9a7aff:0xffe08a,mt:'m',splash:.9,basic:1}","{col:hero.cls=='mage'?0x9a7aff:0xffe08a,mt:'m',splash:.9,basic:1,home:1}")
rep("const c=mkC(ccSp,1,0,'');rollMod(c);party=[c];","const c=mkC(ccSp,1,0,'',{hp:1.03,a:1.03,d:1.03,pa:1.03,ma:1.03,pd:1.03,md:1.03});rollMod(c);party=[c];")
rep("    if(e.agg){\n      const ms=MSET","    if(e.agg){if(e.ip){m.pose=null;e.ip=0}\n      const ms=MSET")
rep("const k=.4*(1+(T.empP||0))","const k=.24*(1+(T.empP||0))")
rep("let tg=pl,bd=dpl;fols.forEach((f,i)=>{if(f&&party[i]&&party[i].h>0&&!party[i].emp){const dd=m.position.distanceTo(f.position);if(dd<bd){bd=dd;tg=f}}});","let tg=eTarget(e,m,dpl);")
rep("if(Math.random()<(bs?1:al?.12:.02)*lk){const eg=rollEgg(T);","if(Math.random()<(bs?1:al?.12:.04)*lk){const eg=rollEgg(T);")
rep("kb=e.boss?.2:e.c.al?1.5:3.5;","kb=(e.boss?.2:e.c.al?1.5:3.5)*Math.min(2.4,.7+5*d/M(e.c));")
rep("const hits=area(pl.position,rg,raw*mult,{mt:C.mt,col:0xffe6b0}","const hits=area(pl.position,rg,raw*mult,{mt:C.mt,col:0xffe6b0,basic:1}")
rep('      <div class="setg">Graphics</div>','      <div class="setg">Sound</div>\n      <label class="setr"><span>Sound effects</span><input type="checkbox" id="s_sfx" checked></label>\n      <div class="setg">Graphics</div>')
rep("let gone=sh.t<=0||solid(sh.m.position.x,sh.m.position.z);","let gone=sh.t<=0||solid(sh.m.position.x,sh.m.position.z)||brkShot(sh.m.position);")
rep("Shadowstep',i:'👤',lv:1,k:'blink',m:2.4,cd:7,mp:10,col:0x9a6ae0,d:'Vanish and strike your target from behind with a guaranteed critical hit.'","Shadow Rush',i:'👤',lv:1,k:'blink',m:2.2,cd:6,mp:10,col:0x9a6ae0,d:'Dash forward in a streak of shadow, slicing every enemy in your path. The first enemy hit takes a guaranteed critical hit.'")
rep("case 'blink':{const t=tgt&&!tgt.dead&&d2(tgt.m.position,P)<10?tgt:nearestFront(9);if(!t){hero.cd[key]=0;hero.mp+=sk.mp;say('No target in reach.');return}","case 'blink':{const t=tgt&&!tgt.dead&&d2(tgt.m.position,P)<9?tgt:nearestFront(8);const dv=t?V(t.m.position.x-P.x,0,t.m.position.z-P.z):d.clone().setY(0);const L_=dv.length()||1;dv.multiplyScalar(1/L_);const dist=t?Math.min(8,L_+1.8):5.5;face(dv);hero.iv=Math.max(hero.iv,dist/14+.15);hero.dash={x:dv.x,z:dv.z,t:dist/14};shadowRush(dist,raw,mt,fx,sk);break}if(0){const t=null;")
rep("enemies.slice().forEach(e=>{if(!e.boss&&!e.minion&&!e.dead&&e.m.position.distanceTo(pl.position)>85)removeE(e)})","enemies.slice().forEach(e=>{if(!e.boss&&!e.minion&&!e.ev&&!e.dead&&e.m.position.distanceTo(pl.position)>85)removeE(e)})")
rep("  {const [x,y]=P(pl.position.x,pl.position.z);g.strokeStyle='#fff'","  if(typeof wmExtra=='function')wmExtra(g,P);\n  {const [x,y]=P(pl.position.x,pl.position.z);g.strokeStyle='#fff'")
rep("itName=it=>(it.up?'+'+it.up+' ':'')+itT(it).n;","itName=it=>(it.lp?'★ ':'')+(it.up?'+'+it.up+' ':'')+itT(it).n+(it.set?' ◆':'');")
rep("const POST=(()=>{","\n// ================= v52: dark-fantasy renderer setup (shader patches must run before anything compiles) =================\nvar PSXSET=(()=>{try{return JSON.parse(localStorage.getItem('et_set')||'{}')||{}}catch(_){return {}}})();\nvar PSXON=PSXSET.psx!==false,PSXH=PSXSET.psxRes==null?0:+PSXSET.psxRes;if(!PSXON)PSXH=0;\nif(PSXON){\n  if(PSXH>0){const g=(PSXH*.3).toFixed(1),gx=(PSXH*.3*1.7).toFixed(1);\n    THREE.ShaderChunk.project_vertex+='\\n#ifndef PSX_NOSNAP\\nif(gl_Position.w>0.){vec2 psxG=vec2('+gx+','+g+');gl_Position.xy=floor(gl_Position.xy/gl_Position.w*psxG+.5)/psxG*gl_Position.w;}\\n#endif\\n'}\n  const VW='\\n#ifdef USE_INSTANCING\\nvPsxW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\\n#else\\nvPsxW=(modelMatrix*vec4(transformed,1.)).xyz;\\n#endif\\n';\n  // smooth stony grime: two octaves of value noise in world space\n  const NZ='\\nfloat psxH(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}\\nfloat psxN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(psxH(i),psxH(i+vec3(1,0,0)),f.x),mix(psxH(i+vec3(0,1,0)),psxH(i+vec3(1,1,0)),f.x),f.y),mix(mix(psxH(i+vec3(0,0,1)),psxH(i+vec3(1,0,1)),f.x),mix(psxH(i+vec3(0,1,1)),psxH(i+vec3(1,1,1)),f.x),f.y),f.z);}\\n';\n  const GR='\\n{float n1=psxN(vPsxW*2.3),n2=psxN(vPsxW*.55+7.);diffuseColor.rgb*=.78+.3*n1+.16*(n2-.5);}\\n';\n  ['standard','physical','lambert','phong','toon'].forEach(k=>{const L=THREE.ShaderLib[k];if(!L)return;\n    L.vertexShader='varying vec3 vPsxW;\\n'+L.vertexShader.replace('#include <project_vertex>','#include <project_vertex>'+VW);\n    L.fragmentShader='varying vec3 vPsxW;\\n'+NZ+L.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>'+GR)});\n}\n"+"const POST=(()=>{")
rep("const P={on:true,u:mComp.uniforms,bu:mBright.uniforms,resize(){ren.getDrawingBufferSize(sz);const w=Math.max(2,sz.x|0),h=Math.max(2,sz.y|0);[r0,rb1,rb2,rr].forEach(t=>t&&t.dispose());r0=T(w,h,true);","const P={on:true,u:mComp.uniforms,bu:mBright.uniforms,resize(){ren.getDrawingBufferSize(sz);let w=Math.max(2,sz.x|0),h=Math.max(2,sz.y|0);[r0,rb1,rb2,rr].forEach(t=>t&&t.dispose());if(PSXON&&PSXH>0){h=Math.min(h,PSXH);w=Math.max(2,Math.round(h*sz.x/Math.max(1,sz.y)));r0=new THREE.WebGLRenderTarget(w,h,Object.assign({},opt,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter}))}else r0=T(w,h,true);mComp.uniforms.res.value.set(w,h);")
rep("vec2 q=vUv-.5;c*=1.-dot(q,q)*vig;c+=(hs(vUv*vec2(1731.,977.)+time)-.5)*grain;gl_FragColor=vec4(c,1.);}`,","vec2 q=vUv-.5;c*=1.-dot(q,q)*vig;c+=(hs(vUv*vec2(1731.,977.)+time)-.5)*grain;\n    if(psx>.5){vec2 px=floor(vUv*res);vec2 a=px*.5;float b2a=fract(dot(floor(a),vec2(.5,floor(a.y)*.75)));float b2b=fract(dot(px,vec2(.5,px.y*.75)));float bay=b2a*.25+b2b;c=floor(clamp(c,0.,1.)*31.+bay)/31.;}\n    gl_FragColor=vec4(c,1.);}`,")
rep("uniform sampler2D t,bl,ry;uniform float ex,bk,rk,sat,vig,time,grain;","uniform sampler2D t,bl,ry;uniform float ex,bk,rk,sat,vig,time,grain,psx;uniform vec2 res;")
rep("rayC:{value:new THREE.Color(1,.9,.7)},shT:","rayC:{value:new THREE.Color(1,.9,.7)},psx:{value:PSXON&&PSXH>0?1:0},res:{value:new THREE.Vector2(320,240)},shT:")
rep('family=Inter:wght@400;600;700&family=Cinzel:wght@600;800&display=swap','family=Inter:wght@400;600;700&family=Cinzel:wght@600;800&family=VT323&display=swap')
rep('else if(L<(e.c.al?6:4.5))e.agg=1;','else if(L<(e.c.al?6:4.5)&&seeTg(m.position,tg.position))e.agg=1;')
rep('if(rec.t>=rec.need){rec=null;fadeTo(enterRealm)}','if(rec.t>=rec.need){rec=null;fadeTo(recallTown)}')
rep("$('rcT').textContent='🌀 Recalling to your Realm...'","$('rcT').textContent='🌀 Recalling to '+(home||TOWNS[0]).n+'...'")
rep("say('Recalling to your Realm... stay out of trouble for 4 seconds.')","say('Recalling to '+(home||TOWNS[0]).n+'... stay out of trouble for 4 seconds.')")
rep("'🌀 Recall to Realm <kbd>T</kbd>'","'🌀 Recall to Town <kbd>T</kbd>'")
rep("rm=[1,1.15,1.32,1.55,1.85][it.r]*(1+.07*(it.up||0))","rm=[1,1.15,1.32,1.55,1.85][it.r]*(1+.045*(it.up||0))")
rep("const v=a.v*(1+.05*(it.up||0))","const v=a.v*(1+.033*(it.up||0))")
rep('const solid=(x,z)=>{if(inRealm)','const solid_old=(x,z)=>{if(inRealm)')
i=h.rindex('const compat=');h=h[:i]+'const compat_v2='+h[i+len('const compat='):]
rep("'tal','hatch','start'].some(","'tal','hatch','start','xw'].some(")
rep("const WINS=['fz','bag','inc','cmp','shop','mshop','craft','wmap','setw','tal'];","const WINS=['fz','bag','inc','cmp','shop','mshop','craft','wmap','setw','tal','xw'];")
# ---- v31 bosses: new roster, bigger flat arenas ----
h=re.sub(r"const BOSSES=\[.*?\];",lambda m:'''const BOSSES=[{name:'Grimtusk the Den Mother',title:'Alpha of the Frostwood',sp:'Ashwolf',x:80,y:95,lvl:6},{name:'Bogmaw the Drowned',title:'Guardian of the Heartlands',sp:'Mossfrog',x:78,y:252,lvl:9},{name:'The Ashen Warden',title:'Keeper of the Stone Highlands',sp:'Stoneshell',x:182,y:150,lvl:15},{name:'Mire Colossus',title:'Guardian of the Ashen Reaches',sp:'Gloomcap',x:178,y:55,lvl:19},{name:'Crypt Matriarch',title:'Queen of the Webwood',sp:'Cryptspider',x:285,y:238,lvl:25},{name:'Pyrelord Vash',title:'Guardian of the Cinderfall Marches',sp:'Drakelet',x:285,y:98,lvl:29},{name:'The Hollow King',title:'Lord of the Bone Wastes',sp:'Boneling',x:392,y:90,lvl:35},{name:'The Wailing Lumen',title:'Guardian of the Hollowlands',sp:'Wispling',x:392,y:238,lvl:39},{name:'Stormwing Sovereign',title:'Tyrant of the Cliffs',sp:'Skyhawk',x:487,y:70,lvl:45},{name:'Wyrm of the Waste',title:'The Last Sovereign',sp:'Gravewyrm',x:487,y:252,lvl:50}];''',h,count=1,flags=re.S)
_i=h.index('const BOSSES=[');_j=h.index('\n',_i);h=h[:_i]+re.sub(r'\b(x|y):(\d+)',lambda m:m.group(1)+':'+str(round(int(m.group(2))*1.4)),h[_i:_j])+h[_j:]
rep("if(Math.hypot(x-b.x,y-b.y)<7.5)m[y][x]='a';\n    for(let i=0;i<8;i++){const x=Math.round(b.x+Math.cos(i*.785)*6.6),y=Math.round(b.y+Math.sin(i*.785)*6.6);m[y][x]='r';props.push([x,y,'pillar'])}});","if(Math.hypot(x-b.x,y-b.y)<15.5)m[y][x]='a';\n    for(let i=0;i<16;i++){if(i%4==0)continue;const a=i/16*6.283;m[Math.round(b.y+Math.sin(a)*13.6)][Math.round(b.x+Math.cos(a)*13.6)]='r'}for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;m[Math.round(b.y+Math.sin(a)*6.3)][Math.round(b.x+Math.cos(a)*6.3)]='r'}});")
rep("for(let y=b.y-9;y<=b.y+9;y++)for(let x=b.x-9;x<=b.x+9;x++)","for(let y=b.y-16;y<=b.y+16;y++)for(let x=b.x-16;x<=b.x+16;x++)")
rep("m=smt(7,13,q);","m=smt(16,22,q);")
rep("!BOSSES.some(b=>Math.hypot(q[0]-b.x,q[1]-b.y)<9)","!BOSSES.some(b=>Math.hypot(q[0]-b.x,q[1]-b.y)<17)")
rep("<button id=\"talBtn\">","<button id=\"bossBtn\">👑 Sovereigns <kbd>J</kbd></button><button id=\"talBtn\">")
# ---- v32 fluid combat: hit-pause no longer freezes your own movement; body turns smoothly ----
rep("  if(hstop>0){hstop-=rd/1000;dt*=.08}","  const dtR=dt;if(hstop>0){hstop-=rd/1000;dt*=.3}")
rep("  if(al>0&&dt>0){const msp=","  if(al>0&&dtR>0){const msp=")
rep("walk(pl,ax/al*msp*dt,az/al*msp*dt);if(atkCd<=0)pl.rotation.y=Math.atan2(ax,az);animHero(now,true)}","walk(pl,ax/al*msp*dtR,az/al*msp*dtR);if(!pl.sw){let da=Math.atan2(ax,az)-pl.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));pl.rotation.y+=da*Math.min(1,dtR*18)}animHero(now,true)}")
rep("  if(pl.step&&dt>0){walk(pl,pl.step.x*pl.step.sp*dt,pl.step.z*pl.step.sp*dt);pl.step.t-=dt;","  if(pl.step&&dtR>0){walk(pl,pl.step.x*pl.step.sp*dtR,pl.step.z*pl.step.sp*dtR);pl.step.t-=dtR;")
rep("  if(hero.dash){walk(pl,hero.dash.x*14*dt,hero.dash.z*14*dt);hero.dash.t-=dt;","  if(hero.dash){walk(pl,hero.dash.x*14*dtR,hero.dash.z*14*dtR);hero.dash.t-=dtR;")
rep("if(hits.length){hstop=fin?.08:.045;shake(fin?.2:.06)}","if(hits.length){hstop=fin?.05:.02;shake(fin?.2:.06)}")
rep("burst(gY(t.m.position,1),sk.col,30,2,2,.5);hstop=.07},60)","burst(gY(t.m.position,1),sk.col,30,2,2,.5);hstop=.04},60)")
# ---- v33 companions ----
a=h.index("  // companions (two active slots)\n  fols.forEach((f,i)=>{");b=h.index("  compSpells(dt);\n",a)
h=h[:a]+"  compTick(dt,now);\n"+h[b:]
rep("    const t=enemies.find(e=>!e.dead&&d2(e.m.position,f.position)<8);\n","    const t0=teamFoe(),t=t0&&d2(t0.m.position,f.position)<9?t0:null;\n")
# ---- v36 dungeons: camera + HTML ----
rep("const pt0=inRealm?Math.max(camPitch,.85):camPitch,cdd0=inRealm?Math.max(camDist,9):camDist;","const pt0=(inRealm||inDun)?Math.max(camPitch,.85):camPitch,cdd0=inRealm?Math.max(camDist,9):inDun?Math.max(camDist,8):camDist;")
rep("  if(!inRealm){const ox=Math.sin(camYaw)","  if(!inRealm&&!inDun){const ox=Math.sin(camYaw)")
rep('<button id="talBtn">','<button id="saveBtn">💾 Save game</button><button id="talBtn">')
rep('      <button id="s_reset"','      <div class="setg">Saved game</div><span class="mut" style="font-size:.74rem">The game saves itself every 30 seconds and when you close the tab.</span><button id="delSave" style="justify-self:start">Delete saved game</button>\n      <button id="s_reset"')
# ---- main loop ----
rep("const msp=4.5*(1+HS().mspd)*(hero.chan?.55:1);","const msp=4.5*(1+HS().mspd)*(hero.chan?.55:1)*(riding?1+riding.spd/100:1);")
rep("  pl.position.y=inRealm?0:GH(pl.position.x,pl.position.z);\n","  if(!inRealm)pl.position.y=GH(pl.position.x,pl.position.z);\n")
rep("featTick(dt,now,al);heroTick(dt,now);","featTick(dt,now,al);heroTick(dt,now);homeTick(dt,now,al);")
# ---- build ghost now comes from the new system ----
a=h.index("    if(building){\n      let g=null,col=0xffffff");b=h.index("    }else BGH.visible=false;\n",a)+len("    }else BGH.visible=false;\n")
h=h[:a]+"    if(building)bGhostTick();else bGhostHide();\n"+h[b:]
rep("if(!inRealm){if(building){building=false;realmHud()}BGH.visible=false}","if(!inRealm){if(building){building=false;realmHud()}bGhostHide()}")
# ---- keys ----
rep("  if(building){if(k>='1'&&k<='4'){btab=+k-1;bsel=itemList(btab)[0]||'remove';bRender()}else if(k=='r'){brot=(brot+1)&3;bRender()}else if(k=='x'){bsel='remove';bRender()}}\n","  if(building){if(bKey(k,e))return}\n")
rep("if(k=='['||k==']')camYaw+=","if(!building&&(k=='['||k==']'))camYaw+=")
rep("if(k=='q')drink();","if(k=='q'&&!building)drink();if(k=='z'&&!building&&!e.ctrlKey&&!e.metaKey)drinkMana();if(k=='v'&&!building)toggleMount();if(k=='h')openMounts();if(k=='j')openBosses();")
rep("{const tw={i:'bag',p:'cmp',u:'inc',g:'fz',c:'craft',n:'wmap',o:'setw',k:'tal'}[k];","{const tw={i:'bag',p:'cmp',u:'inc',g:'fz',c:'craft',n:'wmap',o:'setw',k:'tal',h:'xw',j:'xw'}[k];")
rep("x=='p'?drink():cast(+x)","x=='p'?drink():x=='z'?drinkMana():x=='v'?toggleMount():cast(+x)")
# ---- loot drop look for mount eggs ----
rep("gem=new THREE.Mesh(kind=='egg'?new THREE.SphereGeometry","gem=new THREE.Mesh(kind=='egg'||kind=='megg'?new THREE.SphereGeometry")
rep("if(kind=='egg')gem.scale.y=1.3;","if(kind=='egg'||kind=='megg')gem.scale.y=1.3;if(kind=='megg')gem.scale.setScalar(1.5);")
rep("'Trading Post · Magic Shop · '+T.tav","'Trading Post · Magic Shop · Stables · '+T.tav")
# ---- HTML ----
rep('  <div id="hatch" class="modal hide">','''  <div id="xw" class="modal w hide"><div class="win" style="width:min(980px,100%)">
    <div class="wh"><h2 id="xwT"></h2><span class="wsub" id="xwS"></span><button class="x" id="xwClose" title="Close (Esc)">✕</button></div>
    <div class="wb" id="xwB"></div><div class="wf" id="xwF"></div>
  </div></div>
  <div id="hatch" class="modal hide">''')
rep('<button id="talBtn">✦ Talents <kbd>K</kbd></button>','<button id="talBtn">✦ Talents <kbd>K</kbd></button><button id="mntBtn">🐎 Mounts <kbd>H</kbd></button>')
rep('Q potion · ','Q potion · Z mana potion · V ride mount · H mounts · ')
# ---- CSS ----
rep("</style>",open(M+'g_css.css').read()+open(M+'i_css.css').read()+"\n</style>")
rep('  <div id="xw" class="modal w hide">','''  <div id="devp" class="modal"><h2>How are you playing?</h2><p class="sub">The screen and controls adjust to fit. You can switch later in Settings (O).</p><div class="devb"><button data-dev="desktop"><span>🖥️</span>Desktop<small>Keyboard and mouse<br>WASD, mouse camera</small></button><button data-dev="mobile"><span>📱</span>Mobile<small>Full-screen touch controls<br>Turn your phone sideways for the best view</small></button></div></div>
  <div id="mctl"><div id="joy"><i></i></div><div id="mbtn"><button data-m="f" title="Interact">F</button><button data-m="tgt" title="Target nearest">🎯</button><button data-m="dash" title="Dash">💨</button><button data-m="atk" title="Attack (hold)">⚔️</button></div></div>
  <div id="svp" class="modal hide"><div class="svpw"><h2>Welcome back</h2><div id="svpI" class="svpi"></div><div class="devb"><button class="pri" id="svpC">▶ Continue</button><button id="svpN">New game</button></div></div></div>
  <div id="xw" class="modal w hide">''')
rep('      <div class="setg">Graphics</div>','      <div class="setg">Layout</div>\n      <label class="setr"><span>Screen and controls</span><select id="s_dev"><option value="desktop">Desktop (keyboard and mouse)</option><option value="mobile">Mobile (full screen, touch controls)</option></select></label>\n      <div class="setg">Graphics</div>')
rep("addEventListener('pointerup',e=>{bheld=false;if(!(e.buttons&1))atkHeld=false;rmb=false;dp[0]=dp[1]=0});","addEventListener('pointerup',e=>{bheld=false;if(!(e.buttons&1))atkHeld=false;rmb=false;if(joyId==null)dp[0]=dp[1]=0});")
rep("addEventListener('pointercancel',()=>{atkHeld=false;rmb=false;dp[0]=dp[1]=0});","addEventListener('pointercancel',()=>{atkHeld=false;rmb=false;if(joyId==null)dp[0]=dp[1]=0});")
# ---- splice the v3 modules ----
mods=open(M+'a0_new.js').read()+"\n"+open(M+'e_home.js').read()+"\n"+open(M+'f_mount.js').read()+"\n$('mntBtn').onclick=()=>openMounts();\n"+open(M+'h_mobile.js').read()+"\n"+open(M+'j_boss.js').read()+"\n"+open(M+'k_comp.js').read()+"\n"+open(M+'l_inc.js').read()+"\n"+open(M+'m_fuse.js').read()+"\n"+open(M+'n_dun.js').read()+"\n"+open(M+'o_bounty.js').read()+"\n"+open(M+'p_save.js').read()+"\n"+open(M+'q_bal.js').read()+"\n"+open(M+'r_camp.js').read()+"\n"+open(M+'s_fix.js').read()+"\n"+open(M+'t_combat.js').read()+"\n"+open(M+'u_world.js').read()+"\n"+open(M+'v_psx.js').read()+"\n"+open(M+'x_dark.js').read()+"\n"+open(M+'x2_newkit.js').read()+"\n"+open(M+'y_rework.js').read()+"\n"+open(M+'z_boss2.js').read()+"\n"+open(M+'zz_portal.js').read()+"\n"
rep("const dtR=dt;if(hstop>0){hstop-=rd/1000;dt*=.3}","const dtR=dt;if(hstop>0){hstop-=rd/1000;dt*=.3}if(slowT>0){slowT-=rd/1000;dt*=.35}")
rep("  let pTar=pt0;\n  if(!inRealm&&!inDun){const ox=Math.sin(camYaw),oz=Math.cos(camYaw),py=pl.position.y+1.1,blk=(p)=>{const hc=Math.cos(p),sp=Math.sin(p);for(let s=1.2;s<=cdd0;s+=.5){const wy=py+sp*s,r=(MAP[Math.round(pl.position.z+oz*hc*s)]||[])[Math.round(pl.position.x+ox*hc*s)];if(!r)continue;const gy=GH(pl.position.x+ox*hc*s,pl.position.z+oz*hc*s);if((r=='R'&&wy<gy+1.5)||(r=='W'&&wy<gy+3.8)||(r=='B'&&wy<gy+6.4))return true}return false};\n    pTar=1.3;for(let p=pt0;p<=1.3;p+=.1){if(!blk(p)){pTar=p;break}}}","  let pTar=pt0,dTar=cdd0;\n  if(!inRealm&&!inDun){const ox=Math.sin(camYaw),oz=Math.cos(camYaw),py=pl.position.y+1.1,blk=(p)=>{const hc=Math.cos(p),sp=Math.sin(p);for(let s=1.2;s<=cdd0;s+=.5){const wy=py+sp*s,r=(MAP[Math.round(pl.position.z+oz*hc*s)]||[])[Math.round(pl.position.x+ox*hc*s)];if(!r)continue;const gy=GH(pl.position.x+ox*hc*s,pl.position.z+oz*hc*s);if((r=='R'&&wy<gy+1.5)||(r=='W'&&wy<gy+3.8)||(r=='B'&&wy<gy+(fntN(pl.position.x+ox*hc*s,pl.position.z+oz*hc*s)?2.7:6.4)))return s}return 0};\n    const sb=blk(pt0);if(sb){dTar=Math.max(2.8,sb-.8);pTar=Math.min(1.3,pt0+.18*(1-dTar/cdd0)+.05)}}")
rep("const cdd=cdd0,pt=camK,","camDD=(camDD==null?cdd0:camDD);camDD+=(dTar-camDD)*Math.min(1,dt*(dTar<camDD?10:2.2)+.02);const cdd=camDD,pt=camK,")
rep("\n$('talBtn').onclick=openTal;\n","\n"+mods+"\n$('talBtn').onclick=openTal;\n")
open(P,'w').write(h);print('v3 patched',len(h))
h=open(P).read()
rep("Welcome to your Realm, a small island in the sky. Craft Island Tiles (C) to expand it, then press B to build.","Welcome to your Realm, a small island in the sky. Press B to build houses, farms and cooking or alchemy stations. Grow the island with Island Tiles from the Terrain tab.")
for a,b in [('T recall to Realm','T recall to last rested town'),('🌀 Recall to Realm <kbd>T</kbd>','🌀 Recall to Town <kbd>T</kbd>'),("Recall to your Realm (🌀) to build.","Enter your Realm through the 🌀 portal in any town to build."),("Recall to your Realm (🌀 T) to build.","Enter your Realm through the 🌀 portal in any town to build."),("(recall with T, craft with C)","(enter it through the portal in any town, craft with C)"),("(recall with T, then build with B)","(enter it through the portal in any town, then build with B)")]:
    h=h.replace(a,b)
# a fainted companion stays in its slot (no swapping in a benched one) so it can be revived from the HUD
_sw="const j=party.findIndex((c,q)=>q>=2&&c.h>0);if(j>0){const t=party[j];party[j]=me;party[i]=t}ui()}"
assert h.count(_sw)==2;h=h.replace(_sw,"ui()}")
# ---- v55 rework text patches ----
import re as _re
_n=len(_re.findall(r"pr:\['mound',",h));assert _n==12,_n;h=h.replace("pr:['mound',","pr:[")
_a="$('hr').innerHTML='<b>'+nm(c)+'</b><br>'+famT(c)+'<br>HP '+M(c)+' · PA '+cPA(c)+' · MA '+cMA(c)+' · PD '+D(c)+' · MD '+cMD(c)+'<br>Modifiers: '"
_i=h.find(_a);assert _i>0 and h.count(_a)==1;_j=h.find(";\n",_i);h=h[:_i]+"$('hr').innerHTML=hatchInfo(c)"+h[_j:]
_a="say('The egg hatched! '+nm(c)+' · Potential '+pot(c)+'%')";assert h.count(_a)==1;h=h.replace(_a,"say('The egg hatched! '+nm(c)+' · Overall grade '+ovG(c)[1])")
_a="if(s.pos.realm){ret={x:s.pos.x,z:s.pos.z};enterRealm()}";assert h.count(_a)==1;h=h.replace(_a,"if(s.pos.realm){const T0=home||TOWNS[0];pl.position.set(T0.sp[0],0,T0.sp[1]);snapCam()}")
for _x,_y in [("if(ITEMS[k])drop('item',","if(0)drop('item',"),("const townTier=()=>{const ti=townAt(pl.position.x,pl.position.z,2);return Math.max(1,(ti<0?0:ti)+1)};","const townTier=()=>Math.max(1,Math.min(5,tierOfLv(hero.lvl)));"),("if(!r)continue;const gy=GH(pl.position.x+ox*hc*s,pl.position.z+oz*hc*s);if((r=='R'","const gy=GH(pl.position.x+ox*hc*s,pl.position.z+oz*hc*s);if((wy<gy+.8)||(r=='R'"),(' · V ride mount · H mounts',''),('T recall to last rested town','T recall to Duskhold'),(' · N world map',''),(' · U incubators',' · U eggs'),(' · C craft · B build (in Realm)','')]:
    assert h.count(_x)==1,_x;h=h.replace(_x,_y)
# ---- v56 world: floating stronghold + portal maps ----
_wsrc=open(M+'w0_world.js').read();_wp={}
for _blk in _wsrc.split('//@@')[1:]:
    _k,_v=_blk.split('\n',1);_wp[_k.strip()]=_v
def _cut(h,a,b,new,incl_b=False):
    i=h.index(a);j=h.index(b,i)+(len(b) if incl_b else 0);return h[:i]+new+h[j:]
h=_cut(h,'const TIER_LV=','const townAt=',_wp['TOP'])
_i=h.index('const BOSSES=[');_j=h.index('\n',_i);h=h[:_i]+_wp['BOSSES']+h[_j+1:]
h=_cut(h,'const BIOMES=[','\nconst MAP=(()=>{',_wp['BIOMES'])
h=_cut(h,'const MAP=(()=>{','  return m})();',_wp['MAP'],True)
h=_cut(h,'{\n  const AMPN=','\nlet party=[]',_wp['HF'])
open(P,'w').write(h);print('v3 text ok')
