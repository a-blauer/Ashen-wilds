# v152: can Abeksi be crossed unseen? For each district, replay every snake's routine (from a checkpoint restart, so exactly what the
# player meets), then search space × time for a crouched route from the district's checkpoint to the next district (the last one:
# to the drain) that never stands where any snake could see a crouched hero. Prints, per district, whether such a route exists and
# the earliest arrival; OUTF=<file> saves the routes (plan coordinates) for a picture. A route must exist for every district.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));AB152Q.st=1;ab152Enter();await wait(900);for(let i=0;i<5;i++)homeTick(1/30,performance.now());
  const S=AB152.S,G=S.G,P=S.P,Wd=G.W,Hd=G.H,DT=.45,TMAX=+(window.AB_TMAX||200),N=Math.round(TMAX/DT);
  // the snakes' routines, from a restart, with nobody to see (the hero is not live)
  S.acts.forEach(ab152ResetActor);const snap=[],Hx={live:false};
  for(let k=0;k<=N;k++){snap.push(S.acts.map(a=>({u:a.u,v:a.v,yaw:a.yaw,hy:a.hy,st:a.st,o:a.o,role:a.role,lamp:a.lamp})));for(let j=0;j<6;j++)S.acts.forEach(a=>ab152ActTick(a,DT/6,0,Hx))}
  S.acts.forEach(ab152ResetActor);
  // static light per tile
  const lit0=new Float32Array(Wd*Hd);for(let v=0;v<Hd;v++)for(let u=0;u<Wd;u++){let L=.12;for(const q of S.lights){const d=Math.hypot(u-q.u,v-q.v);if(d<q.r)L=Math.max(L,1-d/q.r*.85)}lit0[v*Wd+u]=L}
  const open=i=>!G.sol[i]&&G.cls[i]!==2;
  const seen=(k,u,v)=>{const A=snap[Math.min(k,N)];let L=lit0[v*Wd+u];for(const a of A)if(a.lamp){const d=Math.hypot(u-a.u,v-a.v);if(d<5)L=Math.max(L,1-d/5*.7)}
    for(const a of A){if(Math.abs(a.u-u)>17||Math.abs(a.v-v)>17)continue;if(ab152Sees(a,u,v,true,L)>0)return true}return false};
  const res=[];
  for(let d=0;d<P.CP.length;d++){const c=P.CP[d],st=[Math.round(c[0]),Math.round(c[1])];
    const goal=d<P.CP.length-1?(u,v)=>v>=P.D[d+1][0]+1:(u,v)=>Math.hypot(u-P.EXIT[0],v-P.EXIT[1])<1.6;
    let fr=new Map([[st[1]*Wd+st[0],-1]]);const par=[fr];let hit=null;
    for(let k=0;k<N&&!hit;k++){const nx=new Map();
      for(const [i] of fr){const u=i%Wd,v=(i/Wd)|0;for(const [du,dv] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const x=u+du,y=v+dv;if(x<0||y<0||x>=Wd||y>=Hd)continue;const j=y*Wd+x;if(nx.has(j)||!open(j))continue;
        if(seen(k+1,x,y))continue;nx.set(j,i);if(goal(x,y)){hit=[k+1,j];break}}if(hit)break}
      par.push(nx);fr=nx;if(!fr.size)break}
    const r={d:P.CP[d][3],ok:!!hit,t:hit?+(hit[0]*DT).toFixed(1):null,front:fr.size};
    if(hit){const path=[];let k=hit[0],i=hit[1];while(k>=0&&i>=0){path.push([i%Wd,(i/Wd)|0]);i=par[k].get(i);k--}r.path=path.reverse().filter((q,n,A)=>n%2==0||n==A.length-1)}
    // how much of the district a careless walk exposes: fraction of tiles inside it that some snake sees at t=0 (standing)
    res.push(r)}
  return res}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);tot=0
    for q in r:
        print('%-18s %s  %s s  (frontier %s, %s points)'%(q['d'],'route' if q['ok'] else 'NO ROUTE',q['t'],q['front'],len(q.get('path') or [])))
        if not q['ok']:F('no unseen route through '+q['d'])
        else:tot+=q['t']
    print('fastest perfect crossing: %.0f s'%tot)
    if os.environ.get('OUTF'):open(os.environ['OUTF'],'w').write(json.dumps(r))
    print('v152 route:',len(fails),'fails')
play.run(s)
