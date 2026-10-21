# v110: souls-style Sovereigns — contact sheets of every move (frames at the track's keys) + hit/warning checks.
# BL=0 (bosses)  MV=claw,snap (moves; default every move)  SHOT=0 (no pictures)  SIDE=1.6 (camera angle off the boss's facing)
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
BL=[int(x) for x in os.environ.get('BL','0').split(',')];MVS=[x for x in os.environ.get('MV','').split(',') if x]
SH=os.environ.get('SHOT','1')!='0';SIDE=float(os.environ.get('SIDE','1.7'));TAG=os.environ.get('TAG','')
OUT=play.TMP
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()");ev('()=>{window.LIT0=%d;window.CZ=%s;window.CH=%s}' % (int(os.environ.get('LIT','0')),os.environ.get('CZ','.72'),os.environ.get('CH','.7')))
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    first=True;res={}
    for i in BL:
        ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",i);pg.wait_for_timeout(1500)
        if first:
            first=False
            ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
            window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
            window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push([+(+k).toFixed(2),+(hero.iv||0).toFixed(2)]);return hb.apply(this,arguments)};
            window.SHOTCAM=(e,side,dist,h)=>{const p=e.m.position,a=e.m.rotation.y+side;cam.position.set(p.x+Math.sin(a)*dist,GH(p.x,p.z)+h,p.z+Math.cos(a)*dist);cam.lookAt(p.x,GH(p.x,p.z)+h*.45,p.z);POST.render()};
            svPick=()=>null;window.__down=down;down=function(){hero.hp=heroMax()};if(window.LIT0){const L=new THREE.HemisphereLight(0xffffff,0x444444,1.6);scene.add(L);const D=new THREE.DirectionalLight(0xffffff,1.2);D.position.set(30,60,20);scene.add(D)};const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);return 1}""")
        info=ev("""(i)=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[i];window.XA=A;
          const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*10,A.cz+Math.sin(a)*10);STEP(.3);
          const e=bossEnt(i);window.BE=e;STEP(.5);const S=e.sv;return {sv:!!S,AF:!!AF,on:S&&S.on,mv:S&&S.mv&&S.mv.id,ph:S&&S.ph,moves:S?Object.keys(S.B.M):[],
            parts:S?Object.keys(S.R.J).length:0,meshes:(()=>{let n=0;S&&S.R.root.traverse(o=>{if(o.isMesh)n++});return n})(),bs:e.m.bs}}""",i)
        print('boss',i,json.dumps(info))
        mv=MVS or info['moves']
        # let the intro finish
        ev("()=>{STEP(3.2);return 1}")
        for k in mv:
            r=ev("""(k)=>{const e=BE,S=e.sv,A=XA,D=S.B.M[k];if(!D)return 'nomove';svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;
              if(D.ph>1&&S.ph<2){S.ph=2;e.bs.ph=2;try{S.B.awake&&S.B.awake(e)}catch(_){}}
              enemies.slice().forEach(q=>{if(q.minion)removeE(q)});
              e.m.position.set(A.cx,0,A.cz);const r=D.r||[0,8],d=Math.max(r[0]+.8,Math.min(r[1]-.5,(r[0]+Math.min(r[1],r[0]+6))/2+1));
              const back=D.a==='b'||D.a==='sb',ya=EA;e.m.rotation.y=Math.atan2(Math.cos(ya),Math.sin(ya));const a=e.m.rotation.y+(back?Math.PI:0);
              toPos(A.cx+Math.sin(a)*d,A.cz+Math.cos(a)*d);hero.iv=0;HITS.length=0;STEP(.05);svStart(e,k,7);
              const TK=(S.mv&&S.mv.D.trk)||D.trk||[[D.dur]];const keys=[...new Set(TK.map(q=>q[0]))].filter(t=>t<=D.dur);window.KT=keys;return {d:+d.toFixed(1),dur:D.dur,keys}}""",k)
        # frames
            fr=[];t=0
            if isinstance(r,dict):
                for j,kt in enumerate(r['keys'][:9]):
                    dt=max(.016,kt-t);ev("(dt)=>{STEP(dt);return 1}",dt);t=kt
                    if SH:
                        ev("([side,play])=>{const e=BE;if(play){camYaw=Math.atan2(pl.position.x-e.m.position.x,pl.position.z-e.m.position.z);camPitch=.42;camDist=13;snapCam();cam.lookAt(e.m.position.x,GH(e.m.position.x,e.m.position.z)+2,e.m.position.z);POST.render();return}const b=new THREE.Box3().setFromObject(e.sv.R.root),sz=b.getSize(new THREE.Vector3());SHOTCAM(e,side,Math.max(7,sz.length()*(+window.CZ||.72)),Math.max(2.5,sz.y*(+window.CH||.7)))}",[SIDE,os.environ.get('CAM')=='play'])
                        fn=f'{OUT}/v110m_{i}_{k}_{j}.png';pg.locator('#gl canvas').screenshot(path=fn,timeout=300000,animations='disabled');fr.append(fn)
                ev("(dt)=>{STEP(dt);return 1}",max(.05,r['dur']-t+.1))
            hits=ev("()=>HITS.slice()")
            res[(i,k)]=(r,hits,fr)
            print('move',i,k,json.dumps(r)[:200],'hits',hits)
        ev("()=>{STEP(.5);return 1}")
    print('errs',errs[:8],ev("()=>window.LERR||0"),ev("()=>SVX.st"))
    # contact sheets
    if SH:
        from PIL import Image,ImageDraw
        for (i,k),(r,hits,fr) in res.items():
            if not fr:continue
            ims=[Image.open(f).resize((520,333)) for f in fr];W=len(ims);C=3
            S=Image.new('RGB',(520*min(W,C),333*((W+C-1)//C)));d=ImageDraw.Draw(S)
            for j,im in enumerate(ims):S.paste(im,((j%C)*520,(j//C)*333));d.text(((j%C)*520+6,(j//C)*333+6),f'{k} t={r["keys"][j]:.2f}',fill=(255,255,120))
            S.save(f'{OUT}/v110sheet_{TAG}{i}_{k}.png')
            for f in fr:os.remove(f)
play.run(s,w=800,hh=512)
