# v100 town track: Duskhold grows south (market ward + courtyard ward inside the walls), six portal gates on their own
# islands, shops as buildings, a visible kingdom. Layout numbers: src/modules/w0_world.js (TWN100_SZ/IW/PG/RD, CYD, PCOURT).
# Runtime: src/modules/zzN_zz_town*.js. Runs inside pV11 with the shared `h` and `rep`.
# 1. the town now reaches cy+T.sz in z (north edge still cy-TS): townAt / tDist / visibility use the long rectangle
rep("const townAt=(x,z,pad)=>TOWNS.findIndex(t=>Math.abs(x-t.cx)<=TS+.5+(pad||0)&&Math.abs(z-t.cy)<=TS+.5+(pad||0));",
    "const townAt=(x,z,pad)=>TOWNS.findIndex(t=>Math.abs(x-t.cx)<=TS+.5+(pad||0)&&z>=t.cy-TS-.5-(pad||0)&&z<=t.cy+(t.sz||TS)+.5+(pad||0)); // v100: walls reach cy+sz")
rep("const tDist=(x,z)=>{let d=1e9;for(const t of TOWNS){const q=Math.max(Math.abs(x-t.cx),Math.abs(z-t.cy));if(q<d)d=q}return d};",
    "const tDist=(x,z)=>{let d=1e9;for(const t of TOWNS){const se=(t.sz||TS)-TS,dz=z<t.cy?t.cy-z:z>t.cy+se?z-t.cy-se:0,q=Math.max(Math.abs(x-t.cx),dz);if(q<d)d=q}return d}; // v100")
rep("TOWNS.forEach(t=>{t.g.visible=Math.hypot(pp.x-t.cx,pp.z-t.cy)<60});",
    "TOWNS.forEach(t=>{const dz=Math.max(0,t.cy-pp.z,pp.z-t.cy-(t.sz||TS)+TS);t.g.visible=Math.hypot(pp.x-t.cx,dz)<62}); // v100")
# 2. Duskhold's 4 px/tile ground texture covers the whole castle, its roads and the portal islands (x 0-128, z 224-448)
rep("const TR=[0,7,3,10],main=","const TR=[0,7,4,14],main=")
# 3. flagstones over every paved tile of the longer town
rep("for(let y=T.cy-34;y<=T.cy+34;y++)for(let x=T.cx-34;x<=T.cx+40;x++){","for(let y=T.cy-34;y<=T.cy+(T.sz||TS)+13;y++)for(let x=T.cx-34;x<=T.cx+40;x++){")
# 4. words: there is no Portal Court any more
rep("'Shops · Hearth · Alchemy · Tavern · Portal Court to the east')","'Shops · Tavern · Courtyard in the south ward · portal gates round the walls')")
rep("Portals stand in the Portal Court, east of the Duskhold gate.","Each portal has its own gate on an island round Duskhold; roads lead there from the east, west and south gates.")
rep("PMAP[i+1].n+' awaits in the Portal Court'","PMAP[i+1].n+' awaits at its gate outside Duskhold'")
rep("The 🌲 Courtyard north-east of Duskhold has a grove;","The 🌲 Courtyard in the south ward of Duskhold has a grove;")
rep("The 🌲 Courtyard north-east of Duskhold has stone,","The 🌲 Courtyard in the south ward of Duskhold has stone,")
# 5. the town map (N): the whole castle with its six portal islands; the labels come from TWN100_wmap (zzN_zz_town3.js)
rep("else{x0=T.cx-32;y0=(typeof CYD!='undefined'?Math.min(T.cy-32,CYD.y-CYD.rmax-4):T.cy-32);w=(PCOURT[0]+24)-x0;h=T.cy+32-y0;title='Duskhold';sub='The floating stronghold · Portal Court and Courtyard to the east'}",
    "else{x0=T.cx-36;y0=T.cy-62;w=PCOURT[0]+22-x0;h=T.cy+(T.sz||TS)+42-y0;title='Duskhold';sub='The floating stronghold · six portal gates round the walls · the Courtyard in the south ward'}")
rep("{const [x,y]=P(PCOURT[0],PCOURT[1]);g.fillStyle='#a78bfa';g.beginPath();g.arc(x,y,8,0,6.28);g.fill();lab('🌀 Portal Court',x,y+20,'#e4d8ff')}",
    "if(typeof TWN100_wmap=='function')TWN100_wmap(g,P,lab,s);")
# 6. coming home from a zone lands you in front of that zone's own portal gate (TWN100_home, zzN_zz_town1.js)
rep("fadeTo(()=>{const T=TOWNS[0];toPos(PCOURT[0]-6,PCOURT[1],-Math.PI/2);say('🏰 Back in Duskhold.')})","fadeTo(()=>{TWN100_home();say('🏰 Back in Duskhold.')})")
rep("if(r<0)return '🌀 Duskhold · Portal Court';","if(r<0)return '🌀 Duskhold · Outer roads';")
