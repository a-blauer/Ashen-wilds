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
        r=ev("""()=>{const c=HS103.cit[1];czTask103(c,'wood');const w=mats.wood;c.t0=Date.now()-HS103_TRIP*3-10;czTick103();const got=mats.wood-w;
          const c2=HS103.cit[2];bossDone.clear();czTask103(c2,'crystal');const t=c2.task;[0,1,2,3,4,5].forEach(i=>bossDone.add(i));return {got,t,av:hsMats103().map(q=>q[0])}}""")
        ok(r['got']==3*2,'three finished trips bring back 3 × 2 wood',r)
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
    print('CHECKS OK' if not fails else 'CHECKS FAILED: '+'; '.join(fails))
play.run(s,w=1000,hh=620)
