# v146: the Sovereigns to the Vorraxis standard. For each boss (BOSS=5 or BOSS=0,1,..; default all overhauled ones):
#  * the model builds (triangles, joints), springs are set, every move (old and new) runs to its end without errors
#  * Phase II changes the den (A.s146.ph2 and the boss's own den object)
#  * the signature mechanic: cast it, the props rise (count), the boss is warded (S.dr), breaking every prop ends it in the
#    BROKEN stagger; cast it again and let it complete: the fail outcome happens (heal / the boss's own check)
#  * the den is clean after the fight ends (no s146 objects or props left)
#  SHOT=1 (default) writes out/v146_<boss>_*.png: the den in Phase II, the signature in progress. Prints FAIL lines.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
SHOT=os.environ.get('SHOT','1')!='0'
DONE=[5,2,4,0,1,3]
CFG={5:{'sig':'covenant','props':4,'env':"!!(A.s146&&A.s146.tide)",'name':'vaelric'},
     2:{'sig':'heart','props':3,'env':"!!(A.s146&&A.s146.wo)",'name':'wraith'},
     4:{'sig':'feast','props':3,'env':"!!(A.s146&&A.s146.rot)",'name':'bloated'},
     0:{'sig':'hundred','props':4,'env':"!!(A.s146&&A.s146.fog)",'name':'argus'},
     1:{'sig':'sever','props':3,'env':"!!(A.s146&&A.s146.mere)",'name':'hydra'},
     3:{'sig':'scars','props':3,'env':"!!(A.s146&&A.s146.sinks)",'name':'ssithra'}}
BOSSES=[int(x) for x in os.environ.get('BOSS',','.join(str(b) for b in DONE)).split(',')]
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      window.__pick=svPick;svPick=()=>null;window.__down=down;down=function(){hero.hp=heroMax()};
      const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);return 1}""")
    for I in BOSSES:
        C=CFG[I];tag=C['name']
        ev("(i)=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[i].ins[3])}",I);pg.wait_for_timeout(800)
        info=ev("""(i)=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[i];window.XA=A;
          const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);window.EA=a;toPos(A.cx+Math.cos(a)*9,A.cz+Math.sin(a)*9);STEP(.3);
          const e=bossEnt(i);window.BE=e;STEP(.4);const S=e.sv;let tri=0;S.R.root.traverse(o=>{if(o.isMesh){const g=o.geometry;tri+=g.index?g.index.count/3:g.attributes.position.count/3}});
          return {sv:!!S,f:A.f,tris:Math.round(tri),joints:Object.keys(S.R.J).length,spr:Object.keys(S.B.spr||{}).length,moves:Object.keys(S.B.M)}}""",I)
        print(tag,'info',json.dumps(info))
        if not info['f']:F('%s: the fight did not start'%tag)
        if info['spr']<2:F('%s: no springs (%s)'%(tag,info['spr']))
        if C['sig'] not in info['moves'] or 'broken' not in info['moves']:F('%s: signature/broken move missing'%tag)
        ev("()=>{STEP(3.4);return 1}")
        PLACE="""(o)=>{const e=BE,S=e.sv,A=XA;svEndMove(e,true);S.mv=null;S.stg=0;S.inv=0;S.cd={};try{S.B.reset&&S.B.reset(e)}catch(_){}
            if(o.ph===2&&S.ph<2){S.ph=2;e.bs.ph=2}e.c.h=Math.round(M(e.c)*(o.hp||.5));
            e.m.position.set(A.cx,0,A.cz);e.m.rotation.y=Math.atan2(Math.cos(EA),Math.sin(EA));const a=e.m.rotation.y+(o.off||0);
            toPos(A.cx+Math.sin(a)*o.d,A.cz+Math.cos(a)*o.d);hero.iv=0;STEP(.05);return 1}"""
        # every move to its end (Phase II for ph:2 moves), no errors
        res=ev("""(o)=>{const e=BE,S=e.sv,out=[];window.LERR='';for(const id of Object.keys(S.B.M)){if(['intro','awaken','stagger','broken',o.sig].includes(id))continue;const D=S.B.M[id];
            (%s)({d:4,ph:(D.ph||1)===2?2:1});if(!svStart(e,id)){out.push(id+':nostart');continue}let t=0;const lim=D.sig163?D.dur*2+2:D.dur+2;while(S.mv&&S.mv.id===id&&t<lim){STEP(.1);t+=.1}out.push(id+":"+(t<=lim-1?'ok':'stuck')+(window.LERR?':ERR':''));window.LERR=''}
            svEndMove(e,true);return out}"""%PLACE,{'sig':C['sig']})
        bad=[m for m in res if not m.endswith(':ok')]
        if bad:F('%s: moves %s'%(tag,bad))
        print(tag,'moves',len(res))
        # Phase II: the den changes
        ev(PLACE,{'d':6,'ph':2});ev("()=>{STEP(1.5);return 1}")
        env=ev("()=>{const A=XA;return {ph2:!!(A.s146&&A.s146.ph2),own:%s}}"%C['env'])
        if not env['ph2'] or not env['own']:F('%s: Phase II den change missing %s'%(tag,env))
        if SHOT:
            ev("()=>{const e=BE,p=e.m.position;cam.position.set(p.x+9,GH(p.x,p.z)+9,p.z+9);cam.lookAt(p.x,GH(p.x,p.z)+1,p.z);POST.render();return 1}");pg.screenshot(path=play.TMP+'/v146_%s_ph2.png'%tag)
        # the signature: break every prop → BROKEN
        sig=ev("""(o)=>{const e=BE,S=e.sv;(%s)({d:6,ph:2});window.LERR='';svStart(e,o.sig);STEP(2.6);const an=S.mv&&S.mv.an,P=(an&&an.props)||[];const r={mv:S.mv&&S.mv.id,props:P.filter(p=>!p.dead).length,dr:S.dr};
            const h0=e.c.h;hurt(e,1000,null,false);r.took=h0-e.c.h;r.err=window.LERR||'';return r}"""%PLACE,{'sig':C['sig']})
        print(tag,'sig',json.dumps(sig))
        if sig.get('err'):F('%s: game loop error during the signature: %s'%(tag,sig['err'][:300]))
        if sig['props']!=C['props']:F('%s: %s props, expected %s'%(tag,sig['props'],C['props']))
        if not (sig['dr']>0 and sig['dr']<1 and sig['took']<500):F('%s: not warded during the signature (dr %s, took %s of 1000)'%(tag,sig['dr'],sig['took']))
        if SHOT:
            ev("()=>{const e=BE,p=e.m.position;cam.position.set(p.x+11,GH(p.x,p.z)+8,p.z+11);cam.lookAt(p.x,GH(p.x,p.z)+1.5,p.z);POST.render();return 1}");pg.screenshot(path=play.TMP+'/v146_%s_sig.png'%tag)
        br=ev("""()=>{const e=BE,S=e.sv,P=(S.mv&&S.mv.an&&S.mv.an.props)||[];P.slice().forEach(p=>{if(!p.dead)hurt(p,1e9,null,false)});STEP(.4);return {mv:S.mv&&S.mv.id,dr:S.dr,stg:S.stg,err:window.LERR||''}}""")
        print(tag,'broken',json.dumps(br))
        if br.get('err'):F('%s: game loop error after breaking the props: %s'%(tag,br['err'][:300]))
        if br['mv']!='broken' or br['dr']!=0:F('%s: breaking every prop did not BREAK him %s'%(tag,br))
        # the signature again, left alone: the fail outcome (he heals)
        fl=ev("""(o)=>{const e=BE,S=e.sv;(%s)({d:6,ph:2,hp:.4});const h0=e.c.h;S.cd={};svStart(e,o.sig);let t=0;while(S.mv&&S.mv.id===o.sig&&t<34){STEP(.2);t+=.2}STEP(3);
            return {err:window.LERR||'',healed:e.c.h-h0,left:(XA.s146&&XA.s146.props||[]).filter(p=>!p.dead&&!p._gone).length,dr:S.dr}}"""%PLACE,{'sig':C['sig']})
        print(tag,'fail',json.dumps(fl))
        if fl.get('err'):F('%s: game loop error in the failed signature: %s'%(tag,fl['err'][:300]))
        if not fl['healed']>0:F('%s: the completed signature did not heal (%s)'%(tag,fl['healed']))
        if fl['left']!=0 or fl['dr']!=0:F('%s: props/ward left after the signature %s'%(tag,fl))
        # the fight ends: the den is clean
        cl=ev("()=>{try{arenaFail()}catch(e){return 'ERR '+e}STEP(.5);const A=XA,D=A.s146;return {objs:D?D.objs.length:0,props:D?D.props.length:0,ph2:D?D.ph2:0,live:enemies.filter(e=>e.dprop&&!e.dead).length}}")
        print(tag,'clear',json.dumps(cl))
        if not isinstance(cl,dict) or cl['objs'] or cl['props'] or cl['ph2'] or cl['live']:F('%s: den not clean after the fight %s'%(tag,cl))
    for e in errs[:6]:F('page error '+e)
    print('v146 sovereigns:',len(fails),'fails')
play.run(s)
