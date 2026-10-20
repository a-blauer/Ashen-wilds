// ================= v93: natural idle animations for every character =================
// Standing still used to be a statue with one shared head sway (every wolf in a pack turned its head in lockstep).
// This file adds a layered idle on top of the existing animation, only while a model stands still and is not attacking:
//  - humanoids (hero, co-op heroes, humanoid foes, the two humanoid Sovereigns, town folk): breathing (chest and
//    shoulders), weight shifts between the feet with a hip sway (feet stay planted: the hips counter-rotate), head
//    glances, a small arm settle, and every 4–10 s a fidget: hero — roll shoulders, check weapon, adjust grip, look
//    over the shoulder (+ mage hand-glow flick, ranger bow check, warrior neck stretch); foes — menacing sway, weapon
//    tap, growl lean, look around; town folk — stretch, scratch head, shift weight, nod. The hero takes a combat-ready
//    stance (knees bent, weapon up, weight forward, no fidgets) while foes are close or hunting him; aggroed foes too.
//  - creatures (every SPEC rig through rigAnim): breathing, head turns and sniffs, tail sway and flicks, ear twitches,
//    and type-specific fidgets: quadrupeds sniff/look/shake/groom/yawn (companions also sit down for a while);
//    spiders shuffle a leg and twitch the mandibles; flyers bob with wing flutters; slimes wobble and squash;
//    floaters drift and slowly turn; serpents rear and look, flick the tongue, coil-sway. Ssith'ra (Centipede) keeps
//    its own v89 animation and is left alone.
//  - Sovereigns: slower and heavier; out of the fight an occasional roar, in the fight only breathing/head sway and a
//    snort (never anything that looks like a telegraph).
//  - mounts: weight shifts, head bob/look, a head toss, a hoof stamp and tail swishes.
// How it plugs in (later definitions win, every hook is a chain): rigAnim, animHero, humAnim and mkMountRig are wrapped.
// Each instance gets a constant random time offset for the inner animation (so the old shared idle terms are no longer
// in lockstep) and its own random rates/phases for this layer. The layer is additive with an "undo": it remembers what
// it added to each channel, so channels the base code sets every frame and channels nobody else touches both work
// without drifting. It is blended by a spring (eases in when the model settles, out when it walks or attacks) and is
// multiplied by (1 − the gait's moving blend), so walking/attacking override it without a pop. For the player, the
// v81 action system starts every action from the current pose, so the idle on those channels is dropped the moment
// an action starts (the action blends from where the body is) and eases back after it.
// Only models that are drawn and within IDL.dist of the camera run it (off-screen enemies were already skipped by the
// enemy loop). No per-frame allocations: state lives on the model (_idl), outputs go into reused objects.
// Nothing here changes gameplay: no positions, hit areas, timings or speeds — only bone rotations/offsets.
var IDL={pnow:()=>performance.now(),on:true,dist:34,fmin:4,fmax:10,prof:0,ms:0,n:0,force:null,combat:null,cbT:0,cbV:0,cnt:0};
var IDL_TAU=Math.PI*2;
function idlSS(a,b,x){const t=x<=a?0:x>=b?1:(x-a)/(b-a);return t*t*(3-2*t)}
function idlCl(x,a,b){return x<a?a:x>b?b:x}
// per-instance random numbers (Park–Miller), seeded once
function idlR(S){S.sd=S.sd*16807%2147483647;return (S.sd-1)/2147483646}
function idlRR(S,a,b){return a+(b-a)*idlR(S)}
// critically damped spring on slot i of a Float64Array (value at i, velocity at i+1)
function idlSp(A,i,target,T,dt){const om=2/Math.max(.01,T),x=om*dt,e=1/(1+x+.48*x*x+.235*x*x*x),c=A[i]-target,tmp=(A[i+1]+om*c)*dt;
  A[i+1]=(A[i+1]-om*tmp)*e;A[i]=target+(c+tmp)*e;return A[i]}
// one channel = (object, property). add: the base value is the current value, unless nobody wrote it since our last
// write, in which case our previous offset is taken back out first.
function idlCh(o,k){return o?{o:o,k:k,w:NaN,a:0}:null}
function idlAp(c,add){if(!c)return;const o=c.o,cur=o[c.k],b=cur===c.w?cur-c.a:cur,v=b+add;o[c.k]=v;c.w=v;c.a=add}
// fidget envelope: ease in over the first fi of the fidget, out over the last fo
function idlEnv(u,fi,fo){return u<fi?idlSS(0,fi,u):u>1-fo?1-idlSS(1-fo,1,u):1}
function idlNew(o,slow){const S={sd:((Math.random()*2147483646)|0)+1,t:0,on:0,iw:0,iwV:0,wX:0,wXV:0,cw:0,cwV:0,
  sp:new Float64Array(24),fT:0,fid:-1,fu:0,fd:1,fs:1,lT:0,ly:0,lp:0,lt:0,wT:0,wg:0,tT:0,tf:0,eT:0,ei:-1,fx:0,slow:slow||1,busy0:0};
  S.bf=idlRR(S,.2,.29)/S.slow;S.bp=idlRR(S,0,IDL_TAU);S.fT=idlRR(S,1.5,IDL.fmax);S.lT=idlRR(S,.5,2.5);S.wT=idlRR(S,0,3);S.tp=idlRR(S,0,IDL_TAU);S.tr=idlRR(S,.7,1.1);
  return S}
// is this model worth animating: drawn, and close to the camera (previews that are not in the scene always are)
function idlVis(g){if(!g.visible)return false;if(g.parent!==scene)return true;if(typeof cam=='undefined')return true;
  const p=g.position,c=cam.position,dx=p.x-c.x,dz=p.z-c.z;return dx*dx+dz*dz<IDL.dist*IDL.dist}
// pick the next fidget: list of [id, weight]; returns id
function idlPick(S,L){let s=0;for(let i=0;i<L.length;i+=2)s+=L[i+1];let r=idlR(S)*s;for(let i=0;i<L.length;i+=2){r-=L[i+1];if(r<=0)return L[i]}return L[0]}
// fidget scheduler: returns the envelope (0 when none); S.fid / S.fu (0..1) say which and where
function idlFid(S,dt,allow,list,dur){
  if(S.fid>=0){S.fu+=dt/S.fd;if(S.fu>=1||(!allow&&S.fu<.02)){S.fid=-1;S.fT=idlRR(S,IDL.fmin,IDL.fmax)*S.slow}}
  else if(allow){S.fT-=dt;const fo=IDL.force!=null&&list.indexOf(IDL.force)>=0;if(S.fT<=0||fo){const f=fo?IDL.force:idlPick(S,list);
    S.fid=f;S.fu=0;S.fd=(dur[f]||1.6)*(S.slow>1?1.25:1);S.fs=idlR(S)<.5?-1:1}}
  else if(S.fT<1.2)S.fT=1.2; // don't fire right after settling
  return S.fid>=0?1:0}

// =====================================================================================================
// humanoids (HB skeleton: hero, co-op heroes, humanoid foes, Sovereign humanoids, town folk)
