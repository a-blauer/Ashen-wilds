#!/usr/bin/env node
// v215: builds the soundtrack listening page (dist/songs/index.html) from the game's own music code, so what the
// owner hears on the page is exactly what the game plays. Run: node tools/songs_page.js
const fs=require('fs'),path=require('path'),R=path.join(__dirname,'..'),J=f=>fs.readFileSync(path.join(R,'src/js',f),'utf8');
const m79=J('0600-v79-music-more-sound-effects-all.js'),t193=J('3580-v193-blade-title.js'),s215=J('3870-v215-place-songs.js');
const cut=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);if(i<0||j<0)throw new Error('marker not found: '+a+' … '+b);return s.slice(i,j)};
const engine=[
 'var SET={mus:.55,sfxV:1},AUD=null,pl=null;function muWant(){return null}',
 cut(m79,'var MU=','// ---------- what should be playing now'),
 cut(t193,'function muCello(','var BT193M='),
 cut(t193,'function muCelesta(','var BT193C='),
 s215].join('\n');
const ZONES=[
 ['Kindlelight','A drowned bog: low, sparse and cold.',[['z0','Field I','The zone’s first song, unchanged.',1],
  ['z0b','Field II · The Glowmire Hollows','Glowing caves. Slow glassy notes over a deep hum, with water drops echoing off the walls.'],
  ['z0c','Field III · The Rotwood','A rotting forest. A low cello sings over a plucked lute while the wind moves through dead trees.'],
  ['z0d','The Den · Argus','Very slow and close. A heartbeat drum, a tolling bell and a low choir that never quite settles.']]],
 ['Hillside Crest','Windswept plains: open and bright.',[['z1','Field I','The zone’s first song, unchanged.',1],
  ['z1b','Field II · Mistmere','Misty lakes. A gentle flute over rolling harp notes.'],
  ['z1c','Field III · The Galecliffs','High cliffs. Faster, with a soaring whistle that leaps upward and gusts of wind behind it.'],
  ['z1d','The Den · The Crest Hydra','The same bright scale turned dark: a slow choir, a heartbeat drum and one uneasy chord that keeps returning.'],
  ['sp_abeksi','Abeksi (the stealth city)','Sneaking music. Short plucked notes with gaps between them, a soft shaker, then a quiet snake-charmer reed.'],
  ['sp_ascent','The Hilltop Ascent (the chase)','A gallop. Driving drums and bass under a bold horn call.']]],
 ['Burningeye Summit','A frozen peak under a burning sky.',[['z2','Field I','The zone’s first song, unchanged.',1],
  ['z2b','Field II · The Rimecaverns','Ice caverns. Slower and crystalline: falling glassy notes, tiny chimes and meltwater drops.'],
  ['z2c','Field III · Stormcrown','The peak in a blizzard. A stern low horn pushing through howling wind.'],
  ['z2d','The Den · The Rime Wraith','Cold and still. Choir, bells, a heartbeat drum and a thin wind.']]],
 ['Searing Sands','Desert: reed pipe and oud.',[['z3','Field I','The zone’s first song, unchanged.',1],
  ['z3b','Field II · The Sunken Temple','A buried temple. A solemn, ceremonial flute over a slow hand drum; the reed answers it.'],
  ['z3c','Field III · The Salt Wastes','Empty salt flats. Long, lonely reed notes over a wide hum, with a faint shimmer.'],
  ['z3d','The Den · Ssith’ra','A slow desert choir over a heartbeat drum and a dry rattle.'],
  ['sp_sandrun','The Sandstorm Run','A race through the storm. Fast hand drums, a racing reed and roaring wind.']]],
 ['The Dirge','A haunted graveyard: bells and a hollow choir.',[['z4','Field I','The zone’s first song, unchanged.',1],
  ['z4b','Field II · The Drowned Crypts','Flooded vaults. Very slow glassy notes, low bells and dripping water.'],
  ['z4c','Field III · The Ossuary Fields','Plains of bones. A cello lament over a dry, rattling march.'],
  ['z4d','The Den · The Bloated One','The slowest song in the game. A heavy hum, tolling bells and a choir.'],
  ['sp_sanctum','The Hidden Sanctum','A sacred, hidden place. Single bell notes, then a choir, with nothing underneath but a soft glow.'],
  ['sp_channel','The Black Channel','Dark water. Harp notes roll like waves under a low cello.']]],
 ['The Citadel','The vampire court: organ, brass and harpsichord.',[['z5','Field I','The zone’s first song, unchanged.',1],
  ['z5b','Field II · The Outer Ramparts','The siege camp. A march: snare and war drum under a brass call.'],
  ['z5c','Field III · The Inner Keep','Moonlit halls. A quick harpsichord under an elegant, sinister violin line.'],
  ['z5d','The Den · Lord Vaelric','The court’s organ, slow and grand, with a choir and a heartbeat drum.']]]];
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
let rows='';ZONES.forEach(([zn,zd,L])=>{rows+=`<section class="zone"><header><h2>${esc(zn)}</h2><p>${esc(zd)}</p></header><ul>`+
  L.map(([k,n,d,old])=>`<li class="song${old?' old':''}" data-k="${k}"><button class="play" id="play-${k}" aria-pressed="false" aria-label="Play ${esc(n)}"><span class="ico"></span></button><div class="txt"><h3>${esc(n)}${old?'':' <span class="new">new</span>'}</h3><p>${esc(d)}</p><span class="meta"></span></div></li>`).join('')+'</ul></section>'});
const html=`<title>Kill Quest Instance Songs</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@500;700&family=Spectral:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* layout: one reading column; each zone is a ruled section, each song a row with its play button on the left */
:root{color-scheme:dark;--bg:#12110f;--panel:#1b1916;--line:#35302a;--fg:#e6dfd2;--dim:#a39a8a;--ember:#d98a3d;--ember-fg:#1a1208;
  --display:'Grenze Gotisch','Spectral',Georgia,serif;--body:'Spectral',Georgia,'Times New Roman',serif;--mono:'IBM Plex Mono',ui-monospace,Menlo,monospace}
body{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:1.0625rem;line-height:1.5;padding-block:2rem 7rem;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:44rem;margin:0 auto;display:flex;flex-direction:column;gap:2.25rem}
h1{font-family:var(--display);font-weight:700;font-size:2.6rem;line-height:1.05;margin:0;text-wrap:balance}
.lede{color:var(--dim);margin:.6rem 0 0;max-width:38rem}
.opts{display:flex;flex-wrap:wrap;gap:.75rem 1.5rem;align-items:center;margin-top:1.1rem;font-family:var(--mono);font-size:.8rem;color:var(--dim)}
.opts label{display:flex;gap:.5rem;align-items:center;cursor:pointer}
.opts input[type=range]{width:8rem;accent-color:var(--ember)}.opts input[type=checkbox]{accent-color:var(--ember);width:1rem;height:1rem}
.zone header{border-bottom:1px solid var(--line);padding-bottom:.5rem;display:flex;flex-wrap:wrap;gap:.15rem .9rem;align-items:baseline}
h2{font-family:var(--display);font-weight:500;font-size:1.7rem;margin:0}
.zone header p{margin:0;color:var(--dim);font-style:italic}
ul{list-style:none;margin:0;padding:0}
.song{display:flex;gap:.9rem;align-items:flex-start;padding:.85rem 0;border-bottom:1px solid var(--line)}
.txt{min-width:0;flex:1}
h3{font-family:var(--body);font-weight:600;font-size:1.0625rem;margin:0;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.song p{margin:.15rem 0 .25rem;color:var(--dim)}
.old h3{color:var(--dim);font-weight:400}
.new{font-family:var(--mono);font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ember);border:1px solid var(--ember);padding:.05rem .35rem;border-radius:2px}
.meta{font-family:var(--mono);font-size:.72rem;color:var(--dim);font-variant-numeric:tabular-nums}
.play{flex:none;width:2.75rem;height:2.75rem;border-radius:50%;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer;display:grid;place-items:center;margin-top:.1rem}
.play:hover{border-color:var(--ember)}.play:focus-visible,input:focus-visible{outline:2px solid var(--ember);outline-offset:2px}
.ico{width:0;height:0;border-style:solid;border-width:.5rem 0 .5rem .8rem;border-color:transparent transparent transparent currentColor;margin-left:.2rem}
.on .play{background:var(--ember);border-color:var(--ember);color:var(--ember-fg)}
.on .ico{width:.8rem;height:.8rem;border:0;background:currentColor;margin:0}
.on h3{color:var(--fg)}.on .meta{color:var(--ember)}
</style>
<main>
<div>
<h1>Kill Quest: a song for every instance</h1>
<p class="lede">23 new songs, one for each place that had none of its own. Each keeps the musical scale of its zone, so it still sounds like the same land. Press a button to listen. The rows marked "Field I" are the songs you already have, here so you can compare.</p>
<div class="opts"><label><input type="checkbox" id="opt-fight"> Play as if a fight is going on (adds drums)</label><label>Volume <input type="range" id="opt-vol" min="0" max="1" step="0.01" value="0.6"></label></div>
</div>
${rows}
</main>
<script>
${engine}
</script>
<script>
(function(){
var cur=null,ctx=null,timer=null;
var kName={cel:'celesta',bell:'bell',pluck:'plucked strings',flute:'flute',cello:'cello',reed:'reed pipe',horn:'horn',whistle:'whistle',choir:'choir'};
document.querySelectorAll('.song').forEach(function(li){var th=MTH[li.dataset.k],T=th.tune;li.dataset.base=th.bpm+' bpm'+(T?' \\u00b7 melody: '+kName[T.k]+(T.kb?', then '+kName[T.kb]:''):' \\u00b7 melody improvised');li.querySelector('.meta').textContent=li.dataset.base});
function vol(){if(MU.g)MU.g.gain.setTargetAtTime(Math.pow(+document.getElementById('opt-vol').value,1.5)*.9,ctx.currentTime,.05)}
function mark(){document.querySelectorAll('.song').forEach(function(li){var on=li.dataset.k===cur;li.classList.toggle('on',on);li.querySelector('.play').setAttribute('aria-pressed',on);if(!on)li.querySelector('.meta').textContent=li.dataset.base})}
function tick(){if(!MU.th)return;var now=ctx.currentTime;MU.int=document.getElementById('opt-fight').checked?1:0;
  if(MU.t<now-.1)MU.t=now+.05;
  while(MU.t<now+.3){muStep(MU.t);MU.t+=60/MU.th.bpm/4;if(++MU.s>=16){MU.s=0;MU.bar++}}
  var li=document.querySelector('.song.on');if(li){var th=MU.th,T=th.tune,n=th.prog.length,part=T?T.form[Math.floor(MU.bar/n)%T.form.length]:'';
    li.querySelector('.meta').textContent=li.dataset.base+' \\u00b7 bar '+(MU.bar+1)+(T?' \\u00b7 '+(part=='-'?'no melody (resting)':'melody part '+part):'')}}
function start(k){if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();muInit(ctx,ctx.destination)}
  if(ctx.state!='running')ctx.resume();vol();var now=ctx.currentTime;
  MU.xg.gain.cancelScheduledValues(now);MU.xg.gain.setTargetAtTime(0,now,.08);
  cur=k;mark();MU.th=null;clearTimeout(start.to);
  start.to=setTimeout(function(){var n=ctx.currentTime;MU.th=MTH[k];MU.s=0;MU.bar=0;MU.phr=null;MU.t=n+.05;MU.xg.gain.cancelScheduledValues(n);MU.xg.gain.setValueAtTime(0,n);MU.xg.gain.setTargetAtTime(1,n+.05,.3)},450);
  if(!timer)timer=setInterval(function(){try{tick()}catch(e){console.warn(e)}},50)}
function stop(){cur=null;mark();clearTimeout(start.to);MU.th=null;if(ctx)MU.xg.gain.setTargetAtTime(0,ctx.currentTime,.15)}
document.addEventListener('click',function(e){var b=e.target.closest('.play');if(!b)return;var k=b.closest('.song').dataset.k;if(k===cur)stop();else start(k)});
document.getElementById('opt-vol').addEventListener('input',function(){if(ctx)vol()});
})();
</script>
`;
fs.mkdirSync(path.join(R,'dist/songs'),{recursive:true});fs.writeFileSync(path.join(R,'dist/songs/index.html'),html);
console.log('SONGS_OK dist/songs/index.html',html.length,'chars');
