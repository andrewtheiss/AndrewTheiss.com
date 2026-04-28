import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUserContext } from '../Session';
import {
  ENGINE_SLOTS,
  deleteSound,
  getBindings,
  listGameObjects,
  listSounds,
  saveBindings,
  saveGameObject,
  saveSound,
} from '../Firebase/gameSoundsService';
import {
  clearBgMusic,
  initOnce,
  setBgMusic,
} from './strudelEngine';
import { fireOnce } from './soundPlayer';
import transport from './transport';
import { KIND, logAudio } from './audioLogStore';

export const PRE_START_DEFAULT = `$: note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>")
  .sound("sawtooth")
  .lpf("500 800")
  .delay(0.2)
  .room(1.2)`;

const DEFAULT_SOUNDS = [
  {
    name: 'Pre-start ambient (default)',
    code: PRE_START_DEFAULT,
    mode: 'loop',
    oneShotMs: 600,
    tags: ['ambient', 'preStart'],
  },
  {
    name: 'Shoot tick (default)',
    code: '$: s("hh*1").gain(0.6).speed(1.4)',
    mode: 'oneShot',
    oneShotMs: 250,
    tags: ['shoot'],
  },
  {
    name: 'Bullet expire (default)',
    code: '$: s("cp").gain(0.4).speed(0.8)',
    mode: 'oneShot',
    oneShotMs: 250,
    tags: ['expire'],
  },
];

const DEFAULT_GAME_OBJECTS = [
  { name: 'Default Player', kind: 'player', events: {} },
  { name: 'Default Bullet', kind: 'bullet', events: {} },
  { name: 'Pre-Start Ambient', kind: 'ambient', events: {} },
  { name: 'Background Loop', kind: 'event', events: {} },
];

const blankDraft = () => ({
  id: null,
  name: 'New sound',
  code: '$: s("bd*2, ~ cp").gain(0.7)',
  mode: 'oneShot',
  oneShotMs: 600,
  tags: [],
});

const SoundDevPanel = ({ onBindingsChange }) => {
  const authUser = useContext(AuthUserContext);
  const uid = authUser?.user?.uid;
  const signedIn = Boolean(authUser?.auth);

  const [sounds, setSounds] = useState([]);
  const [gameObjects, setGameObjects] = useState([]);
  const [bindings, setBindings] = useState({});
  const [draft, setDraft] = useState(blankDraft());
  const [loopingKey, setLoopingKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const refresh = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [s, g, b] = await Promise.all([
        listSounds(uid),
        listGameObjects(uid),
        getBindings(uid),
      ]);
      setSounds(s);
      setGameObjects(g);
      setBindings(b.slots || {});
      if (onBindingsChange) onBindingsChange({ sounds: s, gameObjects: g, slots: b.slots || {} });
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [uid, onBindingsChange]);

  // Seed defaults once per user.
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const [existingSounds, existingObjects] = await Promise.all([
          listSounds(uid), listGameObjects(uid),
        ]);
        if (cancelled) return;
        if (existingSounds.length === 0) {
          for (const s of DEFAULT_SOUNDS) {
            await saveSound(uid, s);
          }
        }
        if (existingObjects.length === 0) {
          for (const o of DEFAULT_GAME_OBJECTS) {
            await saveGameObject(uid, o);
          }
        }
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err.message || 'Seed failed');
      }
    })();
    return () => { cancelled = true; };
  }, [uid, refresh]);

  const loadSoundIntoDraft = (s) => {
    setDraft({
      id: s.id,
      name: s.name || '',
      code: s.code || '',
      mode: s.mode || 'oneShot',
      oneShotMs: s.oneShotMs ?? 600,
      tags: s.tags || [],
    });
    setStatus(null);
  };

  const handleNew = () => { setDraft(blankDraft()); setStatus(null); };

  const handleTest = async () => {
    setError(null);
    try {
      await initOnce();
      logAudio(KIND.trigger, `panel test: ${draft.name || 'untitled'}`,
        `${draft.mode} cycle=${transport.currentCycle().toFixed(3)}`);
      if (draft.mode === 'loop') {
        // Loops become the active bg music while previewing.
        if (!transport.isRunning) await transport.start();
        await setBgMusic(draft.code);
        setLoopingKey('preview');
      } else {
        // One-shots fire from cycle 0 every time, locked to the same audio
        // context. They can play with or without the transport running.
        await fireOnce(draft.code, { label: `preview:${draft.name || 'untitled'}` });
      }
    } catch (err) {
      setError(err.message || 'Test failed');
    }
  };

  const handleStopPreview = async () => {
    if (loopingKey) {
      await clearBgMusic();
      setLoopingKey(null);
    }
  };

  const handleStopAll = async () => {
    await transport.stop();
    setLoopingKey(null);
  };

  const handleSave = async () => {
    if (!signedIn) { setError('Sign in to save sounds.'); return; }
    setError(null);
    try {
      const id = await saveSound(uid, draft);
      setDraft((d) => ({ ...d, id }));
      setStatus('Saved.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    }
  };

  const handleSaveAs = async () => {
    if (!signedIn) { setError('Sign in to save sounds.'); return; }
    setError(null);
    try {
      const id = await saveSound(uid, { ...draft, id: null, name: `${draft.name} (copy)` });
      setDraft((d) => ({ ...d, id, name: `${d.name} (copy)` }));
      setStatus('Saved as new.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    }
  };

  const handleDelete = async () => {
    if (!draft.id) return;
    if (!window.confirm('Delete this sound?')) return;
    try {
      await deleteSound(draft.id);
      setDraft(blankDraft());
      setStatus('Deleted.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const updateBinding = async (slotKey, soundId) => {
    if (!signedIn) { setError('Sign in to save bindings.'); return; }
    const next = { ...bindings, [slotKey]: soundId || null };
    if (!soundId) delete next[slotKey];
    setBindings(next);
    try {
      await saveBindings(uid, next);
      if (onBindingsChange) onBindingsChange({ sounds, gameObjects, slots: next });
    } catch (err) {
      setError(err.message || 'Save bindings failed');
    }
  };

  const triggerSlot = async (slotKey) => {
    const soundId = bindings[slotKey];
    if (!soundId) {
      logAudio(KIND.trigger, `panel→${slotKey}`, 'no sound bound');
      setStatus(`No sound bound to ${slotKey}.`); return;
    }
    const sound = sounds.find((s) => s.id === soundId);
    if (!sound) {
      logAudio(KIND.error, `panel→${slotKey}`, 'bound sound missing');
      setStatus('Bound sound missing.'); return;
    }
    logAudio(KIND.trigger, `panel→${slotKey}`,
      `${sound.name} cycle=${transport.currentCycle().toFixed(3)}`);
    try {
      await initOnce();
      if (sound.mode === 'loop' || slotKey === 'bgLoop') {
        if (!transport.isRunning) await transport.start();
        await setBgMusic(sound.code);
      } else {
        await fireOnce(sound.code, { label: `panel:${slotKey}` });
      }
    } catch (err) {
      setError(err.message || 'Trigger failed');
    }
  };

  const stopSlot = async (slotKey) => {
    if (slotKey === 'bgLoop') {
      await clearBgMusic();
    }
  };

  const soundOptions = useMemo(
    () => [{ id: '', name: '— none —' }, ...sounds],
    [sounds],
  );

  if (!signedIn) {
    return (
      <div className="dev-panel">
        <h3>Sound playground</h3>
        <p className="dev-empty">
          Sign in to save sounds and bindings. You can still test patterns in-memory below.
        </p>
        <DraftEditor
          draft={draft}
          setDraft={setDraft}
          onTest={handleTest}
          onStop={handleStopPreview}
          looping={Boolean(loopingKey)}
        />
        {error && <p className="dev-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="dev-panel">
      <div className="dev-header">
        <h3>Sound playground</h3>
        <div className="dev-header-actions">
          <button type="button" className="dev-btn" onClick={handleStopAll}>
            Stop all
          </button>
          <button type="button" className="dev-btn" onClick={refresh} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      <section className="dev-section">
        <div className="dev-section-head">
          <h4>Sounds</h4>
          <button type="button" className="dev-btn primary" onClick={handleNew}>
            New
          </button>
        </div>
        <ul className="dev-list">
          {sounds.map((s) => (
            <li
              key={s.id}
              className={`dev-list-item${draft.id === s.id ? ' active' : ''}`}
              onClick={() => loadSoundIntoDraft(s)}
            >
              <span className="dev-list-name">{s.name}</span>
              <span className="dev-list-mode">{s.mode}</span>
            </li>
          ))}
          {sounds.length === 0 && <li className="dev-empty">No sounds yet.</li>}
        </ul>
      </section>

      <DraftEditor
        draft={draft}
        setDraft={setDraft}
        onTest={handleTest}
        onStop={handleStopPreview}
        looping={Boolean(loopingKey)}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onDelete={handleDelete}
      />

      <section className="dev-section">
        <h4>Engine slot bindings</h4>
        <p className="dev-section-hint">
          The game emits these slots. Pick a sound for each.
        </p>
        <div className="dev-bindings">
          {ENGINE_SLOTS.map((slot) => (
            <div key={slot.key} className="dev-binding-row">
              <label>{slot.label} <span className="dev-mode-tag">{slot.mode}</span></label>
              <select
                value={bindings[slot.key] || ''}
                onChange={(e) => updateBinding(slot.key, e.target.value)}
              >
                {soundOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button type="button" className="dev-btn small" onClick={() => triggerSlot(slot.key)}>
                Trigger
              </button>
              {slot.mode === 'loop' && (
                <button type="button" className="dev-btn small" onClick={() => stopSlot(slot.key)}>
                  Stop
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {status && <p className="dev-status">{status}</p>}
      {error && <p className="dev-error">{error}</p>}
    </div>
  );
};

const DraftEditor = ({
  draft, setDraft, onTest, onStop, looping, onSave, onSaveAs, onDelete,
}) => (
  <section className="dev-section">
    <h4>Editor</h4>
    <div className="dev-row">
      <label>Name</label>
      <input
        type="text"
        value={draft.name}
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
      />
    </div>
    <div className="dev-row">
      <label>Mode</label>
      <select
        value={draft.mode}
        onChange={(e) => setDraft((d) => ({ ...d, mode: e.target.value }))}
      >
        <option value="oneShot">one-shot</option>
        <option value="loop">loop</option>
      </select>
      {draft.mode === 'oneShot' && (
        <>
          <label>ms</label>
          <input
            type="number"
            min="50"
            step="50"
            value={draft.oneShotMs}
            onChange={(e) => setDraft((d) => ({ ...d, oneShotMs: Number(e.target.value) }))}
            style={{ width: 80 }}
          />
        </>
      )}
    </div>
    <textarea
      className="dev-code"
      value={draft.code}
      spellCheck={false}
      onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
    />
    <div className="dev-actions">
      <button type="button" className="dev-btn primary" onClick={onTest}>
        Test
      </button>
      {looping && (
        <button type="button" className="dev-btn" onClick={onStop}>
          Stop preview
        </button>
      )}
      {onSave && (
        <>
          <button type="button" className="dev-btn" onClick={onSave}>
            {draft.id ? 'Save' : 'Save new'}
          </button>
          {draft.id && (
            <button type="button" className="dev-btn" onClick={onSaveAs}>
              Save as new
            </button>
          )}
          {draft.id && (
            <button type="button" className="dev-btn danger" onClick={onDelete}>
              Delete
            </button>
          )}
        </>
      )}
    </div>
  </section>
);

export default SoundDevPanel;
