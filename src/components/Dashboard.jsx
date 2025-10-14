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

    // Subscribe to live updates from Firebase. The project appears to store
    // current readings under `sensors/current` and history under
    // `sensors/history` (or a top-level `history`). We'll attempt to attach
    // listeners to those locations and normalize the incoming lowercase
    // property names to the UI shape.
    const listeners = [];
    try {
      const normalize = (raw) => {
        if (!raw) return {};
        // raw fields: temperature, humidity, eco2, rawH2/rawh2, rawEthanol, pressure, fireProbability, fireAlarm
        const map = {};
        if (raw.temperature !== undefined) map.Temperature = Number(raw.temperature);
        else if (raw.Temperature !== undefined) map.Temperature = Number(raw.Temperature);

        if (raw.humidity !== undefined) map.Humidity = Number(raw.humidity);
        else if (raw.Humidity !== undefined) map.Humidity = Number(raw.Humidity);

        if (raw.eco2 !== undefined) map.eCO2 = Number(raw.eco2);
        else if (raw.eCO2 !== undefined) map.eCO2 = Number(raw.eCO2);

        // raw H2 field might be named rawH2, rawh2, or Raw H2 — normalize to 'Raw H2'
        if (raw.rawH2 !== undefined) map['Raw H2'] = Number(raw.rawH2);
        else if (raw.rawh2 !== undefined) map['Raw H2'] = Number(raw.rawh2);
        else if (raw['Raw H2'] !== undefined) map['Raw H2'] = Number(raw['Raw H2']);

        if (raw.rawEthanol !== undefined) map['Raw Ethanol'] = Number(raw.rawEthanol);
        else if (raw.rawethanol !== undefined) map['Raw Ethanol'] = Number(raw.rawethanol);
        else if (raw['Raw Ethanol'] !== undefined) map['Raw Ethanol'] = Number(raw['Raw Ethanol']);

        if (raw.pressure !== undefined) map.Pressure = Number(raw.pressure);
        else if (raw.Pressure !== undefined) map.Pressure = Number(raw.Pressure);

        // fire indicators
        const fireProb = raw.fireProbability !== undefined ? Number(raw.fireProbability) : raw.fireRiskProbability !== undefined ? Number(raw.fireRiskProbability) : null;
        if (fireProb !== null) map.fireRiskProbability = fireProb;

        const alarm = raw.fireAlarm !== undefined ? raw.fireAlarm : raw.alarmOn !== undefined ? raw.alarmOn : null;
        if (alarm !== null) map.alarmOn = Boolean(Number(alarm));

        // Some data includes a timestamp field
        if (raw.timestamp !== undefined) map.timestamp = raw.timestamp;

        return map;
      };

      // listen for current sensors at sensors/current
      try {
        const currentRef = ref(db, 'sensors/current');
        const unsubCurrent = onValue(currentRef, (snap) => {
          const data = snap.val();
          if (!data) return;
          const normalized = normalize(data);

          // update UI state
          setSensorData((prev) => ({ ...prev, ...normalized }));
          if (normalized.fireRiskProbability !== undefined) setFireRiskProbability(normalized.fireRiskProbability);
          if (normalized.alarmOn !== undefined) setAlarmOn(normalized.alarmOn);

          // update history point
          const point = {
            ts: normalized.timestamp ? String(normalized.timestamp) : new Date().toLocaleTimeString(),
            Temperature: normalized.Temperature ?? null,
            Humidity: normalized.Humidity ?? null,
          };
          setHistory((prev) => {
            const next = [...prev, point].slice(-60);
            try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch (e) {}
            return next;
          });

          // persist last-known state for offline
          try {
            localStorage.setItem('firely_state', JSON.stringify({ sensorData: { ...data, ...normalized }, fireRisk: false, fireRiskProbability: normalized.fireRiskProbability || 0, alarmOn: normalized.alarmOn || false }));
          } catch (e) {}
        });
        listeners.push(unsubCurrent);
      } catch (e) {
        // ignore
      }

      // try history under sensors/history then fallback to /history
      try {
        const histRef1 = ref(db, 'sensors/history');
        const unsubHist1 = onValue(histRef1, (snap) => {
          const raw = snap.val();
          if (!raw) return;
          const items = Object.keys(raw).sort().map((k) => ({ key: k, ...raw[k] }));
          const mapped = items.slice(-60).map((it) => ({ ts: it.timestamp ?? String(it.key), Temperature: it.temperature ?? it.Temperature ?? null, Humidity: it.humidity ?? it.Humidity ?? null }));
          setHistory(mapped);
          try { localStorage.setItem(HISTORY_KEY, JSON.stringify(mapped)); } catch (e) {}
        });
        listeners.push(unsubHist1);
      } catch (e) {}

      try {
        const histRef2 = ref(db, 'history');
        const unsubHist2 = onValue(histRef2, (snap) => {
          const raw = snap.val();
          if (!raw) return;
          const items = Object.keys(raw).sort().map((k) => ({ key: k, ...raw[k] }));
          const mapped = items.slice(-60).map((it) => ({ ts: it.timestamp ?? String(it.key), Temperature: it.temperature ?? it.Temperature ?? null, Humidity: it.humidity ?? it.Humidity ?? null }));
          setHistory(mapped);
          try { localStorage.setItem(HISTORY_KEY, JSON.stringify(mapped)); } catch (e) {}
        });
        listeners.push(unsubHist2);
      } catch (e) {}

      return () => {
        listeners.forEach((u) => { try { if (typeof u === 'function') u(); } catch (e) {} });
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
