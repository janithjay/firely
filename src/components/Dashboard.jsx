import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import SensorCard from './SensorCard';
import StatusCard from './StatusCard';
import AlarmButton from './AlarmButton';
import './Dashboard.css';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({});
  const [fireRisk, setFireRisk] = useState(false);
  const [fireRiskProbability, setFireRiskProbability] = useState(0);
  const [alarmOn, setAlarmOn] = useState(false);

  useEffect(() => {
    const sensorDataRef = ref(db, 'sensorData');
    onValue(sensorDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(data.sensors || {});
        setFireRisk(data.fireRisk || false);
        setFireRiskProbability(data.fireRiskProbability || 0);
        setAlarmOn(data.alarmOn || false);
      }
    });
  }, []);

  const handleAlarmClick = () => {
    set(ref(db, 'sensorData/alarmOn'), !alarmOn);
  };

  return (
    <div className="dashboard">
      <h1>IoT Dashboard</h1>
      <div className="main-content">
        <div className="sensor-grid">
          <SensorCard sensorName="Temperature" value={sensorData.Temperature} unit="°C" />
          <SensorCard sensorName="Humidity" value={sensorData.Humidity} unit="%" />
          <SensorCard sensorName="eCO2" value={sensorData.eCO2} unit="ppm" />
          <SensorCard sensorName="Raw H2" value={sensorData['Raw H2']} unit="" />
          <SensorCard sensorName="Raw Ethanol" value={sensorData['Raw Ethanol']} unit="" />
          <SensorCard sensorName="Pressure" value={sensorData.Pressure} unit="hPa" />
        </div>
        <div className="status-section">
          <StatusCard fireRisk={fireRisk} fireRiskProbability={fireRiskProbability} />
          <AlarmButton alarmOn={alarmOn} onClick={handleAlarmClick} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
