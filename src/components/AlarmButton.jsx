import React from 'react';
import './AlarmButton.css';

const AlarmButton = ({ alarmOn, onClick }) => {
  return (
    <button className={`alarm-button ${alarmOn ? 'on' : 'off'}`} onClick={onClick}>
      {alarmOn ? 'Turn Off Alarm' : 'Turn On Alarm'}
    </button>
  );
};

export default AlarmButton;
