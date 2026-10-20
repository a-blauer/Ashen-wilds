// ================= Valheim-style atmosphere: sky dome, day/night, post-processing =================
const DAYLEN=900;let camK=.3,TOD=.1,camYaw=0,camPitch=.3,camDist=9.5;
const ATM={night:0,day:1,gold:0,sd:new THREE.Vector3(.5,.5,-.4),sc:new THREE.Color(),sunU:new THREE.Vector2(.5,.5),sunVis:0};
const SKY=(()=>{
  const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,uniforms:{top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3()},sunCol:{value:new THREE.Color()},night:{value:0},time:{value:0},cloud:{value:.55}},
  vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec3 vD;uniform vec3 top,hor,sunDir,sunCol;uniform float night,time,cloud;
  float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(7.1,3.3);a*=.5;}return s;}
  void main(){vec3 d=normalize(vD);float y=max(d.y,0.);
    vec3 col=mix(hor,top,pow(y,.55));
    float sd=max(dot(d,sunDir),0.);
    col+=sunCol*(pow(sd,900.)*18.+pow(sd,60.)*.55+pow(sd,6.)*.22)*(1.-night*.9);
    vec3 md=-sunDir;float mdt=max(dot(d,md),0.);col+=vec3(.75,.82,1.)*(smoothstep(.9986,.9992,mdt)*2.2+pow(mdt,40.)*.12)*night;
    if(d.y>0.){vec2 p=d.xz/(d.y+.16)*1.25+vec2(time*.012,time*.004);float c=fbm(p*1.1);c=smoothstep(.5-cloud*.18,.82,c)*smoothstep(0.,.22,d.y);
      vec3 cl=mix(vec3(.62,.66,.74),vec3(1.),smoothstep(.45,.75,fbm(p*1.1+3.)))*(1.-night*.85);
      cl=mix(cl,sunCol*1.15+hor*.25,pow(sd,3.)*.8*(1.-night));cl*=.85+.15*fbm(p*3.);
      col=mix(col,cl,c*.9);
      float st=step(.9965,hs(floor(d.xz/(d.y+.3)*260.)))*night*smoothstep(.1,.4,d.y);col+=vec3(st)*.9;}
    col=mix(col,hor,smoothstep(.0,-.12,d.y)*.9+smoothstep(.12,0.,d.y)*.0);
    gl_FragColor=vec4(col,1.);}`});
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(150,32,16),m);mesh.frustumCulled=false;mesh.renderOrder=-10;scene.add(mesh);return mesh})();
const CK={topN:new THREE.Color(.015,.025,.07),topD:new THREE.Color(.2,.4,.72),topG:new THREE.Color(.25,.3,.52),horN:new THREE.Color(.04,.06,.11),horD:new THREE.Color(.66,.76,.86),horG:new THREE.Color(1,.6,.36),scL:new THREE.Color(1,.5,.22),scH:new THREE.Color(1,.93,.8),hyN:new THREE.Color(.1,.13,.28),hyD:new THREE.Color(.62,.74,.94),hyG:new THREE.Color(.78,.62,.6),gN:new THREE.Color(.1,.09,.1),gD:new THREE.Color(.34,.28,.19)};

