// ================= v219: the thrown weapon is the weapon in the hand; shuriken are shuriken (owner, Nov 10 2026) =================
// Owner: "thrown weapons for assassin should match the equip model. shuriken also is attached to a knife model for some reason."
//  1. Since v211 every throwing-knife throw launched the same plain dagger (3820 kn211Mesh), whatever the hero held. Now the thrown
//     shot is a fresh copy of the held model: v89Wpn (the in-hand model, 1260, uniques 2480) is wrapped to remember which item it was
//     built from (userData.kq218), and kn211Mesh(h) builds that same item again for hero h (the player, or a co-op partner's hero in
//     2170, whose gear is built from the partner's own equipment, so partners see the right model with no new message field).
//  2. Shuriken: Blackstar Shuriken (v137 'kn_star') was a kunai handle with a star stuck on its end, and Galecut Shuriken (the v78
//     tier-4 knives) drew a plain dagger. Both are now a lone star held between the fingers (SH218), and a thrown star flies flat,
//     spinning about its centre like a shuriken, instead of flipping end over end like a knife.
var SH218={ys:-.09,R:.11,r:.032,spin:30,sc:1};
function sh218Is(it){try{const t=it&&itT(it);return !!t&&t.wt=='knives'&&(t.v7=='kn_star'||/shuriken/i.test(t.n||''))}catch(_){return false}}
// a four-point star (with a ground edge and a hub) centred at (0, SH218.ys, 0) in the kit's x-y plane
function sh218Kit(k,edge,core,hub,gl){const P=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=i%2?SH218.r:SH218.R;P.push([Math.sin(a)*r,Math.cos(a)*r])}
  w7Blade(k,'sh218',P,.012,core,edge,0,SH218.ys,0,0,.01);
  k.p('','cyl','m',hub,0,SH218.ys,0,.022,.018,.022,Math.PI/2);k.p('','cyl','c',0x101014,0,SH218.ys,0,.009,.02,.009,Math.PI/2);
  if(gl)k.p('','cyl','g',gl,0,SH218.ys,0,.012,.02,.012,Math.PI/2)}
W137.kn_star=(k,c)=>sh218Kit(k,0x6a6a74,0x1e1e24,c.fit,c.gl);
// the plain shuriken: the base builder draws a dagger (lgWpnKit 'dagger'); while a shuriken item is being built it draws the star,
// so the later layers (v178 grade colours, loose pieces) still run over it
{const f=v89WpnKit;v89WpnKit=function(k,it){const o=SH218.cur;SH218.cur=sh218Is(it)?it:null;try{return f.apply(this,arguments)}finally{SH218.cur=o}}}
{const f=lgWpnKit;lgWpnKit=function(k,type,col,r){const it=SH218.cur;if(it&&type=='dagger'){sh218Kit(k,lgCol(col,0xffffff,.25),lgCol(col,0,.45),LGW.iron2,(r|0)>=3?v89Rc(r|0):null);return}return f.apply(this,arguments)}}
// v178's tier ornaments are measured for a grip and a blade (bands, pommel, collar): a star has neither, so its hub takes the tier
// colour instead
{const f=w176Kit;w176Kit=function(k,it){if(!sh218Is(it))return f.apply(this,arguments);try{const ti=Math.max(0,Math.min(4,itT(it).t|0));if(ti<1)return;
  k.p('','cyl','m',W176.T[ti],0,SH218.ys,0,.03,.012,.03,Math.PI/2)}catch(_){}}}
// the in-hand model remembers its item, so the throw can build the same thing
{const f=v89Wpn;v89Wpn=function(it,type){const g=f.apply(this,arguments);try{if(g&&it&&it.tp!=null)g.userData.kq218={tp:it.tp,r:it.r|0,u:it.u,star:sh218Is(it)}}catch(_){}return g}}
// the held item, and the size it is drawn at in the hand (the group's and its meshes' scale: the thrown copy flies at that size)
function kn218Held(h){h=h||pl;const G=(h&&h.gearG)||[];for(const o of G)if(o&&o.userData&&o.userData.wt=='knives'&&o.userData.kq218){
    let m=null;o.traverse(x=>{if(!m&&x.isMesh)m=x});const sc=o.scale.x*(m&&m!==o?m.scale.x:1);return Object.assign({},o.userData.kq218,{sc:sc>.05&&sc<4?sc:KN211.sc})}
  return null}
// kn211Mesh(h): +z is the flight; a pivot spins the model (a knife end over end about x, a star flat about y)
{const f=kn211Mesh;kn211Mesh=function(h){let I=null;try{I=kn218Held(h)}catch(_){}if(!I)return f.apply(this,arguments);
  let k=null;try{k=v89Wpn({tp:I.tp,r:I.r,u:I.u},'knives')}catch(_){}if(!k)return f.apply(this,arguments);
  const out=new THREE.Group(),pv=new THREE.Group();k.rotation.x=-Math.PI/2;
  if(I.star){k.position.z=SH218.ys;pv.scale.setScalar(I.sc*SH218.sc)}else{k.position.z=-.12;pv.scale.setScalar(I.sc)}
  pv.add(k);out.add(pv);out.userData.lpsSkip=1;out.userData.kn211=1;out.userData.kn211pv=pv;out.userData.kn218=I.star?'star':'knife';
  const t0=performance.now();let m=null;k.traverse(o=>{if(!m&&o.isMesh)m=o});
  if(m)m.onBeforeRender=function(){const a=(performance.now()-t0)/1000;if(I.star)pv.rotation.y=-a*SH218.spin;else pv.rotation.x=a*KN211.spin};
  return out}}
