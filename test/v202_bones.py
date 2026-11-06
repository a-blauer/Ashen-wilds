# v202: bone textures of skinned models that leave the scene are freed (sk202Sweep), so GPU textures no longer climb
# with every trip between instances, and a model put back in the scene is drawn with a fresh bone texture. PASS/FAIL lines.
import json,play
JS=r"""(()=>{window.requestAnimationFrame=()=>0;const R=POST.render;
const tick=(n)=>{POST.render=()=>{};for(let i=0;i<n;i++)loop(performance.now()+i*16);POST.render=R};
const go=(g,f)=>{const I=INSL[g];insArrive(I);const P=I.path||[I.en];const q=P[Math.floor((P.length-1)*f)]||I.en;toPos(q[0],q[1]);rosterTick&&rosterTick();tick(4)};
const draw=()=>{FC.t=-1e9;SHD.t=-1e9;ren.shadowMap.needsUpdate=true;R()};
const sk=()=>{const s=new Set();scene.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton)s.add(o.skeleton)});return s.size};
const fails=[];if(typeof sk202Sweep!='function')fails.push('no sk202Sweep');
const rows=[];
for(let r=0;r<8;r++){go(1,.5);draw();sk202Sweep();go(0,.5);draw();sk202Sweep();rows.push([ren.info.memory.textures,sk(),SK202.freed])}
// a model taken out and put back is drawn again with a fresh bone texture
let back=null;{let m=null,bd=1e9;const v=new THREE.Vector3();scene.traverse(o=>{if(!o.isSkinnedMesh||!o.skeleton||!o.material||o.material.visible===false)return;for(let a=o;a;a=a.parent)if(!a.visible)return;o.getWorldPosition(v);const d=v.distanceTo(cam.position);if(d<bd){bd=d;m=o}});
  if(m){let top=m;while(top.parent&&top.parent!==scene)top=top.parent;scene.remove(top);sk202Sweep();sk202Sweep();const gone=m.skeleton.boneTexture===null;scene.add(top);draw();back=[gone,!!m.skeleton.boneTexture,top.name||top.type]}}
const first=rows[2][0],last=rows[rows.length-1][0];
if(last-first>6)fails.push('textures still climb '+first+' -> '+last);
if(!(rows[rows.length-1][2]>0))fails.push('nothing freed');
if(!back||!back[0]||!back[1])fails.push('re-added model '+JSON.stringify(back));
return {rows,back,err:SK202.err,fails}})()
"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS)
    print('rows [textures, skeletons in scene, freed so far]:',json.dumps(r['rows']),'re-added:',json.dumps(r['back']))
    for f in r['fails']:print('FAIL',f)
    if r['err']:print('FAIL sk202 threw')
    if not r['fails'] and not r['err']:print('PASS v202 bone textures freed, textures flat',r['rows'][2][0],'->',r['rows'][-1][0])
play.run(s)
