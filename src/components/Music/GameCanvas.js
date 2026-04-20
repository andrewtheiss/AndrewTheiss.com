import React, { useEffect, useRef, useState } from 'react';
import { toggle, getIsPlaying } from './strudelEngine';

const DEFAULT_PATTERN = `stack(
  note("c2 [eb2 g2] bb2 [g2 eb2]").s("sawtooth").cutoff(800).lpq(8),
  s("bd*2, ~ cp, hh*8").gain(0.7)
).cpm(110)`;

const WIDTH = 480;
const HEIGHT = 280;

const GameCanvas = ({ pattern = DEFAULT_PATTERN }) => {
  const canvasRef = useRef(null);
  const playingRef = useRef(false);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const [status, setStatus] = useState('Click to play');
  const [error, setError] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = (t) => {
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Title
      ctx.fillStyle = '#9aa4c7';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('Click anywhere to start / stop', 16, 24);

      const cx = WIDTH / 2;
      const cy = HEIGHT / 2 + 10;
      const playing = playingRef.current;

      if (playing) {
        const elapsed = (t - startTimeRef.current) / 1000;
        const pulse = 1 + 0.15 * Math.sin(elapsed * 6);
        const r = 60 * pulse;
        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, r);
        grad.addColorStop(0, '#7cf0c1');
        grad.addColorStop(1, 'rgba(124,240,193,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // stop square
        ctx.fillStyle = '#0b1020';
        ctx.fillRect(cx - 14, cy - 14, 28, 28);
      } else {
        // play triangle
        ctx.fillStyle = '#7cf0c1';
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy - 22);
        ctx.lineTo(cx - 18, cy + 22);
        ctx.lineTo(cx + 22, cy);
        ctx.closePath();
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleClick = async () => {
    setError(null);
    try {
      const nowPlaying = await toggle(pattern);
      playingRef.current = nowPlaying;
      if (nowPlaying) {
        startTimeRef.current = performance.now();
        setStatus('Playing — click to stop');
      } else {
        setStatus('Stopped — click to play');
      }
    } catch (err) {
      console.error(err);
      playingRef.current = getIsPlaying();
      setError(err.message || 'Strudel failed to start');
    }
  };

  return (
    <div className="music-game">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onClick={handleClick}
        style={{
          width: '100%',
          maxWidth: WIDTH,
          height: 'auto',
          borderRadius: 12,
          cursor: 'pointer',
          display: 'block',
        }}
      />
      <p className="music-game-status">{status}</p>
      {error && <p className="music-game-error">{error}</p>}
    </div>
  );
};

export default GameCanvas;
