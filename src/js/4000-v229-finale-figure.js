// ================= v229: the fountain's finale, part 1 of 3 — the Voice's body (owner, Nov 13 2026) =================
// "A massive gangly pale creature with white beady eyes and a gaping mouth with sharp teeth, long nails and black magic ... He was
// the one talking to you ... His limbs and body contort into a more human version and he clothes himself in an elegant crimson
// robe with gold thread patterns ... ivory gangly wings emerge out of his back."
// The Voice is two bodies on the game's cage humanoid (the creature and the man, see below) under one root; the change is the
// creature drawing in (its limbs shorten, its skin warms) until, inside the black fire, the man stands in its place (fn229Shape).
// Arms and legs are placed by two-bone IK on the skinned bones from hand / foot targets, so poses read "hand here, foot there".
// Everything in the cinematic (this figure, the den of part 2) is drawn with one small lit shader of its own (fn229Mat): faceted
// normals from screen derivatives, a sky / ground ambient, one key light, four point lights, a rim, an inner glow and the game's
// fog. Its lights are uniforms (FN229.L), not scene lights, so the game's own lights and shaders are never touched or rebuilt.
var FN229={v:229,seen:0,run:false,S:null,err:null,
  L:{hemiS:{value:new THREE.Color(.3,.3,.4)},hemiG:{value:new THREE.Color(.08,.07,.1)},keyD:{value:new THREE.Vector3(.3,.8,.5).normalize()},keyC:{value:new THREE.Color(0,0,0)},
    rimC:{value:new THREE.Color(.2,.2,.3)},rimP:{value:3},lp:{value:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]},
    lc:{value:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]},lr:{value:[1,1,1,1]},t:{value:0}}};
function fn229Rng(seed){let s=Math.floor(Math.abs(+seed||1)*7919)%2147483646+1;return ()=>((s=s*16807%2147483647)-1)/2147483646}
function fn229H(i,j,k){const v=Math.sin(i*127.1+j*311.7+k*74.7)*43758.5453;return v-Math.floor(v)}
// smooth value noise, 0..1
function fn229Nz(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z);let a=x-xi,b=y-yi,c=z-zi;a=a*a*(3-2*a);b=b*b*(3-2*b);c=c*c*(3-2*c);const H=fn229H,L=(p,q,t)=>p+(q-p)*t;
  return L(L(L(H(xi,yi,zi),H(xi+1,yi,zi),a),L(H(xi,yi+1,zi),H(xi+1,yi+1,zi),a),b),L(L(H(xi,yi,zi+1),H(xi+1,yi,zi+1),a),L(H(xi,yi+1,zi+1),H(xi+1,yi+1,zi+1),a),b),c)}
function fn229Fbm(x,y,z){return fn229Nz(x,y,z)*.55+fn229Nz(x*2.1+3,y*2.1+5,z*2.1+7)*.3+fn229Nz(x*4.3+11,y*4.3+13,z*4.3+17)*.15}
function fn229Sm(k){k=k<0?0:k>1?1:k;return k*k*(3-2*k)}
function fn229K(t,a,b){return t<=a?0:t>=b?1:(t-a)/(b-a)}
function fn229Lerp(a,b,k){return a+(b-a)*k}
function fn229Mx(a,b,k){return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]}
function fn229Sh(c,k){return [c[0]*k,c[1]*k,c[2]*k]}

// ---------------- the lit shader ----------------
var FN229_SH={
  v:'attribute float em;attribute float rv;uniform float t,flut;varying vec3 vC,vV,vO,vW;varying float vE,vR;varying vec2 vU;varying vec3 vN;\n#include <skinning_pars_vertex>\n#include <fog_pars_vertex>\n'+
    'void main(){vC=color;vE=em;vR=rv;vU=uv;vO=position;vec3 p=position;\n'+
    '#ifdef ROBE\n{float w=flut*uv.y*uv.y;p.x+=sin(t*3.1+position.y*5.+uv.x*12.566)*.05*w;p.z+=cos(t*2.6+position.y*4.+uv.x*18.85)*.05*w+flut*uv.y*uv.y*uv.y*.0;}\n#endif\n'+
    'vec3 transformed=p;\n#include <skinbase_vertex>\n#include <skinning_vertex>\nvec3 objectNormal=normal;\n#include <skinnormal_vertex>\nvN=normalMatrix*objectNormal;\nvec4 w4=modelMatrix*vec4(transformed,1.);vW=w4.xyz;vec4 mvPosition=viewMatrix*w4;vV=mvPosition.xyz;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
  f:'uniform vec3 hemiS,hemiG,keyD,keyC,rimC,emC;uniform vec3 lp[4];uniform vec3 lc[4];uniform float lr[4];uniform float t,rimP,rimK,emK,iri,op,rev,gr,gold,flash,lit,vein,tintK,smK;uniform vec3 tintC;varying vec3 vC,vV,vO,vW,vN;varying float vE,vR;varying vec2 vU;\n#include <fog_pars_fragment>\n'+
    'float h3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}'+
    'float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}'+
    'vec3 pal(float h){return .55+.45*cos(6.2832*(h+vec3(0.,.33,.67)));}\n'+
    // skin detail in the bind pose (it sticks to the skin): veins, fine creases, pores; on the creature the ribs and the spine's
    // knuckles. Returns a height (for the bump), the vein mask vm and a paint multiplier sh
    '#ifdef SKIN\nuniform vec4 lm;uniform float bump,veinA,det;uniform vec3 veinC;\nfloat skinH(vec3 p,out float vm,out float sh){vec3 q=p+.05*vec3(n3(p*9.),n3(p*9.+5.),n3(p*9.+11.));float vn=1.-abs(n3(q*23.+3.)-.5)*2.,v2=1.-abs(n3(q*51.+9.)-.5)*2.,pa=smoothstep(.35,.7,n3(p*4.+2.));vm=(smoothstep(.93,.99,vn)*.7+smoothstep(.95,.995,v2)*.45)*(.25+.75*pa);\n'+
    ' float wr=n3(vec3(p.x*9.,p.y*110.,p.z*9.));float h=vm*.45+((wr-.5)*.3+(n3(p*70.)-.5)*.2)*det;sh=1.-.1*det*smoothstep(.6,.95,wr);\n'+
    '#ifdef BEAST\n{float yy=p.y+abs(p.x)*.5,ry=(lm.x+lm.y*.5-yy)/lm.y;float mk=smoothstep(0.,.4,ry)*smoothstep(7.,6.5,ry)*smoothstep(-.06,-.02,p.z)*smoothstep(.012,.04,abs(p.x));float rd=exp(-pow((fract(ry)-.5)/.22,2.));h+=(rd-.5)*2.4*mk;sh*=mix(1.,mix(.5,1.16,rd),mk);\n'+
    ' float mb=smoothstep(-.02,-.07,p.z)*exp(-pow(p.x/.017,2.))*smoothstep(lm.w,lm.w+.05,p.y)*smoothstep(lm.z,lm.z-.04,p.y);float kb=exp(-pow((fract((lm.z-p.y)/.05)-.5)/.25,2.));h+=kb*2.*mb;sh*=1.+.22*kb*mb;}\n#endif\n return h;}\n#endif\n'+
    // gold thread on the robe: hem bands with a diamond chain and a running scroll, a border down the front, small sprigs
    '#ifdef ROBE\nfloat thread(vec2 u){float g=0.;float v=u.y,x=u.x;\n'+
    ' float b1=smoothstep(.012,.0,abs(v-.955))+smoothstep(.008,.0,abs(v-.915))+smoothstep(.008,.0,abs(v-.86));\n'+
    ' float dx=abs(fract(x*14.)-.5),dy=abs(v-.887)/.05;float dia=smoothstep(.07,.0,abs(dx*2.+dy*2.-.62))*step(dy,.52);\n'+
    ' float sc=smoothstep(.007,.0,abs(v-.83+.018*sin(x*88.)))+smoothstep(.006,.0,abs(v-.80+.014*sin(x*88.+1.6)));\n'+
    ' float curl=smoothstep(.01,.0,abs(length(vec2(fract(x*14.+.5)-.5,(v-.775)*3.2))-.2))*step(v,.80)*step(.72,v);\n'+
    ' g=max(max(b1,dia),max(sc,curl));\n'+
    ' vec2 q=vec2(fract(x*7.)-.5,fract(v*9.+floor(x*7.)*.5)-.5);float sp=smoothstep(.05,.0,abs(abs(q.x)+abs(q.y)-.11))+smoothstep(.02,.0,length(q));g=max(g,sp*step(v,.7)*step(.06,v)*.85);\n'+
    ' return clamp(g,0.,1.);}\n#endif\n'+
    'void main(){vec3 N=normalize(cross(dFdx(vV),dFdy(vV)));if(smK>0.){vec3 sn=normalize(vN);if(dot(sn,N)<0.)sn=-sn;N=normalize(mix(N,sn,smK));}vec3 Nw=normalize((vec4(N,0.)*viewMatrix).xyz);vec3 V=normalize(-vV);\n'+
    ' vec3 alb=vC;float g1=n3(vO*9.),g2=n3(vO*2.3+7.);alb*=1.-gr+gr*(.55*g1+.75*g2);float vm=0.;\n#ifdef SKIN\n{float shd;float h=skinH(vO,vm,shd);float dk=dot(alb,vec3(.34));alb=mix(alb,veinC,vm*veinA*smoothstep(.05,.3,dk))*shd;\n  vec3 dpx=dFdx(vV),dpy=dFdy(vV);float hx=dFdx(h),hy=dFdy(h);vec3 r1=cross(dpy,N),r2=cross(N,dpx);float det=dot(dpx,r1);vec3 gd=sign(det)*(hx*r1+hy*r2);N=normalize(abs(det)*N-bump*gd);Nw=normalize((vec4(N,0.)*viewMatrix).xyz);}\n#endif\nalb=mix(alb,tintC*(alb.r+alb.g+alb.b)*.4,tintK);float spec=0.;float glow=0.;vec3 glowC=vec3(1.,.8,.4);\n'+
    '#ifdef ROBE\n{float d=vR-(rev*1.25-.125)+(n3(vO*14.)-.5)*.12;if(d>0.)discard;float th=thread(vU)*gold;vec3 au=vec3(.95,.7,.26)*(.75+.5*n3(vO*60.));alb=mix(alb,au,th);spec=th;'+
    '  float edge=smoothstep(-.07,0.,d);glow=edge*2.6+th*flash*2.2;float wv=.9+.1*sin(vU.x*220.)*sin(vU.y*260.);alb*=mix(1.,wv,1.-th);}\n#endif\n'+
    ' vec3 Lg=mix(hemiG,hemiS,Nw.y*.5+.5);Lg+=keyC*max(0.,dot(Nw,keyD)*.9+.1);vec3 Sp=vec3(0.);\n'+
    ' for(int i=0;i<4;i++){vec3 d=lp[i]-vW;float dl=length(d);float a=max(0.,1.-dl/lr[i]);a*=a;vec3 ld=d/max(dl,1e-4);Lg+=lc[i]*a*max(0.,dot(Nw,ld)*.88+.12);\n'+
    '  vec3 Hh=normalize(ld+normalize(cameraPosition-vW));Sp+=lc[i]*a*pow(max(0.,dot(Nw,Hh)),24.);}\n'+
    ' {vec3 Hh=normalize(keyD+normalize(cameraPosition-vW));Sp+=keyC*pow(max(0.,dot(Nw,Hh)),24.);}\n'+
    ' float fr=pow(1.-max(0.,dot(N,V)),rimP);\n'+
    ' vec3 c=(alb*Lg+rimC*fr*rimK+Sp*(.06+spec*.9)*mix(vec3(1.),vec3(1.,.78,.4),spec))*lit;\n'+
    ' vec3 ec=mix(emC,pal(vO.y*1.3+vO.x*.9+t*.22),iri);c+=ec*vE*emK;c+=glowC*glow;\n if(vein>0.){c+=pal(vO.y*.9+vO.x*1.7+t*.25)*vm*1.6*vein*(.7+.3*sin(t*5.+vO.y*9.))*smoothstep(.1,.35,dot(vC,vec3(.34)));}\n'+
    ' gl_FragColor=vec4(c,op);\n#include <fog_fragment>\n}'};
function fn229Mat(o){o=o||{};const L=FN229.L,U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{}]);
  ['hemiS','hemiG','keyD','keyC','rimC','rimP','lp','lc','lr','t'].forEach(k=>U[k]=L[k]);
  Object.assign(U,{emC:{value:new THREE.Color(o.em==null?0xffffff:o.em)},emK:{value:o.emK||0},iri:{value:o.iri||0},op:{value:o.op==null?1:o.op},rimK:{value:o.rim==null?1:o.rim},
    rev:{value:o.rev==null?2:o.rev},gr:{value:o.grime==null?.2:o.grime},flut:{value:0},gold:{value:o.gold==null?1:o.gold},flash:{value:0},lit:{value:1},vein:{value:0},tintK:{value:0},tintC:{value:new THREE.Color(1,1,1)},lm:{value:new THREE.Vector4(1.6,.046,1.7,1.2)},bump:{value:.004},det:{value:o.det==null?1:o.det},smK:{value:o.smooth||0},veinA:{value:o.veinA==null?.6:o.veinA},veinC:{value:new THREE.Color(o.veinC==null?0x34315a:o.veinC)}});
  const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:FN229_SH.v,fragmentShader:FN229_SH.f,vertexColors:true,fog:true,side:o.side==null?THREE.DoubleSide:o.side,
    skinning:!!o.skin,transparent:!!o.tr,depthWrite:o.dw==null?true:o.dw,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending,extensions:{derivatives:true},defines:Object.assign({},o.robe?{ROBE:1}:{},o.skin?{SKIN:1}:{},o.beast?{BEAST:1}:{})});
  m.userData.fn229=1;m.userData.lps=1;m.userData.lpsSkip=1;return m}

// ---------------- triangle soup with a colour per face (flat, faceted) ----------------
function fn229Buf(){return {p:[],c:[],e:[],u:[],r:[]}}
// a, b, c: [x,y,z]; col: [r,g,b]; o: {e (glow, one number or three), u ([[u,v]×3]), r (reveal, one or three)}
function fn229Tri(B,a,b,c,col,o){o=o||{};B.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);for(let i=0;i<3;i++)B.c.push(col[0],col[1],col[2]);
  const e=o.e||0,r=o.r||0,u=o.u;for(let i=0;i<3;i++){B.e.push(typeof e=='number'?e:e[i]);B.r.push(typeof r=='number'?r:r[i]);B.u.push(u?u[i][0]:0,u?u[i][1]:0)}}
function fn229Quad(B,a,b,c,d,col,o){o=o||{};const s=(k,i,j,l)=>o[k]==null||typeof o[k]=='number'?o[k]:[o[k][i],o[k][j],o[k][l]];
  fn229Tri(B,a,b,c,col,{e:s('e',0,1,2),r:s('r',0,1,2),u:o.u?[o.u[0],o.u[1],o.u[2]]:null});fn229Tri(B,a,c,d,col,{e:s('e',0,2,3),r:s('r',0,2,3),u:o.u?[o.u[0],o.u[2],o.u[3]]:null})}
function fn229Geo(B){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(B.p),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(B.c),3));
  g.setAttribute('em',new THREE.BufferAttribute(new Float32Array(B.e),1));g.setAttribute('rv',new THREE.BufferAttribute(new Float32Array(B.r),1));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(B.u),2));
  g.userData.lps=1;g.computeBoundingSphere();return g}
// a ring of n points round the y axis: half width rx, depth rf in front (+z) and rb behind, centre (ox, y, oz)
function fn229Ring(n,y,rx,rf,rb,ox,oz,fn){const R=[];for(let j=0;j<n;j++){const a=j/n*Math.PI*2,s=Math.sin(a),c=Math.cos(a);let p=[(ox||0)+s*rx,y,(oz||0)+c*(c>=0?rf:(rb==null?rf:rb))];if(fn)p=fn(p,j,a)||p;R.push(p)}return R}
// skin a stack of rings; col(i, j, centre) → [r,g,b] or {c, e}; caps close the ends with a fan
function fn229Loft(B,R,col,o){o=o||{};const n=R[0].length;
  const cen=(a,b,c,d)=>[(a[0]+b[0]+c[0]+d[0])/4,(a[1]+b[1]+c[1]+d[1])/4,(a[2]+b[2]+c[2]+d[2])/4],ev=(i,j)=>o.em?o.em(i,j,R[i][j%n]):0;
  for(let i=0;i<R.length-1;i++)for(let j=0;j<n;j++){const a=R[i][j],b=R[i][(j+1)%n],c=R[i+1][(j+1)%n],d=R[i+1][j];let q=col(i,j,cen(a,b,c,d));if(!q)continue;
    fn229Quad(B,a,b,c,d,q,{e:o.em?[ev(i,j),ev(i,j+1),ev(i+1,j+1),ev(i+1,j)]:0,r:o.rv?[o.rv(a),o.rv(b),o.rv(c),o.rv(d)]:0,
      u:o.uv?[o.uv(i,j,a),o.uv(i,j+1,b),o.uv(i+1,j+1,c),o.uv(i+1,j,d)]:null})}
  const cap=(i,flip)=>{const r=R[i],c=[0,0,0];r.forEach(p=>{c[0]+=p[0]/n;c[1]+=p[1]/n;c[2]+=p[2]/n});if(o.capPush)c[1]+=(flip?-1:1)*o.capPush;
    for(let j=0;j<n;j++){const q=col(i==0?0:R.length-2,j,c);if(q)fn229Tri(B,r[j],r[(j+1)%n],c,q,{r:o.rv?[o.rv(r[j]),o.rv(r[(j+1)%n]),o.rv(c)]:0,u:o.uv?[o.uv(i,j,r[j]),o.uv(i,j+1,r[(j+1)%n]),o.uv(i,j+.5,c)]:null})}};
  if(o.cap0!==false)cap(0,true);if(o.cap1!==false)cap(R.length-1,false)}
function fn229Cone(B,p,d,len,r,n,col,col2){const D=new THREE.Vector3(d[0],d[1],d[2]).normalize(),U=Math.abs(D.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0),X=new THREE.Vector3().crossVectors(D,U).normalize(),Y=new THREE.Vector3().crossVectors(D,X);
  const tip=[p[0]+D.x*len,p[1]+D.y*len,p[2]+D.z*len];for(let j=0;j<n;j++){const a=j/n*6.283,b=(j+1)/n*6.283,q=x=>[p[0]+(X.x*Math.cos(x)+Y.x*Math.sin(x))*r,p[1]+(X.y*Math.cos(x)+Y.y*Math.sin(x))*r,p[2]+(X.z*Math.cos(x)+Y.z*Math.sin(x))*r];
    fn229Tri(B,q(a),q(b),tip,j%2&&col2?col2:col)}}
// a ring of n points round an axis d through c (u = "front"): for sleeves and other pieces that don't stand upright
function fn229RingD(n,c,d,u,rx,rf){const V=THREE.Vector3,D=new V(d[0],d[1],d[2]).normalize(),U=new V(u[0],u[1],u[2]);U.addScaledVector(D,-U.dot(D)).normalize();const S=new V().crossVectors(U,D),R=[];
  for(let j=0;j<n;j++){const a=j/n*Math.PI*2,x=Math.sin(a)*rx,z=Math.cos(a)*(rf==null?rx:rf);R.push([c[0]+S.x*x+U.x*z,c[1]+S.y*x+U.y*z,c[2]+S.z*x+U.z*z])}return R}

// =====================================================================================================================
// The two bodies, on the game's cage humanoid (3393: one smoothed, skinned skin over the humanoid skeleton; docs/MODEL_DETAIL_RECIPE).
// Owner (Nov 13 2026): "The creature should be a lot more detailed and way more menacing and creepy ... use the new skeleton".
// They are not enemies (no EN entry, never spawned): mkHumanoid('fn229beast' / 'fn229man') builds them for the cinematic and the man
// by the fountain, and their skin is drawn with this file's shader instead of the game's (same vertex colours, same bones).
// =====================================================================================================================
var FN229B={fit:{},SC:{beast:9.2,man:1.93},swap:.62};
// ---------------- the Voice as he has been for a thousand years ----------------
// Starved to a frame: a ribcage like a basket over a waist one could close a hand round, hip bones and every knuckle of a hunched
// spine standing out of grey-white skin, arms that reach his knees ending in black hands with nails as long as the fingers, legs
// like stilts. The skull is long and swept back, lipless, noseless (two pits), the eyes small white beads at the bottom of black
// sockets; there is no chin: the lower jaw is a separate piece that drops open (fn229Jaw). Skin: corpse pale, mottled blue-grey,
// veined, the flesh blackening from the elbows and knees down as if dipped in ink (his magic), bruised where it faces down.
(function(){if(typeof cgHuman!='function'||typeof cg181Reg!='function')return;const cl=va_C;
  // skull without a lower jaw (base head coordinates): skull base, palate, the upper jaw's rim far forward, muzzle, nose pits,
  // under the eyes, eye line, brow ridge, then the long cranium going up and back
  const HEAD=[[1.52,.044,.03,.06,-.082],[1.531,.058,.05,.066,-.058],[1.541,.073,.112,.068,.026],[1.554,.071,.117,.072,.028],[1.57,.064,.106,.078,.024],[1.588,.076,.094,.086,.018],[1.606,.072,.088,.094,.012],
    [1.622,.079,.103,.1,.01],[1.642,.074,.09,.104,.002],[1.664,.066,.076,.1,-.006],[1.684,.05,.056,.084,-.012],[1.698,.026,.03,.05,-.016]];
  // (owner, Nov 13: "I do not like the long round head ... his body should be way bigger proportionate to his head. He should be a
  // massive menacing gangly creature") a small angular skull on a huge frame: wide bony shoulders, a deep ribcage, a long back
  const S=cgHuman({h:1.3,w:1.0,d:.92,rw:[.7,.8,.42,.8,1.08,1.16,1.3,1.0],rf:[.74,.72,.36,.94,1.1,1.0,.9,.8],rb:[.78,.8,.54,.9,1.14,1.22,1.24,1.0],
    at:.72,lt:.7,armL:1.78,legL:1.3,nw:.86,neckL:.03,hs:.8,hy:1.0,hz:.03,head:HEAD,facePush:()=>0,foot:1.5,footW:.95,n:16,sock:1,j2:1,footLite:1,
    arm:[{t:.06,r:.062,o:.02},{t:.28,r:.044},{t:.86,r:.03},{t:1.0,r:.046,rb:.056},{t:1.14,r:.034},{t:1.94,r:.022},{t:2.12,r:.02,rf:.036,rb:.03},{t:2.3,r:.016,rf:.032,rb:.026}],
    leg:[{t:.12,r:.078},{t:.45,r:.054},{t:.88,r:.04},{t:1.0,r:.058,rf:.07},{t:1.16,r:.044,rb:.05},{t:1.7,r:.028},{t:2.0,r:.03}]}),T=S.torso,J=S.J;
  S.hand=1.5;
  // (owner, Nov 13: "the creature's neck is visible through his mouth ... an anatomy issue, not a painting issue") the neck now
  // meets the skull at the back of its base, as on a real skull, and leans forward into it from between the shoulders, so the
  // whole mouth (palate, jaw, throat) hangs in front of the neck instead of sitting on top of it; the jaw hinges in front of it
  {const N=S.neck,y0=T[T.length-1][0],y1=S.head[0][0],z0=T[T.length-1][4]||0,z1=S.head[0][4];N.forEach(q=>{const t=(q[0]-y0)/(y1-y0);q[4]=z0+(z1-z0)*(.25+.75*t);q[2]=.036+.008*(1-t);q[3]=.05});
    S.J.neck=[0,S.J.neck[1],z0+(z1-z0)*.5];S.J.head=[0,S.J.head[1],z1+.01]}
  S.pron={'-1':1.1,'1':1.1};FN229B.Sb=S;
  HUMLOOK.fn229beast={skin:[180,178,192],tunic:0x101014,cape:[20,20,24],pants:[20,20,24],sc:1,wpn:'none'};
  const FACE=(x,y,z,n)=>{let d=0;const f=Math.max(0,Math.min(1,n[2]*1.6+.2));
    [-1,1].forEach(s=>{d-=.03*cgG(x,y,s*.04,1.606,.017,.0115)*f;d+=.012*cgG(x,y,s*.064,1.59,.016,.01);d-=.013*cgG(x,y,s*.06,1.565,.02,.016)*f;d-=.011*cgG(x,y,s*.072,1.652,.02,.03);d-=.009*cgG(x,y,s*.012,1.573,.007,.009)*f});
    d+=.02*cgG(x,y,0,1.624,.066,.008)*f;return d};
  cg181Reg('fn229beast',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],ch=J.chest[1],hipY=T[1][0],hs=S.hs,elb=J.aR1[1],wr=J.aR2[1],kn=J.rh1[1],WS=p=>{k.P[k.P.length-1].w=cgWAt(M,p)};
    // the hunch and the knuckles of the spine
    cgSculpt(M,{torso:1},(x,y,z,n)=>n[2]<-.1?.085*cgG(x,y,0,(ch+sh)/2-.02,.13,.12)*Math.min(1,(-.1-n[2])*1.6):0);
    cgSculpt(M,{torso:1},(x,y,z,n)=>{if(n[2]>-.5)return 0;let d=0;for(let i=0;i<10;i++)d+=cgG(x,y,0,sh-.02-i*.05,.014,.013);return .02*d});
    // ribs standing out round the chest and flanks, the sternum's groove, a belly sucked in under them, the hip bones, collarbones
    const RY=[0,1,2,3,4,5,6].map(i=>ch+.09-i*.052);
    cgSculpt(M,{torso:1},(x,y,z,n)=>{if(n[2]<-.35||Math.abs(x)<.016)return 0;const yy=y+Math.abs(x)*.5;let d=0;RY.forEach((r,i)=>{d+=.011*(1-i*.07)*Math.exp(-Math.pow((yy-r)/.008,2))});return d*Math.min(1,(Math.abs(x)-.016)/.02)});
    cgSculpt(M,{torso:1},(x,y,z,n)=>{if(n[2]<.1)return 0;let d=-.006*cgG(x,y,0,ch,.008,.12)-.022*cgG(x,y,0,wy+.01,.07,.07);[-1,1].forEach(s=>{d+=.024*cgG(x,y,s*.082,hipY+.035,.028,.02);d+=.012*Math.exp(-Math.pow((y-(sh-.012-Math.abs(x)*.22))/.008,2))*cl((Math.abs(x)-.02)/.02,0,1)*cl((.13-Math.abs(x))/.02,0,1)});return d});
    cgSculpt(M,{torso:1},(x,y,z,n)=>{if(n[2]>-.3)return 0;let d=0;[-1,1].forEach(s=>{d+=.018*cgG(x,y,s*.075,ch+.03,.03,.05)});return d});   // shoulder blades
    // tendons down the neck, the skull
    cgSculpt(M,{neck:1},(x,y,z,n)=>n[2]>.1?.008*(Math.exp(-Math.pow((Math.abs(x)-.022)/.007,2))-.5*Math.exp(-Math.pow(x/.01,2))):0);
    cgSculpt(M,{head:1},S.sculpt(FACE));
    M.shade=va_Shade(M,{cav:1.5,blur:2,y0:0,y1:S.hp(0,1.7,0)[1],hk:.3,dk:.12},{head:.55,neck:.6});
    const pale=0xb6b4c2,grey=0x8c8a9c,blue=0x6a6e88,bruise=0x52445e,ink=0x0b090f,bone=0xd2d0da,vein=0x47446a,
      rib=m=>{if(m.part!='torso'||m.s<-.35||Math.abs(m.x)<.016)return 0;const yy=m.y+Math.abs(m.x)*.5;let v=0;RY.forEach(r=>v=Math.max(v,Math.exp(-Math.pow((yy-r)/.0085,2))));return v*cl((Math.abs(m.x)-.016)/.02,0,1)},
      gap=m=>{if(m.part!='torso'||m.s<-.35||Math.abs(m.x)<.02)return 0;const yy=m.y+Math.abs(m.x)*.5;let v=0;for(let i=0;i<6;i++)v=Math.max(v,Math.exp(-Math.pow((yy-(RY[i]-.023))/.008,2)));return v},
      skinV=m=>{const n=n3Sn(m.x,m.y,m.z,5,3),n2=n3Sn(m.x,m.y,m.z,14,8);let c=mdMix(pale,grey,cl((n-.4)*1.3,0,.6));c=mdMix(c,blue,cl((n2-.62)*2.5,0,.4));
        if(m.nz<-.15)c=mdMix(c,0x747288,cl((-m.nz-.15)*1.1,0,.65));if(m.ny<-.3)c=mdMix(c,bruise,cl((-m.ny-.3)*.9,0,.5));
        
        if(m.part=='torso'&&m.nz>.2)c=mdMix(c,0x4a4460,.5*cgG(m.x,m.y,0,wy+.01,.06,.06));
        // veins: thin dark branches under the skin
        // the ink: from the elbows down to black hands, from the knees down to black feet, in ragged tongues
        const rag=(n2-.5)*.22;
        if(m.part=='arm'&&m.y<elb+.1){const q=cl((elb+.1-m.y)/(elb+.1-wr)+rag,0,1);c=mdMix(c,ink,q*q*(3-2*q)*.97)}
        if(m.part=='hand')c=ink;if(m.part=='leg'&&m.y<kn+.06){const q=cl((kn+.06-m.y)/(kn-.12)+rag,0,1);c=mdMix(c,ink,q*q*(3-2*q)*.95)}if(m.part=='foot')c=ink;
        if(m.part=='head'||m.part=='neck'){const bx=m.x/hs,by=(m.y-S.nb)/hs+1.52;
          c=mdMix(c,0x6a6880,cl((by-1.64)/.05,0,1)*.45*(.6+.8*n));                                   // the scalp: thin, darker skin over the long skull
          [-1,1].forEach(s=>{c=mdMix(c,0x4a3e58,.4*cgG(bx,by,s*.06,1.565,.02,.018));c=mdMix(c,0x4a4460,.35*cgG(bx,by,s*.072,1.652,.02,.03));
            if(m.nz>.05){c=mdMix(c,0x040308,cl(1.6*cgG(bx,by,s*.04,1.606,.021,.0135),0,1));c=mdMix(c,0x07050a,cl(1.7*cgG(bx,by,s*.012,1.573,.008,.0095),0,1))}});
          if(m.part=='head'&&by<1.558&&by>1.535&&m.nz>-.3)c=mdMix(c,0x3c1622,cl((1.558-by)/.012,0,1)*.8);                        // raw gums over the teeth
          if(m.part=='head'&&by<1.55&&m.ny<-.35)c=mdMix(c,0x16030a,cl((-m.ny-.35)*3,0,1));                             // the roof of the mouth
          if(m.part=='neck'&&m.nz>.1)c=mdSh(c,.82)}
        return c};
    va_Body(B,M,m=>null,skinV);
    // hands: long black fingers, the nails as long again; clawed toes
    [-1,1].forEach(s=>{va_Hand(B,S,s,{col:ink,nail:0x020204,kind:'claw',len:3.3,r:.0092,claw:.13});va_Toes(B,S,s,ink,.07,0x020204)});
    // a jagged ridge of bone spurs back over the crown
    for(let i=0;i<5;i++){const q=S.hp(0,1.69-.012*i*i*.5,-.01-.022*i);k.p('head','cone4','c',0xb9b5c4,q[0],q[1]+.012*hs,q[2],.008*hs,(.034-.004*i)*hs,.008*hs,-.5-.2*i,0,0)}
    // a few lank black strands still hanging from the scalp
    for(let i=0;i<11;i++){const a=2.0+i*.23+.1*a181H(i,3),r=.062+.02*a181H(i,5);let p=S.hp(Math.sin(a)*r,1.66-.03*a181H(i,7),-.02+Math.cos(a)*.085),d=[Math.sin(a)*.03,-.06,Math.cos(a)*.03-.01];
      const N=5+(i%3);for(let j=0;j<N;j++){const q=add3(p,[d[0],d[1]-.014*j,d[2]]);k.L('head','c',0x08070b,p,q,.0042-.0006*j,.0036-.0006*j,3);p=q;d=[d[0]*.6,d[1],d[2]*.6]}}
    // where the pieces drawn at run time sit: eyes, the upper jaw's teeth (model space)
    const F=FN229B.fit.beast={eye:[],up:[],lo:[],hinge:S.hp(0,1.537,-.022),S,lm:[RY[0],.052,sh-.02,sh-.62]};
    [-1,1].forEach(s=>{const q=S.hp(s*.04,1.606,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});F.eye.push(p?[p[0],p[1],p[2]+.004]:[q[0],q[1],q[2]+.09*hs])});
    for(let i=0;i<15;i++){const a=((i/14)-.5)*3.3,q=S.hp(Math.sin(a)*.067,1.56,.031+Math.cos(a)*.116),p=cgRay(M,[q[0]*1.6,q[1]-.03*hs,q[2]+(Math.cos(a)>0?.2:0)],nrm3([-q[0]*.6,.03*hs,-(Math.cos(a)>0?.2:0)]),{head:1});
      F.up.push({p:S.hp(Math.sin(a)*.064,1.546,.031+Math.cos(a)*.111),a,len:(.026+.03*a181H(i,11)+(Math.abs(a)<.3?.012:0))*hs})}})})();

// ---------------- the Voice remade: a tall, spare man, pale, with long ivory hair and the same white eyes ----------------
(function(){if(typeof cgHuman!='function'||typeof cg181Reg!='function')return;const cl=va_C;
  const S=cgHuman(Object.assign({snug:1,h:1.05,w:.97,d:.95,n:16,sock:1,j2:1,footLite:1,at:.9,lt:.94,hs:.98,rw:[1,1,.93,.98,1.03,1.03,1.05,1],arm:CG181.base.arm.filter((q,i)=>i!=5),leg:CG181.base.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)},va_Head(va_HYF,.98,{cheek:.7}))),T=S.torso,J=S.J;
  S.pron={'-1':1.1,'1':1.1};FN229B.Sm=S;HUMLOOK.fn229man={skin:[205,184,172],tunic:0x1a0c10,cape:[20,10,12],pants:[20,10,12],sc:1,wpn:'none'};
  const sk=0xc8b2a6,sk2=0x9c8880,lip=0x7c5652,hair=0xd8d3c4,wrap=0x160b0e;
  cg181Reg('fn229man',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],hs=S.hs,EY=1.629,EX=.036;
    cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:1.08,nw:.95,brow:1.05,cheek:1.25,hollow:.007,chin:1.05})));
    M.shade=va_Shade(M,{cav:1,blur:3,y0:0,y1:S.hp(0,1.73,0)[1],hk:.26,dk:.1},{head:.04,neck:.3});
    const HL=(bx,bz)=>{const a=Math.abs(Math.atan2(bx,bz-.01));return a<.6?1.69:a<1.1?1.69-(a-.6)*.034:a<1.7?1.673-(a-1.1)*.027:a<2.2?1.657-(a-1.7)*.13:1.556},
      skinV=m=>{const n=n3Sn(m.x,m.y,m.z,7,2);let c=mdMix(sk,0xb49c94,cl((n-.45)*1.2,0,.3));if(m.nz<-.2)c=mdMix(c,sk2,cl((-m.nz-.2)*1.2,0,.7));
        if(m.part=='torso'&&m.nz>.2){c=mdSh(c,1-.1*Math.exp(-Math.pow(m.x/.01,2))*cl((m.y-wy)/.05,0,1));c=mdSh(c,1-.08*cgG(m.x,m.y,0,wy-.02,.05,.04))}
        if(m.part=='head'||m.part=='neck'){const bx=m.x/hs,by=(m.y-S.nb)/hs+1.52;
          [-1,1].forEach(s=>{c=mdMix(c,0xa88e88,.14*cgG(bx,by,s*.05,1.57,.03,.026));if(m.nz>.2){c=mdMix(c,0x6a5458,cl(.75*cgG(bx,by,s*EX,EY,.019,.011),0,1));c=mdMix(c,0xa8a092,.7*cgG(bx,by,s*.037,1.647,.02,.0045))}});
          c=mdSh(c,1+.3*Math.max(0,-m.ny));
          if(m.part=='head'){const t=cl((by-HL(bx,m.z/hs)+.016)/.009,0,1);if(t>0)c=mdMix(c,mdSh(hair,.8),t*t*(3-2*t))}}
        if(m.part=='hand')c=mdSh(c,.95);return c},
      col=m=>{if(m.part=='head'&&m.s>.3){const by=(m.y-S.nb)/hs+1.52;if(Math.abs(by-1.558)<.0048&&Math.abs(m.x/hs)<.024)return lip}
        if((m.part=='torso'&&m.y<wy-.015)||(m.part=='leg'&&m.y>J.rh0[1]-.2-.03*n3Sn(m.x,m.y,m.z,30,2)))return mdSh(wrap,.8+.5*n3Sn(m.x,m.y*.3,m.z,18,4));return null};
    va_Hair(B,M,S,{col:hair,line:1.69,peak:.02,nape:1.55,neck:1,thick:.014,side:-.05});
    va_Body(B,M,col,skinV);
    // the fall of hair down his back: five tapering locks from the crown to between the shoulder blades
    for(let i=0;i<5;i++){const x=(i-2)*.03*hs,top=S.hp(x/hs,1.69,-.07),mid=S.hp(x/hs*1.15,1.58,-.098),nk=[x*1.2,J.neck[1]+.03,-.085-.006*Math.abs(i-2)],lo=[x*1.25,J.chest[1]+.07-.02*Math.abs(i-2),-.118],end=[x*1.1,J.chest[1]-.05-.03*Math.abs(i-2),-.112];
      mdLoft(B,[{p:top,rx:.022,f:.008,b:.012,w:[['head',1]]},{p:mid,rx:.026,f:.01,b:.016,w:[['head',1]]},{p:nk,rx:.026,f:.01,b:.016,w:[['head',.4],['neck',.6]]},{p:lo,rx:.022,f:.008,b:.012,w:[['chest',1]]},{p:end,rx:.006,f:.004,b:.004,w:[['chest',1]]}],
        {seg:6,ref:[0,0,-1],capB:true,col:m=>mdSh(hair,(i%2?.86:1)*(.82+.3*n3Sn(m.x*.5,m.y*4,m.z*.5,26,i)))})}
    cgEars(k,M,S,mdSh(sk,.93),1.625,.046,.36,.6,.018,0x8a6660);
    [-1,1].forEach(s=>va_Hand(B,S,s,{col:mdSh(sk,.97),nail:0x4a3a40,kind:'open',len:1.08}));
    const F=FN229B.fit.man={eye:[],S};[-1,1].forEach(s=>{const q=S.hp(s*EX,EY,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});F.eye.push(p?[p[0],p[1],p[2]+.0015]:[q[0],q[1],q[2]+.085])})})})();

// ---------------- at run time: one body, wearing this file's shader ----------------
function fn229Body(key){const beast=key=='fn229beast',g=mkHumanoid(key),h=g.h,M=mdMats(),mat=fn229Mat(beast?{skin:1,beast:1,grime:.16,rim:.9,veinA:.5,veinC:0x2c2a52,smooth:.4}:{skin:1,grime:.06,rim:.7,veinA:0,veinC:0x7a6a7c,det:.1,smooth:.6}),Bd={key,g,h,bones:h.bones,mat,pins:[],fit:FN229B.fit[key=='fn229man'?'man':'beast']};g.scale.setScalar(1);g.userData.psNo=1;
  h.children.forEach(o=>{if(!o.isSkinnedMesh)return;fn229Smooth(o.geometry);o.castShadow=false;o.frustumCulled=false;o.userData.lpsSkip=1;if(o.material!==M.g)o.material=mat;if(!Bd.bm)Bd.bm=o});
  Bd.S=Bd.fit.S;if(beast&&Bd.fit.lm)mat.uniforms.lm.value.fromArray(Bd.fit.lm);g.updateMatrixWorld(true);Bd.rest={};for(const n in h.bones){const b=h.bones[n];Bd.rest[n]={p:b.position.clone(),q:b.quaternion.clone()}}
  Bd.eyeM=new THREE.MeshBasicMaterial({color:0xffffff,fog:true});Bd.eyeM.userData.lpsSkip=1;Bd.eyes=Bd.fit.eye.map(p=>{const pin=fn229Pin(Bd,'head',p),m=new THREE.Mesh(FN229B.eyeG||(FN229B.eyeG=new THREE.IcosahedronGeometry(1,1)),Bd.eyeM);m.userData.lpsSkip=1;pin.add(m);return m});
  return Bd}
// smooth normals for a triangle soup (corners at the same place share one normal), written once into the cached geometry; the
// shader blends them with the facet normal (smK), so close-ups of skin don't break into checkered facets
function fn229Smooth(g){if(g.userData.fn229n)return;g.userData.fn229n=1;const P=g.attributes.position,n=P.count,N=new Float32Array(n*3),M=new Map(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),key=i=>Math.round(P.getX(i)*4e3)+'_'+Math.round(P.getY(i)*4e3)+'_'+Math.round(P.getZ(i)*4e3);
  for(let i=0;i<n;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1);c.fromBufferAttribute(P,i+2);b.sub(a);c.sub(a);b.cross(c);for(let q=0;q<3;q++){const k=key(i+q);let v=M.get(k);if(!v){v=[0,0,0];M.set(k,v)}v[0]+=b.x;v[1]+=b.y;v[2]+=b.z}}
  for(let i=0;i<n;i++){const v=M.get(key(i)),l=Math.hypot(v[0],v[1],v[2])||1;N[i*3]=v[0]/l;N[i*3+1]=v[1]/l;N[i*3+2]=v[2]/l}g.setAttribute('normal',new THREE.BufferAttribute(N,3))}
// a group on a bone whose origin is the model-space point pt and whose axes are the model's (rest pose): pieces built in model
// space minus pt hang from it and follow the bone
function fn229Pin(Bd,bone,pt){const b=Bd.bones[bone],g=new THREE.Group(),m=new THREE.Matrix4();Bd.g.updateMatrixWorld(true);m.copy(b.matrixWorld).invert().multiply(Bd.bm.matrixWorld).multiply(new THREE.Matrix4().makeTranslation(pt[0],pt[1],pt[2]));
  m.decompose(g.position,g.quaternion,g.scale);b.add(g);Bd.pins.push(g);return g}
function fn229BodyFree(Bd){if(!Bd)return;if(Bd.g.parent)Bd.g.parent.remove(Bd.g);Bd.mat.dispose();Bd.eyeM.dispose();Bd.pins.forEach(p=>p.traverse(o=>{if(o.geometry&&o.geometry!==FN229B.eyeG)o.geometry.dispose()}))}
// the creature's lower jaw (a long trough of bone and gum on a hinge under the skull), its teeth and tongue; the upper teeth
function fn229Jaw(Bd,mk){const F=Bd.fit,S=F.S,hs=S.hs,C={skin:[.6,.59,.66],dark:[.3,.28,.36],gum:[.22,.07,.11],maw:[.07,.012,.03],bone:[.86,.82,.7],boneD:[.62,.57,.44],tong:[.1,.04,.09]},H=F.hinge,B=fn229Buf();
  const pin=fn229Pin(Bd,'head',H),L=.182*hs,W=.072*hs,sec=[0,.12,.3,.52,.74,.9,1],R=[];
  // cross-sections from the hinge to the chin: outer skin round the bottom, two rims, the floor of the mouth between them
  sec.forEach((u,i)=>{const z=u*L,w=W*(1-.22*u*u)*(u>.9?1-(u-.9)*4.2:1),top=-.004*hs-.006*hs*Math.sin(u*3.1),dep=(.03+.03*Math.sin(u*2.6))*hs*(1-u*.35),fl=top-.014*hs;
    R.push([[-w,top,z],[-w*1.02,top-dep*.55,z],[-w*.55,top-dep,z+dep*.1],[w*.55,top-dep,z+dep*.1],[w*1.02,top-dep*.55,z],[w,top,z],[w*.82,top,z-.002],[w*.5,fl,z-.004],[-w*.5,fl,z-.004],[-w*.82,top,z-.002]])});
  fn229Loft(B,R,(i,j,c)=>{const n=fn229Nz(c[0]*30,c[1]*30,c[2]*30);if(j>=6&&j<=8)return fn229Sh(j==7?C.maw:C.gum,.8+.4*n);if(j==5||j==9)return fn229Sh(C.gum,.9+.3*n);return fn229Sh(fn229Mx(C.skin,C.dark,(j==2?.55:.2)+(i<1?.3:0)),.85+.3*n)},{cap0:true,cap1:true});
  // the lower teeth along both rims and across the front; the tongue: long, black, lolling over the front teeth
  const rimPt=a=>{const u=Math.min(1,Math.abs(a)<.5?1-.05*Math.abs(a):1-(Math.abs(a)-.5)*.62),z=u*L,w=W*(1-.22*u*u)*(u>.9?1-(u-.9)*4.2:1);return [Math.sign(a)*(Math.abs(a)<.5?Math.abs(a)*2*w*.9+.001:w*.92),-.004*hs,z]};
  for(let i=0;i<17;i++){const a=((i+.5)/17-.5)*3.6,p=rimPt(a),len=(.022+.03*fn229H(i,2,9)+(Math.abs(a)<.35?.014:0))*hs;fn229Cone(B,[p[0],p[1]-.006*hs,p[2]],[p[0]*.25,1,(Math.abs(a)<.5?.18:-.08)],len,.0056*hs,4,C.bone,C.boneD)}
  {const T=[[0,-.02,.02,.022],[.0,-.026,.07,.024],[0,-.02,.125,.02],[.003,-.016,.15,.014],[.004,-.014,.162,.008],[.004,-.012,.168,.003]].map(q=>fn229Ring(6,0,q[3]*hs,q[3]*hs*.45).map(p=>[p[0]+q[0]*hs,p[2]+q[1]*hs,q[2]*hs]));fn229Loft(B,T,(i,j)=>fn229Sh(C.tong,.8+.6*fn229H(i,j,3)),{cap0:true,cap1:true})}
  // (owner, Nov 13: "the creature's neck is visible through his mouth") the mouth is closed behind and at its corners: a back wall
  // and two cheek plates stand up from the jaw into the skull (they slide out of it as the jaw drops), and a dark gullet hangs
  // from the skull behind the hinge, so nothing shows through the open mouth but the dark of his throat
  {const y0=-.03*hs,y1=.105*hs,xs=[-.86,-.45,0,.45,.86].map(q=>q*W);for(let i=0;i<4;i++){const z=q=>.006*hs+.012*hs*(1-Math.abs(q)/W);fn229Quad(B,[xs[i],y0,z(xs[i])],[xs[i+1],y0,z(xs[i+1])],[xs[i+1]*.8,y1,z(xs[i+1])],[xs[i]*.8,y1,z(xs[i])],fn229Sh(C.maw,.7+.3*(i%2)))}
    [-1,1].forEach(sd=>{const a=[sd*W*.86,-.004*hs,.002],b=[sd*W*.93,-.004*hs,L*.62],c=[sd*W*.8,.09*hs,L*.3],d=[sd*W*.72,y1,.006*hs];fn229Tri(B,a,b,c,fn229Sh(C.gum,.55));fn229Tri(B,a,c,d,fn229Sh(C.maw,1.1))})}
  const m=new THREE.Mesh(fn229Geo(B),mk);m.userData.lpsSkip=1;m.frustumCulled=false;pin.add(m);Bd.jaw=pin;Bd.jawQ=pin.quaternion.clone();
  {const G=fn229Buf(),gp=fn229Pin(Bd,'head',H),R=[[.012,W*.84,.0],[-.05,W*.8,-.012],[-.11,W*.62,-.03],[-.16,W*.36,-.05]].map(q=>[[-q[1],q[0]*hs,q[2]*hs+.006],[-q[1]*.5,q[0]*hs,q[2]*hs+.02*hs],[q[1]*.5,q[0]*hs,q[2]*hs+.02*hs],[q[1],q[0]*hs,q[2]*hs+.006]]);
    for(let i=0;i<R.length-1;i++)for(let j=0;j<3;j++)fn229Quad(G,R[i][j],R[i][j+1],R[i+1][j+1],R[i+1][j],fn229Sh(C.maw,.5+.25*((i+j)%2)));
    const gm=new THREE.Mesh(fn229Geo(G),mk);gm.userData.lpsSkip=1;gm.frustumCulled=false;gp.add(gm)}
  // strands of spit between the jaws (drawn only while the mouth is open; they stretch with it)
  const U=fn229Buf(),up=fn229Pin(Bd,'head',[0,0,0]);
  F.up.forEach((t,i)=>fn229Cone(U,[t.p[0],t.p[1]+.006*hs,t.p[2]],[Math.sin(t.a)*.14,-1,Math.cos(t.a)*.12],t.len,.006*hs,4,C.bone,C.boneD));
  const um=new THREE.Mesh(fn229Geo(U),mk);um.userData.lpsSkip=1;um.frustumCulled=false;up.add(um)}
function fn229JawSet(Bd,gape){if(!Bd.jaw)return;Bd.jaw.quaternion.copy(Bd.jawQ).multiply(FN229T.q[0].setFromAxisAngle(FN229T.v[0].set(1,0,0),.06+gape*1.0))}

// ---------------- the figure: both bodies under one root ----------------
// o.only 'man': just the man (the one who stands by the fountain afterwards)
function fn229Figure(o){o=o||{};const F={k:o.only=='man'?1:0,st:{eye:1,vein:0,hair:1,robe:0,wing:0,lit:1,spasm:0},mats:{},size:1};F.root=new THREE.Group();F.root.name='fn229figure';F.root.userData.psNo=1;
  F.mats.keen=fn229Mat({grime:.06,rim:.5});
  if(o.only!='man'){F.cre=fn229Body('fn229beast');F.root.add(F.cre.g);fn229Jaw(F.cre,F.mats.keen)}
  F.man=fn229Body('fn229man');F.root.add(F.man.g);F.mats.body=F.man.mat;
  fn229Robe(F);fn229Wings(F);
  F.J={};['head','aR2','aL2','chest','pelvis'].forEach(n=>Object.defineProperty(F.J,n,{get:()=>fn229Act(F).bones[n]}));
  F.root.traverse(q=>{q.userData.lpsSkip=1;q.frustumCulled=false});fn229Shape(F,F.k);fn229Pose(F,{});return F}
function fn229Act(F){return F.cre&&F.k<FN229B.swap?F.cre:F.man}
// set the form (k 0 the creature … swap … 1 the man): which body shows, how big he is, the creature's limbs drawing in before the
// swap, the man's skin still corpse-pale just after it; eyes, veins, light
function fn229Shape(F,k){F.k=k=Math.max(0,Math.min(1,k));const st=F.st,B=FN229B,sw=B.swap,act=fn229Act(F),H=fn229Lerp(B.SC.beast,B.SC.man,fn229Sm(k)),hb=B.Sb?B.Sb.hp(0,1.698,0)[1]:2.6,hm=B.Sm.hp(0,1.73,0)[1];
  F.size=H/B.SC.man;if(F.cre){F.cre.g.visible=act===F.cre;F.cre.g.scale.setScalar(H/hb)}F.man.g.visible=act===F.man;F.man.g.scale.setScalar(H/hm);
  if(F.cre&&act===F.cre){const q=fn229Sm(k/sw),b=F.cre.bones,sp=st.spasm||0,j=i=>1+(ic151H(Math.floor(FN229.L.t.value*19)+i*7.3)-.5)*.22*sp;
    ['aL0','aR0'].forEach((n,i)=>b[n].scale.setScalar(fn229Lerp(1,.66,q)*j(i)));['lh0','rh0'].forEach((n,i)=>b[n].scale.setScalar(fn229Lerp(1,.86,q)*j(2+i)));b.neck.scale.setScalar(fn229Lerp(1,.84,q)*j(5));b.head.scale.setScalar(fn229Lerp(1,.86,q));
    const U=F.cre.mat.uniforms;U.tintC.value.setRGB(.82,.68,.62);U.tintK.value=.5*q;U.vein.value=st.vein;U.lit.value=st.lit;F.mats.keen.uniforms.lit.value=st.lit;
    const e=.0085*F.cre.S.hs*st.eye;F.cre.eyes.forEach(m=>m.scale.set(Math.max(1e-4,e),Math.max(1e-4,e),Math.max(1e-4,e*.6)));F.cre.eyeM.color.setRGB(1.2,1.2,1.28);F.cre.mat.uniforms.bump.value=.0042*F.cre.g.scale.x}
  {const q=1-fn229Sm(fn229K(k,sw,1)),U=F.man.mat.uniforms;U.tintC.value.setRGB(.74,.73,.82);U.tintK.value=.55*q;U.vein.value=st.vein*.5;U.lit.value=st.lit;
    const e=.0058*st.eye;F.man.eyes.forEach(m=>m.scale.set(Math.max(1e-4,e*1.5),Math.max(1e-4,e*.7),Math.max(1e-4,e*.5)));F.man.eyeM.color.setRGB(1.1,1.1,1.15);U.bump.value=.0012*F.man.g.scale.x}
  fn229RobeSet(F)}

// ---------------- pose ----------------
// P (model units of the body that shows; y = 0 the ground under him): pos [x,y,z] pelvis offset from standing, pr sp ch nk hd: [rx,ry,rz]
// added to the rest pose, jaw 0…1, hL / hR hand (wrist) targets and eL / eR elbow poles, fL / fR foot targets (on the ground) and
// kL / kR knee poles, wL / wR wrist turn, ftL / ftR foot pitch
var FN229T={v:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],q:[new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion()],m:new THREE.Matrix4(),m2:new THREE.Matrix4()};
function fn229PoseDef(F){const J=fn229Act(F).S.J;return {pos:[0,0,0],pr:[0,0,0],sp:[0,0,0],ch:[0,0,0],nk:[0,0,0],hd:[0,0,0],jaw:0,hL:[J.aL2[0]-.03,J.aL2[1]+.01,.05],hR:[J.aR2[0]+.03,J.aR2[1]+.01,.05],eL:[-.3,0,-1],eR:[.3,0,-1],wL:[0,0,0],wR:[0,0,0],
  fL:[J.lh2[0],0,0],fR:[J.rh2[0],0,0],kL:[-.15,0,1],kR:[.15,0,1],ftL:0,ftR:0}}
function fn229PoseMix(A,B,k){const o={};for(const n in A){const a=A[n],b=B[n]==null?a:B[n];o[n]=typeof a=='number'?a+(b-a)*k:a.map((v,i)=>v+(b[i]-v)*k)}return o}
// two-bone IK on skinned bones: j0 → j1 → j2 from the rest offsets; target and pole in model space; rp = the rest pole (model axes)
function fn229IK(Bd,j0,j1,j2,tgt,pole,rp,endE){const V=THREE.Vector3,par=j0.parent,bm=Bd.bm;par.updateWorldMatrix(true,false);
  const t=par.worldToLocal(bm.localToWorld(new V(tgt[0],tgt[1],tgt[2]))),pl=par.worldToLocal(bm.localToWorld(new V(tgt[0]+pole[0],tgt[1]+pole[1],tgt[2]+pole[2]))).sub(t).normalize();
  const c1=j1.position,c2=j2.position,s0=j0.scale.x,l1=c1.length()*s0,l2=c2.length()*s0*j1.scale.x,h=j0.position,d=t.clone().sub(h);let D=d.length();const mx=(l1+l2)*.999,mn=Math.abs(l1-l2)*1.02+.001;if(D>mx){d.multiplyScalar(mx/D);D=mx}if(D<mn){d.multiplyScalar(mn/Math.max(D,1e-5));D=mn}
  const dn=d.clone().normalize(),pp=pl.clone().addScaledVector(dn,-pl.dot(dn));if(pp.lengthSq()<1e-6)pp.set(0,0,1).addScaledVector(dn,-dn.z);pp.normalize();
  const a=Math.acos(Math.max(-1,Math.min(1,(l1*l1+D*D-l2*l2)/(2*l1*D)))),d1=dn.clone().multiplyScalar(Math.cos(a)).addScaledVector(pp,Math.sin(a)),d2=d.clone().sub(d1.clone().multiplyScalar(l1)).normalize(),X=new V().crossVectors(pp,dn).normalize();
  const RP=new V(rp[0],rp[1],rp[2]),bas=(dir,x,m)=>m.makeBasis(dir,x,new V().crossVectors(dir,x)),rot=(c,dir,q)=>{const r=c.clone().normalize(),xr=new V().crossVectors(RP.clone().addScaledVector(r,-RP.dot(r)).normalize(),r).normalize();
      bas(dir,X,FN229T.m);bas(r,xr,FN229T.m2);return q.setFromRotationMatrix(FN229T.m.multiply(FN229T.m2.transpose()))};
  const q1=rot(c1,d1,FN229T.q[0]),q2=rot(c2,d2,FN229T.q[1]);j0.quaternion.copy(q1);j1.quaternion.copy(q1).invert().multiply(q2);
  if(endE){par.updateWorldMatrix(true,false);const pq=par.getWorldQuaternion(FN229T.q[2]),mq=bm.getWorldQuaternion(new THREE.Quaternion());j2.quaternion.copy(pq.multiply(q2)).invert().multiply(mq.multiply(endE))}}
function fn229Pose(F,Pin){const Bd=fn229Act(F),b=Bd.bones,R=Bd.rest,P=Object.assign(fn229PoseDef(F),Pin||{}),E=THREE.Euler,Q=THREE.Quaternion,J=Bd.S.J;F.P=P;
  const fk=(n,e)=>{b[n].quaternion.copy(R[n].q).multiply(new Q().setFromEuler(new E(e[0],e[1],e[2],'YXZ')))};
  b.pelvis.position.copy(R.pelvis.p).add(FN229T.v[0].set(P.pos[0],P.pos[1],P.pos[2]));fk('pelvis',P.pr);fk('spine',P.sp);fk('chest',P.ch);fk('neck',P.nk);fk('head',P.hd);
  if(Bd.jaw)fn229JawSet(Bd,P.jaw);Bd.g.updateMatrixWorld(true);
  ['L','R'].forEach((s,i)=>{const w=P['w'+s],lg=(i?'r':'l')+'h';
    fn229IK(Bd,b['a'+s+'0'],b['a'+s+'1'],b['a'+s+'2'],P['h'+s],P['e'+s],[0,0,-1]);b['a'+s+'2'].quaternion.copy(R['a'+s+'2'].q).multiply(new Q().setFromEuler(new E(w[0],w[1],w[2],'YXZ')));
    fn229IK(Bd,b[lg+'0'],b[lg+'1'],b[lg+'2'],[P['f'+s][0],P['f'+s][1]+J[lg+'2'][1],P['f'+s][2]],P['k'+s],[0,0,1],new Q().setFromEuler(new E(P['ft'+s],P.pr[1]+(P['fy'+s]||0),0,'YXZ')))});
  Bd.g.updateMatrixWorld(true)}

// ---------------- the robe: crimson, with gold thread (the ROBE variant of the shader draws the thread and weaves the cloth in) ----------------
// built round the man's own torso rings, each piece hung on the bone it follows; reveal rv 0 at the hem … 1 at the collar;
// uv.x round the body, uv.y 0 at the top of a piece … 1 at its hem
function fn229Robe(F){const Bd=F.man,S=Bd.S,T=S.torso,J=S.J,C={red:[.4,.028,.045],deep:[.22,.012,.028],line:[.12,.008,.022]},mr=F.mats.robe=fn229Mat({robe:1,rev:0,grime:.1,rim:.55,gold:1}),R=F.robe={m:[],C},top=T[7][0]+.07;
  const tr=(i,o)=>[T[i][0],T[i][1]+o,T[i][2]+o,T[i][3]+o,T[i][4]||0];
  // rings [y, rx, f, b, z] in model space, hung on bone at pin point pt
  const piece=(bone,pt,rings,n,o)=>{o=o||{};const B=fn229Buf(),Rg=(o.raw||rings.map((q,i)=>fn229Ring(n,q[0],q[1],q[2],q[3]==null?q[2]:q[3],0,q[4]||0,(p,j,a)=>{const fo=o.fold?1+o.fold*(i/(rings.length-1))*Math.sin(a*o.fn+i*.7):1;return [p[0]*fo,p[1],(p[2]-(q[4]||0))*fo+(q[4]||0)]}))).map(r=>r.map(p=>[p[0]-pt[0],p[1]-pt[1],p[2]-pt[2]]));
    const nr=Rg.length;fn229Loft(B,Rg,(i,j,c)=>{const a=(j+.5)/n*6.283;if(o.skip&&o.skip(i,j,a))return null;let col=fn229Mx(C.red,C.deep,.5-.5*Math.cos(a*(o.fn||6)+i*.9));col=fn229Sh(col,.84+.3*fn229Fbm(c[0]*5+(o.seed||0),c[1]*5,c[2]*5));if(o.lineJ&&o.lineJ(j,i))col=C.line;return col},
      {cap0:false,cap1:!!o.cap,rv:p=>Math.max(0,Math.min(1,(p[1]+pt[1])/top)),uv:(i,j)=>[j/n,o.v0+(o.v1-o.v0)*(i/(nr-1))]});
    const m=new THREE.Mesh(fn229Geo(B),mr);m.userData.lpsSkip=1;m.frustumCulled=false;fn229Pin(Bd,bone,pt).add(m);R.m.push(m);return m};
  const wy=T[2][0],hip=T[1],w2=tr(2,.03),h1=tr(1,.034);
  // skirt: from the waist to the floor, folds deepening to the hem (pelvis)
  piece('pelvis',J.pelvis,[w2,h1,[T[0][0]-.06,hip[1]+.05,hip[2]+.06,hip[3]+.075],[.52,.24,.2,.25],[.26,.29,.25,.33],[.035,.33,.29,.4,-.02]],18,{fold:.1,fn:6,seed:1,v0:.5,v1:1,lineJ:j=>j==0||j==17});
  // body: waist to the shoulder line, a V at the throat (chest)
  piece('chest',J.chest,[[T[7][0]+.012,T[7][1]+.016,T[7][2]+.02,T[7][3]+.022,T[7][4]],tr(6,.03),tr(5,.03),tr(4,.03),tr(3,.03),[wy-.02,w2[1]+.004,w2[2]+.004,w2[3]+.004]],14,{seed:3,v0:0,v1:.5,skip:(i,j)=>i==0&&(j==0||j==13),lineJ:(j,i)=>(j==0||j==13)&&i>0});
  // a standing collar, a mantle over the shoulders
  piece('chest',J.chest,[[T[7][0]+.105,.082,.07,.085,.0],[T[7][0]+.01,.078,.062,.074,.004]],12,{seed:4,v0:.86,v1:.97,skip:(i,j)=>j==0||j==11});
  piece('chest',J.chest,[[T[7][0]+.022,.095,.07,.08],[T[6][0]+.012,T[6][1]+.075,T[6][2]+.05,T[6][3]+.052],[T[5][0]-.02,T[5][1]+.1,T[5][2]+.055,T[5][3]+.06],[T[4][0]-.01,T[4][1]+.105,T[4][2]+.05,T[4][3]+.058]],14,{seed:5,v0:.74,v1:.97,fold:.03,fn:7,skip:(i,j)=>i==0&&(j==0||j==13)});
  // sleeves: close on the upper arm, a wide bell at the wrist
  [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a0=J[A+'0'],a1=J[A+'1'],a2=J[A+'2'],d1=sub3(a1,a0),d2=sub3(a2,a1),at=(a,d,t)=>add3(a,mul3(d,t));
    piece(A+'0',a0,null,9,{seed:6,v0:.1,v1:.4,raw:[[-.1,.074],[.45,.066],[1.06,.06]].map(q=>fn229RingD(9,at(a0,d1,q[0]),d1,[0,0,1],q[1]))});
    piece(A+'1',a1,null,10,{seed:8,v0:.6,v1:.97,raw:[[-.06,.062,.062],[.35,.066,.07],[.75,.084,.094],[1.06,.1,.118]].map(q=>fn229RingD(10,at(a1,d2,q[0]),d2,[0,0,1],q[1],q[2]))})});
  // sash
  piece('pelvis',J.pelvis,[[wy+.035,w2[1]+.012,w2[2]+.012,w2[3]+.012],[wy-.03,h1[1]*.5+w2[1]*.5+.014,h1[2]*.5+w2[2]*.5+.014,h1[3]*.5+w2[3]*.5+.014]],14,{seed:11,v0:.9,v1:.96});
  R.m.forEach(m=>{m.visible=false})}
function fn229RobeSet(F){const st=F.st,U=F.mats.robe.uniforms;U.rev.value=st.robe;F.robe.m.forEach(m=>{m.visible=st.robe>.002});U.flut.value=st.flut||0;U.flash.value=st.thread||0;U.lit.value=st.lit}

// ---------------- wings: ivory, long-boned, the skin between the fingers thin and torn (on the man's back) ----------------
var FN229W={arm:.72,fore:.95,fing:[1.28,1.12,.9,.62]};
function fn229Wings(F){const Bd=F.man,S=Bd.S,T=S.torso,C={ivory:[.9,.87,.76],ivoryD:[.6,.56,.47]},mw=F.mats.wing=fn229Mat({grime:.2,rim:.9}),mm=F.mats.memb=fn229Mat({grime:.22,rim:.5,tr:1,op:.94,dw:true});F.wings=[];F.wC=C;
  const bone=(joint,len,r0,r1,seed)=>{const B=fn229Buf(),R=[[0,r0*1.25],[.08,r0],[.5,(r0+r1)/2*.9],[.92,r1],[1,r1*1.35]].map(q=>fn229Ring(5,-q[0]*len,q[1],q[1]));
    fn229Loft(B,R,(i,j,c)=>fn229Sh(fn229Mx(C.ivory,C.ivoryD,.5-.5*Math.cos(j*1.26)+(i==0||i==3?.3:0)),.82+.3*fn229Fbm(c[0]*9+seed,c[1]*9,c[2]*9)),{});const m=new THREE.Mesh(fn229Geo(B),mw);m.userData.lpsSkip=1;m.frustumCulled=false;joint.add(m)};
  [-1,1].forEach(sx=>{const W={sx,J:{},tips:[]},g=(n,par)=>{const o=new THREE.Group();par.add(o);W.J[n]=o;return o};
    W.pin=fn229Pin(Bd,'chest',[sx*.065,T[5][0]-.02,-T[5][3]*.8]);g('root',W.pin);g('arm',W.J.root);g('fore',W.J.arm);bone(W.J.arm,FN229W.arm,.042,.03,1);bone(W.J.fore,FN229W.fore,.032,.024,2);W.J.fore.position.set(0,-FN229W.arm,0);
    for(let i=0;i<4;i++){const f=g('f'+i,W.J.fore);f.position.set(0,-FN229W.fore,0);bone(f,FN229W.fing[i],.022,.007,3+i);const t=new THREE.Group();t.position.set(0,-FN229W.fing[i],0);f.add(t);W.tips.push(t)}
    {const B=fn229Buf();fn229Cone(B,[0,-FN229W.fore,0],[0,.4,1],.16,.016,4,C.ivory,C.ivoryD);const m=new THREE.Mesh(fn229Geo(B),mw);m.userData.lpsSkip=1;W.J.fore.add(m)}
    // the membrane: rebuilt every frame from the joints (in the wing pin's space), fans between the fingers with a scalloped, torn edge
    const SEG=7,nP=4*SEG*9+2*3,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nP*3),3));geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(nP*3),3));
    geo.setAttribute('em',new THREE.BufferAttribute(new Float32Array(nP),1));geo.setAttribute('rv',new THREE.BufferAttribute(new Float32Array(nP),1));geo.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(nP*2),2));
    W.mesh=new THREE.Mesh(geo,mm);W.mesh.frustumCulled=false;W.mesh.userData.lpsSkip=1;W.pin.add(W.mesh);W.SEG=SEG;F.wings.push(W)});
  F.wings.forEach(W=>{W.J.root.visible=false;W.mesh.visible=false})}
// open 0 folded … 1 spread; flap -1 down … 1 up; F.st.wing 0 (inside the back) … 1
function fn229WingSet(F,o){const st=F.st,em=st.wing,C=F.wC,V=THREE.Vector3;F.mats.wing.uniforms.lit.value=F.mats.memb.uniforms.lit.value=st.lit;
  F.wings.forEach(W=>{const sx=W.sx,Jw=W.J,op=o.open==null?1:o.open,fl=o.flap||0,vis=em>.004;Jw.root.visible=vis;W.mesh.visible=vis;if(!vis)return;
    Jw.root.scale.setScalar(Math.max(.001,em));const L=fn229Lerp;
    // folded: the arm lies up along the back, the forearm doubles back down, the fingers closed like a fan; spread: out to the side and up
    Jw.arm.rotation.set(L(-.5,-.28,op)+(o.sweep||0),0,sx*L(2.75,1.95,op)+sx*fl*.42,'YXZ');Jw.fore.rotation.set(0,0,sx*L(-2.55,-.5,op)+sx*fl*.3);
    for(let i=0;i<4;i++){const a=L(.08+i*.07,-.62+i*.72,op)+fl*.1*(i+1);Jw['f'+i].rotation.set(L(.0,.06*i,op),0,sx*a)}
    W.pin.updateMatrixWorld(true);
    const pt=g=>W.pin.worldToLocal(g.getWorldPosition(new V())),sh=new V(0,0,0),wr=pt(Jw.f0),el=pt(Jw.fore),tips=W.tips.map(pt),hip=new V(sx*.04*em,(-.5*op-.08)*em,-.03*em);
    const P=W.mesh.geometry.attributes.position.array,Cc=W.mesh.geometry.attributes.color.array;let n=0;const SEG=W.SEG;
    const put=(a,b,c,k)=>{[a,b,c].forEach(p=>{P[n*3]=p.x;P[n*3+1]=p.y;P[n*3+2]=p.z;Cc[n*3]=C.ivory[0]*k;Cc[n*3+1]=C.ivory[1]*k*.93;Cc[n*3+2]=C.ivory[2]*k*.84;n++})};
    // each fan segment: an inner triangle (darker, toward the wrist) and the outer skin to the scalloped edge; some are torn short
    [[tips[0],tips[1]],[tips[1],tips[2]],[tips[2],tips[3]],[tips[3],hip]].forEach((fn,fi)=>{const a=fn[0],b=fn[1],org=fi<3?wr:el;let prev=a.clone();
      for(let s=1;s<=SEG;s++){const u=s/SEG,e=a.clone().lerp(b,u),sag=Math.sin(u*Math.PI)*(.26+.05*fi)*(.35+.65*op),p=e.lerp(org,sag);
        if(fi==3&&s==SEG)p.copy(hip);const torn=((fi*5+s)%9==4)?.62:1,m0=org.clone().lerp(prev,.5),m1=org.clone().lerp(p,.5),shd=.34+.1*((fi+s)%2);
        put(org,m0,m1,shd*.8);const o0=torn<1?m0.clone().lerp(prev,.3):prev,o1=torn<1?m1.clone().lerp(p,.3):p;put(m0,o0,o1,shd+.14);put(m0,o1,m1,shd+.06);prev=p.clone()}});
    put(sh,el,hip,.34);put(el,wr,tips[3],.4);
    for(;n<P.length/3;n++){P[n*3]=P[n*3+1]=P[n*3+2]=0}W.mesh.geometry.attributes.position.needsUpdate=true;W.mesh.geometry.attributes.color.needsUpdate=true})}
function fn229FigFree(F){if(!F)return;if(F.root.parent)F.root.parent.remove(F.root);fn229BodyFree(F.cre);fn229BodyFree(F.man);for(const k in F.mats)if(F.mats[k]&&F.mats[k].dispose)F.mats[k].dispose()}
