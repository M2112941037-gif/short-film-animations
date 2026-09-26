"""Score + sound design for Part 1 (00:00–00:27), synthesized from scratch.

Writes public/audio/part1.wav (git-ignored; regenerate with `npm run audio`).
Timings are taken from the Part 1 timeline in src/film/Part1.tsx.
"""
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
DUR = 684 / 24 + 0.35
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)

# shot boundaries (seconds), from the Part 1 timeline at 24 fps
SKULL, PAN, LOOMS, GRAB, LOOKS = 172 / 24, 400 / 24, 510 / 24, 572 / 24, 610 / 24
BAL1, BAL2 = 322 / 24, 636 / 24   # the two balance cutaways


def t_(d):
    return np.arange(int(SR * d)) / SR


def add(sig, at, pan=0.0, gain=1.0):
    """Mix a mono signal in at time `at` (s); pan −1 (left) … 1 (right)."""
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2)
    R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2)


def lp(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), 'low')
    return signal.lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return signal.lfilter(b, a, x)


def env(n, a, r, hold=None):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) if na else e[:na]
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def saw(f, d, detune=0.0):
    t = t_(d)
    return signal.sawtooth(2 * np.pi * f * (1 + detune) * t)


def note(f):
    return 440 * 2 ** ((f - 69) / 12)


# ——— instruments ————————————————————————————————————————————————

def drone(f, d, cutoff=380, vib=0.004):
    t = t_(d)
    v = 1 + vib * np.sin(2 * np.pi * 4.8 * t)
    x = sum(signal.sawtooth(2 * np.pi * f * v * (1 + dt) * t) for dt in (-0.003, 0, 0.004))
    return lp(x / 3, cutoff) * env(len(t), d * 0.35, d * 0.35)


def strings(f, d, cutoff=900):
    """Low bowed line: detuned saws, soft attack, gentle vibrato."""
    t = t_(d)
    v = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.6, 0, 1)
    x = sum(signal.sawtooth(2 * np.pi * f * v * (1 + dt) * t) for dt in (-0.004, 0.0, 0.005))
    return lp(x / 3, cutoff, 3) * env(len(t), min(0.5, d * 0.4), min(0.8, d * 0.5))


def chime(f, d=3.0):
    """Glassy bell: inharmonic partials with long decay."""
    t = t_(d)
    parts = [(1, 1.0, 1.6), (2.76, 0.45, 2.4), (5.4, 0.25, 3.5), (8.93, 0.12, 5.0)]
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * dec) for m, a, dec in parts)
    return x * env(len(t), 0.002, 0.3)


def tink(f=2600, d=0.8):
    t = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * dec) for m, a, dec in [(1, 1, 9), (1.51, 0.5, 13), (2.3, 0.3, 18)])
    return x * 0.5


def thump(d=1.2, f0=95, f1=38):
    """A skull landing: pitched-down body + a dry crack on top."""
    t = t_(d)
    f = f1 + (f0 - f1) * np.exp(-t * 9)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    crack = bp(rng.standard_normal(len(t)), 900, 4200) * np.exp(-t * 60)
    return body + 0.35 * crack


def rattle(d, density_fn):
    """Bone-on-bone clatter; density_fn(t) = clicks per second."""
    out = np.zeros(int(SR * d))
    t = 0.0
    while t < d:
        rate = max(0.5, density_fn(t))
        t += rng.exponential(1 / rate)
        if t >= d:
            break
        n = int(SR * 0.05)
        c = bp(rng.standard_normal(n), rng.uniform(700, 1400), rng.uniform(2500, 5200)) * np.exp(-np.arange(n) / SR * rng.uniform(60, 120))
        i = int(t * SR)
        out[i:i + n] += c[: len(out) - i] * rng.uniform(0.3, 1.0)
    return out


def whoosh(d, lo=300, hi=2400, rise=True):
    t = t_(d)
    x = rng.standard_normal(len(t))
    out = np.zeros_like(x)
    seg = 512
    for i in range(0, len(x), seg):
        u = i / len(x)
        c = lo + (hi - lo) * (u if rise else 1 - u)
        out[i:i + seg] = bp(x[i:i + seg + 64], c * 0.7, c * 1.4)[: len(out[i:i + seg])]
    return out * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2


def wind(d):
    t = t_(d)
    x = lp(rng.standard_normal(len(t)), 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + 1.1))
    return x * env(len(t), 1.5, 1.5)


def groan(d, f0=70, depth=1.0):
    """A metal beam taking weight: a slow, bending, rasping creak."""
    t = t_(d)
    bend = f0 * (1 + 0.25 * depth * np.sin(np.pi * t / d) + 0.03 * np.sin(2 * np.pi * 7 * t))
    raw = signal.sawtooth(2 * np.pi * np.cumsum(bend) / SR)
    rasp = bp(raw + 0.4 * rng.standard_normal(len(t)), 240, 1400)
    return rasp * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.7


def claw(d=1.3):
    """Bone knuckles unfolding + a thin screech rising out of the dark."""
    t = t_(d)
    knuckles = rattle(d * 0.6, lambda u: 40)
    screech = np.zeros(len(t))
    x = rng.standard_normal(len(t))
    seg = 512
    for i in range(0, len(t), seg):
        c = 1200 + 3800 * (i / len(t)) ** 1.5
        screech[i:i + seg] = bp(x[i:i + seg + 64], c * 0.9, c * 1.12)[: len(screech[i:i + seg])]
    out = screech * np.linspace(0, 1, len(t)) ** 2 * 0.6
    out[: len(knuckles)] += knuckles
    return out + 0.5 * whoosh(d, 150, 900)


def heartbeat(d=0.9):
    return thump(0.5, 70, 38) * 0.9, 0.22  # (sound, gap to the second beat)


# ——— the score ————————————————————————————————————————————————————
# 0–7 s · the hand, the balance, the pull-back
add(wind(DUR), 0, 0, 0.10)
add(drone(note(38), 7.8, 300), 0.4, -0.2, 0.22)            # D2
add(drone(note(45), 6.8, 320), 1.4, 0.2, 0.14)             # A2
for at, f in [(1.1, 2700), (2.2, 2450), (3.3, 2600)]:      # the balance chiming as it sways
    add(tink(f), at, 0.1, 0.10)
add(whoosh(0.9, 250, 1800, rise=False), 2.75, 0, 0.28)     # the pull-back
add(thump(1.8, 70, 32), 3.55, 0, 0.35)
for i, f in enumerate([note(81), note(76), note(84)]):     # the projection shimmer (A5, E5, C6)
    add(chime(f, 3.5) * 0.5, 3.9 + i * 0.35, -0.5 + i * 0.5, 0.09)

# 7–16.7 s · the skull mountain
add(drone(note(38), PAN - SKULL + 1.0, 420), SKULL, 0, 0.26)
for dt in (0.55, 1.25, 1.85):                              # three lone skulls
    add(thump(), SKULL + dt, rng.uniform(-0.3, 0.3), 0.55)
pour = PAN - (SKULL + 2.2)
add(rattle(pour, lambda t: 6 + 70 * (t / pour) ** 1.5), SKULL + 2.2, -0.15, 0.20)
add(rattle(pour, lambda t: 5 + 60 * (t / pour) ** 1.5), SKULL + 2.25, 0.2, 0.18)
beat, t = 0.0, SKULL + 2.4                                 # a pulse that quickens as the pile climbs
while t < PAN - 0.3:
    u = (t - SKULL - 2.4) / (PAN - SKULL - 2.7)
    add(thump(0.7, 60, 34), t, 0, 0.18 + 0.2 * u)
    t += 1.0 - 0.5 * u
# "他害怕死亡。" … "所以他试图征服它。" — a falling line, then a climbing one
for i, (m, d) in enumerate([(50, 1.0), (53, 1.0), (52, 1.2)]):   # D3 F3 E3
    add(strings(note(m), d + 0.6), SKULL + 3.4 + i * 0.9, -0.2, 0.16)
for i, (m, d) in enumerate([(50, 0.7), (53, 0.7), (57, 0.8), (58, 1.8)]):  # D3 F3 A3 Bb3
    add(strings(note(m), d + 0.5), SKULL + 6.4 + i * 0.7, 0.2, 0.17)
add(whoosh(0.7, 400, 3000), PAN - 0.35, 0.6, 0.22)         # pan across to Harry

# 16.7–21.2 s · Harry's pan: a bell for each of them, each one lower
add(drone(note(62), LOOMS - PAN + 0.5, 1400, 0.002), PAN, 0, 0.05)  # thin high pad, D4
for i, m in enumerate([81, 79, 77, 76, 74, 72, 69]):       # A5 G5 F5 E5 D5 C5 A4
    at = PAN + 0.5 + i * 0.55
    add(chime(note(m), 2.8), at, rng.uniform(-0.4, 0.4), 0.13)
    add(tink(900 - i * 40, 0.6) * 0.6, at + 0.3, 0, 0.08)  # the chain taking up slack

# 21.2–23.8 s · Death comes down
d = GRAB - LOOMS + 0.2
t = t_(d)
cluster = sum(saw(note(m), d, dt) for m, dt in [(38, 0), (39, 0.002), (45, -0.002), (26, 0)])
cutoff_sweep = lp(cluster / 4, 260) * 0.4 + lp(cluster / 4, 1200) * 0.6 * np.linspace(0, 1, len(t)) ** 2
add(cutoff_sweep * np.linspace(0.25, 1, len(t)) ** 1.3, LOOMS, 0, 0.65)
add(lp(rng.standard_normal(len(t)), 500) * np.sin(2 * np.pi * 0.7 * t) ** 2 * np.linspace(0.3, 1, len(t)), LOOMS, 0, 0.32)  # breath

add(claw(1.2), LOOMS + 1.55, -0.3, 0.55)                  # the claw reaching out of the dark

# the balance cutaways: the beam groans as it tips
add(groan(2.3, 64, 1.0), BAL1 + 0.1, -0.2, 0.30)
add(groan(1.8, 52, 1.4), BAL2 + 0.1, -0.3, 0.38)
add(thump(1.6, 60, 30), BAL2 + 1.1, -0.3, 0.30)          # it bottoms out

# 23.8 s · the grab — a hit, a held breath, then dread
add(thump(2.2, 120, 28), GRAB + 0.3, 0, 0.8)
add(bp(rng.standard_normal(int(SR * 0.15)), 1200, 5000) * np.exp(-t_(0.15) * 30), GRAB + 0.32, -0.2, 0.35)  # bone snapping shut
add(drone(note(26), DUR - GRAB - 0.9, 200), GRAB + 0.9, -0.2, 0.30)  # D1
add(drone(note(32), DUR - GRAB - 1.2, 220), GRAB + 1.2, 0.2, 0.22)   # Ab1: the tritone
for i in range(3):
    s, gap = heartbeat()
    add(s, LOOKS + 0.2 + i * 0.85, 0, 0.35)
    add(s * 0.7, LOOKS + 0.2 + i * 0.85 + gap, 0, 0.35)

# ——— room: a long, dark reverb, then master ——————————————————————————
ir_t = t_(2.2)
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6)
ir = lp(ir, 3500)
ir /= np.sqrt((ir ** 2).sum())
wetL = signal.fftconvolve(L, ir)[:N]
wetR = signal.fftconvolve(R, ir[::-1] if False else np.roll(ir, 97))[:N]
outL = L * 0.8 + wetL * 0.45
outR = R * 0.8 + wetR * 0.45
fade = np.ones(N)
fade[-int(SR * 0.6):] = np.linspace(1, 0, int(SR * 0.6))
stereo = np.stack([outL * fade, outR * fade], axis=1)
stereo /= np.max(np.abs(stereo)) / 0.89
out = Path(__file__).resolve().parent.parent / 'public' / 'audio' / 'part1.wav'
out.parent.mkdir(parents=True, exist_ok=True)
wavfile.write(out, SR, (stereo * 32767).astype(np.int16))
print(f'wrote {out} ({DUR:.1f}s)')
