import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <p>⚠️ {message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;