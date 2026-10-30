// ================= Towns, walls and mountain ridges =================
const TLAMP=[],TANIM=[],TPL=[0,1,2,3].map(()=>{const l=new THREE.PointLight(0xffb060,0,11);scene.add(l);return l});
const MCa={},sm=(c,o)=>{const k=c+(o?JSON.stringify(o):'');return MCa[k]||(MCa[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9},o||{})))},gmat=c=>MCa['g'+c]||(MCa['g'+c]=new THREE.MeshBasicMaterial({color:c}));
const G_BOX=new THREE.BoxGeometry(1,1,1),G_CYL=new THREE.CylinderGeometry(1,1,1,16),G_CONE=new THREE.ConeGeometry(1,1,16),G_SPH=new THREE.SphereGeometry(1,14,10),G_OCT=new THREE.OctahedronGeometry(1,0),G_PLN=new THREE.PlaneGeometry(1,1);
function TQ(p,g,m,x,y,z,sx,sy,sz,rx,ry,rz){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;if(rz)o.rotation.z=rz;o.castShadow=sx*sy*sz>.2;o.receiveShadow=true;p.add(o);return o}
function txTex(lines,w,h,bg,fg,border){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  g.fillStyle=bg;g.fillRect(0,0,w,h);if(border){g.strokeStyle=border;g.lineWidth=Math.max(3,h/18);g.strokeRect(g.lineWidth,g.lineWidth,w-g.lineWidth*2,h-g.lineWidth*2)}
  g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
  lines.forEach((l,i)=>{g.font=l.f+' Inter,system-ui,sans-serif';g.fillText(l.t,w/2,h*(i+1)/(lines.length+1)+1)});
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
const signMat=t=>new THREE.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.3,roughness:.8});
const wbase=(p,T)=>p===T.g?[T.cx,T.cy]:[T.cx+p.position.x,T.cy+p.position.z];
let T_cur=null;
const tc=(p,x,z,r)=>{const w=wbase(p,T_cur);T_cur.col.push({x:w[0]+x,z:w[1]+z,r})},tcb=(p,x,z,hx,hz)=>{const w=wbase(p,T_cur);T_cur.col.push({x:w[0]+x,z:w[1]+z,hx,hz})};
TOWNS.forEach(buildTown);
// walls and mountain ridges (instanced)
{const Wt=[],Rt=[];MAP.forEach((r,y)=>r.forEach((t,x)=>{if(t=='W')Wt.push([x,y]);else if(t=='R'&&!(typeof v124Rim=='function'&&v124Rim(x,y)))Rt.push([x,y])}));
 // timber palisade: pointed logs in a 2x2 cluster per wall tile
 const LG=twPaliLog(),LT=twPaliTip(),lg=inst(LG,Wt.length*4,true),lt=inst(LT,Wt.length*4,true);KDPAL={lg,lt,Wt:Wt.slice()};
 Wt.forEach(([x,y],i)=>{const T=TOWNS[townAt(x,y,0)],wc=T.pal.wood;for(let j=0;j<4;j++){const ox=(j&1?.26:-.26)+(Math.random()-.5)*.12,oz=(j&2?.26:-.26)+(Math.random()-.5)*.12,hh=2.5+Math.random()*1.1,k=i*4+j;
   d0.rotation.set((Math.random()-.5)*.07,Math.random()*6.28,(Math.random()-.5)*.07);
   put(lg,k,x+ox,hh*.5-.15,y+oz,1,hh,1,wc,.16);put(lt,k,x+ox,hh-.15+.3,y+oz,1,1,1,wc,.16)}});
 const rk=inst(NK.rock(1,.28,3),Rt.length*3,true);window.WD_RK=rk;rk.material.flatShading=true;rk.material.vertexColors=true;rk.material.needsUpdate=true;
 const rc=(b,k,sn)=>{const q=b.gnd.map((v,i)=>Math.max(30,Math.min(235,v*.4+[84,80,76][i]*.6*k))).map((v,i)=>v*(1-sn)+[232,238,248][i]*sn);return(q[0]<<16)|(q[1]<<8)|q[2]};
 Rt.forEach(([x,y],i)=>{const b=BIOMES[MAP.bio[y][x]],g0=GH(x,y),sn=smt(10.5,15,g0)*.75;
   const mk=(j,s,hh,dx,dz,yo)=>{d0.rotation.set((Math.random()-.5)*.8,Math.random()*6.28,(Math.random()-.5)*.8);put(rk,i*3+j,x+dx,yo,y+dz,s,hh,s,rc(b,.85+Math.random()*.4,sn),.25)};
   const s=1.2+Math.random()*1.2,hh=1.8+Math.random()*2.6;
   mk(0,s,hh,(Math.random()-.5)*.9,(Math.random()-.5)*.9,hh*.35);
   mk(1,.8+Math.random()*.7,1+Math.random()*1.3,(Math.random()-.5)*1.6,(Math.random()-.5)*1.6,.3);
   mk(2,.55+Math.random()*.5,.5+Math.random()*.7,(Math.random()-.5)*2,(Math.random()-.5)*2,.15)});
 d0.rotation.set(0,0,0)}
// town animation + lighting (only runs near the player)
function townTick(now,pp){
  TOWNS.forEach(t=>{const dz=Math.max(0,t.cy-pp.z,pp.z-t.cy-(t.sz||TS)+TS);t.g.visible=Math.hypot(pp.x-t.cx,dz)<62}); // v100
  TANIM.forEach(a=>{if(Math.abs(pp.x-a.x)<40&&Math.abs(pp.z-a.z)<40)a.f(now)});
}
function townLights(pp){
  const near=TLAMP.map(l=>[Math.hypot(l[0]-pp.x,l[2]-pp.z),l]).filter(a=>a[0]<26).sort((a,b)=>a[0]-b[0]);
  TPL.forEach((L,i)=>{const n=near[i];if(n){L.position.set(n[1][0],n[1][1],n[1][2]);L.intensity=.35+1.5*ATM.night}else L.intensity=0});
}

// ---- smooth water + lava surfaces (depth map baked from the heightfield) ----
const WTR=(()=>{
  const mk=(lava)=>{
    const d=new Uint8Array(W*H*4);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const b=BIOMES[MAP.bio[y][x]],k=(y*W+x)*4,lv=lava?.05:.02,ok=!!b.lava==lava,dp=ok?lv-GHv(x,y):-1;d[k]=Math.max(0,Math.min(1,(dp+.5)/2))*255;const w=b.wat;d[k+1]=w[0];d[k+2]=w[1];d[k+3]=w[2]}
    const t=new THREE.DataTexture(d,W,H,THREE.RGBAFormat);t.magFilter=t.minFilter=THREE.LinearFilter;t.needsUpdate=true;
    const m=new THREE.ShaderMaterial({transparent:!lava,depthWrite:lava,uniforms:{dm:{value:t},time:{value:0},lava:{value:lava?1:0},fogC:{value:new THREE.Color()},fogD:{value:.02},hor:{value:new THREE.Color()},top:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3()},sunCol:{value:new THREE.Color()},amb:{value:1},WH:{value:new THREE.Vector2(W,H)}},
    vertexShader:'varying vec3 vP,vW;void main(){vP=position;vW=(modelMatrix*vec4(position,1.)).xyz;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;}',   // v177: vW, the real world spot (fog and view were measured from vP)
    fragmentShader:`varying vec3 vP,vW;uniform sampler2D dm;uniform float time,lava,fogD,amb;uniform vec3 fogC,hor,top,sunDir,sunCol;uniform vec2 WH;
    float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
    float fb(vec2 p){return vn(p)*.5+vn(p*2.03+1.7)*.3+vn(p*4.1+5.2)*.2;}
    void main(){
      vec4 s=texture2D(dm,(vW.xz+.5)/WH);float d=s.r*2.-.5;if(d<-.03)discard;
      vec3 V=normalize(cameraPosition-vW);float dist=length(cameraPosition-vW);
      vec3 col;float al=1.;
      if(lava>.5){float f=fb(vW.xz*.55+vec2(time*.05,time*.03)),g=fb(vW.xz*1.4-vec2(time*.04,0.)+f*2.);
        col=mix(vec3(.55,.08,.02),vec3(1.5,.55,.08),smoothstep(.3,.75,g));col=mix(col,vec3(2.2,1.5,.5),smoothstep(.72,.9,g)*.8);
        col=mix(col,vec3(.12,.04,.03),smoothstep(.55,.2,g)*.8*(1.-smoothstep(.0,.35,d)*0.)); col*=.9+.3*sin(time*.8+vW.x);
        col+=vec3(1.,.35,.05)*smoothstep(.45,0.,d)*.6;
      }else{
        vec2 p=vW.xz*.6;float e=.05;
        float h0=fb(p+vec2(time*.06,time*.04))+fb(p*1.7-vec2(time*.05,time*.03))*.6;
        float hx=fb(p+vec2(e,0.)+vec2(time*.06,time*.04))+fb((p+vec2(e,0.))*1.7-vec2(time*.05,time*.03))*.6;
        float hz=fb(p+vec2(0.,e)+vec2(time*.06,time*.04))+fb((p+vec2(0.,e))*1.7-vec2(time*.05,time*.03))*.6;
        vec3 N=normalize(vec3((h0-hx)*2.2,1.,(h0-hz)*2.2));
        float dp=clamp(d,0.,1.6),k=smoothstep(0.,1.2,dp);
        vec3 tint=s.gba;   // v177: the texture is already 0..1 (/255 made every pond's own colour black: only fog and sky showed)
        vec3 shallow=tint*vec3(.64,.68,.68)+vec3(.012,.016,.016),deep=tint*vec3(.3,.32,.34);
        vec3 body=mix(shallow,deep,k)*(.25+.75*amb);
        vec3 R=reflect(-V,N);float ry=max(R.y,0.);vec3 refl=mix(hor,top,pow(ry,.5));
        float sg=pow(max(dot(R,sunDir),0.),220.);refl+=sunCol*sg*3.;refl+=sunCol*pow(max(dot(R,sunDir),0.),12.)*.12;
        float fr=.04+.7*pow(1.-max(dot(V,N),0.),3.5);   // v177: murkier, the sky mirrored less (ponds read as white holes)
        col=mix(body,refl*.72,clamp(fr,0.,1.));
        float fm=fb(vW.xz*2.4+vec2(time*.1,-time*.07)+h0*.8);
        float foam=smoothstep(.34,.0,d+(fm-.5)*.18)*smoothstep(-.03,.02,d);col=mix(col,vec3(.62,.66,.64)*(.4+.6*amb),foam*.6);
        al=clamp(.66+.4*k+foam,0.,1.)*smoothstep(-.03,.045,d);
      }
      float fg=1.-exp(-fogD*fogD*dist*dist);col=mix(col,fogC,clamp(fg,0.,1.));
      gl_FragColor=vec4(col,al);}`});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(W+4,H+4),m);mesh.rotation.x=-Math.PI/2;mesh.position.set(W/2-.5,lava?.05:.02,H/2-.5);mesh.frustumCulled=false;mesh.renderOrder=lava?1:2;scene.add(mesh);return mesh};
  return {w:mk(false),l:mk(true),set vis(v){this.w.visible=this.l.visible=v}}})();
// trees differ per region: oaks, pines, dead trees, giant mushrooms, crystals, cacti and charred spires (v83: low-poly, painted per face)
const TT=(()=>{const {fin,tr,merge,leaf,bark}=NK,G=THREE;
  const pineTier=(r,hh,sd)=>fin(new G.ConeGeometry(r,hh,7,2),{j:.06,sd,f:(x,y,z)=>{if(y<-hh/2+1e-3)return [x*1.14,y-.07,z*1.14];if(Math.abs(y)<1e-3)return [x*.9,y,z*.9];return [x,y,z]},paint:leaf});
  const PC=[pineTier(.66,.95,1),pineTier(.56,.9,2),pineTier(.45,.85,3),pineTier(.32,.78,4),pineTier(.17,.62,5)];
  const PT=fin(new G.CylinderGeometry(.06,.13,.6,5,2),{j:.02,sd:7,paint:bark});
  // v177: limbs that reach up into the crown, and crowns of uneven clumps (each was one green ball on a stick)
  const OT=merge([fin(new G.CylinderGeometry(.07,.15,.6,7,3),{j:.025,sd:8,f:(x,y,z)=>{const t=y+.3;return y<-.25?[x*1.35,y,z*1.35]:[x+t*t*.05,y,z]},paint:bark}),
    fin(tr(new G.CylinderGeometry(.024,.045,.34,5),.1,.3,0,0,0,-.75),{j:.01,sd:9,paint:bark}),fin(tr(new G.CylinderGeometry(.022,.04,.3,5),-.08,.28,.04,.35,0,.8),{j:.01,sd:10,paint:bark}),
    fin(tr(new G.CylinderGeometry(.018,.035,.28,5),.0,.32,-.09,-.7,0,.1),{j:.01,sd:11,paint:bark})]);
  const canopy=(r,sd)=>merge([[0,0,0,.72],[.5,-.12,.22,.52],[-.45,-.08,-.3,.5],[.1,.28,-.42,.46],[-.2,-.2,.48,.44]].map(([x,y,z,k],i)=>
    fin(tr(new G.IcosahedronGeometry(r*k,1),x*r,y*r,z*r,0,i,0),{j:r*k*.36,sd:sd*7+i,f:(X,Y,Z)=>[X,Y<y*r?y*r-(y*r-Y)*.6:Y,Z],paint:leaf})));
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
// soft contact-shadow decals (ambient occlusion look) under trees
const AOT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(0,0,0,.62)');r.addColorStop(.55,'rgba(0,0,0,.28)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const aoMat=()=>new THREE.MeshBasicMaterial({map:AOT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const AOL=[];
const TL={};trees.forEach(([x,y])=>{const b=BIOMES[MAP.bio[y][x]],ty=b.tree[(x*7+y*13)%b.tree.length];(TL[ty]=TL[ty]||[]).push([x,y,b])});
Object.keys(TL).forEach(ty=>{
  const L=TL[ty],P=TT[ty].map(pt=>{const m=inst(pt[0],L.length,true);if(pt[6])m.material=new THREE.MeshBasicMaterial();m.material.vertexColors=!!pt[0].attributes.color;if(pt[9]){m.sway=pt[9];m.off=pt[1]*.9}return m});
  L.forEach((q,i)=>{
    const sc=(ty=='pine'?1.05+Math.random()*.9:ty=='oak'?.95+Math.random()*.7:.85+Math.random()*.6),X=q[0]+(Math.random()-.5)*.35,Z=q[1]+(Math.random()-.5)*.35,tc=q[2].tc,ry=Math.random()*6.28,tl=(Math.random()-.5)*.1,tz=(Math.random()-.5)*.1;
    // v177: every part of a tree stands on its trunk's ground (each part used the ground under its own offset, so on a slope a
    // crown slid up or down off its trunk), sunk to the lowest ground round the trunk's foot
    let g0=GH(X,Z);{const r=.35*sc;let lo=g0;for(let a=0;a<8;a++)lo=Math.min(lo,GH(X+Math.cos(a*.785)*r,Z+Math.sin(a*.785)*r));g0-=Math.min(.9*sc,Math.max(0,g0-lo-.03))}
    TT[ty].forEach((pt,j)=>{d0.rotation.set(tl,ry,tz);put(P[j],i,X+pt[7]*sc,g0-GH(X+pt[7]*sc,Z)+pt[1]*sc,Z,pt[3]*sc,pt[4]*sc,pt[5]*sc,(tc&&tc[pt[8]]!=null)?tc[pt[8]]:pt[2],.14);if(!(typeof sp152NoNode=='function'&&sp152NoNode(q[0],q[1])))regN(q[0],q[1],P[j],i)});   // v153: a level's trees are scenery
    d0.rotation.set(0,0,0);AOL.push([X,Z,sc*(ty=='pine'?1.15:ty=='oak'?1.4:.8)]);
  });
});
{const ao=inst(new THREE.CircleGeometry(1,16),AOL.length,false);ao.material=aoMat();d0.rotation.set(-Math.PI/2,0,0);
 AOL.forEach(([x,z,r],i)=>{put(ao,i,x,.05,z,r,r,r,0xffffff,0)});d0.rotation.set(0,0,0)}
// grass: tufts of broad tapered blades, dark at the root and bright at the tip (v83 low-poly)
const TUFT=(()=>{const pos=[],col=[],idx=[],nor=[];let n=0;const N=6;for(let i=0;i<N;i++){const a=i/N*6.283+(i%2)*.5,r=.03+((i*37)%10)/10*.07,bx=Math.cos(a)*r,bz=Math.sin(a)*r,hg=.28+((i*53)%10)/10*.26,ln=.06+((i*29)%10)/10*.14,tx=-Math.sin(a)*.05,tz=Math.cos(a)*.05,v=.9+((i*71)%10)/10*.25;
  pos.push(bx-tx,0,bz-tz,bx+tx,0,bz+tz,bx+Math.cos(a)*ln,hg,bz+Math.sin(a)*ln);col.push(.42,.44,.4,.48,.5,.44,1.22*v,1.26*v,1.06*v);nor.push(0,1,0,0,1,0,0,1,0);idx.push(n,n+1,n+2);n+=3}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);g.userData.lps=1;return g})();
const tf=inst(TUFT,gr.length*4,false,true);tf.material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1});tf.sway=.5;tf.off=0;let tk=0;
gr.forEach(([x,y])=>{const b=BIOMES[MAP.bio[y][x]],col=hx(b.grs,1.0);for(let j=0;j<4;j++){const s=.65+Math.random()*.6;d0.rotation.set(0,Math.random()*6.28,0);put(tf,tk++,x+(Math.random()-.5)*.95,0,y+(Math.random()-.5)*.95,s,s*(.75+Math.random()*.6),s,col,.3)}});d0.rotation.set(0,0,0);
// props: rocks, gravestones, pillars, bones, bushes, flowers, glowing mushrooms and crystals (kinds chosen per region)
const PK=(()=>{const {fin,tr,merge,stone,def,rock}=NK,G=THREE;
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
const FLW=[0xf0e060,0xe86a9a,0xffffff,0x9a7aff];
Object.keys(PK).forEach(k=>{
  const L=MAP.props.filter(q=>q[2]==k),m=inst(PK[k][0],L.length,true,k=='flower'||k=='bones'||k=='mush');if(k=='bush'){m.sway=.05;m.off=.1}if(k=='flower'){m.sway=.15;m.off=0}
  if(k=='mush'||k=='crystal'||k=='flower')m.material=new THREE.MeshBasicMaterial();m.material.vertexColors=true;if(k=='flower')m.material.side=THREE.DoubleSide;
  L.forEach(([x,y],i)=>{const s=.7+Math.random()*.6,hy=k=='pillar'?.5+Math.random()*.5:1;put(m,i,x+(Math.random()-.5)*.3,({rock:.25,grave:.35,pillar:.8*hy,bones:.1,bush:.25,mush:.15,crystal:.35,flower:.12,mound:0})[k]*s,y+(Math.random()-.5)*.3,s,s*(k=='crystal'?1.8:hy),s,k=='flower'?FLW[(x+y)%4]:k=='mound'?hx(BIOMES[MAP.bio[y][x]].gnd,.62):PK[k][1],.2);regN(x,y,m,i)});
});
try{wdDeco()}catch(e){console.warn('world deco',e)}
buildVI();
try{wdBuild()}catch(e){console.warn('world deco build',e)}

// soft round sprite for particles
const sc2=document.createElement('canvas');sc2.width=sc2.height=32;
{const c=sc2.getContext('2d'),g=c.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,32,32)}
const SPR=new THREE.CanvasTexture(sc2);
const FN=160,fp=new Float32Array(FN*3);
for(let i=0;i<FN;i++){fp[i*3]=Math.random()*W;fp[i*3+1]=.4+Math.random()*1.6;fp[i*3+2]=Math.random()*H}
const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fp,3));
const fm=new THREE.PointsMaterial({color:0x9affc8,size:.3,map:SPR,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
scene.add(new THREE.Points(fg,fm));
const NM=90,mp2=new Float32Array(NM*3);
for(let i=0;i<NM;i++){mp2[i*3]=Math.random()*W;mp2[i*3+1]=.3+Math.random()*1.2;mp2[i*3+2]=Math.random()*H}
const mg2=new THREE.BufferGeometry();mg2.setAttribute('position',new THREE.BufferAttribute(mp2,3));
const mist=new THREE.Points(mg2,new THREE.PointsMaterial({color:0x8a98b8,size:5,map:SPR,transparent:true,opacity:.1,depthWrite:false}));mist.frustumCulled=false;scene.add(mist);
const stp=new Float32Array(400*3);
for(let i=0;i<400;i++){const a=Math.random()*6.28,e=.15+Math.random()*1.2;stp[i*3]=Math.cos(a)*Math.cos(e)*70;stp[i*3+1]=Math.sin(e)*70;stp[i*3+2]=Math.sin(a)*Math.cos(e)*70}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(stp,3));
const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xdde6ff,size:1.6,sizeAttenuation:false,fog:false,transparent:true,opacity:.8}));stars.frustumCulled=false;scene.add(stars);
const moon=new THREE.Mesh(new THREE.CircleGeometry(5,24),new THREE.MeshBasicMaterial({color:0xe8eeff,fog:false})),halo=new THREE.Mesh(new THREE.CircleGeometry(11,24),new THREE.MeshBasicMaterial({color:0x8090d0,fog:false,transparent:true,opacity:.18,depthWrite:false}));
scene.add(moon,halo);moon.visible=halo.visible=stars.visible=false;
function ambient(now){
  const X=pl.position.x,Z=pl.position.z,wr=(v,c)=>c+(((v-c+14)%28)+28)%28-14;
  for(let i=0;i<FN;i++){fp[i*3]=wr(fp[i*3]+Math.sin(now/900+i)*.003,X);fp[i*3+1]+=Math.cos(now/700+i*2)*.003;fp[i*3+2]=wr(fp[i*3+2]+Math.cos(now/1100+i)*.003,Z)}
  fg.attributes.position.needsUpdate=true;
  for(let i=0;i<NM;i++){mp2[i*3]=wr(mp2[i*3]+.004*Math.sin(now/3000+i),X);mp2[i*3+2]=wr(mp2[i*3+2],Z)}
  mg2.attributes.position.needsUpdate=true;
  SKY.position.copy(cam.position);
}

