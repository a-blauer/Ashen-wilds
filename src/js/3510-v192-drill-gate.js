// ================= v192: Burningeye Summit II / III owner fixes (the Frozen Gate's spiders; the drill numbers live in 3170) =================
// Owner (Nov 2 2026): "Spiders get stuck during melting the frozen gate" and "Reduce drops from frozen gate event spiders by 65% and
// xp by 50%". (The drill requests, 25% per box, quicker repairs and fewer breakdowns, are plain numbers in MQ170 in 3170.)
//  * Why the spiders got stuck: they rise on a ring 15-19 tiles round the yard (up to ~34 tiles from a hero at the far side of it)
//    and walk in a straight line at their hero, with no pathing. (1) The enemy loop (0104) puts every monster further than 30 tiles
//    from your own hero to sleep (`m.visible=dpl<30` → aiSleep, no AI at all), so spiders that rose on the far side of the yard
//    stood there frozen until you walked over. (2) The ring reaches the edge of the gate clearing, where rock walls bend, boulders
//    and trees stand and the gate's stone sits: a spider whose straight line ran into one pressed against it for ever.
//  * The fix: spawn spots must be within FS192.wake of the hero and have a clear walk to them (fs192Spot, used by the spawner in 3160;
//    the old rule is the fallback for the last tries); event spiders never sleep while the melt runs (mpAct wrapper); and a watchdog
//    (fs192Tick, the region host only, like v150's ghost wolves) moves a spider that has gone less than FS192.move tiles in FS192.wait
//    seconds while more than FS192.gap tiles from the hero it hunts: it bursts into frost and rises again FS192.r tiles from that hero,
//    on free ground with a clear walk to them, inside the yard. Partners see the move through the shared-monster snapshot.
//  * Rewards: a gate spider gives FS192.xp (50%) of its XP and drops loot only FS192.loot (35%) of the time (65% fewer drops). The
//    partner's copies are ice spiders too (e.c.en), so a co-op kill is scaled the same on both screens.
var FS192={wake:26,wait:2.2,move:.6,gap:4.5,r:[5,8],xp:.5,loot:.35,n:0,err:0};
function fs192Is(e){return !!(e&&(e.fs160sp||(e.c&&e.c.en==='icespider')))}
// a straight walk from a to b with the walker's corner probes (walk() in 0160 uses CR = ±.3) hitting nothing solid
function fs192Line(ax,az,bx,bz){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(L/.35));
  for(let i=1;i<n;i++){const x=ax+dx*i/n,z=az+dz*i/n;if(solid(x+.3,z+.3)||solid(x-.3,z+.3)||solid(x+.3,z-.3)||solid(x-.3,z-.3))return false}return true}
// a good spawn spot: close enough that the spider is awake, with a clear walk to the hero
function fs192Spot(x,z,tg){const p=tg||pl.position;return Math.hypot(x-p.x,z-p.z)<=FS192.wake&&fs192Line(x,z,p.x,p.z)}
// event spiders never fall asleep while the melt runs (the enemy loop sleeps monsters beyond 30 tiles)
{const f=mpAct;mpAct=function(e){if(MQ160.E&&fs192Is(e)&&!e.dead)return true;return f.apply(this,arguments)}}
// rewards: half the XP, 35% of the drops
{const f=gw150X;gw150X=function(e){const k=f.apply(this,arguments);return fs192Is(e)?k*FS192.xp:k}}
function fs192Drop(){return Math.random()<FS192.loot}
{const f=lootE;lootE=function(e){if(fs192Is(e)&&!fs192Drop())return;return f.apply(this,arguments)}}
// the watchdog: a spider that is not getting anywhere rises again near the hero it hunts (the host's world, or yours alone)
function fs192Tick(now){const E=MQ160.E;if(!E||!co151Host())return;if(!(now>0))now=performance.now();let R=null;try{R=mq160Plan()}catch(_){return}
  for(const e of enemies){if(!e.fs160sp||e.dead||e.mir||!e.m)continue;const m=e.m,p=m.position;
    let tg=null;try{tg=eTarget(e,m,m.position.distanceTo(pl.position))}catch(_){tg=pl}if(!tg||!tg.position)tg=pl;const T=tg.position,d=Math.hypot(T.x-p.x,T.z-p.z);
    const S=e.st192;if(!S||e.atk||e.stun>0||e.root>0||d<=FS192.gap){e.st192={x:p.x,z:p.z,t:now};continue}
    if(Math.hypot(p.x-S.x,p.z-S.z)>FS192.move){e.st192={x:p.x,z:p.z,t:now};continue}
    if(now-S.t<FS192.wait*1000)continue;
    // free ground near the hunted hero, on the spider's side first, inside the yard, with a clear walk to the hero
    const a0=Math.atan2(p.z-T.z,p.x-T.x);let spot=null;
    for(let k=0;k<20&&!spot;k++){const a=a0+(k%2?1:-1)*Math.ceil(k/2)*.4,r=FS192.r[0]+Math.random()*(FS192.r[1]-FS192.r[0]),x=T.x+Math.cos(a)*r,z=T.z+Math.sin(a)*r;
      if(Math.hypot(x-R.yard.x,z-R.yard.z)>MQ160.leash+2)continue;if(R.ok(x,z,.4)&&!solid(Math.round(x),Math.round(z))&&fs192Line(x,z,T.x,T.z))spot=[x,z]}
    e.st192={x:p.x,z:p.z,t:now};if(!spot)continue;
    try{burst(gY(p,.3),0xd8f4ff,14,1.2,1.4,.6)}catch(_){}
    p.x=spot[0];p.z=spot[1];p.y=GH(p.x,p.z);e.vx=e.vz=0;m.rotation.y=Math.atan2(T.x-p.x,T.z-p.z);e.st192={x:p.x,z:p.z,t:now};FS192.n++;
    try{burst(gY(p,.3),0x8ab8d8,16,1.2,1.6,.6);svDecal(new THREE.Vector3(p.x,0,p.z),0x8ab8d8,1.1,2,.6)}catch(_){}}}
{const f=homeTick;homeTick=function(dt,now){const r=f.apply(this,arguments);try{fs192Tick(now)}catch(err){if(!FS192.err++)console.warn('v192 spiders',err)}return r}}
