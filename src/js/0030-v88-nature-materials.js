// ---- nature and materials
mushroom:['arcane','M3 17.4C3 9.6 9 4 16 4s13 5.6 13 13.4Z','M12 17.4h8l1.2 10.4c0 1.2-2.4 2-5.2 2s-5.2-.8-5.2-2Z','-'+C(9.8,11.4,2.1),'-'+C(17,8.2,1.8),'-'+C(22.8,12.6,2.3),CS('M5 18h22',1.2),CS('M14.6 21v5',1)],
feather:['mist','M26.4 2.4C16.4 3.6 8.6 11.6 6.6 24.6l1.8 1C15.2 21.6 24.6 14.4 26.4 2.4Z',CS('M24.6 4.6C18.4 10.4 12.6 17.6 7.8 25',1.1),CS('M13.6 13.4l3.4 1.6M11 17.6l3.6 1.4M16.6 9.6l3 1.6M20.6 6.8l2.2 1.4M15.8 18.6l2.4.2',1),S('M7.4 25.2L4.2 29.6',1.6)],
bull:['earth','M9.2 9.4C5 9.2 2.2 7 1.6 3.2c2.6 1.8 5.4 2.4 8.8 2.2ZM22.8 9.4c4.2-.2 7-2.4 7.6-6.2-2.6 1.8-5.4 2.4-8.8 2.2Z','M9.4 7.4h13.2c1.8 3.2 2 7.6.8 11l-2.4 7.4c-.8 2.4-2.8 3.8-5 3.8s-4.2-1.4-5-3.8L8.6 18.4c-1.2-3.4-1-7.8.8-11Z','M4.6 11.6l4.6-1.4.4 3.4ZM27.4 11.6l-4.6-1.4-.4 3.4Z','-'+E(12.4,14.4,1.2,1.6),'-'+E(19.6,14.4,1.2,1.6),'-'+E(14,24.6,1.2,1.6),'-'+E(18,24.6,1.2,1.6),CS(E(16,28.4,2.6,1.6),1.1)],
storm:['mist',...T(TR(0,-4.4),cloud),CS('M18.4 16.6l-6 8.4h4.6l-2.4 6.6 8.6-9.8h-4.8l3-5.2Z',2.6),['f','M18.4 16.6l-6 8.4h4.6l-2.4 6.6 8.6-9.8h-4.8l3-5.2Z']],
tree:['nature',C(16,10.4,7.6),C(9.2,14.4,5.6),C(22.8,14.4,5.6),C(16,16.6,6),'M14 18.4h4l1 11.2h-6Z',CS('M16 21l-3.4-3.4M16 19.4l3-3',1.2)],
pine:['nature','M16 1.6l8 9.2h-3.8l6 7.2H21l7 7.4H4l7-7.4H5.8l6-7.2H8Z',R(14,25.2,4,4.8)],
sprout:['nature',S('M16 29V15',2),'M16 17.6C11.6 17.6 6.8 14.4 6 8c5.4 0 9.4 3.4 10 9.6Z','M16 14.4c.8-5.2 5-8.4 11-8.4-.8 6-5.2 8.8-11 8.4Z',R(9,27.6,14,2.6,1)],
herb:['nature',S('M8 29.4C11.6 22 18 12 26 3.6',1.8),...[[10.4,23.8,-60],[14,18,-60],[18,12.4,-55],[22.2,7.6,-50]].flatMap(([x,y,a])=>[...T(RT(a+90,x,y),E(x-4,y,4,1.9)),...T(RT(a-90,x,y),E(x+4,y,4,1.9))])],
leaf:['nature','M4.6 27.4C4.6 14 13 4.6 28.4 3.6 28.4 18.6 19.6 27.4 4.6 27.4Z',CS('M5.6 26.4C11.6 19 18 11.6 26.4 5.6',1.3),CS('M12.4 18.8l-.4-5.6M17 13.6l-.2-4.4M15.2 21.2l5.6.2M20 15.6l4.6-.2',1)],
clover:['nature',C(11,11,5.2),C(21,11,5.2),C(11,21,5.2),C(21,21,5.2),S('M20 20l8 9',1.8),CS('M16 6v20M6 16h20',1.2)],
flower:['bloom',...RP(5,petal),'-'+C(16,16,3.6),C(16,16,2.2)],
wheat:['sand',S('M16 30.4V5',1.6),...[8,12.4,16.8,21.2].flatMap(y=>[...T(RT(-38,16,y),E(16,y-3,1.9,3.6)),...T(RT(38,16,y),E(16,y-3,1.9,3.6))]),E(16,4.4,1.9,3.4)],
log:['wood',R(3.4,9.6,20.6,13,1.6),E(24,16.1,5.2,6.5),'-'+E(24,16.1,3.4,4.6),E(24,16.1,1.8,2.6),CS('M7 13.4h9.4M9.4 18.4h10',1.2)],
rock:['stone','M3.6 26L7 14.6 13.4 7.4 21.4 6.6 27.6 12.8 29.4 22.4 25 27.4Z',CS('M13.4 7.4L15 16 7 14.6M15 16l6.4-9.4M15 16l10 11.4M15 16l12.6-3.2',1.2)],
mountain:['stone','M1 28L11.2 9.6l5 7.6 5-8.8L31 28Z','-M11.2 9.6L8 15.4l2.6-1 1.6 1.8 1.6-2.2ZM21.2 8.4l-3.2 5.6 2.4-.8 1.6 1.6 1.4-1.8 1.6 1.2Z'],
volcano:['ember','M2 29.4L11.6 13.4h8.8L30 29.4Z',CS('M16 13.4l-1.4 5 2.6 4-1.6 6.4',1.6),C(13.4,8.6,3),C(18.6,6.4,3.6),C(23,9.6,2.4)],
dune:['sand',C(23,9,4.2),'M1 26c6-8 12-8 17.4-3.4 4-3.6 9-3.8 12.6-.6V30H1Z',CS('M5 27.6c3-2 6-2.4 9-1.2',1.2)],
// ---- buildings and building parts
house:['wood',...house],
castle:['stone',R(2.6,10.4,7.4,18.6),R(22,10.4,7.4,18.6),R(8.6,14.6,14.8,14.4),R(12,9,8,6),cren(2.6,7.4,7.4,3,1.8),cren(22,7.4,7.4,3,1.8),cren(12,6,8,3,1.8),'-M13.2 29v-5.6a2.8 2.8 0 0 1 5.6 0V29Z','-'+R(5.4,14.4,1.8,4),'-'+R(24.8,14.4,1.8,4)],
pillar:['stone',R(6.4,3.6,19.2,4,1),R(9.6,7.6,12.8,17.6),R(5.4,25.2,21.2,4,1),CS('M12.6 9v14.6M16 9v14.6M19.4 9v14.6',1.1)],
door:['wood','M7 29.4V12C7 6.4 11 3.2 16 3.2s9 3.2 9 8.8v17.4Z',CS('M11.6 6.6v22.8M16 4.4v25M20.4 6.6v22.8',1.1),CS('M7 13.6h18M7 23.4h18',1.3),'-'+C(21.6,18.4,1.3)],
window:['wood','M6.4 29.4V12.6C6.4 7 10.4 3.6 16 3.6S25.6 7 25.6 12.6v16.8Z','-M9 26.8V13c0-4 3-6.8 7-6.8s7 2.8 7 6.8v13.8Z','M14.8 6.4h2.4v20.6h-2.4ZM9 15.4h14v2.4H9Z'],
fence:['wood','M4.4 8l2.4-3.4L9.2 8v21H4.4ZM13.6 6.4L16 3l2.4 3.4V29h-4.8ZM22.8 8l2.4-3.4L27.6 8v21h-4.8Z',R(2,11.6,28,3.4),R(2,20.6,28,3.4)],
ladder:['wood',R(6.4,2.6,3,27),R(22.6,2.6,3,27),R(9.4,6.6,13.2,2.4),R(9.4,12.6,13.2,2.4),R(9.4,18.6,13.2,2.4),R(9.4,24.6,13.2,2.4)],
steps:['stone','M3.4 28.6v-6.2h6.2v-6.2h6.2V10H22V3.8h6.6v24.8Z',CS('M9.6 22.4h18.8M15.8 16.2h12.6M22 10h6.4',1)],
roof:['clay','M2.6 27.4L29.4 6.6v20.8Z',CS('M9 22.4v5M14.4 18.2v9.2M19.8 14v13.4M25.2 9.8v17.6',1.2)],
gable:['clay','M16 4L29.6 27.4H2.4Z','-M16 11l7 12.4H9Z','M16 14.6l4 7H12Z'],
wedge:['stone','M4 28.4L28.4 4v24.4Z',CS('M10 26.4h16.4V10',1.2)],
tent:['leather','M1.6 28.4L16 3.6l14.4 24.8Z','-M16 13.4l-5.6 15h11.2Z',S('M16 3.6V1.4',1.4)],
beam:['wood',R(2.4,11.6,27.2,8.8,1.2),'-'+C(6.4,16,1.3),'-'+C(25.6,16,1.3),CS('M10 14h12M10 18h12',1)],
block:['stone',R(5,5,22,22,1.4),CS('M5.6 5.6L10.4 10.4M26.4 5.6L21.6 10.4M5.6 26.4l4.8-4.8M26.4 26.4l-4.8-4.8',1.1),CS(R(10.4,10.4,11.2,11.2),1.1)],
brick:['clay',R(1.6,4.6,13.6,6.4,.6),R(16.8,4.6,13.6,6.4,.6),R(1.6,12.8,5.6,6.4,.6),R(8.8,12.8,14.4,6.4,.6),R(24.8,12.8,5.6,6.4,.6),R(1.6,21,13.6,6.4,.6),R(16.8,21,13.6,6.4,.6)],
well:['stone','M3 21.6h26c0 4.4-5.4 7.4-13 7.4S3 26 3 21.6Z',R(14.2,11,3.6,10.8),'M8.4 11h15.2c0 3.2-3.2 5-7.6 5s-7.6-1.8-7.6-5Z',S('M16 9.6c-3-3.4-7-3.4-9.4 0M16 9.6c3-3.4 7-3.4 9.4 0',1.4),S('M6 14l-1 6M26 14l1 6',1.2)],
lantern:['fire',S('M12.4 4.6a3.6 3.6 0 0 1 7.2 0',1.6),'M10 6.6h12l-2 3.4h-8Z',R(10.4,10,11.2,13.4,1.4),'-'+R(12.6,12,6.8,9.4),flameIn.replace('M16 15.4','M16 13.6'),R(9,23.4,14,3,1),R(12.4,26.4,7.2,2.8,1)],
candle:['fire','M16 2.4c2 3 3 5 3 7 0 2-1.4 3.4-3 3.4S13 11.4 13 9.4c0-2 1-4 3-7Z',R(12,13.6,8,14.4,1),'M12 14.4c1.6 1.4 2.4 3 2 5.4-.8-1.4-1.6-2.6-2-2.6Z',E(16,28.6,9,2.4),'-'+R(15.4,12.2,1.2,2)],
bed:['leather',R(2.6,7.6,3.4,21,1),R(2.6,19.2,26.8,5.2,1),R(25.8,22.8,3.4,6.2,1),E(10,16.6,3.4,2.4),'M13.6 13.6h15.8v5.6H13.6Z',CS('M17.4 13.6v5.6M21.6 13.6v5.6',1)],
chair:['wood',R(8,2.6,3.2,26.6,1),R(8,15.4,15.6,3.4,1),R(20.6,17.4,3,11.8,1),R(8,5,10.8,2.4),R(8,9.6,10.8,2.4)],
banner:['blood',S('M7.4 2.8v27',2),'M8.4 4.4H27l-4 5.8 4 5.8H8.4Z','-'+ST(15.6,10.2,3.6,1.4,4)],
desk:['iron',R(2.6,4,26.8,18.6,1.6),'-'+R(5.2,6.6,21.6,13.4),'M12.4 22.6h7.2l2.4 5.4H10Z',ST(16,13.3,4.6,1.4,4)],
tablet:['stone',R(8.4,2.6,15.2,26.8,2.4),CS('M11.6 8h8.8M11.6 12h8.8M11.6 16h6',1.2),CS(C(16,23.4,2),1.1)],
speech:['parch','M4 4.4h24c1 0 1.6.6 1.6 1.6v13.8c0 1-.6 1.6-1.6 1.6H14l-7.4 6.6v-6.6H4c-1 0-1.6-.6-1.6-1.6V6c0-1 .6-1.6 1.6-1.6Z','-'+C(10,12.8,1.6),'-'+C(16,12.8,1.6),'-'+C(22,12.8,1.6)],
pin:['blood','M16 30C10.6 22.4 6.6 18.4 6.6 12.2 6.6 6.8 10.8 2.8 16 2.8s9.4 4 9.4 9.4c0 6.2-4 10.2-9.4 17.8Z','-'+C(16,12.2,3.6)],
// ---- food
meat:['blood',...T(RT(-40,12.4,12.6),E(12.4,12.6,9,7.4)),S('M17.4 17.6L25.4 25.6',3.2),C(27.4,24.4,2.4),C(24.6,27.4,2.4),CS('M8.4 10.4c2.4-2 5-2.6 8-2M8 15.2c1.6 1.4 3.6 2 6 1.8',1.2)],
bread:['wood','M3 18.4C3 10.6 8.8 7.4 16 7.4s13 3.2 13 11v5.4c0 2-1.2 3-3 3H6c-1.8 0-3-1-3-3Z',CS('M9 12l3 5M15 11l3 5M21 12l3 5',1.4)],
pie:['wood','M3 18.4c0-4.4 6-7.6 13-7.6s13 3.2 13 7.6v3.6c0 3-6 5.6-13 5.6S3 25 3 22Z',CS('M3.4 18.6c3 3 22.2 3 25.2 0',1.2),CS('M10 13l-2.2 4.6M16 12.2V17M22 13l2.2 4.6',1.2),S('M12 9c-1-2 1-3 0-6M18 9c-1-2 1-3 0-6',1.3)],
berries:['arcane',C(11,18.6,5.4),C(21,18.6,5.4),C(16,24.6,5.4),C(16,12.6,4.6),'M14 7.6c0-3 2-5 5-5-.2 3-2 4.8-5 5Z','-'+ST(11,18.6,1.8,.6,5),'-'+ST(21,18.6,1.8,.6,5),'-'+ST(16,24.6,1.8,.6,5),'-'+ST(16,12.6,1.6,.5,5)],
carrot:['ember','M23.6 9.6c2.4 2.2 2.2 4.6.4 6.4L5 29.4c-1.4.6-2.6-.6-2-2Z',CS('M10.4 21.6l2.8 1.6M15 17.6l2.6 1.6M19.6 13.6l2.4 1.6',1.2),S('M24.4 8.4l2-5.6M24.4 8.4l5-2.6M24.4 8.4l4.4 2',1.8)],
pepper:['blood','M22.4 9.4c2.8 2.4 3.6 7 1.4 11.4-2.6 5.4-9.6 9-18.4 8.4 5.6-2.4 9-6.4 9.8-11.6.4-3.4 1.6-6 4-8Z',S('M21.2 9.4C21 6.6 22.6 4.4 25.6 3.6',1.8),'M18.6 9.2c1.4-1.4 3.6-1.6 5.8-.6l-1 2.4Z',CS('M18.2 13.4c-.4 4-2.2 7.4-5.6 10',1.2)],
pumpkin:['ember',E(16,18.6,13,10),R(14.4,4.4,3.2,5.6,1),'M17.6 6.4c2-2.4 5-3 7.4-1.8-2 .6-3.6 1.8-4.6 3.4Z',CS('M16 9v19.2M10 9.8c-3.4 4-3.4 13.6 0 17.6M22 9.8c3.4 4 3.4 13.6 0 17.6',1.2)],
basket:['wood',S('M8 14C8 5.6 24 5.6 24 14',2),'M3.4 13.4h25.2L25.4 28.6H6.6Z',CS('M5 17.4h22M5.8 21.6h20.4M6.6 25.6h18.8M11 13.4l1 15M16 13.4v15M21 13.4l-1 15',1)],
// ---- misc UI glyphs
heart:['heal',heart,CS('M8.4 10.6c.4-2 1.6-3 3.4-3.2',1.6)],
heartbreak:['heal',heart,CS('M16.2 8.4l-2.8 5.4 4.6 3.4-3.4 5.2 1.4 3.6',2)],
check:['nature',S('M5.4 16.6l7 7.4L27 7.4',4.2)],
crossx:['blood',S('M7 7l18 18M25 7L7 25',4.2)],
exclaim:['fire','M12.8 3.6h6.4l-1.2 17.2h-4Z',C(16,26.2,3)],
question:['parch',S('M10.6 11.4C10.6 6.6 13 4.2 16.2 4.2c3.6 0 5.8 2.4 5.8 5.6 0 4.6-5.8 5-5.8 9.6v1',3.6),C(16.2,26.6,2.8)],
warn:['fire','M16 2.6L30.4 28.4H1.6Z','-'+R(14.4,10.6,3.2,9.4,1.2),'-'+C(16,23.8,1.9)],
up:['nature','M16 2.6L28.6 15.2h-8V29.4h-9.2V15.2h-8Z',CS('M16 7.6v19.6',1.1)],
ret:['parch',S('M26.4 27.4V16.6c0-4.8-3.4-7.8-8-7.8H8.4',3.2),'M2.6 8.8L11 2.6v12.4Z'],
cycle:['parch',S('M5.6 14.4A10.6 10.6 0 0 1 24.4 9.6',2.8),'M28.6 5.4l-.8 8.8-7.6-3.8Z',S('M26.4 17.6A10.6 10.6 0 0 1 7.6 22.4',2.8),'M3.4 26.6l.8-8.8 7.6 3.8Z'],
menu:['parch',R(4.4,6.4,23.2,3.6,1.8),R(4.4,14.2,23.2,3.6,1.8),R(4.4,22,23.2,3.6,1.8)],
expand:['parch',S('M4 11.4V4h7.4M20.6 4H28v7.4M28 20.6V28h-7.4M11.4 28H4v-7.4',2.8)],
cog:['iron',...RP(8,R(13.6,2.6,4.8,6,1)),C(16,16,9.4),'-'+C(16,16,4.2),CS(C(16,16,7),1)],
dot:['water',C(16,16,9.4),CS(C(16,16,6.4),1.2),'-'+C(13,13,1.6)],
};
KQI=L;
// tints: [light, dark] of the engraved-metal gradient
KQT={gold:['#ffe9a8','#b07a26'],steel:['#f1f3f5','#8a929c'],iron:['#cfc7bb','#6c645a'],bronze:['#f0c08a','#8f5a28'],silver:['#f6f6fa','#9aa0b4'],
 fire:['#ffe48a','#e0461a'],ember:['#ffbf73','#b83c16'],spark:['#fff3a6','#e0a21c'],ice:['#effcff','#64b8ea'],water:['#b4e6ff','#2f78cc'],
 blood:['#ff9a8a','#a41818'],heal:['#ffb4bc','#c4243c'],poison:['#dcff94','#4c9a24'],nature:['#d4f4a0','#4a8c36'],bloom:['#ffd2e6','#c45a8c'],
 wood:['#e8b884','#7c4a22'],leather:['#e2b48a','#7a4626'],stone:['#e2ddd4','#7a746c'],bone:['#fbf4e2','#b6a482'],arcane:['#ecd0ff','#8a48d8'],
 shadow:['#cbbbe6','#56427a'],holy:['#fffce4','#e2b040'],spirit:['#e0f8ff','#6cc4e6'],earth:['#e2c08e','#7c5a32'],slime:['#c6ffa4','#3aa63a'],
 mist:['#eef2f6','#98a6b8'],sand:['#fbe6a8','#c09040'],crystal:['#c8f4ff','#3c9ad8'],clay:['#f0a888','#9c4430'],parch:['#f4ead2','#b8a27c'],
 dark:['#8c8a96','#3a3842'],green:['#b4f08a','#3c8c3c'],white:['#ffffff','#c8ccd4']};
const t=(i,c)=>c?[i,c]:[i];
// emoji -> [icon, tint] (variation selectors stripped). Grouped by meaning.
KQE={
 '🪙':t('coin'),'💰':t('pouch'),'🎒':t('bag'),'🧳':t('bag'),'🛍️':t('bag','bloom'),'🛍':t('bag','bloom'),'🎁':t('chest'),'🧰':t('chest','iron'),'📦':t('crate'),'🛒':t('cart'),
 '🧪':t('flask'),'🫙':t('jar'),'🍯':t('jar','sand'),'🧂':t('jar','white'),'⚗':t('alembic'),'🏺':t('urn'),'🍺':t('tankard'),'🍳':t('cauldron'),
 '🍲':t('bowl'),'🥣':t('bowl'),'🍱':t('bowl','ember'),'🍽':t('bowl','silver'),
 '👑':t('crown'),'🏆':t('chalice'),'🥈':t('ingot','silver'),'💾':t('quill'),'📜':t('scroll'),'📖':t('book'),'📚':t('tome'),'🗺':t('map'),'🗝':t('key'),
 '🔒':t('lock'),'🔓':t('unlock'),'⌛':t('hourglass'),'⏳':t('hourglass'),'⏩':t('hourglass','spark'),
 '⚔':t('swords'),'🗡':t('sword'),'🔪':t('dagger'),'🪓':t('axe'),'🔨':t('hammer'),'⚒':t('anvil'),'⛏':t('pick'),'🏹':t('bow'),'➶':t('arrow'),'🪄':t('wand'),'🔱':t('trident'),
 '🛡':t('shield'),'🔰':t('shield','holy'),'⛑':t('helm'),'🥋':t('tunic'),'👢':t('boot'),'👟':t('boot'),'🦵':t('boot','bone'),'⛓':t('chain'),
 '📿':t('beads'),'🧿':t('amulet','water'),'💍':t('ring'),'⚖':t('scales'),'✝':t('cross'),
 '🔥':t('flame'),'⚡':t('bolt'),'❄':t('snow'),'🥶':t('snow'),'🧊':t('ice'),'💧':t('drop'),'🩸':t('drop','blood'),'💦':t('drop'),'🌊':t('wave'),'🫧':t('bubbles'),
 '☁':t('cloud'),'🌧':t('rain'),'🌨':t('rain','ice'),'🌫':t('fog'),'💨':t('gust'),'🌬':t('gust'),'🌪':t('tornado'),'🌀':t('vortex'),
 '🔮':t('orb'),'🧠':t('orb','bloom'),'💎':t('gem'),'💠':t('crystal'),'🔷':t('crystal','water'),'✨':t('sparkle'),'✴':t('sparkle','fire'),'💫':t('sparkle','spark'),'💡':t('sparkle','spark'),
 '⭐':t('star'),'🌟':t('star','holy'),'★':t('star'),'🌠':t('comet','holy'),'☄':t('comet'),'💥':t('burst'),'💢':t('burst','blood'),
 '🌞':t('sun'),'🔆':t('sun'),'☀':t('sun'),'🌙':t('moon'),'🌑':t('moon','shadow'),'🌘':t('moon','shadow'),'👁':t('eye'),'🔯':t('rune','arcane'),
 '🎭':t('mask'),'🦠':t('plague'),'🤢':t('plague'),'☣':t('plague'),'🎯':t('target'),
 '🐾':t('paw'),'🐺':t('wolf'),'🐕':t('dog'),'🦊':t('fox'),'🐈':t('cat'),'🐆':t('cat','sand'),'🦁':t('cat','gold'),'🐸':t('frog'),'🐢':t('tortoise'),'🦅':t('hawk'),'🦇':t('bat'),
 '🕷':t('spider'),'🕸':t('web'),'🐍':t('serpent'),'🐊':t('serpent','green'),'🐉':t('dragon'),'🐲':t('dragon'),'🦖':t('dragon','nature'),'🐗':t('boar'),'🦌':t('stag'),'🐏':t('ram'),
 '🐎':t('horse'),'🐴':t('horse'),'🐝':t('bee'),'🦂':t('scorpion'),'🐌':t('snail'),'🐛':t('worm'),'🪱':t('worm','heal'),'🟢':t('slime'),
 '👻':t('ghost'),'💀':t('skull'),'☠':t('skullx'),'🦴':t('bone'),'🪦':t('grave'),'🗿':t('idol'),'🦷':t('fang'),'🧛':t('fang','blood'),
 '👺':t('demon'),'👹':t('demon'),'😡':t('demon'),'🧌':t('demon','nature'),'🦍':t('demon','mist'),'🥷':t('hood'),'👤':t('hood'),'🧟':t('hood','green'),'🧙':t('wizard'),
 '🧑':t('figure'),'👥':t('party'),'🤝':t('party','gold'),'✋':t('hand'),'💪':t('hand','ember'),'🙏':t('hand','holy'),'🕊':t('wings'),'👼':t('wings'),'🐦':t('wings','fire'),
 '📯':t('horn'),'🔊':t('horn','mist'),'📣':t('horn','gold'),'🎻':t('lyre'),'🎵':t('note'),'🎶':t('note'),'💣':t('bomb'),'🧲':t('magnet'),'🪞':t('mirror'),'🪤':t('trap'),
 '🌲':t('pine'),'🌳':t('tree'),'🌱':t('sprout'),'🌿':t('herb'),'🍃':t('leaf'),'🍀':t('clover'),'🌸':t('flower'),'🌷':t('flower','heal'),'🌼':t('flower','sand'),'🪴':t('flower','nature'),'🌾':t('wheat'),
 '🪵':t('log'),'🪨':t('rock'),'⛰':t('mountain'),'🏔':t('mountain','ice'),'🌋':t('volcano'),'🏜':t('dune'),'🏝':t('dune','nature'),
 '🏠':t('house'),'🏡':t('house','nature'),'🏘':t('house'),'🏰':t('castle'),'🏯':t('lantern','stone'),'🏛':t('pillar'),'🚪':t('door'),'🪟':t('window'),'🚧':t('fence'),'🪜':t('ladder'),
 '📶':t('steps'),'📐':t('roof'),'🔺':t('gable'),'🔼':t('gable','stone'),'◢':t('wedge'),'⛺':t('tent'),'▬':t('beam'),'➖':t('beam'),
 '🟫':t('block','wood'),'⬜':t('block','white'),'🟩':t('block','nature'),'🟦':t('block','crystal'),'🟥':t('block','blood'),'🟨':t('block','sand'),'⬛':t('block','dark'),'🔲':t('block','stone'),'🤍':t('block','white'),'🟤':t('block','earth'),
 '🧱':t('brick'),'⛲':t('well'),'🏮':t('lantern'),'🕯':t('candle'),'🛏':t('bed'),'🪑':t('chair'),'🛋':t('chair','leather'),'🚩':t('banner'),'🏳':t('banner','white'),'🪹':t('egg','wood'),
 '🥚':t('egg'),'🖥':t('desk'),'📱':t('tablet'),'💬':t('speech'),'📍':t('pin'),
 '🍖':t('meat'),'🥩':t('meat'),'🍢':t('meat','ember'),'🐟':t('fish'),'🐠':t('fish','ember'),'🐡':t('fish','sand'),'🎏':t('fish','blood'),'🍤':t('fish','ember'),'🎣':t('rod'),
 '🍞':t('bread'),'🥧':t('pie'),'🍰':t('pie','bloom'),'🧁':t('pie','bloom'),'🫐':t('berries'),'🥕':t('carrot'),'🌶':t('pepper'),'🎃':t('pumpkin'),'🧺':t('basket'),
 '❤':t('heart'),'💗':t('heart'),'💖':t('heart','bloom'),'💞':t('heart','bloom'),'💜':t('heart','arcane'),'💋':t('heart','blood'),'💔':t('heartbreak'),
 '✅':t('check'),'✔':t('check'),'✓':t('check'),'✖':t('crossx'),'❌':t('crossx'),'❗':t('exclaim'),'❕':t('exclaim'),'❔':t('question'),'❓':t('question'),'⚠':t('warn'),
 '⬆':t('up'),'📈':t('up'),'⏏':t('up','parch'),'↩':t('ret'),'🔄':t('cycle'),'🔁':t('cycle'),'☰':t('menu'),'⛶':t('expand'),'⚙':t('cog'),'🎛':t('cog'),
 '🔵':t('dot'),'⚫':t('dot','dark'),'🔴':t('dot','blood'),'🟡':t('dot','gold'),'🟣':t('dot','arcane'),
 '▶':0,'◀':0,
 '🍄':t('mushroom'),'🪶':t('feather'),'🦏':t('boar','stone'),'🐂':t('bull'),'🦬':t('bull','leather'),'😤':t('demon','ember'),'🗼':t('lantern','holy'),'🏇':t('horse','holy'),
 '⛪':t('pillar','holy'),'🥏':t('shield','holy'),'😇':t('wings'),'🌩':t('storm'),'⛈':t('storm'),'✂':t('dagger','blood'),'🧵':t('chain','bone'),'🌒':t('moon','shadow'),'🌓':t('moon'),'🌔':t('moon'),'🌖':t('moon'),'🌗':t('moon'),
 '🦘':t('boot','nature'),'🧨':t('bomb','fire'),'🔭':t('target','steel'),'⚛':t('burst','arcane'),'🕳':t('vortex','shadow'),'⏱':t('hourglass','parch'),'⏲':t('hourglass','parch'),
};
// a few more names the other v88 tracks may use
Object.assign(KQE,{'🏹':t('bow'),'🎲':t('rune'),'🧭':t('pin','gold'),'🔔':t('lantern','gold'),'🪓':t('axe'),'🧹':t('herb','wood'),'🔍':t('eye','parch'),'🔎':t('eye','parch'),'📌':t('pin'),'🏅':t('amulet'),'🎖':t('amulet'),'🥇':t('ingot','gold'),'🥉':t('ingot','bronze'),'🪝':t('rod'),'🦉':t('hawk','earth'),'🐦':t('wings','fire')});
})();

// ---------------- rendering: SVG (CSS mask) and canvas bitmaps ----------------
function kqLayers(n){const L=KQI[n]||KQI.rune;return L.slice(1).map(l=>typeof l=='string'?(l[0]=='-'?['c',l.slice(1)]:['f',l]):l)}
function kqSvg(n){
  let body='',defs='',k=0;
  for(const [kd,d,w,t] of kqLayers(n)){
    const tr=t?` transform="${t.map(m=>'matrix('+m.join(' ')+')').join(' ')}"`:'',cut=kd[0]=='c',col=cut?'#000':'#fff';
    const el=(kd=='s'||kd=='cs')?`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${tr}/>`:`<path d="${d}" fill="${col}"${tr}/>`;
    if(cut){const id='k'+(k++);defs+=`<mask id="${id}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="48" height="48"><rect x="-8" y="-8" width="48" height="48" fill="#fff"/>${el}</mask>`;body=`<g mask="url(#${id})">${body}</g>`}
    else body+=el}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${defs?'<defs>'+defs+'</defs>':''}${body}</svg>`}
function kqUrl(n){return 'url("data:image/svg+xml,'+kqSvg(n).replace(/"/g,"'").replace(/%/g,'%25').replace(/#/g,'%23').replace(/</g,'%3C').replace(/>/g,'%3E')+'")'}
var KQ_P2={};
function kqPaint(g,n,col){
  const L=kqLayers(n);
  for(let i=0;i<L.length;i++){const [kd,d,w,t]=L[i],key=n+i;let p=KQ_P2[key];if(!p)p=KQ_P2[key]=new Path2D(d);
    g.save();if(t)t.forEach(m=>g.transform(m[0],m[1],m[2],m[3],m[4],m[5]));
    g.globalCompositeOperation=kd[0]=='c'?'destination-out':'source-over';
    if(kd=='s'||kd=='cs'){g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.strokeStyle=col;g.stroke(p)}else{g.fillStyle=col;g.fill(p)}
    g.restore()}
}
var KQ_BMP={};
// a tinted icon with a dark rim, s px square (cached)
function kqBitmap(n,tint,s){
  s=Math.max(8,Math.min(256,Math.round(s)));const key=n+'|'+tint+'|'+s;let c=KQ_BMP[key];if(c)return c;
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=s;return c};
  const a=mk(),ga=a.getContext('2d');ga.scale(s/32,s/32);kqPaint(ga,n,'#fff');
  const T=KQT[tint]||KQT.parch;ga.setTransform(1,0,0,1,0,0);ga.globalCompositeOperation='source-in';const gr=ga.createLinearGradient(0,0,0,s);gr.addColorStop(0,T[0]);gr.addColorStop(1,T[1]);ga.fillStyle=gr;ga.fillRect(0,0,s,s);
  const sh=mk(),gs=sh.getContext('2d');gs.drawImage(a,0,0);gs.globalCompositeOperation='source-in';gs.fillStyle='rgba(12,8,4,.9)';gs.fillRect(0,0,s,s);
  c=mk();const g=c.getContext('2d'),o=Math.max(1,s/40);
  [[o,0],[-o,0],[0,o],[0,-o],[0,o*1.8]].forEach(([x,y])=>g.drawImage(sh,x,y));g.drawImage(a,0,0);
  return KQ_BMP[key]=c}

// ---------------- emoji lookup ----------------
var KQ_RXG=/(?:\p{Extended_Pictographic}|✓)[︎️]?(?:‍\p{Extended_Pictographic}[︎️]?)*/gu,KQ_RXT=/[\p{Extended_Pictographic}✓]/u;
var KQ_MISS={};
function kqLook(m){const k=m.replace(/[︎️]/g,'');let r=KQE[k];if(r===undefined)r=KQE[k.split('‍')[0]];
  if(r===undefined){KQ_MISS[k]=(KQ_MISS[k]||0)+1;r=['rune']}
  return r?[r[0],r[1]||KQI[r[0]][0]]:0}
var KQ_SEG=new Map();
function kqSegs(s){let v=KQ_SEG.get(s);if(v!==undefined)return v;v=null;
  if(KQ_RXT.test(s)){const o=[];let last=0;s.replace(KQ_RXG,(m,off)=>{const r=kqLook(m);if(!r)return m;if(off>last)o.push(s.slice(last,off));o.push([r[0],r[1],m]);last=off+m.length;return m});
    if(o.length){if(last<s.length)o.push(s.slice(last));v=o}}
  if(KQ_SEG.size>600)KQ_SEG.clear();KQ_SEG.set(s,v);return v}

// ---------------- canvas: draw icons where text has emoji ----------------
(function(){
  const patch=P=>{if(!P||P.__kq)return;P.__kq=1;const fT=P.fillText,sT=P.strokeText,mT=P.measureText;
    const draw=function(g,s,x,y,mw,stroke){
      const sg=kqSegs(s);if(!sg)return stroke?sT.call(g,s,x,y,...(mw!=null?[mw]:[])):fT.call(g,s,x,y,...(mw!=null?[mw]:[]));
      KQIS.canvas++;const fm=/(\d+(?:\.\d+)?)px/.exec(g.font),px=fm?+fm[1]:10,isz=px*1.12,gap=px*.06;
      const ws=sg.map(p=>typeof p=='string'?mT.call(g,p).width:isz+gap*2),W=ws.reduce((a,b)=>a+b,0);
      const al=g.textAlign,bl=g.textBaseline;let x0=x;if(al=='center')x0=x-W/2;else if(al=='right'||al=='end')x0=x-W;
      const cy=bl=='middle'?y:bl=='top'||bl=='hanging'?y+px*.5:bl=='bottom'||bl=='ideographic'?y-px*.5:y-px*.34;
      g.textAlign='left';
      for(let i=0;i<sg.length;i++){const p=sg[i];
        if(typeof p=='string'){(stroke?sT:fT).call(g,p,x0,y)}
        else if(!stroke){const b=kqBitmap(p[0],p[1],isz*(g.getTransform?Math.max(1,Math.hypot(g.getTransform().a,g.getTransform().b)):1));g.drawImage(b,x0+gap,cy-isz/2,isz,isz)}
        x0+=ws[i]}
      g.textAlign=al};
    P.fillText=function(s,x,y,mw){if(typeof s!='string')s=String(s);if(!KQ_RXT.test(s))return fT.apply(this,arguments);draw(this,s,x,y,mw,0)};
    P.strokeText=function(s,x,y,mw){if(typeof s!='string')s=String(s);if(!KQ_RXT.test(s))return sT.apply(this,arguments);draw(this,s,x,y,mw,1)}};
  patch(window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype);
  patch(window.OffscreenCanvasRenderingContext2D&&OffscreenCanvasRenderingContext2D.prototype);
})();

