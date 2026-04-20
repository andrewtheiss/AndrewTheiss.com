import { initStrudel } from '@strudel/web';

let initPromise = null;
let isPlaying = false;

export function initOnce() {
  if (!initPromise) {
    initPromise = initStrudel({
      prebake: () => window.samples('github:tidalcycles/dirt-samples'),
    }).catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export async function play(pattern) {
  await initOnce();
  // initStrudel exposes evaluate/hush as globals on window
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
