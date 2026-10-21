// v115 review fixes: one check per fix that can be driven without a long fight (python3 probe.py v115_review.js)
(()=>{const R={};const ok=(k,v)=>{R[k]=v};
  // save import: broken codes are rejected without throwing; a code without a position is rejected; a real save decodes
  try{ok('imp_broken',kqsxDecode('KQSAVE1:@@not base64@@')===null)}catch(e){ok('imp_broken','threw '+e.message)}
  try{ok('imp_nopos',kqsxDecode(JSON.stringify({hero:{cls:'warrior',lvl:1}}))===null)}catch(e){ok('imp_nopos','threw '+e.message)}
  try{const s=gameSnapshot();ok('imp_real',!!kqsxDecode(KQSX.pre+btoa(unescape(encodeURIComponent(JSON.stringify(s))))))}catch(e){ok('imp_real','threw '+e.message)}
  // the Portal Road board is not repainted when nothing changed
  try{const a=TWN101.bs;portalRefresh();portalRefresh();ok('board_kept',!!a&&TWN101.bs===a)}catch(e){ok('board_kept','threw '+e.message)}
  // Lay on Hands' cleanse removes slow debuffs and keeps the rest
  try{hero.buffs.push({n:'TSlow',i:'x',s:{mspd:-.4},t:nowP()+9e4},{n:'TFast',i:'x',s:{mspd:.2},t:nowP()+9e4});heroCleanseSlow();
    ok('cleanse',!hero.buffs.some(b=>b.n=='TSlow')&&hero.buffs.some(b=>b.n=='TFast'));hero.buffs=hero.buffs.filter(b=>b.n!='TFast');hsDirty()}catch(e){ok('cleanse','threw '+e.message)}
  // root + slow never makes the speed factor negative
  try{hero.buffs.push({n:'TRoot',i:'x',s:{mspd:-1},t:nowP()+9e4},{n:'TSlow2',i:'x',s:{mspd:-.5},t:nowP()+9e4});hsDirty();const m=HS().mspd;
    ok('root_slow',{mspd:+m.toFixed(2),factor:Math.max(0,1+m)});hero.buffs=hero.buffs.filter(b=>b.n!='TRoot'&&b.n!='TSlow2');hsDirty()}catch(e){ok('root_slow','threw '+e.message)}
  // rings share one shape and free their material
  try{const n0=scene.children.length;ring(pl.position,0xffffff,2,10);ring(pl.position,0xffffff,2,10);const rs=scene.children.slice(n0).filter(o=>o.isMesh&&o.geometry===G_RING);ok('ring_shared',rs.length==2)}catch(e){ok('ring_shared','threw '+e.message)}
  // uiOpen: closed now, open with the bag, closed again
  try{const a=uiOpen();$('bag').classList.remove('hide');const b=uiOpen();$('bag').classList.add('hide');ok('uiOpen',[a,b,uiOpen()])}catch(e){ok('uiOpen','threw '+e.message)}
  // legendary items always carry a power
  try{let miss=0;for(let i=0;i<300;i++){const it=genItem(40,{r:4});if(it.r>=4&&!it.lp)miss++}ok('legendary_lp_missing',miss)}catch(e){ok('legendary_lp_missing','threw '+e.message)}
  // health bars share one shape; removing an enemy frees its bar materials
  try{const e=spawnEnemy(Object.keys(EN).find(k=>EN[k].rig&&!k.startsWith('boss')),pl.position.x+6,pl.position.z,5,{});const sh=e.hb.children[0].geometry===G_BAR;removeE(e);ok('bar',{shared:sh,freed:!!e.hb._free})}catch(e){ok('bar','threw '+e.message)}
  // the Realm leftovers are gone; four pooled point lights
  try{let pt=0;scene.traverse(o=>{if(o.isPointLight)pt++});ok('point_lights',pt);ok('realm_gone',typeof BM=='undefined'&&typeof RLT=='undefined')}catch(e){ok('point_lights','threw '+e.message)}
  // the shadow pass never hides the chunk prop container
  try{if(typeof shdPass=='function'){shdPass();ok('psroot_not_hidden',!SHD.hide.includes(PSROOT))}}catch(e){ok('psroot_not_hidden','threw '+e.message)}
  // the boss track sampler trembles on a held pair whose second key carries the amount
  try{const B={P:{a:{j:[0,0,0,0,0,0]}}},S={snap:{}},out={};svSample(B,S,[[0,'a'],[.5,'a','l',.05],[1,'a']],.3,out,1234);ok('tremble',Math.abs(out.j[0])>1e-4||Math.abs(out.j[2])>1e-4)}catch(e){ok('tremble','threw '+e.message)}
  return R})()
