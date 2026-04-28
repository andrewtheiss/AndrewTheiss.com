import React, { useEffect, useRef, useState } from 'react';
import { KIND, clearAudioLog, subscribeAudioLog } from './audioLogStore';

const KIND_LABEL = {
  [KIND.trigger]: 'TRIG',
  [KIND.layerOn]: 'LAY+',
  [KIND.layerOff]: 'LAY-',
  [KIND.oneShotOn]: '1SHOT+',
  [KIND.oneShotOff]: '1SHOT-',
  [KIND.compile]: 'EVAL',
  [KIND.kill]: 'KILL',
  [KIND.error]: 'ERR',
  [KIND.info]: 'INFO',
};

const fmtTime = (ts) => {
  const d = new Date(ts);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
};

const fmtTransport = (e) => {
  if (!e || !e.isRunning || e.cycle == null) return '—';
  const beatsPerCycle = e.beatsPerCycle || 4;
  const beatInCycle = ((e.beat ?? 0) % beatsPerCycle + beatsPerCycle) % beatsPerCycle;
  return `c${e.cycle.toFixed(2)} b${(Math.floor(beatInCycle) + 1)}/${beatsPerCycle}`;
};

const AudioLog = () => {
  const [entries, setEntries] = useState([]);
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef(null);
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => subscribeAudioLog((next) => {
    if (pausedRef.current) return;
    setEntries(next.slice());
  }), []);

  useEffect(() => {
    if (!autoScroll) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, autoScroll]);

  return (
    <div className="audio-log">
      <div className="audio-log-head">
        <span className="audio-log-title">Audio log</span>
        <span className="audio-log-count">{entries.length}</span>
        <label className="audio-log-toggle">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          auto-scroll
        </label>
        <button
          type="button"
          className="audio-log-btn"
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          className="audio-log-btn"
          onClick={() => { clearAudioLog(); }}
        >
          Clear
        </button>
      </div>
      <div className="audio-log-list" ref={listRef}>
        {entries.length === 0 && (
          <div className="audio-log-empty">No events yet — interact with the game or panel.</div>
        )}
        {entries.map((e) => (
          <div key={e.id} className={`audio-log-row k-${e.kind}`}>
            <span className="audio-log-ts">{fmtTime(e.ts)}</span>
            <span className="audio-log-tr">{fmtTransport(e)}</span>
            <span className="audio-log-kind">{KIND_LABEL[e.kind] || e.kind}</span>
            <span className="audio-log-label">{e.label}</span>
            {e.detail && <span className="audio-log-detail">{e.detail}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioLog;
