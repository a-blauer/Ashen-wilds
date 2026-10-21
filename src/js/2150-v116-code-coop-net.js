// ================= v116: join-code co-op (no Claude account) =================
// One player hosts and gets a 6-letter join code; friends type it to connect. Players link up directly over WebRTC data
// channels; the free public PeerJS signaling server (0.peerjs.com) only introduces them (its plain WebSocket protocol is
// spoken here directly, so no library is loaded). TURN relays (PeerJS's public ones) cover strict networks.
// Star layout: every joiner connects to the host, and the host relays. kqnRoom() wraps that as a backend with the same
// calls as the claude.ai room (on, onPeers, emit, presence, peers), so the v58 co-op code (0520) runs unchanged on it.
// The host stamps the sender on everything it relays, so nobody can speak as somebody else.
// Tests set window.KQNET_SIG (signaling URL) and window.KQNET_ICE (ICE servers) to run without the internet.
var KQN={sig:'wss://0.peerjs.com:443/peerjs',key:'peerjs',pre:'kq116-',abc:'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',max:8,
  ice:[{urls:'stun:stun.l.google.com:19302'},{urls:['turn:eu-0.turn.peerjs.com:3478','turn:us-0.turn.peerjs.com:3478'],username:'peerjs',credential:'peerjsp'}],
  cur:null};
function kqnCode(){let s='';const a=new Uint32Array(6);crypto.getRandomValues(a);for(const v of a)s+=KQN.abc[v%KQN.abc.length];return s}
function kqnClean(c){return String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6)}
function kqnRid(){const a=new Uint32Array(3);crypto.getRandomValues(a);return Array.from(a,v=>v.toString(36)).join('').slice(0,14)}

// ---------- signaling: one WebSocket to the PeerJS server under our own id ----------
function kqnSignal(id,on){const url=(window.KQNET_SIG||KQN.sig)+'?key='+KQN.key+'&id='+encodeURIComponent(id)+'&token='+kqnRid()+'&version=1.5.4';
  const S={id,ws:null,open:false,dead:false,hb:0,
    send(type,dst,payload){if(S.ws&&S.ws.readyState===1)S.ws.send(JSON.stringify({type,dst,payload}))},
    close(){S.dead=true;clearInterval(S.hb);try{S.ws&&S.ws.close()}catch(_){}}};
  try{S.ws=new WebSocket(url)}catch(err){setTimeout(()=>on('fail','The game could not reach the join-code server from here.'));return S}
  S.ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(_){return}if(!m||typeof m.type!=='string')return;
    if(m.type==='OPEN'){S.open=true;on('open')}else if(m.type==='ID-TAKEN')on('taken');else if(m.type==='ERROR')on('fail',(m.payload&&m.payload.msg)||'Join-code server error.');
    else on('msg',m)};
  S.ws.onclose=()=>{clearInterval(S.hb);if(!S.dead){S.dead=true;on(S.open?'lost':'fail','The game could not reach the join-code server from here.')}};
  S.ws.onerror=()=>{};
  S.hb=setInterval(()=>{if(S.ws&&S.ws.readyState===1)S.ws.send('{"type":"HEARTBEAT"}')},5000);
  return S}

// ---------- one WebRTC link to one other player ----------
function kqnLink(S,remote,cid,initiator,on){
  const L={remote,cid,pc:null,dc:null,open:false,dead:false,q:[],rset:false,last:performance.now(),
    send(o){if(L.open&&L.dc&&L.dc.readyState==='open'){try{L.dc.send(typeof o==='string'?o:JSON.stringify(o));return true}catch(_){}}return false},
    close(){if(L.dead)return;L.dead=true;L.open=false;try{L.dc&&L.dc.close()}catch(_){}try{L.pc&&L.pc.close()}catch(_){}on('close',L)}};
  const pc=L.pc=new RTCPeerConnection({iceServers:window.KQNET_ICE||KQN.ice});
  pc.onicecandidate=e=>{if(e.candidate)S.send('CANDIDATE',remote,{c:e.candidate.toJSON?e.candidate.toJSON():e.candidate,cid})};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'||pc.connectionState==='closed')L.close()};
  const wire=dc=>{L.dc=dc;dc.onopen=()=>{L.open=true;L.last=performance.now();on('open',L)};dc.onclose=()=>L.close();
    dc.onmessage=e=>{L.last=performance.now();if(typeof e.data!=='string'||e.data.length>200000)return;if(e.data==='~')return;let m;try{m=JSON.parse(e.data)}catch(_){return}if(m&&typeof m==='object')on('data',L,m)}};
  if(initiator){wire(pc.createDataChannel('kq',{ordered:true}));
    pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>S.send('OFFER',remote,{sdp:pc.localDescription,cid,type:'data'})).catch(()=>L.close())}
  else pc.ondatachannel=e=>wire(e.channel);
  L.remoteSdp=sdp=>pc.setRemoteDescription(sdp).then(()=>{L.rset=true;L.q.splice(0).forEach(c=>pc.addIceCandidate(c).catch(()=>{}))});
  L.answer=sdp=>L.remoteSdp(sdp).then(()=>pc.createAnswer()).then(a=>pc.setLocalDescription(a)).then(()=>S.send('ANSWER',remote,{sdp:pc.localDescription,cid,type:'data'})).catch(()=>L.close());
  L.cand=c=>{if(!c)return;if(L.rset)pc.addIceCandidate(c).catch(()=>{});else L.q.push(c)};
  return L}

// ---------- the room ----------
// kqnRoom('host') resolves with {room, code}; kqnRoom('join', code) with {room}. Rejections carry a plain message.
// room.leave() ends it; room.onEnd(fn) hears when it ends for any reason (fn(reason)).
function kqnRoom(mode,code){return new Promise((res,rej)=>{
  const host=mode==='host';let me='',S=null,settled=false,ended=false,pres={},snap=MPX.none,tries=0,hostL=null,ka=0,to=0;
  const H={},PH=[],EH=[],links={},P={}; // links by remote id; P: other players' presence by peer id
  const ok=v=>{if(!settled){settled=true;clearTimeout(to);res(v)}},no=msg=>{if(!settled){settled=true;clearTimeout(to);end(null);rej(new Error(msg))}};
  const msgOf=(t,d,peer)=>({topic:t,data:d,peer,by:null,isMe:peer===me,sameTab:peer===me,kind:'viewer',guest:false});
  const rec=(peer,p)=>Object.freeze({peer,by:null,isMe:peer===me,sameTab:peer===me,kind:'viewer',guest:false,presence:Object.freeze(Object.assign({},p)),updatedAt:Date.now()});
  function rebuild(){snap=Object.freeze([rec(me,pres)].concat(Object.keys(P).map(k=>rec(k,P[k]))))}
  function fire(joined,left){rebuild();const ch={peers:snap,joined:joined.map(k=>rec(k,P[k])),left:left.map(k=>rec(k,{})),updated:[]};PH.forEach(f=>{try{f(ch)}catch(err){console.warn(err)}})}
  function deliver(t,d,peer){(H[t]||[]).forEach(f=>{try{f(msgOf(t,d,peer))}catch(err){console.warn(err)}})}
  const okTopic=t=>typeof t==='string'&&MP_TOPICS.indexOf(t)>=0;
  const okPeer=p=>typeof p==='string'&&p.length>0&&p.length<64;
  const clean=v=>{try{return JSON.parse(JSON.stringify(v==null?{}:v))}catch(_){return {}}};
  function end(reason){if(ended)return;ended=true;clearInterval(ka);clearTimeout(to);Object.values(links).forEach(L=>{try{L.close()}catch(_){}});try{S&&S.close()}catch(_){}
    if(reason)EH.forEach(f=>{try{f(reason)}catch(_){}})}
  const room={
    on:(t,f)=>{(H[t]=H[t]||[]).push(f);return()=>{}},onPeers:f=>{PH.push(f);return()=>{}},onEnd:f=>{EH.push(f)},
    peers:()=>snap,connected:()=>!ended,count:()=>Object.keys(P).length+1,
    presence:patch=>{if(ended)return Promise.resolve();Object.keys(patch||{}).forEach(k=>{if(patch[k]===null)delete pres[k];else pres[k]=clean(patch[k])});rebuild();
      if(host){const s=JSON.stringify({k:'pres',p:me,v:pres});Object.values(links).forEach(L=>L.send(s))}else if(hostL)hostL.send({k:'pres',v:pres});return Promise.resolve()},
    emit:(t,d)=>{if(ended)return Promise.reject({code:'closed'});if(!okTopic(t))return Promise.reject({code:'invalid_argument'});const data=clean(d);deliver(t,clean(data),me);
      if(host){const s=JSON.stringify({k:'ev',t,d:data,p:me});Object.values(links).forEach(L=>L.send(s))}else if(hostL)hostL.send({k:'ev',t,d:data});return Promise.resolve()},
    leave:()=>{if(!ended){if(host)Object.values(links).forEach(L=>L.send({k:'bye'}));else if(hostL)hostL.send({k:'bye'})}end('left')}};
  // keepalive: a link that has been silent for 12 s is gone (a closed tab or lost network can take long to show)
  ka=setInterval(()=>{const now=performance.now();Object.values(links).forEach(L=>{if(!L.open)return;L.send('~');if(now-L.last>12000)L.close()})},2000);
  function onLink(ev,L,m){
    if(ev==='open'){if(host){if(Object.keys(P).length>=KQN.max-1){L.send({k:'full'});setTimeout(()=>L.close(),300);return}
        L.send({k:'all',me:L.remote,l:[[me,pres]].concat(Object.keys(P).map(k=>[k,P[k]]))})}
      else{hostL=L;L.send({k:'pres',v:pres})}return}
    if(ev==='close'){if(links[L.remote]===L)delete links[L.remote];
      if(host){if(P[L.remote]){delete P[L.remote];const s=JSON.stringify({k:'left',p:L.remote});Object.values(links).forEach(x=>x.send(s));fire([],[L.remote])}}
      else if(L===hostL){no('Could not connect to that game.');end('host')}return}
    if(host){const from=L.remote;
      if(m.k==='pres'){const was=!!P[from];P[from]=clean(m.v);const s=JSON.stringify({k:'pres',p:from,v:P[from]});Object.values(links).forEach(x=>{if(x!==L)x.send(s)});if(was)rebuild();else fire([from],[])}
      else if(m.k==='ev'&&okTopic(m.t)){if(!P[from])return;const s=JSON.stringify({k:'ev',t:m.t,d:m.d,p:from});Object.values(links).forEach(x=>{if(x!==L)x.send(s)});deliver(m.t,m.d,from)}
      else if(m.k==='bye')L.close()}
    else{
      if(m.k==='all'&&Array.isArray(m.l)){const j=[];(m.l||[]).slice(0,KQN.max).forEach(q=>{if(Array.isArray(q)&&okPeer(q[0])&&q[0]!==me){if(!P[q[0]])j.push(q[0]);P[q[0]]=clean(q[1])}});fire(j,[]);ok({room})}
      else if(m.k==='pres'&&okPeer(m.p)&&m.p!==me){const was=!!P[m.p];P[m.p]=clean(m.v);if(was)rebuild();else fire([m.p],[])}
      else if(m.k==='left'&&okPeer(m.p)&&P[m.p]){delete P[m.p];fire([],[m.p])}
      else if(m.k==='ev'&&okTopic(m.t)&&okPeer(m.p)&&m.p!==me)deliver(m.t,m.d,m.p)
      else if(m.k==='full'){no('That game is full (8 players).');end('full')}
      else if(m.k==='bye'){end('host')}}}
  function onSig(ev,a){
    if(ended)return;
    if(ev==='taken'){if(host&&++tries<5){try{S.close()}catch(_){}start();return}return no('Could not get a join code. Try again.')}
    if(ev==='fail'){if(!settled)return no(a||'Could not connect.');return end('net')}
    if(ev==='lost'){if(!settled)return no('Lost the join-code server.');if(host){S=null;setTimeout(()=>{if(!ended)resign()},2000)}return} // the links stay up without it
    if(ev==='open'){if(host)ok({room,code});else{const L=links[hostId]=kqnLink(S,hostId,'c'+kqnRid(),true,onLink)}return}
    if(ev!=='msg')return;const m=a,src=m.src,p=m.payload||{};if(!okPeer(src))return;
    if(m.type==='OFFER'&&host){if(links[src])links[src].close();const L=links[src]=kqnLink(S,src,p.cid,false,onLink);L.answer(p.sdp)}
    else if(m.type==='ANSWER'&&links[src])links[src].remoteSdp(p.sdp).catch(()=>{});
    else if(m.type==='CANDIDATE'&&links[src])links[src].cand(p.c);
    else if(m.type==='EXPIRE'&&!host&&src===hostId)no('No game found with code '+code+'. Check the code with your friend.')}
  let hostId='';
  function start(){if(host){code=kqnCode();me=KQN.pre+code}else{me='j'+kqnRid()}rebuild();S=kqnSignal(me,onSig)}
  function resign(){S=kqnSignal(me,(ev,a)=>{if(ev==='open'||ev==='msg')onSig(ev,a)})} // host: get the code back so more friends can join
  if(!host){code=kqnClean(code);if(code.length!==6)return rej(new Error('A join code has 6 letters and numbers.'));hostId=KQN.pre+code}
  if(typeof RTCPeerConnection=='undefined'||typeof WebSocket=='undefined')return rej(new Error('This browser cannot do online play.'));
  start();
  to=setTimeout(()=>no(host?'The join-code server did not answer. Check your internet connection.':'No game found with code '+code+' (or it could not be reached).'),host?15000:20000);
})}
