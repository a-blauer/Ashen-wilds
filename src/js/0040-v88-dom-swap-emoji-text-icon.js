// ---------------- DOM: swap emoji in text for icon spans ----------------
var KQ_CSS=(function(){const st=document.createElement('style');st.id='kqiCss';
  st.textContent=`.kqi{display:inline-block;position:relative;width:1.18em;height:1.18em;vertical-align:-.24em;overflow:hidden;text-indent:300%;white-space:nowrap;font-style:normal;line-height:1;flex:none;pointer-events:none;color:transparent}
.kqi::before,.kqi::after{content:'';position:absolute;inset:0;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat}
.kqi::before{background:rgba(10,6,2,.85);transform:translateY(.07em) scale(1.06)}
.kqi::after{background:linear-gradient(180deg,var(--ta,#f4ead2),var(--tb,#b8a27c))}
.kqi.kq-ink::after{background:currentColor}
`+Object.entries(KQT).map(([k,v])=>`.kt-${k}{--ta:${v[0]};--tb:${v[1]}}`).join('\n');
  (document.head||document.documentElement).appendChild(st);return st})();
var KQ_MADE={};
function kqUse(n){if(KQ_MADE[n])return;KQ_MADE[n]=1;KQIS.icons++;try{KQ_CSS.sheet.insertRule(`.kqi-${n}{--ic:${kqUrl(n)}}`,KQ_CSS.sheet.cssRules.length)}catch(e){}}
function kqStrip(s){return s.replace(KQ_RXG,m=>kqLook(m)?'':m).replace(/\s{2,}/g,' ').trim()}
const KQ_SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,TITLE:1,NOSCRIPT:1};
function kqText(t){
  const s=t.data;if(!KQ_RXT.test(s))return;const p=t.parentNode;if(!p||p.nodeType!=1||KQ_SKIP[p.nodeName])return;
  if(p.classList.contains('kqi'))return;
  if(p.nodeName=='OPTION'){const v=kqStrip(s);if(v!=s)t.data=v;return}
  if(p.namespaceURI!='http://www.w3.org/1999/xhtml')return;
  const sg=kqSegs(s);if(!sg)return;
  const f=document.createDocumentFragment();
  for(const q of sg){if(typeof q=='string'){f.appendChild(document.createTextNode(q));continue}
    // the emoji itself rides inside the span (hidden) so textContent/innerText stay exactly as the game wrote them
    kqUse(q[0]);const i=document.createElement('i');i.className='kqi kqi-'+q[0]+' kt-'+q[1];i.textContent=q[2];f.appendChild(i);KQIS.nodes++}
  p.replaceChild(f,t)}
function kqAttr(e){for(const a of ['title','placeholder','aria-label']){const v=e.getAttribute(a);if(v&&KQ_RXT.test(v)){const w=kqStrip(v);if(w!=v)e.setAttribute(a,w)}}}
function kqEl(e){
  if(e.nodeType==3)return kqText(e);if(e.nodeType!=1||KQ_SKIP[e.nodeName]||e.nodeName=='CANVAS')return;
  if(e.classList&&e.classList.contains('kqi'))return;
  if(e.hasAttribute('title')||e.hasAttribute('placeholder'))kqAttr(e);
  if(e.firstElementChild)for(const x of e.querySelectorAll('[title],[placeholder]'))kqAttr(x);
  if(e.nodeName=='INPUT')return;
  if(!KQ_RXT.test(e.textContent))return;
  const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),L=[];let n;while(n=w.nextNode())if(KQ_RXT.test(n.data))L.push(n);
  L.forEach(kqText)}
function kqRecs(recs){for(const r of recs){if(r.type=='characterData')kqText(r.target);else for(const n of r.addedNodes)if(n.isConnected)kqEl(n)}}
var KQ_MO=new MutationObserver(recs=>{const t0=performance.now();kqRecs(recs);KQ_MO.takeRecords();KQIS.t+=performance.now()-t0;KQIS.n++});
// Fast path: HTML strings handed to innerHTML / insertAdjacentHTML / textContent get their emoji turned into icon spans
// before the browser parses them (cached per string), so the HUD's 5×/s re-renders cost the observer nothing.
var KQ_HC=new Map();
const KQ_TAG=/<[!\/a-zA-Z](?:[^"'>]|"[^"]*"|'[^']*')*>/g,KQ_ATT=/(\s(?:title|placeholder|aria-label)\s*=\s*)("[^"]*"|'[^']*')/gi;
function kqHtml(v){
  let o=KQ_HC.get(v);if(o!==undefined)return o;const t0=performance.now();try{return o=kqHtml0(v)}finally{KQIS.t+=performance.now()-t0}}
function kqHtml0(v){let o;
  let mode=0;o='';let last=0;const T=t=>{if(!t)return;if(mode==2)o+=t;else if(mode==1)o+=kqStrip(t);else o+=t.replace(KQ_RXG,m=>{const r=kqLook(m);if(!r)return m;kqUse(r[0]);KQIS.nodes++;return '<i class="kqi kqi-'+r[0]+' kt-'+r[1]+'">'+m+'</i>'})};
  v.replace(KQ_TAG,(tag,off)=>{T(v.slice(last,off));last=off+tag.length;
    const nm=(/^<\/?([a-zA-Z0-9-]+)/.exec(tag)||[])[1],lo=nm&&nm.toLowerCase(),close=tag[1]=='/';
    if(lo=='option')mode=close?0:1;else if(lo=='script'||lo=='style'||lo=='textarea'||lo=='title'||lo=='svg')mode=close?0:2;
    o+=KQ_RXT.test(tag)?tag.replace(KQ_ATT,(m0,a,q)=>a+q[0]+kqStrip(q.slice(1,-1))+q[0]):tag;return tag});
  T(v.slice(last));
  if(KQ_HC.size>800)KQ_HC.clear();KQ_HC.set(v,o);return o}
(function(){
  const XH='http://www.w3.org/1999/xhtml',ok=e=>e.nodeType==1&&e.namespaceURI==XH&&!KQ_SKIP[e.nodeName]&&e.nodeName!='OPTION'&&e.nodeName!='SELECT';
  const run=(e,f)=>{let t0=performance.now();const pend=KQ_MO.takeRecords();if(pend.length)kqRecs(pend);KQIS.t+=performance.now()-t0;f();t0=performance.now();KQ_MO.takeRecords();KQIS.t+=performance.now()-t0;KQIS.fast=(KQIS.fast||0)+1};
  const ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  if(ih&&ih.set)Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:ih.enumerable,get:ih.get,set(v){
    if(typeof v!='string'||!KQ_RXT.test(v)||!ok(this))return ih.set.call(this,v);const e=this;run(e,()=>ih.set.call(e,kqHtml(v)))}});
  const ia=Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML=function(w,v){
    if(typeof v!='string'||!KQ_RXT.test(v))return ia.call(this,w,v);
    const p=(w=='beforebegin'||w=='afterend')?this.parentNode:this;if(!p||!ok(p))return ia.call(this,w,v);const e=this;let r;run(e,()=>{r=ia.call(e,w,kqHtml(v))});return r};
  const tc=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
  if(tc&&tc.set)Object.defineProperty(Node.prototype,'textContent',{configurable:true,enumerable:tc.enumerable,get:tc.get,set(v){
    if(typeof v!='string'||!KQ_RXT.test(v)||!ok(this)||!ih||!ih.set)return tc.set.call(this,v);
    const e=this;run(e,()=>ih.set.call(e,kqHtml(v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'))))}});
})();
(function(){const go=()=>{kqEl(document.body);KQ_MO.takeRecords();KQ_MO.observe(document.body,{childList:true,subtree:true,characterData:true})};
  if(document.body)go();else document.addEventListener('DOMContentLoaded',go)})();

const $=id=>document.getElementById(id),R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),V=(x,y,z)=>new THREE.Vector3(x,y,z);
