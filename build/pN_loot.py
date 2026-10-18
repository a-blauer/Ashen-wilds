# v89 loot track: material-specific gathering nodes (see src/modules/zzN_loot.js, lnV).
# Iron veins (about 30% of plain rocks) always give iron ore; plain stone only rarely does.
rep("if(Math.random()<.3+sk.l*.02){const q=1+(Math.random()<.3?1:0);mats.iron+=q;got.push(['⛏️','Iron Ore',q])}",
    "{const iv=lnV(tg)=='iron';if(iv||Math.random()<.06){const q=iv?1+R(0,1)+Math.floor(bonus/3):1;mats.iron+=q;got.push(['⛏️','Iron Ore',q])}}")
# Berry bushes always give berries; fiber grass almost never does.
rep("if(tg.kind=='bush'){if(r()<.4)gotS('berries',R(1,3));",
    "if(tg.kind=='bush'){const bv=lnV(tg);if(bv=='berry'||r()<.05)gotS('berries',bv=='berry'?R(1,3):1);")
