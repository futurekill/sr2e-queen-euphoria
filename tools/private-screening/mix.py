#!/usr/bin/env python3
"""PRIVATE SCREENING, mixed (Queen Euphoria p.32-33). Euphoria's point of view through an inhibitor-free simsense rig:
close, intimate voices (hers and Craft's) with a small room; the attack muffled behind the studio door until the door
opens; a heartbeat from the crash to the cut; everything ends in a hard cut to black. Each element is levelled to a
target before mixing (ElevenLabs SFX come back at very different loudness). Final -16 LUFS, peaks -1.5 dB."""
import subprocess, json, os
H = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(H, "..", "..", "_work", "private-screening")
R = f"{W}/raw"; O = f"{W}/out"; os.makedirs(O, exist_ok=True)
dur = lambda f: float(json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", f"{R}/{f}.mp3"]))["format"]["duration"])
LV = lambda lufs: f"loudnorm=I={lufs}:TP=-2:LRA=11"
CLOSE = "highpass=f=70,acompressor=threshold=-22dB:ratio=3:attack=6:release=150:makeup=2,aecho=0.8:0.55:28|61:0.16|0.08"
MUFFLED = "lowpass=f=900,aecho=0.8:0.7:40|90:0.3|0.2"
DISTANT = "highpass=f=200,lowpass=f=5000,aecho=0.8:0.7:35|80:0.25|0.15"

P = []
def add(f, st, chain, end=None):
    if end is not None: chain += f",atrim=0:{end:.2f},afade=t=out:st={max(0, end-0.6):.2f}:d=0.6"
    P.append((f, st, chain))

t = 0.0
add("headset", t, LV(-18)); t += 4.4
add("limbo", t, LV(-34)); t += 4.6
studio0 = t
add("euph-rehearse", t + 2.5, f"{CLOSE},{LV(-19)}"); t = t + 2.5 + dur("euph-rehearse") + 1.6
add("euph-hate", t, f"{CLOSE},{LV(-21)}"); t += dur("euph-hate") + 0.8
m0 = t
add("montage", m0, f"{LV(-25)},afade=t=in:d=3", end=dur("montage") - 0.5)
crash = m0 + dur("montage") - 2.0
add("studio", studio0, f"{LV(-30)},afade=t=in:d=1.5", end=crash - studio0 + 0.3)
add("crash", crash, LV(-13))
add("carnage", crash + 0.9, f"{MUFFLED},{LV(-22)}")
t = crash + 2.2
add("euph-what", t, f"{CLOSE},{LV(-19)}"); t += dur("euph-what") + 1.4
add("door", t, LV(-21)); t += 2.0
add("chitter", t, LV(-20)); t += 1.6
add("euph-fear", t, f"{CLOSE},{LV(-21)}"); t += dur("euph-fear") + 0.4
add("craft-a", t, f"{CLOSE},{LV(-18)}"); t += dur("craft-a") + 0.6
add("chitter", t - 0.4, f"{LV(-26)},atrim=1.5:4.5,asetpts=PTS-STARTPTS")
add("craft-b", t, f"{CLOSE},{LV(-18)}"); t += dur("craft-b") + 0.7
add("craft-c", t, f"{CLOSE},{LV(-17)}"); t += dur("craft-c") + 0.2
add("guard", t, f"{DISTANT},{LV(-17)}")
add("gunfire", t + 0.8, LV(-14))
hit = t + min(dur("guard"), 2.4)
add("impact", hit, LV(-14))
add("euph-scream", hit + 0.5, f"{CLOSE},{LV(-17)}")
cut = hit + 0.5 + dur("euph-scream") + 0.15
hb = dur("heartbeat")
for k in range(int((cut - crash) // hb) + 1):   # the heartbeat runs from the crash to the cut
    s = crash + 0.4 + k * hb
    if s < cut: add("heartbeat", s, LV(-24), end=min(hb, cut - s))
add("blackout", cut, LV(-30))

args = ["ffmpeg", "-nostdin", "-y", "-loglevel", "error"]
for f, _, _ in P: args += ["-i", f"{R}/{f}.mp3"]
ch = [f"[{i}:a]aresample=44100,aformat=channel_layouts=stereo,{c},adelay={int(st*1000)}:all=1[p{i}]" for i, (_, st, c) in enumerate(P)]
ch.append(f"{''.join(f'[p{i}]' for i in range(len(P)))}amix=inputs={len(P)}:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=11[m]")
out = f"{O}/private-screening.mp3"
subprocess.check_call(args + ["-filter_complex", ";".join(ch), "-map", "[m]", "-ar", "44100", "-b:a", "192k", out])
print(f"private-screening.mp3: {float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',out]))['format']['duration']):.1f} s")
