// v189 Devotion checks (python3 probe.py v189_devotion.js): levels, tiered stat bonus, earning from kills and feeding,
// the extra modifier slot, the Devoted glow (own model and the co-op look), the fusion warning, the window row, saving.
(()=>{const R={};const ok=(k,v)=>{R[k]=v};
  const mk=(sp,l)=>{const c=mkC(sp,l||30,0,'');ivFix(c);return c};
  // levels
  const t=mk('Foxlet');ok('lv_0',dv189Lv(t)===0);t.dvp=99;ok('lv_99',dv189Lv(t)===0);t.dvp=100;ok('lv_100',dv189Lv(t)===1);
  t.dvp=239;ok('lv_239',dv189Lv(t)===1);t.dvp=240;ok('lv_240',dv189Lv(t)===2);t.dvp=2800;ok('lv_2800',dv189Lv(t)===10);t.dvp=99999;ok('lv_cap',dv189Lv(t)===10);
  // stat bonus by tier at Devotion 10 (and 5)
  [['Foxlet',.40],['Ashwolf',.30],['Emberlynx',.20],['Direfang',.10],['Skollmaw',.05]].forEach(([sp,b])=>{const c=mk(sp);const k=['hp','pa','ma','pd','md'],v0=k.map(q=>cStat(c,q));
    c.dvp=2800;const v1=k.map(q=>cStat(c,q));ok('bonus10_'+sp,k.every((q,i)=>Math.abs(v1[i]/v0[i]-(1+b))<1e-6));
    c.dvp=DV189.need(1)+DV189.need(2)+DV189.need(3)+DV189.need(4)+DV189.need(5);ok('bonus5_'+sp,Math.abs(cStat(c,'pa')/v0[1]-(1+b/2))<1e-6)});
  // modifier slot
  const m=mk('Foxlet');ok('modcap_0',dv189ModCap(m)===5);m.dvp=2799;ok('modcap_9',dv189ModCap(m)===6);
  // earning: kills (active, standing companions only) and feeding
  const a=mk('Foxlet'),b=mk('Ashwolf');party.splice(0,party.length,a,b);a.h=M(a);b.h=M(b);
  const n=actN141();const sp=()=>spawnEnemy(Object.keys(EN).find(k=>EN[k].rig&&!k.startsWith('boss')),pl.position.x+6,pl.position.z,5,{});sp();sp();const e=enemies.find(x=>x&&!x.boss&&!x.trait&&x.ar==null&&!x.sv&&x.c&&x.c.h>0);
  if(e){e.c.h=0;kill(e);ok('kill_active',a.dvp===1);ok('kill_bench',n>1?b.dvp===1:!(b.dvp>0));kill(e);ok('kill_once',a.dvp===1)}else ok('kill_active','no enemy found');
  a.h=0;const e2=enemies.find(x=>x&&x!==e&&!x.boss&&!x.trait&&x.ar==null&&!x.sv&&x.c&&x.c.h>0);if(e2){e2.c.h=0;kill(e2);ok('kill_downed',a.dvp===1)}a.h=1;
  const fk=Object.keys(SUP).find(k=>SUP[k].c=='food');sup[fk]=(sup[fk]||0)+1;const p0=a.dvp||0;feedComp(a,fk);ok('feed',a.dvp===p0+2);
  // level-up keeps the health share and rebuilds the follower at 10
  a.dvp=DV189.need(1)-1;a.h=M(a);dv189Give(a,1);ok('lvup_full_hp',a.h===M(a));
  // glow: own model, the co-op look and the partner's copy
  const g0=cr(mk('Foxlet'));ok('glow_none',!g0.getObjectByName('dv189'));
  const d=mk('Foxlet');d.dvp=2800;ok('glow_own',!!cr(d).getObjectByName('dv189'));
  const L=JSON.parse(JSON.stringify(mpvLookOf(d)));ok('look_field',L.dvd===1);ok('look_field_none',mpvLookOf(mk('Foxlet')).dvd===undefined);
  const pc=mpvLookIn(L);ok('partner_glow',!!(pc&&cr(pc).getObjectByName('dv189')));ok('partner_no_bonus',dv189Bonus(pc)===0);
  // fusion warning
  const x=mk('Foxlet'),y=mk('Foxlet');y.dvp=500;party.push(x,y);const ch=FSM100_check(x,y,'std');ok('fuse_warn',!!(ch&&ch.warn&&ch.warn.some(w=>/Devotion 3 lost/.test(w))));
  const ch2=FSM100_check(y,x,'std');ok('fuse_nowarn',!!(ch2&&!ch2.warn.some(w=>/Devotion/.test(w))));
  // the Companions window row and the Devoted badge
  try{a.dvp=2800;cmpSel=0;$('cmp').classList.remove('hide');KQM.ctab='ov';rC();const row=document.querySelector('#cd .dv189r');ok('ui_row',!!row&&/10 \/ 10/.test(row.textContent)&&/\+40% all stats/.test(row.textContent));
    ok('ui_badge',!!document.querySelector('#cd .dv189t'));a.dvp=150;rC();const r2=document.querySelector('#cd .dv189r');ok('ui_row_prog',!!r2&&/1 \/ 10/.test(r2.textContent)&&/50 \/ 140/.test(r2.textContent));ok('ui_nobadge',!document.querySelector('#cd .dv189t'))}catch(err){ok('ui_row','threw '+err.message)}
  // saving
  try{a.dvp=777;const s=JSON.stringify(gameSnapshot());ok('save',s.includes('"dvp":777'))}catch(err){ok('save','threw '+err.message)}
  const bad=Object.keys(R).filter(k=>R[k]!==true);R.FAILS=bad;return R})()
