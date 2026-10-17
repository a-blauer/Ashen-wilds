# v83 low-poly nature: faceted painted terrain, low-poly trees, grass, props, ridge rocks and camps.
# Runs on the built html after pV6 (see build.sh). Only touches world geometry/material code built at load.
import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
P=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
h=open(P).read()
def rep(a,b,n=1):
    global h
    assert h.count(a)==n,(h.count(a),a[:90]);h=h.replace(a,b)
def span(a,b,new,start=0):
    """replace from marker a up to (not including) marker b, both unique after start"""
    global h
    i=h.index(a,start);assert h.count(a)==1 or start,a[:60];j=h.index(b,i);h=h[:i]+new+h[j:]

# ---------- 1. the nature kit: jittered, flat-shaded shapes painted per face ----------
NK=r"""
// ---- v83 low-poly nature kit: jittered, flat-shaded shapes with painted per-face colours ----
// Colours are multipliers on top of each instance's colour, so biome tints still apply.
const NK=(()=>{
  const hs=(a,b,c)=>{const k=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return k-Math.floor(k)};
  // o: j = corner jitter, jy = vertical share of it, f = reshape(x,y,z)->[x,y,z], paint(h,ny,r,x,y,z)->[r,g,b]
  function fin(g,o){o=o||{};const j=o.j||0,sd=o.sd||1;let p=g.attributes.position;
    for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      if(o.f){const v=o.f(x,y,z);x=v[0];y=v[1];z=v[2]}
      if(j){const kx=Math.round(x*400),ky=Math.round(y*400),kz=Math.round(z*400);x+=(hs(kx,ky,kz+sd)-.5)*j;y+=(hs(ky+sd,kz,kx)-.5)*j*(o.jy==null?1:o.jy);z+=(hs(kz,kx+sd,ky)-.5)*j}
      p.setXYZ(i,x,y,z)}
    if(g.index)g=g.toNonIndexed();if(g.attributes.uv)g.deleteAttribute('uv');if(g.attributes.uv2)g.deleteAttribute('uv2');g.computeVertexNormals();g.computeBoundingBox();
    p=g.attributes.position;const n=g.attributes.normal,bb=g.boundingBox,col=new Float32Array(p.count*3),pt=o.paint||def,hy=Math.max(1e-4,bb.max.y-bb.min.y);
    for(let i=0;i+2<p.count;i+=3){const cx=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,cy=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3,cz=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3;
      const c=pt((cy-bb.min.y)/hy,n.getY(i),hs(cx*31.3,cy*17.7,cz*23.1+sd),cx,cy,cz);for(let k=0;k<3;k++)col.set(c,(i+k)*3)}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));g.userData.lps=1;return g}
  const def=(h,ny,r)=>{const v=(.74+.4*h)*(.86+.24*r)*(ny<-.35?.6:1);return [v,v,v]};
  // move a geometry into place (rotation in radians, then translation)
  const tr=(g,x,y,z,rx,ry,rz,s)=>{if(s)g.scale(s[0],s[1],s[2]);if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);if(rz)g.rotateZ(rz);g.translate(x||0,y||0,z||0);return g};
  function merge(gs){let n=0;gs.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
    gs.forEach(g=>{P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);C.set(g.attributes.color.array,o*3);o+=g.attributes.position.count});
    const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(P,3));m.setAttribute('normal',new THREE.BufferAttribute(N,3));m.setAttribute('color',new THREE.BufferAttribute(C,3));m.computeBoundingSphere();m.userData.lps=1;return m}
  // painters
  const leaf=(h,ny,r)=>{if(ny<-.25){const v=.42+.12*r;return [v,v*1.02,v*.95]}const v=(.6+.62*h)*(.84+.3*r);return [v*.98,v*1.04,v*.9]};
  const bark=(h,ny,r)=>{const v=(.62+.3*h)*(.8+.4*r)*(ny>.6?1.15:1);return [v,v*.96,v*.9]};
  const stone=(h,ny,r)=>{if(ny>.55){const v=(.94+.14*r);return r>.55?[v*.86,v*1.0,v*.78]:[v,v,v*.97]}const v=(ny<-.3?.55:.74+.26*h)*(.84+.3*r);return [v,v,v*1.02]};
  const rock=(sz,j,sd)=>fin(new THREE.DodecahedronGeometry(sz,0),{j:j,sd:sd,paint:stone});
  return {fin,def,tr,merge,leaf,bark,stone,rock,hs};
})();
"""
rep("const WIND={t:{value:0}},FADE=",NK+"const WIND={t:{value:0}},FADE=")

# ---------- 2. terrain: every triangle gets one painted colour (paved town tiles keep their cobbles) ----------
rep("gd[k+3]=255;","gd[k+3]=ct?250:255;")
TER=r"""mat.flatShading=true;mat.userData.lps=1;
  mat.onBeforeCompile=sh=>{sh.uniforms.uWH={value:new THREE.Vector2(W,H)};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=position;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform vec2 uWH;\n'+NZ).replace('#include <map_fragment>',`
    vec2 fi=floor(vWP.xz),ff=vWP.xz-fi;float par=mod(fi.x+fi.y,2.);
    vec2 co=par>.5?((ff.x+ff.y<1.)?vec2(.3333):vec2(.6667)):((ff.y>ff.x)?vec2(.3333,.6667):vec2(.6667,.3333));
    vec2 fc=fi+co;
    vec4 tC=texture2D(map,vUv),tF=texture2D(map,vec2((fc.x+.5)/uWH.x,1.-(fc.y+.5)/uWH.y));float pav=step(tC.a,.995);
    vec4 texelColor=mapTexelToLinear(mix(tF,tC,pav));diffuseColor.rgb*=texelColor.rgb;
    {vec3 fn=normalize(cross(dFdx(vWP),dFdy(vWP)));if(fn.y<0.)fn=-fn;float sl=1.-clamp(fn.y,0.,1.);
     vec2 q=mix(fc,vWP.xz,pav);float fh=hs3(fc*1.731+.37);float yc=vWP.y-dot(fn.xz,fc-vWP.xz)/max(fn.y,.2);
     float n1=fb3(q*.8),n2=fb3(q*3.1);
     vec3 rock=vec3(.36,.33,.31)*(.72+.5*n2)*(.82+.36*fh);float rm=smoothstep(.15,.34,sl+(n1-.5)*.16);
     float n0=fb3(q*.045);diffuseColor.rgb*=mix(vec3(.74,.9,.62),vec3(1.02,.98,.86),n0)*(.84+.28*n2)*mix(.84+.3*fh,1.,pav);
     diffuseColor.rgb=mix(diffuseColor.rgb,rock,rm);float sn=smoothstep(9.5,14.,yc+(n1-.5)*4.)*(1.-smoothstep(.22,.6,sl));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.9,.94,1.)*(.84+.16*fh),sn);}`)};
"""
i=h.index("function buildTerrain(chk){")
span("mat.onBeforeCompile=sh=>{\n    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\\nvarying vec3 vWP;varying vec3 vWN;')","\n  for(let cz=0;cz*CHN<H;",TER.rstrip('\n'),i)

# ---------- 3. ridge rocks: chunky boulders with mossy tops ----------
rep("const rk=inst(new THREE.DodecahedronGeometry(1,0),Rt.length*3,true);rk.material.flatShading=true;rk.material.needsUpdate=true;",
    "const rk=inst(NK.rock(1,.28,3),Rt.length*3,true);rk.material.flatShading=true;rk.material.vertexColors=true;rk.material.needsUpdate=true;")

# ---------- 4. trees ----------
TREES=r"""// trees differ per region: oaks, pines, dead trees, giant mushrooms, crystals, cacti and charred spires (v83: low-poly, painted per face)
const TT=(()=>{const {fin,tr,merge,leaf,bark}=NK,G=THREE;
  const pineTier=(r,hh,sd)=>fin(new G.ConeGeometry(r,hh,7,2),{j:.06,sd,f:(x,y,z)=>{if(y<-hh/2+1e-3)return [x*1.14,y-.07,z*1.14];if(Math.abs(y)<1e-3)return [x*.9,y,z*.9];return [x,y,z]},paint:leaf});
  const PC=[pineTier(.66,.95,1),pineTier(.56,.9,2),pineTier(.45,.85,3),pineTier(.32,.78,4),pineTier(.17,.62,5)];
  const PT=fin(new G.CylinderGeometry(.06,.13,.6,5,2),{j:.02,sd:7,paint:bark});
  const OT=merge([fin(new G.CylinderGeometry(.07,.15,.6,6,2),{j:.025,sd:8,f:(x,y,z)=>y<-.29?[x*1.35,y,z*1.35]:[x,y,z],paint:bark}),
    fin(tr(new G.CylinderGeometry(.022,.04,.26,4),.07,.18,0,0,0,-.8),{j:.01,sd:9,paint:bark}),fin(tr(new G.CylinderGeometry(.02,.035,.22,4),-.06,.12,.03,.3,0,.85),{j:.01,sd:10,paint:bark})]);
  const canopy=(r,sd)=>fin(new G.IcosahedronGeometry(r,1),{j:r*.32,sd,f:(x,y,z)=>[x,y<0?y*.7:y,z],paint:leaf});
  const OC=[canopy(.62,6),canopy(.5,7),canopy(.44,8)];
  const DT=fin(new G.CylinderGeometry(.05,.13,.6,5,3),{j:.03,sd:11,f:(x,y,z)=>{const a=y*2.2,c=Math.cos(a),s=Math.sin(a);return [x*c-z*s+y*y*.12,y,x*s+z*c]},paint:(h,ny,r)=>{const v=(.62+.3*h)*(.82+.36*r);return [v,v,v*1.04]}});
  const dpaint=(h,ny,r)=>{const v=(.7+.3*h)*(.82+.36*r);return [v,v,v*1.04]};
  // crooked branches: lean out, then kink back up, with a small fork
  const br=(s,sd)=>merge([fin(new G.CylinderGeometry(.015,.05,.7,4,3),{j:.03,sd,f:(x,y,z)=>{const t=y+.35;return [x+s*(t<.4?t*.55:.22+(t-.4)*.15),y,z+(t>.4?(t-.4)*.12:0)]},paint:dpaint}),
    fin(tr(new G.CylinderGeometry(.008,.02,.28,3),s*.3,.2,.02,0,0,-s*.9),{j:.015,sd:sd+1,paint:dpaint})]);
  const TD=br(1,12),TD2=br(-1,13);
  const SS=fin(new G.CylinderGeometry(.08,.15,.9,6,2),{j:.03,sd:13,paint:(h,ny,r)=>{const v=(.78+.22*h)*(.86+.26*r);return [v,v*.97,v*.92]}});
  const TH=merge([fin(new G.SphereGeometry(1,8,3,0,Math.PI*2,0,Math.PI/2),{j:.12,jy:.6,sd:14,paint:(h,ny,r)=>r>.8&&h>.25?[1.55,1.45,1.4]:[(.78+.3*h)*(.9+.2*r),(.78+.3*h)*(.9+.2*r),(.78+.3*h)*(.9+.2*r)]}),
    fin(tr(new G.CircleGeometry(.98,8),0,.02,0,Math.PI/2),{sd:15,paint:(h,ny,r)=>{const v=.32+.1*r;return [v,v*.9,v*.85]}})]);
  const TO=fin(new G.OctahedronGeometry(.3,0),{j:.05,sd:16,paint:(h,ny,r)=>{const v=.72+.5*r;return [v,v,v]}});
  const CA=fin(new G.CylinderGeometry(.13,.16,1.1,8,3),{j:.025,sd:17,f:(x,y,z)=>{const a=Math.atan2(z,x),k=1+.1*Math.cos(a*4);return [x*k,y>.54?y+.05*(1-Math.hypot(x,z)/.13):y,z*k]},paint:(h,ny,r)=>{const v=(.72+.4*h)*(.86+.24*r)*(ny>.5?1.15:1);return [v,v*1.03,v*.92]}});
  const CB=fin(new G.CylinderGeometry(.065,.07,.5,6,2),{j:.02,sd:18,paint:(h,ny,r)=>{const v=(.72+.4*h)*(.86+.24*r);return [v,v*1.03,v*.92]}});
  const SP=fin(new G.ConeGeometry(.28,1.8,5,3),{j:.07,sd:19,paint:(h,ny,r)=>{const v=(.6+.5*h)*(.8+.4*r);return [v,v*.92,v*.9]}});
  const SG=fin(new G.ConeGeometry(.12,.5,5),{j:.03,sd:20,paint:(h,ny,r)=>{const v=.8+.4*r;return [v,v,v]}});
  // part = [geometry, y, default color, sx, sy, sz, glow, dx, color slot, sway]
  return {
   pine:[[PT,.9,0x3a2a1e,1.5,3,1.5,0,0,0,0],[PC[0],.95,0x17342a,1,1,1,0,0,1,.05],[PC[1],1.45,0x1b3b2c,1,1,1,0,0,1,.06],[PC[2],1.9,0x1f4430,1,1,1,0,0,2,.07],[PC[3],2.3,0x244d34,1,1,1,0,0,2,.08],[PC[4],2.7,0x2a573a,1,1,1,0,0,2,.09]],
   oak:[[OT,.75,0x3a2b1d,1.7,2.5,1.7,0,0,0,0],[OC[0],1.55,0x24471f,1.45,1.05,1.45,0,0,1,.035],[OC[1],1.95,0x2f5a26,1.2,.95,1.2,0,.28,2,.04],[OC[2],1.7,0x3a6a2c,1.1,.9,1.1,0,-.32,2,.04]],
   dead:[[DT,.62,0x3a3640,1.2,2.2,1.2,0,0,0,0],[TD,1.3,0x3a3640,1.3,1.5,1.3,0,.14,0,.02],[TD2,1.55,0x3a3640,1.2,1.3,1.2,0,-.12,0,.02]],
   shroom:[[SS,.45,0xd8cdb0,1.2,1.4,1.2,0,0,0,0],[TH,1.2,0x7a3a6a,.8,.5,.8,0,0,1,.02]],
   crystal:[[TO,.6,0x6ab0ff,1,3,1,1,0,1,0],[TO,.3,0x9ad0ff,.7,2,.7,1,.25,2,0]],
   cactus:[[CA,.55,0x4a7a3a,1.2,1.3,1.2,0,0,0,.01],[CB,.8,0x4a7a3a,1.2,1.2,1.2,0,.24,1,.01]],
   spire:[[SP,1,0x2a1a1a,1.2,1.3,1.2,0,0,3,0],[SG,2.1,0xff5a1a,1.2,1.3,1.2,1,0,4,0]]
  }})();
"""
span("// trees differ per region: oaks, pines","// soft contact-shadow decals",TREES)
rep("const m=inst(pt[0],L.length,true);if(pt[6])m.material=new THREE.MeshBasicMaterial();",
    "const m=inst(pt[0],L.length,true);if(pt[6])m.material=new THREE.MeshBasicMaterial();m.material.vertexColors=!!pt[0].attributes.color;")

# ---------- 5. grass: fewer, broader faceted blades ----------
GRASS=r"""// grass: tufts of broad tapered blades, dark at the root and bright at the tip (v83 low-poly)
const TUFT=(()=>{const pos=[],col=[],idx=[],nor=[];let n=0;const N=6;for(let i=0;i<N;i++){const a=i/N*6.283+(i%2)*.5,r=.03+((i*37)%10)/10*.07,bx=Math.cos(a)*r,bz=Math.sin(a)*r,hg=.28+((i*53)%10)/10*.26,ln=.06+((i*29)%10)/10*.14,tx=-Math.sin(a)*.05,tz=Math.cos(a)*.05,v=.9+((i*71)%10)/10*.25;
  pos.push(bx-tx,0,bz-tz,bx+tx,0,bz+tz,bx+Math.cos(a)*ln,hg,bz+Math.sin(a)*ln);col.push(.42,.44,.4,.48,.5,.44,1.22*v,1.26*v,1.06*v);nor.push(0,1,0,0,1,0,0,1,0);idx.push(n,n+1,n+2);n+=3}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);g.userData.lps=1;return g})();
"""
span("// grass: tufts of tapered blades","const tf=inst(TUFT,",GRASS)

# ---------- 6. props: rocks, tombstones, broken pillars, bone piles, bushes, mushrooms, crystals, flowers, mounds ----------
PROPS=r"""const PK=(()=>{const {fin,tr,merge,stone,def,rock}=NK,G=THREE;
  const tomb=merge([fin(tr(new G.BoxGeometry(.4,.55,.12,1,2,1),0,-.075,0),{j:.025,sd:21,paint:stone}),fin(tr(new G.CylinderGeometry(.2,.2,.12,5,1,false,0,Math.PI),0,0,0,Math.PI/2),{sd:22,paint:stone}).rotateZ(Math.PI/2).translate(0,.2,0)]);
  const pil=fin(new G.CylinderGeometry(.22,.26,1.6,6,3),{j:.04,sd:23,f:(x,y,z)=>y>.79?[x,y-NK.hs(Math.round(x*99),Math.round(z*99),3)*.32,z]:[x,y,z],paint:stone});
  const bone=(h,ny,r)=>{const v=.84+.28*r;return [v,v*.97,v*.88]};
  const bones=merge([fin(tr(new G.CylinderGeometry(.035,.035,.42,4),0,-.07,0,0,.5,Math.PI/2),{sd:24,paint:bone}),fin(tr(new G.CylinderGeometry(.03,.03,.36,4),.03,-.06,.05,0,-.7,Math.PI/2),{sd:25,paint:bone}),fin(tr(new G.IcosahedronGeometry(.11,0),-.08,.0,-.06),{j:.02,sd:26,paint:bone})]);
  const leafy=(h,ny,r)=>{if(ny<-.3){const v=.45+.1*r;return [v,v,v]}const v=(.7+.5*h)*(.84+.3*r);return [v*.97,v*1.05,v*.9]};
  const bush=merge([fin(new G.IcosahedronGeometry(.3,0),{j:.08,sd:27,paint:leafy}),fin(tr(new G.IcosahedronGeometry(.22,0),.2,-.04,.08),{j:.06,sd:28,paint:leafy}),fin(tr(new G.IcosahedronGeometry(.19,0),-.16,-.06,-.1),{j:.06,sd:29,paint:leafy})]);
  const mush=merge([fin(tr(new G.CylinderGeometry(.03,.045,.2,5),0,-.06,0),{sd:30,paint:()=>[.62,.6,.58]}),fin(tr(new G.ConeGeometry(.15,.14,6),0,.07,0),{j:.02,sd:31,paint:(h,ny,r)=>{const v=r>.75?1.35:.9+.2*r;return [v,v,v]}}),fin(tr(new G.CircleGeometry(.15,6),0,.0,0,Math.PI/2),{sd:32,paint:()=>[.4,.38,.4]})]);
  const crys=fin(new G.OctahedronGeometry(.25,0),{j:.06,sd:33,paint:(h,ny,r)=>{const v=.7+.55*r;return [v,v,v]}});
  const flw=merge([fin(tr(new G.CylinderGeometry(.008,.012,.13,3),0,-.065,0),{sd:34,paint:()=>[.3,.55,.26]}),fin(tr(new G.CircleGeometry(.07,5),0,0,0,-Math.PI/2),{sd:35,paint:(h,ny,r)=>{const v=.92+.2*r;return [v,v,v]}}),fin(tr(new G.OctahedronGeometry(.022,0),0,.012,0),{sd:36,paint:()=>[1.25,1.0,.35]})]);
  const mound=fin(new G.SphereGeometry(.42,7,3,0,Math.PI*2,0,Math.PI/2),{j:.05,jy:.4,sd:37,paint:(h,ny,r)=>{const v=(.8+.25*h)*(.84+.3*r);return [v,v,v]}});
  return {rock:[rock(.4,.12,38),0x4a4a52],grave:[tomb,0x5a5a62],pillar:[pil,0x6a6258],bones:[bones,0xd8d0b8],bush:[bush,0x1f4a28],mush:[mush,0xb050a0],crystal:[crys,0x6ab0ff],flower:[flw,0xf0e060],mound:[mound,0x5a4632]}})();
"""
span("const PK={rock:[new THREE.DodecahedronGeometry(.4,0)","\nconst FLW=",PROPS.rstrip('\n'))
rep("if(k=='mush'||k=='crystal'||k=='flower')m.material=new THREE.MeshBasicMaterial();",
    "if(k=='mush'||k=='crystal'||k=='flower')m.material=new THREE.MeshBasicMaterial();m.material.vertexColors=true;if(k=='flower')m.material.side=THREE.DoubleSide;")

# ---------- 7. camps: low-poly ground patches and painted, mottled merged pieces ----------
rep("const CFL=[];// flames that flicker","const CFL=[],CMC=new Map();// flames that flicker (CMC: painted copies of camp materials)")
rep("new THREE.RingGeometry(r0,r1,40,5)","new THREE.RingGeometry(r0,r1,18,3)")
rep("const m=new THREE.Mesh(bg,mat);m.castShadow=e.sh&&!mat.transparent;",
    "let m;if(!mat.transparent&&!mat.isMeshBasicMaterial){const P2=bg.attributes.position,cl=new Float32Array(P2.count*3);for(let i=0;i+2<P2.count;i+=3){const q=Math.sin(P2.getX(i)*12.9898+P2.getY(i)*78.233+P2.getZ(i)*37.719)*43758.5453,v=.8+.32*(q-Math.floor(q));for(let k=0;k<9;k++)cl[i*3+k]=v}bg.setAttribute('color',new THREE.BufferAttribute(cl,3));"
    "if(!CMC.has(mat)){const c=mat.clone();c.vertexColors=true;c.flatShading=true;c.userData.lps=1;CMC.set(mat,c)}m=new THREE.Mesh(bg,CMC.get(mat))}else m=new THREE.Mesh(bg,mat);m.castShadow=e.sh&&!mat.transparent;")
open(P,'w').write(h);print('nature ok')
