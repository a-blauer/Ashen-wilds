// ================= v105: the flail swings instead of spinning =================
// The flail used to be a 360° spin on every attack. Now it is a 3-hit combo of wide, heavy sweeps like the other melee
// weapons (baked moves flail0/1/2 in test/v100_anim_moves.js): a wide forehand at shoulder height, a wide backhand, and an
// overhead crash that calls holy light (heals you a little for every enemy hit, as before). Each sweep covers a wide arc
// in front (about 170°) and reaches a bit further than a mace; the ball's arc is drawn as a wide trail.
Object.assign(MW.flail,{N:3,m:[.9,.95,1.45],ms:[380,380,480],a:[0,1,2],rg:1.12,half:1.48,fin:'holy',col:0xfff0b0});delete MW.flail.spin;
V100A_MAP.flail=['flail0','flail1','flail2'];
WDESC.flail='Wide, heavy sweeps that hit everything in a broad arc in front of you. The third blow is an overhead crash that calls holy light, healing you for each enemy hit.';
// the ball's trail: a flat band along the sweep (forehand right→left, backhand left→right), an arc down the front for the crash
function flailFx105(d,st,rg){try{const col=0xfff0b0,g=new THREE.Group(),a0=Math.atan2(d.x,d.z),half=1.48,R=rg*.92;
    const geo=new THREE.RingGeometry(R-.42,R,28,1,0,half*2),m=new THREE.Mesh(geo,addMat(col));m.material.side=THREE.DoubleSide;g.add(m);
    m.rotation.x=-Math.PI/2;m.rotation.z=a0-Math.PI/2-half;g.position.copy(gY(pl.position,1.05));
    scene.add(g);const dirS=st==1?1:-1;
    tw(260,k=>{m.material.opacity=.75*(1-k);m.rotation.z+=dirS*.012;g.scale.setScalar(1+k*.08)},()=>{scene.remove(g);geo.dispose()})}catch(_){}}
{const f=slashFx;slashFx=function(d,st,rg){if(st!=2&&typeof atkWT=='function'&&atkWT()=='flail'){flailFx105(d,st,rg);return}return f.apply(this,arguments)}}
