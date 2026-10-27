// v116 test helper: a stand-in for the PeerJS signaling server (0.peerjs.com) over a BroadcastChannel, so two tabs of one
// browser can find each other without the internet. Only the signaling is fake: the players still link up over real WebRTC.
// Speaks the same messages the game uses: OPEN, ID-TAKEN, EXPIRE, and OFFER / ANSWER / CANDIDATE forwarded with src.
// A busy window answers the "is this peer there?" ping late on a slow machine: it counts as gone only after 4 s (was 1.5 s).
(()=>{const RW=window.WebSocket;window.KQNET_SIG='ws://kqfake/peerjs';window.KQNET_ICE=[];
class FWS{constructor(url){this.readyState=0;this.id=new URL(url.replace('ws://','http://')).searchParams.get('id');this.n=Math.random();this.pend={};
  this.bc=new BroadcastChannel('kqsig');
  this.bc.onmessage=ev=>{const d=ev.data;if(this.readyState===3)return;
    if(d.k=='claim'&&d.id===this.id&&this.readyState===1)this.bc.postMessage({k:'taken',n:d.n});
    else if(d.k=='taken'&&d.n===this.n)this.taken=1;
    else if(d.k=='ping'&&d.id===this.id&&this.readyState===1)this.bc.postMessage({k:'pong',n:d.n});
    else if(d.k=='pong'&&this.pend[d.n])this.pend[d.n]=2;
    else if(d.k=='msg'&&d.m.dst===this.id&&this.readyState===1)this._rx(d.m)};
  this.bc.postMessage({k:'claim',id:this.id,n:this.n});
  setTimeout(()=>{if(this.readyState===3)return;this.readyState=1;if(this.taken){this._rx({type:'ID-TAKEN',payload:{msg:'ID is taken'}});this.close();return}this._rx({type:'OPEN'})},250)}
  _rx(m){if(this.onmessage)this.onmessage({data:JSON.stringify(m)})}
  send(s){const m=JSON.parse(s);if(m.type==='HEARTBEAT')return;m.src=this.id;
    if(m.type==='OFFER'){const n=Math.random();this.pend[n]=1;this.bc.postMessage({k:'ping',id:m.dst,n});setTimeout(()=>{if(this.pend[n]!==2)this._rx({type:'EXPIRE',src:m.dst,dst:this.id});delete this.pend[n]},4000)}
    this.bc.postMessage({k:'msg',m})}
  close(){if(this.readyState===3)return;this.readyState=3;try{this.bc.close()}catch(_){}if(this.onclose)this.onclose({})}}
window.WebSocket=function(url,p){return String(url).startsWith('ws://kqfake')?new FWS(url):new RW(url,p)};window.WebSocket.OPEN=1;})();
