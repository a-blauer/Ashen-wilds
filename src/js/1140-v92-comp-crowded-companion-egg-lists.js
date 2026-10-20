// ================= v92: comp — crowded companion / egg lists stay readable =================
// Root cause of the overlapping text with many companions and eggs:
//   the list columns are `.rows{display:flex;flex-direction:column}` inside a fixed-height, scrolling box
//   (#cmp #cl: overflow:auto; max-height:100%). Flex items may shrink (flex-shrink:1), and `.win .rw`
//   sets an explicit `min-height:36px`, which replaces the usual "never smaller than the content" floor.
//   Once the rows no longer fit, the browser squeezes every row to 36px instead of scrolling, so each
//   row's name / "Ready! Click to hatch" / grade line is drawn over the rows below it. More rows = worse.
//   Long names made it worse: the name column is `1fr` (min-width:auto), so a long name wrapped into
//   3–4 lines inside the squeezed row.
// Fix: rows in every list never shrink (they scroll instead); in the Companions & Eggs list each row is
//   one name line + one detail line, cut with "…" (the full text is in the row's tooltip); the name
//   column may shrink (minmax(0,1fr)) so the health bar and the slot number always keep their place.
//   Same for the Consume picker buttons in the Fusion window and the Beast Trainer / other #xw lists.
document.head.insertAdjacentHTML('beforeend',`<style>
.rows>*,#cl>*,#fl>*,#eggs>*,#islots>*{flex-shrink:0}
#cmp .rw,#fz .rw,#inc .rw,#xw .rw{grid-template-columns:minmax(0,1fr) auto}
#cmp .rw .rn,#fz .rw .rn,#inc .rw .rn,#xw .rw .rn{min-width:0;overflow-wrap:anywhere}
#cl .rw{min-height:40px;align-items:center}
#cl .rw .rn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}
#cl .rw .rn small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cl .rw .ra{min-width:0}
#cl .ceh{position:sticky;top:0;z-index:2;margin:0;padding:4px 2px 5px;background:linear-gradient(180deg,rgba(22,15,9,.97) 70%,rgba(22,15,9,0))}
#fz .fstats button{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#fz .fstats button small{white-space:nowrap}
</style>`);
// full text on hover / long-press for rows that are cut with "…"
function cm92Titles(root){if(!root)return;root.querySelectorAll('.rw').forEach(b=>{if(b.title)return;const n=b.querySelector('.rn');if(!n)return;
  const s=n.querySelector('small'),t=(n.textContent||'').replace(s?s.textContent:'','').trim(),u=s?s.textContent.trim():'';const v=t+(u?' — '+u:'');if(v)b.title=v})}
{const f=rC;rC=function(){const r=f.apply(this,arguments);try{cm92Titles($('cl'))}catch(_){}return r}}
{const f=rF;rF=function(){const r=f.apply(this,arguments);try{const m=$('fmsg');if(m)m.querySelectorAll('.fstats button').forEach(b=>{if(!b.title)b.title=b.textContent.trim()})}catch(_){}return r}}

