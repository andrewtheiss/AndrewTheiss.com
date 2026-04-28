import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './MusicPage.css';
import ShooterGame from './ShooterGame';
import SoundDevPanel from './SoundDevPanel';
import {
  COMMON_PACKS,
  clearSamples,
  countDownloadedFiles,
  downloadPacks,
  listDownloadedPacks,
} from './dirtSamples';
import {
  clearBgMusic,
  initOnce,
  refreshSamples,
  setBgMusic,
} from './strudelEngine';
import { fireSound } from './soundPlayer';
import transport from './transport';
import AudioLog from './AudioLog';
import { KIND, logAudio } from './audioLogStore';

const MusicPage = () => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [cachedPacks, setCachedPacks] = useState([]);
  const [cachedCount, setCachedCount] = useState(0);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [samplesOpen, setSamplesOpen] = useState(false);

  // Bindings cache pushed up from the dev panel; the game's onTrigger reads
  // these to fire the right sound for each engine slot.
  const bindingsRef = useRef({ sounds: [], gameObjects: [], slots: {} });
  const handleBindingsChange = useCallback((b) => {
    bindingsRef.current = b;
  }, []);

  const refreshCacheState = useCallback(async () => {
    try {
      const [packs, count] = await Promise.all([
        listDownloadedPacks(),
        countDownloadedFiles(),
      ]);
      setCachedPacks(packs);
      setCachedCount(count);
    } catch (err) {
      setError(err.message || 'Could not read local cache');
    }
  }, []);

  useEffect(() => {
    refreshCacheState();
  }, [refreshCacheState]);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    setLastResult(null);
    setProgress({ done: 0, total: 0 });
    try {
      const result = await downloadPacks(COMMON_PACKS, (p) => setProgress(p));
      setLastResult(result);
      await refreshSamples();
      await refreshCacheState();
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleClear = async () => {
    const ok = typeof window !== 'undefined'
      && window.confirm('Delete all locally cached samples? You\'ll need to re-download.');
    if (!ok) return;
    try {
      await clearSamples();
      setLastResult(null);
      setProgress(null);
      await refreshSamples();
      await refreshCacheState();
    } catch (err) {
      setError(err.message || 'Could not clear cache');
    }
  };

  const pct = progress && progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  // Resolve a slot binding to its sound object.
  const resolveSlot = useCallback((slot) => {
    const { sounds, slots } = bindingsRef.current;
    const soundId = slots?.[slot];
    if (!soundId) return null;
    return (sounds || []).find((s) => s.id === soundId) || null;
  }, []);

  // Game emits in-game events. Checkpoint 1: SFX fire IMMEDIATELY (no
  // quantization yet); the bg music slot is owned by the Start handler.
  const handleGameTrigger = useCallback(async (slot) => {
    const sound = resolveSlot(slot);
    if (!sound || !sound.code) {
      logAudio(KIND.trigger, `game→${slot}`, sound ? 'sound has no code' : 'no sound bound');
      return;
    }
    // Sustained slots (bg music etc.) are owned by transport start/stop, not
    // per-event triggers. Anything else is a fire-and-forget one-shot.
    if (slot === 'bgLoop' || sound.mode === 'loop') {
      logAudio(KIND.info, `game→${slot} skipped`,
        'loop slots are managed by Start/Stop, not per-event');
      return;
    }
    logAudio(KIND.trigger, `game→${slot}`,
      `${sound.name} cycle=${transport.currentCycle().toFixed(3)}`);
    await fireSound(sound, { label: `game:${slot}` });
  }, [resolveSlot]);

  // Big Start button → start transport + kick off bg music. The game already
  // flipped its phase to 'playing' before calling us, so this all runs in
  // the background and the click feels instant.
  const handleStart = useCallback(async () => {
    try {
      await initOnce();              // ensure Strudel/superdough are wired
      await transport.start();       // resume AC, anchor cycle 0 to NOW
      const bg = resolveSlot('bgLoop');
      if (bg && bg.code) {
        logAudio(KIND.trigger, 'start→bgLoop', bg.name);
        await setBgMusic(bg.code);
      } else {
        logAudio(KIND.info, 'start: no bg loop bound', 'silence ok');
      }
      // Optional one-shot Play stinger
      const stinger = resolveSlot('playStart');
      if (stinger && stinger.code && stinger.mode === 'oneShot') {
        await fireSound(stinger, { label: 'playStart' });
      }
    } catch (err) {
      logAudio(KIND.error, 'start failed', err.message || String(err));
    }
  }, [resolveSlot]);

  const handleStop = useCallback(async () => {
    try {
      await clearBgMusic();
      await transport.stop();
    } catch (err) {
      logAudio(KIND.error, 'stop failed', err.message || String(err));
    }
  }, []);

  const cacheSummary = useMemo(() => {
    if (cachedCount === 0) return 'No samples cached.';
    return `${cachedCount} file${cachedCount === 1 ? '' : 's'} across ${cachedPacks.length} pack${cachedPacks.length === 1 ? '' : 's'}.`;
  }, [cachedCount, cachedPacks.length]);

  return (
    <div className="music-page">
      <section className="music-hero">
        <p className="music-eyebrow">Music</p>
        <h1>Game + sound playground</h1>
        <p className="music-copy">
          Live-coded sounds via <code>@strudel/web</code> wired into a tiny shooter.
          Use the right pane to author and bind sounds to engine slots; the left pane is the game.
        </p>
      </section>

      <section className="music-sample-shell">
        <button
          type="button"
          className="music-accordion-head"
          onClick={() => setSamplesOpen((v) => !v)}
          aria-expanded={samplesOpen}
        >
          <span>Sample library</span>
          <span className="music-accordion-meta">
            {cacheSummary} <span className="music-accordion-caret">{samplesOpen ? '▾' : '▸'}</span>
          </span>
        </button>
        {samplesOpen && (
          <div className="music-accordion-body">
            <p className="music-copy">
              Drum/synth packs from <code>tidalcycles/dirt-samples</code>, cached in IndexedDB.
            </p>
            <div className="music-sample-actions">
              <button
                type="button"
                className="music-btn primary"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'Downloading…' : 'Download common samples'}
              </button>
              <button
                type="button"
                className="music-btn secondary"
                onClick={handleClear}
                disabled={downloading || cachedCount === 0}
              >
                Clear cache
              </button>
            </div>
            {progress && progress.total > 0 && (
              <div className="music-progress" aria-live="polite">
                <div className="music-progress-bar" style={{ width: `${pct}%` }} />
                <span className="music-progress-label">
                  {progress.done} / {progress.total} files • {pct}%
                  {progress.failed ? ` • ${progress.failed} failed` : ''}
                </span>
              </div>
            )}
            {cachedPacks.length > 0 && (
              <p className="music-sample-packs">
                <span className="music-eyebrow small">Cached packs</span>
                <span className="music-pack-list">
                  {cachedPacks.map((p) => <code key={p}>{p}</code>)}
                </span>
              </p>
            )}
            {lastResult && (
              <p className="music-sample-status">
                Downloaded {lastResult.downloaded}, skipped {lastResult.skipped}
                {lastResult.failed ? `, ${lastResult.failed} failed` : ''}.
              </p>
            )}
            {error && <p className="music-game-error">{error}</p>}
          </div>
        )}
      </section>

      <section className="music-split">
        <div className="music-split-game">
          <div className="music-game-area">
            <ShooterGame
              onTrigger={handleGameTrigger}
              onStart={handleStart}
              onStop={handleStop}
            />
          </div>
          <AudioLog />
        </div>
        <div className="music-split-panel">
          <SoundDevPanel onBindingsChange={handleBindingsChange} />
        </div>
      </section>
    </div>
  );
};

export default MusicPage;
