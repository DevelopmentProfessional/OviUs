import React from 'react';

export default function GroupModal({ dateKey, entries, onSelectClient, onClose }) {
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ovulating on {dateKey}</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <ul className="group-modal-list">
          {sorted.map((entry) => (
            <li key={entry.clientId}>
              <button
                type="button"
                className="group-modal-name"
                onClick={() => onSelectClient(entry.clientId)}
              >
                {entry.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
