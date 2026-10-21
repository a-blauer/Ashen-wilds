// =============== 6. SECRETS: cracked boulders, treasure maps ===============
const SECRETS=[];const secOpen=new Set();let tmaps=[];
{
  for(let T=1;T<=5;T++){
    for(let k=0;k<2;k++){const s=pickSpot(T,26);if(s)SECRETS.push({id:SECRETS.length,k:'boulder',x:s[0],z:s[1],T})}
  }
}
function buildSecret(S){
  const g=new THREE.Group();g.position.set(S.x,GH(S.x,S.z),S.z);
  {const b=TQ(g,new THREE.DodecahedronGeometry(1,0),sm(0x6e6a64),0,.95,0,1.25,1.05,1.15,.3,.6,0);
    [[0,1.2,.9,.5],[.5,.9,.8,-.6],[-.4,1.4,.75,.9]].forEach(([x,y,z,r])=>{const c=TQ(g,G_BOX,gmat(0xffb050),x,y,z,.06,.6,.02,0,0,r);c.castShadow=false});
    S.body=b;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)CBLK.add((S.z+j)*W+S.x+i)}
  scene.add(g);S.g=g;
}
function breakBoulder(S){
  if(S.broken)return;S.broken=1;secOpen.add('b'+S.id);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)CBLK.delete((S.z+j)*W+S.x+i);
  burst(gY(V(S.x,0,S.z),1),0x8a8478,60,4,3,.8);burst(gY(V(S.x,0,S.z),1),0xffb050,30,3,3,.6);shake(.25);sfx('boom');
  tw(400,k=>S.g.scale.setScalar(1-k),()=>{scene.remove(S.g);S.g=null});
  popT(V(S.x,0,S.z),'SECRET FOUND!','#fbbf24',true);say('🗝️ The cracked boulder shatters, revealing a hidden cache!');
  makeChest(S.x,S.z,'hidden cache',p=>stdLoot(p,S.T,{minR:2,egg:.5,rune:.6,g:1.5}));
}
// treasure maps
function digTreasure(m){tmaps=tmaps.filter(q=>q!==m);const p=V(m.x,0,m.z);burst(gY(p,.3),0x8a6a40,40,2.5,3,.7);sfx('blunt');popT(p,'TREASURE!','#fbbf24',true);
  makeChest(m.x,m.z+.5,'buried treasure',q=>stdLoot(q,m.T,{minR:1,egg:.35,rune:.4,g:1.3}))}

// =============== 7. WORLD EVENTS ===============

