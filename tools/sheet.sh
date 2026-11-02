#!/usr/bin/env bash
# Render picture sheets on GitHub Actions and download them into test/out/ (needs `gh`; the repo is public, minutes are free).
# Owner's request (Nov 2 2026): picture sheets render on GitHub, not on this slow 2-core machine.
#   tools/sheet.sh 'LIST="Foxlet:0:idle:-:-" TAG=gh_test LV=1 python3 v180_look.py'
#   tools/sheet.sh 'LIST="Foxlet:0;Skyhawk:2" TAG=a python3 v180_look.py' 'TAG=b python3 v180_look.py'   # two jobs at once
#   tools/sheet.sh -f cmds.txt                   # one command per line (blank lines and # comments skipped)
# Each argument is one shell command, run inside test/ exactly as you would locally; each runs as its own job, all at the
# same time. Every .jpg / .png a command writes to test/out comes back to test/out/ here (give each command its own TAG so
# names don't clash). Commit first: only committed work is rendered. A failed command prints its last lines.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[ $# -ge 1 ] || { sed -n 2,9p "$0"; exit 2; }
if [ "$1" = -f ]; then mapfile -t cmds < <(grep -vE '^\s*(#|$)' "$2"); else cmds=("$@"); fi
[ -z "$(git status --porcelain -- src test viewer build.sh .github tools)" ] || echo "note: uncommitted changes are NOT rendered"
req=$(python3 -c 'import sys,json;print(json.dumps(sys.argv[1:]))' "${cmds[@]}")
id=$(date +%Y%m%d-%H%M%S)-$$
# a commit on top of HEAD that only adds .sheet-request (the workflow reads it); HEAD itself is not changed
blob=$(printf '%s\n' "$req" | git hash-object -w --stdin)
ix=$(mktemp); rm -f "$ix"
GIT_INDEX_FILE=$ix git read-tree HEAD
GIT_INDEX_FILE=$ix git update-index --add --cacheinfo "100644,$blob,.sheet-request"
tree=$(GIT_INDEX_FILE=$ix git write-tree); rm -f "$ix"
c=$(git commit-tree "$tree" -p HEAD -m "sheet request: ${#cmds[@]} command(s)")
git fetch -q origin main || true   # a fresh main makes the push a small (thin) pack
git push -q -f origin "$c:refs/heads/ci-run/sheet-$id"
echo "rendering ${#cmds[@]} sheet(s) of $(git rev-parse --short HEAD) (branch ci-run/sheet-$id) ..."
run=
for i in $(seq 60); do
  run=$(gh run list -b "ci-run/sheet-$id" -L 5 --json databaseId,headSha,workflowName --jq "[.[]|select(.headSha==\"$c\" and .workflowName==\"Sheets\")][0].databaseId // empty" || true)
  [ -n "$run" ] && break; sleep 5
done
[ -n "$run" ] || { echo "no sheet run started for $c"; exit 1; }
repo=$(gh api 'repos/{owner}/{repo}' --jq .full_name)
echo "run $run: https://github.com/$repo/actions/runs/$run"
t0=$(date +%s)
gh run watch "$run" --interval 20 >/dev/null 2>&1 || true
concl=$(gh run view "$run" --json conclusion --jq .conclusion)
# what each job wrote, or why it failed (annotations: this workspace can't read Actions logs)
for j in $(gh run view "$run" --json jobs --jq '.jobs[].databaseId'); do
  gh api "repos/$repo/check-runs/$j/annotations" --jq '.[]|select(.title=="Sheet" or .title=="Sheet failed" or .title=="Sheets")|"  \(.title): \(.message)"' 2>/dev/null || true
done
echo "result: $concl (waited $(( ($(date +%s)-t0)/60 )) min)"
git push -q origin --delete "ci-run/sheet-$id" 2>/dev/null || true
mkdir -p test/out
# download through a throw-away repo, so the pictures never land in this repo's history
tmp=$(mktemp -d)
if git -C "$tmp" init -q && git -C "$tmp" fetch -q --depth=1 "$(git remote get-url origin)" "sheet-out/$id" 2>/dev/null; then
  git -C "$tmp" archive FETCH_HEAD | tar -x -C test/out
  git -C "$tmp" ls-tree --name-only FETCH_HEAD | sed 's|^|  got test/out/|'
  git push -q origin --delete "sheet-out/$id" 2>/dev/null || true
else echo "no pictures came back"; fi
rm -rf -- "$tmp"
[ "$concl" = success ] || exit 1
