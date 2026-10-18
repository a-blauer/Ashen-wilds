# v91 fxB: Shockwave, Judgment, Hammer of Light visuals + timing, homing Arcane Missiles, class resource bar.
#   python3 v91_fxB.py            all checks + frame sheets in out/v91fxb_<ability>.jpg
#   PART=bar,parity,homing,relay,shots   pick parts;  NOSHOT=1 skips the screenshots
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
PART=set((os.environ.get('PART') or 'bar,parity,homing,relay,leak,shots').split(','))
if os.environ.get('NOSHOT'):PART.discard('shots')
FAIL=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' · '+str(info)[:400] if info!='' else ''),flush=True)
    if not ok:FAIL.append(name)
W,H=960,600
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':W,'height':H});errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)+' '+(e.stack or '')[:400]))
    pg.on('console',lambda m:errs.append('console '+m.text) if m.type=='error' else None)
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.set_default_timeout(600000)
    pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(4000)
    ev=pg.evaluate;ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    # FAST: no rendering. FMC: a manual clock (rAF queue + virtual performance.now) so effects can be stepped frame by frame.
    ev("""()=>{window.__r=ren.render;window.__pr=window.POST&&POST.render;window.FAST=on=>{if(on){ren.render=()=>{};if(window.POST)POST.render=()=>{}}else{ren.render=__r;if(window.POST)POST.render=__pr}};
      const rAF0=window.requestAnimationFrame.bind(window),pn0=performance.now.bind(performance);window.FMC={q:[],on:false,vt:0};
      window.requestAnimationFrame=f=>{if(FMC.on){FMC.q.push(f);return 0}return rAF0(f)};performance.now=()=>FMC.on?FMC.vt:pn0();
      FMC.start=()=>{FMC.vt=pn0();FMC.on=true;return new Promise(r=>{const T=pn0(),f=()=>{if(FMC.q.length>=1&&pn0()-T>1500||pn0()-T>20000)r();else setTimeout(f,30)};f()})};FMC.stop=()=>{FMC.on=false;FMC.q.splice(0).forEach(f=>rAF0(f))};
      FMC.step=(n,render)=>{for(let i=0;i<n;i++){FMC.vt+=1000/60;const q=FMC.q.splice(0);FAST(!(render&&i==n-1));q.forEach(f=>{try{f(FMC.vt)}catch(e){console.error(e)}})}FAST(1)};
      FAST(1);const q=PMAP[1];toPos(q.path[30][0],q.path[30][1]);window.__P=[pl.position.x,pl.position.z];TOD=.3;
      window.__hp=setInterval(()=>{hero.hp=Math.max(hero.hp,heroMax()*.8);hero.mp=999},50);
      // record every hero hit (target index, raw damage, kind) and area() calls
      window.HL=[];{const f=heroHit;heroHit=function(e,raw,mt,o){HL.push({e:(window.__E||[]).indexOf(e),raw:+(+raw).toFixed(3),fxb:!!(o&&o.s&&o.s.fxb),t:+(window.FGT||0).toFixed(3)});return f.apply(this,arguments)}}
      window.AL=[];{const f=area;area=function(p,r,dm){AL.push({x:+p.x.toFixed(2),z:+p.z.toFixed(2),r:+(+r).toFixed(3),dm:+(+dm).toFixed(3),t:+(window.FGT||0).toFixed(3)});return f.apply(this,arguments)}}
      window.FGT=0;window.waitGT=s=>new Promise(r=>{const g=FGT+s,T=performance.now(),f=()=>{if(FGT>=g)r();else if(performance.now()-T>40000){console.error('waitGT stuck FGT='+FGT+' party='+party.length+' ui='+uiOpen());r()}else setTimeout(f,20)};f()});window.MOVE=null;{const f=heroTick;heroTick=function(dt){if(dt>0){FGT+=dt;if(MOVE){MOVE[0].m.position.x+=MOVE[1]*dt;MOVE[0].m.position.z+=MOVE[2]*dt}}return f.apply(this,arguments)}}}""")
    pg.wait_for_timeout(2500)
    # foes: list of [side, along] relative to the hero facing -z; a stunned dummy with huge health each
    def setup(cls,ld,foes,lv=30):
        return ev("""([c,ld,F,lv])=>{kqsClear();hero.cls=c;hero.lvl=lv;hero.tal={__ab:1};kqsAll(c).forEach(s=>hero.tal['ab:'+s.n]=1);hero.tal.__ld=ld;KQS.ck='';
           const tp=ITPL.findIndex(t=>t.cls==c&&t.sl=='weapon'&&t.t==3&&!t.nw);eq.weapon={id:uid++,tp,lv,req:1,r:2,up:0,aff:[]};hsDirty();refreshGear();
           pl.position.x=__P[0];pl.position.z=__P[1];pl.position.y=GH(__P[0],__P[1]);pl.rotation.y=Math.PI;hero.cd={};hero.mp=999;hero.cr=0;hero.buffs=hero.buffs.filter(b=>b.perm);hsDirty();
           enemies.filter(e=>!e.dead&&d2(e.m.position,pl.position)<60).forEach(e=>removeE(e));party.forEach(q=>{if(q)q.h=0});
           const out=F.map(([sx,al])=>{const e=spawnEnemy('goo',pl.position.x+sx,pl.position.z-al,lv,{});e.__t=1;e.agg=0;e.cd=99;e.stun=999;e.c.st.hp=1e9;e.c.h=1e9;return e});
           window.__E=out;tgt=null;HL.length=0;AL.length=0;camYaw=0;camPitch=.75;camDist=13;snapCam();hud();return out.length}""",[cls,ld,foes,lv])
    def run_gt(sec):  # advance game time with the real loop (render stubbed)
        ev("(s)=>waitGT(s)",sec)
    if 'bar' in PART:
        res=ev("""async()=>{const out={};for(const c of ['warrior','paladin','assassin','ranger','mage']){hero.cls=c;const r=[];for(const v of [0,25,60,100,10]){hero.cr=v;hero.crT=nowP();resUI();
           await new Promise(q=>setTimeout(q,900));const b=$('resb'),f=b.querySelector('.rbar > i'),bar=b.querySelector('.rbar');r.push([v,+(100*f.getBoundingClientRect().width/bar.clientWidth).toFixed(1)])}
           out[c]={r,icon:!!$('resb').querySelector('.ri .kqi'),iconW:$('resb').querySelector('.ri i')?$('resb').querySelector('.ri i').style.width:'',col:getComputedStyle($('resb').querySelector('.rbar > i')).backgroundColor}}return out}""")
        for c,o in res.items():
            chk('resource bar fill follows the value: '+c,all(abs(a-w)<2.5 for a,w in o['r']) and not o['iconW'],o)
        # the mage really gains Arcane from basic attacks and the bar shows it
        setup('mage','Arcane Missiles',[[0,4]])
        ev("()=>{hero.cr=0;resUI();tgt=__E[0]}")
        for i in range(6):ev("()=>{atkCd=0;swing()}");run_gt(.7)
        print('  mage hits',ev("()=>({hl:HL.slice(0,4),wt:curWT(),cls:hero.cls,party:party.length,cr:hero.cr,e:__E[0].dead,d:d2(__E[0].m.position,pl.position)})"))
        r=ev("()=>{const b=$('resb'),f=b.querySelector('.rbar > i');return {cr:+(hero.cr||0).toFixed(1),w:+(100*f.getBoundingClientRect().width/b.querySelector('.rbar').clientWidth).toFixed(1),txt:b.querySelector('.rt').textContent}}")
        chk('mage basic attacks fill the Arcane bar',r['cr']>20 and abs(r['cr']-r['w'])<4,r)
        ev("()=>{FAST(0)}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v91fxb_bar_mage.png');print('  resb',ev("()=>{const b=$('resb'),r=b.getBoundingClientRect(),q=b.querySelector('.rbar').getBoundingClientRect();return [r.x,r.y,r.width,r.height,q.x,q.y,q.width,q.height,getComputedStyle(b).visibility,getComputedStyle(b).opacity,b.parentElement.id]}"));ev("()=>FAST(1)")
    if 'parity' in PART:
        # same hits with the fxB hook on and off (fxbCast=null → old cast_base visuals)
        def cast_rec(cls,ld,foes,i,gt=None,wait=1.6,off=False):
            setup(cls,ld,foes)
            return ev("""async([i,gp,w,off])=>{const keep=fxbCast;if(off)fxbCast=null;const g0=FGT;Math.random=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647}})();
              try{if(gp){KQS.gp=V(pl.position.x+gp[0],0,pl.position.z-gp[1]);KQS.fire=1}cast(i)}finally{KQS.gp=null;KQS.fire=0}
              const cd=hero.cd['s'+i]||0;const t0=HL.length;await waitGT(w);fxbCast=keep;
              return {cd:+cd.toFixed(2),hits:HL.map(h=>[h.e,h.raw,+(h.t-g0).toFixed(2)]),area:AL.map(a=>[a.r,a.dm,+(a.t-g0).toFixed(2)])}}""",[i,gt,wait,off])
        line=[[0,2.5],[.6,5],[-.8,8.2],[3,4],[0,10.5]]
        for nm,cls,ld in [('Shockwave','warrior','Shockwave|Cleave'),('Judgment','paladin','Judgment|Holy Smite')]:
            a=cast_rec(cls,ld,line,0);b_=cast_rec(cls,ld,line,0,off=True)
            ha=sorted((h[0],h[1]) for h in a['hits']);hb=sorted((h[0],h[1]) for h in b_['hits'])
            chk(nm+': same targets and damage values as before',ha==hb and len(ha)==3 and a['cd']==b_['cd'],{'fxb':ha,'old':hb,'cd':[a['cd'],b_['cd']]})
            ts={h[0]:h[2] for h in a['hits']}
            if nm=='Shockwave':chk('Shockwave: hits land on the slam and travel with the wave',.25<=ts.get(0,9)<.45 and ts.get(0,9)<ts.get(1,0)<ts.get(2,0)<.75,ts)
            else:chk('Judgment: the whole line is hit on the impact frame',all(.38<=v<.5 for v in ts.values()),ts)
        a=cast_rec('paladin','Hammer of Light|Holy Smite',[[0,6],[1.2,6.5],[4.5,6]],0,gt=[0,6]);b_=cast_rec('paladin','Hammer of Light|Holy Smite',[[0,6],[1.2,6.5],[4.5,6]],0,gt=[0,6],off=True)
        chk('Hammer of Light: same area damage as before, landing at .7 s',[x[:2] for x in a['area']]==[x[:2] for x in b_['area']] and len(a['area'])==1 and abs(a['area'][0][2]-.7)<.08 and sorted(h[:2] for h in a['hits'])==sorted(h[:2] for h in b_['hits']),{'fxb':a,'old':b_})
        a=cast_rec('mage','Arcane Missiles|Fireball',[[0,5]],0);b_=cast_rec('mage','Arcane Missiles|Fireball',[[0,5]],0,off=True)
        chk('Arcane Missiles: same per-missile damage; all 3 reach a target 5 tiles ahead (the old fan missed with 2)',set(h[1] for h in a['hits'])==set(h[1] for h in b_['hits']) and len(a['hits'])==3 and a['cd']==b_['cd'],{'fxb':a,'old':b_})
    if 'homing' in PART:
        def hom(foes,tg,move=None,kill=None,off=False,wait=2.8):
            setup('mage','Arcane Missiles|Fireball',foes)
            return ev("""async([tg,mv,kill,off,w])=>{const keep=fxbCast;if(off)fxbCast=null;tgt=tg==null?null:__E[tg];HL.length=0;
              const T0=performance.now(),id=0;window.MOVE=mv?[__E[mv[0]],mv[1],mv[2]]:null,g0=FGT;let killed=0;
              cast(0);await new Promise(r=>{const g=FGT+w,f=()=>{if(kill&&!killed&&FGT-g0>=kill[1]){killed=1;const e=__E[kill[0]];e.c.h=1;heroHit_base?heroHit_base(e,1e12,'m',{proc:false}):removeE(e)}if(FGT>=g||performance.now()-T0>40000)r();else setTimeout(f,20)};f()});
              MOVE=null;fxbCast=keep;const by={};HL.filter(h=>h.raw>1e6?false:true).forEach(h=>{by[h.e]=(by[h.e]||0)+1});return {by,n:HL.length,dead:__E.map(e=>!!e.dead)}}""",[tg,move,kill,off,wait])
        # 1) selected target 7 tiles away moving sideways at 4.5 tiles/s
        a=hom([[2,7]],0,move=[0,4.5,0]);o=hom([[2,7]],0,move=[0,4.5,0],off=True)
        chk('homing: all 3 missiles hit a target moving sideways',a['by'].get('0',0)==3,{'fxb':a,'old (straight)':o})
        # 2) no selection; the only enemy is 45 degrees off the facing
        a=hom([[5,5]],None);o=hom([[5,5]],None,off=True)
        chk('homing: missiles find an off-axis enemy in front without a selected target',a['by'].get('0',0)==3,{'fxb':a,'old':o})
        # 3) the target dies mid-flight: missiles retarget the other enemy
        a=hom([[0,8],[3.5,6]],0,kill=[0,.12])
        chk('homing: missiles retarget when their target dies',a['by'].get('1',0)==3 and a['dead'][0],a)
        # 4) a boss / den sub-target proxy is a valid target too
        r=ev("""async()=>{const e=__E[0];e.boss=1;tgt=e;HL.length=0;hero.cd={};cast(0);await waitGT(1.6);e.boss=0;return HL.length}""")
        chk('homing: works on a boss target',r==3,r)
    if 'relay' in PART:
        setup('warrior','Shockwave|Cleave',[[0,4]])
        r=ev("""async()=>{const k=fxbLive;fxbLive=()=>true;MP.evq.length=0;cast(0);fxbLive=k;const q=MP.evq.filter(x=>x[0]==='fxB');MP.evq.length=0;await waitGT(1.5);
            // replay every kind as a partner: visuals only, no damage
            const ghost=new THREE.Group();ghost.position.copy(pl.position).add(V(2,0,0));scene.add(ghost);const on=MP.on;MP.on=true;MP.rh.__t={m:ghost};HL.length=0;AL.length=0;const o0=KQS.objs.length;
            for(const c of ['sw','jd','hl','am'])fxbOnEV({peer:'__t',data:{l:[['fxB',c,ghost.position.x,ghost.position.z,0,-1,ghost.position.x,ghost.position.z-5,3]]}});
            const n=KQS.objs.length-o0;await waitGT(2.8);delete MP.rh.__t;MP.on=on;scene.remove(ghost);
            return {q,objs:n,hits:HL.length,area:AL.length}}""")
        chk('co-op: the cast is queued for partners and replays as visuals only',len(r['q'])==1 and r['q'][0][1]=='sw' and r['objs']>=4 and r['hits']==0 and r['area']==0,r)
    if 'leak' in PART:
        setup('paladin','Judgment|Hammer of Light|Holy Smite',[[0,4],[.5,7]])
        cnt="()=>{let n=0,g=new Set(),m=new Set();const EM=new Set(enemies.map(e=>e.m));scene.traverse(o=>{for(let q=o;q;q=q.parent)if(EM.has(q))return;n++;if(o.geometry)g.add(o.geometry);if(o.material)m.add(o.material)});return {n,g:g.size,m:m.size,objs:KQS.objs.length,deb:FXB_DEB.length,shots:shots.length}}"
        run_gt(1.0);c0=ev(cnt);ev("()=>{window.__U=new Set();scene.traverse(o=>__U.add(o.uuid))}")
        for k in range(2):
            ev("()=>{hero.cd={};cast(0)}");run_gt(.4)
            ev("()=>{hero.cd={};KQS.gp=V(pl.position.x,0,pl.position.z-5);KQS.fire=1;try{cast(1)}finally{KQS.gp=null;KQS.fire=0}}");run_gt(.4)
            ev("()=>{hero.cls='warrior';hero.tal.__ld='Shockwave';KQS.ck='';hero.cd={};cast(0);hero.cls='paladin';hero.tal.__ld='Judgment|Hammer of Light|Holy Smite';KQS.ck=''}");run_gt(.4)
            ev("()=>{hero.cls='mage';hero.tal.__ld='Arcane Missiles';KQS.ck='';hero.cd={};tgt=__E[1];cast(0);hero.cls='paladin';hero.tal.__ld='Judgment|Hammer of Light|Holy Smite';KQS.ck=''}");run_gt(.4)
        ev("()=>{tgt=null}");run_gt(3.5);c1=ev(cnt);print('  new objects',ev("()=>{const L=[];scene.traverse(o=>{if(!__U.has(o.uuid))L.push([o.type,o.geometry&&o.geometry.type,o.parent&&o.parent.type,enemies.findIndex(e=>e.m===o.parent),o.parent===pl,o.geometry&&JSON.stringify(o.geometry.parameters),o.material&&o.material.color&&o.material.color.getHexString(),o.name,JSON.stringify(o.userData).slice(0,80),o.position.toArray().map(v=>+v.toFixed(1))])});return L.slice(0,10)}"))
        chk('no leaked meshes/geometries/materials after the effects end',c1['n']<=c0['n'] and c1['g']<=c0['g'] and c1['m']<=c0['m'] and c1['objs']==0 and c1['deb']==0 and c1['shots']==0,[c0,c1])
    if 'dbg' in PART:
        setup('paladin','Judgment|Holy Smite',[[0,4.5]])
        ev("()=>FMC.start()");ev("()=>FMC.step(5)");ev("()=>{tgt=__E[0];cast(0)}")
        for i in range(5):ev("()=>FMC.step(5)");print(ev("()=>{const s=FXB.lastSw;return s&&{p:s.position.toArray().map(v=>+v.toFixed(2)),par:!!s.parent,vis:s.visible,ch:s.children.length,op:s.userData.mats.map(m=>m.opacity),gy:GH(s.position.x,s.position.z),cam:cam.position.toArray().map(v=>+v.toFixed(1)),pl:[pl.position.x,pl.position.z]}}"))
        setup('warrior','Shockwave|Cleave',[[0,4]])
        ev("()=>FMC.start()");ev("()=>FMC.step(5)");ev("()=>cast(0)")
        for i in range(8):
            ev("()=>FMC.step(5)");print(ev("()=>{const b=pl.bones;return {cur:HA.cur&&HA.cur.fxb,k:HA.cur&&+HA.cur.k.toFixed(2),ax:+b.aR0.rotation.x.toFixed(2),lx:+b.aL0.rotation.x.toFixed(2),sx:+b.spine.rotation.x.toFixed(2),sw:pl.sw}}"))
        ev("()=>FMC.stop()")
    if 'shots' in PART:
        from PIL import Image
        def sheet(name,frames):
            ims=[Image.open(f) for f in frames];w,h=ims[0].size;cols=4 if len(ims)>4 else len(ims);rows=(len(ims)+cols-1)//cols
            S=Image.new('RGB',(w*cols,h*rows));[S.paste(im,((i%cols)*w,(i//cols)*h)) for i,im in enumerate(ims)]
            S.save(play.TMP+'/v91fxb_'+name+'.jpg',quality=85);print('  sheet',play.TMP+'/v91fxb_'+name+'.jpg')
        def seq(name,cls,ld,foes,castjs,times,cam,clip=None):
            setup(cls,ld,foes);ev("([y,p,d])=>{camYaw=y;camPitch=p;camDist=d;snapCam()}",cam)
            ev("()=>{FAST(0)}");pg.wait_for_timeout(1500);ev("()=>FAST(1)")
            r=ev("()=>{const r=gl.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}");CL={'x':r[0]+r[2]*.12,'y':r[1]+r[3]*.1,'width':r[2]*.76,'height':r[3]*.72}
            ev("()=>FMC.start()");ev("()=>FMC.step(20)");ev(castjs);fr=[];t=0
            for i,tt in enumerate(times):
                n=max(1,round((tt-t)*60));ev("(n)=>FMC.step(n,true)",n);t+=n/60
                f=play.TMP+'/v91fxb_%s_%d.png'%(name,i);pg.screenshot(path=f,clip=clip or CL);fr.append(f)
            ev("()=>FMC.stop()");sheet(name,fr)
        seq('shockwave','warrior','Shockwave|Cleave',[[0,4],[.5,7.5],[-.4,9.5]],"()=>{cast(0)}",[.1,.2,.27,.31,.36,.45,.58,1.3],[1.25,.6,9])
        seq('judgment','paladin','Judgment|Holy Smite',[[0,4.5],[.6,7]],"()=>{tgt=__E[0];cast(0)}",[.12,.25,.36,.42,.45,.55,.8,1.2],[1.2,.5,10])
        seq('hammer','paladin','Hammer of Light|Holy Smite',[[0,6],[1.2,6.6],[-1,5.4]],"()=>{KQS.gp=V(pl.position.x,0,pl.position.z-6);KQS.fire=1;try{cast(0)}finally{KQS.gp=null;KQS.fire=0}}",[.1,.3,.5,.62,.7,.76,.95,1.4],[1.1,.42,12])
        seq('missiles','mage','Arcane Missiles|Fireball',[[3.5,7]],"()=>{tgt=__E[0];cast(0)}",[.05,.12,.2,.28,.36,.44,.52,.62],[.6,.85,10])
    bad=[e for e in errs if 'PAGEERROR' in e or 'fxb' in e.lower()]
    chk('no page errors',not bad,bad[:5])
    print('errors/console:',errs[:8])
    b.close()
print('FAILED:',FAIL) if FAIL else print('ALL PASS')
