// ================= v83: low-poly nature (runtime part) =================
// Terrain, trees, grass, props, ridge rocks and camp painting are patched at build time (build/pG_nature.py).
// Here: low-segment camp shapes (camps are built later, when you come near) and rugged stone zone portals.
if(typeof CG!='undefined'){CG.disc=new THREE.CircleGeometry(1,9);CG.ring=new THREE.RingGeometry(.86,1,12);CG.tor=new THREE.TorusGeometry(1,.16,4,10);CG.arc=new THREE.TorusGeometry(1,.07,4,6,Math.PI);
  CG.tent=NK.fin(new THREE.ConeGeometry(1,1,4,2),{j:.05,sd:41,f:(x,y,z)=>Math.abs(y)<1e-3?[x*.93,y,z*.93]:y<-.49?[x*1.06,y,z*1.06]:[x,y,z],paint:(h,ny,r)=>{const v=(.72+.34*h)*(.84+.3*r);return [v,v,v]}});
  CG.dod=NK.rock(1,.2,42);[CG.disc,CG.ring,CG.tor,CG.arc].forEach(g=>g.userData.lps=1)}
// zone portals (back to Duskhold, boss exit, wave trial): stacked rough stones instead of plain boxes
function lpnPortalArch(g){
  const st=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.95,color:0x6a6672}),G=new THREE.Group(),{fin,tr,merge,stone,hs}=NK;
  const blk=(w,hh,d,x,y,z,ry,sd)=>fin(tr(new THREE.BoxGeometry(w,hh,d,1,1,1),x,y,z,0,ry,0),{j:.07,sd,paint:stone});
  const parts=[];
  [-1,1].forEach(s=>{const H=[0,1,2,3].map(i=>.5+hs(i,s,7)*.18),k=2.36/H.reduce((a,b)=>a+b,0);let y=0;   // v177: each stack reaches the lintel exactly (it could stop short, the lintel in the air)
    for(let i=0;i<4;i++){const hh=H[i]*k,w=.5-i*.03+hs(s,i,9)*.08;parts.push(blk(w,hh,w,s*(.9+(hs(i,s,3)-.5)*.06),y+hh/2,0,(hs(i,s,5)-.5)*.5,50+i+s*10));y+=hh}});
  parts.push(blk(2.5,.34,.5,0,2.5,0,.03,61),blk(.5,.3,.46,0,2.82,0,.6,62));
  // a couple of fallen chunks at the base
  parts.push(fin(tr(new THREE.DodecahedronGeometry(.22,0),-1.35,.12,.3),{j:.06,sd:63,paint:stone}),fin(tr(new THREE.DodecahedronGeometry(.16,0),1.3,.09,-.25),{j:.05,sd:64,paint:stone}));
  const m=new THREE.Mesh(merge(parts),st);m.castShadow=true;m.receiveShadow=true;G.add(m);return G}
try{if(typeof RPORT!='undefined')RPORT.forEach(r=>{const g=r.g;if(!g||g.userData.lpn)return;g.userData.lpn=1;
  g.children.slice().forEach(o=>{if(o.isMesh&&o.geometry===G_BOX)g.remove(o)});
  // the glowing disc gets a low-poly rim
  if(r.disc){r.disc.geometry=new THREE.CircleGeometry(.8,10);r.disc.geometry.userData.lps=1}
  g.add(lpnPortalArch(g))})}catch(e){console.warn('nature portals',e)}

