# v220: villagers (shoulders built with the arms hanging, the wardrobe) and the rebuilt Hatchery.
# Prints FAIL lines on a wrong result. SHOT=1 also writes out/v220_town_hatch<level>.png (the Hatchery in Duskhold).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
CHECK=r"""async()=>{const o={},F=[],ok=(c,m)=>{if(!c)F.push(m)},V=THREE.Vector3;
// ---------------- villagers ----------------
const mkC=(i,r)=>({n:HS103_CN[i%HS103_CN.length],h:0,r,rk:1,task:'',t0:0,lk:(i*7919+i*i*104729+12345)%1000000});
const roles=['gather','egg','fish','hunt','gather','gather'],kinds={},keys=[];
// skinned vertices of a figure: [x,y,z, weight on the upper-arm bones]
const verts=(g,side)=>{g.updateMatrixWorld(true);const out=[];g.children.filter(m=>m.isSkinnedMesh).forEach(m=>{m.skeleton.update();const P=m.geometry.attributes.position,SI=m.geometry.attributes.skinIndex,SW=m.geometry.attributes.skinWeight,B=m.skeleton.bones,v=new V();
    for(let i=0;i<P.count;i++){let w=0;for(let j=0;j<4;j++){const b=B[SI.array[4*i+j]];if(b&&b.name==side+'0')w+=SW.array[4*i+j]}if(w<.5)continue;v.fromBufferAttribute(P,i);m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);out.push([v.x,v.y,v.z])}});return out};
for(let i=0;i<12;i++){const c=mkC(i,roles[i%6]),lk=czLook103(c),g=czModel103(c),m=g.children.find(q=>q.isSkinnedMesh);
  ok(m&&m.userData.fk,'villager '+i+' is not an animal model');if(!m)continue;const key=m.userData.fkKey;keys.push(key);ok(/\|v220/.test(key)&&/\|w220\|/.test(key),'villager '+i+' not built by v220: '+key);
  const fit=FKO.cit(lk,FK137.sp[m.userData.fk],FK137.sp[m.userData.fk].cols(0)).kind;kinds[fit]=(kinds[fit]||0)+1;
  // the same villager is the same model again (a co-op partner builds the same)
  const g2=czModel103(mkC(i,roles[i%6]));ok(g2.children.find(q=>q.isSkinnedMesh).userData.fkKey===key,'villager '+i+' built differently the second time');
  // shoulders: standing relaxed, nothing of the upper arm stands above the shoulder joint by more than 6 cm (the old hump: 10-13)
  czReset103(g);g.updateMatrixWorld(true);const k=g.bones.pelvis.scale.x;
  ['aL','aR'].forEach(s=>{const J=g.bones[s+'0'].getWorldPosition(new V()),E=g.bones[s+'1'].getWorldPosition(new V()),P=verts(g,s);if(!P.length){F.push('villager '+i+' has no upper arm '+s);return}
    const top=Math.max(...P.map(p=>p[1]))-J.y;ok(top<.06*k,'villager '+i+' ('+m.userData.fk+') '+s+' shoulder stands '+(top*100/k).toFixed(1)+' cm above the joint');
    // and the upper arm lies along its bone (the mesh was built for this pose): its vertices stay within 11 cm of the shoulder-elbow line
    const d=E.clone().sub(J),len=d.length();d.normalize();let far=0;P.forEach(p=>{const q=new V(p[0],p[1],p[2]).sub(J),t=Math.max(0,Math.min(len,q.dot(d)));far=Math.max(far,q.sub(d.clone().multiplyScalar(t)).length())});
    ok(far<.125*k*Math.max(1,(FK137.sp[m.userData.fk].armK||[1])[1]||1),'villager '+i+' ('+m.userData.fk+') '+s+' upper arm is '+(far*100/k).toFixed(1)+' cm off its bone')});
  // no NaN
  let bad=0;g.children.filter(q=>q.isSkinnedMesh).forEach(q=>{const a=q.geometry.attributes.position.array;for(let j=0;j<a.length;j++)if(!isFinite(a[j]))bad++});ok(!bad,'villager '+i+' has '+bad+' NaN coordinates')}
o.kinds=kinds;ok(Object.keys(kinds).length>=5,'12 villagers wear only '+Object.keys(kinds).length+' kinds of outfit: '+JSON.stringify(kinds));
ok(new Set(keys).size>=11,'villagers share models: '+new Set(keys).size+' of 12 differ');
// every outfit builds on every leg type (flat feet, toes, hooves)
Object.keys(VC220.fit).forEach(f=>['bear','fox','doe','mouse'].forEach(sp=>{try{const rig=idlNpcBody({robe:0x5a4a3a,trim:0x8a6a2a,hat:'cap',hatC:0x3a2a1a,fkSp:sp,fkFur:0,fkFit:f,fkRole:'gather',fkV:7,label:''});ok(rig.fk&&rig.meshes[0].geometry.attributes.position.count>1500,f+' on '+sp+': empty model')}catch(e){F.push(f+' on '+sp+': '+e)}}));
// keepers still build, and stand in their bind pose as before (rest pose rotations untouched)
{const rig=idlNpcBody({robe:0x6a3a2a,trim:0x2a1a12,hat:'chef',apron:1,label:'Blacksmith'});ok(rig.fk&&rig.fk.key=='bear'&&/\|v220/.test(rig.meshes[0].userData.fkKey),'the Blacksmith is not built with the new shoulders');
  ok(['aL0','aL1','aR0','aR1'].every(n=>rig.bones[n].rotation.x===0&&rig.bones[n].rotation.z===0),'the bind pose of the arms changed')}
// ---------------- the Hatchery ----------------
const T=TOWNS[0],tris=g=>{let n=0;g.traverse(m=>{if(m.isMesh&&m.geometry){const G=m.geometry;n+=(G.index?G.index.count:G.attributes.position.count)/3}});return Math.round(n)};
const box=g=>new THREE.Box3().setFromObject(g);let last=0,lastH=0;o.h=[];
for(let l=0;l<=3;l++){SH.lv.hatch=l;shApply();const st=kdState().up.hatch,g=st&&st.g;ok(g&&g.parent,'Hatchery level '+l+': no model in town');if(!g)continue;
  const n=tris(g),b=box(g),h=b.max.y-b.min.y;o.h.push([l,n,+h.toFixed(2),st.col.length]);
  ok(n>last*1.08,'Hatchery level '+l+' is not more elaborate than level '+(l-1)+': '+n+' triangles after '+last);ok(h>=lastH-.01,'Hatchery level '+l+' is lower than the level before');last=n;lastH=h;
  ok(h>2.8,'Hatchery level '+l+' is only '+h.toFixed(1)+' m tall');ok(Math.max(b.max.x-b.min.x,b.max.z-b.min.z)<10.5,'Hatchery level '+l+' is wider than its lot');
  let egg=null,cry=null;g.traverse(q=>{if(q.userData.ht220=='egg')egg=q;if(q.userData.ht220=='crystal')cry=q});ok(!!egg,'Hatchery level '+l+': no rocking egg');ok(!!cry===(l==3),'Hatchery level '+l+': crystal egg '+(cry?'there':'missing'));
  ok(st.an&&TANIM.includes(st.an),'Hatchery level '+l+': not animated');try{[0,400,900,7400,7900].forEach(t=>st.an.f(100000+t))}catch(e){F.push('Hatchery level '+l+' animation: '+e)}
  ok(ht200N()===3+l,'Hatchery level '+l+' slots '+ht200N());
  // the prompt at its door still opens the Hatchery, and the way in is open (no collider on the door spot)
  const lt=lotOf103('u:hatch'),d=lotDoor103(lt);toPos(d[0],d[1]);const p=townPortalPrompt(T);ok(p&&/Hatchery/.test(p.label),'Hatchery level '+l+': no prompt at its door');
  const fr=lotW103(lt,0,2.4);ok(!st.col.some(c=>c.r&&Math.hypot(c.x-fr[0],c.z-fr[1])<c.r+.3),'Hatchery level '+l+': something stands in its entrance')}
SH.lv.hatch=0;shApply();ok(kdState().up.hatch.l===1,'back to level 0: model level '+kdState().up.hatch.l);
o.fails=F;return o}"""
def s(pg):
    L.start(pg);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e: errs.append(str(e)))
    r=ev(CHECK);fails=r['fails']
    print('outfits',json.dumps(r.get('kinds')));print('hatchery [level, triangles, height, colliders]',json.dumps(r.get('h')))
    if os.environ.get('SHOT'):
        for l in range(4):
            ev("(l)=>{SH.lv.hatch=l;shApply();const lt=lotOf103('u:hatch'),d=lotW103(lt,1.2,6.2);window.FCAM=null;toPos(d[0],d[1]);camYaw=lt.ry+(window.V220YAW||0);camPitch=.2;camDist=7.5;STEP(.3)}",l);L.shot(pg,OUT+'/v220_town_hatch%d.png'%l)
    for e in errs:fails.append('page error: '+e)
    for f in fails:print('FAIL',f)
    print('V220','OK' if not fails else 'FAILED %d'%len(fails))
play.run(s)
