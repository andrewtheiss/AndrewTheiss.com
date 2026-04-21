import { clearAll, getAllEntries, hasSample, putSample } from './sampleCache';

const DIRT_BASE = 'https://raw.githubusercontent.com/tidalcycles/dirt-samples/master/';
const MANIFEST_URL = `${DIRT_BASE}strudel.json`;

// Curated list of commonly used drum/synth packs. Users can extend by downloading
// additional packs manually later; this keeps the initial download to a few MB.
export const COMMON_PACKS = [
  'bd', 'sd', 'hh', 'cp', 'oh', 'rim', 'cb',
  'lt', 'mt', 'ht', 'crash', 'cr',
  'bass', 'sax', 'pluck', 'piano',
];

let cachedManifest = null;

const fetchManifest = async () => {
  if (cachedManifest) return cachedManifest;
  const res = await fetch(MANIFEST_URL, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to fetch strudel.json (${res.status})`);
  cachedManifest = await res.json();
  return cachedManifest;
};

const filesForPack = (manifest, pack) => {
  const entry = manifest?.[pack];
  if (!Array.isArray(entry)) return [];
  // Entries are relative paths like "bd/BT0A0A7.wav".
  return entry.map((p) => String(p));
};

export const downloadPacks = async (packs = COMMON_PACKS, onProgress = () => {}) => {
  const manifest = await fetchManifest();
  const selected = packs.filter((p) => Array.isArray(manifest?.[p]));
  const allPaths = selected.flatMap((p) => filesForPack(manifest, p));

  const total = allPaths.length;
  let done = 0;
  let skipped = 0;
  let failed = 0;

  onProgress({ done, total, skipped, failed, phase: 'starting' });

  for (const path of allPaths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      if (await hasSample(path)) {
        skipped += 1;
        done += 1;
        onProgress({ done, total, skipped, failed, phase: 'cached', path });
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(`${DIRT_BASE}${path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // eslint-disable-next-line no-await-in-loop
      const blob = await res.blob();
      // eslint-disable-next-line no-await-in-loop
      await putSample(path, blob);
      done += 1;
      onProgress({ done, total, skipped, failed, phase: 'downloaded', path });
    } catch (err) {
      failed += 1;
      done += 1;
      onProgress({ done, total, skipped, failed, phase: 'failed', path, error: err });
    }
  }

  return { total, skipped, failed, downloaded: total - skipped - failed, packs: selected };
};

// Builds a Strudel-compatible sample manifest from IndexedDB: { bd: [blobURL, ...], ... }
// Keeps a running registry of blob URLs so callers can revoke them on unmount.
export const buildLocalSampleMap = async () => {
  const entries = await getAllEntries();
  const byPack = new Map();
  const urls = [];

  entries.forEach(([path, blob]) => {
    if (!(blob instanceof Blob)) return;
    const pack = String(path).split('/')[0];
    if (!pack) return;
    const url = URL.createObjectURL(blob);
    urls.push(url);
    const list = byPack.get(pack) || [];
    list.push(url);
    byPack.set(pack, list);
  });

  const map = {};
  byPack.forEach((list, pack) => {
    map[pack] = list;
  });

  return { map, urls };
};

export const revokeSampleUrls = (urls = []) => {
  urls.forEach((u) => {
    try { URL.revokeObjectURL(u); } catch (_) { /* noop */ }
  });
};

export const listDownloadedPacks = async () => {
  const entries = await getAllEntries();
  const packs = new Set();
  entries.forEach(([path]) => {
    const pack = String(path).split('/')[0];
    if (pack) packs.add(pack);
  });
  return Array.from(packs).sort();
};

export const countDownloadedFiles = async () => {
  const entries = await getAllEntries();
  return entries.length;
};

export const clearSamples = () => clearAll();
