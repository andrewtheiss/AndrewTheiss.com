import { initStrudel } from '@strudel/web';
import { buildLocalSampleMap, revokeSampleUrls } from './dirtSamples';

let initPromise = null;
let isPlaying = false;
let activeUrls = [];

const registerFromCache = async () => {
  // Revoke any blob URLs from a previous registration to avoid leaks.
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

// Re-register samples after a fresh download so newly-cached packs become playable.
export async function refreshSamples() {
  await initOnce();
  return registerFromCache();
}

export async function play(pattern) {
  await initOnce();
  await window.evaluate(pattern);
  isPlaying = true;
}

export function stop() {
  if (typeof window.hush === 'function') {
    window.hush();
  }
  isPlaying = false;
}

export async function toggle(pattern) {
  if (isPlaying) {
    stop();
    return false;
  }
  await play(pattern);
  return true;
}

export function getIsPlaying() {
  return isPlaying;
}
