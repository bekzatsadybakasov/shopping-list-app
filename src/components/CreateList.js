import React, { useState } from 'react';
import './CreateList.css';

const CreateList = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a list name');
      return;
    }

    const newList = {
      name: name.trim()
    };

    onSave(newList);
  };

  return (
    <div className="create-list">
      <div className="header">
        <h1 className="page-title">Create New List</h1>
      </div>

      <form className="create-list-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="field-label">List Name:</label>
          <input
            type="text"
            className="field-input"
            placeholder="Enter list name (you can include emoji like 🚗 Car care)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="field-hint">
            You can add emoji directly in the name, for example: "🚗 Car care" or "🌱 Garden care"
          </div>
        </div>
      </form>

      <div className="action-buttons">
        <button className="save-btn" onClick={handleSubmit}>
          CREATE LIST
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          CANCEL
        </button>
      </div>
    </div>
  );
};

export default CreateList;

