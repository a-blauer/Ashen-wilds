# v232 the choice at the fountain and the two endings (4011, 4069-4071):
#  * F by the man opens the talk window: fight / kneel / not yet; the choice asks once more and is then final and saved (x2.fn232);
#    older saves load as "not chosen"; his road lists the four Wardens in order and offers the next one
#  * all four beaten: "Kneel and be crowned" plays the crown ending; Skip hands the game back with the crown saved, the crown and
#    mark on the hero (and in the look array for partners), the palace gone
#  * both endings are in the Cinematics list; a replay changes nothing saved and puts the hero back
#  * every frame of both films is stepped (STEP seconds apart): no frame errors, and everything they build is freed at the end
import play,os,json
STEP=float(os.environ.get('STEP','.5'))
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    fails=[]
    pg.evaluate("()=>{window.__e=[];for(const k of ['error','warn']){const f=console[k];console[k]=function(){try{__e.push([...arguments].map(a=>a&&a.stack?a.stack.slice(0,240):String(a)).join(' ').slice(0,360))}catch(_){}return f.apply(this,arguments)}};window.__w=ms=>new Promise(r=>setTimeout(r,ms));window.__until=async(fn,ms)=>{const t0=performance.now();while(performance.now()-t0<ms){if(fn())return true;await __w(100)}return false}}")
    r=pg.evaluate("""async()=>{const o={},B=()=>[...document.querySelectorAll('#fn232B button')],T=TOWNS[0];try{TWN100_home()}catch(e){}await __w(500);
      o.old=(()=>{const s=x2Save();delete s.fn232;FN232.path=2;x2Load(s);return FN232.path===0&&FN232.n===0})();
      o.noNpc=!FN229.npc;for(let i=0;i<BOSSES.length;i++)bossDone.add(i);FN229.seen=1;const N=fn229Npc();o.npc=!!N;toPos(N.x+1.4,N.z+2,0);await __w(400);
      const p=worldPrompt();o.prompt=p&&p.label;p&&p.fn();o.open=fn232Open();o.opts=B().map(b=>b.textContent.slice(0,22));
      B()[1].click();o.ask=/final/.test($('fn232N').textContent)&&FN232.path===0;B()[1].click();o.back=FN232.path===0&&B().length===3;
      B()[1].click();B()[0].click();o.path=FN232.path;o.saved=(x2Save().fn232||[]).join();o.road=$('fn232R').children.length;o.next=B()[0].textContent.slice(0,40);
      FN232.n=2;fn232Draw();o.next2=B()[0].textContent.slice(0,40);o.done2=$('fn232R').querySelectorAll('.d').length;
      {const s=JSON.parse(JSON.stringify(x2Save()));FN232.path=0;FN232.n=0;x2Load(s);o.load=[FN232.path,FN232.n].join()}
      FN232.n=4;fn232Draw();o.kneel=B()[0].textContent.slice(0,30);o.crown0=FN232.crown;const kids=scene.children.length;
      B()[0].click();o.run=await __until(()=>EC232.run&&IC151.on,5000);o.shut=!fn232Open();await __w(1500);o.t=EC232.S&&EC232.S.t;ec232Skip();o.ended=await __until(()=>!EC232.run&&!IC151.on,60000);
      o.crown=FN232.crown;o.reg=!!(pl.userData.fn232&&pl.userData.fn232.g.parent);o.lk=mpLookOut()[20];o.sv=(x2Save().fn232||[]).join();o.pal=!!scene.getObjectByName('ek232palace');o.figs=scene.children.filter(q=>q.name=='fn229figure').length;o.kids=scene.children.length-kids;o.dom=!!document.getElementById('ec232');
      await __w(300);const p2=worldPrompt();p2&&p2.fn();o.after=B().map(b=>b.textContent.slice(0,24));fn232Close();
      o.list=CV215.L.map(c=>c.z).filter(z=>/ec232/.test(z)).join();o.err=EC232.err;return o}""")
    print('FLOW',json.dumps(r))
    def need(c,m):
        if not c:fails.append(m+' '+json.dumps(r)[:400])
    need(r['old'],'an older save should load as not chosen');need(r['noNpc'] and r['npc'],'the man should stand by the fountain only after the last pour')
    need(r['prompt'] and 'Speak' in r['prompt'] and r['open'] and len(r['opts'])==3,'F by him should open the talk window with three choices')
    need(r['ask'] and r['back'],'the choice should ask once more and let you step back')
    need(r['path']==2 and r['saved']=='2,0,0,0' and r['road']==4 and 'Elderglade' in r['next'],'kneeling should open his road, saved')
    need('Foundry' in r['next2'] and r['done2']==2 and r['load']=='2,2','the road should offer the next Warden and survive a reload')
    need('Kneel' in r['kneel'] and r['run'] and r['shut'] and r['ended'],'the crowning should play and end')
    need(r['crown']==1 and r['reg'] and r['lk']==1 and r['sv']=='2,4,0,1','the crown should be worn, saved and in the look array')
    need(not r['pal'] and r['figs']==1 and r['kids']==0 and not r['dom'] and not r['err'],'the palace should be gone after the film')
    need(r['list']=='ec232a,ec232b','both endings should be in the Cinematics list')
    # every frame of both films
    for key in ('breath','crown'):
        e=pg.evaluate("""([key,step])=>{if(!YT232D.LS)wk232Lair(YT232D);   // the Hollow's own dressing is built once and kept (hidden)
          const kids=scene.children.length,p0=pl.position.clone(),sv=JSON.stringify(x2Save().fn232),c=ec232Cap(key);if(!c)return {cap:0};EC232.noDraw=1;let n=0,bad=null;
          for(let t=0;t<c.cut-.01;t+=step){ec232Seek(t);n++;if(EC232.err){bad=[t,EC232.err];break}const p=cam.position;if(!isFinite(p.x+p.y+p.z)){bad=[t,'camera'];break}}
          ec232Seek(c.len+.1);EC232.noDraw=0;return {cap:1,n,bad,run:EC232.run,on:IC151.on,kids:scene.children.length-kids,moved:pl.position.distanceTo(p0)>.01,sv:JSON.stringify(x2Save().fn232)===sv,filter:ren.domElement.style.filter,vis:pl.visible,pal:!!scene.getObjectByName('ek232palace')}}""",[key,STEP])
        print('FILM',key,json.dumps(e))
        if not e.get('cap') or e['bad'] or e['run'] or e['on']:fails.append('%s: frame errors or did not end %s'%(key,json.dumps(e)))
        elif e['kids']!=0 or e['moved'] or not e['sv'] or e['filter'] or not e['vis'] or e['pal']:fails.append('%s: a replay left something behind %s'%(key,json.dumps(e)))
    # the other road: the choice to fight, the way down, the cheat reset
    q=pg.evaluate("""async()=>{const o={},B=()=>[...document.querySelectorAll('#fn232B button')];try{CHU.on=1}catch(e){}$('fn232C0').click();o.reset=[FN232.path,FN232.n,FN232.crown].join()+'|'+!!pl.userData.fn232;
      fn232Talk();B()[0].click();B()[0].click();o.path=FN232.path;o.down=B()[0].textContent.slice(0,40);B()[0].click();o.in=await __until(()=>wk232In(YT232D)&&!!YT232D.e,60000);o.lv=YT232D.e&&YT232D.e.c.l;
      FN232.won=1;fn229Npc();o.gone=!FN229.npc;FN232.won=0;o.e=__e.filter(x=>!/ReadPixels|GPU stall/.test(x)).slice(0,5);return o}""")
    print('FIGHT',json.dumps(q))
    if q['reset']!='0,0,0|false':fails.append('the cheat reset should clear the choice and the crown %s'%q['reset'])
    if q['path']!=1 or 'Descend' not in q['down'] or not q['in'] or q['lv']!=56:fails.append('standing against him should lead down to the Hollow %s'%json.dumps(q))
    if not q['gone']:fails.append('he should be gone from the fountain once slain')
    if q['e']:fails.append('console errors %s'%json.dumps(q['e']))
    for f in fails:print('FAIL',f)
    print('DONE',len(fails),'fails')
play.run(s,w=1280,hh=720)
