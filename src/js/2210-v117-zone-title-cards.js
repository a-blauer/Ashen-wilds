// ================= v117 zone title cards =================
// Arriving in a zone instance (and in Duskhold the first time) shows one decorated title card in the zone's own style instead of the
// plain text banners (the v56 arrival banner and the v112 second banner are muted): a small kicker (zone · instance), the place name
// in the zone's lettering, an ornament with the zone's emblem, the place's line, and the enemy levels with the recommended power.
var ZT116={mute:0,el:null,tm:0,
  // c1 lettering, c2 glow, c3 deep shade, font, emblem
  Z:[{c1:'#c8ffa0',c2:'#5dff7a',c3:'#0c2410',f:"'IM Fell English SC','Cinzel',Georgia,serif",e:'wisp'},   // Kindlelight: a drowned bog of lantern light
     {c1:'#f6dc8a',c2:'#d0a040',c3:'#2a1e08',f:"'Cinzel Decorative','Cinzel',Georgia,serif",e:'serpent'},// Hillside Crest: serpent folk
     {c1:'#d4f0ff',c2:'#ff8a3a',c3:'#0a1a2a',f:"'Cinzel Decorative','Cinzel',Georgia,serif",e:'eye'},   // Burningeye Summit: ice under a burning sky
     {c1:'#ffd88a',c2:'#ff7a2a',c3:'#2a1206',f:"'Cinzel Decorative','Cinzel',Georgia,serif",e:'sun'},   // Searing Sands
     {c1:'#c8fff0',c2:'#5affc8',c3:'#061a16',f:"'Pirata One','Cinzel',Georgia,serif",e:'cross'},        // The Dirge: a haunted graveyard
     {c1:'#ffb0b0',c2:'#e0102a',c3:'#2a0408',f:"'Pirata One','Cinzel',Georgia,serif",e:'bat'}],         // The Citadel: the vampire court
  town:{c1:'#f6dc98',c2:'#fb923c',c3:'#1a1008',f:"'Cinzel Decorative','Cinzel',Georgia,serif",e:'keep'},
  E:{wisp:'<path d="M12 2.5c3.2 4.2 5.2 6.6 5.2 9.6a5.2 5.2 0 0 1-10.4 0c0-3 2-5.4 5.2-9.6z"/><circle cx="12" cy="12.6" r="2.1" fill="var(--zc3)"/>',
     serpent:'<path d="M3 15.5c2.6-5 5.4 1.8 8.2-3.4s5.6-4.6 7.4-1.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="19.4" cy="10.2" r="1.7"/>',
     eye:'<path d="M2 12c4.4-6.4 15.6-6.4 20 0-4.4 6.4-15.6 6.4-20 0z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2"/>',
     sun:'<circle cx="12" cy="12" r="4.2"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></g>',
     cross:'<path d="M10.8 2.5h2.4v6.2h5.2v2.4h-5.2v10.4h-2.4V11.1H5.6V8.7h5.2z"/>',
     bat:'<path d="M12 8.2c.8-1.6 1.8-1.8 1.8-1.8l.7 1.9c2.3-1.2 5.6-.9 7.5 2-2-.2-3.1.9-3.2 2.9-1.2-1-3.2-.8-4 1-1-.9-2-.9-2.8.2-.8-1.1-1.8-1.1-2.8-.2-.8-1.8-2.8-2-4-1-.1-2-1.2-3.1-3.2-2.9 1.9-2.9 5.2-3.2 7.5-2l.7-1.9s1 .2 1.8 1.8z"/>',
     keep:'<path d="M5.5 21V8.5h2.2V5.2h2.1v3.3h4.4V5.2h2.1v3.3h2.2V21h-4.3v-4.6a2.2 2.2 0 0 0-4.4 0V21z"/>'}};
function zt116Orn(e){return `<div class="ztd"><i></i><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ZT116.E[e]||''}</svg><i></i></div>`}
function zt116Esc(s){return String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c])}
function zt116Show(T,kick,title,sub,foot,cls){
  let h=ZT116.el;if(!h){h=ZT116.el=document.createElement('div');h.id='ztc116';($('stage')||document.body).appendChild(h)}
  clearTimeout(ZT116.tm);h.className='';void h.offsetWidth;
  h.style.cssText=`--zc1:${T.c1};--zc2:${T.c2};--zc3:${T.c3};--zf:${T.f}`;
  h.innerHTML=`<div class="ztk">${zt116Esc(kick)}</div><div class="ztt">${zt116Esc(title)}</div>${zt116Orn(T.e)}<div class="zts">${zt116Esc(sub)}</div>${foot?`<div class="ztf">${foot}</div>`:''}`;
  h.className='on '+(cls||'');ZT116.tm=setTimeout(()=>{h.className=''},5200)}
function zt116Ins(I){if(!I||!PMAP[I.z])return;const p=PMAP[I.z],T=ZT116.Z[I.z]||ZT116.Z[0],t=typeof TH112!='undefined'&&TH112&&TH112.byG?TH112.byG[I.g]:null;
  let kick,title,sub;
  if(I.den){const B=BOSSES[I.z]||{};kick=p.n+' · Sovereign’s Den';title=B.name||'The Den';sub=B.title||p.sub}
  else if(I.tri){kick=p.n;title='Wave Trial';sub=p.sub}
  else{kick=p.n+' · '+(['First','Second','Third'][I.k]||'')+' Reach';title=t?t.nm:p.n;sub=t?t.sub:p.sub}
  let rp=0;try{rp=recPower(I.lv[0])}catch(_){}const pw=typeof heroPower=='function'?heroPower():0;
  const foot=`Enemies Lv ${I.lv[0]}${I.lv[1]!=I.lv[0]?'–'+I.lv[1]:''}${rp?` <span class="${pw<rp?'ztlow':''}">· ⚔ Rec. power ${rp.toLocaleString()}</span>`:''}`;
  zt116Show(T,kick,title,sub,foot,'z'+I.z)}
// the old arrival banners stay silent; the card replaces them
{const f=banner;banner=function(t){if(ZT116.mute)return;if(t==='🏰 DUSKHOLD'){zt116Show(ZT116.town,'The Floating Stronghold','Duskhold','The last stronghold, adrift above the void','The Grand Square · the Portal Road leads south','town');return}return f.apply(this,arguments)}}
{const f=insArrive;insArrive=function(I){ZT116.mute++;let r;try{r=f.apply(this,arguments)}finally{ZT116.mute--}try{zt116Ins(I)}catch(e){console.warn('v116 title',e)}return r}}
// fonts: Cinzel Decorative, IM Fell English SC and Pirata One are in the page's Google Fonts link
document.head.insertAdjacentHTML('beforeend',`<style>
#ztc116{position:absolute;left:50%;top:13%;transform:translateX(-50%);z-index:40;pointer-events:none;text-align:center;min-width:min(560px,92%);max-width:94%;padding:18px 34px 14px;opacity:0;
  background:radial-gradient(ellipse at center,color-mix(in srgb,var(--zc3) 82%,transparent) 0%,color-mix(in srgb,var(--zc3) 55%,transparent) 45%,transparent 72%);color:var(--zc1)}
#ztc116.on{animation:zt116 5.2s ease forwards}
#ztc116 .ztk{font-family:Cinzel,Georgia,serif;font-size:.74rem;letter-spacing:.32em;text-transform:uppercase;opacity:.85;color:color-mix(in srgb,var(--zc1) 70%,#fff 0%);text-shadow:0 1px 2px #000}
#ztc116 .ztt{font-family:var(--zf);font-size:clamp(1.7rem,4.6vw,2.9rem);line-height:1.1;margin:4px 0 2px;letter-spacing:.06em;color:var(--zc1);
  text-shadow:0 0 18px var(--zc2),0 0 36px color-mix(in srgb,var(--zc2) 55%,transparent),0 3px 0 var(--zc3),0 5px 10px #000}
#ztc116.on .ztt{animation:zt116t 1.6s cubic-bezier(.2,.7,.2,1) both}
#ztc116 .ztd{display:flex;align-items:center;justify-content:center;gap:10px;margin:6px auto 6px;width:min(420px,86%);color:var(--zc2);filter:drop-shadow(0 0 6px var(--zc2))}
#ztc116 .ztd i{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--zc2) 30%,var(--zc1));position:relative}
#ztc116 .ztd i:last-child{background:linear-gradient(270deg,transparent,var(--zc2) 30%,var(--zc1))}
#ztc116 .ztd i::after{content:'';position:absolute;top:-3px;width:6px;height:6px;transform:rotate(45deg);background:var(--zc1)}
#ztc116 .ztd i:first-child::after{right:-1px}#ztc116 .ztd i:last-child::after{left:-1px}
#ztc116.on .ztd i{animation:zt116l 1.4s .25s cubic-bezier(.2,.7,.2,1) both}#ztc116 .ztd i:first-child{transform-origin:right}#ztc116 .ztd i:last-child{transform-origin:left}
#ztc116 .ztd svg{width:26px;height:26px;flex:none;color:var(--zc1)}
#ztc116 .zts{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:1rem;color:#f4ecdc;text-shadow:0 1px 3px #000,0 0 10px var(--zc3)}
#ztc116 .ztf{margin-top:6px;font-family:Cinzel,Georgia,serif;font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--zc1) 75%,#fff);text-shadow:0 1px 2px #000}
#ztc116 .ztf .ztlow{color:#ff8a6a}
#ztc116.z4 .ztt,#ztc116.z5 .ztt{letter-spacing:.03em;font-size:clamp(1.9rem,5vw,3.2rem)}
#ztc116.z0 .ztt{animation-name:zt116t,zt116w;animation-duration:1.6s,3.2s;animation-iteration-count:1,infinite;animation-delay:0s,1.6s}
@keyframes zt116{0%{opacity:0;filter:blur(6px)}10%{opacity:1;filter:blur(0)}80%{opacity:1}100%{opacity:0;filter:blur(2px)}}
@keyframes zt116t{0%{letter-spacing:.5em;opacity:0}100%{letter-spacing:.06em;opacity:1}}
@keyframes zt116l{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}
@keyframes zt116w{0%,100%{text-shadow:0 0 18px var(--zc2),0 0 36px color-mix(in srgb,var(--zc2) 55%,transparent),0 3px 0 var(--zc3),0 5px 10px #000}50%{text-shadow:0 0 26px var(--zc2),0 0 52px color-mix(in srgb,var(--zc2) 70%,transparent),0 3px 0 var(--zc3),0 5px 10px #000}}
@media (max-width:640px){#ztc116{top:11%;padding:12px 14px 10px}#ztc116 .zts{font-size:.86rem}#ztc116 .ztk,#ztc116 .ztf{font-size:.62rem;letter-spacing:.18em}}
</style>`);
