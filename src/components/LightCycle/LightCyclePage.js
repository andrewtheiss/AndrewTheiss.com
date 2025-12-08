import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit as fsLimit, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../Firebase/firebaseClient';
import { AuthUserContext } from '../Session';
import './LightCyclePage.css';

const GRID_BASE_COLS = 200; // default columns; rows adapt to aspect ratio
const TICK_MS = 30; // twice as fast as previous 60ms
const COUNTDOWN_START = 3;

const hashString = (value) => {
  // Lightweight DJB2 hash to avoid async crypto usage.
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

const startPositions = (cols, rows) => {
  const centerY = Math.max(0, Math.min(rows - 1, Math.floor(rows / 2)));
  const p1StartX = Math.floor(cols * 0.1);
  const p2StartX = Math.floor(cols * 0.9);
  return {
    p1: { x: p1StartX, y: centerY },
    p2: { x: p2StartX, y: centerY },
  };
};

const initialPlayers = () => {
  const { p1, p2 } = startPositions(GRID_BASE_COLS, GRID_BASE_COLS);
  return {
    p1: {
      id: 'p1',
      name: 'Player 1',
      pos: p1,
      dir: { x: 1, y: 0 },
      trail: [p1],
    },
    p2: {
      id: 'p2',
      name: 'Player 2',
      pos: p2,
      dir: { x: -1, y: 0 },
      trail: [p2],
    },
  };
};

const COLORS = {
  background: '#0b1224',
  gridLine: 'rgba(148, 163, 184, 0.08)',
  p1Trail: '#f87171',
  p2Trail: '#38bdf8',
  p1Head: '#fb7185',
  p2Head: '#38bdf8',
};

const LightCyclePage = () => {
  const [players, setPlayers] = useState(initialPlayers);
  const [gameState, setGameState] = useState('idle'); // idle | countdown | running
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [moveCount, setMoveCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [gridSize, setGridSize] = useState({ cols: GRID_BASE_COLS, rows: GRID_BASE_COLS });
  const [editingName, setEditingName] = useState(null); // 'p1' | 'p2' | null
  const [displayClockMs, setDisplayClockMs] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(0);
  const keyLogRef = useRef([]);
  const moveLogRef = useRef([]);
  const gridRef = useRef({ cols: GRID_BASE_COLS, rows: GRID_BASE_COLS });
  const autoSubmittedRef = useRef(false);

  const reset = useCallback(() => {
    const { cols, rows } = gridRef.current;
    const { p1, p2 } = startPositions(cols, rows);
    setPlayers({
      p1: {
        id: 'p1',
        name: p1Name,
        pos: p1,
        dir: { x: 1, y: 0 },
        trail: [p1],
      },
      p2: {
        id: 'p2',
        name: p2Name,
        pos: p2,
        dir: { x: -1, y: 0 },
        trail: [p2],
      },
    });
    setGameState('idle');
    setCountdown(COUNTDOWN_START);
    setMoveCount(0);
    setWinner(null);
    setElapsedMs(0);
    setSaveStatus('');
    setSaveError('');
    setSaving(false);
    setEditingName(null);
    setDisplayClockMs(0);
    accumulatorRef.current = 0;
    lastTimeRef.current = 0;
    startTimeRef.current = 0;
    endTimeRef.current = 0;
    keyLogRef.current = [];
    moveLogRef.current = [];
    autoSubmittedRef.current = false;
    if (typeof window !== 'undefined') {
      const storedP1 = window.localStorage.getItem('lightcycle_p1_name');
      const storedP2 = window.localStorage.getItem('lightcycle_p2_name');
      if (storedP1) setP1Name(storedP1);
      if (storedP2) setP2Name(storedP2);
    }
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_START);
    setGameState('countdown');
    setDisplayClockMs(0);
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      const target = event.target;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Ignore global controls when the user is typing in a field (e.g., editing name).
      if (isTyping) return;

      const key = event.key;

      if (key === 'Enter') {
        event.preventDefault();
        if (gameState === 'idle') {
          startCountdown();
        } else if (gameState === 'ended') {
          reset();
          startCountdown();
        }
        return;
      }

      const directionByKey = {
        w: { player: 'p1', dir: { x: 0, y: -1 } },
        s: { player: 'p1', dir: { x: 0, y: 1 } },
        a: { player: 'p1', dir: { x: -1, y: 0 } },
        d: { player: 'p1', dir: { x: 1, y: 0 } },
        ArrowUp: { player: 'p2', dir: { x: 0, y: -1 } },
        ArrowDown: { player: 'p2', dir: { x: 0, y: 1 } },
        ArrowLeft: { player: 'p2', dir: { x: -1, y: 0 } },
        ArrowRight: { player: 'p2', dir: { x: 1, y: 0 } },
      };

      const move = directionByKey[key];
      if (!move) return;
      event.preventDefault();

      setPlayers((prev) => {
        const current = { ...prev };
        const player = current[move.player];
        if (!player) return prev;

        const { dir } = player;
        if (dir.x === -move.dir.x && dir.y === -move.dir.y) {
          return prev;
        }

        keyLogRef.current.push({
          t: startTimeRef.current ? performance.now() - startTimeRef.current : 0,
          player: move.player,
          key,
          dir: move.dir,
        });

        current[move.player] = {
          ...player,
          dir: move.dir,
        };
        return current;
      });
    },
    [gameState, startCountdown],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState !== 'countdown') return undefined;
    setCountdown(COUNTDOWN_START);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('running');
          startTimeRef.current = performance.now();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const size = Math.min(container.clientWidth, 1100);
    const ratio = window.innerHeight / Math.max(window.innerWidth, 1);
    const height = Math.max(size * ratio, size * 0.55);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Adjust grid rows to maintain square-ish cells based on aspect ratio
    const cols = GRID_BASE_COLS;
    const rows = Math.max(20, Math.round(cols * (height / size)));
    gridRef.current = { cols, rows };
    setGridSize({ cols, rows });

    // If we're idle (not running), reposition start points to remain centered for the new grid.
    if (gameState === 'idle') {
      const { p1, p2 } = startPositions(cols, rows);
      setPlayers((prev) => ({
        p1: {
          ...prev.p1,
          pos: p1,
          trail: [p1],
          dir: { x: 1, y: 0 },
        },
        p2: {
          ...prev.p2,
          pos: p2,
          trail: [p2],
          dir: { x: -1, y: 0 },
        },
      }));
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    document.body.classList.add('lightcycle-full');
    return () => {
      document.body.classList.remove('lightcycle-full');
    };
  }, []);

  const drawFrame = useCallback(
    (state) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const { cols, rows } = gridRef.current;
      const cellW = width / cols;
      const cellH = height / rows;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, width, height);

      const drawTrail = (player, color) => {
        ctx.fillStyle = color;
        player.trail.forEach((point) => {
          ctx.fillRect(point.x * cellW, point.y * cellH, cellW, cellH);
        });
      };

      drawTrail(state.p1, COLORS.p1Trail);
      drawTrail(state.p2, COLORS.p2Trail);

      const drawHead = (player, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(player.pos.x * cellW, player.pos.y * cellH, cellW, cellH);
      };

      drawHead(state.p1, COLORS.p1Head);
      drawHead(state.p2, COLORS.p2Head);
    },
    [],
  );

  const maybeAutoSubmitLeaderboard = useCallback(
    async (winnerKey, winnerLabel, elapsed) => {
      if (!winnerKey || winnerKey === 'draw') return;
      if (!elapsed || elapsed < 10000) return; // only if >10s
      if (autoSubmittedRef.current) return;
      autoSubmittedRef.current = true;
      try {
        const q = query(
          collection(firestore, 'lightcycleLeaderboard'),
          orderBy('elapsedMs', 'desc'),
          fsLimit(10),
        );
        const snap = await getDocs(q);
        const entries = snap.docs.map((d) => d.data());
        const lowest = entries[entries.length - 1];
        const shouldInsert = entries.length < 10 || (lowest && elapsed > Number(lowest.elapsedMs || 0));
        if (!shouldInsert) {
          return;
        }
        await addDoc(collection(firestore, 'lightcycleLeaderboard'), {
          winner: winnerKey.toUpperCase(),
          winnerName: winnerLabel || winnerKey.toUpperCase(),
          elapsedMs: elapsed,
          moves: moveCount,
          loggedAt: serverTimestamp(),
          startedAt: startTimeRef.current ? new Date(Date.now() - elapsed) : serverTimestamp(),
          submittedAt: serverTimestamp(),
          meta: {
            gridCols: gridSize.cols,
            gridRows: gridSize.rows,
            tickMs: TICK_MS,
            autoSubmitted: true,
          },
        });
      } catch (err) {
        // best-effort; ignore errors
      }
    },
    [gridSize.cols, gridSize.rows, moveCount],
  );

  const loadLeaderboard = useCallback(async () => {
    try {
      const q = query(
        collection(firestore, 'lightcycleLeaderboard'),
        orderBy('elapsedMs', 'desc'),
        fsLimit(10),
      );
      const snap = await getDocs(q);
      const entries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).slice(0, 10);
      setLeaderboard(entries);
    } catch (err) {
      // best-effort; ignore
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'running') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      // Ensure loop timekeeping resets when stopping.
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
      return undefined;
    }

    const loop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      let delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      accumulatorRef.current += delta;

      let nextState = null;
      while (accumulatorRef.current >= TICK_MS) {
        accumulatorRef.current -= TICK_MS;
        setPlayers((prev) => {
          const next = { ...prev };
          const { cols, rows } = gridRef.current;
          const occupied = new Set();
          Object.values(prev).forEach((p) => {
            occupied.add(`${p.pos.x}-${p.pos.y}`);
            p.trail.forEach((pt) => occupied.add(`${pt.x}-${pt.y}`));
          });

          const planned = {};
          Object.values(prev).forEach((player) => {
            planned[player.id] = {
              x: player.pos.x + player.dir.x,
              y: player.pos.y + player.dir.y,
            };
          });

          let collision = null;
          const boundaryHit = { p1: false, p2: false };
          const p1Key = `${planned.p1.x}-${planned.p1.y}`;
          const p2Key = `${planned.p2.x}-${planned.p2.y}`;

          const p1Out = planned.p1.x < 0 || planned.p1.x >= cols || planned.p1.y < 0 || planned.p1.y >= rows;
          const p2Out = planned.p2.x < 0 || planned.p2.x >= cols || planned.p2.y < 0 || planned.p2.y >= rows;
          boundaryHit.p1 = p1Out;
          boundaryHit.p2 = p2Out;

          const p1Hits = !p1Out && occupied.has(p1Key);
          const p2Hits = !p2Out && occupied.has(p2Key);
          const headOn = p1Key === p2Key;

          if (headOn || (p1Out && p2Out)) {
            collision = 'draw';
          } else if ((p1Hits || p1Out) && (p2Hits || p2Out)) {
            collision = 'draw';
          } else if (p1Hits || p1Out) {
            collision = 'p2';
          } else if (p2Hits || p2Out) {
            collision = 'p1';
          }

          Object.values(prev).forEach((player) => {
            const nextPos = planned[player.id];
            const updatedTrail = [...player.trail];
            const last = updatedTrail[updatedTrail.length - 1];
            if (!last || last.x !== nextPos.x || last.y !== nextPos.y) {
              updatedTrail.push(nextPos);
            }
            next[player.id] = {
              ...player,
              pos: nextPos,
              trail: updatedTrail.slice(-(cols * rows)),
            };
          });

          moveLogRef.current.push({
            t: startTimeRef.current ? performance.now() - startTimeRef.current : 0,
            p1: planned.p1,
            p2: planned.p2,
          });

          if (collision) {
            setWinner(collision === 'draw' ? 'Draw' : collision.toUpperCase());
            setGameState('ended');
            endTimeRef.current = performance.now();
            const elapsed = startTimeRef.current ? Math.max(0, Math.round(endTimeRef.current - startTimeRef.current)) : 0;
            setElapsedMs(elapsed);
            setDisplayClockMs(elapsed);
            const winnerKey = collision === 'draw' ? null : collision;
            const winnerLabel = winnerKey === 'p1' ? p1Name : winnerKey === 'p2' ? p2Name : '';
            maybeAutoSubmitLeaderboard(winnerKey, winnerLabel, elapsed);
            console.log('LightCycle session log:', {
              winner: collision,
              elapsedMs: elapsed,
              moves: moveLogRef.current,
              keypresses: keyLogRef.current,
              moveCount,
            });
          }

          nextState = next;
          return next;
        });
        setMoveCount((count) => count + 1);
      }

      const snapshot = nextState || players;
      drawFrame(snapshot);
      if (startTimeRef.current) {
        const now = nextState ? performance.now() : timestamp;
        setDisplayClockMs(Math.max(0, Math.round(now - startTimeRef.current)));
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, gameState, players, maybeAutoSubmitLeaderboard, p1Name, p2Name]);

  // Draw when idle/countdown so the canvas always shows the latest state.
  useEffect(() => {
    if (gameState !== 'running') {
      drawFrame(players);
      setDisplayClockMs(gameState === 'ended' ? elapsedMs : 0);
    }
  }, [drawFrame, gameState, players, elapsedMs]);

  useEffect(() => {
    if (gameState === 'ended') {
      loadLeaderboard();
    }
  }, [gameState, loadLeaderboard]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedP1 = window.localStorage.getItem('lightcycle_p1_name');
    const storedP2 = window.localStorage.getItem('lightcycle_p2_name');
    if (storedP1) setP1Name(storedP1);
    if (storedP2) setP2Name(storedP2);
    loadLeaderboard();
  }, [loadLeaderboard]);

  const handleNameChange = (player, value) => {
    const trimmed = value.slice(0, 40);
    if (player === 'p1') {
      setP1Name(trimmed);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('lightcycle_p1_name', trimmed);
      }
    } else {
      setP2Name(trimmed);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('lightcycle_p2_name', trimmed);
      }
    }
  };

  const finishNameEdit = () => setEditingName(null);

  const handleNameKeyDown = (event) => {
    if (event.key === 'Enter') {
      finishNameEdit();
    }
    if (event.key === 'Escape') {
      finishNameEdit();
    }
  };

  const clockLabel = useMemo(() => {
    const ms = displayClockMs;
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [displayClockMs]);

  const overlayContent = useMemo(() => {
    if (gameState === 'idle') return { text: 'Press Enter to Start', showBoard: false, showRestart: false };
    if (gameState === 'countdown') return { text: `Starting in ${countdown}…`, showBoard: false, showRestart: false };
    if (gameState === 'ended') {
      const winnerLabel = winner === 'P1' ? p1Name : winner === 'P2' ? p2Name : winner;
      return {
        text: winner ? `${winnerLabel || winner} wins!` : 'Game over.',
        showBoard: true,
        showRestart: true,
      };
    }
    return null;
  }, [countdown, gameState, p1Name, p2Name, winner]);

  return (
    <div className="light-cycle-page">
      <div className="light-cycle-layout">
        <div className="light-cycle-grid-wrapper" ref={containerRef}>
          <div className="canvas-shell">
            <div className="board-header">
              <div className="board-segment">
                <button
                  type="button"
                  className="name-display p1"
                  onClick={() => setEditingName('p1')}
                >
                  {editingName === 'p1' ? (
                    <input
                      className="name-input inline p1"
                      value={p1Name}
                      onChange={(e) => handleNameChange('p1', e.target.value)}
                      onBlur={finishNameEdit}
                      onKeyDown={handleNameKeyDown}
                      autoFocus
                    />
                  ) : (
                    p1Name
                  )}
                </button>
              </div>
              <div className="board-segment" />
              <div className="board-segment center">{clockLabel}</div>
              <div className="board-segment" />
              <div className="board-segment">
                <button
                  type="button"
                  className="name-display p2"
                  onClick={() => setEditingName('p2')}
                >
                  {editingName === 'p2' ? (
                    <input
                      className="name-input inline p2"
                      value={p2Name}
                      onChange={(e) => handleNameChange('p2', e.target.value)}
                      onBlur={finishNameEdit}
                      onKeyDown={handleNameKeyDown}
                      autoFocus
                    />
                  ) : (
                    p2Name
                  )}
                </button>
              </div>
            </div>
            <div className="canvas-stage">
              <canvas ref={canvasRef} className="light-cycle-canvas" />
              {overlayContent && (
                <div className="light-cycle-overlay" role="status">
                  <div className="overlay-text">
                    <div className="overlay-win-box">
                      <div className="overlay-title">{overlayContent.text}</div>
                      {overlayContent.showRestart && <div className="overlay-restart">Press Enter to restart</div>}
                    </div>
                    {overlayContent.showBoard && (
                      <div className="overlay-leaderboard">
                        <div className="overlay-lb-title">LEADERBOARD</div>
                        <ol>
                          {leaderboard.slice(0, 10).map((entry, index) => (
                            <li key={entry.id || index}>
                              <span className={`lb-name rank-${index}`}>{entry.winnerName || entry.winner || '—'}</span>
                              <span className="lb-time">
                                {Math.round((entry.elapsedMs || 0) / 1000)}s
                                {entry.submittedAt?.toDate && (
                                  <span className="lb-date"> • {entry.submittedAt.toDate().toLocaleDateString()}</span>
                                )}
                              </span>
                            </li>
                          ))}
                          {leaderboard.length === 0 && <li className="lb-empty">No scores yet.</li>}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="light-cycle-controls">
            <div />
            <button type="button" className="light-cycle-button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightCyclePage;
