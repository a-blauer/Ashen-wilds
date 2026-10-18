# --- gear (v89) --- icoOf becomes reassignable so zzN_gear_icons.js can return a rendered picture of the item
rep("const icoOf=i=>{const t=itT(i);return t.sl=='weapon'?WTYPE[t.wt].i:SLOTIC[t.sl]};","var icoOf=i=>{const t=itT(i);return t.sl=='weapon'?WTYPE[t.wt].i:SLOTIC[t.sl]};")
