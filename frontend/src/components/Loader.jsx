import React from 'react';

export default function Loader({ label = 'Loading...', fullScreen = false, small = false }) {
  return (
    <div className={`loader-wrap ${fullScreen ? 'loader-fullscreen' : ''} ${small ? 'loader-small' : ''}`}>
      <div className="spinner" />
      {label && <p className="loader-label">{label}</p>}
    </div>
  );
}
