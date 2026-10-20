// ================= v83: low-poly humans (hero, humanoid foes, town folk) =================
// The hero and every humanoid foe keep their skeleton (HB), animations and detail kits (dkHeroKit / dkEnemyKit / dkNewKit);
// only the textured body underneath is replaced by a chunky, flat-shaded, vertex-painted body lofted from rings,
// like the low-poly companions. Town folk (npc) are rebuilt the same way as rigid figures.
var HUG,HUMT;
// these functions are hoisted (npc runs while the towns are built), so caches are created lazily
function huMat(skin){HUMT=HUMT||{};const k=skin?'s':'r';return HUMT[k]||(HUMT[k]=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.95,metalness:0,skinning:!!skin,side:THREE.DoubleSide}))}
// lofted vertex-coloured geometry (same ring format as lpGeo); O = bone list for a skinned body, or null for a rigid one
function huGeo(key,O,lofts,seed){
  HUG=HUG||{};if(HUG[key])return HUG[key];
  const P=[],Cc=[],SI=[],SW=[],IX=[],R=dkRng(seed||31),V=THREE.Vector3,tmp=new THREE.Color();
  const bi=b=>{if(!O)return 0;const i=O.indexOf(b);if(i<0)throw new Error('hu: no bone '+b);return i};
  lofts.forEach(L=>{
    const rings=L.rings,seg=L.seg||8,ref=new V(...(L.ref||[0,0,1])),base=P.length/3,pts=rings.map(r=>new V(r.p[0],r.p[1],r.p[2]));
    const vtx=(x,y,z,r,s,c,i)=>{P.push(x,y,z);L.paint(tmp,r,s,c,i);tmp.multiplyScalar(.9+R()*.14);Cc.push(tmp.r,tmp.g,tmp.b);
      if(O){SI.push(bi(r.b[0]),bi(r.b[1]),0,0);SW.push(1-(r.b[2]||0),r.b[2]||0,0,0)}};
    rings.forEach((r,i)=>{
      const tg=pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(i-1,0)]).normalize(),U=ref.clone().sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize(),Sd=new V().crossVectors(U,tg);
      for(let k=0;k<seg;k++){
        const a=Math.PI/2+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=s>0?(r.ryT==null?r.rx:r.ryT):(r.ryB==null?r.rx:r.ryB),j=1+(R()-.5)*(r.j==null?.06:r.j);
        vtx(pts[i].x+(Sd.x*c*r.rx+U.x*s*ry)*j,pts[i].y+(Sd.y*c*r.rx+U.y*s*ry)*j,pts[i].z+(Sd.z*c*r.rx+U.z*s*ry)*j,r,s,c,i);
      }
    });
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*seg+k,a1=base+i*seg+(k+1)%seg,b2=a+seg,b3=a1+seg;IX.push(a,a1,b2,b2,a1,b3)}
    [[L.capA,0],[L.capB,rings.length-1]].forEach(q=>{if(!q[0])return;const r=rings[q[1]],ci=P.length/3;vtx(pts[q[1]].x,pts[q[1]].y,pts[q[1]].z,r,q[1]?1:-1,0,q[1]);
      const o=base+q[1]*seg;for(let k=0;k<seg;k++){const a=o+k,a1=o+(k+1)%seg;if(q[1])IX.push(ci,a,a1);else IX.push(ci,a1,a)}});
  });
  const G=new THREE.BufferGeometry();
  G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  if(O){G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4))}
  G.setIndex(IX);G.computeVertexNormals();G.computeBoundingSphere();G.userData.lps=1;return HUG[key]=G;
}
function huHex(a){return Array.isArray(a)?dkHex(a.map(v=>Math.max(0,Math.min(255,Math.round(v))))):a}
function huDk(a,f){return Array.isArray(a)?a.map(v=>v*f):dkShade(a,f)}
// ring paint: ring colour, darker toward the back and the bottom of each section (a painted-in shadow)
function huPaint(o,r,s){o.set(r.col);if(r.col2!=null&&s<r.cut)o.set(r.col2);o.multiplyScalar(s<-.4?.82:s>.6?1.06:1)}
// head: a blunt, heavy-jawed skull, front vertex on the nose line; positions match the old head so face kits sit on it
function huHead(P,bn,blend){const sk=P.skin,sd=dkShade(sk,.86),hr=P.hair;
  const R=(y,rx,f,b,col,bb)=>({p:[0,y,0],rx,ryT:f,ryB:b,b:bb||['head','head',0],col,col2:hr,cut:hr!=null&&y>1.16?.2:-2,j:.04});
  return {seg:10,capA:true,capB:true,paint:huPaint,rings:[R(1.02,.052,.056,.05,sd,blend||['neck','head',.5]),R(1.058,.074,.092,.068,sd),R(1.09,.088,.106,.088,sk),R(1.13,.097,.108,.104,sk),
    R(1.17,.1,.1,.108,sk),R(1.21,.092,.083,.1,sk),R(1.245,.064,.052,.074,sk),R(1.268,.022,.018,.03,sk)]}}
// skinned body lofts for the HB skeleton. P = {skin,tunic,sleeve,pants,boot,cape,belt}
function huBodyLofts(P){
  const L=[],T=P.tunic,Sl=P.sleeve,Pa=P.pants,Bo=P.boot,Be=P.belt,sk=P.skin;
  const R=(x,y,z,rx,f,b,bn,col,j)=>({p:[x,y,z],rx,ryT:f,ryB:b==null?f:b,b:bn,col,j});
  L.push({seg:10,capA:true,paint:huPaint,rings:[R(0,.46,0,.148,.1,.106,['pelvis','pelvis',0],dkShade(Pa,.8)),R(0,.53,0,.162,.112,.116,['pelvis','pelvis',0],Pa),
    R(0,.6,0,.168,.118,.12,['pelvis','spine',.6],Be),R(0,.68,0,.16,.11,.112,['spine','spine',0],dkShade(T,.9)),R(0,.78,.004,.182,.126,.12,['spine','chest',.6],T),
    R(0,.88,.006,.2,.136,.128,['chest','chest',0],T),R(0,.95,0,.196,.112,.12,['chest','chest',0],dkShade(T,.92)),R(0,.995,-.004,.112,.076,.086,['chest','neck',.4],dkShade(T,.8)),
    R(0,1.03,0,.058,.06,.055,['neck','neck',0],dkShade(sk,.82))]});
  L.push(huHead(P));
  [-1,1].forEach(s=>{const a=s<0?'aL':'aR',l=s<0?'lh':'rh',x=s*.1;
    L.push({seg:6,capB:true,paint:huPaint,rings:[R(s*.19,.975,0,.064,.062,.06,['chest',a+'0',.5],T),R(s*.225,.93,0,.06,.058,.058,[a+'0',a+'0',0],Sl),R(s*.235,.84,0,.053,.052,.05,[a+'0',a+'0',0],Sl),
      R(s*.24,.77,0,.049,.05,.048,[a+'0',a+'1',.5],dkShade(Sl,.9)),R(s*.246,.69,.005,.047,.048,.045,[a+'1',a+'1',0],Sl),R(s*.25,.625,.008,.044,.045,.042,[a+'1',a+'2',.5],dkShade(Sl,.85)),
      R(s*.252,.59,.012,.038,.04,.036,[a+'2',a+'2',0],sk),R(s*.254,.545,.018,.044,.052,.034,[a+'2',a+'2',0],sk),R(s*.255,.505,.024,.026,.03,.022,[a+'2',a+'2',0],dkShade(sk,.9))]});
    L.push({seg:6,paint:huPaint,rings:[R(x,.545,0,.088,.085,.095,['pelvis',l+'0',.5],Pa),R(x,.44,.005,.08,.08,.084,[l+'0',l+'0',0],Pa),R(x,.33,.02,.064,.066,.062,[l+'0',l+'1',.5],dkShade(Pa,.88)),
      R(x,.22,.012,.058,.058,.058,[l+'1',l+'1',0],Pa),R(x,.13,0,.056,.058,.056,[l+'1',l+'2',.5],Bo),R(x,.07,0,.057,.06,.056,[l+'2',l+'2',0],Bo),R(x,.03,0,.058,.07,.052,[l+'2',l+'2',0],dkShade(Bo,.8))]});
    L.push({seg:6,ref:[0,1,0],capA:true,capB:true,paint:huPaint,rings:[R(x,.04,-.05,.05,.035,.035,[l+'2',l+'2',0],Bo),R(x,.045,.05,.056,.04,.035,[l+'2',l+'2',0],Bo),
      R(x,.035,.135,.046,.028,.03,[l+'2',l+'2',0],dkShade(Bo,.85)),R(x,.03,.165,.02,.012,.02,[l+'2',l+'2',0],dkShade(Bo,.7))]});
  });
  if(P.cape!=null){const C=P.cape,ci=dkShade(C,.6),pc=(o,r,s)=>{o.set(s>0?ci:r.col)};
    L.push({seg:6,capA:true,capB:true,paint:pc,rings:[R(0,.985,-.138,.16,.016,.016,['chest','cp0',.3],dkShade(C,.85),.02),R(0,.84,-.178,.19,.016,.016,['cp0','cp0',0],C,.05),
      R(0,.68,-.207,.205,.016,.016,['cp0','cp1',.5],C,.06),R(0,.52,-.232,.215,.016,.016,['cp1','cp2',.5],dkShade(C,.92),.06),R(0,.36,-.252,.215,.016,.016,['cp2','cp2',0],dkShade(C,.8),.06)]})}
  return L}
function huPal(o){return {skin:huHex(o.skin),tunic:huHex(o.tunic),sleeve:huHex(o.sleeve==null?huDk(o.tunic,.85):o.sleeve),pants:huHex(o.pants),boot:huHex(o.boot==null?0x1c1612:o.boot),
  belt:huHex(o.belt==null?0x2a1d14:o.belt),cape:o.cape==null?null:huHex(o.cape),hair:o.hair==null?null:huHex(o.hair)}}
function huBodyGeo(P){const k='B|'+[P.skin,P.tunic,P.sleeve,P.pants,P.boot,P.belt,P.cape].join('|');return huGeo(k,hbo(),huBodyLofts(P),7)}
// swap the textured HSPEC body of a hero/humanoid for the low-poly one (bones, binding and gear stay)
function huApply(mesh,P,own){if(!mesh||!mesh.isSkinnedMesh)return;
  mesh.geometry=huBodyGeo(P);const m=huMat(1);mesh.material=own?m.clone():m;mesh.userData.lowpoly=1;mesh.castShadow=true}
function huBody(h){return h&&h.children.find(o=>o.isSkinnedMesh&&!o.dk)}
{const f=buildHero;buildHero=function(){const h=f.apply(this,arguments);try{const m=huBody(h);huApply(m,huPal({skin:[217,179,140],tunic:0x1e3036,pants:[40,34,30],cape:[70,18,22]}),true);h.mat=m.material}catch(e){console.error('low-poly hero',e)}return h}}
try{const m=huBody(pl);if(m&&!m.userData.lowpoly){if(pl.cls)heroOutfit(pl,pl.cls);else{huApply(m,huPal({skin:[217,179,140],tunic:0x1e3036,pants:[40,34,30],cape:[70,18,22]}),true)}pl.mat=m.material}}catch(e){console.error('low-poly hero',e)}

// ---------------- humanoid foes ----------------
{const f=mkHumanoid;mkHumanoid=function(key){const g=f.apply(this,arguments);try{const L=HUMLOOK[key];if(L&&!L.bone){const dk=a=>a.map(v=>v*.66);
  huApply(huBody(g.h),huPal({skin:L.skin.map(v=>v*.82),tunic:dkShade(L.tunic,.66),pants:dk(L.pants),cape:dk(L.cape),boot:0x141010}),false)}}catch(e){console.error('low-poly humanoid',key,e)}return g}}

// ---------------- town folk ----------------
// a robed figure on the hero's proportions (so the shared face kit fits), hands folded, with a mantle and a hat/hood/hair
function huNpcLofts(o,P){
  const robe=o.robe,trim=o.trim||dkShade(robe,.6),sk=P.skin,R=(x,y,z,rx,f,b,col,j)=>({p:[x,y,z],rx,ryT:f,ryB:b==null?f:b,col,j}),L=[];
  const hem=dkShade(trim,.7),rd=dkShade(robe,.82),mt=new THREE.Color(robe).lerp(new THREE.Color(0x3a2c22),.45).getHex();
  L.push({seg:10,capA:true,paint:huPaint,rings:[R(0,.02,0,.27,.25,.27,hem,.08),R(0,.07,0,.262,.24,.262,hem,.05),R(0,.1,0,.255,.232,.255,rd,.06),R(0,.3,.01,.215,.19,.21,robe,.06),
    R(0,.5,.01,.18,.15,.165,robe,.05),R(0,.57,.012,.172,.135,.15,o.apron?0xd8d0bc:dkShade(trim,.7)),R(0,.62,.012,.17,.13,.145,o.apron?0xd8d0bc:dkShade(trim,.7)),
    R(0,.76,.008,.186,.13,.14,robe),R(0,.88,.004,.205,.14,.14,robe),R(0,.96,0,.198,.115,.125,rd),R(0,1.0,-.004,.112,.078,.088,dkShade(robe,.7)),R(0,1.035,0,.058,.06,.055,dkShade(sk,.82))]});
  L.push(huHead(P,['head','head',0]));
  // mantle over the shoulders
  L.push({seg:10,capB:false,paint:huPaint,rings:[R(0,1.01,-.005,.125,.09,.1,mt,.03),R(0,.95,-.005,.215,.15,.15,mt,.05),R(0,.86,-.008,.25,.18,.18,dkShade(mt,.85),.08),R(0,.8,-.01,.25,.18,.18,dkShade(trim,.6),.08)]});
  [-1,1].forEach(s=>{L.push({seg:6,capB:true,paint:huPaint,rings:[R(s*.2,.95,0,.07,.068,.066,robe),R(s*.245,.8,.03,.066,.064,.064,robe),R(s*.235,.72,.1,.07,.07,.07,rd),
    R(s*.15,.665,.17,.086,.084,.084,dkShade(trim,.8)),R(s*.11,.655,.19,.075,.075,.075,dkShade(robe,.6)),R(s*.06,.65,.2,.04,.042,.04,sk),R(s*.025,.648,.205,.032,.035,.03,sk)]})});
  return L}
function huNpcKit(o,P,seed){
  const k=dkKit(),R=dkRng(seed),sk=P.skin,hc=[0x2a1a12,0x4a3a2a,0x6a6a66,0x8a8a88,0x3a2414,0x1a1410][Math.floor(R()*6)],hat=o.hat||'',beard=R()<.6?hc:null;
  dkFace(k,{skin:sk,hair:hat?null:hc,hairStyle:R()<.5?'long':'short',beard,brow:hc});
  if(hat=='wiz'){const c=o.hatC;k.p('head','cyl','c',dkShade(c,.85),0,1.235,0,.24,.025,.24);k.p('head','cyl','c',c,0,1.27,-.01,.12,.07,.12);
    k.L('head','c',c,[0,1.3,-.01],[.02,1.46,-.04],.11,.07,7).L('head','c',dkShade(c,.9),[.02,1.46,-.04],[.08,1.56,-.1],.07,.03,6).L('head','c',dkShade(c,.8),[.08,1.56,-.1],[.15,1.58,-.16],.03,.004,5);
    k.p('head','ring','c',o.trim||0x8a6a2a,0,1.26,0,.128,.25,.128)}
  else if(hat=='cap'){const c=o.hatC;k.p('head','hem','c',c,0,1.19,-.01,.118,.08,.124,-.15);k.p('head','box','c',dkShade(c,.8),0,1.18,.11,.15,.018,.07,.15);k.L('head','c',dkShade(c,1.3),[.08,1.22,-.04],[.15,1.33,-.12],.012,.003,4)}
  else if(hat=='chef'){k.p('head','cyl','c',0xd8d2c4,0,1.27,0,.11,.12,.11);k.p('head','sph','c',0xe4ded0,0,1.36,0,.14,.07,.14);k.p('head','ring','c',0xb8b0a0,0,1.22,0,.112,.25,.112)}
  else if(R()<.4)dkHood(k,dkShade(o.trim||o.robe,.8),false);
  // belt, pouch, toggles
  k.p('spine','ring','c',0x2a1d14,0,.6,0,.176,.5,.15).p('spine','box','m',0x8a6a2a,0,.6,.15,.04,.035,.014).p('pelvis','box','c',0x3a2a1a,-.15,.5,.1,.06,.08,.04,0,-.5,0);
  for(let i=0;i<3;i++)k.p('chest','box','c',dkShade(o.trim||0x8a6a2a,1.2),0,.84+i*.05,.142,.022,.014,.014);
  if(o.apron){k.p('pelvis','box','c',0xd8d0bc,0,.36,.2,.3,.46,.015,-.1);k.p('chest','box','c',0xd0c8b4,0,.78,.143,.22,.2,.012);k.p('pelvis','box','c',0x8a8270,0,.27,.215,.3,.02,.016,-.1)}
  return k}
function huNpcBody(o){
  const seed=((o.robe|0)*31+(o.trim|0)*7+((o.hatC|0)*3))%99991+11,R=dkRng(seed),sks=[[214,170,132],[190,146,110],[150,108,78],[222,186,152]],skin=dkHex(sks[Math.floor(R()*4)]);
  const P={skin,hair:null},key='NL|'+o.robe+'|'+(o.trim||0)+'|'+(o.hat||'')+'|'+(o.hatC||0)+'|'+(o.apron?1:0),out=[];
  const m=new THREE.Mesh(huGeo(key,null,huNpcLofts(o,P),seed),huMat(0));m.castShadow=true;out.push(m);
  if(!DKBK[key])dkBake(huNpcKit(o,P,seed).P,null,key);dkBake([],null,key).forEach(q=>out.push(q));return out}
// town folk built before this module loaded: swap their old baked figure for the new one (label sprite and animation stay)
(function(){try{if(!DKBK)return;const own=new Map();
  Object.keys(DKBK).forEach(k=>{if(k.slice(0,2)!='N|')return;const gs=DKBK[k];for(const t in gs)own.set(gs[t],k)});if(!own.size)return;
  const hits=new Map();scene.traverse(m=>{if(m.isMesh&&own.has(m.geometry)&&m.parent){const L=hits.get(m.parent)||[];L.push(m);hits.set(m.parent,L);m.userData.npcKey=own.get(m.geometry)}});
  hits.forEach((L,g)=>{const q=L[0].userData.npcKey.split('|'),o={robe:+q[1],trim:+q[2]||0,hat:q[3]||'',hatC:+q[4]||0,apron:q[5]=='1'};
    L.forEach(m=>g.remove(m));huNpcBody(o).forEach(m=>g.add(m))})}catch(e){console.error('low-poly town folk',e)}})();

