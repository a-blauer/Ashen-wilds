# Load the game, start a warrior, print town stats and page errors (town rebuild sanity check).
import play
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    try:
        pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext',timeout=20000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=20000);pg.wait_for_timeout(3000)
    except Exception as e: print('CLICK FAIL',str(e)[:200])
    print(ev("()=>{try{const T=TOWNS[0];return {col:T.col.map(c=>[+c.x.toFixed(2),+c.z.toFixed(2)]).join(' '),lamps:TLAMP.length,party:party.length}}catch(e){return String(e)}}"))
play.run(s)
