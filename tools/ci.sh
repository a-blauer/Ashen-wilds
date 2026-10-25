#!/usr/bin/env bash
# Run the test suite on GitHub Actions for the current commit and wait for the result (needs `gh`; repo is public, minutes are free).
#   tools/ci.sh                      # full suite: pushes HEAD to branch ci/<your branch>, which starts the workflow
#   tools/ci.sh smoke                # smoke | changed | full, started by hand on branch ci-run/<branch>-<suite>
#   tools/ci.sh full v57t.py v60t.py # only these tests of the suite (e.g. re-run failures after a fix)
# Commit first: only committed work is tested. Prints one PASS / FAIL line per test (with the FAIL lines of failed tests);
# exit 0 only when every test passed. Also saved to test/out/suite/gh-<suite>.summary.txt.
# This workspace can't download Actions logs or artifacts (blocked); results come back as annotations through the API.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
suite=${1:-full}; shift || true; only="$*"
case $suite in smoke|changed|full) ;; *) echo "suite must be smoke, changed or full"; exit 2;; esac
[ -z "$(git status --porcelain -- src test viewer build.sh .github)" ] || echo "note: uncommitted changes are NOT tested"
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
sha=$(git rev-parse HEAD)
br=$(git rev-parse --abbrev-ref HEAD); [ "$br" = HEAD ] && br=detached
br=${br#ci/}; br=${br#ci-run/}; ref="ci/$br"   # a push to ci/* starts the full suite by itself
[ "$suite" = full ] && [ -z "$only" ] || ref="ci-run/$br-$suite${only:+-some}"   # ci-run/* runs only when started by hand
git fetch -q origin main || true   # a fresh main makes the push a small (thin) pack
pl=$(git push -q -f origin "HEAD:refs/heads/$ref" 2>&1) || { echo "$pl"; exit 1; }   # quiet unless the push fails
if [ "$ref" = "ci/$br" ]; then ev=push
else ev=workflow_dispatch; sleep 3; gh workflow run tests.yml --ref "$ref" -f suite="$suite" -f only="$only"; fi
echo "testing $suite${only:+ ($only)} on ${sha:0:9} (branch $ref) ..."
id=
for i in $(seq 60); do
  id=$(gh run list -w tests.yml -b "$ref" -e "$ev" -L 5 --json databaseId,headSha --jq "[.[]|select(.headSha==\"$sha\")][0].databaseId // empty")
  [ -n "$id" ] && break; sleep 5
done
[ -n "$id" ] || { echo "no run started for $sha"; exit 1; }
echo "run $id: $(gh run view "$id" --json url --jq .url)"
t0=$(date +%s)
gh run watch "$id" --interval 30 >/dev/null 2>&1 || true
mkdir -p test/out/suite
out=test/out/suite/gh-$suite.summary.txt
note() { gh api "repos/$repo/check-runs/$1/annotations" --jq ".[]|select(.title|test(\"$2\"))|.message" 2>/dev/null; }
jobs=$(gh run view "$id" --json jobs --jq '.jobs[]|"\(.databaseId)\t\(.conclusion)\t\(.name)"')
sj=$(echo "$jobs" | awk -F'\t' '$3=="summary"{print $1}')
{
  note "$sj" '^Suite ' | head -1
  note "$sj" '^Results$'
  echo "$jobs" | awk -F'\t' '$2=="failure" && $3!="summary"{print $1"\t"$3}' | while IFS=$'\t' read -r j n; do
    echo "--- $n"; note "$j" '\.py' | head -10 | cut -c1-300 | sed 's/^/  FAIL /'
  done
} > "$out"
cat "$out"
concl=$(gh run view "$id" --json conclusion --jq .conclusion)
echo "result: $concl (commit ${sha:0:9}, waited $(( ($(date +%s)-t0)/60 )) min)"
[ "$concl" = success ]
