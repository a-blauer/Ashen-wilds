// ================= v223: tidier layouts for the Character window and the Kingdom window's Construction and Villagers tabs =================
// Owner (Nov 2026): "a lot of text there and it could be laid out better and more legible". Layout only: the game rules, every
// button, data attribute (data-at139*, data-kmb, data-kmmv, data-kmrot, data-vltr, data-vljob, data-vlrk …) and click handler are
// unchanged; the v222 Ledger paper and ink stay (lg222Ink still fixes contrast after each change).
//  * Character (C): wider window; stats as three cards (Offense / Defense / Utility) with right-aligned numbers; the 24 small bonus
//    tiles became one table, a line per attribute with its 10 / 25 / 50 / 75 bonuses (unlocked ones tinted and ticked, the ones the
//    staged points would unlock dashed green, the rest plain ink); XP shown as words under the bar; a short footer hint.
//  * Construction: every building is a card: name and level pips on top, then Now / Next / Cost as labelled lines (labels in a
//    column of their own), and on the right its state and lot above its buttons (the main one in wax, Move and ⟳ quieter).
//  * Villagers: cards in up to three columns; jobs are a list of rows (name, then the zones in small print) with a dot for the
//    current one; the chosen trade and job are dark ink on a red tint (they were pale on paper); the "how it works" steps and the
//    long footer text of both tabs fold into an "ⓘ How it works" line (click to open).
var V223={help:false};
function v223Esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
// the long footer text folds into a one-line "How it works" (open state kept across redraws)
function v223Help(sum,extra){const f=$('xwF');if(!f)return;const s=f.querySelector(':scope>.dtl');if(!s||f.querySelector('.v223-help'))return;
  const d=document.createElement('details');d.className='v223-help';d.open=V223.help;d.innerHTML='<summary>ⓘ '+sum+'</summary>';s.before(d);
  if(extra)d.appendChild(extra);d.appendChild(s);d.addEventListener('toggle',()=>{V223.help=d.open})}

// ---------------- Character window ----------------
function ch223Bonus(){const P=atr139Cur();
  const rows=ATR139.K.map(k=>{const D=ATR139.D[k],v=P[k]|0,p=ATR139.pend[k]|0;
    return `<div class="ch223-br" style="--ac:${D.col}"><div class="ch223-ba"><span class="ch223-bi">${D.i}</span><b>${D.n}</b><em>${v}${p?' +'+p:''}</em></div>`+
      D.T.map(t=>{const on=v>=t[0],nw=!on&&v+p>=t[0];
        return `<div class="ch139-bn ch223-bc${on?' on':nw?' nw':''}" title="${v223Esc(D.n+' '+t[0]+': '+t[2]+(on?' (unlocked)':nw?' (unlocks when you Apply)':''))}"><i>${t[0]}</i><span>${t[2]}</span></div>`}).join('')+'</div>'}).join('');
  return `<div class="ch139-sec ch223-bsec"><div class="ch139-st">✦ Attribute bonuses <small>points in one attribute unlock these</small></div><div class="ch223-bt">${rows}</div></div>`}
{const f=ch139Stats;ch139Stats=function(){let h=f.apply(this,arguments);try{
    const b=h.indexOf('Attribute bonuses');if(b>=0){const i=h.lastIndexOf('<div class="ch139-sec">',b);if(i>=0)h=h.slice(0,i)}
    const j=h.indexOf('<div class="ch139-sec">');if(j>=0)h=h.slice(0,j)+'<div class="ch223-cards">'+h.slice(j)+'</div>';
    h+=ch223Bonus()}catch(e){console.warn('v223 character',e)}return h}}
{const f=ch139Render;ch139Render=function(){const r=f.apply(this,arguments);try{
    const w=$('tal'),win=w&&w.querySelector('.win');if(win)win.classList.add('ch223w');
    const id=$('ch139Id');if(id&&!id.querySelector('.ch223-xpt')){const mx=hero.lvl>=MAXLV,need=needH(hero.lvl),pc=mx?100:Math.min(100,Math.floor(100*hero.xp/need));
      id.insertAdjacentHTML('beforeend',`<div class="ch223-xpt">${mx?'Max level':pc+'% to level '+(hero.lvl+1)+' <span>· '+(hero.xp|0).toLocaleString()+' / '+need.toLocaleString()+' XP</span>'}</div>`)}
    const ti=$('talInfo');if(ti)ti.textContent='+ stages a point (Shift: 5) · Apply keeps them · 10, 25, 50 and 75 points in one attribute unlock a bonus'}catch(e){console.warn('v223 character',e)}return r}}

// ---------------- Construction tab ----------------
function km223Rows(){document.querySelectorAll('#xwB .kmrw').forEach(r=>{if(r.dataset.v223)return;r.dataset.v223='1';
  const rn=r.querySelector(':scope>.rn'),ra=r.querySelector(':scope>.ra');if(!rn||!ra)return;
  const sm=rn.querySelector(':scope>small'),hd=document.createElement('div');hd.className='km223-h';
  [...rn.childNodes].forEach(n=>{if(n!==sm)hd.appendChild(n)});rn.prepend(hd);
  if(sm){const L=sm.innerHTML.split(/<br\s*\/?>/i).map(s=>s.trim()).filter(Boolean);
    sm.innerHTML=L.map(l=>{const m=/^(Now|Next|Cost):\s*/.exec(l);
      return m?`<span class="km223-l"><i>${m[1]}</i><span>${l.slice(m[0].length)}</span></span>`:`<span class="km223-l km223-p"><span>${l}</span></span>`}).join('');
    sm.classList.add('km223-d')}
  const st=document.createElement('div'),bt=document.createElement('div');st.className='km223-st';bt.className='km223-b';
  [...ra.childNodes].forEach(n=>{(n.nodeType==1&&n.tagName=='BUTTON'?bt:st).appendChild(n)});
  if(st.textContent.trim())ra.appendChild(st);if(bt.children.length)ra.appendChild(bt);
  bt.querySelectorAll('[data-kmmv],[data-kmrot]').forEach(b=>b.classList.add('km223-q'))})}
{const f=XR.hold;XR.hold=function(){const r=f.apply(this,arguments);try{
    const t=KM103.tab;if(t!='deco'&&t!='vill'){km223Rows();v223Help('How building works')}
    else if(t=='vill'){const how=$('xwB').querySelector('.vlhow');v223Help('How villagers work',how)}}catch(e){console.warn('v223 kingdom',e)}return r}}

// ---------------- Villagers tab ----------------
function vl223Jobs(){document.querySelectorAll('#xwB .vljob').forEach(b=>{if(b.dataset.v223)return;b.dataset.v223='1';
  const m=/^([\s\S]*?)\s*\(([^()<>]*)\)(\s*(?:<small>[^<]*<\/small>)?\s*)$/.exec(b.innerHTML);   // "Job (zones)" + an optional "rank N" note
  b.innerHTML=m?`<span class="vj-n">${m[1]}${m[3]}</span><small class="vj-z">${m[2]}</small>`:`<span class="vj-n">${b.innerHTML}</span>`})}
{const f=vlRender116;vlRender116=function(){const r=f.apply(this,arguments);try{vl223Jobs()}catch(e){console.warn('v223 villagers',e)}return r}}

document.head.insertAdjacentHTML('beforeend',`<style id="v223css">
/* ---- Character ---- */
html body.kq #tal .win.ch223w{width:min(1180px,100%)!important}
html body.kq #tal .ch139{grid-template-columns:minmax(260px,310px) minmax(0,1fr);gap:22px}
html body.kq #tal .ch139-pvw{height:250px}
html body.kq #tal .ch139-id{margin-top:8px}
html body.kq #tal .ch139-nm{font:400 1.35rem/1.15 'IM Fell English','EB Garamond',Georgia,serif;color:#2a2118}
html body.kq #tal .ch139-id .mut{font-size:.9rem}
html body.kq #tal .ch139-xp{height:6px;width:80%;margin-top:6px;background:rgba(58,44,28,.2)}
html body.kq #tal .ch223-xpt{font-size:.8rem;color:#54473a;margin-top:3px}html body.kq #tal .ch223-xpt span{color:#6e604c}
html body.kq #tal .ch139-ah{font-size:.86rem;margin-top:14px;padding-bottom:3px;border-bottom:1px solid rgba(58,44,28,.35)}
html body.kq #tal .ch139-ah .at139-h{font:italic 400 1.02rem 'IM Fell English','EB Garamond',Georgia,serif;color:#8c2f1f;letter-spacing:0;text-transform:none}
html body.kq #tal .at139-bar{margin:6px 0;font-size:.9rem}
html body.kq #tal .at139-g{gap:5px}
html body.kq #tal .at139{padding:6px 8px;font-size:.95rem}
html body.kq #tal .ch139-info{font-size:.86rem;line-height:1.45;color:#2a2118;margin-top:10px;padding:8px 10px;border-left:3px solid #8c2f1f;background:rgba(58,44,28,.06);min-height:0}
html body.kq #tal .ch139-r{display:flex;flex-direction:column;gap:14px;min-width:0}
html body.kq #tal .ch139-pw{padding:8px 14px;border:1px solid rgba(58,44,28,.4);border-radius:2px;background:rgba(58,44,28,.06)}
html body.kq #tal .ch139-pw span{font:italic 400 1.1rem 'IM Fell English','EB Garamond',Georgia,serif;color:#8c2f1f;letter-spacing:.02em}
html body.kq #tal .ch139-pw b{font-size:1.6rem;color:#2a2118;font-variant-numeric:tabular-nums}
html body.kq #tal .ch223-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px 16px;align-items:start}
html body.kq #tal .ch139-sec{min-width:0}
html body.kq #tal .ch223-cards .ch139-sec{padding:6px 12px 6px;border:1px solid rgba(58,44,28,.24);border-radius:2px;background:rgba(58,44,28,.045)}
html body.kq #tal .ch139-st{font:italic 400 1.05rem 'IM Fell English','EB Garamond',Georgia,serif;color:#8c2f1f;letter-spacing:0;text-transform:none;margin:2px 0 4px;padding-bottom:3px;border-bottom:1px solid rgba(58,44,28,.35)}
html body.kq #tal .ch139-st small{font:400 .78rem 'EB Garamond',Georgia,serif;color:#6e604c;margin-left:6px}
html body.kq #tal .ch139-kv{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:.9rem;padding:3px 0;border-bottom:1px dotted rgba(58,44,28,.22)}
html body.kq #tal .ch139-kv:last-child{border-bottom:0}
html body.kq #tal .ch139-kv span{color:#3a2e20;min-width:0}
html body.kq #tal .ch139-kv b{font-variant-numeric:tabular-nums;white-space:nowrap;color:#2a2118}
html body.kq #tal .ch139-kv em.up,html body.kq #tal .ch139-pw em.up{color:#2f6a2a}html body.kq #tal .ch139-kv em.dn{color:#9a2a1a}
html body.kq #tal .ch223-bt{display:grid;gap:5px}
html body.kq #tal .ch223-br{display:grid;grid-template-columns:150px repeat(4,minmax(0,1fr));gap:5px;align-items:stretch}
html body.kq #tal .ch223-ba{display:flex;align-items:center;gap:6px;padding:2px 0 2px 8px;border-left:3px solid var(--ac);color:var(--ac);font-size:.92rem;min-width:0}
html body.kq #tal .ch223-ba b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html body.kq #tal .ch223-ba em{font-style:normal;font-weight:600;color:#2a2118;font-variant-numeric:tabular-nums;white-space:nowrap}
html body.kq #tal .ch223-bc{display:flex;gap:6px;align-items:flex-start;padding:4px 7px;font-size:.8rem;line-height:1.25;border:1px solid rgba(58,44,28,.16);border-radius:2px;background:none;color:#6e604c;opacity:1;min-width:0}
html body.kq #tal .ch223-bc i{font-style:normal;font-weight:700;flex:none;min-width:1.5em;color:#6e604c;font-variant-numeric:tabular-nums}
html body.kq #tal .ch223-bc span{display:inline;font-weight:400;color:inherit;min-width:0}
html body.kq #tal .ch223-bc.on{color:#2a2118;background:color-mix(in srgb,var(--ac) 15%,transparent);border-color:color-mix(in srgb,var(--ac) 55%,#3a2c1c)}
html body.kq #tal .ch223-bc.on i{color:#2a2118}html body.kq #tal .ch223-bc.on i::after{content:'✓';margin-left:2px;color:#2f6a2a}
html body.kq #tal .ch223-bc.nw{color:#2a2118;border:1px dashed #3a6a30;background:rgba(58,106,48,.08)}
@media (max-width:1000px){html body.kq #tal .ch223-br{grid-template-columns:repeat(4,minmax(0,1fr))}html body.kq #tal .ch223-ba{grid-column:1/-1}}
@media (max-width:760px){html body.kq #tal .ch139{grid-template-columns:minmax(0,1fr)}html body.kq #tal .ch139-pvw{height:190px}}
@media (max-width:600px){html body.kq #tal .ch223-br{grid-template-columns:repeat(2,minmax(0,1fr))}html body.kq #tal .ch223-cards{grid-template-columns:minmax(0,1fr)}
  html body.kq #tal .ch139-kv{font-size:.86rem}}
/* ---- footers that fold away ---- */
html body.kq #xw .v223-help{font-size:.82rem;color:#54473a;width:100%}
html body.kq #xw .v223-help summary{cursor:pointer;font-style:italic;color:#8c2f1f;list-style:none;user-select:none}
html body.kq #xw .v223-help summary::-webkit-details-marker{display:none}
html body.kq #xw .v223-help[open] summary{margin-bottom:4px}
html body.kq #xw .v223-help .vlhow{margin:0 0 6px}
/* ---- Construction ---- */
html body.kq #xw .kmlist{gap:6px}
html body.kq #xw .kmrw{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 14px;align-items:start;padding:9px 10px 9px 12px;margin-bottom:6px;
  border:1px solid rgba(58,44,28,.2);border-left:3px solid var(--rc);border-radius:2px;background:rgba(58,44,28,.035)}
html body.kq #xw .kmrw .rn{display:block;min-width:0;font-size:.9rem}
html body.kq #xw .km223-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px;font-size:1.04rem;line-height:1.2}
html body.kq #xw .km223-h b{font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;font-size:1.1rem}
html body.kq #xw .km223-h .kmpip{font-size:.85rem;color:#8a5a12;letter-spacing:2px}
html body.kq #xw .kmrw small.km223-d{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 10px;margin-top:5px;font-size:.84rem;line-height:1.35;color:#3a2e20}
html body.kq #xw .km223-l{display:contents}
html body.kq #xw .km223-l i{font-style:normal;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:#8c2f1f;padding-top:.18em;white-space:nowrap}
html body.kq #xw .km223-l>span{min-width:0}
html body.kq #xw .km223-p>span{grid-column:1/-1;color:#54473a;font-style:italic}
html body.kq #xw .kmrw .ra{display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;gap:6px;flex-wrap:nowrap}
html body.kq #xw .km223-st{display:flex;gap:8px;align-items:baseline;font-size:.84rem;white-space:nowrap}
html body.kq #xw .km223-b{display:flex;gap:4px;align-items:center;flex-wrap:nowrap}
html body.kq #xw .km223-b button{white-space:nowrap;font-size:.86rem;padding:4px 10px;min-height:30px}
html body.kq #xw .km223-b button.km223-q{background:none;border-color:rgba(58,44,28,.35);padding:4px 8px}
html body.kq #xw .kmplan .kminfo{font-size:.86rem;line-height:1.4}
@media (max-width:560px){html body.kq #xw .kmrw{grid-template-columns:minmax(0,1fr)}html body.kq #xw .kmrw .ra{flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:space-between}}
/* ---- Villagers ---- */
html body.kq #xw .vlgrid{grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr));gap:12px}
html body.kq #xw .vlc{padding:11px 12px;gap:7px;background:rgba(58,44,28,.04);border-color:rgba(58,44,28,.24);border-radius:2px;min-width:0}
html body.kq #xw .vln b{font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;font-size:1.15rem}
html body.kq #xw .vln small{font-size:.8rem}
html body.kq #xw .vls{border-radius:2px}
html body.kq #xw .vld{font-size:.82rem}
html body.kq #xw .vlsec{font:italic 400 .92rem 'IM Fell English','EB Garamond',Georgia,serif;color:#8c2f1f;text-transform:none;letter-spacing:0;border-bottom:1px solid rgba(58,44,28,.25);padding-bottom:1px}
html body.kq #xw .vlsec .mut{font-family:'EB Garamond',Georgia,serif;font-size:.78rem;color:#6e604c}
html body.kq #xw .vltr{font-size:.76rem!important;min-width:0}html body.kq #xw .vltr small{font-size:.7rem}
html body.kq #xw .vltr.on,html body.kq #xw .vljob.on{color:#2a2118!important;background:rgba(140,47,31,.14)!important;border-color:#8c2f1f!important;opacity:1!important}
html body.kq #xw .vljobs{flex-direction:column;flex-wrap:nowrap;gap:3px;max-height:190px}
html body.kq #xw .vljob{position:relative;display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;border-radius:2px!important;padding:5px 8px 5px 24px!important;font-size:.86rem!important;line-height:1.2}
html body.kq #xw .vljob::before{content:'○';position:absolute;left:8px;top:5px;font-size:.8rem;color:#6e604c}
html body.kq #xw .vljob.on::before{content:'●';color:#8c2f1f}
html body.kq #xw .vljob .vj-z{display:block;font-size:.74rem;color:#54473a;margin-top:1px}
html body.kq #xw .vlft{font-size:.8rem;flex-wrap:wrap}html body.kq #xw .vlft button{white-space:nowrap}
html body.kq #xw .vlsum{gap:6px 8px}
</style>`);
