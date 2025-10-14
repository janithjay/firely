import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import SensorCard from './SensorCard';
import StatusCard from './StatusCard';
import AlarmButton from './AlarmButton';
import './Dashboard.css';
import Charts from './Charts';

const HISTORY_KEY = 'firely_history_v1';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({});
  const [fireRisk, setFireRisk] = useState(false);
  const [fireRiskProbability, setFireRiskProbability] = useState(0);
  const [alarmOn, setAlarmOn] = useState(false);
  const [history, setHistory] = useState([]);

  // Try to restore last-known state from localStorage so the UI keeps
  // previously shown data when Firebase is unavailable or before the first
  // live update arrives.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('firely_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSensorData(parsed.sensorData || {});
        setFireRisk(parsed.fireRisk || false);
        setFireRiskProbability(parsed.fireRiskProbability || 0);
        setAlarmOn(parsed.alarmOn || false);
      }
    } catch (e) {
      // ignore parse errors
    }

    try {
      const hRaw = localStorage.getItem(HISTORY_KEY);
      if (hRaw) setHistory(JSON.parse(hRaw));
    } catch (e) {
      // ignore
    }

    // Subscribe to live updates from Firebase. When updates arrive, update
    // local state and persist the snapshot to localStorage.
    try {
      const sensorDataRef = ref(db, 'sensorData');
      const unsubscribe = onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const currentSensors = data.sensors || {};
          const currentFireRisk = data.fireRisk || false;
          const currentFireRiskProbability = data.fireRiskProbability || 0;
          const currentAlarmOn = data.alarmOn || false;

          setSensorData(currentSensors);
          setFireRisk(currentFireRisk);
          setFireRiskProbability(currentFireRiskProbability);
          setAlarmOn(currentAlarmOn);

          // build a simple history point with timestamp and a couple sensors
          const point = {
            ts: new Date().toLocaleTimeString(),
            Temperature: typeof currentSensors.Temperature === 'number' ? currentSensors.Temperature : null,
            Humidity: typeof currentSensors.Humidity === 'number' ? currentSensors.Humidity : null,
          };

          setHistory((prev) => {
            const next = [...prev, point].slice(-30); // keep last 30
            try {
              localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
            } catch (e) {}
            return next;
          });

          try {
            localStorage.setItem(
              'firely_state',
              JSON.stringify({
                sensorData: currentSensors,
                fireRisk: currentFireRisk,
                fireRiskProbability: currentFireRiskProbability,
                alarmOn: currentAlarmOn,
              }),
            );
          } catch (e) {
            // ignore storage errors
          }
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } catch (e) {
      // If firebase isn't configured properly, just keep the restored local
      // state and continue silently.
    }
  }, []);

  const handleAlarmClick = () => {
    // Optimistically update UI and persist the change locally, then attempt
    // to write to Firebase. If Firebase write fails the local state remains
    // — you can add error handling to revert if you want.
    const newAlarm = !alarmOn;
    setAlarmOn(newAlarm);
    try {
      localStorage.setItem(
        'firely_state',
        JSON.stringify({
          sensorData,
          fireRisk,
          fireRiskProbability,
          alarmOn: newAlarm,
        }),
      );
    } catch (e) {
      // ignore storage errors
    }

    try {
      set(ref(db, 'sensorData/alarmOn'), newAlarm);
    } catch (e) {
      // If writing to Firebase fails (for example, missing config), we leave
      // the optimistic local state in place. Consider notifying the user.
    }
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
      <div className="charts-wrapper">
        <Charts history={history} />
      </div>
    </div>
  );
};

export default Dashboard;
