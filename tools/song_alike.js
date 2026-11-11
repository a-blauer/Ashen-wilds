#!/usr/bin/env node
// v215: how alike are the written tunes? Reads the game's music code, and for every pair of songs counts bars that are the
// same figure (same rhythm and the same steps relative to the bar's chord). Also lists chord sequences and endings used by
// more than one song. Run: node tools/song_alike.js [--fail]   (--fail: exit 1 when the limits below are broken)
const fs=require('fs'),path=require('path'),R=path.join(__dirname,'..'),J=f=>fs.readFileSync(path.join(R,'src/js',f),'utf8');
const m79=J('0600-v79-music-more-sound-effects-all.js'),t193=J('3580-v193-blade-title.js'),s=J('3890-v217-place-songs.js');
const cut=(x,a,b)=>x.slice(x.indexOf(a),x.indexOf(b,x.indexOf(a)));
const code='var SET={mus:.55,sfxV:1},AUD=null,pl=null;function muWant(){return null}function muSwitch(){}function setInterval(){}var document={addEventListener(){}};'+
  cut(m79,'var MU=','// ---------- what should be playing now').replace(/^const /gm,'var ')+cut(t193,'function muCello(','var BT193M=')+cut(t193,'function muCelesta(','var BT193C=')+s+';return {MTH,mu215Tune}';
const {MTH,mu215Tune}=new Function(code)();
const T=[];for(const k in MTH){const th=MTH[k];if(!th.tune)continue;mu215Tune(th);for(const c of 'AB'){const on=th.tune.on[c];if(!on)continue;const n=th.prog.length,bars=[];
  for(let b=0;b<n;b++){const f=[];for(const p in on){if(Math.floor(p/16)==b)f.push([p%16,on[p][1],on[p][0]-th.prog[b]])}f.sort((x,y)=>x[0]-y[0]);
    bars.push({fig:f.map(x=>x.join(':')).join(' '),rh:f.map(x=>x[0]+':'+x[1]).join(' '),n:f.length})}
  T.push({k,c,id:k+'.'+c,bars,prog:th.prog.join(','),mode:th.mode,end:bars.slice(-2).map(b=>b.fig).join(' | '),endAbs:Object.keys(on).filter(p=>p>=(n-2)*16).sort((a,b)=>a-b).map(p=>on[p][0]+','+on[p][1]).join(' ')})}}
const LIM={pair:2,prog:3,end:2,rh:5};let bad=0;const say=(...a)=>console.log(...a);
// 1. pairs of different songs sharing figures (bars with 2+ notes only: a single held note is not a figure)
const pairs=[];for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){if(T[i].k==T[j].k)continue;const A=new Set(T[i].bars.filter(b=>b.n>1).map(b=>b.fig));let n=0;for(const b of T[j].bars)if(b.n>1&&A.has(b.fig))n++;if(n>LIM.pair)pairs.push([n,T[i].id,T[j].id])}
pairs.sort((a,b)=>b[0]-a[0]);say('pairs sharing more than',LIM.pair,'bars:',pairs.length);pairs.slice(0,25).forEach(p=>say('  ',p.join('  ')));bad+=pairs.length;
// 2. chord sequences
const G=(f)=>{const m={};for(const t of T){(m[f(t)]=m[f(t)]||new Set()).add(t.k)}return Object.entries(m).map(([k,v])=>[v.size,k,[...v].join(' ')]).sort((a,b)=>b[0]-a[0])};
say('chord sequences used by more than',LIM.prog,'songs:');G(t=>t.prog).filter(x=>x[0]>LIM.prog).forEach(x=>{bad++;say('  ',x.join('  '))});
say('endings (last two bars, written notes) used by more than',LIM.end,'songs:');G(t=>t.endAbs).filter(x=>x[0]>LIM.end).forEach(x=>{bad++;say('  ',x.join('  '))});
// 3. whole-tune rhythm
say('whole rhythm (all 8 bars) used by more than 1 song:');G(t=>t.bars.map(b=>b.rh).join('|')).filter(x=>x[0]>1).forEach(x=>{bad++;say('  ',x[0],x[2])});
// 4. bar rhythms: how many songs lean on the same bar rhythm
const br={};for(const t of T)for(const r of new Set(t.bars.map(b=>b.rh)))(br[r]=br[r]||new Set()).add(t.k);
say('bar rhythms by number of songs using them:');Object.entries(br).map(([k,v])=>[v.size,k]).sort((a,b)=>b[0]-a[0]).slice(0,8).forEach(x=>say('  ',x.join('  ')));
say(bad?'ALIKE: '+bad+' problems':'ALIKE: none over the limits',' (tunes checked: '+T.length+' parts of '+new Set(T.map(t=>t.k)).size+' songs)');
if(process.argv.includes('--fail')&&bad)process.exit(1);
