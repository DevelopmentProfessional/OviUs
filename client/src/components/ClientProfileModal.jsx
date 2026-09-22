import React, { useEffect, useState } from 'react';
import { api } from '../api';

function toLocalInputValue(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function TagListEditor({ label, values, onChange }) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft('');
  };

  return (
    <div className="tag-editor">
      <label>{label}</label>
      <div className="tag-list">
        {values.map((v, idx) => (
          <span key={`${v}-${idx}`} className="tag-chip">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, i) => i !== idx))}>
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="tag-input-row">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        <button type="button" onClick={addTag}>
          Add
        </button>
      </div>
    </div>
  );
}

export default function ClientProfileModal({ clientId, onClose }) {
  const [client, setClient] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [logs, setLogs] = useState([]);
  const [prediction, setPrediction] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('');
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [traitsAccordionOpen, setTraitsAccordionOpen] = useState(false);

  const [selectedIndicatorId, setSelectedIndicatorId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all'); // 'all', 'ovulation', 'period'
  const [magnitudeLevel, setMagnitudeLevel] = useState('low'); // 'low' (1.0) or 'high' (2.0)
  const [loggedAt, setLoggedAt] = useState(() => toLocalInputValue(new Date()));
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState('');

  // Add new indicator state
  const [showAddIndicator, setShowAddIndicator] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newPhase, setNewPhase] = useState('ovulation');
  const [newWeight, setNewWeight] = useState(5.0);
  const [creatingIndicator, setCreatingIndicator] = useState(false);
  const [indicatorError, setIndicatorError] = useState('');

  const refresh = async () => {
    const [clientData, indicatorData, logData, predictionData] = await Promise.all([
      api.getClient(clientId),
      api.getIndicators(),
      api.getLogs(clientId),
      api.getClientPrediction(clientId),
    ]);
    setClient(clientData);
    setIndicators(indicatorData);
    setLogs(logData);
    setPrediction(predictionData);
    setAvatarUrl(clientData.avatar_url || '');
    setFavoriteColor(clientData.favorite_color || '');
    setLikes(clientData.likes || []);
    setDislikes(clientData.dislikes || []);
    setNotes(clientData.notes || '');
    if (indicatorData.length > 0 && !selectedIndicatorId) {
      setSelectedIndicatorId(String(indicatorData[0].id));
    }
  };

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updateProfile(clientId, {
        favorite_color: favoriteColor,
        likes,
        dislikes,
        notes,
        avatar_url: avatarUrl,
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 260;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarUrl(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateIndicator = async (e) => {
    e?.preventDefault();
    if (!newMetricName.trim()) {
      setIndicatorError('Indicator name is required.');
      return;
    }
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setIndicatorError('Weight must be a positive number.');
      return;
    }
    setCreatingIndicator(true);
    setIndicatorError('');
    try {
      const created = await api.createIndicator({
        metric_name: newMetricName.trim(),
        phase_association: newPhase,
        mathematical_weight: weightNum,
      });
      const updatedList = await api.getIndicators();
      setIndicators(updatedList);
      setSelectedIndicatorId(String(created.id));
      setNewMetricName('');
      setNewWeight(5.0);
      setShowAddIndicator(false);
    } catch (err) {
      setIndicatorError(err.message);
    } finally {
      setCreatingIndicator(false);
    }
  };

  const handleLogIndicator = async () => {
    if (!selectedIndicatorId) return;
    setLogging(true);
    setError('');
    try {
      const magnitudeValue = magnitudeLevel === 'high' ? 2.0 : 1.0;
      await api.createLog(clientId, {
        indicator_id: Number(selectedIndicatorId),
        value_magnitude: magnitudeValue,
        logged_at: new Date(loggedAt).toISOString(),
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLogging(false);
    }
  };

  if (!client) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel modal-panel-fullscreen" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Loading Profile...</h2>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
              &times;
            </button>
          </div>
          <div className="modal-content">
            <p className="loading-text">Loading profile details...</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredIndicators = indicators.filter((i) => {
    const matchesPhase = phaseFilter === 'all' || i.phase_association === phaseFilter;
    const matchesSearch =
      !searchTerm ||
      i.metric_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.phase_association.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPhase && matchesSearch;
  });

  const selectedIndicator = indicators.find((i) => String(i.id) === String(selectedIndicatorId));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel modal-panel-fullscreen" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-profile">
            {avatarUrl ? (
              <img src={avatarUrl} alt={client.name} className="modal-avatar-preview" />
            ) : (
              <div
                className="modal-avatar-fallback"
                style={{ backgroundColor: favoriteColor || '#a5387a' }}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h2>{client.name}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-content">
          {error && <p className="form-error">{error}</p>}

          {prediction && (
            <section className="profile-section">
              <h3>Predicted Outlook</h3>
              <p>
                Adaptive cycle length: <strong>{prediction.cycleLengthDays} days</strong>
              </p>
              <ul className="prediction-list">
                {prediction.upcomingOvulationDates.map((d, idx) => (
                  <li key={idx}>{new Date(d).toISOString().slice(0, 10)}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Personality Traits & Profile in an Accordion */}
          <section className="profile-section accordion-section">
            <button
              type="button"
              className="accordion-toggle"
              onClick={() => setTraitsAccordionOpen(!traitsAccordionOpen)}
              aria-expanded={traitsAccordionOpen}
            >
              <div className="accordion-toggle-left">
                <span className="accordion-arrow">{traitsAccordionOpen ? '▼' : '▶'}</span>
                <span className="accordion-title">Profile & Personality Traits</span>
              </div>
              <span className="accordion-badge">
                {traitsAccordionOpen ? 'Collapse' : 'Expand / Edit'}
              </span>
            </button>

            {traitsAccordionOpen ? (
              <div className="accordion-body">
                {/* Profile Image Section */}
                <div className="form-row image-upload-row">
                  <label>Profile Image</label>
                  <div className="avatar-control-area">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar preview" className="avatar-large-preview" />
                    ) : (
                      <div
                        className="avatar-large-fallback"
                        style={{ backgroundColor: favoriteColor || '#a5387a' }}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="avatar-actions">
                      <label className="btn-file-label">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          type="button"
                          className="btn-remove-avatar"
                          onClick={() => setAvatarUrl('')}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Or paste an image URL..."
                    value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="avatar-url-input"
                  />
                </div>

                <div className="form-row">
                  <label>Favorite Color</label>
                  <input
                    value={favoriteColor}
                    placeholder="e.g. Lavender, Rose, Emerald..."
                    onChange={(e) => setFavoriteColor(e.target.value)}
                  />
                </div>
                <TagListEditor label="Likes" values={likes} onChange={setLikes} />
                <TagListEditor label="Dislikes" values={dislikes} onChange={setDislikes} />
                <div className="form-row">
                  <label>Notes / Personality Traits</label>
                  <textarea
                    rows={3}
                    placeholder="Personality traits, preferences, sensitivity notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="accordion-summary" onClick={() => setTraitsAccordionOpen(true)}>
                {favoriteColor && (
                  <span className="summary-pill">
                    <span className="color-swatch" style={{ backgroundColor: favoriteColor }} />
                    {favoriteColor}
                  </span>
                )}
                {likes.length > 0 && <span className="summary-pill">{likes.length} Likes</span>}
                {dislikes.length > 0 && <span className="summary-pill">{dislikes.length} Dislikes</span>}
                {notes ? (
                  <span className="summary-pill">Notes added</span>
                ) : (
                  <span className="summary-hint">Tap to add color, likes, traits & photo</span>
                )}
              </div>
            )}
          </section>

          {/* Indicator Logging Section */}
          <section className="profile-section">
            <div className="section-header-row">
              <h3>Log an Indicator</h3>
              <button
                type="button"
                className="btn-toggle-create"
                onClick={() => setShowAddIndicator(!showAddIndicator)}
              >
                {showAddIndicator ? '− Cancel Custom Sign' : '+ Add New Custom Sign'}
              </button>
            </div>

            {showAddIndicator && (
              <div className="new-indicator-card">
                <h4>Create New Indicator / Sign</h4>
                {indicatorError && <p className="form-error">{indicatorError}</p>}
                <form onSubmit={handleCreateIndicator} className="new-indicator-form">
                  <div className="form-row">
                    <label>Sign / Symptom Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Salty Food Craving, High Focus, Deep Sleep..."
                      value={newMetricName}
                      onChange={(e) => setNewMetricName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="form-row-grid">
                    <div className="form-row">
                      <label>Indicates Phase</label>
                      <select value={newPhase} onChange={(e) => setNewPhase(e.target.value)}>
                        <option value="ovulation">Ovulation Sign</option>
                        <option value="period">Period / Menstrual Sign</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Weight (Number Indicator 1 - 10)</label>
                      <input
                        type="number"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={creatingIndicator}>
                    {creatingIndicator ? 'Creating...' : 'Save & Select Sign'}
                  </button>
                </form>
              </div>
            )}

            <div className="form-row">
              <label>Search & Select Sign ({indicators.length} signs cached)</label>
              <div className="indicator-search-box">
                <div className="indicator-filter-bar">
                  <button
                    type="button"
                    className={`filter-btn ${phaseFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setPhaseFilter('all')}
                  >
                    All ({indicators.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${phaseFilter === 'ovulation' ? 'active' : ''}`}
                    onClick={() => setPhaseFilter('ovulation')}
                  >
                    Ovulation ({indicators.filter((i) => i.phase_association === 'ovulation').length})
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${phaseFilter === 'period' ? 'active' : ''}`}
                    onClick={() => setPhaseFilter('period')}
                  >
                    Period ({indicators.filter((i) => i.phase_association === 'period').length})
                  </button>
                </div>

                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="indicator-search-input"
                    placeholder="Type to search signs, foods, moods, tests, physical sensations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setSearchTerm('')}
                      title="Clear search"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <div className="indicator-results-container">
                  <div className="indicator-results-header">
                    {filteredIndicators.length} matches (alphabetically ordered) &middot; click to select
                  </div>
                  <ul className="indicator-results-list">
                    {filteredIndicators.slice(0, 100).map((ind) => (
                      <li
                        key={ind.id}
                        className={`indicator-result-item ${
                          String(ind.id) === String(selectedIndicatorId) ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedIndicatorId(String(ind.id))}
                      >
                        <span className="indicator-item-name">{ind.metric_name}</span>
                        <div className="indicator-item-meta">
                          <span className={`log-phase-tag log-phase-${ind.phase_association}`}>
                            {ind.phase_association}
                          </span>
                          <span className="indicator-weight-badge">Weight {ind.mathematical_weight}</span>
                        </div>
                      </li>
                    ))}
                    {filteredIndicators.length === 0 && (
                      <li className="indicator-result-empty">
                        No matching signs found. Click "+ Add New Custom Sign" above to create it!
                      </li>
                    )}
                    {filteredIndicators.length > 100 && (
                      <li className="indicator-results-header">
                        + {filteredIndicators.length - 100} more items. Type more letters to narrow down.
                      </li>
                    )}
                  </ul>
                </div>

                {selectedIndicator && (
                  <div className="indicator-selected-summary">
                    <div>
                      <strong>Selected Sign:</strong> {selectedIndicator.metric_name}
                    </div>
                    <div>
                      <span className={`log-phase-tag log-phase-${selectedIndicator.phase_association}`}>
                        {selectedIndicator.phase_association}
                      </span>
                      <span className="indicator-weight-badge">
                        Weight: {selectedIndicator.mathematical_weight}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Magnitude / Intensity: Low or High Selection */}
            <div className="form-row">
              <label>Magnitude / Intensity</label>
              <div className="magnitude-toggle-group">
                <button
                  type="button"
                  className={`magnitude-btn ${magnitudeLevel === 'low' ? 'active' : ''}`}
                  onClick={() => setMagnitudeLevel('low')}
                >
                  <span className="mag-title">Low</span>
                  <span className="mag-sub">Normal / Mild (1.0x)</span>
                </button>
                <button
                  type="button"
                  className={`magnitude-btn ${magnitudeLevel === 'high' ? 'active' : ''}`}
                  onClick={() => setMagnitudeLevel('high')}
                >
                  <span className="mag-title">High</span>
                  <span className="mag-sub">Strong / Pronounced (2.0x)</span>
                </button>
              </div>
            </div>

            <div className="form-row">
              <label>Observed At</label>
              <input type="datetime-local" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} />
            </div>

            <button type="button" className="btn-primary" onClick={handleLogIndicator} disabled={logging}>
              {logging ? 'Logging...' : '+ Add Indicator Log'}
            </button>
          </section>

          <section className="profile-section">
            <h3>Recent Indicator History</h3>
            <ul className="log-history-list">
              {logs.slice(0, 10).map((log) => (
                <li key={log.id}>
                  <span className={`log-phase-tag log-phase-${log.phase_association}`}>
                    {log.phase_association}
                  </span>{' '}
                  {log.metric_name} &middot; {new Date(log.logged_at).toLocaleString()} &middot;{' '}
                  <strong>{Number(log.value_magnitude) > 1.0 ? 'High' : 'Low'}</strong>
                </li>
              ))}
              {logs.length === 0 && <li>No indicators logged yet.</li>}
            </ul>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
