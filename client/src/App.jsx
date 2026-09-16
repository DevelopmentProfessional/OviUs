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

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

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
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>OviUs</h1>
        <div className="month-nav">
          <button type="button" onClick={goToPrevMonth}>
            &laquo; Prev
          </button>
          <span className="month-label">
            {MONTH_NAMES[monthIndex]} {year}
          </span>
          <button type="button" onClick={goToNextMonth}>
            Next &raquo;
          </button>
        </div>
        <button type="button" className="add-client-button" onClick={() => setAddClientOpen(true)}>
          + Add Client
        </button>
      </header>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p className="loading-text">Loading calendar...</p>
      ) : (
        <CalendarView
          year={year}
          monthIndexZeroBased={monthIndex}
          calendarDays={calendarDays}
          onDayEntriesClick={handleDayEntriesClick}
        />
      )}

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
          }}
        />
      )}

      {addClientOpen && (
        <AddClientModal onCreated={handleClientCreated} onClose={() => setAddClientOpen(false)} />
      )}
    </div>
  );
}
