# v100 town: checks + screenshot sheets for the new Duskhold (wards, courtyard inside the walls, market shop buildings,
# kingdom structures, six themed portal islands).
#   python3 v100_town.py                 checks (CHECKS OK / FAIL ...) + sheets in test/out/v100_*.png
#   SHOTS=0 python3 v100_town.py         checks only;   CHK=0 python3 v100_town.py   sheets only
#   PERF=1 SRC=<old dist> TAG=before python3 v100_town.py   only the draw-call / triangle numbers (works on the old build)
import os,json,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
from PIL import Image,ImageDraw
TAG=os.environ.get('TAG','after');CHK=os.environ.get('CHK','1')!='0';SH=os.environ.get('SHOTS','1')!='0';PERF=os.environ.get('PERF')
OUT=play.TMP;fails=[]
def ok(c,msg,info=None):
    print(('PASS ' if c else 'FAIL ')+msg,'' if info is None else json.dumps(info)[:600]);
    if not c:fails.append(msg)
def sheet(names,out,cols=3,w=420,h=260,labels=None):
    ims=[];
    for n in names:
        p=OUT+'/v100_'+n+'.png'
        if os.path.exists(p):ims.append((n,Image.open(p).resize((w,h))))
    if not ims:return
    rows=(len(ims)+cols-1)//cols;S=Image.new('RGB',(cols*w,rows*h),(10,10,14));d=ImageDraw.Draw(S)
    for i,(n,im) in enumerate(ims):x,y=(i%cols)*w,(i//cols)*h;S.paste(im,(x,y));d.rectangle([x,y,x+len(n)*7+8,y+16],fill=(0,0,0));d.text((x+4,y+2),(labels or {}).get(n,n),fill=(255,230,180))
    S.save(OUT+'/'+out);print('sheet',OUT+'/'+out)
PERFJS="""(spots)=>spots.map(([n,x,z,yaw,dist,pitch])=>{window.FCAM=null;toPos(x,z,yaw);camDist=dist;camPitch=pitch;snapCam();STEP(.4);let c=[],t=[];for(let i=0;i<3;i++){STEP(.05,1);c.push(ren.info.render.calls);t.push(ren.info.render.triangles)}
  c.sort((a,b)=>a-b);t.sort((a,b)=>a-b);return [n,c[1],t[1]]})"""
def s(pg):
    L.start(pg);ev=pg.evaluate
    P=lambda n,c,a=None:(lambda v:(print(n,'=>',json.dumps(v)[:1200]),v)[1])(ev(c,a) if a is not None else ev(c))
    T=ev("()=>{const T=TOWNS[0];return [T.cx,T.cy]}");cx,cy=T
    # ---- performance: the main Duskhold spots (+ the new wards), every upgrade at level 3, all shops built ----
    ev("()=>{SHOPS.forEach(o=>SH.shop[o.k]=1);SHU.forEach(u=>SH.lv[u.k]=3);shApply();visTick();TOD=.3}")
    spots=[['plaza',cx,cy+6,0,9.5,.3],['north',cx,cy-6,0,9.5,.3],['gate',cx+17,cy,-1.57,9.5,.3],['high',cx,cy+10,0,24,.7]]
    if not (PERF and TAG=='before'):spots+=[['market',cx,cy+36,0,9.5,.3],['courtyard',cx,cy+70,0,12,.4],['portal_k',96,284,-1.57,9.5,.3],['crossroads',84,286,0,12,.4]]
    pr=P('perf',PERFJS,spots);json.dump(pr,open(OUT+'/v100_perf_'+TAG+'.json','w'))
    if PERF:return
    # ---- checks ----
    if CHK:
        # 1. layout: west of the zones, inside the 4 px ground texture, walls/courtyard/portals sane
        r=P('layout',"""()=>{const T=TOWNS[0];let maxX=0,outTex=0,paved=0;for(let y=200;y<460;y++)for(let x=0;x<130;x++){const t=MAP[y][x];if(regionAt(x,y)<0&&t&&t!==''&&MAP.DW[y*W+x]<0)maxX=Math.max(maxX,x);if(t=='P'||t=='B'||t=='W'||t=='p'){paved++;if(GTX.pick(x>>5,y>>5)!==GTX.town)outTex++}}
          const cyIn=CYD.nodes.every(q=>townAt(q[0],q[1],0)==0&&q[1]>T.cy+TWN100_IW);
          return {maxX,x0:PMAP[0].x0,outTex,paved,cyIn,cyNodes:CYD.nodes.length,town:[T.cy-TS,T.cy+T.sz],pg:TWN100_PG.map(p=>[p.x,p.y,MAP.DW[p.y*W+p.x]<0,townAt(p.x,p.y,0)])}}""")
        ok(r['maxX']<r['x0']-2,'Duskhold and its islands stay west of the zones (x < 110)',[r['maxX'],r['x0']])
        ok(r['outTex']==0,'every paved/wall/road tile lies inside Duskhold\'s 4 px ground texture',r['outTex'])
        ok(r['cyIn'],'every courtyard node is inside the walls, behind the inner gate',r['cyNodes'])
        ok(all(q[2] and q[3]<0 for q in r['pg']),'six portal islands on solid ground outside the walls',r['pg'])
        # 2. reachability on foot (flood fill with the game's own collision) at kingdom levels 0..3, shops built and unbuilt
        FLOOD="""([L,built])=>{SHU.forEach(u=>SH.lv[u.k]=L);SH.shop={};if(built)SHOPS.forEach(o=>SH.shop[o.k]=1);shApply();visTick();
          const T=TOWNS[0],st=.25,x0=T.cx-38,z0=T.cy-62,nx=Math.round(110/st),nz=Math.round(210/st);
          const free=(x,z)=>!CR.some(([a,b])=>solid(x+a,z+b))&&!tcHit(x,z);const seen=new Uint8Array(nx*nz),q=[];
          const id=(x,z)=>{const i=Math.round((x-x0)/st),j=Math.round((z-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};
          const s0=id(T.sp[0],T.sp[1]);seen[s0]=1;q.push(s0);
          while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k=jj*nx+ii;if(seen[k])continue;
            const x=x0+ii*st,z=z0+jj*st;if(!free(x,z)){seen[k]=2;continue}seen[k]=1;q.push(k)}}
          const reach=(x,z,R)=>{for(let dz=-R;dz<=R;dz+=st)for(let dx=-R;dx<=R;dx+=st){if(dx*dx+dz*dz>R*R)continue;const k=id(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false};
          const tg=[['Steward',SHM.st.x,SHM.st.z],['Merchant',T.cx,T.cy-15.75+2.7],['Innkeeper',T.cx-14.25+1.45,T.cy-15.75+2.75],['Magic',T.cx+14.25+.7,T.cy-15.75+2.8],
            ['GateW',T.cx-23,T.cy],['GateE',T.cx+23,T.cy],['Fountain',T.cx,T.cy+3.8],['InnerGate',T.cx,T.cy+TWN100_IW+2],['SouthGate',T.cx,T.cy+T.sz+2],['Courtyard',CYD.x,CYD.y-3]];
          TWN100_SH.forEach(s=>{const p=TWN100_npc(s);tg.push(['shop_'+s.k,p[0],p[1]])});TWN100_PG.forEach((p,i)=>tg.push(['portal'+i,p.a[0],p.a[1]]));
          const open=CYD.nodes.filter(q=>q[3]<0||bossDone.has(q[3]));open.forEach((q,i)=>tg.push(['node'+i,q[0],q[1]]));
          const out=tg.map(([n,x,z])=>[n,reach(x,z,n.startsWith('node')?1.6:2.2)]);
          // roads: every road polyline sample must be walkable (no collider on a road)
          let roadBad=[];TWN100_RD.forEach((Ln,ri)=>{for(let i=0;i<Ln.length-1;i++){const [ax,ay]=Ln[i],[bx,by]=Ln[i+1],n=Math.ceil(Math.hypot(bx-ax,by-ay));for(let s=0;s<=n;s++){const x=ax+(bx-ax)*s/n,z=ay+(by-ay)*s/n;if(!free(x,z))roadBad.push([ri,+x.toFixed(1),+z.toFixed(1)])}}});
          // the market street and the gates' centre lines
          for(let z=T.cy+TS-2;z<T.cy+T.sz+3;z+=.5)if(!free(T.cx,z))roadBad.push(['street',T.cx,z]);
          return {L,built,unreach:out.filter(o=>!o[1]).map(o=>o[0]),n:out.length,roadBad:roadBad.slice(0,12),nBad:roadBad.length}}"""
        for Lv in [0,1,2,3]:
            for b in ([True,False] if Lv in (0,3) else [True]):
                r=P('reach L%d built=%s'%(Lv,b),FLOOD,[Lv,b])
                ok(not r['unreach'],'level %d (shops %s): every NPC, shop counter, gate, portal and open courtyard node is reachable on foot'%(Lv,'built' if b else 'unbuilt'),r['unreach'])
                ok(r['nBad']==0,'level %d (shops %s): roads, the market street and the gates are clear'%(Lv,'built' if b else 'unbuilt'),r['roadBad'])
        # 3. prompts: every shop (built and unbuilt), the Steward, every portal (locked / open), courtyard sign
        r=P('prompts',"""()=>{const out={};const at=(x,z)=>{toPos(x,z);STEP(.25);promptTick();return PR?PR.label:null};
          SH.shop={};shApply();visTick();TWN100_SH.forEach(s=>{const p=TWN100_npc(s);out['site_'+s.k]=at(p[0],p[1])});
          SHOPS.forEach(o=>SH.shop[o.k]=1);shApply();STEP(.3);visTick();TWN100_SH.forEach(s=>{const p=TWN100_npc(s);out['shop_'+s.k]=at(p[0],p[1])});
          out.steward=at(SHM.st.x+.8,SHM.st.z+.8);bossDone.clear();portalRefresh();
          PORT.forEach((Q,i)=>{const p=TWN100_PG[i];out['portal'+i+'_locked']=at(p.a[0]+(p.x-p.a[0])*.6,p.a[1]+(p.y-p.a[1])*.6)});
          [0,1,2,3,4].forEach(i=>bossDone.add(i));portalRefresh();PORT.forEach((Q,i)=>{const p=TWN100_PG[i];out['portal'+i+'_open']=at(p.a[0]+(p.x-p.a[0])*.6,p.a[1]+(p.y-p.a[1])*.6)});
          return out}""")
        for s in ['smith','alch','cook','bard','merchant','sage','trainer','stable']:
            if s!='smith':ok(not r.get('site_'+s) or 'Stronghold Steward' in r['site_'+s],'unbuilt %s has no shop prompt at its old plot (v103: shops are placed on a lot when built)'%s,r.get('site_'+s))
            ok(r.get('shop_'+s) and r['shop_'+s].startswith('F · '),'built %s has its shop prompt'%s,r.get('shop_'+s))
        ok(r.get('steward')=='F · Stronghold Steward','Steward prompt',r.get('steward'))
        ok(r.get('portal0_locked','').startswith('F · Enter') and all(r.get('portal%d_locked'%i,'').startswith('🔒') for i in range(1,6)),'locked portals say sealed, Kindlelight is open',[r.get('portal%d_locked'%i) for i in range(6)])
        ok(all(r.get('portal%d_open'%i,'').startswith('F · ') for i in range(6)),'open portals offer entry / map-or-trial',[r.get('portal%d_open'%i) for i in range(6)])
        # 4. shop windows open from the market
        r=P('windows',"""()=>{const o={};const T=TOWNS[0];const tr=(k)=>{const s=TWN100_SH.find(q=>q.k==k),p=TWN100_npc(s);toPos(p[0],p[1]);STEP(.2);promptTick();try{PR&&PR.fn()}catch(e){return 'ERR '+e}
            const vis=['xw','bag','shop','mshop'].filter(i=>!$(i).classList.contains('hide'));const r=[vis.join(','),typeof xwMode!='undefined'?xwMode:'',typeof bagTab2!='undefined'?bagTab2:''];['xw','bag','shop','mshop'].forEach(i=>$(i).classList.add('hide'));try{closeX()}catch(_){}return r};
          TWN100_SH.forEach(s=>o[s.k]=tr(s.k));return o}""")
        ok(r['smith'][0]=='bag' and r['smith'][2]==ev("()=>KQM_FORGE"),'Blacksmith opens the Forge tab',r['smith'])
        for k,m in [('alch','alch'),('cook','cook'),('stable','stable'),('merchant','visitor'),('trainer','visitor'),('bard','visitor'),('sage','visitor')]:
            ok(r[k][0]=='xw' and r[k][1]==m,'%s opens its window (%s)'%(k,m),r[k])
        # 5. portals: enter each zone from its gate, come home in front of the same gate, recall-back and restart prompt
        r=P('portals',"""async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),out=[];for(let i=0;i<6;i++){bossDone.clear();for(let j=0;j<i;j++)bossDone.add(j);portalRefresh();INST=null;const p=TWN100_PG[i],nx=p.x+(p.a[0]-p.x)*.36,nz=p.y+(p.a[1]-p.y)*.36;toPos(nx,nz);STEP(.1);
            const pp=portalPrompt();if(pp){pp.fn();await w(700);STEP(.3)}const ent=curMap(),en=PMAP[i].en,dEn=Math.hypot(pl.position.x-en[0],pl.position.z-en[1]);
            const n=PMAP[i].path[40];toPos(n[0],n[1]);STEP(.2);goHome();await w(700);STEP(.3);INST=null;
            out.push({i,lab:pp&&pp.label,ent,dEn:+dEn.toFixed(1),home:[+pl.position.x.toFixed(1),+pl.position.z.toFixed(1)],dHome:+Math.hypot(pl.position.x-p.a[0],pl.position.z-p.a[1]).toFixed(1),solid:solid(pl.position.x,pl.position.z)})}
          return out}""")
        ok(all(q['ent']==q['i'] and q['dEn']<3 for q in r),'each portal gate enters its own zone at the entrance',[(q['i'],q['ent'],q['dEn']) for q in r])
        ok(all(q['dHome']<1.5 and not q['solid'] for q in r),'coming home lands in front of that zone\'s gate',[(q['i'],q['dHome']) for q in r])
        r=P('recall',"""async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));bossDone.clear();bossDone.add(0);portalRefresh();INST=null;enterMap(1);await w(700);STEP(1.5);const q=PMAP[1].path[60];toPos(q[0],q[1]);STEP(1.5);
            const ros=[ROST.r,ROST.slots.length];recallTown();STEP(.2);const inTown=townAt(pl.position.x,pl.position.z,0)==0,inst=!!INST&&INST.r==1;
            RECBACK=nowP();recallTown();STEP(.3);const back=curMap()==1&&Math.hypot(pl.position.x-q[0],pl.position.z-q[1])<3;
            recallTown();STEP(.2);const p=TWN100_PG[1];toPos(p.x+(p.a[0]-p.x)*.36,p.y+(p.a[1]-p.y)*.36);STEP(.1);const pp=portalPrompt();let ask=null;if(pp){pp.fn();await w(300);const d=$('instQ');ask=d&&getComputedStyle(d).display!='none'&&!d.classList.contains('hide')?d.textContent.slice(0,120):(!$('xw').classList.contains('hide')?$('xwT').textContent:null)}try{closeX();const d=$('instQ');if(d)d.classList.add('hide')}catch(_){}INST=null;
            return {ros,inTown,inst,back,ask}}""")
        ok(r['inTown'] and r['inst'],'recall from a zone saves the run (INST) and lands in Duskhold',r)
        ok(r['back'],'recall-back (RECBACK) returns to the saved run',r)
        ok(r['ask'] is not None,'entering a zone with a saved run asks Continue / Restart',r['ask'])
        # 6. courtyard: growth (rings, garden wall radius), harvest + 10 min regrowth, nodes inside the walls
        r=P('courtyard',"""()=>{const o=[];for(let n=0;n<=6;n++){bossDone.clear();for(let i=0;i<n;i++)bossDone.add(i);cySync();const open=CYD.nodes.filter(q=>!CYG.lock.has(q[1]*W+q[0])).length;
            const wallIn=CYG.walls.every(([x,y])=>townAt(x,y,0)==0&&y>TOWNS[0].cy+TWN100_IW);o.push([n,+CYD.r.toFixed(1),CYG.walls.length,open,wallIn])}
          const q=CYD.nodes.find(q=>q[2]=='rock'&&!CYG.lock.has(q[1]*W+q[0]));const tg={kind:'rock',x:q[0],y:q[1],k:q[1]*W+q[0]};const s0=mats.stone;gFinish(tg);const g=gresp.find(r=>r.tg===tg);
          let tree=null;for(let y=CYD.y-8;y<=CYD.y+8&&tree!='tree';y++)for(let x=CYD.x-8;x<=CYD.x+8&&tree!='tree';x++){if(MAP[y][x]!='#'||!NODE[y*W+x]||gdep[y*W+x])continue;
            for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(MAP[Y][X]=='#'||MAP[Y][X]=='r'||solid(X,Y))continue;toPos(X+dx*.2,Y+dy*.2);const t=gTarget();if(t&&t.kind=='tree'&&t.x==x&&t.y==y){tree='tree';break}}}
          return {grow:o,regrow:g&&g.t,gotStone:mats.stone-s0,tree}}""")
        g=r['grow'];ok(all(g[i][1]<g[i+1][1] for i in range(5)) and all(q[4] for q in g) and g[0][3]<g[6][3],'courtyard grows ring by ring inside the walls',g)
        ok(abs(r['regrow']-600)<1 and r['gotStone']>0,'courtyard rock harvested, regrows in 10 minutes',r)
        ok(r['tree']=='tree','courtyard trees can be chopped (F)',r['tree'])
        # 7. old saves: standing in the old Portal Court / old courtyard spot / old stall spot
        r=P('oldsave',"""()=>{const o={};const load=(x,z,wl)=>{saveGame(true);const s=JSON.parse(localStorage.getItem(SAVE_KEY));s.pos={x,z,realm:false};if(wl!=null)s.x2.wl=wl;localStorage.setItem(SAVE_KEY,JSON.stringify(s));loadGame();
            const X=pl.position.x,Z=pl.position.z;return {x:+X.toFixed(1),z:+Z.toFixed(1),ok:MAP.DW[Math.round(Z)*W+Math.round(X)]<0&&!solid(X,Z)&&!tcHit(X,Z)}};
          o.court=load(PCOURT[0]-6,PCOURT[1]+8,97);o.court2=load(PCOURT[0]+12,PCOURT[1]-10,89);o.yard=load(76,244,97);o.yardgate=load(75,276,97);o.plaza=load(TOWNS[0].sp[0],TOWNS[0].sp[1],97);
          // saved courtyard state: nothing extra is saved; harvested nodes come back on load and growth follows bossDone
          bossDone.clear();bossDone.add(0);bossDone.add(1);saveGame(true);bossDone.clear();loadGame();cySync();o.grow=[bossDone.size,+CYD.r.toFixed(1)];return o}""")
        ok(all(r[k]['ok'] for k in ['court','court2','yard','yardgate','plaza']),'old saves in the old Portal Court / old Courtyard end up on solid ground',r)
        ok(abs(r['plaza']['x']-cx)<1,'a save in the plaza stays where it was',r['plaza'])
        ok(r['grow'][0]==2 and r['grow'][1]>9,'loaded courtyard grows to the saved zone count',r['grow'])
        # 8. kingdom structures: every level of every upgrade adds geometry (more triangles than the level below)
        r=P('kingdom',"""()=>{const out={};const tri=g=>{let n=0;g&&g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)n+=o.geometry.attributes.position.count/3});return n};
          ['train','tower','treas','den','hatch'].forEach(k=>{out[k]=[0,1,2,3].map(l=>{SHU.forEach(u=>SH.lv[u.k]=0);SH.lv[k]=l;shApply();return Math.round(tri(KGD.up[k]&&KGD.up[k].g))})});
          out.walls=[0,1,2,3].map(l=>{SHU.forEach(u=>SH.lv[u.k]=0);SH.lv.walls=l;shApply();return Math.round(tri(KGD.wg))});
          out.total=[0,2,5,8,11,14,17].map(P=>{SHU.forEach(u=>SH.lv[u.k]=0);let n=P;for(const u of SHU){const a=Math.min(3,n);SH.lv[u.k]=a;n-=a}shApply();return [P,KGD.pr,Math.round(tri(KGD.pg))]});
          out.flags=Object.keys(SHM.pil).filter(k=>SHM.pil[k].g.parent).length;return out}""")
        for k in ['train','tower','treas','den','hatch','walls']:
            v=r[k];ok(all(v[i]<v[i+1] for i in range(0,3)) if k!='walls' else (len(set(v))==4 and v[3]>v[2]>0),'%s: every level adds to the town (%s)'%(k,v),v)
        t=r['total'];ok(all(t[i][2]<t[i+1][2] for i in range(len(t)-1)),'total kingdom level: each tier adds buildings',t)
        ok(r['flags']==0,'no upgrade banners by the fountain any more',r['flags'])
        # 9. the town map (N) and minimap pips draw without errors
        r=P('map',"""()=>{toPos(TOWNS[0].sp[0],TOWNS[0].sp[1]);openWMap();const c=$('wmc'),ok=c.width>100&&c.height>100;$('wmap').classList.add('hide');mini();return {ok,w:c.width,h:c.height}}""")
        ok(r['ok'],'town map draws',r)
    # ---- screenshots ----
    if SH:
        ev("()=>{bossDone.clear();[0,1,2].forEach(i=>bossDone.add(i));portalRefresh();cySync();SHOPS.forEach(o=>SH.shop[o.k]=1);SHU.forEach(u=>SH.lv[u.k]=3);shApply();visTick();TOD=.3;try{closeX()}catch(_){}}")
        def V(n,p,l,nf=False,pre=None):
            if pre:ev(pre)
            ev("([p,l,nf])=>{toPos(l[0],l[2]);STEP(.3);FC(p,l,nf)}",[p,l,nf]);L.shot(pg,OUT+'/v100_'+n+'.png');print('shot',n)
        X,Z=cx,cy
        V('top',[X+22,95,Z+118],[X+22,0,Z+44],True);V('top_town',[X,62,Z+92],[X,0,Z+38],True)
        V('town_n',[X,14,Z+28],[X,1,Z-8]);V('town_s',[X,16,Z+14],[X,1,Z+60]);V('street',[X,5,Z+23],[X,1.5,Z+52]);V('plaza',[X+6,7,Z+14],[X,1,Z-6])
        V('courtyard',[X,18,Z+59],[X,0,Z+78]);V('courtyard_lo',[X+9,4,Z+64],[X,1.2,Z+78])
        # shops built (front) and unbuilt
        for q in ev("()=>TWN100_SH.map(s=>{const d=(s.z>=46?-1:1)*(s.s<0?-3.2:3.2),a=TWN100_lw(s,d,11.2),b=TWN100_lw(s,0,.4);return [s.k,a,b]})"):
            k,a,b=q;V('shop_'+k,[a[0],3.4,a[1]],[b[0],1.8,b[1]])
        ev("()=>{SH.shop={};shApply();visTick()}")
        for q in ev("()=>TWN100_SH.slice(0,2).concat(TWN100_SH.slice(4,6)).map(s=>{const d=(s.z>=46?-1:1)*(s.s<0?-3.2:3.2),a=TWN100_lw(s,d,11.2),b=TWN100_lw(s,0,.4);return [s.k,a,b]})"):
            k,a,b=q;V('site_'+k,[a[0],3.4,a[1]],[b[0],1.4,b[1]])
        V('street_unbuilt',[X,5,Z+23],[X,1.5,Z+52])
        ev("()=>{SHOPS.forEach(o=>SH.shop[o.k]=1);shApply();visTick()}")
        # kingdom: each upgrade at levels 1..3 (and 0 for the overview), total-level tiers, walls per level
        U={'train':[7.2,-6.9],'tower':[6.6,-17.4],'treas':[-6.4,-17.4],'den':[-13.6,14.6],'hatch':[13.2,16.9]}
        CAMU={'train':([3,6.5,8],1.2),'tower':([4,9.5,10],4.0),'treas':([3,6.5,8],1.4),'den':([5,7,-9],.8),'hatch':([-4,6.5,-8],1.0)}
        for k,(ux,uz) in U.items():
            for l in [1,2,3]:
                c,ly=CAMU[k];V('up_%s%d'%(k,l),[X+ux+c[0],c[1],Z+uz+c[2]],[X+ux,ly,Z+uz],False,"()=>{SHU.forEach(u=>SH.lv[u.k]=0);SH.lv['%s']=%d;shApply()}"%(k,l))
        for l in [0,1,2,3]:
            V('walls%d'%l,[X+38,22,Z+30],[X+14,1,Z+30],False,"()=>{SHU.forEach(u=>SH.lv[u.k]=0);SH.lv.walls=%d;shApply()}"%l)
            V('gate%d'%l,[X+30,4,Z+5],[X+21,2,Z],False)
        for P in [0,5,8,11,14,17]:
            V('pr%02d'%P,[X,48,Z+92],[X,0,Z+40],True,"()=>{SHU.forEach(u=>SH.lv[u.k]=0);let n=%d;for(const u of SHU){const a=Math.min(3,n);SH.lv[u.k]=a;n-=a}shApply()}"%P)
        ev("()=>{SHU.forEach(u=>SH.lv[u.k]=3);shApply()}")
        V('pr_granary',[X-1,11,Z+42],[X-16,2.5,Z+32]);V('pr_chapel',[X+1,11,Z+42],[X+16,4,Z+32]);V('pr_keep',[X+4,8,Z+78],[X+16,3,Z+66]);V('pr_barracks',[X-4,7,Z+78],[X-16,2,Z+66])
        # portal islands: open and locked
        for i in range(6):
            p=ev("(i)=>{const p=TWN100_PG[i],dx=p.a[0]-p.x,dz=p.a[1]-p.y,d=Math.hypot(dx,dz);return [p.x+dx/d*13,p.y+dz/d*13,p.x,p.y]}",i)
            V('portal%d'%i,[p[0],5.5,p[1]],[p[2],1.8,p[3]])
        ev("()=>{bossDone.clear();portalRefresh()}")
        for i in [1,5]:
            p=ev("(i)=>{const p=TWN100_PG[i],dx=p.a[0]-p.x,dz=p.a[1]-p.y,d=Math.hypot(dx,dz);return [p.x+dx/d*13,p.y+dz/d*13,p.x,p.y]}",i)
            V('portal%d_locked'%i,[p[0],5.5,p[1]],[p[2],1.8,p[3]])
        ev("()=>{window.FCAM=null;toPos(TOWNS[0].sp[0],TOWNS[0].sp[1]);openWMap()}");pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/v100_map.png');ev("()=>$('wmap').classList.add('hide')")
        sheet(['top','top_town','town_n','town_s','street','plaza','courtyard','courtyard_lo','map'],'v100_sheet_town.png')
        sheet(['shop_smith','shop_alch','shop_cook','shop_bard','shop_merchant','shop_sage','shop_trainer','shop_stable','street_unbuilt','site_smith','site_alch','site_merchant','site_sage'],'v100_sheet_shops.png')
        sheet(['up_%s%d'%(k,l) for k in U for l in [1,2,3]],'v100_sheet_upgrades.png')
        sheet(['walls0','walls1','walls2','walls3','gate0','gate1','gate2','gate3'],'v100_sheet_walls.png',cols=4)
        sheet(['pr00','pr05','pr08','pr11','pr14','pr17','pr_granary','pr_chapel','pr_keep','pr_barracks'],'v100_sheet_kingdom.png')
        sheet(['portal%d'%i for i in range(6)]+['portal1_locked','portal5_locked'],'v100_sheet_portals.png')
def run():
    play.run(s,w=1000,hh=620)
    if CHK and not PERF:
        lg=open(OUT+'/lastlogs.txt').read();pe=[l for l in lg.split('\n') if 'PAGEERROR' in l]
        ok(not pe,'no page errors',pe[:3])
        print('CHECKS OK' if not fails else 'FAIL '+' | '.join(fails))
run()
