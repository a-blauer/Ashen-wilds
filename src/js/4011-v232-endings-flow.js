// ================= v232 the two endings — state, the talk at the fountain, travel, saves =================
// (see docs/FINALE_PLAN.md while this is being built; README gets the full entry when it ships)
// FN232.path: 0 not chosen · 1 fight him · 2 side with him. FN232.n: Wardens beaten (0–4, side path). FN232.won: he is slain (fight
// path). FN232.crown: crowned and marked (side path, after the fourth Warden).
var FN232={path:0,n:0,won:0,crown:0,err:0,name:'Ythrael',title:'the Voice Below'};
function fn232WardenDown(i){FN232.n=Math.max(FN232.n,i+1);try{x2Dirty&&x2Dirty()}catch(_){}}
function fn232Slain(e){FN232.won=1;try{x2Dirty&&x2Dirty()}catch(_){}}
