// ================= v150: co-op monsters also go for partners' companions =================
// The region host runs the shared monsters (0520). Its monsters picked between its own hero, its own companions and the
// partners' heroes, but never a partner's companion, so a guest's companion could bite a monster all day and never be
// fought back. Now a host monster also weighs each partner's active companion (the copy 2170 shows, r.fl[i]) by the same
// rule as your own (only when clearly closer than the hero it would go for, at most two monsters on one companion). The
// attack is relayed with the target "peer#slot"; the owner plays it against its own companion (fols[slot]), which is where
// the hit lands. Older pages read an unknown target as a spot on the ground (harmless).
var AG150={pref:2.5,cap:2};
{const f=eTarget;eTarget=function(e,m,dpl){const tg=f.apply(this,arguments);
  try{if(!MP.on||!MP.others||e.mir||MP.host!==MP.me)return tg;
    if(tg&&tg.mpFolOf)return tg; // already on one
    let bd=tg===pl?dpl:m.position.distanceTo(tg.position);bd-=AG150.pref;let best=null;
    // stay on the companion it already chose while it is close and still shown
    if(e.tg150){const g=e.tg150;if(g.parent&&g.visible&&m.position.distanceTo(g.position)<6)return g;e.tg150=null}
    const cnt=new Map();enemies.forEach(o=>{if(o!==e&&!o.dead&&o.agg&&o.tg150)cnt.set(o.tg150,(cnt.get(o.tg150)||0)+1)});
    for(const k in MP.rh){const r=MP.rh[k];if(!r.act||!r.fl)continue;
      for(let i=0;i<2;i++){const g=r.fl[i];if(!g||!g.visible||!g.parent)continue;if((cnt.get(g)||0)>=AG150.cap)continue;
        const d=m.position.distanceTo(g.position);if(d<bd){bd=d;best=g;g.mpFolOf=k+'#'+i}}}
    if(best){e.tg150=best;return best}}catch(err){if(!AG150.err){AG150.err=1;console.warn('v150 aggro',err)}}
  return tg}}
// the relayed attack names the companion: "peer#slot"
{const f=mStart;mStart=function(e,tg,n){if(tg&&tg.mpFolOf&&MP.on&&MP.others&&e.nid&&!e.mir&&MP.host===MP.me){const id=tg.mpFolOf;tg.mpPeer=id;try{return f.apply(this,arguments)}finally{delete tg.mpPeer}}return f.apply(this,arguments)}}
// the owner: an attack on one of my companions plays against it here
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l)&&d.r===MP.rg&&msg.peer===MP.host){
    const pre=(MP.me||'')+'#';const keep=[];let mine=0;
    for(const q of d.l){if(Array.isArray(q)&&q[0]==='a'&&typeof q[3]==='string'&&q[3].indexOf('#')>0){mine++;
        if(q[3].indexOf(pre)===0){const i=+q[3].slice(pre.length),e=MP.emap[q[1]],fo=typeof fols!='undefined'?fols[i]:null,c=party[i];
          if(e&&!e.dead&&e.mir&&typeof q[2]==='string'&&MV[q[2]]&&fo&&c&&c.h>0&&fo.visible){if(e.atk)mCancel(e);if(isFinite(q[4])&&isFinite(q[5])){e.m.position.x=q[4];e.m.position.z=q[5]}try{mStart(e,fo,q[2])}catch(_){}}}
        continue}
      keep.push(q)}
    if(mine)msg={...msg,data:{...d,l:keep}}}}catch(err){console.warn('v150 aggro ev',err)}
  return f.call(this,msg)}}
