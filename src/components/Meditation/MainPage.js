import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { AuthUserContext } from '../Session';
import * as ROUTES from '../../constants/routes';
import {
  addMeditationEntry,
  listMonthlyTotals,
  listRecentMeditations,
  updateMonthlyTotals,
} from '../Firebase/meditationService';
import './MainPage.css';

const wheelValues = Array.from({ length: 60 }, (_, i) => i); // 0..59 inclusive
const wheelHours = wheelValues;
const wheelMinutes = wheelValues;
const wheelSeconds = wheelValues;
const defaultDuration = { hours: 1, minutes: 0, seconds: 0 };
const defaultDurationSeconds =
  defaultDuration.hours * 3600 + defaultDuration.minutes * 60 + defaultDuration.seconds;

const formatSeconds = (totalSeconds) => {
  const safeTotal = Math.max(0, Math.round(totalSeconds || 0));
  const hours = Math.floor(safeTotal / 3600);
  const minutes = Math.floor((safeTotal % 3600) / 60);
  const seconds = safeTotal % 60;
  const pad = (num) => String(num).padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
};

const formatMinutesShort = (seconds) => {
  const mins = Math.round((Number(seconds) || 0) / 60);
  return `${mins} min`;
};

const TimerDisplay = React.memo(({ remainingSeconds, overtimeSeconds }) => {
  const isOvertime = Number(overtimeSeconds || 0) > 0;
  const display = isOvertime
    ? `+${formatSeconds(overtimeSeconds)}`
    : formatSeconds(remainingSeconds);
  return <div className="timer-display">{display}</div>;
});
TimerDisplay.displayName = 'TimerDisplay';

const WheelColumn = React.memo(({
  label,
  values,
  value,
  onChange,
}) => {
  const REPEAT_COUNT = 7; // odd number so we can "recenter" invisibly
  const scrollerRef = useRef(null);
  const rafRef = useRef(0);
  const scrollStopRef = useRef(null);
  const didInitRef = useRef(false);
  const [metrics, setMetrics] = useState({ itemHeight: 38, pad: 76 });
  const [centerAbsIndex, setCenterAbsIndex] = useState(0);

  const baseLen = values.length;
  const middleRepeat = Math.floor(REPEAT_COUNT / 2);
  const baseStartIndex = middleRepeat * baseLen;

  const getCenteredAbsIndex = useCallback((node) => {
    if (!node) return 0;
    const centerY = node.scrollTop + node.clientHeight / 2;
    const offset = metrics.pad + metrics.itemHeight / 2;
    return Math.round((centerY - offset) / metrics.itemHeight);
  }, [metrics.itemHeight, metrics.pad]);

  const scrollToIndex = useCallback((index, behavior = 'auto') => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({
      top: index * metrics.itemHeight,
      behavior,
    });
  }, [metrics.itemHeight]);

  const computeMetrics = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const firstItem = node.querySelector('.wheel-item');
    const itemHeight = firstItem?.getBoundingClientRect()?.height || 38;
    const viewportHeight = node.clientHeight || 190;
    const pad = Math.max(0, (viewportHeight - itemHeight) / 2);
    setMetrics({ itemHeight, pad });
  }, []);

  useEffect(() => {
    computeMetrics();
    const node = scrollerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => computeMetrics());
    ro.observe(node);
    return () => ro.disconnect();
  }, [computeMetrics]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const index = Math.max(0, values.indexOf(value));
    const target = baseStartIndex + index;
    setCenterAbsIndex(target);
    scrollToIndex(target, 'auto');
  }, [baseStartIndex, scrollToIndex, value, values]);

  const repeatedValues = useMemo(
    () => Array.from({ length: baseLen * REPEAT_COUNT }, (_, i) => values[i % baseLen]),
    [baseLen, values],
  );

  const recenterToValueIndex = useCallback((valueIndex, behavior = 'auto') => {
    const target = baseStartIndex + valueIndex;
    setCenterAbsIndex(target);
    scrollToIndex(target, behavior);
  }, [baseStartIndex, scrollToIndex]);

  const handleScroll = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const centeredIndex = getCenteredAbsIndex(node);
      const modIndex = ((centeredIndex % baseLen) + baseLen) % baseLen;
      const next = values[modIndex];
      setCenterAbsIndex(centeredIndex);
      if (next !== value) onChange(next);

      // If we scroll near either end of the repeated list, jump back to the middle
      // to preserve the illusion of infinite scrolling. (Not visible because items repeat.)
      const minIndex = baseLen; // first repeat "buffer"
      const maxIndex = baseLen * (REPEAT_COUNT - 1); // last repeat "buffer"
      if (centeredIndex < minIndex || centeredIndex > maxIndex) {
        const jumped = baseStartIndex + modIndex;
        node.scrollTop = jumped * metrics.itemHeight;
        setCenterAbsIndex(jumped);
      }
    });

    if (scrollStopRef.current) clearTimeout(scrollStopRef.current);
    scrollStopRef.current = setTimeout(() => {
      const centeredIndex = getCenteredAbsIndex(node);
      const modIndex = ((centeredIndex % baseLen) + baseLen) % baseLen;
      // Snap + recenter (same visible items; keeps the wheel "infinite").
      recenterToValueIndex(modIndex, 'auto');
    }, 120);
  }, [baseLen, baseStartIndex, getCenteredAbsIndex, metrics.itemHeight, onChange, recenterToValueIndex, value, values]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (scrollStopRef.current) clearTimeout(scrollStopRef.current);
  }, []);

  return (
    <div className="wheel-column">
      <div className="wheel-label">{label}</div>
      <div className="wheel-window">
        <div
          className="wheel-scroller"
          ref={scrollerRef}
          onScroll={handleScroll}
          role="listbox"
          aria-label={label}
          style={{ paddingTop: metrics.pad, paddingBottom: metrics.pad }}
        >
          {repeatedValues.map((v, idx) => {
            const isSelected = idx === centerAbsIndex;
            return (
              <button
                key={`${label}-${idx}`}
                type="button"
                className={`wheel-item${isSelected ? ' selected' : ''}`}
                onClick={() => {
                  scrollToIndex(idx, 'smooth');
                }}
                role="option"
                aria-selected={isSelected}
              >
                {String(v).padStart(2, '0')}
              </button>
            );
          })}
        </div>
        <div className="wheel-fade top" aria-hidden />
        <div className="wheel-fade bottom" aria-hidden />
        <div className="wheel-highlight" aria-hidden />
      </div>
    </div>
  );
});
WheelColumn.displayName = 'WheelColumn';

const MonthlyBarGraph = ({ data }) => {
  if (!data?.length) {
    return <p className="body small">No monthly totals yet.</p>;
  }
  const max = Math.max(...data.map((d) => Number(d.totalDurationSeconds || 0)), 0) || 1;
  return (
    <div className="bar-graph">
      {data.map((entry) => {
        const value = Number(entry.totalDurationSeconds || 0);
        const pct = Math.max(2, Math.min(100, (value / max) * 100));
        return (
          <div className="bar-row" key={entry.id || entry.month}>
            <span className="bar-label">{entry.month || entry.id}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="bar-value">{formatMinutesShort(value)}</span>
          </div>
        );
      })}
    </div>
  );
};

const CumulativeLineChart = ({ data }) => {
  if (!data?.length) {
    return <p className="body small">No history yet.</p>;
  }
  const values = data.map((d) => Number(d.cumulative || 0)); // minutes
  const max = Math.max(...values, 0) || 1;
  const width = 520;
  const height = 160;
  const padding = 24;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : width - padding * 2;

  const points = values.map((v, idx) => {
    const x = padding + idx * step;
    const y = height - padding - (v / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#72d6ff" />
            <stop offset="100%" stopColor="#7be8ff" />
          </linearGradient>
        </defs>
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        <text x={padding - 6} y={padding + 4} className="axis-label" textAnchor="end">
          {formatMinutesShort(max * 60)}
        </text>
        <text x={padding - 6} y={height - padding + 14} className="axis-label" textAnchor="end">
          0
        </text>
        <polyline
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          points={points}
        />
      </svg>
      <div className="line-chart-labels">
        <span className="body small">Start</span>
        <span className="body small">Latest</span>
      </div>
      <div className="line-chart-legend">
        <span className="eyebrow">All-time cumulative minutes</span>
        <span className="body small">{formatMinutesShort(values[values.length - 1] * 60)}</span>
      </div>
    </div>
  );
};

const MeditationMainPage = () => {
  const authUser = useContext(AuthUserContext);
  const [durationHours, setDurationHours] = useState(defaultDuration.hours);
  const [durationMinutes, setDurationMinutes] = useState(defaultDuration.minutes);
  const [durationSecs, setDurationSecs] = useState(defaultDuration.seconds);
  const [preset, setPreset] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [plannedDurationSeconds, setPlannedDurationSeconds] = useState(defaultDurationSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Pick a duration and press start.');
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [updatingTotals, setUpdatingTotals] = useState(false);
  const [totalsMessage, setTotalsMessage] = useState('');
  const [totalsError, setTotalsError] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const startedAtMsRef = useRef(null);
  const didBellRef = useRef(false);

  const durationSeconds = useMemo(
    () => Math.max(1, durationHours * 3600 + durationMinutes * 60 + durationSecs),
    [durationHours, durationMinutes, durationSecs],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const playBell = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      const stopAt = ctx.currentTime + 1.6;
      oscillator.stop(stopAt);
      // Close shortly after playback to free resources and avoid leaking contexts.
      setTimeout(() => {
        ctx.close().catch(() => { });
        if (audioCtxRef.current === ctx) {
          audioCtxRef.current = null;
        }
      }, (stopAt - ctx.currentTime) * 1000 + 200);
    } catch (err) {
      // Playback can fail if autoplay is blocked; swallow quietly.
      console.warn('Bell playback failed', err);
    }
  }, []);

  const finishSession = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    const completedTime = new Date();
    setFinishedAt(completedTime);
    setStatusMessage('Session complete. Save to your log.');
    if (!didBellRef.current) {
      didBellRef.current = true;
      playBell();
    }
  }, [clearTimer, playBell]);

  useEffect(() => {
    if (!isRunning) return undefined;

    timerRef.current = setInterval(() => {
      const startMs = startedAtMsRef.current;
      if (!startMs) return;
      const nextElapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setElapsedSeconds(nextElapsed);

      if (!didBellRef.current && nextElapsed >= plannedDurationSeconds) {
        didBellRef.current = true;
        setStatusMessage('Time’s up — continuing to track additional time.');
        playBell();
      }
    }, 1000);

    return clearTimer;
  }, [clearTimer, isRunning, plannedDurationSeconds, playBell]);

  useEffect(() => () => {
    clearTimer();
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => { });
      audioCtxRef.current = null;
    }
  }, [clearTimer]);

  const handleStart = () => {
    if (!authUser?.auth) {
      setError(new Error('Sign in to start a meditation.'));
      return;
    }
    setError(null);
    setSaveMessage('');
    const now = new Date();
    startedAtMsRef.current = now.getTime();
    didBellRef.current = false;
    setStartedAt(now);
    setFinishedAt(null);
    setElapsedSeconds(0);
    setPlannedDurationSeconds(durationSeconds);
    setStatusMessage('Meditation in progress…');
    setIsRunning(true);
  };

  const handleCancel = () => {
    clearTimer();
    setIsRunning(false);
    startedAtMsRef.current = null;
    didBellRef.current = false;
    setElapsedSeconds(0);
    setStartedAt(null);
    setFinishedAt(null);
    setStatusMessage('Meditation cancelled.');
  };

  const handleCompleteEarly = () => {
    if (!startedAt) return;
    finishSession();
  };

  const actualDurationSeconds = useMemo(() => {
    if (startedAt && finishedAt) {
      return Math.max(1, Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000));
    }
    if (startedAt) {
      return Math.max(1, Math.round(Number(elapsedSeconds) || 0));
    }
    return plannedDurationSeconds;
  }, [elapsedSeconds, finishedAt, plannedDurationSeconds, startedAt]);

  const additionalSeconds = useMemo(
    () => Math.max(0, actualDurationSeconds - plannedDurationSeconds),
    [actualDurationSeconds, plannedDurationSeconds],
  );

  const remainingSeconds = useMemo(
    () => Math.max(0, plannedDurationSeconds - elapsedSeconds),
    [elapsedSeconds, plannedDurationSeconds],
  );

  const overtimeSeconds = useMemo(
    () => Math.max(0, elapsedSeconds - plannedDurationSeconds),
    [elapsedSeconds, plannedDurationSeconds],
  );

  const handleSaveDuration = async (durationToSaveSeconds) => {
    if (!authUser?.user) {
      setError(new Error('Sign in to save your meditation.'));
      return;
    }
    if (!startedAt) {
      setError(new Error('Start and finish a meditation before saving.'));
      return;
    }
    setSaving(true);
    setError(null);
    setStatusMessage('Saving session…');
    try {
      await addMeditationEntry({
        uid: authUser.user.uid,
        startedAt,
        durationSeconds: Math.max(1, Math.round(Number(durationToSaveSeconds) || 0)),
        preset: preset.trim(),
      });
      setSaveMessage('Meditation saved to your log.');
      setStatusMessage('Meditation saved.');
      startedAtMsRef.current = null;
      didBellRef.current = false;
      setElapsedSeconds(0);
      setStartedAt(null);
      setFinishedAt(null);
      loadData();
    } catch (err) {
      setError(err);
      setStatusMessage('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const parseDurationToSeconds = (value) => {
    if (!value) return 0;
    const parts = String(value).split(':').map((v) => Number(v) || 0);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    }
    if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    }
    return Number(parts[0]) || 0;
  };

  const parseCsvText = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length);
    if (lines.length <= 1) return [];
    const [, ...rows] = lines; // skip header

    return rows
      .map((row, index) => {
        const cols = row.split(',');
        if (cols.length < 4) return null;
        const [startedAtRaw, durationRaw, presetRaw, activityRaw] = cols;
        const parsedDate = new Date(startedAtRaw);
        if (Number.isNaN(parsedDate.getTime())) {
          return null;
        }
        const durationSeconds = parseDurationToSeconds(durationRaw);
        return {
          startedAt: parsedDate,
          durationSeconds: durationSeconds || 1,
          preset: (presetRaw || '').trim(),
          activity: (activityRaw || 'Meditation').trim() || 'Meditation',
          line: index + 2, // account for header
        };
      })
      .filter(Boolean);
  };

  const importFromCsv = async (file) => {
    if (!file) return;
    if (!authUser?.user) {
      setImportError(new Error('Sign in to import meditations.'));
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportMessage('Reading file…');
    setImportResult(null);

    try {
      const text = await file.text();
      const parsed = parseCsvText(text);
      if (parsed.length === 0) {
        throw new Error('No valid rows found in the CSV.');
      }

      let success = 0;
      let failures = 0;
      for (const row of parsed) {
        try {
          await addMeditationEntry({
            uid: authUser.user.uid,
            startedAt: row.startedAt,
            durationSeconds: row.durationSeconds,
            preset: row.preset,
            activity: row.activity,
          });
          success += 1;
        } catch (err) {
          failures += 1;
          if (err?.message?.includes('Daily meditation limit')) {
            throw err;
          }
        }
        if ((success + failures) % 25 === 0) {
          setImportMessage(`Uploaded ${success} rows…`);
        }
      }

      setImportMessage(`Import complete. Uploaded ${success} row(s).`);
      setImportResult({ success, failures });
    } catch (err) {
      setImportError(err);
      setImportMessage('Import stopped.');
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromCsv(file);
      event.target.value = '';
    }
  };

  const handleUpdateTotals = async () => {
    if (!authUser?.user) {
      setTotalsError(new Error('Sign in to update totals.'));
      return;
    }
    setTotalsError(null);
    setTotalsMessage('Updating monthly totals…');
    setUpdatingTotals(true);
    try {
      const result = await updateMonthlyTotals(authUser.user.uid);
      setTotalsMessage(`Monthly totals updated. Months: ${result.monthsUpdated}. Sessions processed: ${result.sessionsProcessed}.`);
      loadData();
    } catch (err) {
      setTotalsError(err);
      setTotalsMessage('Failed to update monthly totals.');
    } finally {
      setUpdatingTotals(false);
    }
  };

  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [sessions, totals] = await Promise.all([
        listRecentMeditations(30),
        listMonthlyTotals(36),
      ]);
      setRecentSessions(sessions);
      setMonthlyTotals(totals);
    } catch (err) {
      setDataError(err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDateTime = (value) => {
    if (!value) return '';
    if (value.toDate) return value.toDate().toLocaleString();
    return new Date(value).toLocaleString();
  };

  const monthlySorted = useMemo(
    () => [...monthlyTotals].sort((a, b) => (a.month || a.id || '').localeCompare(b.month || b.id || '')),
    [monthlyTotals],
  );

  const graphData = useMemo(() => [...monthlySorted].reverse(), [monthlySorted]);

  const cumulativeData = useMemo(() => {
    let running = 0;
    return monthlySorted.map((entry) => {
      const value = Number(entry.totalDurationSeconds || 0);
      running += value;
      return { ...entry, cumulative: running / 60 }; // store minutes
    });
  }, [monthlySorted]);

  return (
    <div className="meditation-page">
      <div className="meditation-card">
        <p className="eyebrow">Meditation</p>
        <h1>Time your session</h1>

        {!authUser?.auth && (
          <p className="body">
            You can view stats below. Sign in to track your own sessions.{' '}
            <Link to={ROUTES.SIGNIN} className="meditation-link">Go to sign in</Link>
          </p>
        )}

        {authUser?.auth && (
          <>
            <p className="body">
              Start a timer, hear a bell when the planned time ends, keep going if you want, then save the session to Firestore.
            </p>

            <div className="meditation-controls">
              <div className="meditation-control">
                <label>Duration</label>
                <div className={`duration-wheels${isRunning || finishedAt ? ' disabled' : ''}`} aria-label="Duration wheels">
                  <WheelColumn
                    label="Hours"
                    values={wheelHours}
                    value={durationHours}
                    onChange={setDurationHours}
                  />
                  <WheelColumn
                    label="Minutes"
                    values={wheelMinutes}
                    value={durationMinutes}
                    onChange={setDurationMinutes}
                  />
                  <WheelColumn
                    label="Seconds"
                    values={wheelSeconds}
                    value={durationSecs}
                    onChange={setDurationSecs}
                  />
                </div>
                <p className="duration-subtitle">Total • {formatSeconds(durationSeconds)}</p>
              </div>

              <div className="meditation-control">
                <label htmlFor="preset">Preset (optional)</label>
                <input
                  id="preset"
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  placeholder="e.g. morning, breathwork"
                  disabled={isRunning || finishedAt}
                />
              </div>
            </div>

            <div className="timer-shell">
              <TimerDisplay remainingSeconds={remainingSeconds} overtimeSeconds={overtimeSeconds} />
              <p className="timer-status">{statusMessage}</p>
              <div className="timer-actions">
                {!isRunning && !finishedAt && (
                  <button
                    type="button"
                    onClick={handleStart}
                    className="meditation-button"
                  >
                    Start meditation
                  </button>
                )}
                {isRunning && (
                  <>
                    <button
                      type="button"
                      onClick={handleCompleteEarly}
                      className="meditation-button"
                    >
                      Finish now
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="meditation-button secondary"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {finishedAt && startedAt && (
              <div className="save-panel">
                <div className="save-row">
                  <div>
                    <p className="eyebrow">Ready to save</p>
                    <p className="save-details">
                      Started at {startedAt.toLocaleString()} • Planned {formatSeconds(plannedDurationSeconds)} • Total {formatSeconds(actualDurationSeconds)}
                      {additionalSeconds > 0 ? ` (+${formatSeconds(additionalSeconds)})` : ''} • Activity Meditation
                    </p>
                  </div>
                  <div className="save-actions">
                    <button
                      type="button"
                      onClick={() => handleSaveDuration(Math.min(actualDurationSeconds, plannedDurationSeconds))}
                      className="meditation-button"
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Add Meditation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveDuration(actualDurationSeconds)}
                      className="meditation-button"
                      disabled={saving || additionalSeconds <= 0}
                    >
                      {saving ? 'Saving…' : 'Add with Additional Time'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="meditation-button secondary"
                      disabled={saving}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="error-text">
                {error.message || 'Something went wrong. Try again.'}
              </p>
            )}
            {saveMessage && (
              <p className="success-text">{saveMessage}</p>
            )}
          </>
        )}
      </div>
      {authUser?.auth && (
        <>
          <div className="import-hover-zone" aria-hidden />
          <div className="import-footer">
            <div className="import-footer-inner">
              <div>
                <p className="eyebrow">Import from CSV</p>
                <p className="body small">
                  Upload `InsightTimerLogs.csv` to backfill meditations. We’ll create IDs per day and respect the 1000/day limit.
                </p>
              </div>
              <div className="import-actions">
                <label className="file-button">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    disabled={importing}
                  />
                  {importing ? 'Uploading…' : 'Choose CSV'}
                </label>
                <button
                  type="button"
                  className="line-button"
                  onClick={handleUpdateTotals}
                  disabled={updatingTotals}
                >
                  {updatingTotals ? 'Updating…' : 'Update monthly totals'}
                </button>
                {importMessage && <span className="import-status">{importMessage}</span>}
                {totalsMessage && <span className="import-status">{totalsMessage}</span>}
              </div>
              {importResult && (
                <p className="success-text">
                  Uploaded: {importResult.success}. Failed: {importResult.failures}.
                </p>
              )}
              {importError && (
                <p className="error-text">
                  {importError.message || 'Import failed. Check the file and try again.'}
                </p>
              )}
              {totalsError && (
                <p className="error-text">
                  {totalsError.message || 'Totals update failed. Try again.'}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="stats-wrapper">
        <section className="stats-card">
          <div className="stats-header">
            <p className="eyebrow">All-time cumulative</p>
            {dataLoading && <span className="body small">Loading…</span>}
          </div>
          {dataError && (
            <p className="error-text">{dataError.message || 'Could not load stats.'}</p>
          )}
          {!dataError && !dataLoading && <CumulativeLineChart data={cumulativeData} />}
        </section>

        <section className="stats-card">
          <div className="stats-header">
            <p className="eyebrow">Monthly totals</p>
            {dataLoading && <span className="body small">Loading…</span>}
          </div>
          {dataError && (
            <p className="error-text">{dataError.message || 'Could not load stats.'}</p>
          )}
          {!dataError && !dataLoading && <MonthlyBarGraph data={graphData} />}
        </section>

        <section className="stats-card">
          <div className="stats-header">
            <p className="eyebrow">Last 30 sessions</p>
            {dataLoading && <span className="body small">Loading…</span>}
          </div>
          {dataError && (
            <p className="error-text">{dataError.message || 'Could not load sessions.'}</p>
          )}
          {!dataError && !dataLoading && (
            <div className="session-list">
              {recentSessions.length === 0 && (
                <p className="body small">No sessions yet.</p>
              )}
              {recentSessions.map((session) => (
                <div className="session-row" key={session.id}>
                  <div className="session-main">
                    <strong>{formatMinutesShort(session.durationSeconds)}</strong>
                    <span className="session-meta">
                      {session.preset || '—'} • {session.activity || 'Meditation'}
                    </span>
                  </div>
                  <div className="session-date">{formatDateTime(session.startedAt || session.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MeditationMainPage;
