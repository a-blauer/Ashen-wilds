// ================= v89 (gear track): vampire standing collar =================
// The old dkHighCollar fanned a row of boxes out to one side. This one is a proper high, stiff standing collar:
// two mirrored curved panels rise from the shoulders behind the neck, wrap round both sides, flare outward at the top
// and stay open at the front. Red inner face, near-black outer face, a trim along the edges and stiffening ribs.
// It rides the chest bone (so it follows the torso in every walk/attack) and keeps clear of the head and hair.
var V89CG;
function v89CollarGeo(big){V89CG=V89CG||{};const K=big?'b':'s';if(V89CG[K])return V89CG[K];
  const H=big?.35:.27,y0=.955,zc=-.022,rx0=.152,rz0=.142,FX=big?.085:.07,FZ=big?.1:.082,TH=.016,NA=14,NT=5,AM=128*Math.PI/180;
  // top-edge height (fraction of H) along the half-collar: a dip where the halves meet at the back, a peak behind the ear, sloping to a low front lapel
  const HP=[[0,.8],[22,.9],[50,1],[60,.93],[88,.62],[128,.3]];
  const hAt=a=>{a=a*180/Math.PI;for(let i=1;i<HP.length;i++)if(a<=HP[i][0]){const p=HP[i-1],q=HP[i],t=(a-p[0])/(q[0]-p[0]);return p[1]+(q[1]-p[1])*t}return HP[HP.length-1][1]};
  const pt=(s,a,y,off)=>{const f=Math.pow(Math.max(0,y)/H,1.45),rx=rx0+FX*f+off,rz=rz0+FZ*f+off;return [s*Math.sin(a)*rx,y0+y,zc-Math.cos(a)*rz]};
  const mk=()=>({P:[],I:[]}),add=(o,v)=>{o.P.push(v[0],v[1],v[2]);return o.P.length/3-1},quad=(o,a,b,c,d)=>o.I.push(a,b,c,a,c,d);
  const inner=mk(),outer=mk(),rim=mk(),rib=mk();
  [-1,1].forEach(s=>{
    [[inner,0],[outer,TH]].forEach(([o,off])=>{const b=o.P.length/3;
      for(let i=0;i<=NA;i++){const a=i/NA*AM,h=H*hAt(a);for(let j=0;j<=NT;j++)add(o,pt(s,a,h*j/NT,off))}
      for(let i=0;i<NA;i++)for(let j=0;j<NT;j++){const p=b+i*(NT+1)+j;quad(o,p,p+NT+1,p+NT+2,p+1)}});
    // edge trim: the top edge and the front edge, wrapped over the thickness so it reads as a stiff rolled edge
    const E=[];for(let i=0;i<=NA;i++){const a=i/NA*AM;E.push([a,H*hAt(a)])}
    for(let i=0;i<NA;i++){const [a1,h1]=E[i],[a2,h2]=E[i+1],q=[pt(s,a1,h1-.012,-.004),pt(s,a1,h1+.006,TH*.5),pt(s,a1,h1-.012,TH+.004)],w=[pt(s,a2,h2-.012,-.004),pt(s,a2,h2+.006,TH*.5),pt(s,a2,h2-.012,TH+.004)];
      for(let k=0;k<2;k++){const A=add(rim,q[k]),B=add(rim,w[k]),C=add(rim,w[k+1]),D=add(rim,q[k+1]);quad(rim,A,B,C,D)}}
    const hf=H*hAt(AM);for(let j=0;j<4;j++){const y1=hf*j/4,y2=hf*(j+1)/4,a=AM+.04,q=[pt(s,a,y1,-.004),pt(s,a+.05,y1,TH*.5),pt(s,a,y1,TH+.004)],w=[pt(s,a,y2,-.004),pt(s,a+.05,y2,TH*.5),pt(s,a,y2,TH+.004)];
      for(let k=0;k<2;k++){const A=add(rim,q[k]),B=add(rim,w[k]),C=add(rim,w[k+1]),D=add(rim,q[k+1]);quad(rim,A,B,C,D)}}
    // stiffening ribs fanning up the red inner face
    [16,40,64,92].forEach(d=>{const a=d*Math.PI/180,h=H*hAt(a)*.9,w=.009;
      for(let j=0;j<5;j++){const y1=h*(.08+j*.18),y2=h*(.08+(j+1)*.18),A=add(rib,pt(s,a-w,y1,-.005)),B=add(rib,pt(s,a+w,y1,-.005)),C=add(rib,pt(s,a+w,y2,-.005)),D=add(rib,pt(s,a-w,y2,-.005));quad(rib,A,B,C,D)}})});
  const geo=o=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(o.P,3));g.setIndex(o.I);g.computeVertexNormals();return g};
  return V89CG[K]={inner:geo(inner),outer:geo(outer),rim:geo(rim),rib:geo(rib)}}
function dkHighCollar(k,col,big){const G=v89CollarGeo(big),gold=0x9a7a30;
  k.p('chest',G.inner,'c',dkShade(col,1.55),0,0,0,1,1,1);k.p('chest',G.outer,'c',0x14070a,0,0,0,1,1,1);
  k.p('chest',G.rib,'c',dkShade(col,.9),0,0,0,1,1,1);k.p('chest',G.rim,big?'m':'c',big?gold:dkShade(col,1.05),0,0,0,1,1,1)}

