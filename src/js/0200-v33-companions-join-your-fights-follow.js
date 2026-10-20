// ================= v33: companions join your fights and follow loosely =================
let hAgro=null;
// what the team should be fighting: your target, whatever you just hit, or anything attacking you
function teamFoe(){
  if(townAt(pl.position.x,pl.position.z,0)>=0)return null;
  const now=performance.now(),ok=e=>e&&!e.dead&&d2(e.m.position,pl.position)<16;
  if(AF){const b=bossEnt(AF.i);if(ok(b))return b}
  if(ok(tgt)&&(tgt.agg||(hAgro&&hAgro.e===tgt&&now-hAgro.t<8000)))return tgt;
  if(hAgro&&now-hAgro.t<6000&&ok(hAgro.e))return hAgro.e;
  let best=null,bd=9;enemies.forEach(e=>{if(e.dead||!e.agg)return;const d=d2(e.m.position,pl.position);if(d<bd){bd=d;best=e}});return best;
}
function compMove(f,dx,dz){if(!dx&&!dz)return;const p=f.position,ox=p.x,oz=p.z;walk(f,dx,dz);const m=Math.hypot(p.x-ox,p.z-oz),w=Math.hypot(dx,dz);if(m<w*.5&&!tcHit(ox+dx,oz+dz)){p.x=ox+dx*.8;p.z=oz+dz*.8}}

// ================= v34: Basic Incubator — hatches any egg, no habitat bonus =================
TGI.Basic='🥚';FAMC.Basic=0xd8c8a0;
function hatch(e){if(!e.basic)return hatch_base(e);const t=e.tag;e.tag='Basic';const c=hatch_base(e);e.tag=t;c.hab=0;return c}

