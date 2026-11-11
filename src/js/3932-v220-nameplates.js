// ================= v220 nameplates: carved plaques that always fit the name =================
// Owner (Nov 11 2026): "rework the nameplates for our npcs - right now they sometimes get cut off (like the stronghold upgrade
// npc). Give cleaner looking nameplates that are stylized."
// Why they were cut: the old plates (txTex, 0070) drew a fixed 30 px font on a fixed 256 px canvas and never measured the text,
// so "Stronghold Steward", "Wandering Merchant", "Odile · Race Dealer" and long co-op names ran off both ends.
// Now every plate is painted by np220Paint: the text is measured first and the canvas (and the sprite) grow to fit it.
// Look: a dark plaque with pointed ends, a thin gold rim with an inner line, a gem at each tip, the name in Cinzel. A label
// written "Name · Role" becomes two lines (name, then the role small and spaced). Plates repaint once the web font has loaded.
// Used by: town folk / keepers / the Steward (npc), citizens (czModel103), the Warden-Captain (mq143Label) and co-op partners
// (mpTagDraw: name, level and the health bar). Co-op: plates are built on each screen from data both already have.
var NP220={all:[],S:2,pal:{
  gold:{b0:'rgba(34,26,18,.9)',b1:'rgba(10,8,7,.9)',ln:'#c9a24a',in:'rgba(232,195,106,.32)',fg0:'#fff3d2',fg1:'#e2c88c',sub:'#c9a86a',gem:'#f0d48a'},
  folk:{b0:'rgba(28,24,20,.82)',b1:'rgba(10,9,8,.82)',ln:'#9a8458',in:'rgba(200,180,130,.22)',fg0:'#f4ead0',fg1:'#d8c8a0',sub:'#b09a6c',gem:'#c9b078'},
  green:{b0:'rgba(18,30,20,.9)',b1:'rgba(6,12,8,.9)',ln:'#a8c860',in:'rgba(200,230,130,.3)',fg0:'#f2ffc8',fg1:'#cfe890',sub:'#a8c860',gem:'#d8f08a'},
  blue:{b0:'rgba(16,26,38,.9)',b1:'rgba(6,10,16,.9)',ln:'#6ab8e0',in:'rgba(140,210,255,.3)',fg0:'#eaf8ff',fg1:'#a8dcf8',sub:'#8ac8e8',gem:'#b8e8ff'}}};
function np220Wide(g,t,gap){let w=0;for(const ch of t)w+=g.measureText(ch).width+gap;return Math.max(0,w-gap)}
function np220Spaced(g,t,cx,y,gap){let x=cx-np220Wide(g,t,gap)/2;g.textAlign='left';for(const ch of t){g.fillText(ch,x,y);x+=g.measureText(ch).width+gap}g.textAlign='center'}
function np220Split(t){t=String(t==null?'':t);const i=t.indexOf(' · ');return i>0?[t.slice(0,i),t.slice(i+3)]:[t,'']}
// paint a plate onto canvas c; returns [width,height] in plate units (canvas px / S)
function np220Paint(c,name,sub,P,hp){const S=NP220.S,F1='700 '+30*S+'px Cinzel,"Trajan Pro",Georgia,"Times New Roman",serif',F2='600 '+15*S+'px Cinzel,Georgia,"Times New Roman",serif';
  let g=c.getContext('2d');name=String(name||'');sub=String(sub||'').toUpperCase();const gap=2.2*S;
  g.font=F1;const w1=g.measureText(name).width;g.font=F2;const w2=sub?np220Wide(g,sub,gap):0;
  const tip=20*S,m=3*S,pad=30*S,hasHp=hp!=null,H=(sub?68:46)*S+(hasHp?12*S:0),W=Math.ceil(Math.max(w1,w2,hasHp?150*S:0)+pad*2);
  c.width=W;c.height=H;g=c.getContext('2d');
  const poly=d=>{g.beginPath();g.moveTo(tip+d*.4,m+d);g.lineTo(W-tip-d*.4,m+d);g.lineTo(W-m-d*1.5,H/2);g.lineTo(W-tip-d*.4,H-m-d);g.lineTo(tip+d*.4,H-m-d);g.lineTo(m+d*1.5,H/2);g.closePath()};
  const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,P.b0);bg.addColorStop(1,P.b1);poly(0);g.fillStyle=bg;g.fill();
  g.lineJoin='miter';g.strokeStyle=P.ln;g.lineWidth=2*S;g.stroke();poly(4.5*S);g.strokeStyle=P.in;g.lineWidth=1*S;g.stroke();
  // a gem at each tip
  [m+11*S,W-m-11*S].forEach(x=>{g.save();g.translate(x,H/2);g.rotate(Math.PI/4);g.fillStyle=P.gem;g.fillRect(-3*S,-3*S,6*S,6*S);g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=S;g.strokeRect(-3*S,-3*S,6*S,6*S);g.restore()});
  g.textAlign='center';g.textBaseline='middle';const y1=(sub?26:24)*S;
  g.font=F1;g.shadowColor='rgba(0,0,0,.9)';g.shadowBlur=4*S;g.shadowOffsetY=1.5*S;
  const fg=g.createLinearGradient(0,y1-16*S,0,y1+16*S);fg.addColorStop(0,P.fg0);fg.addColorStop(1,P.fg1);g.fillStyle=fg;g.fillText(name,W/2,y1);
  if(sub){g.shadowBlur=2*S;g.font=F2;g.fillStyle=P.sub;np220Spaced(g,sub,W/2,53*S,gap);
    g.shadowColor='transparent';const lw=Math.min(W/2-tip-8*S,Math.max(w1,w2)/2),ln=g.createLinearGradient(W/2-lw,0,W/2+lw,0);ln.addColorStop(0,'rgba(0,0,0,0)');ln.addColorStop(.5,P.ln);ln.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=ln;g.globalAlpha=.7;g.fillRect(W/2-lw,43*S,lw*2,S);g.globalAlpha=1}
  g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  if(hasHp){const bw=Math.min(W-tip*2-16*S,190*S),bx=(W-bw)/2,by=H-m-15*S,k=Math.max(0,Math.min(100,hp|0))/100;
    g.fillStyle='rgba(0,0,0,.75)';g.fillRect(bx,by,bw,7*S);g.fillStyle=hp>35?'#4ade80':'#f87171';g.fillRect(bx+S,by+S,(bw-2*S)*k,5*S)}
  return [W/S,H/S]}
// put a plate on a sprite (makes or reuses its canvas texture) and size the sprite to it; k = world units per plate unit
function np220Set(sp,text,pal,k,hp){const P=NP220.pal[pal]||NP220.pal.gold,[name,sub]=Array.isArray(text)?text:np220Split(text);
  let c=sp.userData.np220c;if(!c){c=sp.userData.np220c=document.createElement('canvas');const old=sp.material.map,t=new THREE.CanvasTexture(c);t.anisotropy=4;sp.material.map=t;try{if(old)old.dispose()}catch(_){}
    sp.material.transparent=true;sp.material.depthWrite=false;NP220.all.push(sp);if(NP220.all.length>240)NP220.all=NP220.all.filter(s=>s.parent)}
  const [w,h]=np220Paint(c,name,sub,P,hp);sp.material.map.needsUpdate=true;sp.material.needsUpdate=true;sp.scale.set(w*k,h*k,1);sp.userData.np220={text:[name,sub],pal,k,hp};return sp}
function np220Sprite(text,pal,k){const sp=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false}));return np220Set(sp,text,pal,k)}
function np220Repaint(){NP220.all=NP220.all.filter(s=>s.parent);NP220.all.forEach(sp=>{const d=sp.userData.np220;if(d)try{np220Set(sp,d.text,d.pal,d.k,d.hp)}catch(_){}})}
try{document.fonts.load('700 60px Cinzel').then(()=>document.fonts.load('600 30px Cinzel')).then(np220Repaint).catch(()=>{})}catch(_){}
// town folk, shopkeepers, the Steward, dealers
{const f=npc;npc=function(p,x,z,o){const g=f.apply(this,arguments);try{const sp=g.children.find(c=>c.isSprite);if(sp&&o&&o.label){np220Set(sp,o.label,'gold',.0066);sp.position.y=1.9+sp.scale.y/2}}catch(e){console.warn('v220 plate',e)}return g};npc.all=f.all}
// citizens: a smaller, quieter plate
{const f=czModel103;czModel103=function(c){const g=f.apply(this,arguments);try{const sp=g.userData.lab;if(sp){const ro=czRole104(c);np220Set(sp,[c.n,ro!='gather'?CZR104[ro].n:''],'folk',.0052);sp.position.y=1.9+sp.scale.y/2}}catch(e){console.warn('v220 plate',e)}return g}}
// the Warden-Captain
mq143Label=function(t){return np220Sprite(t,'green',.0066)};
// co-op partners: name, level, health
mpTagDraw=function(r){const pr=r.pr,key=(pr.n||'')+'|'+pr.lv+'|'+pr.hp;if(key===r.tk)return;r.tk=key;if(!r.tag)return;
  np220Set(r.tag,[String(pr.n||'Adventurer').slice(0,20),'Lv '+(pr.lv|0)],'blue',.0068,pr.hp|0)};
// plates made before this file loaded (the town is built while the script loads)
function np220Sweep(){try{scene.traverse(g=>{const o=g.userData&&g.userData.npcO;if(!o||!o.label)return;const sp=g.children.find(c=>c.isSprite&&!c.userData.np220);if(sp){np220Set(sp,o.label,'gold',.0066);sp.position.y=1.9+sp.scale.y/2}})}catch(e){console.warn('v220 plates',e)}}
np220Sweep();
