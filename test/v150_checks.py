# v150 single-window checks: the sigil numbers and the ghost wolves' XP, bats with hind legs only, Tab in a den fight
# reaching a spawned object far from the den's centre, a chest kept off the Kindlelight II hatch, a relayed boss move
# carrying the boss's pose, the hatchet's edge keeping one side through the chop.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAILS=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info,flush=True)
    if not ok:FAILS.append(n)
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
      window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=__pr};
      down=function(){hero.hp=heroMax()};return 1}""")
    # 1) sigils
    r=ev("()=>[MQ145.total,MQ145.alive,gw150X({gw145:1}),gw150X({c:{en:'ghostwolf'}}),gw150X({c:{en:'goo'}})]")
    chk('ritual: 50 wolves, 12 at a time',r[0]==50 and r[1]==12,r)
    chk('ghost wolves (and co-op copies) give a quarter of the XP',r[2]==.25 and r[3]==.25 and r[4]==1,r)
    r=ev("""()=>{let n=0;const f=lootE_base;lootE_base=function(){n++};const e={c:{en:'ghostwolf',g:['Ashwolf'],l:5},m:{position:pl.position.clone()},gw145:1};
      const R=Math.random;let k=0;Math.random=()=>((k++*.6180339)%1);try{for(let i=0;i<400;i++){try{lootE(e)}catch(_){}}}finally{Math.random=R;lootE_base=f}return n}""")
    chk('ghost wolves drop loot about one kill in four',60<=r<=140,r)
    # 2) bats: no vertex hangs on a front-leg bone
    r=ev("""()=>{const out={};[['Batwing',{g:['Batwing'],cl:[0x5a4a6a],v:'',tr:'',f:0,z:1,evo:0,mods:[]}],['Duskwing',{g:['Duskwing'],cl:[0x6a5a8a],v:'',tr:'',f:0,z:1,evo:0,mods:[]}],['bloodbat',enemyC('bloodbat',10,{})]].forEach(([n,c])=>{
        const g=cr(c);let front=0,all=0;g.traverse(o=>{if(!o.isSkinnedMesh)return;const B=o.skeleton.bones.map(b=>b.name),SI=o.geometry.attributes.skinIndex,SW=o.geometry.attributes.skinWeight;
          for(let v=0;v<SI.count;v++){all++;let w=0;for(let j=0;j<4;j++){const nm=B[SI.array[v*SI.itemSize+j]]||'';if(/^f[lr][0-2]$/.test(nm))w+=SW.array[v*SW.itemSize+j]}if(w>.5)front++}});out[n]=[front,all]});return out}""")
    chk('bats are built with no front legs',all(v[1]>0 and v[0]==0 for v in r.values()),r)
    # 3) Tab in a den fight reaches a spawned object far from the den's centre
    ev("()=>{insArrive(PMAP[0].ins[3])}");pg.wait_for_timeout(800)
    r=ev("""()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const i=0,A=ARN[i];const P=PMAP[i].ins[3].en,a=Math.atan2(P[1]-A.cz,P[0]-A.cx);toPos(A.cx+Math.cos(a)*9,A.cz+Math.sin(a)*9);STEP(.3);
      const e=bossEnt(i);STEP(.5);if(!AF)return 'no fight';
      const x=pl.position.x+Math.cos(a+1.6)*(ARENA_R+12-9),z=pl.position.z+Math.sin(a+1.6)*(ARENA_R+12-9);
      const p=dqProp(A,x,z,{n:'Test Totem',frac:.02});const far=+Math.hypot(x-A.cx,z-A.cz).toFixed(1),dist=+Math.hypot(x-pl.position.x,z-pl.position.z).toFixed(1);
      const seen=[];for(let k=0;k<6;k++){selectTarget();seen.push(tgt===p?'P':tgt&&tgt.boss?'B':tgt?'o':'-')}removeE(p);try{arenaFail()}catch(_){}return {far,dist,seen:seen.join('')}}""")
    chk('Tab reaches a spawned object far from the den centre',isinstance(r,dict) and 'P' in r['seen'],r)
    # 4) a chest is kept off the Kindlelight II hatch
    r=ev("""()=>{const h=mq144HatchSpot();if(!h)return 'no hatch';const n=CHESTS.length;makeChest(Math.round(h.x),Math.round(h.z),'test chest',()=>{});const c=CHESTS[CHESTS.length-1];
      const d=Math.hypot(c.g.position.x-h.x,c.g.position.z-h.z);return [CHESTS.length-n,+d.toFixed(2)]}""")
    chk('chest moved off the hatch',isinstance(r,list) and r[0]==1 and r[1]>=2.8,r)
    # 5) a relayed boss move carries the boss's spot and facing
    ev("()=>{insArrive(PMAP[1].ins[3])}");pg.wait_for_timeout(800)
    r=ev("""()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const i=1,A=ARN[i];toPos(A.cx+6,A.cz);STEP(.4);const e=bossEnt(i);STEP(3.2);if(!AF)return 'no fight';const S=e.sv;
      const k=Object.keys(S.B.M).find(q=>S.B.M[q].wt&&!S.B.M[q].ph);MP.on=true;MP.me='m';MP.others=1;MP.rh={};MP.evq.length=0;svEndMove(e,true);svCast(e,k,77);
      const q=MP.evq.find(q=>q[0]=='b');const out=q?[q.length,+(q[4]-e.m.position.x).toFixed(2),+(q[5]-e.m.position.z).toFixed(2)]:null;
      // partner side: the relayed pose moves the copy there before the move
      svEndMove(e,true);MP.evq.length=0;MP.rh={'0':{pr:{ar:i,hp:10,rg:MP.rg}}};const tx=e.m.position.x+3,tz=e.m.position.z;mpOnEV({peer:'0',data:{l:[['b',i,'sv'+i+'_'+k,1.077,tx,tz,1.2]]}});
      const moved=+Math.hypot(e.m.position.x-tx,e.m.position.z-tz).toFixed(2);MP.on=false;MP.rh={};MP.others=0;MP.evq.length=0;hurt(e,1e9,1);STEP(2);return {out,moved}}""")
    chk('relayed boss move carries the pose',isinstance(r,dict) and r['out'] and r['out'][0]>=7 and abs(r['out'][1])<.02 and abs(r['out'][2])<.02,r)
    chk('partner starts the move from the relayed pose',isinstance(r,dict) and r['moved']<.05,r)
    print('errors',errs[:5],ev("()=>window.LERR||0"))
    print('V150_CHECKS','PASS' if not FAILS else 'FAIL',FAILS)
play.run(s,w=640,hh=400)
