// strudelEngine — narrowly scoped after the checkpoint-1 rebuild.
//
// Now this module only handles:
//   - initStrudel bootstrap (so window.evaluate / superdough / hush exist)
//   - the *sustained background music* slot (a single Strudel pattern run
//     through the repl, locked to transport.cps)
//   - sample cache registration
//
// One-shot game/SFX firing lives in soundPlayer.js (calls superdough
// directly). Lifecycle (resume/suspend, scheduler hush, effect reset) lives
// in transport.js. Those two own everything that used to live here.

import { initStrudel } from '@strudel/web';
import { buildLocalSampleMap, revokeSampleUrls } from './dirtSamples';
import { KIND, logAudio } from './audioLogStore';
import transport from './transport';

const summarize = (code) => {
  if (!code) return '';
  const oneLine = code.replace(/\s+/g, ' ').trim();
  return oneLine.length > 80 ? `${oneLine.slice(0, 77)}…` : oneLine;
};

let initPromise = null;
let activeUrls = [];
let bgCode = '';

const registerFromCache = async () => {
  if (activeUrls.length) {
    revokeSampleUrls(activeUrls);
    activeUrls = [];
  }
  const { map, urls } = await buildLocalSampleMap();
  if (Object.keys(map).length === 0) return false;
  activeUrls = urls;
  if (typeof window.samples === 'function') {
    await window.samples(map);
  }
  return true;
};

export function initOnce() {
  if (!initPromise) {
    initPromise = initStrudel({
      prebake: () => registerFromCache().catch((err) => {
        console.warn('No cached samples yet:', err);
      }),
    }).catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export async function refreshSamples() {
  await initOnce();
  return registerFromCache();
}

// ---------- background music ----------

export async function setBgMusic(code) {
  await initOnce();
  await transport.ensureRunning();
  if (!code) {
    return clearBgMusic();
  }
  bgCode = code;
  // Set Strudel's tempo to match transport. setcpm/setcps are global Strudel
  // helpers placed on globalThis by evalScope.
  try {
    if (typeof window.setcps === 'function') window.setcps(transport.cps);
  } catch {}
  logAudio(KIND.compile, 'bg music evaluate', summarize(code));
  try {
    await window.evaluate(code);
  } catch (err) {
    logAudio(KIND.error, 'bg music evaluate threw', err.message || String(err));
    throw err;
  }
}

export async function clearBgMusic() {
  bgCode = '';
  let hushed = false;
  try { if (typeof window.hush === 'function') { window.hush(); hushed = true; } }
  catch (e) { console.warn('hush failed', e); }
  try { if (typeof window.resetGlobalEffects === 'function') window.resetGlobalEffects(); }
  catch (e) { console.warn('resetGlobalEffects failed', e); }
  logAudio(KIND.layerOff, 'bg music cleared', `hush=${hushed}`);
}

export const getBgCode = () => bgCode;

// ---------- legacy API kept as no-ops / forwards (so older code paths
// don't crash while we finish migrating) ----------

export async function setLayer() { /* removed in checkpoint 1 */ }
export async function clearLayer() {}
export async function clearAllLayers() {
  await transport.stop();
}
export async function playOnce() { /* use soundPlayer.fireOnce instead */ }
export const playSound = () => null;
export async function play(pattern) { return setBgMusic(pattern); }
export async function stop() { return transport.stop(); }
export async function toggle(pattern) {
  if (bgCode) { await transport.stop(); return false; }
  await setBgMusic(pattern);
  return true;
}
export const getIsPlaying = () => Boolean(bgCode) && transport.isRunning;
