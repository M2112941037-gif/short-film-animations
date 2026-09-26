"""Score + sound design for Part 3 (the snowfield, the duel, the Elder Wand,
Death stepping aside, the empty balance, footsteps, the last line).

Writes public/audio/part3.wav. Shot starts come from src/film/Part3.tsx.
"""
import numpy as np

from synth import *  # noqa: F401,F403 — instruments, filters, Mix

FPS = 24
LENS = [60, 36, 38, 30, 44, 60, 42, 72, 72, 40, 72, 48, 84, 96, 150]   # shot lengths, as in Part3.tsx
STARTS = [0]
for n in LENS[:-1]:
    STARTS.append(STARTS[-1] + n - 8)
(FACEOFF, BOOTS, HWALK, HEM, POV_V, CLASH, WANDFALL, COVER, REVEAL, FACE, APPROACH, FINGERS, WALK, BALANCE, END) = [f / FPS for f in STARTS]
DUR = (STARTS[-1] + LENS[-1]) / FPS + 0.3
STEP = 16                                    # frames per step (src/characters/gait.ts)
mix = Mix(DUR)
add = mix.add


def crunch(gain=1.0):
    """A boot pressing into snow: a short grainy crackle over a soft thud."""
    d = 0.28
    t = t_(d)
    grain = bp(rng.standard_normal(len(t)), 900, 5200) * (rng.random(len(t)) > 0.55) * np.exp(-t * 16)
    return (grain + 0.5 * lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 22)) * gain


def boot(gain=1.0):
    """Close up: the heel lands, the snow packs down and squeaks under his weight."""
    out = np.zeros(int(SR * 0.5))
    for sig, at, g in [(crunch(), 0, 1.0), (thump(0.3, 85, 30), 0, 0.5)]:
        out[int(at * SR):int(at * SR) + len(sig)] += g * sig[: len(out)]
    n = int(SR * 0.2)
    sq = bp(rng.standard_normal(n), 1300, 2500) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    i = int(0.05 * SR)
    out[i:i + n] += 0.35 * sq
    return out * gain


def steps(start, frames, gain=0.4, pan=0.0, sound=crunch):
    """Footfalls on exactly the frames the heels strike (from the animation)."""
    for f in frames:
        add(sound(), start + f / FPS, pan, gain * rng.uniform(0.85, 1.0))


def beam(f0, d, bright):
    """A spell's sound: a buzzing, rising drone."""
    t = t_(d)
    f = f0 * (1 + 0.2 * t / d)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) + 0.5 * signal.square(2 * np.pi * np.cumsum(f * 2.01) / SR)
    return lp(x, bright) * np.linspace(0.2, 1, len(t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 13 * t))


def swish(d=0.8):
    """Cloth sweeping past."""
    t = t_(d)
    return bp(rng.standard_normal(len(t)), 400, 2600) * np.sin(np.pi * t / d) ** 2


# ——— the snowfield ———————————————————————————————————————————————————
add(whoosh(1.2, 300, 3000), FACEOFF, -0.3, 0.45)                       # the snow sweeping everything away
add(wind(DUR), FACEOFF, 0, 0.16)
add(drone(note(38), CLASH - FACEOFF + 0.5, 320), FACEOFF + 0.4, 0, 0.18)
steps(BOOTS, [6], 0.7, 0.1, boot)                                      # he has weight: the near boot…
steps(BOOTS, [22], 0.5, -0.1, boot)                                    # …and the far one
steps(HWALK, [(n * np.pi - 0.3) / (np.pi / STEP) for n in (1, 2)], 0.4)
sw = strings(note(62), POV_V - BOOTS + 2.2, 1800)
add(sw * np.linspace(0.2, 1, len(sw)), BOOTS, 0.2, 0.08)
add(swish(1.3) * 0.6, HEM, -0.2, 0.18)                                 # his hem, a hand above the snow
add(bp(rng.standard_normal(int(SR * 3.0)), 3000, 7000) * 0.5, HEM, -0.2, 0.06)   # he leaves nothing — only a whisper

# ——— the duel ——————————————————————————————————————————————————————
add(whoosh(0.5, 600, 2400), CLASH + 0.1, 0, 0.3)                       # wands up
add(beam(note(38), 1.6, 900), CLASH + 0.5, -0.6, 0.35)                  # green, low
add(beam(note(57), 1.6, 2400), CLASH + 0.5, 0.6, 0.30)                  # red, brighter
t = t_(1.3)
add(bp(rng.standard_normal(len(t)), 200, 6000) * np.linspace(0.3, 1, len(t)) ** 2, CLASH + 0.85, 0, 0.45)   # the clash
add(thump(1.2, 80, 30), CLASH + 0.85, 0, 0.5)
t = t_(0.5)
add(rng.standard_normal(len(t)) * np.linspace(0, 1, len(t)) ** 3, CLASH + 1.95, 0, 0.35)  # into the white…
t = t_(0.12)
add(bp(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 60) * 3, WANDFALL + 0.05, 0, 0.6)   # …「啪」

# ——— the Elder Wand ————————————————————————————————————————————————————
add(whoosh(0.9, 900, 2500), WANDFALL + 0.15, 0.2, 0.2)
add(thump(0.9, 70, 40) * 0.6, WANDFALL + 1.0, 0, 0.35)
add(crunch(0.8), WANDFALL + 1.0, 0, 0.35)    # it drops into the snow
for i in range(8):
    add(tink(rng.uniform(3200, 4800), 0.5), COVER + 0.3 + i * 0.32, rng.uniform(-0.3, 0.3), 0.07)
add(strings(note(74), REVEAL - COVER + 1, 2600), COVER, 0, 0.05)
add(drone(note(26), 3.5, 180), REVEAL + 0.4, 0, 0.25)                  # Death, who saw it all
add(tink(1700, 0.8), REVEAL + 2.2, 0, 0.14)                             # the balance put away

# ——— Death steps aside ————————————————————————————————————————————————
add(strings(note(50), 4.0, 900), FACE, -0.1, 0.18)                      # unafraid
add(strings(note(57), 3.0, 1200), APPROACH, 0.1, 0.10)
add(swish(1.1), APPROACH + 2.0, -0.6, 0.35)
add(swish(0.9), FINGERS + 0.2, 0.3, 0.25)
add(chime(note(81), 3), FINGERS + 0.8, 0.2, 0.08)
steps(WALK, range(0, 84, STEP), 0.35)                                   # on, toward us
for i, m in enumerate([50, 54, 57, 62]):                                # warm strings under the quote
    add(strings(note(m), BALANCE - FINGERS + 1.2, 1300), FINGERS + 0.4 + i * 0.3, -0.3 + 0.2 * i, 0.10)

# ——— the empty balance; white; black; footsteps; the Hallows; the last line ———
for i in range(6):
    add(tink(rng.uniform(2400, 3600), 0.7), BALANCE + 0.3 + i * 0.4, rng.uniform(-0.3, 0.3), 0.08)
t = t_(1.2)
add(bp(rng.standard_normal(len(t)), 4000, 9000) * np.linspace(0, 1, len(t)) ** 2, BALANCE + 2.9, 0, 0.18)   # to white
steps(END + 0.25, range(0, 58, 19), 0.45)                              # 一步。又一步。
add(sum(chime(note(m), 3.5) for m in (74, 81, 86)) / 3, END + 1.1, 0, 0.14)   # the sign appears
for i, m in enumerate([38, 45, 50, 54, 57, 62]):                        # D A D F# A D — the last line
    add(strings(note(m), 2.6, 1400), END + 3.9 + i * 0.04, -0.4 + 0.16 * i, 0.10)

mix.master('part3')
