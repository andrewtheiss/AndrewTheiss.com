import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthUserContext } from '../Session';
import {
  addUsageEntry,
  deleteUsageEntry,
  listUsageEntries,
  updateUsageEntry,
} from '../Firebase/usageService';
import './Usage.css';

const emptyForm = { category: '', value: '', note: '' };

const UsagePage = () => {
  const authUser = useContext(AuthUserContext);
  const [form, setForm] = useState(emptyForm);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const uid = authUser?.user?.uid;

  const loadEntries = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await listUsageEntries({ uid });
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!uid) {
      setError(new Error('Please sign in to track usage.'));
      return;
    }
    try {
      await addUsageEntry({
        uid,
        category: form.category.trim() || 'general',
        value: Number(form.value) || 0,
        note: form.note,
      });
      setForm(emptyForm);
      loadEntries();
    } catch (err) {
      setError(err);
    }
  };

  const handleDelete = async (id) => {
    await deleteUsageEntry(id);
    loadEntries();
  };

  const handleEdit = async (id, note) => {
    await updateUsageEntry(id, { note });
    loadEntries();
  };

  const formattedDate = (ts) => {
    if (!ts) return '';
    if (ts.toDate) return ts.toDate().toLocaleString();
    return new Date(ts).toLocaleString();
  };

  if (!authUser?.auth) {
    return <div>Please sign in to track your usage.</div>;
  }

  return (
    <div className="usage-page">
      <h2>Usage Tracking</h2>
      <form onSubmit={handleSubmit} className="usage-form">
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category (e.g. meditation, coding)"
        />
        <input
          name="value"
          value={form.value}
          onChange={handleChange}
          type="number"
          placeholder="Value (minutes, count, etc.)"
        />
        <input
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Notes"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Log Entry'}
        </button>
      </form>
      {error && <p className="error-text">{error.message}</p>}
      <div className="usage-list">
        {entries.length === 0 ? (
          <div>No usage entries yet.</div>
        ) : (
          entries.map((entry) => (
            <UsageListItem
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
              onEdit={handleEdit}
              formattedDate={formattedDate}
            />
          ))
        )}
      </div>
    </div>
  );
};

const UsageListItem = ({ entry, onDelete, onEdit, formattedDate }) => {
  const [note, setNote] = useState(entry.note || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onEdit(entry.id, note);
    setSaving(false);
  };

  return (
    <div className="usage-list-item">
      <div className="usage-list-row">
        <strong>{entry.category}</strong>
        <span>{formattedDate(entry.occurredAt || entry.createdAt)}</span>
      </div>
      <div className="usage-list-row">
        <span>Value: {entry.value}</span>
      </div>
      <div className="usage-list-row">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Notes"
        />
      </div>
      <div className="usage-list-actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save note'}
        </button>
        <button onClick={() => onDelete(entry.id)} disabled={saving}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default UsagePage;
