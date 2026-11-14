# v232 — the two endings (working plan; delete or fold into README when shipped)

Owner (Nov 14 2026): talking to the man at the fountain gives a choice.
* **Fight him** → transported to an epic finale fight (large effects, intense mechanics, a stunning setpiece). After killing him his
  essence is released and sinks back into the ground; the camera pans over the zones as life returns (the natural balance restored).
* **Side with him** → transported to an area with a roster of **4** new original bosses (owner picked 4), each with unique mechanics,
  rising difficulty; you can return to Duskhold between bosses. When all are cleared he crowns you and marks you as devoted to him;
  cut to a gilded palace: he on a great throne, you at his side, an outrageously elaborate essence fountain in the middle of the room.
* Owner chose: **everything in one release** (no publish until all of it is done and tested).

Name used for the man: **Ythrael, the Voice Below** (placeholder, tell the owner).

## Files (all new, prefix `wk232` kit / per boss prefix)
| file | what |
|---|---|
| `4010-v232-warden-kit.js` | generic arena-boss kit `wk232*`: register a boss def → instance rename, spawn, start/seal, reset, win, AI/footwork, engine glue (svCtx/svHitNow), HUD + posture bar, recall block, exit portal, lair build/visibility, shared move effects (lanes, bolts, eruptions, pools) |
| `4011-v232-endings-flow.js` | state `FN232` {path 0/1 fight/2 side, n roster cleared, won, crowned}, the talk window at the fountain, travel, saves `x2.fn232`, co-op look (crown + mark), cheats/viewer entries |
| `4020/4021/4022` | Warden 1 **Oakenhart, the Rootbound Stag** (Hillside trial `insG(1,4)`), lv 52. Signature: Rampage — lure his charge into a runestone → antlers stuck (stagger); 4 stones |
| `4030/4031/4032` | Warden 2 **Maelis, the Tempest Roc** (Searing Sands trial `insG(3,4)`), lv 53. Signature: Static Charge — carry the charge to a lightning rod; 3 grounded charges bring her down |
| `4040/4041/4042` | Warden 3 **Brassmaw, the Kiln Colossus** (Dirge trial `insG(4,4)`), lv 54. Signature: Overheat/Quench — lead his charge through a quench pool to crack the core open; Phase II hot floor quadrants |
| `4050/4051/4052` | Warden 4 **Seraphel, the Dawn Arbiter** (Citadel trial `insG(5,4)`), lv 55. Signature: Verdict — stand in a pillar's shadow (sun angle moves) or burn; rotating sun-ray |
| `4060/4061/4062` | Finale **Ythrael** (new special instance `apex`, g 35, free strip x 8–108, y 1452–1552), lv 56, three phases (robed duelist → winged → the gangly truth). Signature: Thirst — his blows spill essence motes; he inhales what is left to heal; the hero who gathers 6 ruptures him |
| `4070` | fight-path ending cinematic "The Land Breathes" |
| `4071` | side-path crowning + gilded palace cinematic |

Each boss follows docs/BOSS_RECIPE.md (6 Phase I moves, Phase II at 55% that changes the arena, one signature mechanic, posture).
Tests: `test/v232_wardens.py` (per boss: builds, every move runs, phase II, signature both ways, reset, kill, saves),
`test/v232_flow.py` (choice, travel, return, crown, both endings), `test/v232_coop.py` (partner sees crown/mark; fights local).
Model review (docs/MODEL_REVIEW.md) once per boss model before pictures go to the owner.

## Progress log
- [ ] kit  - [ ] flow  - [ ] Oakenhart  - [ ] Maelis  - [ ] Brassmaw  - [ ] Seraphel  - [ ] Ythrael  - [ ] ending A  - [ ] ending B  - [ ] tests/co-op/CI/publish
