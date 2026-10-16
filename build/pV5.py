import os as _os
_ROOT=_os.environ.get('AW_ROOT',_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
M=_ROOT+'/src/modules/'
OUT=_os.environ.get('AW_OUT',_ROOT+'/dist/ashen-wilds.html')
P=OUT
h=open(P).read()
R=[('<title>Eudemon Trails</title>','<title>Kill Quest</title>'),('<h1>Eudemon Trails</h1>','<h1>Kill Quest</h1>'),
('Choose your first Eudemon','Choose your first companion'),('First Eudemon','First companion'),('That Eudemon needs healing first.','That companion needs healing first.'),
('Eudemons laid their eggs','Companions laid their eggs'),('every Eudemon rolls one','every companion rolls one'),
("Needs creature Lv ","Needs companion Lv "),('collect creature materials','collect companion evolution materials'),("'Lead creature level'","'Lead companion level'"),
("Creature materials (evolution)","Companion materials (evolution)"),('Pick the creature to keep first','Pick the companion to keep first'),('Now pick a creature of','Now pick a companion of'),
('the consumed creature is a lower tier','the consumed companion is a lower tier'),('hatches a stronger creature','hatches a stronger companion'),
('Pick the creature to <b>keep</b>','Pick the companion to <b>keep</b>'),('The kept creature resets','The kept companion resets'),
("length} creature${","length} companion${"),("' discovery points · creatures '","' discovery points · companions '"),("['cre','🐾 Creatures']","['cre','🐾 Companions']"),
('Rec: creature ${','Rec: companion ${'),('Recommended: creature overall grade','Recommended: companion overall grade')]
for a,b in R:
    n=h.count(a);assert n>=1,a;h=h.replace(a,b)

import re as _re
_i=h.index("  // notice board\n  {tcb(g,-10.8");_j=h.index("(i-1)*.12))}\n",_i)+len("(i-1)*.12))}\n");h=h[:_i]+h[_j:]
for a,b in [("['lore','📜 Lore'],",""),("catching fish and reading lore stones.","and catching fish.")]:
    assert h.count(a)==1,a;h=h.replace(a,b)
cut="""
// ---- v61: lore stones and bounty boards removed ----
for(let i=SECRETS.length-1;i>=0;i--){const S=SECRETS[i];if(S.k=='lore'){if(S.g)scene.remove(S.g);SECRETS.splice(i,1)}}
boardPrompt=function(){return null};bountyOnKill=function(){};bountyOnDungeon=function(){};
{const f=bTrack;bTrack=function(){bounties=[];const d=$('btrk');if(d)d.classList.add('hide')}}bTrack();
"""
a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1;h=h.replace(a,cut+a)

a="\n$('talBtn').onclick=openTal;\n";assert h.count(a)==1;h=h.replace(a,"\n"+open(M+'zzzz_more.js').read()+a)
a="(c.v?c.v+' ':'')";assert h.count(a)==1;h=h.replace(a,"(c.shn?'✨ ':'')+(c.rv?c.rv+' ':'')+(c.v?c.v+' ':'')")
h=h.replace('HP ${c.h}/${M(c)}','HP ${Math.round(c.h)}/${M(c)}')
for a,b in [('Cook meals at a Cooking Fire in your Realm','Cook meals at the Cooking Hearth in Duskhold'),('buy them from the Rune Sage in your Realm','buy them from the Rune Sage when it visits Duskhold'),
 ('Brew catalysts at an Alchemy Table in your Realm','Brew catalysts at the Alchemy Table in Duskhold'),('No supplies yet. Farm, cook and brew in your Realm','No supplies yet. Cook and brew in Duskhold'),('None. Farm crops in your Realm, hunt for meat','None. Hunt for meat')]:
    h=h.replace(a,b)
a="p={label:'F · Magic Shop',fn:()=>openShop('x')}";assert h.count(a)>=1,a;h=h.replace(a,"p=shopBuilt('magic')?{label:'F · Magic Shop',fn:()=>openShop('x')}:{label:'🔨 Magic Shop · build it at the Stronghold Steward',fn:()=>openX('hold')}")
open(P,'w').write(h);print('v5 ok')
