# Kill Quest — standing instructions for every session

- Read README.md first (layout, conventions, publishing).
- **Testing (owner's request, Oct 2026): no GitHub Actions.** The Actions minutes were nearly used up, so the workflow no longer
  runs on push; don't dispatch it unless the owner asks. Run suites in the session workspace instead, in the background:
  `cd test && python3 run_suite.py smoke` after a change, `python3 run_suite.py full` before every publish (one test at a time,
  against a snapshot of `dist/`; results in `test/out/suite/<suite>.summary.txt`). Publish only when it is green.
  While a suite runs, don't start another browser test (the session machine has 2 cores). Use `JOBS=2` only on a 4+ core machine.
  **Small tweaks (owner's request):** for a balance number or similar one-line tuning change, skip the full suite: a focused
  local test plus a green smoke run is enough to publish.
- The owner is a beginner programmer: short, plain explanations.
