# v148: Duskhold's outskirts (the wild kit outside the walls) are a one-time starter patch: every pine, dead tree, rock and
#   bush can be gathered (wood, stone, plant fibre), and a gathered one is gone for good: no longer a target, its mesh part
#   collapsed, its collider gone, still gone after a save round trip and after the kingdom grows a stage.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async()=>{const out={err:null},w=ms=>new Promise(r=>setTimeout(r,ms)),T=TOWNS[0];
 try{const L=KF109.wsel.L;out.n={};L.forEach(p=>out.n[p.t]=(out.n[p.t]||0)+1);out.ranges=OUT148.rg.filter(r=>r.length).length;
  const res={};
  for(const t of ['bush','pine','dead','rock']){const i=L.findIndex(p=>p.t==t&&!p.gone148);if(i<0){res[t]='none';continue}const p=L[i];
    toPos(T.cx+p.x+(t=='rock'?1.1:.9),T.cy+p.z);await w(150);const tg=gTarget();const m0=JSON.stringify(mats);
    const G=OUT148.rg[i][0];const a=G[0].attributes.position,y0=a.getY(G[1]+1);const col=!!p.col148&&T.col.includes(p.col148);
    if(!tg||tg.w148!==i){res[t]={target:tg&&tg.kind,w:tg&&tg.w148,i};continue}
    gStart(tg);gFinish(tg);const m1=mats;await w(100);
    const tg2=gTarget();res[t]={kind:tg.kind,got:Object.keys(m1).filter(k=>m1[k]>(JSON.parse(m0)[k]||0)),gone:!!p.gone148,again:!!(tg2&&tg2.w148===i),
      sunk:+(y0-a.getY(G[1]+1)).toFixed(2),colBefore:col,colAfter:!!p.col148&&T.col.includes(p.col148),saved:OUT148.h.has(p.ci),ci:p.ci}}
  out.res=res;const ids=[...OUT148.h];
  const sv=x2Save();OUT148.h=new Set();x2Load(sv);out.afterLoad=ids.every(c=>OUT148.h.has(c))&&!KF109.wsel.L.some(p=>ids.includes(p.ci));
  bossDone.add(0);bossDone.add(1);kfApply109(true);out.stage=kf109().s;out.afterStage=!KF109.wsel.L.some(p=>ids.includes(p.ci));
  out.left=out148Left();
 }catch(e){out.err=String(e&&e.stack||e)}return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r))
    F=lambda m:print('FAIL',m)
    if r['err']:F(r['err'][:400]);return
    exp={'bush':'fiber','pine':'wood','dead':'wood','rock':'stone'}
    for t,q in r['res'].items():
        if not isinstance(q,dict) or 'got' not in q:F('%s: not a gathering target (%s)'%(t,q));continue
        if exp[t] not in q['got']:F('%s gave %s, not %s'%(t,q['got'],exp[t]))
        if not q['gone'] or q['again']:F('%s did not disappear'%t)
        if q['sunk']<1:F('%s mesh still standing'%t)
        if t!='bush' and q['colBefore'] and q['colAfter']:F('%s collider stays'%t)
        if not q['saved']:F('%s not recorded'%t)
    if not r['afterLoad']:F('gathered things came back after a save round trip')
    if not r['afterStage']:F('gathered things came back when the kingdom grew')
    print('outskirts: %s, ranges %s, left %s'%(r['n'],r['ranges'],r['left']))
play.run(s)
