// ================= v193: "The Blade" title screen (owner, Nov 3 2026) =================
// The owner picked this from the title-screen concept boards: a PS1/PS2-era title. The Warrior's tier V greatsword stands
// driven into a stone on a dark moor under a shaft of moonlight, ash and embers drifting, storm clouds crawling past the
// moon. Drawn live in its own small WebGL canvas at a low resolution (BT193.H rows) with 15-bit colour and an ordered
// dither, then scaled up with hard pixels, plus faint scanlines: the "PS1 crunch".
//   Over it: "Kill Quest" in Grenze Gotisch (silver, blue glow), a blinking PRESS START, then a plain text menu with a
//   sword cursor: Continue (last hero) / New Character (first free slot) / Choose Hero (2+ heroes) / Settings / Join a Friend.
//   Choose Hero (and New Character when all three slots are full) shows the v116 slot list (kqslRow, delete 🗑 twice) + Back.
//   Every button keeps its v116 data-aw / data-slot, so awTitleGo and all its wrappers (slots, join, intro, menu) are unchanged.
// Press Start is skipped under test automation (navigator.webdriver, unless window.KQ_PRESS) and when the title comes back
// from the in-game main menu (KQMENU.on). The scene stops drawing and frees its GPU objects when the title goes away.
// Music: MTH.title.score — a composed theme (lone cello over a drone, then choir, timpani and bells), see bt193Score.
// Not shared in co-op: the title is shown before a game or a room exists.
var BT193={H:200,view:'main',on:0,raf:0,press:0};
// Keys: the v73 window keydown handler (capture) owns the title: Enter / Space press the focused [data-aw] button through
// awTitleGo, the arrow keys move between [data-aw] buttons. So every item here is a [data-aw] button and the title's own
// modes (set / heroes / replace / back, and Press Start) are caught in the awTitleGo wrapper at the end of this file.
document.head.insertAdjacentHTML('beforeend',`<style>
#awT.bt193{background:#05070c;gap:0;justify-content:flex-start}
#awT.bt193 #awTc{display:none}
#bt193c{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none;opacity:0;transition:opacity 1.6s ease}
#bt193c.on{opacity:1}
#awT.bt193 .bt193v{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 80% at 50% 50%,rgba(5,7,12,0) 55%,rgba(5,7,12,.85) 100%),linear-gradient(20deg,rgba(5,7,12,.85) 0%,rgba(5,7,12,.4) 24%,rgba(5,7,12,0) 44%)}
#awT.bt193 .bt193s{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,0,0,.18) 3px,rgba(0,0,0,0) 4px)}
#awT.bt193 .awin{position:absolute;inset:0;display:block;padding:0;animation:none}
#awT.bt193 h1{position:absolute;left:0;right:0;top:max(4vh,18px);margin:0;padding:0 12px;text-align:center;font:900 clamp(3.2rem,11vw,8.6rem)/1 'Grenze Gotisch',Cinzel,Georgia,serif;letter-spacing:.01em;
 color:#e8eef8;background:none;-webkit-background-clip:border-box;background-clip:border-box;filter:none;animation:bt193Rise 2.2s cubic-bezier(.2,.7,.2,1) both;
 text-shadow:0 1px 0 #fff,0 .03em 0 #5a6a88,0 .05em 0 #2a3448,0 0 .25em rgba(140,170,255,.55),0 .1em .2em rgba(0,0,0,.9)}
@keyframes bt193Rise{from{opacity:0;transform:translateY(-10px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
#awT.bt193 .bt193p{position:absolute;left:0;right:0;bottom:11vh;text-align:center;font:700 clamp(.95rem,2.4vw,1.25rem)/1 Cinzel,Georgia,serif;letter-spacing:.32em;padding-left:.32em;color:#e8eef8;
 text-shadow:0 0 12px rgba(140,170,255,.9),0 2px 4px #000;animation:bt193Blink 1.3s steps(1,end) infinite}
@keyframes bt193Blink{0%,64%{opacity:1}65%,100%{opacity:0}}
#awT.bt193.menu .bt193p{display:none}
#awT.bt193 .awm{position:absolute;left:max(7vw,24px);bottom:max(9vh,34px);width:auto;max-width:min(430px,86vw);display:flex;flex-direction:column;gap:2px;opacity:0;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease;pointer-events:none}
#awT.bt193.menu .awm{opacity:1;transform:none;pointer-events:auto}
#awT.bt193 .awm button,body.kq #awT.bt193 .awm button{all:unset;box-sizing:border-box;position:relative;cursor:pointer;text-align:left;min-height:44px;padding:8px 8px 8px 46px;border:0;border-image:none;background:none;border-radius:0;
 font:600 clamp(1rem,2.1vw,1.3rem)/1.15 Cinzel,Georgia,serif;letter-spacing:.14em;color:#aab6ca;text-shadow:0 2px 4px #000;box-shadow:none;transition:color .12s}
#awT.bt193 .awm button small{display:block;margin-top:3px;font:400 .72rem/1.3 Inter,sans-serif;letter-spacing:.04em;color:#8a96aa;text-transform:none}
#awT.bt193 .awm button.bt193sm{font-size:clamp(.8rem,1.6vw,.95rem);min-height:36px;color:#8a96aa}
#awT.bt193 .awm button:hover,#awT.bt193 .awm button:focus-visible,#awT.bt193 .awm button:focus,body.kq #awT.bt193 .awm button:hover,body.kq #awT.bt193 .awm button:focus-visible{color:#fff;background:none;outline:none;box-shadow:none;text-shadow:0 0 12px rgba(140,170,255,.9),0 2px 4px #000}
#awT.bt193 .awm button::before{content:'';position:absolute;left:6px;top:50%;width:30px;height:14px;margin-top:-7px;opacity:0;transform:translateX(-6px);transition:opacity .12s,transform .12s;
 background:no-repeat center/contain url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 14'%3E%3Cpath d='M0 7 L20 5 L30 7 L20 9 Z' fill='%23e8eef8'/%3E%3Crect x='17' y='1' width='2.4' height='12' fill='%23c8a860'/%3E%3Crect x='0' y='6' width='5' height='2' fill='%235a4630'/%3E%3C/svg%3E")}
#awT.bt193 .awm button:hover::before,#awT.bt193 .awm button:focus::before{opacity:1;transform:none}
#awT.bt193 .awm .kqsl-h{font:600 .72rem Inter,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#8a96aa;text-align:left;margin:0 0 6px 46px}
#awT.bt193 .awm .kqsl-r{display:flex;gap:4px;align-items:center}
#awT.bt193 .awm .kqsl-r>button[data-aw]{flex:1;min-width:0}
#awT.bt193 .awm .kqsl-r .kqsl-d{flex:0 0 auto;width:44px;padding:0;text-align:center;font-size:.95rem}
#awT.bt193 .awm .kqsl-r .kqsl-d::before{display:none}
#awT.bt193 .awm .kqsl-r .kqsl-d.sure{color:#fecaca;font-size:.62rem;width:64px}
#awT.bt193 .awm button .kqsl-n{font:600 .64rem Inter,sans-serif;letter-spacing:.14em;color:#8a96aa;margin-right:8px}
#awT.bt193 .awm button.warn{color:#fecaca}
#awT.bt193 .bt193f{position:absolute;right:max(4vw,16px);bottom:max(4vh,14px);font:600 .7rem Cinzel,Georgia,serif;letter-spacing:.22em;color:#8a96aa}
#awT.bt193 .awh{display:none}
#awT.bt193 #setw{position:absolute;z-index:10}
@media (max-width:640px){#awT.bt193 .awm{left:16px;right:16px;bottom:max(7vh,24px)}#awT.bt193 .bt193p{bottom:14vh}}
</style>`);

// ---------- the scene ----------
function bt193Scene(cv){
  const V=THREE.Vector3,own=[];let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
  const keep=o=>{own.push(o);return o};
  const rd=new THREE.WebGLRenderer({canvas:cv,antialias:false,alpha:false,powerPreference:'low-power'});rd.setPixelRatio(1);
  const sc=new THREE.Scene();sc.fog=new THREE.FogExp2(0x0c1018,.05);
  const rock=c=>keep(new THREE.MeshStandardMaterial({color:c,roughness:.95,metalness:0,flatShading:true}));
  const ft=keep((()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})());
  // sky: night gradient, the moon, storm clouds drifting past it
  const skyU={tm:{value:0},sd:{value:new V(-.13,.42,-.98).normalize()}};
  const sky=new THREE.Mesh(keep(new THREE.SphereGeometry(400,32,16)),keep(new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:skyU,
    vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 vP;uniform vec3 sd;uniform float tm;
     float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
     float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
     float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
     void main(){vec3 d=normalize(vP);float y=d.y;vec3 c=mix(vec3(.1,.125,.19),vec3(.04,.055,.094),smoothstep(-.02,.25,y));c=mix(c,vec3(.008,.012,.024),smoothstep(.22,.8,y));
      float s=max(0.,dot(d,sd));c+=vec3(.5,.56,.72)*(pow(s,8.)*.5)+vec3(.85,.88,.95)*smoothstep(.9975,.9985,s);
      float st=step(.9985,hh(floor(d.xz/(max(.05,y)+.3)*90.)))*smoothstep(.15,.5,y);c+=vec3(.7)*st;
      vec2 q=d.xz/(max(.05,y)+.3)+vec2(tm*.012,tm*.004);float k=fb(q*1.3);c=mix(c,c*.32,smoothstep(.5,.75,k)*.85*smoothstep(.0,.15,y));
      gl_FragColor=vec4(c,1.);}`})));sc.add(sky);
  sc.add(new THREE.HemisphereLight(0x50607a,0x080808,.35));
  const beam=new THREE.SpotLight(0xdde8ff,2.6,40,.26,.7,1.2);beam.position.set(.6,16,-.4);beam.target.position.set(0,0,0);sc.add(beam,beam.target);
  const warm=new THREE.PointLight(0xff8a40,.7,6,2);warm.position.set(.8,.5,1.2);sc.add(warm);
  const rim=new THREE.DirectionalLight(0x6a80c0,.6);rim.position.set(-4,3,-6);sc.add(rim);
  // the moor
  const GG=keep(new THREE.PlaneGeometry(120,120,60,60));GG.rotateX(-Math.PI/2);{const P=GG.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),r=Math.hypot(x,z);P.setY(i,(Math.sin(x*.5)*Math.cos(z*.43)*.25+Math.sin(x*1.3+z)*.08)*Math.min(1,r/3)+Math.max(0,r-25)*.15)}GG.computeVertexNormals()}
  sc.add(new THREE.Mesh(GG,rock(0x20242a)));
  // the stone: a cluster of faceted rocks
  const st=rock(0x34363c);[[0,.22,0,.62],[.45,.14,.26,.38],[-.42,.12,-.16,.42],[.16,.08,-.5,.3],[-.26,.07,.44,.26]].forEach(([x,y,z,s],i)=>{const m=new THREE.Mesh(keep(new THREE.DodecahedronGeometry(s,0)),st);m.position.set(x,y,z);m.scale.y=.75;m.rotation.set(i,i*2,i*.5);sc.add(m)});
  // the sword (the game's own tier V warrior greatsword; the kit is cached by lgGroup, so it is never disposed here)
  try{const tp=ITPL.findIndex(q=>q.sl=='weapon'&&q.cls=='warrior'&&q.t==4&&!q.nw);if(tp>=0){const it={id:-1,tp,lv:50,req:1,r:4,up:0,aff:[]};
    const g=lgGroup('GL|'+tp+'|4|bt193',k=>v89Kit(k,it),.14);const w=new THREE.Group();g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);w.add(g);g.updateMatrixWorld(true);
    let B=new THREE.Box3().setFromObject(g);const S=B.getSize(new V());if(S.x>S.y&&S.x>S.z)g.rotation.z=Math.PI/2;else if(S.z>S.y)g.rotation.x=Math.PI/2;
    g.updateMatrixWorld(true);B=new THREE.Box3().setFromObject(w);const k=3.2/Math.max(.01,B.max.y-B.min.y);w.scale.setScalar(k);w.updateMatrixWorld(true);B=new THREE.Box3().setFromObject(w);
    const c=B.getCenter(new V());w.position.set(-c.x,-B.min.y-.25,-c.z);w.rotation.z=.07;w.rotation.y=.5;sc.add(w)}}catch(e){console.warn('v193 title sword',e)}
  // the shaft of light, dust in it, embers on the wind
  const shaft=new THREE.Mesh(keep(new THREE.CylinderGeometry(.35,1.4,16,24,1,true)),keep(new THREE.MeshBasicMaterial({color:0xb8c8ff,transparent:true,opacity:.035,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})));shaft.position.set(.3,8,-.2);shaft.rotation.z=.04;sc.add(shaft);
  const pts=(n,col,size,spread)=>{const g=keep(new THREE.BufferGeometry()),P=new Float32Array(n*3),S=new Float32Array(n*3);for(let i=0;i<n;i++){spread(P,i);S[i*3]=rnd();S[i*3+1]=.6+rnd()*.8;S[i*3+2]=rnd()*6.28}
    g.setAttribute('position',new THREE.BufferAttribute(P,3));const o=new THREE.Points(g,keep(new THREE.PointsMaterial({map:ft,color:col,size,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})));o.userData.s=S;o.frustumCulled=false;sc.add(o);return o};
  const dust=pts(220,0xdde6ff,.06,(P,i)=>{P[i*3]=(rnd()-.5)*2.4;P[i*3+1]=rnd()*6;P[i*3+2]=(rnd()-.5)*2.4});
  const emb=pts(140,0xff8a40,.07,(P,i)=>{const an=rnd()*6.28,r=2+rnd()*12;P[i*3]=Math.cos(an)*r;P[i*3+1]=rnd()*5;P[i*3+2]=Math.sin(an)*r});
  // broken spires on the horizon
  const sp=rock(0x0e1014);for(let i=0;i<14;i++){const an=-Math.PI/2+(rnd()-.5)*2.4,r=18+rnd()*20,h=3+rnd()*9;const m=new THREE.Mesh(keep(new THREE.ConeGeometry(.6+rnd()*1.4,h,5)),sp);m.position.set(Math.cos(an)*r,h/2-.5,Math.sin(an)*r);m.rotation.z=(rnd()-.5)*.3;sc.add(m)}
  const cam=new THREE.PerspectiveCamera(36,16/9,.05,900);
  // PS1 pass: draw into a small target, then quantise to 15-bit colour with a 4x4 ordered dither
  const rt=keep(new THREE.WebGLRenderTarget(4,4,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter}));
  const bay=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],bd=new Uint8Array(64);for(let i=0;i<16;i++){const v=Math.round(bay[i]/16*255);bd[i*4]=bd[i*4+1]=bd[i*4+2]=v;bd[i*4+3]=255}
  const bt=keep(new THREE.DataTexture(bd,4,4,THREE.RGBAFormat));bt.magFilter=bt.minFilter=THREE.NearestFilter;bt.wrapS=bt.wrapT=THREE.RepeatWrapping;bt.needsUpdate=true;
  const qU={tD:{value:rt.texture},tB:{value:bt},res:{value:new THREE.Vector2(4,4)}};
  const qs=new THREE.Scene(),qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  qs.add(new THREE.Mesh(keep(new THREE.PlaneGeometry(2,2)),keep(new THREE.ShaderMaterial({uniforms:qU,depthTest:false,depthWrite:false,
    vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:'uniform sampler2D tD,tB;uniform vec2 res;varying vec2 u;void main(){vec3 c=texture2D(tD,u).rgb;float b=texture2D(tB,gl_FragCoord.xy/4.).r;c+=(b-.47)/31.;c=floor(c*31.+.5)/31.;gl_FragColor=vec4(c,1.);}'}))));
  let W=0,H=0;const t0=performance.now();
  const size=()=>{const w=cv.clientWidth||innerWidth,h=Math.max(1,cv.clientHeight||innerHeight),L=BT193.H;const nw=w>=h?Math.round(L*w/h):L,nh=w>=h?L:Math.round(L*h/Math.max(1,w));if(nw!==W||nh!==H){W=nw;H=nh;rd.setSize(W,H,false);rt.setSize(W,H);qU.res.value.set(W,H);cam.aspect=W/H;cam.updateProjectionMatrix()}};
  const frame=(now)=>{size();const t=(now-t0)/1000,dt=1/60;skyU.tm.value=t;
    // camera: a slow push in over the first seconds, then a gentle sway; wider screens see a little more of the moor
    const push=1+.16*Math.exp(-t/3.5),sw=Math.sin(t*.07)*.35,wide=Math.min(1.25,Math.max(.85,cam.aspect/(16/9)));
    cam.fov=40*(cam.aspect<1?1.4:1);cam.updateProjectionMatrix();
    cam.position.set(2.8*push+sw*.4,.55+Math.sin(t*.05)*.06,5.4*push-sw*.2);cam.lookAt(-.05*(wide-1),1.9,0);
    shaft.material.opacity=.03+.008*Math.sin(t*.9)+.004*Math.sin(t*2.3);beam.intensity=2.5+.15*Math.sin(t*.9);warm.intensity=.6+.15*Math.sin(t*7.1)*Math.sin(t*3.3);
    const mv=(o,up,sway,top,reset)=>{const P=o.geometry.attributes.position,S=o.userData.s;for(let i=0;i<P.count;i++){let y=P.getY(i)+dt*up*S[i*3+1];if(y>top){y=0;reset(P,i)}P.setY(i,y);P.setX(i,P.getX(i)+Math.sin(t*.6+S[i*3+2])*dt*sway)}P.needsUpdate=true};
    mv(dust,.12,.05,6,(P,i)=>{P.setX(i,(rnd()-.5)*2.4);P.setZ(i,(rnd()-.5)*2.4)});
    mv(emb,.35,.25,5,(P,i)=>{const an=rnd()*6.28,r=2+rnd()*12;P.setX(i,Math.cos(an)*r);P.setZ(i,Math.sin(an)*r)});
    rd.setRenderTarget(rt);rd.render(sc,cam);rd.setRenderTarget(null);rd.render(qs,qc)};
  const dispose=()=>{try{own.forEach(o=>{try{o.dispose()}catch(_){}});rd.dispose();if(rd.forceContextLoss)rd.forceContextLoss()}catch(_){}};
  return {frame,dispose}}

function bt193Start(T){
  if(BT193.on)bt193Stop();
  const cv=document.createElement('canvas');cv.id='bt193c';T.insertBefore(cv,T.firstChild);
  let S=null;try{S=bt193Scene(cv)}catch(e){console.warn('v193 title scene',e);return}
  BT193.on=1;BT193.S=S;let first=1;
  const loop=now=>{if(!BT193.on)return;const t=$('awT');if(!t||!t.contains(cv)){bt193Stop();return}
    BT193.raf=requestAnimationFrame(loop);if(document.hidden)return;
    try{S.frame(now);if(first){first=0;cv.classList.add('on')}}catch(e){console.warn('v193 title frame',e);bt193Stop()}};
  BT193.raf=requestAnimationFrame(loop)}
function bt193Stop(){BT193.on=0;try{cancelAnimationFrame(BT193.raf)}catch(_){}if(BT193.S){BT193.S.dispose();BT193.S=null}}

// ---------- the title ----------
function bt193Press(){const T=$('awT');if(!T||T.classList.contains('menu'))return;BT193.press=0;
  try{audio()}catch(_){}try{mSfx('open',.9)}catch(_){}T.classList.add('menu');
  if(!matchMedia('(pointer:coarse)').matches)setTimeout(()=>{const b=T.querySelector('.awm button');if(b)b.focus()},60)}
awTitle=function(){
  const o=$('awT');if(o&&o.classList.contains('out'))o.remove();
  if(window.AW_NOTITLE||$('awT'))return;
  const T=document.createElement('div');T.id='awT';T.className='bt193';
  const touch=matchMedia('(pointer:coarse)').matches;
  T.innerHTML=`<canvas id="awTc"></canvas><div class="bt193v"></div><div class="bt193s"></div><div class="awin"><h1>Kill Quest</h1><div class="bt193p">${touch?'Tap to Start':'Press Start'}</div><div class="awm"></div></div><div class="bt193f">Kill Quest · 2026</div>`;
  document.body.appendChild(T);
  T.addEventListener('click',e=>{const b=e.target.closest('[data-aw]');
    if(!T.classList.contains('menu')){e.stopPropagation();bt193Press();return}
    if(!b||!T.contains(b))return;awTitleGo(b.dataset.aw,b)});
  BT193.view='main';
  const skip=(navigator.webdriver&&!window.KQ_PRESS)||(typeof KQMENU!='undefined'&&KQMENU.on);
  if(skip)T.classList.add('menu');else BT193.press=1;
  bt193Start(T);
  kqslRender();
  if(skip&&!touch)setTimeout(()=>{const b=T.querySelector('.awm [data-aw].p')||T.querySelector('.awm button');if(b)b.focus()},50);
};
function bt193Act(k){const T=$('awT');if(!T)return;
  if(k=='heroes'||k=='replace'){BT193.view='heroes';kqslRender();return}
  if(k=='back'){BT193.view='main';kqslRender();return}
  if(k=='set'){const w=$('setw');if(!w)return;
    // the settings window lives in #stage, under the title: lift it into the title while it is open, put it back on close
    if(!w.__bt193){w.__bt193={p:w.parentNode,n:w.nextSibling};const mo=new MutationObserver(()=>{if(w.classList.contains('hide')&&w.__bt193){const h=w.__bt193;w.__bt193=null;mo.disconnect();try{h.p.insertBefore(w,h.n&&h.n.parentNode===h.p?h.n:null)}catch(_){}
      const T2=$('awT');if(T2&&!T2.classList.contains('out')){const b=T2.querySelector('[data-aw=set]');if(b&&!matchMedia('(pointer:coarse)').matches)b.focus()}}});mo.observe(w,{attributes:true,attributeFilter:['class']});T.appendChild(w)}
    try{if(typeof syncSet=='function')syncSet()}catch(_){}try{openSet()}catch(_){}w.classList.remove('hide');return}}
function bt193View(v){BT193.view=v;kqslRender()}  // tests: bt193View('heroes') shows the v116 slot list
// the menu: main list, or the v116 slot list (Choose Hero)
kqslRender=function(){const T=$('awT');if(!T)return;const m=T.querySelector('.awm');if(!m)return;
  if(!T.classList.contains('bt193')){return}
  const inUse=typeof KQMENU!='undefined'&&KQMENU.on,S=[0,1,2].map(i=>kqSlotInfo(i)),filled=S.map((s,i)=>s?i:-1).filter(i=>i>=0),empty=S.map((s,i)=>s?-1:i).filter(i=>i>=0);
  if(BT193.view=='heroes'){
    m.innerHTML='<div class="kqsl-h">Choose your hero</div>'+[0,1,2].map(kqslRow).join('')+'<button class="bt193sm" data-aw="back">Back</button>';
  }else{
    const cur=filled.includes(KQSL.n)?KQSL.n:filled[0],h=[];
    if(cur!=null){const s=S[cur],C=CLS[s.hero.cls]||{n:''};h.push(`<button class="p" data-aw="cont" data-slot="${cur}">Continue<small>${kqslEsc(s.hero.name||'Hero')} · Lv ${s.hero.lvl|0} ${C.n}${inUse&&cur===KQSL.n?' · playing now':''}</small></button>`)}
    if(empty.length)h.push(`<button data-aw="new" data-slot="${empty[0]}">New Character</button>`);else h.push('<button data-aw="replace">New Character<small>All three slots are full: delete a hero to make room</small></button>');
    if(filled.length>1)h.push('<button data-aw="heroes">Choose Hero</button>');
    h.push('<button data-aw="set">Settings</button>','<button class="bt193sm" data-aw="join">Join a Friend</button>');
    m.innerHTML=h.join('')}
  if(!m.dataset.kqsl){m.dataset.kqsl=1;m.addEventListener('click',e=>{const b=e.target.closest('[data-sld]');if(!b)return;e.stopPropagation();const i=+b.dataset.sld;
    if(!b.classList.contains('sure')){b.classList.add('sure');b.textContent='Delete?';setTimeout(()=>{if(b.isConnected){b.classList.remove('sure');b.textContent='🗑'}},3000);return}
    try{localStorage.removeItem(KQSL.keys[i])}catch(_){}kqslRender()},true)}
  if(T.classList.contains('menu')&&!matchMedia('(pointer:coarse)').matches){const b=m.querySelector('[data-aw].p')||m.querySelector('[data-aw]');if(b&&!m.contains(document.activeElement))setTimeout(()=>b.focus(),60)}};
// a filled slot's New in the slot list asks before it replaces (v73 "Start over?" needs the button to be the one tapped)
{const f=awTitleGo;awTitleGo=function(mode,btn){const T=$('awT');
  // Press Start: the first Enter / Space / tap only opens the menu; the title's own items are handled here, before the slot / join / intro wrappers
  if(T&&T.classList.contains('bt193')&&!T.classList.contains('out')){if(!T.classList.contains('menu')){bt193Press();return}
    if(mode=='set'||mode=='heroes'||mode=='replace'||mode=='back'){try{mSfx('tick',.6)}catch(_){}bt193Act(mode);return}}
  if(T&&T.classList.contains('bt193')&&mode=='new'&&btn&&btn.isConnected&&btn.dataset.slot!=null){const sl=+btn.dataset.slot;
    if(kqSlotInfo(sl)&&!(typeof KQMENU!='undefined'&&KQMENU.on)){if(!btn.dataset.sure){btn.dataset.sure=1;btn.classList.add('warn');btn.innerHTML='Replace this hero?<small>Tap again: this slot\'s hero is deleted</small>';return}
      try{localStorage.removeItem(KQSL.keys[sl])}catch(_){}}}
  return f.apply(this,arguments)}}
// the title is already up when this file loads: rebuild it in the new style
try{const o=$('awT');if(o&&!o.classList.contains('out')&&!o.classList.contains('bt193')){o.remove();awTitle()}}catch(e){console.warn('v193 title',e)}

// ---------- the title theme ----------
// D minor, 60 bpm, 16 bars (64 s), looping. Bars 0-7: a lone cello over a low drone, a bell tolls. Bars 8-15: the choir comes in
// under the melody an octave up, timpani on the strong bars, a second bell. Notes are MIDI numbers; length in sixteenths.
function muCello(f,t,d,v){const a=MU.a,end=t+d+.8,g=a.createGain(),lp=a.createBiquadFilter();lp.type='lowpass';lp.Q.value=.7;
  lp.frequency.setValueAtTime(700,t);lp.frequency.linearRampToValueAtTime(1500,t+Math.min(.6,d*.5));lp.frequency.linearRampToValueAtTime(900,t+d);
  const o=muOsc('sawtooth',f,t,end),o2=muOsc('sawtooth',f,t,end,-6),og=a.createGain();og.gain.value=.5;o2.connect(og);og.connect(lp);o.connect(lp);
  if(d>.4){const l=muOsc('sine',5.2,t,end),lg=a.createGain();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.006,t+Math.min(d,.9));l.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency)}
  lp.connect(g);const at=Math.min(.35,d*.4);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);g.gain.setValueAtTime(v*.85,t+Math.max(at,d-.1));g.gain.exponentialRampToValueAtTime(.0001,t+d+.6);
  muNz(t,Math.min(d,1.2),'bandpass',2600,2200,1.5,v*.05,2,.15);muRoute(g,2)}
var BT193M={bars:16,
  cello:[[50,8],[53,4],[57,4],[55,8],[53,4],[52,4],[53,12],[50,4],[45,16],[46,8],[50,4],[53,4],[52,8],[49,8],[50,16],[45,16],
         [57,8],[60,4],[62,4],[58,8],[57,4],[55,4],[57,12],[53,4],[52,16],[53,8],[55,4],[57,4],[58,8],[57,4],[55,4],[57,8],[61,4],[64,4],[62,16]],
  ch:[[50,53,57],[48,52,55],[50,53,57],[49,52,57],[46,50,53],[49,52,57],[50,53,57],[49,52,57],[50,53,57],[46,50,55],[50,53,57],[49,52,57],[46,50,53],[46,50,55],[49,52,57],[50,53,57]],
  drone:[38,38,38,38,38,38,38,38,38,38,38,38,43,43,45,38],timp:{8:[0],11:[0],12:[0],14:[0,12,14],15:[0]},bell:{0:62,4:57,8:62,12:69}};
function bt193Score(t,bar,s){const M=BT193M,b=bar%M.bars,sp=.25;
  if(s==0){
    const ch=M.ch[b].map(muF);muPad(ch,t,sp*16,b<8?.014:.034,{cut:b<8?520:850,form:1});
    if(b>=8)muPad(ch.map(f=>f*2),t,sp*16,.03,{cut:1400,form:1});
    if(b%2==0||b>=12)muDrone(muF(M.drone[b]),t,sp*(b>=12?16:32),.1);
    if(M.bell[b]!=null)muBell(muF(M.bell[b]),t,.05)}
  const tp=M.timp[b];if(tp&&tp.includes(s))MUDR.taiko(t,s?.5:.9);
  // cello: walk the note list to find a note that starts on this step
  let at=0,i=0,target=b*16+s;for(;i<M.cello.length;i++){if(at===target)break;at+=M.cello[i][1];if(at>target){i=-1;break}}
  if(i>=0&&i<M.cello.length){const [n,l]=M.cello[i];muCello(muF(n),t,sp*l*.96,b<8?.16:.13);if(b>=8)muLead(muF(n+12),t,sp*l*.95,.035,{w:'sine',cut:1800,vib:1.2,at:.25,sub:0})}}
// v193b (owner, Nov 3 2026): the title plays "Ink and Candlelight" (the owner's pick from the music sketches) instead of the
// cello theme above (kept as bt193Score for later use). A minor, 66 bpm, 12 bars (~44 s) looping: four bars of harp arpeggios
// over a low viol, then a celesta melody, a soft flute doubling its second half; the last chord (E) leads back into the
// first (Am), where the melody's closing A lands on every loop after the first. BT193C holds the notes (MIDI, sixteenths).
function muCelesta(f,t,v){[[1,1,1.3],[4,.4,.25],[3,.15,.5],[2,.08,.9]].forEach(([m,k,d])=>{const o=muOsc('sine',f*m,t,t+d*3+.1),g=MU.a.createGain();muEnv(g,t,.002,v*k,0,d*2.4);o.connect(g);muRoute(g,2)})}
function muFlute(f,t,d,v){muLead(f,t,d,v,{w:'sine',cut:3200,vib:1,at:.08,sub:0});muLead(f*2,t,d,v*.22,{w:'sine',cut:4000,vib:1,at:.08,sub:0});muNz(t,Math.min(d,.6),'bandpass',f*1.6,f*1.4,2,v*.25,2,.05)}
var BT193C={bars:12,
  prog:['Am','F','G','Em','Am','F','G','Em','Am','F','Dm','E'],
  ch:{Am:[45,52,57,60,64],F:[41,48,53,57,60],G:[43,50,55,59,62],Em:[40,47,52,55,59],Dm:[38,45,50,53,57],E:[40,47,52,56,59]},
  arp:[0,2,3,4,3,2,1,2],viol:[45,41,43,40,45,41,43,40,45,41,38,40],
  mel:[[76,8],[72,4],[71,4],[69,12],[72,4],[71,4],[74,4],[79,8],[76,16],[81,8],[79,4],[76,4],[77,8],[76,4],[72,4],[74,4],[77,4],[76,4],[74,4],[71,8],[68,8]],melAt:4,fluteFrom:9};
{const C=BT193C;C.on={};let at=C.melAt*16;C.mel.forEach(([n,l],i)=>{C.on[at]=[n,l,i>=C.fluteFrom];at+=l})}
function bt193Score2(t,bar,s){const C=BT193C,b=bar%C.bars,sp=60/66/4,chd=C.ch[C.prog[b]];
  if(s%2==0){const k=C.arp[(s/2)|0];muPluck(muF(chd[k]),t,s==0?.2:.15,'triangle')}
  if(s==0)muCello(muF(C.viol[b]),t,sp*16,.13);
  const e=C.on[b*16+s];if(e){muCelesta(muF(e[0]),t,.17);if(e[2])muFlute(muF(e[0]),t,sp*e[1]*.95,.07)}
  if(b==0&&s==0&&bar>0)muCelesta(muF(69),t,.17)}  // the melody's last note, on the loop's first bar
MTH.title=Object.assign({},MTH.title,{bpm:66,score:bt193Score2});
{const f=muStep;muStep=function(t){if(MU.th&&MU.th.score){try{MU.th.score(t,MU.bar,MU.s)}catch(e){if(!MU.err193){MU.err193=1;console.warn('v193 score',e)}}return}return f.apply(this,arguments)}}
