"""Calm sound design for Video 3 v2: soft round key clicks (one per typed
character, quiet gaps between lines left empty) + a barely-there ambient hum
that swells warmly at power-on. No buzz, no zaps, no music, no voice.

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
rng = np.random.default_rng(5)


def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def soft_click(space=False):
    """Round, muted 'thock': low body + gently filtered contact, no sharp tick."""
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    f = rng.uniform(150, 205) * (0.8 if space else 1.0)
    body = np.sin(2 * np.pi * f * t + 0.3) * np.exp(-t / (0.024 if space else 0.018))
    body += 0.35 * np.sin(2 * np.pi * f * 2.03 * t) * np.exp(-t / 0.01)
    contact = lp(lp(rng.standard_normal(n), 2600), 2600) * np.exp(-t / 0.006)
    s = body + 0.9 * contact / (np.max(np.abs(contact)) + 1e-9)
    att = np.clip(t / 0.0015, 0, 1)  # 1.5 ms attack — rounds the transient
    s *= att
    return s / np.max(np.abs(s))


variants = [soft_click() for _ in range(12)]
spaces = [soft_click(True) for _ in range(4)]
L = np.zeros(N)
Rr = np.zeros(N)


def add(sig, t, gain, pan):
    i0 = int(round((t % DUR) * SR))
    idx = (np.arange(len(sig)) + i0) % N  # wrap → seamless loop
    np.add.at(L, idx, sig * gain * np.sqrt(0.5 * (1 - pan)))
    np.add.at(Rr, idx, sig * gain * np.sqrt(0.5 * (1 + pan)))


for ln in sched["lines"]:
    for ch, ct in zip(ln["text"], ln["times"]):
        if ct < -DUR + 0.01:
            continue  # typed before the video starts
        sp = ch == " "
        sig = (spaces if sp else variants)[rng.integers(4 if sp else 12)]
        add(sig, ct, rng.uniform(0.75, 1.0) * (0.85 if sp else 1.0), rng.uniform(-0.2, 0.2))

# ---- ambient hum: low, soft, loop-safe (integer cycles + circular noise)
t = np.arange(N) / SR
tone = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(55, 1.0, 0), (110, 0.35, 1.1), (82.5, 0.18, 2.0)])
spec = np.fft.rfft(rng.standard_normal(N))
fr = np.fft.rfftfreq(N, 1 / SR)
air = np.fft.irfft(spec / np.maximum(fr, 25) * (fr < 400), N)
hum = tone / np.max(np.abs(tone)) * 0.6 + air / np.max(np.abs(air)) * 0.4

# warm swell at power-on and run; back to the base level before the loop wraps
P, RUN = sched["power"], sched["run"]


def swell(t0, rise, amt):
    x = t - t0
    return np.where(x > 0, amt * (1 - np.exp(-x / rise)), 0.0)


env = 1 + swell(P, 0.9, 0.9) + swell(RUN, 1.0, 0.5)
env -= (env - 1) * np.clip((t - 24.8) / 2.7, 0, 1) ** 1.5  # settle during dissolve
hum *= env

click_gain = 10 ** (-7.2 / 20)
hum_gain = 10 ** (-31.5 / 20)
mixL = L * click_gain + hum * hum_gain
mixR = Rr * click_gain + hum * hum_gain

peak = 20 * np.log10(max(np.abs(mixL).max(), np.abs(mixR).max()))
mean = 20 * np.log10(np.sqrt(np.mean(np.concatenate([mixL, mixR]) ** 2)))
print(f"mean {mean:.1f} dB  peak {peak:.1f} dB")
pcm = (np.clip(np.stack([mixL, mixR], 1), -1, 1) * 32767).astype("<i2")
with wave.open(out_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
