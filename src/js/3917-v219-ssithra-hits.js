// ================= v219: Ssith'ra can be struck anywhere along her body (owner, Nov 10 2026) =================
// Owner: "Make it so you can also hit Ssith'ra's body- not just the head."
// Every hit test in the game measures to a foe's position (e.m.position); Ssith'ra's is her head, and her fourteen body segments
// trail behind it along the path she took (3078), so swings, spells and shots that met her body did nothing. Now, for the length of
// each hit test (area() for swings and spells, shotTick for shots and bolts), she counts as standing at whichever of her head or
// visible segments is nearest to the blow (SB218.pts: the segments' joints, skipping any under the sand; none while she is burrowed),
// and she is put back straight after. Damage numbers and hit sparks appear where the blow landed. A hit on the body counts the same
// as a hit on the head. Co-op: each player tests their own blows (as before) and the damage is sent as usual.
var SB218={on:true,R:2.6,n:0};
function sb218Is(e){return !!(e&&!e.dead&&e.boss&&e.bi===3&&e.sv&&e.sv.R&&e.sv.R.J&&e.sv.R.J.s0&&e.m&&e.m.visible)}
function sb218Pts(e){if(e.sv.gone)return [];const R=e.sv.R,out=[];e.m.updateMatrixWorld(true);for(let k=0;k<SSR.N;k++){const J=R.J['s'+k];if(!J||!J.visible)continue;const v=J.getWorldPosition(new THREE.Vector3());
    if(v.y<GH(v.x,v.z)-.35)continue;out.push(v)}return out}
// move each Ssith'ra (x/z only) to her point nearest to any of the given points (within SB218.R of it); returns what to undo
function sb218Swap(P){const U=[];if(!SB218.on||!P.length||typeof enemies=='undefined')return U;for(const e of enemies){if(!sb218Is(e))continue;
    const H=e.m.position;let best=null,bd=1e9;for(const p of P)bd=Math.min(bd,Math.hypot(p.x-H.x,p.z-H.z));
    for(const q of sb218Pts(e))for(const p of P){const d=Math.hypot(p.x-q.x,p.z-q.z);if(d<bd-.05&&d<SB218.R+6){bd=d;best=q}}
    if(best){U.push([e,H.x,H.z]);H.x=best.x;H.z=best.z;SB218.n++}}return U}
function sb218Back(U){for(const [e,x,z] of U){e.m.position.x=x;e.m.position.z=z}}
{const f=area;area=function(p,r,dm,s,dir,half){let U=[];try{if(p)U=sb218Swap([dir&&dir.x!=null?p.clone().addScaledVector(dir,Math.min(r||2,3)*.6):p,p])}catch(_){}try{return f.apply(this,arguments)}finally{sb218Back(U)}}}
{const f=shotTick;shotTick=function(dt){let U=[];try{if(typeof shots!='undefined'&&shots.length)U=sb218Swap(shots.filter(s=>s&&s.m&&!s.dead).map(s=>s.m.position))}catch(_){}try{return f.apply(this,arguments)}finally{sb218Back(U)}}}
