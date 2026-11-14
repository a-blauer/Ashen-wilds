// ================= v232 the two endings: the choice at the fountain, the roads to the fights, the crown =================
// Owner (Nov 13 2026): "When talking to this new being at the fountain- give the player the option to either fight him (players
// transport to an epic finale fight …) Or side with him and be transported to an area where you have to defeat a roster of new,
// original bosses … players can return to duskhold to shop, upgrade and grind levels as normal between bosses. When the whole
// roster is cleared he crowns you as markes you as devoted to him."
// FN232 (saved as x2.fn232 = [path, n, won, crown]; older saves load as "not chosen"):
//   path  0 not chosen · 1 against him · 2 with him (final once made)
//   n     Wardens beaten on his road, in order (0–4): Oakenhart, Maelis, Brassmaw, Seraphel (the records are in 4022–4052)
//   won   Ythrael slain (4062): the "land breathes" ending has played (4070); he is gone from the fountain
//   crown crowned (4071): the hero wears his crown and mark, and partners see them (look array, index 20)
// F by him at the fountain opens the talk window (fn232Talk). Each fight is reached from there (wk232Enter) and left through its
// rift back to Duskhold, so the town's shops, upgrades and the zones stay open between fights.
// Co-op: the choice and the progress are each player's own. A partner fighting in one of the arenas can be followed from the
// same window; everyone in an arena fights the same boss (4012). A helper's own road only moves when the boss is their next one.
var FN232={path:0,n:0,won:0,crown:0,err:0,name:'Ythrael',title:'the Voice Below'};
function fn232Roster(){const L=[];try{L.push(OK232D,ML232D,BM232D,SR232D)}catch(_){}return L.filter(Boolean)}
function fn232Final(){try{return typeof YT232D!='undefined'?YT232D:null}catch(_){return null}}
function fn232Keep(){try{saveGame(true)}catch(_){}}
function fn232WardenDown(i){if(FN232.path!==2||i!==FN232.n)return;FN232.n=i+1;fn232Keep();const R=fn232Roster(),nx=R[FN232.n];
  setTimeout(()=>{try{say(nx?'👁 <i>“Good. '+(R.length-FN232.n)+' still hold what is mine. Come back to me when you are ready.”</i>':'👁 <i>“It is done. Come to the fountain, and kneel.”</i>')}catch(_){}},3200)}
function fn232Slain(e){if(FN232.path!==1||FN232.won)return;FN232.won=1;fn232Keep();setTimeout(()=>{try{fn232EndA()}catch(err){console.error('fn232 ending',err)}},2800)}
// the fight-him ending: the essence goes back into the ground (4070); then the hero stands in Duskhold and he is gone
function fn232EndA(){const home=()=>{try{TWN100_home()}catch(_){}try{fn229Npc()}catch(_){}fn232Keep()};
  let ok=false;try{ok=typeof ec232Play=='function'&&ec232Play('breath',{then:home})}catch(err){console.error('fn232 breath',err)}if(!ok)fadeTo(home)}
// the crowning (4071), then the crown and the mark stay
function fn232EndB(){const done=()=>{FN232.crown=1;fn232Keep();try{fn232Regalia(pl,1)}catch(_){}try{MP.lastPres=''}catch(_){}
    setTimeout(()=>{try{banner('👑 DEVOTED','You wear the crown of '+FN232.name+', '+FN232.title,'')}catch(_){}},1200)};
  let ok=false;try{ok=typeof ec232Play=='function'&&ec232Play('crown',{then:done})}catch(err){console.error('fn232 crown',err)}if(!ok)done()}
// he is gone from the fountain once slain
{const f=fn229NpcOwn;fn229NpcOwn=function(){if(FN232.won)return false;return f.apply(this,arguments)}}
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.fn232=[FN232.path|0,FN232.n|0,FN232.won?1:0,FN232.crown?1:0]}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const a=s&&Array.isArray(s.fn232)?s.fn232:[0,0,0,0];FN232.path=[0,1,2].includes(a[0])?a[0]:0;FN232.n=Math.max(0,Math.min(4,a[1]|0));FN232.won=a[2]?1:0;FN232.crown=a[3]?1:0}catch(_){}return r}}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{fn232Regalia(pl,FN232.crown)}catch(e){console.warn('v232 load',e)}return r}}
{const f=ccBegin;ccBegin=function(){FN232.path=0;FN232.n=0;FN232.won=0;FN232.crown=0;const r=f.apply(this,arguments);try{fn232Regalia(pl,0)}catch(_){}return r}}
// ---------------- the crown and the mark ----------------
// A gold circlet with six points, each tipped with one Sovereign's essence, and his mark burning on the brow. Hung on the head
// bone of a hero model (your own, and a partner's from their look array).
function fn232CrownGeo(){if(FN232.cg)return FN232.cg;const G=[],put=(g,m)=>{G.push([g,m])};
  const band=new THREE.CylinderGeometry(1,1.04,.34,12,1,true);put(band,'gold');const lip=new THREE.TorusGeometry(1.03,.05,4,12);lip.rotateX(Math.PI/2);lip.translate(0,-.17,0);put(lip,'gold');
  for(let i=0;i<6;i++){const a=i/6*6.2832,x=Math.sin(a),z=Math.cos(a),sp=new THREE.ConeGeometry(.2,i%2?.62:.9,4);sp.translate(0,.17+(i%2?.31:.45),0);sp.rotateY(a);sp.translate(x,0,z);put(sp,'gold');
    const gm=new THREE.OctahedronGeometry(.13,0);gm.translate(x*1.02,.17+(i%2?.66:.95),z*1.02);put(gm,'g'+i);const st=new THREE.OctahedronGeometry(.09,0);st.scale(1,1.3,.6);st.rotateY(a);st.translate(x*1.07,0,z*1.07);put(st,'g'+((i+3)%6))}
  return FN232.cg=G}
function fn232Mark(){if(FN232.mk)return FN232.mk;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.strokeStyle='#fff';x.lineWidth=3.5;x.lineCap='round';
  x.beginPath();x.moveTo(8,32);x.quadraticCurveTo(32,10,56,32);x.quadraticCurveTo(32,54,8,32);x.stroke();x.beginPath();x.arc(32,32,6.5,0,6.2832);x.fillStyle='#fff';x.fill();
  x.lineWidth=2.5;[[32,4,32,12],[32,52,32,60]].forEach(q=>{x.beginPath();x.moveTo(q[0],q[1]);x.lineTo(q[2],q[3]);x.stroke()});return FN232.mk=new THREE.CanvasTexture(c)}
function fn232Head(m){if(!m)return null;if(m.bones&&m.bones.head)return m.bones.head;let h=null;m.traverse(o=>{if(!h&&o.bones&&o.bones.head)h=o.bones.head});return h}
function fn232Regalia(m,on){if(!m)return;const hd=on?fn232Head(m):null,R=m.userData.fn232;
  if(R&&(!on||R.g.parent!==hd)){if(R.g.parent)R.g.parent.remove(R.g);R.mats.forEach(q=>q.dispose());m.userData.fn232=null}
  if(!on||!hd||m.userData.fn232)return;const g=new THREE.Group(),mats=[],ess=(typeof YT232!='undefined'&&YT232.ess)||[0x9aff5a,0x5ad8ff,0xbfe9ff,0xffc24a,0xb8ff3a,0xff4a5a];g.name='fn232regalia';
  const gold=new THREE.MeshStandardMaterial({color:0xe2b24a,roughness:.32,metalness:.85,emissive:0x5a3a08,emissiveIntensity:.55,flatShading:true,side:THREE.DoubleSide});mats.push(gold);
  const gem=ess.map(c=>{const q=new THREE.MeshBasicMaterial({color:c});mats.push(q);return q});
  const cr=new THREE.Group();fn232CrownGeo().forEach(([geo,k])=>{const o=new THREE.Mesh(geo,k=='gold'?gold:gem[+k.slice(1)]);o.castShadow=true;cr.add(o)});
  const C=FN232.crownAt||[0,.178,.012,.122];cr.position.set(C[0],C[1],C[2]);cr.scale.setScalar(C[3]);cr.rotation.x=-.06;g.add(cr);
  const mm=new THREE.MeshBasicMaterial({map:fn232Mark(),color:0xc89aff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});mats.push(mm);
  const K=FN232.markAt||[0,.14,.118,.07],mk=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mm);mk.position.set(K[0],K[1],K[2]);mk.scale.setScalar(K[3]);g.add(mk);
  hd.add(g);m.userData.fn232={g,mats,mm,cr}}
function fn232RegTick(dt){FN232.rt=(FN232.rt||0)-dt;const t=performance.now()/1000;
  const beat=m=>{const R=m&&m.userData.fn232;if(R)R.mm.opacity=.7+.3*Math.sin(t*2.2)};beat(pl);
  if(FN232.rt>0)return;FN232.rt=1;try{fn232Regalia(pl,FN232.crown)}catch(_){}
  try{if(typeof MP!='undefined'&&MP.on)for(const k in MP.rh){const r=MP.rh[k];if(r.m)fn232Regalia(r.m,r.m.mdLook&&r.m.mdLook.fn232?1:0)}}catch(_){}}
{const f=homeTick;homeTick=function(dt,now){const r=f.apply(this,arguments);try{fn232RegTick(dt||0)}catch(e){if(!FN232.err++)console.warn('v232 regalia',e)}return r}}
// partners: the crown rides at the end of the look array (index 20; older versions ignore it)
{const f=mpLookOut;mpLookOut=function(){const a=f.apply(this,arguments);try{if(Array.isArray(a)){while(a.length<20)a.push(0);a[20]=FN232.crown?1:0}}catch(_){}return a}}
{const f=mpLookIn;mpLookIn=function(a){const r=f.apply(this,arguments);try{if(r&&Array.isArray(a))r.fn232=a[20]===1?1:0}catch(_){}return r}}
// ---------------- the talk window ----------------
document.head.insertAdjacentHTML('beforeend',`<style>
#fn232{position:fixed;inset:0;z-index:62;display:flex;align-items:center;justify-content:center;background:rgba(4,2,8,.8)}#fn232.hide{display:none}
#fn232 .win{width:min(560px,96vw);border-color:rgba(200,154,255,.55)}#fn232 .wb{padding:16px 18px;display:grid;gap:12px}
#fn232 .sp{font-family:"IM Fell English",Georgia,serif;font-size:1.02rem;line-height:1.45;color:#eadcff;font-style:italic}
#fn232 .nt{font-size:.8rem;opacity:.82;line-height:1.4}#fn232 .ro{display:grid;gap:4px;font-size:.84rem}#fn232 .ro span.d{opacity:.55;text-decoration:line-through}#fn232 .ro span.n{color:#f0dfb8}
#fn232 .bt{display:grid;gap:8px}#fn232 .bt button{padding:10px 12px;font-family:Cinzel,Georgia,serif;letter-spacing:.04em;text-align:left;cursor:pointer}
#fn232 .bt button small{display:block;font-family:inherit;letter-spacing:0;opacity:.75;font-size:.72rem;margin-top:2px}
#fn232 .bt button.k{border-color:rgba(255,120,120,.6)}#fn232 .bt button.g{border-color:rgba(240,200,110,.7)}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="fn232" class="hide"><div class="win nar"><div class="wh"><h2 id="fn232H"></h2><span class="wsub" id="fn232S"></span><button class="x" id="fn232X" title="Close">✕</button></div>
  <div class="wb"><div class="sp" id="fn232P"></div><div class="ro" id="fn232R"></div><div class="nt" id="fn232N"></div><div class="bt" id="fn232B"></div></div></div></div>`);
function fn232Close(){$('fn232').classList.add('hide')}
$('fn232X').onclick=fn232Close;
function fn232Open(){return !$('fn232').classList.contains('hide')}
// a partner fighting (or waiting) in one of the arenas right now
function fn232Friends(){const out=[];try{if(typeof MP=='undefined'||!MP.on)return out;const L=fn232Roster().concat(fn232Final()||[]);for(const k in MP.rh){const r=MP.rh[k];if(!r.pr)continue;const D=L.find(d=>d.T&&d.T.g===r.pr.rg);if(D)out.push({D,n:mpName(k)})}}catch(_){}return out}
function fn232Go(D){fn232Close();try{if(riding)dismount()}catch(_){}wk232Enter(D,()=>{try{say(D.icon+' <b>'+D.place+'</b>. '+D.name+', '+D.title+' waits. The rift behind you leads back to Duskhold.')}catch(_){}})}
function fn232Draw(view){const H=$('fn232H'),S=$('fn232S'),P=$('fn232P'),R=$('fn232R'),N=$('fn232N'),B=$('fn232B'),own=fn229NpcOwn(),W=fn232Roster(),F=fn232Final();
  R.innerHTML='';N.innerHTML='';B.innerHTML='';const btn=(html,cls,fn)=>{const b=document.createElement('button');b.innerHTML=html;if(cls)b.className=cls;b.onclick=fn;B.appendChild(b);return b};
  const known=FN232.path>0;H.textContent=known?FN232.name:'The Stranger';S.textContent=known?FN232.title:'at the fountain of Duskhold';
  const friends=()=>fn232Friends().forEach(f=>btn('👥 Follow '+mpEsc(f.n)+' to '+f.D.place+'<small>Fight '+f.D.name+' at their side</small>','',()=>fn232Go(f.D)));
  if(!own){P.textContent='“My business is with the one who carried the last of it to me. Not with you. Not yet.”';N.textContent='He came for the hero who poured the last essence. Pour your own to hear his offer.';friends();btn('Leave','',fn232Close);return}
  if(view==='fight'||view==='side'){const k=view==='fight';
    P.textContent=k?'“Then come down, little cup, and try to take back what you poured. I have drunk six Sovereigns. You will be the seventh thing I swallow.”':'“Wise. Four Wardens still keep what is mine: the grove, the storm, the forge and the dawn. Break them for me, one by one, and I will set a crown on you.”';
    N.innerHTML='<b>This choice is final for this hero.</b> '+(k?'You will fight '+FN232.name+' in the Hollow Beneath (level 56). You can leave, grow stronger and come back as often as you need.':'You will fight four Wardens (levels 52 to 55), each harder than the last. Between them you return here to shop, upgrade and level as usual.');
    btn(k?'⚔ I stand against you':'👑 I kneel','k'+(k?'':' g'),()=>{FN232.path=k?1:2;fn232Keep();fn232Draw()});btn('Let me think','',()=>fn232Draw());return}
  if(FN232.path===0){P.textContent='“A thousand years under this stone, waiting for one upright thing to carry it all to me. You did. So you may have what no Sovereign was offered: a choice. Stand with me… or stand in my way.”';
    N.textContent='Whatever you choose, Duskhold and the zones stay open.';
    btn('⚔ Stand against him<small>Follow him down for the last fight</small>','k',()=>fn232Draw('fight'));btn('👑 Kneel to him<small>Hunt the four Wardens who defy him</small>','g',()=>fn232Draw('side'));friends();btn('Not yet','',fn232Close);return}
  if(FN232.path===1){P.textContent='“Still here? The way down is open. I am waiting where you poured them.”';N.textContent='The Hollow Beneath · '+FN232.name+', '+FN232.title+' · level 56. Three phases. Shop and level first if you need to: you can always come back up.';
    if(F)btn('⚔ Descend into the Hollow Beneath<small>The last fight</small>','k',()=>fn232Go(F));friends();btn('Not yet','',fn232Close);return}
  // his road
  W.forEach((D,i)=>{const s=document.createElement('span');s.className=i<FN232.n?'d':i===FN232.n?'n':'';s.textContent=(i<FN232.n?'✓ ':i===FN232.n?'➤ ':'· ')+D.name+', '+D.title+' · '+D.place+' · level '+D.lv;R.appendChild(s)});
  const nx=W[FN232.n];
  if(nx){P.textContent=['“The grove first. Oakenhart has grown fat on what should be mine.”','“The storm next. Maelis thinks the sky is far enough from me.”','“Now the forge. Brassmaw burns my essence for heat. Put it out.”','“One left. Seraphel calls herself my judge. Bring me her verdict.”'][FN232.n]||'“Go.”';
    N.textContent='Between Wardens, shop, upgrade and level as usual. Each rift brings you back here.';btn(nx.icon+' Go to '+nx.place+'<small>'+nx.name+', '+nx.title+' · level '+nx.lv+'</small>','g',()=>fn232Go(nx))}
  else if(!FN232.crown){P.textContent='“All four. Kneel, then. Let them see whose you are.”';btn('👑 Kneel and be crowned','g',()=>{fn232Close();fn232EndB()})}
  else{P.textContent='“My devoted. The fountain runs for us now.”';N.textContent='You wear his crown and his mark.';btn('🎬 See the palace again','',()=>{fn232Close();try{ec232Play('crown',{rp:1})}catch(_){}})}
  friends();btn('Leave','',fn232Close)}
function fn232Talk(){try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}fn232Draw();$('fn232').classList.remove('hide')}
addEventListener('keydown',e=>{if(e.key==='Escape'&&fn232Open()){e.stopPropagation();fn232Close()}},true);
{const f=worldPrompt;worldPrompt=function(){try{const N=FN229.npc;if(N&&N.F.root.visible&&!FN229.run&&!fn232Open()&&!(typeof EC232!='undefined'&&EC232.run)&&Math.hypot(pl.position.x-N.x,pl.position.z-N.z)<3.4)
      return {label:'F · Speak with '+(FN232.path?FN232.name:'the stranger'),fn:fn232Talk}}catch(e){if(!FN232.err++)console.warn('v232 prompt',e)}return f.apply(this,arguments)}}
// ---------------- cheats (Settings → Cheats, behind the password) ----------------
{const box=$('cheatBox');if(box){box.insertAdjacentHTML('beforeend','<div class="chr"><span>👁 The Voice\'s offer<small>Reset the choice, or mark the next Warden beaten</small></span><span class="chb"><button id="fn232C0">Reset</button> <button id="fn232C1">+1 Warden</button></span></div>');
  const ok=()=>{try{if(typeof CHU!='undefined'&&!CHU.on){CHU.deny();return false}}catch(_){}return true};
  $('fn232C0').onclick=()=>{if(!ok())return;FN232.path=0;FN232.n=0;FN232.won=0;FN232.crown=0;try{fn232Regalia(pl,0);fn229Npc();MP.lastPres=''}catch(_){}fn232Keep();say('👁 The choice is open again.')};
  $('fn232C1').onclick=()=>{if(!ok())return;FN232.path=2;FN232.n=Math.min(4,FN232.n+1);fn232Keep();say('👁 Wardens beaten: '+FN232.n+'/4.')}}}
