# v183 bird wings: the Skyhawk, Stormtalon and Rocsovereign build feathered wings (3396) and details (3397) without errors at
# every evolution, fold along the body when standing, half open when walking, spread when attacking, share their geometries
# between instances (nothing made per creature), have no NaN, and the folded wing stays outside the body.
# Prints FAIL lines on a wrong result.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""()=>{const out={fails:[],info:[]},F=s=>out.fails.push(s),V=THREE.Vector3;let T=9000;
  const tick=(g,ms,mv,sp)=>{for(let t=0;t<ms;t+=16){T+=16;animC(g,T,mv,sp||0)}g.updateMatrixWorld(true)};
  const tabs={Skyhawk:HWK_BODY,Stormtalon:ST150.body,Rocsovereign:RS150.body};
  ['Skyhawk','Stormtalon','Rocsovereign'].forEach(sp=>[0,1,3].forEach(evo=>{let g;
    try{const c=mkC(sp,30,0,'');c.tr='';c.z=1;c.evo=evo;g=cr(c)}catch(e){F(sp+' evo '+evo+': build error '+e);return}
    scene.add(g);g.position.set(0,0,0);g.rotation.set(0,0,0);
    const B=g.bw183;if(!B){F(sp+' evo '+evo+': no v183 wings');scene.remove(g);return}
    if(B.W.m.length!=2)F(sp+': '+B.W.m.length+' wing meshes (want 2)');
    tick(g,700,false);const fIdle=B.f;if(fIdle<.95)F(sp+' evo '+evo+': wings not folded standing (fold '+fIdle.toFixed(2)+')');
    // the folded wing stays outside the body loft (at most 3% of its vertices more than 1 cm inside)
    {const m=B.W.m[1],P=m.geometry.attributes.position,v=new V();let bad=0,nan=0;const k=g.bs||1;
      for(let i=0;i<P.count;i+=3){v.fromBufferAttribute(P,i);if(!isFinite(v.x+v.y+v.z)){nan++;continue}v.applyMatrix4(m.matrixWorld).multiplyScalar(1/k);
        if(v.x>0&&bw183Push(tabs[sp],v.x,v.y,v.z,-.01))bad++}
      const fr=bad/(P.count/3);if(nan)F(sp+': '+nan+' NaN wing vertices');if(fr>.03)F(sp+' evo '+evo+': '+(fr*100).toFixed(1)+'% of the folded wing inside the body');
      out.info.push(sp+' evo '+evo+' fold '+fIdle.toFixed(2)+' inside '+(fr*100).toFixed(1)+'% tris '+P.count/3)}
    tick(g,900,true,3);const fWalk=B.f;if(fWalk<.3||fWalk>.8)F(sp+': walking fold '+fWalk.toFixed(2)+' (want .3-.8)');
    g.atk=1;tick(g,500,false);const fAtk=B.f;const wg=[];g.b.traverse(o=>{if(o.children&&o.children[0]&&B.W.m.indexOf(o.children[0])>=0)wg.push(o)});
    let flap=0;for(let i=0;i<20;i++){tick(g,32,false);wg.forEach(p=>flap=Math.max(flap,Math.abs(p.rotation.z)))}
    if(fAtk>.05)F(sp+': wings not spread attacking (fold '+fAtk.toFixed(2)+')');if(flap<.05)F(sp+': spread wings do not beat (max shoulder turn '+flap.toFixed(3)+')');
    g.atk=0;tick(g,1500,false);if(B.f<.95)F(sp+': wings did not fold again after the attack ('+B.f.toFixed(2)+')');
    out.info.push(sp+' evo '+evo+' walk '+fWalk.toFixed(2)+' attack '+fAtk.toFixed(2)+' beat '+flap.toFixed(2));
    scene.remove(g)}));
  // shared geometries: a second Skyhawk uses the same wing geometry objects and adds no cache entries
  {const n0=Object.keys(BW183.G).length,mk=()=>{const c=mkC('Skyhawk',30,0,'');c.tr='';c.z=1;c.evo=0;return cr(c)},a=mk(),b=mk();
    if(a.bw183.W.m[0].geometry!==b.bw183.W.m[0].geometry)F('two Skyhawks do not share their wing geometry');
    if(Object.keys(BW183.G).length!=n0)F('a second Skyhawk made new wing caches ('+n0+' → '+Object.keys(BW183.G).length+')')}
  return out}"""
def s(pg):
    errs=[];pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=pg.evaluate(JS)
    for i in r['info']:print(' ',i)
    for e in errs:
        if 'bw183' in e or 'bd183' in e or 'low-poly rig failed' in e or 'evo100' in e:r['fails'].append('console error: '+e[:200])
    for f in r['fails']:print('FAIL',f)
    print('v183 bird wings:','FAIL' if r['fails'] else 'PASS',len(r['fails']),'problems')
play.run(s,w=900,hh=600)
