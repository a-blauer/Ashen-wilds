"""Split the single-file build for publishing: a small page (the markup + stylesheet, loading game.js) and the game script.
    python3 split.py dist/ashen-wilds.html dist/artifact
The artifact page is then small enough for any session to re-read before republishing (the script goes up as a supporting file).
"""
import sys, os
src, out = sys.argv[1], sys.argv[2]
h = open(src, encoding='utf-8').read()
i, j = h.rindex('<script>'), h.rindex('</script>')
js = h[i + 8:j]
page = h[:i] + '<script src="game.js"></script>' + h[j + 9:]
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(page)
open(os.path.join(out, 'game.js'), 'w', encoding='utf-8').write(js)
print('SPLIT_OK', out, 'index.html', len(page), 'bytes · game.js', len(js), 'bytes')
