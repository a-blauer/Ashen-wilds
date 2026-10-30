# v181: the rebuilt enemy models (yeti, jotun, naga x3, harpy x2, vampire thrall / knight / magister, nosferatu, executioner)
#  * each builds and animates (idle, walk, its first attack) with finite bones, at a sane height, on its own builder
#  * naga: five tail bones on the body mesh (not the pelvis), no legs built, the snake body stays on the ground through
#    idle / walk / attack while the hips move, the tail sways when it moves
#  * harpies: upright skeleton (head well above the hips), a pair of wings, the Harpy on its own rig
#  * limbs closed at the shoulder: the body built by mdBody (every humanoid) and by the v181 toolkit has no open edge round the shoulders
# Prints FAIL lines on a wrong result.
import os,json
import play
KEYS='yeti,jotun,nagaw,nagaa,nagas,harpy,galeharpy,vamp,vampk,vampm,nosferatu,executioner'.split(',')
JS=r"""(keys)=>{const V=THREE.Vector3,out={items:[],fails:[]};const F=m=>out.fails.push(m);
  keys.forEach(k=>{let g,T=5000;try{const c=enemyC(k,20,{});g=cr(c)}catch(e){F(k+': build error '+e);return}
    const it={k,tris:0};g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)it.tris+=o.geometry.attributes.position.count/3});
    const bone=n=>{let b=null;g.traverse(o=>{if(o.isBone&&o.name==n&&!b)b=o});return b},wp=n=>{const b=bone(n);if(!b)return null;g.updateMatrixWorld(true);return b.getWorldPosition(new V())};
    const tick=(ms,mv)=>{for(let t=0;t<ms;t+=16){T+=16;animC(g,T,mv,mv?4:0)}g.position.set(0,g.position.y,0);g.updateMatrixWorld(true)};
    const fin=()=>{let ok=true;g.traverse(o=>{if(o.isBone)o.matrixWorld.elements.forEach(v=>{if(!isFinite(v))ok=false})});return ok};
    try{tick(600,false);const bb=new THREE.Box3().setFromObject(g);it.h=bb.max.y-bb.min.y;if(!fin())F(k+': non-finite bone in idle');
      if(!(it.h>1.3&&it.h<4))F(k+': height '+it.h.toFixed(2)+' m out of range');
      if(EN[k].hum&&!A181.keys[k])F(k+': not on a v181 builder');
      const nt=g.h&&g.h.nt,isN=NAGA181.keys[k];
      if(isN){if(!nt||nt.length!=5)F(k+': no tail bones');else{if(nt[0].parent===bone('pelvis'))F(k+': tail hangs on the pelvis');
        const sk=huBody(g.h).skeleton;if(sk.bones.length!=25)F(k+': skeleton has '+sk.bones.length+' bones (want 25)');
        // no leg skin: no vertex follows a shin or foot bone
        const G=huBody(g.h).geometry,si=G.attributes.skinIndex.array,sw=G.attributes.skinWeight.array,nm=sk.bones.map(b=>b.name);let legs=0;for(let i=0;i<sw.length;i++)if(sw[i]>.5&&/^(lh|rh)[12]$/.test(nm[si[i]]))legs++;if(legs)F(k+': '+legs+' leg-weighted vertices (legs should not be built)');
        const S=g.scale.y,chk=(pose)=>{const p1=wp('nt1'),p4=wp('nt4'),pv=wp('pelvis');if(p1.y>.2*S||p4.y>.12*S)F(k+' '+pose+': tail off the ground (nt1 '+p1.y.toFixed(2)+', nt4 '+p4.y.toFixed(2)+')');if(pv.y<.4*S)F(k+' '+pose+': hips too low '+pv.y.toFixed(2))};
        chk('idle');const r0=nt[3].rotation.y;tick(300,true);chk('walk');it.sway=Math.abs(nt[3].rotation.y-r0);tick(300,true);it.sway=Math.max(it.sway,Math.abs(nt[3].rotation.y-r0));if(it.sway<.02)F(k+': the tail does not sway when moving');
        g.ak={n:EN[k].moves[0],ph:1,k:.6};tick(150,false);chk('attack');g.ak=null}}
      else{tick(300,true);if(!fin())F(k+': non-finite bone in walk');g.ak={n:EN[k].moves[0],ph:1,k:.6};tick(150,false);if(!fin())F(k+': non-finite bone in attack');g.ak=null}
      if(/harpy/.test(k)){const x=g.x||g.userData.x;const hd=wp('head'),pv=wp('pelvis');if(!hd||!pv||hd.y-pv.y<.4*g.scale.y)F(k+': not upright (head '+(hd&&hd.y.toFixed(2))+', hips '+(pv&&pv.y.toFixed(2))+')');
        let wings=0;g.traverse(o=>{if(o.isMesh&&o.geometry===LPWG['harpy181'+EN[k].rig])wings++});if(wings!=2)F(k+': '+wings+' wings (want 2)');if(k=='harpy'&&EN[k].rig!='Harpy181')F('harpy: rig '+EN[k].rig)}
    }catch(e){F(k+': anim error '+e)}
    out.items.push(it)});
  // shoulders closed: weld the body and count open edges round the shoulder joints
  const open=(G,P)=>{const p=G.attributes.position.array,key=i=>Math.round(p[i*3]*2000)+','+Math.round(p[i*3+1]*2000)+','+Math.round(p[i*3+2]*2000),E=new Map();
    for(let t=0;t<p.length/9;t++){const a=[key(t*3),key(t*3+1),key(t*3+2)];for(let j=0;j<3;j++){const u=a[j],v=a[(j+1)%3];if(u==v)continue;const e=u<v?u+'|'+v:v+'|'+u;E.set(e,(E.get(e)||0)+1)}}
    let n=0;E.forEach((c,e)=>{if(c!=1)return;const q=e.split('|')[0].split(',').map(v=>v/2000);['aL0','aR0'].forEach(b=>{const A=P.bones[b];if(Math.hypot(q[0]-A[1],q[1]-A[2],q[2]-A[3])<.1)n++})});return n};
  // (built without the v99 proportion warp, so the joints are where the bone table says)
  AW_PROP99.on=false;try{
  {const B=mdB(HB),P=mdP({});mdBody(B,P);const n=open(mdBake(B).c,P);out.mdBody=n;if(n)F('mdBody: '+n+' open edges round the shoulders')}
  if(typeof a181Arm=='function'){const B=mdB(HB),P=mdP({});a181Torso(B,P,a181TRings('lean'),0x808080);[-1,1].forEach(s=>a181Arm(B,P,s,{},0x808080));const n=open(mdBake(B).c,P);out.a181=n;if(n)F('a181Arm: '+n+' open edges round the shoulders')}
  }finally{AW_PROP99.on=true}
  return out}"""
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(1800000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{window.requestAnimationFrame=()=>0}")
    keys=[q for q in os.environ.get('ONLY','').split(',') if q] or KEYS
    r=ev(JS,keys)
    for it in r['items']:print('%-12s tris %6d  height %.2f m%s'%(it['k'],it['tris'],it.get('h',0),'  tail sway %.2f'%it['sway'] if 'sway' in it else ''))
    print('open edges round the shoulders: mdBody %s, a181 %s'%(r.get('mdBody'),r.get('a181')))
    for f in r['fails']:print('FAIL',f)
    print('==== v181_models: %d models, %d fails'%(len(r['items']),len(r['fails'])))
play.run(s)
