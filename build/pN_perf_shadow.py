# v98 perf_shadow: plain PCF shadows instead of PCF-soft (about half the shadow-map lookups per pixel).
# Set where the renderer is created, so every shader program is compiled with this type from the start
# (changing the type later would recompile every lit material). The rest is in src/modules/zzN_perf_shadow.js.
rep("ren.shadowMap.type=THREE.PCFSoftShadowMap;","ren.shadowMap.type=THREE.PCFShadowMap;")
