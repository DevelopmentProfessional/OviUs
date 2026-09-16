import React, { useState } from 'react';
import { api } from '../api';

export default function AddClientModal({ onCreated, onClose }) {
  const [name, setName] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('');
  const [likesText, setLikesText] = useState('');
  const [dislikesText, setDislikesText] = useState('');
  const [notes, setNotes] = useState('');
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
      const likes = likesText.split(',').map((s) => s.trim()).filter(Boolean);
      const dislikes = dislikesText.split(',').map((s) => s.trim()).filter(Boolean);
      const created = await api.createClient({
        name: name.trim(),
        favorite_color: favoriteColor,
        likes,
        dislikes,
        notes,
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
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Client</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="form-row">
            <label>Favorite Color</label>
            <input value={favoriteColor} onChange={(e) => setFavoriteColor(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Likes (comma separated)</label>
            <input value={likesText} onChange={(e) => setLikesText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Dislikes (comma separated)</label>
            <input value={dislikesText} onChange={(e) => setDislikesText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Notes / Personality Traits</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button type="submit" disabled={saving}>
            {saving ? 'Adding...' : 'Add Client'}
          </button>
        </form>
      </div>
    </div>
  );
}
