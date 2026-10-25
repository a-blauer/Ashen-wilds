#!/usr/bin/env bash
# Run the test suite on GitHub Actions for the current commit and wait for the result (needs `gh`; repo is public, minutes are free).
#   tools/ci.sh            # full suite: pushes HEAD to branch ci/<your branch>, which starts the workflow
#   tools/ci.sh smoke      # smoke | changed | full: pushes HEAD to ci/<branch>-<suite> and starts that suite by hand
# Commit first: only committed work is tested. Prints one PASS / FAIL line per test; exit 0 only when every test passed.
# The summary is also saved to test/out/suite/gh-<suite>.summary.txt (same place as run_suite.py's local summaries).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
suite=${1:-full}
case $suite in smoke|changed|full) ;; *) echo "suite must be smoke, changed or full"; exit 2;; esac
[ -z "$(git status --porcelain -- src test viewer build.sh .github)" ] || echo "note: uncommitted changes are NOT tested"
sha=$(git rev-parse HEAD)
br=$(git rev-parse --abbrev-ref HEAD); [ "$br" = HEAD ] && br=detached
ref="ci/${br#ci/}"; [ "$suite" = full ] || ref="$ref-$suite"
git fetch -q origin main || true   # a fresh main makes the push a small (thin) pack
pl=$(git push -q -f origin "HEAD:refs/heads/$ref" 2>&1) || { echo "$pl"; exit 1; }   # quiet unless the push fails
if [ "$suite" != full ]; then gh workflow run tests.yml --ref "$ref" -f suite="$suite"; ev=workflow_dispatch; else ev=push; fi
echo "testing $suite on ${sha:0:9} (branch $ref) ..."
id=
for i in $(seq 60); do
  id=$(gh run list -w tests.yml -b "$ref" -e "$ev" -L 5 --json databaseId,headSha --jq "[.[]|select(.headSha==\"$sha\")][0].databaseId // empty")
  [ -n "$id" ] && break; sleep 5
done
[ -n "$id" ] || { echo "no run started for $sha"; exit 1; }
echo "run $id: $(gh run view "$id" --json url --jq .url)"
gh run watch "$id" --interval 30 >/dev/null 2>&1 || true
mkdir -p test/out/suite
out=test/out/suite/gh-$suite.summary.txt
gh run view "$id" --log --job "$(gh run view "$id" --json jobs --jq '.jobs[]|select(.name=="summary")|.databaseId')" 2>/dev/null \
  | sed -n 's/^summary\tSummary\t[^ ]* //p' | grep -E '^(PASS|FAIL|[a-z]+: [0-9]+/)' > "$out" || true
cat "$out"
concl=$(gh run view "$id" --json conclusion --jq .conclusion)
echo "result: $concl (commit ${sha:0:9})"
[ "$concl" = success ]
