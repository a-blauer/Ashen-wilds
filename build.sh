#!/usr/bin/env bash
# Build dist/ashen-wilds.html from src/base.html + src/modules/* via the patch chain, then syntax-check it.
set -e
T=$(mktemp -d)
cd "$(dirname "$0")"
export AW_ROOT="$PWD" AW_OUT="${AW_OUT:-$PWD/dist/ashen-wilds.html}"
mkdir -p "$(dirname "$AW_OUT")"
cp src/base.html "$AW_OUT"
for p in pV2 pV3 pV4 pV5 pV6 $(cd build && ls pG_*.py 2>/dev/null | sed "s/\.py$//" | sort) pV7; do python3 build/$p.py >$T/aw_$p.log 2>&1 || { echo "FAILED in $p"; tail -5 $T/aw_$p.log; exit 1; }; done
python3 -c "
import sys;t=open(sys.argv[1]).read();s=t[t.rindex('<script>')+8:t.rindex('</script>')];open('$T/aw_check.js','w').write(s)" "$AW_OUT"
node --check $T/aw_check.js && echo "BUILD_OK  $AW_OUT ($(wc -c <"$AW_OUT") bytes)"
