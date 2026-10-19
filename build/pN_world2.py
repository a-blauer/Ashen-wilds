# v97 world2 track: every zone 40% bigger again (473x491, the layout numbers live in src/modules/w0_world.js; the grid
# size W=1559,H=1010 is set in build/pN_world.py). Runs inside pV11 after pN_world.py, with the shared `h` and `rep`.
#
# 1. Ground texture. At 4 px per tile the bigger grid would need one 6236x4040 canvas (25M px, ~130 MB on the GPU with
#    mipmaps, over the 4096 limit of many mobile GPUs). The terrain shader only reads that texture at full detail on paved
#    ground (town cobbles, `pav`); everywhere else it samples one colour per triangle at the tile centre (`tF`), so the
#    resolution there makes no visible difference. The ground is now painted twice from the same tile colours:
#      gt  - the whole world at GPX=2 px per tile (3118x2020)
#      gtT - Duskhold's paved square (chunks x 0..96, z 224..320, with a 2-tile apron) at 4 px per tile, as before
#    Each terrain chunk takes the material of the texture that covers it (GTX.pick); the shader gets the texture's origin
#    and size (uGO/uWH) instead of the world size. The paint loop runs in global pixel coordinates, so the town looks the
#    same as before and the noise does not jump at the texture border. The temporary ImageData/colour arrays are freed.
_a=h.index("const PX=4,GW=W*PX,GT=H*PX,gc=document.createElement('canvas');")
_b=h.index("gt.anisotropy=ren.capabilities.getMaxAnisotropy();\n",_a)+len("gt.anisotropy=ren.capabilities.getMaxAnisotropy();\n")
_old=h[_a:_b]
_bc=_old[_old.index("const bc="):_old.index("\n",_old.index("const bc="))]
_tc=_old[_old.index("const TC="):_old.index("{const gd=gid.data")]
_cob=_old[_old.index("if(ct==1){"):_old.index("\n",_old.index("if(ct==1){"))]
_n=_old[_old.index("    const n=cb*"):_old.index("  }}}",_old.index("    const n=cb*"))]
assert "k=(qy*GW+qx)*4" in _n
_n=_n.replace("k=(qy*GW+qx)*4","k=(ly*NW+lx)*4")
_new=("""// v97: two ground textures painted from the same tile colours (see build/pN_world2.py): the world at GPX px per tile,
// Duskhold's paved square at 4 px per tile. GTX.pick(cx,cz) gives a terrain chunk its texture.
const GPX=2;
const GTX=(()=>{
"""+_bc+"\n"+_tc+"""const cl=(v,m)=>v<0?0:v>m?m:v;
const paint=(OX,OY,TW,TH,PX)=>{const NW=TW*PX,NH=TH*PX,c=document.createElement('canvas');c.width=NW;c.height=NH;const g2=c.getContext('2d'),gid=g2.createImageData(NW,NH),gd=gid.data;
 for(let ly=0;ly<NH;ly++){const qy=ly+OY*PX,ty=qy/PX-.5,y0=Math.floor(ty),fy=ty-y0,ya=cl(y0,H-1),yb=cl(y0+1,H-1),yr=cl(Math.round(ty),H-1);
  for(let lx=0;lx<NW;lx++){const qx=lx+OX*PX;
    const tx=qx/PX-.5,x0=Math.floor(tx),fx=tx-x0,xa=cl(x0,W-1),xb=cl(x0+1,W-1),ct=CF[yr*W+cl(Math.round(tx),W-1)];let cb=1;
    """+_cob+"\n"+_n+"""  }}
 g2.putImageData(gid,0,0);return {c,x0:OX,y0:OY,w:TW,h:TH,px:PX}};
// the paved square: chunk-aligned (CHN=32) rectangle around the town, the road to the Portal Court and the Courtyard path
const TR=[0,7,3,10],main=paint(0,0,W,H,GPX),town=paint(TR[0]*32-2,TR[1]*32-2,(TR[2]-TR[0])*32+4,(TR[3]-TR[1])*32+4,4);
return {main,town,list:[main,town],pick:(cx,cz)=>cx>=TR[0]&&cx<TR[2]&&cz>=TR[1]&&cz<TR[3]?town:main}})();
const gt=new THREE.CanvasTexture(GTX.main.c);gt.anisotropy=ren.capabilities.getMaxAnisotropy();GTX.main.t=gt;
const gtT=new THREE.CanvasTexture(GTX.town.c);gtT.anisotropy=gt.anisotropy;GTX.town.t=gtT;
""")
h=h[:_a]+_new+h[_b:]
# every paved tile must lie inside the town texture (checked at build time is not possible: MAP is runtime) -> runtime check
rep("const gtT=new THREE.CanvasTexture(GTX.town.c);",
    "try{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=MAP[y][x];if((t=='P'||t=='B'||t=='W'||t=='p')&&GTX.pick(x>>5,y>>5)!==GTX.town){console.warn('paved tile outside the town texture',x,y);y=H;break}}}catch(_){}\nconst gtT=new THREE.CanvasTexture(GTX.town.c);")
# terrain material per ground texture
rep("mat.onBeforeCompile=sh=>{sh.uniforms.uWH={value:new THREE.Vector2(W,H)};",
    "const obc=T=>sh=>{sh.uniforms.uWH={value:new THREE.Vector2(T.w,T.h)};sh.uniforms.uGO={value:new THREE.Vector2(T.x0,T.y0)};")
rep("varying vec3 vWP;uniform vec2 uWH;\\n'+NZ)","varying vec3 vWP;uniform vec2 uWH,uGO;\\n'+NZ)")
rep("tF=texture2D(map,vec2((fc.x+.5)/uWH.x,1.-(fc.y+.5)/uWH.y))","tF=texture2D(map,vec2((fc.x-uGO.x+.5)/uWH.x,1.-(fc.y-uGO.y+.5)/uWH.y))")
_i=h.index("const obc=T=>sh=>{");_j=h.index("\n  for(let cz=0;cz*CHN<H;cz++)for(let cx=0;cx*CHN<W;cx++){",_i)
h=h[:_j]+"\n  GTX.list.forEach(T=>{const m=T===GTX.main?mat:mat.clone();m.map=T.t;m.flatShading=true;m.userData.lps=1;m.onBeforeCompile=obc(T);T.mat=m});"+h[_j:]
rep("const x0=cx*CHN,z0=cz*CHN,nx=Math.min(CHN,W-x0),nz=Math.min(CHN,H-z0),","const x0=cx*CHN,z0=cz*CHN,TT=GTX.pick(cx,cz),nx=Math.min(CHN,W-x0),nz=Math.min(CHN,H-z0),")
rep("uv[k*2]=(x+.5)/W;uv[k*2+1]=1-(z+.5)/H;","uv[k*2]=(x-TT.x0+.5)/TT.w;uv[k*2+1]=1-(z-TT.y0+.5)/TT.h;")
rep("    const m=new THREE.Mesh(g,mat);m.receiveShadow=true;m.frustumCulled=false;","    const m=new THREE.Mesh(g,TT.mat);m.receiveShadow=true;m.frustumCulled=false;")
# the retro (PSX) look snaps both ground textures
rep("if(PSXON&&PSXH>0&&typeof gt!='undefined'){gt.magFilter=THREE.NearestFilter;gt.needsUpdate=true}",
    "if(PSXON&&PSXH>0&&typeof gt!='undefined'){[gt,typeof gtT!='undefined'?gtT:null].forEach(t=>{if(t){t.magFilter=THREE.NearestFilter;t.needsUpdate=true}})}")
# 2. Dungeon interiors are built east of the world grid at DX0 (the dungeons themselves were retired in v56, zz_portal.js,
#    but keep their builder clear of the zones): the grid now reaches x=1559, so DX0 moves from 1200 to W+60.
rep("const DX0=1200,DZ0=40,","const DX0=W+60,DZ0=40,")
