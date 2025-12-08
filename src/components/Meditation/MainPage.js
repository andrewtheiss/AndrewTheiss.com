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

const durationOptions = [5, 10, 15, 20, 30, 45, 60];

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

const TimerDisplay = React.memo(({ seconds }) => (
  <div className="timer-display">
    {formatSeconds(seconds)}
  </div>
));
TimerDisplay.displayName = 'TimerDisplay';

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
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [preset, setPreset] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
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

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const playBell = () => {
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
  };

  const finishSession = () => {
    clearTimer();
    setIsRunning(false);
    setRemainingSeconds(0);
    const completedTime = new Date();
    setFinishedAt(completedTime);
    setStatusMessage('Session complete. Save to your log.');
    playBell();
  };

  useEffect(() => {
    if (!isRunning) return undefined;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          finishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      setRemainingSeconds(durationMinutes * 60);
    }
  }, [durationMinutes, isRunning]);

  useEffect(() => () => {
    clearTimer();
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => { });
      audioCtxRef.current = null;
    }
  }, []);

  const handleStart = () => {
    if (!authUser?.auth) {
      setError(new Error('Sign in to start a meditation.'));
      return;
    }
    setError(null);
    setSaveMessage('');
    const now = new Date();
    setStartedAt(now);
    setFinishedAt(null);
    setRemainingSeconds(durationMinutes * 60);
    setStatusMessage('Meditation in progress…');
    setIsRunning(true);
  };

  const handleCancel = () => {
    clearTimer();
    setIsRunning(false);
    setRemainingSeconds(durationMinutes * 60);
    setStartedAt(null);
    setFinishedAt(null);
    setStatusMessage('Meditation cancelled.');
  };

  const handleCompleteEarly = () => {
    if (!startedAt) return;
    finishSession();
  };

  const computedDurationSeconds = useMemo(() => {
    if (startedAt && finishedAt) {
      return Math.max(1, Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000));
    }
    if (startedAt) {
      const elapsed = durationMinutes * 60 - remainingSeconds;
      return Math.max(1, elapsed);
    }
    return durationMinutes * 60;
  }, [durationMinutes, finishedAt, remainingSeconds, startedAt]);

  const handleSave = async () => {
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
        durationSeconds: computedDurationSeconds,
        preset: preset.trim(),
      });
      setSaveMessage('Meditation saved to your log.');
      setStatusMessage('Meditation saved.');
      setStartedAt(null);
      setFinishedAt(null);
      setRemainingSeconds(durationMinutes * 60);
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
              Start a timer, hear a bell when it ends, and save the session to Firestore.
            </p>

            <div className="meditation-controls">
              <div className="meditation-control">
                <label htmlFor="duration">Duration (minutes)</label>
                <select
                  id="duration"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  disabled={isRunning}
                >
                  {durationOptions.map((value) => (
                    <option key={value} value={value}>
                      {value} minutes
                    </option>
                  ))}
                </select>
              </div>

              <div className="meditation-control">
                <label htmlFor="preset">Preset (optional)</label>
                <input
                  id="preset"
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  placeholder="e.g. morning, breathwork"
                  disabled={isRunning}
                />
              </div>
            </div>

            <div className="timer-shell">
              <TimerDisplay seconds={remainingSeconds} />
              <p className="timer-status">{statusMessage}</p>
              <div className="timer-actions">
                {!isRunning && (
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
                      Started at {startedAt.toLocaleString()} • Duration {formatSeconds(computedDurationSeconds)} • Activity Meditation
                    </p>
                  </div>
                  <div className="save-actions">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="meditation-button"
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save to Firestore'}
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
