// ================= v232 the ending cinematics' engine (names ec232*) =================
// A small player for the two endings (4070 "the land breathes", 4071 "the crown"), built like the zone cinematics (3860): the
// main loop waits (IC151.on), every frame is a pure function of t (ec232Seek), so tests draw it frame by frame (ec232Cap).
// A plan (ec232Reg(key, plan)):
//   len, cut (the game is handed back here, under black), skipT, dips [[t, half-width]] (short dips to black on the cuts),
//   lines [{a, b, s}] (subtitles), title {a, b, h, s} (a big card), build(S), frame(S, t, dt, now) → {p, l, fov, F (the spot whose
//   land is drawn), set (true: the plan shows its own set, no land), grade (css filter)}, after(S, t, c) (after the sky settles:
//   fog, light), score(ac, out, T0, S), back(S) (put everything back).
// ec232Play(key, {then, rp}): then() runs when the game is handed back (not on a replay: rp); a replay puts the hero back
// where they stood. Skip: the button, Esc, Enter or Space. Local: a co-op partner sees the hero stand still meanwhile.
var EC232={run:false,S:null,P:{},err:'',noDraw:0};
function ec232Reg(key,plan){plan.key=key;EC232.P[key]=plan}
function ec232Css(){if(document.getElementById('ec232css'))return;try{ic151Css();ic151DCss()}catch(_){}const s=document.createElement('style');s.id='ec232css';s.textContent=
  '#ec232{position:fixed;inset:0;z-index:2147483000;overflow:hidden;cursor:none;user-select:none;pointer-events:auto;background:transparent}'+
  '#ec232 .lb{position:absolute;left:0;right:0;height:11vh;background:#000;z-index:3;pointer-events:none}#ec232 .lb.t{top:0}#ec232 .lb.b{bottom:0}'+
  '#ec232 .fk{position:absolute;inset:0;background:#000;z-index:4;pointer-events:none}'+
  '#ec232 .sub{position:absolute;left:6%;right:6%;bottom:16vh;text-align:center;z-index:5;pointer-events:none;font-family:"IM Fell English SC","Cinzel Decorative",Georgia,serif;font-size:clamp(18px,2.8vw,40px);letter-spacing:.05em;color:#fff;line-height:1.2;text-shadow:0 0 4px rgba(0,0,0,.95),0 0 16px rgba(0,0,0,.8)}'+
  '#ec232 .ttl{position:absolute;left:0;right:0;top:36%;text-align:center;z-index:5;pointer-events:none;color:#fff;font-family:"Cinzel Decorative",Cinzel,Georgia,serif;text-shadow:0 0 6px rgba(0,0,0,.9),0 0 30px rgba(0,0,0,.7)}'+
  '#ec232 .ttl b{display:block;font-size:clamp(34px,7vw,96px);letter-spacing:.14em;font-weight:700}#ec232 .ttl i{display:block;font-style:normal;font-size:clamp(14px,1.8vw,26px);letter-spacing:.3em;margin-top:.6em;opacity:.9}'+
  '#ec232 .skip{position:absolute;right:22px;bottom:calc(11vh + 14px);z-index:6;cursor:pointer;background:rgba(10,8,16,.45);color:#e8e0d0;border:1px solid rgba(232,224,208,.35);border-radius:4px;font:600 13px/1 "Cinzel Decorative",Georgia,serif;letter-spacing:.08em;padding:8px 14px;opacity:.7}'+
  '#ec232 .skip:hover{opacity:1;background:rgba(30,24,40,.7)}';document.head.appendChild(s)}
function ec232Layer(S){ec232Css();const el=document.createElement('div');el.id='ec232';
  el.innerHTML='<div class="lb t"></div><div class="lb b"></div><div class="sub"></div><div class="ttl"><b></b><i></i></div><div class="fk"></div><button class="skip">Skip ›</button>';
  document.body.appendChild(el);S.dom={el,lt:el.querySelector('.lb.t'),lb:el.querySelector('.lb.b'),sub:el.querySelector('.sub'),ttl:el.querySelector('.ttl'),fk:el.querySelector('.fk'),skip:el.querySelector('.skip'),cur:null}}
function ec232Dom(S,t){const D=S.dom,P=S.P;if(!D)return;const K=ic151K,Sm=ic151Sm,C=P.cut;
  const lb=(11*(1-Sm(K(t,C+.5,P.len-.3))))+'vh';D.lt.style.height=lb;D.lb.style.height=lb;
  let fk=t<C?1-K(t,0,1.4):1-K(t,C+.3,P.len-.2);if(t<C){(P.dips||[]).forEach(([a,w])=>{fk=Math.max(fk,K(t,a-w,a)*(1-K(t,a,a+w*1.4)))});fk=Math.max(fk,K(t,C-1.2,C))}
  D.fk.style.opacity=fk.toFixed(3);D.fk.style.background=P.fade||'#000';
  const L=(P.lines||[]).find(x=>t>=x.a&&t<x.b+.7);if(L!==D.cur){D.cur=L;D.sub.textContent=L?L.s:''}
  if(L)D.sub.style.opacity=(Sm(K(t,L.a,L.a+.7))*(1-Sm(K(t,L.b,L.b+.7)))).toFixed(3);
  const T=P.title;if(T){const o=Sm(K(t,T.a,T.a+1.4))*(1-Sm(K(t,T.b-1,T.b)));D.ttl.style.opacity=o.toFixed(3);if(!D.tt){D.tt=1;if(T.top)D.ttl.style.top=T.top;D.ttl.firstChild.textContent=T.h;D.ttl.lastChild.textContent=T.s||''}D.ttl.style.letterSpacing=(.02*K(t,T.a,T.b))+'em'}else D.ttl.style.opacity=0;
  D.skip.style.visibility=t<P.skipT?'':'hidden'}
function ec232Frame(S,t){const P=S.P,now=3e6+t*1000,dt=Math.max(0,Math.min(.1,S.lt==null?0:t-S.lt));S.lt=t;
  const c=P.frame(S,t,dt,now);if(!c)return;
  if(!c.set)c.p.y=Math.max(c.p.y,GH(c.p.x,c.p.z)+.5);
  cam.position.copy(c.p);cam.up.set(0,1,0);cam.lookAt(c.l);cam.fov=c.fov||50;cam.updateProjectionMatrix();if(typeof look!='undefined')look.copy(c.l);
  const F=c.F||c.l;hc208Focus(F,()=>{if(!c.set)try{chunkVis()}catch(_){}
    try{if(S.si!==c.i){for(let n=0;n<40;n++)atmos(.05,now)}else atmos(dt,now)}catch(_){}
    try{townLights(F)}catch(_){}});
  S.si=c.i;try{WIND.t.value=now/1000}catch(_){}try{torch.position.set(F.x,(c.set?F.y:GH(F.x,F.z))+2.4,F.z+.3)}catch(_){}
  try{FADE.cam.value.copy(cam.position);FADE.pl.value.copy(cam.position)}catch(_){}
  if(P.after)try{P.after(S,t,c)}catch(e){if(!S.ae){S.ae=1;console.warn('ec232 after',e)}}
  try{const cv=ren.domElement,g=c.grade||'';if(cv.style.filter!==g){cv.style.transition='none';cv.style.filter=g}}catch(_){}
  try{fxStep(dt)}catch(_){}
  if(!EC232.noDraw)try{POST.render()}catch(e){if(!S.re){S.re=1;console.warn('ec232 draw',e)}}}
function ec232Build(key,o){const P=EC232.P[key];if(!P)throw new Error('no plan '+key);const S={P,o:o||{},t:0,lt:null,si:-1,ev:{},vm:new Map(),own:[]};
  S.save={p:pl.position.clone(),ry:pl.rotation.y,vis:pl.visible,yaw:typeof camYaw!='undefined'?camYaw:0,fov:cam.fov,near:cam.near,far:cam.far,tod:typeof TOD!='undefined'?TOD:0};P.build(S);return S}
// remember how a thing was shown before the cinematic touched it
function ec232Vis(S,o,on){if(!o)return;if(!S.vm.has(o))S.vm.set(o,o.visible);o.visible=!!on}
// a thing the cinematic made itself: removed and freed when it ends
function ec232Own(S,o,parent){(parent||scene).add(o);S.own.push(o);return o}
function ec232Play(key,o){if(EC232.run)return false;try{if(typeof IC151!='undefined'&&(IC151.run||IC151.on))return false}catch(_){}let S;try{S=ec232Build(key,o)}catch(e){console.warn('ec232 build',e);EC232.err=String(e&&e.stack||e);return false}
  EC232.S=S;EC232.run=true;IC151.on=true;document.body.classList.add('ic151d');ec232Layer(S);
  const L=S.live={t0:performance.now(),off:0,raf:0,ac:null};
  try{const AC=window.AudioContext||window.webkitAudioContext,ac=L.ac=new AC(),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9*Math.max(.15,Math.min(1,typeof SET!='undefined'&&SET.sfxV!=null?+SET.sfxV*1.4:1));out.connect(cp);cp.connect(ac.destination);L.out=out;if(ac.resume)ac.resume();if(S.P.score)S.P.score(ac,out,ac.currentTime+.05,S)}catch(e){console.warn('ec232 sound',e)}
  try{if(typeof MU!='undefined'&&MU.g&&MU.a){L.mu=1;MU.g.gain.setTargetAtTime(0,MU.a.currentTime,.1)}}catch(_){}
  const onKey=e=>{if(!EC232.run)return;e.stopImmediatePropagation();e.preventDefault();if(e.type=='keydown'&&/^(Escape|Enter| |Spacebar)$/.test(e.key))ec232Skip()};L.onKey=onKey;
  addEventListener('keydown',onKey,true);addEventListener('keyup',onKey,true);S.dom.skip.onclick=e=>{e.stopPropagation();ec232Skip()};
  S.dom.el.addEventListener('mousemove',()=>{S.dom.el.style.cursor='default';clearTimeout(L.cur);L.cur=setTimeout(()=>{if(S.dom)S.dom.el.style.cursor=''},1500)});
  const tick=now=>{if(!EC232.run)return;L.raf=requestAnimationFrame(tick);ec232Seek(Math.max(L.off,(now-L.t0)/1000+L.off));
    try{if(MP&&MP.on&&party.length&&now-(L.pt||0)>500){L.pt=now;mpPresence(now)}}catch(_){}};
  L.raf=requestAnimationFrame(tick);return true}
function ec232Seek(t){const S=EC232.S;if(!S)return;S.t=t;const P=S.P;
  if(t<P.cut){IC151.on=true;try{ec232Frame(S,t)}catch(e){console.warn('ec232 frame',e);EC232.err=String(e&&e.stack||e);if(S.live)S.live.off+=P.cut-t;t=P.cut}}
  if(t>=P.cut&&!S.back)ec232Back(S);
  ec232Dom(S,t);if(t>=P.len)ec232End()}
function ec232Skip(){const S=EC232.S,L=S&&S.live;if(!L)return;const t=(performance.now()-L.t0)/1000+L.off;if(t>=S.P.skipT)return;L.off+=S.P.skipT-t;
  try{if(L.out){L.out.gain.cancelScheduledValues(L.ac.currentTime);L.out.gain.setTargetAtTime(0,L.ac.currentTime,.12)}}catch(_){}}
function ec232Back(S){if(S.back)return;S.back=1;const sv=S.save;
  try{S.P.back&&S.P.back(S)}catch(e){console.warn('ec232 plan back',e)}
  try{S.own.forEach(o=>{if(o.parent)o.parent.remove(o);o.traverse(q=>{if(q.geometry&&!(q.geometry.userData&&(q.geometry.userData.lps||q.geometry.userData.keep)))q.geometry.dispose();const m=q.material;if(m&&!(m.userData&&m.userData.keep)){if(m.map&&!(m.map.userData&&m.map.userData.keep)&&m.map!==(typeof SPR!='undefined'?SPR:null))m.map.dispose();m.dispose()}})});S.own=[]}catch(e){console.warn('ec232 free',e)}
  try{S.vm.forEach((v,o)=>{o.visible=v});S.vm.clear()}catch(_){}
  try{ren.domElement.style.filter=''}catch(_){}try{if(typeof TOD!='undefined')TOD=sv.tod}catch(_){}
  try{pl.visible=sv.vis;pl.position.copy(sv.p);pl.rotation.y=sv.ry;if(typeof camYaw!='undefined')camYaw=sv.yaw}catch(_){}
  if(!S.o.rp&&S.o.then)try{S.o.then()}catch(e){console.warn('ec232 then',e)}
  try{document.body.classList.remove('ic151d');cam.fov=sv.fov||58;cam.near=sv.near||.1;cam.far=sv.far||260;cam.up.set(0,1,0);cam.updateProjectionMatrix();snapCam();chunkVis();for(let n=0;n<40;n++)atmos(.05,performance.now())}catch(e){console.warn('ec232 back',e)}
  IC151.on=false;try{if(S.live&&S.live.mu&&typeof muVol=='function')muVol()}catch(_){}try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}}
function ec232End(){if(!EC232.run)return;const S=EC232.S,L=S&&S.live;EC232.run=false;
  try{if(S&&!S.back)ec232Back(S)}catch(_){}
  try{if(L){cancelAnimationFrame(L.raf);removeEventListener('keydown',L.onKey,true);removeEventListener('keyup',L.onKey,true);clearTimeout(L.cur);
    if(L.ac){const ac=L.ac;try{L.out.gain.setTargetAtTime(0,ac.currentTime,.3)}catch(_){}setTimeout(()=>{try{ac.close()}catch(_){}},1500)}}}catch(_){}
  try{if(S&&S.dom)S.dom.el.remove()}catch(_){}EC232.S=null}
// capture mode for tests and stills: build, no sound, no clock; then ec232Seek(t) per frame, ec232End() when done
function ec232Cap(key,o){if(EC232.run)return null;const S=ec232Build(key,Object.assign({rp:1},o||{}));EC232.S=S;EC232.run=true;IC151.on=true;document.body.classList.add('ic151d');ec232Layer(S);S.dom.skip.style.display='none';return {len:S.P.len,cut:S.P.cut}}
// ---------------- sound helpers: a slow pad, a bell, a breath of noise ----------------
function ec232Pad(ac,out,t,dur,freqs,vol,type,at,dec){freqs.forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.value=f;o.detune.value=(i%2?5:-5);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol/freqs.length,t+(at||dur*.4));g.gain.setValueAtTime(vol/freqs.length,t+dur-(dec||dur*.35));g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.1)})}
function ec232Bell(ac,out,t,f,vol,len){[1,2.01,2.99,4.2].forEach((h,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f*h;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol/(1+i*1.6),t+.012);g.gain.exponentialRampToValueAtTime(.0008,t+(len||3)/(1+i*.5));o.connect(g);g.connect(out);o.start(t);o.stop(t+(len||3)+.1)})}
function ec232Air(ac,out,t,dur,f0,f1,vol){const n=ac.sampleRate*2,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;s.loop=true;fl.type='bandpass';fl.Q.value=.8;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+dur*.45);g.gain.linearRampToValueAtTime(0,t+dur);s.connect(fl);fl.connect(g);g.connect(out);s.start(t);s.stop(t+dur+.1)}
// ---------------- the Cinematics list (Settings → Cheats) ----------------
(function(){if(typeof CV215=='undefined')return;
  CV215.L.push({z:'ec232a',n:'The Land Breathes',s:'The ending against him · the essence returns to the ground'},{z:'ec232b',n:'The Crown',s:'The ending at his side · the gilded palace'});
  {const f=cv215Seen;cv215Seen=function(z){if(z==='ec232a')return !!FN232.won;if(z==='ec232b')return !!FN232.crown;return f.apply(this,arguments)}}
  {const f=cv215Play;cv215Play=function(z){if(z!=='ec232a'&&z!=='ec232b')return f.apply(this,arguments);const why=cv215Why();if(why){try{say('🎬 '+why)}catch(_){}return false}return ec232Play(z==='ec232a'?'breath':'crown',{rp:1})}}
  {const f=cv215Busy;cv215Busy=function(){return EC232.run||f.apply(this,arguments)}}})();
