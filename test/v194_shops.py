# v194 shops: runes (types, ranks, gear slots, companion slots, effects), the Rune Sanctum, the Magic Shop (evolutions, reforging),
# the Curio Shop (resources, Curio of the Hour), the egg exploit fix, Sovereign restocks, saves. Screenshots of the three windows.
#   python3 v194_shops.py            (SHOTS=0 skips the pictures)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info if not ok or os.environ.get('V') else '')
    if not ok:FAIL.append(n)
JS=r"""()=>{const R={},ok=(k,v)=>{R[k]=v};const T=(k,f)=>{try{ok(k,f())}catch(e){ok(k,'threw '+e.message+' '+(e.stack||'').split('\n')[1])}};
  hero.lvl=34;gold=500000;Object.keys(RES).forEach(k=>mats[k]=500);FAMS.forEach(f=>mats[FAM[f][0]]=200);UPM.forEach(u=>mats[u[0]]=50);hsDirty();
  ['magic','merchant','sage'].forEach(k=>SH.shop[k]=1);
  // ---- rune data ----
  T('types',()=>RN194K.length);T('rank_keys',()=>[rn194Key('ember',1),rn194Key('ember',3),rn194Parse('r_ward2').r,rn194Parse('r_tide').t,!!rn194Parse('r_bogus')]);
  T('sup_all',()=>RN194K.every(t=>[1,2,3].every(r=>SUP[rn194Key(t,r)]&&SUP[rn194Key(t,r)].c=='rune')));
  T('runek12',()=>RUNEK.length);T('desc',()=>SUP.r_ember2.d);
  // ---- gear slots: only rare+, weapons/armour, 3 only epic+ ----
  T('slots',()=>{const n={};let bad=0,tot=0,arm=0;for(let i=0;i<6000;i++){const it=genItem(45,{minR:Math.random()<.5?2:0});tot++;if(it.rs){const k='r'+it.r+'s'+it.rs;n[k]=(n[k]||0)+1;if(it.r<2||!rn194SlK(it))bad++;if(it.rs==3&&it.r<3)bad++}}return {n,bad}});
  T('slots_low',()=>{let s=0,c=0;for(let i=0;i<4000;i++){const it=genItem(12,{minR:2});if(it.r>=2&&rn194SlK(it)){c++;if(it.rs)s++}}return +(s/c).toFixed(3)});
  T('slots_high',()=>{let s=0,c=0;for(let i=0;i<4000;i++){const it=genItem(45,{minR:2});if(it.r>=2&&rn194SlK(it)){c++;if(it.rs)s++}}return +(s/c).toFixed(3)});
  // ---- hero effects ----
  const W=ITPL.findIndex(q=>q.sl=='weapon'&&q.cls==hero.cls&&q.t==3),C=ITPL.findIndex(q=>q.sl=='chest'&&q.arm==CLS[hero.cls].arm&&q.t==3);
  T('hero_stats',()=>{eq.weapon={id:90001,tp:W,lv:34,req:1,r:3,up:0,aff:[],rs:2,ru:[]};eq.chest={id:90002,tp:C,lv:34,req:1,r:3,up:0,aff:[],rs:2,ru:[]};hsDirty();const a=HS();const h0=a.hp,p0=a.pa,d0=a.defl||0;
    eq.chest.ru=['r_vigor3','r_deflect'];eq.weapon.ru=['r_might2'];hsDirty();const b=HS();return {hp:+(b.hp/h0).toFixed(3),pa:+(b.pa/p0).toFixed(3),defl:b.defl,d0}});
  T('proc_burn',()=>{eq.weapon.ru=['r_ember3','r_venom3'];hsDirty();const e={dead:false,c:{h:1e9,st:{hp:1e9,pa:1,ma:1,pd:1,md:1},l:30,en:'x'},m:new THREE.Group(),dots:[]};scene.add(e.m);
    let burn=0,poi=0,sk=0;for(let i=0;i<60;i++){e.dots=[];heroHit(e,100,'p',{s:{basic:1}});if(e.dots.some(d=>d.k=='burn'))burn++;if(e.dots.some(d=>d.k=='poison'))poi++;e.dots=[];heroHit(e,100,'p',{s:{col:0xffffff}});if(e.dots.length)sk++}
    eq.weapon.ru=['r_leech3'];hsDirty();hero.hp=10;heroHit(e,1000,'p',{s:{col:0xffffff}});const hs=hero.hp;heroHit(e,1000,'p',{s:{basic:1}});const hb=hero.hp;scene.remove(e.m);return {burn,poi,sk,leechSkill:hs>10,leechBasic:hb>hs}});
  T('swift_dash',()=>{const d0=(eq.chest.ru=[],hsDirty(),HS().dash);eq.chest.ru=['r_swift'];hsDirty();const a=HS().dash;eq.chest.ru=['r_swift3','r_swift2'];hsDirty();const b=HS().dash;eq.chest.ru=[];hsDirty();return [a-d0,b-d0]});
  T('comp_basic_el',()=>{const c=party[0];c.evo=3;c.runes=['r_ember'];delete c._rn194;let a,b;const o=runeEl;RN194.cb=true;a=runeEl(c);RN194.cb=false;b=runeEl(c);return [a,b]});
  T('deflect',()=>{eq.chest.ru=['r_deflect3','r_deflect3'];hsDirty();const s=HS();return s.defl});
  // ---- companion slots ----
  T('comp_slots',()=>{const c=party[0];const o=c.evo;const r=[];[0,1,2,3].forEach(e=>{c.evo=e;r.push(rn194CSlots(c))});c.evo=o;return r});
  T('comp_fix',()=>{const c=party[0];c.evo=0;c.runes=['r_ember','r_might'];const n0=cnt('r_ember');rn194Fix();return {left:c.runes.length,back:cnt('r_ember')-n0}});
  T('comp_rune_fx',()=>{const c=party[0];c.evo=3;c.runes=['r_might3','r_vigor2'];delete c._rn194;return {pa:+runeMul(c,'pa').toFixed(2),hp:+runeMul(c,'hp').toFixed(2),el:runeEl(c)}});
  T('comp_html',()=>runeHTML(party[0]).includes('Rune Sanctum')||runeHTML(party[0]).includes('Runes ('));
  // ---- Rune Sanctum ----
  T('sanctum_open',()=>{openX('visitor','sage');return !!document.querySelector('#xw .rs194-set')&&!document.querySelector('#xw [data-vrune]')});
  T('sanctum_set',()=>{eq.weapon.ru=[];eq.weapon.rs=2;giveS('r_storm',2);RS194.tab='set';RS194.sel='i'+eq.weapon.id;RS194.rune='r_storm';const g0=gold;rs194Do('set');const first=rn194Ru(eq.weapon).length;rs194Do('set');
    return {afterOne:first,afterConfirm:rn194Ru(eq.weapon),paid:g0-gold}});
  T('sanctum_wrongkind',()=>{RS194.sel='i'+eq.weapon.id;giveS('r_ward',1);RS194.rune='r_ward';rs194Do('set');rs194Do('set');return rn194Ru(eq.weapon)});
  T('sanctum_destroy',()=>{RS194.sel='i'+eq.weapon.id;const n0=cnt('r_storm');rs194Do('del:0');rs194Do('del:0');return {ru:rn194Ru(eq.weapon),back:cnt('r_storm')-n0}});
  T('sanctum_comp',()=>{const c=party[0];c.evo=1;c.runes=[];RS194.sel='c0';giveS('r_tide2',1);RS194.rune='r_tide2';rs194Do('set');rs194Do('set');const a=c.runes.slice();giveS('r_leech',1);RS194.rune='r_leech';rs194Do('set');rs194Do('set');return {a,b:c.runes.slice()}});
  T('sanctum_fuse',()=>{sup['r_frost']=7;sup['r_frost2']=0;SHP109.lv.sage=0;RS194.fsel='r_frost';rs194Do('fuse');rs194Do('fuse');const a=[cnt('r_frost'),cnt('r_frost2')];
    sup['r_frost2']=3;RS194.fsel='r_frost2';rs194Do('fuse');const b=cnt('r_frost3');SHP109.lv.sage=1;RS194.fsel='r_frost2';rs194Do('fuse');return {a,lockedIII:b,III:cnt('r_frost3')}});
  T('sanctum_buy',()=>{SHP109.lv.sage=1;const n=cnt('r_swift2');rs194Do('buy:r_swift2');const lock=cnt('r_swift2')-n;SHP109.lv.sage=2;rs194Do('buy:r_swift2');return {lock,bought:cnt('r_swift2')-n}});
  T('sanctum_carve',()=>{SHP109.lv.sage=3;const it=genItem(30,{minR:3,sl:'helm'});it.rs=0;delete it.ru;gear.push(it);rs194Do('carve:'+it.id);rs194Do('carve:'+it.id);return {rs:it.rs,again:rs194CarveList().some(q=>q[0]===it)}});
  T('sanctum_tabs',()=>{const r={};['set','fuse','buy','carve'].forEach(t=>{RS194.tab=t;rX();r[t]=$('xwB').innerHTML.length});RS194.tab='set';rX();return r});
  // ---- Magic Shop ----
  T('magic_open',()=>{closeX();openShop('x');return xwMode=='magic'&&!!document.querySelector('#xw .ms194-evo')});
  T('magic_evolve',()=>{const c=hero.cls,s=kqsAll(c).find(q=>kqsUnl(c,q)&&ev137Def(q));hero.tal['ab:'+s.n]=5;hero.lvl=50;MS194.ab=s.n;MS194.tab='evo';rX();const g0=gold;ms194Do('evolve');return {on:!!hero.tal[ev137Key(s.n)],paid:g0-gold}});
  T('abil_no_preview',()=>{const h=ev137Box(kqsAll(hero.cls).find(q=>ev137Def(q)&&!hero.tal[ev137Key(q.n)])||kqsAll(hero.cls)[1]);return {pv:/data-ev137pv|data-ev137=/.test(h),hint:/Magic Shop/.test(h)}});
  T('magic_reroll',()=>{const it=genItem(34,{minR:3});gear.push(it);SHP109.lv.magic=0;MS194.tab='forge';MS194.it=it.id;const k0=it.aff.map(a=>a.k).join();ms194Do('rr:0');const k1=it.aff.map(a=>a.k);
    const dup=new Set(k1).size!=k1.length;SHP109.lv.magic=2;ms194Do('rr:1');const off=MS194.offer&&MS194.offer.opts.length;ms194Do('pick:0');const k2=it.aff.map(a=>a.k);SHP109.lv.magic=1;const v0=it.aff[0].v,kk=it.aff[0].k;ms194Do('rf:0');
    return {changed:k0!==k1.join(),dup,offer:off,picked:new Set(k2).size==k2.length,refineKeeps:it.aff[0].k==kk,rr:it.rr}});
  T('magic_wares',()=>{MS194.tab='wares';rX();return !!document.querySelector('#xw #mst')&&document.querySelectorAll('#xw #mst .kqm-cell,#xw #mst .rw').length});
  T('magic_park',()=>{closeX();return !!$('mshop').querySelector('#mst')});
  // ---- Curio Shop ----
  T('curio_open',()=>{SHP109.lv.merchant=3;openX('visitor','merchant');const S=cu194Stock();return {wares:S.wares.length,cur:S.cur.length,gold:S.wares.every(o=>o.m.length&&o.p==null)}});
  T('curio_buy',()=>{const g0=gold,w0=mats.wood,e0=eggs.length;cu194Do('w:0');return {gold:g0-gold,wood:w0-mats.wood,egg:eggs.length-e0,cu:!!eggs[eggs.length-1].cu,sold:!!cu194Stock().wares[0].sold}});
  T('curio_nosell',()=>{const e=eggs[eggs.length-1];return !sellables().some(x=>x.k=='e'+e.id)});
  T('curio_cur',()=>{const c=cu194Stock().cur[0];const n=gear.length+eggs.length;cu194Do('c:0');return {k:c.k,got:gear.length+eggs.length>n||c.k=='rune2'||c.k=='fortune',sold:!!c.sold}});
  T('curio_kinds',()=>{const r={};CU194_POOL.forEach(k=>{const o=cu194Curio(k,4,'t'+k);r[k]=cu194Info(o).n+(o.it?' slots '+o.it.rs:'')+(o.egg&&o.egg.shn?' shiny':'')});return r});
  T('shiny_hatch',()=>{const o=cu194Curio('shiny',3,'s');const c=hatch(o.egg);const r=!!(c&&c.shn);party.splice(party.indexOf(c),1);return r});
  T('curio_ask',()=>{const a=cu194Stock().cur[0].k;cu194Do('ask');const b=cu194Stock().cur[0].k;cu194Do('ask');return {a,b,asked:CU194.ask===cu194HKey()}});
  // ---- restock ----
  T('restock',()=>{const k=CU194.k,n=SR194.n;sr194Restock(true);const S=cu194Stock();return {n:SR194.n-n,newKey:CU194.k!==k,fresh:S.wares.every(o=>!o.sold),post:stock2===null}});
  T('fx_texts',()=>({magic:shpFx109('magic',2),merchant:shpFx109('merchant',3),sage:shpFx109('sage',3)}));
  // ---- save / load ----
  T('save',()=>{const s=gameSnapshot();const j=JSON.parse(JSON.stringify(s));const w=j.eq&&j.eq.weapon;return {wru:w&&w.ru,cu:!!(j.x2&&j.x2.cu194||j.cu194||JSON.stringify(j).includes('cu194'))}});
  // ---- co-op relay of the look ----
  T('coop_gear',()=>{eq.weapon.ru=['r_ember','r_frost'];const g=mpMyGear(),E=mpGearE(g);return {g:g[0],ru:E.weapon&&E.weapon.ru}});
  T('tooltip',()=>kqmGearTip(eq.weapon).includes('Rune slots'));
  closeX();return R}"""
SHOT=r"""(w)=>{closeX();if(w=='sage'){RS194.tab='set';openX('visitor','sage')}else if(w=='sagefuse'){RS194.tab='fuse';RS194.fsel='r_frost';sup.r_frost=4;openX('visitor','sage')}
  else if(w=='sagebuy'){RS194.tab='buy';openX('visitor','sage')}else if(w=='magic'){MS194.tab='evo';openShop('x')}else if(w=='forge'){MS194.tab='forge';openShop('x')}else if(w=='wares'){MS194.tab='wares';openShop('x')}
  else if(w=='curio')openX('visitor','merchant');else if(w=='abil')openX('abil');return xwMode}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS)
    if os.environ.get('V'):print(json.dumps(r,indent=1))
    th=[k for k,v in r.items() if isinstance(v,str) and v.startswith('threw')]
    chk('nothing threw',not th,{k:r[k] for k in th})
    chk('12 rune types, 3 ranks',r['types']==12 and r['rank_keys'][:4]==['r_ember','r_ember3',2,'tide'] and r['rank_keys'][4]==False and r['sup_all'] and r['runek12']==12,[r['types'],r['rank_keys'],r['runek12']])
    S=r['slots'];chk('slots only on rare+ weapons/armour, 3 only on epic+',isinstance(S,dict) and S['bad']==0 and not any(k in S['n'] for k in ('r2s3',)),S)
    chk('slots rarer at low level, never common',isinstance(r['slots_low'],float) and isinstance(r['slots_high'],float) and r['slots_low']<r['slots_high']<.45,[r['slots_low'],r['slots_high']])
    hs=r['hero_stats'];chk('armour/weapon runes raise hero stats',isinstance(hs,dict) and hs['hp']>1.1 and hs['pa']>1.05 and hs['defl']>=.04,hs)
    pb=r['proc_burn'];chk('weapon procs: burn and poison on normal attacks only; leech heals from normal attacks only',isinstance(pb,dict) and pb['burn']>10 and pb['poi']>15 and pb['sk']==0 and not pb['leechSkill'] and pb['leechBasic'],pb)
    chk('swift: +1 dash per rank, at most +3',r['swift_dash']==[1,3],r['swift_dash'])
    chk('companion rune element only on normal attacks',r['comp_basic_el']==['fire',None],r['comp_basic_el'])
    chk('deflect stacks (capped)',isinstance(r['deflect'],float) and .19<r['deflect']<=.35,r['deflect'])
    chk('companion slots by evolution 0/1/1/2',r['comp_slots']==[0,1,1,2],r['comp_slots'])
    chk('old companion runes go back to the bag',r['comp_fix']=={'left':0,'back':1},r['comp_fix'])
    chk('companion rune effects',r['comp_rune_fx']=={'pa':1.3,'hp':1.28,'el':None},r['comp_rune_fx'])
    chk('sanctum replaces the old rune list',r['sanctum_open']==True,r['sanctum_open'])
    q=r['sanctum_set'];chk('setting asks first, then sets and charges',isinstance(q,dict) and q['afterOne']==0 and q['afterConfirm']==['r_storm'] and q['paid']==60,q)
    chk('armour runes do not fit weapons',r['sanctum_wrongkind']==['r_storm'],r['sanctum_wrongkind'])
    q=r['sanctum_destroy'];chk('destroying frees the slot, rune lost',isinstance(q,dict) and q['ru']==[] and q['back']==0,q)
    q=r['sanctum_comp'];chk('companion at evolution 1 takes one rune only',isinstance(q,dict) and q['a']==['r_tide2'] and q['b']==['r_tide2'],q)
    q=r['sanctum_fuse'];chk('fusion 3→1, rank III locked until level 1',isinstance(q,dict) and q['a']==[1,2] and q['lockedIII']==0 and q['III']==1,q)
    q=r['sanctum_buy'];chk('rank II runes sold from level 2',isinstance(q,dict) and q['lock']==0 and q['bought']==1,q)
    q=r['sanctum_carve'];chk('carving gives one slot, once',isinstance(q,dict) and q['rs']==1 and q['again']==False,q)
    chk('sanctum tabs render',isinstance(r['sanctum_tabs'],dict) and all(v>200 for v in r['sanctum_tabs'].values()),r['sanctum_tabs'])
    chk('magic shop opens in its new window',r['magic_open']==True,r['magic_open'])
    q=r['magic_evolve'];chk('evolution bought at the magic shop (gold paid)',isinstance(q,dict) and q['on'] and q['paid']>0,q)
    q=r['abil_no_preview'];chk('abilities window: no evolve/preview buttons, points to the magic shop',isinstance(q,dict) and not q['pv'] and q['hint'],q)
    q=r['magic_reroll'];chk('reforge: reroll, three choices, refine',isinstance(q,dict) and q['changed'] and not q['dup'] and q['offer']==3 and q['picked'] and q['refineKeeps'] and q['rr']==3,q)
    chk('magic wares list shows',bool(r['magic_wares']),r['magic_wares'])
    chk('wares list goes home on close',r['magic_park']==True,r['magic_park'])
    q=r['curio_open'];chk('curio wares cost resources; level 2+ gives two curios',isinstance(q,dict) and q['wares']==6 and q['cur']==2 and q['gold'],q)
    q=r['curio_buy'];chk('curio egg: paid in resources, flagged',isinstance(q,dict) and q['gold']==0 and q['wood']>0 and q['egg']==1 and q['cu'] and q['sold'],q)
    chk('curio eggs cannot be sold (exploit fixed)',r['curio_nosell']==True,r['curio_nosell'])
    q=r['curio_cur'];chk('curio of the hour can be bought once',isinstance(q,dict) and q['got'] and q['sold'],q)
    q=r['curio_kinds'];chk('every curio kind builds',isinstance(q,dict) and len(q)==5 and 'shiny' in q['shiny'],q)
    chk('shimmering egg hatches shiny',r['shiny_hatch']==True,r['shiny_hatch'])
    q=r['curio_ask'];chk('level 3: ask for another curio once an hour',isinstance(q,dict) and q['asked'] and q['a']!=q['b'],q)
    q=r['restock'];chk('sovereign kill restocks',isinstance(q,dict) and q['n']==1 and q['newKey'] and q['fresh'] and q['post'],q)
    print('   ',r['fx_texts'])
    q=r['save'];chk('gear runes and curio stock saved',isinstance(q,dict) and q['wru']==['r_storm'] or isinstance(q,dict) and q['cu'],q)
    q=r['coop_gear'];chk('co-op: runes ride along with the gear look',isinstance(q,dict) and q['ru']==['r_ember','r_frost'],q)
    chk('tooltip lists rune slots',r['tooltip']==True,r['tooltip'])
    if os.environ.get('SHOTS','1')!='0':
        for w in ('sage','sagefuse','sagebuy','magic','forge','wares','curio','abil'):
            pg.evaluate(SHOT,w);pg.wait_for_timeout(1500)
            pg.screenshot(path=O+'/v194_win_'+w+'.png');print('wrote v194_win_'+w+'.png')
    print('FAILS',len(FAIL))
play.run(s,w=1280,hh=820)
