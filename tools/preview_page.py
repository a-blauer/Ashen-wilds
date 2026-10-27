#!/usr/bin/env python3
# The intro preview page = the game page with the preview switched on (window.KQ_PREVIEW, src/js/3083) and its own title.
#   python3 tools/preview_page.py IN.html OUT.html     (used by tools/build_preview.sh and test/v159_preview.py)
import sys
# the key listener goes first, before any of the game's own, so the preview's keys (Space, arrows...) always reach it
ON = ("<script>window.KQ_PREVIEW=1;window.AW_NOTITLE=1;window.KQPV_K=1;"
      "['keydown','keyup'].forEach(function(t){addEventListener(t,function(e){if(window.kqpvKeys)kqpvKeys(e)},true)})</script>\n")
def page(h):
    h = h.replace('<title>Kill Quest</title>', '<title>Kill Quest Intro Preview</title>', 1)
    assert 'Intro Preview' in h, 'title not found'
    i = h.rindex('<script')   # the game script is the last one on the page
    return h[:i] + ON + h[i:]
if __name__ == '__main__':
    open(sys.argv[2], 'w', encoding='utf-8').write(page(open(sys.argv[1], encoding='utf-8').read()))
