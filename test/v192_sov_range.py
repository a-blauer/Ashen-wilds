# v192: Sovereigns' ranged reach ×2 and Tab through a signature's targets (owner, Nov 2 2026).
#  1 numbers: every listed ranged move's AI range and line / cone reach is SOV192.K times the original; melee moves unchanged
#  2 reach: per boss, each changed ranged move cast with the hero standing beyond its OLD reach (but inside the new one) lands
#  3 far pick: with the hero 20 tiles away the boss answers with a ranged move more often than before (svPick, SOV192.on 0/1)
#  4 kiting: a short free fight per boss with the hero running wide circles: the boss casts ranged moves and lands hits
#  5 Tab: Vaelric's Blood Covenant: Tab goes through the four chalices first (nearest first, even one 40+ tiles away) then the
#    boss; the far target is kept; a homing shot at a chalice flies through the boss; a broken chalice hands the target on
#  BL=0..5 (bosses for 2-4), SEC=30 (kite fight length). Prints FAIL lines and CHECKS OK / CHECKS FAIL.
import play,json,os
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
BL=[int(x) for x in os.environ.get('BL','0,1,2,3,4,5').split(',')];SEC=float(os.environ.get('SEC','30'))
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,(' '+str(info)[:600]) if info!='' else '',flush=True)
    if not ok:FAIL.append(n)
# [move, hero distance (beyond the old reach, inside the new one), phase]
REACH={0:[('gaze',40,1),('furrow',22,1),('sweep',30,2)],
       1:[('breath',15,2),('maelstrom',15,2)],
       2:[('wraithchain',30,1),('cleave',16,1),('frostbrand',13,1)],
       3:[('spray',14,1),('glare',25,1)],
       4:[('vomit',15,1),('hook',20,1),('furrow',22,1)],
       5:[('wave',35,1),('grasp',14,1),('thorns',25.3,2)]}
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.HITS=[];const hb=bossHit;bossHit=function(e,k){HITS.push(+(+k).toFixed(2));return hb.apply(this,arguments)};
      window.__pick=svPick;svPick=()=>null;window.__down=down;down=function(){hero.hp=heroMax()};return 1}""")
    # ---- 1 numbers ----
    r=ev("""()=>{const out={bad:[],n:0,K:SOV192.K};for(const i in SOV192.M){const B=SVB[i],O=SOV192.orig[i]||{};for(const id in SOV192.M[i]){const D=B.M[id],o=SOV192.M[i][id],q=O[id];
        if(!D){out.bad.push(i+':'+id+' missing');continue}if(!q){out.bad.push(i+':'+id+' not applied');continue}out.n++;
        if(o.r&&q.r&&Math.abs(D.r[1]-Math.min(SOV192.cap,q.r[1]*SOV192.K))>1e-6)out.bad.push(i+':'+id+' range '+q.r[1]+'->'+D.r[1]);
        if(o.h&&D.hit&&!D.h192)D.hit.forEach((h,k)=>{if(!(o.h==='all'||o.h.includes(k)))return;const a=q.s[k],b=h.s;if(!a||!b)return;
          const va=a.k==='l'?a.l:a.k==='a'||a.k==='r'?a.r:null,vb=b.k==='l'?b.l:b.k==='a'||b.k==='r'?b.r:null;if(va!=null&&Math.abs(vb-va*SOV192.K)>1e-6)out.bad.push(i+':'+id+'#'+k+' '+va+'->'+vb)})}}
      // melee and gap closers keep their numbers
      const keep=[[0,'claw',[0,6.2],5.6],[1,'bite',[0,13],10.5],[2,'reap',[0,7.2],7],[3,'snap',[0,6.5],5.6],[4,'chop',[0,8],8.5],[5,'combo',[0,6.2],4.6],[5,'lunge',[4.5,15],15],[2,'glide',[7,26],16]];
      out.keep=keep.map(([i,id,rr,v])=>{const D=SVB[i].M[id],h=D.hit[0].s,hv=h.k==='l'?h.l:h.r;return D.r[0]===rr[0]&&D.r[1]===rr[1]&&hv===v?'':i+':'+id}).filter(Boolean);
      out.furrow=SVB[0].M.furrow.hit.length;out.fb=SVB[2].M.frostbrand.hit.filter(h=>h.s.k==='l').map(h=>h.f);return out}""")
    print('numbers',json.dumps(r))
    chk('ranged ranges and reaches are x%s (%d moves)'%(r['K'],r['n']),not r['bad'] and r['n']>=30,r['bad'])
    chk('melee moves and gap closers unchanged',not r['keep'],r['keep'])
    chk('Amber Furrow has twice the spike circles',r['furrow']==14,r['furrow'])
    chk('Frostbrand wave runs twice as far',max(r['fb'])>16,r['fb'])
    PLACE="""(o)=>{const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.cd={};S.rest=99;try{if(S.gone)S.B.reset(e)}catch(_){}
        if(o.ph===2&&S.ph<2){S.ph=2;e.bs.ph=2}if(o.ph===1&&S.ph>1){S.ph=1;e.bs.ph=1}e.c.h=Math.round(M(e.c)*(o.ph===2?.45:.9));
        const a=EA,ux=Math.cos(a),uz=Math.sin(a),b=o.b==null?-21:o.b;e.m.position.set(A.cx+ux*b,0,A.cz+uz*b);e.m.rotation.y=Math.atan2(ux,uz);
        toPos(e.m.position.x+ux*o.d,e.m.position.z+uz*o.d);hero.iv=0;pl.step=null;HITS.length=0;STEP(.05);return 1}"""
    tot=[0,0]
    for i in BL:
        ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",i);pg.wait_for_timeout(800)
        info=ev("""(i)=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});bossDone.delete(i);se208Reset();if(!bossEnt(i))spawnBoss(i);const A=ARN[i];window.XA=A;
          const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*9,A.cz+Math.sin(a)*9);STEP(.3);
          const e=bossEnt(i);window.BE=e;STEP(3.4);return {f:!!(AF&&AF.f),sv:!!(e&&e.sv)}}""",i)
        if not info['f'] or not info['sv']:chk('boss %d: fight started'%i,False,info);continue
        ev("(f)=>{window.PLACE=eval(f);return 1}",PLACE)
        # ---- 2 reach beyond the old numbers ----
        for k,d,ph in REACH[i]:
            r=ev("""([k,d,ph])=>{const e=BE,S=e.sv,D=S.B.M[k];if(!D)return {err:'no move'};PLACE({d,ph});const L0=+d2(pl.position,e.m.position).toFixed(1);window.LERR='';
              svStart(e,k,7);let t=0;while(S.mv&&t<D.dur+1){STEP(.1);t+=.1}STEP(1.8);return {L0,hits:HITS.slice(),err:window.LERR||'',ph:S.ph}}""",[k,d,ph])
            print('boss',i,'reach',k,d,json.dumps(r))
            chk('boss %d: %s lands at %s tiles (beyond its old reach)'%(i,k,d),bool(r.get('hits')) and not r.get('err') and abs(r.get('L0',0)-d)<1.5,r)
            ev("()=>{svEndMove(BE,true);BE.sv.ph=1;BE.bs.ph=1;return 1}")
        # ---- 3 the far pick ----
        r=ev("""(i)=>{const e=BE,S=e.sv,out={};for(const on of [0,1]){SOV192.on=on;let n=0,rg=0,none=0;
            for(let ph=1;ph<=2;ph++)for(let k=0;k<200;k++){PLACE({d:20,ph,b:-10});S.cd={};S.last=[];S.far141=0;S.force=null;const id=__pick(e);if(id&&sov192Sig(id))continue;n++;if(!id)none++;else if(SOV192.ranged[i].has(id))rg++}
            out[on?'new':'old']={n,rg,none,frac:+(rg/n).toFixed(2)}}SOV192.on=1;svEndMove(e,true);return out}""",i)
        print('boss',i,'far pick',json.dumps(r))
        chk('boss %d: a ranged answer to a far hero more often'%i,r['new']['frac']>=r['old']['frac'] and r['new']['frac']>=.6,r)
        # ---- 4 kiting: the real AI, the hero running wide circles ----
        r=ev("""([i,SEC])=>{const e=BE,S=e.sv,A=XA;svPick=__pick;PLACE({d:18,ph:1,b:-6});S.rest=.5;HITS.length=0;const R=SOV192.ranged[i];let t=0,ang=EA,rc=0,last='',dmgT=0;const seen={};
            while(t<SEC&&!e.dead){ang+=.1*5/22;const q=inArena(A,new THREE.Vector3(A.cx+Math.cos(ang)*22,0,A.cz+Math.sin(ang)*22),1);pl.position.x=q.x;pl.position.z=q.z;
              STEP(.1);t+=.1;if(e.c.h<M(e.c)*.6)e.c.h=M(e.c)*.9;
              if(S.mv&&S.mv.id!==last){last=S.mv.id;seen[last]=(seen[last]||0)+1;if(R.has(last))rc++}if(!S.mv)last=''}
            svPick=()=>null;svEndMove(e,true);return {rc,hits:HITS.length,moves:seen,err:window.LERR||''}}""",[i,SEC])
        print('boss',i,'kite',json.dumps(r))
        tot[0]+=r['rc'];tot[1]+=r['hits']
        chk('boss %d: casts ranged moves at a kiting hero'%i,r['rc']>=2 and not r['err'],r)
    # a hero running a steady 22-tile circle at full speed dodges most aimed attacks: a few hits over all six fights
    if len(BL)>1:chk('kiting heroes get hit (all bosses)',tot[1]>=3,tot)
    # ---- 5 Tab through the Blood Covenant's chalices ----
    ev("()=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[5].ins[3])}");pg.wait_for_timeout(800)
    r=ev("""()=>{const i=5;enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});bossDone.delete(i);se208Reset();if(!bossEnt(i))spawnBoss(i);const A=ARN[i];window.XA=A;
      const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*9,A.cz+Math.sin(a)*9);STEP(.3);const e=bossEnt(i);window.BE=e;STEP(3.4);
      if(!AF)return {err:'no fight'};const S=e.sv;svEndMove(e,true);S.ph=2;e.bs.ph=2;e.c.h=M(e.c)*.45;e.m.position.set(A.cx,0,A.cz);S.rest=99;svStart(e,'covenant',7);STEP(2.2);
      const C=(S.mv&&S.mv.an.props||[]).filter(p=>!p.dead);if(C.length!==4)return {err:'chalices '+C.length};
      // the hero by the wall beyond one pedestal: the opposite chalice is 40+ tiles away
      const c0=C[0].m.position,dx=c0.x-A.cx,dz=c0.z-A.cz,l=Math.hypot(dx,dz);toPos(A.cx+dx/l*26,A.cz+dz/l*26);STEP(.1);
      const dist=C.map(p=>+d2(p.m.position,pl.position).toFixed(1));setTarget(e);TAB192.cyc=null;
      const seq=[];for(let k=0;k<6;k++){selectTarget();seq.push(tgt===e?'B':C.includes(tgt)?'C'+C.indexOf(tgt):tgt?'o':'-')}
      const near=C.slice().sort((a,b)=>d2(a.m.position,pl.position)-d2(b.m.position,pl.position)).map(p=>'C'+C.indexOf(p));
      // the farthest one stays targeted
      const far=C.slice().sort((a,b)=>d2(b.m.position,pl.position)-d2(a.m.position,pl.position))[0];setTarget(far);STEP(.6);const kept=tgt===far;
      // a homing bolt at a chalice with the boss standing in between flies through him
      const tg=C.find(p=>p!==far)||far;setTarget(tg);const tp=tg.m.position,mid=new THREE.Vector3((tp.x+pl.position.x)/2,0,(tp.z+pl.position.z)/2);e.m.position.set(mid.x,0,mid.z);S.rest=99;
      const v=new THREE.Vector3(tp.x-pl.position.x,0,tp.z-pl.position.z).normalize();window.HH192=[];const hh=heroHit;heroHit=function(q){HH192.push(q);return hh.apply(this,arguments)};
      launch(pl.position,v,15,{col:0x9a7aff,mt:'m',home:1},50,4);STEP(2.5);
      const shot={chalice:HH192.filter(q=>q===tg).length,boss:HH192.filter(q=>q===e).length,aim:bfxTgtOk(tg,24)};
      // a straight arrow (no homing) at a chalice reaches it across its pedestal (solid tiles)
      const t2=C.find(p=>p!==far&&p!==tg&&!p.dead)||tg,q2=t2.m.position,l2=Math.hypot(A.cx-q2.x,A.cz-q2.z)||1;e.m.position.set(A.cx,0,A.cz);toPos(q2.x+(A.cx-q2.x)/l2*6,q2.z+(A.cz-q2.z)/l2*6);setTarget(null);
      const v2=new THREE.Vector3(q2.x-pl.position.x,0,q2.z-pl.position.z).normalize(),h2=t2.c.h;HH192.length=0;launch(pl.position,v2,24,{col:0xe8d8b0,arrow:1,mt:'p'},30,1);STEP(1);shot.arrow=HH192.filter(q=>q===t2).length;heroHit=hh;
      // break the targeted chalice: the target moves on to another chalice
      const tb=C.find(p=>!p.dead&&p!==far)||C.find(p=>!p.dead);setTarget(tb);hurt(tb,1e9,null,false);STEP(.2);const next=C.includes(tgt)&&!tgt.dead?'C':tgt===e?'B':tgt?'o':'-';
      return {dist,seq:seq.join(','),near:near.join(','),kept,shot,next,err:window.LERR||''}}""")
    print('tab',json.dumps(r))
    if r.get('err'):chk('Tab test set up',False,r)
    else:
        seq=r['seq'].split(',');near=r['near'].split(',')
        chk('Tab: the four chalices first, nearest first, then the boss, then round again',seq[:5]==near+['B'] and seq[5]==near[0],r)
        chk('Tab reaches a chalice 40+ tiles away',max(r['dist'])>34 and r['near'].count('C')==4,r['dist'])
        chk('a far targeted chalice stays targeted',r['kept'])
        chk('a homing bolt at the targeted chalice flies through the boss',r['shot']['chalice']>0 and r['shot']['boss']==0,r['shot'])
        chk('breaking the targeted chalice targets the next one',r['next']=='C',r['next'])
        chk('a straight arrow reaches a chalice across its pedestal',r['shot'].get('arrow',0)>0,r['shot'])
    # ---- 6 co-op: a partner's copy plays the driver's relayed Blood Wave with the doubled reach ----
    if not r.get('err'):
        ev("(f)=>{window.PLACE=eval(f);return 1}",PLACE)
        r=ev("""()=>{const e=BE,S=e.sv;PLACE({d:35,ph:1});const m0=MP.on,me0=MP.me,rh0=MP.rh,o0=MP.others;let out={};
          try{MP.on=true;MP.me='m';MP.others=1;MP.rh={'0':{pr:{ar:5,hp:10,rg:MP.rg}}};out.auth=svAuth(e);out.driver=mpBossAuth(5);
            mpOnEV({peer:'0',data:{r:MP.rg,l:[['b',5,'sv5_wave',1.007]]}});out.mv=S.mv&&S.mv.id}finally{MP.on=m0;MP.me=me0;MP.rh=rh0;MP.others=o0}
          let t=0;while(S.mv&&t<3){STEP(.1);t+=.1}STEP(1.8);out.hits=HITS.slice();out.err=window.LERR||'';return out}""")
        print('relayed',json.dumps(r))
        chk('co-op: the partner\'s copy plays the relayed Blood Wave and it reaches 35 tiles',r.get('auth') is False and r.get('mv')=='wave' and bool(r.get('hits')),r)
    le=ev("()=>window.LERR||0")
    chk('no page errors',not errs,errs[:3])
    chk('no game loop errors',not le,le)
    print('CHECKS OK' if not FAIL else 'CHECKS FAIL '+str(FAIL))
play.run(s,w=640,hh=400)
