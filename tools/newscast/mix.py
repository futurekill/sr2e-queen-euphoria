#!/usr/bin/env python3
"""The newscast, mixed like a broadcast (version 3). Groups:
  studio — the anchor: dry, broadcast compression;
  field  — the reporter and the resident: handheld mic on location, a short echo off the buildings;
  music  — the news underscore under the anchor's headlines, ducked by her voice;
  street — crowd, wind, the location bed, a passing siren and radio squawks, ducked by the field voices, so it rises
           between phrases;
  stings — opening sting, whooshes, the break sting.
Final loudness −16 LUFS, peaks −1.5 dB."""
import subprocess, json, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_work", "newscast"); R = f"{D}/raw"; O = f"{D}/out"; os.makedirs(O, exist_ok=True)
dur = lambda f: float(json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", f]))["format"]["duration"])
LV = lambda lufs: f"loudnorm=I={lufs}:TP=-2:LRA=11"
STUDIO = "highpass=f=75,acompressor=threshold=-20dB:ratio=3:attack=8:release=180:makeup=2,equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=180:t=q:w=1:g=1.5"
OUTDOOR = "aecho=0.85:0.7:48|105:0.14|0.07"   # slapback off the towers
REMOTE = f"highpass=f=150,lowpass=f=7500,acompressor=threshold=-22dB:ratio=4:attack=5:release=120:makeup=3,equalizer=f=2500:t=q:w=1:g=3,{OUTDOOR}"
GUEST = f"highpass=f=190,lowpass=f=7000,acompressor=threshold=-24dB:ratio=4:attack=5:release=120:makeup=3,equalizer=f=2200:t=q:w=1:g=2,{OUTDOOR}"

def build(out):
    P = []   # (group, file, start, chain)
    add = lambda g, f, st, ch: P.append((g, f"{R}/{f}.mp3", st, ch))
    add("stings", "sting-open", 0.0, f"{LV(-15)},afade=t=out:st=4.2:d=1.2")
    t = 4.1
    add("studio", "anchor-open", t, f"{STUDIO},{LV(-17)}"); a1 = dur(f"{R}/anchor-open.mp3")
    # The underscore comes in under the headline and is gone before the live cross.
    ulen = a1 - 3.0
    add("music", "underscore", t + 0.2, f"{LV(-25)},atrim=0:{ulen:.2f},afade=t=in:d=1.0,afade=t=out:st={ulen-4:.2f}:d=4")
    t += a1
    add("stings", "whoosh-out", t - 0.25, LV(-21)); t += 1.0
    # The live feed: the street comes up first, Marcus answers a beat later.
    street0 = t; r0 = t + 1.6; rt = r0
    seg = [("reporter-a", REMOTE, -17, 0.9), ("reporter-resident-in", REMOTE, -17, 0.55), ("resident", GUEST, -18, 0.5),
           ("reporter-resident-out", REMOTE, -17, 0.7), ("reporter-b", REMOTE, -17, 0)]
    marks = {}
    for name, chain, lufs, gap in seg:
        marks[name] = rt
        add("field", name, rt, f"{chain},{LV(lufs)}"); rt += dur(f"{R}/{name}.mp3") + gap
    slen = (rt + 1.2) - street0
    for bed, lufs in [("field-bed-long", -27), ("crowd-scene-long", -25), ("wind-mic-long", -31)]:
        add("street", bed, street0, f"{LV(lufs)},atrim=0:{slen:.2f},afade=t=in:d=0.5,afade=t=out:st={slen-1.0:.2f}:d=1.0")
    add("street", "siren-pass", marks["reporter-a"] + 7.0, LV(-22))
    add("street", "radio-squawk", marks["reporter-resident-in"] - 0.85, f"{LV(-23)},atrim=0:2.2,afade=t=out:st=1.7:d=0.5")
    add("street", "radio-squawk", marks["reporter-b"] - 0.65, f"{LV(-25)},atrim=1.0:3.2,asetpts=PTS-STARTPTS,afade=t=out:st=1.7:d=0.5")
    t = rt + 0.9
    add("stings", "whoosh-back", t - 0.3, LV(-21)); t += 1.4
    add("studio", "anchor-close", t, f"{STUDIO},{LV(-17)}"); t += dur(f"{R}/anchor-close.mp3")
    add("stings", "sting-break", t - 0.4, LV(-15))

    args = ["ffmpeg", "-nostdin", "-y", "-loglevel", "error"]
    for _, f, _, _ in P: args += ["-i", f]
    ch = [f"[{i}:a]aresample=44100,aformat=channel_layouts=stereo,{c},adelay={int(st*1000)}:all=1[p{i}]" for i, (_, _, st, c) in enumerate(P)]
    def bus(g, label):
        ids = [f"[p{i}]" for i, p in enumerate(P) if p[0] == g]
        ch.append(f"{''.join(ids)}{'amix=inputs=%d:normalize=0:duration=longest' % len(ids) if len(ids) > 1 else 'anull'}[{label}]")
    for g in ["studio", "field", "music", "street", "stings"]: bus(g, g)
    ch.append("[studio]asplit=2[studio1][studiosc]")
    ch.append("[field]asplit=2[field1][fieldsc]")
    ch.append("[music][studiosc]sidechaincompress=threshold=0.04:ratio=5:attack=40:release=450:makeup=1[musicd]")
    ch.append("[street][fieldsc]sidechaincompress=threshold=0.03:ratio=4:attack=60:release=600:makeup=1[streetd]")
    ch.append("[studio1][field1][musicd][streetd][stings]amix=inputs=5:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=11[m]")
    args += ["-filter_complex", ";".join(ch), "-map", "[m]", "-ar", "44100", "-b:a", "192k", out]
    subprocess.check_call(args)
    print(f"{os.path.basename(out)}: {dur(out):.1f} s")

build(f"{O}/newscast-euphoria.mp3")
# The soundboard clip: copy out/newscast-euphoria.mp3 to assets/audio/a2-news-vanished.mp3, then npm run audio -- --pack.
