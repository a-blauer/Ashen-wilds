#!/usr/bin/env bash
# Render the intro cinematic video on GitHub Actions and download it (needs `gh`; the repo is public, minutes are free).
# Owner's request (Oct 26 2026): render on GitHub, and only draw again what changed.
#   tools/render.sh 13.5-35 84-103.2 115.8-end   # time ranges in seconds that changed ("end" = the end of the video)
#   tools/render.sh all                          # everything (first render, or a change that shows in every frame)
# Commit first: only committed work is rendered. The video is drawn in 5 s pieces at the same time; a range redraws every
# piece it touches, the rest come from the last render (Actions cache). Pieces the cache doesn't have (first run, unused
# for 7 days, a longer video) are drawn too. A change that moves later shots in time (a longer walk, say) changes every
# frame after it: give the range to the end. Output: test/out/intro.mp4 (with sound).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[ $# -ge 1 ] || { sed -n 2,9p "$0"; exit 2; }
[ -z "$(git status --porcelain -- src test build.sh .github tools)" ] || echo "note: uncommitted changes are NOT rendered"
req=$(python3 - "$@" <<'P'
import sys, json
a = sys.argv[1:]
if a == ['all']: print(json.dumps({'all': True})); sys.exit()
R = []
for x in a:
    lo, hi = x.split('-', 1); R.append([float(lo), None if hi == 'end' else float(hi)])
print(json.dumps({'ranges': R}))
P
)
# a commit on top of HEAD that only adds .render-request (the workflow reads it); HEAD itself is not changed
blob=$(printf '%s\n' "$req" | git hash-object -w --stdin)
ix=$(mktemp); rm -f "$ix"
GIT_INDEX_FILE=$ix git read-tree HEAD
GIT_INDEX_FILE=$ix git update-index --add --cacheinfo "100644,$blob,.render-request"
tree=$(GIT_INDEX_FILE=$ix git write-tree); rm -f "$ix"
c=$(git commit-tree "$tree" -p HEAD -m "render request: $*")
git fetch -q origin main || true
git push -q -f origin "$c:refs/heads/render/intro"
echo "rendering ($req) of $(git rev-parse --short HEAD) ..."
id=
for i in $(seq 60); do
  id=$(gh run list -w render.yml -b render/intro -e push -L 5 --json databaseId,headSha --jq "[.[]|select(.headSha==\"$c\")][0].databaseId // empty")
  [ -n "$id" ] && break; sleep 5
done
[ -n "$id" ] || { echo "no render run started for $c"; exit 1; }
repo=$(gh api 'repos/{owner}/{repo}' --jq .full_name)
echo "run $id: https://github.com/$repo/actions/runs/$id"
t0=$(date +%s)
gh run watch "$id" --interval 30 >/dev/null 2>&1 || true
concl=$(gh run view "$id" --json conclusion --jq .conclusion)
jobs=$(gh run view "$id" --json jobs --jq '.jobs[]|"\(.databaseId)\t\(.conclusion)\t\(.name)"')
jj=$(echo "$jobs" | awk -F'\t' '$3=="join"{print $1}')
[ -n "$jj" ] && gh api "repos/$repo/check-runs/$jj/annotations" --jq '.[]|select(.title=="Render")|.message' 2>/dev/null || true
echo "$jobs" | awk -F'\t' '$2=="failure"{print "  FAILED job: "$3}'
echo "result: $concl (waited $(( ($(date +%s)-t0)/60 )) min)"
[ "$concl" = success ] || exit 1
mkdir -p test/out
git fetch -q origin "+refs/heads/render-out/intro:refs/remotes/origin/render-out/intro"
git show origin/render-out/intro:intro.mp4 > test/out/intro.mp4
git push -q origin --delete render-out/intro || true
git update-ref -d refs/remotes/origin/render-out/intro || true
ls -la test/out/intro.mp4
