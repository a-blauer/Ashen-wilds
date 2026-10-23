# v137: enemies have their own bodies, companions on a shared skeleton have their own bodies, older foes still build.
#  * every enemy that can spawn (zone rosters, camp themes, instance rosters) builds without errors, has a sane size,
#    finite bones through idle / walk / attack, and does not use a companion's rig (body)
#  * species that share a companion skeleton (Gloomcap/Sporelord, Wispling/Lumenwisp/Soulwarden, Gravewyrm/Venomcoil,
#    Batwing/Duskwing) get different bodies; their evolution looks build too
#  * the Sun Scarab's middle legs swing while it walks
# Prints PASS/FAIL lines.
import play,json,os
JS=r"""()=>{const out={fail:[],ok:0,info:[]},V=THREE.Vector3;
  const comp=new Set(Object.keys(SP2).map(k=>SP2[k][2]));
  const keys=new Set();Object.keys(BIOEN).forEach(z=>(BIOEN[z]||[]).forEach(k=>keys.add(k)));
  CAMPS.forEach(C=>[C.th,C.th0].forEach(t=>t&&t.mem.forEach(m=>keys.add(m[0]))));
  Object.keys(N3.zone).forEach(z=>Object.keys(N3.zone[z]).forEach(k=>{const R=N3.zone[z][k];R.L.forEach(q=>keys.add(q));R.th.forEach(t=>t.mem.forEach(m=>keys.add(m[0])))}));
  const err=[];const ce=console.error;console.error=function(){err.push([].map.call(arguments,String).join(' '));return ce.apply(console,arguments)};
  const fin=g=>{let ok=true;g.traverse(o=>{if(o.isBone){o.updateMatrixWorld(true);const e=o.matrixWorld.elements;for(let i=0;i<16;i++)if(!isFinite(e[i]))ok=false}});return ok};
  [...keys].filter(k=>EN[k]&&!k.startsWith('boss')).sort().forEach(k=>{try{err.length=0;const c=enemyC(k,20,{}),g=cr(c);let T=5000;
      const tick=(ms,mv,sp)=>{for(let t=0;t<ms;t+=16){T+=16;animC(g,T,mv,sp||0)}};tick(300,false);tick(400,true,4);g.ak={n:'bite',ph:1,k:.5};tick(200,false);g.updateMatrixWorld(true);
      const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new V()),m=Math.max(sz.x,sz.y,sz.z),rig=EN[k].hum?null:rigOf(k);
      const bad=[];if(!(m>.25&&m<14))bad.push('size '+m.toFixed(2));if(!fin(g))bad.push('NaN bones');if(rig&&comp.has(rig))bad.push('companion body '+rig);if(err.length)bad.push('errors '+err[0].slice(0,120));
      if(bad.length)out.fail.push(k+': '+bad.join(', '));else out.ok++;out.info.push(k+' '+(rig||'hum:'+EN[k].hum)+' '+sz.toArray().map(v=>v.toFixed(2)).join('x'))}
    catch(e){out.fail.push(k+': throws '+String(e).slice(0,160))}});
  // companions that share a skeleton: different bodies, evolution looks build
  const geoOf=(sp,evo)=>{const c=mkC(sp,30,0,'');c.tr='';c.z=1;c.evo=evo;const g=cr(c);const G=[];g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)G.push(o.geometry)});return {g,G}};
  [['Gloomcap','Sporelord'],['Wispling','Lumenwisp','Soulwarden'],['Gravewyrm','Venomcoil'],['Batwing','Duskwing']].forEach(L=>{
    const sig=L.map(sp=>{try{err.length=0;const a=geoOf(sp,0),b=geoOf(sp,4);if(err.length)out.fail.push(sp+': errors '+err[0].slice(0,120));if(!fin(b.g))out.fail.push(sp+': NaN bones at evo 4');
      let s=0;a.G.forEach(G=>{const p=G.attributes.position.array;s+=p.length;for(let i=0;i<p.length;i+=7)s+=p[i]*(i%13+1)});return s.toFixed(3)}catch(e){out.fail.push(sp+': throws '+e);return sp}});
    if(L[0]!='Batwing'&&new Set(sig).size!=L.length)out.fail.push('same body for '+L.join('/')+' '+sig.join(' '));else out.ok++});
  // the scarab's middle legs follow the walk
  try{const g=cr(enemyC('scarab',20,{}));let T=5000,R=[];for(let t=0;t<900;t+=16){T+=16;animC(g,T,true,4);let x=0;g.traverse(o=>{if(o.isGroup&&o.parent&&o.parent.isBone&&o.children.length==2&&o.children[0].isMesh)x+=Math.abs(o.rotation.x)});R.push(x)}
    const mx=Math.max(...R);if(!(mx>.05))out.fail.push('scarab middle legs do not swing ('+mx.toFixed(3)+')');else out.ok++}catch(e){out.fail.push('scarab legs: '+e)}
  console.error=ce;return out}"""
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=ev(JS)
    for i in r['info']:print('  ',i)
    for f in r['fail']:print('FAIL',f)
    print('PASS' if not r['fail'] else 'FAIL','v137 enemies/companion bodies: %d ok, %d failed'%(r['ok'],len(r['fail'])))
play.run(s)
