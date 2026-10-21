# v109: the kingdom grows with every new Sovereign (stage = Sovereigns defeated, first kills only, 0..5): the walls move south
# (x ±20, south wall z 11..51), 5 plots then +3 per stage (20); outlines on empty open plots; locked plots refused; old saves
# get the stage their buildings need; turning buildings (doors stay reachable); decorations and dressing clear of every lot and
# door at every stage; shop upgrades (levels, discount, more/better stock, Steward rows). Prints PASS/FAIL lines. SHOT=1 screenshots.
import play,json,os
rnd=lambda x:int(x+.5)  # JS Math.round
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    shot=os.environ.get('SHOT')
    if not shot: ev("()=>{POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    fails=[]
    def T(name,js,check):
        r=ev(js);ok=False
        try: ok=check(r)
        except Exception as e: print('check error',e)
        print(('PASS ' if ok else 'FAIL ')+name,'=>',json.dumps(r)[:600])
        if not ok:fails.append(name)
        return r
    ev("""()=>{window.WALLS=()=>{const T=TOWNS[0],F=kf109(),t=(x,z)=>MAP[T.cy+z][T.cx+x];return [F.s,F.SZ,t(0,F.SZ),t(5,F.SZ),t(F.WX,0),t(-F.WX,5),t(0,F.SZ-1),t(5,F.SZ+2),t(0,F.SZ+3),t(10,F.SZ-1)]}}""")
    # ---- the kingdom's size ----
    T('new game: stage 0, small walls, 5 plots, smith by the fountain',"""()=>[WALLS(),lotN109(),LOT103.filter(l=>lotOpen109(l.id)).map(l=>l.id),SH.pos.smith,KL103.ring&&KL103.ring.count,kfDoors109(),areaName()]""",
      lambda r:r[0]==[0,11,'P','W','W','W','P','.','P','P'] and r[1]==5 and sorted(r[2])==sorted(['CW','CE','NW','NE','NM']) and r[3]=='CW' and r[4]==4 and r[5]==[])
    T('outside the walls: the outskirts (wild props, no paving)',"""()=>{const T=TOWNS[0];toPos(T.cx+10,T.cy+16);const a=areaName(),w=KF109.wsel.L.length,c=KF109.wcol.length;toPos(T.sp[0],T.sp[1]);
      return [a,w,c,KF109.wsel.L.every(p=>!(Math.abs(p.x)<22&&p.z<13&&p.z>-23)),T.pave.count]}""",lambda r:'Outskirts' in r[0] and r[1]>100 and r[2]>20 and r[3])
    T('locked lot refused',"""()=>{gold=1e6;['wood','stone','fiber','iron','glowcap','bone'].forEach(k=>mats[k]=999);const a=lotFree103('S1W'),b=lotFree103('CE');const h0=HS103.h.length;const hb=hsBuy103('S1M');
      KM103.pick={kind:'shop',k:'cook',key:'cook'};kmPlace103('S1E');const c=shopBuilt('cook');KM103.pick={kind:'shop',k:'cook',key:'cook'};kmPlace103('CE');return [a,b,hb,HS103.h.length-h0,c,shopBuilt('cook'),SH.pos.cook]}""",
      lambda r:r[0] is False and r[1] is True and not r[2] and r[3]==0 and r[4] is False and r[5] is True and r[6]=='CE')
    T('first Sovereign: the walls move out, 3 more plots',"""()=>{const T=TOWNS[0];toPos(T.cx+3,T.cy+16);bossDefeated({ar:0});const w=WALLS();const o=[w,lotN109(),['S1W','S1M','S1E'].map(lotOpen109),lotOpen109('S2W'),KL103.ringN.count,lotCounts109(),areaName(),kfDoors109()];toPos(T.sp[0],T.sp[1]);return o}""",
      lambda r:r[0]==[1,21,'P','W','W','W','P','.','P','P'] and r[1]==8 and all(r[2]) and not r[3] and r[4]==3 and 'Outskirts' not in r[6] and r[7]==[])
    T('the same Sovereign again: nothing changes',"""()=>{bossDefeated({ar:0});bossDefeated({ar:0});return [kf109().s,lotN109()]}""",lambda r:r==[1,8])
    T('every Sovereign: 20 plots, walls at z 51',"""()=>{for(let i=1;i<6;i++)bossDefeated({ar:i});return [WALLS(),lotN109(),LOT103.filter(l=>lotOpen109(l.id)).length,KF109.SZ]}""",
      lambda r:r[0][:2]==[5,51] and r[0][2]=='P' and r[0][3]=='W' and r[1]==20 and r[2]==20)
    T('stage 5: road and gate line up with the Portal Road',"""()=>{const T=TOWNS[0],t=(x,z)=>MAP[T.cy+z][T.cx+x];return [t(0,51),t(0,52),t(1,52),t(-1,53)]}""",lambda r:r[0]=='P' and all(c in 'Pp.' for c in r[1:]))
    T('save/load: the stage follows the Sovereigns',"""()=>{const x=x2Save();bossDone.clear();bossDone.add(0);bossDone.add(1);x.bossDone=[0,1];x2Load(JSON.parse(JSON.stringify(x)));return [kf109().s,WALLS()[1],lotN109()]}""",lambda r:r==[2,29,11])
    T('old v108 save: 14 buildings on old lot ids, 1 Sovereign -> the stage that fits them, all placed, doors reachable',"""()=>{const x=x2Save();bossDone.clear();bossDone.add(0);
      x.kpos={smith:'W1',magic:'NM',cook:'W3',alch:'W2',bard:'W4',merchant:'E1',sage:'E2',trainer:'E3',stable:'E4','u:train':'CE','u:tower':'NE','u:treas':'NW','u:den':'SW','u:hatch':'SE'};delete x.krot;
      x.shp={};['magic','cook','alch','merchant','trainer','bard','sage','stable'].forEach(k=>x.shp[k]=1);x.sh={train:1,tower:1,treas:1,den:1,hatch:1,walls:1};
      x2Load(JSON.parse(JSON.stringify(x)));const keys=['smith'].concat(SHOPS.map(o=>o.k),UPK103.map(k=>'u:'+k));return [kf109().s,keys.map(k=>[k,SH.pos[k]||null]),kfDoors109(),new Set(Object.values(SH.pos)).size]}""",
      lambda r:r[0]==3 and all(q[1] for q in r[1]) and r[2]==[] and r[3]==len(r[1]))
    # ---- turning buildings ----
    T('turn the Blacksmith: model, footprint and door turn with it',"""()=>{const T=TOWNS[0],q=TWN100_SH.find(s=>s.k=='smith'),ry0=q.ry,d0=lotDoor103(lotOf103('smith')),t0=KL103.own.smith.slice().sort().join();
      kfRotate109('smith');const l=lotOf103('smith'),d1=lotDoor103(l),t1=KL103.own.smith.slice().sort().join(),b=TWN100_S.b.smith;toPos(d1[0],d1[1]);const p=TWN100_prompt();toPos(T.sp[0],T.sp[1]);
      return [SH.rot.smith,+(q.ry-ry0).toFixed(3),+(b.rotation.y-l.ry).toFixed(3),d0.map(v=>+v.toFixed(2)),d1.map(v=>+v.toFixed(2)),t0!==t1,p&&p.label,kfDoors109()]}""",
      lambda r:r[0] in (1,2,3) and abs(r[2])<1e-3 and r[3]!=r[4] and r[5] and r[6] and 'Blacksmith' in r[6] and r[7]==[])
    T('a door that would face the north wall is skipped',"""()=>{const k=lotKey103('NM')||'u:tower';if(!lotKey103('NM'))lotPut103(k,'NM');const o=[];for(let i=0;i<4;i++){kfRotate109(k);o.push(kfFace109(lotOf103(k).ry))}return [k,o,kfDoors109()]}""",
      lambda r:'north' not in r[1] and r[2]==[])
    T('turns save and load',"""()=>{const k=Object.keys(SH.rot)[0];const x=x2Save();const v=SH.rot[k];SH.rot={};x2Load(JSON.parse(JSON.stringify(x)));return [k,v,SH.rot[k],x.krot[k]]}""",lambda r:r[0] and r[1]==r[2]==r[3])
    T('a house turns too',"""()=>{[0,1,2,3,4,5].forEach(i=>bossDone.add(i));kfApply109();gold=1e7;['wood','stone','fiber','iron','glowcap','bone','petals','crystal'].forEach(k=>mats[k]=9999);if(!HS103.h.length){const id=LOT103.find(l=>lotFree103(l.id)).id;hsBuy103(id)}const g0=HS103.g[0].g.rotation.y;kfRotate109('h:0');const o=HS103.g[0];return [+(o.g.rotation.y-g0).toFixed(3),o.ry===lotOf103('h:0').ry,kfDoors109()]}""",
      lambda r:abs(r[0])>.1 and r[1] and r[2]==[])
    T('Steward: turn buttons',"""()=>{KM103.tab='kingdom';openX('hold');const b=[...document.querySelectorAll('#xw [data-kmrot]')].map(x=>x.dataset.kmrot);const k='u:train';const r0=SH.rot[k]|0;
      const bt=document.querySelector('#xw [data-kmrot="'+k+'"]');if(bt)bt.click();const r1=SH.rot[k]|0;closeX();return [b.length,b.includes('smith'),r0,r1]}""",lambda r:r[0]>=10 and r[1] and r[2]!=r[3])
    # ---- every stage: decorations, dressing and stalls stay off the lots and doors; every door can be reached with everything built ----
    T('all stages clear',"""()=>{const T=TOWNS[0],out=[];DECO103.forEach(D=>SH.deco[D.k]=1);
      for(let st=0;st<=5;st++){bossDone.clear();for(let i=0;i<st;i++)bossDone.add(i);SH.pos={};SH.rot={};SH.shop={};SH.lv={};HS103.h.length=0;HS103.cit.length=0;try{hs103Sync()}catch(_){}x2Load(x2Save());
        const F=kf109(),lots=LOT103.filter(l=>l.st<=st),doors=lots.map(l=>lotDoor103(l));
        const mine=new Set([].concat(KF109.wardCol,KF109.stallCol,...Object.values(DC103.col),KF109.leg.c.map(q=>q.c),KGD.wcol||[]));
        const bad=T.col.filter(c=>mine.has(c)&&(KGD.wcol||[]).indexOf(c)<0).filter(c=>{const x=c.x-T.cx,z=c.z-T.cy,r=c.r!=null?c.r:Math.max(c.hx,c.hz);
          return lots.some(l=>Math.abs(x-l.x)<3.5+r&&Math.abs(z-l.z)<3.5+r)||doors.some(([dx,dz])=>Math.hypot(T.cx+x-dx,T.cy+z-dz)<1.2+r)||!kfIn109(x,z,-.6)}).map(c=>[+(c.x-T.cx).toFixed(1),+(c.z-T.cy).toFixed(1)]);
        // fill every open lot (shops, upgrades, houses) and check the doors
        SHOPS.forEach(o=>SH.shop[o.k]=1);UPK103.forEach(k=>SH.lv[k]=1);shApply();let n=1+SHOPS.length+UPK103.length;while(LOT103.some(l=>lotFree103(l.id))&&HS103.h.length<HS103_MAX){const id=LOT103.find(l=>lotFree103(l.id)).id;gold=1e7;['wood','stone','fiber','iron','glowcap','bone','petals','crystal'].forEach(k=>mats[k]=9999);if(!hsBuy103(id))break}
        lotSync103();out.push([st,F.SZ,lots.length,Object.keys(SH.pos).length,bad,kfDoors109()])}
      return out}""",lambda r:all(not q[4] and q[5]==[] for q in r) and r[-1][2]==20)
    # ---- shops ----
    T('upgrade the Trading Post at the Steward',"""()=>{gold=1e7;bossDone.clear();[0,1,2,3,4,5].forEach(i=>bossDone.add(i));['wood','stone','fiber','iron','glowcap','bone','petals','crystal','Ectoplasm','Silk Gland','Rock Core'].forEach(k=>mats[k]=9999);
      KM103.tab='kingdom';openX('hold');const b=document.querySelector('#xw [data-shpu=post]');const has=!!b;b.click();const l1=shpL109('post');document.querySelector('#xw [data-shpu=post]').click();closeX();
      return [has,l1,shpL109('post'),[...document.querySelectorAll('#xw [data-shpu]')].length]}""",lambda r:r[0] and r[1]==1 and r[2]==2)
    T('Trading Post: 10 gear, 10% off, note',"""()=>{hero.lvl=30;stock2=null;openShop('m');const n=stock2.gear.length,it=stock2.gear[0],full=Math.round(itVal(it)*1.8),cells=[...document.querySelectorAll('#sb .kqm-cell')].length;
      const note=($('sb').querySelector('.shpnote')||{}).textContent||'';const pr=document.querySelector('#sb [data-b=g0] .gp').textContent;const g0=gold;document.querySelector('#sb [data-b=g0]').click();const paid=g0-gold;
      const mp=document.querySelector('#sb [data-b2=p_mp]'),mc=+mp.dataset.c;$('shop').classList.add('hide');return [n,full,pr,paid,note,mc,40+hero.lvl*4,cells]}""",
      lambda r:r[0]==10 and r[3]==rnd(r[1]*.9) and str(r[3]) in r[2] and '10% off' in r[4] and r[5]==rnd(r[6]*.9) and r[7]>=12)
    T('better rarities with levels',"""()=>{const c=L=>{const n=[0,0,0,0,0];for(let i=0;i<600;i++)n[shpGear109(30,L).r]++;return n};return [c(0),c(3)]}""",lambda r:r[1][0]<r[0][0]*.7 and sum(r[1][2:])>sum(r[0][2:])*1.5)
    T('Magic Shop: more eggs, discount',"""()=>{SH.shop.magic=1;SHP109.lv.magic=3;mstock=null;openShop('x');const n=mstock.eggs.length,eg=mstock.eggs[0],g0=gold;document.querySelector('#mst [data-ms=e0]').click();const paid=g0-gold;$('mshop').classList.add('hide');
      return [n,paid,EGV[eg.tier],townTier(),mstock.eggs.map(e=>e&&e.tier)]}""",lambda r:r[0]==5 and r[1]==rnd(r[2]*.85))
    T('Curio Shop: extra wares, discount',"""()=>{SH.shop.merchant=1;SHP109.lv.merchant=3;visState.stock=null;openX('visitor','merchant');const st=visStock(),btn=[...document.querySelectorAll('#xw [data-vbuy]')];const s=st[1],g0=gold;btn[1].click();
      return [st.length,st.map(q=>q.k),s.p0,g0-gold,!!document.querySelector('#xw .shpnote')]}""",lambda r:r[0]==6 and r[1][3:]==['rune','egg','rune'] and r[3]==rnd(r[2]*.85) and r[4])
    T('Rune Sanctum discount',"""()=>{SH.shop.sage=1;SHP109.lv.sage=2;openX('visitor','sage');const b=document.querySelector('#xw [data-vrune]'),t=b.textContent,g0=gold;b.click();return [t,g0-gold]}""",lambda r:'450' in r[0] and r[1]==450)
    T('Beast Trainer discount',"""()=>{SHP109.lv.trainer=1;const c=party[0];c.l=1;const a=trainCost(c);SHP109.lv.trainer=0;const b=trainCost(c);SHP109.lv.trainer=1;return [a,b]}""",lambda r:r[0]==rnd(r[1]*.95))
    T('Hearth market: higher crops, discount',"""()=>{SH.shop.cook=1;hero.lvl=5;const T0=townTier();SHP109.lv.cook=0;openX('cook');const a=[...document.querySelectorAll('#xw [data-ibuy][data-n=\"1\"]')].map(b=>[b.dataset.ibuy,+b.dataset.c]);SHP109.lv.cook=2;openX('cook');
      const b=[...document.querySelectorAll('#xw [data-ibuy][data-n=\"1\"]')].map(b=>[b.dataset.ibuy,+b.dataset.c]);closeX();hero.lvl=30;return [T0,a.length,b.length,a[0],b.find(q=>q[0]==a[0][0])]}""",
      lambda r:r[2]>r[1] and r[4][1]==rnd(r[3][1]*.9))
    T('Stable discount',"""()=>{SH.shop.stable=1;SHP109.lv.stable=3;openX('stable',0);const t=$('xwB').textContent,g0=gold,b=document.querySelector('#xw [data-mbuy]'),T=MOUNTS[b.dataset.mbuy].t;b.click();closeX();return [g0-gold,MPRICE[T-1],t.includes('15% off')]}""",lambda r:r[0]==rnd(r[1]*.85) and r[2])
    T('shop levels save and load',"""()=>{const x=x2Save();SHP109.lv={};x2Load(JSON.parse(JSON.stringify(x)));return [x.shpu,shpL109('post'),shpL109('magic')]}""",lambda r:r[1]==2 and r[2]==3)
    T('Steward window renders',"""()=>{openX('hold');const B=$('xwB');const t=B.textContent;const o=[t.includes('Trading Post'),t.includes('plots used'),B.querySelectorAll('.kmpip').length];return o}""",lambda r:r[0] and r[1] and r[2]>5)
    if shot:
        ev("()=>{closeX();bossDone.clear();SOV109.k=0;x2Load(Object.assign(x2Save(),{kpos:{smith:'CW'},shp:{},ksov:0}));const T=TOWNS[0];toPos(T.cx+0,T.cy-4);cam&&0}")
        pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/v109_plots_town.png')
        ev("()=>{openX('hold')}");pg.wait_for_timeout(800);pg.screenshot(path=play.TMP+'/v109_steward.png')
        ev("()=>{closeX();SHP109.lv.post=2;stock2=null;openShop('m')}");pg.wait_for_timeout(800);pg.screenshot(path=play.TMP+'/v109_post.png')
    print('FAILS',fails if fails else 'none')
play.run(s)
