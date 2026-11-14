// ================= v215: the Cinematics viewer (Settings → Cinematics → Watch) =================
// Owner (Nov 10 2026): "Can you make something where i can view these cinematics?"
// A list of the six zone arrival cinematics (Kindlelight 3800, Hillside Crest 3810, Burningeye Summit · Searing Sands · The Dirge ·
// The Citadel 3860); Watch plays one again from wherever the hero stands. A replay changes nothing that is saved: the "seen" marks
// are put back as they were when it ends, no zone title card follows, and the opening shot starts at the zone's own entrance when
// the hero is elsewhere (3810 and 3860 open on the hero's spot). Not during a Sovereign fight, a Wave Trial, inside a quest level
// (the Sanctum, the Channel, the Ascent…), while dead, or while another cinematic plays. Local only: a co-op partner sees the hero
// standing still meanwhile (as on a first arrival); presence keeps going out.
var CV215={rp:null,save:null,
  L:[{z:0,n:'Kindlelight',s:'The cursed bog · Argus, the Hundred-Eyed'},{z:1,n:'Hillside Crest',s:'The serpent folk · the Crest Hydra'},
    {z:2,n:'Burningeye Summit',s:'The frozen peak · the Rime Wraith'},{z:3,n:'Searing Sands',s:'The buried desert · Ssith’ra the Endless'},
    {z:4,n:'The Dirge',s:'The restless graveyard · the Bloated One'},{z:5,n:'The Citadel',s:'The vampire court · Lord Vaelric'}]};
function cv215Busy(){try{return (typeof IC151!='undefined'&&(IC151.run||IC151.on))||(typeof KC208!='undefined'&&KC208.run)||(typeof HC208!='undefined'&&HC208.run)||(typeof ZC214!='undefined'&&ZC214.run)}catch(_){return true}}
// why it can't play now (null = it can)
function cv215Why(){if(cv215Busy())return 'A cinematic is already playing.';try{if(!party.length)return 'Start or load a game first.';if(hero.hp<=0)return 'Not while you are down.'}catch(_){}
  try{if(typeof AF!='undefined'&&AF)return 'Not during a Sovereign fight.'}catch(_){}try{if(typeof WV!='undefined'&&WV)return 'Not during a Wave Trial.'}catch(_){}
  try{if(typeof sp152Cur=='function'&&sp152Cur())return 'Leave this place first, then watch it.'}catch(_){}return null}
// the entrance of a zone's first instance and the way down its road (the opening shot's spot when the hero is elsewhere)
function cv215Entrance(z){const I=INSL[insG(z,0)],n=I.path[Math.min(I.path.length-1,30)];return {p:new THREE.Vector3(I.en[0],GH(I.en[0],I.en[1]),I.en[1]),yaw:Math.atan2(n[0]-I.en[0],n[1]-I.en[1])}}
function cv215Away(z){try{const I=curIns();return !I||I.z!==z}catch(_){return true}}
function cv215Play(z){const why=cv215Why();if(why){try{say('🎬 '+why)}catch(_){}return false}
  CV215.rp=z;CV215.save={kc:KC208.seen,hc:HC208.seen,zc:ZC214.seen};let ok=false;
  try{if(z===0){kc208Play();ok=!!KC208.run}else if(z===1){ok=hc208Play(null)}else{ok=zc214Play({z,rp:1})}}catch(e){console.warn('cv215 play',z,e)}
  if(!ok)cv215Done();return ok}
// a replay ends: the seen marks as they were
function cv215Done(){const s=CV215.save;CV215.rp=null;CV215.save=null;if(!s)return;try{KC208.seen=s.kc;HC208.seen=s.hc;ZC214.seen=s.zc}catch(_){}}
{const f=kc208End;kc208End=function(){const r=f.apply(this,arguments);if(CV215.rp===0)cv215Done();return r}}
{const f=hc208End;hc208End=function(){const r=f.apply(this,arguments);if(CV215.rp===1)cv215Done();return r}}
{const f=zc214End;zc214End=function(){const z=CV215.rp,r=f.apply(this,arguments);if(z!=null&&z>=2&&!ZC214.run)cv215Done();return r}}
// the opening shot from the zone's own entrance when the hero stands somewhere else
{const f=hc208Build;hc208Build=function(){const S=f.apply(this,arguments);try{if(CV215.rp===1&&cv215Away(1)){const E=cv215Entrance(1);S.H=E.p;S.yaw=E.yaw}}catch(_){}return S}}
{const f=zc214Build;zc214Build=function(z){const S=f.apply(this,arguments);try{if(CV215.rp===z&&cv215Away(z)){const E=cv215Entrance(z);S.H=E.p;S.yaw=E.yaw}}catch(_){}return S}}
// no zone title card after a replay (3860 shows it when the hero stands in the zone)
{const f=zt116Ins;zt116Ins=function(){if(CV215.rp!=null||(typeof ZC214!='undefined'&&ZC214.S&&ZC214.S.I&&ZC214.S.I.rp))return;return f.apply(this,arguments)}}

// ---------------- the window: Settings → Cinematics ----------------
document.head.insertAdjacentHTML('beforeend',`<style>
#cv215{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(6,4,3,.86)}#cv215.hide{display:none}
#cv215 .win{width:min(520px,96vw)}#cv215 .li{display:grid;gap:8px}
#cv215 .it{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid rgba(201,162,74,.35);border-radius:6px;background:rgba(0,0,0,.28)}
#cv215 .it .tx{flex:1;min-width:0}#cv215 .it b{display:block;font-family:Cinzel,Georgia,serif;letter-spacing:.04em;color:#f0dfb8}
#cv215 .it i{display:block;font-style:normal;font-size:.74rem;opacity:.75;margin-top:2px}#cv215 .it .ic{font-size:1.5rem;width:1.8em;text-align:center}
#cv215 .it .sn{font-size:.68rem;opacity:.6;margin-top:2px}#cv215 .mut{font-size:.74rem}#cv215 .bad{color:#e07a6a}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="cv215" class="hide"><div class="win nar">
  <div class="wh"><h2>Cinematics</h2><span class="wsub">Watch a cinematic again</span><button class="x" id="cv215Close" title="Close">✕</button></div>
  <div class="wb" style="padding:14px 16px;display:grid;gap:10px"><div class="li" id="cv215L"></div><div class="mut" id="cv215M"></div></div></div></div>`);
$('cv215Close').onclick=()=>$('cv215').classList.add('hide');
function cv215Seen(z){try{if(z===0)return !!KC208.seen;if(z===1)return HC208.seen===1;return zc214Seen(z)}catch(_){return false}}
function cv215Open(){const L=$('cv215L'),M=$('cv215M');M.textContent='';M.className='mut';L.innerHTML='';
  CV215.L.forEach(c=>{const d=document.createElement('div');d.className='it';const ic=(PMAP[c.z]&&PMAP[c.z].ic)||'🎬';
    d.innerHTML=`<span class="ic">${ic}</span><span class="tx"><b>${c.n}</b><i>${c.s}</i><span class="sn">${cv215Seen(c.z)?'Seen on arrival':'Not seen on arrival yet'}</span></span><button>▶ Watch</button>`;
    d.querySelector('button').onclick=()=>{const why=cv215Why();if(why){M.textContent=why;M.className='mut bad';return}
      $('cv215').classList.add('hide');try{$('setw').classList.add('hide')}catch(_){}setTimeout(()=>cv215Play(c.z),60)};L.appendChild(d)});
  $('cv215').classList.remove('hide')}
// v230 (owner, Nov 13 2026: "Move the cinematics previews in options to the cheat menu"): the button is a row in Settings → Cheats
// (inside #cheatBox, so it sits behind the cheat password like every other cheat). Watching still changes nothing in the save.
{const box=$('cheatBox');if(box){box.insertAdjacentHTML('beforeend','<div class="chr"><span>🎬 Cinematics<small>Watch any cinematic again (nothing is saved)</small></span><span class="chb"><button id="cv215B">Watch…</button></span></div>');
  $('cv215B').onclick=()=>{try{if(typeof CHU!='undefined'&&!CHU.on)return CHU.deny()}catch(_){}cv215Open()}}}
