// ================= v68: local map · new fishing game =================
// ---------- the map (N) shows only the area you are in ----------
function openWMap(){
  const c=$('wmc'),r=curMap(),I=curIns(),T=TOWNS[0];let x0,y0,w,h,title,sub; // v106: the instance you are in
  if(r>=0){const p=PMAP[r];x0=I.x0;y0=I.y0;w=I.w;h=I.h;title=I.n;sub=(p.sub||'')+(I.fld?' · '+rpTxt138(I.lv[0]):'')}
  else{x0=T.cx-60;y0=T.cy-30;w=120;h=TWN100_PG[TWN100_PG.length-1].y+16-y0;title='Duskhold';sub='Grand Square · Portal Road: I → VI'}
  const s=Math.min(1060/w,640/h);c.width=Math.round(w*s);c.height=Math.round(h*s);const g=c.getContext('2d');
  g.imageSmoothingEnabled=false;g.fillStyle='#0a0d12';g.fillRect(0,0,c.width,c.height);g.drawImage(mmB,x0,y0,w,h,0,0,w*s,h*s);
  const P=(x,z)=>[(x-x0+.5)*s,(z-y0+.5)*s],inV=(x,z)=>x>=x0&&x<x0+w&&z>=y0&&z<y0+h;g.textAlign='center';g.textBaseline='middle';
  const lab=(t,x,y,col)=>{g.font='700 12px system-ui,sans-serif';const hw=g.measureText(t).width/2+4;x=Math.max(hw,Math.min(c.width-hw,x));g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(t,x,y);g.fillStyle=col||'#fff3c8';g.fillText(t,x,y)};
  const dia=(x,y,col,sz)=>{sz=sz||7;g.fillStyle=col;g.beginPath();g.moveTo(x,y-sz);g.lineTo(x+sz*.85,y);g.lineTo(x,y+sz);g.lineTo(x-sz*.85,y);g.fill();g.strokeStyle='#000';g.lineWidth=1.2;g.stroke()};
  if(r>=0){const p=PMAP[r];
    CAMPS.forEach(C=>{if(C.ig!==I.g)return;const [x,y]=P(C.x,C.z),cl=campCleared(C);g.fillStyle=cl?'rgba(110,231,183,.35)':'rgba(239,68,68,.35)';g.beginPath();g.arc(x,y,(C.r||CAMP_R)*s*.55,0,6.28);g.fill();lab(cl?'⛺ cleared':'⛺ '+(C.th?C.th.n:'Camp'),x,y,cl?'#bfe8a0':'#ffc8c0')});
    if(!I.tri){const [x,y]=P(I.en[0],I.en[1]);g.fillStyle='#7ab8ff';g.beginPath();g.arc(x,y,6,0,6.28);g.fill();lab('Entrance',x,y+14,'#cfe3ff')}
    if(I.tri){const [x,y]=P(I.wa[0],I.wa[1]);dia(x,y,'#ff9a5a',9);lab('⚔️ Wave Trial',x,y+18,'#ffd8b0')}
    else if(!I.den){const [x,y]=P(I.ba[0],I.ba[1]);dia(x,y,'#9ad8ff',9);lab('🌀 '+p.ins[I.k+1].n,x,y+18,'#cfe3ff')}
    else{const [x,y]=P(p.ba[0],p.ba[1]),b=BOSSES[r];dia(x,y,bossDone.has(r)?'#6ee7b7':'#c084fc',9);lab('👑 '+(b?b.name:'Sovereign'),x,y+18)}
  }else{{const [x,y]=P(T.cx,T.cy);g.fillStyle='#fbbf24';g.fillRect(x-7,y-7,14,14);g.strokeStyle='#000';g.lineWidth=2;g.strokeRect(x-7,y-7,14,14);lab('Duskhold',x,y+20)}
    if(typeof TWN100_wmap=='function')TWN100_wmap(g,P,lab,s);}
  (typeof tmaps!='undefined'?tmaps:[]).forEach(m=>{if(!inV(m.x,m.z))return;const [x,y]=P(m.x,m.z);g.font='700 18px system-ui';g.fillStyle='#fbbf24';g.fillText('✕',x,y)});
  if(typeof MP!='undefined'&&MP.on)for(const k in MP.rh){const q=MP.rh[k];if(!q.pr||!inV(q.pr.x,q.pr.z))continue;const [x,y]=P(q.pr.x,q.pr.z);g.fillStyle='#60a5fa';g.beginPath();g.arc(x,y,5,0,6.28);g.fill();lab(String(q.pr.n||'').slice(0,14),x,y-12,'#cfe3ff')}
  {const [x,y]=P(pl.position.x,pl.position.z);g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(x,y,10,0,6.28);g.stroke();g.fillStyle='#4ade80';g.beginPath();g.arc(x,y,5,0,6.28);g.fill();g.strokeStyle='#000';g.lineWidth=1.5;g.stroke()}
  g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,c.width,40);g.font='700 16px system-ui,sans-serif';g.fillStyle='#f0e0b8';g.fillText(title.toUpperCase(),c.width/2,15);g.font='600 11px system-ui,sans-serif';g.fillStyle='#c9a45a';g.fillText(sub,c.width/2,31);
  g.textAlign='left';g.font='600 11px system-ui,sans-serif';g.fillStyle='rgba(0,0,0,.6)';g.fillRect(8,c.height-26,Math.min(c.width-16,430),20);g.fillStyle='#ddd';
  g.fillText(r>=0?'● you   '+(I.fld?'⛺ camp   ':'')+'◆ '+(I.den?'Sovereign':I.tri?'arena':'gateway')+'   ✕ treasure'+(typeof MP!='undefined'&&MP.on?'   🔵 ally':''):'● you   ■ town   🌀 portals',16,c.height-16);
  $('wmap').classList.remove('hide')}

// ---------- fishing: false nibbles, a quick strike, then a timing dial fight ----------
document.head.insertAdjacentHTML('beforeend',`<style>
#fishui{width:300px;min-width:300px;max-width:300px;box-sizing:border-box}#fsDial{width:170px;height:170px;display:block;margin:0 auto}#fsInfo{display:flex;gap:10px;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;height:20px;white-space:nowrap}
#fsT{height:2.7em;display:flex;align-items:center;justify-content:center;overflow:hidden;line-height:1.3}#fsBar{width:100%}
#fsLine{letter-spacing:2px}#fsHits{color:#fbbf24;min-width:90px;text-align:right}#fsT.big{font-size:1.05rem;color:#ffd060}#fsPop{height:18px;line-height:18px;font-weight:800;font-size:.85rem;white-space:nowrap;overflow:hidden}
</style>`);
function fishUI(){let d=$('fishui');if(d&&d.dataset.v==2)return d;if(d)d.remove();d=document.createElement('div');d.id='fishui';d.className='glass hide';d.dataset.v=2;
  d.innerHTML='<div id="fsT">Waiting for a bite...</div><div id="fsBar" class="hide"><canvas id="fsDial" width="340" height="340"></canvas><div id="fsPop"></div><div id="fsInfo"><span id="fsHits"></span><span id="fsLine"></span></div></div><div class="fsBtns"><button id="fsHold" class="pri">🎣 Strike / Reel</button><button id="fsQuit">Stop</button></div>';
  $('stage').appendChild(d);$('fsHold').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fishPress(true)});
  $('fsQuit').onclick=()=>fishEnd('You reel in your line.');return d}
const FSH={need:[3,4,5,6],spd:[2.4,3.0,3.7,4.5],zone:[.95,.8,.66,.54],win:[.9,.75,.62,.5]};
function fishStart(w){if(fishing||riding)return;const ui=fishUI();fishing={w,ph:'wait',t:R(30,60)/10,nib:R(8,18)/10,bob:null,strikes:0};
  const b=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),sm(0xff4a3a));b.position.set(w[0],GH(w[0],w[1])+.05,w[1]);scene.add(b);fishing.bob=b;
  face(V(w[0]-pl.position.x,0,w[1]-pl.position.z).normalize());ui.classList.remove('hide');$('fsT').className='';$('fsT').textContent='Waiting... careful, nibbles aren’t bites!';$('fsBar').classList.add('hide');sfx('arrow')}
function fsDraw(){const F=fishing,c=$('fsDial');if(!F||!c)return;const g=c.getContext('2d'),W2=c.width,cx=W2/2,R0=W2*.4;g.clearRect(0,0,W2,W2);
  g.lineWidth=26;g.strokeStyle='rgba(20,40,60,.85)';g.beginPath();g.arc(cx,cx,R0,0,6.283);g.stroke();
  g.strokeStyle='#3fbf6a';g.beginPath();g.arc(cx,cx,R0,F.za-F.zw/2,F.za+F.zw/2);g.stroke();
  g.strokeStyle='#ffd24a';g.beginPath();g.arc(cx,cx,R0,F.za-F.zw/7,F.za+F.zw/7);g.stroke();
  const a=F.na;g.lineWidth=7;g.strokeStyle='#fff';g.beginPath();g.moveTo(cx+Math.cos(a)*R0*.35,cx+Math.sin(a)*R0*.35);g.lineTo(cx+Math.cos(a)*(R0+16),cx+Math.sin(a)*(R0+16));g.stroke();
  g.font='64px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(F.fish[1],cx,cx-4);
  g.fillStyle='rgba(0,0,0,.5)';g.fillRect(cx-60,cx+40,120,12);g.fillStyle='#4ade80';g.fillRect(cx-60,cx+40,120*Math.min(1,F.hits/F.need),12);
  $('fsHits').textContent='Reeled '+Math.min(F.hits,F.need)+' / '+F.need;$('fsLine').textContent='Line '+'🟢'.repeat(Math.max(0,3-F.miss))+'⚫'.repeat(Math.min(3,F.miss))}
function fsPop(t,col){const p=$('fsPop');if(!p)return;p.textContent=t;p.style.color=col;clearTimeout(p._t);p._t=setTimeout(()=>{if(p)p.textContent=''},650)}
function fsZone(F){F.za=Math.random()*6.283;F.zw=FSH.zone[F.fish[3]]*(1-.05*Math.min(3,F.hits))}
function fishTick(dt){const F=fishing;if(!F)return;
  if(d2(pl.position,V(F.w[0],0,F.w[1]))>4.5)return fishEnd('You walked away from the water.');
  const b=F.bob,y0=GH(F.w[0],F.w[1]);F.t-=dt;
  if(F.ph=='wait'){F.nib-=dt;let dip=0;if(F.nib<=0&&F.nib>-.35){dip=1;if(!F.nibS){F.nibS=1;burst(b.position,0xbfe8ff,4,.5,.5,.3)}}else if(F.nib<=-.35){F.nib=R(8,20)/10;F.nibS=0}
    b.position.y=y0+.05+Math.sin(nowP()/300)*.03-(dip?.06+Math.sin(nowP()/40)*.03:0);
    if(F.t<=0){F.ph='bite';F.fish=fishPick();F.t=FSH.win[F.fish[3]];$('fsT').textContent='❗ BITE! Strike now!';$('fsT').className='big';sfx('chime');burst(b.position,0xbfe8ff,14,1.2,1.2,.4)}}
  else if(F.ph=='bite'){b.position.y=y0-.12+Math.sin(nowP()/45)*.07;if(F.t<=0){F.strikes++;if(F.strikes>=2)return fishEnd('The fish got away. Try again!');F.ph='wait';F.t=R(20,40)/10;F.nib=R(6,14)/10;$('fsT').className='';$('fsT').textContent='Too slow — it let go. Wait for another bite...'}}
  else if(F.ph=='fight'){F.na+=F.dir*F.sp*dt;F.sp=FSH.spd[F.fish[3]]*(1+.12*F.hits)*(1+.25*Math.sin(nowP()/260*F.wob));b.position.y=y0-.1+Math.sin(nowP()/70)*.06;
    if(F.cd>0)F.cd-=dt;fsDraw()}}
function fishPress(down){const F=fishing;if(!F||!down)return;
  if(F.ph=='wait'){F.t+=R(15,25)/10;F.nib=R(10,20)/10;$('fsT').textContent='Too early! You spooked it — wait for the real bite.';fsPop('','#fff');sfx('blunt');return}
  if(F.ph=='bite'){F.ph='fight';F.hits=0;F.miss=0;F.need=FSH.need[F.fish[3]];F.na=-Math.PI/2;F.dir=1;F.sp=FSH.spd[F.fish[3]];F.wob=.6+Math.random()*.8;F.cd=0;fsZone(F);
    $('fsT').className='';$('fsT').textContent='Press F when the needle is in the green — gold is perfect!';$('fsBar').classList.remove('hide');fsDraw();sfx('arrow');return}
  if(F.ph!='fight'||F.cd>0)return;F.cd=.18;
  let d=((F.na-F.za)%6.283+6.283)%6.283;if(d>Math.PI)d-=6.283;d=Math.abs(d);
  if(d<=F.zw/7){F.hits+=2;fsPop('PERFECT!','#ffd24a');sfx('chime');burst(F.bob.position,0xffe08a,10,1,1,.4)}
  else if(d<=F.zw/2){F.hits++;fsPop('Good!','#7ee8a0');sfx('arrow')}
  else{F.miss++;fsPop('Miss — the line strains!','#ff8a7a');sfx('blunt');shake(.06);if(F.miss>=3){fsDraw();return fishEnd('The line snapped... the '+F.fish[0]+' escaped.')}}
  if(F.hits>=F.need){const flaw=!F.miss;FSHF=flaw;try{fishCatch()}finally{FSHF=false}if(flaw)say('🎣 Flawless catch! Better odds of treasure on the line.');return}
  if(Math.random()<.5)F.dir*=-1;fsZone(F);fsDraw()}
