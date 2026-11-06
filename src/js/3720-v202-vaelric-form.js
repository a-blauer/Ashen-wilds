// ================= v202 Lord Vaelric's form (owner, Nov 6 2026: "The proportions of the citadel boss are all wrong. His legs
// are too short and his torso is too long ... make him more refined. Refit his armor after updating his form.") =================
// The v110 frame put his hips at 1.8 m of a 3.9 m figure (legs 43% of his height, the waist alone 0.85 m). v202 keeps his
// height, head and sword, and reshapes the frame to heroic proportions (≈ 8.2 heads): hip joints at ~51% of his height,
// knees at ~26%, the waist 25% shorter, the rib cage 14% shorter, the upper arm and forearm a little longer so the wrists
// hang at the crotch again, and the waist narrowed into a V under the shoulders.
// The armour is refitted rather than stretched as one: every plate on the torso and limbs is bent to the new frame vertex by
// vertex in its joint's space (`T` in vlr202Form), so breastplate, lames, baldric, vein runes and collar stay on the body;
// small pieces (rivets, studs, gems) and the joint balls keep their shape and only move with the surface. Refits: the tabard
// ends at mid-thigh (it hung to the knee and read as more torso), the mail skirt and tassets keep their length (they cover the
// top of the longer thigh), the pauldrons are trimmed (`pd`), the pectoral plates flattened (`pec`, they read as two domes),
// the thighs and calves a little fuller at the top (`thw`, `knw`) so the longer legs don't read as sticks.
// Motion: poses that drop the hips (kneel, coil, crash, stagger, ...) drop them by the same share of the longer legs, so the
// knees and feet land where they did (checked: feet and knees within ~3 cm of v201 in every crouching pose).
// Co-op: the model is built the same way on every client (no randomness), so partners see the same form.
var VLR202={on:1,
  kt:.96/.84,ks:.98/.82,          // thigh 0.84 → 0.96 m, shin 0.82 → 0.98 m
  y0:.12,yc:.85,kw:.75,kc:.86,    // torso (hips space): identity up to the belt, waist ×0.75 up to the chest joint, rib cage ×0.86
  taper:.1,                       // the waist narrows (up to 10%) between the belt and the rib cage: a V from the shoulders
  ka:1.13,kf:1.08,                // upper arm (below the pauldron) and forearm (below the elbow cap)
  tab:.8,pd:.86,pec:[.92,.8,.88],thw:1.08,knw:1.07,small:.075};
VLR202.kl=(.84*VLR202.kt+.82*VLR202.ks)/(.84+.82);
// the torso map: hips-space height → new height
function vlr202W(Y){const V=VLR202;return Y<=.15||Y>=1.1?1:1-V.taper*Math.pow(Math.sin(Math.PI*(Y-.15)/.95),2)}
function vlr202F(Y){const V=VLR202;if(Y<=V.y0)return Y;if(Y<=V.yc)return V.y0+(Y-V.y0)*V.kw;return V.y0+(V.yc-V.y0)*V.kw+(Y-V.yc)*V.kc}
// a limb map: stretch below `a` (≤0) by k, shift below the old joint end `L`
function vlr202Limb(a,L,k){return y=>y>=a?y:y>=-L?a+(y-a)*k:a+(-L-a)*k+(y+L)}
function vlr202Form(R){const V=VLR202,J=R.J;if(!V.on||!J.hips||!J.chest||R.f202)return;R.f202=1;
  const joints=new Set(Object.values(J)),v=new THREE.Vector3(),gc=SVX.gc,balls=new Set(Object.keys(gc).filter(k=>/^v2ball/.test(k)).map(k=>gc[k]));
  // per joint: a map of joint-local points
  const sp0=J.spine.position.y,ch0=J.chest.position.y+sp0,T={};
  T.spine=p=>{const Y=p.y+sp0,w=vlr202W(Y);p.x*=w;p.z*=w;p.y=vlr202F(Y)-vlr202F(sp0)};
  T.chest=p=>{const Y=p.y+ch0,w=vlr202W(Y);p.x*=w;p.z*=w;p.y=vlr202F(Y)-vlr202F(ch0)};
  ['L','R'].forEach(s=>{const th=vlr202Limb(0,.84,V.kt),kn=vlr202Limb(0,.82,V.ks),sh=vlr202Limb(-.15,.6,V.ka),el=vlr202Limb(-.08,.58,V.kf);
    T['th'+s]=p=>{const w=p.y>=0?V.thw:p.y>-.84?1+(V.thw-1)*(1+p.y/.84):1;p.x*=w;p.z*=w;p.y=th(p.y)};T['kn'+s]=p=>{const u=Math.min(1,Math.max(0,-p.y/.82)),w=1+(V.knw-1)*(1-u);p.x*=w;p.z*=w;p.y=kn(p.y)};T['sh'+s]=p=>{p.y=sh(p.y)};T['el'+s]=p=>{p.y=el(p.y)}});
  // the tabard hung to the knee and read as more torso: it now ends at mid-thigh (the mail skirt and tassets keep their
  // length: on the longer thigh they cover its upper part, as tassets do)
  T.tab=p=>{p.y=p.y>=0?p.y:p.y*V.tab};
  const bent=(o,f)=>{const g=o.geometry;if(!g||!g.attributes.position)return;
    g.computeBoundingSphere();const sc=Math.max(o.scale.x,o.scale.y,o.scale.z),r=g.boundingSphere.radius*sc;
    if(balls.has(g)||r<V.small||o.userData.noMerge||!o.isMesh){f(o.position);return}
    o.updateMatrix();const n=g.clone(),P=n.attributes.position;
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrix);f(v);P.setXYZ(i,v.x,v.y,v.z)}
    n.computeVertexNormals();n.computeBoundingSphere();n.userData.lps=1;n.userData.svOwn=1;o.geometry=n;
    o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1)};
  // the pectoral plates read as two round domes: flatter and a little narrower, still proud of the breastplate
  J.chest.children.forEach(o=>{if(o.isMesh&&o.geometry===gc.v2pec){o.scale.x*=V.pec[0];o.scale.y*=V.pec[1];o.scale.z*=V.pec[2]}});
  for(const k in T){const j=J[k];if(!j)continue;
    // the joint's own pauldron trim (before the bend: shrink about the shoulder ball)
    j.children.slice().forEach(o=>{if(joints.has(o))return;
      if(V.pd!==1&&/^sh[LR]$/.test(k)&&o.isMesh&&!balls.has(o.geometry)){o.geometry.computeBoundingBox();o.updateMatrix();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrix),c=b.getCenter(new THREE.Vector3());
        if(c.y>-.3&&b.max.y-b.min.y<.45){o.position.multiplyScalar(V.pd);o.scale.multiplyScalar(V.pd)}}
      if(o.isMesh)bent(o,T[k]);else if(o.position)T[k](o.position)})}
  // joints: children of a bent joint sit where the bend puts their origin
  for(const k in J){const j=J[k],p=j.parent,pk=p&&p.name;if(!p||!T[pk])continue;
    if(pk==='hips')continue;                        // thighs, tabard and spine are placed below
    T[pk](j.position)}
  J.spine.position.y=vlr202F(sp0);
  J.hips.position.y+=.84*(V.kt-1)+.82*(V.ks-1);
  R.v202=1}
{const f=vlrBuild;vlrBuild=function(R,e){f.apply(this,arguments);try{vlr202Form(R)}catch(err){console.error('v202 vaelric form',err)}}}
if(SVB[5]){SVB[5].build=vlrBuild;
  // poses that lower the hips lower them by the same share of the longer legs
  const p0=SVB[5].post;SVB[5].post=function(e,S,dt,now){p0&&p0.apply(this,arguments);try{const R=S.R;if(R.v202&&S.O.hips){const d=S.O.hips[4];if(d<0)R.J.hips.position.y+=d*(VLR202.kl-1)}}catch(_){}}}
