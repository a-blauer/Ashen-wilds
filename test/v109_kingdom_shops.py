# v109: plots open with Sovereign kills (5, then +2 per kill), outlines on empty open plots, locked plots refused; shop upgrades
# (levels, discount, more/better stock, Steward rows), saves, old saves keep their buildings. Prints PASS/FAIL lines. SHOT=1 screenshots.
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
        print(('PASS ' if ok else 'FAIL ')+name,'=>',json.dumps(r)[:500])
        if not ok:fails.append(name)
        return r
    # ---- plots ----
    T('new game: 5 plots, smith by the fountain',"""()=>[lotN109(),LOT103.filter(l=>lotOpen109(l.id)).map(l=>l.id),SH.pos.smith,KL103.ring&&KL103.ring.count,KL103.stakes,KL103.flags,scene.children.some(o=>o.name=='lotStakes'&&o.visible)]""",
      lambda r:r[0]==5 and sorted(r[1])==sorted(['CW','CE','NW','NE','NM']) and r[2]=='CW' and r[3]==4 and r[4] is None and r[5] is None and not r[6])
    T('outlines on the ground at the free lots',"""()=>{const m=KL103.ring,d=new THREE.Matrix4(),p=new THREE.Vector3(),T=TOWNS[0],o=[];for(let i=0;i<m.count;i++){m.getMatrixAt(i,d);p.setFromMatrixPosition(d);o.push([+(p.x-T.cx).toFixed(1),+(p.z-T.cy).toFixed(1),+(p.y-T.ph).toFixed(3)])}return [o,m.material.color.getHex(),m.material.opacity,m.visible]}""",
      lambda r:len(r[0])==4 and all(abs(q[2]-.045)<1e-3 for q in r[0]) and r[1]==0xffffff and r[2]<.6 and r[3])
    T('locked lot refused',"""()=>{gold=1e6;['wood','stone','fiber','iron','glowcap','bone'].forEach(k=>mats[k]=999);const a=lotFree103('W1'),b=lotFree103('CE');const h0=HS103.h.length;const hb=hsBuy103('D4');
      KM103.pick={kind:'shop',k:'cook',key:'cook'};kmPlace103('E4');const c=shopBuilt('cook');KM103.pick={kind:'shop',k:'cook',key:'cook'};kmPlace103('CE');return [a,b,hb,HS103.h.length-h0,c,shopBuilt('cook'),SH.pos.cook]}""",
      lambda r:r[0] is False and r[1] is True and not r[2] and r[3]==0 and r[4] is False and r[5] is True and r[6]=='CE')
    T('a Sovereign kill opens 2 more',"""()=>{const n0=lotN109();bossDefeated({ar:0});const n1=lotN109();return [n0,n1,sovK109(),lotOpen109('W1'),lotOpen109('E1'),lotOpen109('W2'),KL103.ringN.count,lotCounts109()]}""",
      lambda r:r[0]==5 and r[1]==7 and r[2]==1 and r[3] and r[4] and not r[5] and r[6]==2)
    T('repeat kills keep growing, capped at 31',"""()=>{for(let i=0;i<20;i++)bossDefeated({ar:0});return [sovK109(),lotN109(),LOT103.filter(l=>lotOpen109(l.id)).length]}""",lambda r:r[0]==21 and r[1]==31 and r[2]==31)
    T('save/load keeps kills',"""()=>{SOV109.k=3;const x=x2Save();SOV109.k=0;x2Load(JSON.parse(JSON.stringify(x)));return [x.ksov,sovK109(),lotN109()]}""",lambda r:r==[3,3,11])
    T('old save (no ksov): count = Sovereigns defeated; buildings on locked lots stay',"""()=>{const x=x2Save();delete x.ksov;bossDone.clear();bossDone.add(0);x.kpos=Object.assign({},x.kpos,{alch:'D4'});SH.shop.alch=1;x.shp=Object.assign({},x.shp,{alch:1});
      x2Load(JSON.parse(JSON.stringify(x)));return [sovK109(),lotN109(),SH.pos.alch,lotOpen109('D4'),!!TWN100_S.b.alch]}""",lambda r:r[0]==1 and r[1]==7 and r[2]=='D4' and r[3] and r[4])
    T('pre-v103 save (no kpos): every building gets a lot',"""()=>{const x=x2Save();delete x.kpos;delete x.ksov;bossDone.clear();['magic','cook','alch','merchant','trainer','bard','sage'].forEach(k=>x.shp[k]=1);
      x2Load(JSON.parse(JSON.stringify(x)));return ['smith'].concat(SHOPS.map(o=>o.k)).map(k=>[k,SH.pos[k]||null,!!(k=='smith'||TWN100_S.b[k])])}""",lambda r:all(q[1] and q[2] for q in r if q[0]!='stable'))
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
