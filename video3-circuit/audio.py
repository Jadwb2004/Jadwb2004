"""Sound design for Video 3: per-character keyboard clicks + low ambient hum +
soft electric buzz at power-on. No music, no voice. Loop-seamless over 28 s.

Usage: python3 audio.py build/schedule.json build/audio.wav
"""
import json
import sys
import wave

import numpy as np

SR = 48000
sched = json.load(open(sys.argv[1]))
out_path = sys.argv[2]
DUR = sched["dur"]
N = int(SR * DUR)
rng = np.random.default_rng(3)


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def click(space=False):
    """Crisp tactile key click: bright filtered tick + short body thock."""
    n = int(SR * 0.045)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    hp = noise - onepole_lp(noise, 2500)            # bright part
    tick = onepole_lp(hp, 9000) * np.exp(-t / 0.0035)
    f = rng.uniform(170, 240) * (0.75 if space else 1.0)
    body = np.sin(2 * np.pi * f * t) * np.exp(-t / (0.012 if space else 0.008))
    clack = onepole_lp(noise, 1800) * np.exp(-t / 0.006)
    s = 1.0 * tick + 0.55 * body + 0.6 * clack
    # tiny release "tock" ~25 ms later
    d = int(SR * rng.uniform(0.018, 0.03))
    rel = np.zeros(n)
    m = n - d
    rel[d:] = (onepole_lp(rng.standard_normal(m), 5000) * np.exp(-np.arange(m) / SR / 0.003))[:m]
    s += 0.35 * rel
    return s / np.max(np.abs(s))


variants = [click() for _ in range(10)]
space_v = [click(space=True) for _ in range(3)]

L = np.zeros(N)
Rr = np.zeros(N)


def add(sig, t, gain, pan=0.0):
    i0 = int(round((t % DUR) * SR))
    n = len(sig)
    idx = (np.arange(n) + i0) % N  # wrap for seamless loop
    gl = gain * np.sqrt(0.5 * (1 - pan))
    gr = gain * np.sqrt(0.5 * (1 + pan))
    np.add.at(L, idx, sig * gl)
    np.add.at(Rr, idx, sig * gr)


# --- typing clicks, one per character -----------------------------------
for ln in sched["lines"]:
    for ch, ct in zip(ln["text"], ln["times"]):
        if ct < -DUR + 0.01:
            continue  # line typed before the video started
        if ch == " ":
            sig = space_v[rng.integers(len(space_v))]
            g = 0.75
        else:
            sig = variants[rng.integers(len(variants))]
            g = rng.uniform(0.8, 1.0) * (1.0 if ln["kind"] == "code" else 0.85)
        add(sig, ct, g, pan=rng.uniform(-0.25, 0.25))

# --- component lands: soft low thump -----------------------------------
def thump(f=70, dec=0.09, n_s=0.35):
    n = int(SR * n_s)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t * (1 - 0.25 * t)) * np.exp(-t / dec)
    s += 0.3 * onepole_lp(rng.standard_normal(n), 400) * np.exp(-t / 0.03)
    return s / np.max(np.abs(s))


for pt in sched["place"]:
    add(thump(), pt, 0.32)
for lt in sched["ledOn"]:
    add(thump(f=120, dec=0.04, n_s=0.2), lt, 0.16, pan=0.3)

# --- ambient hum (loop-safe: integer cycles over DUR, circular noise) --
t = np.arange(N) / SR
hum = 0.0
for f, a in [(55, 1.0), (110, 0.45), (165, 0.18), (220, 0.08)]:
    hum = hum + a * np.sin(2 * np.pi * f * t)
spec = np.fft.rfft(rng.standard_normal(N))
freqs = np.fft.rfftfreq(N, 1 / SR)
shape = 1 / np.maximum(freqs, 20) * (freqs < 600)
air = np.fft.irfft(spec * shape, N)
air /= np.max(np.abs(air))
hum = hum / np.max(np.abs(hum)) * 0.55 + air * 0.45
hum *= 0.9 + 0.1 * np.sin(2 * np.pi * t / DUR * 2)  # slow breathing, loop-safe
amb = hum * 10 ** (-38 / 20)

# --- electric buzz: swell at power-on, gentle bed while powered, lift at run
P, RUN = sched["power"], sched["run"]
buzz = np.zeros(N)
for k in range(1, 14):
    buzz += np.sin(2 * np.pi * 120 * k * t + k) / k ** 1.3
buzz = onepole_lp(buzz, 1400)
buzz /= np.max(np.abs(buzz))
env = np.zeros(N)
x = t - P
swell = np.where(x > 0, (1 - np.exp(-x / 0.05)) * np.exp(-x / 0.7), 0)
bed = np.where(x > 0, np.clip(x / 0.6, 0, 1), 0) * 0.22
xr = t - RUN
lift = np.where(xr > 0, (1 - np.exp(-xr / 0.08)) * np.exp(-xr / 1.2), 0) * 0.6
fade = np.clip((27.0 - t) / 2.0, 0, 1)  # bed fades out during the loop dissolve
env = (swell + bed + lift) * fade
buzz_track = buzz * env * 10 ** (-24 / 20)

mixL = L * 10 ** (-12 / 20) + amb + buzz_track
mixR = Rr * 10 ** (-12 / 20) + amb + buzz_track


def mean_db(a, b):
    return 20 * np.log10(np.sqrt(np.mean(np.concatenate([a, b]) ** 2)) + 1e-12)


# scale to mean ≈ -26 dB, then soft-limit peaks to ≤ -6 dB
target_mean, ceiling = -26.0, 10 ** (-10.0 / 20)
for _ in range(6):
    g = 10 ** ((target_mean - mean_db(mixL, mixR)) / 20)
    mixL *= g
    mixR *= g
    for arr in (mixL, mixR):
        over = np.abs(arr) > ceiling * 0.8
        k0 = ceiling * 0.8
        arr[over] = np.sign(arr[over]) * (k0 + (ceiling - k0) * np.tanh((np.abs(arr[over]) - k0) / (ceiling - k0)))

peak = 20 * np.log10(max(np.max(np.abs(mixL)), np.max(np.abs(mixR))))
print(f"mean {mean_db(mixL, mixR):.1f} dB, peak {peak:.1f} dB")
st = np.stack([mixL, mixR], 1)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
with wave.open(out_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
