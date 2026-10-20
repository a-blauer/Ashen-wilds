# v100 models track: the v83 low-poly mount builder (zzG_gear_mounts.js) and its mountModel hand over to the v100
# anatomical mounts in src/modules/zzN_zz_models.js (MDL100_rig / MDL100_fin, hoisted function declarations). If the
# v100 builder is switched off (MDL100.on=false) or fails, the v83 code below runs exactly as before.
rep("mkMountRig=function(k){\n  if(!LGMS[k])k='pony';",
    "mkMountRig=function(k){\n  {const _m=typeof MDL100_rig=='function'?MDL100_rig(k):null;if(_m)return _m}\n  if(!LGMS[k])k='pony';")
rep("g.add(sd);g.sd=sd;\n  const T=(MOUNTS[k]&&MOUNTS[k].t)||1,blk=",
    "g.add(sd);g.sd=sd;\n  if(r.userData&&r.userData.mdl&&typeof MDL100_fin=='function')return MDL100_fin(g,k);\n  const T=(MOUNTS[k]&&MOUNTS[k].t)||1,blk=")
