// ---- gathering: chop trees, mine rocks, forage plants, dig soil, wade for clay ----
const PROPK={};MAP.props.forEach(q=>PROPK[q[1]*W+q[0]]=q[2]);
const gdep={},gresp=[];let gat=null,PR=null;
function nodeSet(k,on){(NODE[k]||[]).forEach(a=>{if(on){if(a[2])a[0].setMatrixAt(a[1],a[2])}else{if(!a[2]){a[2]=new THREE.Matrix4();a[0].getMatrixAt(a[1],a[2])}a[0].setMatrixAt(a[1],ZM)}a[0].instanceMatrix.needsUpdate=true})}
const GK={tree:['Chop tree','🪓 Chopping'],rock:['Mine rock','⛏️ Mining'],crystal:['Mine crystal','⛏️ Mining'],bush:['Gather fibers','🌿 Gathering'],flower:['Pick flowers','🌸 Picking'],mush:['Pick glow caps','✨ Picking'],bones:['Collect bones','🦴 Collecting'],mound:['Dig soil mound','⛏️ Digging'],water:['Gather clay & water','🧱 Wading']};
function gTarget(){
  let best=null,bd=2.2;const px0=Math.round(pl.position.x),pz0=Math.round(pl.position.z);
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    const x=px0+dx,y=pz0+dy;if(x<2||y<2||x>W-3||y>H-3)continue;
    const t=MAP[y][x],k=y*W+x,pk=PROPK[k];let kind=null;
    if(NODE[k]&&!gdep[k]){
      if(t=='#')kind='tree';else if(t=='r'&&(pk=='rock'||pk=='grave'||pk=='pillar'))kind='rock';else if(pk=='crystal')kind='crystal';
      else if(pk=='bush')kind='bush';else if(pk=='flower')kind='flower';else if(pk=='mush')kind='mush';else if(pk=='bones')kind='bones';else if(pk=='mound')kind='mound';
    }
    if(!kind)continue;const d=Math.hypot(x-pl.position.x,y-pl.position.z);if(d<bd){bd=d;best={kind:kind,x:x,y:y,k:k}}
  }
  return best;
}
function groundTarget(){
  const x=Math.round(pl.position.x),y=Math.round(pl.position.z);if(x<2||y<2||x>W-3||y>H-3)return null;
  const t=MAP[y][x];if(t=='#'||t=='r'||t=='~'||t=='H')return null;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const q=MAP[y+dy]&&MAP[y+dy][x+dx];if(q=='~'&&!BIOMES[MAP.bio[y+dy][x+dx]].lava)return {kind:'water',x:x,y:y,k:-1}}
  return null;
}
const gSkill=t=>t.kind=='tree'?skills.wood:(t.kind=='rock'||t.kind=='crystal')?skills.mine:skills.forage;
const gSoft=t=>['bush','flower','mush','bones','mound','water'].includes(t.kind);
function gStart_base(t){gat={tg:t,t:0,need:Math.max(.5,((gSoft(t)?1.1:1.6)-.06*gSkill(t).l)*(HS().gath>0?.7:1)),sw:0}}
function gFinish_base(tg){
  const sk=gSkill(tg),bonus=Math.floor(sk.l/3)+(HS().gath>0?1:0),got=[];
  if(tg.kind=='tree'){const n=2+bonus+R(0,1);mats.wood+=n;got.push(['🪵','Wood',n])}
  else if(tg.kind=='rock'){const n=2+bonus+R(0,1);mats.stone+=n;got.push(['🪨','Stone',n]);{const iv=lnV(tg)=='iron';if(iv||Math.random()<.06){const q=iv?1+R(0,1)+Math.floor(bonus/3):1;mats.iron+=q;got.push(['⛏️','Iron Ore',q])}}}
  else if(tg.kind=='crystal'){const n=1+R(0,1)+(bonus?1:0);mats.crystal+=n;got.push(['💎','Crystal Shard',n])}
  else if(tg.kind=='bush'){const n=2+bonus+R(0,2);mats.fiber+=n;got.push(['🌿','Plant Fiber',n])}
  else if(tg.kind=='flower'){const n=2+bonus+R(0,1);mats.petals+=n;got.push(['🌸','Petals',n])}
  else if(tg.kind=='mush'){const n=2+bonus+R(0,1);mats.glowcap+=n;got.push(['✨','Glow Caps',n])}
  else if(tg.kind=='bones'){const n=2+bonus+R(0,1);mats.bone+=n;got.push(['🦴','Old Bone',n])}
  else if(tg.kind=='mound'){const n=2+bonus+R(0,2),soil=tg.soil||BDIG[MAP.bio[tg.y][tg.x]],k='t:'+soil;have[k]=(have[k]||0)+n;got.push([ITEMS[k].i,ITEMS[k].n,n])}
  else if(tg.kind=='water'){const n=2+bonus+R(0,1),w=2+R(0,1);mats.clay+=n;have['t:water']=(have['t:water']||0)+w;got.push(['🧱','Clay',n],['💧','Shallow Water',w])}
  got.forEach(g=>pickup({ic:g[0],t:'+'+g[2]+' '+g[1],col:'#e8f0ff'}));
  sk.x++;if(sk.x>=sk.l*5){sk.x=0;sk.l++;say((tg.kind=='tree'?'Woodcutting':(tg.kind=='rock'||tg.kind=='crystal')?'Mining':'Foraging')+' reached level '+sk.l+'!')}
  if(tg.k>=0){
    nodeSet(tg.k,false);gdep[tg.k]=1;if(tg.kind=='tree'||tg.kind=='rock')MAP[tg.y][tg.x]='.';
    gresp.push({tg:tg,t:180+R(0,60),ch:tg.kind=='tree'?'#':tg.kind=='rock'?'r':null});
  }
  burst(gY(V(tg.x,0,tg.y),.8),tg.kind=='tree'?0x6a4a2a:gSoft(tg)?0x7ac860:0xb0b0b8,24,2.5,2.5,.7);
}
let featMoving=false;
function featTick(dt,now,al){
  featMoving=al>0;
  if(gat&&dt>0){
    const tg=gat.tg;
    if(al>0||Math.hypot(tg.x-pl.position.x,tg.y-pl.position.z)>2.8)gat=null;
    else{gat.t+=dt;face(V(tg.x-pl.position.x,0,tg.y-pl.position.z).normalize());gat.sw-=dt;
      if(gat.sw<=0){gat.sw=.5;if(!pl.sw)swingAnim((gat.n=(gat.n||0)+1)%2,320);burst(gY(V(tg.x,0,tg.y),.9),tg.kind=='tree'?0x6a4a2a:gSoft(tg)?0x7ac860:0xb0b0b8,6,1.5,1.5,.4)}
      if(gat.t>=gat.need){const g0=gat;gat=null;gFinish(g0.tg)}}
  }
  for(let i=gresp.length-1;i>=0;i--){const g=gresp[i];g.t-=dt;if(g.t<=0&&Math.hypot(g.tg.x-pl.position.x,g.tg.y-pl.position.z)>1.4){nodeSet(g.tg.k,true);delete gdep[g.tg.k];if(g.ch)MAP[g.tg.y][g.tg.x]=g.ch;gresp.splice(i,1)}}
  // recall channel
  if(rec&&dt>0){
    if(hero.hp<rec.hp-.01){rec=null;say('Recall interrupted!')}
    else{rec.hp=hero.hp;rec.t+=dt;if(rec.t>=rec.need){rec=null;fadeTo(recallTown)}}
  }
  $('rcb').classList.toggle('hide',!rec);if(rec){$('rcB').style.width=(100*rec.t/rec.need)+'%';$('rcT').textContent=(typeof RECBACK!='undefined'&&RECBACK&&INST?'🌀 Returning to your '+PMAP[INST.r].n+' run...':'🌀 Recalling to '+(home||TOWNS[0]).n+'...')};
  const emo=party.slice(0,2).some(c=>c.emp&&c.h>0);
  if(pl.mat){pl.mat.emissive.setHex(emo?0xffc04a:0);pl.mat.emissiveIntensity=emo?.28+.1*Math.sin(now/300):0}
  if(emo&&dt>0){if(Math.random()<.3)burst(V(pl.position.x+(Math.random()-.5)*.6,.2,pl.position.z+(Math.random()-.5)*.6),0xffd24a,1,.2,.9,.9);if(now%800<dt*1000)ring(pl.position,0xffd24a,1.6,600)}
}
const interact=()=>{if(PR&&!uiOpen())PR.fn()};
