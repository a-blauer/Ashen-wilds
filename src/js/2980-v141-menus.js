// ================= v141: menus keep their scroll spot; the item detail panel stays compact =================
// Scroll: many windows rebuild their lists with innerHTML (levelling an ability rebuilds the whole Abilities list), which
// creates new scroll boxes that start at the top. Every scroll inside a window is remembered under a key (window, its mode,
// the box's id or class path); when a rebuild adds a box with the same key, it gets its old position back. Opening a window
// (or switching the #xw window to another mode) starts at the top as before. Explicit resets on boxes that stay in place
// (Fusion steps, picking another companion) are untouched.
var KS141={mem:{},on:true};
function ks141Win(el){for(const id of WINS){const w=$(id);if(w&&w.contains(el))return w}return null}
function ks141Key(el,w){if(!w)return null;let p=el,path=[];
  while(p&&p!==w){if(p.id){path.push('#'+p.id);break}const cl=(p.className&&typeof p.className=='string')?p.className.trim().split(/\s+/).filter(c=>!/^(on|sel|hide|open|active|hl|dis)$/.test(c)).sort().join('.'):'';
    let i=0,q=p;while((q=q.previousElementSibling))if(q.tagName===p.tagName&&q.className===p.className)i++;path.push(p.tagName+(cl?'.'+cl:'')+(i?':'+i:''));p=p.parentElement}
  return w.id+'|'+(w.id=='xw'&&typeof xwMode!='undefined'?xwMode:'')+'|'+path.reverse().join('>')}
document.addEventListener('scroll',e=>{const el=e.target;if(!el||el.nodeType!==1)return;const w=ks141Win(el);if(!w)return;const k=ks141Key(el,w);if(k)KS141.mem[k]=el.scrollTop},true);
function ks141Restore(root,w){const L=[root,...root.querySelectorAll('*')];for(const el of L){const k=ks141Key(el,w),v=k&&KS141.mem[k];if(!(v>0))continue;
  if(el.scrollHeight>el.clientHeight&&Math.abs(el.scrollTop-v)>1)el.scrollTop=v}}
WINS.forEach(id=>{const w=$(id);if(!w)return;let wasHidden=w.classList.contains('hide');
  new MutationObserver(recs=>{if(!KS141.on)return;
    // opened again: forget this window's old positions
    const hid=w.classList.contains('hide');if(wasHidden&&!hid){for(const k in KS141.mem)if(k.startsWith(id+'|'))delete KS141.mem[k]}wasHidden=hid;if(hid)return;
    const seen=new Set();recs.forEach(r=>{if(r.type!='childList')return;r.addedNodes.forEach(n=>{if(n.nodeType===1&&!seen.has(n)){seen.add(n);try{ks141Restore(n,w)}catch(_){}}});
      // a box whose children were all replaced keeps its own position (it can clamp to 0 while the new content lays out)
      if(r.target&&r.target.nodeType===1&&!seen.has(r.target)){seen.add(r.target);const k=ks141Key(r.target,w),v=k&&KS141.mem[k];if(v>0&&r.target.scrollTop<1)r.target.scrollTop=v}})
  }).observe(w,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})});
// the #xw window: a re-render in the same mode keeps the body's position (switching mode starts at the top)
{const f=rX;rX=function(){const B=$('xwB'),m=typeof xwMode!='undefined'?xwMode:'',t=B?B.scrollTop:0;const r=f.apply(this,arguments);
  try{if(B&&m===xwMode&&t>0&&B.scrollTop!==t)B.scrollTop=t}catch(_){}return r}}

// ---------------- item detail panel (inventory footer): one compact box ----------------
// The unique / legendary / set blocks were appended as siblings of the details in a non-wrapping flex row, so the details
// shrank to one word per line and the extra lines ran across the whole screen. Now the panel wraps: the details take the
// full width in two columns of stats, the buttons sit under them, and the extra blocks follow at full width, capped in height.
document.head.insertAdjacentHTML('beforeend',`<style id="idt141">
#bag #idt{flex-wrap:wrap;align-items:flex-start;gap:6px 10px;max-height:min(42vh,330px);overflow:auto}
#bag #idt>.dtl{flex:1 1 100%;min-width:0}
#bag #idt>.dtl .dfs{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1px 14px}
#bag #idt>.dtl .dfs>*{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bag #idt>div:not(.dtl){flex:0 1 auto;max-width:100%}
#bag #idt>.kqm-tx,#bag #idt>.kqm-ts,#bag #idt>.lpbox,#bag #idt>.setbox{flex:1 1 100%;margin:0}
#bag #idt>.kqm-ts{font-size:.72rem;opacity:.8}
#bag #idt .wsrow{display:flex;flex-wrap:wrap;gap:6px}#bag #idt .wsrow>*{flex:0 1 auto}
</style>`);
