// Tiny pub/sub log of audio lifecycle events. Shared between strudelEngine
// (the producer) and the AudioLog UI (the consumer) so we can see exactly
// when a sound is asked to start, when it's evaluated, when it ends, when
// the global effect chain is reset, etc.

const MAX_ENTRIES = 200;
let entries = [];
let serial = 0;
const listeners = new Set();

const notify = () => {
  listeners.forEach((fn) => {
    try { fn(entries); } catch (e) { console.warn('audioLog listener', e); }
  });
};

export const KIND = Object.freeze({
  trigger: 'trigger',   // someone asked for a sound to play (game / panel / test)
  layerOn: 'layerOn',   // sustained layer added
  layerOff: 'layerOff', // sustained layer removed
  oneShotOn: 'oneShotOn',
  oneShotOff: 'oneShotOff',
  compile: 'compile',   // strudel evaluate() ran
  kill: 'kill',         // hush + resetGlobalEffects
  error: 'error',
  info: 'info',
});

// Lazily reach the transport so this module has no import cycle. The audio
// log is a leaf and the transport doesn't need to know it exists.
let getTransportSnapshot = () => null;
export function bindTransportSnapshot(fn) { getTransportSnapshot = fn; }

export function logAudio(kind, label, detail) {
  let cycle = null;
  let beat = null;
  let beatsPerCycle = null;
  let isRunning = false;
  try {
    const snap = getTransportSnapshot();
    if (snap) {
      cycle = snap.cycle;
      beat = snap.beat;
      beatsPerCycle = snap.beatsPerCycle;
      isRunning = snap.isRunning;
    }
  } catch {}
  const entry = {
    id: ++serial,
    ts: Date.now(),
    kind,
    label: String(label || ''),
    detail: detail == null ? '' : String(detail),
    cycle,
    beat,
    beatsPerCycle,
    isRunning,
  };
  entries = entries.concat(entry).slice(-MAX_ENTRIES);
  notify();
  return entry;
}

export function clearAudioLog() {
  entries = [];
  notify();
}

export function getAudioLog() {
  return entries;
}

export function subscribeAudioLog(fn) {
  listeners.add(fn);
  fn(entries);
  return () => listeners.delete(fn);
}
