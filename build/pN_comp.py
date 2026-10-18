# v92 comp: bounty-board eggs are pushed straight into the bag (no drop()), so the global egg rate (EGG92.rate in
# src/modules/zzN_comp.js, 0.65) is applied to their 20% chance here. Every other random egg goes through drop().
rep("if(Math.random()<.2){const eg=rollEgg(b.T);eggs.push(eg);","if(Math.random()<.2*(typeof EGG92!='undefined'?EGG92.rate:1)){const eg=rollEgg(b.T);eggs.push(eg);")
