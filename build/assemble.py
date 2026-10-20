"""Assemble the single-file game: src/page.html + src/style.css + src/js/*.js (in file-name order) -> out.

    python3 assemble.py <src dir> <out file>
"""
import sys, os, glob
src, out = sys.argv[1], sys.argv[2]
page = open(os.path.join(src, 'page.html'), encoding='utf-8').read()
css = open(os.path.join(src, 'style.css'), encoding='utf-8').read()
js = ''.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(src, 'js', '*.js'))))
assert page.count('/*@@CSS@@*/') == 1 and page.count('//@@JS@@') == 1, 'page.html markers missing'
html = page.replace('/*@@CSS@@*/', css, 1).replace('//@@JS@@', js, 1)
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html)
