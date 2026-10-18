# v89 world track: bigger zones (the layout itself lives in src/modules/w0_world.js), themed decorations (zzN_world.js).
# Runs inside pV11 with the shared `h` and `rep`.
# 1. the world grid grows with the zones: three 338-wide zones per row (x0 110/458/806), two rows of 351 (y0 8/369)
rep("const W=920,H=568,TS=21,TK=1.5;","const W=1154,H=730,TS=21,TK=1.5;")
# 2. the painted ground texture is 5 px per tile; at the bigger grid that is 5770x3650 (21M px). 4 px per tile keeps it the
#    same size as before (4616x2920); the town cobbles keep their size in tiles.
rep("const PX=5,GW=W*PX,GT=H*PX,","const PX=4,GW=W*PX,GT=H*PX,")
rep("if(ct==1){const rw=Math.floor(qy/2.5),lx=(qx+(rw&1)*1.25)%2.5;cb=(lx<.7||qy%2.5<.7)?.78:.96+(((qx/2.5|0)*7+rw*13)%7)/55}",
    "if(ct==1){const rw=Math.floor(qy/2),lx=(qx+(rw&1)*1)%2;cb=(lx<.6||qy%2<.6)?.78:.96+(((qx/2|0)*7+rw*13)%7)/55}")
# 3. terrain chunks that are only empty sky (far below the zones, never walked near) are not built
rep("    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);\n    const m=new THREE.Mesh(g,mat);m.receiveShadow=true;",
    "    if(y1<-30)continue; // v89: skip chunks that are all void\n    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);\n    const m=new THREE.Mesh(g,mat);m.receiveShadow=true;")
# 4. themed decorations join the chunked instancing before it is built (wdDeco is a hoisted function in zzN_world.js)
rep("\nbuildVI();\n","\ntry{wdDeco()}catch(e){console.warn('world deco',e)}\nbuildVI();\ntry{wdBuild()}catch(e){console.warn('world deco build',e)}\n")
# their colliders go in with the other blocked tiles (CBLK is created later than the instancing)
rep("var CBLK=new Set();","var CBLK=new Set(typeof WDCOL!='undefined'&&WDCOL?WDCOL:[]);")
# 5. the Citadel's castle walls are one big instanced mesh drawn from everywhere; remember them so they can hide outside the Citadel
rep("[wm,cm].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.instanceMatrix.needsUpdate=true;scene.add(m)});",
    "[wm,cm].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.instanceMatrix.needsUpdate=true;scene.add(m);(window.CITW=window.CITW||[]).push(m)});")
# 6. terrain colours follow each zone a little more: cliffs take some of the ground colour (sandstone in the desert, blue-grey
#    on the frozen peak), and sandy ground (red > green in the painted map) loses the green tint and the snow on high ground.
rep("vec3 rock=vec3(.36,.33,.31)*(.72+.5*n2)*(.82+.36*fh);",
    "float sand=smoothstep(.05,.13,tF.r-tF.g)*(1.-pav);vec3 rock=mix(vec3(.36,.33,.31),tF.rgb*vec3(.78,.62,.5),.35+.4*sand)*(.72+.5*n2)*(.82+.36*fh);")
rep("diffuseColor.rgb*=mix(vec3(.74,.9,.62),vec3(1.02,.98,.86),n0)*",
    "diffuseColor.rgb*=mix(mix(vec3(.74,.9,.62),vec3(1.02,.98,.86),n0),mix(vec3(.86,.8,.72),vec3(1.06,1.,.9),n0),sand)*")
rep("float sn=smoothstep(9.5,14.,yc+(n1-.5)*4.)*(1.-smoothstep(.22,.6,sl));","float sn=smoothstep(9.5,14.,yc+(n1-.5)*4.)*(1.-smoothstep(.22,.6,sl))*(1.-sand);")
# 7. remember the ridge-boulder instances so the desert can paint them sandstone (zzN_world.js wdBuild)
rep("const rk=inst(NK.rock(1,.28,3),Rt.length*3,true);","const rk=inst(NK.rock(1,.28,3),Rt.length*3,true);window.WD_RK=rk;")
