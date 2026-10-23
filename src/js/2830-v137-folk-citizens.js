// ================= v137: animal townsfolk — citizens, and the switch-over =================
// A citizen's species comes from their trade (fishers are otters, beavers, moles, bears or mice; hunters foxes, ferrets,
// hounds, wolves or bats; egg keepers hares, sheep, hedgehogs, does or squirrels; gatherers anyone) and their look number (c.lk): the same citizen
// is always the same animal with the same fur and clothes (co-op guests build the same, the look number is saved).
var FK_ROLE={fish:['otter','beaver','mole','bear','mouse'],hunt:['fox','ferret','hound','wolf','bat'],egg:['hare','sheep','hedgehog','doe','squirrel'],
  gather:['mouse','squirrel','beaver','mole','hedgehog','bat','ferret','doe','boar','bear','sheep','hound','hare','otter']};
function fkCitSp(c){const r=czRole104(c),L=(FK_ROLE[r]||FK_ROLE.gather).filter(k=>FK137.sp[k]),A=L.length?L:Object.keys(FK137.sp).filter(k=>FK137.sp[k].cit);
  const h=fkHash((c.n||'')+'|'+(c.lk|0));return {sp:A[h%A.length],fur:(h>>>7)%3}}
{const f=czLook103;czLook103=function(c){const o=f.apply(this,arguments);try{const q=fkCitSp(c);o.fkSp=q.sp;o.fkFur=q.fur;o.fkV=(c.lk|0)%997}catch(e){}return o}}
// the trade props were placed for a human head: the fisher's straw hat sits on the animal's crown instead
{const f=czProps104;czProps104=function(g,c){const r=f.apply(this,arguments);try{const m=g.children.find(q=>q.isSkinnedMesh&&q.userData.fk),D=m&&FK137.sp[m.userData.fk];
    if(D&&czRole104(c)=='fish'&&g.bones.head){const hd=g.bones.head,y=fkTop(D,D.crownZ)-1.04;hd.children.filter(q=>q.isMesh).forEach(q=>{q.position.y+=y-.185;q.position.z+=D.crownZ})}
    // the hunter's fur mantle sits a little lower on an animal's shoulders (clear of the muzzle)
    if(D&&czRole104(c)=='hunt'&&g.userData.role)g.userData.role.children.forEach(q=>{if(q.geometry&&q.geometry.type=='TorusGeometry'&&q.position.y>.08){q.position.y-=.03;q.scale.multiplyScalar(.94)}})}catch(e){}return r}}
// everything built before this file (the first town folk): rebuilt as animals the first time they are animated, and all of
// them shortly after loading (not during it: the page shows sooner)
{const f=idlNpc;idlNpc=function(g,now){if(g&&!g._fkOk&&g.userData&&g.userData.npcO){g._fkOk=1;const m=g.children.find(c=>c.isSkinnedMesh);if(m&&!m.userData.fk)try{fkRebuild(g)}catch(e){}}return f.apply(this,arguments)}}
setTimeout(()=>{try{const t=performance.now(),n=fkRebuildAll();FK137.rb=[n,Math.round(performance.now()-t)]}catch(e){console.warn('v137 folk rebuild',e)}},1200);
