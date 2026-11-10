// ================= v212: no more white-outs from a broken number (owner, Nov 9 2026) =================
// Owner: "I just got a glitch where my screen filled with light. Find the cause and fix" (Kindlelight I, in a fight, throwing knives).
// The cause: one NaN ("not a number") anywhere in what is drawn. The glow pass (POST, 0060) takes the bright parts of the frame and
// blurs them four times over the screen, so a single NaN pixel spread to every pixel and the whole view went white (the vignette
// and the HUD still on top). The way it was reproduced: the hero's physical attack (HS().pa) became NaN (a weapon with no item
// level: itStats multiplies by it.lv), every knife then did NaN damage, the struck enemy's health became NaN and its health bar's
// width (fill.scale.x = health / max) became NaN.
// The fixes, from the screen back to the cause:
//  1. the glow and the final picture skip NaN / infinite pixels (0060's bright pass and composite): whatever goes wrong, the screen
//     no longer whites out
//  2. health bars: a NaN health is put back to full and the bar's width is clamped (0104's bar update, 0920's Argus bars)
//  3. damage: a NaN or infinite hit does nothing (hurt), so an enemy's health can't become NaN
//  4. the hero's stats: any NaN / infinite stat counts as 0 (HS), and an item without a level uses its required level (itStats)
//  5. the camera: a NaN camera (every pixel NaN: the whole screen white on the owner's GPU) is put back before the frame is drawn
// (A single NaN pixel only blurs into a small square; the full white-out needs NaN nearly everywhere, which is what a NaN camera
// gives. Headless test browsers show NaN as black or skip it, so the tests check the numbers and the guards, not white pixels.)
// Each guard notes the first time it catches something in the console ("v212 guard: …") so a future case can be traced.
var NG212={seen:{}};
function ng212Note(k,info){if(NG212.seen[k])return;NG212.seen[k]=1;try{console.warn('v212 guard: '+k,info||'')}catch(_){}}
// 3. damage
{const f=hurt;hurt=function(e,d){if(typeof d=='number'&&!isFinite(d)){ng212Note('hurt',e&&e.c&&e.c.n);const a=[].slice.call(arguments);a[1]=0;return f.apply(this,a)}return f.apply(this,arguments)}}
// 4. the hero's stats
{const f=itStats;itStats=function(it){if(it&&typeof it=='object'&&!(it.lv>0)){ng212Note('item level',it.tp);return f.call(this,Object.assign({},it,{lv:Math.max(1,it.req|0)}))}return f.apply(this,arguments)}}
{const f=HS;HS=function(){const s=f.apply(this,arguments);if(s&&typeof s=='object'&&!s._ng212){s._ng212=1;for(const k in s){const v=s[k];if(typeof v=='number'&&!isFinite(v)){ng212Note('stat '+k);s[k]=0}}}return s}}
// 5. the camera: a NaN anywhere in its position or turn makes every pixel NaN (only the sky's shader still runs, and it draws NaN),
//    which a GPU shows as a white screen. Before each frame a broken camera is put back to its last good place and the game camera
//    snaps behind the hero again.
var NG212C={p:new THREE.Vector3(),q:new THREE.Quaternion(),ok:false,n:0};
function ng212Fin(v){return isFinite(v.x)&&isFinite(v.y)&&isFinite(v.z)&&(v.w==null||isFinite(v.w))}
{const f=POST.render;POST.render=function(){try{
  if(!ng212Fin(cam.position)||!ng212Fin(cam.quaternion)||!isFinite(cam.fov)){NG212C.n++;ng212Note('camera',[cam.position.x,cam.position.y,cam.position.z].join(','));
    ng212CamState();
    if(NG212C.ok){cam.position.copy(NG212C.p);cam.quaternion.copy(NG212C.q)}else{cam.position.set(pl.position.x,pl.position.y+6,pl.position.z+8);cam.lookAt(pl.position)}
    if(!isFinite(cam.fov))cam.fov=58;try{if(ng212Fin(pl.position)&&!IC151.on&&typeof snapCam=='function')snapCam()}catch(_){}
    if(!ng212Fin(cam.position)){cam.position.set(pl.position.x,pl.position.y+6,pl.position.z+8);cam.lookAt(pl.position)}cam.updateProjectionMatrix();cam.updateMatrixWorld(true)}
  else{NG212C.p.copy(cam.position);NG212C.q.copy(cam.quaternion);NG212C.ok=true}}catch(_){}
  return f.apply(this,arguments)}}
// the camera's own blended settings: one NaN in any of them stays NaN for good (each frame blends from the last), so they are
// repaired too, before every frame (cheap: a few number checks)
function ng212CamState(){let n=0;
  try{if(!isFinite(camYaw)){camYaw=pl.rotation.y+Math.PI;n++}if(!isFinite(camPitch)){camPitch=.3;n++}if(!isFinite(camDist)||camDist<=0){camDist=9.5;n++}if(!isFinite(camK)){camK=camPitch;n++}}catch(_){}
  try{if(camDD!=null&&!isFinite(camDD)){camDD=null;n++}}catch(_){}
  try{if(typeof look!='undefined'&&look&&!ng212Fin(look)){look.set(pl.position.x,pl.position.y+1,pl.position.z);n++}}catch(_){}
  try{if(!isFinite(shk)){shk=0;n++}}catch(_){}
  if(n)ng212Note('camera settings',n);return n}
{const f=POST.render;POST.render=function(){try{ng212CamState()}catch(_){}return f.apply(this,arguments)}}
// the frame clock: a frame called without a time (or after one) would make every blend NaN
{const f=loop;loop=function(now){if(typeof now!='number'||!isFinite(now))now=performance.now();try{if(typeof last=='number'&&!isFinite(last))last=now}catch(_){}return f.call(this,now)}}
