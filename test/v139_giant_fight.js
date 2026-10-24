// v139: enemies fighting, dying and respawning in every field instance; every 20 frames every drawn enemy body (alive or falling)
// is measured as the GPU skins it. Lists any body taller than 4.5x its scale, wider than 4.5x, or more than 1 tile under the ground.
(()=>{window.requestAnimationFrame=()=>0;POST.render=()=>{};window._vt=performance.now()+1e5;
  const v=new THREE.Vector3(),out=[],seen=new Set();let fr=0;
  function meas(m){let y0=1e9,y1=-1e9,x1=-1e9,n=0;
    m.traverse(o=>{if(!(o.isMesh||o.isSkinnedMesh)||!o.geometry||!o.geometry.attributes.position)return;
      let vis=true;for(let p=o;p;p=p.parent)if(!p.visible)vis=false;if(!vis)return;
      const P=o.geometry.attributes.position,st=Math.max(1,Math.floor(P.count/50));
      for(let i=0;i<P.count;i+=st){v.fromBufferAttribute(P,i);if(o.isSkinnedMesh&&o.skeleton)o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);
        if(!isFinite(v.y))continue;y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);x1=Math.max(x1,Math.hypot(v.x-m.position.x,v.z-m.position.z));n++}});
    const g=GH(m.position.x,m.position.z);return {h:+(y1-y0).toFixed(2),bot:+(y0-g).toFixed(2),rad:+x1.toFixed(2),sc:+m.scale.x.toFixed(2),n,py:+(m.position.y-g).toFixed(2)}}
  function check(z,k){const ms=new Set();enemies.forEach(e=>{if(e.m)ms.add(e)});scene.children.forEach(o=>{if(o.isE&&![...ms].some(e=>e.m===o))ms.add({m:o,dead:1,c:{en:'(removed-list) '+(o.name||'')}})});
    ms.forEach(e=>{const m=e.m;if(!m||!m.visible||!m.parent||e.boss)return;seen.add(m);const r=meas(m);if(!r.n)return;const s=Math.max(.3,r.sc);
      if(r.h/s>4.5||r.rad/s>4.5||r.bot<-1||r.py<-.6){r.key=e.c&&e.c.en;r.z=z;r.k=k;r.dead=!!e.dead;r.atk=e.atk&&e.atk.n;r.fr=fr;out.push(r)}})}
  const STEP=(n,z,k)=>{for(let i=0;i<n;i++){_vt+=16;fr++;loop(_vt);scene.updateMatrixWorld();hero.hp=heroMax();hero.iv=0;if(fr%20==0)check(z,k);if(fr%30==0)g139Tick()}};
  for(let z=0;z<6;z++)for(let k=0;k<3;k++){const I=INSL[insG(z,k)];insArrive(I);for(let t=0;t<2;t++){rosterTick();STEP(30,z,k)}
    const P=I.path||[];const spots=[];for(let j=0;j<P.length;j+=Math.max(1,Math.floor(P.length/5)))spots.push(P[j]);CAMPS.filter(C=>C.ig===I.g).forEach(C=>spots.push([C.x,C.y]));
    for(const s of spots){if(s[0]==null)continue;toPos(s[0],s[1],0);rosterTick();STEP(10,z,k);
      enemies.forEach(e=>{if(!e.dead&&!e.boss&&d2(e.m.position,pl.position)<14){e.agg=1;e.wt=0}});STEP(160,z,k);
      enemies.filter(e=>!e.dead&&!e.boss&&d2(e.m.position,pl.position)<14).slice(0,5).forEach(e=>{try{hurt(e,1e7)}catch(x){}});STEP(60,z,k);
      _vt+=RESP_T*1000+2000;rosterTick();STEP(40,z,k)}
    enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});ROST.slots=[]}
  const uniq={};out.forEach(r=>{const q=r.key+'|'+r.z+r.k+'|'+r.dead;if(!uniq[q])uniq[q]=Object.assign({cnt:0},r);uniq[q].cnt++});
  return {guard:G139,seen:seen.size,badN:out.length,bad:Object.values(uniq).slice(0,40)}})()
