import React from 'react';
import './SensorCard.css';

const SensorCard = ({ sensorName, value, unit }) => {
  const formatValue = (v) => {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    if (typeof v === 'number') return `${v.toFixed(2)}`;
    const num = Number(v);
    return Number.isNaN(num) ? String(v) : `${num.toFixed(2)}`;
  };

  return (
    <div className="sensor-card">
      <h3>{sensorName}</h3>
      <p>{value !== undefined ? `${formatValue(value)} ${unit}` : 'Loading...'}</p>
    </div>
  );
};

export default SensorCard;
