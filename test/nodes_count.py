import play,json
def s(pg):
    print(json.dumps(pg.evaluate("()=>{const o={};MAP.props.forEach(q=>{const r=regionAt(q[0],q[1]);o[r]=o[r]||{};o[r][q[2]]=(o[r][q[2]]||0)+1});return [MAP.props.length,o,typeof CYD!='undefined'?CYD:null]}")))
play.run(s)
