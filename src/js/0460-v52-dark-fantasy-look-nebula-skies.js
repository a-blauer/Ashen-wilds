// ================= v52: dark-fantasy look — nebula skies, giant moon, colored moonlight, glowing mist, vivid grade =================
document.body.classList.toggle('psx',PSXON);document.body.classList.toggle('psxpx',PSXON&&PSXH>0);
if(PSXON&&PSXH>0&&typeof gt!='undefined'){[gt,typeof gtT!='undefined'?gtT:null].forEach(t=>{if(t){t.magFilter=THREE.NearestFilter;t.needsUpdate=true}})}
const hxC=s=>new THREE.Color(s);
// one palette per zone, taken from the reference art
const ZPAL=[
 {top:'#0a0820',hor:'#2a1a4a',n1:'#6a3aff',n2:'#2a1a80',mist:'#3a2a6a',light:'#b0a0ff',moon:'#f0e8ff',sh:[.9,.86,1.2],hi:[1.05,1,1.1]},
 {top:'#050c06',hor:'#1a2a12',n1:'#4a8a20',n2:'#2a3a10',mist:'#3a5a24',light:'#a8d870',moon:'#e8ffd0',sh:[.9,1.1,.85],hi:[1,1.08,.95]},
 {top:'#0a1430',hor:'#6a4a3a',n1:'#e8a040',n2:'#6a3a8a',mist:'#8a7a5a',light:'#ffd8a0',moon:'#fff0d8',sh:[.95,.95,1.1],hi:[1.1,1.02,.92]},
 {top:'#0a0a1e',hor:'#3a2a4a',n1:'#ff6a2a',n2:'#3a5ad8',mist:'#8ab0d8',light:'#c8e0ff',moon:'#ffd8b0',sh:[.85,.95,1.2],hi:[1.05,1,1]},
 {top:'#1a0806',hor:'#8a3a1a',n1:'#ff8a2a',n2:'#8a2a1a',mist:'#c08050',light:'#ffc080',moon:'#fff0c0',sh:[1.1,.9,.8],hi:[1.1,1,.85]},
 {top:'#040a10',hor:'#1a3a3a',n1:'#3affb0',n2:'#4a2a8a',mist:'#3a8a8a',light:'#9affd8',moon:'#e0fff4',sh:[.85,1.05,1.1],hi:[.95,1.1,1.05]},
 {top:'#140206',hor:'#4a0a14',n1:'#ff2040',n2:'#4a0a3a',mist:'#5a1a24',light:'#ff8080',moon:'#ffd0d0',sh:[1.15,.85,.9],hi:[1.05,.95,.95]}].map(p=>({top:hxC(p.top),hor:hxC(p.hor),n1:hxC(p.n1),n2:hxC(p.n2),mist:hxC(p.mist),light:hxC(p.light),moon:hxC(p.moon),sh:new THREE.Color(...p.sh),hi:new THREE.Color(...p.hi)}));
const ZCUR={};Object.keys(ZPAL[0]).forEach(k=>ZCUR[k]=ZPAL[0][k].clone());
const MOOND=new THREE.Vector3(-.42,.5,-.76).normalize();
if(PSXON){
  const m=SKY.material;Object.assign(m.uniforms,{c1:{value:new THREE.Color()},c2:{value:new THREE.Color()},moonDir:{value:MOOND.clone()},moonCol:{value:new THREE.Color()},day:{value:0}});
  m.fragmentShader=`varying vec3 vD;uniform vec3 top,hor,c1,c2,moonDir,moonCol;uniform float time,day;
  float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(7.1,3.3);a*=.5;}return s;}
  void main(){vec3 d=normalize(vD);float y=max(d.y,0.);
    vec3 col=mix(hor,top,pow(y,.6));
    vec2 p=d.xz/(d.y+.28)*1.1;float t=time*.012;
    vec2 w=vec2(fbm(p*1.3+vec2(t,-t)),fbm(p*1.3+vec2(5.2,1.3)-t));
    float n=fbm(p*1.5+w*2.4+t),n2=fbm(p*2.8+w*3.+3.);
    vec3 neb=mix(c1,c2,smoothstep(.3,.75,n2));
    float msk=smoothstep(.36,.82,n)*smoothstep(-.04,.3,d.y);
    col=mix(col,neb*(.55+.9*n),msk*.85);col+=neb*pow(n,3.)*.6*msk;
    float st=step(.9955,hs(floor(d.xz/(d.y+.3)*300.)))*smoothstep(.04,.4,d.y)*(1.-msk*.55);col+=vec3(st)*(.65+.35*sin(time*2.+hs(floor(d.xz*97.))*40.))*(1.-day*.6);
    float md=dot(d,moonDir);vec3 mo=d-moonDir;float tex=fbm(mo.xy*70.+mo.z*30.)*.6+.4;
    float disk=smoothstep(.9972,.9979,md);float shade=smoothstep(-.02,.05,dot(normalize(mo+vec3(.0001)),vec3(.6,.2,.3)));
    col=mix(col,moonCol*(.55+.6*tex)*(.55+.45*shade),disk);
    col+=moonCol*(pow(max(md,0.),260.)*.9+pow(max(md,0.),22.)*.22);
    col=mix(col,hor,smoothstep(.1,-.06,d.y));
    gl_FragColor=vec4(col,1.);}`;
  m.needsUpdate=true;
  POST.bu.thr.value=.78;
}
function atmos(dt,now){
  atmos_base(dt,now);if(!PSXON)return;const U=POST.u;
  const Z=ZPAL[(regionAt(Math.round(pl.position.x),Math.round(pl.position.z))+1)],k=Math.min(1,dt*1.2+.004);
  for(const q in ZCUR)ZCUR[q].lerp(Z[q],k);
  const C=ZCUR,day=ATM.day*.5,su=SKY.material.uniforms,lift=1+day*.6;
  su.top.value.copy(C.top).multiplyScalar(lift);su.hor.value.copy(C.hor).multiplyScalar(lift);su.c1.value.copy(C.n1).multiplyScalar(.8+.35*day);su.c2.value.copy(C.n2).multiplyScalar(.8+.35*day);su.moonCol.value.copy(C.moon);su.day.value=day;su.time.value=now/1000;
  // colored moonlight from the big moon (brighter during the "day" twilight)
  sun.color.copy(C.light);sun.intensity=1.15+.4*day;TMP.copy(MOOND);sun.position.set(pl.position.x+TMP.x*60,pl.position.y+TMP.y*60,pl.position.z+TMP.z*60);sun.target.position.copy(pl.position);
  hemi.color.copy(C.light).multiplyScalar(.75);hemi.groundColor.copy(C.mist).multiplyScalar(.55);hemi.intensity=.6+.25*day;
  // glowing colored mist
  scene.fog.color.copy(C.hor).lerp(C.mist,.6).multiplyScalar(.62+.35*day);scene.background=scene.fog.color;scene.fog.density=.0155;
  torch.color.setHex(0xffa070);torch.distance=13;torch.intensity=1.15+Math.sin(now/80)*.12+Math.random()*.06;
  // vivid, contrasty grade with colored shadows and highlights; strong bloom for glows
  U.sat.value=1.38;U.ex.value=.98;U.vig.value=1.3;U.grain.value=.022;U.bk.value=.7;U.rk.value=0;U.shT.value.copy(C.sh);U.hiT.value.copy(C.hi);
  [WTR.w,WTR.l].forEach(m=>{const u=m.material.uniforms;u.fogC.value.copy(scene.fog.color);u.fogD.value=scene.fog.density;u.hor.value.copy(su.hor.value);u.top.value.copy(su.top.value);u.sunDir.value.copy(MOOND);u.sunCol.value.copy(C.moon);u.amb.value=.55+.4*day});
}
// settings: visual style + optional retro pixel filter (applied after a reload, because shaders are built at start-up)
{const gh=[...document.querySelectorAll('.setg')].find(d=>d.textContent.trim()=='Graphics');
 if(gh){gh.insertAdjacentHTML('afterend',`<label class="setr"><span>Visual style</span><select id="s_psx"><option value="1">Dark fantasy</option><option value="0">Classic</option></select></label>
  <label class="setr"><span>Retro pixel filter</span><select id="s_psxr"><option value="0">Off</option><option value="480">480p · light</option><option value="360">360p · medium</option><option value="240">240p · heavy</option></select></label>
  <div id="s_psxn" class="mut hide" style="font-size:.72rem">Saved. <button id="s_psxGo" style="padding:2px 8px">Reload now</button> to apply (your game is saved first).</div>`);
  const a=$('s_psx'),b=$('s_psxr'),n=$('s_psxn');a.value=PSXON?'1':'0';b.value=String(PSXH||0);
  const ch=()=>{SET.psx=a.value=='1';SET.psxRes=+b.value;saveSet();n.classList.remove('hide')};a.onchange=ch;b.onchange=ch;
  $('s_psxGo').onclick=()=>{try{saveGame(true)}catch(_){}location.reload()}}}

