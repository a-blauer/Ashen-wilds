# v112 Ssith'ra: every move cast (old + new) with hit / dodge checks, the burrow chain (head-only surfacings when she
# will burrow again, the whole body only on the last one — also as a co-op partner), the AI picking the new moves, a
# short free fight, and close-up screenshots (SHOT=0 skips them).  Run:  flock /home/claude/kq-test.lock python3 v112_ssithra.py
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
SH=os.environ.get('SHOT','1')!='0';FIGHT=float(os.environ.get('SEC','24'));PARTS=os.environ.get('PART','moves,burrow,ai,fight,shots').split(',')
OUT=play.TMP;BAD=[]
def chk(ok,msg):
    print(('  ok   ' if ok else '  FAIL ')+msg)
    if not ok:BAD.append(msg)
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[3].ins[3])}");pg.wait_for_timeout(1500)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(window.GOD)hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push(+(+k).toFixed(2));return hb.apply(this,arguments)};window.GOD=1;
      window.SHOTCAM=(e,side,dist,h,ly)=>{const p=e.m.position,a=e.m.rotation.y+side;cam.position.set(p.x+Math.sin(a)*dist,GH(p.x,p.z)+h,p.z+Math.cos(a)*dist);cam.lookAt(p.x,GH(p.x,p.z)+(ly==null?h*.45:ly),p.z);POST.render()};
      window.PICK0=svPick;svPick=()=>null;window.AUTH0=svAuth;window.__down=down;down=function(){hero.hp=heroMax()};
      const L=new THREE.HemisphereLight(0xffffff,0x554433,1.1);scene.add(L);const D=new THREE.DirectionalLight(0xfff0dd,.9);D.position.set(30,60,20);scene.add(D);
      const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);
      enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[3];window.XA=A;const P=PMAP[3].ins[3].en;window.EA=Math.atan2(P[1]-A.cz,P[0]-A.cx);
      toPos(A.cx+Math.cos(EA)*10,A.cz+Math.sin(EA)*10);STEP(.3);window.BE=bossEnt(3);STEP(3.4);
      // put the boss in the middle facing the entrance, the hero at distance d (side: 0 front, 1.57 right flank, 3.14 behind)
      window.PLACE=(d,side)=>{const e=BE,S=e.sv;svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.cd={};if(S.gone)S.B.reset(e);S.hdOnly=0;S.emT=null;S.skT=null;
        enemies.slice().forEach(q=>{if(q.minion)removeE(q)});e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=Math.atan2(Math.cos(EA),Math.sin(EA));ssrTrail(e,S,true);
        const a=e.m.rotation.y+(side||0);toPos(A.cx+Math.sin(a)*d,A.cz+Math.cos(a)*d);hero.iv=0;HITS.length=0;STEP(.05);HITS.length=0};
      // how much of her is out of the sand: is the head up, how many body segments have their centre above the ground
      window.OUTN=()=>{const e=BE,S=e.sv;if(!e.m.visible)return {vis:0,head:0,segs:0};let n=0;const v=new THREE.Vector3();
        for(let k=0;k<14;k++){const J=S.R.J['s'+k];if(!J.visible)continue;svWP(e,'s'+k,0,0,0,v);if(v.y-GH(v.x,v.z)>.3)n++}
        svWP(e,'head',0,0,0,v);return {vis:1,head:+(v.y-GH(v.x,v.z)).toFixed(2),segs:n}};
      // the biggest gap between neighbouring parts of the chain (head back → s0 → s1 …): the body must stay connected
      window.GAP=()=>{const e=BE,S=e.sv,v=new THREE.Vector3(),w=new THREE.Vector3();let mx=0;svWP(e,'head',0,-.02,-.62,v);
        for(let k=0;k<14;k++){svWP(e,'s'+k,0,0,0,w);const sc=e.m.bs?1:1,d=v.distanceTo(w);mx=Math.max(mx,d-SSR.sp[k]);v.copy(w)}return +mx.toFixed(3)};
      return 1}""")
    info=ev("()=>{const S=BE.sv;let n=0,tri=0;S.R.root.traverse(o=>{if(o.isMesh){n++;tri+=o.geometry.attributes.position.count/3}});return {moves:Object.keys(S.B.M),joints:Object.keys(S.R.J).length,meshes:n,tris:Math.round(tri),merge:S.R.mergeN}}")
    print('model',json.dumps(info))
    chk(info['meshes']<320,'draw calls %d < 320'%info['meshes'])
    for k in ['glare','sinkhole','quills','burrowH','burrowB','burrowC']:chk(k in info['moves'],'move %s registered'%k)
    # ---------------- every move: stand in it (hit) / step out of it (miss) ----------------
    if 'moves' in PARTS:
        # [move, distance, side, phase, dodge time (step out), expect a hit when standing]
        plan=[['snap',4,0,1,.6,1],['snap2',4,0,2,.3,1],['slam',7,0,1,1.0,1],['spray',5,0,1,.8,1],['charge',12,0,1,.9,1],['burrow',10,0,1,0,1],
              ['glare',11,0,1,1.45,1],['sinkhole',8,0,1,2.0,1],['quills',6,1.57,1,1.6,1],['quills',6,3.14,2,1.6,1],['glare',11,0,2,1.45,1],['spit',9,0,2,0,1],['geysers',10,0,2,0,1],
              ['intro',8,0,1,0,0],['awaken',8,0,2,0,0],['stagger',6,0,1,0,0]]
        for mv,d,side,ph,dodge,exp in plan:
            for mode in (['stand','dodge'] if dodge else ['stand']):
                r=ev("""([k,d,side,ph,mode,dodge])=>{const e=BE,S=e.sv;PLACE(d,side);S.ph=ph;e.bs.ph=ph;if(k==='awaken'){S.ph=1;e.bs.ph=1}
                  const errs0=window.LERR;svStart(e,k,7);const D=S.mv.D;let t=0,maxGap=0;const ids=[k];
                  while(t<D.dur+.2){STEP(.05);t+=.05;maxGap=Math.max(maxGap,GAP());
                    if(mode==='dodge'&&t>=dodge&&t<dodge+.06){const a=e.m.rotation.y+side+Math.PI,A=XA;toPos(A.cx+Math.sin(a)*12.5,A.cz+Math.cos(a)*12.5)}
                    if(S.mv&&ids[ids.length-1]!==S.mv.id)ids.push(S.mv.id)}
                  const r={hits:HITS.slice(),ids,gap:+maxGap.toFixed(3),gone:!!S.gone,err:window.LERR||0};svEndMove(e,true);S.mv=null;return r}""",[mv,d,side,ph,mode,dodge])
                print('move',mv,'ph',ph,mode,json.dumps(r))
                if mode=='stand' and exp:chk(len(r['hits'])>0,'%s ph%d lands when you stand in it'%(mv,ph))
                if mode=='dodge':chk(len(r['hits'])==0,'%s ph%d misses when you step out'%(mv,ph))
                chk(r['gap']<.05,'%s: body stays connected (max gap %.3f)'%(mv,r['gap']))
    # ---------------- the burrow chain ----------------
    if 'burrow' in PARTS:
        seeds=ev("()=>{const e=BE,S=e.sv,o={more:[],last:[]};for(let sd=1;sd<60;sd++){PLACE(10,0);S.ph=1;svStart(e,'burrow',sd);(S.mv.D===S.B.M.burrowH?o.more:o.last).push(sd);svEndMove(e,true);S.mv=null}return o}")
        print('burrow seeds: chain',seeds['more'][:8],'single',seeds['last'][:8])
        chk(len(seeds['more'])>5 and len(seeds['last'])>5,'the follow-up decision depends on the seed (both outcomes happen)')
        # the decision is the same every time for a seed (so every co-op partner makes the same one)
        same=ev("(sd)=>{const e=BE,S=e.sv,r=[];for(let i=0;i<4;i++){PLACE(10,0);S.ph=1;svStart(e,'burrow',sd);r.push(S.mv.D===S.B.M.burrowH);svEndMove(e,true);S.mv=null}return r}",seeds['more'][0])
        chk(all(same),'same seed, same decision %s'%same)
        def chain(first,seed,ph,auth=True,relay=None,wait=0):
            return ev("""([first,seed,ph,auth,relay,wait])=>{const e=BE,S=e.sv;PLACE(10,0);S.ph=ph;e.bs.ph=ph;if(!auth)svAuth=()=>false;
              const out=[];try{svStart(e,first,seed);let t=0,cur=null,tb=0,T0=0,rel=0;
              while(t<16){if(S.mv&&S.mv!==cur){cur=S.mv;const D=cur.D,tw=D.ev.find(v=>/svHitNow/.test(String(v[1])));tb=tw?tw[0]:0;T0=t;out.push({id:cur.id,head:!!D.head,startGone:!!S.gone,at:{}})}
                STEP(.05);t+=.05;const o=out[out.length-1];
                if(cur&&S.mv===cur){const lt=t-T0;if(lt>=tb+.4&&!o.at.pop){o.at.pop=OUTN();o.at.gap=GAP()}if(lt>=tb+1.3&&!o.at.late){o.at.late=OUTN()}if(lt<tb-.3&&lt>tb-.5)o.at.under=OUTN()}
                if(!S.mv){if(relay&&!rel&&t-T0>0){rel=1;STEP(.2);t+=.2;out.push({gap:'relay'});BMV['sv3_'+relay](e,XA,1.005);continue}
                  if(!o.after){o.after={gone:!!S.gone};STEP(wait||.05);t+=wait||.05;o.after.later=OUTN();o.after.gone2=!!S.gone;STEP(1.4);t+=1.4;o.after.late=OUTN()}break}}}
              finally{svAuth=AUTH0}svEndMove(e,true);S.mv=null;return {seq:out,err:window.LERR||0}}""",[first,seed,ph,auth,relay,wait])
        def show(name,r):
            print(name,json.dumps(r))
            return [x for x in r['seq'] if 'id' in x]
        sq=show('chain burrow (will burrow again)',chain('burrow',seeds['more'][0],1))
        chk([x['id'] for x in sq]==['burrow','burrowC'],'burrow → burrowC (got %s)'%[x['id'] for x in sq])
        if len(sq)>=2:
            p=sq[0]['at'].get('pop',{});chk(p.get('vis')==1 and p.get('head',0)>1.2 and p.get('segs',99)<=2,'1st surfacing: only the head and a bit of neck out (%s)'%p)
            chk(sq[1]['startGone'],'the follow-up starts under the sand')
            p=sq[1]['at'].get('pop',{});chk(p.get('head',0)>1.5,'last surfacing: the head is up (%s)'%p)
            p=sq[1]['at'].get('late',{});chk(p.get('segs',0)>=12,'last surfacing: the whole body comes out (%s)'%p)
            u=sq[1]['at'].get('under',{});chk(u.get('vis',1)==0,'hidden while it hunts (%s)'%u)
        sq=show('single burrow',chain('burrow',seeds['last'][0],1))
        chk([x['id'] for x in sq]==['burrow'],'a single burrow has no follow-up')
        if sq:
            p=sq[0]['at'].get('late',{});chk(p.get('segs',0)>=12,'single burrow: the whole body comes out (%s)'%p)
        sq=show('triple burrow (phase II)',chain('geysers',5,2))
        chk([x['id'] for x in sq]==['geysers','burrowB','burrowC'],'geysers → burrowB → burrowC (got %s)'%[x['id'] for x in sq])
        for j,x in enumerate(sq):
            p=x['at'].get('pop',{});l=x['at'].get('late',{})
            if j<2:chk(p.get('segs',99)<=2 and p.get('head',0)>1.2,'triple burrow #%d: head only (%s)'%(j+1,p))
            else:chk(l.get('segs',0)>=12,'triple burrow #3: whole body (%s)'%l)
        # co-op partner: not the driver. Same seed → same head-only surfacing; the follow-up comes from the relay
        sq=show('partner, relayed follow-up',chain('burrow',seeds['more'][0],1,False,'burrowC'))
        chk([x['id'] for x in sq]==['burrow','burrowC'],'partner: the relayed burrowC plays (got %s)'%[x['id'] for x in sq])
        if len(sq)>=2:
            p=sq[0]['at'].get('pop',{});chk(p.get('segs',99)<=2 and p.get('head',0)>1.2,'partner: 1st surfacing is head-only too (%s)'%p)
            chk(sq[1]['startGone'],'partner: still under the sand when the relay arrives')
            p=sq[1]['at'].get('late',{});chk(p.get('segs',0)>=12,'partner: whole body at the end (%s)'%p)
        sq=show('partner, relay never comes',chain('burrow',seeds['more'][0],1,False,None,.9))
        if sq:
            a=sq[0].get('after',{});chk(len(sq)==1 and a.get('gone') and not a.get('gone2') and a.get('late',{}).get('segs',0)>=12,'partner without the relay: she surfaces whole after a short wait (%s)'%a)
        # a stagger right after a head-only surfacing brings the body out
        r=ev("""(sd)=>{const e=BE,S=e.sv;PLACE(10,0);S.ph=1;svStart(e,'burrow',sd);const D=S.mv.D;let t=0;while(S.mv&&S.mv.D===D&&t<8){STEP(.05);t+=.05}
          svEndMove(e,true);S.mv=null;S.gone=1;S.ghost=1;e.m.visible=false;svStart(e,'stagger',3);STEP(.1);const a=OUTN();STEP(1.4);const b=OUTN();svEndMove(e,true);S.mv=null;return {a,b,gone:!!S.gone}}""",seeds['more'][0])
        print('stagger after head-only',json.dumps(r));chk(r['b']['segs']>=12 and not r['gone'],'stagger while buried: she comes out whole')
    # ---------------- the AI picks the new moves ----------------
    if 'ai' in PARTS:
        r=ev("""()=>{svPick=PICK0;const e=BE,S=e.sv,res={};
          for(const [d,side,ph] of [[4,0,1],[8,0,1],[12,0,1],[18,0,1],[6,1.57,1],[6,3.14,1],[8,0,2],[12,0,2],[6,3.14,2]]){PLACE(d,side);S.ph=ph;const c={};
            for(let i=0;i<400;i++){S.cd={};S.last=[];const id=svPick(e);c[id]=(c[id]||0)+1}res[d+'/'+side+'/ph'+ph]=c}
          svPick=()=>null;return res}""")
        for k,v in r.items():print('pick',k,json.dumps(v))
        tot={}
        for v in r.values():
            for k,n in v.items():tot[k]=tot.get(k,0)+n
        for k in ['glare','sinkhole','quills','burrow','geysers']:chk(tot.get(k,0)>0,'AI picks %s (%d)'%(k,tot.get(k,0)))
        chk(r['6/3.14/ph1'].get('quills',0)>r['6/3.14/ph1'].get('burrow',0),'behind her, Quill Volley is the main answer')
        for k in ['burrowH','burrowB','burrowC']:chk(tot.get(k,0)==0,'AI never picks %s on its own'%k)
    # ---------------- a short free fight with the real AI ----------------
    if 'fight' in PARTS and FIGHT>0:
        r=ev("""(SEC)=>{svPick=PICK0;const e=BE,S=e.sv,A=XA;PLACE(9,0);S.ph=1;e.c.h=M(e.c);HITS.length=0;let t=0;const seen={};let last='',maxGap=0;
          while(t<SEC){const k=t*.35,rad=t%12<4?4:t%12<8?9:14;let x=A.cx+Math.cos(k)*rad,z=A.cz+Math.sin(k)*rad;pl.position.x+=(x-pl.position.x)*.08;pl.position.z+=(z-pl.position.z)*.08;
            STEP(.1);t+=.1;if(t>SEC/2&&S.ph===1)e.c.h=M(e.c)*.5;if(S.mv&&S.mv.id!==last){last=S.mv.id;seen[last]=(seen[last]||0)+1}if(!S.mv)last='';if(!S.gone)maxGap=Math.max(maxGap,GAP())}
          svPick=()=>null;const r={seen,ph:S.ph,hits:HITS.length,gap:+maxGap.toFixed(3),warns:DTL.live.length,err:window.LERR||0};svEndMove(e,true);S.mv=null;return r}""",FIGHT)
        print('fight',json.dumps(r));chk(r['ph']==2,'phase II reached');chk(r['gap']<.05,'fight: body stays connected (%.3f)'%r['gap'])
    # ---------------- screenshots ----------------
    if SH and 'shots' in PARTS:
        def shot(name,side=.9,dist=15,h=5,ly=None):
            ev("([s,d,h,ly])=>SHOTCAM(BE,s,d,h,ly)",[side,dist,h,ly]);fn=f'{OUT}/v112ss_{name}.png';pg.locator('#gl canvas').screenshot(path=fn,timeout=300000,animations='disabled');print('shot',fn)
        def cast(k,d,side,ph,t,seed=7):
            ev("([k,d,side,ph,t,seed])=>{const e=BE,S=e.sv;PLACE(d,side);S.ph=ph;e.bs.ph=ph;svStart(e,k,seed);STEP(t);return 1}",[k,d,side,ph,t,seed])
        ev("()=>{PLACE(12,0);BE.sv.ph=1;STEP(1.2);return 1}");shot('idle',.9,14,5);shot('idle_head',.5,6.5,2.6,1.4);shot('idle_side',1.57,16,4)
        cast('slam',7,0,1,1.1);shot('slam_rear',1.57,16,6,3)
        cast('glare',11,0,1,1.35);shot('glare_aim',1.2,15,5,3)
        ev("()=>{STEP(.42);return 1}");shot('glare_fire',1.6,16,6,1)
        cast('sinkhole',8,0,1,1.5);shot('sinkhole_churn',1.9,15,8,0)
        ev("()=>{STEP(1.05);return 1}");shot('sinkhole_collapse',1.9,15,8,1)
        cast('quills',6,1.57,1,1.25);shot('quills_arch',1.57,15,5,2)
        ev("()=>{STEP(.45);return 1}");shot('quills_fling',2.2,16,8,0)
        sd=ev("()=>{const e=BE,S=e.sv;for(let sd=1;sd<60;sd++){PLACE(10,0);S.ph=1;svStart(e,'burrow',sd);const h=S.mv.D===S.B.M.burrowH;svEndMove(e,true);S.mv=null;if(h)return sd}return 1}")
        cast('burrow',10,0,1,.8,sd);shot('burrow_dive',1.4,15,5,1)
        ev("()=>{STEP(3.6);return 1}");shot('burrow_headpop',1.3,10,3.5,1.6)
        ev("()=>{STEP(1.4);let n=0;while(BE.sv.mv&&BE.sv.mv.id!=='burrowC'&&n++<20)STEP(.1);STEP(1.7+.35);return 1}");shot('burrow_lastpop',1.3,14,5,2.5)
        ev("()=>{STEP(.7);return 1}");shot('burrow_emerged',1.3,15,5,1.5)
        ev("()=>{PLACE(12,0);BE.sv.ph=2;STEP(1.2);return 1}");shot('phase2',.9,14,5)
        ev("()=>{const e=BE;e.c.h=1;hurt(e,1e9,{col:0xffffff},false);STEP(1.6);return 1}");shot('death',1.2,14,5)
    print('errs',errs[:10],ev("()=>window.LERR||0"),ev("()=>SVX.st"))
    chk(not errs and not ev("()=>window.LERR||0"),'no console errors')
    print('RESULT',('PASS' if not BAD else 'FAIL %d'%len(BAD)),BAD)
play.run(s,w=800,hh=512)
