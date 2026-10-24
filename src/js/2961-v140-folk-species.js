// ================= v140: townsfolk anatomy — per species =================
// hs head scale, hz / hy head forward / up (m), pitch (rad, + = nose down), lean (upper body forward per m of height above
// the hips), sh shoulder width, neck thickness, leg ('plant' | 'digi' | 'hoof' | 'bird', legP overrides), eye {sz, back, up,
// g (gaze), dx, roll, col(C)}.
fk140Def('fox',     {hs:1.32,hz:.03,hy:-.012,lean:.05,sh:.92,neck:1.15,leg:'digi',eye:{sz:1.05}});
fk140Def('wolf',    {hs:1.3,hz:.035,hy:-.014,lean:.06,sh:1,neck:1.25,leg:'digi',eye:{sz:1}});
fk140Def('hound',   {hs:1.3,hz:.035,hy:-.014,lean:.05,sh:.98,neck:1.2,leg:'digi',eye:{sz:1.1}});
fk140Def('lynx',    {hs:1.3,hz:.03,hy:-.012,lean:.05,sh:.95,neck:1.2,leg:'digi',eye:{sz:1.15}});
fk140Def('bear',    {hs:1.3,hz:.03,hy:-.02,lean:.08,sh:1.05,neck:1.3,leg:'plant',eye:{sz:1.15}});
fk140Def('raccoon', {hs:1.32,hz:.03,hy:-.012,lean:.05,sh:.95,neck:1.15,leg:'plant',eye:{sz:1.1}});
fk140Def('otter',   {hs:1.3,hz:.03,hy:-.012,lean:.05,sh:.95,neck:1.3,leg:'plant',eye:{sz:1}});
fk140Def('beaver',  {hs:1.32,hz:.03,hy:-.015,lean:.06,sh:1,neck:1.3,leg:'plant',eye:{sz:1}});
fk140Def('mole',    {hs:1.3,hz:.04,hy:-.02,lean:.08,sh:1,neck:1.3,leg:'plant',eye:{sz:.55}});
fk140Def('hedgehog',{hs:1.35,hz:.03,hy:-.015,lean:.06,sh:.95,neck:1.2,leg:'plant',eye:{sz:1}});
fk140Def('ferret',  {hs:1.3,hz:.03,hy:-.01,lean:.04,sh:.88,neck:1.0,leg:'plant',eye:{sz:1}});
fk140Def('bat',     {hs:1.32,hz:.02,hy:-.01,lean:.03,sh:.9,neck:1.05,leg:'plant',eye:{sz:1}});
fk140Def('mouse',   {hs:1.38,hz:.02,hy:-.01,lean:.03,sh:.88,neck:1.1,leg:'plant',eye:{sz:1.15}});
fk140Def('squirrel',{hs:1.36,hz:.02,hy:-.01,lean:.04,sh:.9,neck:1.1,leg:'plant',eye:{sz:1.15}});
fk140Def('hare',    {hs:1.3,hz:.02,hy:-.005,lean:.02,sh:.9,neck:1.1,leg:'plant',eye:{sz:1.15}});
fk140Def('stag',    {hs:1.25,hz:.035,hy:0,lean:.03,sh:.92,neck:1.1,leg:'hoof',eye:{sz:1.1}});
fk140Def('doe',     {hs:1.25,hz:.035,hy:0,lean:.03,sh:.9,neck:1.1,leg:'hoof',eye:{sz:1.15}});
fk140Def('goat',    {hs:1.25,hz:.035,hy:-.005,lean:.03,sh:.95,neck:1.15,leg:'hoof',eye:{sz:1.05}});
fk140Def('ram',     {hs:1.25,hz:.035,hy:-.005,lean:.04,sh:1,neck:1.2,leg:'hoof',eye:{sz:1.05}});
fk140Def('sheep',   {hs:1.25,hz:.035,hy:-.005,lean:.03,sh:.95,neck:1.15,leg:'hoof',eye:{sz:1.05}});
fk140Def('boar',    {hs:1.3,hz:.04,hy:-.02,lean:.08,sh:1.05,neck:1.35,leg:'hoof',eye:{sz:1}});
fk140Def('owl',     {hs:1.15,hz:.01,hy:-.01,lean:.02,sh:.95,neck:1,leg:'bird'});
fk140Setup();
// cheek ruffs (wolf, lynx): v137 placed them at fixed heights, so on the reshaped heads they stuck out under the jaw.
// Now each tuft grows from the cheek surface behind and below the eye and lies back along the jaw.
function fk140Ruff(k,D,C,o){const hp=D.hp,R=hp.R||.1,L=hp.L||1,zc=hp.zc==null?-.01:hp.zc,E=D.EYEP;
  o.z.forEach((zf,i)=>{const z=E[2]-R*L*zf,q=brSkullAt(D,z),y=q.yc-q.b*(o.dy==null?.25:o.dy)-i*R*.04,x=brSurfX(D,z,y)-.004,col=o.col(i,C),len=o.len*(1-i*.08);
    [-1,1].forEach(s=>fkDir(k,'head','cone4','c',col,[s*x,y,z],[s*.55,-.45,-.7],len,o.w,o.th,s*.4,.42))})}
FK137.sp.wolf.face=function(k,B,D,C){fk140Ruff(k,D,C,{z:[.3,.6],len:.042,w:.022,th:.012,dy:.2,col:()=>mdMix(C.FUR,C.FURL,.6)})};
FK137.sp.lynx.face=function(k,B,D,C){fk140Ruff(k,D,C,{z:[.25,.5,.75],len:.05,w:.022,th:.012,dy:.15,col:i=>i%2?C.FURL:mdMix(C.FURL,0x1a1410,.6)})};
