#!/usr/bin/env bash
# Co-op check (owner's request, Nov 2 2026: "make sure all future updates always show for co-op partners").
# Lists the places in a change that a co-op partner may NOT see, so each one gets a deliberate answer before publishing.
#   tools/coop_check.sh            # your change (committed + uncommitted + new files in src/js) vs origin/main
#   tools/coop_check.sh <base>     # vs another base (a commit or branch)
# It is a reminder list, not a test: each line is a question to answer ("relayed? replayed? same on both screens?").
# Exit 0 always. The patterns are the ones that hid v176–v187 work from partners (fixed in v188, 3470).
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
base=${1:-origin/main}
git fetch -q origin main 2>/dev/null || true
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
# added lines of src/js, with file and line number
git diff -U0 "$base" -- src/js | awk '/^\+\+\+ b\//{f=substr($0,7);next}/^@@/{split($3,a,",");n=a[1]+0;sub(/^\+/,"",n);next}/^\+/{print f":"n": "substr($0,2);n++}' > "$tmp/add"
for f in $(git ls-files --others --exclude-standard src/js); do awk -v f="$f" '{print f":"NR": "$0}' "$f"; done >> "$tmp/add"
grep -vE '^[^:]+:[0-9]+: *//' "$tmp/add" > "$tmp/a2"; mv "$tmp/a2" "$tmp/add"   # comment lines don't run
n=$(wc -l < "$tmp/add"); echo "co-op check: $n added lines in src/js vs $base"
[ "$n" -gt 0 ] || exit 0
hits=0
show() { # $1 = title, $2 = advice, $3 = regex (grep -E), $4 = file names to leave out (grep -E, optional)
  local L; L=$(grep -E -- "$3" "$tmp/add" | { [ -n "${4:-}" ] && grep -vE -- "^[^:]*(${4})[^:]*:" || cat; } | cut -c1-200 | head -12)
  [ -n "$L" ] || return 0
  hits=$((hits+1)); echo; echo "▸ $1"; echo "  $2"; echo "$L" | sed 's/^/    /'
}
show "Only for your own hero (pl / HA.cur)" \
  "A partner's hero is another model (MP.rh[k].m) driven by replayed poses. Use wa188Mine(H) / wa188A(H) (3470) or relay the state." \
  '([!=]==?[[:space:]]*pl\b|\bpl[[:space:]]*[!=]==?|HA\.cur|\batkHeld\b|\bhero\.(cls|lvl|tal)\b.*(anim|pose|fx|grip|hold))'
show "Evolved-cast state (EV137.cur)" \
  "It is null on the partner's replay. Read the colour through ev186C2 / sgC2 or 'EV137.cur||ev188Rep()' (3470), or send what you need." \
  'EV137\.cur'
show "New effect functions" \
  "A partner only sees effects drawn inside a relayed function (MPV.FX lists in 2170 / 2710 / 3450, sg2Reg in 3460). Call it from one, or sg2Reg([...]) it. Arguments must be plain values: functions can't be sent." \
  '^[^:]+:[0-9]+: *(function|var|let|const)?[[:space:]]*(sg|fx|ev|kqs|evx|fx186|ev186)[A-Za-z0-9_]*[[:space:]]*(=[[:space:]]*function|\()'
show "Shots changed after launch()" \
  "The partner's ghost is built from launch()'s options only ('L' message, 2170). Pass the look as an option (e.g. mpSc) rather than changing shots[...] afterwards." \
  '(shots\[shots\.length-1\]|sh\.m\.(scale|material)|\.m\.scale\.set)'
show "Companion look fields" \
  "Partners build your companions from mpvLookOf (2170): n f v g cl tr evo shn rv l. A new field the builder reads must be added there and in mpvLookIn." \
  '\bc\.(z|fp|mods|[a-z]{2,6}1[0-9]{2})\b'
show "Hero look and gear fields" \
  "Partners build your hero from presence (0520 mpModel / mpGearE: tp, r, look array). New gear or look data the model reads must be sent too." \
  '\b(it\.(u|up)|hero\.look|LOOK[0-9]*\[)'
show "Random numbers in what is built" \
  "Scenery, camps and models must come out the same for both players: use a seeded rnd. Math.random is fine for effects and for host-only spawning." \
  'Math\.random' 'fx|effect|spell|abilit|evo|sign|particle'
show "Enemy / spawn code" \
  "Anything that spawns or simulates enemies must run on the region host only (MP.host===MP.me); guests get copies. New enemy state the guest draws must be in the snapshot or an 'a' / 'ev' message." \
  '(spawnEnemy|enemies\.push|removeE\(|\.hp[[:space:]]*[-+]?=)'
show "Saved or quest progress" \
  "Shared progress goes through the co-op messages (3092 CP150 etc.). Does the partner get credit / the same state?" \
  '(x2\.[a-z0-9]+[[:space:]]*=|chqEv132|questDone|MQ[0-9]+\.st[[:space:]]*=)'
echo
if [ $hits -eq 0 ]; then echo "no co-op patterns found: still look at anything a partner should see (README, Co-op checklist)"
else echo "$hits kind(s) of line to answer for co-op. Then check it in two windows: test/v188_coop_look.py shows how (python3 test/mpt.py <steps>)."; fi
exit 0
