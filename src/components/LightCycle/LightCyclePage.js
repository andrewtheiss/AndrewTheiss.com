import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './LightCyclePage.css';

const GRID_SIZE = 20;
const START_POSITION = {
  x: Math.floor(GRID_SIZE / 2),
  y: Math.floor(GRID_SIZE / 2),
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const posKey = (x, y) => `${x}-${y}`;

const LightCyclePage = () => {
  const [player, setPlayer] = useState(START_POSITION);
  const [trail, setTrail] = useState([START_POSITION]);
  const [moveCount, setMoveCount] = useState(0);

  const movePlayer = useCallback((dx, dy) => {
    setPlayer((prev) => {
      const next = {
        x: clamp(prev.x + dx, 0, GRID_SIZE - 1),
        y: clamp(prev.y + dy, 0, GRID_SIZE - 1),
      };

      setTrail((prevTrail) => {
        const last = prevTrail[prevTrail.length - 1];
        if (last && last.x === next.x && last.y === next.y) {
          return prevTrail;
        }
        return [...prevTrail, next];
      });

      setMoveCount((count) => count + 1);
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((event) => {
    const moves = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0],
    };

    const vector = moves[event.key];
    if (!vector) return;
    event.preventDefault();
    movePlayer(vector[0], vector[1]);
  }, [movePlayer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const reset = () => {
    setPlayer(START_POSITION);
    setTrail([START_POSITION]);
    setMoveCount(0);
  };

  const trailSet = useMemo(
    () => new Set(trail.map((point) => posKey(point.x, point.y))),
    [trail],
  );

  return (
    <div className="light-cycle-page">
      <div className="light-cycle-header">
        <p className="eyebrow">Light Cycle</p>
        <h1>Leave a neon trail</h1>
        <p className="body">
          You start as a single dot on the grid. Use the arrow keys or WASD to move —
          a glowing trail will stay behind everywhere you&apos;ve been, just like in Snake.
        </p>
      </div>

      <div
        className="light-cycle-grid"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        role="grid"
        aria-label="Light cycle grid"
      >
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((__, col) => {
            const isHead = player.x === col && player.y === row;
            const isTrail = trailSet.has(posKey(col, row));
            return (
              <div
                key={posKey(col, row)}
                className={`light-cell${isTrail ? ' trail' : ''}${isHead ? ' head' : ''}`}
                role="gridcell"
                aria-label={isHead ? 'Player position' : isTrail ? 'Trail' : 'Empty space'}
              />
            );
          }),
        )}
      </div>

      <div className="light-cycle-controls">
        <div>
          <p className="body"><strong>Controls:</strong> Arrow keys or WASD to move.</p>
          <p className="body small">
            Grid {GRID_SIZE}×{GRID_SIZE} • Steps taken {moveCount} • Trail length {trail.length}
          </p>
        </div>
        <button type="button" className="light-cycle-button" onClick={reset}>
          Reset grid
        </button>
      </div>
    </div>
  );
};

export default LightCyclePage;
