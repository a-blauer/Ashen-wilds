// ================= v219: Burningeye Summit — fewer gate spiders worth 1 XP, a longer Rime Wraith song (owner, Nov 10 2026) =================
// Owner: "reduce the amount of ice spiders by 25%" · "Reduce xp given by spiders to 1xp" · "Rime wraith song is too short- makes it
// seem repetitive" (the frost gate's black bar: below).
//  1. The Frozen Gate's ice spiders (3160): one spawn in four of the melt's spawner (mq160Tick) is left out (FG218.skip, a steady count, not a dice roll) and the most
//     alive at once is 25% lower (MQ160.cap 32 → 24, co-op capC 40 → 30). Each gives 1 XP: v192's XP share (FS192.xp, 3510) is 0,
//     and gainXP (0120) never gives less than 1. Loot stays as v192 left it.
//  2. The Rime Wraith's fight song (z2x, 3890) was 8 chords played twice (A then B): 16 bars, ~26 s before it looped. It is now 16
//     chords (the old 8, then VI iv V i · ii° VI V i) with each part twice as long: the choir's line climbs on to a high point and
//     comes home in the second half, the celesta's falling shards run down the new chords. 32 bars, ~52 s a loop.
var FG218={skip:4,n:0,capK:.75};
FS192.xp=0;
MQ160.cap=Math.round(MQ160.cap*FG218.capK);MQ160.capC=Math.round(MQ160.capC*FG218.capK);
{const f=mq160Tick;mq160Tick=function(){FG218.in=1;try{return f.apply(this,arguments)}finally{FG218.in=0}}}
{const f=spawnEnemy;spawnEnemy=function(k,x,z,lv,o){try{if(FG218.in&&k==='icespider'&&MQ160.E&&o&&o.agg&&lv===MQ160.lv&&FG218.skip>0&&(++FG218.n%FG218.skip)===0)return null}catch(_){}return f.apply(this,arguments)}}
{const th=MTH.z2x;if(th){th.prog=[0,5,4,0,3,0,4,0, 5,3,4,0,1,5,4,0];const T=th.tune;delete T.on;
  T.A='4,16|5,16|6,8 8,8|7,16|10,16|9,16|8,8 6,8|7,16|9,12 7,4|10,8 7,8|8,8 6,8|7,12 _,4|8,8 10,8|9,8 12,8|11,8 8,8|7,16';
  T.B='7,2 4,2 2,2 0,2 7,2 4,2 2,2 0,2|9,2 7,2 5,2 2,2 9,2 7,2 5,2 2,2|8,2 6,2 4,2 1,2 8,2 6,2 4,2 1,2|7,4 4,4 0,8|10,2 7,2 5,2 3,2 10,2 7,2 5,2 3,2|9,2 7,2 4,2 2,2 9,2 7,2 4,2 2,2|8,2 6,2 4,2 1,2 6,8|7,16|'+
    '12,2 9,2 7,2 5,2 12,2 9,2 7,2 5,2|10,2 7,2 5,2 3,2 10,2 7,2 5,2 3,2|11,2 8,2 6,2 4,2 11,2 8,2 6,2 4,2|7,4 4,4 0,8|8,2 5,2 3,2 1,2 8,2 5,2 3,2 1,2|12,2 9,2 7,2 5,2 9,2 7,2 5,2 2,2|8,2 6,2 4,2 1,2 6,8|7,16'}}
// 3. The frost gate's black bar (owner: "Theres a black bar next to the gate still on frost gate in burning eye summit II"): the
//    dark plane behind the gate's opening (3160 fs160Gate 'fg_v', the road beyond while the ice stands) ends up shifted half its width
//    sideways and half its height down once the scene is running, so it stood beside the left pillar as a tall black slab. It is
//    put back in the opening (FG218.vp) and kept there, a little narrower than the opening so its edges hide behind the pillars.
FG218.vp=[0,3.35,-.6];FG218.vw=.93;
function fg218Void(){const S=MQ160.S;if(!S||!S.gate||!S.gate.g)return;let v=S.gate.v219;
  if(!v){S.gate.g.traverse(o=>{if(!v&&o.isMesh&&o.material&&o.material.isMeshBasicMaterial&&o.material.color&&o.material.color.getHex()===0x050608&&o.geometry&&o.geometry.type==='PlaneGeometry')v=o});if(!v)return;S.gate.v219=v}
  const P=FG218.vp;if(v.position.x!==P[0]||v.position.y!==P[1]||v.position.z!==P[2]||v.scale.x!==FG218.vw){v.position.set(P[0],P[1],P[2]);v.rotation.set(0,0,0);v.scale.set(FG218.vw,1,1)}}
{const f=mq160Build;mq160Build=function(){const S=f.apply(this,arguments);try{fg218Void()}catch(_){}return S}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(MQ160.S&&(FG218.t=(FG218.t||0)+dt)>.5){FG218.t=0;fg218Void()}}catch(_){}return r}}
