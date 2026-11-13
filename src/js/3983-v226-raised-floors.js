// ================= v226: nothing sinks into raised floors (owner, Nov 12 2026) =================
// Owner: "There's a common theme of creatures and characters phasing into land structures such as the dirge area where you deposit the
// essence from the crystals. Also the carpet in the Final boss area. We need to make sure attack indicators and models are on top of
// the map so they're visible."
// Why: everything that walks stands on the terrain (GH), and so do the ground warnings (rings, pools, telegraphs a little over GH). A
// few set pieces lay a floor of their own over the terrain: the Reliquary of the Ossuary Fields (The Dirge III: a round stone floor
// .36 up, steps round its rim), and Lord Vaelric's throne hall (The Citadel's den: marble tiles, the long crimson carpet over them,
// the dais's steps; at the den's size DKY the carpet stands ~.11 over the ground). Feet, bodies and every warning drawn on the ground
// there were inside that floor.
// Now (RS226): those floors are known by their shape (RS226 areas: rs226Top(x, z) = the floor's top there, or null). Right before
// the world is drawn, while the hero is near one, everything standing on the ground inside it is raised onto the floor's top for that
// frame and put back right after (so no game rule, collision or AI ever sees a different height):
//  · the hero, the companions, co-op partners, every creature (bodies too), dropped loot;
//  · ground marks: any see-through effect lying on the ground there (warning rings and areas, pools, shadows, the target ring).
// More floors can be added with rs226Add(key, fn) (fn returns the area or null while it isn't built).
// Co-op: each screen raises what it draws; nothing is sent.
var RS226={on:true,A:{},F:{},near:30,n:0,err:0};
function rs226Add(k,fn){RS226.F[k]=fn}
// the Reliquary (3317): a turned floor, its two steps and the rings of flagstones
rs226Add('reliq',()=>{const S=typeof OS165!='undefined'&&OS165.S,R=S&&S.R;if(!R||!R.g||!R.g.parent)return null;const y0=R.g.position.y,cx=R.g.position.x,cz=R.g.position.z;
  return {x:cx,z:cz,R:9.6,top(x,z){const r=Math.hypot(x-cx,z-cz);if(r>=9.5)return null;
    const h=r<8.62?((r>2.6&&r<3.9)||(r>5&&r<6.4)||(r>6.5&&r<8.5)?.4:r>4.3&&r<4.6?.42:.37):r<8.75?.3:r<9.3?.22:r<9.42?.18:.12;return y0+h}}});
// the Crimson Throne Hall (0970, den 5): tiles, the carpet, the dais; built at the original size and then mapped outward by DK (1180)
rs226Add('den5',()=>{if(typeof ARN=='undefined'||typeof D5=='undefined'||D5.fa==null)return null;const A=ARN.find(a=>a.i===5);if(!A||!A.g)return null;
  const cx=A.cx,cz=A.cz,y0=GH(cx,cz),Fx=Math.cos(D5.fa),Fz=Math.sin(D5.fa);
  return {x:cx,z:cz,R:14.5*DK,top(x,z){const ox=cx+(x-cx)/DK,oz=cz+(z-cz)/DK,dx=ox-cx,dz=oz-cz;if(Math.hypot(dx,dz)>14.45)return null;
    const u=dx*Fx+dz*Fz,v=-dx*Fz+dz*Fx,av=Math.abs(v);let Y=null;
    if(u>=10.5&&u<=13.9&&av<=3.4)Y=y0+(u>=11.9&&av<=2.1?.49:u>=11.2&&av<=2.7?.33:.17);
    else if(u>=-14.3&&u<=10.4&&av<=1.45)Y=y0+.088;
    const g0=GH(ox,oz);if(Y==null)Y=g0+.05;return GH(x,z)+Math.max(0,Y-g0)*DKY}}});
function rs226Areas(){const L=[];for(const k in RS226.F){let a=RS226.A[k];if(!a||!a.ok()){let q=null;try{q=RS226.F[k]()}catch(_){}if(!q){delete RS226.A[k];continue}
      const src=k=='reliq'?OS165.S.R.g:null;a=RS226.A[k]=Object.assign(q,{ok:()=>!src||!!src.parent})}L.push(a)}return L}
function rs226Top(x,z,L){L=L||rs226Areas();let best=null;for(const a of L){if(Math.abs(x-a.x)>a.R||Math.abs(z-a.z)>a.R)continue;const t=a.top(x,z);if(t!=null&&(best==null||t>best))best=t}return best}
// raise o (top-level, world position) onto the floor where it stands; remembered in U to put back
function rs226Lift(o,L,U,decal){if(!o||!o.visible)return;const p=o.position;const t=rs226Top(p.x,p.z,L);if(t==null)return;const g=GH(p.x,p.z),d=t-g;if(d<=.005)return;
  const rel=p.y-g;if(decal?(rel<-.15||rel>.45):(rel<-.6||rel>3))return;p.y+=d;U.push(o,d)}
function rs226Decal(o){if(!(o.isMesh||o.isSprite||o.isPoints)||o.isE||o.mpPeer)return false;const m=Array.isArray(o.material)?o.material[0]:o.material;return !!m&&m.transparent&&m.depthWrite===false}
function rs226Pre(){const U=[];if(!RS226.on||typeof pl=='undefined'||!pl)return U;const L=rs226Areas().filter(a=>Math.hypot(pl.position.x-a.x,pl.position.z-a.z)<a.R+RS226.near);if(!L.length)return U;
  rs226Lift(pl,L,U);try{fols.forEach(f=>f&&rs226Lift(f,L,U))}catch(_){}
  for(const e of enemies)if(e&&e.m&&e.m.parent===scene)rs226Lift(e.m,L,U);
  try{drops.forEach(d=>d&&d.g&&rs226Lift(d.g,L,U))}catch(_){}
  const seen=new Set(U.filter((_,i)=>i%2==0));
  for(const o of scene.children){if(seen.has(o))continue;if(o.mpPeer)rs226Lift(o,L,U);else if(rs226Decal(o))rs226Lift(o,L,U,true)}
  RS226.n=U.length/2;return U}
function rs226Post(U){for(let i=0;i<U.length;i+=2)U[i].position.y-=U[i+1]}
{const f=POST.render;POST.render=function(){let U=null;try{U=rs226Pre()}catch(e){if(!RS226.err++)console.warn('v226 floors',e)}try{return f.apply(this,arguments)}finally{if(U)rs226Post(U)}}}
