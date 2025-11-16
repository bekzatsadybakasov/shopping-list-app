import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'DELETE', 
  cancelText = 'CANCEL',
  onConfirm, 
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <div className={`confirm-icon confirm-icon-${type}`}>
            {type === 'danger' ? '⚠️' : 'ℹ️'}
          </div>
          <h2 className="confirm-title">{title}</h2>
        </div>
        
        <div className="confirm-message">
          {message}
        </div>

        <div className="confirm-actions">
          <button 
            className="confirm-button confirm-button-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-button confirm-button-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;



