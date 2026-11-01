// ================= v186: evolved spells stay a step above the (now richer) standard ones =================
// Owner (Nov 1 2026): "improve the visual effects on all of our character spells and abilities significantly (evolved spells
// should still look even cooler than standard spell)". The standard shapes were rebuilt in 0107 (burst, ring, arc, bolt) and
// 1000 (kqsPillar, kqsBeam). An evolved cast adds the ev137 layer on top (2700 / 2710); this file enriches that layer so the
// gap stays: every evolved shockwave leaves a slow-fading scorch glow and throws two-colour embers, flares get a horizontal
// lens streak and a colour halo, columns get a rising double helix of motes, lances crackle along their length.
// Everything is shared geometry / textures with per-effect materials freed at the end (evxRm), and partners see it (the
// MPV wrappers on ev137* from 2710 sit inside these).
function ev186C2(col){const E=typeof EV137!='undefined'&&EV137.cur;return E&&E.c2!=null?evxCol(E.c2):evxLerp(col,0xffffff,.5)}
// a glowing scorch on the ground that lingers after the blast
function ev186Scorch(p,col,R,ms){if(!p)return;const g=evxMesh(evxDisk(),evxAdd(col,0,evxTex('soft'))),h=evxMesh(evxDisk(),evxAdd(evxLerp(col,0x200800,.5),0,evxTex('glyph')));
  const b=evxGY(p,.06);g.position.copy(b);h.position.copy(b);h.position.y+=.01;g.scale.setScalar(R);h.scale.setScalar(R*.8);h.rotation.y=Math.random()*6.28;scene.add(g,h);
  tw(ms,k=>{const f=k<.1?k/.1:Math.pow(1-(k-.1)/.9,1.6);g.material.opacity=.45*f;h.material.opacity=.3*f;h.rotation.y+=.004},()=>{evxRm(g);evxRm(h)})}
{const f=ev137Shock;ev137Shock=function(p,col,R,ms){const r=f.apply(this,arguments);try{if(p){R=Math.max(.8,Math.min(14,R||3));col=evxCol(col);const c2=ev186C2(col),b=evxGY(p,.15);
  ev186Scorch(p,col,R*.55,(ms||520)*2.6);
  // embers in both colours flung low and wide, then drifting up
  for(let i=0;i<12;i++){const a=Math.random()*6.28,v=R*evxRand(1.2,2.4);evxPuff(new THREE.Vector3(b.x,b.y,b.z),{spr:1,col:i%2?c2:col,r0:.16,r1:0,life:.6+Math.random()*.5,op:1,v:[Math.cos(a)*v,evxRand(.6,2.2),Math.sin(a)*v],g:-1.2,drag:2.4,fin:.03})}}}catch(_){}return r}}
{const f=ev137Flare;ev137Flare=function(p,col,s,ms){const r=f.apply(this,arguments);try{if(p){s=s||1.5;ms=ms||360;col=evxCol(col);const c2=ev186C2(col);
  const st=new THREE.Sprite(new THREE.SpriteMaterial({map:evxTex('soft'),color:evxLerp(col,0xffffff,.55),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})),
    hl=new THREE.Sprite(new THREE.SpriteMaterial({map:fx186Tex('ring'),color:c2,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  st.userData.lpsSkip=hl.userData.lpsSkip=1;st.renderOrder=hl.renderOrder=35;st.position.set(p.x,p.y,p.z);hl.position.copy(st.position);scene.add(st,hl);
  tw(ms*1.1,k=>{const u=k<.12?k/.12:1,f2=Math.pow(1-k,1.6);st.scale.set(s*6*(.5+.5*u),s*.32,1);st.material.opacity=.85*f2;hl.scale.setScalar(s*(1.2+k*2.4));hl.material.opacity=.7*f2},()=>{evxRm(st);evxRm(hl)})}}catch(_){}return r}}
{const f=ev137Column;ev137Column=function(p,col,h,rr,ms){const r=f.apply(this,arguments);try{if(p){h=h||7;rr=rr||.7;ms=ms||600;col=evxCol(col);const c2=ev186C2(col),b=evxGY(p,0);
  // a double helix of motes winding up the column
  for(let i=0;i<14;i++){const s=i%2,a0=s*Math.PI+i*.45,y0=i/14*h*.35;setTimeout(()=>{const ph=Math.random()*.3;evxPuff(new THREE.Vector3(b.x+Math.cos(a0)*rr*1.3,b.y+y0,b.z+Math.sin(a0)*rr*1.3),
    {spr:1,col:s?c2:0xffffff,r0:.2,r1:.02,life:.7,op:1,v:[-Math.sin(a0)*rr*3,h*.9,Math.cos(a0)*rr*3],drag:.8,fin:.04})},i*ms*.02)}
  ev186Scorch(p,col,rr*2.2,ms*2)}}catch(_){}return r}}
{const f=ev137Lance;ev137Lance=function(a,b,col,w,ms){const r=f.apply(this,arguments);try{if(a&&b){col=evxCol(col);const c2=ev186C2(col),L=a.distanceTo(b);
  // crackle: short sparks jumping off the lance along its length, and a flash where it lands
  for(let i=0;i<Math.min(10,Math.ceil(L*1.2));i++){const q=a.clone().lerp(b,Math.random());evxPuff(q,{col:i%2?c2:0xffffff,add:1,geo:'tet',r0:.06,r1:0,life:.25+Math.random()*.2,op:1,v:[(Math.random()-.5)*5,(Math.random()-.2)*4,(Math.random()-.5)*5],g:6,drag:1.5,spin:14,fin:.02})}
  fx186Flash(b,c2,Math.min(2.2,.7+(w||.12)*6),(ms||300)*.7)}}catch(_){}return r}}
