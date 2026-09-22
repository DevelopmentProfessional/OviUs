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

  const [favoriteColor, setFavoriteColor] = useState('');
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [selectedIndicatorId, setSelectedIndicatorId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all'); // 'all', 'ovulation', 'period'
  const [valueMagnitude, setValueMagnitude] = useState(1);
  const [loggedAt, setLoggedAt] = useState(() => toLocalInputValue(new Date()));
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState('');

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
    setFavoriteColor(clientData.favorite_color || '');
    setLikes(clientData.likes || []);
    setDislikes(clientData.dislikes || []);
    setNotes(clientData.notes || '');
    if (indicatorData.length > 0) setSelectedIndicatorId(String(indicatorData[0].id));
  };

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updateProfile(clientId, { favorite_color: favoriteColor, likes, dislikes, notes });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogIndicator = async () => {
    if (!selectedIndicatorId) return;
    setLogging(true);
    setError('');
    try {
      await api.createLog(clientId, {
        indicator_id: Number(selectedIndicatorId),
        value_magnitude: Number(valueMagnitude),
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
          <h2>{client.name}</h2>
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

          <section className="profile-section">
            <h3>Profile & Personality Traits</h3>
            <div className="form-row">
              <label>Favorite Color</label>
              <input value={favoriteColor} onChange={(e) => setFavoriteColor(e.target.value)} />
            </div>
            <TagListEditor label="Likes" values={likes} onChange={setLikes} />
            <TagListEditor label="Dislikes" values={dislikes} onChange={setDislikes} />
            <div className="form-row">
              <label>Notes / Personality Traits</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </section>

          <section className="profile-section">
            <h3>Log an Indicator</h3>
            <div className="form-row">
              <label>Search & Select Indicator ({indicators.length} available)</label>
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

                <input
                  type="text"
                  className="indicator-search-input"
                  placeholder="Type to filter symptoms, foods, moods, clothing, tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="indicator-results-container">
                  <div className="indicator-results-header">
                    Showing {filteredIndicators.length} matching indicators (click one to select)
                  </div>
                  <ul className="indicator-results-list">
                    {filteredIndicators.slice(0, 50).map((ind) => (
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
                      <li className="indicator-result-item">No matching indicators found. Try another search term.</li>
                    )}
                    {filteredIndicators.length > 50 && (
                      <li className="indicator-results-header">
                        + {filteredIndicators.length - 50} more items. Refine your search above to narrow down.
                      </li>
                    )}
                  </ul>
                </div>

                {selectedIndicator && (
                  <div className="indicator-selected-summary">
                    <div>
                      <strong>Selected:</strong> {selectedIndicator.metric_name}
                    </div>
                    <div>
                      <span className={`log-phase-tag log-phase-${selectedIndicator.phase_association}`}>
                        {selectedIndicator.phase_association}
                      </span>
                      <span className="indicator-weight-badge">
                        Calculation Weight: {selectedIndicator.mathematical_weight}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <label>Magnitude</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={valueMagnitude}
                onChange={(e) => setValueMagnitude(e.target.value)}
              />
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
                  {log.metric_name} &middot; {new Date(log.logged_at).toLocaleString()} &middot; magnitude{' '}
                  {log.value_magnitude}
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
                    <li className="indicator-result-item">No matching indicators found. Try another search term.</li>
                  )}
                  {filteredIndicators.length > 50 && (
                    <li className="indicator-results-header">
                      + {filteredIndicators.length - 50} more items. Refine your search above to narrow down.
                    </li>
                  )}
                </ul>
              </div>

              {selectedIndicator && (
                <div className="indicator-selected-summary">
                  <div>
                    <strong>Selected:</strong> {selectedIndicator.metric_name}
                  </div>
                  <div>
                    <span className={`log-phase-tag log-phase-${selectedIndicator.phase_association}`}>
                      {selectedIndicator.phase_association}
                    </span>
                    <span className="indicator-weight-badge">
                      Calculation Weight: {selectedIndicator.mathematical_weight}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label>Magnitude</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={valueMagnitude}
              onChange={(e) => setValueMagnitude(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Observed At</label>
            <input type="datetime-local" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} />
          </div>
          <button type="button" onClick={handleLogIndicator} disabled={logging}>
            {logging ? 'Logging...' : 'Log Indicator'}
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
                {log.metric_name} &middot; {new Date(log.logged_at).toLocaleString()} &middot; magnitude{' '}
                {log.value_magnitude}
              </li>
            ))}
            {logs.length === 0 && <li>No indicators logged yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
