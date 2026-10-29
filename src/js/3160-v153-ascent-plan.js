// ================= v153 The Hilltop Ascent — the trail up the mountain =================
// The main quest's second chapter (between Hillside Crest II and III, its own instance g 31; 3150). A narrow trail spirals up a cone
// of a mountain, ~1.3 turns from the foot (radius 165) to the summit crack (radius 62), climbing 88: about 930 tiles, two minutes at
// the chase's fixed mount speed. Everything is in the trail's own frame: s along the trail (0 at the foot), o across it (+ = outward,
// the drop; − = inward, the mountain). ch153Path() is hoisted and cached because 0045 (sp152Map / sp152Terrain) paints the ground
// and the heights from it long before this file runs.
//  * Width: CH153.hw (half width) per stretch (the bridge is the narrowest).
//  * The mountain: a cone (height falls 0.85 per tile of radius) with the trail cut into it as a flat ledge; the inward side rises
//    as a rock wall, the outward side falls away. Rocks ('R') line the wall, pines ('#') dot the slopes.
//  * Course (ch153Course): v164 — no obstacles any more. The broken stretches of trail (gaps to jump, seeded so every co-op rider
//    has the same ones; carved out of the ground here, dressed and played in 3250) and Skarrith's venom phases.
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
// the trail's half width: 2.7 (5.4 wide), narrower through the narrows and up to the summit crack
function ch153HW(s,S){if(s>=270&&s<=380)return 2.1;if(s>=S-40)return 2.2+Math.max(0,(S-12-s)/28)*.4;return 2.7}
// the course (v164): the broken stretches of trail and the venom phases. Gaps: {s: middle, len: length along the trail}, shorter
// and further apart near the bottom, longer and closer together toward the summit (13–14 of them, ~80 tiles apart at the foot, ~40 near the top).
// A fixed seed: every rider's world (co-op) has the same gaps. Venom phases: [from s, seconds between volleys, most globs a volley].
// Self-contained: 0045 paints the ground from it (through ch153Path / ch153Terrain) before the rest of the script has run.
function ch153Course(){if(ch153Course.c)return ch153Course.c;
  let sd=16407;const rn=()=>(sd=sd*16807%2147483647)/2147483647,G=[];
  for(let s=78;s<872;){const k=s/880,len=Math.round((2.3+.9*k+rn()*.3)*100)/100;G.push({s:Math.round(s*10)/10,len});s+=len+(80-46*k)+rn()*12}
  return ch153Course.c={gaps:G,venom:[[30,4.4,1],[170,3.8,2],[360,3.3,2],[540,2.9,3],[720,2.45,3]],start:15,crack:12}}
// v167 obstacles (owner: "add rolling boulders, parts of the path that are skinnier, and logs; make the collision true to the
// object"). Seeded like the gaps (every co-op rider has the same course), placed between the broken stretches, never in the tunnel
// for boulders and narrows, denser toward the summit. Self-contained and hoisted: 0045 carves the narrows out of the ground.
//  log  {s, r, o0, o1}: a fallen trunk across the trail (a cylinder from o0 to o1 at height r): full width, or from one side.
//  rock {s, r, off, u}: a boulder that rolls down off the mountain wall (from -o) across the trail at u tiles a second, timed so a
//       rider at full speed meets it at o = off; it rolls off the outer lip and falls.
//  nar  {s, len, w}: the outer part of the ledge has fallen away: only w tiles of trail stay along the mountain wall.
function ch167Obs(){if(ch167Obs.c)return ch167Obs.c;const P=ch153Path(),G=ch153Course().gaps,O=[];
  let sd=16701;const rn=()=>(sd=sd*16807%2147483647)/2147483647;
  const busy=(a,b)=>G.some(g=>b>g.s-g.len/2-10&&a<g.s+g.len/2+8)||O.some(q=>{const e=ch167Ext(q);return b>e[0]-9&&a<e[1]+9});
  let s=58,n=0;while(s<P.S-48){const k=s/P.S,hw=P.hw(s),tun=s>596&&s<694,narrows=s>=262&&s<=388;
    // the type: logs and boulders from the start, narrow ledges from the first third
    const pat=['log','rock','log','nar','rock','log','nar','rock','log','rock','nar','log'];let t=pat[n%pat.length];if(t=='nar'&&(s<120||tun||narrows))t=n%2?'rock':'log';if(t=='rock'&&tun)t='log';
    let q;if(t=='log'){const r=Math.round((.36+rn()*.1)*100)/100,f=rn();let o0=-hw-1.4,o1=hw+1.1;if(f<.3)o1=-hw+hw*2*(.55+rn()*.08);else if(f<.5)o0=hw-hw*2*(.55+rn()*.08);q={k:'log',s:0,r,o0,o1}}
    else if(t=='rock'){q={k:'rock',s:0,r:Math.round((.72+rn()*.22)*100)/100,off:Math.round((rn()*1.6-.8)*100)/100,u:Math.round((4.3+rn()*1.1)*100)/100}}
    else{const len=Math.round((7+rn()*4+k*5)*10)/10;q={k:'nar',s:0,len,w:Math.round((1.95+rn()*.3)*100)/100}}
    // slide forward to the first free stretch
    for(let i=0;i<40;i++){q.s=Math.round(s*10)/10;const e=ch167Ext(q);if(!busy(e[0],e[1])&&e[1]<P.S-44)break;s+=3}
    const e=ch167Ext(q);if(e[1]>=P.S-44)break;if(!busy(e[0],e[1])){O.push(q);n++}
    s=e[1]+(20-8*k)+rn()*10}
  return ch167Obs.c=O}
// an obstacle's stretch of trail [from, to]
function ch167Ext(q){return q.k=='nar'?[q.s-q.len/2,q.s+q.len/2]:q.k=='rock'?[q.s-q.r-1,q.s+q.r+1]:[q.s-q.r,q.s+q.r]}
// the outer edge of what is left of the trail at s (+o side), or null where the trail is whole. The break runs in on a slant over
// CH167E tiles at each end; this one edge is both the fall line and where the broken lip is built.
function ch167Edge(s){const O=ch167Obs();for(let i=0;i<O.length;i++){const q=O[i];if(q.k!='nar')continue;const a=q.s-q.len/2,b=q.s+q.len/2;if(s<=a||s>=b)continue;
    const hw=ch153Path().hw(s),keep=-hw+q.w,ramp=Math.min(1,Math.min(s-a,b-s)/1.4);return {q,o:hw+.45+(keep-hw-.45)*ramp}}return null}
// the gap at trail position s (with a margin m inside its ends), or null
function ch153GapAt(s,m){const G=ch153Course().gaps;m=m||0;for(let i=0;i<G.length;i++){const g=G[i];if(s>g.s-g.len/2+m&&s<g.s+g.len/2-m)return g}return null}
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
function ch153Terrain(I){const P=ch153Path(),C=P.C,best=new Float32Array(I.w*I.h).fill(99),ph=new Float32Array(I.w*I.h),sg=new Float32Array(I.w*I.h),bs=new Float32Array(I.w*I.h).fill(-99);
  for(let s=-8;s<=P.S+6;s+=.4){const sc=Math.max(0,Math.min(P.S,s)),hw=P.hw(sc);for(let o=-hw-5;o<=hw+5;o+=.4){const [x,z,h]=P.at(sc,o),X=Math.round(x)-I.x0,Z=Math.round(z)-I.y0;if(X<0||Z<0||X>=I.w||Z>=I.h)continue;const k=Z*I.w+X,d=Math.abs(o)-hw;
      if(d<best[k]){best[k]=d;ph[k]=h-(s<0?(-s)*.6:0);sg[k]=o<0?-1:1;bs[k]=s}}}
  const cone=(i,j)=>{const r=Math.hypot(i-P.cx,j-P.cz);let h=C.h0+C.rise*(C.R0-r)/(C.R0-C.R1);if(r<C.R1)h+=(C.R1-r)*1.4;if(r>C.R0)h=C.h0-(r-C.R0)*1.6-(r>C.R0+6?30:0);return h+(fbm2(i*.08,j*.08,3)-.5)*3.2};
  for(let j=I.y0-2;j<I.y0+I.h+2;j++)for(let i=I.x0-2;i<I.x0+I.w+2;i++){const X=i-I.x0,Z=j-I.y0,inn=X>=0&&Z>=0&&X<I.w&&Z<I.h,k=inn?Z*I.w+X:-1;let h=cone(i,j);
    if(k>=0&&best[k]<5){const d=best[k],w=d<=.6?1:1-((d-.6)/4.4)*((d-.6)/4.4)*(3-2*(d-.6)/4.4);const wall=sg[k]<0?Math.min(4,Math.max(0,d-.6)*1.6):-Math.max(0,d-.6)*.9;h=ph[k]*w+(Math.max(h,ph[k]+wall)*(sg[k]<0?1:0)+Math.min(h,ph[k]+wall)*(sg[k]<0?0:1))*(1-w);
      // v164: a broken stretch: the ledge has fallen away down the mountain (the inner wall stays); 3250 dresses its edges
      if(ch153GapAt(bs[k],0)&&(sg[k]<0?d<0:d<7))h=Math.min(h,ph[k]-11-Math.max(0,d)*.6)
      // v167: a narrow stretch: the outer part of the ledge has fallen away. Vertices from .9 past its edge are carved: the slope
      // between them and the kept band starts under the lip slabs (3330 lays them .6 inside the edge), so the trail itself never sags
      {const E=ch167Edge(bs[k]),o=sg[k]*(d+P.hw(bs[k]));if(E&&o>E.o+.9)h=Math.min(h,ph[k]-9-Math.max(0,o-E.o)*.5)}}
    HF[(j+HPD)*HW+i+HPD]=h}}
