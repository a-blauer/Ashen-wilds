// ================= v219: arrival cinematics open over the land, and the Dirge's has no long dark pauses (owner, Nov 10 2026) =================
// Owner: "During the plains intro the beginning scene overlooks outside of the map" · "The opening to the dirge cinematic pans to
// outside the map and had long pauses of darkness" · "The cinematic references argus as 'thousand-eyed' when it should be
// 'hundred-eyed'" (the line itself is in 3800).
//  1. The opening shot (Hillside Crest 3810 and the four zones of 3860) rose from behind the hero and looked 55 tiles ahead along
//     the way the hero faced. A hero arrives at an instance's entrance near the map's edge, often facing out of it, so the camera
//     looked out past the edge over the empty border. Now the shot faces into the instance, along its road (cin218Into),
//     whatever way the hero faces, and rises a little less and looks down at the land CIN218.look tiles ahead (cin218Open).
//  2. The dark pauses: each cut of 3860 shows things that were hidden until then (set pieces, stand-ins, the den's Sovereign and
//     their lights). The first frame that draws them makes the browser build their shaders (and every shader again when the
//     number of lights in view changes), a stall of a second or more on a slow machine; the stall landed on the short dip to
//     black at the cut, so the screen sat black. Now every shot is drawn once while the cinematic sets up (cin218Warm, before the
//     clock and the music start; not under test automation unless window.KQ_WARM218), so the shaders exist before the cuts; the den's approach is also lit sooner (CIN218.den).
var CIN218={on:true,warm:true,den:1.2,ahead:40,rise:12,look:42};
// the way into the instance the hero stands in (radians, as pl.rotation.y), or null: along its road (~CIN218.ahead tiles on from the
// nearest point of the road: roads run through open land), else toward its middle
function cin218Into(H){try{const I=insAt(Math.round(H.x),Math.round(H.z));if(!I||I.w==null||I.x0==null)return null;let y0=null;
  const P=I.path;if(P&&P.length>4){let j=0,bd=1e9;P.forEach((q,n)=>{const d=Math.hypot(q[0]-H.x,q[1]-H.z);if(d<bd){bd=d;j=n}});
    for(let n=j+1;n<P.length;n++){const dx=P[n][0]-H.x,dz=P[n][1]-H.z;if(Math.hypot(dx,dz)>=CIN218.ahead){y0=Math.atan2(dx,dz);break}}}
  const cx=I.x0+I.w/2,cz=I.y0+I.h/2,yc=Math.hypot(cx-H.x,cz-H.z)<4?null:Math.atan2(cx-H.x,cz-H.z);if(y0==null)y0=yc;if(y0==null)return null;
  // of a few ways round the road's, the most open one: no high ground close in front (a cliff filling the view), never off the instance
  const h0=GH(H.x,H.z);let best=y0,bs=1e9;[0,.3,-.3,.6,-.6].map(d=>y0+d).concat(yc!=null?[yc]:[]).forEach((y,n)=>{let sc=n?3:0;
    for(let d=8;d<=CIN218.look+6;d+=4){const x=H.x+Math.sin(y)*d,z=H.z+Math.cos(y)*d,J=insAt(Math.round(x),Math.round(z));if(!J||J.g!==I.g){sc+=60;continue}
      sc+=Math.max(0,GH(x,z)-h0-2)*(1.4-d/(CIN218.look+10))}
    if(sc<bs){bs=sc;best=y}});return best}catch(_){return null}}
// the opening shot: up from behind the hero and over the land ahead, looking down at it (not out at the far horizon)
function cin218Open(S,k){const V=THREE.Vector3,Io=ic151Io,Sm=ic151Sm,K=ic151K,H=S.H,fw=new V(Math.sin(S.yaw),0,Math.cos(S.yaw)),sd=new V(fw.z,0,-fw.x),q=Io(K(k,.3,1));
  const p=H.clone().addScaledVector(fw,-3.1-.4*k+8*q).addScaledVector(sd,1.0-.5*q).add(new V(0,1.75+CIN218.rise*q,0));
  const a=H.clone().addScaledVector(fw,6).add(new V(0,1.3,0)),fx=H.x+fw.x*CIN218.look,fz=H.z+fw.z*CIN218.look,b=new V(fx,GH(fx,fz)+2,fz);
  return {p,l:a.lerp(b,Sm(K(k,.25,1))),fov:46+6*q,F:H}}
{const f=hc208Cam;hc208Cam=function(S,i,k,t){if(CIN218.on&&i===0&&S&&S.H)try{return cin218Open(S,k)}catch(_){}return f.apply(this,arguments)}}
{const f=zc214Cam;zc214Cam=function(S,i,k,t){if(CIN218.on&&i===0&&S&&S.H)try{return cin218Open(S,k)}catch(_){}return f.apply(this,arguments)}}
{const f=hc208Build;hc208Build=function(){const S=f.apply(this,arguments);try{if(CIN218.on&&S&&S.H){const y=cin218Into(S.H);if(y!=null)S.yaw=y}}catch(_){}return S}}
{const f=zc214Build;zc214Build=function(z){const S=f.apply(this,arguments);try{if(CIN218.on&&S&&S.H){const y=cin218Into(S.H);if(y!=null)S.yaw=y}}catch(_){}
  try{if(CIN218.warm&&!CIN218.cap&&!(navigator.webdriver&&!window.KQ_WARM218))cin218Warm(S)}catch(e){console.warn('v219 warm',e)}return S}}
{const f=zc214Cap;zc214Cap=function(){CIN218.cap=1;try{return f.apply(this,arguments)}finally{CIN218.cap=0}}}
// draw the middle of every shot once (nothing on screen yet: the page still shows the game's last frame), then back to t = 0
function cin218Warm(S){const T=ZC214.T,ts=[];for(let i=0;i<T.length;i++)ts.push(i<T.length-1?(T[i]+T[i+1])/2:ZC214.rise[1]+.2);
  const c0={p:cam.position.clone(),q:cam.quaternion.clone(),fov:cam.fov},ev=S.ev;S.ev={h0:1,sp:1,ro:1};const T0=performance.now();
  try{ts.forEach(t=>{try{zc214Frame(S,t);if(typeof ren!='undefined'){ren.compile(scene,cam);ren.render(scene,cam)}}catch(e){console.warn('v219 warm shot',t,e)}})}
  finally{S.ev=ev;S.lt=null;S.si=-1;try{zc214Frame(S,0)}catch(_){}S.lt=null;S.si=-1;cam.position.copy(c0.p);cam.quaternion.copy(c0.q);cam.fov=c0.fov;cam.updateProjectionMatrix()}
  CIN218.ms=Math.round(performance.now()-T0)}
// the den: its key light came up over the whole approach (27.0 → 30.1 s), so the first seconds of the shot were near black; now it
// is up within CIN218.den seconds of the cut
{const f=zc214Frame;zc214Frame=function(S,t){const r=f.apply(this,arguments);try{const T5=ZC214.T[5];if(CIN218.on&&S&&S.lgt&&t>=T5&&t<ZC214.cut){const d=S.Z.den;
    if(d)S.lgt.intensity=Math.max(S.lgt.intensity,d[1]*ic151Sm(ic151K(t,T5,T5+CIN218.den)))}}catch(_){}return r}}
