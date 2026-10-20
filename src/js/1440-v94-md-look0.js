// =====================================================================================================
var MD_LOOK0={skin:'#d9b38c',hair:'#3a2414',hairStyle:0,face:0,eye:'#4a6a8a',build:1,height:1,sex:0};
// per-class default looks (used when the player never chose one): the classic hero of each class
function mdClassLook(cls){const L={warrior:{skin:'#b8875e',hair:'#2a1a12',hairStyle:0,face:2},paladin:{skin:'#d9b38c',hair:'#8a6a40',hairStyle:0,face:1},
  assassin:{skin:'#c8a080',hair:'#141016',hairStyle:2,face:0},ranger:{skin:'#d2aa82',hair:'#5a3418',hairStyle:1,face:0},mage:{skin:'#e1be9c',hair:'#b8b8bc',hairStyle:1,face:3}}[cls];
  return Object.assign({},MD_LOOK0,L||{})}
function mdLookN(L,cls){const D=mdClassLook(cls),o=Object.assign({},D,L||{}),hx=v=>{v=mdC(v);return typeof v=='number'&&isFinite(v)?v:null};
  const c=(v,d)=>{const x=hx(v);return x==null?mdC(d):x},i=(v,a,b,d)=>{v=Math.round(+v);return isFinite(v)?Math.max(a,Math.min(b,v)):d};
  return {skin:c(o.skin,D.skin),hair:c(o.hair,D.hair),hairStyle:i(o.hairStyle,0,5,0),face:i(o.face,0,5,0),eye:c(o.eye,D.eye),build:i(o.build,0,2,1),
    height:Math.max(.94,Math.min(1.06,isFinite(+o.height)?+o.height:1)),sex:i(o.sex,0,1,0)}}
function mdLookKey(L){return [L.skin,L.hair,L.hairStyle,L.face,L.eye,L.build,Math.round(L.height*100),L.sex].join('.')}
// the look of a hero model: preview/co-op models carry their own (h.mdLook); the player's models read heroLook()
function mdLookOf(h,cls){
  if(h&&h.mdLook)return mdLookN(h.mdLook,cls);
  if(h&&h.mpPeer)return mdLookN(null,cls);
  // the player's models: the creator's heroLook() when the hero has chosen a look; old heroes keep their class look
  let L=null;try{if(typeof hero!='undefined'&&hero&&hero.look)L=typeof heroLook=='function'?heroLook(hero):hero.look}catch(e){L=hero.look}
  return mdLookN(L,cls)}

