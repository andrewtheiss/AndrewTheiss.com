import React, { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeWeddingTodos, saveWeddingTodos } from '../Firebase/weddingService';

// Seeded the first time the shared list is created.
const DEFAULT_TODOS = [
  'Text reminder for room payments',
  'Figure out speeches and text people',
  'Tell Byron to weave whatever speech he wants into the ceremony portion too',
  'Ask Greg to give a speech',
  'Ask bro to make a speech',
];

const makeItem = (text, email) => ({
  id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
  text: text.trim(),
  done: false,
  createdAt: Date.now(),
  createdBy: email || null,
});

const TodoPanel = ({ email }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('loading'); // loading | synced | saving | error
  const [showDone, setShowDone] = useState(true);
  const inputRef = useRef(null);
  const seededRef = useRef(false);

  // Live sync with Firestore.
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = subscribeWeddingTodos(
        (remote) => {
          if (remote === null) {
            // No doc yet: seed it once with the defaults.
            const seed = DEFAULT_TODOS.map((t) => makeItem(t, email));
            setItems(seed);
            if (!seededRef.current) {
              seededRef.current = true;
              saveWeddingTodos(seed, email).catch(() => setStatus('error'));
            }
          } else {
            setItems(remote);
          }
          setStatus('synced');
        },
        () => setStatus('error'),
      );
    } catch (e) {
      setStatus('error');
    }
    return () => unsub();
  }, [email]);

  const persist = useCallback(
    async (next) => {
      setItems(next);
      setStatus('saving');
      try {
        await saveWeddingTodos(next, email);
        setStatus('synced');
      } catch (e) {
        setStatus('error');
      }
    },
    [email],
  );

  const add = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    persist([...items, makeItem(draft, email)]);
    setDraft('');
    inputRef.current?.focus();
  };

  const toggle = (id) =>
    persist(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));

  const remove = (id) => persist(items.filter((it) => it.id !== id));

  const clearDone = () => persist(items.filter((it) => !it.done));

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const openCount = items.filter((it) => !it.done).length;
  const doneCount = items.length - openCount;
  const visible = showDone ? items : items.filter((it) => !it.done);

  return (
    <>
      <button
        type="button"
        className={`wd-todo-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="wd-todo-panel"
        aria-label={open ? 'Hide to-do list' : 'Show to-do list'}
        title={open ? 'Hide to-do list' : 'Show to-do list'}
      >
        <span className="wd-todo-toggle-icon" aria-hidden>☑</span>
        {openCount > 0 && <span className="wd-todo-count">{openCount}</span>}
      </button>

      <aside
        id="wd-todo-panel"
        className={`wd-todo ${open ? 'open' : ''}`}
        aria-hidden={!open}
      >
        <header className="wd-todo-head">
          <div>
            <h3>To-do</h3>
            <span className={`wd-todo-status ${status}`}>
              {status === 'loading' && 'loading…'}
              {status === 'saving' && 'saving…'}
              {status === 'synced' && 'synced'}
              {status === 'error' && 'not saved, check connection'}
            </span>
          </div>
          <button type="button" className="wd-todo-close" onClick={() => setOpen(false)} aria-label="Close">
            ×
          </button>
        </header>

        <form className="wd-todo-add" onSubmit={add}>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a to-do and press Enter"
            aria-label="New to-do"
            tabIndex={open ? 0 : -1}
          />
          <button type="submit" disabled={!draft.trim()} tabIndex={open ? 0 : -1}>
            Add
          </button>
        </form>

        <ul className="wd-todo-list">
          {visible.length === 0 && (
            <li className="wd-todo-empty">
              {items.length === 0 ? 'Nothing here yet.' : 'All done.'}
            </li>
          )}
          {visible.map((it) => (
            <li key={it.id} className={it.done ? 'done' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(it.done)}
                  onChange={() => toggle(it.id)}
                  tabIndex={open ? 0 : -1}
                />
                <span className="wd-todo-text">{it.text}</span>
              </label>
              <button
                type="button"
                className="wd-todo-remove"
                onClick={() => remove(it.id)}
                aria-label={`Remove "${it.text}"`}
                tabIndex={open ? 0 : -1}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <footer className="wd-todo-foot">
          <span>
            {openCount} open · {doneCount} done
          </span>
          <button type="button" onClick={() => setShowDone((v) => !v)} tabIndex={open ? 0 : -1}>
            {showDone ? 'Hide done' : 'Show done'}
          </button>
          {doneCount > 0 && (
            <button type="button" onClick={clearDone} tabIndex={open ? 0 : -1}>
              Clear done
            </button>
          )}
        </footer>
      </aside>
    </>
  );
};

export default TodoPanel;
