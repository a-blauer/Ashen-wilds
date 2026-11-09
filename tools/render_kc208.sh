#!/usr/bin/env bash
# Render the v209 Kindlelight arrival cinematic as a video on GitHub Actions and download it (needs `gh`).
#   tools/render_kc208.sh            # renders the committed HEAD -> test/out/kc208.mp4 (with sound)
# Commit first: only committed work is rendered. 8 pieces are drawn at the same time (.github/workflows/render-kc208.yml).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[ -z "$(git status --porcelain -- src test build.sh .github tools)" ] || echo "note: uncommitted changes are NOT rendered"
c=$(git rev-parse HEAD)
b=render-kc/v208-$(date +%s)   # a fresh branch per render, so a run that lost jobs can simply be started again
git push -q origin "$c:refs/heads/$b"
echo "rendering $(git rev-parse --short HEAD) ..."
id=
for i in $(seq 60); do
  id=$(gh run list -b "$b" -L 10 --json databaseId,headSha,workflowName --jq "[.[]|select(.headSha==\"$c\" and .workflowName==\"Render Kindlelight cinematic\")][0].databaseId // empty" || true)
  [ -n "$id" ] && break; sleep 5
done
[ -n "$id" ] || { echo "no render run started for $c"; exit 1; }
repo=$(gh api 'repos/{owner}/{repo}' --jq .full_name)
echo "run $id: https://github.com/$repo/actions/runs/$id"
t0=$(date +%s)
gh run watch "$id" --interval 30 >/dev/null 2>&1 || true
concl=$(gh run view "$id" --json conclusion --jq .conclusion)
gh run view "$id" --json jobs --jq '.jobs[]|"\(.databaseId)\t\(.conclusion)\t\(.name)"' | while IFS=$'\t' read -r jid jc jn; do
  [ "$jc" = success ] || { echo "  $jc: $jn"; gh api "repos/$repo/check-runs/$jid/annotations" --jq '.[]|.message' 2>/dev/null | cut -c1-600 || true; }; done
echo "result: $concl (waited $(( ($(date +%s)-t0)/60 )) min)"
[ "$concl" = success ] || exit 1
mkdir -p test/out
tmp=$(mktemp -d); git -C "$tmp" init -q; git -C "$tmp" fetch -q --depth=1 "$(git remote get-url origin)" render-out/kc208
git -C "$tmp" show FETCH_HEAD:kc208.mp4 > test/out/kc208.mp4; rm -rf -- "$tmp"
git push -q origin --delete render-out/kc208 "$b" 2>/dev/null || true
ls -la test/out/kc208.mp4
