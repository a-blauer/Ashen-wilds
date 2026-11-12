// v225: the Paladin's guard as a co-op partner sees it, in one window: the 'P' message the guard sends is replayed on a
// partner-style model (mpPeer) animated like 0520 animates partners. Prints shield forward / face on both.
(()=>{const out={};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const V=THREE.Vector3;try{CHEAT.god=true}catch(_){}
 const STEP=(n,m)=>{for(let i=0;i<n;i++){VT+=16;try{loop(VT)}catch(e){out.err=String(e)}if(m){try{animHero(VT,false,m)}catch(e){out.aerr=String(e)}}}};
 hero.cls='paladin';hero.look=null;heroRebuild();refreshGear(pl,'paladin',eq);{const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1],0)}STEP(20);
 enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
 const m=buildHero();m.mpPeer='x';m.mdLook=null;refreshGear(m,'paladin',{});m.position.set(pl.position.x+3,pl.position.y,pl.position.z);m.rotation.y=pl.rotation.y;scene.add(m);STEP(10,m);
 const live=mpvLive,cap=[];mpvLive=()=>true;const push=mpvPush;mpvPush=e=>{cap.push(JSON.parse(JSON.stringify(e)))};
 gd213Down();mpvLive=live;mpvPush=push;const P=cap.find(e=>e[0]==='P');out.msg=P&&{ms:P[1],ch:P[2],k5:P[3]&&P[3][5]};
 if(P){const e=P.slice();e.splice(1,0,0);mpvPlay({m,pr:{c:'paladin'},peer:'x'},e)}
 STEP(60,m);
 const S=H=>{const sh=H.gearG[H.gearG.length-1],a=H.rotation.y,fw=new V(Math.sin(a),0,Math.cos(a)),c=sh.getWorldPosition(new V()).sub(H.position),n=new V(0,0,-1).applyQuaternion(sh.getWorldQuaternion(new THREE.Quaternion()));
   const b=H.bones,r=k=>+b[k].rotation.x.toFixed(2)+','+(+b[k].rotation.y.toFixed(2))+','+(+b[k].rotation.z.toFixed(2));return {fwd:+c.dot(fw).toFixed(2),face:+n.dot(fw).toFixed(2),aL0:r('aL0'),aL1:r('aL1'),aL2:r('aL2'),sw:H.sw}};
 out.own=S(pl);out.partner=S(m);gd213Up();scene.remove(m);return out})()
