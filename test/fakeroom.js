// Test helper: a stand-in for the claude.ai room over a BroadcastChannel, so two windows of one browser play together offline.
// A peer is dropped after 30 s without presence (was 4 s: a window busy building an instance on a slow machine could fall out
// of the room for a moment, which the real room does not do, and the host changed under the test).
(()=>{const bc=new BroadcastChannel('fakeroom');const me='p'+Math.random().toString(36).slice(2,10);let pres={};const peers={};const H={};const PH=[];let snap=Object.freeze([]);
function rebuild(){const now=Date.now();for(const k in peers)if(now-peers[k].ls>30000){delete peers[k];console.warn('fakeroom: '+k+' dropped (no presence for 30 s)')}
 snap=Object.freeze([Object.freeze({peer:me,by:null,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:Object.freeze(pres),updatedAt:now})].concat(Object.keys(peers).map(k=>Object.freeze({peer:k,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:Object.freeze(peers[k].p),updatedAt:peers[k].ls}))))}
bc.onmessage=ev=>{const d=ev.data;if(d.k=='pres'){const was=!!peers[d.peer];peers[d.peer]={p:d.p,ls:Date.now()};rebuild();if(!was)PH.forEach(f=>f({peers:snap,joined:[snap.find(x=>x.peer==d.peer)],left:[],updated:[]}))}
 else if(d.k=='ev'){(H[d.topic]||[]).forEach(f=>f({topic:d.topic,data:d.data,peer:d.peer,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false}))}};
setInterval(()=>{bc.postMessage({k:'pres',peer:me,p:pres});rebuild()},1000);
const room=Object.freeze({emit:(t,data)=>{const s=JSON.stringify(data);if(s.length>4096)return Promise.reject({code:'invalid_argument',message:'too big '+s.length});bc.postMessage({k:'ev',topic:t,data,peer:me});(H[t]||[]).forEach(f=>f({topic:t,data:JSON.parse(s),peer:me,by:null,isMe:true,sameTab:true,kind:'viewer',guest:false}));return Promise.resolve()},
 on:(t,f)=>{(H[t]=H[t]||[]).push(f);return()=>{}},presence:p=>{const s=JSON.stringify(Object.assign({},pres,p));if(s.length>4096)return Promise.reject({code:'invalid_argument'});pres=JSON.parse(s);bc.postMessage({k:'pres',peer:me,p:pres});rebuild();return Promise.resolve()},
 peers:()=>snap,onPeers:f=>{PH.push(f);return()=>{}},connected:()=>true,onConnection:f=>{setTimeout(()=>f(true));return()=>{}},join:()=>Promise.reject({code:'not_permitted'})});
window.claude={use:async n=>n=='room'?room:null};window.__me=me;})();
