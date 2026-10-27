# v163: element buildup -> primed -> reaction; health bar border tint / primed glow; boss bar; companion self-reaction rule.
# SHOT=1 saves out/v163_bars.png (a building bar, a primed bar, the boss bar primed).
import play,json,os
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(2400000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=ev("""async()=>{
      const out={ERR:[]};hero.lvl=30;hero.hp=heroMax();
      const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1]);
      enemies.slice().forEach(e=>{if(!e.boss)try{removeE(e)}catch(_){}});
      const fw=V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));
      const mk=(dx,al)=>{const e=spawnEnemy(BIOEN[p.n][0],pl.position.x+fw.x*4+fw.z*dx,pl.position.z+fw.z*4-fw.x*dx,8,al?{al:1}:{});e.c.h=e.c.st.hp=1e7;e.stun=99;return e};
      await new Promise(r=>setTimeout(r,800));CH127=null;
      try{const _U={get v(){return atkOf(heroMt())}};
        // 1. hero hits of one element prime after ceil(1/.24)=5 basic-sized hits
        const a=mk(0);let n=0;while(!a.el&&n<20){applyEl(a,'fire',_U.v,'h');n++;if(n==2){eb163Frame();out.midOp=a.hb.eb&&a.hb.eb.fr.material.opacity;out.midGlow=a.hb.eb&&a.hb.eb.gl.visible}}
        out.hitsToPrime=n;out.primed=a.el&&a.el.k;out.ring=!!(a.elR&&a.elR.visible);eb163Frame();const Vv=a.hb.eb;
        out.primedVis=Vv?{fr:Vv.fr.visible,gl:Vv.gl.visible,ic:Vv.ic.visible,sh:Vv.sh.visible,icMap:!!Vv.ic.material.map}:null;
        // 2. same element does nothing; a no-reaction pair does nothing; a different element reacts
        out.same=applyEl(a,'fire',_U.v,'h');out.noPair=null;
        out.melt=applyEl(a,'frost',_U.v,'h');out.after={el:a.el,eb:a.eb,ring:!!(a.elR&&a.elR.visible)};eb163Frame();out.afterVis=a.hb.eb.fr.visible;
        const b=mk(1.5);for(let i=0;i<5;i++)applyEl(b,'frost',_U.v,'h');out.noPair=[applyEl(b,'poison',_U.v,'h'),b.el&&b.el.k];
        // 3. tug of war: 3 fire (.72) then 1 frost pushes back to .48; 4 more frost take over
        const c=mk(-1.5);for(let i=0;i<3;i++)applyEl(c,'fire',_U.v,'h');applyEl(c,'frost',_U.v,'h');out.tug=[c.eb.k,+c.eb.v.toFixed(3)];
        for(let i=0;i<3;i++)applyEl(c,'frost',_U.v,'h');out.tug2=[c.eb.k,+c.eb.v.toFixed(3)];
        // 4. drain after 3 s idle
        c.eb.t=nowP()-4000;c.eb.dt=nowP()-100;const v0=c.eb.v;eb163Frame();out.drain=+(v0-c.eb.v).toFixed(3);
        // 5. sizes: big hits fill more (cap 2.5x), elites .75, bosses .5, companion .13, status .1
        const el=mk(3,1);out.fill={big:eb163Fill(a,'fire',_U.v*10,'h'),small:eb163Fill(a,'fire',_U.v*.01,'h'),elite:eb163Fill(el,'fire',_U.v,'h'),boss:eb163Fill({boss:1,c:{}},'fire',_U.v,'h'),comp:eb163Fill(a,'fire',0,'c'),st:eb163Fill(a,'fire',0,'s')};
        // 6. a companion cannot react with its own priming; the hero can
        const d=mk(-3),C1={n:'pet'};CH127={c:C1,e:d};for(let i=0;i<8;i++)applyEl(d,'fire',0,'c');out.compPrimed=d.el&&d.el.k;
        out.compSelf=applyEl(d,'frost',0,'c');out.compStill=d.el&&d.el.k;CH127=null;out.heroOnComp=applyEl(d,'frost',_U.v,'h');
        // 7. through the real heroHit: a fire skill colour primes, a frost one melts (damage bigger than a plain frost hit)
        const f=mk(0);f.stun=99;const R0=Math.random;Math.random=()=>.5;const hp0=f.c.h;for(let i=0;i<5;i++)heroHit(f,_U.v,'m',{s:{col:0xff7a2a}});out.realPrimed=f.el&&f.el.k;
        let h1=f.c.h;heroHit(f,_U.v,'m',{s:{col:0x9fe3ff},crit:false});const meltD=h1-f.c.h;h1=f.c.h;heroHit(f,_U.v,'m',{s:{col:0x9fe3ff}});const plainD=h1-f.c.h;Math.random=R0;out.meltRatio=+(meltD/plainD).toFixed(2);
        // 8. boss bar
        $('boss').classList.remove('hide');const fake={boss:1,el:{k:'shock',t:nowP()+5000}};eb163Boss(fake,nowP());const mt=$('boss').querySelector('.meter');
        out.bossBar={p:mt.classList.contains('eb163p'),ic:$('eb163bi').textContent};
        if(window.SHOTMODE){
          // pictures: a half-built bar, a primed bar, the boss bar primed
          enemies.slice().forEach(e=>{if(!e.boss&&e!==a)try{removeE(e)}catch(_){}});const s1=mk(-1.6),s2=mk(1.6);for(let i=0;i<3;i++)applyEl(s1,'frost',_U.v,'h');for(let i=0;i<5;i++)applyEl(s2,'fire',_U.v,'h');[s1,s2].forEach(e=>{e.c.h=M(e.c)*.7});
          window._eb=[s1,s2];
        }else{eb163Boss(null,nowP());$('boss').classList.add('hide')}
        out.bossOff=null;
        // 9. removeE frees the bar's extra materials; the shared textures survive
        removeE(a);out.freed=a.hb._free;out.texOk=!!(EB163T.soft&&EB163T.soft.image);
      }catch(x){out.ERR.push(String(x.stack||x).slice(0,400))}
      return out}""".replace('window.SHOTMODE',"true" if os.environ.get('SHOT') else "false"))
    print(json.dumps(r,indent=0)[:3000])
    bad=[]
    if r['ERR']:bad.append('errors %s'%r['ERR'])
    else:
        if r['hitsToPrime']!=5:bad.append('hits to prime %s (want 5)'%r['hitsToPrime'])
        if r['primed']!='fire' or not r['ring']:bad.append('not primed with fire / no ground ring')
        if not (r['midOp'] and .3<r['midOp']<.5) or r['midGlow']:bad.append('half-built border tint wrong: %s glow %s'%(r['midOp'],r['midGlow']))
        pv=r['primedVis'] or {}
        if not (pv.get('fr') and pv.get('gl') and pv.get('ic') and pv.get('icMap')):bad.append('primed bar not glowing: %s'%pv)
        if r['same']!=1:bad.append('same element reacted')
        if r['melt']!=2.5:bad.append('melt multiplier %s'%r['melt'])
        if r['after']['el'] or r['after']['eb'] or r['after']['ring'] or r['afterVis']:bad.append('still primed after reaction: %s'%r['after'])
        if r['noPair']!=[1,'frost']:bad.append('frost+poison should do nothing: %s'%r['noPair'])
        if r['tug']!=['fire',0.48]:bad.append('tug of war %s'%r['tug'])
        if r['tug2']!=['frost',0.24]:bad.append('takeover %s'%r['tug2'])
        if abs(r['drain']-.03)>.005:bad.append('drain %s'%r['drain'])
        F=r['fill']
        if abs(F['big']-.6)>1e-6 or abs(F['small']-.096)>1e-6 or abs(F['elite']-.18)>1e-6 or abs(F['boss']-.12)>1e-6 or abs(F['comp']-.13)>1e-6 or abs(F['st']-.1)>1e-6:bad.append('fill amounts %s'%F)
        if r['compPrimed']!='fire' or r['compSelf']!=1 or r['compStill']!='fire':bad.append('companion reacted with its own priming')
        if r['heroOnComp']!=2.5:bad.append('hero did not react on companion priming: %s'%r['heroOnComp'])
        if r['realPrimed']!='fire':bad.append('heroHit with a fire colour did not prime')
        if not (1.8<r['meltRatio']<3.4):bad.append('melt hit vs plain hit ratio %s'%r['meltRatio'])
        if r['bossBar']!={'p':True,'ic':'⚡'}:bad.append('boss bar %s'%r['bossBar'])
        if not r['freed'] or not r['texOk']:bad.append('removeE did not free / shared texture lost')
    if os.environ.get('SHOT'):
        ev("()=>{eb163Frame();}")
        pg.wait_for_timeout(400)
        box=ev("""()=>{eb163Frame();$('boss').classList.remove('hide');$('boss').style.setProperty('display','block','important');$('bossN').textContent='Test Sovereign';$('bossB').style.width='70%';
          eb163Boss({boss:1,el:{k:'shock',t:nowP()+5000}},nowP());const _b=eb163Boss;eb163Boss=()=>{};
          const c=ren.domElement.getBoundingClientRect(),P=window._eb.map(e=>{const v=e.hb.position.clone().project(cam);return [c.left+(v.x*.5+.5)*c.width,c.top+(-v.y*.5+.5)*c.height]});return P}""")
        pg.screenshot(path=play.TMP+'/v163_bars_full.png',timeout=600000)
        try:
            from PIL import Image
            im=Image.open(play.TMP+'/v163_bars_full.png');xs=[q[0] for q in box];ys=[q[1] for q in box]
            cx,cy=sum(xs)/2,sum(ys)/2;crop=im.crop((int(cx-200),int(cy-70),int(cx+200),int(cy+70))).resize((1000,350),Image.LANCZOS);crop.save(play.TMP+'/v163_bars.png')
            b=pg.evaluate("()=>{const r=$('boss').getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]}")
            im.crop((int(b[0]-20),int(b[1]-10),int(b[2]+20),int(b[3]+10))).resize((int((b[2]-b[0]+40)*2.5),int((b[3]-b[1]+20)*2.5)),Image.LANCZOS).save(play.TMP+'/v163_boss.png')
        except Exception as x:print('crop failed',x)
    for b in bad:print('FAIL',b)
    print('element buildup: checked' if not bad else 'CHECKS FAILED')
play.run(s,w=900,hh=560)
