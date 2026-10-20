// ================= v103 kingdom (4/5): see the next evolution before you pay for it =================
// The Spells & Evolution tab of the Companions window shows a turning preview: the companion as it is now (left) and
// as it will look after the next evolution (right), built from a copy with evo + 1 (the v100 evolution looks read
// c.evo). Fully evolved companions show their final form alone. The preview uses the shared preview renderer (PV),
// so switching back to the Overview tab puts the normal preview back (kqmCApply already does that).
function evoPVKey103(c){return [cmpSel,c.n,c.g.join(),c.evo||0,c.cl.join(),c.shn?1:0,c.rv||''].join('|')}
function evoPVShow103(force){const host=$('evoPV');if(!host||!host.offsetParent)return;const c=party[cmpSel];if(!c)return;const key=evoPVKey103(c);
  if(!force&&host.dataset.k===key&&PV.cv&&PV.cv.parentNode===host&&PV.run)return;host.dataset.k=key;
  const e=c.evo||0,pv=new THREE.Group(),mk=(cc,x,sz)=>{const m=cr(cc),inner=new THREE.Group(),piv=new THREE.Group();inner.add(m);piv.add(inner);pvFit(inner,sz);piv.position.x=x;pv.add(piv);return [m,piv]};
  const L=[];
  if(e>=3)L.push(mk(c,0,1.7));
  else{const n=Object.assign({},c,{evo:e+1});L.push(mk(c,-1.2,1.5),mk(n,1.15,1.8));
    // a soft glow ring under the evolved form
    const r=new THREE.Mesh(new THREE.RingGeometry(.55,.72,24),new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.set(1.15,.02,0);pv.add(r);L.push([null,r])}
  pv.position.y=.12;
  pvShow(host,pv,now=>{L.forEach(([m,p],i)=>{if(!m){p.material.opacity=.32+.2*Math.sin(now/420);return}p.rotation.y=now/2200+(i?Math.PI*.15:0);if(m.rig)m.rig(now+i*900,false,0)})})}
{const f=rC0;rC0=function(){const r=f.apply(this,arguments);try{const c=party[cmpSel],cd=$('cd');if(!c||!cd)return r;const sp=cd.querySelector('.kqm-cpane[data-kqc="sp"]')||cd;
  const ev=sp.querySelector('.evo')||[...sp.querySelectorAll('.mut')].find(x=>/Fully evolved/.test(x.textContent));if(!ev||$('evoPV'))return r;const e=c.evo||0;
  const d=document.createElement('div');d.className='evopv';d.innerHTML=`<div id="evoPV" class="pvbox sm"></div><div class="evolab">${e>=3?'<span>Final form ✦✦✦</span>':`<span>Now${e?' · '+'✦'.repeat(e):''}</span><span class="evoar">➜</span><span>Stage ${e+1} · ${'✦'.repeat(e+1)}</span>`}</div>`;
  ev.parentNode.insertBefore(d,ev);setTimeout(()=>{try{evoPVShow103(true)}catch(_){}},0)}catch(err){console.warn('v103 evolve preview',err)}return r}}
{const f=kqmCApply;kqmCApply=function(){const r=f.apply(this,arguments);try{if(KQM.ctab=='sp')evoPVShow103()}catch(err){console.warn('v103 evolve preview',err)}return r}}
// after an evolution the preview shows the next step (rC rebuilds the window)
document.head.insertAdjacentHTML('beforeend',`<style>
#cmp .evopv{margin:4px 0 8px}#cmp #evoPV.pvbox.sm{height:190px;width:100%;margin:0;background:radial-gradient(ellipse at 74% 58%,rgba(240,204,114,.22),transparent 45%),radial-gradient(circle at 50% 42%,#2b3a52,#120e0b 78%)}
#cmp .evolab{display:flex;justify-content:space-around;align-items:center;font-size:.72rem;color:var(--mut);margin-top:3px}#cmp .evolab span:last-child{color:#f0cc72;font-weight:700}#cmp .evoar{color:#f0cc72;font-size:1rem}
</style>`);
