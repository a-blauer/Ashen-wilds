// ================= v150: the rune sigil rituals are shorter, leaner and the wolves don't get stuck =================
// Owner: "way too many wolves for rune sigil and they got stuck often. Reduce count to 50 kills. Also gave too much xp and
// drops - cut by 75%."
//  · A ritual ends after MQ145.total = 50 ghost wolves (was 100), still 12 at a time.
//  · A ghost wolf gives a quarter of its XP (gw150X, used in gainXP) and drops loot only one kill in four (GW150.loot), the
//    same for co-op copies of the host's wolves.
//  · Stuck wolves: a hunting wolf that has gone less than GW150.move tiles in GW150.wait seconds while still more than
//    GW150.gap tiles from the hero it hunts (snagged on a rune stone, a tree or a ledge) melts into shadow and rises again
//    on free ground GW150.r tiles from that hero (the region host's world, or yours alone).
var GW150={xp:.25,loot:.25,wait:2.5,move:.6,gap:2.6,r:[3,5]};
MQ145.total=50;
function gw150Is(e){return !!(e&&(e.gw145||(e.c&&e.c.en==='ghostwolf')))}
function gw150X(e){return gw150Is(e)?GW150.xp:1}
{const f=lootE;lootE=function(e){if(gw150Is(e)&&Math.random()>=GW150.loot)return;return f.apply(this,arguments)}}
function gw150Tick(now){const R=MQ145.R;if(!R||!R.live||!R.live.length)return;if(typeof MP!='undefined'&&MP.on&&MP.others>0&&MP.host!==MP.me)return;
  let ok=null;try{ok=mq145Plan().ok}catch(_){}
  for(const e of R.live){if(e.dead||!e.m||e.mir)continue;const m=e.m,p=m.position;
    let tg=null;try{tg=eTarget(e,m,m.position.distanceTo(pl.position))}catch(_){tg=pl}if(!tg||!tg.position)tg=pl;const d=Math.hypot(tg.position.x-p.x,tg.position.z-p.z);
    const S=e.st150;if(!S||e.atk||d<=GW150.gap){e.st150={x:p.x,z:p.z,t:now};continue}
    if(Math.hypot(p.x-S.x,p.z-S.z)>GW150.move){e.st150={x:p.x,z:p.z,t:now};continue}
    if(now-S.t<GW150.wait*1000)continue;
    // blink: free ground near the hunted hero, on the wolf's side first
    const a0=Math.atan2(p.z-tg.position.z,p.x-tg.position.x);let spot=null;
    for(let k=0;k<16&&!spot;k++){const a=a0+(k%2?1:-1)*Math.ceil(k/2)*.45,r=GW150.r[0]+Math.random()*(GW150.r[1]-GW150.r[0]),x=tg.position.x+Math.cos(a)*r,z=tg.position.z+Math.sin(a)*r;
      if(ok?ok(x,z,.4):!solid(Math.round(x),Math.round(z)))spot=[x,z]}
    e.st150={x:p.x,z:p.z,t:now};if(!spot)continue;
    try{burst(gY(p,.5),0x3a2a6a,16,1.2,1.4,.6)}catch(_){}
    p.x=spot[0];p.z=spot[1];p.y=GH(p.x,p.z);e.vx=e.vz=0;m.rotation.y=Math.atan2(tg.position.x-p.x,tg.position.z-p.z);e.st150={x:p.x,z:p.z,t:now};
    try{burst(gY(p,.4),0x6a4ab8,18,1.2,1.6,.6)}catch(_){}}}
{const f=homeTick;homeTick=function(){const r=f.apply(this,arguments);try{gw150Tick(performance.now())}catch(err){if(!GW150.err){GW150.err=1;console.warn('v150 wolves',err)}}return r}}
