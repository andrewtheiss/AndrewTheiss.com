import React, { useCallback, useEffect, useRef, useState } from 'react';
import transport from './transport';

const PLAYER_RADIUS = 10;
const BULLET_RADIUS = 4;
const BULLET_SPEED = 360;
const FIRE_INTERVAL_MS = 1000;
const OFFSCREEN_GRACE_MS = 1000;

// Checkpoint 1 game:
//   - Big Start button → game phase flips instantly + bg music kicks off
//   - Click & hold → bullet spawns IMMEDIATELY, SFX fires immediately
//   - HUD overlay shows transport state (cycle / beat / cps)
//   - Stop button returns to idle and silences everything via transport.stop
//
// Quantization (snap to next beat / cycle / fraction) comes in checkpoints
// 2 and 3 — `onTrigger` will keep the same shape so this file barely changes.
const ShooterGame = ({ onTrigger, onStart, onStop }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const sizeRef = useRef({ w: 600, h: 600 });

  const phaseRef = useRef('idle'); // idle | playing
  const mouseRef = useRef({ x: 300, y: 300, inside: false });
  const mouseDownRef = useRef(false);
  const fireTimerRef = useRef(0);
  const bulletsRef = useRef([]);

  const [phase, setPhase] = useState('idle');
  const [hud, setHud] = useState({ cycle: 0, beat: 0, cps: transport.cps,
    beatsPerCycle: transport.beatsPerCycle, isRunning: false });

  const triggerRef = useRef(onTrigger);
  useEffect(() => { triggerRef.current = onTrigger; }, [onTrigger]);
  const trigger = useCallback((slot) => {
    if (triggerRef.current) {
      try { triggerRef.current(slot); } catch (e) { console.warn(e); }
    }
  }, []);

  // Subscribe to transport for HUD
  useEffect(() => transport.subscribe((snap) => setHud(snap)), []);

  // Resize canvas to fill its container
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const apply = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(280, Math.floor(rect.width));
      const h = Math.max(280, Math.floor(rect.height));
      sizeRef.current = { w, h };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Main render+physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const fireBullet = () => {
      const { w, h } = sizeRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const m = mouseRef.current;
      const dx = m.x - cx;
      const dy = m.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      bulletsRef.current.push({
        x: cx, y: cy,
        vx: (dx / len) * BULLET_SPEED,
        vy: (dy / len) * BULLET_SPEED,
        offscreenAt: 0,
      });
      trigger('playerShoot');
    };

    const step = (t) => {
      const last = lastFrameRef.current || t;
      const dt = Math.min(0.05, (t - last) / 1000);
      lastFrameRef.current = t;

      const { w, h } = sizeRef.current;
      const cx = w / 2;
      const cy = h / 2;

      if (phaseRef.current === 'playing' && mouseDownRef.current) {
        fireTimerRef.current -= dt * 1000;
        if (fireTimerRef.current <= 0) {
          fireBullet();
          fireTimerRef.current = FIRE_INTERVAL_MS;
        }
      }

      const survivors = [];
      for (const b of bulletsRef.current) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const off = b.x < -20 || b.x > w + 20 || b.y < -20 || b.y > h + 20;
        if (off) {
          if (!b.offscreenAt) b.offscreenAt = t;
          if (t - b.offscreenAt < OFFSCREEN_GRACE_MS) survivors.push(b);
          else trigger('bulletExpire');
        } else {
          b.offscreenAt = 0;
          survivors.push(b);
        }
      }
      bulletsRef.current = survivors;

      // bg
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, w, h);
      // grid
      ctx.strokeStyle = 'rgba(124,240,193,0.06)';
      ctx.lineWidth = 1;
      const grid = 40;
      for (let x = grid; x < w; x += grid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = grid; y < h; y += grid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // bullets
      ctx.fillStyle = '#7cf0c1';
      for (const b of bulletsRef.current) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
      // player
      ctx.fillStyle = phaseRef.current === 'playing' ? '#7cf0c1' : '#5d6792';
      ctx.beginPath();
      ctx.arc(cx, cy, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      if (phaseRef.current === 'playing' && mouseRef.current.inside) {
        const m = mouseRef.current;
        ctx.strokeStyle = 'rgba(124,240,193,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(m.x - 20, m.y); ctx.lineTo(m.x + 20, m.y);
        ctx.moveTo(m.x, m.y - 20); ctx.lineTo(m.x, m.y + 20);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(124,240,193,0.2)';
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  const handleMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.inside = true;
  };
  const handleEnter = () => { mouseRef.current.inside = true; };
  const handleLeave = () => { mouseRef.current.inside = false; mouseDownRef.current = false; };

  const handleDown = (e) => {
    if (e.button !== 0 || phaseRef.current !== 'playing') return;
    mouseDownRef.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    fireTimerRef.current = FIRE_INTERVAL_MS;

    // immediate first shot
    const { w, h } = sizeRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const dx = mouseRef.current.x - cx;
    const dy = mouseRef.current.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    bulletsRef.current.push({
      x: cx, y: cy,
      vx: (dx / len) * BULLET_SPEED,
      vy: (dy / len) * BULLET_SPEED,
      offscreenAt: 0,
    });
    trigger('playerShoot');
  };

  const handleUp = () => { mouseDownRef.current = false; };

  // Start: flip phase IMMEDIATELY, kick off transport+music in background.
  // Anything async sits behind the UI flip so the click feels instant.
  const handleStart = () => {
    if (phaseRef.current === 'playing') return;
    phaseRef.current = 'playing';
    setPhase('playing');
    Promise.resolve().then(() => onStart && onStart());
  };

  const handleStop = () => {
    if (phaseRef.current === 'idle') return;
    phaseRef.current = 'idle';
    setPhase('idle');
    bulletsRef.current = [];
    mouseDownRef.current = false;
    Promise.resolve().then(() => onStop && onStop());
  };

  const cyclePos = (hud.cycle % 1 + 1) % 1;
  const beatInCycle = (hud.beat % hud.beatsPerCycle + hud.beatsPerCycle) % hud.beatsPerCycle;

  return (
    <div className="shooter-wrap" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="shooter-canvas"
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseDown={handleDown}
        onMouseUp={handleUp}
      />
      {phase === 'idle' && (
        <div className="shooter-overlay">
          <button type="button" className="shooter-play-btn" onClick={handleStart}>
            START
          </button>
          <p className="shooter-overlay-hint">
            Click to start the transport. Audio &amp; gameplay begin instantly.
          </p>
        </div>
      )}
      {phase === 'playing' && (
        <>
          <div className="shooter-hud">
            <div className="shooter-hud-row">
              <span className="shooter-hud-label">cycle</span>
              <span className="shooter-hud-val">{hud.cycle.toFixed(2)}</span>
              <span className="shooter-hud-bar">
                <span className="shooter-hud-bar-fill" style={{ width: `${cyclePos * 100}%` }} />
              </span>
            </div>
            <div className="shooter-hud-row">
              <span className="shooter-hud-label">beat</span>
              <span className="shooter-hud-val">
                {Math.floor(beatInCycle) + 1}/{hud.beatsPerCycle}
              </span>
              <span className="shooter-hud-bar">
                <span
                  className="shooter-hud-bar-fill beat"
                  style={{ width: `${(beatInCycle % 1) * 100}%` }}
                />
              </span>
            </div>
            <div className="shooter-hud-row small">
              <span className="shooter-hud-label">cps</span>
              <span className="shooter-hud-val">{hud.cps.toFixed(2)}</span>
              <span className="shooter-hud-state">
                {hud.isRunning ? 'running' : 'stopped'}
              </span>
            </div>
          </div>
          <button type="button" className="shooter-reset-btn" onClick={handleStop}>
            Stop
          </button>
        </>
      )}
    </div>
  );
};

export default ShooterGame;
