# v237 the Unsealing, easier (owner, Nov 15 2026: "Reduce spawn rates by 30%, make them spawn more scattered and have most spawn
# farther away and make cheddar's health regen slowly. enemies are also getting stuck in the corner next to the sealed gate."):
# spawn points away from the gate's neck, most far out and on open ground; 30% longer between waves; Cheddar heals while unhurt
# and unsiphoned; a creature inside a blocked tile or held behind a bowl gets out; a 60 s run with nobody stuck.   python3 v237_unseal.py
import play,json,re,os
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c:fails.append(m)
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v205_unsealing.py'),encoding='utf8').read()
SETUP=src[src.index('JS=r"""')+7:src.index('"""',src.index('JS=r"""')+7)]
JS=r"""async()=>{const o={};const F=cq205F(0),R=ch205Spots(),c=R.circ,Lc=(x,z)=>F.L2(x,z);window.requestAnimationFrame=()=>0;try{ren.render=()=>{}}catch(_){}
 CHEAT.god=true;hero.hp=heroMax();ch205Talk();const b=$('xwF').querySelector('[data-ch205="begin"]');if(b)b.click();try{closeX()}catch(_){}
 const E=US205.E;o.E=!!E;let T=performance.now();const run=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){T+=33;loop(T);if(f)f(i)}};
 const [px,pz]=F.W2(1.5,1.5);toPos(px,pz);run(7);o.go=E.go;
 // the points
 o.near=us205Spots().map(p=>[Lc(p.x,p.z)[0],Math.hypot(p.x-c.x,p.z-c.z),us237Room(p.x,p.z,1.2)]);o.far=us205Far().map(p=>[Lc(p.x,p.z)[0],Math.hypot(p.x-c.x,p.z-c.z),us237Room(p.x,p.z,1.2)]);o.reach=F.reach;o.pools=US205.mist.length;
 // 240 spawns: where they land
 enemies.filter(e=>e.us205).forEach(e=>removeE(e));const got=[];const keep=E.sp;E.sp=99;
 for(let i=0;i<240;i++){const k=['vamp','bloodbat','mist','siph'][i%4];const e=us205Spawn(k);if(!e)continue;const p=e.m.position;got.push([k,Math.hypot(p.x-c.x,p.z-c.z),Lc(p.x,p.z)[0],us237Free(p)?1:0,Math.round(p.x)+','+Math.round(p.z)]);removeE(e)}
 o.spawn=got;const bk=us205Spawn('brk');o.brk=bk?Math.hypot(bk.m.position.x-c.x,bk.m.position.z-c.z):0;if(bk)removeE(bk);
 // the wave timer is 30% longer
 E.sp=0;const k=Math.min(1,E.t/US205.T);us205Tick(1/30,T);o.sp=[E.sp,Math.max(.7,2.4-1.4*k)/0.7];E.sp=keep;
 // Cheddar heals while unhurt and unsiphoned; a hit stops it for 4 s
 enemies.filter(e=>e.us205).forEach(e=>removeE(e));E.sp=99;const tk=s=>{for(let i=0;i<Math.round(s*30);i++){T+=33;us205Tick(1/30,T);E.sp=99}};
 E.hp=50;E.lhp=50;E.rgT=0;tk(10);o.h10=E.hp;E.hp-=5;const h1=E.hp;tk(3);o.hurtGap=E.hp-h1;tk(4);o.after=E.hp-h1;
 E.hp=50;E.lhp=50;E.rgT=0;E.sl=[{x:c.x+9,z:c.z}];const fs=E.siN;const ot=us205Tethers;o.siphHeal=null;
 // stuck creatures: one inside a bowl's tile, one behind a bowl with Cheddar straight beyond it
 toPos(...F.W2(-12,0));hero.hp=heroMax();const bw=R.bowls[0];let bx=bw.x,bz=bw.z;
 const e1=us205Spawn('vamp',{x:bx,z:bz,y:GH(bx,bz),a:0});e1.m.position.set(bx,GH(bx,bz),bz);e1.usK=1;e1.usOn=1;o.in0=us237Free(e1.m.position);
 run(1.2,()=>{E.hp=US205.hpM});o.in1=us237Free(e1.m.position);removeE(e1);
 const ux=bw.x-c.x,uz=bw.z-c.z,ul=Math.hypot(ux,uz),qx=c.x+ux/ul*4.6,qz=c.z+uz/ul*4.6;const e2=us205Spawn('vamp',{x:qx,z:qz,y:GH(qx,qz),a:0});e2.m.position.set(qx,GH(qx,qz),qz);e2.usK=1;e2.usOn=1;e2.cd=99;
 let best=99;run(10,()=>{E.hp=US205.hpM;e2.cd=99;best=Math.min(best,Math.hypot(e2.m.position.x-c.x,e2.m.position.z-c.z))});o.behind=[Math.hypot(qx-c.x,qz-c.z),best];removeE(e2);
 // a 60 s run: the hero moves round and kills what reaches it; count creatures held in one place away from their target
 E.sp=1;const H={},stuck={};let P=F.W2(1.5,1.5),j=0;const spots=[[1.5,1.5],[8,6],[-3,-6],[9,-5],[8,-7]];
 run(60,i=>{if(i%(30*8)===0)P=F.W2(...spots[(j++)%spots.length]);toPos(P[0],P[1]);hero.hp=heroMax();if(E.hp<40)E.hp=60;
   if(i%10===0){const v=enemies.filter(e=>e.us205&&!e.dead&&e.us205!=='brk'&&Math.hypot(e.m.position.x-P[0],e.m.position.z-P[1])<2.5)[0];if(v)try{hurt(v,1e9,{col:0xffffff},false)}catch(_){}}
   if(i%30===0)enemies.forEach(e=>{if(!e.us205||e.dead||e.us205==='siph')return;const id=e.__v||(e.__v=Math.random().toString(36).slice(2));const h=H[id]||(H[id]=[]);h.push([e.m.position.x,e.m.position.z]);
     if(h.length>=5){const a=h[h.length-5],d=Math.hypot(a[0]-e.m.position.x,a[1]-e.m.position.z),dc=Math.hypot(e.m.position.x-c.x,e.m.position.z-c.z),dp=Math.hypot(e.m.position.x-P[0],e.m.position.z-P[1]);
       if(d<.3&&dc>3.5&&dp>3&&!e.atk)stuck[id]=(stuck[id]||0)+1}})});
 o.stuck=Object.values(stuck);o.alive=us205Alive();o.errs=US237.err;return o}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{POST.render=()=>{}}catch(_){};hero.lvl=45;CHEAT.god=true;return 1}")
    for st in ['gate','talk','keys']:pg.evaluate(SETUP,st)
    r=pg.evaluate(JS);sp=r.pop('spawn');print(json.dumps(r))
    ok(r['E'] and r['go'],'the unbinding starts')
    G=r['reach']-7
    ok(len(r['near'])>=4 and all(a<=G+1e-6 and 8<=d<=12.6 and room for a,d,room in r['near']),'near ring: %d points 8-12.6 m from Cheddar, none in the gate\'s neck, all open %s'%(len(r['near']),r['near']))
    ok(len(r['far'])>=6 and all(a<=G+1e-6 and 13.5<=d<=22.6 and room for a,d,room in r['far']),'far ring: %d points 14-22 m out, open %s'%(len(r['far']),r['far']))
    ok(r['pools']==len(r['near'])+len(r['far']),'a mist pool at every point (%d)'%r['pools'])
    ok(len(sp)>=230 and all(x[3]==1 for x in sp),'every spawn lands on open ground (%d spawns, %d inside a block)'%(len(sp),sum(1 for x in sp if not x[3])))
    ok(all(x[2]<=G+1.5 for x in sp),'nothing spawns in the gate\'s neck (largest a %.1f, limit %.1f)'%(max(x[2] for x in sp),G+1.5))
    mob=[x for x in sp if x[0]!='siph'];far=sum(1 for x in mob if x[1]>=12.5)/len(mob)
    ok(.55<=far<=.85,'most of the court comes from far away: %.0f%% from 12.5 m or more'%(100*far))
    ok(len(set(x[4] for x in sp))>=60,'the court lands scattered (%d different tiles)'%len(set(x[4] for x in sp)))
    ok(all(x[1]<13.6 for x in sp if x[0]=='siph'),'magisters still come from the near ring (at most %.1f m)'%max(x[1] for x in sp if x[0]=='siph'))
    ok(r['brk']>=13.5,'the Gate-Breaker comes from the far ring (%.1f m)'%r['brk'])
    ok(abs(r['sp'][0]-r['sp'][1])<1e-6,'30%% fewer waves: the timer is %.2f s (expected %.2f)'%tuple(r['sp']))
    ok(abs(r['h10']-55)<.3,'Cheddar heals 0.5 a second while unhurt: 50 -> %.1f in 10 s'%r['h10'])
    ok(abs(r['hurtGap'])<.01 and r['after']>0,'a hit stops the healing for 4 s, then it goes on (%.2f after 3 s, %.2f after 7 s)'%(r['hurtGap'],r['after']))
    ok(not r['in0'] and r['in1'],'a creature inside a blocked tile gets back onto open ground (%s -> %s)'%(r['in0'],r['in1']))
    ok(r['behind'][1]<2.6,'a thrall behind a key bowl gets round it to Cheddar (from %.1f m to %.1f m)'%tuple(r['behind']))
    ok(not any(n>=3 for n in r['stuck']),'60 s with the hero moving: nobody held in one place for 6 s or more %s'%r['stuck'])
    ok(r['errs']==0,'no v237 errors')
    print('FAILS',len(fails))
play.run(s)
