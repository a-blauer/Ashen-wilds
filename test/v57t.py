import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:700])
    P('grades',"()=>{const n0=party.length,cnt={};for(let i=0;i<400;i++){const c=hatch(Object.assign(rollEgg(1),{basic:true}));IVK.forEach(k=>{const g=grade(ivOf(c,k))[1];cnt[g]=(cnt[g]||0)+1})}party.length=n0;return cnt}")
    P('xp',"()=>{hero.lvl=5;const e=spawnEnemy('goo',pl.position.x+50,pl.position.z,5,{});const a=gainXP(e);e.wv=1;const b=gainXP(e);removeE(e);return [a,b]}")
    # v88: abilities are unlocked with ability points in the Abilities tab (K → Abilities)
    P('skills',"()=>{hero.lvl=15;hsDirty();const before=heroSkills().map(s=>s.n);openAbil();const b=document.querySelector('[data-kqsbuy=\"Shockwave\"]');b.click();const after=heroSkills().map(s=>s.n);KQS.sel='Shockwave';rX();document.querySelector('.kqs-det [data-kqseq][data-kqsk=\"0\"]').click();const after2=heroSkills().map(s=>s.n);return [before,after,after2,tpFree(),apFree()]}")
    pg.wait_for_timeout(500)
    pg.screenshot(path=play.TMP+'/sk.png',timeout=120000,animations='disabled')
    P('castnew',"()=>{closeX();$('tal').classList.add('hide');hero.mp=999;hero.cd={};const i=heroSkills().findIndex(s=>s.n=='Shockwave');cast(i);return [i,hero.cd['s'+i]]}")
    P('consume',"()=>{const a=party[0];a.l=7;const iv0=IVK.map(k=>+ivOf(a,k).toFixed(3));const b=hatch(Object.assign(rollEgg(3),{basic:true}));$('fz').classList.remove('hide');sel=[0];fOpt='con';rF();const bt=[...document.querySelectorAll('[data-fcon]')].find(x=>+x.dataset.fcon===party.indexOf(b));bt&&bt.click();$('doF').click();return [iv0,IVK.map(k=>+ivOf(a,k).toFixed(3)),party.includes(b),a.l]}")
    pg.screenshot(path=play.TMP+'/fz.png',timeout=120000,animations='disabled')
    P('fuse',"()=>{const a=party[0];a.l=9;const b=hatch(Object.assign({id:uid++,sp:a.g[0],tier:0,pa:1,tag:TAGS[a.g[0]]},{basic:true}));sel=[0,party.indexOf(b)];fOpt='std';rF();$('doF').click();return [a.l,party.includes(b)]}")
    ev("()=>{$('fz').classList.add('hide');window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=3},100)}")
    for i in range(6):
        ev("()=>{const p=PMAP[%d];toPos(p.path[60][0],p.path[60][1]);camPitch=.42;camDist=11;snapCam()}"%i);pg.wait_for_timeout(7000)
        pg.screenshot(path=play.TMP+'/atm%d.png'%i,timeout=120000,animations='disabled')
        P('wild%d'%i,"()=>[wildCount(pl.position),enemies.filter(e=>!e.dead&&!e.boss&&e.camp).length,ZA.cur]")
play.run(s,w=1000,hh=620)
