// ================= v170: the main view's anti-aliased buffer copies out its colour only =================
// Since v169 the view's buffer (POST r0, 0060) has a stencil, so three.js r128 copied colour + depth + stencil out of the
// multisampled buffer after every draw into it (blitFramebuffer, four times a frame with the see-through passes). Some phone
// GPUs get that combined depth+stencil copy wrong and the whole view came out as shredded stripes and black blocks (owner,
// Oct 29 2026, the animation viewer on a phone). Only the colour is ever read from the copy (the composite samples r0.texture),
// and the multisampled buffer keeps its own depth and stencil for the see-through passes, so the copy now takes colour only.
var KQ170={on:1,n:0};
(function(){try{const gl=ren.getContext();if(!ren.capabilities.isWebGL2||!gl||typeof gl.blitFramebuffer!=='function')return;
  const blit=gl.blitFramebuffer.bind(gl);
  gl.blitFramebuffer=function(x0,y0,x1,y1,u0,v0,u1,v1,mask,filter){
    if(KQ170.on&&(mask&16384)&&(mask&(256|1024))){mask&=~(256|1024);KQ170.n++}   // COLOR_BUFFER_BIT kept; DEPTH / STENCIL dropped
    return blit(x0,y0,x1,y1,u0,v0,u1,v1,mask,filter)}}
  catch(e){console.warn('v170 resolve',e)}})();
