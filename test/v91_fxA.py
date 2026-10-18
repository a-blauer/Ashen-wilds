# v91 fxA: Piercing Arrow, Explosive Arrow, Call of the Wild (ranger) and Shadow Clone (assassin) visuals.
# Casts each ability against training dummies with a virtual clock (deterministic frames), saves frame sheets
#   out/v91_<tag>_<ability>.jpg  (TAG=before with SRC=<old build> for a comparison)
# and checks: the cast still deals the same damage (DMG= json from a SRC run to compare), damage lands when the arrow
# reaches each dummy, no page errors, scene objects back to the baseline once the effects are over.
#   ONLY=pierce,explo,wolf,clone   pick abilities      NOSHOT=1   skip the screenshots (fast)
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v90_abil_lib.js').read()
TAG=os.environ.get('TAG','after');ONLY=os.environ.get('ONLY','pierce,draw,explo,wolf,clone').split(',');NOSHOT=os.environ.get('NOSHOT')
FAIL=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' · '+str(info)[:400] if info!='' else ''),flush=True)
    if not ok:FAIL.append(name)
JS=r"""()=>{
 window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;window.__rr=ren.render.bind(ren);
 window.F={dum:[],dmg:[],gt:0,errs:[]};
 {const f=hurt;hurt=function(e,d,s,crit,dot){const h0=e&&e.c?e.c.h:0;const r=f.apply(this,arguments);const i=F.dum.indexOf(e);if(i>=0)F.dmg.push({i,d:h0-e.c.h,t:+F.gt.toFixed(3)});return r}}
 // deterministic hits on the dummies (no random crits or spread) so damage can be compared between builds
 {const f=rollHero;rollHero=function(e,raw,mt,o){if(!F.dum.includes(e))return f.apply(this,arguments);const s=HS(),c0=s.crit,R=Math.random;s.crit=-1;Math.random=()=>.5;try{return f.apply(this,arguments)}finally{s.crit=c0;Math.random=R}}}
 {const f=heroTick;heroTick=function(dt,now){F.gt+=dt>0?dt:0;F.dum.forEach((e,i)=>{if(e.dead)e.dead=0;e.c.h=Math.max(e.c.h,1e8);e.stun=5;e.agg=0;e.m.position.x=e._p[0];e.m.position.z=e._p[1];e.vx=e.vz=0;if(e.atk)mCancel(e)});
   enemies.slice().forEach(q=>{if(!F.dum.includes(q)&&!q.boss)removeE(q)});hero.hp=heroMax();hero.mp=mpMax();party.forEach(c=>{if(c)c.h=0});return f.apply(this,arguments)}}
 // n frames of 16 ms; draw: render the last one
 window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));ren.render=()=>{};POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(F.tod!=null)TOD=F.tod;loop(VT);F.cam&&F.cam()}
   ren.render=__rr;POST.render=__pr;if(draw){F.cam&&F.cam();POST.render()}return F.gt};
 return 1}"""
def sheet(files,out,cols=4):
    ims=[Image.open(f) for f in files];w,h=ims[0].size;rows=(len(ims)+cols-1)//cols
    S=Image.new('RGB',(w*cols,h*rows),(0,0,0))
    for i,im in enumerate(ims):S.paste(im,((i%cols)*w,(i//cols)*h))
    S.save(out,quality=86);[os.remove(f) for f in files]
RES={}
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]+' '+(e.stack or '')[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{const q=PMAP[0];toPos(q.path[40][0],q.path[40][1])}");pg.wait_for_timeout(2500)
    ev("(L)=>{eval(L)}",LIB);ev(JS)
    # a flat, open spot on the road (SPOT=zone,path index), HUD hidden for the pictures
    Z,I=[int(x) for x in os.environ.get('SPOT','1,60').split(',')]
    ev("""([Z,I])=>{const q=PMAP[Z];const [x,z]=q.path[I],n=q.path[Math.min(q.path.length-1,I+6)];window.F.P0=[x,z];F.a=Math.atan2(n[0]-x,n[1]-z);F.W=(lx,lz)=>[lx*Math.cos(F.a)+lz*Math.sin(F.a),-lx*Math.sin(F.a)+lz*Math.cos(F.a)];F.tod=.25;toPos(x,z);
      [...$('stage').children].forEach(c=>{if(c!==ren.domElement&&!c.contains(ren.domElement))c.style.visibility='hidden'});return [x,z]}""",[Z,I])
    def setup(cls,lv,names,dums,cam):
        r=ev("""([cls,lv,names,dums,camv])=>{kqsClear();F.dum.forEach(e=>removeE(e));F.dum=[];hero.cls=cls;cheatLevel(Math.max(0,lv-hero.lvl));hero.tal={__ab:1};
          kqsAll(cls).forEach(s=>{if(s.lv<=lv)hero.tal['ab:'+s.n]=1});hero.tal.__ld=names.join('|');V90.gear(lv);hero.buffs=[];hero.cd={};hero.cr=0;KQS.cdn={};hsDirty();try{refreshGear()}catch(_){}
          const [x,z]=F.P0;toPos(x,z);pl.rotation.y=F.a;STEP(.3);
          dums.forEach(([lx,lz])=>{const [dx,dz]=F.W(lx,lz);const e=spawnEnemy(V90.mobKey(lv),x+dx,z+dz,lv,{});e.c.st.hp=1e9;e.c.h=6e8;e._p=[x+dx,z+dz];e.m.position.set(x+dx,0,z+dz);F.dum.push(e)});
          tgt=F.dum[0]||null;F.c0=camv;F.cam=()=>{const c=F.c0,X=F.P0[0],Z=F.P0[1],Y=GH(X,Z),a=F.W(c[0],c[2]),b=F.W(c[3],c[5]);cam.position.set(X+a[0],Y+c[1],Z+a[1]);cam.lookAt(X+b[0],Y+c[4],Z+b[1])};
          STEP(.5);F.dmg=[];hud();return {sk:heroSkills().map(s=>s.n),lv:hero.lvl}}""",[cls,lv,names,dums,cam])
        return r
    def run(key,cls,lv,name,dums,cam,times,extra=None,wait_end=None):
        if key not in ONLY:return
        print('\n==',key,name,setup(cls,lv,[name],dums,cam))
        base=ev("()=>{try{bowFxSet(.5,1);bowFxSet(0,0)}catch(_){}STEP(.2);window.__kids=new Set(scene.children);return {n:scene.children.length,all:(()=>{let n=0;scene.children.forEach(c=>{if(!window.FXA||c!==FXA.root)c.traverse(()=>n++)});return n})(),pool:window.FXA?FXA.root.children.length:0,live:window.FXA?FXA.live.length:0,o:KQS.objs.length}}")
        r=ev("()=>{F.dmg=[];F.gt0=F.gt;tgt=F.dum[0];const c0=hero.cd.s0||0;cast(0);return {cd:+(hero.cd.s0||0).toFixed(2),mp:hero.mp}}")
        chk(key+': cast went off',r['cd']>0,r)
        files=[];t0=0;info=[]
        for i,t in enumerate(times):
            st=ev("([dt,draw])=>{STEP(dt,draw);return {t:+(F.gt-F.gt0).toFixed(2),n:scene.children.length,o:KQS.objs.length,sh:shots.length,x:"+(extra or "0")+"}}",[t-t0,not NOSHOT]);t0=t
            info.append(st)
            if not NOSHOT:
                f=play.TMP+'/_v91_%s_%d.png'%(key,i);pg.locator('#stage').screenshot(path=f,timeout=240000);files.append(f)
        for st in info:print('  ',st)
        if files:sheet(files,play.TMP+'/v91_%s_%s.jpg'%(TAG,key))
        end=ev("([w])=>{STEP(w);return {n:scene.children.length,all:(()=>{let n=0;scene.children.forEach(c=>{if(!window.FXA||c!==FXA.root)c.traverse(()=>n++)});return n})(),pool:window.FXA?FXA.root.children.length:0,live:window.FXA?FXA.live.length:0,o:KQS.objs.length,sh:shots.length,new:scene.children.filter(c=>!__kids.has(c)).map(c=>c.type+':'+c.name+':'+c.children.length).slice(0,6)}}",[wait_end or 3])
        dm=ev("()=>F.dmg");tot=sum(d['d'] for d in dm)
        RES[key]={'dmg':round(tot),'hits':len(dm),'per':[round(sum(d['d'] for d in dm if d['i']==i)) for i in range(len(dums))],'t':[d['t'] for d in dm][:12]}
        print('  damage',RES[key],'| scene',base,'->',end)
        chk(key+': scene children back to baseline',end['n']<=base['n'] and end['o']==0 and end['sh']==0 and end.get('live',0)==0,(base,end))
        chk(key+': no leftover objects in the scene graph',end['all']<=base['all']+2,(base['all'],end['all']))
        return dm
    # Piercing Arrow: three dummies in a line (3, 5.5, 8 tiles), side view
    dm=run('pierce','ranger',30,'Piercing Arrow',[[0,3],[.4,5.5],[-.3,8]],[5.8,1.9,3.4,0,1.1,4.2],[.06,.14,.22,.3,.36,.4,.44,.48,.52,.58,.66,.8],
        "(()=>{const o=window.FXA&&FXA.dbg;return o?o.pierce:0})()")
    if 'pierce' in ONLY:
        H=ev("()=>window.FXA&&FXA.dbg.pierce?FXA.dbg.pierce.hits:null")
        chk('pierce: each dummy is hit when the arrow reaches it (along-line distance vs arrow distance)',H is not None and len(H)==3 and all(0<=s_-a<1.6 for a,s_ in H),H)
    # the heavy draw up close (front-left of the hero)
    run('draw','ranger',30,'Explosive Arrow',[[0,6.5]],[2.0,1.7,2.3,0,1.25,.2],[.05,.1,.15,.2,.25,.3,.35,.39,.43,.48,.55,.7],wait_end=8)
    # Explosive Arrow: one dummy at 6
    run('explo','ranger',30,'Explosive Arrow',[[0,6.5]],[4.6,2.0,3.6,0,1.0,4.6],[.08,.18,.28,.36,.44,.52,.6,.7,.85,1.1,1.6,3.0],wait_end=6)
    # Call of the Wild: a dummy 5 ahead; the wolf runs in and bites
    run('wolf','ranger',30,'Call of the Wild',[[1.5,5]],[4.2,1.7,1.6,.8,.7,3.4],[.1,.3,.6,1.0,1.4,1.8,2.3,2.8,3.4,4.2,14.6,15.0],wait_end=2)
    # Shadow Clone (assassin): a dummy 4 ahead
    run('clone','assassin',30,'Shadow Clone',[[1.2,4.2]],[3.6,1.6,1.2,.7,1.0,2.8],[.1,.3,.6,1.0,1.4,1.8,2.3,2.9,3.6,4.4,7.85,8.1],wait_end=2)
    print('\nRESULT',json.dumps(RES))
    open(play.TMP+'/v91_dmg_%s.json'%TAG,'w').write(json.dumps(RES))
    if os.environ.get('DMG'):
        B=json.load(open(os.environ['DMG']))
        for k,v in RES.items():
            if k in B:
                b=B[k]['dmg'];chk(k+': same damage as the reference build (%s vs %s)'%(v['dmg'],b),abs(v['dmg']-b)<=max(2,.03*b),(v,B[k]))
    chk('no page errors',not errs,errs[:4])
play.run(s,w=900,hh=560)
print('FAILS',FAIL)
