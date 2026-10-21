# v112: Vaelric (Sovereign 5) — the new model, the three new moves (grasp, spin, thorns) and the AI.
#  PART=shot,mv,ai (default all)  OLD=1 also draws contact sheets of the old moves  LIT=1 adds a key light to the shots
#  * shot: model close-ups (idle front / side / back / head, Phase II front / back) and a contact sheet per new move
#  * mv:   casts every move with the hero standing in reach (each must land), then the new moves' safe spots (must miss)
#  * ai:   a free fight with the real AI in Phase I and in Phase II; the new moves must be chosen
# Writes out/v112v_*.png. Prints 'RESULT ok' or 'RESULT FAIL ...'.
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
PART=os.environ.get('PART','shot,mv,ai').split(',');OLD=os.environ.get('OLD')=='1';SEC=float(os.environ.get('SEC','70'))
OUT=play.TMP;I=5;NEW=['grasp','spin','thorns']
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[];bad=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()");ev('()=>{window.LIT0=%d}'%int(os.environ.get('LIT','1')))
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",I);pg.wait_for_timeout(1500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push([+(+k).toFixed(2),+(hero.iv||0).toFixed(2),e.sv&&e.sv.mv?+e.sv.mv.t.toFixed(2):-1]);return hb.apply(this,arguments)};
      window.SHOTCAM=(e,side,dist,h,ly)=>{const p=e.m.position,a=e.m.rotation.y+side;cam.position.set(p.x+Math.sin(a)*dist,GH(p.x,p.z)+h,p.z+Math.cos(a)*dist);cam.lookAt(p.x,GH(p.x,p.z)+(ly==null?h*.6:ly),p.z);POST.render()};
      window.__pick=svPick;svPick=()=>null;window.__down=down;down=function(){hero.hp=heroMax()};
      if(window.LIT0){const L=new THREE.HemisphereLight(0xffffff,0x444444,1.3);scene.add(L);const D=new THREE.DirectionalLight(0xffffff,1.1);D.position.set(30,60,20);scene.add(D)}
      const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);return 1}""")
    info=ev("""(i)=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[i];window.XA=A;
      const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*10,A.cz+Math.sin(a)*10);STEP(.3);
      const e=bossEnt(i);window.BE=e;STEP(.5);const S=e.sv;let n=0,tri=0;S.R.root.traverse(o=>{if(o.isMesh){n++;tri+=(o.geometry.attributes.position.count/3)|0}});
      return {sv:!!S,on:S.on,mv:S.mv&&S.mv.id,joints:Object.keys(S.R.J).length,meshes:n,tris:tri,merge:S.R.mergeN,moves:Object.keys(S.B.M),sign:DSTXT[i].atk.length}}""",I)
    print('info',json.dumps(info))
    for k in NEW:
        if k not in info['moves']:bad.append('missing '+k)
    ev("()=>{STEP(3.2);return 1}")   # the intro
    # place the boss in the middle facing the den gate, the hero at distance d and angle off (radians from his facing)
    PLACE="""(o)=>{const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.cd={};if(S.gone)S.B.reset(e);
        if(o.ph===2&&S.ph<2){S.ph=2;e.bs.ph=2;S.wk=1}if(o.ph===1&&S.ph>1){S.ph=1;e.bs.ph=1;S.wk=0}
        e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=Math.atan2(Math.cos(EA),Math.sin(EA));const a=e.m.rotation.y+(o.off||0);
        toPos(A.cx+Math.sin(a)*o.d,A.cz+Math.cos(a)*o.d);hero.iv=0;HITS.length=0;STEP(.05);return 1}"""
    def place(d,off=0,ph=0):ev(PLACE,{'d':d,'off':off,'ph':ph})
    def shot(fn,side,dist,h,ly=None):
        ev("([s,d,h,ly])=>{SHOTCAM(BE,s,d,h,ly);return 1}",[side,dist,h,ly]);pg.locator('#gl canvas').screenshot(path=fn,timeout=300000,animations='disabled')
    if 'shot' in PART:
        if os.environ.get('ISO','1')=='1':   # a clean studio: only the boss, a grey backdrop, no fog, plain lights
            ev("""()=>{window.__hid=[];scene.children.forEach(o=>{if(o!==BE.m&&!o.isLight&&o.visible){o.visible=false;__hid.push(o)}});const SC=SHOTCAM;SHOTCAM=function(){const f=scene.fog,d=f&&f.density,n=f&&f.near,fa=f&&f.far,bg=scene.background;if(f){if(d!=null)f.density=0;if(fa!=null){f.near=1e4;f.far=2e4}}scene.background=new THREE.Color(0x6a6a72);try{SC.apply(this,arguments)}finally{if(f){if(d!=null)f.density=d;if(fa!=null){f.near=n;f.far=fa}}scene.background=bg}};
              const fl=new THREE.Mesh(new THREE.CircleGeometry(6,32).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x3a3a40}));fl.position.set(BE.m.position.x,GH(BE.m.position.x,BE.m.position.z)+.01,BE.m.position.z);scene.add(fl);window.__fl=fl;
              const _a=scene.add.bind(scene);return 1}""")
        place(9,0,1);ev("()=>{STEP(.6);return 1}")
        for nm,sd,dist,h,ly in [('front',0,7,2.6,2.0),('side',1.57,7,2.6,2.0),('back',3.14,7,2.6,2.0),('q34',.7,3.4,3.5,3.0),('legs',-.6,3.6,1.2,.9)]:
            shot(f'{OUT}/v112v_idle_{nm}.png',sd,dist,h,ly)
        place(9,0,2);ev("()=>{STEP(1.2);return 1}")
        for nm,sd in [('front',.35),('back',2.8)]:shot(f'{OUT}/v112v_ph2_{nm}.png',sd,8.5,3.0,2.2)
        # contact sheets of the new moves (and the old ones with OLD=1)
        from PIL import Image,ImageDraw
        mvs=NEW+(['combo','lunge','wave','batstep','nova','skyfall','waves','combo5','awaken'] if OLD else [])
        for k in mvs:
            r=ev("""(k)=>{const D=BE.sv.B.M[k];const keys=[...new Set(D.trk.map(q=>q[0]))].filter(t=>t<=D.dur);return {ph:D.ph||1,keys,d:D.r?Math.max(D.r[0]+.8,Math.min(D.r[1]-.5,5)):5}}""",k)
            place(r['d'],0,r['ph']);ev("(k)=>{svStart(BE,k,7);return 1}",k);t=0;fr=[];ts=[]
            # sample a few moments between the keys too (the in-betweens show snapping and gaps)
            ks=sorted(set(r['keys']+[round((a+b)/2,3) for a,b in zip([0]+r['keys'],r['keys'])]))[:12]
            for j,kt in enumerate(ks):
                ev("(dt)=>{STEP(dt);return 1}",max(.016,kt-t));t=kt
                fn=f'{OUT}/v112v_f_{k}_{j}.png';side=1.2 if k!='thorns' else .9
                ev("([s])=>{const e=BE,b=new THREE.Box3().setFromObject(e.sv.R.root),sz=b.getSize(new THREE.Vector3());SHOTCAM(e,s,Math.max(7.5,sz.length()*.8),Math.max(2.6,sz.y*.65),Math.max(1.6,sz.y*.42));return 1}",[side])
                pg.locator('#gl canvas').screenshot(path=fn,timeout=300000,animations='disabled');fr.append(fn);ts.append(kt)
            ev("()=>{STEP(1.2);svEndMove(BE,true);return 1}")
            ims=[Image.open(f).resize((400,256)) for f in fr];C=4
            S=Image.new('RGB',(400*C,256*((len(ims)+C-1)//C)));d=ImageDraw.Draw(S)
            for j,im in enumerate(ims):S.paste(im,((j%C)*400,(j//C)*256));d.text(((j%C)*400+6,(j//C)*256+6),f'{k} t={ts[j]:.2f}',fill=(255,255,120))
            S.save(f'{OUT}/v112v_sheet_{k}.png')
            for f in fr:os.remove(f)
    if 'mv' in PART:
        # every move with the hero standing in reach: each one that can hit must land at least once
        allm=info['moves'];res={}
        for k in allm:
            r=ev("""(k)=>{const D=BE.sv.B.M[k],r=D.r||[0,8];return {ph:(D.ph||(k==='awaken'?1:1)),d:k==='awaken'||k==='intro'||k==='stagger'?4:Math.max(r[0]+.8,Math.min(r[1]-.5,(r[0]+Math.min(r[1],r[0]+6))/2+1)),b:D.a==='b'||D.a==='sb',dur:D.dur}}""",k)
            place(r['d'],3.14159 if r['b'] else 0,r['ph']);ev("(k)=>{svStart(BE,k,7);return 1}",k)
            ev("(d)=>{STEP(d);return 1}",r['dur']+.6);h=ev("()=>HITS.slice()");res[k]=h
            print('move',k,'d',round(r['d'],1),'hits',h)
            if k not in('intro','stagger') and not h:bad.append('no hit '+k)
            ev("()=>{svEndMove(BE,true);if(BE.sv.ph>1&&!BE.sv.B.M.awaken)return 1;return 1}")
        # the new moves' safe spots: the hero starts straight ahead (so the boss does not turn) and steps to the spot after
        # the move has committed (tm), the way a player reads the tell and moves
        MOVE="(o)=>{const e=BE,a=e.m.rotation.y+o.off;toPos(e.m.position.x+Math.sin(a)*o.d,e.m.position.z+Math.cos(a)*o.d);return 1}"
        for k,d,tm,d1,off,ph,want,why in [('grasp',6,.9,6,.75,1,0,'stepped out of the cone'),('grasp',6,.9,6,0,1,1,'in the cone'),('spin',3.5,1.0,8.6,0,1,0,'backed beyond the outer ring'),
                                     ('spin',1.8,0,1.8,0,1,1,'inside: first cut only'),('thorns',9,.6,13.4,.131,2,1,'in a gap of wave 1: only wave 2'),('thorns',9,.6,9,1.3,2,0,'left the fan')]:
            place(d,0,ph);ev("(k)=>{svStart(BE,k,7);return 1}",k)
            if tm>0:ev("(d)=>{STEP(d);return 1}",tm);ev(MOVE,{'d':d1,'off':off})
            ev("(d)=>{STEP(d);return 1}",ev("(k)=>BE.sv.B.M[k].dur",k)+.05-tm);ev("()=>{svEndMove(BE,true);return 1}")
            h=ev("()=>HITS.slice()");pull=ev("()=>+Math.hypot(pl.position.x-BE.m.position.x,pl.position.z-BE.m.position.z).toFixed(2)")
            print('safe',k,why,'hits',h,'hero dist after',pull)
            if len(h)!=want:bad.append(f'{k} {why}: {len(h)} hits, want {want}')
            if k=='thorns' and want==1 and h and h[0][2]<2.0:bad.append('thorns gap was hit by wave 1')
            if k=='grasp' and want==1 and pull>4.2:bad.append(f'grasp did not pull ({pull})')
            ev("()=>{svEndMove(BE,true);return 1}")
    if 'ai' in PART:
        ev("()=>{svPick=__pick;return 1}")
        for ph in (1,2):
            place(8,0,ph)
            r=ev("""([SEC,ph])=>{const e=BE,S=e.sv,A=XA;S.rest=.5;const seen={};let t=0,last='',bad=0;
              while(t<SEC){const k=t*.35,rad=t%14<5?3.5:t%14<10?7:12;let x=A.cx+Math.cos(k)*rad,z=A.cz+Math.sin(k)*rad;
                pl.position.x+=(x-pl.position.x)*.08;pl.position.z+=(z-pl.position.z)*.08;STEP(.1);t+=.1;
                if(S.ph!==ph){S.ph=ph;e.bs.ph=ph}e.c.h=M(e.c)*(ph===1?.9:.4);
                if(S.mv&&S.mv.id!==last){last=S.mv.id;seen[last]=(seen[last]||0)+1}if(!S.mv)last=''}
              return {seen,warns:DTL.live.length,fx:KQ.fx.length}}""",[SEC,ph])
            print('ai phase',ph,json.dumps(r))
            want=['grasp','spin'] if ph==1 else ['grasp','spin','thorns']
            for k in want:
                if k not in r['seen']:bad.append(f'AI never chose {k} in phase {ph}')
            ev("()=>{svEndMove(BE,true);return 1}")
    ev("()=>{STEP(.5);return 1}")
    le=ev("()=>window.LERR||0")
    print('errs',errs[:8],le)
    if errs or le:bad.append('errors')
    print('RESULT','ok' if not bad else 'FAIL '+'; '.join(bad))
play.run(s,w=800,hh=512)
