# Kill Quest — standing instructions for every session

- Read README.md first (layout, conventions, publishing).
- **New bosses and mini bosses:** follow `docs/BOSS_RECIPE.md` (the Vorraxis standard, v144: the owner's favourite fight). Read it and
  the three Vorraxis files (3031–3033) before designing or building any boss fight. Reuse the method and the standard, never
  Vorraxis's ooze theme: each boss gets its own theme, look, moves and mechanics.
- **Testing (owner's request, Oct 2026): no GitHub Actions.** The Actions minutes ran out, so the workflow no longer runs on
  push; don't dispatch it unless the owner asks. Run suites in the session workspace, in the background, with `test/run_suite.py`:
  - after a change: `python3 run_suite.py changed` (smoke + the tests `test/affects.txt` maps the changed files to; the whole full
    suite when core files or the test tools change). `--list` shows what it would run.
  - before every publish: `python3 run_suite.py full`. Publish only when it is green (`test/out/suite/<suite>.summary.txt`).
  Tests run in fast mode (`test/fast.py`: the game view only draws for screenshots, ~30x faster game loop); put `FAST=0` before a
  line in full.txt only if a test truly needs every frame drawn. Run one suite at a time: the machine has 2 cores, and helper
  agents (even "remote" ones) run on this same machine, so splitting a suite across them only slows it down.
  New tests: add to `full.txt` and to the matching rules in `test/affects.txt`; every test must print `FAIL …` lines on a wrong result.
  **Small tweaks (owner's request):** for a balance number or similar one-line tuning change, skip the full suite: a focused
  local test plus a green `changed` run is enough to publish.
- The owner is a beginner programmer: short, plain explanations.
