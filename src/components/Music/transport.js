// Transport — the single source of truth for timing in the music+game system.
//
// Strudel's pattern engine treats `cycle` as a global, ever-running coordinate.
// We wrap it with a transport that anchors `cycle 0` to a moment we control
// (typically: the click of the Start button), so every consumer — game,
// audio log, dev panel HUD, future quantizer — sees a consistent grid.
//
// Checkpoint 1 deliverables (this file):
//   - start()  — resume the AudioContext and anchor cycleEpoch to "now"
//   - stop()   — full silence (hush + reset + suspend)
//   - now(), currentCycle(), currentBeat(), cycleToTime()
//   - subscribe(fn) for tick callbacks (used by HUD)
//
// Reserved for later checkpoints (stubs already shaped right):
//   - nextBeatAt(), nextCycleAt() for quantized triggers
//   - setCps / setBeatsPerCycle with continuity-preserving re-anchor
//   - signature changes mid-flight without losing sync

import { KIND, bindTransportSnapshot, logAudio } from './audioLogStore';

const DEFAULT_CPS = 0.5;            // 0.5 cps = 2-second cycle
const DEFAULT_BEATS_PER_CYCLE = 4;  // 4/4

const safeAC = () => {
  try {
    return typeof window !== 'undefined' && typeof window.getAudioContext === 'function'
      ? window.getAudioContext()
      : null;
  } catch { return null; }
};

class Transport {
  constructor() {
    this.cps = DEFAULT_CPS;
    this.beatsPerCycle = DEFAULT_BEATS_PER_CYCLE;
    this.cycleEpoch = 0;       // audio-time at which currentCycle == 0
    this.isRunning = false;
    this._listeners = new Set();
    this._tickRaf = 0;
    this._lastBeatAnnounced = -1;
    this._lastCycleAnnounced = -1;
  }

  // ---------- AudioContext lifecycle ----------

  async start() {
    const ac = safeAC();
    if (!ac) {
      logAudio(KIND.error, 'transport.start', 'no AudioContext yet — initStrudel needed');
      return false;
    }
    if (ac.state === 'suspended') {
      try { await ac.resume(); }
      catch (e) { logAudio(KIND.error, 'transport.start resume failed', e.message || String(e)); }
    }
    // Anchor cycle 0 to *now*. Tiny lookahead so the first beat doesn't fire
    // in the past for any consumer that schedules at currentCycle().
    this.cycleEpoch = ac.currentTime;
    this.isRunning = true;
    this._lastBeatAnnounced = -1;
    this._lastCycleAnnounced = -1;
    this._startTickLoop();
    logAudio(KIND.info, 'transport.start',
      `cps=${this.cps} sig=${this.beatsPerCycle}/x epoch=${this.cycleEpoch.toFixed(3)}`);
    return true;
  }

  async stop() {
    this.isRunning = false;
    this._stopTickLoop();
    let hushed = false;
    let reset = false;
    let suspended = false;
    try {
      if (typeof window.hush === 'function') { window.hush(); hushed = true; }
    } catch (e) { console.warn('hush failed', e); }
    try {
      if (typeof window.resetGlobalEffects === 'function') {
        window.resetGlobalEffects(); reset = true;
      }
    } catch (e) { console.warn('resetGlobalEffects failed', e); }
    const ac = safeAC();
    if (ac && ac.state === 'running') {
      try { await ac.suspend(); suspended = true; }
      catch (e) { console.warn('suspend failed', e); }
    }
    logAudio(KIND.kill, 'transport.stop',
      `hush=${hushed} reset=${reset} suspended=${suspended} state=${safeAC()?.state}`);
  }

  // Resume the context without re-anchoring (used by SoundPlayer when firing
  // a one-shot while the transport is "stopped" — e.g. dev-panel Test).
  async ensureRunning() {
    const ac = safeAC();
    if (ac && ac.state === 'suspended') {
      try { await ac.resume(); }
      catch (e) { console.warn('ensureRunning resume failed', e); }
    }
  }

  // ---------- time math ----------

  now() {
    const ac = safeAC();
    return ac ? ac.currentTime : 0;
  }

  currentCycle() {
    if (!this.isRunning) return 0;
    return (this.now() - this.cycleEpoch) * this.cps;
  }

  currentBeat() {
    return this.currentCycle() * this.beatsPerCycle;
  }

  cycleToTime(cycle) {
    return this.cycleEpoch + cycle / this.cps;
  }

  // Reserved for checkpoint 2 — quantized scheduling.
  nextBeatAt() {
    const beat = this.currentBeat();
    const nextBeat = Math.floor(beat) + 1;
    return this.cycleToTime(nextBeat / this.beatsPerCycle);
  }

  nextCycleAt() {
    const cycle = this.currentCycle();
    return this.cycleToTime(Math.floor(cycle) + 1);
  }

  // ---------- subscriptions ----------

  // Called every animation frame while running with { cycle, beat, cps,
  // beatsPerCycle, cycleEpoch }. Also called once with the initial state.
  subscribe(fn) {
    this._listeners.add(fn);
    fn(this._snapshot());
    return () => this._listeners.delete(fn);
  }

  _snapshot() {
    return {
      isRunning: this.isRunning,
      cps: this.cps,
      beatsPerCycle: this.beatsPerCycle,
      cycleEpoch: this.cycleEpoch,
      cycle: this.currentCycle(),
      beat: this.currentBeat(),
    };
  }

  _startTickLoop() {
    this._stopTickLoop();
    const tick = () => {
      const snap = this._snapshot();
      const wholeBeat = Math.floor(snap.beat);
      const wholeCycle = Math.floor(snap.cycle);
      if (wholeBeat !== this._lastBeatAnnounced) {
        this._lastBeatAnnounced = wholeBeat;
        // Beat boundary crossed — could log/visualize here later.
      }
      if (wholeCycle !== this._lastCycleAnnounced) {
        this._lastCycleAnnounced = wholeCycle;
      }
      this._listeners.forEach((fn) => {
        try { fn(snap); } catch (e) { console.warn('transport listener', e); }
      });
      if (this.isRunning) {
        this._tickRaf = requestAnimationFrame(tick);
      }
    };
    this._tickRaf = requestAnimationFrame(tick);
  }

  _stopTickLoop() {
    if (this._tickRaf) {
      cancelAnimationFrame(this._tickRaf);
      this._tickRaf = 0;
    }
    // Final tick so HUD can settle into a stopped state.
    const snap = this._snapshot();
    this._listeners.forEach((fn) => {
      try { fn(snap); } catch {}
    });
  }
}

const transport = new Transport();
// Let the audio log stamp every entry with the transport's current cycle/beat
// without creating an import cycle.
bindTransportSnapshot(() => transport._snapshot());
export default transport;
