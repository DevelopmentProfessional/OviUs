import React, { useState } from 'react';
import { api } from '../api';

export default function AddClientModal({ onCreated, onClose }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await api.createClient({
        name: name.trim(),
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel modal-panel-fullscreen" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Client</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-content">
          {error && <p className="form-error">{error}</p>}

          <form id="add-client-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="client-name">Client Name</label>
              <input
                id="client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name..."
                autoFocus
              />
            </div>
            <p className="modal-hint">
              You can add favorite colors, likes, dislikes, personality traits, and indicator logs later from the client profile.
            </p>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="submit" form="add-client-form" className="btn-primary" disabled={saving}>
            {saving ? 'Adding...' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  );
}
