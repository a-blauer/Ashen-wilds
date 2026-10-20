// Kill Quest animation viewer: runs BEFORE the game script.
// A virtual clock so the viewer can slow down, pause and step the game: performance.now, requestAnimationFrame and
// setTimeout all run on KVCLK.vt, which advances by (real frame time × speed) once per real frame.
window.AW_NOTITLE=1;window.KQV=1;
try{localStorage.clear()}catch(_){}
(function(){
  const rp=performance.now.bind(performance),rRAF=window.requestAnimationFrame.bind(window),rST=window.setTimeout.bind(window),rCT=window.clearTimeout.bind(window);
  const T=window.KVCLK={vt:rp(),speed:1,step:0,lastTs:null,q:[],id:1e7,frame:0,manual:false,cbs:[]};
  performance.now=()=>T.vt;
  window.setTimeout=function(fn,ms){if(typeof fn!=='function')return rST.apply(window,arguments);const a=[].slice.call(arguments,2),t={id:++T.id,due:T.vt+(+ms||0),fn,a};T.q.push(t);return t.id};
  window.clearTimeout=function(i){if(i>1e7){const k=T.q.findIndex(t=>t.id===i);if(k>=0)T.q.splice(k,1)}else rCT(i)};
  function advance(ts){
    if(T.lastTs===ts)return;let d=T.lastTs==null?16:ts-T.lastTs;T.lastTs=ts;if(d>100)d=100;if(d<0)d=0;
    T.vt+=d*T.speed+T.step;T.step=0;T.frame++;timers();
  }
  function timers(){for(let guard=0;guard<2000;guard++){let bi=-1,bd=Infinity;for(let i=0;i<T.q.length;i++)if(T.q[i].due<=T.vt&&T.q[i].due<bd){bd=T.q[i].due;bi=i}
      if(bi<0)break;const t=T.q.splice(bi,1)[0];try{t.fn.apply(window,t.a)}catch(e){console.warn('timer',e)}}}
  window.requestAnimationFrame=function(cb){if(T.manual){T.cbs.push(cb);return 0}return rRAF(ts=>{if(T.manual){T.cbs.push(cb);return}advance(ts);cb(T.vt)})};
  // tests: T.manual=true, then T.tick(ms) advances the clock and runs one frame
  T.tick=function(ms){T.vt+=ms;T.frame++;timers();const c=T.cbs;T.cbs=[];c.forEach(f=>{try{f(T.vt)}catch(e){console.warn('frame',e)}})};
  // timers keep running even if nothing animates (hidden tab etc.)
  setInterval(()=>{if(T.q.length&&T.lastTs!=null&&rp()-T.lastTs>500)advance(T.lastTs+250)},250);
})();
