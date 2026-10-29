#!/usr/bin/env bash
# Run the test suite on GitHub Actions for the current commit and wait for the result (needs `gh`; repo is public, minutes are free).
#   tools/ci.sh                      # full suite: pushes HEAD to branch ci/<your branch>, which starts the workflow
#   tools/ci.sh smoke                # smoke | changed | full, started by hand on branch ci-run/<branch>-<suite>
#   tools/ci.sh full v57t.py v60t.py # only these tests of the suite (e.g. re-run failures after a fix)
#   RUN=<run id> tools/ci.sh full     # only read the results of an existing run (no push, no new run)
# Commit first: only committed work is tested. Prints one PASS / FAIL line per test (with the FAIL lines of failed tests);
# exit 0 only when every test passed. Also saved to test/out/suite/gh-<suite>.summary.txt.
# This workspace can't download Actions logs or artifacts (blocked); results come back as annotations through the API.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
suite=${1:-full}; shift || true; only="$*"
case $suite in smoke|changed|full) ;; *) echo "suite must be smoke, changed or full"; exit 2;; esac
[ -z "$(git status --porcelain -- src test viewer build.sh .github)" ] || echo "note: uncommitted changes are NOT tested"
repo=$(gh api 'repos/{owner}/{repo}' --jq .full_name)   # REST only: GraphQL (gh repo view) is blocked here
sha=$(git rev-parse HEAD)
br=$(git rev-parse --abbrev-ref HEAD); [ "$br" = HEAD ] && br=detached
br=${br#ci/}; br=${br#ci-run/}; ref="ci/$br"   # a push to ci/* starts the full suite by itself
[ "$suite" = full ] && [ -z "$only" ] || ref="ci-run/$br-$suite${only:+-some}"   # ci-run/* runs only when started by hand
if [ -n "${RUN:-}" ]; then id=$RUN; ev=; else
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
fi
echo "run $id: $(gh run view "$id" --json url --jq .url)"
t0=$(date +%s)
# wait for the run (gh run watch fails in this workspace: it returned at once and the results were read too early)
until [ "$(gh run view "$id" --json status --jq .status 2>/dev/null || true)" = completed ]; do sleep 30; done
mkdir -p test/out/suite
out=test/out/suite/gh-$suite.summary.txt
note() { gh api "repos/$repo/check-runs/$1/annotations" --jq ".[]|select((.title//\"\")|test(\"$2\"))|.message" 2>/dev/null || true; }
# the job list page by page through repos/<owner>/<repo>/... (gh run view follows GitHub's next-page links, which use
# repositories/<id>/... paths that this workspace's proxy refuses once a run has more than 100 jobs)
jobs=$(for pg in $(seq 10); do r=$(gh api "repos/$repo/actions/runs/$id/jobs?per_page=100&page=$pg" --jq '.jobs[]|"\(.id)\t\(.conclusion)\t\(.name)"');
  [ -n "$r" ] || break; echo "$r"; done)
sj=$(echo "$jobs" | awk -F'\t' '$3=="summary"{print $1}')
{
  note "$sj" '^Suite ' | head -1
  note "$sj" '^Results$'
  echo "$jobs" | awk -F'\t' '($2=="failure"||$2=="cancelled") && $3!="summary"{print $1"\t"$3}' | while IFS=$'\t' read -r j n; do
    echo "--- $n"; f=$(note "$j" '\.py' | head -10 | cut -c1-300 | sed 's/^/  FAIL /')
    if [ -n "$f" ]; then echo "$f"
    else   # no test output: the job stopped before or around the test (e.g. a setup step hung until the job's time limit)
      st=$(gh api "repos/$repo/actions/jobs/$j" --jq '[.steps[]|select(.conclusion=="failure" or .conclusion=="cancelled")|.name]|join(", ")' 2>/dev/null || true)
      echo "  (no test output; step that failed or was stopped: ${st:-unknown})"
      gh api "repos/$repo/check-runs/$j/annotations" --jq '.[]|select(.annotation_level=="failure")|.message' 2>/dev/null | head -3 | cut -c1-300 | sed 's/^/  /' || true
    fi
  done
} > "$out"
cat "$out"
concl=$(gh run view "$id" --json conclusion --jq .conclusion)
echo "result: $concl (commit ${sha:0:9}, waited $(( ($(date +%s)-t0)/60 )) min)"
[ "$concl" = success ]
