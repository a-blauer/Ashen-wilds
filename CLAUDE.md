# Kill Quest — standing instructions for every session

- Read README.md first (layout, conventions, publishing).
- **Testing (owner's request):** don't run the whole suite one test at a time on the session machine. Push, then check the
  cloud runs: the smoke suite runs on every push to main (`.github/workflows/tests.yml`, `test/smoke.txt`), and the full suite
  (`gh api -X POST repos/a-blauer/Ashen-wilds/actions/workflows/tests.yml/dispatches -f ref=main -f "inputs[suite]=full"`, `test/full.txt`) runs before every publish. Publish only when it is green.
  Locally, run just the focused test for the change you are making (one browser at a time).
- The owner is a beginner programmer: short, plain explanations.
