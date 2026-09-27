"""Score + sound design for Part 2 (the Snitch, the stone, Lily, the snow,
the grave, letting go, the mountain melting, the balance level).

Writes public/audio/part2.wav. Shot starts come from src/film/Part2.tsx.
"""
import numpy as np

from synth import *  # noqa: F401,F403 — instruments, filters, Mix

FPS = 24
LENS = [72, 144, 60, 64, 36, 108, 40, 96, 60, 40, 30, 48, 30, 96, 48]   # shot lengths, as in Part2.tsx
STARTS = [0]
for n in LENS[:-1]:
    STARTS.append(STARTS[-1] + n - 8)
(SNITCH, REVEAL, TOUCH, FLAKE, EYES1, GRAVE, EYES2, UNDERSTAND, LETGO,
 TIP, SHOCK, MELT_STONE, SMIRK, COLLAPSE, LEVEL) = [f / FPS for f in STARTS]
DUR = (STARTS[-1] + LENS[-1]) / FPS + 0.35
FLAKE_IN = 24 / FPS                          # the flake enters her hand (Touch.tsx FLAKE_PASS)
mix = Mix(DUR)
add = mix.add


def buzz(d, pan_fn):
    """Snitch wings: a fast amplitude-modulated flutter, panned with it."""
    t = t_(d)
    x = bp(rng.standard_normal(len(t)), 2500, 6500) * (0.55 + 0.45 * np.sin(2 * np.pi * 58 * t))
    out = np.zeros(len(t))
    for i in range(0, len(t), 2048):
        add(x[i:i + 2048], SNITCH + 0.45 + i / SR, pan_fn(i / SR), 0.10)
    return out


def pad(chord, d, cutoff=1400, gain=1.0):
    """Warm, slow pad: several soft saw voices under a low-pass."""
    return sum(strings(note(m), d, cutoff) for m in chord) / len(chord) * gain


def choir(chord, d):
    """An 'aah' of voices: saws through two vowel formants, gently vibrato'd."""
    t = t_(d)
    out = np.zeros(len(t))
    for m in chord:
        f = note(m) * (1 + 0.004 * np.sin(2 * np.pi * 5 * t + m))
        x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR)
        out += bp(x, 650, 1100) + 0.6 * bp(x, 1000, 1500)
    return out / len(chord) * env(len(t), d * 0.4, d * 0.4)


def clang(f0=180, d=2.5):
    """A heavy stone striking a brass pan."""
    t = t_(d)
    parts = [(1, 1.0, 3), (2.4, 0.6, 4.5), (3.9, 0.4, 6), (5.6, 0.3, 8)]
    ring = sum(a * np.sin(2 * np.pi * f0 * m * t) * np.exp(-t * dec) for m, a, dec in parts)
    hit = thump(0.6, 110, 50)
    ring[: len(hit)] += 0.6 * hit
    return ring


def crack():
    """A bone snapping: a hard dry click, a short woody knock, a splinter."""
    t = t_(0.14)
    snap = bp(rng.standard_normal(len(t)), 1800, 7000) * np.exp(-t * 90)
    knock = np.sin(2 * np.pi * rng.uniform(380, 900) * t) * np.exp(-t * 45)
    splinter = bp(rng.standard_normal(len(t)), 3000, 9000) * (rng.random(len(t)) > 0.93) * np.exp(-t * 30)
    return 1.2 * snap + 0.6 * knock + 0.8 * splinter


def crash(d=1.4):
    """A whole slope of bone giving way: a broad noisy crash over a low roar."""
    t = t_(d)
    return bp(rng.standard_normal(len(t)), 150, 3500) * np.exp(-t * 3.5) + 0.8 * lp(rng.standard_normal(len(t)), 180) * np.exp(-t * 2)


def sparkle(d, density=30, lo=2600, hi=5200):
    """Snow: a cloud of tiny glassy tinks."""
    out = np.zeros(int(SR * d))
    for _ in range(int(d * density)):
        at = rng.uniform(0, d)
        s = tink(rng.uniform(lo, hi), 0.5) * rng.uniform(0.2, 0.7)
        i = int(at * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out


# ——— the Snitch ———————————————————————————————————————————————————————
add(whoosh(0.55, 500, 4000), SNITCH, 0, 0.5)                          # tearing past the lens
buzz(2.3, lambda u: np.sin(u * 3.2 * np.pi) * 0.7)
add(rattle(0.4, lambda u: 50), SNITCH + 2.3, -0.4, 0.3)               # the fingers let go
add(thump(0.8, 80, 40), SNITCH + 2.8, 0, 0.35)                        # he drops back onto the pan
add(drone(note(38), REVEAL - SNITCH + 0.5, 300), SNITCH, 0, 0.12)

# ——— the stone, and Lily ————————————————————————————————————————————————
add(tink(1800, 0.6), REVEAL + 0.6, -0.2, 0.25)                        # the Snitch clicks open
add(pad([50, 54, 57, 61], TOUCH - REVEAL + 1.0, 1200), REVEAL + 0.9, 0, 0.30)   # D F# A C# — warm
for i, m in enumerate([81, 85, 88]):
    add(chime(note(m), 3.0), REVEAL + 1.2 + i * 0.3, -0.3 + i * 0.3, 0.10)
add(choir([62, 66, 69], TOUCH - REVEAL - 1.6), REVEAL + 2.2, 0, 0.22)  # Lily appears
for i, m in enumerate([74, 76, 78, 81, 78]):                           # her motif, music-box soft
    add(chime(note(m), 2.2), REVEAL + 3.0 + i * 0.55, 0.2, 0.09)

# ——— the hands; the snow passes through ————————————————————————————————
d = 2.1
t = t_(d)
swell = strings(note(78), d + 0.3, 2400)
add(swell * np.linspace(0.3, 1, len(swell)), TOUCH, 0.1, 0.16)
add(strings(note(74), d + 0.3, 2000), TOUCH + 0.2, -0.1, 0.12)
add(tink(3400, 1.4), FLAKE + FLAKE_IN, 0, 0.35)                        # the flake — and nothing
add(wind(4.5), FLAKE + FLAKE_IN + 0.1, 0, 0.14)
for i in range(2):
    s, gap = heartbeat()
    add(s, EYES1 + 0.2 + i * 0.9, 0, 0.25)
    add(s * 0.7, EYES1 + 0.2 + i * 0.9 + gap, 0, 0.25)

# ——— the grave ——————————————————————————————————————————————————————
for at, m in [(GRAVE + 0.1, 50), (GRAVE + 1.5, 45)]:
    add(chime(note(m), 4.5), at, 0, 0.28)                             # a far bell
add(tink(2900, 0.8), GRAVE + 1.25, 0.1, 0.25)                         # the flake lands, and stays

# ——— understanding; she goes back into light ————————————————————————————
add(pad([50, 57, 62, 66], LETGO - EYES2 + 0.5, 1000), EYES2, 0, 0.24)
for i, m in enumerate([74, 76, 78, 81, 83, 81, 78]):
    add(chime(note(m), 2.5), UNDERSTAND + 0.4 + i * 0.45, -0.1 + 0.03 * i, 0.10)
add(sparkle(1.4, 22, 3000, 6000), UNDERSTAND + 2.7, -0.2, 0.5)       # dissolving into light

# ——— letting go ———————————————————————————————————————————————————————
add(tink(1500, 0.7), LETGO + 0.55, 0.1, 0.22)                         # the stone settles in his palm
add(whoosh(0.5, 900, 300, rise=False), LETGO + 1.5, 0.2, 0.2)         # it falls

# ——— the balance swings; Voldemort; Death; the stone turns to snow ————————————
add(clang(170, 2.6), TIP + 0.38, 0.4, 0.45)
add(groan(1.2, 58, 1.3), TIP + 0.4, 0.2, 0.36)
t = t_(0.9)
add(sum(saw(note(m), 0.9) for m in (63, 64, 70)) / 3 * np.exp(-t * 2.5), SHOCK, 0, 0.28)   # a stab of shock
add(pad([62, 69], 0.8, 2400), MELT_STONE, 0.3, 0.18)                  # the stone flares…
add(sparkle(1.6, 40), MELT_STONE + 0.5, 0.3, 0.6)                     # …and is snow
add(groan(1.4, 64, 1.0), MELT_STONE + 0.7, -0.2, 0.3)                 # the beam swings back
t = t_(0.9)
add(drone(note(26), 0.9, 180) + 0.6 * drone(note(32), 0.9, 200), SMIRK, 0, 0.3)

# ——— the mountain melts ————————————————————————————————————————————————
cd = LEVEL - COLLAPSE
t = t_(cd)
add(lp(rng.standard_normal(len(t)), 120) * np.sin(np.pi * np.clip(t / cd, 0, 1)) ** 0.5, COLLAPSE, 0, 0.6)   # rumble
for dt in (0.15, 0.4):                                                # one… two…
    add(sparkle(0.6, 18, 2200, 4200), COLLAPSE + dt, rng.uniform(-0.3, 0.3), 0.5)
# bones cracking, faster and faster, then whole slopes giving way — a roar
for i in range(80):
    u = (i / 80) ** 0.7
    add(crack(), COLLAPSE + 0.15 + 2.9 * u + rng.uniform(-0.03, 0.03), rng.uniform(-0.7, 0.7), rng.uniform(0.12, 0.3))
add(rattle(2.6, lambda u: 30 + 160 * u), COLLAPSE + 0.5, 0, 0.3)
for at, g in [(1.6, 0.55), (2.15, 0.7), (2.75, 0.5)]:
    add(crash(), COLLAPSE + at, rng.uniform(-0.3, 0.3), g)
    add(thump(1.5, 70, 25), COLLAPSE + at, 0, 0.5)
t = t_(3.6)
add((np.sin(2 * np.pi * 34 * t) + 0.6 * np.sin(2 * np.pi * 47 * t + 1)) * np.sin(np.pi * t / 3.6) ** 1.5, COLLAPSE + 0.2, 0, 0.4)   # the ground itself
add(sparkle(2.4, 60, 2000, 6200), COLLAPSE + 2.2, 0.2, 0.6)           # and it all turns to snow
add(whoosh(1.4, 1200, 200, rise=False), COLLAPSE + 1.7, 0, 0.25)      # he falls
add(thump(1.2, 90, 36), COLLAPSE + 3.05, 0, 0.5)                      # and lands

# ——— level ——————————————————————————————————————————————————————————
for i, tilt_click in enumerate([0.3, 0.75, 1.15]):
    add(tink(1200 - i * 150, 0.5), LEVEL + tilt_click, 0, 0.12 - i * 0.03)
for i, m in enumerate([38, 45, 50, 57, 62]):                          # an open, even chord: D A D A D
    add(chime(note(m + 12), 4.0), LEVEL + 0.4 + i * 0.05, -0.4 + 0.2 * i, 0.12)

# ——— the snow comes in across the screen (into Part 3) ———————————————————————
END2 = (STARTS[-1] + LENS[-1]) / FPS
add(whoosh(1.1, 400, 5000), END2 - 0.9, -0.3, 0.35)
add(sparkle(0.9, 50, 2600, 6400), END2 - 0.8, -0.2, 0.5)

mix.master('part2')
