import React from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function buildMonthGrid(year, monthIndexZeroBased) {
  const firstOfMonth = new Date(Date.UTC(year, monthIndexZeroBased, 1));
  const startWeekday = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndexZeroBased + 1, 0)).getUTCDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(`${year}-${pad(monthIndexZeroBased + 1)}-${pad(day)}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarView({ year, monthIndexZeroBased, calendarDays, onDayEntriesClick }) {
  const cells = buildMonthGrid(year, monthIndexZeroBased);
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="calendar-grid">
      {WEEKDAYS.map((wd) => (
        <div key={wd} className="calendar-weekday">
          {wd}
        </div>
      ))}
      {cells.map((dateKey, idx) => {
        if (!dateKey) return <div key={idx} className="calendar-cell calendar-cell-empty" />;
        const entries = calendarDays[dateKey] || [];
        const dayNum = Number(dateKey.slice(-2));
        const isToday = dateKey === todayKey;

        return (
          <div key={dateKey} className={`calendar-cell${isToday ? ' calendar-cell-today' : ''}`}>
            <div className="calendar-day-number">{dayNum}</div>
            {entries.length > 0 && (
              <button
                type="button"
                className="milestone-trigger"
                onClick={() => onDayEntriesClick(dateKey, entries)}
                title={entries.map((e) => e.name).join(', ')}
              >
                {entries.length === 1 ? (
                  <span className="ovulation-circle" />
                ) : (
                  <span className="ovulation-group">
                    <span className="ovulation-circle ovulation-circle-back" />
                    <span className="ovulation-circle ovulation-circle-front" />
                    <span className="ovulation-group-count">{entries.length}</span>
                  </span>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
