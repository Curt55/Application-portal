import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-block">
      <div className="spinner" />
      <span className="spinner-text">{message}</span>
    </div>
  );
};

export default LoadingSpinner;

