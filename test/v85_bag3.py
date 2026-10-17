import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print(json.dumps(ev("""()=>{const out=[];hero.lvl=30;$('bagBtn').click();
      const cnt=h=>{let n=0;(h.gearG||[]).forEach(g=>g.traverse(o=>{if(o.isMesh)n++}));return n};
      CLSK.forEach(cls=>{hero.cls=cls;const wts=[...new Set(ITPL.filter(t=>t.sl=='weapon'&&fitsCls(t,cls)).map(t=>t.wt))];
        wts.forEach(wt=>{const tp=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt==wt&&fitsCls(t,cls));const it={id:uid++,tp,lv:30,req:1,r:3,up:0,aff:[]};eq.weapon=it;
          ['helm','chest','boots'].forEach(sl=>{const i2=genItem(30,{sl,cls,minR:2});i2.req=1;eq[sl]=i2});
          if(cls=='paladin'){const o=genItem(30,{sl:'offhand',cls,minR:2});o.req=1;eq.offhand=o}else eq.offhand=null;
          try{refreshGear();rB()}catch(e){out.push(cls+' '+wt+' ERR '+e.message);return}
          out.push(cls+' '+wt+' pl='+cnt(pl)+' prev='+cnt(HP)+' plG='+(pl.gearG||[]).length+' prevG='+(HP.gearG||[]).length)})});return out}""")))
play.run(s,w=1280,hh=800)
