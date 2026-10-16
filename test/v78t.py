# v78 checks: every weapon type's basic attack, the Stable + all mounts, new items (drops, tooltip, save/load)
import subprocess,sys,os
H=os.path.dirname(os.path.abspath(__file__))
for f in ['v78_weapons.py','v78_mounts.py','v78_items.py']:
    print('=====',f,flush=True);subprocess.run([sys.executable,os.path.join(H,f)])
