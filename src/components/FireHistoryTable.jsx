import React from 'react';
import './FireHistoryTable.css';

const fmt = (ts) => {
  const n = Number(ts);
  if (Number.isFinite(n)) {
    const d = new Date(n);
    return { date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
  }
  return { date: String(ts), time: '' };
};

const FireHistoryTable = ({ history, threshold = 0.5 }) => {
  // Keep only entries that indicate a fire (alarm true) or probability >= threshold
  const events = (history || []).filter((h) => {
    const prob = Number(h.fireProbability ?? h.fireRiskProbability ?? 0) || 0;
    const alarm = h.fireAlarm !== undefined ? Boolean(Number(h.fireAlarm)) : (h.fireAlarm === true || h.alarmOn === true);
    return alarm || prob >= threshold;
  }).slice().sort((a,b) => (b.ts || 0) - (a.ts || 0));

  return (
    <div className="fire-history">
      <h4>Previous Fire Events</h4>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Probability</th>
              <th>Alarm</th>
              <th>Temp (°C)</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '0.8rem' }}>No past fire events</td></tr>
            )}
            {events.map((e, i) => {
              const ts = fmt(e.ts ?? e.unixTimestamp ?? e.timestamp);
              const prob = Number(e.fireProbability ?? e.fireRiskProbability ?? 0) * 100;
              const alarm = e.fireAlarm !== undefined ? Boolean(Number(e.fireAlarm)) : (e.alarmOn === true);
              return (
                <tr key={`${e.key ?? e.ts ?? i}`}>
                  <td>{ts.date}</td>
                  <td>{ts.time}</td>
                  <td>{Number.isFinite(prob) ? `${prob.toFixed(2)}%` : '—'}</td>
                  <td>{alarm ? 'Yes' : 'No'}</td>
                  <td>{e.Temperature !== null && e.Temperature !== undefined ? Number(e.Temperature).toFixed(2) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FireHistoryTable;
