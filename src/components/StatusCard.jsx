import React from 'react';
import './StatusCard.css';

const StatusCard = ({ fireRisk, fireRiskProbability }) => {
  return (
    <div className={`status-card ${fireRisk ? 'risk' : 'safe'}`}>
      <h3>Fire Risk</h3>
      <p className="status-text">{fireRisk ? 'Risk Detected' : 'Safe'}</p>
      <p>Probability: {(fireRiskProbability * 100).toFixed(2)}%</p>
    </div>
  );
};

export default StatusCard;
