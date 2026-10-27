// ================= v143 The Lantern Road — Kindlelight I main quest =================
// The first chapter of Kindlelight's main quest line (a chapter per field instance; II and III come later). In Kindlelight I the
// gateway to II is dormant. The Lantern Wardens (3021) hold an outpost near the entrance (3020 plan) with the Portal Ripper (3022),
// a machine that can tear the gateway open, but it will not roll through the dark: lampposts line the whole road from the outpost
// to the gateway (v159: 34 along the smoothed lantern line, one glowbulb each; v151 had ~47 on the raw zigzag road; v143 had 8 at 3 each near the gateway). Glowbulbs are a quest item (no other use)
// that every Kindlelight I creature drops on top of its normal loot (MQ143.drop chance per kill, 100% since v151, only while more are needed: lamps still dark × MQ143.per
// − carried − lying on the ground).
// State MQ143.st: 0 not met · 1 met the captain · 2 the Ripper is rolling · 3 done (the gateway is open). Done also counts when
// instance II has been reached (old saves, cheats, a cleared zone): mq143Done(). Saved as x2.mq143 {v, st, b (bulbs), lit[one per lamp], seen}; saves before v151
// (8 lamps at 3 bulbs) and saves before v159 (~47 lamps at 1 bulb) get their bulbs back for lamps they had lit (the lamps stand
// elsewhere now) and start the new road dark.
//  * F at an unlit lamppost with a bulb lights it (any state; the captain explains the quest). The last lamp starts the roll:
//    the Ripper rolls the road (furnace lit, chimney smoking, two wardens escorting it), parks beside the gateway, drops its
//    jacks, opens its claws, charges its coil and tears the gateway open (arcs, a flash): st 3. Leaving the instance mid-way
//    finishes it at once; a save made mid-roll loads as done.
//  * The gateway's F prompt is locked until then (0510 portalPrompt wrapper); insGo itself is not gated (tests, co-op joins).
//  * Tracker #mqt143 above Cheddar's (only in Kindlelight I), the captain's window XR.mq143, minimap / N map marks (lamps,
//    the Ripper, the captain with "!"), the bulbs in the bag's Materials tab (Quest items), the glowbulb icon (KQI.glowbulb, 🪔).
// Co-op: local to each player like Cheddar's quests (each player lights their own road; a partner's kill near you drops a bulb
// for you too, as loot does). The scene is built the first time you are in Kindlelight I.
var MQ143={st:0,b:0,lit:[],seen:0,per:1,drop:1,speed:3,S:null,trkK:'',t:0,roll:null,fire:null,err:0,
  name:'The Lantern Road',cap:'Warden-Captain Harrow'};
// v151: per 3 → 1 (a bulb a lamp, ~47 lamps); drop .55 → 1 (every kill drops one, on top of its normal loot, until enough are carried); speed 1.9 → 3 tiles/s (the roll now covers the whole ~330-tile road, ~2 minutes)
function mq143N(){return mq143Plan().lamps.length}
try{MQ143.lit=new Array(mq143N()).fill(0)}catch(e){console.warn('v151 lamps',e)}
function mq143Lit(){return MQ143.lit.reduce((a,b)=>a+(b?1:0),0)}
function mq143Done(){return MQ143.st>=3||insReach(0)>=1}
function mq143Here(){try{const I=curIns();return !!I&&I.g===0}catch(_){return false}}
function mq143Next(){try{const t=typeof TH112!='undefined'&&TH112&&TH112.byG&&TH112.byG[1];return t&&t.nm?t.nm:PMAP[0].ins[1].n}catch(_){return 'the next reach'}}
function mq143Pend(){let n=0;try{drops.forEach(d=>{if(d.kind=='mq143')n+=d.data.n|0})}catch(_){}return n}
function mq143Need(){if(mq143Done()||MQ143.st>=2)return 0;return Math.max(0,(mq143N()-mq143Lit())*MQ143.per-MQ143.b-mq143Pend())}

// ---------------- the glowbulb: icon, drop, pickup, the bag ----------------
try{KQI.glowbulb=['slime','M16 6.2c5.4 0 9 4.6 9 10.4 0 6-4 10.6-9 10.6s-9-4.6-9-10.6C7 10.8 10.6 6.2 16 6.2Z','-M16 10.4c3 0 5 2.8 5 6.2s-2.2 6.4-5 6.4-5-3-5-6.4 2-6.2 5-6.2Z',
  'M16 13.4c1.7 0 2.8 1.6 2.8 3.4S17.7 20.4 16 20.4s-2.8-1.8-2.8-3.6 1.1-3.4 2.8-3.4Z','M12.6 6.8L16 2.4l3.4 4.4-3.4 1.6Z',['s','M16 2.6v4',1.4]];
  KQE['🪔']=['glowbulb','slime']}catch(e){console.warn('v143 icon',e)}
var MQ143_G=null;
function mq143Drop(p){MQ143_G=MQ143_G||{b:new THREE.CylinderGeometry(.05,.05,1.6,8),m:new THREE.MeshBasicMaterial({color:0xd8ff7a,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false})};
  const g=new THREE.Group(),gem=mqm143Bulb(),beam=new THREE.Mesh(MQ143_G.b,MQ143_G.m);gem.position.y=.5;beam.position.y=.8;beam.scale.set(.75,1,.75);g.add(gem,beam);
  const a=Math.random()*6.28,d=.5+Math.random()*.8;g.position.set(p.x+Math.cos(a)*d,0,p.z+Math.sin(a)*d);scene.add(g);drops.push({g,gem,kind:'mq143',data:{n:1},t:90});
  try{burst(gY(g.position,.45),0xd8ff7a,10,1.6,2,.6)}catch(_){}}
{const f=lootE;lootE=function(e){const r=f.apply(this,arguments);try{if(e&&e.m&&!e.boss&&!e.dprop&&!e.wv&&mq143Need()>0){const P=e.m.position,I=insAt(Math.round(P.x),Math.round(P.z));
    if(I&&I.g===0&&I.fld&&Math.random()<MQ143.drop)mq143Drop(P)}}catch(err){console.warn('v143 drop',err)}return r}}
{const f=take;take=function(d){if(d&&d.kind=='mq143'){MQ143.b+=d.data.n|0;MQ143.trkK='';
    pickup({ic:'🪔',t:'+'+(d.data.n|0)+' Glowbulb',col:'#d8ff7a',sub:'Quest item · '+MQ143.b+' carried · feed them to the lampposts on the road'});return}return f.apply(this,arguments)}}
{const f=kqmMatTab;kqmMatTab=function(){const h=f.apply(this,arguments);if(!(MQ143.b>0))return h;
  const t=`<div class="kqm-slot mi" title="Glowbulb · quest item for The Lantern Road. Every creature of Kindlelight I carries one; each lights a lamppost on the road to the gateway."><span class="kqm-ic">🪔</span><span class="kqm-ct">${MQ143.b}</span><span class="kqm-hold">Glowbulb</span></div>`;
  return `<div class="kqm-h">Quest items</div><div class="kqm-grid">${t}${kqmEmpty(7)}</div>`+(/Chop trees, mine rocks/.test(h)?'':h)}}

// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.mq143={v:159,st:MQ143.st,b:MQ143.b,lit:MQ143.lit.map(v=>v?1:0),seen:MQ143.seen|0}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.mq143;MQ143.st=0;MQ143.b=0;MQ143.lit=new Array(mq143N()).fill(0);MQ143.seen=0;
    if(q&&typeof q=='object'){MQ143.st=Math.max(0,Math.min(3,q.st|0));if(MQ143.st==2)MQ143.st=3;MQ143.b=Math.max(0,Math.min(99,q.b|0));MQ143.seen=q.seen|0;
      if(Array.isArray(q.lit)){if((q.v|0)>=159)q.lit.forEach((v,i)=>{if(i<MQ143.lit.length)MQ143.lit[i]=v?1:0});
        else if((q.v|0)>=151){if(MQ143.st<3)MQ143.b=Math.min(99,MQ143.b+q.lit.filter(v=>v).length)} // v159: the ~47 lamps moved onto the lantern line (34): refund a bulb each, start dark

        else if(MQ143.st<3)MQ143.b=Math.min(99,MQ143.b+3*q.lit.filter(v=>v).length)}} // v151: the old 8 lamps cost 3 each and stood elsewhere: refund, start dark
    MQ143.trkK='';MQ143.roll=null;MQ143.fire=null;if(MQ143.S)mq143Sync()}catch(err){console.warn('v143 load',err)}return r}}

// ---------------- talking, lighting, the gateway ----------------
function mq143Light(i){const S=MQ143.S;if(!S||MQ143.lit[i]||MQ143.b<MQ143.per||mq143Done()||MQ143.st>=2)return;
  MQ143.b-=MQ143.per;MQ143.lit[i]=1;MQ143.trkK='';const L=S.lamps[i];if(MQ143.st<1)MQ143.st=1;
  try{const pp=L.plateW.clone();burst(pp,0xd8ff7a,18,1.2,1.2,.6);sfx('chime')}catch(_){}
  setTimeout(()=>{try{L.on.visible=true;L.halo.visible=true;L.k=Math.max(L.k,.05);burst(L.bulbW,0xf4ffd0,26,2.2,1.6,.9);ring(new THREE.Vector3(L.x,0,L.z),0xd8ff7a,2.2,700);mSfx('rare')}catch(_){}},420);
  const n=mq143Lit(),N=mq143N();
  if(n>=N){say('🪔 The last lamppost flares. Back at the outpost the Portal Ripper’s furnace roars to life.');setTimeout(()=>mq143RollStart(),1600)}
  else say('🪔 Lamppost lit · '+n+' of '+N+(MQ143.b>=MQ143.per?' · you carry enough for another':''))}
function mq143Bulbs(n,plain){return n+(plain?' ':' 🪔 ')+'glowbulb'+(n==1?'':'s')}
function mq143Prompt(){if(!MQ143.S||!mq143Here())return null;const P=pl.position,S=MQ143.S;
  const c=S.war.captain;if(c&&Math.hypot(P.x-c.g.position.x,P.z-c.g.position.z)<2.4)return {label:'F · Talk to '+MQ143.cap+(MQ143.st==0&&!mq143Done()?' (quest)':''),fn:()=>openX('mq143')};
  if(mq143Done()||MQ143.st>=2)return null;
  for(let i=0;i<S.lamps.length;i++){const L=S.lamps[i];if(MQ143.lit[i])continue;if(Math.hypot(P.x-L.x,P.z-L.z)<2.3){
    if(MQ143.b>=MQ143.per)return {label:'F · Light the lamppost ('+mq143Bulbs(MQ143.per)+' · you carry '+MQ143.b+')',fn:()=>mq143Light(i)};
    return {label:'🪔 The lamppost needs '+mq143Bulbs(MQ143.per,1)+' · you carry '+MQ143.b,fn:()=>say('🪔 Every creature of '+PMAP[0].ins[0].n+' carries a glowbulb. Hunt them, then feed one to each lamppost.')}}}
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=mq143Prompt();if(r)return r}catch(e){if(!MQ143.err++)console.warn('v143 prompt',e)}return f.apply(this,arguments)}}
function mq143AtGate(){const P=pl.position;for(const r of RPORT)if(r.k=='next'&&r.ig===0&&Math.hypot(P.x-r.x,P.z-r.z)<2.8)return true;return false}
{const f=portalPrompt;portalPrompt=function(){const r=f.apply(this,arguments);try{if(r&&!mq143Done()&&mq143AtGate()){const n=mq143Lit(),N=mq143N();
    return {label:'🔒 The gateway is dormant · '+n+'/'+N+' lampposts lit',fn:()=>say('🌀 The arch is cold and dead. The Lantern Wardens back by the entrance have a machine that can tear it open, once their road is lit.')}}}catch(_){}return r}}

// ---------------- the captain's window ----------------
XR.mq143=()=>{const st=mq143Done()?3:MQ143.st,n=mq143Lit(),N=mq143N(),nx=mq143Next();
  $('xwT').textContent='⚜ '+MQ143.cap;$('xwS').textContent='The Lantern Wardens · '+PMAP[0].ins[0].n;
  const L=st==0?['Hold there. You walk a dead road. We are the Lantern Wardens, and the iron beast behind me is the Portal Ripper. It can tear open the way to '+nx+', but it will not roll through this dark. The bog swallows anything that leaves the light.',
      'Every lamppost from here down to the gateway burns a glowbulb, and every creature of this reach carries one in its gut. Take them. One to a lamp, all the way down. When the last lamp burns, we roll.']
    :st==1?['Lamps lit: '+n+' of '+N+'. The beasts carry the bulbs, so take them from the beasts. One to a lamp. The posts run the whole road, down to the gateway.']
    :st==2?['She’s moving! Follow her down to the gateway, and keep those things off my wardens.']
    :['The way to '+nx+' stands open, and the Ripper holds it. Go, before the bog remembers us.'];
  const lamp=i=>`<span class="mq143lp${MQ143.lit[i]||st>=2?' on':''}" title="Lamppost ${i+1}">🪔</span>`;
  let b=`<div class="cq132say"><span class="cq132who">${MQ143.cap}</span>${L.map(t=>'“'+t+'”').join('<br><br>')}</div>`;
  b+=`<div class="mq143q"><div class="mq143h"><span>Main quest</span><b>${MQ143.name}</b></div>`+
    `<div class="mq143o${st>=2?' full':''}"><span>Lampposts lit</span><span>${st>=2?N:n} / ${N}</span></div><div class="mq143lps">${Array.from({length:N},(v,i)=>lamp(i)).join('')}</div>`+
    `<div class="mq143o"><span>Glowbulbs carried</span><span>${MQ143.b}${st<2?' · '+MQ143.per+' per lamp':''}</span></div>`+
    `<div class="mq143o${st>=3?' full':''}"><span>The gateway to ${nx}</span><span>${st>=3?'open':st==2?'opening…':'dormant'}</span></div></div>`;
  $('xwB').innerHTML=b;
  $('xwF').innerHTML=st==0?'<button class="pri" data-mq143="go">I’ll light the road</button> <span class="mut dtl">Glowbulbs drop from the creatures of '+PMAP[0].ins[0].n+'.</span>':'<span class="mut dtl">'+(st>=3?'Step through the gateway at the end of the road.':'Feed a glowbulb to each lamppost (F beside it).')+'</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='mq143')return;const t=e.target.closest('[data-mq143]');if(!t)return;
  if(t.dataset.mq143=='go'&&MQ143.st==0){MQ143.st=1;MQ143.trkK='';say('⚜ Quest: <b>'+MQ143.name+'</b> · light the '+mq143N()+' lampposts down to the gateway.');try{sfx('chime')}catch(_){}}rX()});

// ---------------- the tracker (above Cheddar's) ----------------
(function(){const st=document.createElement('style');st.textContent=`
#mqt143{position:fixed;right:12px;top:300px;z-index:6;width:220px;max-width:44vw;pointer-events:none;font-size:12px;line-height:1.35;color:#e9e6cf;
  background:linear-gradient(270deg,rgba(8,14,8,.85),rgba(8,14,8,.4));border-right:2px solid #b8d86a;border-radius:4px 0 0 4px;text-align:right;padding:6px 9px 7px;text-shadow:0 1px 2px #000}
#mqt143.hide{display:none}
#mqt143 .k{font-family:Cinzel,Georgia,serif;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:#9ab86a}
#mqt143 .h{font-family:'IM Fell English SC',Georgia,serif;color:#e6ff9a;font-size:13px;letter-spacing:.03em;margin-bottom:2px}
#mqt143 .o{display:flex;justify-content:flex-end;gap:8px;color:#c8c8a8;font-size:11.5px}
#mqt143 .o b{color:#f0ffc0;font-weight:600}
#mqt143 .d{color:#d8ff7a}
body.mob #mqt143{width:176px;font-size:11px}
#xw .mq143q{margin-top:4px;border:1px solid rgba(184,216,106,.3);background:linear-gradient(180deg,rgba(22,30,18,.92),rgba(10,14,8,.92));border-radius:6px;padding:10px 12px 11px;display:flex;flex-direction:column;gap:7px}
#xw .mq143h{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
#xw .mq143h span{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:#9ab86a}
#xw .mq143h b{font-family:Cinzel,Georgia,serif;font-size:1rem;color:#e6ff9a}
#xw .mq143o{display:flex;justify-content:space-between;gap:8px;padding:5px 8px;border-radius:4px;background:rgba(255,255,255,.035);font-size:.82rem}
#xw .mq143o span:last-child{font-variant-numeric:tabular-nums;color:#e0e0c0}
#xw .mq143o.full{color:#b8e88f}
#xw .mq143lps{display:flex;flex-wrap:wrap;gap:2px 3px;justify-content:center;padding:2px 0}
#xw .mq143lp{font-size:.95rem;opacity:.3;filter:grayscale(1)}
#xw .mq143lp.on{opacity:1;filter:drop-shadow(0 0 6px #d8ff7a)}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='mqt143';d.className='hide';document.body.appendChild(d)})();
function mq143Trk(){const el=$('mqt143');if(!el)return;const here=mq143Here(),hide=!here||(typeof uiOpen=='function'&&uiOpen())||(mq143Done()&&insReach(0)>=1);
  const st=mq143Done()?3:MQ143.st,n=mq143Lit(),N=mq143N(),key=(hide?'h':'s')+st+'|'+n+'|'+MQ143.b+'|'+MQ143.seen;if(key===MQ143.trkK)return;MQ143.trkK=key;
  if(hide){el.classList.add('hide');mq143TrkPos();return}
  const o=(a,b)=>`<div class="o"><span>${a}</span>${b!=null?'<b>'+b+'</b>':''}</div>`;let h='<div class="k">⚜ Main quest</div><div class="h">'+MQ143.name+'</div>';
  if(st==0)h+=o(MQ143.seen?'Speak to '+MQ143.cap:'Find the Lantern Wardens near the entrance')+o('Glowbulbs carried',MQ143.b);
  else if(st==1)h+=o('Light the lampposts',n+'/'+N)+o('Glowbulbs ('+MQ143.per+' per lamp)',MQ143.b);
  else if(st==2)h+='<div class="o d"><span>The Portal Ripper rolls to the gateway…</span></div>';
  else h+='<div class="o d"><span>Step through the gateway to '+mq143Next()+'</span></div>';
  el.innerHTML=h;el.classList.remove('hide');mq143TrkPos()}
function mq143TrkPos(){const el=$('mqt143'),m=$('mini'),c=$('chqt132');if(!el||!m||!m.offsetParent)return;const mr=m.getBoundingClientRect();let b=mr.bottom;
  ['locBox','fsBtn','sysBtn','sysmenu','mbtn'].forEach(id=>{const e=$(id);if(!e||!e.offsetParent)return;const r=e.getBoundingClientRect();if(r.width&&r.right>mr.left-40&&r.left<mr.right+40)b=Math.max(b,r.bottom)});
  if(b+140>innerHeight)b=Math.max(mr.bottom,innerHeight*.35);const top=Math.round(b+10),right=Math.max(8,Math.round(innerWidth-mr.right))+'px';
  const on=!el.classList.contains('hide');if(on){el.style.top=top+'px';el.style.right=right}
  if(c&&!c.classList.contains('hide'))c.style.top=(on?top+el.offsetHeight+8:top)+'px'}
{const f=chqTrkPos132;chqTrkPos132=function(){const r=f.apply(this,arguments);try{mq143TrkPos()}catch(_){}return r}}
addEventListener('resize',()=>{try{mq143TrkPos()}catch(_){}});

// ---------------- the minimap and the N map ----------------
function mq143Marks(g,P,k){const S=MQ143.S;if(!S||!mq143Here())return;const done=mq143Done();
  S.lamps.forEach((L,i)=>{const q=P(L.x,L.z);if(!q)return;const on=done||MQ143.st>=2||MQ143.lit[i];g.save();g.translate(q[0],q[1]);g.scale(k,k);
    g.beginPath();g.arc(0,0,on?3.2:2.6,0,6.28);g.fillStyle=on?'#e6ff9a':'#4a5240';g.fill();g.lineWidth=1.2/k;g.strokeStyle=on?'#3a5a1a':'#1a1e16';g.stroke();
    if(on){g.beginPath();g.arc(0,0,5.4,0,6.28);g.strokeStyle='rgba(216,255,122,.45)';g.stroke()}g.restore()});
  const R=S.rip.g.position,q=P(R.x,R.z);if(q){g.save();g.translate(q[0],q[1]);g.scale(k,k);g.fillStyle='#c9a24a';g.strokeStyle='#1a1206';g.lineWidth=1.3/k;
    g.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?3.4:5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();g.beginPath();g.arc(0,0,1.6,0,6.28);g.fillStyle='#1a1206';g.fill();g.restore()}
  const c=S.war.captain;if(c){const p=P(c.g.position.x,c.g.position.z);if(p){g.save();g.translate(p[0],p[1]);g.scale(k,k);g.fillStyle='#2a6a64';g.strokeStyle='#e6ff9a';g.lineWidth=1.4/k;
    g.beginPath();g.moveTo(0,-5);g.lineTo(4.2,-2.4);g.lineTo(3.4,3);g.lineTo(0,5.4);g.lineTo(-3.4,3);g.lineTo(-4.2,-2.4);g.closePath();g.fill();g.stroke();
    if(MQ143.st==0&&!done){g.font='900 9px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=2.5/k;g.strokeStyle='#1a0f06';g.strokeText('!',0,.6);g.fillStyle='#fff2b0';g.fillText('!',0,.6)}g.restore()}}}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{mq143Marks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;return X<-6||Y<-6||X>w+6||Y>h+6?null:[X,Y]},1)}catch(_){}}}
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{const I=INSL[0];if(mq143Here()){const c=$('wmc'),g=c.getContext('2d'),k=Math.min(1060/I.w,640/I.h);
  mq143Marks(g,(x,z)=>[(x-I.x0+.5)*k,(z-I.y0+.5)*k],1.5);const C=MQ143.S&&MQ143.S.war.captain;if(C){const x=(C.g.position.x-I.x0+.5)*k,y=(C.g.position.z-I.y0+.5)*k;
    g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText('Lantern Wardens',x,y-17);g.fillStyle='#e6ff9a';g.fillText('Lantern Wardens',x,y-17)}}}catch(e){console.warn('v143 wmap',e)}return r0}}

// ---------------- roaming creatures keep out of the outpost ----------------
{const f=rosterBuild;rosterBuild=function(r){const o=f.apply(this,arguments);try{if(r===0&&ROST.r===0){const R=mq143Plan(),c=R.center,pk=R.park;
    ROST.slots=ROST.slots.filter(s=>!(s.wild&&(Math.hypot((s.hx==null?s.x:s.hx)-c[0],(s.hz==null?s.z:s.hz)-c[1])<17||Math.hypot(s.x-pk.x,s.z-pk.z)<7)))}}catch(e){console.warn('v143 roster',e)}return o}}

// ---------------- the world: build, sync to the state, tick ----------------
function mq143Grass(P){try{const G=typeof TUFT!='undefined'?VIL.filter(v=>v.geo===TUFT):[];const T=new Map();
  P.forEach(q=>{const r=Math.ceil(q[2])+1;for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const k=(Math.round(q[1])+j)*W+Math.round(q[0])+i;if(!T.has(k))T.set(k,[]);T.get(k).push(q)}});
  const Z=new THREE.Matrix4().makeScale(0,0,0);G.forEach(v=>{let ch=0;for(let i=0;i<v.n;i++){const x=v.M[i*16+12],z=v.M[i*16+14],L=T.get(Math.round(z)*W+Math.round(x));
    if(L&&L.some(q=>Math.hypot(x-q[0],z-q[1])<q[2])){v.setMatrixAt(i,Z);ch=1}}if(ch)v.instanceMatrix.needsUpdate=true})}catch(e){console.warn('v143 grass',e)}}
// collider tiles under a rectangle (centre, yaw, half sizes along the local x / z axes)
function mq143Blk(x,z,ry,hx,hz,add){const c=Math.cos(ry),s=Math.sin(ry),r=Math.ceil(Math.hypot(hx,hz))+1,out=[];
  for(let j=Math.floor(z-r);j<=Math.ceil(z+r);j++)for(let i=Math.floor(x-r);i<=Math.ceil(x+r);i++){const dx=i-x,dz=j-z,lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<=hx&&Math.abs(lz)<=hz)out.push(j*W+i)}
  out.forEach(k=>add?CBLK.add(k):CBLK.delete(k));return out}
function mq143Halo(col,s){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));m.scale.set(s,s,1);m.userData.psNo=1;return m}
function mq143Label(t){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:txTex([{t,f:'700 30px'}],440,56,'rgba(8,16,12,.8)','#e6ff9a','rgba(184,216,106,.75)'),transparent:true,depthWrite:false}));sp.scale.set(2.6,.33,1);return sp}
function mq143Build(){if(MQ143.S)return MQ143.S;const R=mq143Plan(),root=new THREE.Group();root.name='LanternRoad';scene.add(root);
  const S={R,root,lamps:[],war:{},props:[],lights:[],grass:[],t:0,smk:0,rip:null,gate:null};MQ143.S=S;
  const put=(o,x,z,ry)=>{o.position.set(x,GH(x,z),z);o.rotation.y=ry||0;root.add(o);return o};
  // lampposts (+ a halo and a pooled point light each)
  R.lamps.forEach((o,i)=>{const L=mqm143Lamp();put(L.g,o.x,o.z,o.ry);L.g.updateMatrixWorld(true);const bw=L.bulbP.clone().applyMatrix4(L.g.matrixWorld),pw=L.plateP.clone().applyMatrix4(L.g.matrixWorld);
    const halo=mq143Halo(0xd8ff7a,1.7);halo.position.copy(bw);halo.visible=false;root.add(halo);
    const lt=new THREE.PointLight(0xd8ff8a,0,14,1.4);lt.position.copy(bw);scene.add(lt);S.lights.push(lt);
    S.lamps.push({x:o.x,z:o.z,g:L.g,on:L.on,halo,lt,bulbW:bw,plateW:pw,k:0});CBLK.add(Math.round(o.z)*W+Math.round(o.x));S.grass.push([o.x,o.z,.6])});
  // the outpost pieces
  const mk={tent:mqm143Tent,banner:mqm143Banner,brazier:mqm143Brazier,table:mqm143Table,rack:mqm143Rack,crate0:()=>mqm143Crate(0),crate1:()=>mqm143Crate(1),barrel:mqm143Barrel,bulbcrate:mqm143BulbCrate};
  const sz={tent:[1.45,1.35],banner:[.3,.3],brazier:[.45,.45],table:[.7,.5],rack:[.75,.3],crate0:[.4,.4],crate1:[.35,.35],barrel:[.35,.35],bulbcrate:[.4,.4]};
  R.props.forEach(o=>{const m=mk[o.k]&&mk[o.k]();if(!m)return;put(m,o.x,o.z,o.ry);const z2=sz[o.k]||[.4,.4];mq143Blk(o.x,o.z,o.ry,z2[0],z2[1],true);S.grass.push([o.x,o.z,Math.max(z2[0],z2[1])+.3]);S.props.push({o,m});
    if(o.k=='brazier'){const lt=new THREE.PointLight(0xff9a40,1.5,10,1.6);lt.position.set(o.x,GH(o.x,o.z)+1.3,o.z);scene.add(lt);S.lights.push(lt);S.braz={m,lt}}});
  R.stakes.forEach(o=>{const m=mqm143Stakes(o.n,Math.round(o.x*7+o.z*13));put(m,o.x,o.z,o.ry);mq143Blk(o.x,o.z,o.ry,o.n*.135,.18,true)});
  // the Portal Ripper
  const rp=mqm143Ripper();rp.g.rotation.order='YXZ';root.add(rp.g);S.rip=rp;S.ripBlk=[];
  const coreL=new THREE.PointLight(0xd8ff8a,0,12,1.6);scene.add(coreL);S.lights.push(coreL);S.coreL=coreL;S.coreHalo=mq143Halo(0xe6ff9a,1.6);S.coreHalo.visible=false;root.add(S.coreHalo);
  // the route as a fine polyline with cumulative length (Catmull-Rom through the plan's points)
  {const p=R.route,pts=[];for(let i=0;i<p.length-1;i++){const a=p[Math.max(0,i-1)],b=p[i],c=p[i+1],d=p[Math.min(p.length-1,i+2)];
      for(let t=0;t<1;t+=.125){const t2=t*t,t3=t2*t,f=(q,j)=>.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3);pts.push([f(0,0),f(0,1)])}}
    pts.push(p[p.length-1].slice());const cl=[0];for(let i=1;i<pts.length;i++)cl.push(cl[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));S.path=pts;S.cl=cl;S.len=cl[cl.length-1]}
  // the wardens
  Object.keys(R.war).forEach(k=>{const o=R.war[k];if(!o)return;let g;try{g=mqw143Make(k)}catch(e){console.warn('v143 warden',k,e);return}
    g.position.set(o.x,GH(o.x,o.z),o.z);g.rotation.y=o.ry;root.add(g);S.war[k]={g,o,ry:o.ry,ph:Math.random()*6,pat:0,wait:2+Math.random()*3}});
  {const c=S.war.captain;if(c){const lb=mq143Label(MQ143.cap);lb.position.set(0,1.95,0);c.g.add(lb);const mk=new THREE.Sprite(new THREE.SpriteMaterial({map:chqMarkTex132('!'),transparent:true,depthWrite:false,fog:false}));
    mk.scale.set(.62,.76,1);mk.position.set(0,2.5,0);mk.renderOrder=5;c.g.add(mk);S.mark=mk}}
  ['captain','rook','thistle','sergeant'].forEach(k=>{const w=S.war[k];if(w)CBLK.add(Math.round(w.o.z)*W+Math.round(w.o.x))});
  // the gateway
  S.gate=RPORT.find(r=>r.k=='next'&&r.ig===0)||null;
  if(S.gate){const tx=document.createElement('canvas');tx.width=tx.height=128;const x=tx.getContext('2d'),gr=x.createRadialGradient(64,64,4,64,64,62);
    gr.addColorStop(0,'rgba(255,255,230,1)');gr.addColorStop(.35,'rgba(200,255,140,.8)');gr.addColorStop(.7,'rgba(90,200,80,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);
    x.strokeStyle='rgba(240,255,200,.55)';x.lineWidth=3;for(let i=0;i<5;i++){x.beginPath();for(let a=0;a<5.5;a+=.1){const r=6+a*9.5;x.lineTo(64+Math.cos(a+i*1.26)*r,64+Math.sin(a+i*1.26)*r)}x.stroke()}
    const sw=new THREE.Mesh(new THREE.CircleGeometry(.78,24),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(tx),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    sw.position.set(0,1.2,.03);sw.scale.y=1.3;sw.visible=false;S.gate.g.add(sw);S.swirl=sw;S.gateCol=S.gate.disc.material.color.getHex();S.gate.g.userData.psNo=1;
    const gl=new THREE.PointLight(0x9aff6a,0,10,1.6);gl.position.set(S.gate.x,GH(S.gate.x,S.gate.z)+1.4,S.gate.z);scene.add(gl);S.lights.push(gl);S.gateL=gl}
  // lightning arcs (two jagged lines, reused) for the fire-up and the beam that holds the gateway open
  S.arcs=[0,1].map(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(14*3),3));
    const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xeaffb0,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));l.frustumCulled=false;l.visible=false;root.add(l);return l});
  mq143Grass(S.grass.concat(R.keep.slice(0,2).map(k=>[k[0],k[1],0])));
  mq143Sync();return S}
// put everything where the state says (load, a new save, done from elsewhere)
function mq143Sync(){const S=MQ143.S;if(!S)return;const done=mq143Done(),R=S.R;
  S.lamps.forEach((L,i)=>{const on=done||MQ143.st>=2||!!MQ143.lit[i];L.on.visible=on;L.halo.visible=on;L.k=on?1:0});
  MQ143.roll=null;MQ143.fire=null;
  if(done)mq143Park();else mq143PlaceAt(0);
  mq143Gate(done?1:0);S.rip.lamps.visible=done;S.rip.core.visible=done;S.coreHalo.visible=done;S.coreL.intensity=done?.9:0;
  const cl=done?[.12,.38]:[-1.05,0];S.rip.clawL.rotation.set(cl[0],-cl[1],0);S.rip.clawR.rotation.set(cl[0],cl[1],0);S.rip.jacks.forEach(j=>j.scale.y=done?1:.2);
  ['ironpaw','gearwick'].forEach(k=>{const w=S.war[k];if(!w)return;if(done)mq143Escort(w,k,0,true);else{w.g.position.set(w.o.x,GH(w.o.x,w.o.z),w.o.z);w.g.rotation.y=w.o.ry;w.esc=0}})}
function mq143PlaceAt(d){const S=MQ143.S,P=S.path,cl=S.cl;d=Math.max(0,Math.min(S.len,d));let i=1;while(i<cl.length-1&&cl[i]<d)i++;
  const a=P[i-1],b=P[i],t=(d-cl[i-1])/Math.max(1e-6,cl[i]-cl[i-1]),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  const ah=P[Math.min(P.length-1,i+1)],bh=P[Math.max(0,i-2)];let ry=Math.atan2(ah[0]-bh[0],ah[1]-bh[1]);
  if(d>=S.len-.01)ry=S.R.park.ry;mq143Pose(x,z,ry);return {x,z,ry}}
function mq143Pose(x,z,ry){const S=MQ143.S,g=S.rip.g,s=Math.sin(ry),c=Math.cos(ry),h=(lx,lz)=>GH(x+c*lx+s*lz,z-s*lx+c*lz);
  const fl=h(-.98,1.15),fr=h(.98,1.15),bl=h(-.98,-1.15),br=h(.98,-1.15);g.position.set(x,(fl+fr+bl+br)/4,z);
  g.rotation.set(Math.atan2((bl+br)/2-(fl+fr)/2,2.3),ry,Math.atan2((fr+br)/2-(fl+bl)/2,1.96));
  S.coreHalo.position.copy(S.rip.coreP.clone().applyMatrix4(g.matrixWorld.compose(g.position,g.quaternion.setFromEuler(g.rotation),g.scale)));S.coreL.position.copy(S.coreHalo.position)}
function mq143Park(){const S=MQ143.S;mq143PlaceAt(S.len);mq143RipBlk(true)}
function mq143RipBlk(on){const S=MQ143.S;S.ripBlk.forEach(k=>CBLK.delete(k));S.ripBlk=[];if(!on)return;const g=S.rip.g.position;S.ripBlk=mq143Blk(g.x,g.z,S.rip.g.rotation.y,.95,1.75,true)}
// k 0 dormant → 1 open (the disc dark and faint, then its colour back, a swirl and a light)
function mq143Gate(k){const S=MQ143.S;if(!S||!S.gate)return;const m=S.gate.disc.material,dk=new THREE.Color(0x141a12);m.color.copy(dk).lerp(new THREE.Color(S.gateCol),k);m.opacity=.3+.5*k;
  S.swirl.visible=k>0;S.swirl.material.opacity=k;if(S.gateL)S.gateL.intensity=1.3*k}
// an escort's spot beside the Ripper (ironpaw on the right, gearwick on the left), walking or standing guard at the park
function mq143Escort(w,k,ph,stand){const S=MQ143.S,g=S.rip.g,ry=g.rotation.y,s=Math.sin(ry),c=Math.cos(ry),o=k=='ironpaw'?[1.55,.5]:[-1.5,-.2];
  const x=g.position.x+c*o[0]+s*o[1],z=g.position.z-s*o[0]+c*o[1];w.g.position.set(x,GH(x,z),z);w.g.rotation.y=stand?ry+(k=='ironpaw'?-.5:.5):ry;w.esc=stand?2:1;w.ph=ph}
function mq143RollStart(){const S=MQ143.S;if(!S||mq143Done())return;MQ143.st=2;MQ143.trkK='';MQ143.roll={d:0};mq143RipBlk(false);S.rip.lamps.visible=true;
  try{burst(S.rip.g.position.clone().add(new THREE.Vector3(0,3.2,0)),0x8a8a7a,30,1.2,2.5,1.2);sfx('power')}catch(_){}
  try{zt116Show(ZT116.Z[0],'Kindlelight · Main Quest','The Lantern Road','The road is lit. The Portal Ripper rolls for the gateway.','Follow it down the road','z0')}catch(_){}}
function mq143Finish(){const S=MQ143.S;MQ143.st=3;MQ143.trkK='';MQ143.roll=null;MQ143.fire=null;if(S)mq143Sync();try{hud()}catch(_){}}
// the arc: a jagged line between two points, redrawn each call
function mq143Arc(l,a,b,j){const p=l.geometry.attributes.position,n=p.count;for(let i=0;i<n;i++){const t=i/(n-1),e=Math.sin(t*Math.PI)*j;
    p.setXYZ(i,a.x+(b.x-a.x)*t+(Math.random()-.5)*e,a.y+(b.y-a.y)*t+(Math.random()-.5)*e+Math.sin(t*Math.PI)*.4,a.z+(b.z-a.z)*t+(Math.random()-.5)*e)}p.needsUpdate=true;l.visible=true}
function mq143Tick(dt,now){
  const here=mq143Here();if(here&&!MQ143.S){try{mq143Build()}catch(e){console.error('v143 build',e);MQ143.S=null;MQ143.err++;return}}
  const S=MQ143.S;if(!S)return;S.root.visible=here;
  if(!here){S.lights.forEach(l=>{if(l.userData.v143==null)l.userData.v143=l.intensity;l.intensity=0});
    if(MQ143.st==2)mq143Finish();return}
  S.lights.forEach(l=>{if(l.userData.v143!=null){l.intensity=l.userData.v143;l.userData.v143=null}});
  const t=now/1000,P=pl.position,done=mq143Done();
  // the first look at the outpost
  if(!MQ143.seen&&Math.hypot(P.x-S.R.center[0],P.z-S.R.center[1])<15){MQ143.seen=1;if(!done)try{zt116Show(ZT116.Z[0],'Kindlelight · Main Quest','The Lantern Road','The Lantern Wardens guard the Portal Ripper','Speak to '+MQ143.cap,'z0')}catch(_){}}
  // lamps ease up to full light and flicker gently
  S.lamps.forEach((L,i)=>{const want=L.on.visible?1:0;L.k+=(want-L.k)*Math.min(1,dt*2.2);const fl=.92+.08*Math.sin(t*7.1+i*1.7)*Math.sin(t*3.3+i);
    L.lt.intensity=2.3*L.k*fl;if(L.halo.visible){const s=1.5+.2*Math.sin(t*2.2+i);L.halo.scale.set(s,s,1);L.halo.material.opacity=.75*L.k}});
  if(S.braz){const fl=S.braz.m.userData.flame;fl.scale.set(1+.08*Math.sin(t*9),1+.18*Math.sin(t*13.3)*Math.sin(t*5.1),1+.08*Math.cos(t*8.2));S.braz.lt.intensity=1.3+.35*Math.sin(t*11)*Math.sin(t*4.7)}
  if(S.mark){S.mark.visible=MQ143.st==0&&!done;if(S.mark.visible){S.mark.position.y=2.5+Math.sin(t*2.2)*.07}}
  const R=S.rip;
  // rolling
  if(MQ143.roll){const r=MQ143.roll,v=Math.min(MQ143.speed,(r.d+1)*.9);r.d+=v*dt;const q=mq143PlaceAt(r.d);
    R.wheels.forEach(w=>w.rotation.x+=v*dt/.56);R.g.position.y+=Math.abs(Math.sin(r.d*3.1))*.02;
    if((S.smk-=dt)<=0){S.smk=.22;try{const c=R.chimP.clone().applyMatrix4(R.g.matrixWorld);burst(c,0x5a5a4a,4,.35,1.8,1.4);if(Math.random()<.4)burst(c,0xd8ff7a,2,.3,1.4,.5)}catch(_){}}
    ['ironpaw','gearwick'].forEach(k=>{const w=S.war[k];if(w)mq143Escort(w,k,r.d*2.7,false)});
    if(r.d>=S.len){MQ143.roll=null;mq143RipBlk(true);MQ143.fire={t:0,arc:0}}}
  // the fire-up at the gateway (7.5 s)
  if(MQ143.fire&&S.gate){const F=MQ143.fire,t0=F.t;F.t+=dt;const T=F.t,e=x=>x<0?0:x>1?1:x*x*(3-2*x),gp=new THREE.Vector3(S.gate.x,GH(S.gate.x,S.gate.z)+1.25,S.gate.z);
    R.jacks.forEach(j=>j.scale.y=.2+.8*e(T/.8));if(t0<.8&&T>=.8){try{shake(.15);burst(R.g.position,0x6a5a4a,20,1.6,.8,.8);sfx('brk')}catch(_){}}
    const ck=e((T-.6)/1.4);R.clawL.rotation.set(-1.05+1.17*ck,-.38*ck,0);R.clawR.rotation.set(-1.05+1.17*ck,.38*ck,0);
    if(T>1.2){R.core.visible=Math.random()<.35+.6*e((T-1.2)/2.8);S.coreHalo.visible=R.core.visible;S.coreL.intensity=2.2*e((T-1.2)/2.8)*(R.core.visible?1:.3);
      if((F.arc-=dt)<=0){F.arc=.14;try{burst(S.coreHalo.position,0xeaffb0,6,1,1.5,.4);if(Math.random()<.5)sfx('zap')}catch(_){}}}
    if(T>3&&T<6.2){R.g.updateMatrixWorld(true);[R.clawL,R.clawR].forEach((c,i)=>{const tip=new THREE.Vector3(0,.16,1.52).applyMatrix4(c.children[0].matrixWorld);mq143Arc(S.arcs[i],tip,gp,.55)});
      mq143Gate(.15*Math.random()*e((T-3)/3))}else S.arcs.forEach(l=>l.visible=false);
    if(t0<6.2&&T>=6.2){try{mq143Gate(1);ring(new THREE.Vector3(S.gate.x,0,S.gate.z),0xd8ff7a,5,900);burst(gp,0xf4ffd0,70,4,3,1.1);shake(.32);sfx('boom');mSfx('warp')}catch(_){}}
    if(T>=7.6){mq143Finish();try{zt116Show(ZT116.Z[0],'Kindlelight · Main Quest','The Way Is Open','The Portal Ripper has torn open the gateway to '+mq143Next(),'The Lantern Road · complete','z0');mSfx('victory')}catch(_){}
      say('🌀 The gateway to <b>'+mq143Next()+'</b> is open.')}}
  // the open gateway: the swirl turns, the Ripper's coil hums and now and then throws an arc into the arch
  if(done&&S.swirl&&!MQ143.fire){S.swirl.rotation.z-=dt*1.6;S.swirl.material.opacity=.75+.2*Math.sin(t*2.3);S.coreL.intensity=.8+.3*Math.sin(t*5);
    if(S.gate&&Math.hypot(P.x-S.gate.x,P.z-S.gate.z)<40){if(Math.random()<dt*1.4){const gp=new THREE.Vector3(S.gate.x,GH(S.gate.x,S.gate.z)+1.25,S.gate.z);mq143Arc(S.arcs[0],S.coreHalo.position,gp,.4);S.arcT=.09}
      if(S.arcT>0){S.arcT-=dt;if(S.arcT<=0)S.arcs[0].visible=false}}}
  // the wardens: face the hero when close, the lynx walks the palisade, the escorts walk beside the Ripper
  for(const k in S.war){const w=S.war[k],g=w.g,d=Math.hypot(P.x-g.position.x,P.z-g.position.z);if(d>50)continue;
    if(w.esc==1){mqw143Anim(g,now,w.ph,1);continue}
    if(k=='vesk'&&!w.esc&&S.R.patrol[0]&&S.R.patrol[1]){const A=S.R.patrol[w.pat];const dx=A.x-g.position.x,dz=A.z-g.position.z,L=Math.hypot(dx,dz);
      if(L>.25&&w.wait<=0){const st=Math.min(L,1.15*dt);g.position.x+=dx/L*st;g.position.z+=dz/L*st;g.position.y=GH(g.position.x,g.position.z);
        let da=Math.atan2(dx,dz)-g.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));g.rotation.y+=da*Math.min(1,dt*5);w.ph+=dt*4.2;mqw143Anim(g,now,w.ph,.85);continue}
      if(L<=.25&&w.wait<=0){w.wait=3+Math.random()*4;w.pat=1-w.pat}w.wait-=dt}
    const want=d<6&&k!='gearwick'?Math.atan2(P.x-g.position.x,P.z-g.position.z):(w.esc==2?g.rotation.y:w.ry);let da=want-g.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));g.rotation.y+=da*Math.min(1,dt*3);
    mqw143Anim(g,now)}
  if(now-MQ143.t>400){MQ143.t=now;mq143Trk()}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{mq143Tick(dt,now)}catch(err){if(!MQ143.err++)console.warn('v143 tick',err)}
  try{if(!mq143Here()&&now-MQ143.t>400){MQ143.t=now;mq143Trk()}}catch(_){}return r}}
