// ================= v153 The Hilltop Ascent — the trail up the mountain =================
// The main quest's second chapter (between Hillside Crest II and III, its own instance g 31; 3150). A narrow trail spirals up a cone
// of a mountain, ~1.3 turns from the foot (radius 165) to the summit crack (radius 62), climbing 88: about 930 tiles, two minutes at
// the chase's fixed mount speed. Everything is in the trail's own frame: s along the trail (0 at the foot), o across it (+ = outward,
// the drop; − = inward, the mountain). ch153Path() is hoisted and cached because 0045 (sp152Map / sp152Terrain) paints the ground
// and the heights from it long before this file runs.
//  * Width: CH153.hw (half width) per stretch (the bridge is the narrowest).
//  * The mountain: a cone (height falls 0.85 per tile of radius) with the trail cut into it as a flat ledge; the inward side rises
//    as a rock wall, the outward side falls away. Rocks ('R') line the wall, pines ('#') dot the slopes.
//  * Course (CH153C): the obstacles and set pieces by s — boulders, logs, spikes, gaps, rockslides, the bridge, the tunnel, venom
//    phases — see 3162 for how each one plays.
var CH153;
function ch153Cfg(){return {R0:165,R1:62,turns:1.3,rise:88,h0:2,th0:-Math.PI*.15,cx:210,cy:190}}
function ch153Path(){if(ch153Path.c)return ch153Path.c;const C=ch153Cfg(),I=sp152Defs().find(d=>d.key=='ascent'),cx=I.x0+C.cx,cz=I.y0+C.cy;
  // the spiral, sampled finely, then resampled every tile of arc length
  const N0=6000,fx=[],fz=[],ft=[];for(let i=0;i<=N0;i++){const t=i/N0,th=C.th0-C.turns*Math.PI*2*t,r=C.R0-(C.R0-C.R1)*Math.pow(t,.92);fx.push(cx+Math.cos(th)*r);fz.push(cz+Math.sin(th)*r);ft.push(t)}
  const L=[0];for(let i=1;i<=N0;i++)L.push(L[i-1]+Math.hypot(fx[i]-fx[i-1],fz[i]-fz[i-1]));const S=Math.floor(L[N0]);
  const X=new Float32Array(S+1),Z=new Float32Array(S+1),H=new Float32Array(S+1),TX=new Float32Array(S+1),TZ=new Float32Array(S+1),HW=new Float32Array(S+1);
  let j=0;for(let s=0;s<=S;s++){while(j<N0-1&&L[j+1]<s)j++;const a=(s-L[j])/Math.max(1e-6,L[j+1]-L[j]);X[s]=fx[j]+(fx[j+1]-fx[j])*a;Z[s]=fz[j]+(fz[j+1]-fz[j])*a;const t=ft[j]+(ft[j+1]-ft[j])*a;H[s]=C.h0+C.rise*t}
  for(let s=0;s<=S;s++){const a=Math.max(0,s-2),b=Math.min(S,s+2),dx=X[b]-X[a],dz=Z[b]-Z[a],l=Math.hypot(dx,dz)||1;TX[s]=dx/l;TZ[s]=dz/l}
  // the outward side (+o): the trail curls round the centre, so outward is away from it
  const R=[],sgn=(()=>{const s=10,nx=-TZ[s],nz=TX[s];return (nx*(X[s]-cx)+nz*(Z[s]-cz))>0?1:-1})();
  for(let s=0;s<=S;s++)HW[s]=ch153HW(s,S);
  const P={X,Z,H,TX,TZ,HW,S,sgn,cx,cz,C};
  // position at (s, o): world x, z, trail height
  P.at=(s,o)=>{s=Math.max(0,Math.min(S,s));const i=Math.min(S-1,Math.floor(s)),f=s-i,x=X[i]+(X[i+1]-X[i])*f,z=Z[i]+(Z[i+1]-Z[i])*f,tx=TX[i]+(TX[i+1]-TX[i])*f,tz=TZ[i]+(TZ[i+1]-TZ[i])*f,
    nx=-tz*sgn,nz=tx*sgn;return [x+nx*(o||0),z+nz*(o||0),H[i]+(H[i+1]-H[i])*f]};
  P.hw=s=>HW[Math.max(0,Math.min(S,Math.round(s)))];P.yaw=s=>{const i=Math.max(0,Math.min(S,Math.round(s)));return Math.atan2(TX[i],TZ[i])};
  return ch153Path.c=P}
// the trail's half width: 2.6 (5.2 wide), narrower in places, the bridge 1.6
function ch153HW(s,S){const B=ch153Course().bridge;if(s>=B[0]&&s<=B[1])return 1.65;if(s>=270&&s<=380)return 2.1;if(s>=S-40)return 2.2+Math.max(0,(S-12-s)/28)*.4;return 2.7}
// the course: everything by s (the gaps, the bridge, the tunnel, rockslides, venom phases, the snake's lunge spots)
function ch153Course(){if(ch153Course.c)return ch153Course.c;
  const O=[];const ob=(k,s,o,ex)=>O.push(Object.assign({k,s,o},ex||{}));
  // A · the ledge: boulders on alternate sides, two logs to jump, a first spike
  [52,74,96,118,140,162,186,208].forEach((s,i)=>ob('boulder',s,(i%2?1:-1)*1.25));ob('log',128,0);ob('log',198,0);ob('spike',150,0);
  // B · the narrows: spikes and a broken stretch to jump
  [282,300,318,356,372].forEach((s,i)=>ob('spike',s,(i%2?-1:1)*.9));ob('gap',336,0,{len:3.0});ob('log',364,0);
  // the bridge: two missing planks
  ob('gap',425,0,{len:2.6,plank:1});ob('gap',452,0,{len:2.6,plank:1});
  // C · the high ledge: logs, boulders, faster curves
  [492,516,540,566,590].forEach((s,i)=>ob(i%2?'log':'boulder',s,i%2?0:(i%4?1:-1)*1.2));
  // the tunnel: stalactite pillars to weave between
  [622,634,646,658,670].forEach((s,i)=>ob('pillar',s,(i%2?1:-1)*1.3));
  // D · the final climb: gaps, boulders, logs
  ob('gap',760,0,{len:3.0});[778,796].forEach((s,i)=>ob('boulder',s,(i%2?-1:1)*1.3));ob('log',812,0);ob('gap',830,0,{len:3.2});[848,866].forEach((s,i)=>ob('spike',s,(i%2?1:-1)*1.0));ob('log',882,0);
  return ch153Course.c={O,bridge:[400,470],tunnel:[606,684],slides:[[230,3],[700,5]],venom:[[70,4.2,1],[260,3.4,1],[480,3.0,2],[690,2.6,2],[750,2.2,3]],start:15,crack:12}}
// ---------------- 0045: the ground and the heights ----------------
function ch153Hash(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)}
function ch153Map(m,bio,DW,I,bi){const P=ch153Path();
  for(let y=I.y0;y<I.y0+I.h;y++)for(let x=I.x0;x<I.x0+I.w;x++){if(!m[y])continue;m[y][x]='';bio[y][x]=bi;DW[y*W+x]=6}
  // the trail (and a little run-off before its foot)
  for(let s=-8;s<=P.S+6;s+=.5){const hw=P.hw(Math.max(0,Math.min(P.S,s)));for(let o=-hw-3;o<=hw+3;o+=.5){const [x,z]=P.at(s,o),X=Math.round(x),Z=Math.round(z);if(!m[Z])continue;const k=Z*W+X,d=Math.abs(o)-hw;
      if(d<DW[k])DW[k]=d;if(d<=.3)m[Z][X]=(ch153Hash(X,Z)<.12?'a':'.');else if(d>.3&&d<3&&o>0&&m[Z][X]===''&&ch153Hash(X,Z+7)<.35)m[Z][X]='g'}}   // grass tufts along the outer lip
  // rocks along the mountain wall, pines on the slopes (never on the trail)
  for(let s=0;s<=P.S;s+=1.6){const hw=P.hw(s),o=-(hw+1.6+ch153Hash(s,7)*1.4),[x,z]=P.at(s,o),X=Math.round(x),Z=Math.round(z);if(m[Z]&&m[Z][X]===''&&ch153Hash(s,3)<.5)m[Z][X]='R'}
  for(let i=0;i<900;i++){const x=I.x0+4+Math.floor(ch153Hash(i,1)*(I.w-8)),z=I.y0+4+Math.floor(ch153Hash(i,2)*(I.h-8));if(m[z]&&m[z][x]===''&&DW[z*W+x]>3)m[z][x]='#'}}
function ch153Terrain(I){const P=ch153Path(),C=P.C,best=new Float32Array(I.w*I.h).fill(99),ph=new Float32Array(I.w*I.h),sg=new Float32Array(I.w*I.h);
  for(let s=-8;s<=P.S+6;s+=.4){const sc=Math.max(0,Math.min(P.S,s)),hw=P.hw(sc);for(let o=-hw-5;o<=hw+5;o+=.4){const [x,z,h]=P.at(sc,o),X=Math.round(x)-I.x0,Z=Math.round(z)-I.y0;if(X<0||Z<0||X>=I.w||Z>=I.h)continue;const k=Z*I.w+X,d=Math.abs(o)-hw;
      if(d<best[k]){best[k]=d;ph[k]=h-(s<0?(-s)*.6:0);sg[k]=o<0?-1:1}}}
  const cone=(i,j)=>{const r=Math.hypot(i-P.cx,j-P.cz);let h=C.h0+C.rise*(C.R0-r)/(C.R0-C.R1);if(r<C.R1)h+=(C.R1-r)*1.4;if(r>C.R0)h=C.h0-(r-C.R0)*1.6-(r>C.R0+6?30:0);return h+(fbm2(i*.08,j*.08,3)-.5)*3.2};
  for(let j=I.y0-2;j<I.y0+I.h+2;j++)for(let i=I.x0-2;i<I.x0+I.w+2;i++){const X=i-I.x0,Z=j-I.y0,inn=X>=0&&Z>=0&&X<I.w&&Z<I.h,k=inn?Z*I.w+X:-1;let h=cone(i,j);
    if(k>=0&&best[k]<5){const d=best[k],w=d<=.6?1:1-((d-.6)/4.4)*((d-.6)/4.4)*(3-2*(d-.6)/4.4);const wall=sg[k]<0?Math.min(4,Math.max(0,d-.6)*1.6):-Math.max(0,d-.6)*.9;h=ph[k]*w+(Math.max(h,ph[k]+wall)*(sg[k]<0?1:0)+Math.min(h,ph[k]+wall)*(sg[k]<0?0:1))*(1-w)}
    HF[(j+HPD)*HW+i+HPD]=h}}
