// ================= v194: runes, part 3 — how runed gear looks =================
// Owner: "Lets have Runes also add a visual element to the equipment. For weapons there could be a subtle fire glow aura around the
// blade for example. For armor maybe there's subtle details like its imbued with magic (subtle red glowing fissures for more hp).
// Mixing 2 types of runes should give a unique visual effect that represents both types of runes combined."
//
// Weapons and shields (anything mkWpn builds that refreshGear hangs on the hero): every mesh of the piece gets a thin additive
// shell (rv194Shell: the same geometry pushed out along its normals, ShaderMaterial RV194_VS / RV194_FS) whose pattern is the
// rune's motif — Ember flickering flame, Frost glints, Storm crackling arcs, Venom creeping blobs, Might a travelling golden
// pulse, Leech a slow blood mist, Vigor beating red cracks, Ward a steel-blue lattice, Deflect silver ripples, Tide flowing bands,
// Swift racing wind streaks, Thorns a rose vine. It is masked to the business end (blade, head, tip; bows and shields whole), and
// a few motes drift off it (rv194Motes, one Points per piece: embers rise, frost and venom fall, sparks jitter …).
// Two different rune types on one piece braid: their motifs spiral round the piece in two strands with a bright seam where they
// meet, in a blend of both colours, and the motes come in both colours; three types make a three-strand braid. Higher ranks glow
// a little stronger and thicker.
// Armour (helm, chest, boots): glowing lines baked into the hero model's glow channel ('g', drawn bright), laid on the outermost
// surface after everything else is built (gkLater, like the v178 ornaments) along a pattern per rune: Vigor jagged fissures, Ward
// angular rune lines, Deflect sweeping arcs, Tide waves, Swift slanted streaks, Thorns a vine with thorns. Two or three types braid
// into twisted strands of each colour with blended knots where they cross. The model key carries the runes (mdGD d.key), so a new
// rune rebuilds the model; the glow channel breathes gently while runed armour is worn (rv194Breathe).
// GPU: shells share the piece's cached geometry (never disposed here); their materials and the mote geometry are cached per look.
var RV194={on:1,mat:{},pts:{},thick:[.0065,.008,.0095],str:[.45,.62,.8],
  // per motif: [mote speed, mote direction (1 up, -1 down, 0 jitter, 2 orbit, 3 along the piece), mote size]
  mote:{ember:[.55,1,7],frost:[.3,-1,5],storm:[1.6,0,5],venom:[.35,-1,6],might:[.35,1,5],leech:[.3,2,6],vigor:[.5,1,5],ward:[.25,2,4],deflect:[.4,2,4],tide:[.4,-1,5],swift:[1.1,3,4],thorns:[.3,-1,6]},
  // where the glow starts along the piece (0 grip → 1 tip)
  mask:{gs:.2,sword:.2,dagger:.22,knives:.22,claws:.3,ga:.55,axes:.5,axe:.5,mace:.6,hammer:.6,flail:.45,halberd:.62,staff:.72,wand:.55,orb:0,bow:0,crossbow:0,sling:0,shield:0}};
const RV194_M=RN194K;   // motif index = rune type index
var RV194_VS=`uniform mat4 uG;uniform float uL,uTh,uT;varying vec3 vP;varying float vT;varying vec3 vN;varying vec3 vV;
void main(){vec4 gp=uG*vec4(position,1.);vP=gp.xyz;vT=uL>0.?clamp(-gp.y/uL,0.,1.):.5;vec3 n=normalize(normal);
  vec3 p=position+n*uTh*(.85+.3*sin(uT*2.7+gp.y*23.));vec4 mv=modelViewMatrix*vec4(p,1.);vN=normalize(normalMatrix*n);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`;
var RV194_FS=`uniform float uT,uA,uN,uS,uL,uH;uniform vec3 uC[6];uniform float uM[3];varying vec3 vP;varying float vT;varying vec3 vN;varying vec3 vV;
float hs(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float ns(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hs(i),hs(i+vec3(1,0,0)),f.x),mix(hs(i+vec3(0,1,0)),hs(i+vec3(1,1,0)),f.x),f.y),mix(mix(hs(i+vec3(0,0,1)),hs(i+vec3(1,0,1)),f.x),mix(hs(i+vec3(0,1,1)),hs(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){return .55*ns(p)+.3*ns(p*2.03+1.7)+.15*ns(p*4.1+3.1);}
// one motif: x = brightness, y = mix toward its second colour
vec2 mo(float m,vec3 p,float t,float T,float rim){
  if(m<.5){float n=fb(p*vec3(9.,6.,9.)+vec3(0.,t*2.3,0.));return vec2(rim*.75+smoothstep(.45,.85,n)*(.5+.7*rim),n);}
  if(m<1.5){float s=step(.972,hs(floor(p*95.)+floor(t*2.5)));return vec2(rim*.8+s*1.6,s);}
  if(m<2.5){float a=abs(fract(p.y*6.+fb(p*5.+t*6.)*2.2)-.5),l=1.-smoothstep(0.,.07,a),fl=.35+.65*step(.4,hs(vec3(floor(t*13.),1.,2.)));return vec2(rim*.7+l*2.*fl,l);}
  if(m<3.5){float n=fb(p*11.+vec3(0.,t*1.1,0.)),b=smoothstep(.56,.76,n);return vec2(rim*.5+b,b);}
  if(m<4.5){float b=.5+.5*sin(t*3.2-T*9.);return vec2(rim*(.5+.75*b),b);}
  if(m<5.5){float n=fb(p*5.+vec3(t*.4,-t*.6,0.));return vec2(rim*.45+smoothstep(.5,.8,n)*.85,n);}
  if(m<6.5){float n=fb(p*8.),c=1.-smoothstep(0.,.045,abs(n-.5)),b=pow(.5+.5*sin(t*6.),8.)+.6*pow(.5+.5*sin(t*6.-.9),8.);return vec2(c*(1.+.8*b)+rim*.3,b);}
  if(m<7.5){vec3 q=p*13.;float l=max(max(1.-smoothstep(0.,.07,abs(fract(q.y+q.x*.5)-.5)),1.-smoothstep(0.,.07,abs(fract(q.y-q.x*.5)-.5))),1.-smoothstep(0.,.07,abs(fract(q.x)-.5)));return vec2(rim*.45+l*.75*(.6+.4*sin(t*2.+p.y*6.)),l);}
  if(m<8.5){float r=1.-smoothstep(0.,.09,abs(fract(length(p)*13.-t*1.1)-.5));return vec2(rim*.65+r*.75,r);}
  if(m<9.5){float w=sin(p.y*14.+fb(p*4.+t*.8)*4.+t*2.),b=smoothstep(.55,1.,w);return vec2(rim*.5+b*.85,b);}
  if(m<10.5){float s=fract(T*4.5-t*1.9+hs(vec3(floor(atan(p.z,p.x)*3.),3.,1.))),k=smoothstep(.82,1.,s);return vec2(rim*.4+k*1.2,k);}
  float n=fb(p*7.),v=1.-smoothstep(0.,.05,abs(n-.5)),th=step(.93,hs(floor(p*40.)));return vec2(v*.85+th*v+rim*.3,th);}
void main(){float rr=pow(1.-abs(dot(normalize(vN),normalize(vV))),1.6),rim=.3+.7*rr,t=uT,T=vT;
  float mk=uA<=0.?1.:smoothstep(uA,uA+.12,T)*(1.-smoothstep(.985,1.,T)*.4);if(mk<.002)discard;
  vec2 a=mo(uM[0],vP,t,T,rim);vec3 c0=mix(uC[0],uC[1],clamp(a.y,0.,1.));float i0=a.x;vec3 col=c0*i0;
  if(uN>1.5){float ang=atan(vP.z*3.,vP.x),ph=ang+vP.y*15.-t*1.7;
    vec2 b=mo(uM[1],vP,t,T,rim);vec3 c1=mix(uC[2],uC[3],clamp(b.y,0.,1.));
    if(uN<2.5){float w=.5+.5*sin(ph),k=smoothstep(.35,.65,w),seam=1.-smoothstep(0.,.13,abs(w-.5));
      col=mix(c0*i0,c1*b.x,k)+(uC[0]+uC[2])*.55*seam*(.6+rim);}
    else{vec2 c=mo(uM[2],vP,t,T,rim);vec3 c2=mix(uC[4],uC[5],clamp(c.y,0.,1.));float w0=sin(ph),w1=sin(ph+2.094),w2=sin(ph+4.189),mx=max(w0,max(w1,w2));
      float mn=min(w0,min(w1,w2)),s2=w0+w1+w2-mx-mn,seam=1.-smoothstep(0.,.16,mx-s2);col=w0==mx?c0*i0:w1==mx?c1*b.x:c2*c.x;col+=(uC[0]+uC[2]+uC[4])*.35*seam*(.5+rim);}}
  gl_FragColor=vec4(col*mk*uS*(uH>.5?rr*rr*.8:.95),1.);}`;
var RV194_PVS=`uniform float uT,uN,uSz;uniform vec3 uUp;uniform float uM[3],uV[3],uD[3],uZ[3];attribute float aS;varying float vA;varying float vK;
void main(){float j=uN>2.5?floor(fract(aS*13.7)*3.):uN>1.5?step(.5,fract(aS*13.7)):0.;vK=j;
  float sp=j<.5?uV[0]:j<1.5?uV[1]:uV[2],dr=j<.5?uD[0]:j<1.5?uD[1]:uD[2],sz=j<.5?uZ[0]:j<1.5?uZ[1]:uZ[2];
  float ph=fract(aS*7.31+uT*sp);vA=sin(ph*3.14159);vec3 p=position;
  vec3 rnd=vec3(fract(aS*91.7),fract(aS*53.3),fract(aS*27.1))-.5;
  if(dr>.5&&dr<1.5)p+=uUp*ph*.16+rnd*.04*ph;else if(dr<-.5)p-=uUp*ph*.1-rnd*.02;
  else if(dr>2.5)p+=vec3(0.,-ph*.18,0.)+rnd*.01;else if(dr>1.5){float a=ph*6.283+aS*9.;p+=vec3(cos(a),0.,sin(a))*.05;}
  else p+=rnd*.06*sin(uT*30.+aS*40.);
  vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=uSz*sz*(.6+.6*vA)/max(.3,-mv.z);gl_Position=projectionMatrix*mv;}`;
var RV194_PFS=`uniform vec3 uC[3];varying float vA;varying float vK;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q);if(d>.25)discard;
  vec3 c=vK<.5?uC[0]:vK<1.5?uC[1]:uC[2];gl_FragColor=vec4(c*vA*(1.-d*4.)*.9,1.);}`;
// the rune types on a piece, in the order they were set (distinct), each with its highest rank
function rv194Types(L){const o=[];(L||[]).forEach(k=>{const p=rn194Parse(k);if(!p)return;const q=o.find(x=>x.t==p.t);if(q)q.r=Math.max(q.r,p.r);else o.push({t:p.t,r:p.r,T:p.T})});return o.slice(0,3)}
const RV194_C=new THREE.Color();
function rv194Col(h){RV194_C.setHex(h);return RV194_C.clone()}
function rv194ShellMat(types,mask,L,mt){const rk=Math.max(...types.map(q=>q.r));
  const C=[];types.forEach(q=>{C.push(rv194Col(q.T.col),rv194Col(q.T.c2))});while(C.length<6)C.push(C[C.length-2].clone(),C[C.length-1].clone());
  const M=types.map(q=>RV194_M.indexOf(q.t));while(M.length<3)M.push(M[0]);
  return new THREE.ShaderMaterial({uniforms:{uG:{value:mt},uL:{value:L},uTh:{value:RV194.thick[rk-1]},uT:{value:0},uA:{value:mask},uH:{value:0},uN:{value:types.length},uS:{value:RV194.str[rk-1]},uC:{value:C},uM:{value:M}},
    vertexShader:RV194_VS,fragmentShader:RV194_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})}
function rv194MoteMat(types){const C=types.map(q=>rv194Col(q.T.col));while(C.length<3)C.push(C[0].clone());const V=[],D=[],Z=[];
  types.forEach(q=>{const m=RV194.mote[q.t]||[.4,1,5];V.push(m[0]);D.push(m[1]);Z.push(m[2])});while(V.length<3){V.push(V[0]);D.push(D[0]);Z.push(Z[0])}
  return new THREE.ShaderMaterial({uniforms:{uT:{value:0},uN:{value:types.length},uSz:{value:3.6},uUp:{value:new THREE.Vector3(0,1,0)},uC:{value:C},uM:{value:[0,0,0]},uV:{value:V},uD:{value:D},uZ:{value:Z}},
    vertexShader:RV194_PVS,fragmentShader:RV194_PFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})}
const RV194_INV=new THREE.Matrix4();
function rv194Tick(o){o.onBeforeRender=function(){const u=this.material&&this.material.uniforms;if(!u)return;u.uT.value=window.__T194!=null?window.__T194:(performance.now()/1000)%600;
  if(u.uUp){RV194_INV.copy(this.matrixWorld).invert();u.uUp.value.set(0,1,0).transformDirection(RV194_INV)}}}
// dress one weapon / shield group in its runes (removes an older dressing first)
function rv194Dress(g,ru){if(!g||!RV194.on)return;rv194Strip(g);const types=rv194Types(ru);if(!types.length)return;
  try{g.updateMatrixWorld(true);const wt=(g.userData&&g.userData.wt)||'sword',inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),box=new THREE.Box3();
    const meshes=[];g.traverse(o=>{if(o.isMesh&&!o.userData.rv194&&o.geometry&&o.geometry.attributes.position&&o.geometry.attributes.normal)meshes.push(o)});if(!meshes.length)return;
    meshes.forEach(m=>{const mt=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld);const b=m.geometry.boundingBox||(m.geometry.computeBoundingBox(),m.geometry.boundingBox);box.union(b.clone().applyMatrix4(mt))});
    const L=Math.max(.05,-box.min.y),mask=RV194.mask[wt]!=null?RV194.mask[wt]:.25,whole=mask<=0;
    meshes.forEach(m=>{const mt=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld),sh=new THREE.Mesh(m.geometry,rv194ShellMat(types,mask,whole?0:L,mt));
      sh.userData.rv194=1;sh.userData.lpsSkip=1;sh.castShadow=false;sh.receiveShadow=false;sh.renderOrder=3;sh.frustumCulled=false;rv194Tick(sh);m.add(sh);
      // the halo: a wider shell that only shows at the silhouette (the aura round the blade)
      const hm=rv194ShellMat(types,mask,whole?0:L,mt);hm.uniforms.uH.value=1;hm.uniforms.uTh.value*=2.8;const ha=new THREE.Mesh(m.geometry,hm);
      ha.userData.rv194=1;ha.userData.lpsSkip=1;ha.castShadow=false;ha.renderOrder=3;ha.frustumCulled=false;rv194Tick(ha);m.add(ha)});
    // motes: points sampled on the glowing part
    const key=meshes.map(m=>m.geometry.uuid).join('|')+'|'+mask;let pg=RV194.pts[key];
    if(!pg){const P=[],S=[],v=new THREE.Vector3();let tries=0;const N=whole?20:24;
      while(P.length<N*3&&tries++<4000){const m=meshes[Math.random()*meshes.length|0],a=m.geometry.attributes.position,i=Math.random()*a.count|0;v.fromBufferAttribute(a,i).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld));
        const T=whole?1:-v.y/L;if(!whole&&T<mask+.06)continue;P.push(v.x,v.y,v.z);S.push(Math.random())}
      pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));pg.setAttribute('aS',new THREE.Float32BufferAttribute(S,1));RV194.pts[key]=pg}
    const pts=new THREE.Points(pg,rv194MoteMat(types));pts.userData.rv194=1;pts.frustumCulled=false;pts.renderOrder=4;rv194Tick(pts);g.add(pts);g.userData.rv194=ru.join(',')}catch(e){console.warn('v194 rune look',e)}}
function rv194Strip(g){if(!g)return;const L=[];g.traverse(o=>{if(o.userData&&o.userData.rv194&&o!==g)L.push(o)});L.forEach(o=>{if(o.parent)o.parent.remove(o);if(o.material&&o.material.dispose)o.material.dispose()});delete g.userData.rv194}
// on every gear refresh (the hero, the bag / character previews, co-op partners): the held pieces get their runes
{const f=refreshGear;refreshGear=function(h,cls,E){const H=h||pl;try{(H.gearG||[]).forEach(rv194Strip)}catch(_){}const r=f.apply(this,arguments);
  try{const EE=E||eq,w=EE.weapon,sh=EE.offhand;(H.gearG||[]).forEach(o=>{const wt=o.userData&&o.userData.wt;if(wt=='shield'){if(sh&&rn194Ru(sh).length)rv194Dress(o,rn194Ru(sh))}else if(w&&rn194Ru(w).length)rv194Dress(o,rn194Ru(w))})}catch(e){console.warn('v194 rune look',e)}
  try{rv194Breathe(H,E||eq)}catch(_){}return r}}
// ---------------- armour: glowing lines on the worn pieces ----------------
// (the gear descriptor carries the runes, so the model cache keys differ)
{const f=mdGD;mdGD=function(it){const d=f.apply(this,arguments);try{if(d&&it&&['helm','chest','boots'].includes(d.sl)){const L=rn194Ru(it);if(L.length){d.ru=L.slice();d.key=(d.key||'')+'|rn:'+L.join('.')}}}catch(_){}return d}}
// a small seeded random per piece (the look never changes between rebuilds)
function rv194Rnd(seed){let s=(mdHash(seed)%2147483646)+1;return ()=>(s=s*16807%2147483647)/2147483647}
// the marks: short lines in (y, angle) space; each style its own shape. A mark is a list of [y, th] (torso, boots) or [ph, th] (head)
function rv194Mark(style,rnd,y,th,dy,n){const P=[[y,th]];let a=(rnd()-.5)*.6;
  for(let i=1;i<=n;i++){const u=i/n;
    if(style=='crack'){a+=(rnd()-.5)*.9;th+=Math.sin(a)*.07+(i%2?.035:-.035);y+=dy}
    else if(style=='rune'){if(i%2)y+=dy*1.3;else th+=(rnd()<.5?-1:1)*.09}
    else if(style=='arc'){th+=.07;y+=dy*Math.cos(u*Math.PI)*1.2}
    else if(style=='wave'){th+=.065;y+=Math.sin(u*Math.PI*2+th)*dy*.9}
    else if(style=='streak'){th+=.06;y+=dy*.8}
    else{a+=(rnd()-.5)*.5;th+=Math.cos(a)*.05;y+=dy*.9}
    P.push([y,th])}return P}
const RV194_STY={vigor:'crack',ward:'rune',deflect:'arc',tide:'wave',swift:'streak',thorns:'vine',ember:'crack',frost:'rune',storm:'crack',venom:'vine',might:'rune',leech:'wave'};
// strands: one per type; two or three types twist round the same mark (a helix in angle), with blended knots where they cross
function rv194Strands(base,types){if(types.length<2)return [{pts:base,q:types[0]}];const n=types.length;
  return types.map((q,j)=>({q,pts:base.map(([y,th],i)=>[y,th+.03*Math.sin(i*1.25+j*2*Math.PI/n)])}))}
function rv194Knots(base,types){if(types.length<2)return [];const K=[];for(let i=1;i<base.length-1;i++)if(Math.abs(Math.sin(i*1.25*types.length/2))<.3)K.push(base[i]);return K}
function rv194Mix(types){const c=new THREE.Color(0,0,0);types.forEach(q=>c.add(new THREE.Color(q.T.col)));c.multiplyScalar(1/types.length);c.lerp(new THREE.Color(0xffffff),.25);return c.getHex()}
// one glowing line: a dark scorched edge under a thin bright core (it reads as a crack lit from inside)
function rv194Line(k,bn,pts,rr,col,wf){if(pts.length<2)return;o176Tube(k,bn,pts,rr*2.3,rr*1.4,mdMix(col,0x0a0604,.82),'c',wf,3);o176Tube(k,bn,pts.map(p=>p),rr,rr*.55,col,'g',wf,3)}
// the armour round the lines takes a faint glow of the rune's colour (baked into the facets' vertex colours)
function rv194Tint(B,L,R){if(!L.length)return;const R2=R*R;let y0=1e9,y1=-1e9;L.forEach(q=>{y0=Math.min(y0,q.p[1]);y1=Math.max(y1,q.p[1])});const C=new THREE.Color();
  ['c','m'].forEach(t=>{const b=B.L[t];if(!b)return;const p=b.p,c=b.c;for(let i=0;i+8<p.length;i+=9){const x=(p[i]+p[i+3]+p[i+6])/3,y=(p[i+1]+p[i+4]+p[i+7])/3,z=(p[i+2]+p[i+5]+p[i+8])/3;if(y<y0-R||y>y1+R)continue;
    let best=R2,bq=null;for(const q of L){const dx=x-q.p[0],dy=y-q.p[1],dz=z-q.p[2],d=dx*dx+dy*dy+dz*dz;if(d<best){best=d;bq=q}}if(!bq)continue;
    const k=.42*(1-Math.sqrt(best)/R);C.setHex(bq.col);for(let v=0;v<3;v++){const j=i+v*3;c[j]+=(C.r-c[j])*k;c[j+1]+=(C.g-c[j+1])*k;c[j+2]+=(C.b-c[j+2])*k}}})}
function rv194Draw(B,k,bn,types,marks,proj,wf,rr,dir){const T=[];marks.forEach(base=>{rv194Strands(base,types).forEach(S=>{const pts=proj(S.pts);rv194Line(k,bn,pts,rr,S.q.T.col,wf);pts.forEach(p=>T.push({p,col:S.q.T.col}));if(RV194.acc&&dir)pts.forEach((p,i)=>{if(i%2==0)RV194.acc.push({p,n:dir(p),col:S.q.T.col,bn})});
    if(S.q.t=='thorns')pts.forEach((p,i)=>{if(i%2==1){const l=Math.hypot(p[0],p[2])||1;k.L(bn,'g',S.q.T.col,p,[p[0]+p[0]/l*.012,p[1]+.005,p[2]+p[2]/l*.012],.0028,.0003,3);if(wf)mdOW(k,typeof wf=='function'?wf(p):wf)}})});
    rv194Knots(base,types).forEach(q=>{const pp=proj([q]);if(pp[0]){const p=pp[0];k.p(bn,'oct','g',rv194Mix(types),p[0],p[1],p[2],.0055,.0055,.0038);if(wf)mdOW(k,typeof wf=='function'?wf(p):wf)}})});return T}
function rv194Chest(B,P,d){const types=rv194Types(d.ru);if(!types.length)return;const k=dkKit(),rnd=rv194Rnd('c'+d.key),rk=Math.max(...types.map(q=>q.r)),rr=.0011+.0003*rk,sty=RV194_STY[types[0].t]||'crack';
  const n=6+2*rk,marks=[];for(let i=0;i<n;i++){const th=(i/n)*Math.PI*2+(rnd()-.5)*.45,up=i%2==0,y=up?.69+rnd()*.06:.86+rnd()*.08,dy=(up?1:-1)*(.02+rnd()*.008);marks.push(rv194Mark(sty,rnd,y,th,dy,6+(rnd()*3|0)))}
  const proj=L=>o176Path(B,P,L.map(([y,th])=>[Math.max(.64,Math.min(.97,y)),th]),.0085);
  const T=rv194Draw(B,k,'chest',types,marks,proj,A7W,rr,p=>{const l=Math.hypot(p[0],p[2])||1;return [p[0]/l,0,p[2]/l]});if(k.P.length)mdKit(B,k);rv194Tint(B,T,.032)}
function rv194Helm(B,P,d,n0){const types=rv194Types(d.ru);if(!types.length)return;const H=a7Head(B);if(!H)return;const k=dkKit(),rnd=rv194Rnd('h'+d.key),rk=Math.max(...types.map(q=>q.r)),rr=.001+.0003*rk,sty=RV194_STY[types[0].t]||'crack';
  const c=[0,H.y-.085,H.top[2]+.015],at=(th,ph)=>o176HeadAt(B,c,th,ph,.0065,null,n0);
  const n=2+rk,marks=[];for(let i=0;i<n;i++){const th=(i/n)*Math.PI*2+(rnd()-.5)*.6,ph=.25+rnd()*.45;marks.push(rv194Mark(sty,rnd,ph,th,(rnd()<.5?-1:1)*.06,4+(rnd()*2|0)))}
  const proj=L=>L.map(([ph,th])=>{const q=at(th,Math.max(.05,Math.min(1.3,ph)));return q?q.p:null}).filter(Boolean);
  const T=rv194Draw(B,k,'head',types,marks,proj,null,rr,p=>{const v=[p[0]-c[0],p[1]-c[1],p[2]-c[2]],l=Math.hypot(...v)||1;return v.map(x=>x/l)});if(k.P.length)mdKit(B,k);rv194Tint(B,T,.025)}
function rv194Boots(B,P,d,R){const types=rv194Types(d.ru);if(!types.length||!R)return;const k=dkKit(),rnd=rv194Rnd('b'+d.key),rk=Math.max(...types.map(q=>q.r)),rr=.001+.0003*rk,sty=RV194_STY[types[0].t]||'crack';
  let top=.32;{const p=a7PtsR(B,-1,.6,R);let m=0;for(let i=0;i<p.length;i+=3)m=Math.max(m,p[i+1]);if(m>.08)top=m}let T=[];
  [-1,1].forEach(s=>{const bn=s<0?'lh1':'rh1',side=(x,yy,z)=>s*x>0,cache={},Sx=y=>{const kk=y.toFixed(3);return cache[kk]||(cache[kk]=a7RingP(a7PtsR(B,y-.015,y+.015,R),y,side))},nw=p=>a7NearW(B,p);
    const n=1+rk,marks=[];for(let i=0;i<n;i++){const th=(i/n)*Math.PI*2+(rnd()-.5)*.8,y=.08+rnd()*(top-.16);marks.push(rv194Mark(sty,rnd,y,th,.018,4))}
    const proj=L=>L.map(([y,th])=>{const q=Sx(Math.round(Math.max(.05,Math.min(top-.03,y))/.006)*.006);return q.ok?q.at(th,.0065).p:null}).filter(Boolean);
    const cx=s*.09;T=T.concat(rv194Draw(B,k,bn,types,marks,proj,nw,rr,p=>{const v=[p[0]-cx,0,p[2]-.02],l=Math.hypot(...v)||1;return v.map(x=>x/l)}))});if(k.P.length)mdKit(B,k);rv194Tint(B,T,.022)}
{const c=mdChest,h=mdHelm,b=mdBoots,run=(fn,B,P,d,x)=>{if(!RV194.on||!d||!d.ru||!d.ru.length)return;gkLater(B,B2=>{try{fn(B2,P,d,x)}catch(e){console.warn('v194 rune armour',e)}})};
  mdChest=function(B,P,d){const r=c.apply(this,arguments);run(rv194Chest,B,P,d);return r};
  mdHelm=function(B,P,d){const n0={};for(const t in B.L)n0[t]=B.L[t].p.length;const r=h.apply(this,arguments);run(rv194Helm,B,P,d,n0);return r};
  mdBoots=function(B,P,d){const n0={};for(const t in B.L)n0[t]=B.L[t].p.length;const r=b.apply(this,arguments);const n1={};for(const t in B.L)n1[t]=B.L[t].p.length;if(d&&d.key)run(rv194Boots,B,P,d,{n0,n1});return r}}
// the glow channel breathes while runed armour is worn (heartbeat for Vigor, a slow swell otherwise)
function rv194Breathe(h,E){if(!h||!h._mdM||!h._mdM.g)return;const types=rv194Types(['helm','chest','boots'].flatMap(s=>E&&E[s]?rn194Ru(E[s]):[]));const M=h._mdM.g;
  (h._mdX||[]).forEach(m=>{if(m.material!==M)return;if(!types.length){M.color.setScalar(1);return}
    const vg=types.some(q=>q.t=='vigor'),fn=function(){const t=performance.now()/1000,b=vg?Math.pow(.5+.5*Math.sin(t*5.2),6)+.5*Math.pow(.5+.5*Math.sin(t*5.2-.9),6):.5+.5*Math.sin(t*1.6);M.color.setScalar(.8+.2*Math.min(1,b))};fn.rv194=1;m.onBeforeRender=fn})}

// ---------------- armour glow: soft points along the lines, riding the bones (true additive light; breathes) ----------------
RV194.glow={};RV194.gg={};RV194.acc=null;
{const f=mdHeroB;mdHeroB=function(cls,L,E){const o=RV194.acc;RV194.acc=[];try{const B=f.apply(this,arguments);try{const k=mdHeroKey(cls,L,E);if(RV194.acc.length)RV194.glow[k]=RV194.acc;else delete RV194.glow[k]}catch(_){}return B}finally{RV194.acc=o}}}
var RV194_GVS=`uniform float uT,uPx;attribute float aS;varying vec3 vC;varying float vA;void main(){vC=color;vA=.55+.45*sin(uT*(1.4+aS)+aS*6.283);vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=uPx*.06/max(.25,-mv.z);gl_Position=projectionMatrix*mv;}`;
var RV194_GFS=`varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q)*4.;if(d>1.)discard;gl_FragColor=vec4(vC*vA*exp(-d*3.2)*(1.-d)*.5,1.);}`;
function rv194GMat(){if(!RV194.gm)RV194.gm=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uPx:{value:420}},vertexShader:RV194_GVS,fragmentShader:RV194_GFS,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});return RV194.gm}
function rv194Glow(h){if(!h)return;(h._rv194G||[]).forEach(o=>{if(o.parent)o.parent.remove(o)});h._rv194G=[];const L=h._mdKey&&RV194.glow[h._mdKey];if(!L||!L.length||!h.bones)return;
  const body=typeof huBody=='function'?huBody(h):null;if(!body||!body.skeleton)return;const by={};L.forEach(q=>{(by[q.bn]=by[q.bn]||[]).push(q)});
  for(const bn in by){const b=h.bones[bn];if(!b)continue;const gk=h._mdKey+'|'+bn;let g=RV194.gg[gk];
    if(!g){const i=body.skeleton.bones.indexOf(b);if(i<0)continue;const M=new THREE.Matrix4().multiplyMatrices(body.skeleton.boneInverses[i],body.bindMatrix),v=new THREE.Vector3(),c=new THREE.Color(),P=[],C=[],S=[];
      by[bn].forEach((q,j)=>{v.set(q.p[0]+q.n[0]*.009,q.p[1]+q.n[1]*.009,q.p[2]+q.n[2]*.009).applyMatrix4(M);P.push(v.x,v.y,v.z);c.setHex(q.col);C.push(c.r,c.g,c.b);S.push((j*.618)%1)});
      g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(S,1));RV194.gg[gk]=g}
    const pt=new THREE.Points(g,rv194GMat());pt.userData.rv194=1;pt.frustumCulled=false;pt.renderOrder=4;rv194Tick(pt);b.add(pt);h._rv194G.push(pt)}}
{const f=refreshGear;refreshGear=function(h){const r=f.apply(this,arguments);try{rv194Glow(h||pl)}catch(e){console.warn('v194 armour glow',e)}return r}}
