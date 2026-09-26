"""Score + sound design for Part 1 (00:00–00:27), synthesized from scratch.

Writes public/audio/part1.wav (git-ignored; regenerate with `npm run audio`).
Timings are taken from the Part 1 timeline in src/film/Part1.tsx.
"""
import numpy as np

from synth import *  # noqa: F401,F403 — instruments, filters, Mix

DUR = 684 / 24 + 0.35
mix = Mix(DUR)
add = mix.add

# shot boundaries (seconds), from the Part 1 timeline at 24 fps
SKULL, PAN, LOOMS, GRAB, LOOKS = 172 / 24, 400 / 24, 510 / 24, 572 / 24, 610 / 24
BAL1, BAL2 = 322 / 24, 636 / 24   # the two balance cutaways

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

mix.master('part1')
