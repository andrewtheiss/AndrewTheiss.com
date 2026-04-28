// SoundPlayer — fires Strudel patterns as one-shots.
//
// The point of this module: every call plays the pattern from "cycle 0",
// fresh, regardless of what cycle Strudel's global scheduler thinks it's on.
// This is what fixes the "second play continues where first left off" bug:
// we don't go through the repl's setPattern (which is bound to the global
// cycle counter). We compile the pattern, query its haps for cycle [0, 1),
// and call superdough() directly with absolute audio times.
//
// Checkpoint 1: triggers fire immediately (now + tiny lookahead).
// Checkpoint 2 will add quantized firing — same query/superdough loop, just
// different `t` (next beat / cycle / fraction).

import { evaluate as compileEvaluate } from '@strudel/core';
import { transpiler } from '@strudel/transpiler';
import { KIND, logAudio } from './audioLogStore';
import transport from './transport';

const FIRE_LOOKAHEAD = 0.02; // 20ms — past the audio thread's onset window

const stripChannelPrefix = (raw) => {
  // Strudel's `$:` is a repl-only construct that builds the multi-channel
  // pPatterns dictionary. Outside the repl, `$:` is a syntax error, so we
  // strip it for one-shots. Multi-channel for sustained music is the bg
  // music's job (that goes through the repl).
  let s = (raw || '').trim();
  if (!s) return '';
  // Single-line $: prefix
  if (s.startsWith('$:')) s = s.slice(2);
  // Multi-line $: — keep only the first channel for one-shots.
  const lines = s.split('\n');
  const cleaned = lines
    .map((l) => l.trim())
    .map((l) => (l.startsWith('$:') ? l.slice(2).trim() : l))
    .filter(Boolean);
  // Heuristic: if there are multiple top-level patterns, stack() them so
  // simultaneous channels in the user's snippet still fire together.
  if (cleaned.length <= 1) return cleaned[0] || '';
  return `stack(${cleaned.join(', ')})`;
};

// Cache compiled patterns keyed by code so rapid repeat fires don't pay
// transpile+eval cost every time.
const patternCache = new Map();
const MAX_CACHE = 64;

const compilePattern = async (code) => {
  const key = code;
  if (patternCache.has(key)) return patternCache.get(key);
  const cleaned = stripChannelPrefix(code);
  if (!cleaned) return null;
  const result = await compileEvaluate(cleaned, transpiler, {});
  const pattern = result?.pattern;
  if (!pattern || typeof pattern.queryArc !== 'function') {
    throw new Error('compiled value is not a Strudel pattern');
  }
  patternCache.set(key, pattern);
  if (patternCache.size > MAX_CACHE) {
    const firstKey = patternCache.keys().next().value;
    patternCache.delete(firstKey);
  }
  return pattern;
};

export const clearPatternCache = () => patternCache.clear();

// fireOnce(code, opts):
//   - opts.cycles: how many cycles of the pattern to play (default 1)
//   - opts.atTime: absolute audio time to start (default now+lookahead)
//   - opts.label: log label
// Returns the start time the sound was scheduled at.
export const fireOnce = async (code, opts = {}) => {
  if (!code) return null;
  await transport.ensureRunning();
  let pattern;
  try {
    pattern = await compilePattern(code);
  } catch (err) {
    logAudio(KIND.error, `compile failed${opts.label ? `: ${opts.label}` : ''}`,
      err.message || String(err));
    return null;
  }
  if (!pattern) return null;

  const cps = transport.cps;
  const cycles = Math.max(0.001, opts.cycles || 1);
  const startTime = opts.atTime != null
    ? opts.atTime
    : transport.now() + FIRE_LOOKAHEAD;

  const haps = pattern
    .queryArc(0, cycles, { _cps: cps, cyclist: 'soundPlayer' })
    .filter((h) => h.hasOnset && h.hasOnset());

  const sd = typeof window !== 'undefined' && window.superdough
    ? window.superdough
    : null;
  if (!sd) {
    logAudio(KIND.error, 'superdough missing', 'has initStrudel run?');
    return null;
  }

  let scheduled = 0;
  for (const hap of haps) {
    try {
      hap.ensureObjectValue();
      const begin = (hap.whole?.begin ?? 0).valueOf();
      const t = startTime + begin / cps;
      const duration = (hap.duration ?? 0.5).valueOf() / cps;
      sd(hap.value, t, duration, cps, begin);
      scheduled++;
    } catch (err) {
      console.warn('superdough fire failed', err);
    }
  }

  logAudio(KIND.oneShotOn,
    `fire: ${opts.label || 'sound'}`,
    `${scheduled} hap${scheduled === 1 ? '' : 's'} @ t=${startTime.toFixed(3)} cycle=${transport.currentCycle().toFixed(3)}`);
  return startTime;
};

// Convenience wrapper that takes a saved sound object {code, oneShotMs, ...}
export const fireSound = async (sound, opts = {}) => {
  if (!sound || !sound.code) return null;
  return fireOnce(sound.code, { ...opts, label: opts.label || sound.name || 'sound' });
};
