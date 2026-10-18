# v90 balance audit

Training dummy = the zone roster mob of that level (median health type, real stats, `enStats`), level-appropriate gear (rare ITPL templates of the tier, no random affixes),
talents auto-spent (offence branch first), companions out of the fight, crits counted as expected value. Rotation = basic attacks + the 4 abilities with the best damage per cooldown, cast whenever ready (real mana and class resource), 30 s.
"Before" = the same harness on the v89 build (no ranks). Runs vary by a few % (hit spread, procs).

## Rotation DPS by level (before → after, deviation from the class average)

| Level (rank) | warrior | paladin | assassin | ranger | mage | spread before → after |
|---|---|---|---|---|---|---|
| 5 (r1) | 144 (-22%) → **169 (-3%)** | 204 (+10%) → **181 (+3%)** | 171 (-8%) → **188 (+7%)** | 184 (-1%) → **173 (-2%)** | 225 (+21%) → **166 (-6%)** | 44% → 13% |
| 15 (r2) | 501 (-29%) → **528 (-6%)** | 566 (-20%) → **518 (-8%)** | 562 (-21%) → **557 (-1%)** | 811 (+14%) → **564 (+0%)** | 1107 (+56%) → **646 (+15%)** | 85% → 23% |
| 30 (r3) | 1255 (-19%) → **1501 (+12%)** | 1292 (-16%) → **1353 (+1%)** | 1519 (-2%) → **1322 (-1%)** | 1415 (-8%) → **1203 (-10%)** | 2241 (+45%) → **1311 (-2%)** | 64% → 22% |
| 50 (r5) | 2586 (-22%) → **3072 (+0%)** | 3375 (+2%) → **3258 (+6%)** | 3172 (-4%) → **2958 (-3%)** | 3961 (+19%) → **3114 (+2%)** | 3491 (+5%) → **2912 (-5%)** | 41% → 11% |

## Time to kill / toughness (after)

| Level | class | basic DPS | avg basic hit | mob HP | basic hits to kill | TTK normal | TTK elite (×3.4 HP) | mob hits to kill you | your HP |
|---|---|---|---|---|---|---|---|---|---|
| 5 | warrior | 118 | 101 | 320 | 3.2 | 1.9s | 6.4s | 13.9 | 352 |
| 15 | warrior | 333 | 285 | 724 | 2.5 | 1.4s | 4.7s | 8.4 | 784 |
| 30 | warrior | 886 | 631 | 1730 | 2.7 | 1.2s | 3.9s | 11.1 | 1430 |
| 50 | warrior | 1549 | 1047 | 2406 | 2.3 | 0.8s | 2.7s | 8.9 | 2752 |
| 5 | paladin | 130 | 92 | 320 | 3.5 | 1.8s | 6.0s | 17.1 | 361 |
| 15 | paladin | 384 | 235 | 724 | 3.1 | 1.4s | 4.7s | 10.6 | 803 |
| 30 | paladin | 745 | 455 | 1730 | 3.8 | 1.3s | 4.3s | 14.1 | 1464 |
| 50 | paladin | 2138 | 857 | 2406 | 2.8 | 0.7s | 2.5s | 11.6 | 2347 |
| 5 | assassin | 161 | 71 | 320 | 4.5 | 1.7s | 5.8s | 8.7 | 269 |
| 15 | assassin | 420 | 186 | 724 | 3.9 | 1.3s | 4.4s | 6.8 | 599 |
| 30 | assassin | 868 | 328 | 1730 | 5.3 | 1.3s | 4.4s | 6.8 | 1093 |
| 50 | assassin | 1680 | 571 | 2406 | 4.2 | 0.8s | 2.8s | 6.0 | 1754 |
| 5 | ranger | 124 | 79 | 320 | 4.0 | 1.9s | 6.3s | 10.1 | 287 |
| 15 | ranger | 350 | 224 | 724 | 3.2 | 1.3s | 4.4s | 7.4 | 641 |
| 30 | ranger | 620 | 399 | 1730 | 4.3 | 1.4s | 4.9s | 10.2 | 1405 |
| 50 | ranger | 1038 | 665 | 2406 | 3.6 | 0.8s | 2.6s | 8.7 | 2255 |
| 5 | mage | 96 | 72 | 320 | 4.4 | 1.9s | 6.6s | 7.3 | 237 |
| 15 | mage | 249 | 188 | 724 | 3.8 | 1.1s | 3.8s | 7.4 | 528 |
| 30 | mage | 530 | 400 | 1730 | 4.3 | 1.3s | 4.5s | 6.2 | 964 |
| 50 | mage | 945 | 713 | 2406 | 3.4 | 0.8s | 2.8s | 7.8 | 1547 |

## Level 50: one cast on one target, in basic hits

before = v89 (no ranks) · r1 / r5 = after, rank 1 / rank 5 (rank 1 = rank 5 ÷ 1.48). Rule: ≤ ~4 at max rank, big-cooldown and lasting (summons, zones over 5-15 s) ≤ ~5.5.

| class | ability | before | after r1 | after r5 | cooldown r5 |
|---|---|---|---|---|---|
| warrior | Skull Splitter | 5.1 | 2.3 | 3.4 | 6.8s |
| warrior | Whirlwind | 5.0 | 2.0 | 3.0 | 9.35s |
| warrior | Titan's Fall | 3.1 | 2.8 | 4.1 | 22.1s |
| warrior | Execute | 3.1 | 2.4 | 3.5 | 10.2s |
| warrior | Earthshatter | 2.1 | 2.2 | 3.2 | 13.6s |
| warrior | Leap Slam | 1.6 | 1.8 | 2.7 | 7.65s |
| warrior | Bull Rush | 1.2 | 1.7 | 2.5 | 7.65s |
| warrior | Seismic Rupture | 1.8 | 1.6 | 2.4 | 10.2s |
| warrior | Cleave | 1.5 | 1.5 | 2.2 | 4.25s |
| warrior | Chain Hook | 0.9 | 1.5 | 2.2 | 11.9s |
| warrior | Shockwave | 1.6 | 1.5 | 2.1 | 6.8s |
| warrior | Intimidating Shout | 0.5 | 0.8 | 1.2 | 13.6s |
| paladin | Blessed Hammers | 2.9 | 2.9 | 4.3 | 11.9s |
| paladin | Sanctuary | 1.8 | 2.5 | 3.7 | 25.5s |
| paladin | Beacon of Light | 2.2 | 2.5 | 3.6 | 18.7s |
| paladin | Hammer of Light | 2.2 | 2.0 | 3.0 | 11.9s |
| paladin | Consecration | 1.9 | 1.8 | 2.6 | 11.9s |
| paladin | Avenger's Shield | 1.9 | 1.7 | 2.5 | 8.5s |
| paladin | Shield Bash | 1.6 | 1.5 | 2.3 | 5.95s |
| paladin | Heaven's Wrath | 2.0 | 1.5 | 2.3 | 23.8s |
| paladin | Judgment | 1.0 | 1.4 | 2.1 | 6.8s |
| paladin | Divine Intervention | 0.9 | 1.4 | 2.1 | 63.75s |
| paladin | Penance | 1.4 | 1.4 | 2.0 | 15.3s |
| paladin | Holy Smite | 0.9 | 1.4 | 2.0 | 5.1s |
| paladin | Crusader's Charge | 0.8 | 1.1 | 1.7 | 10.2s |
| assassin | Eviscerate | 10.2 | 2.7 | 4.0 | 5.1s |
| assassin | Shadow Clone | 10.2 | 3.1 | 4.6 | 15.3s |
| assassin | Eclipse | 10.1 | 3.4 | 5.0 | 20.4s |
| assassin | Venom Flask | 6.5 | 3.2 | 4.8 | 8.5s |
| assassin | Shuriken Volley | 5.8 | 1.9 | 2.9 | 4.25s |
| assassin | Shadow Rush | 5.7 | 2.4 | 3.5 | 5.1s |
| assassin | Caltrops | 4.6 | 3.0 | 4.5 | 13.6s |
| assassin | Garrote | 4.3 | 2.0 | 2.9 | 10.2s |
| assassin | Phantom Strike | 3.8 | 2.0 | 2.9 | 9.35s |
| assassin | Death Mark | 3.4 | 2.3 | 3.4 | 13.6s |
| assassin | Thousand Cuts | 3.1 | 2.0 | 3.0 | 15.3s |
| assassin | Envenom | 2.1 | 1.8 | 2.6 | 12.75s |
| assassin | Smoke Bomb | 2.1 | 1.6 | 2.4 | 8.5s |
| assassin | Fan of Knives | 1.9 | 1.4 | 2.1 | 6.8s |
| ranger | Wild Hunt | 35.7 | 3.2 | 4.7 | 22.95s |
| ranger | Call of the Wild | 16.4 | 3.3 | 4.9 | 13.77s |
| ranger | Rapid Fire | 9.4 | 2.3 | 3.4 | 7.65s |
| ranger | Rain of Arrows | 8.3 | 1.8 | 2.6 | 7.65s |
| ranger | Aimed Shot | 6.0 | 2.7 | 4.1 | 9.94s |
| ranger | Multishot | 4.1 | 2.1 | 3.1 | 3.83s |
| ranger | Explosive Trap | 3.9 | 2.1 | 3.1 | 6.12s |
| ranger | Barrage | 3.5 | 1.7 | 2.5 | 7.65s |
| ranger | Explosive Arrow | 3.5 | 2.2 | 3.2 | 5.36s |
| ranger | Hawk Dive | 2.6 | 2.3 | 3.4 | 6.88s |
| ranger | Stampede | 3.3 | 1.8 | 2.7 | 16.83s |
| ranger | Piercing Arrow | 3.0 | 2.2 | 3.2 | 5.36s |
| ranger | Disengage | 1.4 | 1.6 | 2.4 | 6.12s |
| ranger | Entangling Roots | 1.6 | 1.4 | 2.1 | 13.77s |
| ranger | Frost Trap | 1.5 | 1.3 | 1.9 | 12.24s |
| mage | Wall of Fire | 7.6 | 3.5 | 5.2 | 11.56s |
| mage | Singularity | 7.4 | 3.3 | 4.9 | 15.89s |
| mage | Disintegrate | 6.5 | 3.1 | 4.6 | 7.95s |
| mage | Blizzard | 5.9 | 1.9 | 2.8 | 9.39s |
| mage | Meteor | 4.5 | 2.2 | 3.3 | 10.12s |
| mage | Comet Storm | 3.9 | 2.9 | 4.4 | 21.68s |
| mage | Arcane Missiles | 3.8 | 1.8 | 2.7 | 3.61s |
| mage | Fireball | 2.7 | 2.0 | 3.0 | 3.25s |
| mage | Frozen Orb | 1.7 | 2.0 | 2.9 | 8.67s |
| mage | Chain Lightning | 2.6 | 1.9 | 2.9 | 5.78s |
| mage | Dragon's Breath | 2.3 | 1.3 | 1.9 | 6.5s |
| mage | Frost Nova | 1.5 | 1.5 | 2.2 | 6.5s |

## Every level: ability damage per cast in basic hits (one target)

### Level 5, rank 1

| class | ability: hits-equivalent (cooldown) |
|---|---|
| warrior | Bull Rush 1.8 (9s), Leap Slam 1.8 (9s), Cleave 1.5 (5s) |
| paladin | Shield Bash 1.2 (7s), Holy Smite 0.9 (6s) |
| assassin | Eviscerate 1.6 (6s), Shadow Rush 1.2 (6s), Fan of Knives 0.9 (8s) |
| ranger | Piercing Arrow 1.6 (7s), Multishot 1.4 (5s), Disengage 1.1 (8s) |
| mage | Fireball 1.7 (4.5s), Frost Nova 1.1 (9s) |

### Level 15, rank 2

| class | ability: hits-equivalent (cooldown) |
|---|---|
| warrior | Skull Splitter 2.2 (8s), Bull Rush 1.7 (9s), Leap Slam 1.7 (9s), Cleave 1.5 (5s), Shockwave 1.5 (8s), Intimidating Shout 0.8 (16s) |
| paladin | Blessed Hammers 2.2 (14s), Beacon of Light 2.0 (22s), Shield Bash 1.6 (7s), Hammer of Light 1.6 (14s), Consecration 1.4 (14s), Holy Smite 1.1 (6s), Judgment 1.1 (8s) |
| assassin | Venom Flask 2.5 (10s), Eviscerate 1.9 (6s), Shadow Rush 1.7 (6s), Shuriken Volley 1.3 (5s), Smoke Bomb 1.1 (10s), Fan of Knives 1.0 (8s) |
| ranger | Call of the Wild 2.5 (18s), Explosive Arrow 1.9 (7s), Piercing Arrow 1.8 (7s), Multishot 1.5 (5s), Disengage 1.3 (8s), Frost Trap 1.0 (16s) |
| mage | Fireball 2.3 (4.5s), Chain Lightning 2.2 (8s), Frozen Orb 2.0 (12s), Arcane Missiles 1.9 (5s), Blizzard 1.9 (13s), Frost Nova 1.5 (9s), Dragon's Breath 1.5 (9s) |

### Level 30, rank 3

| class | ability: hits-equivalent (cooldown) |
|---|---|
| warrior | Skull Splitter 2.8 (7.36s), Whirlwind 2.3 (10.12s), Earthshatter 2.2 (14.72s), Seismic Rupture 2.1 (11.04s), Leap Slam 2.0 (8.28s), Bull Rush 1.9 (8.28s), Shockwave 1.8 (7.36s), Cleave 1.6 (4.6s), Intimidating Shout 1.0 (14.72s) |
| paladin | Blessed Hammers 4.2 (12.88s), Beacon of Light 3.6 (20.24s), Sanctuary 3.6 (27.6s), Hammer of Light 3.1 (12.88s), Consecration 2.8 (12.88s), Avenger's Shield 2.1 (9.2s), Judgment 2.0 (7.36s), Shield Bash 1.9 (6.44s), Crusader's Charge 1.9 (11.04s), Holy Smite 1.8 (5.52s) |
| assassin | Shadow Clone 3.7 (16.56s), Caltrops 3.7 (14.72s), Venom Flask 3.6 (9.2s), Eviscerate 3.0 (5.52s), Shadow Rush 2.4 (5.52s), Death Mark 2.0 (14.72s), Phantom Strike 2.0 (10.12s), Shuriken Volley 1.7 (4.6s), Fan of Knives 1.3 (7.36s), Smoke Bomb 1.3 (9.2s) |
| ranger | Call of the Wild 2.7 (16.56s), Explosive Arrow 2.1 (6.44s), Piercing Arrow 1.9 (6.44s), Hawk Dive 1.9 (8.28s), Rapid Fire 1.9 (9.2s), Explosive Trap 1.8 (7.36s), Multishot 1.6 (4.6s), Barrage 1.5 (9.2s), Rain of Arrows 1.5 (9.2s), Disengage 1.3 (7.36s), Frost Trap 1.1 (14.72s) |
| mage | Disintegrate 4.0 (10.12s), Blizzard 3.0 (11.96s), Frozen Orb 2.9 (11.04s), Meteor 2.8 (12.88s), Fireball 2.8 (4.14s), Arcane Missiles 2.3 (4.6s), Frost Nova 2.0 (8.28s), Chain Lightning 2.0 (7.36s), Dragon's Breath 1.8 (8.28s) |

### Level 50, rank 5

| class | ability: hits-equivalent (cooldown) |
|---|---|
| warrior | Titan's Fall 4.1 (22.1s), Execute 3.5 (10.2s), Skull Splitter 3.4 (6.8s), Earthshatter 3.2 (13.6s), Whirlwind 3.0 (9.35s), Leap Slam 2.7 (7.65s), Bull Rush 2.5 (7.65s), Seismic Rupture 2.4 (10.2s), Cleave 2.2 (4.25s), Chain Hook 2.2 (11.9s), Shockwave 2.1 (6.8s), Intimidating Shout 1.2 (13.6s) |
| paladin | Blessed Hammers 4.3 (11.9s), Sanctuary 3.7 (25.5s), Beacon of Light 3.6 (18.7s), Hammer of Light 3.0 (11.9s), Consecration 2.6 (11.9s), Avenger's Shield 2.5 (8.5s), Shield Bash 2.3 (5.95s), Heaven's Wrath 2.3 (23.8s), Judgment 2.1 (6.8s), Divine Intervention 2.1 (63.75s), Penance 2.0 (15.3s), Holy Smite 2.0 (5.1s), Crusader's Charge 1.7 (10.2s) |
| assassin | Eclipse 5.0 (20.4s), Venom Flask 4.8 (8.5s), Shadow Clone 4.6 (15.3s), Caltrops 4.5 (13.6s), Eviscerate 4.0 (5.1s), Shadow Rush 3.5 (5.1s), Death Mark 3.4 (13.6s), Thousand Cuts 3.0 (15.3s), Phantom Strike 2.9 (9.35s), Garrote 2.9 (10.2s), Shuriken Volley 2.9 (4.25s), Envenom 2.6 (12.75s), Smoke Bomb 2.4 (8.5s), Fan of Knives 2.1 (6.8s) |
| ranger | Call of the Wild 4.9 (13.77s), Wild Hunt 4.7 (22.95s), Aimed Shot 4.1 (9.94s), Hawk Dive 3.4 (6.88s), Rapid Fire 3.4 (7.65s), Piercing Arrow 3.2 (5.36s), Explosive Arrow 3.2 (5.36s), Explosive Trap 3.1 (6.12s), Multishot 3.1 (3.83s), Stampede 2.7 (16.83s), Rain of Arrows 2.6 (7.65s), Barrage 2.5 (7.65s), Disengage 2.4 (6.12s), Entangling Roots 2.1 (13.77s), Frost Trap 1.9 (12.24s) |
| mage | Wall of Fire 5.2 (11.56s), Singularity 4.9 (15.89s), Disintegrate 4.6 (7.95s), Comet Storm 4.4 (21.68s), Meteor 3.3 (10.12s), Fireball 3.0 (3.25s), Frozen Orb 2.9 (8.67s), Chain Lightning 2.9 (5.78s), Blizzard 2.8 (9.39s), Arcane Missiles 2.7 (3.61s), Frost Nova 2.2 (6.5s), Dragon's Breath 1.9 (6.5s) |

