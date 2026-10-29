#!/usr/bin/env python3
# The detail test page = the game page with tools/detail/pre.js in front of the game script, tools/detail/post.js after it,
# the test switched on (window.KQ_DETAIL) and its own title. The game itself never contains these files.
#   python3 tools/detail_page.py dist/ashen-wilds.html dist/detail.html     (used by tools/build_detail.sh and test/kqd_detail.py)
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
ON = "<script>window.KQ_DETAIL=1;window.AW_NOTITLE=1</script>\n"
def page(h):
    pre = open(os.path.join(HERE, 'detail', 'pre.js'), encoding='utf-8').read()
    post = open(os.path.join(HERE, 'detail', 'post.js'), encoding='utf-8').read()
    h = h.replace('<title>Kill Quest</title>', '<title>Kill Quest Detail Test</title>', 1)
    assert 'Detail Test' in h, 'title not found'
    i, j = h.rindex('<script>'), h.rindex('</script>')   # the game script is the last one on the page
    # one script: pre.js must run before the game's own code but share its scope (it replaces lpsObj before 0750 runs)
    return h[:i] + ON + '<script>' + pre + '\n;\n' + h[i + 8:j] + '\n;\n' + post + h[j:]
if __name__ == '__main__':
    open(sys.argv[2], 'w', encoding='utf-8').write(page(open(sys.argv[1], encoding='utf-8').read()))
