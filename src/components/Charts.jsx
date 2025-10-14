import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import './Charts.css';

const Charts = ({ history }) => {
  // history: array of { ts, Temperature, Humidity }
  // Smart formatter: if the timestamp is from today show only time (HH:MM:SS),
  // otherwise show date + time.
  const formatTs = (ts) => {
    const n = Number(ts);
    if (!Number.isFinite(n)) return String(ts);
    const d = new Date(n);
    const now = new Date();
    const isSameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    if (isSameDay) return d.toLocaleTimeString();
    // older -> show short date + time
    try {
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch (e) {
      return d.toLocaleString();
    }
  };

  return (
    <div className="charts">
      <div className="chart">
        <h4>Temperature (°C)</h4>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={history} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
            <XAxis dataKey="ts" tick={{ fontSize: 11 }} tickFormatter={formatTs} />
            <YAxis />
            <Tooltip labelFormatter={formatTs} />
            <Legend />
            <Line type="monotone" dataKey="Temperature" stroke="#ff8a65" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart">
        <h4>Humidity (%)</h4>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={history} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
            <XAxis dataKey="ts" tick={{ fontSize: 11 }} tickFormatter={formatTs} />
            <YAxis />
            <Tooltip labelFormatter={formatTs} />
            <Legend />
            <Line type="monotone" dataKey="Humidity" stroke="#4fc3f7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
