import React, { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import CalendarView from './components/CalendarView';
import GroupModal from './components/GroupModal';
import ClientProfileModal from './components/ClientProfileModal';
import AddClientModal from './components/AddClientModal';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthKey(year, monthIndexZeroBased) {
  return `${year}-${String(monthIndexZeroBased + 1).padStart(2, '0')}`;
}

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getUTCFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getUTCMonth());
  const [calendarDays, setCalendarDays] = useState({});
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [groupModal, setGroupModal] = useState(null); // { dateKey, entries }
  const [profileClientId, setProfileClientId] = useState(null);
  const [addClientOpen, setAddClientOpen] = useState(false);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getCalendar(monthKey(year, monthIndex));
      setCalendarDays(data.days || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, monthIndex]);

  const loadClients = useCallback(async () => {
    try {
      const list = await api.getClients();
      setClients(list || []);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
    loadClients();
  }, [loadCalendar, loadClients]);

  const goToPrevMonth = () => {
    if (monthIndex === 0) {
      setYear((y) => y - 1);
      setMonthIndex(11);
    } else {
      setMonthIndex((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (monthIndex === 11) {
      setYear((y) => y + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex((m) => m + 1);
    }
  };

  const handleDayEntriesClick = (dateKey, entries) => {
    if (entries.length === 1) {
      setProfileClientId(entries[0].clientId);
    } else {
      setGroupModal({ dateKey, entries });
    }
  };

  const handleSelectFromGroup = (clientId) => {
    setGroupModal(null);
    setProfileClientId(clientId);
  };

  const handleClientCreated = () => {
    setAddClientOpen(false);
    loadCalendar();
    loadClients();
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <img src="/logo.png" alt="OviUs logo" className="app-logo" />
          <h1>OviUs</h1>
        </div>
        <div className="month-display">
          <span className="month-label">
            {MONTH_NAMES[monthIndex]} {year}
          </span>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p className="loading-text">Loading calendar...</p>
      ) : (
        <main className="calendar-container">
          <CalendarView
            year={year}
            monthIndexZeroBased={monthIndex}
            calendarDays={calendarDays}
            onDayEntriesClick={handleDayEntriesClick}
          />
        </main>
      )}

      {/* Selectable Clients List Below Calendar */}
      <section className="clients-section">
        <div className="clients-section-header">
          <h2>Clients ({clients.length})</h2>
          {clients.length > 4 && (
            <input
              type="text"
              placeholder="Search clients..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="client-search-input"
            />
          )}
        </div>

        <div className="clients-grid">
          {filteredClients.map((c) => (
            <button
              key={c.id}
              type="button"
              className="client-card"
              onClick={() => setProfileClientId(c.id)}
            >
              {c.avatar_url ? (
                <img src={c.avatar_url} alt={c.name} className="client-avatar-thumb" />
              ) : (
                <div
                  className="client-avatar-fallback-thumb"
                  style={{ backgroundColor: c.favorite_color || '#a5387a' }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="client-card-details">
                <span className="client-card-name">{c.name}</span>
                {c.favorite_color && (
                  <span className="client-card-color">
                    <span className="color-swatch-sm" style={{ backgroundColor: c.favorite_color }} />
                    {c.favorite_color}
                  </span>
                )}
              </div>
            </button>
          ))}
          {filteredClients.length === 0 && (
            <p className="no-clients-text">
              {clients.length === 0
                ? "No clients added yet. Tap '+ Add Client' below to create one!"
                : 'No clients match your search.'}
            </p>
          )}
        </div>
      </section>

      {/* Floating Bottom Navigation / Action Bar */}
      <footer className="bottom-bar">
        <button type="button" className="btn-nav" onClick={goToPrevMonth}>
          &laquo; Prev
        </button>
        <button type="button" className="add-client-button" onClick={() => setAddClientOpen(true)}>
          + Add Client
        </button>
        <button type="button" className="btn-nav" onClick={goToNextMonth}>
          Next &raquo;
        </button>
      </footer>

      {groupModal && (
        <GroupModal
          dateKey={groupModal.dateKey}
          entries={groupModal.entries}
          onSelectClient={handleSelectFromGroup}
          onClose={() => setGroupModal(null)}
        />
      )}

      {profileClientId && (
        <ClientProfileModal
          clientId={profileClientId}
          onClose={() => {
            setProfileClientId(null);
            loadCalendar();
            loadClients();
          }}
        />
      )}

      {addClientOpen && (
        <AddClientModal onCreated={handleClientCreated} onClose={() => setAddClientOpen(false)} />
      )}
    </div>
  );
}
