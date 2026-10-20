// ================= v49: secrets, world events, fishing, gear sets & legendaries, creature runes, realm visitors, bestiary =================
const UW={rnd:(()=>{let s=4242;return ()=>(s=s*16807%2147483647)/2147483647})()};
const opn=(x,y)=>{const t=MAP[y]&&MAP[y][x];return t&&t!='#'&&t!='~'&&t!='r'&&t!='R'&&t!='W'&&t!='B'&&t!='a'};
function freeSpot(x,y,r){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r&&!opn(x+i,y+j))return false;
  if(townAt(x,y,18)>=0||CAMPS.some(C=>Math.hypot(C.x-x,C.z-y)<CAMP_R+8)||ARN.some(A=>Math.hypot(A.cx-x,A.cz-y)<ARENA_R+10)||DUNS.some(D=>Math.hypot((D.x||D.tx)-x,(D.y||D.ty)-y)<10))return false;return true}
function pickSpot(T,minD,tries){for(let k=0;k<(tries||400);k++){const x=8+Math.floor(UW.rnd()*(W-16)),y=8+Math.floor(UW.rnd()*(H-16));if(tierAt(x,y)!==T)continue;if(SECRETS.some(s=>Math.hypot(s.x-x,s.z-y)<(minD||30)))continue;if(freeSpot(x,y,3))return [x,y]}return null}
// shared loot chest
const CHESTS=[];
function makeChest(x,z,label,loot){
  const g=new THREE.Group();g.position.set(x,GH(x,z),z);
  TQ(g,G_BOX,sm(0x5a3a1e),0,.32,0,1.1,.64,.72);TQ(g,G_BOX,sm(0x6a4626),0,.74,0,1.12,.22,.74);[-.5,.5].forEach(px=>TQ(g,G_BOX,sm(0xd8a830,{metalness:.7,roughness:.3}),px,.45,0,.06,.9,.76));TQ(g,G_BOX,sm(0xe8c040,{metalness:.7,roughness:.3}),0,.42,.37,.18,.24,.04);
  const gl=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,3,20,1,true),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));gl.position.y=1.5;g.add(gl);
  scene.add(g);const c={g,x,z,label,loot};CHESTS.push(c);return c}
function openChest(c){const i=CHESTS.indexOf(c);if(i<0)return;CHESTS.splice(i,1);tw(450,k=>{c.g.scale.setScalar(1-k*.9)},()=>scene.remove(c.g));burst(gY(c.g.position,.8),0xffd060,60,3,3,.8);sfx('chime');c.loot(V(c.x,0,c.z+1));hud()}
function stdLoot(p,T,o){o=o||{};const l=Math.max(1,Math.min(MAXLV,TIER_LV[T-1][0]+R(2,8)));const g=Math.round((30+l*10)*(o.g||1));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1300);
  const it=genItem(l,{minR:o.minR||1,cls:hero.cls});drop('gear',it,p,it.r);if(Math.random()<(o.egg||.3)){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}if(Math.random()<(o.rune||.25))drop('sup',{k:RUNEK[R(0,RUNEK.length-1)],n:1},p,2);drop('mat',{k:UPM[T-1][0],n:R(2,4)},p,T-1)}

