#!/usr/bin/env python3
# Joins the intro video's pieces into out/intro.mp4 with the sound (used by .github/workflows/render.yml).
# New pieces (new/sNNN.mp4) replace the cached ones (segs/); every piece must be there. Writes segs/manifest.json.
import json, os, shutil, subprocess, sys
fps = float(os.environ.get('FPS', '24')); seg = int(os.environ.get('SEG', '120'))
n = int(os.environ['N']); nseg = int(os.environ['NSEG'])
os.makedirs('segs', exist_ok=True); os.makedirs('out', exist_ok=True)
new = sorted(f for f in os.listdir('new') if f.endswith('.mp4')) if os.path.isdir('new') else []
for f in new: shutil.copy('new/' + f, 'segs/' + f)
miss = [i for i in range(nseg) if not os.path.exists('segs/s%03d.mp4' % i)]
if miss: sys.exit('render_join: pieces missing: %s' % miss)
json.dump({'fps': fps, 'w': os.environ.get('W'), 'h': os.environ.get('H'), 'seg': seg, 'n': n, 'have': list(range(nseg))},
          open('segs/manifest.json', 'w'))
with open('list.txt', 'w') as f:
    for i in range(nseg): f.write("file 'segs/s%03d.mp4'\n" % i)
def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p],
                                capture_output=True, text=True).stdout.strip() or 0)
ok = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'video.mp4']).returncode == 0
if not ok or abs(dur('video.mp4') - n / fps) > .5:   # pieces from different encoder versions: encode the whole video again
    print('join: re-encoding the joined video', flush=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                    '-crf', '20', '-preset', 'medium', 'video.mp4'], check=True)
cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', 'video.mp4']
if os.path.exists('snd/v151_sound.wav'): cmd += ['-i', 'snd/v151_sound.wav', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest']
else: cmd += ['-c', 'copy']
subprocess.run(cmd + ['-movflags', '+faststart', 'out/intro.mp4'], check=True)
print('joined %d pieces (%d new): %.1f s, %.1f MB' % (nseg, len(new), dur('out/intro.mp4'), os.path.getsize('out/intro.mp4') / 1e6))
