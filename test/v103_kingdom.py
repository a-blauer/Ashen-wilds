# v103 kingdom: building lots (place / move), houses + citizens (gather trips, paths), the one Steward window,
# the evolution preview, working shopkeepers. Prints PASS/FAIL lines and CHECKS OK; screenshots in test/out/v103_*.png
#   python3 v103_kingdom.py            checks + screenshots        PART=keepers|town|menu|evo  only that part
#   SHOTS=0 python3 v103_kingdom.py    checks only
import os,json,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP;PART=os.environ.get('PART','');SH=os.environ.get('SHOTS','1')!='0';fails=[]
def ok(c,msg,info=None):
    print(('PASS ' if c else 'FAIL ')+msg,'' if info is None else json.dumps(info)[:700])
    if not c:fails.append(msg)
def want(p):return not PART or PART==p
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{gold=1e7;for(const k of Object.keys(RES))mats[k]=5000;['Rock Core','Silk Gland','Ectoplasm'].forEach(k=>mats[k]=500);[0,1,2,3,4,5].forEach(i=>bossDone.add(i));TOD=.3}")
    if want('keepers'):
        ev("()=>{SHOPS.forEach(o=>SH.shop[o.k]=1);shApply();toPos(TOWNS[0].cx,TOWNS[0].cy+6);visTick();STEP(.2)}")
        r=ev("()=>TWN100_SH.map(q=>[q.k,q._lot,!!TWN100_S.b[q.k],(()=>{const g=TWN100_S.npc[q.k]||((VIS.find(v=>v.k==q.k)||{}).g);const n=g&&g.children.find(c=>c.bones);return n?!!n._wk:null})()])")
        ok(all(x[1] and x[2] for x in r),'every shop stands on a lot',r)
        ok(all(x[3] for x in r),'every keeper is working',r)
        if SH:
            for k in ['smith','alch','cook','bard','merchant','sage','trainer','stable','magic']:
                for ph,t in [('a',0),('b',.45)]:
                    ev("""([k,t])=>{const q=TWN100_SH.find(s=>s.k==k),l=LOTM103[q._lot],W0=WK103[k],T=TOWNS[0],[sx,sz]=lotW103(l,W0.x,W0.z),[cx,cz]=lotW103(l,W0.x+1.6,W0.z+3.6);
                      toPos(cx+3,cz);visTick();STEP(t);FC([cx,T.ph+2.1,cz],[sx,T.ph+1.0+(W0.y||0),sz])}""",[k,t])
                    L.shot(pg,OUT+'/v103_keep_%s_%s.png'%(k,ph))
    if want('town'):
        r=ev("""()=>{const out={};SHOPS.forEach(o=>SH.shop[o.k]=1);SHU.forEach(u=>SH.lv[u.k]=2);shApply();
          // a few houses in the south ward, citizens to work
          ['A1','B2','C1','D3','A4','B4'].forEach(id=>{hsBuy103(id)});HS103.cit.forEach((c,i)=>czTask103(c,i%2?'wood':''));
          HS103.cit.forEach((c,i)=>{if(c.task)c.t0=Date.now()-((i*37)%90)*1000});
          out.houses=HS103.h.length;out.cits=HS103.cit.length;out.pos=Object.assign({},SH.pos);
          // every door can reach the south gate
          const g=czGate103();out.paths=HS103.h.map((h,i)=>{const d=lotDoor103(lotOf103('h:'+i));const P=czPath103(d[0],d[1],g[0],g[1]);return P?+czLen103(P).toFixed(1):null});
          // every lot door reachable from the spawn (flood fill, the game's collision)
          const T=TOWNS[0],st=.25,x0=T.cx-37,z0=T.cy-22,nx=Math.round(74/st),nz=Math.round(80/st),free=(x,z)=>!CR.some(([a,b])=>solid(x+a,z+b))&&!tcHit(x,z),seen=new Uint8Array(nx*nz),q=[];
          const id=(x,z)=>{const i=Math.round((x-x0)/st),j=Math.round((z-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};const s0=id(T.sp[0],T.sp[1]);seen[s0]=1;q.push(s0);
          while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)return;const k=jj*nx+ii;if(seen[k])return;const x=x0+ii*st,z=z0+jj*st;if(!free(x,z)){seen[k]=2;return}seen[k]=1;q.push(k)})}
          const reach=(x,z,R)=>{for(let dz=-R;dz<=R;dz+=st)for(let dx=-R;dx<=R;dx+=st){if(dx*dx+dz*dz>R*R)continue;const k=id(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false};
          out.unreach=LOT103.filter(l=>!reach(...lotDoor103(l),1.6)).map(l=>l.id);out.gate=reach(T.cx,T.cy+T.sz+1,1.5);out.steward=reach(SHM.st.x,SHM.st.z,2.2);
          // nothing of the garden is left
          let gr=0;for(let z=15;z<51;z++)for(let x=-20;x<=20;x++){const t=MAP[T.cy+z][T.cx+x];if(t=='g'||t=='#'||t=='r'||t=='.')gr++}out.garden=gr;
          out.solidLots=LOT103.filter(l=>{const k=lotKey103(l.id);return k&&!k.startsWith('u:')&&!lotTiles103(l,-2,2,-3,0).every(t=>MAP[(t/W)|0][t%W]=='B')}).map(l=>l.id);
          out.freeLotsSolid=LOT103.filter(l=>!lotKey103(l.id)&&lotTiles103(l,-3,3,-3,3).some(t=>MAP[(t/W)|0][t%W]=='B')).map(l=>l.id);
          return out}""")
        ok(r['houses']==6 and r['cits']==12,'six houses, twelve citizens',[r['houses'],r['cits']])
        ok(all(p for p in r['paths']),'every house has a path to the south gate',r['paths'])
        ok(not r['unreach'] and r['gate'] and r['steward'],'every lot door, the gate and the Steward are reachable on foot',r)
        ok(r['garden']==0,'the garden is gone (no grass, trees or rocks in the south half)',r['garden'])
        ok(not r['solidLots'],'built shops and houses are solid',r['solidLots'])
        ok(not r['freeLotsSolid'],'free lots are open ground',r['freeLotsSolid'])
        # move a shop and a house and an upgrade; old spots open, new ones solid; save + load keeps it
        r=ev("""()=>{const o={};lotPut103('cook','D4');lotPut103('h:0','C4');lotPut103('u:den','A2');
          o.cook=[TWN100_SH.find(q=>q.k=='cook')._lot,lotTiles103(LOTM103.D4,-2,2,-3,0).every(t=>MAP[(t/W)|0][t%W]=='B'),lotTiles103(LOTM103.W3,-2,2,-3,0).some(t=>MAP[(t/W)|0][t%W]=='B')];
          const T=TOWNS[0],d=lotDoor103(LOTM103.D4);o.st2=[T.st2.c[0]==d[0],T.st2.c[1]==d[1]];o.den=[KDU.den.x,KDU.den.z];o.h0=HS103.g[0]&&HS103.g[0].lot;
          saveGame(true);const s=JSON.parse(localStorage.getItem(SAVE_KEY));o.kpos=s.x2&&s.x2.kpos;o.nh=s.x2&&s.x2.khs&&s.x2.khs.length;
          SH.pos={};HS103.h=[];HS103.cit=[];lotSync103();loadGame();o.after=Object.assign({},SH.pos);o.nh2=HS103.h.length;o.nc2=HS103.cit.length;o.cook2=TWN100_SH.find(q=>q.k=='cook')._lot;return o}""")
        ok(r['cook'][0]=='D4' and r['cook'][1] and not r['cook'][2],'moving a shop rebuilds it on the new lot and frees the old one',r['cook'])
        ok(all(r['st2']),'the cooking prompt follows the Cookhouse',r['st2'])
        ok(r['den']==[-7,30],'an upgrade structure moves to its lot',r['den'])
        ok(r['after'].get('cook')=='D4' and r['after'].get('h:0')=='C4' and r['nh2']==6 and r['nc2']==12 and r['cook2']=='D4','save + load keeps lots, houses and citizens',r)
        # gathering: a finished trip pays out, an unlocked material only
        r=ev("""()=>{const c=HS103.cit[1];c.bag=null;c.t0=0;sup.meat=10;czTask103(c,'wood');const w=mats.wood;c.t0=Date.now()-HS103_TRIP*3-10;czTick103();const mid=mats.wood-w;czCollectHouse105(c.h);const got=mats.wood-w;
          const c2=HS103.cit[2];c2.bag=null;c2.t0=0;bossDone.clear();czTask103(c2,'crystal');const t=c2.task;[0,1,2,3,4,5].forEach(i=>bossDone.add(i));return {got,mid,t,av:hsMats103().map(q=>q[0])}}""")
        ok(r['mid']==0 and r['got']==2,'a finished trip waits at the house (even after a long time away) and collecting gives 2 wood',r)
        ok(r['t']=='','no task for a material without a completed zone',r)
        r=ev("""()=>{const T=TOWNS[0];toPos(T.cx,T.cy+20);STEP(.2);CZ103.live.forEach(o=>{if(!o.c.task){o.wait=0}});let ms=0,n=0,mx=0;for(let i=0;i<240;i++){VT+=16;const t0=window.RN();townTick(VT,pl.position);const d=window.RN()-t0;ms+=d;mx=Math.max(mx,d);n++}
          return {avg:+(ms/n).toFixed(3),max:+mx.toFixed(2),live:CZ103.live.length}}""")
        ok(r['avg']<2.5,'town tick with 12 citizens stays cheap (ms per frame, headless)',r)
        if SH:
            ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+20);visTick();STEP(1.2);FC([T.cx,T.ph+52,T.cy+62],[T.cx,T.ph,T.cy+18],1)}");L.shot(pg,OUT+'/v103_town_high.png')
            ev("()=>{const T=TOWNS[0];STEP(.6);FC([T.cx+9,T.ph+7,T.cy+52],[T.cx,T.ph+1,T.cy+30],1)}");L.shot(pg,OUT+'/v103_town_south.png')
            ev("()=>{const T=TOWNS[0];const l=lotOf103('h:1'),d=lotDoor103(l),[x,z]=lotW103(l,0,9);FC([x,T.ph+3.2,z],[d[0],T.ph+1.4,d[1]])}");L.shot(pg,OUT+'/v103_house.png')
            # citizens walking: one walker close up
            r=ev("""()=>{const o=CZ103.live.find(o=>o.c.task&&o.mode=='out')||CZ103.live.find(o=>o.mode=='walk')||CZ103.live[0];if(!o)return null;STEP(.3);const T=TOWNS[0],p=o.g.position,a=o.g.rotation.y;
              FC([p.x+Math.sin(a+1.3)*3.4,T.ph+1.8,p.z+Math.cos(a+1.3)*3.4],[p.x,T.ph+.9,p.z]);return [o.c.n,o.mode,o.g.visible]}""")
            print('walker',r);L.shot(pg,OUT+'/v103_walker.png')
    if want('menu'):
        r=ev("""()=>{if(HS103.h.length>2){for(const i in HS103.g)hsDrop103(+i);for(let i=2;i<HS103.h.length;i++)delete SH.pos['h:'+i];HS103.h=HS103.h.slice(0,2);HS103.cit=HS103.cit.filter(c=>c.h<2);lotSync103()}
          if(!HS103.h.length){['A1','B2'].forEach(id=>hsBuy103(id))}openX('hold');const o={};o.secs=[...document.querySelectorAll('#xw .sec')].map(s=>s.textContent);o.tabs=document.querySelectorAll('#xw [data-sht]').length;
          o.rows=document.querySelectorAll('#xw .kmrw').length;o.sel=document.querySelectorAll('#xw [data-czk]').length;
          const b=[...document.querySelectorAll('#xw [data-kmb]')].find(x=>x.dataset.kmb=='house:1');if(b)b.click();o.pick=!!KM103.pick;o.pickTxt=($('xwB').querySelector('.kmpick')||{}).textContent||'';return o}""")
        ok(r['tabs']==0 and len(r['secs'])>=4,'one Steward window: shops, upgrades, houses and citizens in one list',r)
        ok(r['pick'],'Build puts the window in placing mode',r['pickTxt'])
        if SH:pg.set_viewport_size({'width':1100,'height':700});pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/v103_menu_pick.png')
        r=ev("""()=>{const cv=$('kmCv'),I=KM103.info,l=LOT103.find(l=>lotFree103(l.id)),R=I.R[l.id],rc=cv.getBoundingClientRect(),s=rc.width/cv.width;
          const ev=new MouseEvent('click',{bubbles:true,clientX:rc.left+(R[0]+R[2]/2)*s,clientY:rc.top+(R[1]+R[2]/2)*s});cv.dispatchEvent(ev);return [l.id,SH.pos['h:'+(HS103.h.length-1)],HS103.h.length,!!KM103.pick]}""")
        ok(r[0]==r[1] and not r[3],'clicking a lit plot on the plan builds there',r)
        if SH:
            ev("()=>{const e=$('xwB').querySelector('.kmcits');if(e)e.scrollIntoView()}");pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/v103_menu_cit.png')
            pg.set_viewport_size({'width':420,'height':800});pg.wait_for_timeout(300);ev("()=>{$('xwB').scrollTop=0;rX()}");pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/v103_menu_mobile.png')
            pg.set_viewport_size({'width':1000,'height':620})
        ev("()=>{$('xw').classList.add('hide')}")
    if want('evo'):
        r=ev("""()=>{const c=party[0];c.l=60;c.evo=0;cmpSel=0;$('cmp').classList.remove('hide');rC();KQM.ctab='sp';kqmCApply(true);const h=$('evoPV');return [!!h,h&&PV.cv&&PV.cv.parentNode===h,c.n,(document.querySelector('#cmp .evolab')||{}).textContent]}""")
        ok(r[0] and r[1],'the evolution tab shows a now → next preview',r)
        if SH:
            ev("()=>{for(let i=0;i<3;i++){VT+=400;if(PV.upd)PV.upd(VT,.016);PV.r.render(PV.sc,PV.cam)}}");pg.screenshot(path=OUT+'/v103_evo.png')
        r=ev("()=>{KQM.ctab='ov';kqmCApply(true);return PV.cv&&PV.cv.parentNode===$('cvw')}")
        ok(r,'back on Overview the normal preview returns',r)
    if want('deco'):
        r=ev("""()=>{const o={};gold=1e6;DECO103.forEach(D=>dcBuy103(D.k));o.n=DECO103.length;o.on=DECO103.filter(D=>dcOn103(D.k)).length;
          const T=TOWNS[0],pts=[];DECO103.forEach(D=>{(D.sp||[]).forEach(q=>pts.push([D.k,q[0],q[1]]));(DC103.col[D.k]||[]).forEach(c=>pts.push([D.k,c.x-T.cx,c.z-T.cy]))});
          o.inLot=pts.filter(([k,x,z])=>LOT103.some(l=>Math.abs(x-l.x)<3.6&&Math.abs(z-l.z)<3.6)).map(q=>q[0]+'@'+q[1]+','+q[2]);
          o.nearDoor=pts.filter(([k,x,z])=>LOT103.some(l=>{const d=lotDoor103(l);return Math.hypot(T.cx+x-d[0],T.cy+z-d[1])<1.6})).map(q=>q[0]+'@'+q[1]+','+q[2]);
          dcToggle103('statue');o.off=[DC103.g.statue.visible,T.col.includes(DC103.col.statue[0])];dcToggle103('statue');o.on2=[DC103.g.statue.visible,T.col.includes(DC103.col.statue[0])];
          saveGame(true);SH.deco={};dc103Sync();loadGame();o.after=DECO103.filter(D=>dcOn103(D.k)).length;
          const st=.25,x0=T.cx-37,z0=T.cy-22,nx=Math.round(74/st),nz=Math.round(80/st),free=(x,z)=>!CR.some(([a,b])=>solid(x+a,z+b))&&!tcHit(x,z),seen=new Uint8Array(nx*nz),q=[];
          const id=(x,z)=>{const i=Math.round((x-x0)/st),j=Math.round((z-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};const s0=id(T.sp[0],T.sp[1]);seen[s0]=1;q.push(s0);
          while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)return;const k=jj*nx+ii;if(seen[k])return;const x=x0+ii*st,z=z0+jj*st;if(!free(x,z)){seen[k]=2;return}seen[k]=1;q.push(k)})}
          const reach=(x,z,R)=>{for(let dz=-R;dz<=R;dz+=st)for(let dx=-R;dx<=R;dx+=st){if(dx*dx+dz*dz>R*R)continue;const k=id(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false};
          o.unreach=LOT103.filter(l=>!reach(...lotDoor103(l),1.6)).map(l=>l.id);o.gate=reach(T.cx,T.cy+T.sz+1,1.5);o.steward=reach(SHM.st.x,SHM.st.z,2.2);return o}""")
        ok(r['on']==r['n'] and r['n']>=20,'every decoration can be bought (%d)'%r['n'],[r['on'],r['n']])
        ok(not r['inLot'] and not r['nearDoor'],'no decoration stands on a lot or in front of a door',r)
        ok(r['off']==[False,False] and r['on2']==[True,True],'switching off hides it and drops its collider; on brings it back',r)
        ok(r['after']==r['n'],'save + load keeps the decorations',r['after'])
        ok(not r['unreach'] and r['gate'] and r['steward'],'with every decoration on, every door, the gate and the Steward are reachable',r)
        r=ev("()=>{openX('hold');KM103.tab='deco';rX();const o=[document.querySelectorAll('#xw .dccard').length,document.querySelectorAll('#xw [data-kmtab]').length];return o}")
        ok(r[0]>=20 and r[1]==2,'the Steward window has a Decorations tab',r)
        if SH:
            pg.set_viewport_size({'width':1100,'height':700});pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/v104_deco_tab.png');pg.set_viewport_size({'width':1000,'height':620})
            ev("()=>{$('xw').classList.add('hide');KM103.tab='kingdom';const T=TOWNS[0];toPos(T.cx,T.cy+8);pl.visible=false;TOD=.3;STEP(1);FC([T.cx+10,T.ph+12,T.cy+22],[T.cx,T.ph+1,T.cy+2])}");L.shot(pg,OUT+'/v104_deco_plaza.png')
            ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+34);STEP(.5);FC([T.cx-4,T.ph+5,T.cy+20],[T.cx,T.ph+2,T.cy+40])}");L.shot(pg,OUT+'/v104_deco_avenue.png')
            ev("()=>{const T=TOWNS[0];toPos(T.cx+25,T.cy+38);STEP(.5);FC([T.cx+22,T.ph+4,T.cy+30],[T.cx+33,T.ph+1.5,T.cy+42])}");L.shot(pg,OUT+'/v104_deco_corner.png')
            ev("()=>{const T=TOWNS[0];toPos(T.cx-25,T.cy+10);STEP(.5);FC([T.cx-24,T.ph+4,T.cy+2],[T.cx-34,T.ph+2,T.cy+14])}");L.shot(pg,OUT+'/v104_deco_west.png')
            ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+8);TOD=.92;STEP(3);FC([T.cx,T.ph+30,T.cy+60],[T.cx,T.ph+6,T.cy+10],1)}");L.shot(pg,OUT+'/v104_deco_night.png')
            ev("()=>{TOD=.3}")
    if want('tiers'):
        rows=[]
        for LV in [0,1,2,3]:
            r=ev("""(L)=>{const T=TOWNS[0];gold=1e7;DECO103.forEach(D=>{if(SH.deco[D.k]==null)dcBuy103(D.k);SH.deco[D.k]=1});SHU.forEach(u=>SH.lv[u.k]=L);SHOPS.forEach(o=>SH.shop[o.k]=1);shApply();dc103Sync();
              const K=kdState(),G=[K.wg,K.pg].concat(Object.values(K.up).map(u=>u.g),typeof TWN100_MILL!='undefined'?[TWN100_MILL]:[]).filter(Boolean);G.forEach(g=>g.updateMatrixWorld(true));
              const rc=new THREE.Raycaster(),pts=[];
              DECO103.forEach(D=>{if(D.wall)return;(D.sp||[]).forEach(q=>pts.push([D.k,q[0],q[1],.3]))});
              pts.push(['statue',0,5.6,.75],['well',-20,3,.9],['shrine',20,3.5,.6],['gatepoles',-4.3,49.2,.15],['gatepoles',4.3,49.2,.15],['mosaic',0,16,1.2]);[19,26.25,33.75,41.25].forEach(z=>[-3.05,3.05].forEach(x=>pts.push(['garland',x,z,.1])));
              for(let i=0;i<8;i++){const a=i/8*6.283+.2;pts.push(['crystals',Math.cos(a)*3.3,Math.sin(a)*3.3,.2])}
              const bad=[];pts.forEach(([k,x,z,r])=>{for(const [dx,dz] of [[0,0],[r,0],[-r,0],[0,r],[0,-r]]){rc.set(new THREE.Vector3(T.cx+x+dx,T.ph+12,T.cy+z+dz),new THREE.Vector3(0,-1,0));rc.far=13;
                const h=rc.intersectObjects(G,true)[0];if(h&&h.point.y>T.ph+.3){bad.push(k+'@'+x+','+z+' y'+(h.point.y-T.ph).toFixed(1));break}}});
              const W=dcWall104(),rv=[];const g=DC103.g.ravens;if(g)g.traverse(o=>{if(o.userData&&o.userData.y0!=null){const lx=o.position.x,lz=o.position.z,t=W.top(lx,lz);if(t==null||Math.abs(o.userData.y0-t-.12)>.05)rv.push([lx,lz,t,o.userData.y0])}});
              const bn=DC103.g.banner;return {L,wl:K.wl,bad,ravens:rv,bannerWl:bn&&bn.userData.wl,ivyWl:DC103.g.ivy&&DC103.g.ivy.userData.wl,pr:K.pr}}""",LV)
            rows.append(r);print('tier',json.dumps(r)[:500])
            ok(not r['bad'],'kingdom level %d: no decoration stands inside walls, gatehouses, prestige or upgrade buildings'%LV,r['bad'])
            ok(r['bannerWl']==r['wl'] and r['ivyWl']==r['wl'] and not r['ravens'],'kingdom level %d: banners, ivy and ravens follow the level-%d wall'%(LV,r['wl']),[r['bannerWl'],r['ivyWl'],r['ravens']])
            if SH:
                ev("""()=>{const T=TOWNS[0];TOD=.3;toPos(T.cx-28,T.cy+20);pl.visible=false;STEP(.3);FC([T.cx-26,T.ph+4.2,T.cy+8],[T.cx-35.5,T.ph+2.4,T.cy+22])}""");L.shot(pg,OUT+'/v105_tier%d_west.png'%LV)
                ev("""()=>{const T=TOWNS[0];toPos(T.cx,T.cy+44);STEP(.3);FC([T.cx+7,T.ph+4.5,T.cy+40],[T.cx-6,T.ph+2,T.cy+50.5])}""");L.shot(pg,OUT+'/v105_tier%d_south.png'%LV)
    if want('roles'):
        r=ev("""()=>{const o={};gold=1e6;[0,1,2].forEach(i=>bossDone.add(i));if(HS103.h.length<2){['C2','D2'].forEach(id=>{if(lotFree103(id))hsBuy103(id)})}
          const C=HS103.cit;o.n=C.length;C.forEach(c=>{c.bag=null;c.t0=0;c.task='';c.r='gather';c.rk=1});const g0=gold;czTrain104(C[0],'egg');czTrain104(C[1],'fish');czTrain104(C[2],'hunt');o.cost=g0-gold;o.roles=C.slice(0,4).map(czRole104);
          o.optEgg=czOpts104(C[0]).filter(q=>q[2]).map(q=>q[0]);o.optFish=czOpts104(C[1]).filter(q=>q[2]).map(q=>q[0]);o.optHunt=czOpts104(C[2]).filter(q=>q[2]).map(q=>q[0]);
          // rank gates the zone tier: rank 1 hunter cannot go to Hillside (tier 2) until ranked up
          czTask103(C[2],'1');o.rank1=C[2].task;const gr=gold;czRankUp105(C[2]);o.rankCost=gr-gold;o.rk=czRank105(C[2]);czTask103(C[2],'1');o.rank2=C[2].task;czTask103(C[2],'0');
          // food: none in the bag → waits; food → sets off and the rations are eaten
          for(const k in sup)if(czFoodV105(k))sup[k]=0;czTask103(C[3],'wood');o.wf=[C[3].wf,C[3].t0>0];sup.meat=20;sup.f_meat=2;czTick103();o.food=[czFood105(),C[3].t0>0];
          czTask103(C[0],o.optEgg[0]);czTask103(C[1],o.optFish[0]);czTick103();o.food2=czFood105();
          const e0=eggs.length,f0=sup.fish||0,w0=mats.wood;C.slice(0,4).forEach(c=>{if(c.t0)c.t0=Date.now()-czTrip104(c)-50});czTick103();o.bags=C.slice(0,4).map(c=>!!c.bag);o.notYet=[eggs.length-e0,mats.wood-w0];
          czTick103();o.noNewTrip=C.slice(0,4).map(c=>!!c.t0);
          [...new Set(C.slice(0,4).map(c=>c.h))].forEach(h=>czCollectHouse105(h));o.egg=eggs.slice(e0).map(e=>e.sp);o.fish=(sup.fish||0)-f0;o.wood=mats.wood-w0;o.bagsAfter=C.slice(0,4).map(c=>!!c.bag);
          // the hunter alone, many trips: never an egg
          C[0].task='';C[1].task='';C[3].task='';sup.meat=999;const e1=eggs.length,gh=gold;for(let i=0;i<24;i++){czTick103();C[2].t0=Date.now()-czTrip104(C[2])-50;czTick103();czCollectHouse105(C[2].h)}o.huntEggs=eggs.length-e1;o.huntGold=gold-gh;
          o.trips=[czTrip104(C[0]),czTrip104(C[3])];C[2].t0=Date.now();saveGame(true);HS103.cit=[];loadGame();o.after=HS103.cit.slice(0,4).map(c=>czRole104(c)+czRank105(c));return o}""")
        print('roles',json.dumps(r)[:900])
        ok(r['cost']==800+500+1000 and r['roles'][:3]==['egg','fish','hunt'],'training costs gold and changes the trade',r['roles'])
        ok(r['rank1']=='' and r['rank2']=='1' and r['rk']==2 and r['rankCost']==700,'a rank-1 trade cannot work a tier-2 zone until it is ranked up',[r['rank1'],r['rank2'],r['rankCost']])
        ok(r['wf'][0]==1 and not r['wf'][1] and r['food'][1] and r['food'][0]==20+6-2,'with no food the citizen waits; with food it sets off and eats its rations',[r['wf'],r['food']])
        ok(r['bags']==[True,True,True,True] and r['notYet']==[0,0] and not any(r['noNewTrip']),'goods wait with the citizen until collected (no new trip meanwhile)',[r['bags'],r['noNewTrip']])
        ok(len(r['egg'])==1 and r['egg'][0]==r['optEgg'][0].split(':')[1],'collecting from an egg collector gives one egg of the chosen kind',r['egg'])
        ok(r['fish']>=3 and r['wood']==2 and not any(r['bagsAfter']),'collecting gives the fisherman\'s fish and the gatherer\'s wood',[r['fish'],r['wood']])
        ok(r['huntGold']>0 and r['huntEggs']==0,'a hunter brings back gold and never eggs',[r['huntGold'],r['huntEggs']])
        ok(r['trips']==[600000,480000],'gatherers take 8 min, trained trades 10 min',r['trips'])
        ok(r['after']==[a+b for a,b in zip(r['roles'],['1','1','2','1'])],'save + load keeps every trade and rank',r['after'])
        if SH:
            ev("""()=>{const T=TOWNS[0],C=HS103.cit;C.forEach(c=>{c.task='';c.t0=0;c.bag=null});toPos(T.cx,T.cy+15);pl.visible=false;STEP(.4);
              CZ103.live.slice(0,4).forEach((o,i)=>{o.mode='';o.wait=999;o.g.position.set(T.cx-2.4+i*1.6,T.ph,T.cy+18);o.ry=Math.PI*.15+(i==1?-0.9:i==2?2.6:0);o.g.rotation.y=o.ry});STEP(.3);FC([T.cx+.1,T.ph+1.7,T.cy+23.4],[T.cx+.1,T.ph+.95,T.cy+18])}""")
            L.shot(pg,OUT+'/v104_roles.png')
            ev("""()=>{const T=TOWNS[0];CZ103.live.slice(0,4).forEach((o,i)=>{o.ry+=Math.PI;o.g.rotation.y=o.ry});STEP(.1);FC([T.cx+.1,T.ph+1.7,T.cy+23.4],[T.cx+.1,T.ph+.95,T.cy+18])}""")
            L.shot(pg,OUT+'/v104_roles_back.png')
            r=ev("""()=>{const T=TOWNS[0],C=HS103.cit,c=C[0],c2=C[1];c.bag=[{t:'mat',k:'wood',n:2}];c.task='wood';c2.task='wood';c2.wf=1;c2.t0=0;for(const k in sup)if(czFoodV105(k))sup[k]=0;
              const l=lotOf103('h:'+c.h),d=lotDoor103(l);toPos(d[0],d[1]+0.01);pl.visible=false;STEP(.3);CZ103.live.filter(o=>o.c.h===c.h).forEach(o=>{o.g.position.set(d[0],T.ph,d[1]);o.mode=''});STEP(1.5);const [x,z]=lotW103(l,1.5,7.5);FC([x,T.ph+2.6,z],[d[0],T.ph+1.6,d[1]]);
              const pr=townPortalPrompt(T);return [pr&&pr.label,CZ103.live.filter(o=>o.g.userData.sign&&o.g.userData.sign.visible).length]}""")
            print('waiting',r);L.shot(pg,OUT+'/v105_collect.png')
            ok(r[0] and 'Collect' in r[0] and r[1]>=1,'a citizen back with goods waits at the door with a sign; F collects',r)
        r=ev("()=>{openX('hold');KM103.tab='kingdom';KM103.focus='cit';rX();return [document.querySelectorAll('#xw [data-czr]').length,document.querySelectorAll('#xw .kmrole').length]}")
        ok(r[0]>=4,'every citizen row has a training choice',r)
        if SH:pg.set_viewport_size({'width':1100,'height':700});ev("()=>{const e=$('xwB').querySelector('.kmcits');if(e)e.scrollIntoView()}");pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/v104_roles_menu.png');pg.set_viewport_size({'width':1000,'height':620})
        ev("()=>{$('xw').classList.add('hide')}")
    print('CHECKS OK' if not fails else 'CHECKS FAILED: '+'; '.join(fails))
play.run(s,w=1000,hh=620)
