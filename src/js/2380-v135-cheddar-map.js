// ================= v135: Cheddar on the minimap and the local map (N) =================
// He stands in front of the arrival spot of every field instance and Den (chqSpot132) and, in field instances, a few steps
// before the gateway at the end of the road (chqSpotEnd135). A small gold mouse-ear mark shows each; it carries a "!" (a quest
// to accept) or "?" (one ready to turn in) like the sprite over his head.
function chq135Here(){try{const I=chqHere132();if(!I)return [];const L=[];chqPosts135().forEach(P=>{if(!P.ch||!P.ch.root.visible)return;const s=chqPSpot135(P,I);if(s)L.push({I,s})});return L}catch(_){return []}}
function chq135Mark(g,x,y,k,st){g.save();g.translate(x,y);g.scale(k,k);
  // two round ears and a head, gold with a dark rim
  g.fillStyle='#f4c542';g.strokeStyle='#2a1a06';g.lineWidth=1.4/k;
  [[-3.6,-3.4,2.6],[3.6,-3.4,2.6],[0,0,4.2]].forEach(([a,b,r])=>{g.beginPath();g.arc(a,b,r,0,6.28);g.fill();g.stroke()});
  g.fillStyle='#ffd9e0';[[-3.6,-3.4],[3.6,-3.4]].forEach(([a,b])=>{g.beginPath();g.arc(a,b,1.2,0,6.28);g.fill()});
  if(st){g.font='900 9px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=2.5/k;g.strokeStyle='#1a0f06';g.strokeText(st,0,.6);g.fillStyle='#fff2b0';g.fillText(st,0,.6)}
  g.restore()}
function chq135St(I){try{const S=chqState132(I);return S.rd?'?':S.av?'!':''}catch(_){return ''}}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{chq135Here().forEach(H_=>{
  const s=H_.s,x=(s.x-(cx-vw/2)+.5)*w/vw,y=(s.z-(cy-vh/2)+.5)*h/vh;if(x<-6||y<-6||x>w+6||y>h+6)return;chq135Mark(mmX,x,y,1,chq135St(H_.I))})}catch(_){}}}
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{chq135Here().forEach(H_=>{const I=H_.I,s=H_.s,c=$('wmc'),g=c.getContext('2d');
  const k=Math.min(1060/I.w,640/I.h),x=(s.x-I.x0+.5)*k,y=(s.z-I.y0+.5)*k;chq135Mark(g,x,y,1.7,chq135St(I));
  g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText('Cheddar',x,y-17);g.fillStyle='#ffe08a';g.fillText('Cheddar',x,y-17)})}catch(e){console.warn('v135 cheddar wmap',e)}return r0}}
