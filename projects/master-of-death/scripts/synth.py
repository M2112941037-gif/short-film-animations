"""Shared synthesis: filters, envelopes, instruments and sound effects used
by every part's score. All sounds are generated from scratch with numpy/scipy.
"""
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


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



class Mix:
    """A stereo bus: add() mono sounds at a time and pan, then master()."""

    def __init__(self, dur):
        self.n = int(SR * dur)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)

    def add(self, sig, at, pan=0.0, gain=1.0):
        i = int(at * SR)
        if i >= self.n:
            return
        sig = sig[: self.n - i] * gain
        self.L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2)
        self.R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2)

    def master(self, name):
        """Long dark room reverb, fade-out, normalise, write public/audio/<name>.wav."""
        ir_t = t_(2.2)
        ir = lp(rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6), 3500)
        ir /= np.sqrt((ir ** 2).sum())
        wetL = signal.fftconvolve(self.L, ir)[: self.n]
        wetR = signal.fftconvolve(self.R, np.roll(ir, 97))[: self.n]
        fade = np.ones(self.n)
        fade[-int(SR * 0.6):] = np.linspace(1, 0, int(SR * 0.6))
        st = np.stack([(self.L * 0.8 + wetL * 0.45) * fade, (self.R * 0.8 + wetR * 0.45) * fade], axis=1)
        st /= np.max(np.abs(st)) / 0.89
        out = Path(__file__).resolve().parent.parent / 'public' / 'audio' / f'{name}.wav'
        out.parent.mkdir(parents=True, exist_ok=True)
        wavfile.write(out, SR, (st * 32767).astype(np.int16))
        print(f'wrote {out} ({self.n / SR:.1f}s)')
