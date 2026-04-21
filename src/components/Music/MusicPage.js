import React, { useCallback, useEffect, useState } from 'react';
import './MusicPage.css';
import GameCanvas from './GameCanvas';
import {
  COMMON_PACKS,
  clearSamples,
  countDownloadedFiles,
  downloadPacks,
  listDownloadedPacks,
} from './dirtSamples';
import { refreshSamples } from './strudelEngine';

const MusicPage = () => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [cachedPacks, setCachedPacks] = useState([]);
  const [cachedCount, setCachedCount] = useState(0);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const refreshCacheState = useCallback(async () => {
    try {
      const [packs, count] = await Promise.all([
        listDownloadedPacks(),
        countDownloadedFiles(),
      ]);
      setCachedPacks(packs);
      setCachedCount(count);
    } catch (err) {
      // IDB might be unavailable (private mode, etc.)
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
      const result = await downloadPacks(COMMON_PACKS, (p) => {
        setProgress(p);
      });
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

  return (
    <div className="music-page">
      <section className="music-hero">
        <p className="music-eyebrow">Music</p>
        <h1>Live-code music in Strudel</h1>
        <p className="music-copy">
          Strudel runs entirely in-browser here via <code>@strudel/web</code> — no iframe,
          no external studio. Samples from the Tidal <code>dirt-samples</code> pack are fetched
          on demand and cached locally in IndexedDB, so subsequent visits play offline.
        </p>
      </section>

      <section className="music-sample-shell">
        <h2>Sample library</h2>
        <p className="music-copy">
          Click <strong>Download common samples</strong> to fetch a curated set of drum and
          synth packs (bd, sd, hh, cp, bass, piano, and more) straight from
          <code> tidalcycles/dirt-samples</code>. Files are stored in your browser only.
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

        <p className="music-sample-status">
          {cachedCount === 0
            ? 'No samples cached yet.'
            : `${cachedCount} file${cachedCount === 1 ? '' : 's'} cached across ${cachedPacks.length} pack${cachedPacks.length === 1 ? '' : 's'}.`}
        </p>

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
            Downloaded {lastResult.downloaded}, skipped {lastResult.skipped} (already cached)
            {lastResult.failed ? `, ${lastResult.failed} failed` : ''}.
          </p>
        )}

        {error && <p className="music-game-error">{error}</p>}
      </section>

      <section className="music-game-shell">
        <h2>Play</h2>
        <p className="music-copy">
          Click the canvas to start or stop. The default pattern uses the <code>bd</code>,
          <code> cp</code>, and <code>hh</code> packs — download samples first to hear the
          full mix.
        </p>
        <GameCanvas />
      </section>
    </div>
  );
};

export default MusicPage;
