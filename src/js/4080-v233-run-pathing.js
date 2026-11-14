// ================= v233: the Sandstorm Run — how its creatures move (owner, Nov 14 2026) =================
// Owner: "The enemy movement and pathing needs to be improved in the duneskimmer level."
// Measured over a 75 s ride (test/v233_run_paths.py) before this file: swarm scarabs stood inside one another (a whole swarm on
// one spot for 12,000 creature-frames), ran inside the dune walls (3,100), through boulders and salt spires (260) and through the
// Skimmer's hull (700); scorpions ran backwards at full speed while they aimed (800); creatures turned on the spot in one frame (530).
// Every creature's own AI (3302, 3916, 3980, 3990) still decides where it wants to go. This layer, the outermost sr165FoeAI,
// turns that into a path a creature could run:
//  * places: only SKR218.perSide scarabs pace right beside the hull; the others wait in rows further out and ahead of it
//    (rp233Slots: K.w across, K.fo along, read by 3916), move up as places open, change flank when the wall crowds theirs, and
//    the places squeeze in when the Skimmer hugs a dune.
//  * room: creatures push each other apart (rp233Apart; the bigger one gives way less), so a swarm is a swarm.
//  * the way: they run round boulders and spires (rp233Round) and round the hull, never through (a charging Shellback is
//    meant to hit it), and stay on the sand between the dunes (rp233Keep).
//  * merging: a scarab from ahead slows, turns and runs with the machine as it arrives, instead of charging back at it and
//    spinning round beside it.
//  * facing: the body turns at RP233.turn a second and points the way it runs; a scorpion that aims while running twists
//    toward the Skimmer by at most RP233.twist.
// Co-op: creatures are the host's and reach partners as positions and headings, so partners see the same paths (nothing new is sent).
var RP233={on:true,turn:11,twist:1.15,hull:2.7,gap:.72,row:[6.1,7.8],wall:.8,merge:[1.5,20],n:0,err:0};
function rp233Wrap(a){return Math.atan2(Math.sin(a),Math.cos(a))}
function rp233Busy(e){return !!e.cl||!!(e.k218&&e.k218.st==='leap')}
// how far the sand reaches on a flank of the machine (side as in K.side: + is the hull's left)
function rp233Room(V,side){const P=sr165Path(),o=V.o!=null?V.o:P.near(V.x,V.z,V.s).o;return SR165C.hw-RP233.wall+side*o}
// the scarabs' places beside a machine
// beside the hull each scarab runs in its own lane along it (K.f), so two never pace on one spot
function rp233Lane(e,L){const K=e.k218;if(K.ln!=null&&K.lns===K.side)return;let i=0;while(L.some(o=>o!==e&&o.k218.q==null&&o.k218.lns===K.side&&o.k218.ln===i))i++;K.ln=i;K.lns=K.side;K.f=Math.min(2.6,-.4+i*1.5)}
function rp233Slots(e,V){const K=e.k218;if(!K||K.st==='leap')return;if(!e.q233)e.q233=++RP233.n;const C=RP233,per=SKR218.perSide;let room=rp233Room(V,K.side);
  if(K.st==='pace'){K.q=null;K.qs=K.side;rp233Lane(e,enemies.filter(o=>!o.dead&&o.sr165==='sc'&&o.k218&&o.k218.side===K.side&&!o.cl&&o.v233===V));K.w=Math.max(3.1,Math.min(SKR218.side,room));K.fo=0;return}
  const same=s=>enemies.filter(o=>!o.dead&&o.sr165==='sc'&&o.k218&&o.k218.side===s&&!o.cl&&o.v233===V);
  // the wall crowds this flank: go round to the other one (not back and forth: it must be clearly roomier)
  K.sw233=Math.max(0,(K.sw233||0)-1/30);if(room<5.2&&!K.sw233){const r2=rp233Room(V,-K.side);if(r2>room+3&&same(-K.side).length<per+6){K.side=-K.side;room=r2;K.sw233=2.5}}
  // a waiting scarab keeps its place in the rows (K.q, per flank) until one beside the hull opens: the lowest moves up
  const L=same(K.side),pc=L.filter(o=>o.k218.st!=='run').length,W=L.filter(o=>o!==e&&o.k218.st==='run'&&o.k218.q!=null&&o.k218.qs===K.side),free=Math.max(0,per-pc-L.filter(o=>o!==e&&o.k218.st==='run'&&o.k218.q==null).length);
  if(K.q==null&&K.qs===K.side){rp233Lane(e,L);K.w=Math.max(3.1,Math.min(SKR218.side,room));K.fo=0;return}   // on its way to a place beside the hull
  if(K.qs!==K.side)K.q=null;
  if(free>0&&(K.q==null||!W.some(o=>o.k218.q<K.q))){K.q=null;K.qs=K.side;rp233Lane(e,L);K.w=Math.max(3.1,Math.min(SKR218.side,room));K.fo=0;return}
  if(K.q==null){let q=0;while(W.some(o=>o.k218.q===q))q++;K.q=q;K.qs=K.side}
  const r=K.q>>1,c=K.q&1;K.w=Math.max(3.4,Math.min(C.row[c]+(r%2)*.5,room));K.fo=1.6+r*1.9+c*.9-K.f}
// push apart from the other creatures of the Run
function rp233Apart(e,p,dt){const Ra=skr226R(e.sr165),k=Math.min(.5,dt*9);let ax=0,az=0;
  for(const o of enemies){if(o===e||o.dead||!o.sr165||rp233Busy(o))continue;const q=o.m.position,dx=p.x-q.x,dz=p.z-q.z,Rb=skr226R(o.sr165),need=(Ra+Rb)*RP233.gap;if(Math.abs(dx)>need||Math.abs(dz)>need)continue;
    let d=Math.hypot(dx,dz);if(d>=need)continue;let ux,uz;if(d<.02){const a=((e.q233||(e.q233=++RP233.n))*2.399963)%6.2832;ux=Math.sin(a);uz=Math.cos(a);d=0}else{ux=dx/d;uz=dz/d}
    const w=(need-d)*k*(2*Rb/(Ra+Rb));ax+=ux*w;az+=uz*w}
  const m=Math.hypot(ax,az),cap=Math.max(.12,14*dt);if(m>cap){ax*=cap/m;az*=cap/m}p.x+=ax;p.z+=az}
// out of a round thing at (cx, cz), and on round it the way the creature was going (dx, dz)
function rp233Round(p,cx,cz,R,dx,dz,st){const rx=p.x-cx,rz=p.z-cz,d=Math.hypot(rx,rz);if(d>=R)return false;const ux=d>.01?rx/d:1,uz=d>.01?rz/d:0;p.x=cx+ux*R;p.z=cz+uz*R;
  const sg=(dx*uz-dz*ux)>=0?1:-1,tx=uz*sg,tz=-ux*sg,dot=dx*ux+dz*uz;if(dot<0){const s=Math.min(st,.6);p.x+=tx*s;p.z+=tz*s;const r2=Math.hypot(p.x-cx,p.z-cz)||1;p.x=cx+(p.x-cx)/r2*R;p.z=cz+(p.z-cz)/r2*R}return true}
// on the sand between the dunes
function rp233Keep(e,p,V){const P=sr165Path(),lim=SR165C.hw-RP233.wall+.1;let q=P.near(p.x,p.z,e.s233!=null?e.s233:null);if(q.d>SR165C.hw+6)q=P.near(p.x,p.z);e.s233=q.s;if(Math.abs(q.o)<=lim)return;
  // the nearest point of the course line, then out to the limit (near() measures against a sample point: good to a few cm)
  const [x,z]=P.at(q.s,q.o>0?lim:-lim);p.x=x;p.z=z}
{const f=sr165FoeAI;sr165FoeAI=function(e,dt,now){if(!RP233.on||!e||!e.m||!SR165.on||SR165.ph!=='run'||rp233Busy(e))return f.apply(this,arguments);
  let V=null;const m=e.m,p=m.position,x0=p.x,z0=p.z,r0=m.rotation.y;
  try{V=sr165Near(p)[0];e.v233=V;if(V&&e.sr165==='sc'&&e.k218&&!e.fall226)rp233Slots(e,V)}catch(err){if(!RP233.err++)console.warn('v233 slots',err)}
  const r=f.apply(this,arguments);
  try{if(!V||e.dead||rp233Busy(e)||enemies.indexOf(e)<0)return r;const fall=!!e.fall226,dx=p.x-x0,dz=p.z-z0,st=Math.hypot(dx,dz);
    // a scarab that came out of the sand ahead does not run back at the machine and spin round beside it: it slows as the
    // Skimmer comes (from RP233.merge[1] ahead of its place), turns and is running with it by the time it is alongside
    if(!fall&&e.sr165==='sc'&&e.k218){const K=e.k218,fx=Math.sin(V.h),fz=Math.cos(V.h),lead=(p.x-V.x)*fx+(p.z-V.z)*fz-(K.f+(K.fo||0)+Math.max(0,V.v)*.08),a=dx*fx+dz*fz,M0=RP233.merge;
      if(lead>0){const hv=Math.max(0,V.v)*dt,need=lead>=M0[1]?Math.min(0,a)*Math.min(1,(lead-M0[1])/12):lead>M0[0]?hv*.9*(1-(lead-M0[0])/(M0[1]-M0[0])):hv*(.6+.3*lead/M0[0]);if(a<need){p.x+=fx*(need-a);p.z+=fz*(need-a)}}}
    rp233Apart(e,p,dt);
    const R=skr226R(e.sr165)*.75;for(const o of SR165.obs){if(o.gone||o.k==='trap'||Math.abs(o.x-p.x)>6||Math.abs(o.z-p.z)>6)continue;rp233Round(p,o.x,o.z,o.r+R,dx,dz,st)}
    // the hull (relative to it: what matters is which way the creature passes it)
    if(!fall&&!(e.sr165==='sb'&&e.k226&&e.k226.st==='charge')&&!(V.air>0)){const vx=Math.sin(V.h)*Math.max(0,V.v)*dt,vz=Math.cos(V.h)*Math.max(0,V.v)*dt;const hx=p.x,hz=p.z;if(rp233Round(p,V.x,V.z,RP233.hull+R*.4,dx-vx,dz-vz,Math.max(Math.hypot(dx-vx,dz-vz),8*dt))){
        // eased out, not thrown (a scarab whose leap found the hull full drops off beside it)
        const ex=p.x-hx,ez=p.z-hz,el=Math.hypot(ex,ez),cap=12*dt;if(el>cap){p.x=hx+ex/el*cap;p.z=hz+ez/el*cap}}}
    rp233Keep(e,p,V);p.y=GH(p.x,p.z);
    if(fall)return r;
    // facing: the way it runs, turned at a rate
    const mx=p.x-x0,mz=p.z-z0,sp=Math.hypot(mx,mz)/Math.max(dt,1e-4);let want=m.rotation.y;
    if(sp>3){const mv=Math.atan2(mx,mz);if(e.sr165==='sp'||e.sr165==='gs'){const d=rp233Wrap(want-mv);want=mv+Math.max(-RP233.twist,Math.min(RP233.twist,d))}else want=mv}
    const d=rp233Wrap(want-r0),lim=RP233.turn*dt;m.rotation.y=e.f233?r0+Math.max(-lim,Math.min(lim,d)):want;e.f233=1
  }catch(err){if(!RP233.err++)console.warn('v233 path',err)}
  return r}}
