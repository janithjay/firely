import React from 'react';
import './SensorCard.css';

const SensorCard = ({ sensorName, value, unit }) => {
  return (
    <div className="sensor-card">
      <h3>{sensorName}</h3>
      <p>{value !== undefined ? `${value} ${unit}` : 'Loading...'}</p>
    </div>
  );
};

export default SensorCard;
