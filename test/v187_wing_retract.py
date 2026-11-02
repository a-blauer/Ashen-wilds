# v187 wing retract: after an attack, winged companions (Skyhawk birds, Drakelet / Gravewyrm dragons, Batwing bats) fold and
# settle their wings smoothly: no frame where the shoulder turn jumps (the flap strength used to drop from attack to rest in
# one frame), and the fold passes through many small shape steps (it used to step through 11 shapes in ~6 visible frames).
# Prints FAIL lines on a wrong result.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""()=>{const out={fails:[],info:[]},F=s=>out.fails.push(s);let T=9000;
  ['Skyhawk','Drakelet','Batwing'].forEach(sp=>[0,3].forEach(evo=>{let g;
    try{const c=mkC(sp,30,0,'');c.tr='';c.z=1;c.evo=evo;g=cr(c)}catch(e){F(sp+' evo '+evo+': build error '+e);return}
    scene.add(g);g.position.set(0,0,0);g.rotation.set(0,0,0);
    let x=null;{const f0=rigAnim;rigAnim=function(q){if(!x)x=q;return f0.apply(this,arguments)};try{T+=16;animC(g,T,false,0)}finally{rigAnim=f0}}
    const W=x&&x.wings||[];if(!W.length){F(sp+': no wings');scene.remove(g);return}
    const Fd=x.bw184||x.dg186,step=()=>{T+=16;animC(g,T,false,0)};
    for(let t=0;t<700;t+=16)step();
    g.atk=1;for(let t=0;t<600;t+=16)step();
    let jump=0,prev=W.map(w=>w.p.rotation.z),lvs=new Set(),maxLv=0,lv0=Fd?Fd.W.lv:0;g.atk=0;
    for(let t=0;t<1500;t+=16){step();W.forEach((w,i)=>{jump=Math.max(jump,Math.abs(w.p.rotation.z-prev[i]));prev[i]=w.p.rotation.z});
      if(Fd){const L=Fd.W.lv;lvs.add(L);maxLv=Math.max(maxLv,Math.abs(L-lv0));lv0=L}}
    const n=(window.BW184&&x.bw184)?BW184.lv:(window.DG186&&x.dg186)?DG186.lv:0;
    let stepFr=0;if(Fd&&n){stepFr=maxLv/n}
    if(jump>.25)F(sp+' evo '+evo+': wing turn jumps '+jump.toFixed(2)+' rad in one frame after the attack');
    if(Fd&&lvs.size<15)F(sp+' evo '+evo+': fold passes only '+lvs.size+' shapes after the attack');
    if(Fd&&stepFr>.08)F(sp+' evo '+evo+': fold shape jumps '+(stepFr*100).toFixed(0)+'% in one frame');
    if(Fd&&Fd.f<.95)F(sp+' evo '+evo+': wings not folded 1.5 s after the attack ('+Fd.f.toFixed(2)+')');
    out.info.push(sp+' evo '+evo+' max frame turn '+jump.toFixed(3)+(Fd?' shapes '+lvs.size+' max shape step '+(stepFr*100).toFixed(1)+'% fold '+Fd.f.toFixed(2):''));
    scene.remove(g)}));
  return out}"""
def s(pg):
    errs=[];pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=pg.evaluate(JS)
    for i in r['info']:print(' ',i)
    for e in errs:
        if 'bw184' in e or 'dg186' in e or 'low-poly rig failed' in e:r['fails'].append('console error: '+e[:200])
    for f in r['fails']:print('FAIL',f)
    print('v187 wing retract:','FAIL' if r['fails'] else 'PASS',len(r['fails']),'problems')
play.run(s,w=900,hh=600)
