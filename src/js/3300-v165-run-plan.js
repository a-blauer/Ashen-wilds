// ================= v165 The Sandstorm Run — the course (a special instance between Searing Sands III and the Den) =================
// A one-time level (like the Hilltop Ascent): the Sandskimmer races through a sandstorm along a winding sand corridor between
// great dunes, from the foot of the salt-cutters' slipway to the cave of the Den. Record 'sandrun' (3150's sp152Defs: g 32,
// x 714–1174, y 1452–2022, the free map space below the grid).
//  * The course (sr165Path, pure numbers): a Catmull-Rom spline through SR165C.cp (local tile coordinates), sampled every unit:
//    X/Z, tangents, at(s, o) (o: across, + to the right of travel), near(x, z, hint) → {s, o}. ~1500 long.
//  * The ground (sr165Map / sr165Terrain, from 3150's hooks at map time): the corridor (half width SR165C.hw) is open sand with
//    gentle swells; outside it the dunes rise steeply into ridges (void tiles with heights, like the Ascent's mountain); at the
//    end the ridges climb into a cliff with the cave of the Den in it.
//  * The hazards along the way (sr165Obs, seeded): salt boulders and spires to steer round, sand traps (quicksand) that grip the
//    runners. Checkpoints at a quarter, half and three quarters (banners on poles).
function sr165Cfg(){return sr165Cfg.c||(sr165Cfg.c={hw:10.5,cp:[[40,560],[44,500],[70,450],[130,418],[205,440],[262,498],[340,522],[408,476],[424,396],[366,342],[276,330],[186,302],[96,262],[60,192],[98,120],[186,88],[278,118],[356,160],[418,118],[432,60],[430,26]]})}
var SR165C=sr165Cfg();
// 0380's freeSpot (secrets, treasure, events) must not see the Run's corridor, which is walkable since v165 (this later declaration wins)
function freeSpot(x,y,r){if(x>=714&&y>=1452&&x<1174&&y<2022)return false;   // v165: never inside the Sandstorm Run (keeps every older world's spots)
  for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r&&!opn(x+i,y+j))return false;
  if(townAt(x,y,18)>=0||CAMPS.some(C=>Math.hypot(C.x-x,C.z-y)<CAMP_R+8)||ARN.some(A=>Math.hypot(A.cx-x,A.cz-y)<ARENA_R+10)||DUNS.some(D=>Math.hypot((D.x||D.tx)-x,(D.y||D.ty)-y)<10))return false;return true}
function sr165Def(){return sp152Defs().find(d=>d.key=='sandrun')}
function sr165Path(){if(sr165Path.c)return sr165Path.c;const D=sr165Def(),C=sr165Cfg().cp.map(([x,y])=>[D.x0+x,D.y0+y]),raw=[];
  for(let i=0;i<C.length-1;i++){const p0=C[Math.max(0,i-1)],p1=C[i],p2=C[i+1],p3=C[Math.min(C.length-1,i+2)];for(let t=0;t<1;t+=.02){const t2=t*t,t3=t2*t;
      raw.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}
  raw.push(C[C.length-1]);
  // resample every 1 unit
  const X=[raw[0][0]],Z=[raw[0][1]];let acc=0;for(let i=1;i<raw.length;i++){let [ax,az]=raw[i-1];const [bx,bz]=raw[i];let L=Math.hypot(bx-ax,bz-az);while(acc+L>=1){const k=(1-acc)/L;ax+=(bx-ax)*k;az+=(bz-az)*k;X.push(ax);Z.push(az);L=Math.hypot(bx-ax,bz-az);acc=0}acc+=L}
  const N=X.length,TX=new Float32Array(N),TZ=new Float32Array(N);for(let i=0;i<N;i++){const a=Math.max(0,i-2),b=Math.min(N-1,i+2),dx=X[b]-X[a],dz=Z[b]-Z[a],L=Math.hypot(dx,dz)||1;TX[i]=dx/L;TZ[i]=dz/L}
  const P={X,Z,TX,TZ,N,S:N-1,hw:sr165Cfg().hw};
  // o > 0 is to the right of travel: right = (-tz, tx) in this map's x/z (y up, z down the screen)
  P.at=(s,o)=>{s=Math.max(0,Math.min(P.S,s));const i=Math.min(N-2,Math.floor(s)),f=s-i,x=X[i]+(X[i+1]-X[i])*f,z=Z[i]+(Z[i+1]-Z[i])*f,tx=TX[i],tz=TZ[i];return [x-tz*(o||0),z+tx*(o||0)]};
  P.yaw=s=>{const i=Math.max(0,Math.min(N-1,Math.round(s)));return Math.atan2(TX[i],TZ[i])};
  P.near=(x,z,hint)=>{let a=0,b=N-1;if(hint!=null){a=Math.max(0,Math.floor(hint)-40);b=Math.min(N-1,Math.floor(hint)+40)}let bi=a,bd=1e9;for(let i=a;i<=b;i++){const d=(X[i]-x)*(X[i]-x)+(Z[i]-z)*(Z[i]-z);if(d<bd){bd=d;bi=i}}
    const dx=x-X[bi],dz=z-Z[bi],along=dx*TX[bi]+dz*TZ[bi],o=-dx*TZ[bi]+dz*TX[bi];return {s:Math.max(0,Math.min(P.S,bi+along)),o,d:Math.sqrt(bd)}};
  return sr165Path.c=P}
function sr165Hash(a,b){const h=Math.sin(a*127.1+b*311.7)*43758.5453;return h-Math.floor(h)}
// the distance of every tile of the level to the course, and the nearest course index (shared by map and terrain)
function sr165Dist(){if(sr165Dist.c)return sr165Dist.c;const D=sr165Def(),P=sr165Path(),w=D.w,h=D.h,best=new Float32Array(w*h).fill(99),si=new Int32Array(w*h).fill(-1),R=Math.ceil(sr165Cfg().hw+16);
  const stamp=(x0,z0,i)=>{const cx=Math.round(x0)-D.x0,cz=Math.round(z0)-D.y0;for(let dz=-R;dz<=R;dz++){const Zz=cz+dz;if(Zz<0||Zz>=h)continue;for(let dx=-R;dx<=R;dx++){const Xx=cx+dx;if(Xx<0||Xx>=w)continue;
      const d=Math.hypot(Xx+D.x0-x0,Zz+D.y0-z0),k=Zz*w+Xx;if(d<best[k]){best[k]=d;si[k]=i}}}};
  for(let i=0;i<P.N;i+=1)stamp(P.X[i],P.Z[i],i);
  // a short apron behind the start (the Skimmer comes down onto the course here)
  for(let k=1;k<=12;k++)stamp(P.X[0]-P.TX[0]*k,P.Z[0]-P.TZ[0]*k,0);
  return sr165Dist.c={best,si,w,h}}
// 3150 → map time: the level's tiles
function sr165Map(m,bio,DW,I,bi){const D=sr165Dist(),hw=sr165Cfg().hw;
  for(let y=I.y0;y<I.y0+I.h;y++)for(let x=I.x0;x<I.x0+I.w;x++){if(!m[y])continue;const k=(y-I.y0)*D.w+(x-I.x0),d=D.best[k];bio[y][x]=bi;
    if(d<=hw){m[y][x]=sr165Hash(x,y)<.1?'a':'.';DW[y*W+x]=d-hw}else{m[y][x]='';DW[y*W+x]=Math.min(9,d-hw)}}}
// 3150 → after every other height pass: the swells of the corridor, the dunes either side, the cliff at the end
function sr165Terrain(I){const D=sr165Dist(),P=sr165Path(),hw=sr165Cfg().hw,HI=(i,j)=>(j+HPD)*HW+i+HPD;
  for(let j=I.y0-2;j<I.y0+I.h+2;j++)for(let i=I.x0-2;i<I.x0+I.w+2;i++){const X=Math.max(0,Math.min(D.w-1,i-I.x0)),Z=Math.max(0,Math.min(D.h-1,j-I.y0)),k=Z*D.w+X,d=D.best[k],s=D.si[k]<0?0:D.si[k];
    const g0=.6+(fbm2(i*.035,j*.035,3)-.5)*1.6+Math.sin(s*.045)*.5;let h=g0;
    if(d>hw-1){const t=Math.min(1,Math.max(0,(d-hw+1)/8));h=g0+Math.pow(t,1.5)*(9+fbm2(i*.05+7,j*.05+3,3)*12)+Math.max(0,d-hw-8)*.35}
    // the end: ridges rise into a cliff round the cave
    const e=Math.max(0,s-(P.S-40))/40;if(e>0&&d>hw-2)h+=e*e*26;
    HF[HI(i,j)]=h}}
// ---------------- the hazards (seeded; the same for everyone) ----------------
function sr165Obs(){if(sr165Obs.c)return sr165Obs.c;const P=sr165Path(),rn=dkRng(16590),L=[];let s=110;
  while(s<P.S-45){const r=rn(),k=r<.42?'rock':r<.78?'trap':'spire',o=(rn()-.5)*(SR165C.hw*1.3),rad=k=='rock'?1.5+rn()*.9:k=='trap'?2.6+rn()*.9:1.0+rn()*.3;
    const [x,z]=P.at(s,o);L.push({k,s,o,x,z,r:rad,ry:rn()*6.28});
    // a second one beside it sometimes (never closing the way: a gap of 6 at least)
    if(rn()<.35){const k2=rn()<.5?'rock':'spire',r2=k2=='rock'?1.4+rn()*.6:1.0,o2=o>0?o-rad-r2-5.5-rn()*2:o+rad+r2+5.5+rn()*2;if(Math.abs(o2)<SR165C.hw-1.5-r2){const [x2,z2]=P.at(s+(rn()-.5)*4,o2);L.push({k:k2,s,o:o2,x:x2,z:z2,r:r2,ry:rn()*6.28})}}
    s+=22+rn()*18}
  return sr165Obs.c=L}
function sr165CPs(){const P=sr165Path();return [0,P.S*.25,P.S*.5,P.S*.75].map(s=>Math.round(s))}
// ---------------- the level's rules and look ----------------
SP152.R.sandrun={park:1,noMount:'🛷 You are riding the Sandskimmer.',noRecall:'🌪️ No way out in the storm — ride for the Den (or 🏳 turn back).',
  onLoad(){setTimeout(()=>{try{if(typeof sr165Leave=='function')sr165Leave(true);else insArrive(INSL[insG(3,2)])}catch(_){}},0)}};
sp152Theme('sandrun',{nm:'The Sandstorm Run',sub:'Through the storm to the Den of Ssith’ra',a:{fog:.022,fc:0xb08050,fcA:.85,sun:.55,hemi:.8,ex:1.0,sat:.95,vig:1.55,sky:.35,pt:'gust',pc:0xe0b880,po:.7}});
