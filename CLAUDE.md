# Kill Quest — standing instructions for every session

- Read README.md first (layout, conventions, publishing).
- **New bosses and mini bosses:** follow `docs/BOSS_RECIPE.md` (the Vorraxis standard, v144: the owner's favourite fight). Read it and
  the three Vorraxis files (3031–3033) before designing or building any boss fight. Reuse the method and the standard, never
  Vorraxis's ooze theme: each boss gets its own theme, look, moves and mechanics.
- **Modelling any enemy, boss, folk or creature (owner's request, Oct 31 2026):** follow `docs/MODEL_DETAIL_RECIPE.md`. Detail
  comes from colour, shading, textures and good skin weights, not more triangles: geometry only for the outline and bending
  joints, everything inside the outline is paint. Keep the low-poly, faceted, dark-fantasy look and its triangle budgets.
  Non-human enemies built on the humanoid kit do NOT keep a human outline: change proportions, stature, posture and symmetry
  so the creature's identity reads from its silhouette (recipe section 0).
- **Testing (owner's request, Oct 25 2026): use GitHub Actions again.** The repo is public now, so Actions minutes are free and
  every test runs as its own parallel job — far faster than this 2-core machine. Commit, then run `tools/ci.sh` (in the background):
  it pushes HEAD to a `ci/<branch>` branch, waits, prints one PASS / FAIL line per test and saves the summary to
  `test/out/suite/gh-<suite>.summary.txt`; exit 0 = all green.
  - after a change: `tools/ci.sh changed` (smoke + the tests `test/affects.txt` maps the changed files to vs `main`; the whole full
    suite when core files or the test tools change). `python3 test/run_suite.py changed --list` shows what it would run.
  - before every publish: `tools/ci.sh` (full suite on the exact commit you will publish). Publish only when it is green.
  - failed test: `tools/ci.sh` prints its `FAIL …` lines (up to 10, read from the run's annotations: this workspace can't download
    Actions logs or artifacts, so `gh run view --log` / `gh run download` fail with Forbidden; the owner can see them in the Actions
    tab). Reproduce and fix locally with `cd test && python3 run_suite.py full <test>.py`, then re-check on GitHub with
    `tools/ci.sh full <test>.py`.
  - `ci/*` and `ci-run/*` branches are scratch: never merge from them; `main` stays the source of truth (push to it as before).
  - fallback when GitHub is unreachable: the same suites locally with `cd test && python3 run_suite.py changed|full` (one suite at
    a time: 2 cores, and helper agents run on this same machine).
  Tests run in fast mode (`test/fast.py`: the game view only draws for screenshots, ~30x faster game loop), on GitHub too; put
  `FAST=0` before a line in full.txt only if a test truly needs every frame drawn.
  **Retry (owner's request, Oct 27 2026):** a failed test runs once more (`test/ci_run.py`, `CI_RETRY`, default 1), on GitHub and
  locally. A pass on the second try counts and is listed as `PASS (retry)` (the summary says how many): a flaky test, worth making
  steady but not a reason to hold a publish. A test that fails both tries is a real failure.
  New tests: add to `full.txt` and to the matching rules in `test/affects.txt`; every test must print `FAIL …` lines on a wrong result.
  **Small tweaks (owner's request):** for a balance number or similar one-line tuning change, skip the full suite: a focused
  local test plus a green `changed` run is enough to publish.
- **Videos (owner's request, Oct 26 2026): render on GitHub, and only what changed.** The intro cinematic's video is made with
  `tools/render.sh <from-to> ...` (seconds; `end` = to the end): it pushes a render request, GitHub draws the 5 s pieces those
  ranges touch (all at the same time) and reuses the rest from the last render, then the script downloads `test/out/intro.mp4`.
  Give exactly the time ranges your change affects (a change that shifts later shots in time affects everything after it);
  `tools/render.sh all` only when every frame changed or the cache is gone (it also fills itself in when pieces are missing).
  Don't render the full video locally.
- The owner is a beginner programmer: short, plain explanations.
