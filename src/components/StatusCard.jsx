import React from 'react';
import './StatusCard.css';

const StatusCard = ({ fireRisk, fireRiskProbability, alarmOn }) => {
  const prob = Number(fireRiskProbability) || 0;
  const pct = Number.isFinite(prob) ? (prob * 100).toFixed(2) : '0.00';
  const alarm = typeof alarmOn === 'boolean' ? alarmOn : fireRisk;

  return (
    // card color should reflect the actual fire risk (green when safe,
    // red when risk) while the alarmOn prop controls the Alarm text.
    <div className={`status-card ${fireRisk ? 'risk' : 'safe'}`}>
      <h3>Fire Risk</h3>
      <p className="status-text">{fireRisk ? 'Risk Detected' : 'Safe'}</p>
      <p>Probability: {pct}%</p>
      <div style={{ marginTop: 12 }}>
        {/* Large visual alarm pill (non-interactive) to match provided design */}
        <div className={`alarm-pill ${alarm ? 'on' : 'off'}`} role="status" aria-live="polite">
          {alarm ? 'Alarm On' : 'Alarm Off'}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
