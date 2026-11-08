# v207 owner's list (3780): Kindlelight boxes (count, loot, ranged shots break them), monsters attack again soon after a special,
# rounded numbers, Steward list titles, quest k2c, mouse-look back after a window, Hatchery back after a hatch, Abeksi strike rings,
# rooftop residents blind, Abeksi exit card, respawn line, shots follow the ground, swing recovery fills the gap. PASS/FAIL lines.
import play,json
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(600000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    fails=[]
    def clk():
        b=ev("()=>{const r=$('xwClose').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}");pg.mouse.click(b[0],b[1])
    def T(name,js,check):
        try:r=ev(js)
        except Exception as e:r='ERR '+str(e)[:300]
        ok=False
        try:ok=check(r)
        except Exception:ok=False
        print(('PASS ' if ok else 'FAIL ')+name,'=>',json.dumps(r)[:400])
        if not ok:fails.append(name)
        return r
    T('kindlelight boxes',"()=>{const n={};CAMPS.forEach(C=>{try{if(!C.g)buildCamp(C)}catch(e){}const z=String(C.key).split('_')[0];(n[z]=n[z]||[]).push(C.boxes?C.boxes.length:-1)});return n}",
      lambda r:max(r['0'])<=4 and max(r['1'])==10)
    T('ranged shots break boxes',"""()=>{insArrive(PMAP[0].ins[0]);const C=CAMPS.find(C=>C.key=='0_0_0');C.g.visible=true;const hide=()=>enemies.forEach(e=>{if(Math.abs(e.m.position.x-C.x)<200)e.m.position.x+=500});
      C.boxes.forEach(b=>{b.b=0;b.g.visible=true});let tried=0,shots0=0;
      for(const b of C.boxes){if(b.b)continue;for(let k=0;k<12&&!b.b;k++){const a=k/12*6.283,x=b.x+Math.cos(a)*5,z=b.z+Math.sin(a)*5;if(solid(x,z))continue;toPos(x,z);hide();
        const v=V(b.x-pl.position.x,0,b.z-pl.position.z).normalize();BX207.aimT=nowP()+1500;tgt=null;const d=aimDir();if(bx207Pick(v)!==b)continue;tried++;shots.length=0;
        launch(pl.position,d,24,{col:0xffffff,mt:'m',basic:1,home:1},10,.62);for(let i=0;i<30&&shots.length;i++){hide();shotTick(1/15)}}}
      return [C.boxes.filter(b=>b.b).length,C.boxes.length,tried]}""",lambda r:r[0]==r[1])
    T('kindlelight box loot',"()=>{const C=CAMPS.find(C=>C.key=='0_0_0');let g=0,n=0;const d0=drops.length;for(let i=0;i<40;i++){const b=C.boxes[i%C.boxes.length];b.b=0;const g0=gold;brkBox(C,b);g+=gold-g0;n++}return [g/n,drops.length-d0]}",
      lambda r:r[0]<4 and r[1]<40)
    T('special then attack again',"""()=>{const p=pl.position;const e=spawnEnemy('skeleton',p.x+2,p.z,5,{agg:1});if(!e)return 'no spawn';e.agg=1;e.cd=0;mStart(e,pl,'cleave');let n=0;while(e.atk&&n<400){mTick(e,.05,performance.now());n++}
      return [MV.cleave.cd,+e.cd.toFixed(2),!!(e.mcd207&&e.mcd207.cleave>nowP()),ePick(e,['cleave']),ePick(e,['cleave','strike'])]}""",
      lambda r:isinstance(r,list) and r[1]<=1.6 and r[2] and r[3] is None and r[4]=='strike')
    T('rounded numbers',"()=>{dn(pl.position,12.3456,'#fff');const a=$('stage').lastChild.textContent;dn(pl.position,'77.123456!','#fff');return [a,$('stage').lastChild.textContent]}",lambda r:r==['12','77!'])
    T('steward titles',"()=>{openX('hold');const r=[...document.querySelectorAll('#xwB .sec')].map(s=>s.textContent.trim());closeX();return r}",lambda r:not any('Shops' in x or 'Upgrades' in x for x in r))
    T('quest k2c',"()=>{const q=CHQ132_ID.k2c;CHQ132.st.k2c={s:1,p:[0]};const m0=mats.iron||0;chqEv132('oreCry',3,null,0);chqEv132('oreCry',2,null,0);return [q.o,CHQ132.st.k2c.p,CHQ132.st.k2c.s]}",
      lambda r:r[0][0][0]=='oreCry' and r[0][0][1]==5)
    T('k2c old save',"()=>{x2Load({chq:{st:{k2c:{s:1,p:[6,3]}}}});return CHQ132.st.k2c&&CHQ132.st.k2c.p}",lambda r:r==[3])
    T('respawn line gone',"()=>{banner('X','Back where you left off','Fallen creatures return 50 seconds after they die');const b=$('banner')||document.querySelector('.banner');return b?b.textContent:document.body.innerText.includes('Fallen creatures return')?'still':'gone'}",lambda r:'Fallen creatures' not in str(r))
    # mouse-look: on, a window opens (it turns off), the window closes with a click: back on
    ev("()=>{orbStart({clientX:400,clientY:260},1);openX('hold')}");pg.wait_for_timeout(700)
    T('mouse-look off in a window',"()=>!!orb",lambda r:r is False)
    clk();pg.wait_for_timeout(700)
    T('mouse-look back after the window',"()=>[!!orb,!!(orb&&orb.tg)]",lambda r:r==[True,True])
    ev("()=>{orbEnd()}");pg.wait_for_timeout(400)
    T('mouse-look off by hand stays off',"()=>{openX('hold');return 1}",lambda r:True);clk();pg.wait_for_timeout(600)
    T('...stays off',"()=>!!orb",lambda r:r is False)
    # hatchery: a ready egg hatched from the Hatchery; after Continue the Hatchery window is back
    T('hatch',"()=>{const e=rollEgg(1);e.id=99901;eggs.push(e);e.ht=1;e.t0=Date.now()-EGG_T-1000;openX('hatch200');ht200Hatch([99901]);return [!$('cmp').classList.contains('hide'),!!CE.hat]}",lambda r:r[0] and r[1])
    pg.wait_for_timeout(9000)
    T('hatch done',"()=>{if(CE.hat&&!CE.hat.done){CE.hat.done=true;ceHatchPanel()}const b=$('ceOk');if(b)b.click();return !!b}",lambda r:r)
    pg.wait_for_timeout(600)
    T('back at the hatchery',"()=>[$('cmp').classList.contains('hide'),xwMode,$('xw').classList.contains('hide')]",lambda r:r==[True,'hatch200',False])
    ev("()=>closeX()")
    # Abeksi
    T('abeksi numbers',"()=>[AB152V.rng.folk,AB152V.rng.civ,AB152V.rng.busy,AB152V.rng.guard,AB152V.rng.lantern]",lambda r:r==[10,14,10,10,12.5])
    T('rooftop residents blind',"()=>{const a={folk:1,o:{lift:3},role:'sit',u:0,v:0,yaw:0,hy:0};const g={folk:1,o:{lift:3},role:'sentry',u:0,v:0,yaw:0,hy:0};return [ab207Roof(a),ab207Roof(g),ab192Sees(a,0,2,false,1)]}",lambda r:r[0] is True and r[1] is False and r[2]==0)
    T('abeksi exit card',"()=>{let shown=[];const z=ZT116;zt116Show(z.Z[1],'k','Abeksi Has Fallen','s');shown.push(z.el&&z.el.querySelector('.ztt')&&z.el.querySelector('.ztt').textContent);zt116Show(z.Z[1],'k','Mistmere','s');shown.push(z.el.querySelector('.ztt').textContent);return shown}",
      lambda r:r[1]=='Mistmere' and r[0]!='Abeksi Has Fallen')
    T('abeksi strike rings',"""()=>{try{if(!ab152In()){const G=SP152.gates.abeksi;ab152Enter()}}catch(e){return 'enter '+e}return 1}""",lambda r:True)
    pg.wait_for_timeout(4000)
    T('abeksi strike rings (2)',"""()=>{if(!ab152In()||!AB152.S)return 'not in';const H=AB152H,S=AB152.S;const L=ab157Res().filter(a=>!a.dead&&!a.e&&!a.hid&&!(a.o&&a.o.lift>=1)&&(!a.folk||a.on));
      if(!L.length)return 'none';const a=L[0];const I=S.I;const x=I.x0+a.u+Math.sin(a.yaw)*1.2,z=I.y0+a.v+Math.cos(a.yaw)*1.2;toPos(x,z);H.u=x-I.x0;H.v=z-I.y0;pl.rotation.y=Math.atan2(a.u-H.u,a.v-H.v);
      atkCd=0;const n0=AB192.R.length;swing();return [AB207.n,AB192.R.length-n0,!!a.r192]}""",lambda r:isinstance(r,list) and r[2])
    T('a partner\'s strike rings too (host)',"""()=>{if(!ab152In()||!AB152.S)return 'not in';const R=ab157Res();const i=R.findIndex(a=>a&&!a.dead&&!a.e&&!a.hid&&!a.r192&&!(a.o&&a.o.lift>=1)&&!a.folk);if(i<0)return 'none';
      ab155On(['ab','sw',i],'peerX');return !!R[i].r192}""",lambda r:r is True)
    T('shots follow the ground',"""()=>{insArrive(PMAP[1].ins[0]);const I=curIns();let best=null;for(let y=I.y0+5;y<I.y0+I.h-5;y+=2)for(let x=I.x0+5;x<I.x0+I.w-8;x+=2){if(solid(x,y)||MAP.DW[y*W+x]>=0)continue;const d=GH(x+6,y)-GH(x,y);if(!solid(x+6,y)&&d>1&&(!best||d>best[2]))best=[x,y,d]}
      if(!best)return 'no slope';toPos(best[0],best[1]);shots.length=0;tgt=null;launch(pl.position,V(1,0,0),15,{col:0xffffff,basic:1},1,1.1);const sh=shots[0];for(let i=0;i<20;i++)shotTick(1/60);const p=sh.m.position;return [+best[2].toFixed(2),+(p.y-GH(p.x,p.z)).toFixed(2)]}""",
      lambda r:isinstance(r,list) and .7<r[1]<1.3)
    T('swing fills the gap',"()=>{insArrive(PMAP[0].ins[0]);atkCd=0;tgt=null;swing();return [HA.cur&&Math.round(HA.cur.ms),Math.round(atkCd*1000)]}",lambda r:r[0] and r[0]>=r[1]*.9)
    print('FAILS',len(fails),fails)
play.run(s)
