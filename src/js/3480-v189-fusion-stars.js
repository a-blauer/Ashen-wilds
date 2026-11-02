// v189 fusion stars (owner, Nov 2 2026): "When a companion is fused the first time it gets a bronze star next to its name
// both in the menus and when its in-game. A 2nd fuse gives a crest around the bronze star. And 3rd fuse gives a crest and
// border around the bronze star. From 4 to 6 … silver star. 7 through 9 is a gold star, 10 through 12 is a diamond star.
// At 13, the companion will gain an additional star and it will start at bronze."
// One star holds 12 fusions: fusions 1–3 bronze, 4–6 silver, 7–9 gold, 10–12 diamond; within each three the 1st is a plain
// star, the 2nd adds a crest (a laurel wreath), the 3rd a crest and a border ring. Full stars come first, the growing one
// last. Drawn as small inline SVG (no ids, so any number of them can sit on one page), next to the name wherever nm() is
// used, in the HUD companion bars (the in-game name) and in the Fusion window.
var FS189={
  T:[{n:'Bronze',lo:'#6e3a16',hi:'#ffcf9a',mid:'#c27a3e',ed:'#2e1606',gl:'rgba(255,150,70,.35)'},
     {n:'Silver',lo:'#5a6470',hi:'#ffffff',mid:'#c4ccd6',ed:'#20262e',gl:'rgba(210,225,255,.4)'},
     {n:'Gold',lo:'#8a5a06',hi:'#fff1a0',mid:'#efbb2c',ed:'#3a2602',gl:'rgba(255,205,60,.5)'},
     {n:'Diamond',lo:'#2f7fb4',hi:'#ffffff',mid:'#a6ecff',ed:'#0e2c46',gl:'rgba(130,230,255,.6)'}],
  D:['star','star with crest','star with crest and border'],
  svg:{}};
// fusions so far (fz counts every Fuse / Siphon; fp and f are the older capped fields, kept for very old saves)
function fs189N(c){if(!c)return 0;return Math.max(c.fz|0,Math.floor(+c.fp||0),c.f|0,0)}
// the stars for n fusions: [{t: tier 0–3, d: 0 plain / 1 crest / 2 crest + border}, …]
function fs189List(n){const L=[];n=Math.max(0,n|0);while(n>0){const m=Math.min(12,n);L.push({t:Math.floor((m-1)/3),d:(m-1)%3});n-=m}return L}
function fs189Mix(a,b,t){const p=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),A=p(a),B=p(b);
  return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
// one star as SVG markup (viewBox -12 -12 24 24): a bevelled five-point star lit from the upper left
function fs189Svg(t,d){const k=t+'|'+d;if(FS189.svg[k])return FS189.svg[k];const T=FS189.T[t]||FS189.T[0],f=v=>v.toFixed(2);
  let s='';
  if(d>=2)s+=`<circle r="11" fill="none" stroke="${T.ed}" stroke-width="2.6"/><circle r="11" fill="none" stroke="${T.mid}" stroke-width="1.5"/>`+
    `<circle r="11.3" fill="none" stroke="${T.hi}" stroke-width=".45" stroke-dasharray="4 13.7" stroke-dashoffset="-2"/>`+
    [0,1,2,3].map(i=>{const a=i*Math.PI/2+Math.PI/4;return `<circle cx="${f(Math.cos(a)*11)}" cy="${f(Math.sin(a)*11)}" r="1.15" fill="${T.hi}" stroke="${T.ed}" stroke-width=".4"/>`}).join('');
  if(d>=1){// laurel crest: two sprigs rising from the bottom round both sides
    [-1,1].forEach(sd=>{s+=`<path d="M${f(sd*1.2)} 9.4 Q${f(sd*9.4)} 8.2 ${f(sd*9.1)} -4.4" fill="none" stroke="${T.ed}" stroke-width="1.1"/>`+
      `<path d="M${f(sd*1.2)} 9.4 Q${f(sd*9.4)} 8.2 ${f(sd*9.1)} -4.4" fill="none" stroke="${T.mid}" stroke-width=".55"/>`;
      for(let i=0;i<5;i++){const u=i/4,a=Math.PI/2+sd*(.35+u*1.75),r=8.9+Math.sin(u*Math.PI)*.3,x=Math.cos(a)*r,y=Math.sin(a)*r,
        rot=(a*180/Math.PI)+(sd>0?-55:55)+90,c=i%2?T.mid:fs189Mix(T.mid,T.hi,.45);
        s+=`<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.05" ry=".95" transform="rotate(${f(rot)} ${f(x)} ${f(y)})" fill="${c}" stroke="${T.ed}" stroke-width=".45"/>`}})}
  const R=d>=1?7.1:8.8,ri=R*.45,P=[],L=[-.55,-.83];
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?ri:R;P.push([Math.cos(a)*r,Math.sin(a)*r])}
  s+=`<polygon points="${P.map(p=>f(p[0])+','+f(p[1])).join(' ')}" fill="${T.mid}" stroke="${T.ed}" stroke-width="1.5" stroke-linejoin="round"/>`;
  for(let i=0;i<10;i++){const A=P[i],B=P[(i+1)%10],cx=(A[0]+B[0])/3,cy=(A[1]+B[1])/3,l=Math.hypot(cx,cy)||1,
    // facet normal leans toward its edge midpoint: lit when that faces the light
    w=Math.max(0,Math.min(1,.5+((cx/l)*L[0]+(cy/l)*L[1])*.62)),c=fs189Mix(T.lo,T.hi,w);
    s+=`<polygon points="0,0 ${f(A[0])},${f(A[1])} ${f(B[0])},${f(B[1])}" fill="${c}"/>`}
  s+=`<polygon points="${P.map(p=>f(p[0])+','+f(p[1])).join(' ')}" fill="none" stroke="${T.ed}" stroke-width=".7" stroke-linejoin="round"/>`;
  if(t==3)s+=`<path d="M${f(R*.55)} ${f(-R*.95)} l.55 1.5 1.5 .55 -1.5 .55 -.55 1.5 -.55 -1.5 -1.5 -.55 1.5 -.55z" fill="#fff"/>`;   // a diamond's glint
  return FS189.svg[k]=`<svg viewBox="-12 -12 24 24" aria-hidden="true">${s}</svg>`}
function fs189Title(n){const L=fs189List(n),last=L[L.length-1];if(!last)return '';
  return n+' fusion'+(n==1?'':'s')+' · '+(L.length>1?(L.length-1)+' full star'+(L.length>2?'s':'')+' + ':'')+FS189.T[last.t].n+' '+FS189.D[last.d]}
// the badge HTML for a companion (or a fusion count): '' when never fused
function fs189Html(c){const n=typeof c=='number'?c:fs189N(c);if(n<=0)return '';
  return `<span class="fs189" title="${fs189Title(n)}">`+fs189List(n).map(s=>`<i class="fs189-s t${s.t} d${s.d}">${fs189Svg(s.t,s.d)}</i>`).join('')+'</span>'}
// the Fusion window's star spots (rows, the chosen companion, the preview) use the same badge
FSM100_stars=function(c){return fs189Html(c)};
{const f=FSM100_helpHTML;FSM100_helpHTML=function(){return f.apply(this,arguments).replace(/<dt>Stars ★<\/dt><dd>[^<]*<\/dd>/,
  `<dt>Stars ${fs189Html(1)}</dt><dd>Each Fuse or Siphon adds to the companion's star: the 1st gives a bronze star, the 2nd a crest round it, the 3rd a crest and border. Fusions 4–6 do the same in silver, 7–9 in gold and 10–12 in diamond (${fs189Html(12)}); the 13th starts a second star at bronze. Stars make it a little bigger; they add no stats by themselves.</dd>`)}}
{const st=document.createElement('style');st.textContent=`
.fs189{display:inline-flex;align-items:center;gap:0;vertical-align:-.28em;margin-left:.22em;line-height:1;white-space:nowrap}
.fs189-s{display:inline-block;width:1.3em;height:1.3em;font-style:normal}
.fs189-s+.fs189-s{margin-left:-.08em}
.fs189-s svg{width:100%;height:100%;display:block;overflow:visible}
.fs189-s.t2 svg{filter:drop-shadow(0 0 2px rgba(255,205,60,.55))}
.fs189-s.t3 svg{filter:drop-shadow(0 0 2.5px rgba(130,230,255,.75));animation:fs189tw 2.6s ease-in-out infinite}
.cnm:has(.fs189){display:flex;align-items:center;min-width:0}
.cnm .cnm-n{overflow:hidden;text-overflow:ellipsis;min-width:4.6em;flex:0 1 auto}
.cnm .fs189{flex:none;margin-left:.2em}.cnm .fs189-s{width:1.15em;height:1.15em}
.cnm small{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}
@keyframes fs189tw{0%,100%{filter:drop-shadow(0 0 2px rgba(130,230,255,.55))}50%{filter:drop-shadow(0 0 4px rgba(170,240,255,.95))}}
`;document.head.appendChild(st)}
